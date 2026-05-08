"""
render.py — Read kids/hub/data/*.json and write kids/hub/index.html.
"""

import json
from datetime import date, datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT = Path(__file__).parent.parent / "index.html"

TODAY = date.today()

CHILD_COLORS = {
    "Ballard": ("sky",   "#2A5D8C", "#E3EEF7"),
    "Elle":    ("plum",  "#6B3FA0", "#F0EBF8"),
    "Edie":    ("spruce","#2E5C3E", "#E4F0E8"),
    "All":     ("amber", "#8A5A00", "#FDF3E0"),
}

SUBJECT_COLORS = {
    "Math":          "plum",
    "Reading":       "sky",
    "Science":       "spruce",
    "Social Studies":"teal",
    "Art":           "rust",
    "Music":         "amber",
    "PE":            "green",
    "Other":         "bark",
}


def load(filename: str) -> list:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    return json.loads(path.read_text())


def parse_date(d: str | None) -> date | None:
    if not d:
        return None
    try:
        return date.fromisoformat(d)
    except ValueError:
        return None


def fmt_date(d: str | None) -> str:
    dt = parse_date(d)
    if not dt:
        return ""
    return dt.strftime("%b %-d")


def child_tag(child: str, size: str = "sm") -> str:
    style_key = child if child in CHILD_COLORS else "All"
    _, fg, bg = CHILD_COLORS[style_key]
    fs = "11px" if size == "sm" else "12px"
    return (f'<span class="ctag" style="background:{bg};color:{fg};font-size:{fs}">'
            f'{child}</span>')


def accent_color(child: str) -> str:
    _, fg, _ = CHILD_COLORS.get(child, CHILD_COLORS["All"])
    return fg


def events_html(events: list) -> str:
    future = [e for e in events if (parse_date(e.get("date")) or date.max) >= TODAY]
    future.sort(key=lambda e: e.get("date") or "9999")
    if not future:
        return '<p class="empty">No upcoming events.</p>'

    # Group by month
    groups: dict[str, list] = {}
    for e in future:
        dt = parse_date(e.get("date"))
        label = dt.strftime("%B %-d") if dt else "Date TBD"
        month = dt.strftime("%B %Y") if dt else "TBD"
        groups.setdefault(month, []).append((label, e))

    rows = []
    for month, items in groups.items():
        rows.append(f'<div class="cal-mo">{month}</div><div class="cal-list">')
        for label, e in items:
            dt = parse_date(e.get("date"))
            child = e.get("child", "All")
            color = accent_color(child)
            wday = dt.strftime("%a").upper() if dt else "TBD"
            day  = dt.strftime("%-d") if dt else "?"
            time_str = e.get("time") or ""
            info = e.get("description", "")
            if time_str:
                info = f'{time_str} · {info}'
            rows.append(f"""
      <div class="cal-row" style="border-left:3px solid {color}"
           data-child="{child}" data-text="{_esc(e.get('title',''))} {_esc(info)}">
        <div class="cal-date">
          <div class="cal-wday">{wday}</div>
          <div class="cal-d" style="color:{color}">{day}</div>
        </div>
        <div>
          <div class="cal-name">{_esc(e.get('title',''))}</div>
          <div class="cal-info">{_esc(info)}</div>
          <div class="cal-tags">{child_tag(child)}</div>
        </div>
      </div>""")
        rows.append('</div>')
    return "\n".join(rows)


def tasks_html(tasks: list) -> str:
    active = [t for t in tasks if not t.get("completed")]
    active.sort(key=lambda t: t.get("due_date") or "9999")
    if not active:
        return '<p class="empty">No open tasks.</p>'
    rows = []
    for t in active:
        child = t.get("child", "All")
        color = accent_color(child)
        due = fmt_date(t.get("due_date"))
        dt = parse_date(t.get("due_date"))
        urgent = dt and dt <= TODAY
        rows.append(f"""
    <div class="task-row {'task-urgent' if urgent else ''}"
         data-child="{child}" data-text="{_esc(t.get('title',''))} {_esc(t.get('description',''))}">
      <div class="task-bar" style="background:{color}"></div>
      <div class="task-body">
        <div class="task-head">
          {child_tag(child)}
          {'<span class="due-badge urgent">Due ' + due + '</span>' if urgent and due else ('<span class="due-badge">' + due + '</span>' if due else '')}
        </div>
        <div class="task-title">{_esc(t.get('title',''))}</div>
        <div class="task-desc">{_esc(t.get('description',''))}</div>
      </div>
    </div>""")
    return "\n".join(rows)


def curriculum_html(curriculum: list) -> str:
    if not curriculum:
        return '<p class="empty">No curriculum updates.</p>'
    rows = []
    for c in curriculum:
        child = c.get("child", "All")
        subject = c.get("subject", "Other")
        color_cls = SUBJECT_COLORS.get(subject, "bark")
        rows.append(f"""
    <div class="card"
         data-child="{child}" data-text="{_esc(c.get('topic',''))} {_esc(c.get('description',''))}">
      <div class="slbl c-{color_cls}"><span class="sdot"></span>{subject}</div>
      <div class="stopic">{_esc(c.get('topic',''))}</div>
      <div class="sdetail">{_esc(c.get('description',''))}</div>
      <div style="margin-top:8px">{child_tag(child)}</div>
    </div>""")
    return "\n".join(rows)


def _esc(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;")
             .replace(">", "&gt;").replace('"', "&quot;"))


def render():
    events     = load("events.json")
    tasks      = load("tasks.json")
    curriculum = load("curriculum.json")
    updated    = datetime.now(timezone.utc).strftime("%B %-d, %Y · %-I:%M %p UTC")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kids Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --cream: #FAF7F2;
      --bark: #3D2B1F;
      --bark-light: #6B4C38;
      --spruce: #2E5C3E;
      --spruce-pale: #E4F0E8;
      --sun: #E8A020;
      --sun-pale: #FDF3E0;
      --rust: #C04B2A;
      --rust-pale: #FAEAE5;
      --sky: #2A5D8C;
      --sky-pale: #E3EEF7;
      --plum: #6B3FA0;
      --plum-pale: #F0EBF8;
      --teal: #1A6A7A;
      --teal-pale: #E2F3F6;
      --border: rgba(61,43,31,0.12);
    }}
    body {{ font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--bark); font-size: 15px; line-height: 1.65; }}
    .page {{ max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }}

    /* Header */
    .site-header {{ padding: 2.5rem 0 1.5rem; border-bottom: 1.5px solid var(--border); margin-bottom: 1.5rem; }}
    .eyebrow {{ font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spruce); margin-bottom: 0.4rem; }}
    h1 {{ font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 600; color: var(--bark); line-height: 1.15; }}
    .updated {{ font-size: 12px; color: var(--bark-light); font-weight: 300; margin-top: 0.3rem; }}

    /* Controls */
    .controls {{ display: flex; gap: 12px; margin-bottom: 2rem; flex-wrap: wrap; align-items: center; }}
    .search-wrap {{ position: relative; flex: 1; min-width: 200px; max-width: 360px; }}
    .search-wrap svg {{ position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--bark-light); pointer-events: none; }}
    #search {{ width: 100%; padding: 8px 12px 8px 34px; border: 1px solid var(--border); border-radius: 8px; background: white; font-family: inherit; font-size: 13px; color: var(--bark); outline: none; }}
    #search:focus {{ border-color: var(--sky); }}
    .filter-pills {{ display: flex; gap: 6px; flex-wrap: wrap; }}
    .fpill {{ font-size: 12px; font-weight: 500; padding: 5px 14px; border-radius: 20px; border: 1px solid var(--border); background: white; color: var(--bark-light); cursor: pointer; transition: all 0.15s; }}
    .fpill.active {{ border-color: transparent; color: white; }}
    .fpill[data-child="All"].active    {{ background: #8A5A00; }}
    .fpill[data-child="Ballard"].active {{ background: var(--sky); }}
    .fpill[data-child="Elle"].active   {{ background: var(--plum); }}
    .fpill[data-child="Edie"].active   {{ background: var(--spruce); }}

    /* Layout */
    .cols {{ display: grid; grid-template-columns: 1.1fr 0.9fr 1fr; gap: 2rem; align-items: start; }}
    @media (max-width: 860px) {{ .cols {{ grid-template-columns: 1fr; }} }}

    .section-title {{ font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 600; margin-bottom: 1.2rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border); }}
    .empty {{ color: var(--bark-light); font-size: 13px; font-style: italic; }}

    /* Calendar events */
    .cal-mo {{ font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bark-light); margin: 0 0 0.5rem 2px; margin-top: 1rem; }}
    .cal-mo:first-child {{ margin-top: 0; }}
    .cal-list {{ display: flex; flex-direction: column; gap: 8px; margin-bottom: 0.5rem; }}
    .cal-row {{ display: grid; grid-template-columns: 48px 1fr; gap: 10px; background: white; border: 0.5px solid var(--border); border-radius: 10px; padding: 0.7rem 0.85rem; border-left-width: 3px; }}
    .cal-date {{ text-align: center; }}
    .cal-wday {{ font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--bark-light); }}
    .cal-d {{ font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 600; line-height: 1; }}
    .cal-name {{ font-size: 13px; font-weight: 500; color: var(--bark); margin-bottom: 2px; line-height: 1.4; }}
    .cal-info {{ font-size: 11.5px; color: var(--bark-light); font-weight: 300; line-height: 1.4; margin-bottom: 5px; }}
    .cal-tags {{ display: flex; gap: 4px; flex-wrap: wrap; }}

    /* Tasks */
    .task-row {{ display: flex; background: white; border: 0.5px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 8px; }}
    .task-row.task-urgent {{ border-color: rgba(192,75,42,0.3); }}
    .task-bar {{ width: 4px; flex-shrink: 0; }}
    .task-body {{ padding: 0.75rem 0.9rem; flex: 1; }}
    .task-head {{ display: flex; align-items: center; gap: 7px; margin-bottom: 4px; flex-wrap: wrap; }}
    .task-title {{ font-size: 13px; font-weight: 500; color: var(--bark); margin-bottom: 3px; line-height: 1.4; }}
    .task-desc {{ font-size: 11.5px; color: var(--bark-light); font-weight: 300; line-height: 1.5; }}
    .due-badge {{ font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 10px; background: var(--sun-pale); color: #8A5A00; }}
    .due-badge.urgent {{ background: var(--rust-pale); color: var(--rust); }}

    /* Curriculum cards */
    .card {{ background: white; border: 0.5px solid var(--border); border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 10px; }}
    .slbl {{ font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }}
    .sdot {{ width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }}
    .c-plum   {{ color: var(--plum); }}   .c-plum .sdot   {{ background: var(--plum); }}
    .c-sky    {{ color: var(--sky); }}    .c-sky .sdot    {{ background: var(--sky); }}
    .c-spruce {{ color: var(--spruce); }} .c-spruce .sdot {{ background: var(--spruce); }}
    .c-teal   {{ color: var(--teal); }}   .c-teal .sdot   {{ background: var(--teal); }}
    .c-rust   {{ color: var(--rust); }}   .c-rust .sdot   {{ background: var(--rust); }}
    .c-amber  {{ color: #8A5A00; }}       .c-amber .sdot  {{ background: var(--sun); }}
    .c-green  {{ color: #3A6820; }}       .c-green .sdot  {{ background: #3A6820; }}
    .c-bark   {{ color: var(--bark-light); }} .c-bark .sdot {{ background: var(--bark-light); }}
    .stopic  {{ font-size: 13px; font-weight: 500; color: var(--bark); margin-bottom: 3px; }}
    .sdetail {{ font-size: 12px; color: var(--bark-light); font-weight: 300; line-height: 1.5; }}

    /* Child tag */
    .ctag {{ font-size: 11px; font-weight: 500; padding: 2px 9px; border-radius: 20px; }}

    /* Hidden */
    .hidden {{ display: none !important; }}

    footer {{ margin-top: 3rem; padding-top: 1.2rem; border-top: 1px solid var(--border); font-size: 11px; color: var(--bark-light); font-weight: 300; }}

    @keyframes fu {{ from {{ opacity:0; transform:translateY(8px); }} to {{ opacity:1; transform:translateY(0); }} }}
    .site-header {{ animation: fu 0.35s ease both; }}
    .controls {{ animation: fu 0.4s ease both; }}
    .cols {{ animation: fu 0.45s ease both; }}
  </style>
</head>
<body>
<div class="page">

  <header class="site-header">
    <div class="eyebrow">Konigsmark Family · School Hub</div>
    <h1>Kids Hub</h1>
    <p class="updated">Updated {updated}</p>
  </header>

  <div class="controls">
    <div class="search-wrap">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="search" type="search" placeholder="Search events, tasks, topics…">
    </div>
    <div class="filter-pills">
      <button class="fpill active" data-child="All">All kids</button>
      <button class="fpill" data-child="Ballard">Ballard</button>
      <button class="fpill" data-child="Elle">Elle</button>
      <button class="fpill" data-child="Edie">Edie</button>
    </div>
  </div>

  <div class="cols">
    <section>
      <div class="section-title">Events</div>
      {events_html(events)}
    </section>
    <section>
      <div class="section-title">Tasks</div>
      {tasks_html(tasks)}
    </section>
    <section>
      <div class="section-title">Curriculum</div>
      {curriculum_html(curriculum)}
    </section>
  </div>

  <footer>Burnmark Productions · compiled from school emails · runs twice daily</footer>
</div>

<script>
  const searchEl = document.getElementById('search');
  const pills = document.querySelectorAll('.fpill');
  let activeChild = 'All';

  function applyFilters() {{
    const q = searchEl.value.trim().toLowerCase();
    document.querySelectorAll('[data-child]').forEach(el => {{
      const childMatch = activeChild === 'All' || el.dataset.child === activeChild || el.dataset.child === 'All';
      const textMatch  = !q || (el.dataset.text || el.textContent).toLowerCase().includes(q);
      el.classList.toggle('hidden', !(childMatch && textMatch));
    }});
  }}

  searchEl.addEventListener('input', applyFilters);

  pills.forEach(p => {{
    p.addEventListener('click', () => {{
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      activeChild = p.dataset.child;
      applyFilters();
    }});
  }});
</script>
</body>
</html>
"""
    OUTPUT.write_text(html)
    print(f"Rendered {OUTPUT}")


if __name__ == "__main__":
    render()
