# Brewers Awards Generator

## Overview
Generates a multi-page PDF with one award certificate per player. Each page includes the player's name, award name, award text, player card image, team info, and coaches list.

## Setup
The script uses Python with `reportlab` and `pillow`. Install if needed:
```bash
pip install reportlab pillow
```

## Usage

1. **Fill out the CSV** at `awards-table.csv`:
   - `Player`: Player name
   - `img url`: URL to player card image (optional—script skips if empty)
   - `Award Person`: Name of the person the award is named after (e.g., "Shohei Ohtani")
   - `Award`: Award category (e.g., "Baseball Excellence")
   - `Text` & `img`: Leave empty (legacy columns)

2. **Run the generator**:
   ```bash
   python3 generate_awards.py
   ```

3. **Output**: `awards-output.pdf` is created with one page per player with filled-in award data.

## Hardcoded Settings
The following are set in the script and consistent across all pages:
- Team: **Brewers**
- League: **Downtown Little League**
- Division: **Rookies 5**
- Coaches: Warren Konigsmark, Joe Bernstein, Sloan Sutta, Scott Secor, Brendan Ward

To change these, edit the `TEAM_NAME`, `LEAGUE`, `DIVISION`, and `COACHES` variables in `generate_awards.py`.

## Example CSV Row
```
Mateo Izen,https://i.ebayimg.com/images/g/-O8AAeSwN-lp2-FM/s-l1600.webp,Shohei Ohtani,Baseball Excellence
```
→ Generates: "The Shohei Ohtani for Outstanding Baseball Excellence"

## Notes
- Player images are downloaded from the provided URLs and embedded in the PDF
- If an image URL fails to load, the page is generated without the player image (no error)
- The Brewers pennant (`brewers-pennant.png`) is used as a decorative element at the top of each page
- Only players with both `Award Person` and `Award` filled in are included in the PDF
