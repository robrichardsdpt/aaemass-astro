// Share a link: the phone's own share sheet where the browser has one, otherwise copy it. Shared by the event pages
// (components/ShareButton.astro) and the Explore events window (event-search.ts).
export interface ShareInfo { title: string; text?: string; url: string }
export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export const canNativeShare = (): boolean => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export async function shareOrCopy(info: ShareInfo): Promise<ShareResult> {
  if (canNativeShare()) {
    try {
      await navigator.share(info);
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'; // the person closed the share sheet
      // anything else: fall through and copy instead
    }
  }
  try {
    await navigator.clipboard.writeText(info.url);
    return 'copied';
  } catch {
    // clipboard blocked (older browser, or not a secure page): try the old way
  }
  try {
    const box = document.createElement('textarea');
    box.value = info.url;
    box.setAttribute('readonly', '');
    box.style.cssText = 'position:fixed;top:0;opacity:0';
    document.body.append(box);
    box.select();
    const ok = document.execCommand('copy');
    box.remove();
    if (ok) return 'copied';
  } catch {
    // give up below
  }
  return 'failed';
}
