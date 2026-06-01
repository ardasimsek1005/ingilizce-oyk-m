import { Book, QuizQuestion, LeaderboardUser, Badge, VocabularyWord } from './types';
import { STORIES_PART1, RawStory } from './stories_part1';
import { STORIES_PART2 } from './stories_part2';
import { AVATAR_OPTIONS } from './avatar_assets';

// Combined 50 famous stories catalog
export const ALL_RAW_STORIES: RawStory[] = [...STORIES_PART1, ...STORIES_PART2];

// Level descriptions
const LEVEL_NAMES: { [key: string]: string } = {
  A1: 'A1 Başlangıç / Beginner',
  A2: 'A2 Temel / Elementary',
  B1: 'B1 Orta / Intermediate',
  B2: 'B2 İleri Orta / Upper Intermediate',
  C1: 'C1 İleri / Advanced'
};

// Global dictionary with high-frequency fairy tale/famous story words for automated lookup fallbacks!
export const GLOBAL_DICTIONARY: { [key: string]: string } = {
  "once": "bir zamanlar",
  "upon": "üzerine",
  "time": "zaman/vakit",
  "little": "küçük/ufak",
  "girl": "kız",
  "lived": "yaşadı",
  "near": "yakınında",
  "forest": "orman",
  "she": "o (kadın)",
  "he": "o (erkek)",
  "they": "onlar",
  "we": "biz",
  "you": "sen/siz",
  "wore": "giydi",
  "beautiful": "güzel",
  "knew": "biliyordu",
  "mother": "anne",
  "said": "dedi",
  "please": "lütfen",
  "take": "almak/götürmek",
  "basket": "sepet",
  "sweet": "tatlı",
  "apples": "elmalar",
  "grandmother": "büyükanne",
  "but": "ama/fakat",
  "talk": "konuşmak",
  "to": "e/a yönelme",
  "any": "hiçbir/herhangi bir",
  "on": "üzerinde",
  "kind": "nazik/tür",
  "bad": "kötü",
  "two": "iki",
  "made": "yaptı/zorladı",
  "her": "onu/ona",
  "do": "yapmak",
  "all": "hepsi/tüm",
  "hard": "zor/sıkı",
  "house": "ev",
  "there": "orada/var",
  "was": "idi/vardı",
  "princess": "prenses",
  "with": "ile",
  "dark": "karanlık/koyu",
  "hair": "saç",
  "white": "beyaz",
  "skin": "ten/cilt",
  "very": "çok",
  "asked": "istedi/sordu",
  "go": "gitmek",
  "found": "buldu",
  "small": "küçük",
  "seven": "yedi",
  "family": "aile",
  "poor": "fakir",
  "had": "sahipti/vardı",
  "no": "yok/hayır",
  "food": "yiyecek/yemek",
  "night": "gece",
  "walked": "yürüdü",
  "soon": "kısa süre sonra",
  "saw": "gördü",
  "young": "genç",
  "boy": "erkek çocuk",
  "only": "sadece",
  "one": "bir",
  "sold": "sattı",
  "magic": "sihirli",
  "during": "esnasında",
  "grew": "büyüdü",
  "plant": "bitki/fidan",
  "clouds": "bulutlar",
  "three": "üç",
  "wanted": "istedi",
  "build": "inşa etmek",
  "first": "birinci",
  "built": "inşa etti",
  "because": "çünkü",
  "quick": "hızlı/seri",
  "second": "İkinci",
  "third": "üçüncü",
  "strong": "güçlü",
  "stay": "kalmak",
  "sat": "oturdu",
  "eggs": "yumurtalar",
  "big": "büyük",
  "baby": "bebek",
  "bird": "kuş",
  "large": "iri/geniş",
  "other": "diğer",
  "animals": "hayvanlar",
  "day": "gün",
  "long": "uzun",
  "empty": "boş",
  "inside": "içeride",
  "bowls": "kaseler",
  "warm": "ılık/sıcak",
  "table": "masa",
  "came": "geldi",
  "incredibly": "inanılmaz derecede",
  "old": "yaşlı",
  "high": "yüksek",
  "doors": "kapılar",
  "room": "oda",
  "let": "izin vermek/salmak",
  "wooden": "ahşap/tahtadan",
  "real": "gerçek",
  "if": "eğer",
  "loved": "sevdi/seviyordu",
  "reading": "okuma/okumak",
  "books": "kitaplar",
  "save": "kurtarmak/kaydetmek",
  "slowly": "yavaşça",
  "discovered": "keşfetti",
  "heart": "kalp",
  "fell": "düştü/kapıldı",
  "love": "aşk/sevgi",
  "born": "doğdu",
  "finger": "parmak",
  "die": "ölmek",
  "another": "diğer/başka bir",
  "changed": "değiştirdi",
  "hundred": "yüz",
  "years": "yıllar",
  "mermaid": "denizkızı",
  "blue": "mavi",
  "dreamed": "hayal etti",
  "wonderful": "harika/muhteşem",
  "world": "dünya",
  "above": "üzerinde",
  "water": "su",
  "handsome": "yakışıklı",
  "sinking": "batan",
  "wished": "diledi/istedi",
  "man": "adam",
  "busy": "meşgul/kalabalık",
  "genie": "cin",
  "appeared": "belirdi",
  "wishes": "dilekler",
  "running": "koşu/koşan",
  "tree": "ağaç",
  "never": "asla",
  "marry": "evlenmek",
  "wet": "ıslak",
  "woman": "kadın",
  "knocked": "çaldı",
  "gates": "kapılar/şehir kapıları",
  "tested": "test etti/denedi",
  "thick": "kalın",
  "flower": "çiçek",
  "adventures": "maceralar",
  "neverland": "olmayan ülke",
  "lost": "kayıp",
  "exciting": "heyecan verici",
  "against": "karşı",
  "merry": "neşeli/şifalı",
  "fought": "savaştı",
  "rich": "zengin",
  "grass": "çimen",
  "rabbit": "tavşan",
  "smart": "şık/zeki",
  "deep": "derin",
  "hole": "delik",
  "filled": "dolu",
  "bored": "sıkılmış",
  "flock": "sürü",
  "sheep": "koyunlar",
  "mountain": "dağ",
  "times": "kez/seferler",
  "laughing": "gülüyor/gülmek",
  "hungry": "aç",
  "purple": "mor",
  "hanging": "sarkan/asılan",
  "strength": "güç/kuvvet",
  "jumped": "zıpladı",
  "continually": "sürekli",
  "reach": "ulaşmak",
  "hardworking": "çalışkan",
  "gold": "altın",
  "cave": "mağara",
  "words": "kelimeler/sözler",
  "seas": "denizler",
  "island": "ada",
  "suddenly": "aniden",
  "back": "sırt/arka",
  "shiny": "parlak",
  "rose": "gül",
  "garden": "bahçe",
  "textbooks": "ders kitapları",
  "corridor": "koridor"
};

// Generates correct types and alignments dynamically from raw definitions
export const INITIAL_BOOKS: Book[] = ALL_RAW_STORIES.map((story) => {
  const chapters = [
    {
      id: `${story.id}_chap1`,
      title: '',
      paragraphs: story.en.map((enText, pIdx) => {
        const trText = story.tr[pIdx] || enText;
        
        // Populate interactive lookup words
        const paragraphWords: { en: string; tr: string }[] = [];
        
        // Clean words and match with dicts
        const wordsInText = enText.split(/\s+/);
        wordsInText.forEach(rawW => {
          const cleanW = rawW.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim().toLowerCase();
          if (!cleanW) return;
          
          const tr = story.words[cleanW] || GLOBAL_DICTIONARY[cleanW];
          if (tr) {
            if (!paragraphWords.some(w => w.en.toLowerCase() === cleanW)) {
              paragraphWords.push({ en: cleanW, tr });
            }
          }
        });

        return {
          id: `${story.id}_p${pIdx + 1}`,
          textEn: enText,
          textTr: trText,
          words: paragraphWords
        };
      })
    }
  ];

  const totalWords = story.en.reduce((sum, p) => sum + p.split(/\s+/).length, 0);

  // Precompute actual page counts based on ~120 words per page (matching ReadingView logic)
  let calculatedTotalPages = 0;
  let currentGroupLength = 0;
  let currentWordCount = 0;
  story.en.forEach((pText) => {
    const wordsCount = pText.split(/\s+/).filter(Boolean).length;
    if (currentGroupLength > 0 && currentWordCount >= 120) {
      calculatedTotalPages++;
      currentGroupLength = 1;
      currentWordCount = wordsCount;
    } else {
      currentGroupLength++;
      currentWordCount += wordsCount;
    }
  });
  if (currentGroupLength > 0) {
    calculatedTotalPages++;
  }

  return {
    id: story.id,
    title: story.title,
    author: story.author,
    level: story.level,
    levelName: LEVEL_NAMES[story.level] || `${story.level} Seviyesi`,
    coverUrl: story.coverUrl,
    percentageCompleted: 0,
    pagesLeft: calculatedTotalPages,
    totalPages: calculatedTotalPages,
    currentPage: 0,
    statsWords: totalWords,
    statsTime: `${Math.max(1, Math.ceil(totalWords / 45))}dk`,
    chapters
  };
});

export const INITIAL_VOCABULARY: VocabularyWord[] = [];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    word: 'Perseverance',
    level: 'B2 Seviyesi',
    options: ['Kararsızlık', 'Azim / Sebat', 'Tembellik', 'Zayıflık'],
    correctIndex: 1,
    hint: 'Sözcük, zor durumlarda vazgeçmeme, sabırla devam etmeyi simgeler.',
    explanation: '"Perseverance" kelimesi zorluklara karşı durup azim ve sebat göstermek anlamına gelir.'
  },
  {
    id: 'q2',
    word: 'Eloquent',
    level: 'C1 Seviyesi',
    options: ['Güzel ve etkili konuşan', 'Kaba / Patavatsız', 'Sessiz / Çekingen', 'Kekeme'],
    correctIndex: 0,
    hint: 'Bir hatibin etkileyici, akıcı ve ikna edici konuşması durumudur.',
    explanation: '"Eloquent" fasih, belagatli ve güzel/etkili konuşan demektir.'
  },
  {
    id: 'q3',
    word: 'Vulnerable',
    level: 'B2 Seviyesi',
    options: ['Kırılmaz / Güçlü', 'Hassas / Kırılgan', 'Umutsuz', 'Diktatör'],
    correctIndex: 1,
    hint: 'Dış etkenlere karşı kendini koruyamayan, kolayca zarar görebilen yapılar içindir.',
    explanation: '"Vulnerable" fiziksel veya psikolojik olarak incinmeye açık olan "hassas / kırılgan" demektir.'
  },
  {
    id: 'q4',
    word: 'Gorgeous',
    level: 'B1 Seviyesi',
    options: ['Sıradan', 'Çirkin', 'Harika / Muazzam', 'Tehlikeli'],
    correctIndex: 2,
    hint: 'Çok güzel, göz alıcı şeyler tasvir edilirken tercih edilir.',
    explanation: '"Gorgeous" kelimesi göz kamaştırıcı güzellikteki harika, muazzam nesneler veya kişiler içindir.'
  },
  {
    id: 'q5',
    word: 'Exempt',
    level: 'C1 Seviyesi',
    options: ['Muaf tutulmuş', 'Kabul edilmiş', 'Zorunlu kılınmış', 'Cezalandırılmış'],
    correctIndex: 0,
    hint: 'Kişinin birtakım vergilerden veya kurallardan hariç tutulması durumudur.',
    explanation: '"Exempt" bir kural veya yükümlülükten ötürü hariç ya da muaf tutulmak demektir.'
  }
];

export const LEADERBOARD_DATA: LeaderboardUser[] = [
  { id: '1', name: 'Barış Demir', xp: 2840, rank: 1, avatarUrl: AVATAR_OPTIONS[7] }, // Mavi Kapüşonlu Çocuk
  { id: '2', name: 'Zeynep Kaya', xp: 2410, rank: 2, avatarUrl: AVATAR_OPTIONS[4] }, // Ağaç Altında Okuyan Kız
  { id: '4', name: 'Can Yılmaz', xp: 1850, rank: 3, avatarUrl: AVATAR_OPTIONS[11] }, // Ceketli Sincap
  { id: '5', name: 'Merve Çelik', xp: 1540, rank: 4, avatarUrl: AVATAR_OPTIONS[13] }, // Kahveli Genç Okuyucu
  { id: '3', name: 'Selim Kaya', xp: 0, rank: 5, isCurrentUser: true, avatarUrl: AVATAR_OPTIONS[0] } // Gözlüklü Kitap Kurdu Çocuk
];

export const INITIAL_BADGES: Badge[] = [
  { id: 'b1', title: 'Kitap Kurdu', description: 'En az 5 farklı İngilizce hikaye oku.', iconName: 'BookOpen', unlocked: false },
  { id: 'b2', title: 'Azimli Sebat', description: 'Günlük hedefini üst üste 15 gün tamamla.', iconName: 'Flame', unlocked: false },
  { id: 'b3', title: 'Kelime Avcısı', description: 'Kelime haznesine 100 yeni kelime kaydet.', iconName: 'Award', unlocked: false },
  { id: 'b4', title: 'Kusursuz Akıl', description: 'Bir kelime quizini can kaybetmeden bitir.', iconName: 'Sparkles', unlocked: false },
  { id: 'b5', title: 'Premium Üye', description: 'Sınırsız can ve premium ayrıcalıkları aktif et.', iconName: 'Crown', unlocked: false }
];

export const ANALYTICS_DATA = [
  { day: 'Pzt', learnedWords: 0, readMins: 0 },
  { day: 'Sal', learnedWords: 0, readMins: 0 },
  { day: 'Çar', learnedWords: 0, readMins: 0 },
  { day: 'Per', learnedWords: 0, readMins: 0 },
  { day: 'Cum', learnedWords: 0, readMins: 0 },
  { day: 'Cmt', learnedWords: 0, readMins: 0 },
  { day: 'Paz', learnedWords: 0, readMins: 0 }
];

const getLibraryUniqueWordsCount = (): number => {
  const uniqueWordsSet = new Set<string>();
  INITIAL_BOOKS.forEach(book => {
    if (book.chapters) {
      book.chapters.forEach(chap => {
        if (chap.paragraphs) {
          chap.paragraphs.forEach(p => {
            if (p.words) {
              p.words.forEach(w => {
                const clean = w.en.trim().toLowerCase();
                if (clean) {
                  uniqueWordsSet.add(clean);
                }
              });
            }
          });
        }
      });
    }
  });
  return uniqueWordsSet.size;
};

export const LIBRARY_UNIQUE_WORDS_COUNT = getLibraryUniqueWordsCount();

