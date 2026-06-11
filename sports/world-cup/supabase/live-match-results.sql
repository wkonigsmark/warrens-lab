create table if not exists public.match_results (
  match_number integer primary key,
  home_team_id text,
  away_team_id text,
  home_score integer not null default 0,
  away_score integer not null default 0,
  status text not null default 'upcoming',
  winner_id text,
  shootout_winner_id text,
  result_note text not null default '',
  source text not null default 'manual',
  source_ref text,
  updated_at timestamptz not null default now(),
  constraint match_results_number_check check (match_number between 1 and 104),
  constraint match_results_score_check check (home_score >= 0 and away_score >= 0),
  constraint match_results_status_check check (status in ('upcoming', 'live', 'completed'))
);

alter table public.match_results enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.match_results to service_role;

create or replace function public.get_public_match_results()
returns table (
  match_number integer,
  home_team_id text,
  away_team_id text,
  home_score integer,
  away_score integer,
  status text,
  winner_id text,
  shootout_winner_id text,
  result_note text,
  source text,
  source_ref text,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    match_number,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    status,
    winner_id,
    shootout_winner_id,
    result_note,
    source,
    source_ref,
    updated_at
  from public.match_results
  where status in ('live', 'completed')
  order by match_number;
$$;

grant execute on function public.get_public_match_results() to anon;
