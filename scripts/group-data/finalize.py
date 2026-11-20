"""Step 3 of 3 (see docs/GROUP-LOOKUP.md). Write the file the contribution form loads: the numbered groups, the hand-checked
overrides, and the groups that have no number.

Usage: python3 -I scripts/group-data/finalize.py <work-folder> public/data/area30-groups.json
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I leaves the script's own folder off the path
from assemble import assemble, check, load_zips

work, out_path = sys.argv[1:3]
groups, overrides_applied, _ = assemble(work, load_zips(work))
check(groups)

json.dump(groups, open(out_path, 'w'), separators=(',', ':'), ensure_ascii=False)
numbered = sum(1 for g in groups if g['id'])
print(f'{len(groups)} groups written to {out_path}: {numbered} numbered, {len(groups) - numbered} without a number '
      f'({overrides_applied} hand-checked override(s) applied)')
