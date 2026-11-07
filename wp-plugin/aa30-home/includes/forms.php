<?php
/**
 * Form logic that does not need WordPress: cleaning input, the recipient allowlist, and turning the
 * site's contribution forms into the exact fields the Gravity Forms contribution forms expect.
 * Kept separate so it can be tested on its own.
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
}

function aa30_mail_domain(): string
{
    return defined('AA30_MAIL_DOMAIN') ? (string) AA30_MAIL_DOMAIN : 'aaemass.org';
}

/**
 * The only mailboxes a message can reach: the part before the @. The web page never holds these
 * decisions, it only names one, and the name must be on this list.
 */
function aa30_recipients(): array
{
    return [
        'info', 'registrar', 'treasurer', 'secretary', 'delegate', 'altdelegate', 'website',
        'archives', 'cpc', 'corrections', 'grapevine', 'literature', 'pi', 'accessibilities',
        'treatment', 'cf', 'messenger', 'serviceseminar', 'massstateconvention',
    ];
}

/** One line of text: no control characters, no line breaks, collapsed spaces, cut to $max characters. */
function aa30_one_line($v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = preg_replace('/[\x00-\x1f\x7f]+/', ' ', $v);
    $v = preg_replace('/\s+/u', ' ', (string) $v);
    $v = trim((string) $v);
    return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

/** Several lines of text: line breaks are kept, other control characters are removed. */
function aa30_multi_line($v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = preg_replace('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', '', $v);
    $v = preg_replace("/\n{3,}/", "\n\n", (string) $v);
    $v = trim((string) $v);
    return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

/** A valid address, or an empty string. */
function aa30_email($v): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = trim($v);
    if ($v === '' || strlen($v) > 254 || preg_match('/[\s<>",;]/', $v)) {
        return '';
    }
    return filter_var($v, FILTER_VALIDATE_EMAIL) ? $v : '';
}

/** "25", "25.5" or "25.50" between 1 and 25,000 becomes "25.00"; anything else becomes "". */
function aa30_amount($v): string
{
    if (!is_string($v) && !is_numeric($v)) {
        return '';
    }
    $v = trim((string) $v);
    if (!preg_match('/^\d{1,5}(\.\d{1,2})?$/', $v)) {
        return '';
    }
    $n = (float) $v;
    return ($n >= 1 && $n <= 25000) ? number_format($n, 2, '.', '') : '';
}

function aa30_states(): array
{
    return [
        'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas', 'CA' => 'California',
        'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware', 'DC' => 'District of Columbia',
        'FL' => 'Florida', 'GA' => 'Georgia', 'HI' => 'Hawaii', 'ID' => 'Idaho', 'IL' => 'Illinois',
        'IN' => 'Indiana', 'IA' => 'Iowa', 'KS' => 'Kansas', 'KY' => 'Kentucky', 'LA' => 'Louisiana',
        'ME' => 'Maine', 'MD' => 'Maryland', 'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota',
        'MS' => 'Mississippi', 'MO' => 'Missouri', 'MT' => 'Montana', 'NE' => 'Nebraska', 'NV' => 'Nevada',
        'NH' => 'New Hampshire', 'NJ' => 'New Jersey', 'NM' => 'New Mexico', 'NY' => 'New York',
        'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio', 'OK' => 'Oklahoma', 'OR' => 'Oregon',
        'PA' => 'Pennsylvania', 'RI' => 'Rhode Island', 'SC' => 'South Carolina', 'SD' => 'South Dakota',
        'TN' => 'Tennessee', 'TX' => 'Texas', 'UT' => 'Utah', 'VT' => 'Vermont', 'VA' => 'Virginia',
        'WA' => 'Washington', 'WV' => 'West Virginia', 'WI' => 'Wisconsin', 'WY' => 'Wyoming',
    ];
}

/** "ma" or "MA" becomes "Massachusetts"; a full name is tidied; anything else is returned as typed. */
function aa30_state_name(string $v): string
{
    $v = aa30_one_line($v, 30);
    $states = aa30_states();
    $up = strtoupper($v);
    if (isset($states[$up])) {
        return $states[$up];
    }
    foreach ($states as $name) {
        if (strcasecmp($name, $v) === 0) {
            return $name;
        }
    }
    return $v;
}

/** "19:30" becomes [7, "30", "pm"]. Returns null if it is not a time. */
function aa30_time_parts($v): ?array
{
    if (!is_string($v) || !preg_match('/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/', trim($v), $m)) {
        return null;
    }
    $h24 = (int) $m[1];
    $h12 = $h24 % 12 === 0 ? 12 : $h24 % 12;
    return [$h12, $m[2], $h24 >= 12 ? 'pm' : 'am'];
}

function aa30_days(): array
{
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
}

/** The district choices on the Gravity Forms District Contribution form. */
function aa30_district_choices(): array
{
    return ['1/2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12/13', '14', '15/16', '17', '18/19',
        '20', '21', '22', '23', '24', '25', '26', '27'];
}

/** "District 15 & 16", "Distrito 15 y 16" and "District 15 et 16" all become the form's "15/16". */
function aa30_district_value($label, array $choices): string
{
    if (!is_string($label) || !preg_match_all('/\d+/', $label, $m) || count($m[0]) > 2) {
        return '';
    }
    $value = implode('/', array_map('intval', $m[0]));
    return in_array($value, $choices, true) ? $value : '';
}

function aa30_form_ids(): array
{
    $ids = ['mem' => 1, 'grp' => 2, 'dist' => 3];
    if (defined('AA30_FORM_IDS') && is_array(AA30_FORM_IDS)) {
        $ids = array_merge($ids, array_map('intval', AA30_FORM_IDS));
    }
    return $ids;
}

/** Gravity Forms field ids each contribution form must still have. If someone edits a form, we refuse to guess. */
function aa30_gf_expected_ids(string $type): array
{
    $common = [1, 5, 6];
    switch ($type) {
        case 'mem':
            return array_merge($common, [3, 4]);
        case 'grp':
            return array_merge($common, [4, 8, 11, 12, 14]);
        case 'dist':
            return array_merge($common, [8, 9]);
    }
    return [];
}

/** Which page field a Gravity Forms field id belongs to, for reporting validation problems back. */
function aa30_gf_error_names(string $type): array
{
    $names = [1 => 'member', 5 => 'email', 6 => 'amount'];
    if ($type === 'mem') {
        $names += [3 => 'first', 4 => 'street'];
    } elseif ($type === 'grp') {
        $names += [4 => 'street', 8 => 'group', 11 => 'number', 12 => 'time', 14 => 'day'];
    } elseif ($type === 'dist') {
        $names += [8 => 'district', 9 => 'subdistrict'];
    }
    return $names;
}

/**
 * Turn what the page sent into Gravity Forms input values.
 *
 * @param string     $type    'mem', 'grp' or 'dist'
 * @param array      $d       the decoded JSON from the page
 * @param array|null $choices district choices (the form's own, when available)
 * @return array [input values, errors keyed by the page's field names]
 */
function aa30_gf_input(string $type, array $d, ?array $choices = null): array
{
    if (!in_array($type, ['mem', 'grp', 'dist'], true)) {
        return [[], ['type' => 'invalid']];
    }
    $choices = $choices ?: aa30_district_choices();
    $in = [];
    $err = [];
    $get = function ($k) use ($d) {
        return isset($d[$k]) && is_string($d[$k]) ? $d[$k] : '';
    };
    $need = function ($k, $max, $pattern = null) use ($get, &$err) {
        $v = aa30_one_line($get($k), $max);
        if ($v === '' || ($pattern !== null && !preg_match($pattern, $v))) {
            $err[$k] = 'invalid';
        }
        return $v;
    };

    if (strtolower(aa30_one_line($get('member'), 5)) !== 'yes') {
        $err['member'] = 'required';
    }
    $in['input_1'] = 'Yes';

    $email = aa30_email($get('email'));
    if ($email === '') {
        $err['email'] = 'invalid';
    }
    $in['input_5'] = $email;

    $amount = aa30_amount($get('amount'));
    if ($amount === '') {
        $err['amount'] = 'invalid';
    }
    $in['input_6'] = $amount;

    $address = function () use ($need, $get, &$in) {
        $in['input_4_1'] = $need('street', 100);
        $in['input_4_3'] = $need('town', 60);
        $in['input_4_4'] = aa30_state_name($get('state') !== '' ? $get('state') : 'MA');
        $in['input_4_5'] = $need('zip', 10, '/^[0-9A-Za-z][0-9A-Za-z -]{1,9}$/');
        $in['input_4_6'] = 'United States';
    };

    if ($type === 'mem') {
        $in['input_3_3'] = $need('first', 50);
        $in['input_3_6'] = $need('last', 50);
        $address();
    } elseif ($type === 'grp') {
        $in['input_8'] = $need('group', 100);
        $in['input_11'] = $need('number', 20, '/^[A-Za-z0-9-]{1,20}$/');
        $address();
        $day = aa30_one_line($get('day'), 12);
        if (!in_array($day, aa30_days(), true)) {
            $err['day'] = 'invalid';
        }
        $in['input_14'] = $day;
        $time = aa30_time_parts($get('time'));
        if ($time === null) {
            $err['time'] = 'invalid';
        } else {
            $in['input_12_1'] = $time[0];
            $in['input_12_2'] = $time[1];
            $in['input_12_3'] = $time[2];
        }
    } else {
        $district = aa30_district_value($get('district'), $choices);
        if ($district === '') {
            $err['district'] = 'invalid';
        }
        $in['input_8'] = $district;
        $in['input_9'] = aa30_one_line($get('subdistrict'), 100);
    }

    return [$in, $err];
}
