#!/usr/bin/env python3
"""Fourth batch of bridge words for Word Weaver.

Fills more 3-letter universals, common -K and -L ending 4-letter words
(huge crossword bridge value), and high-frequency 5-letter kid words.
"""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_bridges_v4.json")


def E(word, pos, grade, diff, defn, tags, root_lang, root_word, emergence,
      etym, synonyms=None, antonyms=None, families=None, related=None):
    return {
        "word": word,
        "part_of_speech": pos,
        "grade_level": grade,
        "difficulty": diff,
        "senses": [{
            "definition": defn,
            "tags": list(tags.keys()),
            "relevance": dict(tags),
        }],
        "history": {
            "root_language": root_lang,
            "root_word": root_word,
            "emergence": emergence,
            "etymology_note": etym,
        },
        "associations": {
            "synonyms": synonyms or [],
            "antonyms": antonyms or [],
            "families": families or [],
            "related_concepts": related or [],
        },
    }


ENTRIES = [
    # ============ 3-LETTER UNIVERSALS ============
    E("can", "noun", "preK", 1,
      "A metal container with a lid, used for food or drinks.",
      {"objects": 10, "containers": 10, "food": 7},
      "Old English", "canne", "Old English era",
      "From Old English 'canne' meaning a cup or vessel, a core Germanic word.",
      synonyms=["container", "tin"], families=["Objects", "Containers"],
      related=["jar", "tin", "soup", "open"]),

    E("saw", "noun", "K", 1,
      "A tool with sharp teeth used to cut wood.",
      {"objects": 10, "tools": 10},
      "Old English", "sagu", "Old English era",
      "From Old English 'sagu' meaning a cutting tool, a core Germanic word.",
      families=["Objects", "Tools"], related=["cut", "wood", "tool", "blade"]),

    E("paw", "noun", "preK", 1,
      "The foot of an animal that has claws, like a cat or dog.",
      {"animals": 10, "body": 9, "mammals": 8},
      "Old French", "powe", "13th Century",
      "From Old French 'powe' meaning the foot of an animal, of uncertain origin.",
      synonyms=["foot"], families=["Animals", "Body"],
      related=["cat", "dog", "claw", "foot"]),

    E("tow", "verb", "1", 2,
      "To pull something behind you with a rope or chain.",
      {"action": 10, "movement": 9, "vehicles": 7},
      "Old English", "togian", "Old English era",
      "From Old English 'togian' meaning to drag or pull, a core Germanic verb.",
      synonyms=["pull", "drag"], families=["Actions", "Vehicles"],
      related=["pull", "rope", "truck", "drag"]),

    E("wax", "noun", "K", 1,
      "A soft sticky substance used to make candles or polish things.",
      {"objects": 9, "materials": 9, "home": 7},
      "Old English", "weax", "Old English era",
      "From Old English 'weax' meaning the substance bees make, used for candles.",
      families=["Materials", "Objects"], related=["candle", "bee", "honey", "polish"]),

    E("doe", "noun", "1", 2,
      "A female deer.",
      {"animals": 10, "mammals": 10, "nature": 8},
      "Old English", "da", "Old English era",
      "From Old English 'da' meaning a female deer, a core Germanic word.",
      antonyms=["buck"], families=["Animals", "Mammals"],
      related=["deer", "buck", "fawn", "forest"]),

    E("foe", "noun", "1", 2,
      "An enemy; someone who fights against you.",
      {"people": 9, "feelings": 7},
      "Old English", "fah", "Old English era",
      "From Old English 'fah' meaning hostile or at war, a core Germanic word.",
      synonyms=["enemy"], antonyms=["friend", "ally"],
      families=["People"], related=["enemy", "fight", "battle", "rival"]),

    E("ewe", "noun", "1", 2,
      "A female sheep.",
      {"animals": 10, "farm": 10, "mammals": 9},
      "Old English", "eowu", "Old English era",
      "From Old English 'eowu' meaning a female sheep, related to other Germanic words.",
      antonyms=["ram"], families=["Animals", "Farm"],
      related=["sheep", "lamb", "ram", "wool"]),

    E("coo", "verb", "preK", 1,
      "To make a soft low sound like a dove or pigeon.",
      {"animals": 8, "sound": 10, "birds": 9},
      "Middle English", "coo", "16th Century",
      "Imitative of the soft sound made by doves and pigeons.",
      families=["Sound", "Animals"], related=["dove", "pigeon", "bird", "soft"]),

    E("moo", "verb", "preK", 1,
      "The deep sound a cow makes.",
      {"animals": 10, "sound": 10, "farm": 9},
      "Middle English", "moo", "16th Century",
      "Imitative of the lowing sound made by cattle.",
      families=["Sound", "Animals"], related=["cow", "farm", "bull", "sound"]),

    E("ebb", "verb", "2", 3,
      "To flow back, like the tide going out from the shore.",
      {"water": 10, "nature": 8, "action": 7},
      "Old English", "ebba", "Old English era",
      "From Old English 'ebba' meaning the falling of the tide.",
      antonyms=["flow"], families=["Water", "Nature"],
      related=["tide", "ocean", "flow", "wave"]),

    E("odd", "adj", "1", 2,
      "Strange or unusual, or not paired with another number.",
      {"comparison": 9, "math": 7, "feelings": 6},
      "Old Norse", "oddi", "13th Century",
      "From Old Norse 'oddi' meaning a triangle or odd point, brought to English by Norse settlers.",
      synonyms=["strange", "weird"], antonyms=["even", "normal"],
      families=["Comparison", "Math"], related=["strange", "weird", "even", "number"]),

    E("tip", "noun", "preK", 1,
      "The pointy end of something, or a helpful piece of advice.",
      {"shapes": 8, "position": 9, "advice": 7},
      "Middle English", "tip", "14th Century",
      "From Middle English 'tip' meaning a slender pointed end, of Scandinavian origin.",
      synonyms=["point", "end"], families=["Shapes", "Position"],
      related=["point", "end", "nose", "advice"]),

    E("zip", "verb", "preK", 1,
      "To close or open a zipper, or to move very quickly.",
      {"action": 10, "clothing": 8, "movement": 8},
      "English", "zip", "19th Century",
      "Imitative of the sound made by a quick, sharp movement.",
      families=["Actions", "Clothing"], related=["zipper", "fast", "coat", "pull"]),

    E("dip", "verb", "preK", 1,
      "To put something quickly into a liquid and take it out again.",
      {"action": 10, "food": 7, "water": 7},
      "Old English", "dyppan", "Old English era",
      "From Old English 'dyppan' meaning to immerse briefly in water.",
      families=["Actions", "Food"], related=["soak", "sauce", "splash", "water"]),

    E("sip", "verb", "preK", 1,
      "To drink in small amounts at a time.",
      {"action": 10, "drinks": 9, "food": 7},
      "Middle English", "sippen", "14th Century",
      "From Middle English 'sippen', possibly a quieter form of 'sup' (to drink).",
      synonyms=["drink", "sup"], families=["Actions", "Drinks"],
      related=["drink", "straw", "tea", "small"]),

    E("rip", "verb", "K", 1,
      "To tear something apart quickly.",
      {"action": 10, "movement": 7},
      "Middle English", "rippen", "15th Century",
      "From Middle English 'rippen', possibly of Scandinavian origin meaning to scratch or tear.",
      synonyms=["tear", "shred"], antonyms=["mend"],
      families=["Actions"], related=["tear", "shred", "break", "fabric"]),

    E("wig", "noun", "K", 1,
      "A fake covering of hair that someone wears on their head.",
      {"clothing": 8, "objects": 9, "appearance": 9},
      "English", "periwig", "17th Century",
      "Short for 'periwig', from French 'perruque' meaning a head of hair.",
      families=["Clothing", "Appearance"], related=["hair", "head", "costume", "fake"]),

    E("peg", "noun", "1", 2,
      "A small piece of wood, metal, or plastic used to hold things together or hang things on.",
      {"objects": 10, "tools": 8},
      "Middle Dutch", "pegge", "15th Century",
      "From Middle Dutch 'pegge' meaning a pin or short rod.",
      synonyms=["pin", "stake"], families=["Objects", "Tools"],
      related=["pin", "hook", "nail", "stake"]),

    E("oil", "noun", "K", 1,
      "A thick, smooth liquid that comes from plants, animals, or under the ground.",
      {"materials": 10, "food": 8, "science": 7},
      "Latin", "oleum", "13th Century",
      "From Latin 'oleum' meaning olive oil, through Old French 'oile'.",
      families=["Materials", "Food"], related=["olive", "cooking", "smooth", "slippery"]),

    E("rim", "noun", "1", 2,
      "The outer edge of something round, like a cup or a wheel.",
      {"shapes": 10, "objects": 8, "position": 8},
      "Old English", "rima", "Old English era",
      "From Old English 'rima' meaning a border or edge.",
      synonyms=["edge", "border"], families=["Shapes", "Position"],
      related=["edge", "wheel", "cup", "border"]),

    E("dam", "noun", "1", 2,
      "A wall built across a river to hold back the water.",
      {"objects": 9, "building": 9, "water": 9},
      "Middle English", "damme", "13th Century",
      "From Middle English 'damme' meaning a barrier across water, a core Germanic word.",
      synonyms=["barrier"], families=["Building", "Water"],
      related=["river", "wall", "water", "beaver"]),

    E("fad", "noun", "2", 2,
      "Something that is very popular for a short time.",
      {"social": 8, "time": 7, "behavior": 7},
      "English", "fad", "19th Century",
      "Of uncertain origin, possibly from 'fidfad' meaning fussy notion.",
      synonyms=["craze", "trend"], families=["Social", "Behavior"],
      related=["trend", "craze", "popular", "style"]),

    E("fun", "noun", "preK", 1,
      "Enjoyment, pleasure, or playful activity.",
      {"emotion": 10, "play": 10, "feelings": 10},
      "Middle English", "fonne", "17th Century",
      "From Middle English 'fonne' meaning a fool or sport, evolving to mean amusement.",
      synonyms=["enjoyment", "amusement"], antonyms=["work", "boring"],
      families=["Play", "Emotions"], related=["game", "play", "happy", "joy"]),

    E("ago", "adv", "K", 1,
      "In the past; before now.",
      {"time": 10},
      "Old English", "agan", "Middle English era",
      "From Middle English 'ago', a shortened form of 'agone' meaning gone by.",
      synonyms=["past", "before"], families=["Time"],
      related=["past", "before", "long", "back"]),

    E("pad", "noun", "preK", 1,
      "A soft piece of material used for cushioning or writing.",
      {"objects": 10, "materials": 8, "school": 6},
      "Middle Low German", "pad", "16th Century",
      "From Middle Low German 'pad' meaning a sole or cushion.",
      synonyms=["cushion", "notebook"], families=["Objects", "Materials"],
      related=["cushion", "soft", "paper", "writing"]),

    E("bog", "noun", "2", 2,
      "An area of soft wet muddy ground.",
      {"places": 10, "nature": 9, "water": 8},
      "Irish Gaelic", "bog", "14th Century",
      "From Irish Gaelic 'bog' meaning soft, describing the soft wet ground.",
      synonyms=["swamp", "marsh"], families=["Places", "Nature"],
      related=["swamp", "mud", "marsh", "wet"]),

    E("dab", "verb", "preK", 1,
      "To touch something quickly and lightly.",
      {"action": 10, "movement": 7},
      "Middle English", "dabben", "13th Century",
      "From Middle English 'dabben', possibly imitative of a soft tapping sound.",
      synonyms=["pat", "tap"], families=["Actions"],
      related=["touch", "tap", "pat", "paint"]),

    E("jab", "verb", "1", 2,
      "To poke someone or something quickly with a sharp object.",
      {"action": 10, "movement": 8},
      "Scottish", "job", "19th Century",
      "From Scottish 'job' meaning to peck or prod, of uncertain origin.",
      synonyms=["poke", "prod"], families=["Actions"],
      related=["poke", "prod", "punch", "stab"]),

    E("nip", "verb", "K", 1,
      "To bite something quickly and gently.",
      {"action": 10, "animals": 7},
      "Middle English", "nippen", "14th Century",
      "From Middle English 'nippen', of uncertain origin, possibly Scandinavian.",
      synonyms=["bite", "pinch"], families=["Actions"],
      related=["bite", "pinch", "puppy", "small"]),

    # ============ 4-LETTER COOK/LOOK/HOOK FAMILY ============
    E("cook", "verb", "preK", 1,
      "To prepare food by heating it.",
      {"action": 10, "food": 10, "kitchen": 10},
      "Old English", "coc", "Old English era",
      "From Old English 'coc' through Latin 'coquus', meaning one who cooks.",
      families=["Actions", "Kitchen"], related=["bake", "kitchen", "oven", "chef"]),

    E("look", "verb", "preK", 1,
      "To use your eyes to see something.",
      {"action": 10, "senses": 10, "body": 7},
      "Old English", "locian", "Old English era",
      "From Old English 'locian', a core Germanic verb for seeing.",
      synonyms=["see", "view", "watch"], families=["Actions", "Senses"],
      related=["see", "eye", "watch", "view"]),

    E("hook", "noun", "preK", 1,
      "A curved piece of metal used to hang or catch things.",
      {"objects": 10, "tools": 9, "fishing": 8},
      "Old English", "hoc", "Old English era",
      "From Old English 'hoc' meaning a hook or angle.",
      families=["Objects", "Fishing"], related=["fish", "hang", "curve", "loop"]),

    E("doll", "noun", "preK", 1,
      "A small toy made to look like a person or baby.",
      {"toys": 10, "objects": 9, "play": 9},
      "English", "doll", "16th Century",
      "Possibly from the female name Dorothy or Dolly, used affectionately for a child's toy.",
      families=["Toys", "Play"], related=["toy", "baby", "play", "puppet"]),

    E("fall", "verb", "preK", 1,
      "To drop down toward the ground.",
      {"action": 10, "movement": 10},
      "Old English", "feallan", "Old English era",
      "From Old English 'feallan', a core Germanic verb for dropping down.",
      synonyms=["drop", "tumble"], antonyms=["rise"],
      families=["Actions", "Movement"], related=["drop", "tumble", "leaf", "down"]),

    E("roll", "verb", "preK", 1,
      "To move along by turning over and over.",
      {"action": 10, "movement": 10, "shapes": 6},
      "Latin", "rotulare", "14th Century",
      "From Latin 'rotulare' meaning to turn, through Old French 'roller'.",
      synonyms=["turn", "spin"], families=["Actions", "Movement"],
      related=["ball", "wheel", "turn", "spin"]),

    E("tell", "verb", "preK", 1,
      "To say or share something with someone.",
      {"action": 10, "communication": 10, "language": 8},
      "Old English", "tellan", "Old English era",
      "From Old English 'tellan' meaning to count or recount, a core Germanic verb.",
      synonyms=["say", "share"], families=["Actions", "Communication"],
      related=["say", "talk", "share", "story"]),

    E("well", "noun", "preK", 1,
      "A deep hole in the ground that is used to get water.",
      {"objects": 9, "water": 10, "places": 8},
      "Old English", "wella", "Old English era",
      "From Old English 'wella' meaning a spring or source of water.",
      families=["Water", "Places"], related=["water", "hole", "spring", "deep"]),

    E("yell", "verb", "preK", 1,
      "To shout loudly.",
      {"action": 10, "sound": 10, "communication": 8},
      "Old English", "giellan", "Old English era",
      "From Old English 'giellan' meaning to cry out, a core Germanic verb.",
      synonyms=["shout", "scream"], antonyms=["whisper"],
      families=["Actions", "Sound"], related=["shout", "scream", "loud", "voice"]),

    E("tool", "noun", "preK", 1,
      "An object that helps you do a job.",
      {"objects": 10, "tools": 10, "work": 9},
      "Old English", "tol", "Old English era",
      "From Old English 'tol' meaning an instrument or implement.",
      synonyms=["instrument", "device"], families=["Objects", "Tools"],
      related=["hammer", "saw", "wrench", "work"]),

    E("wool", "noun", "preK", 1,
      "The soft thick hair of sheep that is used to make warm clothes.",
      {"materials": 10, "clothing": 9, "farm": 7},
      "Old English", "wull", "Old English era",
      "From Old English 'wull' meaning the soft hair of sheep, a core Germanic word.",
      families=["Materials", "Clothing"], related=["sheep", "yarn", "sweater", "warm"]),

    E("horn", "noun", "preK", 1,
      "A hard pointed growth on an animal's head, or an instrument that makes sound.",
      {"animals": 9, "body": 8, "music": 9},
      "Old English", "horn", "Old English era",
      "From Old English 'horn', a core Germanic word for the pointy projection or wind instrument.",
      families=["Animals", "Music"], related=["antler", "trumpet", "goat", "bull"]),

    E("earn", "verb", "1", 2,
      "To get money by working.",
      {"action": 10, "money": 10, "work": 9},
      "Old English", "earnian", "Old English era",
      "From Old English 'earnian' meaning to gain by labor or merit.",
      synonyms=["gain", "deserve"], antonyms=["spend", "lose"],
      families=["Actions", "Money"], related=["work", "pay", "money", "job"]),

    E("burn", "verb", "preK", 1,
      "To set on fire or be on fire.",
      {"action": 10, "fire": 10, "danger": 8},
      "Old English", "byrnan", "Old English era",
      "From Old English 'byrnan', a core Germanic verb for being aflame.",
      antonyms=["cool"], families=["Actions", "Fire"],
      related=["fire", "flame", "heat", "hot"]),

    E("turn", "verb", "preK", 1,
      "To move so you face a different direction.",
      {"action": 10, "movement": 10},
      "Latin", "tornare", "Old English era",
      "From Latin 'tornare' meaning to turn on a lathe, through Old French 'turner'.",
      synonyms=["rotate", "spin"], families=["Actions", "Movement"],
      related=["spin", "rotate", "around", "twist"]),

    E("harm", "verb", "1", 2,
      "To hurt someone or something.",
      {"action": 10, "danger": 9, "behavior": 8},
      "Old English", "hearm", "Old English era",
      "From Old English 'hearm' meaning hurt or injury.",
      synonyms=["hurt", "damage"], antonyms=["help", "heal"],
      families=["Actions", "Danger"], related=["hurt", "damage", "danger", "safe"]),

    E("farm", "noun", "preK", 1,
      "A place where people grow crops and raise animals.",
      {"places": 10, "agriculture": 10, "animals": 8},
      "Latin", "firma", "13th Century",
      "From Medieval Latin 'firma' meaning fixed payment or rented land, through Old French.",
      families=["Places", "Agriculture"], related=["barn", "field", "animal", "crop"]),

    # ============ 4-LETTER -AKE / -AME / -ILE ============
    E("tame", "adj", "K", 1,
      "Not wild; gentle and friendly to people.",
      {"animals": 10, "behavior": 9},
      "Old English", "tam", "Old English era",
      "From Old English 'tam' meaning domesticated or under human care.",
      antonyms=["wild"], families=["Animals", "Behavior"],
      related=["wild", "pet", "gentle", "domestic"]),

    E("fake", "adj", "K", 1,
      "Not real; made to look like something else.",
      {"comparison": 9, "objects": 7},
      "English", "fake", "19th Century",
      "Of uncertain origin, possibly from a thieves' cant word meaning to do or make.",
      synonyms=["false", "phony"], antonyms=["real", "genuine"],
      families=["Comparison"], related=["real", "false", "copy", "trick"]),

    E("take", "verb", "preK", 1,
      "To pick something up and hold it.",
      {"action": 10, "movement": 8},
      "Old Norse", "taka", "Old English era",
      "From Old Norse 'taka', a core Germanic verb meaning to grasp.",
      synonyms=["grab", "get"], antonyms=["give", "leave"],
      families=["Actions"], related=["give", "grab", "hold", "carry"]),

    E("wake", "verb", "preK", 1,
      "To stop sleeping; to open your eyes after sleep.",
      {"action": 10, "sleep": 10},
      "Old English", "wacian", "Old English era",
      "From Old English 'wacian' meaning to be awake or watch, a core Germanic verb.",
      antonyms=["sleep"], families=["Actions", "Sleep"],
      related=["sleep", "morning", "alarm", "rise"]),

    E("shake", "verb", "preK", 1,
      "To move quickly back and forth or up and down.",
      {"action": 10, "movement": 10},
      "Old English", "sceacan", "Old English era",
      "From Old English 'sceacan', a core Germanic verb for trembling motion.",
      synonyms=["wiggle", "tremble"], families=["Actions", "Movement"],
      related=["wiggle", "tremble", "rattle", "shiver"]),

    # ============ 4-LETTER -ILE / -IKE ============
    E("file", "noun", "K", 1,
      "A folder used to hold and organize papers.",
      {"school": 10, "objects": 9, "office": 8},
      "Latin", "filum", "16th Century",
      "From Latin 'filum' meaning a thread, since old files held papers strung on a thread.",
      families=["School", "Office"], related=["folder", "paper", "organize", "office"]),

    E("bike", "noun", "preK", 1,
      "A vehicle with two wheels that you push with your feet.",
      {"vehicles": 10, "transport": 9, "exercise": 8},
      "English", "bicycle", "19th Century",
      "Short for 'bicycle', from Latin 'bi-' (two) and Greek 'kyklos' (wheel).",
      synonyms=["bicycle"], families=["Vehicles", "Transport"],
      related=["bicycle", "wheel", "pedal", "ride"]),

    E("hike", "verb", "preK", 1,
      "To take a long walk, often in the woods or mountains.",
      {"action": 10, "exercise": 9, "outdoor": 10},
      "English", "hike", "19th Century",
      "Of uncertain origin, possibly a regional English word for walking vigorously.",
      synonyms=["walk", "trek"], families=["Actions", "Outdoor"],
      related=["walk", "trail", "mountain", "outdoor"]),

    E("like", "verb", "preK", 1,
      "To enjoy or feel good about something.",
      {"feelings": 10, "behavior": 8},
      "Old English", "lician", "Old English era",
      "From Old English 'lician' meaning to please or be agreeable.",
      synonyms=["enjoy", "love"], antonyms=["dislike"],
      families=["Feelings"], related=["love", "enjoy", "favorite", "happy"]),

    # ============ 4-LETTER -ONE / -OIN ============
    E("cone", "noun", "preK", 1,
      "A solid shape that is round at one end and pointed at the other.",
      {"shapes": 10, "food": 7, "objects": 7},
      "Greek", "konos", "16th Century",
      "From Greek 'konos' meaning a pine cone or geometric cone.",
      families=["Shapes"], related=["circle", "ice cream", "point", "pine"]),

    E("coin", "noun", "preK", 1,
      "A round piece of metal used as money.",
      {"money": 10, "objects": 9},
      "Latin", "cuneus", "14th Century",
      "From Latin 'cuneus' meaning a wedge, since coins were stamped with wedge-shaped dies, through Old French.",
      synonyms=["penny", "dime"], families=["Money", "Objects"],
      related=["money", "penny", "silver", "round"]),

    E("join", "verb", "preK", 1,
      "To put two or more things together, or to become part of a group.",
      {"action": 10, "combine": 10, "social": 7},
      "Latin", "iungere", "13th Century",
      "From Latin 'iungere' meaning to yoke together, through Old French 'joindre'.",
      synonyms=["connect", "unite"], antonyms=["separate", "leave"],
      families=["Actions", "Combining"], related=["connect", "team", "club", "together"]),

    # ============ 4-LETTER ACTIONS ============
    E("snap", "verb", "preK", 1,
      "To break something quickly with a sharp sound.",
      {"action": 10, "sound": 9, "movement": 8},
      "Middle Dutch", "snappen", "16th Century",
      "From Middle Dutch 'snappen' meaning to bite or seize, imitative of the quick sound.",
      synonyms=["break", "click"], families=["Actions", "Sound"],
      related=["break", "click", "twig", "photo"]),

    E("trap", "noun", "preK", 1,
      "A device used to catch animals, or a sneaky plan to catch someone.",
      {"objects": 9, "hunting": 9},
      "Old English", "treppe", "Old English era",
      "From Old English 'treppe' meaning a snare or trap.",
      synonyms=["snare"], families=["Objects", "Hunting"],
      related=["catch", "snare", "mouse", "cage"]),

    E("wrap", "verb", "preK", 1,
      "To cover something by folding paper or cloth around it.",
      {"action": 10, "objects": 7},
      "Middle English", "wrappen", "14th Century",
      "From Middle English 'wrappen' meaning to fold over, of uncertain origin.",
      synonyms=["cover", "fold"], antonyms=["unwrap"],
      families=["Actions"], related=["gift", "paper", "cover", "package"]),

    # ============ 5-LETTER HIGH-FREQUENCY ============
    E("brain", "noun", "preK", 1,
      "The organ inside your head that helps you think and learn.",
      {"body": 10, "anatomy": 10, "thinking": 10},
      "Old English", "brægen", "Old English era",
      "From Old English 'brægen' meaning the brain, a core Germanic word.",
      synonyms=["mind"], families=["Body", "Anatomy"],
      related=["head", "think", "smart", "learn"]),

    E("chest", "noun", "preK", 1,
      "The front part of your body between your neck and your waist.",
      {"body": 10, "anatomy": 10},
      "Old English", "cest", "Old English era",
      "From Old English 'cest' meaning a box or container, also the body part containing the heart and lungs.",
      synonyms=["box"], families=["Body", "Anatomy"],
      related=["heart", "lungs", "ribs", "torso"]),

    E("climb", "verb", "preK", 1,
      "To go up something using your hands and feet.",
      {"action": 10, "movement": 10, "exercise": 8},
      "Old English", "climban", "Old English era",
      "From Old English 'climban' meaning to ascend, a core Germanic verb.",
      synonyms=["ascend", "scale"], antonyms=["descend"],
      families=["Actions", "Movement"], related=["tree", "mountain", "ladder", "up"]),

    E("dream", "noun", "preK", 1,
      "The pictures and stories your mind makes while you sleep.",
      {"sleep": 10, "thinking": 9, "fantasy": 8},
      "Old English", "dream", "Old English era",
      "From Old English 'dream' originally meaning joy or music, evolving in Middle English to mean sleep visions.",
      families=["Sleep", "Thinking"], related=["sleep", "imagination", "night", "wish"]),

    E("field", "noun", "preK", 1,
      "A wide open piece of land, often used for crops or sports.",
      {"places": 10, "nature": 9, "sport": 7},
      "Old English", "feld", "Old English era",
      "From Old English 'feld' meaning open land or cultivated ground.",
      synonyms=["meadow", "pasture"], families=["Places", "Nature"],
      related=["grass", "farm", "soccer", "open"]),

    E("floor", "noun", "preK", 1,
      "The flat surface at the bottom of a room that you walk on.",
      {"home": 10, "building": 10},
      "Old English", "flor", "Old English era",
      "From Old English 'flor' meaning the surface on which one walks indoors.",
      families=["Home", "Building"], related=["ceiling", "ground", "rug", "wood"]),

    E("plane", "noun", "preK", 1,
      "A vehicle with wings that flies through the sky.",
      {"vehicles": 10, "transport": 10, "sky": 9},
      "Latin", "planum", "20th Century",
      "Short for 'airplane'. From Latin 'planum' meaning flat surface, since wings are flat.",
      synonyms=["airplane", "jet"], families=["Vehicles", "Transport"],
      related=["jet", "fly", "sky", "wings"]),

    E("shirt", "noun", "preK", 1,
      "A piece of clothing worn on the upper body, with sleeves and a collar.",
      {"clothing": 10},
      "Old English", "scyrte", "Old English era",
      "From Old English 'scyrte' meaning a short garment.",
      families=["Clothing"], related=["sleeve", "collar", "pants", "shirt"]),

    E("space", "noun", "preK", 1,
      "The wide area beyond Earth where stars and planets are; also empty room.",
      {"science": 9, "places": 9, "astronomy": 10},
      "Latin", "spatium", "13th Century",
      "From Latin 'spatium' meaning room or distance, through Old French 'espace'.",
      synonyms=["room", "universe"], families=["Science", "Astronomy"],
      related=["star", "planet", "universe", "moon"]),

    E("straw", "noun", "preK", 1,
      "A thin tube used to drink liquid, or dry stems of grain.",
      {"objects": 10, "food": 7, "plants": 7},
      "Old English", "streaw", "Old English era",
      "From Old English 'streaw' meaning dry stalks, related to 'strew' (to scatter).",
      families=["Objects", "Plants"], related=["drink", "hay", "barn", "stem"]),

    E("teach", "verb", "preK", 1,
      "To help someone learn something.",
      {"action": 10, "learning": 10, "school": 10},
      "Old English", "tæcan", "Old English era",
      "From Old English 'tæcan' meaning to show or instruct.",
      synonyms=["instruct", "educate"], antonyms=["learn"],
      families=["Actions", "Learning"], related=["learn", "school", "lesson", "student"]),

    E("track", "noun", "preK", 1,
      "A path made by something or someone moving along it; also a marked area for racing.",
      {"places": 9, "sport": 10, "marks": 8},
      "Old French", "trac", "15th Century",
      "From Old French 'trac' meaning a trace or footprint.",
      synonyms=["path", "trail"], families=["Sports", "Places"],
      related=["trail", "race", "footprint", "running"]),

    E("water", "noun", "preK", 1,
      "The clear liquid in rivers, lakes, and oceans that all living things need.",
      {"water": 10, "nature": 10, "life": 10},
      "Old English", "wæter", "Old English era",
      "From Old English 'wæter', a core Indo-European word for the essential liquid.",
      families=["Water", "Nature"], related=["drink", "river", "rain", "ocean"]),

    E("wheel", "noun", "preK", 1,
      "A round object that turns to make vehicles and machines move.",
      {"objects": 10, "machines": 10, "vehicles": 9},
      "Old English", "hweol", "Old English era",
      "From Old English 'hweol', a core Indo-European word for circular shape or rotating object.",
      families=["Objects", "Machines"], related=["car", "bike", "round", "tire"]),

    E("world", "noun", "preK", 1,
      "The planet Earth and everything on it.",
      {"places": 10, "geography": 10, "nature": 8},
      "Old English", "weorold", "Old English era",
      "From Old English 'weorold' meaning age of man, from 'wer' (man) + 'eald' (age).",
      synonyms=["earth", "globe"], families=["Places", "Geography"],
      related=["earth", "planet", "globe", "people"]),
]


def main(apply_changes=False):
    with open(LEXICON_PATH, "r", encoding="utf-8") as f:
        lex = json.load(f)
    existing = {(w["word"].strip().lower(), w.get("part_of_speech")) for w in lex}

    new_to_add = []
    skipped_dup = []
    for entry in ENTRIES:
        key = (entry["word"].lower(), entry["part_of_speech"])
        if key in existing:
            skipped_dup.append(entry["word"])
            continue
        new_to_add.append(entry)

    print("=" * 70)
    print("BRIDGE WORDS V4 — third density pack")
    print("=" * 70)
    print(f"\nProposed entries: {len(ENTRIES)}")
    print(f"Already in lexicon (skipped): {len(skipped_dup)}")
    print(f"Will add: {len(new_to_add)}")
    print(f"Lexicon: {len(lex)} → {len(lex) + len(new_to_add)}")

    if skipped_dup:
        print(f"\nSkipped (already present): {sorted(set(skipped_dup))}")

    from collections import Counter
    lens = Counter(len(e["word"]) for e in new_to_add)
    print(f"\nLength distribution: {dict(sorted(lens.items()))}")

    if not apply_changes:
        print(f"\nDry run. Apply with: python3 {os.path.basename(__file__)} --apply")
        return

    print(f"\nBacking up to {os.path.basename(BACKUP_PATH)} …")
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)
    lex.extend(new_to_add)
    with open(LEXICON_PATH, "w", encoding="utf-8") as f:
        json.dump(lex, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(lex)} entries to {os.path.basename(LEXICON_PATH)}")


if __name__ == "__main__":
    main(apply_changes="--apply" in sys.argv)
