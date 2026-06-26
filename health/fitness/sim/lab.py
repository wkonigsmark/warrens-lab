#!/usr/bin/env python3
"""
Fitness ML Lab — analyzes simulation data and trains the recovery recommender.

Usage:
  python lab.py                      # full report on all runs
  python lab.py --persona vigilant   # focus on one persona
  python lab.py --train              # train + evaluate ML model
  python lab.py --plot               # save PNG charts (requires matplotlib)
  python lab.py --compare            # side-by-side persona comparison
"""

import sqlite3
import json
import argparse
import os
from datetime import datetime
from collections import defaultdict

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fitness_sim.db')

RECOVERY_HOURS = {
    'chest': 60, 'shoulders': 48, 'triceps': 48,
    'back':  60, 'biceps':    48,
    'quads': 72, 'hamstrings': 72, 'glutes': 72, 'calves': 48,
}
ALL_MUSCLES = list(RECOVERY_HOURS.keys())

WORKOUT_MUSCLES = {
    'db-push':  ['chest', 'shoulders', 'triceps'],
    'db-lower': ['quads', 'hamstrings', 'glutes', 'calves'],
    'db-pull':  ['back', 'biceps'],
    'db-upper': ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
}

BAR_WIDTH = 30


# ── Formatting helpers ────────────────────────────────────────────────────────

def bar(value, max_val=1.0, width=BAR_WIDTH, char='█'):
    filled = int(round(value / max_val * width))
    return char * filled + '░' * (width - filled)

def fmt_pct(v): return f'{v:.1f}%'
def fmt_lbs(v): return f'+{v:.1f} lbs'

def divider(title='', width=60):
    if title:
        pad = (width - len(title) - 2) // 2
        print('─' * pad + f' {title} ' + '─' * pad)
    else:
        print('─' * width)


# ── Data loading ──────────────────────────────────────────────────────────────

def get_conn():
    if not os.path.exists(DB_PATH):
        print(f'ERROR: No database at {DB_PATH}')
        print('Run `python simulate.py` first.')
        exit(1)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def load_runs(conn, persona=None):
    q = 'SELECT * FROM sim_runs'
    params = []
    if persona:
        q += ' WHERE persona = ?'
        params.append(persona)
    q += ' ORDER BY created_at DESC'
    return conn.execute(q, params).fetchall()


def load_sessions(conn, run_id):
    return conn.execute(
        'SELECT * FROM sim_sessions WHERE run_id = ? ORDER BY started_at',
        (run_id,)
    ).fetchall()


def load_exercise_logs(conn, run_id):
    return conn.execute(
        'SELECT * FROM sim_exercise_logs WHERE run_id = ? ORDER BY created_at',
        (run_id,)
    ).fetchall()


# ── Analysis functions ────────────────────────────────────────────────────────

def persona_stats(sessions, ex_logs):
    """Compute summary stats for one simulation run."""
    if not sessions:
        return {}

    total = len(sessions)
    avg_completion = sum(s['completion_pct'] for s in sessions) / total

    # Sessions per week
    start = datetime.fromisoformat(sessions[0]['started_at'])
    end   = datetime.fromisoformat(sessions[-1]['started_at'])
    weeks = max((end - start).days / 7, 1)
    sessions_per_week = total / weeks

    # Weight progression per exercise (first vs last)
    exercise_weights = defaultdict(list)
    for log in ex_logs:
        exercise_weights[log['exercise_id']].append(log['weight_lbs'])

    weight_gains = {}
    for eid, ws in exercise_weights.items():
        if len(ws) >= 2:
            weight_gains[eid] = ws[-1] - ws[0]

    # Workout type distribution
    type_counts = defaultdict(int)
    for s in sessions:
        type_counts[s['workout_id']] += 1

    return {
        'total_sessions':    total,
        'avg_completion':    avg_completion,
        'sessions_per_week': sessions_per_week,
        'weeks':             weeks,
        'weight_gains':      weight_gains,
        'type_counts':       type_counts,
    }


def recovery_scheduling_quality(sessions):
    """
    For each session, compute readiness of primary muscle groups at workout time.
    Returns dict: {muscle: avg_readiness_when_scheduled}
    """
    muscle_last = {}
    muscle_readiness_at_schedule = defaultdict(list)

    for s in sessions:
        wid = s['workout_id']
        t = datetime.fromisoformat(s['started_at'])
        muscles = WORKOUT_MUSCLES.get(wid, [])

        for m in muscles:
            if m in muscle_last:
                hours = (t - muscle_last[m]).total_seconds() / 3600
                readiness = min(1.0, hours / RECOVERY_HOURS[m])
            else:
                readiness = 1.0
            muscle_readiness_at_schedule[m].append(readiness)
            muscle_last[m] = t

    return {
        m: sum(vals) / len(vals)
        for m, vals in muscle_readiness_at_schedule.items()
    }


def build_feature_matrix(sessions):
    """
    Build (X, y) for ML training.
    Features: readiness score per muscle just before session + day of week + sessions this week.
    Target: workout_id (categorical).
    """
    muscle_last = {}
    sessions_this_week = defaultdict(int)
    X, y = [], []

    for s in sessions:
        t = datetime.fromisoformat(s['started_at'])
        wid = s['workout_id']
        week_key = f'{t.isocalendar()[0]}-{t.isocalendar()[1]}'

        features = [
            min(1.0, (t - muscle_last[m]).total_seconds() / 3600 / RECOVERY_HOURS[m])
            if m in muscle_last else 1.0
            for m in ALL_MUSCLES
        ]
        features.append(t.weekday())                        # 0=Mon … 6=Sun
        features.append(min(sessions_this_week[week_key], 7))

        X.append(features)
        y.append(wid)

        for m in WORKOUT_MUSCLES.get(wid, []):
            muscle_last[m] = t
        sessions_this_week[week_key] += 1

    return X, y


# ── Report sections ───────────────────────────────────────────────────────────

def print_runs_table(runs):
    divider('SIMULATION RUNS IN DATABASE')
    print(f'  {"Run ID":10}  {"Persona":12}  {"Weeks":5}  {"Sessions":>8}  {"Created":12}')
    divider()
    conn = get_conn()
    for r in runs:
        count = conn.execute(
            'SELECT COUNT(*) FROM sim_sessions WHERE run_id = ?', (r['id'],)
        ).fetchone()[0]
        created = r['created_at'][:10]
        print(f'  {r["id"][:8]:10}  {r["persona"]:12}  {r["weeks"]:5}  {count:8}  {created:12}')
        print(f'  {"":10}  {r["description"]}')
        print()
    conn.close()


def print_persona_summary(persona_name, stats, quality):
    divider(persona_name.upper())
    print(f'  Sessions total:     {stats["total_sessions"]}')
    print(f'  Sessions / week:    {stats["sessions_per_week"]:.1f}  (over {stats["weeks"]:.0f} weeks)')
    print(f'  Avg completion:     {fmt_pct(stats["avg_completion"])}')

    print()
    print('  Workout mix:')
    total = stats['total_sessions']
    for wid, cnt in sorted(stats['type_counts'].items(), key=lambda x: -x[1]):
        pct = cnt / total
        print(f'    {wid:12}  {bar(pct, 1.0, 20)}  {cnt:3d} sessions ({pct:.0%})')

    print()
    print('  Recovery quality (avg readiness when muscle group was scheduled):')
    for m in ALL_MUSCLES:
        if m in quality:
            r = quality[m]
            flag = '✓' if r >= 0.80 else '⚠'
            print(f'    {m:12}  {bar(r, 1.0, 20)}  {r:.0%}  {flag}')

    if stats['weight_gains']:
        print()
        print('  Weight progression (first → last session):')
        for eid, gain in sorted(stats['weight_gains'].items(), key=lambda x: -x[1])[:5]:
            label = '+' if gain >= 0 else ''
            print(f'    {eid:25}  {label}{gain:.1f} lbs')


def print_comparison_table(all_stats):
    divider('PERSONA COMPARISON')
    cols = ['Persona', 'Sessions', 'Sess/wk', 'Avg Compl%', 'Avg Readiness']
    print(f'  {cols[0]:12}  {cols[1]:8}  {cols[2]:8}  {cols[3]:10}  {cols[4]:12}')
    divider()
    for persona, (stats, quality) in all_stats.items():
        avg_readiness = sum(quality.values()) / len(quality) if quality else 0
        print(
            f'  {persona:12}  {stats["total_sessions"]:8}  '
            f'{stats["sessions_per_week"]:8.1f}  '
            f'{fmt_pct(stats["avg_completion"]):10}  '
            f'{avg_readiness:.0%}'
        )


def print_ml_results(persona_name, X, y):
    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score, confusion_matrix
    except ImportError:
        print('  scikit-learn not installed. Run: pip install scikit-learn')
        print('  Skipping ML training.')
        return

    if len(X) < 20:
        print('  Not enough sessions for training (need 20+). Generate more data.')
        return

    labels = sorted(set(y))
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    train_acc = accuracy_score(y_train, clf.predict(X_train))
    test_acc  = accuracy_score(y_test,  clf.predict(X_test))

    divider(f'ML MODEL — {persona_name.upper()}')
    print(f'  Features: {len(ALL_MUSCLES)} muscle readiness scores + day_of_week + sessions_this_week')
    print(f'  Target:   next workout type ({len(labels)} classes: {", ".join(labels)})')
    print(f'  Train/test split: {len(X_train)}/{len(X_test)} sessions (80/20 by time)')
    print()
    print(f'  Train accuracy:  {train_acc:.1%}')
    print(f'  Test accuracy:   {test_acc:.1%}')

    print()
    print('  Feature importances:')
    feature_names = ALL_MUSCLES + ['day_of_week', 'sessions_this_week']
    importances = list(zip(feature_names, clf.feature_importances_))
    for name, imp in sorted(importances, key=lambda x: -x[1]):
        print(f'    {name:22}  {bar(imp, max(clf.feature_importances_), 20)}  {imp:.3f}')

    print()
    print('  Confusion matrix (rows = actual, cols = predicted):')
    cm = confusion_matrix(y_test, clf.predict(X_test), labels=labels)
    header = '  ' + ' ' * 14 + '  '.join(f'{l:8}' for l in labels)
    print(header)
    for label, row in zip(labels, cm):
        print(f'  {label:12}  ' + '  '.join(f'{v:8}' for v in row))


def save_plots(runs_data):
    try:
        import matplotlib.pyplot as plt
        import matplotlib.gridspec as gridspec
    except ImportError:
        print('  matplotlib not installed. Run: pip install matplotlib')
        return

    fig = plt.figure(figsize=(14, 10))
    fig.suptitle('Fitness ML Simulator — Persona Analysis', fontsize=14, fontweight='bold')
    gs = gridspec.GridSpec(2, 2, figure=fig, hspace=0.4, wspace=0.35)

    personas = list(runs_data.keys())
    colors = ['#f97316', '#60a5fa', '#2dd4bf', '#a78bfa']

    # Plot 1: Sessions per week
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.bar(personas, [runs_data[p]['stats']['sessions_per_week'] for p in personas],
            color=colors[:len(personas)])
    ax1.set_title('Avg Sessions / Week')
    ax1.set_ylabel('Sessions')

    # Plot 2: Avg completion rate
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.bar(personas, [runs_data[p]['stats']['avg_completion'] for p in personas],
            color=colors[:len(personas)])
    ax2.set_title('Avg Completion Rate (%)')
    ax2.set_ylim(0, 100)

    # Plot 3: Avg muscle readiness at schedule time
    ax3 = fig.add_subplot(gs[1, 0])
    x = range(len(ALL_MUSCLES))
    width = 0.8 / len(personas)
    for i, persona in enumerate(personas):
        quality = runs_data[persona]['quality']
        vals = [quality.get(m, 0) for m in ALL_MUSCLES]
        offset = (i - len(personas) / 2 + 0.5) * width
        ax3.bar([xi + offset for xi in x], vals, width=width * 0.9,
                label=persona, color=colors[i], alpha=0.8)
    ax3.set_xticks(list(x))
    ax3.set_xticklabels(ALL_MUSCLES, rotation=45, ha='right', fontsize=8)
    ax3.set_title('Recovery Readiness at Schedule Time')
    ax3.set_ylim(0, 1)
    ax3.axhline(0.8, color='red', linestyle='--', alpha=0.4, label='80% threshold')
    ax3.legend(fontsize=7)

    # Plot 4: Weight progression for db-chest-press
    ax4 = fig.add_subplot(gs[1, 1])
    for i, persona in enumerate(personas):
        weights_over_time = runs_data[persona].get('chest_press_weights', [])
        if weights_over_time:
            ax4.plot(range(len(weights_over_time)), weights_over_time,
                     label=persona, color=colors[i], linewidth=2)
    ax4.set_title('DB Chest Press — Weight Over Sessions')
    ax4.set_xlabel('Session #')
    ax4.set_ylabel('Weight (lbs)')
    ax4.legend(fontsize=8)

    out_path = os.path.join(os.path.dirname(DB_PATH), 'lab_report.png')
    plt.savefig(out_path, dpi=120, bbox_inches='tight')
    print(f'\n  Chart saved to: {out_path}')
    plt.close()


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Fitness ML Lab')
    parser.add_argument('--persona',  help='Focus on a single persona')
    parser.add_argument('--train',    action='store_true', help='Train and evaluate ML model')
    parser.add_argument('--plot',     action='store_true', help='Save PNG charts (requires matplotlib)')
    parser.add_argument('--compare',  action='store_true', help='Persona comparison table')
    args = parser.parse_args()

    conn = get_conn()
    runs = load_runs(conn, args.persona)

    if not runs:
        print('No simulation runs found. Run `python simulate.py` first.')
        conn.close()
        return

    print()
    print('═' * 60)
    print('  FITNESS ML LAB')
    print('═' * 60)
    print()

    print_runs_table(runs)

    # Group runs by persona — use most recent run per persona
    latest_by_persona = {}
    for r in runs:
        if r['persona'] not in latest_by_persona:
            latest_by_persona[r['persona']] = r

    runs_data = {}
    for persona, run in latest_by_persona.items():
        sessions = load_sessions(conn, run['id'])
        ex_logs  = load_exercise_logs(conn, run['id'])
        stats    = persona_stats(sessions, ex_logs)
        quality  = recovery_scheduling_quality(sessions)

        # Chest press weight history for plot
        chest_weights = [
            log['weight_lbs'] for log in ex_logs
            if log['exercise_id'] == 'db-chest-press'
        ]

        runs_data[persona] = {
            'stats':               stats,
            'quality':             quality,
            'sessions':            sessions,
            'ex_logs':             ex_logs,
            'chest_press_weights': chest_weights,
        }

        print_persona_summary(persona, stats, quality)
        print()

    if args.compare or len(runs_data) > 1:
        print()
        print_comparison_table({p: (d['stats'], d['quality']) for p, d in runs_data.items()})
        print()

    if args.train:
        print()
        for persona, data in runs_data.items():
            X, y = build_feature_matrix(data['sessions'])
            print_ml_results(persona, X, y)
            print()

    if args.plot:
        print()
        divider('GENERATING CHARTS')
        save_plots(runs_data)

    conn.close()


if __name__ == '__main__':
    main()
