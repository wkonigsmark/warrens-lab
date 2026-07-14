// iq-progress Supabase config — safe to commit.
// The publishable key is designed to be public (Supabase's own label:
// "can be safely shared publicly"); RLS + verify_pin() do the real
// gatekeeping. Never put the secret key in this file.
export const SUPABASE_URL = 'https://miynjkrfwdxchecacylo.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cEs-sXrr8-WwBwzjgrQbfg_afOM998e'

// Minutes of inactivity before a kid must re-enter their PIN.
export const SESSION_IDLE_MINUTES = 30
