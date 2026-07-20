// Book 3 — Harry Potter and the Prisoner of Azkaban (READING IN PROGRESS)
//
// ⚠️ SPOILER GATE: every question is tagged with the chapter it becomes safe in.
// Bump READ_UP_TO as you finish chapters — questions above it are never dealt.
//
// HARD RULES for adding content here (book 3 is a minefield of twists):
//  - Black's story is always "what everyone believes/says" — never asserted as fact
//  - Scabbers: only "Ron blames Crookshanks" — nothing more, ever
//  - No linking Lupin's illnesses to anything; no werewolf talk
//  - Map makers: their signed insults only — never who they are
//  - No animagi, no Shrieking Shack lore, no time talk beyond "impossible schedule"
//  - The Grim stays an open mystery
//
// New question type here: 'talk' — an open discussion prompt with no wrong answer.
// `talk` = follow-up questions to keep it going; `fact` = listening tips for the grown-up.

export const READ_UP_TO = 14 // just finished: ch. 14, "Snape's Grudge"

export const BOOK3 = [
  // ---------- STORY ----------
  {
    chapter: 2, type: 'mc', cat: 'story',
    q: 'What does Harry accidentally do to Aunt Marge when she insults his parents?',
    options: ['Inflates her like a balloon', 'Gives her a pig’s tail', 'Turns her hair blue', 'Makes her bark like her bulldogs'],
    answer: 0,
    fact: 'She swelled up and floated to the ceiling — and Harry grabbed his trunk and walked out into the night.',
  },
  {
    chapter: 3, type: 'mc', cat: 'story',
    q: 'How do you summon the Knight Bus?',
    options: ['Stick out your wand arm', 'Whistle three times', 'Say “transport” to any lamppost', 'Wave a galleon in the air'],
    answer: 0,
    fact: 'It BANGS into existence — a violently purple, triple-decker rescue bus for stranded witches and wizards.',
  },
  {
    chapter: 5, type: 'mc', cat: 'story',
    q: 'A dementor boards the Hogwarts Express. Who drives it away?',
    options: ['Professor Lupin', 'The conductor', 'Harry', 'An Auror on board'],
    answer: 0,
    fact: 'The shabby new teacher everyone had ignored produced silvery light from his wand — and the cold thing glided away.',
  },
  {
    chapter: 5, type: 'mc', cat: 'story',
    q: 'What does Lupin hand out after the dementor attack?',
    options: ['Chocolate', 'Pumpkin juice', 'A calming potion', 'Warm blankets'],
    answer: 0,
    fact: 'Chocolate really is the remedy after a dementor — Madam Pomfrey was impressed the new teacher knew it.',
  },
  {
    chapter: 6, type: 'mc', cat: 'story',
    q: 'What shape does Professor Trelawney see in Harry’s tea leaves?',
    options: ['The Grim — a giant ghostly dog said to be a death omen', 'A lightning bolt', 'A crown', 'A black cat'],
    answer: 0,
    fact: 'Hermione squinted at the cup and said it looked more like a hat. Professor McGonagall pointed out Trelawney predicts a student’s death every single year.',
  },
  {
    chapter: 6, type: 'mc', cat: 'story',
    q: 'What is the proper way to approach a hippogriff like Buckbeak?',
    options: ['Bow first, and wait for it to bow back', 'Feed it before anything else', 'Look it straight in the eye and shout your name', 'Approach from behind, quietly'],
    answer: 0,
    fact: 'Hippogriffs are deeply proud. Be polite, let them make the first move — and NEVER insult one.',
  },
  {
    chapter: 6, type: 'mc', cat: 'story',
    q: 'Who insults Buckbeak — and gets a slashed arm for it?',
    options: ['Draco Malfoy', 'Crabbe', 'Seamus', 'Pansy Parkinson'],
    answer: 0,
    fact: 'He called Buckbeak a “great ugly brute” after watching Harry get the bow right. Hagrid’s very first lesson, ruined.',
  },
  {
    chapter: 7, type: 'mc', cat: 'story',
    q: 'What is a boggart?',
    options: ['A shape-shifter that becomes whatever you fear most', 'A house ghost gone bad', 'A goblin that hides in wardrobes', 'An invisible biting pest'],
    answer: 0,
    fact: 'Nobody knows what a boggart looks like when it’s alone. The counter-spell is Riddikulus — but the real weapon is laughter.',
  },
  {
    chapter: 7, type: 'mc', cat: 'story',
    q: 'Neville’s boggart turns into Professor Snape. How does Neville defeat it?',
    options: ['He imagines Snape in his grandmother’s clothes', 'He shouts the password at it', 'He runs away', 'Lupin steps in front of him'],
    answer: 0,
    fact: 'Vulture-topped hat, long green dress, big red handbag. The class roared — and shy Neville finished it off.',
  },
  {
    chapter: 8, type: 'mc', cat: 'story',
    q: 'Why can’t Harry visit Hogsmeade with everyone else?',
    options: ['His permission form was never signed', 'McGonagall thinks it’s too dangerous for anyone', 'He’s banned as punishment', 'Third-years aren’t allowed'],
    answer: 0,
    fact: 'Uncle Vernon was supposed to sign it — then the Aunt Marge disaster happened. McGonagall wouldn’t bend the rules either.',
  },
  {
    chapter: 8, type: 'mc', cat: 'story',
    q: 'On Halloween night, the Fat Lady’s portrait is found slashed to ribbons. Who does Peeves say did it?',
    options: ['Sirius Black', 'The Bloody Baron', 'A troll', 'Filch'],
    answer: 0,
    fact: 'She refused to let him in without the password — so he attacked the painting. The whole school slept in the Great Hall that night.',
  },
  {
    chapter: 9, type: 'mc', cat: 'story',
    q: 'What happens to Harry during the storm-soaked Quidditch match against Hufflepuff?',
    options: ['Dementors flood the pitch and he falls from his broom', 'Lightning strikes his broom', 'He catches the Snitch in record time', 'The match is canceled halfway'],
    answer: 0,
    fact: 'He fell fifty feet. Dumbledore slowed his fall with magic — and nobody had ever seen Dumbledore that angry.',
  },
  {
    chapter: 9, type: 'mc', cat: 'story',
    q: 'What happens to Harry’s Nimbus Two Thousand after his fall?',
    options: ['It blows into the Whomping Willow and is smashed to splinters', 'Lupin catches it', 'It flies away and is never found', 'Dumbledore repairs it'],
    answer: 0,
    fact: 'The Willow doesn’t like being hit. What was left came back in a little bag of twigs. A moment of silence, please.',
  },
  {
    chapter: 10, type: 'quote', cat: 'story',
    quote: 'I solemnly swear that I am up to no good.',
    options: ['The password that opens the Marauder’s Map', 'The Knight Bus greeting', 'Peeves’s favorite oath', 'The Gryffindor password'],
    answer: 0,
    fact: 'Fred and George’s greatest gift to Harry — say it with your wand on the parchment, and Hogwarts appears, every person a moving dot. “Mischief managed” wipes it clean.',
  },
  {
    chapter: 10, type: 'mc', cat: 'story',
    q: 'In the Three Broomsticks, Harry overhears what everyone believes about Sirius Black. What is he to Harry?',
    options: ['His godfather — and his dad’s best friend', 'A distant cousin', 'His father’s old rival', 'No relation at all'],
    answer: 0,
    fact: 'Best man at James and Lily’s wedding, the person they trusted most — which is what makes the story everyone tells so terrible.',
  },
  {
    chapter: 11, type: 'mc', cat: 'story',
    q: 'What impossibly wonderful thing arrives for Harry at Christmas — with no note?',
    options: ['A Firebolt', 'A new invisibility cloak', 'A Nimbus Two Thousand and One', 'A pet owl'],
    answer: 0,
    fact: 'The fastest racing broom in the world, sender unknown. Which is exactly what worried Hermione…',
  },
  {
    chapter: 12, type: 'mc', cat: 'story',
    q: 'What fuels the Patronus Charm that Lupin teaches Harry?',
    options: ['A single, very happy memory, held with all your might', 'Pure anger', 'A loud clear voice', 'An expensive wand'],
    answer: 0,
    fact: 'Expecto Patronum! The dementors feed on despair — so the shield against them is made of happiness itself.',
  },
  {
    chapter: 13, type: 'mc', cat: 'story',
    q: 'Ron wakes up screaming in the night. What does he say he saw?',
    options: ['Sirius Black standing over him with a knife', 'A dementor at the window', 'The Grim on his bed', 'Peeves stealing his wand'],
    answer: 0,
    fact: 'Black slashed Ron’s bed curtains — then fled. Sir Cadogan had let him through: he had a whole week’s passwords on a list someone lost…',
  },
  {
    chapter: 14, type: 'mc', cat: 'story',
    q: 'Draco spots Harry’s floating head in Hogsmeade. Who rescues Harry from Snape’s furious questioning?',
    options: ['Professor Lupin', 'Professor McGonagall', 'Ron, taking the blame', 'Dumbledore'],
    answer: 0,
    fact: 'Lupin claimed the suspicious parchment was just a Zonko’s joke product — and steered Harry out. Then told him, quietly, that he was disappointed. Somehow that was worse.',
  },

  // ---------- HEART & COURAGE ----------
  {
    chapter: 11, type: 'mc', cat: 'heart',
    q: 'After Harry hears what everyone says Black did, what do Ron and Hermione beg him NOT to do?',
    options: ['Go looking for Black himself', 'Tell Dumbledore', 'Write to the Ministry', 'Quit Quidditch'],
    answer: 0,
    fact: 'Anger this big can steer a person somewhere terrible. His friends saw it in his face — and stood in the way.',
  },
  {
    chapter: 9, type: 'mc', cat: 'heart',
    q: 'Cedric Diggory catches the Snitch just as Harry falls. What does Cedric do when he realizes what happened?',
    options: ['Tries to call the match off and offers a rematch', 'Celebrates with his team', 'Blames the weather', 'Asks to keep the win quiet'],
    answer: 0,
    fact: 'He’d won fair and square, and STILL didn’t want a victory like that. Remember the name — that’s what good sportsmanship looks like.',
  },
  {
    chapter: 11, type: 'mc', cat: 'heart',
    q: 'Hermione reports the mystery Firebolt to McGonagall, who takes it away — and Harry and Ron stop speaking to her. Why did she do it?',
    options: ['She feared it came from Black and could be jinxed to hurt Harry', 'She was jealous of the broom', 'She wanted McGonagall to like her', 'Percy told her to'],
    answer: 0,
    fact: 'She chose Harry’s safety over Harry’s friendship — knowing exactly what it would cost her. That’s a hard kind of brave.',
  },
  {
    chapter: 14, type: 'mc', cat: 'heart',
    q: 'What does Hagrid tell Harry and Ron they ought to value more than broomsticks or rats?',
    options: ['Their friend — Hermione', 'Their studies', 'Their house points', 'Their teachers'],
    answer: 0,
    fact: 'She’d been crying in his hut — buried in work, helping with Buckbeak’s case, and missing her two best friends. The boys felt about an inch tall.',
  },

  // ---------- SUPERFAN ----------
  {
    chapter: 1, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: How did the Weasleys afford their trip to Egypt?',
    options: ['They won 700 galleons in the Daily Prophet draw', 'Bill paid for everyone', 'Mr. Weasley got a bonus', 'They sold the flying car'],
    answer: 0,
    fact: 'The Grand Prize Galleon Draw! They visited Bill, the curse-breaker — and Fred and George tried to shut Percy in a pyramid.',
  },
  {
    chapter: 1, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What does the Pocket Sneakoscope Ron sends Harry actually do?',
    options: ['Lights up and spins when someone untrustworthy is near', 'Detects dementors', 'Finds lost things', 'Whistles when homework is due'],
    answer: 0,
    fact: 'A cheap one, Ron admits — it kept going off at dinner. Odd little gadget.',
  },
  {
    chapter: 3, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: On the Knight Bus, eleven Sickles buys the ride. What do you get for thirteen?',
    options: ['Hot chocolate', 'A window seat', 'A blanket', 'Faster service'],
    answer: 0,
    fact: 'And for fifteen: a hot water bottle AND a toothbrush in the color of your choice. The hot chocolate mostly ends up in your lap when the bus jumps.',
  },
  {
    chapter: 3, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What fake name does Harry give on the Knight Bus?',
    options: ['Neville Longbottom', 'Stan Shunpike', 'Dudley Dursley', 'Tom Riddle'],
    answer: 0,
    fact: 'First name he thought of! Meanwhile conductor Stan Shunpike showed “Neville” the newspaper with Black’s face on it.',
  },
  {
    chapter: 3, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: Who drives the Knight Bus?',
    options: ['Ernie Prang', 'Stan Shunpike', 'Tom the innkeeper', 'Madam Rosmerta'],
    answer: 0,
    fact: 'Elderly, thick glasses, drives like the bus is being chased. Armchairs slide, beds tip, Ern hits the brakes. “Take ’er away, Ern!”',
  },
  {
    chapter: 4, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: How do you calm down The Monster Book of Monsters?',
    options: ['Stroke its spine', 'Feed it smaller books', 'Say a password', 'Keep it in the cold'],
    answer: 0,
    fact: 'Hagrid couldn’t understand why nobody worked it out. Harry’s copy spent a month belted shut and growling under his bed.',
  },
  {
    chapter: 6, type: 'quote', cat: 'superfan',
    quote: 'You look in excellent health to me, Potter.',
    options: ['Professor McGonagall', 'Madam Pomfrey', 'Professor Trelawney', 'Snape'],
    answer: 0,
    fact: 'Her dry reply to Trelawney’s death prediction — Sybill Trelawney has predicted a student’s death every year since she arrived. None have died yet.',
  },
  {
    chapter: 8, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: Which batty knight takes over guarding Gryffindor Tower after the Fat Lady is attacked?',
    options: ['Sir Cadogan', 'Sir Patrick', 'The Bloody Baron', 'Sir Nicholas'],
    answer: 0,
    fact: 'He changes the password twice a day, challenges people to duels, and calls everyone scurvy braggarts. Only portrait brave enough for the job!',
  },
  {
    chapter: 9, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: While Lupin is ill, Snape covers his class. What does he make them study?',
    options: ['A chapter far ahead of where the class had reached', 'Dueling practice', 'His own potion book', 'The history of Azkaban'],
    answer: 0,
    fact: 'Skipped straight past everything Lupin had taught, and set an essay besides. The class protested; he took points. Classic Snape.',
  },
  {
    chapter: 10, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What password opens the One-Eyed Witch’s secret passage to Honeydukes?',
    options: ['Dissendium', 'Alohomora', 'Sugarquill', 'Mischief managed'],
    answer: 0,
    fact: 'Tap the witch’s hump and in you slide — right into the sweetshop’s cellar. One of only two secret passages Filch doesn’t know.',
  },
  {
    chapter: 10, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What drink does Harry try for the first time at the Three Broomsticks?',
    options: ['Foaming butterbeer', 'Gillywater', 'Pumpkin fizz', 'Firewhisky'],
    answer: 0,
    fact: 'Served hot by Madam Rosmerta herself. Warms you all the way down — the perfect drink for a boy who technically isn’t supposed to be there.',
  },
  {
    chapter: 10, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: According to Fudge, what was Black overheard muttering in his sleep in Azkaban?',
    options: ['“He’s at Hogwarts”', '“Twelve years”', '“The Grim comes”', '“Find the finger”'],
    answer: 0,
    fact: 'The same words, over and over. It’s why the Ministry is certain about where Black is heading — and why the dementors ring the school.',
  },
  {
    chapter: 13, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: How did Black get past Sir Cadogan and into Gryffindor Tower?',
    options: ['He had a list of the week’s passwords — Neville had written them down and lost them', 'He guessed the password', 'He climbed through a window', 'Sir Cadogan was asleep'],
    answer: 0,
    fact: 'Poor Neville: banned from Hogsmeade, and a Howler from his gran so loud it echoed through the entrance hall.',
  },
  {
    chapter: 14, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: When Snape orders the old parchment to reveal its secrets, what does it do instead?',
    options: ['Writes insults about him, signed Moony, Wormtail, Padfoot, and Prongs', 'Bursts into flames', 'Shows a fake homework page', 'Goes blank forever'],
    answer: 0,
    fact: 'One of the four even advised Professor Snape to wash his hair. Snape went from pale to a very interesting shade.',
  },

  // ---------- TALK IT OVER (no wrong answers — just talk!) ----------
  {
    chapter: 11, type: 'talk', cat: 'talk',
    q: 'Everyone — the Ministry, the teachers, the newspapers — says Sirius Black betrayed Harry’s parents. Harry has never met him. What do you think it does to Harry to hear all this? If Black could be questioned safely, what ONE question would you ask him?',
    talk: [
      'Why does hearing it secondhand make Harry so much angrier?',
      'Has anyone in these books ever turned out different from their reputation?',
    ],
    fact: 'For the grown-up: listen for whether your reader treats “everyone says” as the same thing as proof. Great pattern to notice in these books — remember what everyone said about Snape and the Stone.',
  },
  {
    chapter: 14, type: 'talk', cat: 'talk',
    q: 'Snape has hated Harry’s dad since their school days — and now he’s hard on Harry for things that happened before Harry was born. Is that fair? Why do you think some anger lasts twenty years?',
    talk: [
      'James once saved Snape’s life, and Snape HATES owing him. Why would being saved make someone angrier?',
      'Is there a difference between being unfair and being evil?',
    ],
    fact: 'For the grown-up: this is the book quietly building its biggest theme — the grown-ups’ school days are still shaping everything. No need to say that; just notice together how often the past keeps surfacing.',
  },
  {
    chapter: 8, type: 'talk', cat: 'talk',
    q: 'Lupin wears patched robes, looks tired and ill — and he’s the best Defense teacher they’ve ever had. Lockhart was dazzling and useless. What are these books trying to tell us about how people look versus what they are?',
    talk: [
      'Who else in the story looks one way and IS another?',
      'Why do you think the students trust Lupin so quickly?',
    ],
    fact: 'For the grown-up: appearances-versus-truth is a running theme of this whole series. Let your reader build the list themselves — Quirrell and Lockhart are the two big ones so far.',
  },
  {
    chapter: 12, type: 'talk', cat: 'talk',
    q: 'Lupin tells Harry that what he fears most of all is fear itself — and the Patronus that fights the dementors is made of a happy memory. What do you think the book is saying about how to fight fear?',
    talk: [
      'Why a MEMORY and not a spell word or a weapon?',
      'What memory would power your Patronus?',
    ],
    fact: 'For the grown-up: “what would your Patronus memory be?” is the single best car-ride question in this whole quiz. Take your time on it.',
  },
  {
    chapter: 13, type: 'talk', cat: 'talk',
    q: 'Hermione told a teacher about the Firebolt, and Ron blames Crookshanks for Scabbers — now the three friends are barely speaking. Can a friend be right and annoying at the same time? Who should apologize first, and for what exactly?',
    talk: [
      'Hermione was trying to protect Harry. Does being right make the broom-losing hurt less?',
      'What would YOU want a friend to do if they thought your favorite thing was dangerous?',
    ],
    fact: 'For the grown-up: Hagrid’s scolding in chapter 14 is the book’s own answer — value your friend more than brooms or rats. Kids usually get there on their own; give it a minute.',
  },
  {
    chapter: 9, type: 'talk', cat: 'talk',
    q: 'When dementors come near, Harry hears his mum and dad’s voices from the night he lost them — the worst sound in the world. And yet part of him almost wants to hear them again. Why do you think sad memories can feel precious too?',
    talk: [
      'Is it the sadness Harry wants, or the closeness?',
      'What does Lupin mean when he says the dementors affect Harry worse because of his past — not because he’s weak?',
    ],
    fact: 'For the grown-up: this one can go deep. Lupin’s line is the keeper: the things Harry hears are horrors, but they’re also the only memories he has of his parents’ voices. Handle with care and maybe a snack.',
  },
  {
    chapter: 9, type: 'talk', cat: 'talk',
    q: 'A big black dog keeps appearing — Magnolia Crescent, then the Quidditch stands — and Trelawney calls the Grim a death omen. Hermione thinks that’s rubbish. What’s YOUR theory about the dog? What clues would change your mind?',
    talk: [
      'Track the pattern: when exactly does the dog show up?',
      'So far in these books, have omens and predictions come true the way people expected?',
    ],
    fact: 'For the grown-up: hear the theory out, confirm nothing, and keep reading. A mystery is more fun unsolved.',
  },
  {
    chapter: 6, type: 'talk', cat: 'talk',
    q: 'Ron notices Hermione’s timetable is impossible — she seems to be in two classes at the same time, and she won’t explain. What’s your best theory? What clues have you spotted?',
    talk: [
      'How does she keep APPEARING right behind them?',
      'Why might she be keeping it secret even from her best friends?',
    ],
    fact: 'For the grown-up: collect the theory, confirm nothing, and ask again when the book is finished.',
  },
  {
    chapter: 11, type: 'talk', cat: 'talk',
    q: 'Buckbeak only did what hippogriffs do when they’re insulted — but the Malfoys have money and connections, and Hagrid isn’t good with words. Do you think Buckbeak’s hearing will be fair? What makes a trial fair or unfair?',
    talk: [
      'Who is the committee more likely to listen to — and why is that a problem?',
      'What could Harry, Ron, and Hermione actually DO to help?',
    ],
    fact: 'For the grown-up: let the unfairness sit — the book wants it felt. Fear and influence beating truth is worth naming out loud together.',
  },
]
