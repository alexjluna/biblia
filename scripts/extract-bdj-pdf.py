#!/usr/bin/env python3
"""
Extract Bible text (Biblia de Jerusalén) from PDF.

BdJ PDF format:
- Each page starts with a header: abbreviation line + \\tCHAPTER_NUM
  e.g. "Gn\\n\\t2" means "this page is Genesis chapter 2"
  This is a PAGE HEADER, not a chapter transition.
- Verse numbers appear on their own line: '16'
- Verse text follows on next line (with or without leading tab)
- Continuation lines follow after that
- Footnote markers '*' on their own lines
- Section headings in CAPS or title case
- Psalm chapters marked by "SALMO N" headings
"""

import json
import re
from pathlib import Path
from pypdf import PdfReader

PDF_PATH = Path(__file__).parent.parent / "Biblia-de-Jerusalen.pdf"
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "bdj.json"

BOOKS = [
    (55, "Génesis", 1, "Gn", 50),
    (155, "Éxodo", 2, "Ex", 40),
    (239, "Levítico", 3, "Lv", 27),
    (303, "Números", 4, "Nm", 36),
    (388, "Deuteronomio", 5, "Dt", 34),
    (484, "Josué", 6, "Jos", 24),
    (539, "Jueces", 7, "Jc", 21),
    (592, "Rut", 8, "Rt", 4),
    (600, "1 Samuel", 9, "1 S", 31),
    (663, "2 Samuel", 10, "2 S", 24),
    (721, "1 Reyes", 11, "1 R", 22),
    (783, "2 Reyes", 12, "2 R", 25),
    (856, "1 Crónicas", 13, "1 Cro", 29),
    (914, "2 Crónicas", 14, "2 Cro", 36),
    (984, "Esdras", 15, "Esd", 10),
    (1003, "Nehemías", 16, "Ne", 13),
    (1053, "Tobías", 67, "Tb", 14),
    (1081, "Judit", 68, "Jdt", 16),
    (1114, "Ester", 17, "Est", 10),
    (1145, "1 Macabeos", 69, "1 M", 16),
    (1208, "2 Macabeos", 70, "2 M", 15),
    (1274, "Salmos", 19, "Sal", 150),
    (1488, "Cantar de los Cantares", 22, "Ct", 8),
    (1505, "Lamentaciones", 25, "Lm", 5),
    (1536, "Job", 18, "Jb", 42),
    (1609, "Proverbios", 20, "Pr", 31),
    (1675, "Eclesiastés", 21, "Qo", 12),
    (1699, "Sabiduría", 71, "Sb", 19),
    (1745, "Eclesiástico", 72, "Si", 51),
    (1912, "Isaías", 23, "Is", 66),
    (2078, "Jeremías", 24, "Jr", 52),
    (2243, "Baruc", 73, "Ba", 6),
    (2259, "Ezequiel", 26, "Ez", 48),
    (2368, "Daniel", 27, "Dn", 14),
    (2411, "Oseas", 28, "Os", 14),
    (2437, "Joel", 29, "Jl", 4),
    (2448, "Amós", 30, "Am", 9),
    (2468, "Abdías", 31, "Ab", 1),
    (2472, "Jonás", 32, "Jon", 4),
    (2477, "Miqueas", 33, "Mi", 7),
    (2494, "Nahúm", 34, "Na", 3),
    (2502, "Habacuc", 35, "Ha", 3),
    (2511, "Sofonías", 36, "So", 3),
    (2520, "Ageo", 37, "Ag", 2),
    (2525, "Zacarías", 38, "Za", 14),
    (2544, "Malaquías", 39, "Ml", 3),
    (2579, "Mateo", 40, "Mt", 28),
    (2653, "Marcos", 41, "Mc", 16),
    (2697, "Lucas", 42, "Lc", 24),
    (2791, "Juan", 43, "Jn", 21),
    (2876, "Hechos", 44, "Hch", 28),
    (2972, "Romanos", 45, "Rm", 16),
    (3003, "1 Corintios", 46, "1 Co", 16),
    (3032, "2 Corintios", 47, "2 Co", 13),
    (3051, "Gálatas", 48, "Ga", 6),
    (3062, "Efesios", 49, "Ef", 6),
    (3072, "Filipenses", 50, "Flp", 4),
    (3080, "Colosenses", 51, "Col", 4),
    (3088, "1 Tesalonicenses", 52, "1 Ts", 5),
    (3095, "2 Tesalonicenses", 53, "2 Ts", 3),
    (3099, "1 Timoteo", 54, "1 Tm", 6),
    (3108, "2 Timoteo", 55, "2 Tm", 4),
    (3114, "Tito", 56, "Tt", 3),
    (3118, "Filemón", 57, "Flm", 1),
    (3125, "Hebreos", 58, "Hb", 13),
    (3162, "Santiago", 59, "St", 5),
    (3170, "1 Pedro", 60, "1 P", 5),
    (3179, "2 Pedro", 61, "2 P", 3),
    (3186, "1 Juan", 62, "1 Jn", 5),
    (3199, "2 Juan", 63, "2 Jn", 1),
    (3201, "3 Juan", 64, "3 Jn", 1),
    (3203, "Judas", 65, "Jds", 1),
    (3215, "Apocalipsis", 66, "Ap", 22),
]

END_PAGE = 3250  # Revelation ends at ~3247, appendices follow

# Build abbreviation lookup (both space and tab forms)
ABBREV_SET = set()
for e in BOOKS:
    abbr = e[3]
    ABBREV_SET.add(abbr)
    ABBREV_SET.add(abbr.replace(' ', '\t'))


def get_book_for_page(pdf_page):
    result = BOOKS[0]
    for entry in BOOKS:
        if pdf_page >= entry[0]:
            result = entry
        else:
            break
    return result


def clean_text(text):
    text = text.replace('\t', ' ')
    text = re.sub(r'\s*\*\s*', ' ', text)
    text = re.sub(r'\xad\s*', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    text = re.sub(r'^[.,;:]\s*', '', text)
    return text.strip()


def is_noise(line):
    """Lines that are not verse text: headings, markers, etc."""
    s = line.strip().replace('\t', ' ').strip()
    if not s or s in ('*', '.', ',', ';', ':', '*.', '!', '?'):
        return True
    if re.match(r'^\*+\.?$', s):
        return True
    # ALL CAPS headings (section titles) — but NOT pure numbers
    if (re.match(r'^[A-ZÁÉÍÓÚÑ\s,.:;()\d—–-]+$', s) and len(s) > 2 and len(s) < 100
            and not re.match(r'^\d+$', s)):  # exclude standalone numbers
        # But not if it looks like verse text in caps (very rare)
        if not re.match(r'^[A-Z][a-z]', s):
            return True
    # Roman numeral markers
    if re.match(r'^[IVX]+\.\s', s):
        return True
    # Numbered section markers
    if re.match(r'^\d+\.\s+[A-ZÁÉÍÓÚÑ]', s) and len(s) < 80:
        return True
    # "Pausa." markers in Psalms
    if s in ('Pausa.', 'Pausa'):
        return True
    # Hebrew letter section headers in Psalm 119
    hebrew_letters = {
        'Alef.', 'Bet.', 'Guímel.', 'Dálet.', 'He.', 'Vau.', 'Zain.', 'Jet.',
        'Tet.', 'Yod.', 'Kaf.', 'Lámed.', 'Mem.', 'Nun.', 'Sámek.', 'Ain.',
        'Pe.', 'Sade.', 'Qof.', 'Reš.', 'Šin.', 'Tau.',
        'Alef', 'Bet', 'Guímel', 'Dálet', 'He', 'Vau', 'Zain', 'Jet',
        'Tet', 'Yod', 'Kaf', 'Lámed', 'Mem', 'Nun', 'Sámek', 'Ain',
        'Pe', 'Sade', 'Qof', 'Reš', 'Šin', 'Tau',
    }
    if s in hebrew_letters:
        return True
    return False


def looks_like_text(line):
    """Check if a line looks like verse text content."""
    s = line.strip()
    if not s or len(s) < 2:
        return False
    if s in ('*', '.', ',', ';', ':', '*.'):
        return False
    if re.match(r'^\d{1,3}$', s):
        return False
    # Has actual word characters
    return bool(re.search(r'[a-záéíóúñA-ZÁÉÍÓÚÑ]', s))


def looks_like_verse_content(text):
    """Check if captured text from an inline verse pattern is real verse content (not a heading/date fragment)."""
    s = text.strip()
    # Reject date fragments like "a. C.)", "d. C.)"
    if re.search(r'^[ad]\.\s*C\.', s):
        return False
    # Reject lines that are ONLY closing punctuation
    if re.match(r'^[)}\].,;:]+$', s):
        return False
    return True


def main():
    print("=" * 60)
    print("Bible PDF Text Extractor (Biblia de Jerusalén)")
    print("=" * 60)

    reader = PdfReader(str(PDF_PATH))
    total_pages = len(reader.pages)
    print(f"PDF: {total_pages} pages")

    current_book = 0
    current_book_name = ""
    current_book_max_ch = 0
    current_chapter = 0
    current_verse = 0
    verse_text_parts = []
    verses = []
    pending_chapter = None  # Chapter from page header, applied on verse 1
    book_done = False  # True when we've passed all expected chapters

    def save_verse():
        nonlocal verse_text_parts
        if current_book > 0 and current_chapter > 0 and current_verse > 0 and verse_text_parts:
            text = clean_text(' '.join(verse_text_parts))
            if text and len(text) > 1:
                verses.append({
                    "book_name": current_book_name,
                    "book": current_book,
                    "chapter": current_chapter,
                    "verse": current_verse,
                    "text": text
                })
        verse_text_parts = []

    for page_idx in range(BOOKS[0][0] - 1, min(END_PAGE, total_pages)):
        page_num = page_idx + 1
        raw = reader.pages[page_idx].extract_text() or ""

        # Book transition by page number
        entry = get_book_for_page(page_num)
        exp_num = entry[2]
        exp_name = entry[1]
        exp_chapters = entry[4]

        if exp_num != current_book:
            save_verse()
            current_book = exp_num
            current_book_name = exp_name
            current_book_max_ch = exp_chapters
            current_verse = 0
            pending_chapter = None
            book_done = False  # set True when we've passed expected chapters
            if exp_chapters == 1:
                current_chapter = 1
            else:
                current_chapter = 0
            print(f"  Book {current_book}: {current_book_name} (page {page_num})")

        lines = raw.split('\n')

        # --- Step 1: Detect and skip page header ---
        # Page header format: abbreviation on first line, \tCHAPTER on second
        header_consumed = 0
        if len(lines) >= 2:
            first_raw = lines[0].rstrip()
            if first_raw in ABBREV_SET or first_raw.replace('\t', ' ') in ABBREV_SET:
                second = lines[1]
                ch_match = re.match(r'^\t(\d{1,3})$', second)
                if ch_match:
                    header_ch = int(ch_match.group(1))
                    if header_ch > current_chapter and header_ch <= current_book_max_ch:
                        pending_chapter = header_ch
                    header_consumed = 2
                else:
                    header_consumed = 1

        # Apply pending chapter if we haven't started yet
        if current_chapter == 0 and pending_chapter:
            current_chapter = pending_chapter
            pending_chapter = None

        # If we've already finished all chapters for this book, skip page
        if book_done:
            continue

        # --- Step 2: Process lines ---
        i = header_consumed
        while i < len(lines):
            line = lines[i]
            s = line.strip()

            # Skip empty/noise
            if not s or s in ('*', '.', ',', ';', ':', '*.', '!'):
                i += 1
                continue

            # Psalm chapter detection: "SALMO N" or "SALMO N (M)"
            if current_book == 19:  # Psalms
                salmo_match = re.match(r'^SALMO\s+(\d{1,3})', s.replace('\t', ' '))
                if salmo_match:
                    ch_num = int(salmo_match.group(1))
                    if ch_num >= 1:
                        save_verse()
                        current_chapter = ch_num
                        current_verse = 0
                        pending_chapter = None
                    i += 1
                    continue

            # Skip book title lines (at start of books)
            if is_noise(line):
                i += 1
                continue

            # Check for standalone verse number
            if re.match(r'^\d{1,3}$', s):
                num = int(s)
                if 1 <= num <= 176 and current_chapter > 0:
                    # Look ahead past noise lines (*, ., tabs, empty) to find verse text
                    text_offset = 1
                    while i + text_offset < len(lines):
                        peek = lines[i + text_offset].strip()
                        if peek in ('', '*', '.', ',', ';', ':', '*.', '!', '\t'):
                            text_offset += 1
                            continue
                        # Also skip lines that are JUST a tab (whitespace-only)
                        if not lines[i + text_offset].strip():
                            text_offset += 1
                            continue
                        break

                    has_text = (i + text_offset < len(lines)
                               and looks_like_text(lines[i + text_offset]))

                    if has_text:
                        if num > current_verse:
                            # At start of chapter (verse 0), only accept verse 1 or 2
                            # to avoid picking up prologue/intro numbering
                            if current_verse == 0 and num > 2:
                                i += 1
                                continue
                            # Normal verse progression
                            save_verse()
                            current_verse = num
                            verse_text_parts = [lines[i + text_offset].strip()]
                            i += text_offset + 1
                            continue
                        elif num < current_verse and num <= 5 and current_verse > 5 and pending_chapter and pending_chapter > current_chapter:
                            # Low verse number after high ones + pending chapter = chapter transition
                            # This handles books with non-standard verse numbering (like Ester with Greek additions)
                            save_verse()
                            current_chapter = pending_chapter
                            pending_chapter = None
                            current_verse = num
                            verse_text_parts = [lines[i + text_offset].strip()]
                            i += text_offset + 1
                            continue
                        elif num == 1 and current_verse > 0:
                            # Verse 1 restart = new chapter
                            next_ch = pending_chapter if (pending_chapter and pending_chapter > current_chapter) else current_chapter + 1
                            if next_ch > current_book_max_ch:
                                # Beyond expected chapters — intro/notes territory
                                book_done = True
                                save_verse()
                                i += text_offset + 1
                                continue
                            save_verse()
                            current_chapter = next_ch
                            pending_chapter = None
                            current_verse = 1
                            verse_text_parts = [lines[i + text_offset].strip()]
                            i += text_offset + 1
                            continue
                        else:
                            # Lower/equal verse number, skip (duplicate or error)
                            i += 1
                            continue
                    else:
                        # No text follows even after skipping noise.
                        # This could be a chapter number, but ONLY if it's not
                        # also a plausible verse number. The safest heuristic:
                        # treat as chapter transition only if we haven't seen ANY
                        # verses yet in this chapter (i.e., it's a fresh chapter start)
                        # or if current_verse is very high (> 20) suggesting end of chapter.
                        if (num == current_chapter + 1 and num <= current_book_max_ch
                                and (current_verse == 0 or current_verse > 20)):
                            save_verse()
                            current_chapter = num
                            current_verse = 0
                            pending_chapter = None
                            i += 1
                            continue
                        # Otherwise, if we're in a verse, add as continuation
                        if current_verse > 0:
                            verse_text_parts.append(s)
                        i += 1
                        continue

                i += 1
                continue

            # Check for inline verse: "16\tHizo Dios..." or "16  Hizo Dios..."
            m = re.match(r'^(\d{1,3})\t(.+)', line)
            if not m:
                m = re.match(r'^(\d{1,3})\s{2,}([A-ZÁÉÍÓÚÑa-záéíóúñ¡¿«"\'(—\[].+)', s)
            if m and current_chapter > 0:
                num = int(m.group(1))
                text = m.group(2).strip()
                if 1 <= num <= 176 and looks_like_verse_content(text):
                    if num > current_verse and not (current_verse == 0 and num > 2):
                        save_verse()
                        current_verse = num
                        verse_text_parts = [text]
                        i += 1
                        continue
                    elif num == 1 and current_verse > 0:
                        next_ch = pending_chapter if (pending_chapter and pending_chapter > current_chapter) else current_chapter + 1
                        if next_ch > current_book_max_ch:
                            book_done = True
                            save_verse()
                            i += 1
                            continue
                        save_verse()
                        current_chapter = next_ch
                        pending_chapter = None
                        current_verse = 1
                        verse_text_parts = [text]
                        i += 1
                        continue

            # Continuation text for current verse
            if current_verse > 0 and looks_like_text(line):
                verse_text_parts.append(s)

            i += 1

        if page_num % 500 == 0:
            print(f"  Page {page_num}/{END_PAGE}... ({len(verses)} verses)")

    save_verse()

    # Results
    print(f"\n{'=' * 60}")
    print(f"Total verses: {len(verses)}")

    EXPECTED = {
        1: 1533, 2: 1213, 3: 859, 4: 1288, 5: 959, 6: 658, 7: 618, 8: 85,
        9: 810, 10: 695, 11: 816, 12: 719, 13: 942, 14: 822, 15: 280, 16: 406,
        17: 167, 18: 1070, 19: 2461, 20: 915, 21: 222, 22: 117, 23: 1292,
        24: 1364, 25: 154, 26: 1273, 27: 357, 28: 197, 29: 73, 30: 146,
        31: 21, 32: 48, 33: 105, 34: 47, 35: 56, 36: 53, 37: 38, 38: 211,
        39: 55, 40: 1071, 41: 678, 42: 1151, 43: 879, 44: 1007, 45: 433,
        46: 437, 47: 257, 48: 149, 49: 155, 50: 104, 51: 95, 52: 89, 53: 47,
        54: 113, 55: 83, 56: 46, 57: 25, 58: 303, 59: 108, 60: 105, 61: 61,
        62: 105, 63: 13, 64: 14, 65: 25, 66: 404,
        67: 244, 68: 340, 69: 924, 70: 555, 71: 435, 72: 1424, 73: 213,
    }

    print(f"\n  {'Book':>4s}  {'Name':<25s}  {'Got':>5s}  {'Exp':>5s}  {'%':>4s}")
    print(f"  {'─'*50}")
    total_got = 0
    total_exp = 0
    for entry in BOOKS:
        bk = entry[2]
        name = entry[1]
        got = sum(1 for v in verses if v['book'] == bk)
        exp = EXPECTED.get(bk, 0)
        pct = f"{got/exp*100:.0f}" if exp > 0 else "?"
        flag = ""
        if got == 0:
            flag = " MISS"
        elif exp > 0 and abs(got - exp) > max(5, exp * 0.05):
            flag = f" ({got-exp:+d})"
        print(f"  {bk:>4d}  {name:<25s}  {got:>5d}  {exp:>5d}  {pct:>3s}%{flag}")
        total_got += got
        total_exp += exp
    print(f"  {'─'*50}")
    print(f"  {'':>4s}  {'TOTAL':<25s}  {total_got:>5d}  {total_exp:>5d}  {total_got/total_exp*100:.0f}%")

    # Spot checks
    print(f"\n  Spot checks:")
    for bk, ch, vs in [(1,1,1), (1,1,31), (1,2,1), (19,23,1), (43,3,16), (66,22,21), (67,1,1), (71,1,1)]:
        for v in verses:
            if v['book'] == bk and v['chapter'] == ch and v['verse'] == vs:
                print(f"    {v['book_name']} {ch}:{vs}: {v['text'][:90]}")
                break
        else:
            name = next((n for _, n, bn, _, _ in BOOKS if bn == bk), "?")
            print(f"    {name} {ch}:{vs}: NOT FOUND")

    # Write JSON
    output = {
        "metadata": {
            "name": "Biblia de Jerusalén",
            "shortname": "BdJ",
            "module": "bdj",
            "year": "2009",
            "description": "Biblia de Jerusalén, 4ª edición revisada 2009",
            "lang": "Spanish",
            "lang_short": "es",
            "copyright": 1,
            "copyright_statement": "© Equipo de traductores de la edición española de la Biblia de Jerusalén, 2009"
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
