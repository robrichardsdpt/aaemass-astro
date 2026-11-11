<?php
/**
 * Tests for the aa30-home plugin. Needs only PHP (7.4 or newer), not WordPress:
 *     php wp-plugin/tests/run.php
 * WordPress, Gravity Forms and Mailchimp for WP are replaced by small stand-ins below.
 */

define('AA30_TESTING', true);
define('AA30_DIR', dirname(__DIR__) . '/aa30-home');
define('HOUR_IN_SECONDS', 3600);

// ---------------------------------------------------------------- stand-ins
class WP_REST_Response
{
    public $data;
    public $status;
    public $headers = [];
    public function __construct($data = null, $status = 200)
    {
        $this->data = $data;
        $this->status = $status;
    }
    public function header($k, $v)
    {
        $this->headers[$k] = $v;
    }
}
class WP_REST_Request
{
    public $json;
    public function __construct($json)
    {
        $this->json = $json;
    }
    public function get_json_params()
    {
        return $this->json;
    }
}
class WP_Error
{
    private $code;
    public function __construct($code = 'x')
    {
        $this->code = $code;
    }
    public function get_error_code()
    {
        return $this->code;
    }
}
function is_wp_error($v)
{
    return $v instanceof WP_Error;
}
function wp_parse_url($u, $c = -1)
{
    return parse_url($u, $c);
}
function home_url($p = '')
{
    return 'https://aaemass.org' . $p;
}
$GLOBALS['transients'] = [];
function get_transient($k)
{
    return $GLOBALS['transients'][$k] ?? false;
}
function set_transient($k, $v, $t)
{
    $GLOBALS['transients'][$k] = $v;
    return true;
}
$GLOBALS['mail'] = [];
$GLOBALS['mail_ok'] = true;
function wp_mail($to, $subject, $body, $headers)
{
    $GLOBALS['mail'][] = compact('to', 'subject', 'body', 'headers');
    return $GLOBALS['mail_ok'];
}
$GLOBALS['logs'] = [];
function error_log_stub($m)
{
    $GLOBALS['logs'][] = $m;
}

// Mailchimp for WP
class FakeForm
{
    public $settings = ['double_optin' => '1'];
    public $lists = ['LIST123'];
    public function get_lists()
    {
        return $this->lists;
    }
}
class FakeApi
{
    public $calls = [];
    public $throw = null;
    public function add_list_member($list, $args)
    {
        $this->calls[] = [$list, $args];
        if ($this->throw) {
            throw new Exception($this->throw);
        }
        return true;
    }
}
$GLOBALS['mc_form'] = new FakeForm();
$GLOBALS['mc_api'] = new FakeApi();
$GLOBALS['mc_enabled'] = false;

// Gravity Forms
$GLOBALS['gf_enabled'] = false;
$GLOBALS['gf_submits'] = [];
$GLOBALS['gf_result'] = null;
$GLOBALS['gf_fields'] = null;
$GLOBALS['gf_avail'] = null; // the volunteer form's availability field: ['choices' => [...], 'inputs' => [...]]
class GFAPI
{
    public static function get_form($id)
    {
        $ids = $GLOBALS['gf_fields'];
        if ($ids === null) {
            return false;
        }
        $fields = [];
        foreach ($ids as $fid) {
            $f = new stdClass();
            $f->id = $fid;
            $f->choices = $fid === 8 ? [['value' => '1/2'], ['value' => '3'], ['value' => '15/16'], ['value' => '27']] : [];
            if ($fid === 6 && $GLOBALS['gf_avail']) {
                $f->choices = array_map(function ($v) {
                    return ['value' => $v];
                }, $GLOBALS['gf_avail']['choices']);
                $f->inputs = array_map(function ($id) {
                    return ['id' => $id];
                }, $GLOBALS['gf_avail']['inputs']);
            }
            $fields[] = $f;
        }
        return ['id' => $id, 'fields' => $fields];
    }
    public static function submit_form($id, $input)
    {
        $GLOBALS['gf_submits'][] = [$id, $input];
        return $GLOBALS['gf_result'];
    }
}

require AA30_DIR . '/includes/serve.php';
require AA30_DIR . '/includes/forms.php';

// rest.php calls error_log(); route it to our capture and hide Mailchimp functions until enabled.
// We load it through a wrapper so function_exists() checks can be switched per test.
$src = file_get_contents(AA30_DIR . '/includes/rest.php');
$src = str_replace('error_log(', 'error_log_stub(', $src);
$src = preg_replace('/^<\?php/', '', $src, 1);
eval($src);

function mc4wp_get_form_real()
{
    return $GLOBALS['mc_form'];
}
function mc4wp_get_api_v3_real()
{
    return $GLOBALS['mc_api'];
}
// Define the Mailchimp functions only for tests that enable them (see mc_on()).
function mc_on()
{
    if (!function_exists('mc4wp_get_form')) {
        eval('function mc4wp_get_form(){return mc4wp_get_form_real();} function mc4wp_get_api_v3(){return mc4wp_get_api_v3_real();}');
    }
}

// ---------------------------------------------------------------- tiny test framework
$pass = 0;
$fail = 0;
function ok($cond, $name)
{
    global $pass, $fail;
    if ($cond) {
        $pass++;
    } else {
        $fail++;
        echo "FAIL: $name\n";
    }
}
function same($a, $b, $name)
{
    ok($a === $b, $name . ' (got ' . var_export($a, true) . ', want ' . var_export($b, true) . ')');
}

// ---------------------------------------------------------------- serving
$tmp = sys_get_temp_dir() . '/aa30-test-' . getmypid();
$dist = $tmp . '/dist';
@mkdir($dist . '/contribute', 0777, true);
@mkdir($dist . '/_astro', 0777, true);
@mkdir($dist . '/es', 0777, true);
file_put_contents($dist . '/index.html', '<h1>home</h1>');
file_put_contents($dist . '/contribute/index.html', '<h1>give</h1>');
file_put_contents($dist . '/es/index.html', '<h1>es</h1>');
file_put_contents($dist . '/_astro/a.css', 'body{}');
file_put_contents($dist . '/.env', 'SECRET=1');
file_put_contents($dist . '/run.php', '<?php echo 1;');
file_put_contents($tmp . '/secret.txt', 'top secret');
$linked = @symlink($tmp . '/secret.txt', $dist . '/leak.txt');
$R = function ($path, $base = '') use ($dist) {
    return aa30_resolve($path, $base, 'a30-preview', $dist);
};

same($R('/a30-preview')['action'], 'redirect', 'bare prefix redirects to slash');
same($R('/a30-preview')['location'], '/a30-preview/', 'redirect target');
$r = $R('/a30-preview/');
same($r['action'], 'file', 'prefix root serves a file');
same(basename($r['file']), 'index.html', 'prefix root is index.html');
same($r['type'], 'text/html; charset=UTF-8', 'html content type');
same($R('/a30-preview/contribute/')['action'], 'file', 'page directory');
same($R('/a30-preview/contribute')['action'], 'redirect', 'page without slash redirects');
same($R('/a30-preview/contribute')['location'], '/a30-preview/contribute/', 'page redirect target');
same($R('/a30-preview/es/')['action'], 'file', 'language directory');
$r = $R('/a30-preview/_astro/a.css');
same($r['action'], 'file', 'asset served');
same($r['immutable'], true, 'hashed assets are cached long');
same($R('/a30-preview/contribute/')['immutable'], false, 'pages are not cached long');

foreach (['/a30-preview/../secret.txt', '/a30-preview/%2e%2e/secret.txt', '/a30-preview/a/../../secret.txt',
    '/a30-preview/..%2fsecret.txt', '/a30-preview/%2e%2e%2fsecret.txt', '/a30-preview/..%5csecret.txt',
    '/a30-preview/foo%00.html', '/a30-preview//secret.txt', '/a30-preview/./index.html',
    '/a30-preview/.env', '/a30-preview/run.php', '/a30-preview/contribute/../../secret.txt',
    '/a30-preview/missing.html', '/a30-preview/nothing/'] as $bad) {
    same($R($bad)['action'], 'notfound', "blocked or missing: $bad");
}
if ($linked) {
    same($R('/a30-preview/leak.txt')['action'], 'notfound', 'symlink out of dist is refused');
}
foreach (['/', '/contributions', '/a30-previewx/', '/wp-json/aa30/v1/signup', '/a30-prev', '/other/a30-preview/'] as $other) {
    same($R($other)['action'], 'none', "not ours: $other");
}
same($R('/blog/a30-preview/', '/blog')['action'], 'file', 'works in a subfolder install');
same($R('/a30-preview/', '/blog')['action'], 'none', 'subfolder install ignores the bare path');
same(aa30_prefix(), 'a30-preview', 'default prefix');

// ---------------------------------------------------------------- cleaning and mapping
same(aa30_amount('25'), '25.00', 'amount whole');
same(aa30_amount('25.5'), '25.50', 'amount one decimal');
same(aa30_amount('1'), '1.00', 'amount minimum');
same(aa30_amount('25000'), '25000.00', 'amount maximum');
foreach (['0', '0.99', '25001', '-5', '1e3', '12.345', '', 'abc', '5 ', '$5', '１２'] as $a) {
    if ($a === '5 ') {
        same(aa30_amount($a), '5.00', 'amount trims spaces');
        continue;
    }
    same(aa30_amount($a), '', "amount rejected: $a");
}
same(aa30_email('a@b.org'), 'a@b.org', 'email ok');
foreach (["a@b.org\nBcc: x@y.z", 'a@b.org, c@d.org', '<a@b.org>', 'a b@c.org', 'nope', '', str_repeat('a', 250) . '@b.org'] as $e) {
    same(aa30_email($e), '', 'email rejected: ' . json_encode($e));
}
same(aa30_one_line("Bob\r\nBcc: x", 100), 'Bob Bcc: x', 'line breaks collapse');
same(aa30_one_line(str_repeat('é', 200), 50), str_repeat('é', 50), 'cut by characters, not bytes');
same(aa30_one_line(['x'], 5), '', 'non-strings become empty');
same(aa30_multi_line("a\r\n\r\n\r\n\r\nb\x00", 100), "a\n\nb", 'multi-line tidy');
same(aa30_time_parts('19:30'), [7, '30', 'pm'], 'time evening');
same(aa30_time_parts('00:05'), [12, '05', 'am'], 'time midnight');
same(aa30_time_parts('12:00'), [12, '00', 'pm'], 'time noon');
same(aa30_time_parts('09:15'), [9, '15', 'am'], 'time morning');
same(aa30_time_parts('24:00'), null, 'time invalid hour');
same(aa30_time_parts('7pm'), null, 'time invalid text');
same(aa30_state_name('ma'), 'Massachusetts', 'state code');
same(aa30_state_name('new hampshire'), 'New Hampshire', 'state name');
same(aa30_state_name('Ontario'), 'Ontario', 'other region kept');
$ch = aa30_district_choices();
same(aa30_district_value('District 1 & 2', $ch), '1/2', 'district pair');
same(aa30_district_value('Distrito 15 y 16', $ch), '15/16', 'district pair, Spanish');
same(aa30_district_value('District 12 et 13', $ch), '12/13', 'district pair, French');
same(aa30_district_value('District 27', $ch), '27', 'district single');
same(aa30_district_value('District 28', $ch), '', 'district unknown');
same(aa30_district_value('District 1 & 2 & 3', $ch), '', 'district too many numbers');
same(aa30_district_value('District', $ch), '', 'district without number');

$mem = ['member' => 'Yes', 'first' => 'Pat', 'last' => 'Lee', 'street' => '1 Main St', 'town' => 'Boston', 'state' => 'ma',
    'zip' => '02205', 'email' => 'pat@example.org', 'amount' => '20'];
list($in, $err) = aa30_gf_input('mem', $mem);
same($err, [], 'member form valid');
same($in, ['input_1' => 'Yes', 'input_5' => 'pat@example.org', 'input_6' => '20.00', 'input_3_3' => 'Pat', 'input_3_6' => 'Lee',
    'input_4_1' => '1 Main St', 'input_4_3' => 'Boston', 'input_4_4' => 'Massachusetts', 'input_4_5' => '02205',
    'input_4_6' => 'United States'], 'member form maps to Gravity Forms inputs');

$grp = ['member' => 'Yes', 'group' => 'Sunrise', 'number' => '12345', 'street' => '5 Elm', 'town' => 'Quincy', 'state' => 'MA',
    'zip' => '02169', 'email' => 'g@example.org', 'day' => 'Friday', 'time' => '19:30', 'amount' => '35.50'];
list($in, $err) = aa30_gf_input('grp', $grp);
same($err, [], 'group form valid');
same($in['input_8'], 'Sunrise', 'group name');
same($in['input_11'], '12345', 'group number');
same($in['input_14'], 'Friday', 'meeting day');
same([$in['input_12_1'], $in['input_12_2'], $in['input_12_3']], [7, '30', 'pm'], 'meeting time parts');
same($in['input_6'], '35.50', 'group amount');

$dist = ['member' => 'Yes', 'district' => 'District 15 & 16', 'subdistrict' => 'Martha’s Vineyard', 'email' => 'd@example.org', 'amount' => '100'];
list($in, $err) = aa30_gf_input('dist', $dist);
same($err, [], 'district form valid');
same($in['input_8'], '15/16', 'district value');
same($in['input_9'], 'Martha’s Vineyard', 'sub-district');

list(, $err) = aa30_gf_input('mem', array_merge($mem, ['member' => '']));
ok(isset($err['member']), 'must confirm AA membership');
list(, $err) = aa30_gf_input('mem', array_merge($mem, ['amount' => '0.5', 'email' => 'bad']));
ok(isset($err['amount']) && isset($err['email']), 'bad amount and email reported');
list(, $err) = aa30_gf_input('grp', array_merge($grp, ['day' => 'Funday', 'time' => 'noon', 'number' => 'a b']));
ok(isset($err['day']) && isset($err['time']) && isset($err['number']), 'bad day, time and number reported');
list(, $err) = aa30_gf_input('dist', array_merge($dist, ['district' => 'District 99']));
ok(isset($err['district']), 'unknown district reported');
list(, $err) = aa30_gf_input('nope', []);
ok(isset($err['type']), 'unknown form type reported');
list($in, ) = aa30_gf_input('mem', array_merge($mem, ['first' => "Pat\r\n<script>"]));
ok(strpos($in['input_3_3'], "\n") === false, 'line breaks never reach a single-line field');

// ---------------------------------------------------------------- endpoints
function req($json, $origin = 'https://aaemass.org')
{
    $_SERVER['HTTP_ORIGIN'] = $origin;
    unset($_SERVER['HTTP_REFERER']);
    $_SERVER['REMOTE_ADDR'] = '203.0.113.9';
    return $json;
}
function call($kind, $json, $origin = 'https://aaemass.org')
{
    return aa30_handle($kind, new WP_REST_Request(req($json, $origin)));
}
function human($d)
{
    return $d + ['_t' => 5000];
}
function reset_world()
{
    $GLOBALS['transients'] = [];
    $GLOBALS['mail'] = [];
    $GLOBALS['mail_ok'] = true;
    $GLOBALS['gf_submits'] = [];
    $GLOBALS['logs'] = [];
    $GLOBALS['mc_api'] = new FakeApi();
    $GLOBALS['mc_form'] = new FakeForm();
}

// origin and shape
reset_world();
$msg = human(['to' => 'registrar', 'name' => 'Pat', 'email' => 'p@example.org', 'message' => 'Hello']);
same(call('message', $msg, 'https://evil.example')->status, 403, 'foreign origin refused');
same(call('message', $msg, '')->status, 403, 'missing origin refused');
unset($_SERVER['HTTP_ORIGIN']);
$_SERVER['HTTP_REFERER'] = 'https://www.aaemass.org/contact/';
$_SERVER['REMOTE_ADDR'] = '203.0.113.9';
same(aa30_handle('message', new WP_REST_Request($msg))->status, 200, 'referer from our own site (www) accepted');
unset($_SERVER['HTTP_REFERER']);
reset_world();
same(call('message', 'not json')->status, 400, 'non-JSON body refused');

// message
$r = call('message', $msg);
same([$r->status, $r->data['ok']], [200, true], 'message accepted');
same(count($GLOBALS['mail']), 1, 'one email sent');
same($GLOBALS['mail'][0]['to'], 'registrar@aaemass.org', 'sent to the allowlisted mailbox');
ok(in_array('Reply-To: "Pat" <p@example.org>', $GLOBALS['mail'][0]['headers'], true), 'reply-to is the visitor');
reset_world();
$evil = human(['to' => 'info', 'name' => "Bob\r\nBcc: spy@evil.example", 'email' => 'p@example.org', 'message' => "Hi\r\nBcc: spy@evil.example"]);
call('message', $evil);
$m = $GLOBALS['mail'][0];
ok(strpos($m['subject'], "\n") === false && strpos($m['subject'], "\r") === false, 'no line break in subject');
foreach ($m['headers'] as $h) {
    ok(strpos($h, "\n") === false && strpos($h, "\r") === false, 'no line break in header');
}
same(count($m['headers']), 2, 'exactly the two headers we set');
foreach ($m['headers'] as $h) {
    ok(!preg_match('/^(bcc|cc|to|from):/i', $h), 'no injected address header');
}
ok(strpos($m['headers'][1], '@evil') === false, 'no foreign address in the display name');
foreach (['evil@example.org', 'info@evil.example', 'nobody', '', 'INFO@aaemass.org'] as $to) {
    reset_world();
    $r = call('message', human(['to' => $to] + $msg));
    same($r->status, 422, "recipient refused: $to");
    same(count($GLOBALS['mail']), 0, "nothing sent for recipient: $to");
}
reset_world();
$r = call('message', human(['to' => 'INFO'] + $msg));
same($r->status, 200, 'recipient is case-insensitive');
reset_world();
foreach (['name', 'email', 'message'] as $k) {
    $r = call('message', human([$k => ''] + $msg));
    same($r->status, 422, "missing $k refused");
}
reset_world();
$GLOBALS['mail_ok'] = false;
same(call('message', $msg)->status, 502, 'mail failure is reported');
$GLOBALS['mail_ok'] = true;

// bot traps
reset_world();
$r = call('message', $msg + ['_gotcha' => 'http://spam']);
same([$r->status, $r->data], [200, ['ok' => true]], 'honeypot gets a fake success');
$r = call('message', ['_t' => 200] + $msg);
same([$r->status, $r->data], [200, ['ok' => true]], 'instant submit gets a fake success');
$r = call('message', array_diff_key($msg, ['_t' => 1]));
same(count($GLOBALS['mail']), 0, 'no email for either bot');

// rate limit
reset_world();
$codes = [];
for ($i = 0; $i < 7; $i++) {
    $codes[] = call('message', $msg)->status;
}
same($codes, [200, 200, 200, 200, 200, 429, 429], 'message rate limit: 5 per hour');
same(count($GLOBALS['mail']), 5, 'only five emails sent');
$_SERVER['REMOTE_ADDR'] = '203.0.113.10';
same(aa30_handle('message', new WP_REST_Request($msg))->status, 200, 'another visitor is unaffected');

// signup
reset_world();
$su = human(['email' => 'new@example.org', 'lang' => 'es']);
same(call('signup', $su)->status, 503, 'signup without Mailchimp for WP is unavailable');
mc_on();
$r = call('signup', $su);
same([$r->status, $r->data['ok']], [200, true], 'signup accepted');
same($GLOBALS['mc_api']->calls[0][0], 'LIST123', 'uses the default form audience');
same($GLOBALS['mc_api']->calls[0][1]['status'], 'pending', 'asks to confirm by email');
same($GLOBALS['mc_api']->calls[0][1]['language'], 'es', 'language passed');
same($GLOBALS['mc_api']->calls[0][1]['email_address'], 'new@example.org', 'address passed');
reset_world();
$GLOBALS['mc_form']->settings['double_optin'] = '0';
call('signup', $su);
same($GLOBALS['mc_api']->calls[0][1]['status'], 'subscribed', 'honors single opt-in');
reset_world();
$GLOBALS['mc_api']->throw = 'Member Exists';
$r = call('signup', $su);
same([$r->status, $r->data], [200, ['ok' => true]], 'existing member looks like success');
reset_world();
$GLOBALS['mc_api']->throw = 'API key invalid';
same(call('signup', $su)->status, 502, 'other Mailchimp errors are reported');
reset_world();
same(call('signup', human(['email' => 'nope']))->status, 422, 'bad signup email refused');
same(count($GLOBALS['mc_api']->calls), 0, 'nothing sent to Mailchimp for a bad email');
reset_world();
$GLOBALS['mc_form']->lists = [];
same(call('signup', $su)->status, 503, 'no audience selected is reported');

// contribute
$memReq = human(['type' => 'mem'] + $mem);
reset_world();
same(call('contribute', $memReq)->status, 503, 'contribute without Gravity Forms is unavailable');
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
$GLOBALS['gf_result'] = ['is_valid' => true, 'confirmation_type' => 'redirect', 'confirmation_redirect' => 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick'];
$r = call('contribute', $memReq);
same([$r->status, $r->data['ok']], [200, true], 'contribution accepted');
same($r->data['redirect'], 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick', 'visitor is sent to PayPal');
same($GLOBALS['gf_submits'][0][0], 1, 'submitted to Gravity Forms form 1');
same($GLOBALS['gf_submits'][0][1]['input_6'], '20.00', 'amount reaches the form');
reset_world();
$GLOBALS['gf_fields'] = [1, 3, 5, 6]; // address field removed
same(call('contribute', $memReq)->status, 503, 'edited form is refused, not guessed');
same(count($GLOBALS['gf_submits']), 0, 'nothing submitted to an edited form');
reset_world();
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
foreach ([
    ['is_valid' => true, 'confirmation_type' => 'message', 'confirmation_message' => 'Thanks'],
    ['is_valid' => true, 'confirmation_type' => 'redirect', 'confirmation_redirect' => 'https://evil.example/paypal.com'],
    ['is_valid' => true, 'confirmation_type' => 'redirect', 'confirmation_redirect' => 'http://www.paypal.com/x'],
    ['is_valid' => true, 'confirmation_type' => 'redirect', 'confirmation_redirect' => 'https://paypal.com.evil.example/x'],
] as $i => $bad) {
    reset_world();
    $GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
    $GLOBALS['gf_result'] = $bad;
    same(call('contribute', $memReq)->status, 502, "no valid PayPal redirect is an error (case $i)");
}
reset_world();
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
$GLOBALS['gf_result'] = ['is_valid' => false, 'validation_messages' => [5 => 'bad email']];
$r = call('contribute', $memReq);
same([$r->status, $r->data['errors']], [422, ['email' => 'invalid']], 'Gravity Forms validation maps back to our fields');
$GLOBALS['gf_result'] = new WP_Error('boom');
same(call('contribute', $memReq)->status, 502, 'Gravity Forms error is reported');
reset_world();
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
same(call('contribute', human(['type' => 'bogus']))->status, 422, 'unknown form type refused');
same(call('contribute', human(['type' => 'mem', 'amount' => '999999'] + $mem))->status, 422, 'huge amount refused');
same(count($GLOBALS['gf_submits']), 0, 'nothing submitted for bad input');
// district uses the form's own choices
reset_world();
$GLOBALS['gf_fields'] = [1, 5, 6, 8, 9];
$GLOBALS['gf_result'] = ['is_valid' => true, 'confirmation_type' => 'redirect', 'confirmation_redirect' => 'https://www.paypal.com/x'];
same(call('contribute', human(['type' => 'dist'] + $dist))->status, 200, 'district form accepted');
same($GLOBALS['gf_submits'][0][1]['input_8'], '15/16', 'district sent as the form value');
reset_world();
$GLOBALS['gf_fields'] = [1, 5, 6, 8, 9];
same(call('contribute', human(['district' => 'District 20'] + ['type' => 'dist'] + $dist))->status, 422, 'district missing from the form is refused');
// group form
reset_world();
$GLOBALS['gf_fields'] = [1, 4, 5, 6, 8, 11, 12, 14];
same(call('contribute', human(['type' => 'grp'] + $grp))->status, 200, 'group form accepted');
same($GLOBALS['gf_submits'][0][0], 2, 'submitted to Gravity Forms form 2');
same($GLOBALS['gf_submits'][0][1]['input_12_3'], 'pm', 'time reaches the form');

// 12th Step Volunteer (Gravity Forms form 4)
$vol = ['name' => 'Pat R.', 'phone' => '(617) 555-0123', 'email' => 'pat@example.org', 'hometown' => 'Quincy',
    'weekday_nights' => 'Yes', 'weekend_days' => 'Yes'];
reset_world();
same(call('volunteer', human($vol))->status, 503, 'volunteer without Gravity Forms is unavailable');
$GLOBALS['gf_enabled'] = true;
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
$GLOBALS['gf_result'] = ['is_valid' => true];
$r = call('volunteer', human($vol));
same([$r->status, $r->data['ok']], [200, true], 'volunteer accepted');
same($GLOBALS['gf_submits'][0][0], 4, 'submitted to Gravity Forms form 4');
$sent = $GLOBALS['gf_submits'][0][1];
same([$sent['input_1'], $sent['input_3'], $sent['input_4'], $sent['input_5']], ['Pat R.', '(617) 555-0123', 'pat@example.org', 'Quincy'], 'name, phone, email and hometown reach the form');
same([$sent['input_6_2'] ?? null, $sent['input_6_3'] ?? null, isset($sent['input_6_1']), isset($sent['input_6_4'])], ['Weekday Nights', 'Weekend Days', false, false], 'only the ticked times are sent');
// a volunteer with only an email, or only a phone, is fine
reset_world();
same(call('volunteer', human(['phone' => ''] + $vol))->status, 200, 'email alone is enough');
reset_world();
same(call('volunteer', human(['email' => ''] + $vol))->status, 200, 'phone alone is enough');
// required things
reset_world();
$r = call('volunteer', human(['name' => '', 'hometown' => ''] + $vol));
same([$r->status, $r->data['errors']], [422, ['name' => 'invalid', 'hometown' => 'invalid']], 'name and hometown are required');
$r = call('volunteer', human(['phone' => '', 'email' => ''] + $vol));
same([$r->status, $r->data['errors']], [422, ['phone' => 'invalid', 'email' => 'invalid']], 'a way to reach the person is required');
$r = call('volunteer', human(['phone' => 'call me'] + $vol));
same([$r->status, isset($r->data['errors']['phone'])], [422, true], 'a phone number must look like one');
$r = call('volunteer', human(['email' => 'not-an-email'] + $vol));
same([$r->status, isset($r->data['errors']['email'])], [422, true], 'a bad email is refused');
$r = call('volunteer', human(['weekday_nights' => '', 'weekend_days' => ''] + $vol));
same([$r->status, $r->data['errors']], [422, ['availability' => 'invalid']], 'at least one time is required');
reset_world(); // keep clear of the hourly limit
$r = call('volunteer', human(['weekday_nights' => 'maybe', 'weekend_days' => 'no'] + $vol));
same($r->status, 422, 'only "Yes" counts as ticked');
same(count($GLOBALS['gf_submits']), 0, 'nothing is submitted for bad input');
// line breaks never reach single-line fields
reset_world();
call('volunteer', human(['name' => "Pat\nBcc: x@evil.example", 'hometown' => "Quincy\r\nMA"] + $vol));
ok(strpos($GLOBALS['gf_submits'][0][1]['input_1'], "\n") === false && strpos($GLOBALS['gf_submits'][0][1]['input_5'], "\n") === false, 'line breaks never reach a single-line field');
// the form's own choice values and checkbox ids are used when they can be read
reset_world();
$GLOBALS['gf_avail'] = ['choices' => ['wd', 'wn', 'ed', 'en'], 'inputs' => ['6.1', '6.2', '6.3', '6.5']];
call('volunteer', human(['weekday_nights' => '', 'weekend_days' => '', 'weekday_days' => 'Yes', 'weekend_nights' => 'Yes'] + $vol));
$sent = $GLOBALS['gf_submits'][0][1];
same([$sent['input_6_1'] ?? null, $sent['input_6_5'] ?? null, isset($sent['input_6_4'])], ['wd', 'en', false], "the form's own values and checkbox ids are used");
$GLOBALS['gf_avail'] = null;
// edited form is refused, not guessed
reset_world();
$GLOBALS['gf_fields'] = [1, 3, 4, 6]; // hometown removed
same(call('volunteer', human($vol))->status, 503, 'an edited form is refused, not guessed');
$GLOBALS['gf_fields'] = null;
same(call('volunteer', human($vol))->status, 503, 'a missing form is unavailable');
// Gravity Forms answers
reset_world();
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
$GLOBALS['gf_result'] = ['is_valid' => false, 'validation_messages' => [4 => 'bad email']];
$r = call('volunteer', human($vol));
same([$r->status, $r->data['errors']], [422, ['email' => 'invalid']], 'Gravity Forms validation maps back to our fields');
$GLOBALS['gf_result'] = new WP_Error('boom');
same(call('volunteer', human($vol))->status, 502, 'a Gravity Forms error is reported');
// bots and floods
reset_world();
$GLOBALS['gf_result'] = ['is_valid' => true];
$r = call('volunteer', human(['_gotcha' => 'x'] + $vol));
same([$r->status, count($GLOBALS['gf_submits'])], [200, 0], 'honeypot: a bot gets "ok" and nothing is stored');
$r = call('volunteer', $vol + ['_t' => 100]);
same([$r->status, count($GLOBALS['gf_submits'])], [200, 0], 'a form sent instantly is dropped');
reset_world();
for ($i = 0; $i < 5; $i++) {
    call('volunteer', human($vol));
}
same(call('volunteer', human($vol))->status, 429, 'at most 5 volunteer forms per visitor per hour');
same(count($GLOBALS['gf_submits']), 5, 'the sixth is not stored');
reset_world();
same(call('volunteer', human($vol), 'https://evil.example')->status, 403, 'a foreign origin is refused');
// the contribution endpoint cannot be pointed at the volunteer form
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
same(call('contribute', human(['type' => 'vol'] + $vol))->status, 422, 'contribute cannot reach the volunteer form');
same(count($GLOBALS['gf_submits']), 0, 'and nothing was submitted');

// dry run (must come last: a constant cannot be undone)
define('AA30_DRY_RUN', true);
reset_world();
$GLOBALS['mc_enabled'] = true;
$r = call('message', $msg);
same([$r->status, $r->data['dry'], count($GLOBALS['mail'])], [200, true, 0], 'dry run: message sends nothing');
$r = call('signup', $su);
same([$r->status, $r->data['dry'], count($GLOBALS['mc_api']->calls)], [200, true, 0], 'dry run: signup subscribes nobody');
$GLOBALS['gf_fields'] = [1, 3, 4, 5, 6];
$r = call('contribute', $memReq);
same([$r->status, $r->data['dry'], $r->data['fields_match'], count($GLOBALS['gf_submits'])], [200, true, true, 0], 'dry run: contribution creates no entry');
$r = call('volunteer', human($vol));
same([$r->status, $r->data['dry'], $r->data['form'], $r->data['fields_match'], count($GLOBALS['gf_submits'])], [200, true, 4, true, 0], 'dry run: volunteer creates no entry');

// ---------------------------------------------------------------- updater
require AA30_DIR . '/includes/updater.php';
$rel = fn($name, $extra = []) => $extra + ['name' => $name, 'html_url' => 'https://example.test/r', 'assets' => [
    ['name' => 'aa30-home.zip', 'url' => 'https://api.github.com/a/1', 'browser_download_url' => 'https://example.test/aa30-home.zip'],
    ['name' => 'aa30-home.sig', 'url' => 'https://api.github.com/a/2', 'browser_download_url' => 'https://example.test/aa30-home.sig'],
]];
same(aa30_update_from_release($rel('2.0.9'), '2.0.8'), ['version' => '2.0.9', 'package' => 'https://example.test/aa30-home.zip', 'signature' => 'https://example.test/aa30-home.sig', 'url' => 'https://example.test/r'], 'updater: a newer signed release is offered, with its signature');
same(aa30_update_from_release($rel('2.0.9'), '2.0.8', 'tok')['package'], 'https://api.github.com/a/1', 'updater: with a token the API asset is used');
same(aa30_update_from_release($rel('2.0.9'), '2.0.8', 'tok')['signature'], 'https://api.github.com/a/2', 'updater: and the API signature asset');
same(aa30_update_from_release($rel('2.0.9', ['assets' => [['name' => 'aa30-home.zip', 'url' => 'u', 'browser_download_url' => 'b']]]), '2.0.8'), null, 'updater: an UNSIGNED release (no signature file) is never offered');
same(aa30_update_from_release($rel('2.0.9', ['assets' => [['name' => 'aa30-home.sig', 'url' => 'u', 'browser_download_url' => 'b']]]), '2.0.8'), null, 'updater: a signature with no zip is never offered');
same([aa30_release_is_signed($rel('2.0.9')), aa30_release_is_signed(['assets' => [['name' => 'aa30-home.zip']]]), aa30_release_is_signed(null)], [true, false, false], 'updater: release_is_signed needs both files');
same(aa30_update_from_release($rel('2.0.8'), '2.0.8'), null, 'updater: same version is not an update');
same(aa30_update_from_release($rel('2.0.7'), '2.0.8'), null, 'updater: an older release is never installed');
same(aa30_update_from_release($rel('2.0.10'), '2.0.9')['version'], '2.0.10', 'updater: versions compare numerically, not as text');
same(aa30_update_from_release($rel('Latest plugin'), '2.0.0'), null, 'updater: a release without a version number is ignored');
same(aa30_update_from_release($rel('2.0.9', ['draft' => true]), '2.0.8'), null, 'updater: drafts are ignored');
same(aa30_update_from_release(['name' => '2.0.9', 'assets' => []], '2.0.8'), null, 'updater: a release with no zip is ignored');
same(aa30_update_from_release(null, '2.0.8'), null, 'updater: no release data is not an update');

// ---- signature verification. The fixture was signed by Node (scripts/sign-plugin.mjs, the signer CI uses) with a throwaway
// key, to prove that PHP accepts exactly what the build produces.
$fxPub = 'MEs3QnfJ31ijkwcX5414NM4bu+rkjVOOLLabIiPaKYk=';
$fxSig = 'OjLnXR92Gf2SSEujGAISizcJhX3p0XF8dlK3dAGBjUDEMIFcKplEz/eIy3bSpaxxK1js8Da686OWI+MrZ+dWBg==';
$fxFile = sys_get_temp_dir() . '/aa30-fixture-' . getmypid() . '.bin';
file_put_contents($fxFile, base64_decode('Zml4dHVyZSBwbHVnaW4gemlwIGJ5dGVzAAECIHYyLjAuOTkK'));
same(aa30_verify_package($fxFile, '2.0.99', $fxSig, $fxPub), true, 'signature: a package signed by the build verifies');
ok(aa30_verify_package($fxFile, '2.0.100', $fxSig, $fxPub) !== true, 'signature: the same signature does not verify for another version (no replay of an old release as a new one)');
file_put_contents($fxFile . '.t', base64_decode('Zml4dHVyZSBwbHVnaW4gemlwIGJ5dGVzAAECIHYyLjAuOTkK') . 'x');
ok(aa30_verify_package($fxFile . '.t', '2.0.99', $fxSig, $fxPub) !== true, 'signature: a package with one extra byte is rejected');
ok(aa30_verify_package($fxFile, '2.0.99', $fxSig, AA30_UPDATE_PUBLIC_KEY) !== true, 'signature: a different key (the real one) does not accept the fixture');
ok(aa30_verify_package($fxFile, '2.0.99', 'not base64!!', $fxPub) !== true, 'signature: a garbage signature is rejected');
ok(aa30_verify_package($fxFile, '2.0.99', base64_encode('short'), $fxPub) !== true, 'signature: a signature of the wrong length is rejected');
ok(aa30_verify_package($fxFile, '2.0.99', '', $fxPub) !== true, 'signature: an empty signature is rejected');
ok(aa30_verify_package($fxFile . '.missing', '2.0.99', $fxSig, $fxPub) !== true, 'signature: an unreadable file is rejected');
ok(aa30_verify_package($fxFile, '2.0.99', $fxSig, 'AAAA') !== true, 'signature: a malformed public key is rejected');
@unlink($fxFile);
@unlink($fxFile . '.t');
same(strlen(base64_decode(AA30_UPDATE_PUBLIC_KEY, true)), 32, 'signature: the production public key is a valid 32-byte key');
same([aa30_is_update_package('https://github.com/o/r/releases/download/plugin-latest/aa30-home.zip', 'o/r'), aa30_is_update_package('https://api.github.com/repos/o/r/releases/assets/123', 'o/r'), aa30_is_update_package('https://github.com/other/r/releases/download/plugin-latest/aa30-home.zip', 'o/r'), aa30_is_update_package('https://downloads.wordpress.org/plugin/akismet.zip', 'o/r'), aa30_is_update_package(null, 'o/r')], [true, true, false, false, false], 'signature: only our own release package is intercepted, never other plugins');
same(aa30_update_status_text(['time' => 1000000 - 60, 'code' => 200, 'version' => '2.0.9', 'signed' => false], 1000000, '2.0.8'), 'Update check 1 min ago: version 2.0.9 is not signed, so it will not be installed', 'status: an unsigned newer release is explained');
$now = 1000000;
same(aa30_update_status_text(false, $now, '2.0.5'), 'Update check: not run yet', 'status: before any check');
same(aa30_update_status_text(['time' => $now - 20, 'code' => 200, 'version' => '2.0.6'], $now, '2.0.5'), 'Update check just now: version 2.0.6 is available', 'status: an update is available');
same(aa30_update_status_text(['time' => $now - 600, 'code' => 200, 'version' => '2.0.5'], $now, '2.0.5'), 'Update check 10 min ago: up to date (2.0.5)', 'status: up to date');
same(aa30_update_status_text(['time' => $now - 3 * 3600, 'code' => 200, 'version' => '2.0.9'], $now, '2.0.10'), 'Update check 3 h ago: up to date (2.0.10)', 'status: versions compare numerically');
same(aa30_update_status_text(['time' => $now - 120, 'code' => 403, 'version' => ''], $now, '2.0.5'), 'Update check 2 min ago failed: GitHub answered 403 (rate limited?)', 'status: rate limit is called out');
same(aa30_update_status_text(['time' => $now - 120, 'code' => 0, 'version' => '', 'error' => 'cURL error 28: timeout'], $now, '2.0.5'), 'Update check 2 min ago failed: cURL error 28: timeout', 'status: network error is shown');

echo "\n$pass passed, $fail failed\n";
exit($fail ? 1 : 0);
