// Vendored copy of iq/_shared/progress/config.js.
// Ants & Apples has no bundler (plain static site, no Vite/npm), so it can't
// import across ../_shared/ at runtime the way the React tools do — that
// path wouldn't exist once this folder is deployed on its own. Keep this in
// sync by hand if the canonical config ever changes.
export const SUPABASE_URL = 'https://miynjkrfwdxchecacylo.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cEs-sXrr8-WwBwzjgrQbfg_afOM998e'

// Minutes of inactivity before a kid must re-enter their PIN.
export const SESSION_IDLE_MINUTES = 30
