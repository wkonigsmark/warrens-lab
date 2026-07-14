// Shared level-bank builder for tiered topic × tier quiz structures.
// Ants & Angles, Ants & Axes, and Ants & Algebra 2 each hand-roll this same
// `topics.flatMap(topic => tiers.map(...))` pattern locally, with different
// per-tier difficulty knobs (passBar, missBudget, speedMs...). This is that
// pattern factored out — pure data transform, no framework/Supabase
// dependency — so a new tool (or a new topic in an existing one) doesn't
// have to re-derive the id/topicId/tierId bookkeeping by hand.
//
// `topic.generate` receives the tier's index (0-based) so each topic's own
// question generator decides what actually scales per tier.
export function buildTieredLevels(topics, tierDefs) {
  return topics.flatMap((topic) =>
    tierDefs.map((tier, tierIndex) => ({
      ...tier, // whatever difficulty knob(s) this tool's TIER_DEFS carries
      // ↑ spread first: tier.id ('intro') must NOT clobber the composite id below.
      id: `${topic.id}-${tier.id}`,
      topicId: topic.id,
      tierId: tier.id,
      tierIndex,
      tierLabel: tier.label,
      title: topic.title,
      blurb: topic.blurb,
      accent: topic.accent,
      emoji: topic.emoji,
      generate: () => topic.generate(tierIndex),
    }))
  )
}
