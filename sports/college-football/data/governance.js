// Governance & Rules: NIL / transfer portal regulation timeline.
// Tier order = binding first. Add new items by appending to a tier's items
// array — the renderer sorts by date (desc) and needs no changes.
// All source URLs verified resolving 2026-07-07.
const GOVERNANCE_TIMELINE = {
  lastReviewed: "2026-07-07",
  disclaimer: "This is a summary for reference; consult primary sources for legal specifics. Not legal advice.",
  tiers: [
    {
      id: "in-effect",
      label: "In Effect Now",
      badge: "BINDING",
      tone: "binding",
      description: "Binding rules currently governing NIL and revenue sharing",
      items: [
        {
          title: "House v. NCAA Settlement",
          date: "2025-06-06",
          summary: "Final court approval authorized Division I schools to directly share athletics revenue with student-athletes, with an aggregate cap starting around $20.5M per institution. Replaced informal NIL oversight with a centralized enforcement structure.",
          sources: [
            { label: "ESPN — Judge grants final approval of House v. NCAA settlement", url: "https://www.espn.com/college-sports/story/_/id/45467505/judge-grants-final-approval-house-v-ncaa-settlement" },
          ],
        },
        {
          title: "College Sports Commission (CSC) / NIL Go",
          date: "2025",
          summary: "New centralized enforcement body created by the House settlement. Reviews third-party NIL deals via the NIL Go platform for valid business purpose and compensation reasonableness. Division I athletes must report deals of $600+ within 5 business days.",
          sources: [
            { label: "Butler Snow — NIL After House (2026 overview)", url: "https://www.butlersnow.com/news-and-events/nil-after-house-what-name-image-and-likeness-means-for-colleges-and-higher-education-institutions-in-2026" },
          ],
        },
      ],
    },
    {
      id: "federal-pressure",
      label: "Federal Pressure",
      badge: "NOT BINDING LAW",
      tone: "pressure",
      description: "Executive action pushing toward national standards; does not itself create enforceable rules",
      items: [
        {
          title: "Executive Order: Urgent National Action to Save College Sports",
          date: "2026-04-03",
          summary: "Directs federal agencies to evaluate NIL/transfer/eligibility rule violations as a factor in university federal funding eligibility, effective Aug 1, 2026 (applies to schools with $20M+ athletics revenue). Pushes toward a 5-year eligibility window, one free transfer (a second only post-degree), and revenue-sharing guardrails. Explicitly not binding on private parties like the NCAA and likely to face legal challenges.",
          sources: [
            { label: "The White House — Full Executive Order Text", url: "https://www.whitehouse.gov/presidential-actions/2026/04/urgent-national-action-to-save-college-sports/" },
            { label: "The White House — Fact Sheet", url: "https://www.whitehouse.gov/fact-sheets/2026/04/fact-sheet-president-donald-j-trump-takes-urgent-national-action-to-save-college-sports/" },
            { label: "Federal Register — Official Filing", url: "https://www.federalregister.gov/documents/2026/04/09/2026-06961/urgent-national-action-to-save-college-sports" },
          ],
        },
      ],
    },
    {
      id: "pending-congress",
      label: "Pending in Congress",
      badge: "NOT YET LAW",
      tone: "pending",
      description: "Legislation that would create binding national standards if passed and signed",
      items: [
        {
          title: "Protect College Sports Act of 2026",
          date: "2026-06-02",
          summary: "Bipartisan bill (Cantwell, Cruz, Coons, Schmitt) creating a national NIL standard, capping agent fees at 5%, guaranteeing one penalty-free transfer, requiring 1/3 athlete representation on governing boards, and creating a limited antitrust exemption for media-rights pooling. Passed Senate Commerce Committee 19-9 on June 18, 2026; now before the full Senate. Companion bill H.R. 9137 (Baumgartner) introduced in the House June 4, 2026.",
          sources: [
            { label: "Congress.gov — S. 4668 Official Bill Text", url: "https://www.congress.gov/bill/119th-congress/senate-bill/4668" },
            { label: "Congress.gov — H.R. 9137 (companion bill)", url: "https://www.congress.gov/bill/119th-congress/house-bill/9137" },
            { label: "Senate Commerce Committee — Bill Announcement", url: "https://www.commerce.senate.gov/press/dem/release/cantwell-cruz-schmitt-coons-release-bipartisan-bill-to-stabilize-college-sports-protect-athletes-and-expand-revenue-sharing/" },
            { label: "Senate Commerce Committee — Committee Passage (19-9)", url: "https://www.commerce.senate.gov/press/dem/release/bipartisan-protect-college-sports-act-advances-to-full-senate/" },
            { label: "GovTrack — Bill Status & Prognosis", url: "https://www.govtrack.us/congress/bills/119/s4668" },
          ],
        },
      ],
    },
  ],
};
