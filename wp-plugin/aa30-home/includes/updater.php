<?php
/**
 * Keeps this plugin up to date from the "plugin-latest" release on GitHub.
 *
 * Each merged change builds a new zip and names the release after its version (2.0.<build>). WordPress sees
 * it as an ordinary plugin update and, because this plugin opts in below, installs it automatically. An
 * hourly check means a release goes live within about an hour of being merged. Nothing here can fail loudly:
 * if GitHub is unreachable or the answer looks wrong, the plugin simply stays on its current version.
 *
 * Settings (optional, in wp-config.php):
 *   define('AA30_UPDATE_REPO', 'robrichardsdpt/aaemass-astro'); // owner/name of the GitHub repository
 *   define('AA30_GITHUB_TOKEN', '...');   // read-only token; only needed if the repository is private
 *   define('AA30_AUTO_UPDATE', false);    // set false to receive updates as a button instead of automatically
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
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
    foreach ((array) ($release['assets'] ?? []) as $asset) {
        if (($asset['name'] ?? '') !== 'aa30-home.zip') {
            continue;
        }
        $package = $token ? ($asset['url'] ?? '') : ($asset['browser_download_url'] ?? '');
        if ($package === '') {
            return null;
        }
        return ['version' => $version, 'package' => $package, 'url' => $release['html_url'] ?? ''];
    }
    return null;
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
        $release = (!is_wp_error($res) && wp_remote_retrieve_response_code($res) === 200) ? json_decode(wp_remote_retrieve_body($res), true) : null;
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

    // Private repositories: the zip is fetched through the API, which needs the token and an octet-stream Accept header.
    add_filter('http_request_args', function ($args, $url) {
        $token = aa30_update_token();
        if ($token && strpos($url, 'https://api.github.com/repos/' . aa30_update_repo() . '/releases/assets/') === 0) {
            $args['headers']['Authorization'] = 'Bearer ' . $token;
            $args['headers']['Accept'] = 'application/octet-stream';
        }
        return $args;
    }, 10, 2);

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
