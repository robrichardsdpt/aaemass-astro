"""Step 2 of 3 (see docs/GROUP-LOOKUP.md). Look up zip codes from individual aaboston.org meeting pages, one at a time, with a pause between requests.

Usage: python3 -I scripts/group-data/zips.py <work-folder>   (reads data/suggestions.json, keeps data/zips.json; safe to re-run)"""
import json, re, sys, time, urllib.request

S = sys.argv[1]
UA = 'Mozilla/5.0 (compatible; Area30-webmaster-lookup)'
suggestions = json.load(open(f'{S}/data/suggestions.json'))
urls = sorted({o['url'] for r in suggestions for o in r['options'] if o['url'] and not o['zip']})
cache_path = f'{S}/data/zips.json'
try:
    cache = json.load(open(cache_path))
except FileNotFoundError:
    cache = {}

for i, url in enumerate(urls, 1):
    if url in cache:
        continue
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
        print(f'{i}/{len(urls)}', flush=True)
    time.sleep(1.2)
json.dump(cache, open(cache_path, 'w'))
print('done', len(cache), 'with zip:', sum(1 for v in cache.values() if v), flush=True)
