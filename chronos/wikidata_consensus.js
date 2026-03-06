// Vetted Wikidata Historical Consensus
const wikidataHistory = [
    {
        "id": "Q323",
        "title": "Big Bang",
        "date": "13787000000 BCE",
        "startYear": -13787000000,
        "description": "hypothetical begin of the Universe through expansion out of an infinitely small and infinitely dense state",
        "snippet": "hypothetical begin of the Universe through expansion out of an infinitely small and infinitely dense state",
        "significance": 10,
        "gap": 150
    },
    {
        "id": "Q47538",
        "title": "221 BC",
        "date": "220 BCE",
        "startYear": -220,
        "description": "year BC",
        "snippet": "year BC",
        "significance": 7,
        "gap": 150
    },
    {
        "id": "Q45445",
        "title": "229 BC",
        "date": "228 BCE",
        "startYear": -228,
        "description": "year of the pre-Julian Roman calendar",
        "snippet": "year of the pre-Julian Roman calendar",
        "significance": 7,
        "gap": 150
    },
    {
        "id": "Q131969",
        "title": "Battle of Thermopylae",
        "date": "479 BCE",
        "startYear": -479,
        "description": "battle of 480 BCE during Persian invasion of Greece",
        "snippet": "battle of 480 BCE during Persian invasion of Greece",
        "significance": 7,
        "gap": 150
    },
    {
        "id": "Q31900",
        "title": "Battle of Marathon",
        "date": "489 BCE",
        "startYear": -489,
        "description": "490 BCE battle in the Greco-Persian wars",
        "snippet": "490 BCE battle in the Greco-Persian wars",
        "significance": 7,
        "gap": 150
    },
    {
        "id": "Q203729",
        "title": "Battle of Kadesh",
        "date": "1273 BCE",
        "startYear": -1273,
        "description": "battle between Egyptians and Hittites fought in 1274 BCE",
        "snippet": "battle between Egyptians and Hittites fought in 1274 BCE",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q141118",
        "title": "Permian-Triassic mass extinction",
        "date": "251900000 BCE",
        "startYear": -251900000,
        "description": "mass extinction event at the end of the Permian Period approximately 250 million years ago",
        "snippet": "mass extinction event at the end of the Permian Period approximately 250 million years ago",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q174361",
        "title": "Book of the Dead",
        "date": "1274 BCE",
        "startYear": -1274,
        "description": "ancient Egyptian funerary text",
        "snippet": "ancient Egyptian funerary text",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q213074",
        "title": "Battle of the Hydaspes",
        "date": "325 BCE",
        "startYear": -325,
        "description": "battle fought by Alexander the Great in 326 BCE against King Porus of the Paurava kingdom on the banks of the Hydaspes River (Jhelum River) in the Punjab near Bhera",
        "snippet": "battle fought by Alexander the Great in 326 BCE against King Porus of the Paurava kingdom on the banks of the Hydaspes R...",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q179591",
        "title": "Battle of Cannae",
        "date": "215 BCE",
        "startYear": -215,
        "description": "major battle of the Second Punic War (216 BCE)",
        "snippet": "major battle of the Second Punic War (216 BCE)",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q200056",
        "title": "Battle of Zama",
        "date": "201 BCE",
        "startYear": -201,
        "description": "final battle of the Second Punic War",
        "snippet": "final battle of the Second Punic War",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q204636",
        "title": "Battle of Plataea",
        "date": "478 BCE",
        "startYear": -478,
        "description": "479 BCE land battle during the second Persian invasion of Greece",
        "snippet": "479 BCE land battle during the second Persian invasion of Greece",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q178850",
        "title": "Battle of Salamis",
        "date": "479 BCE",
        "startYear": -479,
        "description": "480 BCE naval battle fought between an alliance of Greek city-states and the Persian Empire",
        "snippet": "480 BCE naval battle fought between an alliance of Greek city-states and the Persian Empire",
        "significance": 6,
        "gap": 150
    },
    {
        "id": "Q217043",
        "title": "Olduvai Gorge",
        "date": "1750000 BCE",
        "startYear": -1750000,
        "description": "archaeological site in Tanzania",
        "snippet": "archaeological site in Tanzania",
        "significance": 5,
        "gap": 150
    },
    {
        "id": "Q32919",
        "title": "Cambrian explosion",
        "date": "543000000 BCE",
        "startYear": -543000000,
        "description": "Portion of the Cambrian Period during which life vastly diversified",
        "snippet": "Portion of the Cambrian Period during which life vastly diversified",
        "significance": 5,
        "gap": 150
    },
    {
        "id": "Q726454",
        "title": "703 BC",
        "date": "702 BCE",
        "startYear": -702,
        "description": "calendar year",
        "snippet": "calendar year",
        "significance": 5,
        "gap": 150
    },
    {
        "id": "Q28345",
        "title": "750s BC",
        "date": "750 BCE",
        "startYear": -750,
        "description": "759 BC - 750 BC",
        "snippet": "759 BC - 750 BC",
        "significance": 5,
        "gap": 150
    },
    {
        "id": "Q207250",
        "title": "Battle of Lake Trasimene",
        "date": "216 BCE",
        "startYear": -216,
        "description": "217 BCE battle of the Second Punic War",
        "snippet": "217 BCE battle of the Second Punic War",
        "significance": 5,
        "gap": 150
    },
    {
        "id": "Q1065985",
        "title": "Ordovician\u2013Silurian extinction event",
        "date": "443800000 BCE",
        "startYear": -443800000,
        "description": "mass extinction event at the end of the Ordovician period and the beginning of the Silurian period in the Paleozoic era, around 444 million years ago",
        "snippet": "mass extinction event at the end of the Ordovician period and the beginning of the Silurian period in the Paleozoic era,...",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q837317",
        "title": "Big Bang nucleosynthesis",
        "date": "13798000000 BCE",
        "startYear": -13798000000,
        "description": "nucleosynthesis that occurred during the Big Bang (between ca. 10\u207b\u00b2 and 200 seconds after the Big Bang)",
        "snippet": "nucleosynthesis that occurred during the Big Bang (between ca. 10\u207b\u00b2 and 200 seconds after the Big Bang)",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q837561",
        "title": "Great Oxygenation Event",
        "date": "2450000000 BCE",
        "startYear": -2450000000,
        "description": "Paleoproterozoic surge in atmospheric oxygen",
        "snippet": "Paleoproterozoic surge in atmospheric oxygen",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q733364",
        "title": "Battle of Megiddo",
        "date": "1456 BCE",
        "startYear": -1456,
        "description": "ancient battle between the Egyptian Empire and Canaanite rebels",
        "snippet": "ancient battle between the Egyptian Empire and Canaanite rebels",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q319124",
        "title": "Battle of Ipsus",
        "date": "300 BCE",
        "startYear": -300,
        "description": "battle",
        "snippet": "battle",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q504739",
        "title": "Battle of Pydna",
        "date": "167 BCE",
        "startYear": -167,
        "description": "battle of the Third Macedonian War",
        "snippet": "battle of the Third Macedonian War",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q391087",
        "title": "Battle of Cynoscephalae",
        "date": "196 BCE",
        "startYear": -196,
        "description": "battle of the Second Macedonian War",
        "snippet": "battle of the Second Macedonian War",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q917811",
        "title": "Battle of Magnesia",
        "date": "189 BCE",
        "startYear": -189,
        "description": "battle",
        "snippet": "battle",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q271873",
        "title": "Battle of the Trebia",
        "date": "217 BCE",
        "startYear": -217,
        "description": "first major battle of the Second Punic War",
        "snippet": "first major battle of the Second Punic War",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q503982",
        "title": "Battle of Mycale",
        "date": "478 BCE",
        "startYear": -478,
        "description": "479 BCE battle that decisively ended Xerxes's invasion of Greece",
        "snippet": "479 BCE battle that decisively ended Xerxes's invasion of Greece",
        "significance": 4,
        "gap": 150
    },
    {
        "id": "Q835034",
        "title": "Triassic-Jurassic mass extinction",
        "date": "201300000 BCE",
        "startYear": -201300000,
        "description": "mass extinction at the end of the Triassic",
        "snippet": "mass extinction at the end of the Triassic",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q1404282",
        "title": "Kondoa Rock Art Sites",
        "date": "2999 BCE",
        "startYear": -2999,
        "description": "cave in Tanzania",
        "snippet": "cave in Tanzania",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q1144693",
        "title": "Minoan eruption",
        "date": "1600 BCE",
        "startYear": -1600,
        "description": "major volcanic eruption around 1600 BCE",
        "snippet": "major volcanic eruption around 1600 BCE",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q6881",
        "title": "Battle of Cape Ecnomus",
        "date": "255 BCE",
        "startYear": -255,
        "description": "naval battle of the First Punic War\u00a0fought off Cape Ecnomus (modern day Poggio di Sant'Angelo in Licata, Sicily) and one of the largest naval battles of the ancient world",
        "snippet": "naval battle of the First Punic War\u00a0fought off Cape Ecnomus (modern day Poggio di Sant'Angelo in Licata, Sicily) and one...",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q932202",
        "title": "Peace of Nicias",
        "date": "420 BCE",
        "startYear": -420,
        "description": "421 BC treaty between Athens and Sparta",
        "snippet": "421 BC treaty between Athens and Sparta",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q866862",
        "title": "Battle of Aegospotami",
        "date": "404 BCE",
        "startYear": -404,
        "description": "Final major battle of the Peloponnesian War, 405 BCE",
        "snippet": "Final major battle of the Peloponnesian War, 405 BCE",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q431205",
        "title": "Battle of Cunaxa",
        "date": "400 BCE",
        "startYear": -400,
        "description": "battle",
        "snippet": "battle",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q378957",
        "title": "Battle of Ticinus",
        "date": "217 BCE",
        "startYear": -217,
        "description": "battle of the Second Punic War between the Carthaginian forces of Hannibal and the Romans under Publius Cornelius Scipio in November 218 BCE",
        "snippet": "battle of the Second Punic War between the Carthaginian forces of Hannibal and the Romans under Publius Cornelius Scipio...",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q1370497",
        "title": "Ahasuerus",
        "date": "464 BCE",
        "startYear": -464,
        "description": "name of one or more kings of Persia in the Hebrew Bible (Esther, Ezra, Daniel), cognate to the Greek form Xerxes or Artaxerxes",
        "snippet": "name of one or more kings of Persia in the Hebrew Bible (Esther, Ezra, Daniel), cognate to the Greek form Xerxes or Arta...",
        "significance": 3,
        "gap": 150
    },
    {
        "id": "Q747679",
        "title": "Battle of Artemisium",
        "date": "479 BCE",
        "startYear": -479,
        "description": "480 BCE naval battle",
        "snippet": "480 BCE naval battle",
        "significance": 3,
        "gap": 150
    }
];
