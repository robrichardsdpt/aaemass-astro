# Running the site inside WordPress (private preview)

The `aa30-home` plugin serves this whole site from WordPress under a private URL prefix and gives its forms a
backend that uses the plugins already on aaemass.org. Nothing on the existing site changes, and no API keys
are needed.

- **Where it lives:** `https://aaemass.org/a30-preview/` (English), `/a30-preview/es/`, `/a30-preview/fr/`.
- **Hidden from search:** every page has `noindex`, every response has an `X-Robots-Tag: noindex` header, the
  sitemap is empty, and nothing links to it. It is not password protected: anyone who has the link can open it.
- **No conflicts:** the plugin only answers URLs that start with the prefix. Every other URL is left to WordPress.
- **Removing it:** deactivate the plugin and the whole preview disappears.

## What each form does

| Form | Goes to | Notes |
| --- | --- | --- |
| Group, member and district contributions | The Gravity Forms contribution forms (IDs 2, 1, 3) | Their existing PayPal feeds run, so the visitor lands on PayPal exactly as on the old site. Notifications and entries behave as they do today. |
| Mailing list signup | Mailchimp for WP's saved connection | Same audience and double opt-in as the default Mailchimp for WP form. |
| Contact and all "send a message" forms | `wp_mail` to one mailbox | The page only names a mailbox (like `registrar`). The plugin holds the list of 19 allowed mailboxes at `@aaemass.org`. |

## Build and install

1. `./build-plugin.sh` (or `WP_PREFIX=another-prefix ./build-plugin.sh` for a different prefix). It writes `aa30-home.zip`.
2. In wp-admin: Plugins, Add New, Upload Plugin, choose `aa30-home.zip`, then Activate. If the old
   "Area 30 Homepage" plugin is installed, deactivate and delete it first (same folder name).
3. Visit `https://aaemass.org/a30-preview/`.

## Test it without sending anything (dry run)

Add this line to `wp-config.php`, above the "stop editing" comment:

```php
define('AA30_DRY_RUN', true);
```

With it on, each form checks its input and answers, but nothing is sent: no email, no Mailchimp signup, no Gravity
Forms entry. Contribution forms answer with what they would have submitted and whether the Gravity Forms form was
found with its expected fields (`fields_match`). Contribution forms do not go to PayPal in this mode.

Then test for real by removing that line:

1. **Signup:** use an address you control. You should get Mailchimp's confirmation email.
2. **Message:** use the Contact form. The email should arrive at `info@aaemass.org` with Reply-To set to the sender.
3. **Contribution:** submit the member form. You should land on PayPal. Stop there; do not pay. A Gravity Forms entry
   and its notification email to the treasurer are created, which is the same as the old form.
4. Check the Gravity Forms entry looks right (name, address, amount).

If a form says it did not go through, the reason is written to the PHP error log with the prefix `[aa30]`.

## Safeguards built in

- Forms only accept requests that come from the site itself, as JSON.
- A hidden field and a minimum-time check quietly drop most bots (they get a fake "ok").
- Each visitor can send at most 5 signups, 5 messages and 10 contributions per hour.
- Messages can only reach the allowlisted mailboxes; line breaks and address-like text are stripped from names and subjects.
- Contribution amounts must be between $1 and $25,000.
- If someone edits a Gravity Forms contribution form so its fields no longer match, the plugin refuses to submit
  rather than guess.
- A contribution only counts if the form's PayPal feed sends the visitor to a `paypal.com` address.
- Files are served only from the plugin's `dist` folder, only of known types, and a path can never leave it.

## Settings (optional, in `wp-config.php`)

| Constant | Purpose |
| --- | --- |
| `AA30_PREFIX` | Override the URL prefix (normally set by the build). |
| `AA30_DRY_RUN` | `true` to test without side effects. |
| `AA30_MAIL_DOMAIN` | Domain messages may go to (default `aaemass.org`). |
| `AA30_MAILCHIMP_LIST` | Audience ID, if it should not follow the Mailchimp for WP default form. |
| `AA30_FORM_IDS` | `['mem' => 1, 'grp' => 2, 'dist' => 3]` if the Gravity Forms IDs ever change. |
| `AA30_ALLOWED_ORIGINS` | Extra sites allowed to post to the forms. |

## Running the plugin tests

```
php wp-plugin/tests/run.php
```

Needs only PHP 7.4 or newer. WordPress, Gravity Forms and Mailchimp are replaced by stand-ins, so this checks the
plugin's own logic, not your live site. The dry run above is how you check the real connections.

## Not covered here

- The 12th Step Volunteer form (Gravity Forms form 4) has no page on the new site yet.
- Events on the new site are read when the site is built. Rebuild and re-upload to refresh them.
- A tiny amount of Gravity Forms behavior can only be confirmed on the live site: that its PayPal feed returns the
  PayPal address to this endpoint. The test above (step 3) checks it.
