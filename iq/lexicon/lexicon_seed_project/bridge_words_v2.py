#!/usr/bin/env python3
"""Second batch of bridge words for the Word Weaver crossword.

Focus: high-frequency 3-5 letter words at preK-2nd grade that act as
crossword connectors. Generator picks them up automatically once merged.

Filters out any words already in lexicon_seed.json. Dry-run by default;
pass --apply to merge directly into lexicon_seed.json (with backup).
"""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_bridges_v2.json")


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
    # ============ 3-LETTER VEHICLES + FAMILY ============
    E("car", "noun", "preK", 1,
      "A small vehicle with four wheels that people drive on roads.",
      {"vehicles": 10, "transport": 10, "objects": 8},
      "Old French", "carre", "14th Century",
      "From Old French 'carre', meaning a cart or wagon, through Latin 'carrus'.",
      synonyms=["auto", "automobile"], families=["Vehicles", "Transport"],
      related=["truck", "drive", "wheel", "road"]),

    E("bus", "noun", "preK", 1,
      "A long vehicle that carries many people from place to place.",
      {"vehicles": 10, "transport": 10, "school": 7},
      "Latin", "omnibus", "19th Century",
      "Shortened from 'omnibus', Latin for 'for all'. The full name described public vehicles that anyone could ride.",
      families=["Vehicles", "Transport"], related=["car", "school", "ride", "wheel"]),

    E("van", "noun", "K", 1,
      "A boxy vehicle bigger than a car, used to carry people or things.",
      {"vehicles": 10, "transport": 10, "objects": 7},
      "English", "caravan", "19th Century",
      "Shortened from 'caravan', from Persian 'karwan' meaning a group of travelers.",
      families=["Vehicles", "Transport"], related=["car", "truck", "deliver", "drive"]),

    E("gas", "noun", "1", 2,
      "An invisible substance like air, or fuel used to power cars.",
      {"science": 9, "vehicles": 6, "energy": 8},
      "Dutch", "gas", "17th Century",
      "Coined by Flemish chemist Jan Baptist van Helmont, possibly from Greek 'khaos' meaning empty space.",
      families=["Science", "Energy"], related=["fuel", "air", "car", "fire"]),

    E("mom", "noun", "preK", 1,
      "What many children call their mother.",
      {"family": 10, "people": 10, "love": 8},
      "English", "mom", "19th Century",
      "A short and affectionate form of 'mother', common in American English.",
      synonyms=["mother", "mama", "mommy"], families=["Family"],
      related=["mother", "dad", "parent", "love"]),

    E("dad", "noun", "preK", 1,
      "What many children call their father.",
      {"family": 10, "people": 10, "love": 8},
      "English", "dad", "16th Century",
      "Of childlike origin, similar to many languages' first words for father. Used affectionately in English for centuries.",
      synonyms=["father", "papa", "daddy"], families=["Family"],
      related=["father", "mom", "parent", "love"]),

    E("cub", "noun", "K", 1,
      "A baby bear, lion, tiger, or other large wild animal.",
      {"animals": 10, "babies": 9, "mammals": 9},
      "Middle English", "cubbe", "16th Century",
      "From Middle English 'cubbe', of uncertain origin, used for the young of large mammals.",
      families=["Animals", "Babies"], related=["bear", "lion", "tiger", "baby"]),

    E("pup", "noun", "preK", 1,
      "A baby dog, also called a puppy.",
      {"animals": 10, "babies": 9, "mammals": 8},
      "English", "puppy", "16th Century",
      "Short form of 'puppy', from Middle French 'poupée' meaning doll, referring to a small playful animal.",
      synonyms=["puppy"], families=["Animals", "Babies"],
      related=["dog", "baby", "bark", "play"]),

    # ============ 3-LETTER CONTAINERS + OBJECTS ============
    E("box", "noun", "preK", 1,
      "A square or rectangular container with sides and usually a lid.",
      {"objects": 10, "containers": 10, "home": 6},
      "Latin", "buxis", "Old English era",
      "From Latin 'buxis' through Old English 'box', originally meaning a container made of boxwood.",
      synonyms=["container", "crate"], families=["Objects", "Containers"],
      related=["bag", "container", "pack", "gift"]),

    E("cap", "noun", "preK", 1,
      "A soft hat with a curved brim in front.",
      {"clothing": 10, "objects": 8},
      "Latin", "cappa", "Old English era",
      "From Late Latin 'cappa' meaning a hooded covering, through Old English 'cæppe'.",
      synonyms=["hat"], families=["Clothing"],
      related=["hat", "head", "wear", "brim"]),

    E("net", "noun", "K", 1,
      "A piece of woven holes used for catching fish, sports, or trapping things.",
      {"sports": 9, "fishing": 10, "objects": 8},
      "Old English", "net", "Old English era",
      "From Old English 'net', a core Germanic word for woven mesh.",
      synonyms=["mesh"], families=["Sports", "Fishing"],
      related=["fish", "catch", "weave", "trap"]),

    E("top", "noun", "preK", 1,
      "The highest part of something, or a toy that spins on a point.",
      {"position": 10, "toys": 7, "shapes": 6},
      "Old English", "top", "Old English era",
      "From Old English 'topp' meaning the highest point or crest.",
      antonyms=["bottom"], families=["Position", "Toys"],
      related=["bottom", "high", "spin", "head"]),

    E("pop", "noun", "preK", 1,
      "A sudden short sound like a bubble bursting.",
      {"sound": 10, "action": 7},
      "Middle English", "pop", "14th Century",
      "An imitative word — the sound itself was the origin.",
      families=["Sound"], related=["bubble", "burst", "balloon", "snap"]),

    E("mop", "noun", "K", 1,
      "A cleaning tool with a long handle and soft strings on the end.",
      {"home": 10, "cleaning": 10, "objects": 8},
      "Latin", "mappa", "16th Century",
      "Of uncertain origin, possibly from Latin 'mappa' meaning napkin or cloth.",
      families=["Home", "Cleaning"], related=["broom", "clean", "floor", "wet"]),

    E("log", "noun", "K", 1,
      "A thick piece of a tree trunk or branch.",
      {"plants": 9, "trees": 10, "wood": 10},
      "Middle English", "logge", "14th Century",
      "From Middle English 'logge', of uncertain Scandinavian origin.",
      families=["Trees", "Materials"], related=["tree", "wood", "fire", "branch"]),

    E("jet", "noun", "1", 2,
      "A very fast airplane powered by jet engines.",
      {"vehicles": 10, "transport": 9, "sky": 8},
      "Latin", "jactare", "16th Century",
      "From Latin 'jactare' meaning to throw, since jet engines throw out hot gas.",
      families=["Vehicles", "Transport"], related=["plane", "fly", "speed", "sky"]),

    E("pet", "noun", "preK", 1,
      "An animal kept at home and cared for by a family.",
      {"animals": 10, "family": 8, "love": 7},
      "Scottish", "pet", "16th Century",
      "Originally a Scottish word for a tame, indulged animal or favorite person.",
      families=["Animals", "Family"], related=["cat", "dog", "love", "care"]),

    E("vet", "noun", "K", 1,
      "A doctor who takes care of animals.",
      {"animals": 9, "jobs": 10, "health": 8},
      "Latin", "veterinarius", "20th Century",
      "Short for 'veterinarian', from Latin 'veterinarius' meaning relating to beasts of burden.",
      synonyms=["veterinarian"], families=["Jobs", "Health"],
      related=["doctor", "pet", "animal", "care"]),

    E("toy", "noun", "preK", 1,
      "An object that children play with for fun.",
      {"play": 10, "objects": 9, "fun": 10},
      "Middle English", "toye", "16th Century",
      "From Middle English 'toye' meaning amorous play, with the meaning narrowing to playthings.",
      families=["Play", "Objects"], related=["play", "game", "doll", "ball"]),

    E("tie", "noun", "K", 1,
      "A strip of cloth worn around the neck and knotted at the front.",
      {"clothing": 10, "objects": 8},
      "Old English", "teag", "Old English era",
      "From Old English 'teag' meaning a band or rope used for fastening.",
      families=["Clothing"], related=["knot", "shirt", "neck", "string"]),

    E("kit", "noun", "1", 2,
      "A set of tools, parts, or items kept together for a purpose.",
      {"objects": 9, "tools": 9, "set": 10},
      "Middle Dutch", "kitte", "14th Century",
      "From Middle Dutch 'kitte' meaning a wooden vessel, later coming to mean a set of useful items.",
      synonyms=["set", "pack"], families=["Objects", "Tools"],
      related=["set", "pack", "tools", "gear"]),

    E("bug", "noun", "preK", 1,
      "A small insect or creepy-crawly creature.",
      {"animals": 10, "insects": 10, "nature": 7},
      "Middle English", "bugge", "16th Century",
      "From Middle English 'bugge' meaning hobgoblin, later applied to insects.",
      synonyms=["insect"], families=["Animals", "Insects"],
      related=["insect", "ant", "spider", "fly"]),

    E("pin", "noun", "preK", 1,
      "A small thin piece of metal with a sharp point, used to fasten things.",
      {"objects": 10, "sewing": 8, "tools": 7},
      "Old English", "pinn", "Old English era",
      "From Old English 'pinn' meaning a peg or bolt, related to Latin 'pinna' meaning feather.",
      families=["Objects", "Tools"], related=["needle", "fasten", "point", "stick"]),

    E("bin", "noun", "1", 2,
      "A large container for storage or for throwing trash into.",
      {"objects": 10, "containers": 10, "home": 7},
      "Old English", "binn", "Old English era",
      "From Old English 'binn' meaning a manger or storage box.",
      synonyms=["container", "bucket"], families=["Objects", "Containers"],
      related=["box", "trash", "container", "store"]),

    E("jug", "noun", "1", 2,
      "A large container with a handle for holding and pouring liquid.",
      {"objects": 9, "containers": 10, "kitchen": 8},
      "Middle English", "jugge", "16th Century",
      "Of uncertain origin, possibly from a pet form of the name Joan or Judith used for ordinary household items.",
      synonyms=["pitcher", "jar"], families=["Objects", "Kitchen"],
      related=["jar", "pour", "milk", "water"]),

    E("mug", "noun", "preK", 1,
      "A sturdy cup with a handle, used for hot drinks like cocoa or tea.",
      {"objects": 10, "kitchen": 9, "drinks": 8},
      "Scandinavian", "mugg", "16th Century",
      "Likely from a Scandinavian source like Swedish 'mugg' meaning a drinking vessel.",
      synonyms=["cup"], families=["Objects", "Kitchen"],
      related=["cup", "tea", "cocoa", "handle"]),

    E("gem", "noun", "1", 2,
      "A shiny precious stone, like a diamond or ruby.",
      {"objects": 9, "treasure": 10, "shiny": 9},
      "Latin", "gemma", "12th Century",
      "From Latin 'gemma' meaning a bud or precious stone.",
      synonyms=["jewel"], families=["Objects", "Treasure"],
      related=["jewel", "diamond", "ring", "shine"]),

    E("gum", "noun", "preK", 1,
      "A sweet, soft, chewy candy you don't swallow.",
      {"food": 10, "candy": 10, "objects": 6},
      "Latin", "gummi", "14th Century",
      "From Latin 'gummi' meaning sticky substance from a tree, later used for chewing gum.",
      families=["Food", "Candy"], related=["candy", "chew", "sweet", "stick"]),

    E("ink", "noun", "K", 1,
      "A colored liquid used for writing or printing.",
      {"writing": 10, "school": 8, "objects": 8},
      "Greek", "enkauston", "13th Century",
      "From Greek 'enkauston' meaning to burn in, since early inks were made by burning materials. Reached English through Old French 'enque'.",
      families=["Writing", "School"], related=["pen", "write", "paper", "color"]),

    # ============ 3-LETTER ACTIONS + DESCRIBERS ============
    E("hit", "verb", "preK", 1,
      "To strike something with a hand, foot, or object.",
      {"action": 10, "sport": 7, "movement": 8},
      "Old Norse", "hitta", "Old English era",
      "From Old Norse 'hitta' meaning to meet with or strike upon, brought to English by Norse settlers.",
      synonyms=["strike", "tap"], families=["Actions", "Sports"],
      related=["strike", "punch", "ball", "bat"]),

    E("fit", "verb", "K", 1,
      "To be the right size or shape for something.",
      {"action": 9, "size": 10},
      "Middle English", "fitten", "14th Century",
      "From Middle English 'fitten' meaning to arrange suitably, of uncertain origin.",
      synonyms=["match", "suit"], families=["Actions", "Size"],
      related=["match", "size", "shoe", "clothes"]),

    E("win", "verb", "preK", 1,
      "To finish first in a contest or get the prize.",
      {"action": 10, "sport": 9, "success": 10},
      "Old English", "winnan", "Old English era",
      "From Old English 'winnan' meaning to work, struggle, or gain by effort.",
      antonyms=["lose"], families=["Actions", "Sports"],
      related=["lose", "race", "prize", "first"]),

    E("aid", "verb", "1", 2,
      "To help someone who needs it.",
      {"action": 9, "help": 10, "behavior": 7},
      "Latin", "adjutare", "15th Century",
      "From Latin 'adjutare' meaning to help, through Old French 'aidier'.",
      synonyms=["help", "assist"], antonyms=["hinder"],
      families=["Actions", "Helping"], related=["help", "rescue", "support", "care"]),

    E("aim", "verb", "1", 2,
      "To point at a target you want to hit.",
      {"action": 9, "sport": 7, "focus": 9},
      "Latin", "aestimare", "14th Century",
      "From Latin 'aestimare' meaning to estimate, through Old French 'esmer' meaning to aim.",
      synonyms=["point", "target"], families=["Actions", "Focus"],
      related=["target", "point", "arrow", "goal"]),

    E("jog", "verb", "1", 2,
      "To run at a slow, steady pace, often for exercise.",
      {"action": 10, "exercise": 10, "sport": 8},
      "Middle English", "joggen", "16th Century",
      "From Middle English 'joggen' meaning to shake, possibly imitative of the bouncy motion of running.",
      synonyms=["run", "trot"], families=["Actions", "Exercise"],
      related=["run", "exercise", "trot", "pace"]),

    E("hum", "verb", "preK", 1,
      "To make a low buzzing sound with your mouth closed.",
      {"action": 9, "sound": 10, "music": 7},
      "Middle English", "hummen", "14th Century",
      "Imitative of the low droning sound.",
      families=["Actions", "Sound"], related=["sing", "song", "bee", "tune"]),

    E("tap", "verb", "preK", 1,
      "To lightly hit or touch something quickly.",
      {"action": 10, "sound": 7, "movement": 7},
      "Old French", "taper", "13th Century",
      "From Old French 'taper' meaning to hit or pat, possibly imitative.",
      synonyms=["pat", "knock"], families=["Actions", "Sound"],
      related=["pat", "knock", "touch", "drum"]),

    E("nap", "noun", "preK", 1,
      "A short sleep, especially during the day.",
      {"sleep": 10, "rest": 10, "health": 6},
      "Old English", "hnappian", "Old English era",
      "From Old English 'hnappian' meaning to doze or sleep lightly.",
      synonyms=["doze", "rest"], families=["Sleep", "Rest"],
      related=["sleep", "rest", "tired", "doze"]),

    E("lap", "noun", "preK", 1,
      "The top of your thighs when you are sitting down.",
      {"body": 10, "position": 8},
      "Old English", "læppa", "Old English era",
      "From Old English 'læppa' meaning a flap or fold, originally referring to part of a garment.",
      families=["Body", "Position"], related=["sit", "thighs", "knee", "cat"]),

    E("tag", "noun", "preK", 1,
      "A small label attached to something, or a fun chasing game.",
      {"objects": 9, "games": 8, "labels": 10},
      "Middle English", "tagge", "14th Century",
      "From Middle English 'tagge' meaning a hanging piece of cloth, later a label.",
      synonyms=["label"], families=["Objects", "Games"],
      related=["label", "name", "chase", "game"]),

    E("dot", "noun", "preK", 1,
      "A small round mark.",
      {"shapes": 10, "writing": 7, "marks": 10},
      "Old English", "dott", "Old English era",
      "From Old English 'dott' meaning a small spot or speck.",
      synonyms=["point", "spot"], families=["Shapes", "Marks"],
      related=["spot", "point", "polka", "circle"]),

    E("den", "noun", "K", 1,
      "The home or shelter of a wild animal like a fox or bear.",
      {"animals": 10, "nature": 8, "home": 7},
      "Old English", "denn", "Old English era",
      "From Old English 'denn' meaning a wild beast's lair.",
      synonyms=["lair", "burrow"], families=["Animals", "Nature"],
      related=["fox", "bear", "lair", "cave"]),

    E("arc", "noun", "2", 2,
      "A curved line, like part of a circle.",
      {"shapes": 10, "geometry": 9, "math": 7},
      "Latin", "arcus", "14th Century",
      "From Latin 'arcus' meaning a bow or arch.",
      synonyms=["curve", "arch"], families=["Shapes", "Geometry"],
      related=["circle", "curve", "bow", "rainbow"]),

    E("sum", "noun", "1", 2,
      "The total you get when you add numbers together.",
      {"math": 10, "numbers": 10},
      "Latin", "summa", "14th Century",
      "From Latin 'summa' meaning the highest or total.",
      synonyms=["total"], families=["Math", "Numbers"],
      related=["add", "total", "plus", "math"]),

    E("far", "adj", "preK", 1,
      "At a long distance away.",
      {"distance": 10, "position": 9},
      "Old English", "feor", "Old English era",
      "From Old English 'feor' meaning at a distance.",
      synonyms=["distant"], antonyms=["near", "close"],
      families=["Distance"], related=["near", "distance", "away", "long"]),

    E("bar", "noun", "K", 1,
      "A long thin piece of metal, wood, or other material.",
      {"objects": 10, "shapes": 7},
      "Latin", "barra", "12th Century",
      "From Late Latin 'barra' meaning a beam or rod, through Old French.",
      synonyms=["rod", "beam"], families=["Objects", "Shapes"],
      related=["rod", "metal", "stick", "beam"]),

    E("cab", "noun", "K", 1,
      "A car that people pay to ride in; a taxi.",
      {"vehicles": 10, "transport": 9},
      "English", "cabriolet", "19th Century",
      "Short for 'cabriolet', a French word for a light carriage that bounced as it moved.",
      synonyms=["taxi"], families=["Vehicles", "Transport"],
      related=["taxi", "car", "ride", "driver"]),

    E("job", "noun", "preK", 1,
      "The work a person does to earn money.",
      {"jobs": 10, "work": 10},
      "Middle English", "jobbe", "16th Century",
      "From Middle English 'jobbe' meaning a small task or piece of work, of uncertain origin.",
      synonyms=["work", "task"], families=["Jobs", "Work"],
      related=["work", "career", "task", "boss"]),

    # ============ 4-LETTER COMMON KID WORDS ============
    E("home", "noun", "preK", 1,
      "The place where someone lives.",
      {"home": 10, "family": 9, "places": 9},
      "Old English", "ham", "Old English era",
      "From Old English 'ham' meaning village or estate, related to many place names ending in -ham.",
      synonyms=["house", "residence"], families=["Home", "Family"],
      related=["house", "family", "live", "place"]),

    E("time", "noun", "preK", 1,
      "What clocks measure — the past, present, and future.",
      {"time": 10, "math": 5},
      "Old English", "tima", "Old English era",
      "From Old English 'tima' meaning a limited space of time, related to 'tide'.",
      families=["Time"], related=["clock", "hour", "day", "minute"]),

    E("name", "noun", "preK", 1,
      "What a person, place, or thing is called.",
      {"language": 9, "people": 8, "identity": 10},
      "Old English", "nama", "Old English era",
      "From Old English 'nama', shared across the Germanic languages, related to Latin 'nomen'.",
      synonyms=["label", "title"], families=["Language", "Identity"],
      related=["call", "title", "label", "self"]),

    E("game", "noun", "preK", 1,
      "An activity with rules that people play for fun.",
      {"play": 10, "fun": 10, "games": 10},
      "Old English", "gamen", "Old English era",
      "From Old English 'gamen' meaning joy or sport.",
      synonyms=["play", "match"], families=["Play", "Games"],
      related=["play", "fun", "rules", "win"]),

    E("step", "noun", "preK", 1,
      "One movement of your foot when walking.",
      {"action": 10, "movement": 10, "body": 7},
      "Old English", "stæpe", "Old English era",
      "From Old English 'stæpe', a core Germanic word for a footstep.",
      families=["Actions", "Movement"], related=["walk", "stair", "foot", "pace"]),

    E("stop", "verb", "preK", 1,
      "To halt or come to an end.",
      {"action": 10, "movement": 9},
      "Old English", "stoppian", "Old English era",
      "From Old English 'stoppian' meaning to plug or close up.",
      synonyms=["halt", "cease"], antonyms=["go", "start"],
      families=["Actions"], related=["go", "halt", "wait", "end"]),

    E("trip", "noun", "preK", 1,
      "A journey to somewhere, usually short.",
      {"travel": 10, "transport": 8},
      "Middle Dutch", "trippen", "14th Century",
      "From Middle Dutch 'trippen' meaning to step or tread lightly, evolving to mean a journey.",
      synonyms=["journey", "voyage"], families=["Travel"],
      related=["journey", "travel", "vacation", "ride"]),

    E("drop", "verb", "preK", 1,
      "To let something fall.",
      {"action": 10, "movement": 9},
      "Old English", "droppian", "Old English era",
      "From Old English 'droppian', related to 'drop' (a small bit of liquid).",
      synonyms=["fall", "release"], antonyms=["lift", "catch"],
      families=["Actions"], related=["fall", "lift", "spill", "release"]),

    E("tape", "noun", "K", 1,
      "A long thin sticky strip used to join things together.",
      {"objects": 10, "home": 8, "school": 7},
      "Old English", "tæppe", "Old English era",
      "From Old English 'tæppe' meaning a band or ribbon.",
      families=["Objects", "Home"], related=["glue", "stick", "paper", "band"]),

    E("help", "verb", "preK", 1,
      "To do something useful for another person.",
      {"action": 10, "behavior": 10, "kindness": 9},
      "Old English", "helpan", "Old English era",
      "From Old English 'helpan', a core Germanic verb of supporting others.",
      synonyms=["assist", "aid"], antonyms=["hinder"],
      families=["Actions", "Kindness"], related=["aid", "support", "kind", "rescue"]),

    E("meal", "noun", "preK", 1,
      "The food eaten at one time, like breakfast or dinner.",
      {"food": 10, "eating": 10, "family": 7},
      "Old English", "mæl", "Old English era",
      "From Old English 'mæl' meaning a measure of time, including the times at which one eats.",
      families=["Food", "Eating"], related=["breakfast", "lunch", "dinner", "food"]),

    E("food", "noun", "preK", 1,
      "What people and animals eat to stay alive.",
      {"food": 10, "eating": 10, "biology": 8},
      "Old English", "foda", "Old English era",
      "From Old English 'foda' meaning food, fodder, or nourishment.",
      synonyms=["meal", "nourishment"], families=["Food"],
      related=["eat", "meal", "snack", "cook"]),

    E("list", "noun", "preK", 1,
      "A group of items written down, one after another.",
      {"writing": 9, "school": 7, "objects": 7},
      "Old English", "liste", "Old English era",
      "From Old English 'liste' meaning a strip or border, later coming to mean an enumerated series.",
      families=["Writing", "Organization"], related=["roll", "menu", "agenda", "items"]),

    E("last", "adj", "preK", 1,
      "Coming after all others; final.",
      {"position": 10, "time": 8},
      "Old English", "latost", "Old English era",
      "From Old English 'latost' meaning latest, from 'læt' meaning slow or late.",
      synonyms=["final"], antonyms=["first"], families=["Position", "Time"],
      related=["first", "final", "end", "after"]),

    E("best", "adj", "preK", 1,
      "Better than all others.",
      {"comparison": 10, "quality": 10},
      "Old English", "betst", "Old English era",
      "From Old English 'betst', the superlative form of 'good', a core Germanic word.",
      antonyms=["worst"], families=["Comparison"],
      related=["good", "great", "worst", "first"]),

    E("area", "noun", "1", 2,
      "A particular space or region of the world or a building.",
      {"places": 10, "geography": 9, "math": 6},
      "Latin", "area", "16th Century",
      "From Latin 'area' meaning a level piece of ground.",
      synonyms=["region", "space", "zone"], families=["Places", "Geography"],
      related=["region", "zone", "place", "space"]),

    E("band", "noun", "K", 1,
      "A thin strip used to hold things together, or a group of musicians.",
      {"music": 10, "objects": 8, "groups": 7},
      "Old French", "bande", "13th Century",
      "From Old French 'bande' meaning a strip or troop, with both meanings developing in English.",
      synonyms=["strip", "group"], families=["Music", "Objects"],
      related=["music", "strip", "group", "team"]),

    E("park", "noun", "preK", 1,
      "A public open space with grass and trees where people can play and relax.",
      {"places": 10, "nature": 9, "fun": 8},
      "Old French", "parc", "13th Century",
      "From Old French 'parc' meaning an enclosed land for hunting, evolving to mean public green space.",
      families=["Places", "Nature"], related=["playground", "tree", "grass", "play"]),

    E("ship", "noun", "preK", 1,
      "A large boat that travels across oceans.",
      {"vehicles": 10, "ocean": 9, "transport": 9},
      "Old English", "scip", "Old English era",
      "From Old English 'scip', a core Germanic word for sea-going vessel.",
      synonyms=["boat", "vessel"], families=["Vehicles", "Ocean"],
      related=["boat", "sail", "ocean", "captain"]),

    E("tail", "noun", "preK", 1,
      "The long part at the back of an animal's body.",
      {"animals": 10, "body": 9},
      "Old English", "tægel", "Old English era",
      "From Old English 'tægel' meaning the hindmost part of an animal.",
      families=["Animals", "Body"], related=["animal", "wag", "back", "dog"]),

    E("tank", "noun", "1", 2,
      "A large container for holding liquids or gas.",
      {"objects": 9, "containers": 10},
      "Portuguese", "tanque", "17th Century",
      "From Portuguese 'tanque' meaning a pond or reservoir, originally from Sanskrit 'tadaga'.",
      synonyms=["container", "reservoir"], families=["Objects", "Containers"],
      related=["water", "fuel", "fish", "container"]),

    E("word", "noun", "preK", 1,
      "A group of letters with a meaning, used in speaking and writing.",
      {"language": 10, "writing": 10, "school": 8},
      "Old English", "word", "Old English era",
      "From Old English 'word', a core Indo-European word for speech-unit.",
      families=["Language", "Writing"], related=["letter", "sentence", "speak", "read"]),

    E("push", "verb", "preK", 1,
      "To move something away from you by pressing on it.",
      {"action": 10, "movement": 10},
      "Latin", "pulsare", "13th Century",
      "From Latin 'pulsare' meaning to strike or push, through Old French 'pousser'.",
      synonyms=["shove", "press"], antonyms=["pull"], families=["Actions"],
      related=["pull", "press", "shove", "force"]),

    E("pull", "verb", "preK", 1,
      "To move something toward you by tugging on it.",
      {"action": 10, "movement": 10},
      "Old English", "pullian", "Old English era",
      "From Old English 'pullian' meaning to pluck or tug.",
      synonyms=["tug", "drag"], antonyms=["push"], families=["Actions"],
      related=["push", "tug", "drag", "rope"]),

    E("open", "verb", "preK", 1,
      "To make something no longer closed.",
      {"action": 10, "movement": 8},
      "Old English", "openian", "Old English era",
      "From Old English 'openian', from 'open' meaning not closed.",
      antonyms=["close", "shut"], families=["Actions"],
      related=["close", "shut", "door", "lid"]),

    E("lift", "verb", "preK", 1,
      "To raise something up to a higher place.",
      {"action": 10, "movement": 9},
      "Old Norse", "lypta", "13th Century",
      "From Old Norse 'lypta' meaning to raise up, brought to English by Norse settlers.",
      synonyms=["raise", "hoist"], antonyms=["drop", "lower"],
      families=["Actions"], related=["raise", "carry", "drop", "hold"]),

    E("hold", "verb", "preK", 1,
      "To have something in your hands.",
      {"action": 10, "body": 7},
      "Old English", "healdan", "Old English era",
      "From Old English 'healdan' meaning to keep, contain, or grasp.",
      synonyms=["grasp", "carry"], antonyms=["release", "drop"],
      families=["Actions"], related=["grasp", "carry", "hand", "grip"]),

    E("save", "verb", "K", 1,
      "To keep something safe, or to rescue someone from danger.",
      {"action": 10, "safety": 10, "behavior": 8},
      "Latin", "salvare", "13th Century",
      "From Latin 'salvare' meaning to make safe, through Old French 'sauver'.",
      synonyms=["rescue", "protect"], antonyms=["waste", "lose"],
      families=["Actions", "Safety"], related=["rescue", "protect", "keep", "money"]),

    E("ride", "verb", "preK", 1,
      "To sit on or in something that moves and travel along with it.",
      {"action": 10, "transport": 10, "movement": 9},
      "Old English", "ridan", "Old English era",
      "From Old English 'ridan', a core Germanic verb for traveling on horseback or vehicle.",
      families=["Actions", "Transport"], related=["horse", "bike", "car", "travel"]),

    E("card", "noun", "preK", 1,
      "A small flat piece of stiff paper used for messages, games, or playing.",
      {"objects": 10, "paper": 9, "games": 8},
      "Greek", "khartes", "15th Century",
      "From Greek 'khartes' meaning papyrus leaf, through Latin 'carta' and Old French 'carte'.",
      families=["Objects", "Paper"], related=["paper", "game", "birthday", "letter"]),

    E("page", "noun", "preK", 1,
      "One side of a sheet of paper in a book.",
      {"books": 10, "reading": 10, "paper": 9},
      "Latin", "pagina", "15th Century",
      "From Latin 'pagina' meaning a written page or column of writing.",
      families=["Books", "Reading"], related=["book", "paper", "read", "chapter"]),

    E("room", "noun", "preK", 1,
      "A separate space inside a building, with walls and a floor.",
      {"home": 10, "building": 9, "places": 8},
      "Old English", "rum", "Old English era",
      "From Old English 'rum' meaning open space or room.",
      synonyms=["space", "chamber"], families=["Home", "Building"],
      related=["bedroom", "kitchen", "house", "wall"]),

    E("gift", "noun", "preK", 1,
      "Something given to someone to show love or celebration.",
      {"objects": 9, "celebration": 10, "kindness": 9},
      "Old Norse", "gift", "13th Century",
      "From Old Norse 'gift' meaning something given, related to the verb 'give'.",
      synonyms=["present"], families=["Celebration", "Kindness"],
      related=["present", "birthday", "give", "wrap"]),

    # ============ 5-LETTER COMMON KID WORDS ============
    E("bread", "noun", "preK", 1,
      "A baked food made from flour, water, and yeast.",
      {"food": 10, "baking": 9},
      "Old English", "bread", "Old English era",
      "From Old English 'bread', originally meaning a small piece of food, narrowing to the baked loaf.",
      families=["Food", "Baking"], related=["toast", "wheat", "loaf", "bake"]),

    E("juice", "noun", "preK", 1,
      "A sweet drink made from squeezed fruit.",
      {"food": 10, "drinks": 10, "fruit": 9},
      "Latin", "jus", "13th Century",
      "From Latin 'jus' meaning broth or sauce, through Old French 'jus' meaning liquid.",
      families=["Drinks", "Food"], related=["fruit", "drink", "orange", "apple"]),

    E("plant", "noun", "preK", 1,
      "A living thing with roots, leaves, and stems that grows in soil.",
      {"plants": 10, "nature": 10, "biology": 9},
      "Latin", "planta", "Old English era",
      "From Latin 'planta' meaning a young shoot or sprout, used in Old English for any vegetation.",
      families=["Plants", "Nature"], related=["tree", "flower", "leaf", "root"]),

    E("party", "noun", "preK", 1,
      "A gathering where people celebrate with food, games, and friends.",
      {"celebration": 10, "social": 9, "fun": 10},
      "Latin", "partita", "13th Century",
      "From Latin 'partita' meaning a part or share, evolving through Old French 'partie' to mean a gathered group.",
      synonyms=["celebration"], families=["Celebration", "Social"],
      related=["birthday", "celebrate", "friends", "cake"]),

    E("queen", "noun", "preK", 1,
      "A woman who rules a country, or the wife of a king.",
      {"people": 10, "royalty": 10, "leadership": 9},
      "Old English", "cwen", "Old English era",
      "From Old English 'cwen' meaning a woman or wife, narrowing to mean a female ruler.",
      antonyms=["king"], families=["Royalty", "People"],
      related=["king", "crown", "royal", "throne"]),

    E("candy", "noun", "preK", 1,
      "A sweet food made mostly of sugar.",
      {"food": 10, "sweets": 10},
      "Arabic", "qandi", "13th Century",
      "From Arabic 'qandi' meaning made of sugar, through Persian 'qand' meaning cane sugar.",
      synonyms=["sweet", "treat"], families=["Food", "Sweets"],
      related=["sugar", "sweet", "chocolate", "lollipop"]),

    E("magic", "noun", "preK", 1,
      "Special powers that seem to make impossible things happen.",
      {"fantasy": 10, "stories": 9, "play": 8},
      "Greek", "magikos", "14th Century",
      "From Greek 'magikos', referring to the Magi, ancient priest-magicians of Persia.",
      synonyms=["sorcery", "wizardry"], families=["Fantasy", "Stories"],
      related=["wizard", "spell", "wand", "trick"]),

    E("arrow", "noun", "K", 1,
      "A thin stick with a sharp point, shot from a bow.",
      {"objects": 10, "weapons": 8, "shapes": 7},
      "Old English", "arwe", "Old English era",
      "From Old English 'arwe' meaning a shaft shot from a bow.",
      families=["Objects", "Weapons"], related=["bow", "arrow", "target", "shoot"]),

    E("glove", "noun", "preK", 1,
      "A covering for the hand with separate spaces for each finger.",
      {"clothing": 10, "objects": 8, "winter": 7},
      "Old English", "glof", "Old English era",
      "From Old English 'glof' meaning a covering for the hand.",
      families=["Clothing"], related=["hand", "mitten", "warm", "winter"]),

    E("scarf", "noun", "K", 1,
      "A long piece of cloth worn around the neck for warmth or style.",
      {"clothing": 10, "winter": 8, "objects": 7},
      "Old French", "escharpe", "16th Century",
      "From Old French 'escharpe' meaning a pilgrim's pouch hung from the neck, later a neck cloth.",
      families=["Clothing", "Winter"], related=["neck", "warm", "winter", "wrap"]),

    E("smell", "verb", "preK", 1,
      "To use your nose to notice an odor.",
      {"senses": 10, "body": 8, "action": 8},
      "Middle English", "smellen", "12th Century",
      "From Middle English 'smellen', of uncertain origin but a core Germanic verb.",
      families=["Senses", "Actions"], related=["nose", "scent", "odor", "sniff"]),

    E("taste", "verb", "preK", 1,
      "To put a little of something in your mouth to see what it is like.",
      {"senses": 10, "food": 8, "body": 7},
      "Old French", "taster", "13th Century",
      "From Old French 'taster' meaning to feel or touch, narrowing in English to mean perceiving flavor.",
      families=["Senses", "Food"], related=["tongue", "flavor", "food", "tongue"]),
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
    print("BRIDGE WORDS V2 — preK-2 density pack")
    print("=" * 70)
    print(f"\nProposed entries: {len(ENTRIES)}")
    print(f"Already in lexicon (skipped): {len(skipped_dup)}")
    print(f"Will add: {len(new_to_add)}")
    print(f"Lexicon: {len(lex)} → {len(lex) + len(new_to_add)}")

    if skipped_dup:
        print(f"\nSkipped (already present): {sorted(set(skipped_dup))}")

    # Letter distribution
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
