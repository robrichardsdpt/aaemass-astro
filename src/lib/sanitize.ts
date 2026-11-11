// Cleans HTML that came from editors (Markdown in CMS pages and events) before it is put on a page.
//
// Markdown allows raw HTML, so without this a compromised or careless editor account could add a <script>, an
// onerror= handler or a javascript: link to a live page (for example a fake donation link on the Contribute page).
// Only formatting the site actually uses is kept: text, headings, lists, links, images, tables, quotes and code.
// Links may point to https, http, mailto, tel or a path on this site; images to https, http or a path.
import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'sup', 'sub', 'code', 'pre', 'blockquote',
    'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    ol: ['start'],
  },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http'] },
  allowProtocolRelative: false, // "//example.com" is treated as unsafe; write the full https:// address
  disallowedTagsMode: 'discard', // <script>, <style> and the like are dropped along with their contents
};

export const cleanHtml = (html: string): string => sanitizeHtml(html, options);
