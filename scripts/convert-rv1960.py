#!/usr/bin/env python3
"""Convert the downloaded RV 1960 JSON to our app's format."""

import json
from pathlib import Path

INPUT_PATH = Path("/tmp/rvr1960_raw.json")
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "rv_1960.json"

# Map source book names to (book_number, canonical_name)
BOOK_MAP = {
    "Génesis": (1, "Génesis"), "Éxodo": (2, "Éxodo"), "Levítico": (3, "Levítico"),
    "Números": (4, "Números"), "Deuteronomio": (5, "Deuteronomio"),
    "Josué": (6, "Josué"), "Jueces": (7, "Jueces"), "Rut": (8, "Rut"),
    "1 Samuel": (9, "1 Samuel"), "2 Samuel": (10, "2 Samuel"),
    "1 Reyes": (11, "1 Reyes"), "2 Reyes": (12, "2 Reyes"),
    "1 Crónicas": (13, "1 Crónicas"), "2 Crónicas": (14, "2 Crónicas"),
    "Esdras": (15, "Esdras"), "Nehemías": (16, "Nehemías"),
    "Ester": (17, "Ester"), "Job": (18, "Job"), "Salmos": (19, "Salmos"),
    "Proverbios": (20, "Proverbios"), "Eclesiastés": (21, "Eclesiastés"),
    "Cantares": (22, "Cantares"), "Isaías": (23, "Isaías"),
    "Jeremías": (24, "Jeremías"), "Lamentaciones": (25, "Lamentaciones"),
    "Ezequiel": (26, "Ezequiel"), "Daniel": (27, "Daniel"),
    "Oseas": (28, "Oseas"), "Joel": (29, "Joel"), "Amós": (30, "Amós"),
    "Abdías": (31, "Abdías"), "Jonás": (32, "Jonás"), "Miqueas": (33, "Miqueas"),
    "Nahúm": (34, "Nahúm"), "Habacuc": (35, "Habacuc"),
    "Sofonías": (36, "Sofonías"), "Hageo": (37, "Hageo"),
    "Zacarías": (38, "Zacarías"), "Malaquías": (39, "Malaquías"),
    "S. Mateo": (40, "Mateo"), "S. Marcos": (41, "Marcos"),
    "S. Lucas": (42, "Lucas"), "S.Juan": (43, "Juan"),
    "Hechos": (44, "Hechos"), "Romanos": (45, "Romanos"),
    "1 Corintios": (46, "1 Corintios"), "2 Corintios": (47, "2 Corintios"),
    "Gálatas": (48, "Gálatas"), "Efesios": (49, "Efesios"),
    "Filipenses": (50, "Filipenses"), "Colosenses": (51, "Colosenses"),
    "1 Tesalonicenses": (52, "1 Tesalonicenses"),
    "2 Tesalonicenses": (53, "2 Tesalonicenses"),
    "1 Timoteo": (54, "1 Timoteo"), "2 Timoteo": (55, "2 Timoteo"),
    "Tito": (56, "Tito"), "Filemón": (57, "Filemón"),
    "Hebreos": (58, "Hebreos"), "Santiago": (59, "Santiago"),
    "1 Pedro": (60, "1 Pedro"), "2 Pedro": (61, "2 Pedro"),
    "1 Juan": (62, "1 Juan"), "2 Juan": (63, "2 Juan"),
    "3 Juan": (64, "3 Juan"), "Judas": (65, "Judas"),
    "Apocalipsis": (66, "Apocalipsis"),
}

with open(INPUT_PATH) as f:
    data = json.load(f)

verses = []
for src_name, (book_num, canon_name) in sorted(BOOK_MAP.items(), key=lambda x: x[1][0]):
    book_data = data.get(src_name, {})
    if not book_data:
        print(f"WARNING: Book '{src_name}' not found in source!")
        continue

    for ch_str in sorted(book_data.keys(), key=int):
        ch_verses = book_data[ch_str]
        for v_str in sorted(ch_verses.keys(), key=int):
            text = ch_verses[v_str].strip()
            verses.append({
                "book_name": canon_name,
                "book": book_num,
                "chapter": int(ch_str),
                "verse": int(v_str),
                "text": text
            })

print(f"Total verses: {len(verses)}")
print(f"Books: {len(set(v['book'] for v in verses))}")
print(f"Sample: {verses[0]['book_name']} {verses[0]['chapter']}:{verses[0]['verse']} - {verses[0]['text'][:80]}")
print(f"Last: {verses[-1]['book_name']} {verses[-1]['chapter']}:{verses[-1]['verse']} - {verses[-1]['text'][:80]}")

output = {
    "metadata": {
        "name": "Reina Valera 1960",
        "shortname": "RV 1960",
        "module": "rv_1960",
        "year": "1960",
        "description": "Biblia Reina-Valera Revisión de 1960",
        "lang": "Spanish",
        "lang_short": "es",
        "copyright": 1,
        "copyright_statement": "©Sociedades Bíblicas en América Latina, 1960."
    },
    "verses": verses
}

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=None, separators=(',', ':'))

print(f"\nWritten to {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size / 1024 / 1024:.1f} MB)")
