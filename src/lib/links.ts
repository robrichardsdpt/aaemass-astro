const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Turns "[text](url)" in mirrored content into anchors. Bare domains get https://.
export function linkify(input: string): string {
  return esc(input).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, href: string) => {
    let url = href.replace(/&amp;/g, '&');
    if (/^[\w.-]+@[\w.-]+$/.test(url)) url = `mailto:${url}`;
    else if (!/^(https?:|mailto:|\/|#)/.test(url)) url = `https://${url}`;
    return `<a href="${esc(url)}">${text}</a>`;
  });
}

export const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
