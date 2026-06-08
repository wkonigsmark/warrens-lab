#!/usr/bin/env python3
"""Third batch of bridge words for Word Weaver.

Targets the next density tier: more 3-letter words with high-utility
endings (-Y, -O, -W, -B, -T, -D), and 4-letter -E-ending words which
cross beautifully with adult words that share that ending.

Dry-run by default; pass --apply to merge.
"""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LEXICON_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.json")
BACKUP_PATH = os.path.join(SCRIPT_DIR, "lexicon_seed.pre_bridges_v3.json")


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
    # ============ 3-LETTER ANIMALS ============
    E("cow", "noun", "preK", 1,
      "A large farm animal that gives milk and says 'moo'.",
      {"animals": 10, "farm": 10, "mammals": 9},
      "Old English", "cu", "Old English era",
      "From Old English 'cu', a core Germanic word for the milk-giving farm animal.",
      families=["Animals", "Farm"], related=["milk", "farm", "calf", "bull"]),

    E("ape", "noun", "K", 1,
      "A large primate animal like a gorilla, chimpanzee, or orangutan.",
      {"animals": 10, "mammals": 10, "primates": 10},
      "Old English", "apa", "Old English era",
      "From Old English 'apa', a core Germanic word for the tailless primate.",
      families=["Animals", "Mammals"], related=["monkey", "gorilla", "chimp", "jungle"]),

    E("jay", "noun", "1", 2,
      "A colorful bird with a loud, harsh call.",
      {"animals": 10, "birds": 10, "nature": 7},
      "Old French", "jai", "13th Century",
      "From Old French 'jai', possibly from a personal name like 'Gaius' applied to the chatty bird.",
      families=["Animals", "Birds"], related=["bird", "blue", "robin", "crow"]),

    E("ray", "noun", "K", 1,
      "A thin beam of light or heat.",
      {"science": 9, "light": 10, "weather": 7},
      "Latin", "radius", "14th Century",
      "From Latin 'radius' meaning a beam or spoke, through Old French 'rai'.",
      synonyms=["beam"], families=["Light", "Science"],
      related=["sun", "light", "beam", "shine"]),

    # ============ 3-LETTER OBJECTS ============
    E("web", "noun", "preK", 1,
      "A thin sticky net that a spider spins to catch flies.",
      {"animals": 9, "insects": 8, "objects": 8},
      "Old English", "webb", "Old English era",
      "From Old English 'webb' meaning a woven fabric or fine net.",
      families=["Animals", "Objects"], related=["spider", "net", "weave", "silk"]),

    E("tub", "noun", "preK", 1,
      "A wide deep container for water that you sit in to bathe.",
      {"home": 10, "objects": 9, "bathing": 10},
      "Middle Low German", "tubbe", "14th Century",
      "From Middle Low German 'tubbe' meaning a tub or open vessel.",
      synonyms=["bathtub", "basin"], families=["Home", "Objects"],
      related=["bath", "water", "soap", "wash"]),

    E("cot", "noun", "K", 1,
      "A small narrow bed, often for a baby or for camping.",
      {"home": 10, "objects": 9, "babies": 7},
      "Hindi", "khaat", "17th Century",
      "From Hindi 'khaat' meaning a small bedstead, brought to English through trade in India.",
      synonyms=["bed", "crib"], families=["Home", "Objects"],
      related=["bed", "crib", "baby", "camp"]),

    E("hut", "noun", "K", 1,
      "A small, simple house made of basic materials.",
      {"home": 10, "building": 9, "places": 8},
      "Old French", "hutte", "16th Century",
      "From Old French 'hutte' meaning a small cottage or shelter.",
      synonyms=["shed", "shack"], families=["Home", "Building"],
      related=["shack", "shed", "cabin", "house"]),

    E("bib", "noun", "preK", 1,
      "A piece of cloth tied around a baby's neck to keep their clothes clean.",
      {"clothing": 10, "babies": 10},
      "Latin", "bibere", "16th Century",
      "Possibly from Latin 'bibere' meaning to drink, since bibs catch what spills.",
      families=["Clothing", "Babies"], related=["baby", "food", "neck", "spill"]),

    E("pit", "noun", "1", 2,
      "A deep hole in the ground.",
      {"places": 9, "shapes": 7},
      "Old English", "pytt", "Old English era",
      "From Old English 'pytt' meaning a hole in the ground, from Latin 'puteus' meaning well.",
      synonyms=["hole", "ditch"], families=["Places", "Shapes"],
      related=["hole", "ground", "dig", "deep"]),

    E("rod", "noun", "1", 2,
      "A long thin stick, often of metal or wood.",
      {"objects": 10, "shapes": 9},
      "Old English", "rodd", "Old English era",
      "From Old English 'rodd' meaning a slender wand or stick.",
      synonyms=["stick", "bar", "pole"], families=["Objects", "Shapes"],
      related=["stick", "fishing", "pole", "bar"]),

    E("rib", "noun", "1", 2,
      "One of the curved bones that protect your chest.",
      {"body": 10, "anatomy": 10},
      "Old English", "rib", "Old English era",
      "From Old English 'rib' meaning the curved chest bone, shared across Germanic languages.",
      families=["Body", "Anatomy"], related=["bone", "chest", "back", "skeleton"]),

    E("urn", "noun", "2", 3,
      "A tall vase, sometimes used to hold ashes or flowers.",
      {"objects": 9, "containers": 9, "shapes": 7},
      "Latin", "urna", "14th Century",
      "From Latin 'urna' meaning a vessel for water or ashes.",
      synonyms=["vase"], families=["Objects", "Containers"],
      related=["vase", "ashes", "flower", "ceramic"]),

    E("cog", "noun", "2", 3,
      "One of the teeth on the edge of a gear wheel.",
      {"machines": 10, "objects": 8, "shapes": 7},
      "Middle English", "cogge", "14th Century",
      "From Middle English 'cogge', possibly from a Scandinavian source, meaning a tooth on a wheel.",
      families=["Machines", "Objects"], related=["gear", "wheel", "tooth", "machine"]),

    E("hub", "noun", "1", 2,
      "The center of a wheel where the spokes meet, or the center of any activity.",
      {"objects": 9, "places": 8, "machines": 7},
      "English", "hub", "16th Century",
      "Of uncertain origin, originally meaning a lump or projection at the center of a wheel.",
      synonyms=["center", "core"], families=["Objects", "Places"],
      related=["wheel", "center", "spoke", "core"]),

    # ============ 3-LETTER PLANTS / FOOD ============
    E("bud", "noun", "K", 1,
      "A small swelling on a plant that grows into a leaf or flower.",
      {"plants": 10, "nature": 9, "flowers": 9},
      "Middle English", "budde", "14th Century",
      "From Middle English 'budde' meaning a young leaf or flower, of uncertain origin.",
      families=["Plants", "Flowers"], related=["flower", "leaf", "stem", "spring"]),

    E("yam", "noun", "1", 2,
      "A thick edible root, similar to a sweet potato.",
      {"food": 10, "vegetables": 10, "plants": 7},
      "Portuguese", "inhame", "16th Century",
      "From Portuguese 'inhame', from West African languages, naming the starchy edible root.",
      synonyms=["sweet potato"], families=["Food", "Vegetables"],
      related=["potato", "vegetable", "root", "orange"]),

    E("oat", "noun", "1", 2,
      "A grain plant whose seeds are used for breakfast cereal.",
      {"food": 10, "grains": 10, "plants": 8},
      "Old English", "ate", "Old English era",
      "From Old English 'ate' meaning the grain plant, of uncertain Germanic origin.",
      families=["Food", "Grains"], related=["wheat", "grain", "cereal", "oatmeal"]),

    E("pod", "noun", "1", 2,
      "A long case that holds the seeds of a plant like a pea or bean.",
      {"plants": 10, "nature": 8, "food": 7},
      "English", "pod", "17th Century",
      "Of uncertain origin, possibly related to 'pad', describing the soft case around seeds.",
      synonyms=["case", "shell"], families=["Plants", "Food"],
      related=["bean", "pea", "seed", "plant"]),

    E("sap", "noun", "1", 2,
      "The sticky liquid that flows inside trees and plants.",
      {"plants": 10, "trees": 10, "nature": 8},
      "Old English", "sæp", "Old English era",
      "From Old English 'sæp', a core Germanic word for the juice inside plants.",
      synonyms=["resin"], families=["Plants", "Trees"],
      related=["tree", "syrup", "maple", "stick"]),

    # ============ 3-LETTER PLACES ============
    E("gym", "noun", "preK", 1,
      "A large room where people exercise and play sports.",
      {"places": 10, "sport": 10, "exercise": 10},
      "Greek", "gymnasion", "20th Century",
      "Short for 'gymnasium', from Greek 'gymnasion' meaning a public place for athletic training.",
      synonyms=["gymnasium"], families=["Places", "Sports"],
      related=["sport", "exercise", "school", "team"]),

    E("inn", "noun", "1", 2,
      "A small old-style hotel where travelers stay and eat.",
      {"places": 10, "travel": 9, "building": 7},
      "Old English", "inn", "Old English era",
      "From Old English 'inn' meaning a dwelling or place of lodging.",
      synonyms=["hotel", "lodge"], families=["Places", "Travel"],
      related=["hotel", "guest", "room", "travel"]),

    E("ark", "noun", "1", 2,
      "A very large boat, especially the famous one Noah built.",
      {"vehicles": 9, "stories": 9, "ocean": 7},
      "Latin", "arca", "Old English era",
      "From Latin 'arca' meaning a box or chest, through Old English 'arc'.",
      families=["Stories", "Vehicles"], related=["boat", "Noah", "ship", "story"]),

    # ============ 3-LETTER FANTASY ============
    E("elf", "noun", "preK", 1,
      "A small magical creature in stories, often with pointy ears.",
      {"fantasy": 10, "stories": 10, "magic": 9},
      "Old English", "ælf", "Old English era",
      "From Old English 'ælf', a core Germanic word for a magical woodland spirit.",
      families=["Fantasy", "Stories"], related=["fairy", "magic", "story", "Santa"]),

    E("imp", "noun", "1", 2,
      "A small mischievous creature in stories.",
      {"fantasy": 10, "stories": 9},
      "Old English", "impa", "Old English era",
      "From Old English 'impa' meaning a young plant graft or offspring, later coming to mean a small mischievous spirit.",
      synonyms=["sprite", "elf"], families=["Fantasy", "Stories"],
      related=["elf", "fairy", "mischief", "magic"]),

    # ============ 3-LETTER VERBS ============
    E("fly", "verb", "preK", 1,
      "To move through the air with wings or in an airplane.",
      {"action": 10, "movement": 10, "sky": 9},
      "Old English", "fleogan", "Old English era",
      "From Old English 'fleogan', a core Germanic verb for movement through the air.",
      antonyms=["land"], families=["Actions", "Movement"],
      related=["bird", "plane", "wings", "sky"]),

    E("cry", "verb", "preK", 1,
      "To make tears from your eyes when you are sad or hurt.",
      {"action": 10, "emotion": 10, "body": 7},
      "Latin", "quiritare", "13th Century",
      "From Latin 'quiritare' meaning to call out for help, through Old French 'crier'.",
      synonyms=["weep", "sob"], antonyms=["laugh"],
      families=["Actions", "Emotions"], related=["tears", "sad", "weep", "eyes"]),

    E("try", "verb", "preK", 1,
      "To attempt to do something.",
      {"action": 10, "effort": 10},
      "Old French", "trier", "13th Century",
      "From Old French 'trier' meaning to pick out or test, evolving to mean to make an attempt.",
      synonyms=["attempt"], families=["Actions", "Effort"],
      related=["attempt", "test", "do", "effort"]),

    E("fix", "verb", "preK", 1,
      "To repair something that is broken.",
      {"action": 10, "repair": 10},
      "Latin", "fixus", "15th Century",
      "From Latin 'fixus' meaning fastened, from 'figere' to fix or fasten.",
      synonyms=["repair", "mend"], antonyms=["break"],
      families=["Actions", "Repair"], related=["repair", "mend", "tool", "broken"]),

    E("mix", "verb", "preK", 1,
      "To stir or combine different things together.",
      {"action": 10, "combine": 10, "cooking": 8},
      "Latin", "miscere", "15th Century",
      "From Latin 'miscere' meaning to mingle or blend, through Old French.",
      synonyms=["blend", "stir", "combine"], antonyms=["separate"],
      families=["Actions", "Combining"], related=["stir", "blend", "bake", "swirl"]),

    E("dig", "verb", "preK", 1,
      "To make a hole in the ground by moving the dirt away.",
      {"action": 10, "movement": 9},
      "Old French", "diguer", "14th Century",
      "From Old French 'diguer' meaning to dig a ditch, of uncertain Germanic origin.",
      synonyms=["excavate"], families=["Actions"],
      related=["shovel", "hole", "dirt", "tunnel"]),

    E("rub", "verb", "preK", 1,
      "To move your hand or a cloth back and forth on something.",
      {"action": 10, "movement": 8},
      "Middle English", "rubben", "14th Century",
      "From Middle English 'rubben', of uncertain origin, related to similar words in Scandinavian languages.",
      synonyms=["scrub", "polish"], families=["Actions"],
      related=["clean", "polish", "scrub", "rough"]),

    E("nod", "verb", "K", 1,
      "To move your head up and down to mean 'yes'.",
      {"action": 10, "communication": 9, "body": 7},
      "Middle English", "nodden", "14th Century",
      "From Middle English 'nodden', of uncertain origin, describing the gentle head movement.",
      antonyms=["shake"], families=["Actions", "Communication"],
      related=["head", "yes", "agree", "wave"]),

    E("pay", "verb", "preK", 1,
      "To give money in exchange for something.",
      {"action": 10, "money": 10, "shopping": 9},
      "Latin", "pacare", "13th Century",
      "From Latin 'pacare' meaning to satisfy, through Old French 'paier'.",
      synonyms=["spend", "purchase"], antonyms=["earn"],
      families=["Actions", "Money"], related=["money", "buy", "shop", "cost"]),

    E("say", "verb", "preK", 1,
      "To speak words to someone.",
      {"action": 10, "communication": 10, "language": 9},
      "Old English", "secgan", "Old English era",
      "From Old English 'secgan', a core Germanic verb for speaking.",
      synonyms=["speak", "tell"], antonyms=["listen"],
      families=["Actions", "Communication"], related=["speak", "tell", "talk", "voice"]),

    E("mow", "verb", "K", 1,
      "To cut grass with a machine or tool.",
      {"action": 10, "garden": 8, "outdoor": 7},
      "Old English", "mawan", "Old English era",
      "From Old English 'mawan' meaning to cut grass, a core Germanic farm verb.",
      synonyms=["cut", "trim"], families=["Actions", "Garden"],
      related=["grass", "lawn", "cut", "garden"]),

    E("vow", "verb", "2", 2,
      "To promise something seriously and solemnly.",
      {"action": 10, "promise": 10, "communication": 8},
      "Latin", "votum", "13th Century",
      "From Latin 'votum' meaning a solemn promise, through Old French 'vou'.",
      synonyms=["promise", "swear"], families=["Actions", "Promise"],
      related=["promise", "oath", "wedding", "swear"]),

    # ============ 3-LETTER NOUNS / CONCEPTS ============
    E("ace", "noun", "1", 2,
      "A playing card with one mark, or a person who is great at something.",
      {"games": 9, "people": 7, "skill": 8},
      "Latin", "as", "13th Century",
      "From Latin 'as' meaning a unit or single thing, through Old French 'as'.",
      synonyms=["expert", "pro"], families=["Games", "Skill"],
      related=["card", "expert", "best", "champion"]),

    E("end", "noun", "preK", 1,
      "The point where something stops.",
      {"position": 10, "time": 9},
      "Old English", "ende", "Old English era",
      "From Old English 'ende' meaning the boundary or limit, a core Germanic word.",
      synonyms=["finish", "tip"], antonyms=["start", "beginning"],
      families=["Position", "Time"], related=["start", "finish", "tip", "limit"]),

    E("ore", "noun", "2", 3,
      "Rock or earth from which metal can be taken.",
      {"science": 9, "geology": 10, "materials": 9},
      "Old English", "ar", "Old English era",
      "From Old English 'ar' meaning brass or metal, possibly related to Latin 'aes'.",
      families=["Science", "Geology"], related=["mine", "metal", "iron", "gold"]),

    E("orb", "noun", "2", 3,
      "A round object, like a ball or planet.",
      {"shapes": 10, "objects": 8},
      "Latin", "orbis", "15th Century",
      "From Latin 'orbis' meaning a circle, ring, or disc.",
      synonyms=["sphere", "globe", "ball"], families=["Shapes", "Objects"],
      related=["sphere", "ball", "globe", "planet"]),

    E("eve", "noun", "1", 2,
      "The evening or day right before a holiday or special event.",
      {"time": 10, "celebration": 8},
      "Old English", "æfen", "Old English era",
      "Short for 'evening', from Old English 'æfen' meaning the late part of the day.",
      synonyms=["evening", "night"], families=["Time", "Celebration"],
      related=["evening", "night", "Christmas", "before"]),

    E("pal", "noun", "preK", 1,
      "A friend or buddy.",
      {"people": 10, "friends": 10, "social": 8},
      "Romani", "phral", "17th Century",
      "From Romani 'phral' meaning brother, brought into English through contact with Romani communities.",
      synonyms=["friend", "buddy"], families=["People", "Friends"],
      related=["friend", "buddy", "mate", "team"]),

    # ============ 3-LETTER ADJECTIVES ============
    E("low", "adj", "preK", 1,
      "Close to the ground or not very high.",
      {"position": 10, "comparison": 8},
      "Old Norse", "lagr", "Middle English era",
      "From Old Norse 'lagr' meaning low, brought to English by Norse settlers.",
      antonyms=["high", "tall"], families=["Position"],
      related=["high", "ground", "down", "tall"]),

    E("raw", "adj", "K", 1,
      "Not cooked, or in its natural state.",
      {"food": 9, "cooking": 8, "state": 8},
      "Old English", "hreaw", "Old English era",
      "From Old English 'hreaw' meaning uncooked or unprocessed, a core Germanic word.",
      synonyms=["uncooked"], antonyms=["cooked"], families=["Food", "Cooking"],
      related=["fresh", "vegetable", "sushi", "cook"]),

    E("ill", "adj", "K", 2,
      "Feeling sick or unhealthy.",
      {"health": 10, "feelings": 8},
      "Old Norse", "illr", "Middle English era",
      "From Old Norse 'illr' meaning bad or evil, narrowing in English to mean unwell.",
      synonyms=["sick", "unwell"], antonyms=["well", "healthy"],
      families=["Health"], related=["sick", "fever", "cold", "rest"]),

    E("fat", "adj", "preK", 1,
      "Having a wide, round body or a thick shape.",
      {"size": 10, "shape": 9},
      "Old English", "fætt", "Old English era",
      "From Old English 'fætt' meaning stout or full, a core Germanic word.",
      synonyms=["thick", "plump"], antonyms=["thin", "skinny"],
      families=["Size", "Shape"], related=["thin", "plump", "wide", "round"]),

    E("bad", "adj", "preK", 1,
      "Not good; harmful or unpleasant.",
      {"comparison": 10, "feelings": 9},
      "Old English", "bæddel", "Middle English era",
      "From Middle English 'bad', of uncertain origin, possibly from Old English 'bæddel'.",
      synonyms=["awful", "poor"], antonyms=["good"], families=["Comparison"],
      related=["good", "wrong", "awful", "naughty"]),

    # ============ 4-LETTER OUTDOOR / PLACES ============
    E("camp", "noun", "preK", 1,
      "A place where people stay outdoors in tents.",
      {"places": 10, "outdoor": 10, "nature": 9},
      "Latin", "campus", "16th Century",
      "From Latin 'campus' meaning open field, through Old French 'camp'.",
      families=["Places", "Outdoor"], related=["tent", "fire", "outdoor", "summer"]),

    E("cave", "noun", "preK", 1,
      "A large natural hole inside a hill, cliff, or under the ground.",
      {"places": 10, "nature": 9, "geology": 8},
      "Latin", "cavus", "13th Century",
      "From Latin 'cavus' meaning hollow, through Old French 'cave'.",
      synonyms=["cavern"], families=["Places", "Nature"],
      related=["mountain", "bat", "rock", "hollow"]),

    E("town", "noun", "preK", 1,
      "A small city — a place where many people live and work.",
      {"places": 10, "people": 8},
      "Old English", "tun", "Old English era",
      "From Old English 'tun' meaning a fenced enclosure or settlement.",
      synonyms=["village", "city"], families=["Places"],
      related=["city", "village", "street", "people"]),

    # ============ 4-LETTER OBJECTS ============
    E("comb", "noun", "preK", 1,
      "A flat tool with teeth used to make hair neat.",
      {"objects": 10, "body": 7, "home": 7},
      "Old English", "camb", "Old English era",
      "From Old English 'camb' meaning a tool with teeth, a core Germanic word.",
      families=["Objects", "Body"], related=["hair", "brush", "head", "teeth"]),

    E("glue", "noun", "preK", 1,
      "A sticky liquid used to join things together.",
      {"objects": 10, "school": 9, "art": 8},
      "Latin", "gluten", "14th Century",
      "From Latin 'gluten' meaning glue or sticky stuff, through Old French 'glu'.",
      synonyms=["paste"], families=["Objects", "School"],
      related=["paste", "stick", "tape", "craft"]),

    E("nail", "noun", "preK", 1,
      "A small thin piece of metal hammered into wood to hold things together.",
      {"objects": 10, "tools": 9, "body": 6},
      "Old English", "nægel", "Old English era",
      "From Old English 'nægel' meaning a fingernail or metal spike.",
      families=["Objects", "Tools"], related=["hammer", "wood", "finger", "metal"]),

    E("note", "noun", "preK", 1,
      "A short written message, or a single musical sound.",
      {"writing": 9, "music": 10, "school": 8},
      "Latin", "nota", "14th Century",
      "From Latin 'nota' meaning a mark or sign, through Old French 'note'.",
      families=["Writing", "Music"], related=["letter", "music", "song", "write"]),

    E("oven", "noun", "preK", 1,
      "A boxy machine used to bake or roast food.",
      {"home": 10, "kitchen": 10, "objects": 9},
      "Old English", "ofen", "Old English era",
      "From Old English 'ofen' meaning a furnace or oven, a core Germanic word.",
      families=["Home", "Kitchen"], related=["bake", "stove", "kitchen", "hot"]),

    E("palm", "noun", "preK", 1,
      "The flat inside part of your hand, or a tall tree with leaves like fans.",
      {"body": 9, "plants": 9, "trees": 9},
      "Latin", "palma", "Old English era",
      "From Latin 'palma' meaning the palm of the hand, also the tree whose leaves resemble fingers.",
      families=["Body", "Trees"], related=["hand", "tree", "finger", "beach"]),

    E("pair", "noun", "preK", 1,
      "A set of two things that go together.",
      {"objects": 9, "math": 7, "numbers": 8},
      "Latin", "paria", "13th Century",
      "From Latin 'paria' meaning equal things, through Old French 'paire'.",
      synonyms=["couple", "duo"], families=["Math", "Objects"],
      related=["two", "couple", "shoes", "socks"]),

    E("plan", "noun", "preK", 1,
      "An idea about how to do something.",
      {"thinking": 10, "school": 7},
      "Latin", "planus", "17th Century",
      "From Latin 'planus' meaning flat, evolving to mean a drawing on a flat surface, then any organized scheme.",
      synonyms=["scheme", "idea"], families=["Thinking"],
      related=["idea", "map", "scheme", "plot"]),

    E("rope", "noun", "preK", 1,
      "A thick, strong cord used for pulling or tying things.",
      {"objects": 10, "tools": 8, "sports": 6},
      "Old English", "rap", "Old English era",
      "From Old English 'rap' meaning a strong cord, a core Germanic word.",
      synonyms=["cord", "line"], families=["Objects", "Tools"],
      related=["string", "tie", "knot", "climb"]),

    E("robe", "noun", "K", 1,
      "A long loose piece of clothing worn over other clothes.",
      {"clothing": 10, "objects": 7},
      "Old French", "robe", "13th Century",
      "From Old French 'robe' meaning long outer garment, originally something taken (booty).",
      families=["Clothing"], related=["dress", "gown", "bath", "wear"]),

    E("suit", "noun", "K", 1,
      "A matching jacket and pants worn together.",
      {"clothing": 10},
      "Latin", "secta", "13th Century",
      "From Latin 'secta' meaning a following or matching set, through Old French 'suite'.",
      families=["Clothing"], related=["jacket", "pants", "tie", "dress"]),

    E("tile", "noun", "K", 1,
      "A flat piece of clay or stone used to cover floors, walls, or roofs.",
      {"objects": 10, "home": 9, "building": 9},
      "Latin", "tegula", "Old English era",
      "From Latin 'tegula' meaning roof tile, through Old English 'tigele'.",
      families=["Objects", "Home"], related=["floor", "wall", "roof", "ceramic"]),

    E("tube", "noun", "1", 2,
      "A long hollow shape, often used to hold or move liquid.",
      {"objects": 10, "shapes": 9},
      "Latin", "tubus", "17th Century",
      "From Latin 'tubus' meaning a pipe or hollow cylinder.",
      synonyms=["pipe", "cylinder"], families=["Objects", "Shapes"],
      related=["pipe", "straw", "hose", "cylinder"]),

    E("vase", "noun", "preK", 1,
      "A tall container, usually for holding flowers.",
      {"objects": 10, "home": 9, "containers": 9},
      "Latin", "vas", "17th Century",
      "From Latin 'vas' meaning vessel or container, through French 'vase'.",
      families=["Objects", "Home"], related=["flower", "container", "vase", "table"]),

    E("wire", "noun", "K", 1,
      "A thin string of metal used for carrying electricity or making things.",
      {"objects": 10, "materials": 9, "science": 8},
      "Old English", "wir", "Old English era",
      "From Old English 'wir' meaning fine metal thread, a core Germanic word.",
      families=["Objects", "Materials"], related=["metal", "thin", "fence", "cable"]),

    E("yarn", "noun", "K", 1,
      "Thick thread of wool or cotton used for knitting.",
      {"objects": 9, "materials": 9, "home": 7},
      "Old English", "gearn", "Old English era",
      "From Old English 'gearn' meaning spun thread, a core Germanic word for knitting material.",
      synonyms=["thread"], families=["Objects", "Materials"],
      related=["wool", "knit", "thread", "string"]),

    # ============ 4-LETTER ABSTRACT / CONCEPTS ============
    E("life", "noun", "K", 2,
      "The time between birth and death, or the quality of being alive.",
      {"biology": 9, "time": 8},
      "Old English", "lif", "Old English era",
      "From Old English 'lif' meaning the existence of a living being, a core Germanic word.",
      antonyms=["death"], families=["Biology", "Time"],
      related=["alive", "death", "live", "soul"]),

    E("mile", "noun", "1", 2,
      "A unit for measuring distance — about 1,600 meters.",
      {"distance": 10, "math": 8},
      "Latin", "milia", "Old English era",
      "From Latin 'milia passuum' meaning a thousand paces, the distance a Roman soldier marched in 1,000 steps.",
      families=["Distance", "Math"], related=["foot", "yard", "long", "walk"]),

    E("size", "noun", "K", 1,
      "How big or small something is.",
      {"comparison": 10, "math": 7},
      "Old French", "sise", "14th Century",
      "Shortened from Old French 'assise' meaning settled position, evolving to mean a measurable extent.",
      families=["Comparison", "Math"], related=["big", "small", "measure", "fit"]),

    E("zone", "noun", "1", 2,
      "A particular area or region with a special purpose.",
      {"places": 10, "geography": 8},
      "Greek", "zone", "16th Century",
      "From Greek 'zone' meaning a belt or girdle, evolving to mean a defined band of territory.",
      synonyms=["area", "region"], families=["Places", "Geography"],
      related=["area", "region", "space", "zone"]),

    # ============ 4-LETTER VERBS ============
    E("joke", "noun", "preK", 1,
      "Something said or done to make people laugh.",
      {"language": 9, "humor": 10, "fun": 9},
      "Latin", "jocus", "17th Century",
      "From Latin 'jocus' meaning a joke or pastime.",
      synonyms=["jest", "gag"], families=["Humor", "Language"],
      related=["funny", "laugh", "humor", "play"]),

    E("mint", "noun", "K", 1,
      "A plant with leaves that taste cool and fresh.",
      {"plants": 9, "food": 9, "herbs": 10},
      "Latin", "menta", "Old English era",
      "From Latin 'menta' through Old English 'minte', naming the herb used for flavor and tea.",
      families=["Plants", "Herbs"], related=["herb", "leaf", "fresh", "tea"]),

    E("pony", "noun", "preK", 1,
      "A small horse.",
      {"animals": 10, "mammals": 9, "farm": 7},
      "Latin", "pullus", "18th Century",
      "From Old French 'poulain' meaning colt, from Latin 'pullus' meaning a young animal.",
      synonyms=["foal"], families=["Animals", "Mammals"],
      related=["horse", "small", "foal", "ride"]),

    E("wash", "verb", "preK", 1,
      "To clean with water and usually soap.",
      {"action": 10, "hygiene": 10, "home": 8},
      "Old English", "wascan", "Old English era",
      "From Old English 'wascan', a core Germanic verb for cleaning with water.",
      synonyms=["clean", "scrub"], antonyms=["dirty"],
      families=["Actions", "Hygiene"], related=["soap", "water", "clean", "bath"]),

    E("wild", "adj", "preK", 1,
      "Living in nature, not tamed by people.",
      {"animals": 9, "nature": 10, "behavior": 7},
      "Old English", "wilde", "Old English era",
      "From Old English 'wilde' meaning living in the natural state, a core Germanic word.",
      antonyms=["tame", "calm"], families=["Animals", "Nature"],
      related=["nature", "tame", "forest", "free"]),

    # ============ 4-LETTER BIRDS ============
    E("crow", "noun", "K", 1,
      "A large black bird with a loud call.",
      {"animals": 10, "birds": 10, "nature": 7},
      "Old English", "crawe", "Old English era",
      "From Old English 'crawe', imitative of the bird's harsh call.",
      families=["Animals", "Birds"], related=["bird", "black", "raven", "fly"]),

    E("dove", "noun", "K", 1,
      "A small gentle bird that often symbolizes peace.",
      {"animals": 10, "birds": 10, "peace": 7},
      "Old English", "dufe", "Old English era",
      "From Old English 'dufe', related to other Germanic words for the soft-cooing bird.",
      synonyms=["pigeon"], families=["Animals", "Birds"],
      related=["pigeon", "peace", "white", "bird"]),

    E("hawk", "noun", "K", 1,
      "A large bird that hunts smaller animals during the day.",
      {"animals": 10, "birds": 10, "hunters": 9},
      "Old English", "hafoc", "Old English era",
      "From Old English 'hafoc', a core Germanic name for the strong hunting bird.",
      families=["Animals", "Birds"], related=["eagle", "owl", "hunt", "wings"]),

    E("twin", "noun", "preK", 1,
      "One of two children born to the same mother on the same day.",
      {"family": 10, "people": 9, "babies": 9},
      "Old English", "getwinn", "Old English era",
      "From Old English 'getwinn' meaning double or twofold, related to 'two'.",
      families=["Family", "People"], related=["sister", "brother", "double", "two"]),

    # ============ 5-LETTER COMMON KID WORDS ============
    E("angel", "noun", "preK", 1,
      "A heavenly being in stories, often shown with wings.",
      {"fantasy": 10, "stories": 9, "religion": 7},
      "Greek", "angelos", "Old English era",
      "From Greek 'angelos' meaning messenger, through Latin and Old English 'engel'.",
      families=["Fantasy", "Stories"], related=["wings", "halo", "heaven", "spirit"]),

    E("beard", "noun", "K", 1,
      "Hair that grows on a man's face below his mouth.",
      {"body": 10, "appearance": 9},
      "Old English", "beard", "Old English era",
      "From Old English 'beard' meaning hair on the face, a core Germanic word.",
      families=["Body", "Appearance"], related=["hair", "face", "chin", "mustache"]),

    E("broom", "noun", "preK", 1,
      "A long-handled brush used to sweep the floor.",
      {"objects": 10, "cleaning": 10, "home": 9},
      "Old English", "brom", "Old English era",
      "From Old English 'brom' meaning a shrub whose twigs were tied together for sweeping.",
      families=["Objects", "Cleaning"], related=["sweep", "mop", "floor", "witch"]),

    E("fairy", "noun", "preK", 1,
      "A tiny magical creature in stories, often with wings.",
      {"fantasy": 10, "stories": 10, "magic": 10},
      "Latin", "fata", "14th Century",
      "From Latin 'fata' meaning the fates, through Old French 'faerie' meaning enchantment.",
      synonyms=["sprite"], families=["Fantasy", "Stories"],
      related=["magic", "wings", "wand", "elf"]),

    E("paint", "noun", "preK", 1,
      "A colored liquid spread on surfaces to decorate or protect them.",
      {"art": 10, "objects": 8},
      "Latin", "pingere", "13th Century",
      "From Latin 'pingere' meaning to paint or color, through Old French 'peindre'.",
      families=["Art", "Objects"], related=["brush", "color", "art", "wall"]),

    E("pearl", "noun", "K", 1,
      "A small, round, shiny white object found inside some sea shells.",
      {"objects": 9, "treasure": 9, "ocean": 7},
      "Latin", "perla", "14th Century",
      "From Latin 'perla' through Old French 'perle', meaning the lustrous bead.",
      synonyms=["bead"], families=["Objects", "Treasure"],
      related=["oyster", "shell", "jewel", "white"]),

    E("snail", "noun", "preK", 1,
      "A small soft creature that carries a coiled shell on its back.",
      {"animals": 10, "nature": 9},
      "Old English", "snægl", "Old English era",
      "From Old English 'snægl' meaning the small shelled crawler.",
      families=["Animals", "Nature"], related=["shell", "slow", "garden", "slime"]),

    E("story", "noun", "preK", 1,
      "A telling of things that happened, real or made up.",
      {"books": 10, "stories": 10, "language": 9},
      "Latin", "historia", "13th Century",
      "Shortened from 'history', from Latin 'historia' meaning narrative or account.",
      synonyms=["tale", "narrative"], families=["Books", "Stories"],
      related=["book", "tale", "read", "fiction"]),

    E("sweet", "adj", "preK", 1,
      "Tasting like sugar or honey.",
      {"food": 9, "senses": 10, "feelings": 7},
      "Old English", "swete", "Old English era",
      "From Old English 'swete', a core Germanic word for the pleasant sugary taste.",
      antonyms=["sour", "bitter"], families=["Food", "Senses"],
      related=["sugar", "candy", "honey", "sour"]),

    E("voice", "noun", "preK", 1,
      "The sound that comes from a person's mouth when they speak or sing.",
      {"body": 9, "sound": 10, "communication": 10},
      "Latin", "vox", "13th Century",
      "From Latin 'vox' meaning voice or sound, through Old French 'voix'.",
      families=["Body", "Sound"], related=["sing", "speak", "talk", "mouth"]),

    E("woods", "noun", "preK", 1,
      "A small forest with many trees.",
      {"places": 10, "nature": 10, "trees": 9},
      "Old English", "wudu", "Old English era",
      "From Old English 'wudu' meaning trees or forest, in plural form.",
      synonyms=["forest"], families=["Places", "Nature"],
      related=["forest", "tree", "trail", "hike"]),

    E("write", "verb", "preK", 1,
      "To make letters or words on paper using a pen or pencil.",
      {"action": 10, "writing": 10, "school": 10},
      "Old English", "writan", "Old English era",
      "From Old English 'writan' meaning to scratch or carve marks, a core Germanic verb.",
      synonyms=["scribble"], families=["Actions", "Writing"],
      related=["pen", "pencil", "letter", "read"]),
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
    print("BRIDGE WORDS V3 — second density pack")
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
