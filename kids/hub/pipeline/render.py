"""
render.py — Read kids/hub/data/*.json and write kids/hub/index.html.
Run after scan.py.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT = Path(__file__).parent.parent / "index.html"

KIDS = ["Ballard", "Elle", "Edie", "All"]
KID_COLORS = {
    "Ballard": "#4f7be8",
    "Elle": "#e84f9b",
    "Edie": "#4fe8a0",
    "All": "#888",
}


def load(filename: str) -> list:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    return json.loads(path.read_text())


def badge(child: str) -> str:
    color = KID_COLORS.get(child, "#888")
    return f'<span class="badge" style="background:{color}">{child}</span>'


def format_date(d: str | None) -> str:
    if not d:
        return ""
    try:
        dt = datetime.fromisoformat(d)
        return dt.strftime("%b %-d")
    except ValueError:
        return d


def events_html(events: list) -> str:
    if not events:
        return "<p class='empty'>No upcoming events.</p>"
    # Sort by date, nulls last
    events = sorted(events, key=lambda e: e.get("date") or "9999")
    rows = []
    for e in events:
        rows.append(f"""
      <div class="card">
        <div class="card-head">
          {badge(e.get('child', 'All'))}
          <span class="date">{format_date(e.get('date'))}{' ' + (e.get('time') or '') if e.get('time') else ''}</span>
        </div>
        <h3>{e.get('title', '')}</h3>
        <p>{e.get('description', '')}</p>
      </div>""")
    return "\n".join(rows)


def tasks_html(tasks: list) -> str:
    if not tasks:
        return "<p class='empty'>No tasks.</p>"
    tasks = sorted(tasks, key=lambda t: t.get("due_date") or "9999")
    rows = []
    for t in tasks:
        done_class = " done" if t.get("completed") else ""
        rows.append(f"""
      <div class="card{done_class}">
        <div class="card-head">
          {badge(t.get('child', 'All'))}
          <span class="date">{format_date(t.get('due_date'))}</span>
        </div>
        <h3>{t.get('title', '')}</h3>
        <p>{t.get('description', '')}</p>
      </div>""")
    return "\n".join(rows)


def curriculum_html(curriculum: list) -> str:
    if not curriculum:
        return "<p class='empty'>No curriculum updates.</p>"
    rows = []
    for c in curriculum:
        rows.append(f"""
      <div class="card">
        <div class="card-head">
          {badge(c.get('child', 'All'))}
          <span class="subject-tag">{c.get('subject', '')}</span>
        </div>
        <h3>{c.get('topic', '')}</h3>
        <p>{c.get('description', '')}</p>
      </div>""")
    return "\n".join(rows)


def render():
    events = load("events.json")
    tasks = load("tasks.json")
    curriculum = load("curriculum.json")
    updated = datetime.now(timezone.utc).strftime("%b %-d, %Y at %-I:%M %p UTC")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kids Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      font-family: 'Outfit', sans-serif;
      background: #0d0d0d;
      color: #e8e8e8;
      margin: 0;
      padding: 2rem 1rem;
    }}
    header {{
      text-align: center;
      margin-bottom: 2.5rem;
    }}
    header h1 {{ font-size: 2.4rem; font-weight: 800; margin: 0; }}
    header p.updated {{ font-size: 0.8rem; color: #666; margin-top: 0.4rem; }}
    .sections {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }}
    section h2 {{
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #aaa;
      border-bottom: 1px solid #222;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }}
    .card {{
      background: #161616;
      border: 1px solid #222;
      border-radius: 10px;
      padding: 1rem 1.2rem;
      margin-bottom: 0.75rem;
    }}
    .card.done {{ opacity: 0.45; }}
    .card h3 {{ margin: 0.3rem 0 0.4rem; font-size: 1rem; font-weight: 600; }}
    .card p {{ margin: 0; font-size: 0.85rem; color: #aaa; line-height: 1.5; }}
    .card-head {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.2rem;
    }}
    .badge {{
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 99px;
      color: #fff;
    }}
    .date {{ font-size: 0.78rem; color: #777; margin-left: auto; }}
    .subject-tag {{
      font-size: 0.7rem;
      color: #888;
      border: 1px solid #333;
      padding: 1px 7px;
      border-radius: 5px;
    }}
    .empty {{ color: #444; font-size: 0.85rem; font-style: italic; }}
  </style>
</head>
<body>
  <header>
    <h1>Kids Hub</h1>
    <p class="updated">Updated {updated}</p>
  </header>
  <div class="sections">
    <section>
      <h2>Events</h2>
      {events_html(events)}
    </section>
    <section>
      <h2>Tasks</h2>
      {tasks_html(tasks)}
    </section>
    <section>
      <h2>Curriculum</h2>
      {curriculum_html(curriculum)}
    </section>
  </div>
</body>
</html>
"""
    OUTPUT.write_text(html)
    print(f"Rendered {OUTPUT}")


if __name__ == "__main__":
    render()
