<?php
/**
 * Plugin Name: Area 30 Homepage
 * Description: Serves the static Astro homepage at its own URL (default /new-home/) so it can be reviewed beside the live Divi site. Deactivate the plugin to remove it completely.
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Where the new homepage is served. Change the path, or set AA30_HOME_REPLACE_FRONT to true
// (in wp-config.php) to serve it as the front page instead. ?legacy=1 always shows the old Divi page.
if (!defined('AA30_HOME_PATH')) {
    define('AA30_HOME_PATH', 'new-home');
}
if (!defined('AA30_HOME_REPLACE_FRONT')) {
    define('AA30_HOME_REPLACE_FRONT', false);
}

add_action('template_redirect', function () {
    // Only GET: the mailing-list form POSTs to the site root and must reach WordPress untouched.
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET' || isset($_GET['legacy'])) {
        return;
    }

    $request = trim((string) wp_parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    $base    = trim((string) wp_parse_url(home_url('/'), PHP_URL_PATH), '/');
    $path    = $base !== '' && strpos($request, $base) === 0 ? trim(substr($request, strlen($base)), '/') : $request;

    $on_test_path = $path === trim(AA30_HOME_PATH, '/');
    $on_front     = AA30_HOME_REPLACE_FRONT && is_front_page();
    if (!$on_test_path && !$on_front) {
        return;
    }

    $file = __DIR__ . '/dist/index.html';
    if (!is_readable($file)) {
        return;
    }

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    if ($on_test_path) {
        // A review copy must never compete with the real homepage in search results.
        header('X-Robots-Tag: noindex, nofollow');
        nocache_headers();
    }
    readfile($file);
    exit;
});
