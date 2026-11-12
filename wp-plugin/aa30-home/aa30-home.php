<?php
/**
 * Plugin Name: Area 30 Site (private preview)
 * Description: Serves the static Area 30 Astro site under a private, unlisted URL prefix and gives its forms a backend: contributions through Gravity Forms and PayPal, the mailing list through Mailchimp for WP, and the 12th Step volunteer list through Gravity Forms. Deactivate the plugin and everything disappears; no existing page is touched.
 * Version: 2.0.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

/*
 * Settings (optional; put overrides in wp-config.php, above the "stop editing" line):
 *   define('AA30_PREFIX', 'a30-preview');     // URL prefix. Must match WP_PREFIX when the site was built.
 *   define('AA30_DRY_RUN', true);             // Test mode: forms validate and answer, but send nothing.
 *   define('AA30_MAILCHIMP_LIST', '');        // Audience ID; defaults to the Mailchimp for WP default form's audience.
 *   define('AA30_FORM_IDS', ['mem' => 1, 'grp' => 2, 'dist' => 3]); // Gravity Forms IDs.
 *   define('AA30_ALLOWED_ORIGINS', ['https://aaemass.org']);        // Extra sites allowed to post forms.
 */

define('AA30_DIR', __DIR__);

require_once AA30_DIR . '/includes/serve.php';
require_once AA30_DIR . '/includes/forms.php';
require_once AA30_DIR . '/includes/rest.php';
require_once AA30_DIR . '/includes/updater.php';
require_once AA30_DIR . '/includes/guard.php';
