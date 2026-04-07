#!/usr/bin/env python3
"""
Extract Bible text (RV 1960) from the Thompson Reference Bible PDF.
Uses default pypdf text extraction (which gives correct reading order)
then filters out Thompson references and parses verse structure.
"""

import json
import re
from pathlib import Path
from pypdf import PdfReader

PDF_PATH = Path(__file__).parent.parent / "biblia.pdf"
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "rv_1960.json"

START_PAGE = 15
END_PAGE = 1221

BOOKS = [
    (15, "Génesis", 1), (69, "Éxodo", 2), (114, "Levítico", 3),
    (146, "Números", 4), (192, "Deuteronomio", 5), (231, "Josué", 6),
    (258, "Jueces", 7), (285, "Rut", 8), (289, "1 Samuel", 9),
    (323, "2 Samuel", 10), (353, "1 Reyes", 11), (387, "2 Reyes", 12),
    (419, "1 Crónicas", 13), (450, "2 Crónicas", 14), (487, "Esdras", 15),
    (498, "Nehemías", 16), (513, "Ester", 17), (521, "Job", 18),
    (557, "Salmos", 19), (651, "Proverbios", 20), (682, "Eclesiastés", 21),
    (690, "Cantares", 22), (696, "Isaías", 23), (747, "Jeremías", 24),
    (804, "Lamentaciones", 25), (812, "Ezequiel", 26), (864, "Daniel", 27),
    (880, "Oseas", 28), (888, "Joel", 29), (891, "Amós", 30),
    (897, "Abdías", 31), (898, "Jonás", 32), (900, "Miqueas", 33),
    (905, "Nahum", 34), (907, "Habacuc", 35), (910, "Sofonías", 36),
    (913, "Hageo", 37), (915, "Zacarías", 38), (924, "Malaquías", 39),
    (929, "Mateo", 40), (967, "Marcos", 41), (991, "Lucas", 42),
    (1031, "Juan", 43), (1060, "Hechos", 44), (1097, "Romanos", 45),
    (1112, "1 Corintios", 46), (1127, "2 Corintios", 47),
    (1137, "Gálatas", 48), (1143, "Efesios", 49), (1149, "Filipenses", 50),
    (1153, "Colosenses", 51), (1157, "1 Tesalonicenses", 52),
    (1161, "2 Tesalonicenses", 53), (1163, "1 Timoteo", 54),
    (1167, "2 Timoteo", 55), (1170, "Tito", 56), (1172, "Filemón", 57),
    (1173, "Hebreos", 58), (1185, "Santiago", 59), (1189, "1 Pedro", 60),
    (1194, "2 Pedro", 61), (1197, "1 Juan", 62), (1201, "2 Juan", 63),
    (1202, "3 Juan", 64), (1203, "Judas", 65), (1205, "Apocalipsis", 66),
]

EXPECTED_VERSES = {
    1: 1533, 2: 1213, 3: 859, 4: 1288, 5: 959, 6: 658, 7: 618, 8: 85,
    9: 810, 10: 695, 11: 816, 12: 719, 13: 942, 14: 822, 15: 280, 16: 406,
    17: 167, 18: 1070, 19: 2461, 20: 915, 21: 222, 22: 117, 23: 1292,
    24: 1364, 25: 154, 26: 1273, 27: 357, 28: 197, 29: 73, 30: 146,
    31: 21, 32: 48, 33: 105, 34: 47, 35: 56, 36: 53, 37: 38, 38: 211,
    39: 55, 40: 1071, 41: 678, 42: 1151, 43: 879, 44: 1007, 45: 433,
    46: 437, 47: 257, 48: 149, 49: 155, 50: 104, 51: 95, 52: 89, 53: 47,
    54: 113, 55: 83, 56: 46, 57: 25, 58: 303, 59: 108, 60: 105, 61: 61,
    62: 105, 63: 13, 64: 14, 65: 25, 66: 404,
}


def get_book_for_page(pdf_page):
    result = BOOKS[0]
    for start_page, name, num in BOOKS:
        if pdf_page >= start_page:
            result = (start_page, name, num)
        else:
            break
    return result


def is_thompson_ref(line):
    """Check if a line is a Thompson reference annotation."""
    s = line.strip()
    if not s:
        return True

    # 3+ digit number at start (Thompson index 100-4500+)
    if re.match(r'^\d{3,}\s', s):
        return True
    # Standalone 3+ digit numbers
    if re.match(r'^\d{3,}$', s):
        return True

    # p.p. parallel passages
    if re.match(r'^p\.p\.', s):
        return True

    # Number > 176 at start always Thompson
    m = re.match(r'^(\d{1,4})\s+(.+)', s)
    if m:
        num = int(m.group(1))
        rest = m.group(2)
        if num > 176:
            return True
        # Number + cross-reference pattern
        if re.search(r'[A-Z][a-záéíóú]+\s+\d+:\d+', rest):
            return True
        # Number + parenthetical
        if re.search(r'\(\d+\)', rest):
            return True
        # Short topic-style line with comma + reference
        if len(rest) < 40 and ',' in rest and re.search(r'\d+:\d+', rest):
            return True

    # "Autor," patterns
    if re.match(r'^Autor[,\s]', s):
        return True
    if 'Análisis del libro' in s:
        return True
    if s.startswith('Palabra clave:') or s.startswith('Pensamiento'):
        return True

    # Date patterns
    if re.match(r'^\d{3,4}\s+[ad]\.C\.', s):
        return True

    # "(Comúnmente aceptado)"
    if re.match(r'^\(.*aceptado', s, re.IGNORECASE):
        return True

    # Standalone book reference lines
    if re.match(r'^[A-Z][a-záéíóú]+\s+\d+:\d+', s) and len(s) < 40:
        return True

    # "Arboles (4), (Indice)" style
    if re.match(r'^[A-Z][a-záéíóú]+\s*\(\d+\)', s) and len(s) < 50:
        return True

    return False


def is_page_header(line):
    s = line.strip()
    # "GÉNESIS 1:28", "SAN MATEO 2:5", "1 SAMUEL 1:1", "EL APOCALIPSIS 2:2"
    patterns = [
        r'^[A-ZÁÉÍÓÚÑ\s]{3,}\d+:\d+',
        r'^\d\s+[A-ZÁÉÍÓÚÑ]+\s+\d+:\d+',
        r'^EL\s+[A-ZÁÉÍÓÚÑ\s]+\d+:\d+',
        r'^SA\s*N\s+[A-ZÁÉÍÓÚÑ\s]+\d+:\d+',
    ]
    for pat in patterns:
        if re.match(pat, s):
            return True
    return False


def is_section_subtitle(line):
    s = line.strip()
    if not s:
        return False
    # Cross-reference subtitles "(Mt. 10.1-4; Mr. 3.13-19)"
    if re.match(r'^\([A-Z][a-záéíóú]*\.?\s+\d+', s):
        return True
    # Psalm book divisions
    if re.match(r'^L\s*I\s*B\s*R\s*O\s+[IVX]+', s):
        return True
    if re.match(r'^LIBRO\s+[IVX]+', s):
        return True
    # Psalm superscriptions
    for pat in [r'^Al músico', r'^Salmo de\s', r'^Sigaión', r'^Cántico',
                r'^Masquil', r'^Mictam', r'^Oración de\s.*David']:
        if re.match(pat, s, re.IGNORECASE):
            return True
    return False


def is_book_header(line):
    s = line.strip()
    if not s:
        return False
    book_markers = [
        'LIBRO PRIMERO', 'LIBRO SEGUNDO', 'LIBRO TERCERO',
        'LIBRO CUARTO', 'LIBRO QUINTO',
        'EVANGELIO', 'EPÍSTOLA', 'EPISTOLA',
        'HECHOS DE LOS', 'APOCALIPSIS DE',
        'PROFECÍA DE', 'PROFECIA DE',
    ]
    for marker in book_markers:
        if marker in s:
            return True
    # Standalone book names in caps
    book_names = {
        'GÉNESIS', 'GENESIS', 'ÉXODO', 'EXODO', 'LEVÍTICO', 'LEVITICO',
        'NÚMEROS', 'NUMEROS', 'DEUTERONOMIO', 'JOSUÉ', 'JOSUE', 'JUECES',
        'RUT', 'SAMUEL', 'REYES', 'CRÓNICAS', 'CRONICAS', 'ESDRAS',
        'NEHEMÍAS', 'NEHEMIAS', 'ESTER', 'JOB', 'SALMOS', 'PROVERBIOS',
        'ECLESIASTÉS', 'ECLESIASTES', 'CANTARES', 'ISAÍAS', 'ISAIAS',
        'JEREMÍAS', 'JEREMIAS', 'LAMENTACIONES', 'EZEQUIEL', 'DANIEL',
        'OSEAS', 'JOEL', 'AMÓS', 'AMOS', 'ABDÍAS', 'ABDIAS', 'JONÁS',
        'JONAS', 'MIQUEAS', 'NAHÚM', 'NAHUM', 'HABACUC', 'SOFONÍAS',
        'SOFONIAS', 'HAGEO', 'ZACARÍAS', 'ZACARIAS', 'MALAQUÍAS', 'MALAQUIAS',
        'MATEO', 'MARCOS', 'LUCAS', 'JUAN', 'HECHOS', 'ROMANOS',
        'CORINTIOS', 'GÁLATAS', 'GALATAS', 'EFESIOS', 'FILIPENSES',
        'COLOSENSES', 'TESALONICENSES', 'TIMOTEO', 'TITO', 'FILEMÓN',
        'FILEMON', 'HEBREOS', 'SANTIAGO', 'PEDRO', 'JUDAS', 'APOCALIPSIS',
    }
    s_clean = re.sub(r'\s+', '', s).upper()
    if s_clean in book_names:
        return True
    # Check if ALL chars are uppercase letters
    if re.match(r'^[A-ZÁÉÍÓÚÑ\s]+$', s) and len(s) >= 3 and len(s) <= 30:
        if s_clean in book_names:
            return True
    return False


def is_footnote(line):
    s = line.strip()
    if re.match(r'^[a-z](Heb|Gr|Lit|O |Es decir|Esto es)[\.\s:]', s):
        return True
    return False


def parse_verse_num(line):
    """Try to parse a verse number from line start. Returns (num, text) or None."""
    s = line.strip()
    if not s:
        return None

    # Standard: "2 Y la tierra..."
    m = re.match(r'^(\d{1,3})\s{1,4}([A-ZÁÉÍÓÚÑa-záéíóúñ¡¿«"(].+)', s)
    if m:
        num = int(m.group(1))
        if 1 <= num <= 176:
            return (num, m.group(2))

    # Split digits: "1 1  Después..." = verse 11
    m = re.match(r'^(\d)\s(\d)\s{1,4}([A-ZÁÉÍÓÚÑa-záéíóúñ¡¿«"(].+)', s)
    if m:
        num = int(m.group(1) + m.group(2))
        if 10 <= num <= 99:
            return (num, m.group(3))

    # Split 3 digits: "1 0 0  ..." = verse 100
    m = re.match(r'^(\d)\s(\d)\s(\d)\s{1,4}([A-ZÁÉÍÓÚÑa-záéíóúñ¡¿«"(].+)', s)
    if m:
        num = int(m.group(1) + m.group(2) + m.group(3))
        if 100 <= num <= 176:
            return (num, m.group(4))

    return None


def parse_chapter_num(line):
    """Try to parse chapter number. Returns number or None."""
    s = line.strip()
    if re.match(r'^\d{1,3}$', s):
        return int(s)
    if s == 'I':
        return 1
    return None


def clean_verse_text(text):
    # Soft hyphens at line breaks
    text = re.sub(r'\xad\s*\n\s*', '', text)
    text = re.sub(r'­\s*\n\s*', '', text)
    # Regular hyphens splitting words
    text = re.sub(r'-\s*\n\s*(?=[a-záéíóú])', '', text)
    # Newlines to spaces
    text = re.sub(r'\n', ' ', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    # Common artifacts
    text = text.replace('Ies ', 'les ')
    return text


def main():
    print("=" * 60)
    print("Bible PDF Text Extractor (RV 1960)")
    print("=" * 60)

    reader = PdfReader(str(PDF_PATH))
    total_pages = len(reader.pages)
    print(f"PDF: {total_pages} pages")

    # State
    current_book = 0
    current_book_name = ""
    current_chapter = 0
    current_verse = 0
    verse_text_parts = []
    verses = []
    awaiting_v1 = False  # after chapter start, next text line is verse 1

    def save_verse():
        nonlocal verse_text_parts
        if current_book > 0 and current_chapter > 0 and current_verse > 0 and verse_text_parts:
            text = clean_verse_text('\n'.join(verse_text_parts))
            if text and len(text) > 1:
                verses.append({
                    "book_name": current_book_name,
                    "book": current_book,
                    "chapter": current_chapter,
                    "verse": current_verse,
                    "text": text
                })
        verse_text_parts = []

    for page_idx in range(START_PAGE - 1, min(END_PAGE, total_pages)):
        page_num = page_idx + 1
        raw = reader.pages[page_idx].extract_text() or ""

        # Book transition by page number
        _, exp_name, exp_num = get_book_for_page(page_num)
        if exp_num != current_book:
            save_verse()
            current_book = exp_num
            current_book_name = exp_name
            current_chapter = 0
            current_verse = 0
            awaiting_v1 = False
            print(f"  Book {current_book}: {current_book_name} (page {page_num})")

        lines = raw.split('\n')

        for i, line in enumerate(lines):
            s = line.strip()
            if not s:
                continue

            # Skip page headers
            if is_page_header(s):
                continue

            # Skip footnotes
            if is_footnote(s):
                continue

            # Skip book headers (detected but not used since we use page-based mapping)
            if is_book_header(s):
                continue

            # Skip section subtitles
            if is_section_subtitle(s):
                continue

            # Skip Thompson references
            if is_thompson_ref(s):
                continue

            # Try chapter number
            ch = parse_chapter_num(s)
            if ch is not None:
                # Validate it's a reasonable chapter transition
                if ch == current_chapter + 1 or (ch == 1 and current_chapter == 0) or ch > current_chapter:
                    save_verse()
                    current_chapter = ch
                    current_verse = 0
                    awaiting_v1 = True
                    continue
                else:
                    # Might be a standalone number that's not a chapter
                    # (page number, Thompson ref number, etc.)
                    # Only skip if we have no active verse
                    if current_verse == 0:
                        continue
                    # Otherwise treat as verse continuation (unlikely but safe)

            # Try verse number
            vm = parse_verse_num(s)
            if vm and current_chapter > 0:
                vn, vt = vm
                if vn == current_verse + 1 or (vn == 1 and current_verse == 0) or vn > current_verse:
                    save_verse()
                    current_verse = vn
                    verse_text_parts = [vt]
                    awaiting_v1 = False
                    continue
                elif vn <= current_verse:
                    # Already processed this verse (from other column) - skip
                    continue

            # Verse 1 after chapter start (no explicit "1" in printed Bibles)
            if awaiting_v1 and current_chapter > 0:
                if len(s) > 3 and re.match(r'^[A-ZÁÉÍÓÚÑa-záéíóúñ¡¿«"(]', s):
                    save_verse()
                    current_verse = 1
                    verse_text_parts = [s]
                    awaiting_v1 = False
                    continue

            # Verse text continuation
            if current_verse > 0 and verse_text_parts is not None:
                verse_text_parts.append(s)

        if page_num % 200 == 0:
            print(f"  Page {page_num}/{END_PAGE}... ({len(verses)} verses so far)")

    save_verse()

    # Results
    print(f"\n{'=' * 60}")
    print(f"Total verses: {len(verses)}")
    print(f"\n  Book                Extracted  Expected   Diff")
    print(f"  {'─'*55}")
    total_exp = sum(EXPECTED_VERSES.values())
    for num in range(1, 67):
        name = next((n for _, n, bn in BOOKS if bn == num), "?")
        cnt = sum(1 for v in verses if v['book'] == num)
        exp = EXPECTED_VERSES.get(num, 0)
        d = cnt - exp
        m = "  OK" if abs(d) < 5 else f" {d:+d}"
        if cnt == 0:
            m = " MISS"
        print(f"  {num:2d}. {name:<20s} {cnt:5d}    {exp:5d}  {m}")
    print(f"  {'─'*55}")
    print(f"  {'TOTAL':<24s} {len(verses):5d}    {total_exp:5d}  {len(verses)-total_exp:+d}")

    # Spot checks
    print(f"\n  Spot checks:")
    for bk, ch, vs in [(1,1,1), (1,1,2), (19,23,1), (43,3,16), (66,22,21)]:
        for v in verses:
            if v['book'] == bk and v['chapter'] == ch and v['verse'] == vs:
                print(f"    {v['book_name']} {ch}:{vs}: {v['text'][:90]}")
                break
        else:
            name = next((n for _, n, bn in BOOKS if bn == bk), "?")
            print(f"    {name} {ch}:{vs}: NOT FOUND")

    if verses:
        v = verses[-1]
        print(f"    Last: {v['book_name']} {v['chapter']}:{v['verse']}: {v['text'][:80]}")

    # Write JSON
    output = {
        "metadata": {
            "name": "Reina Valera 1960",
            "shortname": "RV 1960",
            "module": "rv_1960",
            "year": "1960",
            "description": "Biblia de Referencia Thompson - Versión Reina-Valera Revisión de 1960",
            "lang": "Spanish",
            "lang_short": "es",
            "copyright": 1,
            "copyright_statement": "©Sociedades Bíblicas en América Latina, 1960."
        },
        "verses": verses
    }

    print(f"\n  Writing {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=None, separators=(',', ':'))
    print(f"  Size: {OUTPUT_PATH.stat().st_size / 1024 / 1024:.1f} MB")
    print("Done!")


if __name__ == '__main__':
    main()
