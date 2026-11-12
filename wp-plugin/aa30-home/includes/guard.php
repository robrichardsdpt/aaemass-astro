<?php
/**
 * Takes the "Deactivate" link off this plugin's row on the Plugins screen.
 *
 * Switching the plugin off takes the whole preview (and its form backend) offline, so it should not be one stray click
 * away. This is a speed bump, not a lock: the bulk action and WP-CLI still work (see docs/WORDPRESS.md), and anyone with
 * server or database access can switch any plugin off.
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
}

/**
 * The action links for this plugin's row, without "Deactivate". Other links are kept as they are, and a short note
 * takes its place so the missing link is not a mystery. An inactive plugin has no "Deactivate" link, so it is left alone.
 *
 * @param mixed $links Action links, keyed by name ("deactivate", "edit", ...).
 * @return mixed
 */
function aa30_without_deactivate_link($links)
{
    if (!is_array($links) || !isset($links['deactivate'])) {
        return $links;
    }
    unset($links['deactivate']);
    $links['aa30_deactivate_note'] = '<span title="To switch this plugin off, tick it and use Bulk actions. See docs/WORDPRESS.md.">Deactivate is hidden on purpose</span>';
    return $links;
}

if (function_exists('add_filter')) {
    add_filter('plugin_action_links_' . plugin_basename(AA30_DIR . '/aa30-home.php'), 'aa30_without_deactivate_link');
}
