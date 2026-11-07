<?php
/**
 * Serves the built Astro site (the "dist" folder) under a private URL prefix.
 *
 * Nothing outside the prefix is touched, so no existing WordPress URL can conflict. Every response is
 * marked noindex so search engines never list it, and every path is checked so a request can never leave
 * the "dist" folder.
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
}

function aa30_prefix(): string
{
    // The build writes its prefix to prefix.txt, so the pages and the plugin always agree.
    // AA30_PREFIX in wp-config.php overrides it.
    $file = AA30_DIR . '/prefix.txt';
    $built = is_readable($file) ? (string) file_get_contents($file) : 'a30-preview';
    $p = trim(defined('AA30_PREFIX') ? (string) AA30_PREFIX : $built, " \t\n\r/");
    $ok = $p !== ''
        && preg_match('#^[A-Za-z0-9._~-]+(/[A-Za-z0-9._~-]+)*$#', $p)
        && !preg_match('#(^|/)\.+(/|$)#', $p);
    return $ok ? $p : 'a30-preview';
}

function aa30_dist_dir(): string
{
    return AA30_DIR . '/dist';
}

/** File types the site may serve. Anything else under the prefix is a 404. */
function aa30_mime_types(): array
{
    return [
        'html' => 'text/html; charset=UTF-8',
        'css' => 'text/css; charset=UTF-8',
        'js' => 'text/javascript; charset=UTF-8',
        'mjs' => 'text/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'txt' => 'text/plain; charset=UTF-8',
        'xml' => 'application/xml; charset=UTF-8',
        'webmanifest' => 'application/manifest+json; charset=UTF-8',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'avif' => 'image/avif',
        'gif' => 'image/gif',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'pdf' => 'application/pdf',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
}

/**
 * Decide what to do with a request path. Pure: no output, no WordPress calls, so it can be tested alone.
 *
 * @return array{action:string, file?:string, type?:string, immutable?:bool, location?:string}
 *   action is 'none' (not ours), 'redirect', 'file' or 'notfound'.
 */
function aa30_resolve(string $request_path, string $base_path, string $prefix, string $dist): array
{
    $root = rtrim($base_path, '/') . '/' . $prefix;

    if ($request_path === $root) {
        return ['action' => 'redirect', 'location' => $root . '/'];
    }
    if (strpos($request_path, $root . '/') !== 0) {
        return ['action' => 'none'];
    }

    $rel = rawurldecode(substr($request_path, strlen($root) + 1));
    if ($rel !== '' && (strpos($rel, "\0") !== false || strpos($rel, '\\') !== false)) {
        return ['action' => 'notfound'];
    }
    $segments = explode('/', $rel);
    $last = array_pop($segments);
    foreach ($segments as $s) {
        if ($s === '' || $s === '.' || $s === '..') {
            return ['action' => 'notfound'];
        }
    }
    if ($last === '.' || $last === '..') {
        return ['action' => 'notfound'];
    }
    // Control characters have no business in a file name.
    if (preg_match('/[\x00-\x1f\x7f]/', $rel)) {
        return ['action' => 'notfound'];
    }

    if ($last === '') {
        $file = ($segments ? implode('/', $segments) . '/' : '') . 'index.html';
    } elseif (strpos($last, '.') === false) {
        $dir = $dist . '/' . implode('/', array_merge($segments, [$last]));
        if (is_dir($dir)) {
            return ['action' => 'redirect', 'location' => $request_path . '/'];
        }
        return ['action' => 'notfound'];
    } else {
        $file = $rel;
    }

    $types = aa30_mime_types();
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (!isset($types[$ext])) {
        return ['action' => 'notfound'];
    }

    $base = realpath($dist);
    $full = realpath($dist . '/' . $file);
    if ($base === false || $full === false || strpos($full, $base . DIRECTORY_SEPARATOR) !== 0 || !is_file($full)) {
        return ['action' => 'notfound'];
    }

    return [
        'action' => 'file',
        'file' => $full,
        'type' => $types[$ext],
        'immutable' => strpos($file, '_astro/') === 0,
    ];
}

function aa30_send_security_headers(): void
{
    header('X-Robots-Tag: noindex, nofollow, noarchive, nosnippet');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    header("Content-Security-Policy: frame-ancestors 'self'; base-uri 'none'; object-src 'none'; form-action 'self'");
}

function aa30_serve(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '');
    $path = (string) parse_url($uri, PHP_URL_PATH);
    $query = (string) parse_url($uri, PHP_URL_QUERY);
    $base = rtrim((string) wp_parse_url(home_url('/'), PHP_URL_PATH), '/');

    $r = aa30_resolve($path, $base, aa30_prefix(), aa30_dist_dir());
    if ($r['action'] === 'none') {
        return;
    }

    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    aa30_send_security_headers();

    if ($method !== 'GET' && $method !== 'HEAD') {
        status_header(405);
        header('Allow: GET, HEAD');
        exit;
    }

    if ($r['action'] === 'redirect') {
        header('Location: ' . $r['location'] . ($query !== '' ? '?' . $query : ''), true, 301);
        exit;
    }

    if ($r['action'] === 'notfound') {
        status_header(404);
        header('Content-Type: text/html; charset=UTF-8');
        header('Cache-Control: no-store');
        echo '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Not found</title><p>Page not found.</p>';
        exit;
    }

    $mtime = (int) filemtime($r['file']);
    $size = (int) filesize($r['file']);
    $etag = '"' . md5($mtime . '-' . $size) . '"';
    header('ETag: ' . $etag);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
    header('Cache-Control: ' . ($r['immutable'] ? 'public, max-age=31536000, immutable' : 'no-cache'));
    if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        status_header(304);
        exit;
    }
    status_header(200);
    header('Content-Type: ' . $r['type']);
    header('Content-Length: ' . $size);
    if ($method === 'GET') {
        readfile($r['file']);
    }
    exit;
}

if (defined('ABSPATH')) {
    add_action('init', 'aa30_serve', 0);
}
