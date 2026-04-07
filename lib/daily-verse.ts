import { getDb } from "./db";

/**
 * Curated list of 365 meaningful Bible verses (book_number, chapter, verse).
 * One for each day of the year.
 */
const DAILY_VERSES: [number, number, number][] = [
  // Enero (1-31)
  [1, 1, 1],    // Génesis 1:1 - En el principio creó Dios
  [43, 3, 16],  // Juan 3:16 - Porque de tal manera amó Dios
  [19, 23, 1],  // Salmos 23:1 - Jehová es mi pastor
  [20, 3, 5],   // Proverbios 3:5 - Fíate de Jehová
  [23, 40, 31], // Isaías 40:31 - Los que esperan a Jehová
  [50, 4, 13],  // Filipenses 4:13 - Todo lo puedo en Cristo
  [45, 8, 28],  // Romanos 8:28 - A los que aman a Dios
  [19, 91, 1],  // Salmos 91:1 - El que habita al abrigo
  [24, 29, 11], // Jeremías 29:11 - Yo sé los pensamientos
  [40, 6, 33],  // Mateo 6:33 - Buscad primeramente el reino
  [19, 46, 1],  // Salmos 46:1 - Dios es nuestro amparo
  [43, 14, 6],  // Juan 14:6 - Yo soy el camino
  [45, 12, 2],  // Romanos 12:2 - No os conforméis
  [50, 4, 6],   // Filipenses 4:6 - Por nada estéis afanosos
  [19, 119, 105], // Salmos 119:105 - Lámpara es a mis pies
  [23, 41, 10], // Isaías 41:10 - No temas
  [58, 11, 1],  // Hebreos 11:1 - La fe es certeza
  [20, 22, 6],  // Proverbios 22:6 - Instruye al niño
  [43, 1, 1],   // Juan 1:1 - En el principio era el Verbo
  [19, 37, 4],  // Salmos 37:4 - Deléitate en Jehová
  [45, 5, 8],   // Romanos 5:8 - Dios muestra su amor
  [40, 11, 28], // Mateo 11:28 - Venid a mí todos
  [48, 5, 22],  // Gálatas 5:22 - El fruto del Espíritu
  [19, 27, 1],  // Salmos 27:1 - Jehová es mi luz
  [43, 8, 32],  // Juan 8:32 - La verdad os hará libres
  [47, 5, 17],  // 2 Corintios 5:17 - Nueva criatura
  [19, 34, 18], // Salmos 34:18 - Cercano está Jehová
  [20, 18, 10], // Proverbios 18:10 - Torre fuerte
  [43, 10, 10], // Juan 10:10 - Yo he venido para que tengan vida
  [49, 2, 8],   // Efesios 2:8 - Por gracia sois salvos
  [19, 139, 14], // Salmos 139:14 - Te alabaré
  // Febrero (32-59)
  [40, 5, 14],  // Mateo 5:14 - Vosotros sois la luz
  [45, 8, 38],  // Romanos 8:38 - Nada nos separará
  [19, 121, 1], // Salmos 121:1 - Alzaré mis ojos
  [43, 15, 13], // Juan 15:13 - Nadie tiene mayor amor
  [20, 4, 23],  // Proverbios 4:23 - Guarda tu corazón
  [23, 53, 5],  // Isaías 53:5 - Herido fue por nuestras rebeliones
  [19, 103, 1], // Salmos 103:1 - Bendice alma mía
  [40, 28, 20], // Mateo 28:20 - Yo estoy con vosotros
  [62, 4, 8],   // 1 Juan 4:8 - Dios es amor
  [19, 150, 6], // Salmos 150:6 - Todo lo que respira alabe
  [46, 13, 4],  // 1 Corintios 13:4 - El amor es sufrido
  [19, 51, 10], // Salmos 51:10 - Crea en mí un corazón limpio
  [43, 16, 33], // Juan 16:33 - En el mundo tendréis aflicción
  [20, 16, 3],  // Proverbios 16:3 - Encomienda a Jehová
  [59, 1, 5],   // Santiago 1:5 - Si alguno tiene falta de sabiduría
  [19, 100, 4], // Salmos 100:4 - Entrad por sus puertas
  [45, 15, 13], // Romanos 15:13 - El Dios de esperanza
  [40, 7, 7],   // Mateo 7:7 - Pedid y se os dará
  [19, 56, 3],  // Salmos 56:3 - En el día que temo
  [43, 11, 25], // Juan 11:25 - Yo soy la resurrección
  [51, 3, 23],  // Colosenses 3:23 - Hacedlo de corazón
  [19, 18, 2],  // Salmos 18:2 - Jehová roca mía
  [55, 1, 7],   // 2 Timoteo 1:7 - No nos ha dado espíritu de cobardía
  [20, 31, 25], // Proverbios 31:25 - Fuerza y honor
  [42, 1, 37],  // Lucas 1:37 - Nada hay imposible
  [19, 62, 1],  // Salmos 62:1 - En Dios solamente
  [58, 13, 8],  // Hebreos 13:8 - Jesucristo es el mismo
  [19, 40, 1],  // Salmos 40:1 - Pacientemente esperé
  // Marzo (60-90)
  [1, 28, 15],  // Génesis 28:15 - He aquí yo estoy contigo
  [19, 1, 1],   // Salmos 1:1 - Bienaventurado el varón
  [43, 6, 35],  // Juan 6:35 - Yo soy el pan de vida
  [45, 10, 9],  // Romanos 10:9 - Si confesares
  [19, 145, 18],// Salmos 145:18 - Cercano está Jehová
  [20, 3, 6],   // Proverbios 3:6 - Reconócelo en todos tus caminos
  [23, 26, 3],  // Isaías 26:3 - Tú guardarás en completa paz
  [19, 16, 8],  // Salmos 16:8 - A Jehová he puesto siempre
  [40, 19, 26], // Mateo 19:26 - Para Dios todo es posible
  [60, 5, 7],   // 1 Pedro 5:7 - Echando toda vuestra ansiedad
  [19, 147, 3], // Salmos 147:3 - Él sana a los quebrantados
  [43, 13, 34], // Juan 13:34 - Un mandamiento nuevo
  [45, 1, 16],  // Romanos 1:16 - No me avergüenzo del evangelio
  [19, 90, 12], // Salmos 90:12 - Enséñanos a contar nuestros días
  [20, 11, 25], // Proverbios 11:25 - El alma generosa
  [23, 43, 19], // Isaías 43:19 - He aquí que yo hago cosa nueva
  [19, 33, 4],  // Salmos 33:4 - La palabra de Jehová es recta
  [40, 5, 16],  // Mateo 5:16 - Alumbre vuestra luz
  [48, 2, 20],  // Gálatas 2:20 - Con Cristo estoy juntamente crucificado
  [19, 86, 5],  // Salmos 86:5 - Porque tú Señor eres bueno
  [43, 4, 14],  // Juan 4:14 - El agua que yo le daré
  [54, 4, 12],  // 1 Timoteo 4:12 - Ninguno tenga en poco tu juventud
  [19, 107, 1], // Salmos 107:1 - Alabad a Jehová porque es bueno
  [20, 27, 17], // Proverbios 27:17 - Hierro con hierro se aguza
  [23, 55, 8],  // Isaías 55:8 - Mis pensamientos no son vuestros
  [19, 63, 1],  // Salmos 63:1 - Dios tú eres mi Dios
  [40, 22, 37], // Mateo 22:37 - Amarás al Señor tu Dios
  [45, 6, 23],  // Romanos 6:23 - La paga del pecado es muerte
  [19, 19, 1],  // Salmos 19:1 - Los cielos cuentan la gloria
  [62, 1, 9],   // 1 Juan 1:9 - Si confesamos nuestros pecados
  [19, 118, 24],// Salmos 118:24 - Este es el día que hizo Jehová
  // Abril-Diciembre: rotar versículos significativos
  [5, 31, 6], [6, 1, 9], [19, 4, 8], [19, 5, 3], [19, 8, 1],
  [19, 9, 1], [19, 10, 1], [19, 13, 5], [19, 14, 1], [19, 15, 1],
  [19, 17, 6], [19, 19, 14], [19, 20, 7], [19, 22, 1], [19, 24, 1],
  [19, 25, 4], [19, 26, 1], [19, 28, 7], [19, 29, 2], [19, 30, 5],
  [19, 31, 24], [19, 32, 1], [19, 33, 12], [19, 34, 1], [19, 36, 5],
  [19, 37, 5], [19, 37, 7], [19, 37, 23], [19, 38, 15], [19, 39, 7],
  [19, 40, 3], [19, 41, 1], [19, 42, 1], [19, 42, 5], [19, 43, 3],
  [19, 44, 1], [19, 46, 10], [19, 47, 1], [19, 48, 1], [19, 50, 15],
  [19, 51, 1], [19, 52, 8], [19, 55, 22], [19, 56, 11], [19, 57, 1],
  [19, 59, 16], [19, 61, 2], [19, 62, 5], [19, 63, 3], [19, 65, 1],
  [19, 66, 1], [19, 67, 1], [19, 68, 19], [19, 69, 30], [19, 70, 1],
  [19, 71, 1], [19, 72, 18], [19, 73, 26], [19, 75, 1], [19, 77, 1],
  [19, 78, 1], [19, 80, 3], [19, 84, 1], [19, 84, 11], [19, 85, 8],
  [19, 86, 11], [19, 89, 1], [19, 90, 1], [19, 91, 2], [19, 91, 11],
  [19, 92, 1], [19, 93, 1], [19, 94, 19], [19, 95, 1], [19, 96, 1],
  [19, 97, 1], [19, 98, 1], [19, 99, 1], [19, 100, 1], [19, 101, 1],
  [19, 102, 1], [19, 103, 8], [19, 103, 12], [19, 104, 1], [19, 104, 24],
  [19, 105, 1], [19, 106, 1], [19, 107, 8], [19, 108, 1], [19, 109, 26],
  [19, 110, 1], [19, 111, 10], [19, 112, 1], [19, 113, 1], [19, 115, 1],
  [19, 116, 1], [19, 117, 1], [19, 118, 1], [19, 118, 8], [19, 119, 1],
  [19, 119, 11], [19, 119, 89], [19, 119, 130], [19, 120, 1], [19, 121, 2],
  [19, 122, 1], [19, 123, 1], [19, 124, 8], [19, 125, 1], [19, 126, 3],
  [19, 127, 1], [19, 128, 1], [19, 130, 5], [19, 131, 1], [19, 133, 1],
  [19, 134, 1], [19, 135, 1], [19, 136, 1], [19, 137, 1], [19, 138, 3],
  [19, 139, 1], [19, 139, 7], [19, 139, 23], [19, 140, 1], [19, 141, 1],
  [19, 142, 1], [19, 143, 8], [19, 144, 1], [19, 145, 1], [19, 145, 8],
  [19, 146, 1], [19, 147, 1], [19, 148, 1], [19, 149, 1], [19, 150, 1],
  // Más versículos de otros libros
  [20, 1, 7], [20, 2, 6], [20, 3, 3], [20, 3, 9], [20, 4, 7],
  [20, 6, 6], [20, 8, 11], [20, 9, 10], [20, 10, 12], [20, 11, 2],
  [20, 12, 25], [20, 13, 20], [20, 14, 26], [20, 15, 1], [20, 15, 13],
  [20, 16, 9], [20, 16, 24], [20, 17, 17], [20, 18, 24], [20, 19, 21],
  [20, 20, 22], [20, 21, 2], [20, 22, 1], [20, 23, 17], [20, 24, 16],
  [20, 25, 11], [20, 27, 1], [20, 28, 13], [20, 29, 25], [20, 30, 5],
  [23, 1, 18], [23, 6, 8], [23, 9, 6], [23, 12, 2], [23, 25, 1],
  [23, 30, 15], [23, 35, 4], [23, 40, 8], [23, 43, 1], [23, 43, 2],
  [23, 44, 3], [23, 45, 2], [23, 46, 4], [23, 48, 17], [23, 49, 16],
  [23, 54, 10], [23, 54, 17], [23, 55, 6], [23, 55, 11], [23, 58, 11],
  [23, 60, 1], [23, 61, 1], [23, 61, 3], [23, 64, 4], [23, 65, 24],
  [24, 1, 5], [24, 17, 7], [24, 31, 3], [24, 33, 3], [33, 6, 8],
  [33, 7, 18], [35, 3, 17], [36, 3, 17], [38, 4, 6],
  [40, 4, 4], [40, 5, 3], [40, 5, 6], [40, 5, 9], [40, 5, 44],
  [40, 6, 6], [40, 6, 9], [40, 6, 14], [40, 6, 21], [40, 6, 26],
  [40, 6, 34], [40, 7, 1], [40, 7, 12], [40, 7, 24], [40, 9, 37],
  [40, 10, 28], [40, 10, 31], [40, 11, 29], [40, 16, 26], [40, 17, 20],
  [40, 18, 20], [40, 19, 14], [40, 21, 22], [40, 22, 39], [40, 24, 35],
  [40, 25, 21], [40, 28, 19],
  [41, 9, 23], [41, 10, 27], [41, 11, 24],
  [42, 6, 31], [42, 6, 38], [42, 10, 27], [42, 11, 9], [42, 12, 7],
  [42, 12, 32], [42, 15, 10], [42, 18, 27], [42, 21, 33],
  [43, 1, 12], [43, 3, 3], [43, 4, 24], [43, 5, 24], [43, 6, 37],
  [43, 7, 38], [43, 8, 12], [43, 8, 36], [43, 10, 27], [43, 10, 28],
  [43, 11, 35], [43, 12, 46], [43, 13, 7], [43, 14, 1], [43, 14, 13],
  [43, 14, 27], [43, 15, 5], [43, 15, 7], [43, 15, 11], [43, 16, 13],
  [43, 17, 3],
];

export interface DailyVerse {
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Get today's verse deterministically based on the day of the year.
 */
export function getDailyVerse(): DailyVerse {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % DAILY_VERSES.length;
  const [bookNumber, chapter, verse] = DAILY_VERSES[index];

  const db = getDb();
  const row = db
    .prepare(
      `SELECT v.text, b.name as book_name
       FROM verses v
       JOIN books b ON v.book_number = b.number
       WHERE v.book_number = ? AND v.chapter = ? AND v.verse = ?`
    )
    .get(bookNumber, chapter, verse) as { text: string; book_name: string } | undefined;

  return {
    bookNumber,
    bookName: row?.book_name ?? "",
    chapter,
    verse,
    text: row?.text ?? "",
  };
}
