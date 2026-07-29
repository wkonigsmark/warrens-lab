// Book 3 — Harry Potter and the Prisoner of Azkaban (FULLY READ ✔)
//
// ⚠️ SPOILER GATE: every question is tagged with the chapter it becomes safe in.
// The book is finished, so READ_UP_TO covers all 22 chapters and every twist —
// Lupin, the Marauders, Pettigrew, the Time-Turner — is fair game below.
//
// GOING FORWARD: this same chapter-gate mechanism is how future books (4+) get
// added safely while they're still being read — copy the pattern, set a lower
// READ_UP_TO, and keep these rules until that book is finished:
//  - Never let book 3 content foreshadow or hint at book 4+ events
//  - Cedric Diggory (introduced ch. 15 as a good sport) stays a positive,
//    uncomplicated character here — no foreshadowing of anything later
//  - Nothing about Pettigrew's escape implying future significance
//
// Question type 'talk' = an open discussion prompt with no wrong answer.
// `talk` = follow-up questions to keep it going; `fact` = notes for the grown-up.

export const READ_UP_TO = 22 // book finished! every chapter is unlocked

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

  // ============================================================
  // THE FINALE — chapters 15–22. Every twist is fair game below.
  // ============================================================

  // ---------- STORY ----------
  {
    chapter: 15, type: 'mc', cat: 'story',
    q: 'The Slytherins dress up as dementors to spook Harry during the Quidditch final. What happens this time?',
    options: ['Harry casts a full Patronus and stays on his broom', 'Harry falls again', 'Snape stops them first', 'The match is called off'],
    answer: 0,
    fact: 'All those lessons with Lupin paid off. Gryffindor won the match — and the Quidditch Cup.',
  },
  {
    chapter: 15, type: 'mc', cat: 'story',
    q: 'Who is the talented Ravenclaw Seeker Harry has to beat in the final?',
    options: ['Cho Chang', 'Roger Davies', 'Penelope Clearwater', 'Padma Patil'],
    answer: 0,
    fact: 'She’s a very good flier. This won’t be the last you hear of her.',
  },
  {
    chapter: 16, type: 'mc', cat: 'story',
    q: 'What does the Committee for the Disposal of Dangerous Creatures decide about Buckbeak?',
    options: ['Guilty — his execution is scheduled', 'Not guilty — he’s freed', 'The case is delayed a year', 'He’s sent away from Hogwarts instead'],
    answer: 0,
    fact: 'Lucius Malfoy’s influence on the committee did exactly what Hagrid feared. A date is set — at sunset.',
  },
  {
    chapter: 16, type: 'mc', cat: 'story',
    q: 'During the Divination exam, something strange happens to Professor Trelawney. What?',
    options: ['She falls into a real trance and speaks a genuine prophecy', 'She faints', 'She predicts her own death', 'She refuses to give Harry a grade'],
    answer: 0,
    fact: 'Her voice went harsh, her eyes rolled back — completely unlike her usual dramatics. She remembered none of it afterward.',
  },
  {
    chapter: 16, type: 'mc', cat: 'story',
    q: 'In her trance, Trelawney speaks of a hidden, loyal servant preparing to escape. Roughly how long does she say he’s been imprisoned?',
    options: ['Twelve years', 'One year', 'A few months', 'Forever'],
    answer: 0,
    fact: 'Nobody in the room understood what it meant — including, at that moment, Harry.',
  },
  {
    chapter: 17, type: 'mc', cat: 'story',
    q: 'What makes Ron chase Scabbers straight toward the Whomping Willow?',
    options: ['Scabbers bites him and bolts, and a huge black dog drags them both underground', 'Scabbers runs there on his own', 'Hermione’s cat chases them both', 'Hagrid asks him to check a burrow'],
    answer: 0,
    fact: 'The Willow batters Harry and Hermione as they scramble after him — until they find the tunnel entrance at its roots.',
  },
  {
    chapter: 17, type: 'mc', cat: 'story',
    q: 'Where does the secret tunnel under the Whomping Willow lead?',
    options: ['The Shrieking Shack', 'Hagrid’s hut', 'The Chamber of Secrets', 'Hogsmeade station'],
    answer: 0,
    fact: 'Supposedly the most haunted building in Britain. Turns out its “ghosts” had a much stranger explanation.',
  },
  {
    chapter: 17, type: 'mc', cat: 'story',
    q: 'What does the big black dog turn out to be?',
    options: ['Sirius Black, in Animagus form', 'A regular stray', 'Snape in disguise', 'A Grim, exactly as Trelawney warned'],
    answer: 0,
    fact: 'An unregistered Animagus — a wizard who can transform into an animal at will. Padfoot, to his old friends.',
  },
  {
    chapter: 17, type: 'mc', cat: 'story',
    q: 'Who else shows up at the Shrieking Shack, wearing Harry’s own invisibility cloak?',
    options: ['Snape, who’d been trailing them all year', 'Dumbledore', 'Fudge', 'Percy'],
    answer: 0,
    fact: 'Harry had dropped the cloak earlier that night. Snape used it to follow — and burst in ready to hand Sirius straight to the dementors.',
  },
  {
    chapter: 18, type: 'mc', cat: 'story',
    q: 'What secret has Lupin kept since he was a student?',
    options: ['He is a werewolf', 'He is Sirius’s brother', 'He’s a wanted criminal too', 'He can see the future'],
    answer: 0,
    fact: 'Bitten as a small boy. Dumbledore let him attend Hogwarts anyway — one of the kindest things anyone ever did for him.',
  },
  {
    chapter: 18, type: 'mc', cat: 'story',
    q: 'Why did James, Sirius, and Peter secretly become illegal Animagi while still students?',
    options: ['To keep Lupin company safely during his transformations', 'To spy on Slytherin', 'To sneak into Hogsmeade', 'To win a bet with Snape'],
    answer: 0,
    fact: 'A werewolf is far less dangerous around animals than around people. Three best friends, learning one of the hardest kinds of magic there is, just to sit with him.',
  },
  {
    chapter: 18, type: 'mc', cat: 'story',
    q: 'Which four friends made the Marauder’s Map together at school?',
    options: ['James, Sirius, Peter, and Lupin', 'James, Snape, Sirius, and Lupin', 'Hagrid, James, Sirius, and Peter', 'Dumbledore, James, Sirius, and Lupin'],
    answer: 0,
    fact: 'Moony, Wormtail, Padfoot, and Prongs — the same four names signed to the insults Snape uncovered back in chapter 14.',
  },
  {
    chapter: 18, type: 'mc', cat: 'story',
    q: 'Who was secretly the Potters’ true Secret-Keeper the night Voldemort found them — not Sirius, as everyone believed?',
    options: ['Peter Pettigrew', 'Lupin', 'Dumbledore', 'Hagrid'],
    answer: 0,
    fact: 'They switched at the last moment — Sirius seemed the obvious choice, so Peter seemed like the safer, unexpected one. It was the opposite.',
  },
  {
    chapter: 18, type: 'mc', cat: 'story',
    q: 'How did Peter Pettigrew fake his own death and frame Sirius for it?',
    options: ['He cut off his own finger, blew up the street, and escaped as a rat', 'He used Polyjuice Potion to look like Sirius', 'He forged a confession letter', 'He paid dementors to lie'],
    answer: 0,
    fact: 'A dozen Muggles were hurt in the blast. All anyone ever found of “Peter” was that one finger — enough to convince the whole wizarding world.',
  },
  {
    chapter: 18, type: 'mc', cat: 'story',
    q: 'What is Scabbers, Ron’s “ordinary” pet rat, really?',
    options: ['Peter Pettigrew, hiding as an unregistered Animagus', 'A cursed toy', 'Percy’s old pet', 'Nothing unusual at all'],
    answer: 0,
    fact: 'Missing exactly the same finger. He’d been living safely under their noses for twelve years.',
  },
  {
    chapter: 19, type: 'mc', cat: 'story',
    q: 'When Peter is forced to transform back into a man, what does he do?',
    options: ['Grovels and begs for mercy, blaming Voldemort’s power', 'Attacks everyone at once', 'Confesses proudly', 'Stays silent'],
    answer: 0,
    fact: 'Small, balding, watery-eyed — nothing like the brave friend James and Sirius remembered.',
  },
  {
    chapter: 19, type: 'mc', cat: 'story',
    q: 'What goes wrong on the walk back up to the castle?',
    options: ['Lupin forgot his potion and transforms under the full moon', 'Fudge arrives too early', 'Buckbeak escapes', 'Snape wakes up'],
    answer: 0,
    fact: 'Snape usually brews him the Wolfsbane Potion every month to keep his mind human even while transformed. In all the chaos, Lupin never drank it that night.',
  },
  {
    chapter: 19, type: 'mc', cat: 'story',
    q: 'Who protects Harry, Ron, and Hermione when werewolf-Lupin turns dangerous?',
    options: ['Sirius, transforming into Padfoot to hold him off', 'Snape', 'Buckbeak', 'Dumbledore, arriving just in time'],
    answer: 0,
    fact: 'A werewolf will attack humans but not fight another animal the same way. Sirius took a bad mauling doing it.',
  },
  {
    chapter: 19, type: 'mc', cat: 'story',
    q: 'How does Peter escape in the chaos of that night?',
    options: ['He grabs a dropped wand, transforms back into a rat, and scurries off', 'He Apparates away', 'He fights his way past everyone', 'Snape lets him go'],
    answer: 0,
    fact: 'And just like that, twelve years of proof walked off on four tiny legs.',
  },
  {
    chapter: 19, type: 'mc', cat: 'story',
    q: 'What happens to Sirius by the lake once he’s cornered again?',
    options: ['Dementors swarm him and nearly perform the Kiss, until a mysterious Patronus drives them off', 'He’s recaptured quietly', 'He escapes on Buckbeak', 'Fudge arrests him peacefully'],
    answer: 0,
    fact: 'Harry saw someone across the water cast an enormous, glowing shield before he blacked out — and was sure, for a moment, it was his father.',
  },
  {
    chapter: 20, type: 'mc', cat: 'story',
    q: 'When Harry wakes in the hospital wing, what has happened to Sirius?',
    options: ['He’s been recaptured and is awaiting the Dementor’s Kiss', 'He’s escaped for good', 'He’s been officially cleared', 'He’s already been sent to Azkaban'],
    answer: 0,
    fact: 'The Kiss removes a person’s soul forever. Fudge is satisfied the case is finally closed.',
  },
  {
    chapter: 20, type: 'mc', cat: 'story',
    q: 'Whose version of events does the Ministry believe — Harry and Hermione’s, or Snape’s?',
    options: ['Snape’s', 'Harry and Hermione’s', 'Nobody’s — they open a new investigation', 'Lupin’s'],
    answer: 0,
    fact: 'The full truth of that night says everyone was bewitched. Being right isn’t always enough when the person with more power tells a simpler story.',
  },
  {
    chapter: 20, type: 'quote', cat: 'story',
    quote: 'What we need is more time.',
    options: ['Dumbledore', 'McGonagall', 'Snape', 'Hermione'],
    answer: 0,
    fact: 'He said it looking straight at Harry and Hermione — the biggest hint in the whole book, delivered completely calmly.',
  },
  {
    chapter: 21, type: 'mc', cat: 'story',
    q: 'What has Hermione secretly been using all year to attend impossible numbers of classes?',
    options: ['A Ministry-issued Time-Turner', 'A cloning charm', 'Extra-strength Skele-Gro', 'Nothing — she just never sleeps'],
    answer: 0,
    fact: 'McGonagall approved it herself. A tiny hourglass on a chain — one turn sends you backward exactly one hour.',
  },
  {
    chapter: 21, type: 'mc', cat: 'story',
    q: 'What do Harry and Hermione do FIRST after traveling back three hours?',
    options: ['Secretly free Buckbeak before the execution', 'Warn Dumbledore', 'Confront Peter directly', 'Rescue Sirius immediately'],
    answer: 0,
    fact: 'The executioner’s axe fell on empty air. Buckbeak was already gone, hidden with Hagrid’s pumpkin patch as a witness.',
  },
  {
    chapter: 21, type: 'mc', cat: 'story',
    q: 'Watching the night replay from hiding, Harry realizes something about the Patronus that saved everyone by the lake. What?',
    options: ['It was Harry himself, from the future — not his father', 'It was actually Dumbledore', 'It was Hermione the whole time', 'It never happened — he imagined it'],
    answer: 0,
    fact: 'He’d spent the whole night sure he’d seen his dad. He’d actually seen himself.',
  },
  {
    chapter: 21, type: 'mc', cat: 'story',
    q: 'What shape does Harry’s Patronus finally take?',
    options: ['A stag — the same as his father’s Animagus form', 'A phoenix', 'A wolf', 'A lion'],
    answer: 0,
    fact: 'Prongs. Even without meaning to, Harry carried a piece of his father into that moment.',
  },
  {
    chapter: 21, type: 'mc', cat: 'story',
    q: 'How do Harry and Hermione get Sirius away from the tower before the Kiss can happen?',
    options: ['They fly him out on Buckbeak’s back', 'They use the Time-Turner again', 'Dumbledore teleports him away', 'They sneak him out through the tunnel'],
    answer: 0,
    fact: 'Straight out the window and into the night sky — while Snape, stunned and confused, never even sees it happen.',
  },
  {
    chapter: 22, type: 'mc', cat: 'story',
    q: 'By the end of the book, is Sirius officially cleared of the murder charges?',
    options: ['No — he’s still a fugitive, since Peter got away with no other proof', 'Yes, completely', 'Only partly — he’s on probation', 'The Ministry never finds out any of it'],
    answer: 0,
    fact: 'Free from the Kiss, but not free to walk around. He has to stay in hiding — an innocent man, still running.',
  },
  {
    chapter: 22, type: 'mc', cat: 'story',
    q: 'Why does Lupin resign as Defense Against the Dark Arts teacher?',
    options: ['His werewolf secret gets out and he doesn’t want to put students or parents through the fear of it', 'He’s arrested alongside Sirius', 'Dumbledore fires him', 'He decides to go looking for Sirius instead'],
    answer: 0,
    fact: 'The best Defense teacher Harry ever had at Hogwarts — gone because of something he never chose and never hurt anyone with.',
  },
  {
    chapter: 22, type: 'mc', cat: 'story',
    q: 'Who lets Lupin’s secret slip to the whole school?',
    options: ['Snape', 'Fudge', 'Draco Malfoy', 'Percy'],
    answer: 0,
    fact: 'He’d been ordered to stay quiet about the real events of that night — so he took his frustration out the only way he had left.',
  },
  {
    chapter: 22, type: 'mc', cat: 'story',
    q: 'What does Sirius arrange for Harry, in secret, before next year?',
    options: ['Permission to visit Hogsmeade, signed as Harry’s godfather', 'A new Firebolt', 'A place to live with him', 'A pardon from the Ministry'],
    answer: 0,
    fact: 'A small, quiet gift from a man who’d just lost everything twice over — and still thought of Harry first.',
  },

  // ---------- HEART & COURAGE ----------
  {
    chapter: 19, type: 'mc', cat: 'heart',
    q: 'Sirius and Lupin want to kill Peter for what he did. Why does Harry stop them?',
    options: ['He says his father wouldn’t have wanted his two best friends to become killers', 'He feels sorry for Peter', 'He wants Peter to suffer longer in Azkaban', 'He’s afraid of getting in trouble'],
    answer: 0,
    fact: 'A twelve-year-old, in the middle of the worst night of his life, choosing mercy over revenge for the two grown men he loves most.',
  },
  {
    chapter: 18, type: 'mc', cat: 'heart',
    q: 'How did Sirius keep his mind clear through twelve years in Azkaban, when it breaks most prisoners?',
    options: ['Knowing he was truly innocent gave him something the dementors couldn’t take, and turning into Padfoot let him think simpler animal thoughts', 'He had a secret escape plan the whole time', 'The dementors left him alone', 'He doesn’t explain it'],
    answer: 0,
    fact: 'Even his enemies couldn’t steal the one true thing he knew about himself. That’s a kind of strength that doesn’t look like fighting.',
  },
  {
    chapter: 20, type: 'mc', cat: 'heart',
    q: 'Dumbledore believes Harry and Hermione’s wild story over the Ministry’s official one — even though he can’t say so publicly. What does that show about him?',
    options: ['He trusts people he knows, even when the truth is inconvenient', 'He doesn’t respect the Ministry’s rules', 'He already knew the whole story', 'He just likes Harry more than Fudge'],
    answer: 0,
    fact: '“I have no power to make other men see the truth.” He couldn’t fix it by force — so he quietly showed them how to fix it themselves.',
  },
  {
    chapter: 22, type: 'mc', cat: 'heart',
    q: 'Lupin leaves Hogwarts quietly rather than fight to keep a job he loves and is brilliant at. What does his graceful exit say about him?',
    options: ['He’d rather protect others’ comfort than demand fairness for himself', 'He was secretly relieved to leave', 'He never really liked teaching', 'He agreed the parents were right to be afraid'],
    answer: 0,
    fact: 'He never raises his voice about it, never blames the students. Some kinds of courage are quiet ones.',
  },
  {
    chapter: 17, type: 'mc', cat: 'heart',
    q: 'Even with a broken leg and everyone shouting around him, what does Ron do first, before anyone explains anything?',
    options: ['Defends Scabbers, refusing to believe his own pet could be anything sinister', 'Runs for help', 'Sides with Sirius immediately', 'Faints from the pain'],
    answer: 0,
    fact: 'Loyalty to something small and familiar, even when it turns out to be wrong — a very Ron thing to do, and not a bad instinct to have.',
  },

  // ---------- SUPERFAN ----------
  {
    chapter: 18, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: Which Marauder nickname belongs to Sirius Black?',
    options: ['Padfoot', 'Prongs', 'Moony', 'Wormtail'],
    answer: 0,
    fact: 'His Animagus form is a great black dog — which is exactly why so many people mistook him for a Grim.',
  },
  {
    chapter: 18, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: Which Marauder nickname belongs to Harry’s father, James?',
    options: ['Prongs', 'Padfoot', 'Moony', 'Wormtail'],
    answer: 0,
    fact: 'His Animagus form is a stag — which turns out to matter a great deal by the end of the book.',
  },
  {
    chapter: 18, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: Which Marauder nickname belongs to Peter Pettigrew?',
    options: ['Wormtail', 'Padfoot', 'Prongs', 'Moony'],
    answer: 0,
    fact: 'A rat, fittingly. He spent twelve years living as one, so it stopped being a nickname and started being a hiding spot.',
  },
  {
    chapter: 18, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: Why is Lupin called “Moony,” even though he never learned to become an Animagus himself?',
    options: ['It’s a nickname for his werewolf condition, tied to the full moon', 'He’s afraid of the moon', 'He named himself after the map', 'Sirius picked it as a joke'],
    answer: 0,
    fact: 'The other three earned animal forms just to keep him company — Moony never needed one of his own to be part of the group.',
  },
  {
    chapter: 18, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What does Sirius say is the mistake he’ll never forgive himself for?',
    options: ['Convincing James and Lily to make Peter their Secret-Keeper instead of him', 'Becoming an Animagus', 'Trusting Snape', 'Getting caught by the Ministry'],
    answer: 0,
    fact: 'He thought he was being clever — nobody would suspect quiet, unremarkable Peter. That’s exactly what Peter was counting on.',
  },
  {
    chapter: 17, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: After Lupin disarms Snape in the Shrieking Shack, what do they do with him?',
    options: ['Bind and levitate him along behind them, unconscious', 'Leave him locked in the Shack', 'Send him back to the castle alone', 'Wake him up right away'],
    answer: 0,
    fact: 'Knocked out cold, floating along like luggage, while the four of them sort out twelve years of lies. He missed the whole thing.',
  },
  {
    chapter: 21, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What rule does Dumbledore give Harry and Hermione about using the Time-Turner?',
    options: ['Don’t be seen by their past selves, and use it only this once', 'Never go back more than an hour', 'Only Hermione may touch it', 'Tell no one, ever, under any circumstance'],
    answer: 0,
    fact: 'Seeing your own past self is supposed to be deeply dangerous. They spend the whole rescue hiding from themselves.',
  },
  {
    chapter: 15, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What position does Cho Chang play for Ravenclaw?',
    options: ['Seeker', 'Chaser', 'Keeper', 'Beater'],
    answer: 0,
    fact: 'She goes head-to-head with Harry for the Snitch in the Cup final — his hardest opponent yet.',
  },
  {
    chapter: 22, type: 'mc', cat: 'superfan',
    q: 'SUPERFAN: What does Sirius send Ron as an apology gift for the loss of Scabbers?',
    options: ['A tiny, hyperactive owl', 'A new rat', 'A Firebolt of his own', 'A photograph of James and Lily'],
    answer: 0,
    fact: 'Ron ends up naming him Pigwidgeon — not exactly the name he’d have picked, but it sticks.',
  },
  {
    chapter: 20, type: 'tf', cat: 'superfan',
    q: 'SUPERFAN: The dementors are permanently removed from the Hogwarts grounds by the end of the book.',
    answer: true,
    fact: 'After everything they caused that year — including attacking Harry mid-air during a Quidditch match — Dumbledore has had more than enough of them.',
  },
  {
    chapter: 16, type: 'tf', cat: 'superfan',
    q: 'SUPERFAN: Professor Trelawney remembers making a real prophecy in the exam.',
    answer: false,
    fact: 'She has no memory of it afterward at all — completely unlike her usual overdramatic predictions, which is exactly what made this one different.',
  },
  {
    chapter: 19, type: 'odd', cat: 'superfan',
    q: 'SUPERFAN: Which of these did NOT happen on the night everything is revealed?',
    options: ['Fudge personally arrives to arrest Peter on the spot', 'Lupin transforms under the full moon', 'Sirius fights Lupin off in his dog form', 'Peter escapes as a rat'],
    answer: 0,
    fact: 'Fudge shows up later, at the castle — and by then, Peter is long gone and nobody can prove a thing.',
  },

  // ---------- TALK IT OVER ----------
  {
    chapter: 18, type: 'talk', cat: 'talk',
    q: 'Now you know the truth — Sirius spent twelve years in Azkaban for something Peter did, while Peter lived safely as a pet in your own house. Look back at everything you believed about Sirius before chapter 17. What made it so easy for the WHOLE wizarding world to believe the wrong story for twelve years?',
    talk: [
      'Was there ever a moment earlier in the book that should have made people doubt the official story?',
      'What would it take to convince a whole world they’d been wrong for over a decade?',
    ],
    fact: 'For the grown-up: this is the book’s biggest theme, right out in the open now — a confident, repeated story can beat the truth for a very long time. Worth naming that out loud.',
  },
  {
    chapter: 19, type: 'talk', cat: 'talk',
    q: 'Harry stops Sirius and Lupin from killing Peter, even after everything Peter did. Do you agree with that choice? Why might mercy matter even for someone who clearly doesn’t deserve it?',
    talk: [
      'Is there a difference between mercy and letting someone off the hook?',
      'Would you have made the same choice Harry did?',
    ],
    fact: 'For the grown-up: no right answer here — some kids will passionately disagree with Harry, and that’s a great conversation, not a wrong one.',
  },
  {
    chapter: 22, type: 'talk', cat: 'talk',
    q: 'Lupin loses his job because parents are afraid of him once his secret is known — even though he never hurt a single student and was one of the best teachers Harry ever had. Is that fair? What do you think about people being judged for something they can’t control?',
    talk: [
      'Was anyone in the story actually harmed by Lupin being a teacher?',
      'What would you have said to the worried parents, if you got the chance?',
    ],
    fact: 'For the grown-up: this one tends to land hard and honestly with kids — let it. It’s the book quietly teaching empathy through unfairness.',
  },
  {
    chapter: 22, type: 'talk', cat: 'talk',
    q: 'At the very end, the Ministry still doesn’t officially believe Sirius is innocent, so he has to keep hiding. Does the ending feel fully fair to you? Can something be true even when the people in charge won’t admit it?',
    talk: [
      'What would it take for Sirius to finally be safe and free?',
      'Does a happy ending have to mean everything gets fixed?',
    ],
    fact: 'For the grown-up: it’s okay for a book to end with something still unresolved — that’s a genuinely useful thing for kids to sit with.',
  },
  {
    chapter: 21, type: 'talk', cat: 'talk',
    q: 'Harry’s Patronus turns out to be a stag — the same shape as his father’s Animagus form. Why do you think the author connected Harry’s happiest magic to his dad like that?',
    talk: [
      'What memory do you think Harry used to cast it?',
      'If your Patronus took the shape of someone you love, who would it be?',
    ],
    fact: 'For the grown-up: a lovely one to circle back to after the ch.12 Patronus talk question — see how the answer has grown now that the mystery’s resolved.',
  },
]
