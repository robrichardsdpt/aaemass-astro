<?php
/**
 * The site's form backend: three public endpoints under /wp-json/aa30/v1/.
 *
 *   signup      adds an address to the Mailchimp audience through Mailchimp for WP (its saved connection)
 *   contribute  submits a Gravity Forms contribution form, whose PayPal feed returns the PayPal URL
 *   volunteer   submits the Gravity Forms 12th Step Volunteer form (an entry plus its notification email)
 *
 * No API keys live in the page or in this plugin. Each endpoint checks where the request came from, drops
 * obvious bots quietly, and limits how often one visitor can send. Set AA30_DRY_RUN to try everything out
 * without sending, subscribing or creating entries.
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
}

function aa30_dry_run(): bool
{
    return defined('AA30_DRY_RUN') && AA30_DRY_RUN;
}

function aa30_client_ip(): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function aa30_host_key(string $url): string
{
    $host = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    return strpos($host, 'www.') === 0 ? substr($host, 4) : $host;
}

/** Only requests that come from this site (or a site named in AA30_ALLOWED_ORIGINS) are accepted. */
function aa30_origin_ok(): bool
{
    $source = (string) ($_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));
    if ($source === '') {
        return false;
    }
    $allowed = [aa30_host_key(home_url())];
    if (defined('AA30_ALLOWED_ORIGINS') && is_array(AA30_ALLOWED_ORIGINS)) {
        foreach (AA30_ALLOWED_ORIGINS as $o) {
            $allowed[] = aa30_host_key((string) $o);
        }
    }
    $host = aa30_host_key($source);
    return $host !== '' && in_array($host, array_filter($allowed), true);
}

/** At most $max sends per visitor per hour, per kind of form. */
function aa30_rate_ok(string $bucket, int $max): bool
{
    $key = 'aa30_rl_' . md5($bucket . '|' . aa30_client_ip());
    $n = (int) get_transient($key);
    if ($n >= $max) {
        return false;
    }
    set_transient($key, $n + 1, HOUR_IN_SECONDS);
    return true;
}

function aa30_reply(array $data, int $status = 200): WP_REST_Response
{
    $r = new WP_REST_Response($data, $status);
    $r->header('Cache-Control', 'no-store');
    $r->header('X-Robots-Tag', 'noindex');
    return $r;
}

function aa30_log(string $what): void
{
    error_log('[aa30] ' . $what);
}

function aa30_paypal_url_ok(string $url): bool
{
    $parts = wp_parse_url($url);
    $host = strtolower((string) ($parts['host'] ?? ''));
    return ($parts['scheme'] ?? '') === 'https'
        && ($host === 'paypal.com' || substr($host, -11) === '.paypal.com');
}

function aa30_handle(string $kind, WP_REST_Request $request): WP_REST_Response
{
    $limits = ['signup' => 5, 'contribute' => 10, 'volunteer' => 5]; // posts per visitor per hour; any other kind does not exist
    if (!isset($limits[$kind])) {
        return aa30_reply(['ok' => false, 'error' => 'unknown'], 404);
    }
    try {
        if (!aa30_origin_ok()) {
            return aa30_reply(['ok' => false, 'error' => 'origin'], 403);
        }
        $d = $request->get_json_params();
        if (!is_array($d)) {
            return aa30_reply(['ok' => false, 'error' => 'json'], 400);
        }
        // Bots fill the hidden field and submit instantly. Answer "ok" and do nothing.
        if (!empty($d['_gotcha']) || (int) ($d['_t'] ?? 0) < 1500) {
            return aa30_reply(['ok' => true]);
        }
        if (!aa30_rate_ok($kind, $limits[$kind])) {
            return aa30_reply(['ok' => false, 'error' => 'rate'], 429);
        }
        switch ($kind) {
            case 'signup':
                return aa30_do_signup($d);
            case 'volunteer':
                return aa30_do_volunteer($d);
            default:
                return aa30_do_contribute($d);
        }
    } catch (Throwable $e) {
        aa30_log($kind . ' failed: ' . get_class($e));
        return aa30_reply(['ok' => false, 'error' => 'server'], 500);
    }
}

function aa30_lang($v): string
{
    return in_array($v, ['en', 'es', 'fr'], true) ? $v : 'en';
}

function aa30_do_signup(array $d): WP_REST_Response
{
    $email = aa30_email($d['email'] ?? '');
    if ($email === '') {
        return aa30_reply(['ok' => false, 'errors' => ['email' => 'invalid']], 422);
    }
    if (aa30_dry_run()) {
        return aa30_reply(['ok' => true, 'dry' => true, 'would' => 'subscribe', 'email' => $email]);
    }
    if (!function_exists('mc4wp_get_api_v3') || !function_exists('mc4wp_get_form')) {
        aa30_log('signup: Mailchimp for WP is not active');
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 503);
    }
    try {
        $form = mc4wp_get_form();
    } catch (Throwable $e) {
        aa30_log('signup: no default Mailchimp for WP form');
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 503);
    }
    $list = (defined('AA30_MAILCHIMP_LIST') && AA30_MAILCHIMP_LIST) ? (string) AA30_MAILCHIMP_LIST : '';
    if ($list === '') {
        $lists = $form->get_lists();
        $list = $lists ? (string) reset($lists) : '';
    }
    if ($list === '') {
        aa30_log('signup: the Mailchimp for WP form has no audience selected');
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 503);
    }
    // Same as the WordPress form: ask people to confirm by email unless that was switched off.
    $double = !isset($form->settings['double_optin']) || (string) $form->settings['double_optin'] !== '0';
    try {
        mc4wp_get_api_v3()->add_list_member($list, [
            'email_address' => $email,
            'status' => $double ? 'pending' : 'subscribed',
            'ip_signup' => aa30_client_ip(),
            'language' => aa30_lang($d['lang'] ?? 'en'),
        ]);
    } catch (Throwable $e) {
        $m = $e->getMessage();
        // Already on the list: answer the same as a new signup so the form cannot be used to look people up.
        if (stripos($m, 'member exists') === false && stripos($m, 'already a list member') === false) {
            aa30_log('signup: Mailchimp refused (' . get_class($e) . ')');
            return aa30_reply(['ok' => false, 'error' => 'unavailable'], 502);
        }
    }
    return aa30_reply(['ok' => true]);
}

function aa30_do_contribute(array $d): WP_REST_Response
{
    $type = aa30_one_line($d['type'] ?? '', 4);
    $ids = aa30_form_ids();
    if (!isset($ids[$type])) {
        return aa30_reply(['ok' => false, 'errors' => ['type' => 'invalid']], 422);
    }
    $formId = (int) $ids[$type];

    $gfReady = class_exists('GFAPI');
    $form = $gfReady ? GFAPI::get_form($formId) : null;
    $form = (is_array($form)) ? $form : null;

    // Use the form's own district list when we can read it.
    $choices = null;
    if ($form && $type === 'dist') {
        foreach ($form['fields'] as $f) {
            if ((int) $f->id === 8 && is_array($f->choices)) {
                $choices = array_map(function ($c) {
                    return (string) $c['value'];
                }, $f->choices);
            }
        }
    }

    list($input, $errors) = aa30_gf_input($type, $d, $choices);
    if ($errors) {
        return aa30_reply(['ok' => false, 'errors' => $errors], 422);
    }

    // If someone edits the Gravity Forms form, refuse rather than send a payment form wrong.
    $shapeOk = false;
    if ($form) {
        $have = array_map(function ($f) {
            return (int) $f->id;
        }, $form['fields']);
        $shapeOk = count(array_diff(aa30_gf_expected_ids($type), $have)) === 0;
    }

    if (aa30_dry_run()) {
        return aa30_reply(['ok' => true, 'dry' => true, 'would' => 'submit', 'form' => $formId,
            'gravity_forms' => $gfReady, 'form_found' => (bool) $form, 'fields_match' => $shapeOk, 'input' => $input]);
    }
    if (!$form || !$shapeOk) {
        aa30_log('contribute: Gravity Forms form ' . $formId . ' is missing or its fields changed');
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 503);
    }

    $result = GFAPI::submit_form($formId, $input);
    if (is_wp_error($result)) {
        aa30_log('contribute: submit_form error ' . $result->get_error_code());
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 502);
    }
    if (empty($result['is_valid'])) {
        $names = aa30_gf_error_names($type);
        $bad = [];
        foreach (array_keys((array) ($result['validation_messages'] ?? [])) as $fid) {
            if (isset($names[(int) $fid])) {
                $bad[$names[(int) $fid]] = 'invalid';
            }
        }
        return aa30_reply(['ok' => false, 'errors' => $bad ?: ['member' => 'invalid']], 422);
    }
    // A contribution only counts if the form's PayPal feed sent the visitor on to PayPal.
    $url = (string) ($result['confirmation_redirect'] ?? '');
    if (($result['confirmation_type'] ?? '') === 'redirect' && aa30_paypal_url_ok($url)) {
        return aa30_reply(['ok' => true, 'redirect' => $url]);
    }
    aa30_log('contribute: form ' . $formId . ' saved but gave no PayPal redirect; check its PayPal feed');
    return aa30_reply(['ok' => false, 'error' => 'unavailable'], 502);
}

/**
 * 12th Step Volunteer: the Treatment Facilities Committee's list of members willing to take a 12th Step call.
 * Submits Gravity Forms form 4, which stores the entry and sends its notification email. There is no payment
 * and no redirect, so success is simply ok.
 */
function aa30_do_volunteer(array $d): WP_REST_Response
{
    $formId = aa30_volunteer_form_id();
    $gfReady = class_exists('GFAPI');
    $form = $gfReady ? GFAPI::get_form($formId) : null;
    $form = is_array($form) ? $form : null;

    // Use the form's own availability choices and checkbox ids when we can read them.
    $choices = null;
    $inputIds = null;
    if ($form) {
        foreach ($form['fields'] as $f) {
            if ((int) $f->id === 6) {
                if (is_array($f->choices ?? null)) {
                    $choices = array_map(function ($c) {
                        return (string) ($c['value'] ?? '');
                    }, $f->choices);
                }
                if (is_array($f->inputs ?? null)) {
                    $inputIds = array_map(function ($i) {
                        return (string) ($i['id'] ?? '');
                    }, $f->inputs);
                }
            }
        }
    }

    list($input, $errors) = aa30_gf_volunteer_input($d, $choices, $inputIds);
    if ($errors) {
        return aa30_reply(['ok' => false, 'errors' => $errors], 422);
    }

    // If someone edits the Gravity Forms form, refuse rather than file a volunteer under the wrong field.
    $shapeOk = false;
    if ($form) {
        $have = array_map(function ($f) {
            return (int) $f->id;
        }, $form['fields']);
        $shapeOk = count(array_diff(aa30_volunteer_expected_ids(), $have)) === 0;
    }

    if (aa30_dry_run()) {
        return aa30_reply(['ok' => true, 'dry' => true, 'would' => 'submit', 'form' => $formId,
            'gravity_forms' => $gfReady, 'form_found' => (bool) $form, 'fields_match' => $shapeOk, 'input' => $input]);
    }
    if (!$form || !$shapeOk) {
        aa30_log('volunteer: Gravity Forms form ' . $formId . ' is missing or its fields changed');
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 503);
    }

    $result = GFAPI::submit_form($formId, $input);
    if (is_wp_error($result)) {
        aa30_log('volunteer: submit_form error ' . $result->get_error_code());
        return aa30_reply(['ok' => false, 'error' => 'unavailable'], 502);
    }
    if (empty($result['is_valid'])) {
        $names = aa30_volunteer_error_names();
        $bad = [];
        foreach (array_keys((array) ($result['validation_messages'] ?? [])) as $fid) {
            if (isset($names[(int) $fid])) {
                $bad[$names[(int) $fid]] = 'invalid';
            }
        }
        return aa30_reply(['ok' => false, 'errors' => $bad ?: ['name' => 'invalid']], 422);
    }
    return aa30_reply(['ok' => true]);
}

if (defined('ABSPATH')) {
    add_action('rest_api_init', function () {
        foreach (['signup', 'contribute', 'volunteer'] as $kind) {
            register_rest_route('aa30/v1', '/' . $kind, [
                'methods' => 'POST',
                'permission_callback' => '__return_true', // public by design; aa30_handle() does the checks
                'callback' => function (WP_REST_Request $request) use ($kind) {
                    return aa30_handle($kind, $request);
                },
            ]);
        }
    });
}
