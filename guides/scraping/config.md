---
title: Configuration
---

## Configuration du système de contenus JVC

Le document suivant dresse la liste des valeurs que l'on peut passer en *queries* pour rechercher un jeu ou un contenu avec l'API V4. Voir le [guide de scraping](../scraping.md) pour plus d'informations.

### Catégories

```json
"categories": [
{
    "id": 13,
    "name": "Vidéo",
    "types": [
    {
        "id": 19,
        "name": "Chronique",
        "parent_id": 13
    },
    {
        "id": 15,
        "name": "Extrait",
        "parent_id": 13
    },
    {
        "id": 17,
        "name": "Reportage",
        "parent_id": 13
    },
    {
        "id": 16,
        "name": "Making-of",
        "parent_id": 13
    },
    {
        "id": 72,
        "name": "Replay",
        "parent_id": 13
    },
    {
        "id": 14,
        "name": "Bande-annonce",
        "parent_id": 13
    },
    {
        "id": 20,
        "name": "Gameplay",
        "parent_id": 13
    },
    {
        "id": 6,
        "name": "Gaming Live",
        "parent_id": 13
    },
    {
        "id": 21,
        "name": "Vidéo preview",
        "parent_id": 13
    },
    {
        "id": 145,
        "name": "Vidéo test",
        "parent_id": 13
    }
    ]
},
{
    "id": 51,
    "name": "Article",
    "types": [
    {
        "id": 76,
        "name": "Test high tech",
        "parent_id": 51
    },
    {
        "id": 55,
        "name": "Preview",
        "parent_id": 51
    },
    {
        "id": 56,
        "name": "Test",
        "parent_id": 51
    },
    {
        "id": 77,
        "name": "Guide d'achat",
        "parent_id": 51
    },
    {
        "id": 67,
        "name": "Page Dossier",
        "parent_id": 64
    },
    {
        "id": 53,
        "name": "Dossier",
        "parent_id": 150
    },
    {
        "id": 57,
        "name": "Journal de bord",
        "parent_id": 150
    },
    {
        "id": 104,
        "name": "Wiki",
        "parent_id": 64
    },
    {
        "id": 71,
        "name": "Page Wiki",
        "parent_id": 104
    }
    ]
},
{
    "id": 50,
    "name": "News",
    "types": [
    {
        "id": 78,
        "name": "Tutoriel",
        "parent_id": 152
    },
    {
        "id": 59,
        "name": "News JVTech",
        "parent_id": 152
    },
    {
        "id": 63,
        "name": "News bon plan",
        "parent_id": 152
    },
    {
        "id": 152,
        "name": "News High-Tech",
        "parent_id": 50
    },
    {
        "id": 54,
        "name": "News jeu",
        "parent_id": 151
    },
    {
        "id": 60,
        "name": "News personnalité",
        "parent_id": 151
    },
    {
        "id": 61,
        "name": "News business",
        "parent_id": 151
    },
    {
        "id": 62,
        "name": "News événement",
        "parent_id": 151
    },
    {
        "id": 66,
        "name": "News débat et opinion",
        "parent_id": 151
    },
    {
        "id": 68,
        "name": "News inside jeuxvideo.com",
        "parent_id": 151
    },
    {
        "id": 69,
        "name": "News culture",
        "parent_id": 151
    },
    {
        "id": 75,
        "name": "Live Feed",
        "parent_id": 151
    },
    {
        "id": 74,
        "name": "News astuce",
        "parent_id": 151
    },
    {
        "id": 7,
        "name": "News archive",
        "parent_id": 151
    }
    ]
}
]
```

<div id="machines"></div>

### Machines

```json
"machines": [
    {
    "id": 10,
    "name": "PC",
    "alias": "PC",
    "color": "#444444"
    },
    {
    "id": 22,
    "name": "PlayStation 5",
    "alias": "PS5"
    },
    {
    "id": 32,
    "name": "Xbox Series",
    "alias": "Xbox Series",
    "color": "#1A7B19"
    },
    {
    "id": 177539,
    "name": "Nintendo Switch",
    "alias": "Switch",
    "color": "#E60012"
    },
    {
    "id": 42,
    "name": "Nintendo Switch 2",
    "alias": "Switch 2"
    },
    {
    "id": 20,
    "name": "PlayStation 4",
    "alias": "PS4",
    "color": "#0066FF"
    },
    {
    "id": 30,
    "name": "Xbox One",
    "alias": "ONE",
    "color": "#117D10"
    },
    {
    "id": 14,
    "name": "Google Stadia",
    "alias": "Stadia",
    "color": "#FF4C1D"
    },
    {
    "id": 40,
    "name": "Wii U",
    "alias": "WiiU",
    "color": "#5910AB"
    },
    {
    "id": 50,
    "name": "PlayStation 3",
    "alias": "PS3",
    "color": "#000099"
    },
    {
    "id": 60,
    "name": "Xbox 360",
    "alias": "360",
    "color": "#8AC501"
    },
    {
    "id": 70,
    "name": "Nintendo 3DS",
    "alias": "3DS",
    "color": "#F22007"
    },
    {
    "id": 80,
    "name": "PlayStation Vita",
    "alias": "Vita",
    "color": "#3366CC"
    },
    {
    "id": 380,
    "name": "Nintendo DS",
    "alias": "DS",
    "color": "#CC0000"
    },
    {
    "id": 460,
    "name": "Wii",
    "alias": "Wii",
    "color": "#990033"
    },
    {
    "id": 280,
    "name": "Mac",
    "alias": "Mac",
    "color": "#999999"
    },
    {
    "id": 90,
    "name": "iOS",
    "alias": "iOS",
    "color": "#000000"
    },
    {
    "id": 100,
    "name": "Android",
    "alias": "Android",
    "color": "#A4C639"
    },
    {
    "id": 110,
    "name": "Web",
    "alias": "Web",
    "color": "#FF6600"
    },
    {
    "id": 120,
    "name": "3DO",
    "alias": "3DO"
    },
    {
    "id": 130,
    "name": "Amiga",
    "alias": "Amiga"
    },
    {
    "id": 140,
    "name": "Amstrad CPC",
    "alias": "CPC"
    },
    {
    "id": 150,
    "name": "Apple II",
    "alias": "Apple 2"
    },
    {
    "id": 160,
    "name": "Atari ST",
    "alias": "ST"
    },
    {
    "id": 170,
    "name": "Atari 2600",
    "alias": "VCS"
    },
    {
    "id": 570,
    "name": "Atari 5200",
    "alias": "5200"
    },
    {
    "id": 500,
    "name": "Atari 7800",
    "alias": "7800"
    },
    {
    "id": 670,
    "name": "Box Free",
    "alias": "Box Free"
    },
    {
    "id": 660,
    "name": "Box Bouygues",
    "alias": "Box Bouygues"
    },
    {
    "id": 650,
    "name": "Box SFR",
    "alias": "Box SFR"
    },
    {
    "id": 640,
    "name": "Box Orange",
    "alias": "Box Orange"
    },
    {
    "id": 480,
    "name": "CD-i",
    "alias": "CDI"
    },
    {
    "id": 530,
    "name": "Colecovision",
    "alias": "ColecoV"
    },
    {
    "id": 180,
    "name": "Commodore 64",
    "alias": "C64"
    },
    {
    "id": 190,
    "name": "Dreamcast",
    "alias": "DCAST"
    },
    {
    "id": 490,
    "name": "Famicom Disk System",
    "alias": "FDS"
    },
    {
    "id": 550,
    "name": "Game & Watch",
    "alias": "G&W"
    },
    {
    "id": 200,
    "name": "Gameboy",
    "alias": "GB"
    },
    {
    "id": 210,
    "name": "Gameboy Advance",
    "alias": "GBA"
    },
    {
    "id": 560,
    "name": "Gameboy Color",
    "alias": "GBC"
    },
    {
    "id": 220,
    "name": "Gamecube",
    "alias": "NGC"
    },
    {
    "id": 230,
    "name": "Game Gear",
    "alias": "G.GEAR"
    },
    {
    "id": 240,
    "name": "Gizmondo",
    "alias": "Giz"
    },
    {
    "id": 250,
    "name": "GP32",
    "alias": "GP32"
    },
    {
    "id": 510,
    "name": "GX-4000",
    "alias": "GX-4000"
    },
    {
    "id": 540,
    "name": "Intellivision",
    "alias": "IntelliV"
    },
    {
    "id": 260,
    "name": "Jaguar",
    "alias": "Jaguar"
    },
    {
    "id": 270,
    "name": "Lynx",
    "alias": "Lynx"
    },
    {
    "id": 290,
    "name": "Master System",
    "alias": "MS"
    },
    {
    "id": 300,
    "name": "Megadrive",
    "alias": "MD"
    },
    {
    "id": 310,
    "name": "Megadrive 32X",
    "alias": "32X"
    },
    {
    "id": 320,
    "name": "Mega-CD",
    "alias": "Mega-CD"
    },
    {
    "id": 600,
    "name": "MSX",
    "alias": "MSX"
    },
    {
    "id": 330,
    "name": "N-Gage",
    "alias": "NGAGE"
    },
    {
    "id": 340,
    "name": "Neo Geo",
    "alias": "NEO"
    },
    {
    "id": 350,
    "name": "Neo Geo Pocket",
    "alias": "NGPocket"
    },
    {
    "id": 360,
    "name": "Nes",
    "alias": "Nes"
    },
    {
    "id": 620,
    "name": "Odyssey",
    "alias": "ODY"
    },
    {
    "id": 370,
    "name": "Nintendo 64",
    "alias": "N64"
    },
    {
    "id": 390,
    "name": "PSone",
    "alias": "PS1"
    },
    {
    "id": 400,
    "name": "PlayStation 2",
    "alias": "PS2"
    },
    {
    "id": 410,
    "name": "PlayStation Portable",
    "alias": "PSP",
    "color": "#0099FF"
    },
    {
    "id": 420,
    "name": "Saturn",
    "alias": "Saturn"
    },
    {
    "id": 430,
    "name": "Super Nintendo",
    "alias": "SNES"
    },
    {
    "id": 440,
    "name": "PC Engine",
    "alias": "PC ENG"
    },
    {
    "id": 520,
    "name": "Vectrex",
    "alias": "Vectrex"
    },
    {
    "id": 630,
    "name": "Videopac",
    "alias": "VPAC"
    },
    {
    "id": 450,
    "name": "Virtual Boy",
    "alias": "V.BOY"
    },
    {
    "id": 580,
    "name": "WonderSwan",
    "alias": "WSwan"
    },
    {
    "id": 590,
    "name": "WonderSwan Color",
    "alias": "WSwan C"
    },
    {
    "id": 470,
    "name": "Xbox",
    "alias": "Xbox"
    },
    {
    "id": 610,
    "name": "ZX Spectrum",
    "alias": "ZXS"
    },
    {
    "id": 171740,
    "name": "Arcade",
    "alias": "Arcade"
    },
    {
    "id": 172235,
    "name": "New Nintendo 3DS",
    "alias": "New 3DS"
    },
    {
    "id": 173455,
    "name": "OUYA",
    "alias": "OUYA"
    },
    {
    "id": 174433,
    "name": "Steam Machine",
    "alias": "Steam Machine"
    },
    {
    "id": 175794,
    "name": "Linux",
    "alias": "Linux"
    },
    {
    "id": 680,
    "name": "Shield TV",
    "alias": "Shield TV"
    },
    {
    "id": 190274,
    "name": "Intellivision Amico",
    "alias": "Intellivision Amico"
    },
    {
    "id": 200772,
    "name": "Steam Deck",
    "alias": "Steam Deck"
    }
]
```

<div id="events"></div>

### Événements

```json
"events": [
    {
    "id": 6850,
    "name": "Find Your Next Game",
    "alias": "FYNG"
    },
    {
    "id": 6820,
    "name": "gamescom"
    },
    {
    "id": 6840,
    "name": "Paris Games Week",
    "alias": "PGW"
    },
    {
    "id": 6830,
    "name": "Tokyo Game Show",
    "alias": "TGS"
    },
    {
    "id": 6800,
    "name": "E3",
    "alias": "Electronic Entertainment Expo"
    },
    {
    "id": 200143,
    "name": "Summer Game Fest"
    },
    {
    "id": 174401,
    "name": "Japan Expo"
    },
    {
    "id": 178775,
    "name": "PAX East"
    },
    {
    "id": 177123,
    "name": "Toulouse Game Show"
    },
    {
    "id": 181206,
    "name": "PlayStation Experience"
    },
    {
    "id": 180309,
    "name": "Brasil Game Show"
    },
    {
    "id": 179794,
    "name": "Comic-Con"
    },
    {
    "id": 178915,
    "name": "Kakutop FR"
    },
    {
    "id": 176644,
    "name": "KAKUTOP League"
    },
    {
    "id": 175488,
    "name": "QuakeCon"
    },
    {
    "id": 174858,
    "name": "Minecon"
    },
    {
    "id": 174198,
    "name": "Stunfest"
    },
    {
    "id": 172783,
    "name": "ESWC"
    },
    {
    "id": 172553,
    "name": "BlizzCon"
    },
    {
    "id": 171608,
    "name": "Gamers Assembly"
    },
    {
    "id": 201395,
    "name": "Game Awards"
    },
    {
    "id": 169850,
    "name": "AGDQ",
    "alias": "SGDQ"
    },
    {
    "id": 201770,
    "name": "MWC 2022"
    },
    {
    "id": 201635,
    "name": "JO"
    },
    {
    "id": 201764,
    "name": "As d'Or"
    },
    {
    "id": 6810,
    "name": "GDC"
    }
]
```

<div id="genres"></div>

### Genres

```json
"genres": [
    {
    "id": 2330,
    "name": "Stratégie"
    },
    {
    "id": 2140,
    "name": "Gestion"
    },
    {
    "id": 2560,
    "name": "Sport"
    },
    {
    "id": 2620,
    "name": "Shooter"
    },
    {
    "id": 2080,
    "name": "Plate-Forme"
    },
    {
    "id": 2010,
    "name": "Beat'em All"
    },
    {
    "id": 2030,
    "name": "TPS"
    },
    {
    "id": 2040,
    "name": "Shoot'em Up"
    },
    {
    "id": 2050,
    "name": "Tir"
    },
    {
    "id": 2070,
    "name": "Infiltration"
    },
    {
    "id": 2090,
    "name": "Survival-Horror"
    },
    {
    "id": 2110,
    "name": "Objets cachés"
    },
    {
    "id": 2120,
    "name": "Point'n Click"
    },
    {
    "id": 2130,
    "name": "Visual Novel"
    },
    {
    "id": 2150,
    "name": "City Builder"
    },
    {
    "id": 2160,
    "name": "Management"
    },
    {
    "id": 2180,
    "name": "MMOFPS"
    },
    {
    "id": 2190,
    "name": "MMORPG"
    },
    {
    "id": 2200,
    "name": "Réflexion"
    },
    {
    "id": 2210,
    "name": "Puzzle-Game"
    },
    {
    "id": 2220,
    "name": "Match 3"
    },
    {
    "id": 2230,
    "name": "Casse briques"
    },
    {
    "id": 2250,
    "name": "Action RPG"
    },
    {
    "id": 2260,
    "name": "Dungeon RPG"
    },
    {
    "id": 2270,
    "name": "Hack'n slash"
    },
    {
    "id": 2280,
    "name": "Roguelike"
    },
    {
    "id": 2290,
    "name": "Tactical RPG"
    },
    {
    "id": 2300,
    "name": "Rythme"
    },
    {
    "id": 2310,
    "name": "Karaoké"
    },
    {
    "id": 2320,
    "name": "Danse"
    },
    {
    "id": 2340,
    "name": "Wargame"
    },
    {
    "id": 2350,
    "name": "4X"
    },
    {
    "id": 2360,
    "name": "God Game"
    },
    {
    "id": 2370,
    "name": "Tactique"
    },
    {
    "id": 2380,
    "name": "Tower Defense"
    },
    {
    "id": 2390,
    "name": "Adresse"
    },
    {
    "id": 2400,
    "name": "Coaching"
    },
    {
    "id": 2410,
    "name": "Création"
    },
    {
    "id": 2420,
    "name": "Drague"
    },
    {
    "id": 2430,
    "name": "Flipper"
    },
    {
    "id": 2440,
    "name": "Autres"
    },
    {
    "id": 2610,
    "name": "Compilation"
    },
    {
    "id": 2450,
    "name": "Jeu de cartes"
    },
    {
    "id": 2460,
    "name": "Jeu de société"
    },
    {
    "id": 2470,
    "name": "Ludo-Educatif"
    },
    {
    "id": 2480,
    "name": "MOBA"
    },
    {
    "id": 2490,
    "name": "Open World"
    },
    {
    "id": 2500,
    "name": "Party-Game"
    },
    {
    "id": 2510,
    "name": "Runner"
    },
    {
    "id": 2520,
    "name": "Sandbox"
    },
    {
    "id": 2530,
    "name": "Serious Games"
    },
    {
    "id": 2540,
    "name": "Simulation"
    },
    {
    "id": 2550,
    "name": "Simulation de vie"
    },
    {
    "id": 2590,
    "name": "Film Interactif"
    },
    {
    "id": 2600,
    "name": "Simulation de vol"
    },
    {
    "id": 2170,
    "name": "MMO"
    },
    {
    "id": 188650,
    "name": "Survie"
    },
    {
    "id": 188645,
    "name": "Battle Royale"
    },
    {
    "id": 2020,
    "name": "FPS"
    },
    {
    "id": 2240,
    "name": "RPG",
    "alias": "Jeu de Rôle"
    },
    {
    "id": 2000,
    "name": "Action"
    },
    {
    "id": 2100,
    "name": "Aventure"
    },
    {
    "id": 2570,
    "name": "Combat"
    },
    {
    "id": 2580,
    "name": "Course"
    }
]
```

<div id="themes"></div>

### Thèmes

```json
"themes": [
    {
    "id": 201637,
    "name": "Écologie"
    },
    {
    "id": 5161,
    "name": "Futuriste"
    },
    {
    "id": 176806,
    "name": "Kids"
    },
    {
    "id": 172628,
    "name": "Golf"
    },
    {
    "id": 172696,
    "name": "Catch"
    },
    {
    "id": 177572,
    "name": "Fantasy"
    },
    {
    "id": 178721,
    "name": "Zen"
    },
    {
    "id": 5100,
    "name": "Fantastique"
    },
    {
    "id": 5110,
    "name": "Heroic Fantasy"
    },
    {
    "id": 5120,
    "name": "Mythologie"
    },
    {
    "id": 5130,
    "name": "Post-apocalyptique"
    },
    {
    "id": 5140,
    "name": "Cyberpunk"
    },
    {
    "id": 5150,
    "name": "Steampunk"
    },
    {
    "id": 5160,
    "name": "Science-Fiction"
    },
    {
    "id": 5170,
    "name": "Fantômes"
    },
    {
    "id": 5180,
    "name": "Monstres"
    },
    {
    "id": 5190,
    "name": "Vampires"
    },
    {
    "id": 5200,
    "name": "Zombies"
    },
    {
    "id": 5210,
    "name": "Extraterrestres"
    },
    {
    "id": 5220,
    "name": "Super-Héros"
    },
    {
    "id": 5230,
    "name": "Mecha"
    },
    {
    "id": 5240,
    "name": "Historique"
    },
    {
    "id": 5250,
    "name": "Préhistoire"
    },
    {
    "id": 5260,
    "name": "Antiquité"
    },
    {
    "id": 5270,
    "name": "Moyen-Age"
    },
    {
    "id": 5280,
    "name": "Western"
    },
    {
    "id": 5290,
    "name": "1ère Guerre Mondiale"
    },
    {
    "id": 5300,
    "name": "2nde Guerre Mondiale"
    },
    {
    "id": 5310,
    "name": "Contemporain"
    },
    {
    "id": 5320,
    "name": "Automobile"
    },
    {
    "id": 5330,
    "name": "Formule 1"
    },
    {
    "id": 5340,
    "name": "Gran Tourisme"
    },
    {
    "id": 5350,
    "name": "Karting"
    },
    {
    "id": 5360,
    "name": "Off-Road"
    },
    {
    "id": 5370,
    "name": "Rallye"
    },
    {
    "id": 5380,
    "name": "Stock-cars"
    },
    {
    "id": 5390,
    "name": "Aéronautique"
    },
    {
    "id": 5400,
    "name": "Avions"
    },
    {
    "id": 5410,
    "name": "Hélicoptères"
    },
    {
    "id": 5420,
    "name": "Animaux"
    },
    {
    "id": 5430,
    "name": "Chats"
    },
    {
    "id": 5440,
    "name": "Chiens"
    },
    {
    "id": 5450,
    "name": "Chevaux"
    },
    {
    "id": 5460,
    "name": "Dinosaures"
    },
    {
    "id": 5470,
    "name": "Dragons"
    },
    {
    "id": 5480,
    "name": "Continents"
    },
    {
    "id": 5490,
    "name": "Afrique"
    },
    {
    "id": 5500,
    "name": "Antarctique"
    },
    {
    "id": 5510,
    "name": "Amérique du Nord"
    },
    {
    "id": 5520,
    "name": "Amérique du Sud"
    },
    {
    "id": 5530,
    "name": "Europe"
    },
    {
    "id": 5540,
    "name": "Asie"
    },
    {
    "id": 5550,
    "name": "Océanie"
    },
    {
    "id": 5650,
    "name": "Nautique"
    },
    {
    "id": 5660,
    "name": "Bateaux"
    },
    {
    "id": 5670,
    "name": "Sous-marins"
    },
    {
    "id": 5690,
    "name": "Arts martiaux"
    },
    {
    "id": 5700,
    "name": "Basket"
    },
    {
    "id": 5710,
    "name": "Bowling"
    },
    {
    "id": 5720,
    "name": "Boxe"
    },
    {
    "id": 5730,
    "name": "Catch"
    },
    {
    "id": 5740,
    "name": "Chasse"
    },
    {
    "id": 5750,
    "name": "Cyclisme",
    "alias": "Vélo"
    },
    {
    "id": 5760,
    "name": "Echecs"
    },
    {
    "id": 5770,
    "name": "Equitation"
    },
    {
    "id": 5780,
    "name": "Fléchettes"
    },
    {
    "id": 5790,
    "name": "Football"
    },
    {
    "id": 5800,
    "name": "Football américain"
    },
    {
    "id": 5810,
    "name": "Hockey"
    },
    {
    "id": 5820,
    "name": "Jet ski"
    },
    {
    "id": 5830,
    "name": "Paintball",
    "alias": "Airsoft"
    },
    {
    "id": 5840,
    "name": "Pêche"
    },
    {
    "id": 5850,
    "name": "Pétanque"
    },
    {
    "id": 5860,
    "name": "Rugby"
    },
    {
    "id": 5870,
    "name": "Skate"
    },
    {
    "id": 5880,
    "name": "Ski"
    },
    {
    "id": 5890,
    "name": "Snow"
    },
    {
    "id": 5900,
    "name": "Tennis"
    },
    {
    "id": 5910,
    "name": "Tennis de table",
    "alias": "Ping Pong"
    },
    {
    "id": 5920,
    "name": "Tir à l'arc"
    },
    {
    "id": 5930,
    "name": "UFC"
    },
    {
    "id": 5940,
    "name": "Casino"
    },
    {
    "id": 5950,
    "name": "Enquête"
    },
    {
    "id": 5960,
    "name": "Espace"
    },
    {
    "id": 5970,
    "name": "Espionnage"
    },
    {
    "id": 5980,
    "name": "Hôpital"
    },
    {
    "id": 5990,
    "name": "Horreur"
    },
    {
    "id": 6000,
    "name": "Humoristique"
    },
    {
    "id": 6010,
    "name": "Moto",
    "alias": "Game Developers Conference"
    },
    {
    "id": 6020,
    "name": "Ninjas"
    },
    {
    "id": 6030,
    "name": "Parc d'attractions"
    },
    {
    "id": 6040,
    "name": "Pirates"
    },
    {
    "id": 6050,
    "name": "Poids lourds"
    },
    {
    "id": 6060,
    "name": "Robots"
    },
    {
    "id": 6070,
    "name": "Tank"
    },
    {
    "id": 6080,
    "name": "Trains"
    },
    {
    "id": 187301,
    "name": "Dieselpunk"
    },
    {
    "id": 183610,
    "name": "1984"
    }
]
```

<div id="modes"></div>

### Modes

```json
"modes": [
    {
    "id": 3200,
    "name": "Jouable en solo"
    },
    {
    "id": 3210,
    "name": "Multi sur le même écran"
    },
    {
    "id": 3220,
    "name": "Multi en local"
    },
    {
    "id": 3230,
    "name": "Multi en ligne"
    },
    {
    "id": 3240,
    "name": "Multi en coopératif"
    },
    {
    "id": 3250,
    "name": "Multi en compétitif"
    }
]
```

<div id="chronicles"></div>

### Chroniques

```json
"chronicles": [
    {
    "id": 201260,
    "name": "JV LEGENDS"
    },
    {
    "id": 202480,
    "name": "JV Tribunal"
    },
    {
    "id": 7610,
    "name": "Epic"
    },
    {
    "id": 201918,
    "name": "JV FACTS"
    },
    {
    "id": 203761,
    "name": "JV Fast"
    },
    {
    "id": 202939,
    "name": "JV Débat"
    },
    {
    "id": 201983,
    "name": "JV LORE"
    },
    {
    "id": 175341,
    "name": "Au cœur de l'Histoire"
    },
    {
    "id": 7750,
    "name": "Pause Process"
    },
    {
    "id": 7760,
    "name": "Minecraft Hardcore"
    },
    {
    "id": 175153,
    "name": "Les 5 jeux préférés de..."
    },
    {
    "id": 171027,
    "name": "Papy Grenier"
    },
    {
    "id": 7110,
    "name": "3615 Usul"
    },
    {
    "id": 7120,
    "name": "After Bit"
    },
    {
    "id": 7130,
    "name": "Crossed"
    },
    {
    "id": 7140,
    "name": "Draw in Game"
    },
    {
    "id": 7150,
    "name": "Enyd, raconte-nous une histoire"
    },
    {
    "id": 7160,
    "name": "Expéditions inutiles"
    },
    {
    "id": 7170,
    "name": "Fanta & Bob, les aventuriers de Minecraft"
    },
    {
    "id": 7180,
    "name": "Il était une fois"
    },
    {
    "id": 7190,
    "name": "Le Fond De L'Affaire"
    },
    {
    "id": 7200,
    "name": "Les Gamers de l'Extrême"
    },
    {
    "id": 7210,
    "name": "Les parties multi de Diablox9"
    },
    {
    "id": 7220,
    "name": "L'histoire du jeu vidéo"
    },
    {
    "id": 7230,
    "name": "Looking for Games"
    },
    {
    "id": 7240,
    "name": "L'univers du jeu indépendant"
    },
    {
    "id": 7250,
    "name": "Merci Dorian"
    },
    {
    "id": 7260,
    "name": "New Gamers Factory"
    },
    {
    "id": 7270,
    "name": "Scènes de jeu"
    },
    {
    "id": 7280,
    "name": "Speed Game"
    },
    {
    "id": 7290,
    "name": "Versus"
    },
    {
    "id": 7600,
    "name": "Back To..."
    },
    {
    "id": 7620,
    "name": "Comment ça marche ?"
    },
    {
    "id": 7630,
    "name": "Le Défi du Challenge"
    },
    {
    "id": 7740,
    "name": "Top 10"
    },
    {
    "id": 7640,
    "name": "Coupe du Monde jeuxvideo.com"
    },
    {
    "id": 7660,
    "name": "Tour de France jeuxvideo.com"
    },
    {
    "id": 7680,
    "name": "Cover"
    },
    {
    "id": 170798,
    "name": "Prison Architect"
    },
    {
    "id": 176196,
    "name": "Spoilers"
    },
    {
    "id": 169518,
    "name": "Parlons Peu Parlons Pub"
    },
    {
    "id": 171026,
    "name": "Test du grenier"
    },
    {
    "id": 171028,
    "name": "Hors Série (Joueur du Grenier)"
    },
    {
    "id": 176745,
    "name": "Seul face aux ténèbres"
    },
    {
    "id": 170801,
    "name": "VGM"
    },
    {
    "id": 177493,
    "name": "FUTSHOW"
    },
    {
    "id": 178365,
    "name": "J'aime / J'aime pas"
    },
    {
    "id": 178608,
    "name": "Les perles Steam"
    },
    {
    "id": 178059,
    "name": "Meilleurs jeux du mois"
    },
    {
    "id": 177756,
    "name": "Ce jeu qui"
    },
    {
    "id": 177745,
    "name": "Retro Découverte"
    },
    {
    "id": 178043,
    "name": "Avance Rapide"
    },
    {
    "id": 170613,
    "name": "Game's up"
    },
    {
    "id": 7770,
    "name": "After Work"
    },
    {
    "id": 181713,
    "name": "Nous aussi on vous aime"
    },
    {
    "id": 180020,
    "name": "Les JO de jeuxvideo.com"
    },
    {
    "id": 181358,
    "name": "JV Le Lab"
    },
    {
    "id": 181995,
    "name": "Courrier des Lecteurs"
    },
    {
    "id": 183544,
    "name": "J'ai connu"
    },
    {
    "id": 184732,
    "name": "Pause Cafay"
    },
    {
    "id": 191316,
    "name": "La Gazette de l'eSport"
    },
    {
    "id": 191639,
    "name": "A Geek to the Past"
    },
    {
    "id": 194003,
    "name": "Le Poing Jay"
    },
    {
    "id": 194528,
    "name": "In Game"
    },
    {
    "id": 195818,
    "name": "La question du jour"
    },
    {
    "id": 198045,
    "name": "JVCom Daily"
    },
    {
    "id": 198352,
    "name": "JVCom Focus"
    },
    {
    "id": 198419,
    "name": "JVCom Match"
    },
    {
    "id": 198789,
    "name": "5 choses à savoir"
    }
]
```

<style>
    <style>
        pre {
            max-width: 10cm;
            overflow: auto;
            white-space: pre-wrap; /* Permet le retour à la ligne */
        }
    </style>
</style>