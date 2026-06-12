#!/usr/bin/env python3
"""Generate multi-page PDF awards from CSV data."""

import csv
import os
import ssl
import tempfile
from io import BytesIO
from urllib.request import urlopen
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase.pdfmetrics import stringWidth, registerFont
from reportlab.pdfbase.ttfonts import TTFont

# Configuration
TEAM_NAME = "Rockies"
LEAGUE = "Downtown Little League"
DIVISION = "JM7"
COACHES = [
    "Warren Konigsmark",
    "Joe Bernstein",
    "Sloan Sutta",
    "Andrew Marbach",
    "Rich Soto",
    "Eric Stodola"
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(SCRIPT_DIR, "awards-table.csv")
PENNANT_PATH = os.path.join(SCRIPT_DIR, "rockies-pennant.png")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "awards-output.pdf")

# Try to register Garamond font, fall back to Times-Roman if not available
SERIF_FONT = "Times-Roman"
SERIF_FONT_BOLD = "Times-Bold"
try:
    # Try common macOS font paths
    garamond_paths = [
        "/Library/Fonts/Garamond.ttf",
        "/System/Library/Fonts/Garamond.ttf",
        os.path.expanduser("~/Library/Fonts/Garamond.ttf")
    ]
    for path in garamond_paths:
        if os.path.exists(path):
            registerFont(TTFont("Garamond", path))
            SERIF_FONT = "Garamond"
            SERIF_FONT_BOLD = "Garamond"
            break
except Exception:
    pass  # Fall back to Times-Roman


def wrap_text_full_width(text, font_name, font_size, max_width):
    """
    Wrap text to fit within max_width, keeping names/words intact.
    Returns list of lines.
    """
    items = text.split(" – ")  # Split by separator
    lines = []
    current_line = []

    for item in items:
        # Calculate width if we add this item
        test_line = current_line + [item]
        test_text = " – ".join(test_line)
        test_width = stringWidth(test_text, font_name, font_size)

        if test_width <= max_width:
            current_line.append(item)
        else:
            # Current line is full, save it and start new line
            if current_line:
                lines.append(" – ".join(current_line))
            current_line = [item]

    # Add any remaining items
    if current_line:
        lines.append(" – ".join(current_line))

    return lines


def load_image_from_url(url):
    """Load an image from URL at full resolution and save to temp file."""
    try:
        # Bypass SSL verification for eBay URLs
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        response = urlopen(url, timeout=5, context=ssl_context)
        img = Image.open(BytesIO(response.read()))
        img.load()

        # Save to temp file at full resolution (high quality)
        temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        img.save(temp_file.name, 'PNG', quality=95)
        return temp_file.name
    except Exception as e:
        print(f"Warning: Could not load image from {url}: {e}")
        return None


def load_pennant(pennant_path):
    """Load the team pennant image at full resolution and save to temp file."""
    try:
        img = Image.open(pennant_path)

        # Save to temp file at full resolution (high quality)
        temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        img.save(temp_file.name, 'PNG', quality=95)
        return temp_file.name
    except Exception as e:
        print(f"Warning: Could not load pennant from {pennant_path}: {e}")
        return None


def create_award_page(pdf_canvas, player_name, award_text, img_url, pennant_img_path, all_players, page_num):
    """Create a single award page."""
    width, height = letter

    # Set up canvas
    pdf_canvas.setPageSize(letter)

    # Decorative pennants at top (left and right) - larger
    pennant_size = 1.3 * inch
    if pennant_img_path:
        # Left pennant
        pdf_canvas.drawImage(pennant_img_path, 0.3*inch, height - 1.5*inch,
                           width=pennant_size, height=pennant_size, preserveAspectRatio=True)
        # Right pennant
        pdf_canvas.drawImage(pennant_img_path, width - 1.6*inch, height - 1.5*inch,
                           width=pennant_size, height=pennant_size, preserveAspectRatio=True)

    # Player name (large, centered)
    pdf_canvas.setFont("Helvetica-Bold", 36)
    pdf_canvas.drawCentredString(width/2, height - 1.6*inch, player_name)

    # Team/League info
    y_pos = height - 2.0*inch
    pdf_canvas.setFont("Helvetica-Bold", 20)
    pdf_canvas.drawCentredString(width/2, y_pos, TEAM_NAME)
    y_pos -= 0.35*inch
    pdf_canvas.setFont("Helvetica", 12)
    pdf_canvas.drawCentredString(width/2, y_pos, LEAGUE)
    y_pos -= 0.22*inch
    pdf_canvas.drawCentredString(width/2, y_pos, f"{DIVISION} Division")

    # Full award text
    y_pos -= 0.4*inch
    pdf_canvas.setFont("Helvetica-BoldOblique", 14)
    pdf_canvas.drawCentredString(width/2, y_pos, award_text)

    # Player image (centered) - fixed size for consistency
    y_pos = height - 3.5*inch
    display_width = 2.3*inch
    display_height = 3.2*inch

    if img_url:
        player_img_path = load_image_from_url(img_url)
        if player_img_path:
            x = (width - display_width) / 2
            y_pos = height - 3.5*inch - display_height

            pdf_canvas.drawImage(player_img_path, x, y_pos,
                               width=display_width, height=display_height,
                               preserveAspectRatio=True)
            y_pos -= 0.5*inch
    else:
        y_pos -= 0.7*inch

    y_pos -= 0.3*inch

    # Roster
    pdf_canvas.setFont("Helvetica-Bold", 12)
    pdf_canvas.drawCentredString(width/2, y_pos, "Roster:")
    y_pos -= 0.26*inch

    pdf_canvas.setFont(SERIF_FONT, 12)
    roster_text = " – ".join(all_players)
    available_width = width - 1.0*inch  # 0.5 inch margins on each side

    # Wrap roster intelligently
    roster_lines = wrap_text_full_width(roster_text, SERIF_FONT, 12, available_width)
    for line in roster_lines:
        pdf_canvas.drawCentredString(width/2, y_pos, line)
        y_pos -= 0.20*inch

    y_pos -= 0.15*inch

    # Coaches
    pdf_canvas.setFont("Helvetica-Bold", 12)
    pdf_canvas.drawCentredString(width/2, y_pos, "Coaches:")
    y_pos -= 0.26*inch

    pdf_canvas.setFont(SERIF_FONT, 12)
    coaches_text = " – ".join(COACHES)

    # Wrap coaches intelligently
    coaches_lines = wrap_text_full_width(coaches_text, SERIF_FONT, 12, available_width)
    for line in coaches_lines:
        pdf_canvas.drawCentredString(width/2, y_pos, line)
        y_pos -= 0.20*inch

    pdf_canvas.showPage()


def main():
    """Main function to generate awards PDF."""
    print(f"Reading CSV from: {CSV_PATH}")

    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    # Load pennant once
    pennant_img = load_pennant(PENNANT_PATH)

    # Read CSV and separate players with/without awards
    players_with_awards = []
    all_players = []
    with open(CSV_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip empty rows
            player_name = row.get('Player', '').strip()
            if not player_name:
                continue

            # Stop reading when we hit the Coaches section
            if player_name == 'Coaches':
                break

            award_person = row.get('Award Person', '').strip()
            award_title = row.get('Award', '').strip()
            award_text = row.get('Text', '').strip()
            img_url = row.get('img url', '').strip()

            # Add to all_players roster
            all_players.append(player_name)

            # Only include players with awards for the PDF pages
            if award_person and award_title:
                players_with_awards.append({
                    'name': player_name,
                    'award_person': award_person,
                    'award_title': award_title,
                    'award_text': award_text,
                    'img_url': img_url
                })

    if not players_with_awards:
        print("No players with complete award information found!")
        return

    print(f"Found {len(players_with_awards)} player(s) with awards")
    print(f"Total roster: {len(all_players)} player(s)")

    # Create PDF with reportlab
    from reportlab.pdfgen import canvas as rl_canvas

    pdf = rl_canvas.Canvas(OUTPUT_PATH, pagesize=letter)

    for page_num, player in enumerate(players_with_awards, 1):
        print(f"  Adding page {page_num}: {player['name']}")
        create_award_page(
            pdf,
            player['name'],
            player['award_text'],
            player['img_url'],
            pennant_img,
            all_players,
            page_num
        )

    pdf.save()
    print(f"\n✓ PDF saved to: {OUTPUT_PATH}")
    print(f"  Total pages: {len(players_with_awards)}")


if __name__ == "__main__":
    main()
