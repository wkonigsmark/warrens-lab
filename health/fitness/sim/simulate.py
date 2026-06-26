#!/usr/bin/env python3
"""
Fitness ML Simulator
Generates synthetic workout history into a local SQLite DB for ML training.

Usage:
  python simulate.py                       # all 4 personas, 24 weeks
  python simulate.py --persona vigilant    # single persona
  python simulate.py --weeks 52 --seed 42  # longer reproducible run
  python simulate.py --clear               # wipe DB and start fresh
"""

import sqlite3
import random
import uuid
import argparse
import json
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fitness_sim.db')

SCHEMA = """
CREATE TABLE IF NOT EXISTS sim_runs (
    id          TEXT PRIMARY KEY,
    persona     TEXT NOT NULL,
    weeks       INTEGER NOT NULL,
    seed        INTEGER NOT NULL,
    created_at  TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS sim_sessions (
    id               TEXT PRIMARY KEY,
    run_id           TEXT NOT NULL,
    persona          TEXT NOT NULL,
    workout_id       TEXT NOT NULL,
    workout_name     TEXT NOT NULL,
    workout_type     TEXT NOT NULL,
    started_at       TEXT NOT NULL,
    ended_at         TEXT,
    duration_seconds REAL,
    sets_completed   INTEGER,
    total_sets       INTEGER,
    completion_pct   REAL,
    FOREIGN KEY (run_id) REFERENCES sim_runs(id)
);

CREATE TABLE IF NOT EXISTS sim_exercise_logs (
    id             TEXT PRIMARY KEY,
    session_id     TEXT NOT NULL,
    run_id         TEXT NOT NULL,
    persona        TEXT NOT NULL,
    exercise_id    TEXT NOT NULL,
    exercise_name  TEXT NOT NULL,
    muscle_groups  TEXT NOT NULL,
    sets_completed INTEGER,
    total_sets     INTEGER,
    weight_lbs     REAL,
    rpe            REAL,
    created_at     TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sim_sessions(id)
);
"""

WORKOUTS = {
    'db-push': {
        'name': 'DB Push Day',
        'type': 'dumbbell',
        'primary_muscles': ['chest', 'shoulders', 'triceps', 'core'],
        'exercises': [
            {'id': 'db-chest-press',      'name': 'DB Chest Press',      'sets': 4, 'base_weight': 35.0},
            {'id': 'db-incline-press',    'name': 'DB Incline Press',    'sets': 3, 'base_weight': 30.0},
            {'id': 'db-shoulder-press',   'name': 'DB Shoulder Press',   'sets': 3, 'base_weight': 25.0},
            {'id': 'db-lateral-raise',    'name': 'Lateral Raise',       'sets': 3, 'base_weight': 15.0},
            {'id': 'db-tricep-kickback',  'name': 'Tricep Kickback',     'sets': 3, 'base_weight': 15.0},
        ],
    },
    'db-lower': {
        'name': 'DB Lower Body',
        'type': 'dumbbell',
        'primary_muscles': ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
        'exercises': [
            {'id': 'db-goblet-squat', 'name': 'Goblet Squat',       'sets': 4, 'base_weight': 40.0},
            {'id': 'db-rdl',          'name': 'Romanian Deadlift',  'sets': 3, 'base_weight': 35.0},
            {'id': 'db-lunge',        'name': 'DB Reverse Lunge',   'sets': 3, 'base_weight': 25.0},
            {'id': 'db-hip-thrust',   'name': 'DB Hip Thrust',      'sets': 3, 'base_weight': 40.0},
            {'id': 'db-calf-raise',   'name': 'DB Calf Raise',      'sets': 3, 'base_weight': 25.0},
        ],
    },
    'db-pull': {
        'name': 'DB Pull Day',
        'type': 'dumbbell',
        'primary_muscles': ['back', 'lats', 'biceps', 'core'],
        'exercises': [
            {'id': 'db-bent-row',    'name': 'Bent-Over Row',      'sets': 4, 'base_weight': 35.0},
            {'id': 'db-single-row',  'name': 'Single-Arm Row',     'sets': 3, 'base_weight': 35.0},
            {'id': 'db-rdl-pull',    'name': 'Romanian Deadlift',  'sets': 3, 'base_weight': 40.0},
            {'id': 'db-bicep-curl',  'name': 'Bicep Curl',         'sets': 3, 'base_weight': 20.0},
            {'id': 'db-hammer-curl', 'name': 'Hammer Curl',        'sets': 3, 'base_weight': 20.0},
        ],
    },
    'db-upper': {
        'name': 'DB Upper Body',
        'type': 'dumbbell',
        'primary_muscles': ['chest', 'back', 'lats', 'shoulders', 'biceps', 'triceps', 'core'],
        'exercises': [
            {'id': 'db-chest-press-u',    'name': 'DB Chest Press',       'sets': 3, 'base_weight': 35.0},
            {'id': 'db-bent-row-u',       'name': 'Bent-Over Row',        'sets': 3, 'base_weight': 35.0},
            {'id': 'db-shoulder-press-u', 'name': 'Shoulder Press',       'sets': 3, 'base_weight': 25.0},
            {'id': 'db-bicep-curl-u',     'name': 'Bicep Curl',           'sets': 3, 'base_weight': 20.0},
            {'id': 'db-tricep-ext',       'name': 'Overhead Tricep Ext',  'sets': 3, 'base_weight': 20.0},
        ],
    },
    'full-body-core': {
        'name': 'Full Body Core Focus',
        'type': 'dumbbell',
        'primary_muscles': ['chest', 'back', 'lats', 'shoulders', 'quads', 'glutes', 'hamstrings', 'core'],
        'exercises': [
            {'id': 'fbc-goblet-squat',   'name': 'Goblet Squat',          'sets': 3, 'base_weight': 35.0},
            {'id': 'fbc-db-row',         'name': 'Dumbbell Row',           'sets': 3, 'base_weight': 30.0},
            {'id': 'fbc-floor-press',    'name': 'DB Floor Press',         'sets': 3, 'base_weight': 30.0},
            {'id': 'fbc-rdl',            'name': 'Romanian Deadlift',      'sets': 3, 'base_weight': 35.0},
            {'id': 'fbc-russian-twist',  'name': 'Weighted Russian Twist', 'sets': 2, 'base_weight': 10.0},
            {'id': 'fbc-deadbug',        'name': 'Dumbbell Deadbug',       'sets': 2, 'base_weight': 5.0},
        ],
    },
}

RECOVERY_HOURS = {
    'chest': 60, 'shoulders': 48, 'triceps': 48,
    'back':  60, 'biceps':    48, 'lats':    60,
    'quads': 72, 'hamstrings': 72, 'glutes': 72, 'calves': 48,
    'core':  36,  # recovers faster than compound muscle groups
}

PERSONAS = {
    'vigilant': {
        'description':           'Disciplined — 5x/week, near-perfect completion, steady progress.',
        'base_sessions_week':    5.0,
        'session_stddev':        0.5,
        'completion_rate':       0.95,
        'skip_exercise_prob':    0.03,
        'weight_increase_every': 6,
        'weight_increase_lbs':   2.5,
        'sick_week_prob':        0.02,
        'lazy_week_prob':        0.05,
        'lazy_week_sessions':    1.0,
    },
    'lazy': {
        'description':           'Sporadic — 2x/week avg, often quits early, slow weight progress.',
        'base_sessions_week':    2.0,
        'session_stddev':        1.0,
        'completion_rate':       0.65,
        'skip_exercise_prob':    0.25,
        'weight_increase_every': 14,
        'weight_increase_lbs':   2.5,
        'sick_week_prob':        0.05,
        'lazy_week_prob':        0.40,
        'lazy_week_sessions':    0.5,
    },
    'periodic': {
        'description':           'Motivated in bursts — active 3-4 weeks, then slack for 2-3.',
        'base_sessions_week':    4.5,
        'session_stddev':        0.8,
        'completion_rate':       0.85,
        'skip_exercise_prob':    0.10,
        'weight_increase_every': 8,
        'weight_increase_lbs':   2.5,
        'sick_week_prob':        0.03,
        'lazy_week_prob':        0.0,
        'lazy_week_sessions':    1.0,
        'cycle_active_weeks':    (3, 4),
        'cycle_lazy_weeks':      (2, 3),
    },
    'hybrid': {
        'description':           'Mostly consistent — 3-4x/week with occasional disruptions.',
        'base_sessions_week':    3.5,
        'session_stddev':        1.2,
        'completion_rate':       0.80,
        'skip_exercise_prob':    0.12,
        'weight_increase_every': 9,
        'weight_increase_lbs':   2.5,
        'sick_week_prob':        0.04,
        'lazy_week_prob':        0.15,
        'lazy_week_sessions':    1.0,
    },
}


def init_db(conn):
    conn.executescript(SCHEMA)
    conn.commit()


def muscle_readiness(muscle, last_worked, now):
    """0.0 = just worked, 1.0 = fully recovered."""
    if last_worked is None:
        return 1.0
    hours = (now - last_worked).total_seconds() / 3600
    return min(1.0, hours / RECOVERY_HOURS.get(muscle, 48))


def choose_workout(muscle_history, now, rng):
    """Pick workout whose primary muscles have the highest aggregate readiness.
    Uses weighted random selection so it's not always deterministic."""
    scores = {}
    for wid, w in WORKOUTS.items():
        readiness_vals = [muscle_readiness(m, muscle_history.get(m), now)
                          for m in w['primary_muscles']]
        scores[wid] = sum(readiness_vals) / len(readiness_vals)

    # Weight by score squared — strong preference for recovered muscles but not rigid
    weights = {wid: s ** 2 for wid, s in scores.items()}
    total = sum(weights.values())
    r = rng.random() * total
    cumulative = 0.0
    for wid in sorted(weights, key=weights.get, reverse=True):
        cumulative += weights[wid]
        if r <= cumulative:
            return wid
    return max(scores, key=scores.get)


def simulate_session(workout_id, now, weights, cfg, rng):
    """Simulate one workout session. Returns (session_dict, [exercise_log_dicts])."""
    w = WORKOUTS[workout_id]
    session_id = str(uuid.uuid4())
    total_sets = 0
    completed_sets = 0
    ex_logs = []

    for ex in w['exercises']:
        if rng.random() < cfg['skip_exercise_prob']:
            continue

        eid = ex['id']
        weight = weights.get(eid, ex['base_weight'])
        sets_done = ex['sets']
        if rng.random() > cfg['completion_rate']:
            sets_done = rng.randint(1, ex['sets'])

        rpe = round(rng.uniform(6.0, 9.5), 1)
        total_sets += ex['sets']
        completed_sets += sets_done

        ex_logs.append({
            'id':             str(uuid.uuid4()),
            'session_id':     session_id,
            'exercise_id':    eid,
            'exercise_name':  ex['name'],
            'muscle_groups':  json.dumps(w['primary_muscles']),
            'sets_completed': sets_done,
            'total_sets':     ex['sets'],
            'weight_lbs':     weight,
            'rpe':            rpe,
            'created_at':     now.isoformat(),
        })

    if total_sets == 0:
        return None, []

    duration = total_sets * rng.uniform(180, 360)  # ~3-6 min per set including rest
    completion_pct = round(completed_sets / total_sets * 100, 1)

    session = {
        'id':               session_id,
        'workout_id':       workout_id,
        'workout_name':     w['name'],
        'workout_type':     w['type'],
        'started_at':       now.isoformat(),
        'ended_at':         (now + timedelta(seconds=duration)).isoformat(),
        'duration_seconds': round(duration),
        'sets_completed':   completed_sets,
        'total_sets':       total_sets,
        'completion_pct':   completion_pct,
    }
    return session, ex_logs


def update_progressive_overload(weights, ex_history, ex_logs, cfg):
    """Increment weight after N fully-completed sessions on the same exercise."""
    for log in ex_logs:
        eid = log['exercise_id']
        if log['sets_completed'] >= log['total_sets']:
            ex_history[eid] = ex_history.get(eid, 0) + 1
            if ex_history[eid] >= cfg['weight_increase_every']:
                weights[eid] = weights.get(eid, log['weight_lbs']) + cfg['weight_increase_lbs']
                ex_history[eid] = 0


def weekly_sessions_count(persona_name, cfg, phase, rng):
    """Return how many sessions to do this week. Mutates `phase` dict for periodic."""
    if persona_name == 'periodic':
        if phase['mode'] == 'active':
            base = cfg['base_sessions_week']
            phase['weeks_left'] -= 1
            if phase['weeks_left'] <= 0:
                phase['mode'] = 'lazy'
                lo, hi = cfg['cycle_lazy_weeks']
                phase['weeks_left'] = rng.randint(lo, hi)
        else:
            base = cfg['lazy_week_sessions']
            phase['weeks_left'] -= 1
            if phase['weeks_left'] <= 0:
                phase['mode'] = 'active'
                lo, hi = cfg['cycle_active_weeks']
                phase['weeks_left'] = rng.randint(lo, hi)
    elif rng.random() < cfg.get('sick_week_prob', 0):
        base = 0
    elif rng.random() < cfg.get('lazy_week_prob', 0):
        base = cfg['lazy_week_sessions']
    else:
        base = cfg['base_sessions_week']

    n = round(rng.gauss(base, cfg['session_stddev']))
    return max(0, min(n, 7))


def run_simulation(persona_name, weeks, seed, conn):
    """Run and persist a full simulation for one persona. Returns run_id."""
    cfg = PERSONAS[persona_name]
    rng = random.Random(seed)
    run_id = str(uuid.uuid4())
    start = datetime(2026, 1, 5)  # simulation begins Jan 5 2026 (Monday)

    conn.execute(
        'INSERT INTO sim_runs VALUES (?,?,?,?,?,?)',
        (run_id, persona_name, weeks, seed, datetime.now().isoformat(), cfg['description'])
    )

    muscle_history = {}   # {muscle: last_worked_datetime}
    weights = {}           # {exercise_id: current_weight_lbs}
    ex_history = {}        # {exercise_id: consecutive_full_completions}

    lo, hi = cfg.get('cycle_active_weeks', (3, 4))
    phase = {'mode': 'active', 'weeks_left': rng.randint(lo, hi)}

    all_sessions = []
    all_logs = []

    for week in range(weeks):
        week_start = start + timedelta(weeks=week)
        n = weekly_sessions_count(persona_name, cfg, phase, rng)
        if n == 0:
            continue

        days = sorted(rng.sample(range(7), min(n, 7)))
        for day in days:
            t = week_start + timedelta(
                days=day,
                hours=rng.randint(6, 21),
                minutes=rng.randint(0, 59),
            )
            wid = choose_workout(muscle_history, t, rng)
            session, logs = simulate_session(wid, t, weights, cfg, rng)
            if session is None:
                continue

            session['run_id'] = run_id
            session['persona'] = persona_name
            for log in logs:
                log['run_id'] = run_id
                log['persona'] = persona_name

            for muscle in WORKOUTS[wid]['primary_muscles']:
                muscle_history[muscle] = t

            update_progressive_overload(weights, ex_history, logs, cfg)

            all_sessions.append(session)
            all_logs.extend(logs)

    conn.executemany(
        '''INSERT INTO sim_sessions
           VALUES (:id,:run_id,:persona,:workout_id,:workout_name,:workout_type,
                   :started_at,:ended_at,:duration_seconds,:sets_completed,:total_sets,:completion_pct)''',
        all_sessions
    )
    conn.executemany(
        '''INSERT INTO sim_exercise_logs
           VALUES (:id,:session_id,:run_id,:persona,:exercise_id,:exercise_name,
                   :muscle_groups,:sets_completed,:total_sets,:weight_lbs,:rpe,:created_at)''',
        all_logs
    )
    conn.commit()

    print(f'  [{persona_name:10s}]  {len(all_sessions):3d} sessions · {len(all_logs):4d} exercise logs  (run {run_id[:8]})')
    return run_id


def main():
    parser = argparse.ArgumentParser(description='Fitness ML Simulator')
    parser.add_argument('--persona', choices=list(PERSONAS), help='Run a single persona')
    parser.add_argument('--weeks',   type=int, default=24,   help='Weeks to simulate (default: 24)')
    parser.add_argument('--seed',    type=int, default=1337,  help='Base random seed')
    parser.add_argument('--clear',   action='store_true',    help='Wipe DB before running')
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)

    if args.clear:
        conn.executescript(
            'DROP TABLE IF EXISTS sim_exercise_logs;'
            'DROP TABLE IF EXISTS sim_sessions;'
            'DROP TABLE IF EXISTS sim_runs;'
        )
        conn.commit()
        print('Database cleared.\n')

    init_db(conn)

    targets = [args.persona] if args.persona else list(PERSONAS)
    print(f'Simulating {args.weeks} weeks for: {", ".join(targets)}\n')

    for i, persona in enumerate(targets):
        run_simulation(persona, args.weeks, args.seed + i, conn)

    conn.close()
    print(f'\nDB written to: {DB_PATH}')
    print('Run `python lab.py` to analyze results.')


if __name__ == '__main__':
    main()
