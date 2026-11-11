<?php
/**
 * Keeps this plugin up to date from the "plugin-latest" release on GitHub.
 *
 * Each merged change builds a new zip and names the release after its version (2.0.<build>). WordPress sees
 * it as an ordinary plugin update and, because this plugin opts in below, installs it automatically. An
 * hourly check means a release goes live within about an hour of being merged. Nothing here can fail loudly:
 * if GitHub is unreachable or the answer looks wrong, the plugin simply stays on its current version.
 *
 * Security: nothing is installed unless it carries a valid signature. The release has a second file, aa30-home.sig,
 * an Ed25519 signature over the zip and its version made by the build on the main branch (the private key lives only in
 * the GitHub environment "release", which only main may use). The updater downloads both itself and checks the signature
 * against the public key below before WordPress is allowed to install anything, so tampering with the release, or
 * publishing from another branch, installs nothing. A manual upload from wp-admin is not affected.
 *
 * Settings (optional, in wp-config.php):
 *   define('AA30_UPDATE_REPO', 'robrichardsdpt/aaemass-astro'); // owner/name of the GitHub repository
 *   define('AA30_GITHUB_TOKEN', '...');   // read-only token; only needed if the repository is private
 *   define('AA30_AUTO_UPDATE', false);    // set false to receive updates as a button instead of automatically
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
}

// Public half of the signing key (base64, 32 bytes). To rotate: scripts/sign-plugin.mjs keygen, store the private key
// in the GitHub environment "release" as PLUGIN_SIGNING_KEY, and put the new public key here; release that change
// signed with the OLD key (the one installed sites still trust), then every later release uses the new one.
if (!defined('AA30_UPDATE_PUBLIC_KEY')) {
    define('AA30_UPDATE_PUBLIC_KEY', '1USm5n4glfH6unrvX2BV+I+InRTp64SSvKBpXdYg+NI=');
}

/**
 * Turns a GitHub release into WordPress update data, or null when there is nothing newer to install.
 *
 * @param array       $release GitHub "release" JSON (decoded).
 * @param string      $current Installed version.
 * @param string|null $token   GitHub token; when set the asset is fetched through the API (works for private repos).
 */
function aa30_update_from_release($release, $current, $token = null)
{
    if (!is_array($release) || empty($release['name']) || !empty($release['draft'])) {
        return null;
    }
    $version = trim((string) $release['name']);
    if (!preg_match('/^\d+\.\d+\.\d+$/', $version) || version_compare($version, $current, '<=')) {
        return null;
    }
    $urls = [];
    foreach ((array) ($release['assets'] ?? []) as $asset) {
        $name = $asset['name'] ?? '';
        if ($name === 'aa30-home.zip' || $name === 'aa30-home.sig') {
            $urls[$name] = $token ? ($asset['url'] ?? '') : ($asset['browser_download_url'] ?? '');
        }
    }
    // An unsigned release is never offered: it could not be installed anyway.
    if (empty($urls['aa30-home.zip']) || empty($urls['aa30-home.sig'])) {
        return null;
    }
    return ['version' => $version, 'package' => $urls['aa30-home.zip'], 'signature' => $urls['aa30-home.sig'], 'url' => $release['html_url'] ?? ''];
}

/** Does the release carry both the zip and its signature? */
function aa30_release_is_signed($release)
{
    $names = array_column((array) ($release['assets'] ?? []), 'name');
    return in_array('aa30-home.zip', $names, true) && in_array('aa30-home.sig', $names, true);
}

/** Is this download address the plugin package of our own release (as opposed to any other plugin's)? */
function aa30_is_update_package($url, $repo)
{
    return is_string($url) && (
        strpos($url, 'https://github.com/' . $repo . '/releases/download/plugin-latest/') === 0
        || strpos($url, 'https://api.github.com/repos/' . $repo . '/releases/assets/') === 0
    );
}

/**
 * Checks the signature over a downloaded zip. Returns true, or a short reason it was rejected.
 *
 * The signed message is "aa30-home-plugin", the version and the SHA-256 of the file, so a validly signed older zip can not
 * be passed off as a newer version.
 */
function aa30_verify_package($file, $version, $signatureB64, $publicKeyB64)
{
    if (!function_exists('sodium_crypto_sign_verify_detached')) {
        return 'this server cannot verify signatures (PHP sodium is missing)';
    }
    $signature = base64_decode(trim((string) $signatureB64), true);
    $publicKey = base64_decode((string) $publicKeyB64, true);
    if ($signature === false || strlen($signature) !== SODIUM_CRYPTO_SIGN_BYTES) {
        return 'the signature file is not a valid signature';
    }
    if ($publicKey === false || strlen($publicKey) !== SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES) {
        return 'the public key built into the plugin is not valid';
    }
    $hash = is_readable($file) ? hash_file('sha256', $file) : false;
    if ($hash === false) {
        return 'the downloaded file could not be read';
    }
    $message = "aa30-home-plugin\n" . $version . "\n" . $hash . "\n";
    return sodium_crypto_sign_verify_detached($signature, $message, $publicKey) ? true : 'the signature does not match the download';
}

/**
 * One line describing the last update check, shown on the Plugins page.
 *
 * @param array|false $status    Option saved by the last check: time, code, version, error.
 * @param int         $now       Current time.
 * @param string      $installed Installed version.
 */
function aa30_update_status_text($status, $now, $installed)
{
    if (!is_array($status) || empty($status['time'])) {
        return 'Update check: not run yet';
    }
    $minutes = max(0, (int) round(($now - $status['time']) / 60));
    $when = $minutes < 1 ? 'just now' : ($minutes < 90 ? $minutes . ' min ago' : round($minutes / 60) . ' h ago');
    if (!empty($status['error'])) {
        return "Update check $when failed: " . $status['error'];
    }
    $code = (int) ($status['code'] ?? 0);
    if ($code !== 200) {
        return "Update check $when failed: GitHub answered $code" . (in_array($code, [403, 429], true) ? ' (rate limited?)' : '');
    }
    $latest = $status['version'] ?? '';
    if ($latest === '') {
        return "Update check $when: the release has no version number";
    }
    if (version_compare($latest, $installed, '>') && array_key_exists('signed', $status) && !$status['signed']) {
        return "Update check $when: version $latest is not signed, so it will not be installed";
    }
    return version_compare($latest, $installed, '>') ? "Update check $when: version $latest is available" : "Update check $when: up to date ($installed)";
}

if (defined('ABSPATH')) {
    function aa30_update_repo()
    {
        return defined('AA30_UPDATE_REPO') ? AA30_UPDATE_REPO : 'robrichardsdpt/aaemass-astro';
    }

    function aa30_update_token()
    {
        return defined('AA30_GITHUB_TOKEN') && AA30_GITHUB_TOKEN ? AA30_GITHUB_TOKEN : null;
    }

    function aa30_plugin_file()
    {
        return plugin_basename(AA30_DIR . '/aa30-home.php');
    }

    function aa30_installed_version()
    {
        $data = get_file_data(AA30_DIR . '/aa30-home.php', ['Version' => 'Version']);
        return $data['Version'] ?: '0.0.0';
    }

    /** The latest release from GitHub, cached for 15 minutes (5 after a failure) so we stay under rate limits. */
    function aa30_latest_release()
    {
        $cached = get_transient('aa30_latest_release');
        if ($cached !== false) {
            return $cached ?: null;
        }
        $headers = ['Accept' => 'application/vnd.github+json', 'User-Agent' => 'aa30-home-updater'];
        if (aa30_update_token()) {
            $headers['Authorization'] = 'Bearer ' . aa30_update_token();
        }
        $res = wp_remote_get('https://api.github.com/repos/' . aa30_update_repo() . '/releases/tags/plugin-latest', ['headers' => $headers, 'timeout' => 10]);
        $code = is_wp_error($res) ? 0 : (int) wp_remote_retrieve_response_code($res);
        $release = $code === 200 ? json_decode(wp_remote_retrieve_body($res), true) : null;
        // Keep the outcome so the Plugins page can show it (a silent failure is hard to diagnose otherwise).
        update_option('aa30_update_status', [
            'time' => time(),
            'code' => $code,
            'version' => is_array($release) ? (string) ($release['name'] ?? '') : '',
            'signed' => is_array($release) && aa30_release_is_signed($release),
            'error' => is_wp_error($res) ? $res->get_error_message() : null,
        ], false);
        set_transient('aa30_latest_release', $release ?: 0, $release ? 15 * MINUTE_IN_SECONDS : 5 * MINUTE_IN_SECONDS);
        return $release ?: null;
    }

    // Tell WordPress about a newer version.
    add_filter('pre_set_site_transient_update_plugins', function ($transient) {
        if (!is_object($transient)) {
            return $transient;
        }
        $file = aa30_plugin_file();
        $update = aa30_update_from_release(aa30_latest_release(), aa30_installed_version(), aa30_update_token());
        if ($update) {
            $transient->response[$file] = (object) [
                'id' => 'github.com/' . aa30_update_repo(),
                'slug' => 'aa30-home',
                'plugin' => $file,
                'new_version' => $update['version'],
                'url' => $update['url'],
                'package' => $update['package'],
            ];
            unset($transient->no_update[$file]);
        }
        return $transient;
    });

    // Install it automatically (unless AA30_AUTO_UPDATE is false).
    add_filter('auto_update_plugin', function ($update, $item) {
        if (is_object($item) && ($item->plugin ?? '') === aa30_plugin_file()) {
            return !(defined('AA30_AUTO_UPDATE') && AA30_AUTO_UPDATE === false);
        }
        return $update;
    }, 10, 2);

    // Download and verify the package ourselves; WordPress only installs it if the signature is valid.
    add_filter('upgrader_pre_download', function ($reply, $package) {
        if (!aa30_is_update_package($package, aa30_update_repo())) {
            return $reply; // some other plugin or theme
        }
        $block = function ($why) {
            update_option('aa30_update_blocked', ['time' => time(), 'reason' => $why], false);
            return new WP_Error('aa30_update_blocked', 'Update blocked: ' . $why);
        };
        if (!function_exists('download_url')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        delete_transient('aa30_latest_release'); // verify against the release as it is now, not a cached copy
        $update = aa30_update_from_release(aa30_latest_release(), aa30_installed_version(), aa30_update_token());
        if (!$update) {
            return $block('the release is no longer an available, signed update');
        }
        $zip = download_url($update['package']);
        if (is_wp_error($zip)) {
            return $zip;
        }
        $sigFile = download_url($update['signature']);
        if (is_wp_error($sigFile)) {
            @unlink($zip);
            return $block('the signature file could not be downloaded');
        }
        $signature = (string) file_get_contents($sigFile);
        @unlink($sigFile);
        $result = aa30_verify_package($zip, $update['version'], $signature, AA30_UPDATE_PUBLIC_KEY);
        if ($result !== true) {
            @unlink($zip);
            return $block($result);
        }
        delete_option('aa30_update_blocked');
        return $zip;
    }, 10, 2);

    // Private repositories: the zip is fetched through the API, which needs the token and an octet-stream Accept header.
    add_filter('http_request_args', function ($args, $url) {
        $token = aa30_update_token();
        if ($token && strpos($url, 'https://api.github.com/repos/' . aa30_update_repo() . '/releases/assets/') === 0) {
            $args['headers']['Authorization'] = 'Bearer ' . $token;
            $args['headers']['Accept'] = 'application/octet-stream';
        }
        return $args;
    }, 10, 2);

    // Plugins page: when the last check ran and what it found, plus a button to check right now.
    add_filter('plugin_row_meta', function ($meta, $file) {
        if ($file !== aa30_plugin_file()) {
            return $meta;
        }
        $meta[] = esc_html(aa30_update_status_text(get_option('aa30_update_status'), time(), aa30_installed_version()));
        $blocked = get_option('aa30_update_blocked');
        if (is_array($blocked) && !empty($blocked['reason']) && time() - (int) ($blocked['time'] ?? 0) < 7 * DAY_IN_SECONDS) {
            $meta[] = '<strong>' . esc_html('Last install blocked: ' . $blocked['reason']) . '</strong>';
        }
        if (current_user_can('update_plugins')) {
            $meta[] = '<a href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=aa30_check_now'), 'aa30_check_now')) . '">Check for updates now</a>';
        }
        return $meta;
    }, 10, 2);
    add_action('admin_post_aa30_check_now', function () {
        if (!current_user_can('update_plugins')) {
            wp_die('You are not allowed to do that.', '', ['response' => 403]);
        }
        check_admin_referer('aa30_check_now');
        delete_transient('aa30_latest_release');
        delete_site_transient('update_plugins');
        wp_update_plugins();
        wp_safe_redirect(admin_url('update-core.php'));
        exit;
    });

    // WordPress checks for updates only twice a day. Check hourly so a merged change goes live promptly.
    add_action('init', function () {
        if (!wp_next_scheduled('aa30_check_updates')) {
            wp_schedule_event(time() + 300, 'hourly', 'aa30_check_updates');
        }
    });
    add_action('aa30_check_updates', function () {
        delete_transient('aa30_latest_release');
        delete_site_transient('update_plugins');
        wp_update_plugins();
        if (function_exists('wp_maybe_auto_update')) {
            wp_maybe_auto_update();
        }
    });
    register_deactivation_hook(AA30_DIR . '/aa30-home.php', function () {
        wp_clear_scheduled_hook('aa30_check_updates');
    });
}
