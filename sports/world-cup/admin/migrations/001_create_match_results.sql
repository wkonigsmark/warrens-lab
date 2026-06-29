-- Create match_results table for knockout match scoring
CREATE TABLE IF NOT EXISTS match_results (
  id BIGSERIAL PRIMARY KEY,
  match_number INTEGER UNIQUE NOT NULL,
  home_team_id TEXT,
  away_team_id TEXT,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  winner_id TEXT,
  shootout_winner_id TEXT,
  result_note TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on match_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_match_results_match_number ON match_results(match_number);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_match_results_status ON match_results(status);

-- Enable RLS (Row Level Security)
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading all results (public)
CREATE POLICY "match_results_select_all" ON match_results
  FOR SELECT USING (TRUE);

-- Note: INSERT/UPDATE/DELETE should only be allowed from the admin server with proper PIN verification
-- The admin server handles this at the application level
