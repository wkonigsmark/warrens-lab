# passages.json - Structure & Format Guide

## How to Build the JSON File

Once you've collected passages from the checklist, format them like this:

### Template Structure

```json
{
  "K": [
    {
      "title": "Mary Had a Little Lamb",
      "author": "Traditional",
      "passage": "Mary had a little lamb, little lamb, little lamb. Mary had a little lamb, its fleece was white as snow. And everywhere that Mary went, Mary went, Mary went, everywhere that Mary went, the lamb was sure to go."
    },
    {
      "title": "Jack and Jill",
      "author": "Traditional",
      "passage": "Jack and Jill went up the hill to fetch a pail of water. Jack fell down and broke his crown, and Jill came tumbling after."
    },
    {
      "title": "Humpty Dumpty",
      "author": "Traditional",
      "passage": "Humpty Dumpty sat on a wall. Humpty Dumpty had a great fall. All the king's horses and all the king's men could not put Humpty together again."
    }
  ]
}
```

---

## Important Formatting Rules

### 1. **Field Requirements**
- `title` (required): Full name of story/poem
- `author` (required): Author or "Traditional" for folk tales
- `passage` (required): The actual text excerpt

### 2. **Passage Text Rules**
✅ **DO**:
- Include natural punctuation (periods, commas, apostrophes, dashes, quotes)
- Keep sentences complete and natural
- Use proper capitalization
- Include contractions (don't, it's, etc.)

❌ **DON'T**:
- Don't remove punctuation
- Don't shorten unnaturally
- Don't simplify words excessively
- Don't add [brackets] or editorial notes

### 3. **Passage Length**
- **K Grade**: 50-100 words
- Count by words, not sentences
- Too short: loses context
- Too long: takes too much time in game

### 4. **Escaping Special Characters**
In JSON, these characters need escaping:
- `"` becomes `\"`
- `\` becomes `\\`
- Newlines: use `\n` if needed (but keep passages as single line)

### Example with Special Characters:
```json
{
  "title": "The Owl and the Pussycat",
  "author": "Edward Lear",
  "passage": "\"The Owl and the Pussycat went to sea,\" said the poet. \"In a beautiful pea-green boat.\""
}
```

---

## Grade Level Files

Once you have all grades, the final `passages.json` will look like:

```json
{
  "preK": [ /* 20-30 passages */ ],
  "K": [ /* 20-30 passages */ ],
  "1": [ /* 20-30 passages */ ],
  "2": [ /* 20-30 passages */ ],
  "3": [ /* 20-30 passages */ ],
  "4": [ /* 20-30 passages */ ],
  "5+": [ /* 20-30 passages */ ],
  "Adult": [ /* 20-30 passages */ ]
}
```

---

## Validation Checklist

Before adding each passage to JSON, verify:

- [ ] Title is complete and correct
- [ ] Author name is correct (or "Traditional")
- [ ] Passage is 50-150 words (for the grade level)
- [ ] Passage has natural punctuation
- [ ] No [brackets] or editorial notes
- [ ] No special quotes (use regular " not " or ")
- [ ] Public domain verified
- [ ] Age-appropriate for grade level
- [ ] First word is capitalized
- [ ] Last word ends with punctuation (. ! ? ")

---

## Testing Your JSON

1. **Copy-paste into** [jsonlint.com](https://www.jsonlint.com/) to validate syntax
2. **Check for errors**:
   - Missing commas between objects
   - Unescaped quotes
   - Missing closing brackets
3. **File size**: Should be ~50-100 KB for 200+ passages

---

## Example: Complete K Grade Passage (Well-Formatted)

```json
{
  "K": [
    {
      "title": "Mary Had a Little Lamb",
      "author": "Traditional",
      "passage": "Mary had a little lamb, little lamb, little lamb. Mary had a little lamb, its fleece was white as snow. And everywhere that Mary went, the lamb was sure to go."
    },
    {
      "title": "Jack and Jill",
      "author": "Traditional",
      "passage": "Jack and Jill went up the hill to fetch a pail of water. Jack fell down and broke his crown, and Jill came tumbling after. She came tumbling after."
    },
    {
      "title": "Humpty Dumpty",
      "author": "Traditional",
      "passage": "Humpty Dumpty sat on a wall. Humpty Dumpty had a great fall. All the king's horses and all the king's men could not put Humpty together again."
    },
    {
      "title": "The Three Little Pigs",
      "author": "Traditional",
      "passage": "Once there were three little pigs who lived with their mother. When they grew big enough, their mother said, \"The world is a big place, my dears. It is time for you to go out and build houses of your own.\""
    }
  ]
}
```

---

## Quick Start

1. **Use the K_PASSAGES_CHECKLIST.md** to gather passages
2. **Format each passage** using this template
3. **Paste into** passages.json under the "K" key
4. **Validate** with jsonlint.com
5. **Move to 1st Grade** and repeat

Good luck! 📚
