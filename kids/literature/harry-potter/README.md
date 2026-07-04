# 🏰 Wizarding Quiz

An endless, forgiving Harry Potter quiz for young readers (age ~7) who have finished
**Book 1 (The Sorcerer's Stone)** and **Book 2 (The Chamber of Secrets)**.
Books 3–7 are shown locked — "read the next book to unlock its quiz."

## Play

```bash
npm install
npm run dev     # → http://localhost:9021 (strictPort)
```

Or from the lab root: `preview_start hp-quiz` / launch config `hp-quiz`.

## How it works

- **Endless mix** — pick Book I, Book II, or the Grand Mix; questions stream forever.
  The deck always deals questions you haven't answered correctly yet before any
  repeats, so nothing repeats until the whole bank is cleared. Built for car rides.
- **Three content flavors**, each tagged on the question card:
  - 📖 **Story** — plotline comprehension, achievable and confidence-building
  - 💖 **Heart & Courage** — themes: courage in the face of fear, wisdom against
    temptation, what's good and flawed in each character (kids AND adults)
  - ⭐ **Superfan** — deep cuts (Colin Creevey, Mosag, Kwikspell, Deathday parties)
    that reward kids who really read the books; worth double points
- **Five question mechanics** — multiple choice, true/false, Who Said It? (parchment
  quote card), Order the Events (tap-in-sequence), Odd One Out.
- **Forgiving loop** — wrong answers gray out and you just try again; points halve
  per miss (10 → 5 → 3 → 2, floor 2), no lives, no game over. Every correct answer
  shows a "did you know" fact. Enter/Return advances after a correct answer.
- **Rewards** — house points (pick your house on the home screen), 🔥 streaks, and a
  **Chocolate Frog Card** collection: one card unlocks per 5 correct answers (22 cards).
- **Master Collector finale** — collecting all 22 cards triggers a trophy ceremony
  ("Special Award for Services to Hogwarts") and a printable B&W certificate with a
  blank name line for kids to fill in. The trophy stays on the home screen forever.
- Progress (points, cards, seen questions, best streak, house) persists in `localStorage`.
- **Content rules**: books 1–2 knowledge only (no later-book spoilers), and book text
  only — never movie lines.

## Structure

```
src/
  data/book1.js      74 questions — Sorcerer's Stone
  data/book2.js      104 questions — Chamber of Secrets (the main focus)
  data/frogCards.js  22 collectible cards, in unlock order
  data/houses.js     house themes, category meta, book list (locked flags)
  lib/game.js        persistence, deck building, option shuffling, scoring
  screens/Home.jsx   title, house picker, book shelf, card collection
  screens/Quiz.jsx   endless quiz loop + all question mechanics
  components/        FrogCard, Burst (sparkle celebration)
```

Adding a book later: write `src/data/book3.js` in the same shapes, flip
`unlocked: true` in `houses.js` `BOOKS`, and wire it into the deck builder in
`Quiz.jsx`.
