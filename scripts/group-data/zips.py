"""Step 2 of 3 (see docs/GROUP-LOOKUP.md). Look up zip codes from individual aaboston.org meeting pages, one at a time, with a pause between requests.

Usage: python3 -I scripts/group-data/zips.py <work-folder>   (keeps data/zips.json; safe to re-run, pages already done are skipped)
Only the addresses that will be offered to donors and still lack a zip are looked up, one page per address.
"""
import json, os, re, sys, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I leaves the script's own folder off the path
from assemble import assemble, load_zips

S = sys.argv[1]
UA = 'Mozilla/5.0 (compatible; Area30-webmaster-lookup)'
cache_path = f'{S}/data/zips.json'
cache = load_zips(S)
_, _, urls = assemble(S, cache)
todo = [u for u in urls if u not in cache]
print(f'{len(todo)} address(es) still need a zip', flush=True)

for i, url in enumerate(todo, 1):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        page = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
        text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', page))
        found = re.findall(r'\bMA (\d{5})\b', text)
        cache[url] = found[0] if found else ''
    except Exception as e:
        cache[url] = ''
        print('ERR', url, e, flush=True)
    if i % 25 == 0:
        json.dump(cache, open(cache_path, 'w'))
        print(f'{i}/{len(todo)}', flush=True)
    time.sleep(1.2)
json.dump(cache, open(cache_path, 'w'))
print('done', len(cache), 'with zip:', sum(1 for v in cache.values() if v), flush=True)
