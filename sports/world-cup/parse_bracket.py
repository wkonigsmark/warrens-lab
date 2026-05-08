import json
import re

def parse():
    try:
        with open('bracket_data.txt', 'r') as f:
            lines = f.readlines()
    except:
        return {}

    lookup = {}
    
    # 1A 1B 1D 1E 1G 1I 1K 1L
    keys = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L']

    for line in lines:
        line = line.strip()
        if not line or line.startswith("No") or line.startswith('"'): continue
        
        # Find all 3X items
        items = re.findall(r'3([A-L])', line)
        if len(items) != 8: continue
        
        # The first 8 might be columns, or just part of the row.
        # But we know the *set* of items forms the key.
        # And the ORDER of items in the line corresponds to the columns:
        # 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L
        
        # User format:
        # No. Col1...Col8  1A 1B 1D 1E 1G 1I 1K 1L
        # The row has 1A...1L columns at the END.
        # So we take the LAST 8 matches.
        
        matches = items[-8:]
        key = "".join(sorted(matches))
        
        obj = {}
        for i, k in enumerate(keys):
            obj[k] = "3" + matches[i]
        
        lookup[key] = obj

    print("window.BRACKET_LOOKUP = " + json.dumps(lookup) + ";")

if __name__ == '__main__':
    parse()
