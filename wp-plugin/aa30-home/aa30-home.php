<?php
/**
 * Plugin Name: Area 30 Homepage
 * Description: Serves the static Astro homepage in place of the Divi front page. Add ?legacy=1 to the URL to see the old Divi page. Deactivate the plugin to roll back completely.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('template_redirect', function () {
    if (!is_front_page() || isset($_GET['legacy']) || ($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        return;
    }

    $file = __DIR__ . '/dist/index.html';
    if (!is_readable($file)) {
        return;
    }

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    readfile($file);
    exit;
});
