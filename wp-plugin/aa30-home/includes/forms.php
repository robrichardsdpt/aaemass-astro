<?php
/**
 * Form logic that does not need WordPress: cleaning input, the recipient allowlist, and turning the
 * site's contribution forms into the exact fields the Gravity Forms contribution forms expect.
 * Kept separate so it can be tested on its own.
 */

if (!defined('ABSPATH') && !defined('AA30_TESTING')) {
    exit;
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

/** Gravity Forms form id of the 12th Step Volunteer form (AA30_FORM_IDS['vol'] overrides it). */
function aa30_volunteer_form_id(): int
{
    if (defined('AA30_FORM_IDS') && is_array(AA30_FORM_IDS) && isset(AA30_FORM_IDS['vol'])) {
        return (int) AA30_FORM_IDS['vol'];
    }
    return 4;
}

/** Gravity Forms field ids the 12th Step Volunteer form must still have: name, phone, email, hometown, availability. */
function aa30_volunteer_expected_ids(): array
{
    return [1, 3, 4, 5, 6];
}

/** Which page field each Gravity Forms field id belongs to, for reporting validation problems back. */
function aa30_volunteer_error_names(): array
{
    return [1 => 'name', 3 => 'phone', 4 => 'email', 5 => 'hometown', 6 => 'availability'];
}

/**
 * The availability choices, in the order of the form's checkboxes. The page sends one checkbox per key; the key
 * says which of the form's four choices it means.
 */
function aa30_volunteer_slots(): array
{
    return ['weekday_days' => 'Weekday Days', 'weekday_nights' => 'Weekday Nights', 'weekend_days' => 'Weekend Days', 'weekend_nights' => 'Weekend Nights'];
}

/** A phone number people can actually dial: digits with the usual separators, 7 to 30 characters. */
function aa30_phone($v): string
{
    $v = aa30_one_line($v, 30);
    // Digits, spaces and the usual separators ("(617) 555-0123", "+1 617.555.0123", "617-555-0123 x4"), at least 7 digits.
    return preg_match('/^[0-9 ()+.,#xX-]{7,30}$/', $v) && preg_match_all('/[0-9]/', $v) >= 7 ? $v : '';
}

/**
 * Turn what the volunteer page sent into Gravity Forms input values for the 12th Step Volunteer form.
 *
 * Name and hometown are required, and so is at least one way to reach the person (phone or email) and at least
 * one time they are available: a volunteer list entry without those cannot be used.
 *
 * @param array      $d       the decoded JSON from the page
 * @param array|null $choices the form's own availability choices, in checkbox order (4 values), when available
 * @param array|null $inputIds the form's own checkbox input ids for those choices ('6.1' ...), when available
 * @return array [input values, errors keyed by the page's field names]
 */
function aa30_gf_volunteer_input(array $d, ?array $choices = null, ?array $inputIds = null): array
{
    $slots = aa30_volunteer_slots();
    $choices = ($choices && count($choices) === count($slots)) ? array_values($choices) : array_values($slots);
    $inputIds = ($inputIds && count($inputIds) === count($slots)) ? array_values($inputIds) : ['6.1', '6.2', '6.3', '6.4'];

    $get = function ($k) use ($d) {
        return isset($d[$k]) && is_string($d[$k]) ? $d[$k] : '';
    };
    $in = [];
    $err = [];

    $in['input_1'] = aa30_one_line($get('name'), 100);
    if ($in['input_1'] === '') {
        $err['name'] = 'invalid';
    }
    $in['input_5'] = aa30_one_line($get('hometown'), 60);
    if ($in['input_5'] === '') {
        $err['hometown'] = 'invalid';
    }

    $phoneRaw = trim($get('phone'));
    $phone = $phoneRaw === '' ? '' : aa30_phone($phoneRaw);
    if ($phoneRaw !== '' && $phone === '') {
        $err['phone'] = 'invalid';
    }
    $emailRaw = trim($get('email'));
    $email = $emailRaw === '' ? '' : aa30_email($emailRaw);
    if ($emailRaw !== '' && $email === '') {
        $err['email'] = 'invalid';
    }
    if ($phoneRaw === '' && $emailRaw === '') {
        $err['phone'] = 'invalid';
        $err['email'] = 'invalid';
    }
    $in['input_3'] = $phone;
    $in['input_4'] = $email;

    $picked = 0;
    $i = 0;
    foreach (array_keys($slots) as $key) {
        if (strtolower(aa30_one_line($get($key), 5)) === 'yes') {
            $in['input_' . str_replace('.', '_', (string) $inputIds[$i])] = $choices[$i];
            $picked++;
        }
        $i++;
    }
    if ($picked === 0) {
        $err['availability'] = 'invalid';
    }

    return [$in, $err];
}
