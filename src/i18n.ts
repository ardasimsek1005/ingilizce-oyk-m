export type LanguageCode = 'tr' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ar' | 'zh' | 'hi' | 'ja';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export const DEFAULT_DISTRACTORS: Record<LanguageCode, string[]> = {
  tr: ['koşmak', 'ev', 'yemek', 'gülümsemek', 'ağaç', 'sepet', 'köpek', 'mutlu', 'zaman', 'gün', 'kitap'],
  en: ['run', 'house', 'eat', 'smile', 'tree', 'basket', 'dog', 'happy', 'time', 'day', 'book'],
  es: ['correr', 'casa', 'comer', 'sonreír', 'árbol', 'cesta', 'perro', 'feliz', 'tiempo', 'día', 'libro'],
  fr: ['courir', 'maison', 'manger', 'sourire', 'arbre', 'panier', 'chien', 'heureux', 'temps', 'jour', 'livre'],
  de: ['laufen', 'haus', 'essen', 'lächeln', 'baum', 'korb', 'hund', 'glücklich', 'zeit', 'tag', 'buch'],
  it: ['correre', 'casa', 'mangiare', 'sorridere', 'albero', 'cestino', 'cane', 'felice', 'tempo', 'giorno', 'libro'],
  pt: ['correr', 'casa', 'comer', 'sorrir', 'árvore', 'cesta', 'cachorro', 'feliz', 'tempo', 'dia', 'livro'],
  ru: ['бежать', 'дом', 'есть', 'улыбка', 'дерево', 'корзина', 'собака', 'счастливый', 'время', 'день', 'книга'],
  ar: ['يجري', 'بيت', 'يأكل', 'ابتسامة', 'شجرة', 'سلة', 'كلب', 'سعيد', 'وقت', 'يوم', 'كتاب'],
  zh: ['跑', '房子', '吃', '微笑', '树', '篮子', '狗', '快乐', '时间', '天', '书'],
  hi: ['दौड़ना', 'घर', 'खाना', 'मुस्कान', 'पेड़', 'टोकरी', 'कुत्ता', 'खुश', 'समय', 'दिन', 'किताब'],
  ja: ['走る', '家', '食べる', '笑顔', '木', 'カゴ', '犬', '幸せ', '時間', '日', '本'],
};

export const TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // Library Categories
  cat_all: {
    tr: 'Tüm Hikayeler', en: 'All Stories', es: 'Todas las historias', fr: 'Toutes les histoires', de: 'Alle Geschichten',
    it: 'Tutte le storie', pt: 'Todas as histórias', ru: 'Все истории', ar: 'كل القصص', zh: '所有故事', hi: 'सभी कहानियाँ', ja: 'すべての物語'
  },
  cat_classics: {
    tr: 'Dünya Klasikleri', en: 'World Classics', es: 'Clásicos mundiales', fr: 'Classiques mondiaux', de: 'Weltklassiker',
    it: 'Classici mondiali', pt: 'Clássicos mundiais', ru: 'Мировая классика', ar: 'روائع كلاسيكية', zh: '世界名著', hi: 'विश्व क्लासिक्स', ja: '世界の名作'
  },
  cat_kids: {
    tr: 'Masallar & Çocuk', en: 'Fables & Kids', es: 'Fábulas y niños', fr: 'Fables et enfants', de: 'Fabeln & Kinder',
    it: 'Favole e bambini', pt: 'Fábulas e crianças', ru: 'Сказки и дети', ar: 'الخرافات والأطفال', zh: '寓言与儿童', hi: 'किस्سه और बच्चे', ja: '寓話と子供向け'
  },
  cat_horror: {
    tr: 'Korku & Gizem', en: 'Horror & Mystery', es: 'Terror y misterio', fr: 'Horreur et mystère', de: 'Horror & Geheimnis',
    it: 'Horror e mistero', pt: 'Terror e mistério', ru: 'Ужасы и мистика', ar: 'الرعب والغموض', zh: '恐怖与悬疑', hi: 'डरावना और रहस्य', ja: 'ホラー＆ミステリー'
  },
  cat_daily: {
    tr: 'Günlük Yaşam & Diyaloglar', en: 'Daily Life & Dialogues', es: 'Vida diaria y diálogos', fr: 'Vie quotidienne et dialogues', de: 'Tägliches Leben & Dialoge',
    it: 'Vita quotidiana e dialoghi', pt: 'Vida diária e diálogos', ru: 'Повседневная жизнь и диалоги', ar: 'الحياة اليومية والحوارات', zh: '日常生活与对话', hi: 'दैनिक जीवन और संवाद', ja: '日常生活＆会話'
  },
  cat_scifi: {
    tr: 'Bilim Kurgu', en: 'Sci-Fi', es: 'Ciencia ficción', fr: 'Science-fiction', de: 'Sci-Fi',
    it: 'Fantascienza', pt: 'Ficção científica', ru: 'Научная фантастика', ar: 'الخيال العلمي', zh: '科幻小说', hi: 'विज्ञान कल्प', ja: 'SF'
  },
  cat_detective: {
    tr: 'Polisiye & Gizem', en: 'Detective & Mystery', es: 'Detective y misterio', fr: 'Détective et mystère', de: 'Detektiv & Geheimnis',
    it: 'Investigativo e mistero', pt: 'Detetive e mistério', ru: 'Детектив и мистика', ar: 'البوليسية والغموض', zh: '侦探与悬疑', hi: 'जासूसी और रहस्य', ja: '推理＆ミステリー'
  },
  cat_history: {
    tr: 'Tarih & Efsaneler', en: 'History & Legends', es: 'Historia y leyendas', fr: 'Histoire et légendes', de: 'Geschichte & Legenden',
    it: 'Storia e leggende', pt: 'História e lendas', ru: 'История и легенды', ar: 'التاريخ والأساطير', zh: '历史与传说', hi: 'इतिहास और किंवदंतियाँ', ja: '歴史と伝説'
  },
  cat_mythology: {
    tr: 'Mitoloji & Efsaneler', en: 'Mythology & Legends', es: 'Mitología y leyendas', fr: 'Mythologie et légendes', de: 'Mythologie & Legenden',
    it: 'Mitologia e leggende', pt: 'Mitologia e lendas', ru: 'Мифология и легенды', ar: 'الميثولوجيا والأساطير', zh: '神话与传说', hi: 'पौराणिक कथाएँ', ja: '神話と伝説'
  },
  cat_travel: {
    tr: 'Gezi & Dünya', en: 'Travel & World', es: 'Viajes y mundo', fr: 'Voyages et monde', de: 'Reisen & Welt',
    it: 'Viaggi e mondo', pt: 'Viagens e mundo', ru: 'Путешествия и мир', ar: 'السفر والعالم', zh: '旅游与世界', hi: 'यात्रा और दुनिया', ja: '旅行＆世界'
  },
  cat_nature: {
    tr: 'Doğa ve Evren', en: 'Nature & Space', es: 'Naturaleza y espacio', fr: 'Nature et espace', de: 'Natur & Weltraum',
    it: 'Natura e spazio', pt: 'Natureza e espaço', ru: 'Природа и космос', ar: 'الطبيعة والكون', zh: '自然与宇宙', hi: 'प्रकृति और अंतरिक्ष', ja: '自然と宇宙'
  },
  cat_all_desc: {
    tr: 'Kütüphanedeki tüm eserleri tek bir çatı altında keşfedin.',
    en: 'Discover all the works in the library under one roof.',
    es: 'Descubre todas las obras de la biblioteca bajo un mismo techo.',
    fr: 'Découvrez toutes les œuvres de la bibliothèque sous un même toit.',
    de: 'Entdecken Sie alle Werke in der Bibliothek unter einem Dach.',
    it: 'Scopri tutte le opere della biblioteca sotto lo stesso tetto.',
    pt: 'Descubra todas as obras da biblioteca sob o mesmo teto.',
    ru: 'Откройте для себя все произведения в библиотеке под одной крышей.',
    ar: 'اكتشف جميع الأعمال في المكتبة تحت سقف واحد.',
    zh: '在同一个屋檐下探索图书馆的所有作品。',
    hi: 'एक ही छत के नीचे पुस्तकालय की सभी कृतियों की खोज करें।',
    ja: '図書館のすべての作品を一つの場所に集めました。'
  },
  cat_classics_desc: {
    tr: 'Klasik edebiyatın ölümsüz karakterleriyle dolu macera ve dram dünyası.',
    en: 'A world of adventure and drama filled with the immortal characters of classic literature.',
    es: 'Un mundo de aventuras y dramas lleno de los personajes inmortales de la literatura clásica.',
    fr: 'Un monde d\'aventures et de drames rempli des personnages immortels de la littérature classique.',
    de: 'Eine Welt voller Abenteuer und Dramen, bevölkert von den unsterblichen Charakteren der klassischen Literatur.',
    it: 'Un mondo di avventure e drammi pieno dei personaggi immortali della letteratura classica.',
    pt: 'Um mundo de aventura e drama repleto de personagens imortais da literatura clássica.',
    ru: 'Мир приключений и драм, наполненный бессмертными персонажами классической литературы.',
    ar: 'عالم من المغامرة والدراما مليء بالشخصيات الخالدة للأدب الكلاسيكي.',
    zh: '充满经典文学不朽人物的的冒险与戏剧世界。',
    hi: 'शास्त्रीय साहित्य के अमर पात्रों से भरी साहसिक और नाटकीय दुनिया।',
    ja: '古典文学の不朽のキャラクターたちでいっぱいの冒険とドラマの世界。'
  },
  cat_kids_desc: {
    tr: 'Çocuk masalları ve her yaştan dil öğrenenler için eğitici, sihirli fabllar.',
    en: 'Fairy tales and educational, magical fables for language learners of all ages.',
    es: 'Cuentos de hadas y fábulas mágicas y educativas para estudiantes de idiomas de todas las edades.',
    fr: 'Contes de fées et fables éducatives et magiques pour les apprenants de langues de tous âges.',
    de: 'Märchen und lehrreiche, magische Fabeln für Sprachschüler jeden Alters.',
    it: 'Fiabe e favole educative e magiche per studenti di lingue di tutte le età.',
    pt: 'Contos de fadas e fábulas educativas e mágicas para estudantes de idiomas de todas as idades.',
    ru: 'Сказки и поучительные волшебные басни для изучающих языки всех возрастов.',
    ar: 'قصص خيالية وخرافات سحرية تعليمية لمتعلمي اللغة من جميع الأعمار.',
    zh: '适合所有年龄段语言学习者的童话与寓言。',
    hi: 'सभी उम्र के भाषा सीखने वालों के लिए परियों की कहानियां और शैक्षिक, जादुई कहानियां।',
    ja: 'すべての年齢層の語学学習者向けの、おとぎ話と教育的で魔法のような寓話。'
  },
  cat_horror_desc: {
    tr: 'Karanlık ormanlar, gizemli şatolar ve merak uyandıran heyecan dolu öyküler.',
    en: 'Dark forests, mysterious castles, and exciting stories that pique curiosity.',
    es: 'Bosques oscuros, castillos misteriosos e historias emocionantes que despiertan la curiosidad.',
    fr: 'Forêts sombres, châteaux mystérieux et histoires passionnantes qui piquent la curiosité.',
    de: 'Dunkle Wälder, geheimnisvolle Schlösser und spannende Geschichten, die die Neugier wecken.',
    it: 'Foreste oscure, castelli misteriosi e storie emozionanti che stimolano la curiosità.',
    pt: 'Florestas escuras, castelos misteriosos e histórias emocionantes que despertam a curiosidade.',
    ru: 'Темные леса, таинственные замки и захватывающие истории, вызывающие любопытство.',
    ar: 'غابات مظلمة، وقلاع غامضة، وقصص مثيرة تثير الفضول.',
    zh: '黑暗的森林、神秘的城堡和激起好奇心的刺激故事。',
    hi: 'घने जंगल, रहस्यमय महल और जिज्ञासा पैदा करने वाली रोमांचक कहानियां।',
    ja: '暗い森、神秘的な城、そして好奇心をそそるエキサイティングな物語。'
  },
  cat_daily_desc: {
    tr: 'Gerçek yaşam senaryolarına dayalı pratik İngilizce diyaloglar ve kısa günlük anlatılar.',
    en: 'Practical English dialogues and short daily narratives based on real-life scenarios.',
    es: 'Diálogos prácticos en inglés y narraciones breves diarias basadas en escenarios de la vida real.',
    fr: 'Dialogues d\'anglais pratiques et courts récits quotidiens basés sur des scénarios de la vie réelle.',
    de: 'Praktische englische Dialoge und kurze tägliche Erzählungen basierend auf realen Szenarien.',
    it: 'Dialoghi pratici in inglese e brevi narrazioni quotidiane basate su scenari di vita reale.',
    pt: 'Diálogos práticos em inglês e narrativas diárias curtas baseadas em cenários da vida real.',
    ru: 'Практические диалоги на английском языке и короткие повседневные рассказы, основанные на реальных жизненных сценариях.',
    ar: 'حوارات إنجليزية عملية وروايات يومية قصيرة تعتمد على سيناريوهات الحياة الواقعية.',
    zh: '基于现实生活场景的实用英语对话和简短的日常叙事。',
    hi: 'वास्तविक जीवन के परिदृश्यों पर आधारित व्यावहारिक अंग्रेजी संवाद और लघु दैनिक आख्यान।',
    ja: '実生活のシナリオに基づいた実践的な英語の対話と短い日常の物語。'
  },
  cat_scifi_desc: {
    tr: 'Geleceğin teknolojileri, uzay seyahatleri, robotlar ve alternatif evrenler üzerine sürükleyici öyküler.',
    en: 'Immersive stories about future technologies, space travel, robots, and alternative universes.',
    es: 'Historias inmersivas sobre tecnologías del futuro, viajes espaciales, robots y universos alternativos.',
    fr: 'Histoires immersives sur les technologies du futur, les voyages dans l\'espace, les robots et les univers alternatifs.',
    de: 'Fesselnde Geschichten über Zukunftstechnologien, Weltraumreisen, Roboter und alternative Universen.',
    it: 'Storie coinvolgenti su tecnologie del futuro, viaggi nello spazio, robot e universi alternativi.',
    pt: 'Histórias imersivas sobre tecnologias do futuro, viagens espaciais, robôs e universos alternativos.',
    ru: 'Захватывающие истории о технологиях будущего, космических путешествиях, роботах и альтернативных вселенных.',
    ar: 'قصص غامرة عن تقنيات المستقبل، والسفر عبر الفضاء، والروبوتات، والأكوان البديلة.',
    zh: '关于未来技术、太空旅行、机器人和备用宇宙的沉浸式故事。',
    hi: 'भविष्य की तकनीकों, अंतरिक्ष यात्रा, रोबोट और वैकल्पिक ब्रह्मांडों के बारे में मनोरंजक कहानियां।',
    ja: '未来のテクノロジー、宇宙旅行、ロボット、オルタナティブ・ユニバースに関する没入型の物語。'
  },
  cat_detective_desc: {
    tr: 'Esrarengiz ipuçları, dahi dedektifler ve gizemli olayların çözüldüğü sürükleyici polisiye öyküler.',
    en: 'Immersive detective stories where mysterious clues, genius detectives, and mysterious events are resolved.',
    es: 'Historias de detectives inmersivas donde se resuelven pistas misteriosas, detectives geniales y sucesos misteriosos.',
    fr: 'Histoires de détectives immersives où des indices mystérieux, des détectives de génie et des événements mystérieux sont résolus.',
    de: 'Fesselnde Detektivgeschichten, in denen mysteriöse Hinweise, geniale Detektive und rätselhafte Ereignisse gelöst werden.',
    it: 'Storie di detective coinvolgenti in cui vengono risolti indizi misteriosi, detective geniali ed eventi misteriosi.',
    pt: 'Histórias de detetives imersivas onde pistas misteriosas, detetives geniais e eventos misteriosos são resolvidos.',
    ru: 'Захватывающие детективные истории, в которых раскрываются таинственные улики, гениальные детективы и загадочные события.',
    ar: 'قصص بوليسية غامرة حيث يتم حل القرائن الغامضة، والمحققين العباقرة، والأحداث الغامضة.',
    zh: '沉浸式侦探故事，解决神秘的线索、天才侦探...和神秘事件。',
    hi: 'रोमांचक जासूसी कहानियां जहां रहस्यमय सुराग, जीनियस जासूस और रहस्यमय घटनाओं को सुलझाया जाता है।',
    ja: '不可解な手がかり、天才探偵、そして神秘的な事件が解決される没入型の探偵小説。'
  },
  cat_history_desc: {
    tr: 'Tarihe yön veren olaylar, antik imparatorluklar ve dilden dile aktarılan efsanevi öyküler.',
    en: 'Events that shaped history, ancient empires, and legendary stories passed down from generation to generation.',
    es: 'Eventos que dieron forma a la historia, imperios antiguos e historias legendarias transmitidas de generación en generación.',
    fr: 'Des événements qui ont façonné l\'histoire, des empires anciens et des histoires légendaires transmises de génération en génération.',
    de: 'Ereignisse, die die Geschichte geprägt haben, alte Reiche und legendäre Geschichten, die von Generation zu Generation weitergegeben wurden.',
    it: 'Eventi che hanno fatto la storia, antichi imperi e storie leggendarie tramandate di generazione in generazione.',
    pt: 'Eventos que moldaram a história, impérios antigos e histórias lendárias passadas de geração em geração.',
    ru: 'События, определившие историю, древние империи и легендарные истории, передающиеся из поколения в поколение.',
    ar: 'الأحداث التي شكلت التاريخ، والإمبراطوريات القديمة، والقصص الأسطورية المتوارثة من جيل إلى جيل.',
    zh: '塑造历史的事件、古代帝国以及代代相传的传奇故事。',
    hi: 'इतिहास को आकार देने वाली घटनाएं, प्राचीन साम्राज्य और पीढ़ी-दर-पीढ़ी चली आ रही पौराणिक कहानियां।',
    ja: '歴史を形作った出来事、古代の帝国、そして世代から世代へと受け継がれてきた伝説的な物語。'
  },
  cat_mythology_desc: {
    tr: 'Antik tanrılar, kahramanlar ve epik mitolojik efsanelerin büyüleyici dünyası.',
    en: 'The fascinating world of ancient gods, heroes, and epic mythological legends.',
    es: 'El fascinante mundo de los antiguos dioses, héroes y leyendas mitológicas épicas.',
    fr: 'Le monde fascinant des dieux anciens, des héros et des légendes mythologiques épiques.',
    de: 'Die faszinierende Welt der antiken Götter, Helden und epischen mythologischen Legenden.',
    it: 'Il fascinevole mondo degli antichi dei, eroi e leggende mitologiche epiche.',
    pt: 'O fascinante mundo de deuses antigos, heróis e lendas mitológicas épicas.',
    ru: 'Удивительный мир древних богов, героев и эпических мифологических легенд.',
    ar: 'العالم الرائع للآلهة القديمة والأبطال والأساطير الميثولوجية الملحمية.',
    zh: '古代神明、英雄和史诗般神话传说的迷人世界。',
    hi: 'प्राचीन देवताओं, नायकों और महाकाव्य पौराणिक कथाओं की आकर्षक दुनिया।',
    ja: '古代の神々、英雄、指示的な神話伝説の魅力的な世界。'
  },
  cat_travel_desc: {
    tr: 'Dünyanın dört bir yanından renkli kültürler, şehirler ve benzersiz gelenekler.',
    en: 'Colorful cultures, cities, and unique traditions from around the world.',
    es: 'Culturas coloridas, tradiciones y ciudades de todo el mundo.',
    fr: 'Cultures colorées, villes et traditions uniques du monde entier.',
    de: 'Farbenfrohe Kulturen, Städte und einzigartige Traditionen aus aller Welt.',
    it: 'Culture colorate, città e tradizioni uniche provenienti da tutto il mondo.',
    pt: 'Culturas coloridas, cidades e tradições únicas de todo o mundo.',
    ru: 'Красочные культуры, города и уникальные традиции со всего мира.',
    ar: 'ثقافات ملونة ومدن وتقاليد فريدة من tüm أنحاء العالم.',
    zh: '来自世界各地的多彩文化、城市和独特传统。',
    hi: 'दुनिया भर से रंगीन संस्कृतियां, शहर और अनूठी परंपराएं।',
    ja: '世界中の多彩な文化、都市、ユニークな伝統。'
  },
  cat_nature_desc: {
    tr: 'Evrenin derinlikleri, doğa harikaları ve vahşi yaşam üzerine büyüleyici popüler kurgular.',
    en: 'Fascinating popular fiction on the depths of the universe, natural wonders, and wildlife.',
    es: 'Fascinante ficción popular sobre las profundidades del universo, las maravillas naturales y la vida silvestre.',
    fr: 'Fiction populaire fascinante sur les profondeurs de l\'univers, les merveilles de la nature et la vie sauvage.',
    de: 'Faszinierende populäre Belletristik über die Tiefen des Universums, Naturwunder und Tierwelt.',
    it: 'Affascinante narrativa popolare sulle profondità dell\'universo, le meraviglie della natura e la fauna selvatica.',
    pt: 'Ficção popular fascinante sobre as profundezas do universo, maravilhas naturais e vida selvagem.',
    ru: 'Увлекательная популярная фантастика о глубинах вселенной, чудесах природы и дикой природе.',
    ar: 'خيال شعبي رائع عن أعماق الكون، وعجائب الطبيعة، والحياة البرية.',
    zh: '关于宇宙深处、自然奇观和野生动物的迷人科普小说。',
    hi: 'ब्रह्मांड की गहराइयों, प्राकृतिक अजूबों और वन्यजीवों पर आकर्षक कथा साहित्य।',
    ja: '宇宙の深淵、自然の驚異、野生生物に関する魅力的な大衆小説。'
  },

  // Tabs
  tab_library: {
    tr: 'Kitaplık', en: 'Library', es: 'Biblioteca', fr: 'Bibliothèque', de: 'Bibliothek',
    it: 'Biblioteca', pt: 'Biblioteca', ru: 'Библиотека', ar: 'المكتبة', zh: '图书馆', hi: 'पुस्तकालय', ja: '図書館'
  },
  tab_words: {
    tr: 'Kelimelerim', en: 'My Words', es: 'Mis Palabras', fr: 'Mes Mots', de: 'Meine Wörter',
    it: 'Le Mie Parole', pt: 'Minhas Palavras', ru: 'Мои слова', ar: 'كلماتي', zh: '我的单词', hi: 'मेरे शब्द', ja: '単語帳'
  },
  tab_favorites: {
    tr: 'Favoriler', en: 'Favorites', es: 'Favoritos', fr: 'Favoris', de: 'Favoriten',
    it: 'Preferiti', pt: 'Favoritos', ru: 'Избранное', ar: 'المفضلة', zh: '收藏夹', hi: 'पसंदीदा', ja: 'お気に入り'
  },
  tab_profile: {
    tr: 'Profil', en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil',
    it: 'Profilo', pt: 'Perfil', ru: 'Профиль', ar: 'الملف الشخصي', zh: '个人资料', hi: 'प्रोफ़ाइल', ja: 'プロフィール'
  },
  tab_quiz: {
    tr: 'Kelime Pratiği', en: 'Word Practice', es: 'Práctica de palabras', fr: 'Pratique des mots', de: 'Wortpraxis',
    it: 'Pratica delle parole', pt: 'Prática de palavras', ru: 'Практика слов', ar: 'ممارسة الكلمات', zh: '单词练习', hi: 'शब्द अभ्यास', ja: '単語練習'
  },
  splash_subtitle: {
    tr: 'Maceralarla Dolu Kitaplar Seni Bekliyor', en: 'Books Full of Adventures Await You', es: 'Libros llenos de aventuras te esperan', fr: "Des livres pleins d'aventures vous attendent", de: 'Bücher voller Abenteuer erwarten dich',
    it: 'Libri pieni di avventure ti aspettano', pt: 'Livros cheios de aventuras esperam por você', ru: 'Книги, полные приключений, ждут вас', ar: 'كتب مليئة بالمغامرات بانتظارك', zh: '充满冒险的书籍在等待着你', hi: 'रोमांच से भरी किताबें आपका इंतजार कर रही हैं', ja: '冒険に満ちた本があなたを待っています'
  },
  splash_tagline: {
    tr: 'Sihirli hikayeler yükleniyor...', en: 'Magical stories loading...', es: 'Cargando historias mágicas...', fr: "Chargement d'histoires magiques...", de: 'Magische Geschichten werden geladen...',
    it: 'Caricamento di storie magiche...', pt: 'Carregando histórias mágicas...', ru: 'Загрузка волшебных историй...', ar: 'جاري تحميل القصص السحرية...', zh: '正在加载奇妙的故事...', hi: 'जादुई कहानियाँ लोड हो रही हैं...', ja: '魔法の物語を読み込んでいます...'
  },
  
  // Consent ToS Modal
  tos_title: {
    tr: 'Kullanıcı Sözleşmesi', en: 'User Agreement', es: 'Acuerdo de Usuario', fr: "Conditions d'utilisation", de: 'Nutzervereinbarung',
    it: 'Accordo Utente', pt: 'Contrato do Usuário', ru: 'Пользовательское соглашение', ar: 'اتفاقية المستخدم', zh: '用户协议', hi: 'उपयोगकर्ता समझौता', ja: '利用規約'
  },
  tos_text: {
    tr: 'Uygulamamızı kullanmaya başlamadan önce, size güvenli bir deneyim sunabilmemiz için lütfen Kullanım Koşulları ve Gizlilik Politikası sözleşmesini okuyup onaylayın.',
    en: 'Before starting to use our application, please read and approve the Terms of Use and Privacy Policy agreement so that we can offer you a safe experience.',
    es: 'Antes de comenzar a utilizar nuestra aplicación, lea y apruebe el acuerdo de Términos de uso y Política de privacidad para que podamos ofrecerle una experiencia segura.',
    fr: "Avant de commencer à utiliser notre application, veuillez lire et approuver les Conditions d'utilisation et la Politique de confidentialité afin que nous puissions vous offrir une expérience sécurisée.",
    de: 'Bevor Sie unsere Anwendung nutzen, lesen und stimmen Sie bitte den Nutzungsbedingungen und der Datenschutzerklärung zu, damit wir Ihnen eine sichere Nutzung bieten können.',
    it: "Prima di iniziare a utilizzare la nostra applicazione, si prega di leggere e approvare le Condizioni d'uso e l'Informativa sulla privacy in modo da potervi offrire un'esperienza sicura.",
    pt: 'Antes de começar a usar nosso aplicativo, leia e aprove os Termos de Uso e a Política de Privacidade para que possamos oferecer uma experiência segura.',
    ru: 'Перед началом использования нашего приложения, пожалуйста, прочтите и примите Пользовательское соглашение и Политику конфиденциальности, чтобы мы могли обеспечить вам безопасность.',
    ar: 'قبل البدء في استخدام تطبيقنا، يرجى قراءة والموافقة على اتفاقية شروط الاستخدام وسياسة الخصوصية حتى نتمكن من تقديم تجربة آمنة لك.',
    zh: '在开始使用我们的应用程序之前，请阅读并同意使用条款和隐私政策协议，以便我们为您提供安全的体验。',
    hi: 'हमारे एप्लिकेशन का उपयोग शुरू करने से पहले, कृपया उपयोग की शर्तें और गोपनीयता नीति समझौते को पढ़ें और स्वीकार करें ताकि हम आपको एक सुरक्षित अनुभव प्रदान कर सकें।',
    ja: 'アプリのご利用を開始する前に、安全な体験を提供するために、利用規約とプライバシーポリシーをお読みいただき、同意してください。'
  },
  tos_checkbox: {
    tr: 'Sözleşmedeki tüm maddeleri okudum, anladım ve kabul ediyorum.',
    en: 'I have read, understood and agree to all the terms in the agreement.',
    es: 'He leído, entendido y acepto todos los términos del acuerdo.',
    fr: "J'ai lu, compris et j'accepte toutes les conditions du contrat.",
    de: 'Ich habe alle Bedingungen der Vereinbarung gelesen, verstanden und stimme ihnen zu.',
    it: 'Ho letto, compreso e accetto tutti i termini dell\'accordo.',
    pt: 'Li, entendi e concordo com todos os termos do contrato.',
    ru: 'Я прочитал, понял и согласен со всеми условиями соглашения.',
    ar: 'لقد قرأت وفهمت وأوافق على جميع الشروط الواردة في الاتفاقية.',
    zh: '我已阅读、理解并同意协议中的所有条款。',
    hi: 'मैंने समझौते की सभी शर्तों को पढ़, समझ और स्वीकार कर लिया है।',
    ja: '規約のすべての条項を読み、理解し、同意します。'
  },
  tos_btn: {
    tr: 'Onayla ve Devam Et', en: 'Approve and Continue', es: 'Aprobar y continuar', fr: 'Approuver et continuer', de: 'Zustimmen und fortfahren',
    it: 'Approva e continua', pt: 'Aprovar e continuar', ru: 'Принять и продолжить', ar: 'الموافقة والمتابعة', zh: '同意并继续', hi: 'स्वीकार करें और जारी रखें', ja: '同意して続行'
  },

  // Reading view headers
  btn_back: {
    tr: 'Geri', en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück',
    it: 'Indietro', pt: 'Voltar', ru: 'Назад', ar: 'عودة', zh: '返回', hi: 'पीछे', ja: '戻る'
  },
  refill_new_heart: {
    tr: 'Yeni Can:', en: 'New Life:', es: 'Nueva vida:', fr: 'Nouvelle vie:', de: 'Neues Leben:',
    it: 'Nuova vita:', pt: 'Nova vida:', ru: 'Новая жизнь:', ar: 'حياة جديدة:', zh: '新生命：', hi: 'नया जीवन:', ja: 'ライフ回復まで:'
  },
  tips_title: {
    tr: 'İpucu:', en: 'Tip:', es: 'Sugerencia:', fr: 'Conseil:', de: 'Tipp:',
    it: 'Consiglio:', pt: 'Dica:', ru: 'Подсказка:', ar: 'تلميح:', zh: '提示：', hi: 'सुझाव:', ja: 'ヒント:'
  },
  tips_content: {
    tr: 'Kelimenin Türkçe anlamı için üzerine tek tıklayın. Cümlenin Türkçe çevirisi için cümleye çift tıklayın veya kelimeye 1 saniye basılı tutun (sadece ilgili cümleyi açıklar).',
    en: 'Single click on a word for its translation. Double click on a sentence or hold down on a word for 1 second for sentence translation.',
    es: 'Haz un solo clic en una palabra para traducirla. Haz doble clic en una oración o mantén presionada una palabra durante 1 segundo para ver la traducción de la oración.',
    fr: 'Cliquez une fois sur un mot pour sa traduction. Double-cliquez sur une phrase ou maintenez un mot enfoncé pendant 1 seconde pour traduire la phrase.',
    de: 'Klicken Sie einmal auf ein Wort, um es zu übersetzen. Doppelklicken Sie auf einen Satz oder halten Sie ein Wort 1 Sekunde lang gedrückt, um den Satz zu übersetzen.',
    it: 'Clicca una volta su una parola per tradurla. Fai doppio clic su una frase o tieni premuto su bir parola per 1 secondo per tradurre la frase.',
    pt: 'Clique uma vez em uma palavra para traduzi-la. Dê um duplo clique em uma frase ou mantenha pressionada uma palavra por 1 segundo para traduzir a frase.',
    ru: 'Нажмите один раз на слово для его перевода. Дважды нажмите на предложение или удерживайте слово в течение 1 секунды для перевода предложения.',
    ar: 'انقر نقرة واحدة على الكلمة لترجمتها. انقر نقرتين على الجملة أو اضغط مطولاً على كلمة لمدة ثانية لترجمة الجملة.',
    zh: '单击单词查看翻译。双击句子或按住单词1秒钟可翻译句子。',
    hi: 'अनुवाद के लिए किसी शब्द पर सिंगल क्लिक करें। वाक्य अनुवाद के लिए किसी वाक्य पर डबल क्लिक करें या किसी शब्द पर 1 सेकंड तक दबाकर रखें।',
    ja: '単語をクリックすると翻訳が表示されます。文をダブルクリックするか、単語を1秒間長押しすると文の翻訳が表示されます。'
  },
  
  // Audiobook
  audiobook_header: {
    tr: 'Sesli Kitap (Audiobook)', en: 'Audiobook', es: 'Audiolibro', fr: 'Livre audio', de: 'Hörbuch',
    it: 'Audiolibro', pt: 'Audiolivro', ru: 'Аудиокнига', ar: 'كتاب صوتي', zh: '有声书', hi: 'ऑडियोबुक', ja: 'オーディオブック'
  },
  audiobook_playing: {
    tr: 'Sayfa sesli olarak okunuyor...', en: 'Reading page aloud...', es: 'Leyendo página en voz alta...', fr: 'Lecture de la page à haute voix...', de: 'Seite wird vorgelesen...',
    it: 'Lettura della pagina ad alta voce...', pt: 'Lendo página em voz alta...', ru: 'Страница читается вслух...', ar: 'قراءة الصفحة بصوت عالٍ...', zh: '正在朗读页面...', hi: 'पृष्ठ ज़ोर से पढ़ा जा रहा है...', ja: 'ページを読み上げています...'
  },
  audiobook_idle: {
    tr: 'Bu sayfanın tamamını seslendirin.', en: 'Listen to the entire page.', es: 'Escuchar toda la página.', fr: 'Écouter toute la page.', de: 'Die gesamte Seite anhören.',
    it: 'Ascolta l\'intera pagina.', pt: 'Ouvir toda a página.', ru: 'Прослушать всю страницу.', ar: 'استمع إلى الصفحة كاملة.', zh: '聆听整个页面。', hi: 'पूरा पृष्ठ सुनें।', ja: 'ページ全体を聴く。'
  },
  audiobook_listen: {
    tr: 'Bütün Sayfayı Dinle', en: 'Listen to Page', es: 'Escuchar página', fr: 'Écouter la page', de: 'Seite anhören',
    it: 'Ascolta la pagina', pt: 'Ouvir Página', ru: 'Слушать страницу', ar: 'استمع للصفحة', zh: '听页面', hi: 'पृष्ठ सुनें', ja: 'ページを聴く'
  },
  audiobook_resume: {
    tr: 'Kaldığın Yerden Devam Et', en: 'Resume Reading', es: 'Reanudar lectura', fr: 'Reprendre la lecture', de: 'Fortsetzen',
    it: 'Riprendi lettura', pt: 'Retomar Leitura', ru: 'Продолжить', ar: 'استئناف القراءة', zh: '继续阅读', hi: 'पढ़ना जारी रखें', ja: '途中から再開'
  },
  audiobook_stop: {
    tr: 'Durdur', en: 'Stop', es: 'Detener', fr: 'Arrêter', de: 'Stoppen',
    it: 'Interrompi', pt: 'Parar', ru: 'Остановить', ar: 'إيقاف', zh: '停止', hi: 'रोकें', ja: '停止'
  },

  // Book Start Prompt
  book_start_title: {
    tr: 'Bu Hikayeye Başlayın!', en: 'Start this Story!', es: '¡Empieza esta historia!', fr: 'Commencez cette histoire !', de: 'Starten Sie diese Geschichte!',
    it: 'Inizia questa storia!', pt: 'Comece esta História!', ru: 'Начать историю!', ar: 'ابدأ هذه القصة!', zh: '开始这个故事！', hi: 'यह कहानी शुरू करें!', ja: 'このストーリーを読み始める！'
  },
  book_start_desc: {
    tr: 'Hikayeyi kütüphanedeki "Şu Anda Okunanlar" listenize eklemek ve ilerlemenizi kaydetmek için butona tıklayın.',
    en: 'Click the button to add the story to your "Currently Reading" list in the library and save your progress.',
    es: 'Haz clic en el botón para agregar la historia a tu lista de "Leyendo actualmente" en la biblioteca y guardar tu progreso.',
    fr: 'Cliquez sur le bouton pour ajouter l\'histoire à votre liste « Lecture en cours » dans la bibliothèque et enregistrer votre progression.',
    de: 'Klicken Sie auf die Schaltfläche, um die Geschichte Ihrer Liste „Gerade gelesen“ in der Bibliothek hinzuzufügen und Ihren Fortschritt zu speichern.',
    it: 'Clicca sul pulsante per aggiungere la storia al tuo elenco "In lettura" nella biblioteca e salvare i progressi.',
    pt: 'Clique no botão para adicionar a história à sua lista de "Lendo Atualmente" na biblioteca e salvar seu progresso.',
    ru: 'Нажмите кнопку, чтобы добавить историю в список «Читаю сейчас» в библиотеке и сохранить свой прогресс.',
    ar: 'انقر فوق الزر لإضافة القصة إلى قائمة "قيد القراءة حاليًا" في المكتبة وحفظ تقدمك.',
    zh: '点击按钮将故事添加到图书馆的“正在阅读”列表中并保存您的进度。',
    hi: 'पुस्तकालय में अपनी "अभी पढ़ी जा रही" सूची में कहानी जोड़ने और अपनी प्रगति को सहेजने के लिए बटन पर क्लिक करें।',
    ja: 'ボタンをクリックして、ライブラリの「現在読んでいる本」リストにストーリーを追加し、進捗を保存します。'
  },
  book_start_btn: {
    tr: 'Kitaba Başla', en: 'Start Reading', es: 'Comenzar a leer', fr: 'Commencer la lecture', de: 'Lesen starten',
    it: 'Inizia a leggere', pt: 'Começar Leitura', ru: 'Начать чтение', ar: 'ابدأ القراءة', zh: '开始阅读', hi: 'पढ़ना शुरू करें', ja: 'ストーリーを開始'
  },

  // Page Transitions
  btn_next_page: {
    tr: 'Sonraki Sayfa', en: 'Next Page', es: 'Siguiente página', fr: 'Page suivante', de: 'Nächste Seite',
    it: 'Pagina successiva', pt: 'Próxima Página', ru: 'Следующая страница', ar: 'الصفحة التالية', zh: '下一页', hi: 'अगला पृष्ठ', ja: '次のページ'
  },
  btn_finish_book: {
    tr: 'Kitabı Bitir', en: 'Finish Book', es: 'Terminar libro', fr: 'Terminer le livre', de: 'Buch beenden',
    it: 'Finito', pt: 'Terminar Livro', ru: 'Завершить книгу', ar: 'إنهاء الكتاب', zh: '完成书籍', hi: 'किताब समाप्त करें', ja: '読了'
  },
  book_completed_title: {
    tr: 'Bu Kitabı Başarıyla Bitirdiniz! 🎉', en: 'You Finished this Book! 🎉', es: '¡Terminaste este libro! 🎉', fr: 'Vous avez terminé ce livre ! 🎉', de: 'Sie haben dieses Buch beendet! 🎉',
    it: 'Hai finito questo libro! 🎉', pt: 'Você Terminou este Livro! 🎉', ru: 'Вы закончили эту книгу! 🎉', ar: 'لقد أنهيت هذا الكتاب! 🎉', zh: '您完成了这本书！ 🎉', hi: 'आपने यह किताब पूरी कर ली! 🎉', ja: '本を読み終えました！ 🎉'
  },
  book_completed_desc: {
    tr: 'Tebrikler! Bu hikayeyi tamamladınız. Kütüphaneye geri dönüp yeni hikayeler keşfedebilirsiniz.',
    en: 'Congratulations! You completed this story. You can go back to the library and discover new stories.',
    es: '¡Felicitaciones! Completaste esta historia. Puedes volver a la biblioteca y descubrir nuevas historias.',
    fr: 'Félicitations ! Vous avez terminé cette histoire. Vous pouvez retourner à la bibliothèque et découvrir de nouvelles histoires.',
    de: 'Herzlichen Glückwunsch! Sie haben diese Geschichte abgeschlossen. Sie können zur Bibliothek zurückkehren und neue Geschichten entdecken.',
    it: 'Congratulazioni! Hai completato questa storia. Puoi tornare in biblioteca e scoprire nuove storie.',
    pt: 'Parabéns! Você completou esta história. Você pode voltar à biblioteca e descobrir novas histórias.',
    ru: 'Поздравляем! Вы завершили эту историю. Вы можете вернуться в библиотеку и открыть для себя новые истории.',
    ar: 'تهانينا! لقد أكملت هذه القصة. يمكنك العودة إلى المكتبة واكتشاف قصص جديدة.',
    zh: '恭喜！您完成了这个故事。您可以回到图书馆发现新的故事。',
    hi: 'बधाई हो! आपने यह कहानी पूरी कर ली। आप पुस्तकालय में वापस जा सकते हैं और नई कहानियाँ खोज सकते हैं।',
    ja: 'おめでとうございます！このストーリーを読み終えました。ライブラリに戻って新しいストーリーを見つけることができます。'
  },
  book_end_title: {
    tr: 'Hikayenin Sonuna Geldiniz! 📖', en: 'You Reached the End! 📖', es: '¡Llegaste al final! 📖', fr: 'Vous êtes arrivé à la fin ! 📖', de: 'Sie haben das Ende erreicht! 📖',
    it: 'Sei arrivato alla fine! 📖', pt: 'Você Chegou ao Fim! 📖', ru: 'Вы дошли до конца! 📖', ar: 'لقد وصلت إلى النهاية! 📖', zh: '您已到达终点！ 📖', hi: 'आप अंत तक पहुँच गए! 📖', ja: 'ストーリーの最後に到達しました！ 📖'
  },
  book_end_desc: {
    tr: 'Bu hikayeyi başarıyla tamamladınız. Profilinize işlenmesi ve kitaplıkta bitmiş olarak işaretlenmesi için aşağıdaki butona basın.',
    en: 'You have successfully completed this story. Press the button below to record it in your profile and mark it as completed in the library.',
    es: 'Completaste con éxito esta historia. Presiona el botón de abajo para registrarla en tu perfil y marcarla como completada en la biblioteca.',
    fr: 'Vous avez terminé cette histoire avec succès. Appuyez sur le bouton ci-dessous pour l\'enregistrer dans votre profil et la marquer comme terminée dans la bibliothèque.',
    de: 'Sie haben diese Geschichte erfolgreich abgeschlossen. Drücken Sie die Taste unten, um sie in Ihrem Profil zu speichern und in der Bibliothek als abgeschlossen zu markieren.',
    it: 'Hai completato con successo questa storia. Premi il pulsante qui sotto per registrarla nel tuo profilo e contrassegnarla come completata nella biblioteca.',
    pt: 'Você completou esta história com sucesso. Pressione o botão abaixo para registrá-la em seu perfil e marcá-la como concluída na biblioteca.',
    ru: 'Вы успешно завершили эту историю. Нажмите кнопку ниже, чтобы записать ее в своем профиле и пометить как прочитанную в библиотеке.',
    ar: 'لقد أكملت هذه القصة بنجاح. اضغط على الزر أدناه لتسجيلها في ملفك الشخصي وتحديدها كمكتملة في المكتبة.',
    zh: '您已成功完成此故事。按下方按钮将其记录在您的个人资料中，并在图书馆中标记为已完成。',
    hi: 'आपने यह कहानी सफलतापूर्वक पूरी कर ली है। इसे अपनी प्रोफ़ाइल में रिकॉर्ड करने और पुस्तकालय में इसे पूर्ण के रूप में चिह्नित करने के लिए नीचे दिए गए बटन को दबाएं।',
    ja: 'ストーリーを正常に読み終えました。下のボタンを押してプロフィールに記録し、ライブラリで読了としてマークします。'
  },
  btn_back_library: {
    tr: 'Kütüphaneye Dön', en: 'Back to Library', es: 'Volver a la biblioteca', fr: 'Retour à la bibliothèque', de: 'Zurück zur Bibliothek',
    it: 'Torna alla biblioteca', pt: 'Voltar à Biblioteca', ru: 'В библиотеку', ar: 'العودة للمكتبة', zh: '返回图书馆', hi: 'पुस्तकालय पर वापस जाएँ', ja: 'ライブラリに戻る'
  },

  // Library Tab
  search_placeholder: {
    tr: 'Arama...', en: 'Search...', es: 'Buscar...', fr: 'Rechercher...', de: 'Suchen...',
    it: 'Cerca...', pt: 'Buscar...', ru: 'Поиск...', ar: 'بحث...', zh: '搜索...', hi: 'खोजें...', ja: '検索...'
  },
  difficulty_select: {
    tr: 'Seviye Seçin', en: 'Select Level', es: 'Seleccionar nivel', fr: 'Choisir le niveau', de: 'Stufe wählen',
    it: 'Seleziona livello', pt: 'Selecionar Nível', ru: 'Выбрать уровень', ar: 'اختر المستوى', zh: '选择级别', hi: 'स्तर चुनें', ja: 'レベルを選択'
  },
  categories_title: {
    tr: 'Kategoriler', en: 'Categories', es: 'Categorías', fr: 'Catégories', de: 'Kategorien',
    it: 'Categorie', pt: 'Categorias', ru: 'Категории', ar: 'الفئات', zh: '类别', hi: 'श्रेणियाँ', ja: 'カテゴリー'
  },
  currently_reading: {
    tr: 'Şu Anda Okunanlar', en: 'Currently Reading', es: 'Leyendo actualmente', fr: 'Lectures en cours', de: 'Gerade gelesen',
    it: 'In lettura', pt: 'Lendo Atualmente', ru: 'Читаю сейчас', ar: 'قيد القراءة حاليًا', zh: '正在阅读', hi: 'अभी पढ़ी जा रही', ja: '現在読んでいる本'
  },
  all_stories: {
    tr: 'Tüm Hikayeler', en: 'All Stories', es: 'Todas las historias', fr: 'Toutes les histoires', de: 'Alle Geschichten',
    it: 'Tutte le storie', pt: 'Todas as Histórias', ru: 'Все истории', ar: 'كل القصص', zh: '所有故事', hi: 'सभी कहानियाँ', ja: 'すべてのストーリー'
  },
  completed_stories: {
    tr: 'Bitirilenler', en: 'Completed', es: 'Completados', fr: 'Terminés', de: 'Abgeschlossen',
    it: 'Completati', pt: 'Concluídos', ru: 'Прочитанные', ar: 'المكتملة', zh: '已完成', hi: 'पूर्ण', ja: '読了済み'
  },
  add_custom_story: {
    tr: 'Özel Hikaye Ekle', en: 'Add Custom Story', es: 'Añadir historia propia', fr: 'Ajouter une histoire', de: 'Eigene Geschichte hinzufügen',
    it: 'Aggiungi storia pers.', pt: 'Adicionar História', ru: 'Добавить историю', ar: 'إضافة قصة مخصصة', zh: '添加自定义故事', hi: 'कस्टम कहानी जोड़ें', ja: 'カスタムストーリーを追加'
  },

  // Vocabulary Tab
  btn_start_quiz: {
    tr: 'Quiz\'e Başla', en: 'Start Quiz', es: 'Comenzar cuestionario', fr: 'Lancer le quiz', de: 'Quiz starten',
    it: 'Inizia quiz', pt: 'Iniciar Quiz', ru: 'Начать квиз', ar: 'ابدأ الاختبار', zh: '开始测试', hi: 'क्विज शुरू करें', ja: 'クイズを開始'
  },
  btn_random_quiz: {
    tr: 'Karışık Kelime Quizi', en: 'Random Vocabulary Quiz', es: 'Cuestionario aleatorio', fr: 'Quiz de vocabulaire aléatoire', de: 'Zufälliges Wortschatz-Quiz',
    it: 'Quiz vocabolario casuale', pt: 'Quiz de Vocabulário Aleatório', ru: 'Случайный квиз слов', ar: 'اختبار مفردات عشوائي', zh: '随机词汇测试', hi: 'यादृच्छिक शब्दावली क्विज़', ja: 'ランダム単語クイズ'
  },
  game_synonym: {
    tr: 'Hafıza Oyunu', en: 'Match Game', es: 'Juego de emparejar', fr: 'Jeu d\'association', de: 'Zuordnungsspiel',
    it: 'Gioco di abbinamento', pt: 'Jogo de Associação', ru: 'Игра на совпадение', ar: 'لعبة المطابقة', zh: '连线游戏', hi: 'मिलान खेल', ja: 'マッチングゲーム'
  },
  game_fillblank: {
    tr: 'Boşluk Doldurma Oyunu', en: 'Fill in the Blanks', es: 'Completar los espacios', fr: 'Texte à trous', de: 'Lückentext',
    it: 'Riempi gli spazi', pt: 'Preencher as Lacunas', ru: 'Заполнить пропуски', ar: 'املأ الفراغات', zh: '填空游戏', hi: 'रिक्त स्थान भरें', ja: '穴埋めゲーム'
  },
  vocab_empty_desc: {
    tr: 'Yeni kelimeler eklemek için hikaye okumaya başla.',
    en: 'Start reading stories to add new words.',
    es: 'Comienza a leer historias para añadir nuevas palabras.',
    fr: 'Commencez à lire des histoires pour ajouter de nouveaux mots.',
    de: 'Beginnen Sie mit dem Lesen von Geschichten, um neue Wörter hinzuzufügen.',
    it: 'Inizia a leggere storie per aggiungere nuove parole.',
    pt: 'Comece a ler histórias para adicionar novas palavras.',
    ru: 'Начните читать истории, чтобы добавлять новые слова.',
    ar: 'ابدأ بقراءة القصص لإضافة كلمات جديدة.',
    zh: '开始阅读故事以添加新单词。',
    hi: 'नए शब्द जोड़ने के लिए कहानियाँ पढ़ना शुरू करें।',
    ja: '新しい単語を追加するにはストーリーを読み始めましょう。'
  },
  search_no_results: {
    tr: 'Aradığınız kritere uygun kelime bulunamadı.',
    en: 'No words found matching your search criteria.',
    es: 'No se encontraron palabras que coincidan con tu búsqueda.',
    fr: 'Aucun mot ne correspond à votre recherche.',
    de: 'Keine Wörter gefunden, die Ihren Kriterien entsprechen.',
    it: 'Nessuna parola trovata corrispondente alla ricerca.',
    pt: 'Nenhuma palavra encontrada correspondente à pesquisa.',
    ru: 'Слова, соответствующие вашему запросу, не найдены.',
    ar: 'لم يتم العثور على كلمات مطابقة لمعايير البحث.',
    zh: '未找到符合搜索条件的单词。',
    hi: 'आपकी खोज के अनुसार कोई शब्द नहीं मिला।',
    ja: '検索条件に一致する単語が見つかりませんでした。'
  },
  vocab_empty_msg: {
    tr: 'Henüz kelime kaydetmediniz. Kitaplıktan kelimelere tıklayarak başlayabilirsiniz!',
    en: 'You haven\'t saved any words yet. You can start by clicking on words in the library!',
    es: 'Aún no has guardado ninguna palabra. ¡Puedes comenzar haciendo clic en las palabras de la biblioteca!',
    fr: 'Vous n\'avez pas encore enregistré de mots. Vous pouvez commencer en cliquant sur les mots dans la bibliothèque !',
    de: 'Sie haben noch keine Wörter gespeichert. Sie können anfangen, indem Sie auf Wörter in der Bibliothek klicken!',
    it: 'Non hai ancora salvato nessuna parola. Puoi iniziare cliccando sulle parole nella biblioteca!',
    pt: 'Você ainda não salvou nenhuma palavra. Pode começar clicando nas palavras na biblioteca!',
    ru: 'Вы еще не сохранили ни одного слова. Вы можете начать, нажимая на слова в библиотеке!',
    ar: 'لم تحفظ أي كلمات بعد. يمكنك البدء بالنقر فوق الكلمات في المكتبة!',
    zh: '您尚未保存任何单词。您可以通过点击图书馆中的单词开始！',
    hi: 'आपने अभी तक कोई शब्द नहीं सहेजा है। आप पुस्तकालय में शब्दों पर क्लिक করে शुरुआत कर सकते हैं!',
    ja: '保存された単語はまだありません。図書館で単語をクリックして追加しましょう！'
  },

  // Profile Settings Tab
  settings_title: {
    tr: 'GENEL AYARLAR', en: 'GENERAL SETTINGS', es: 'AJUSTES GENERALES', fr: 'PARAMÈTRES GÉNÉRAUX', de: 'ALLGEMEINE EINSTELLUNGEN',
    it: 'IMPOSTAZIONI GENERALI', pt: 'CONFIGURAÇÕES GERAIS', ru: 'ОБЩИЕ НАСТРОЙКИ', ar: 'إعدادات عامة', zh: '通用设置', hi: 'सामान्य सेटिंग्स', ja: '一般設定'
  },
  settings_energy: {
    tr: 'Mevcut Can (Enerji)', en: 'Current Lives (Energy)', es: 'Vidas actuales (Energía)', fr: 'Vies actuelles (Énergie)', de: 'Aktuelle Leben (Energie)',
    it: 'Vite attuali (Energia)', pt: 'Vidas Atuais (Energia)', ru: 'Текущие жизни (Энергия)', ar: 'الأرواح الحالية (الطاقة)', zh: '当前生命值（体力）', hi: 'वर्तमान जीवन (ऊर्जा)', ja: '現在のライフ（エネルギー）'
  },
  settings_share: {
    tr: 'Uygulamayı Paylaş', en: 'Share App', es: 'Compartir aplicación', fr: 'Partager l\'application', de: 'App teilen',
    it: 'Condividi app', pt: 'Compartilhar Aplicativo', ru: 'Поделиться приложением', ar: 'مشاركة التطبيق', zh: '分享应用', hi: 'ऐप साझा करें', ja: 'アプリを共有'
  },
  settings_about: {
    tr: 'Hakkımızda & Puan Ver', en: 'About Us & Rate', es: 'Acerca de y Calificar', fr: 'À propos et Noter', de: 'Über uns & Bewerten',
    it: 'Chi siamo e Valuta', pt: 'Sobre e Avaliar', ru: 'О нас и Оценить', ar: 'من نحن وتقييم التطبيق', zh: '关于我们与评分', hi: 'हमारे बारे में और रेटिंग', ja: 'アプリについて・評価'
  },
  settings_privacy: {
    tr: 'Gizlilik Politikası', en: 'Privacy Policy', es: 'Política de privacidad', fr: 'Politique de confidentialité', de: 'Datenschutzerklärung',
    it: 'Informativa sulla privacy', pt: 'Política de Privacidade', ru: 'Политикой конфиденциальности', ar: 'سياسة الخصوصية', zh: '隐私政策', hi: 'गोपनीयता नीति', ja: 'プライバシーポリシー'
  },
  settings_delete: {
    tr: 'Hesabımı ve Verilerimi Sil', en: 'Delete Account & Data', es: 'Eliminar cuenta y datos', fr: 'Supprimer le compte et les données', de: 'Konto & Daten löschen',
    it: 'Elimina account e dati', pt: 'Excluir Conta e Dados', ru: 'Удалить аккаунт и данные', ar: 'حذف الحساب والبيانات', zh: '删除帐户和数据', hi: 'खाता और डेटा हटाएं', ja: 'アカウントとデータを削除'
  },
  settings_premium_benefits: {
    tr: 'Premium Üye Ayrıcalıkları', en: 'Premium Benefits', es: 'Beneficios Premium', fr: 'Avantages Premium', de: 'Premium-Vorteile',
    it: 'Vantaggi Premium', pt: 'Benefícios Premium', ru: 'Преимущества Премиум', ar: 'مزايا بريميوم', zh: '会员特权', hi: 'प्रीमियम लाभ', ja: 'プレミアム特典'
  },
  settings_premium_buy: {
    tr: 'İngilizce Öyküm Premium Satın Al', en: 'Buy Premium', es: 'Comprar Premium', fr: 'Acheter Premium', de: 'Premium kaufen',
    it: 'Acquista Premium', pt: 'Comprar Premium', ru: 'Купить Премиум', ar: 'شراء بريميوم', zh: '购买会员', hi: 'प्रीमियम खरीदें', ja: 'プレミアムを購入'
  },
  btn_buy_premium: {
    tr: 'Premium Satın Al', en: 'Buy Premium', es: 'Comprar Premium', fr: 'Acheter Premium', de: 'Premium kaufen',
    it: 'Acquista Premium', pt: 'Comprar Premium', ru: 'Купить Премиум', ar: 'شراء بريميوم', zh: '购买会员', hi: 'प्रीमियम खरीदें', ja: 'プレミアムを購入'
  },
  settings_language: {
    tr: 'Ana Dil', en: 'Native Language', es: 'Idioma nativo', fr: 'Langue maternelle', de: 'Muttersprache',
    it: 'Lingua madre', pt: 'Idioma Nativo', ru: 'Родной язык', ar: 'اللغة الأم', zh: '母语', hi: 'मातृभाषा', ja: '母国語'
  },
  settings_logout: {
    tr: 'Çıkış Yap', en: 'Log Out', es: 'Cerrar sesión', fr: 'Se déconnecter', de: 'Abmelden',
    it: 'Disconnetti', pt: 'Sair', ru: 'Выйти', ar: 'تسجيل الخروج', zh: '退出登录', hi: 'लॉग आउट', ja: 'ログアウト'
  },
  settings_login: {
    tr: 'Giriş Yap', en: 'Log In', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Anmelden',
    it: 'Accedi', pt: 'Entrar', ru: 'Войти', ar: 'تسجيل الدخول', zh: '登录', hi: 'लॉग इन', ja: 'ログイン'
  },
  
  // Weekly progress
  weekly_progress_title: {
    tr: 'Haftalık İlerleme', en: 'Weekly Progress', es: 'Progreso semanal', fr: 'Progrès hebdomadaire', de: 'Wöchentlicher Fortschritt',
    it: 'Progressi settimanali', pt: 'Progresso Semanal', ru: 'Еженедельный прогресс', ar: 'التقدم الأسبوعي', zh: '每周进度', hi: 'साप्ताहिक प्रगति', ja: '週間の進捗'
  },
  weekly_progress_desc: {
    tr: 'Günlük aktivitelerini görmek için grafik barlarına dokun.',
    en: 'Tap on the chart bars to see your daily activities.',
    es: 'Toca las barras del gráfico para ver tus actividades diarias.',
    fr: 'Appuyez sur les barres du graphique pour voir vos activités quotidiennes.',
    de: 'Tippen Sie auf die Diagrammbalken, um Ihre täglichen Aktivitäten anzuzeigen.',
    it: 'Tocca le barre del grafico per vedere le tue attività quotidiane.',
    pt: 'Toque nas barras do gráfico para ver suas atividades diárias.',
    ru: 'Нажмите на столбцы диаграммы, чтобы увидеть свою активность за день.',
    ar: 'اضغط على أعمدة المخطط البياني لمشاهدة أنشطتك اليومية.',
    zh: '点击图表条以查看您的日常活动。',
    hi: 'अपनी दैनिक गतिविधियों को देखने के लिए चार्ट बार पर टैप करें।',
    ja: 'グラフのバーをタップすると、毎日のアクティビティが表示されます。'
  },
  weekly_words: {
    tr: 'Kelimeler', en: 'Words', es: 'Palabras', fr: 'Mots', de: 'Wörter',
    it: 'Parole', pt: 'Palavras', ru: 'Слова', ar: 'الكلمات', zh: '单词', hi: 'शब्द', ja: '単語'
  },
  weekly_minutes: {
    tr: 'Süre (Dakika)', en: 'Duration (Minutes)', es: 'Duración (Minutos)', fr: 'Durée (Minutes)', de: 'Dauer (Minuten)',
    it: 'Durata (Minuti)', pt: 'Duração (Minutos)', ru: 'Время (Минуты)', ar: 'المدة (الدقائق)', zh: '时长（分钟）', hi: 'अवधि (मिनट)', ja: '学習時間（分）'
  },
  badges_title: {
    tr: 'Başarı Rozetlerim', en: 'My Achievement Badges', es: 'Mis insignias de logros', fr: 'Mes badges de réussite', de: 'Meine Erfolgsabzeichen',
    it: 'I miei distintivi', pt: 'Minhas Conquistas', ru: 'Мои значки достижений', ar: 'شارات الإنجاز الخاصة بي', zh: '我的成就徽章', hi: 'मेरे उपलब्धि पदक', ja: '獲得したバッジ'
  },
  badges_unlocked: {
    tr: 'Açıldı', en: 'Unlocked', es: 'Desbloqueado', fr: 'Déverrouillé', de: 'Freigeschaltet',
    it: 'Sbloccato', pt: 'Desbloqueado', ru: 'Разблокировано', ar: 'مفتوح', zh: '已解锁', hi: 'अनलॉक किया गया', ja: 'アンロック完了'
  },

  // Roadblock Quiz Intro
  roadblock_title: {
    tr: 'OKUMA EŞİĞİ • SAYFA {page} KONTROLÜ',
    en: 'READING THRESHOLD • PAGE {page} CHECKPOINT',
    es: 'UMBRAL DE LECTURA • COMPROBACIÓN PÁGINA {page}',
    fr: 'SEUIL DE LECTURE • CONTRÔLE PAGE {page}',
    de: 'LESESCHWELLE • SEITE {page} KONTROLLE',
    it: 'SOGLIA DI LETTURA • CONTROLLO PAGINA {page}',
    pt: 'LIMIAR DE LEITURA • VERIFICAÇÃO DA PÁGINA {page}',
    ru: 'ПОРОГ ЧТЕНИЯ • ПРОВЕРКА СТРАНИЦЫ {page}',
    ar: 'عتبة القراءة • فحص الصفحة {page}',
    zh: '阅读阀值 • 第 {page} 页检查',
    hi: 'पठन दहलीज • पृष्ठ {page} चेकपॉइंट',
    ja: '読解テスト • {page} ページのチェック'
  },
  roadblock_subtitle: {
    tr: 'Sonraki Sayfa Geçişi', en: 'Next Page Transition', es: 'Transición a la siguiente página', fr: 'Transition vers la page suivante', de: 'Übergang zur nächsten Seite',
    it: 'Transizione alla pagina successiva', pt: 'Transição para a Próxima Página', ru: 'Переход к следующей странице', ar: 'انتقال الصفحة التالية', zh: '过渡到下一页', hi: 'अगla पृष्ठ संक्रमण', ja: '次のページへの切り替え'
  },
  roadblock_desc: {
    tr: 'Harika gidiyorsunuz! Bu sayfayı tamamladınız. Bir sonraki sayfaya geçmek ve yeni paragrafları okumak için bu bölüme ait 5 soruluk quizi çözmelisiniz. Eğer 15 soruyu hatasız cevaplarsanız 1 can kazanırsınız ama hata yaparsanız seri sıfırlanır.',
    en: 'You are doing great! You completed this page. To proceed to the next page and read new paragraphs, you must solve the 5-question quiz for this section. If you answer 15 questions without mistakes, you will earn 1 life, but if you make a mistake, your streak will reset.',
    es: '¡Vas muy bien! Completaste esta página. Para avanzar a la siguiente página y leer nuevos párrafos, debes resolver el cuestionario de 5 preguntas para esta sección. Si respondes 15 preguntas sin cometer errores ganarás 1 vida, pero si cometes un error, tu racha se reiniciará.',
    fr: 'Vous vous en sortez très bien ! Vous avez terminé cette page. Pour passer à la page suivante et lire de nouveaux paragraphes, vous devez résoudre le quiz de 5 questions pour cette section. Si vous répondez à 15 questions sans faire d\'erreur, vous gagnerez 1 vie, mais si vous faites une erreur, votre série sera réinitialisée.',
    de: 'Sie machen das großartig! Sie haben diese Seite abgeschlossen. Um zur nächsten Seite zu gelangen und neue Absätze zu lesen, müssen Sie das 5-Fragen-Quiz für diesen Abschnitt lösen. Wenn Sie 15 Fragen fehlerfrei beantworten, erhalten Sie 1 Leben, aber wenn Sie einen Fehler machen, wird Ihre Serie zurückgesetzt.',
    it: 'Stai andando alla grande! Hai completato questa pagina. Per passare alla pagina successiva e leggere nuovi paragrafi, devi risolvere il quiz di 5 domande per questa sezione. Se rispondi a 15 domande senza commettere errori guadagnerai 1 vita, ma se commetti un errore la serie verrà azzerata.',
    pt: 'Você está indo muito bem! Você completou esta página. Para prosseguir para a próxima página e ler novos parágrafos, você deve resolver o quiz de 5 perguntas desta seção. Se você responder a 15 perguntas sem cometer erros ganhará 1 vida, mas se cometer um erro a sequência será reiniciada.',
    ru: 'Вы отлично справляетесь! Вы закончили эту страницу. Чтобы перейти к следующей странице и продолжить чтение, вам необходимо пройти тест из 5 вопросов для этого раздела. Если вы ответите на 15 вопросов без ошибок, то получите 1 жизнь, но если совершите ошибку, ваша серия обнулится.',
    ar: 'عمل رائع! لقد أكملت هذه الصفحة. للمتابعة إلى الصفحة التالية وقراءة فقرات جديدة، يجب عليك حل الاختبار المكون من 5 أسئلة لهذا القسم. إذا أجبت على 15 سؤالاً دون أخطاء فستكسب حياة واحدة، ولكن إذا أخطأت فستتم إعادة تعيين النشاط.',
    zh: '您做得很好！您已完成此页面。要继续下一页并阅读新段落，您必须解决本节的 5 题测试。如果您无失误答对 15 道题，将获得 1 点生命值，但如果您犯了错误，连击将被重置。',
    hi: 'आप बहुत अच्छा कर रहे हैं! आपने यह पृष्ठ पूरा कर लिया है। अगले पृष्ठ पर जाने और नए पैराग्राफ पढ़ने के लिए, आपको इस खंड के 5-प्रश्नों के क्विज़ को हल करना होगा। यदि आप बिना किसी गलती के 15 प्रश्नों के सही उत्तर देते हैं, तो आपको 1 जीवन मिलेगा, लेकिन यदि आप कोई गलती करते हैं, तो सिलसिला रीसेट हो जाएगा।',
    ja: '素晴らしいです！このページを完了しました。次のページに進んで新しい段落を読むには、このセクションの5問のクイズを解く必要があります。ノーミスで15問回答するとライフ te 1獲得できますが、間違えると連続記録がリセットされます。'
  },
  roadblock_lives_infinite: {
    tr: 'Premium ile sınırsız cana sahipsiniz!', en: 'You have unlimited lives with Premium!', es: '¡Tienes vidas ilimitadas con Premium!', fr: 'Vous avez des vies illimitées avec Premium !', de: 'Sie haben unbegrenztes Leben mit Premium!',
    it: 'Hai vite illimitate con Premium!', pt: 'Você tem vidas ilimitadas com o Premium!', ru: 'С Премиум у вас бесконечные жизни!', ar: 'لديك أرواح غير محدودة مع بريميوم!', zh: '您拥有会员无限生命值！', hi: 'प्रीमियम के साथ आपके पास असीमित जीवन हैं!', ja: 'プレミアム会員はライフ無制限です！'
  },
  roadblock_lives_normal: {
    tr: 'Bilemediğiniz her soru 1 can azaltır.', en: 'Each incorrect question decreases 1 life.', es: 'Cada respuesta incorrecta reduce 1 vida.', fr: 'Chaque mauvaise réponse réduit 1 vie.', de: 'Jede falsche Frage verringert 1 Leben.',
    it: 'Ogni domanda errata riduce di 1 vita.', pt: 'Cada resposta errada diminui 1 vida.', ru: 'Каждый неверный ответ отнимает 1 жизнь.', ar: 'كل سؤال غير صحيح يقلل حياة واحدة.', zh: '每个错误的答案会减少1点生命值。', hi: 'प्रत्येक गलत उत्तर 1 जीवन कम करता है।', ja: '間違えるごとにライフが1減少します。'
  },
  roadblock_btn_solve: {
    tr: 'Sonraki Sayfa (Quizi Çöz)', en: 'Next Page (Solve Quiz)', es: 'Siguiente página (Resolver cuestionario)', fr: 'Page suivante (Résoudre le quiz)', de: 'Nächste Seite (Quiz lösen)',
    it: 'Pagina successiva (Risolvi quiz)', pt: 'Próxima Página (Resolver Quiz)', ru: 'Дальше (Пройти квиз)', ar: 'الصفحة التالية (حل الاختبار)', zh: '下一页（解开测试）', hi: 'अगला पृष्ठ (क्विज़ हल करें)', ja: '次のページ（クイズを解く）'
  },
  roadblock_btn_skip: {
    tr: 'Quizi Atla (Premium)', en: 'Skip Quiz (Premium)', es: 'Saltar cuestionario (Premium)', fr: 'Passer le quiz (Premium)', de: 'Quiz überspringen (Premium)',
    it: 'Salta quiz (Premium)', pt: 'Pular Quiz (Premium)', ru: 'Пропустить квиз (Премиум)', ar: 'تخطي الاختبار (بريميوم)', zh: '跳过测试（会员特权）', hi: 'क्विज़ छोड़ें (प्रीमियम)', ja: 'クイズをスキップ（プレミアム）'
  },

  // Out of lives
  out_of_lives_title: {
    tr: 'Canınız Kalmadı!', en: 'Out of Lives!', es: '¡Te quedaste sin vidas!', fr: 'Plus de vies !', de: 'Keine Leben mehr!',
    it: 'Vite esaurite!', pt: 'Sem vidas!', ru: 'Закончились жизни!', ar: 'نفدت الأرواح!', zh: '生命值耗尽！', hi: 'जीवन समाप्त!', ja: 'ライフがなくなりました！'
  },
  out_of_lives_desc: {
    tr: 'Okumaya devam etmek için canlarınızın zamanla dolmasını bekleyebilir veya Premium üyeliğe geçerek canınızı anında fulleyebilirsiniz!',
    en: 'You can wait for your lives to refill over time to continue reading, or you can purchase Premium membership to refill your lives instantly!',
    es: '¡Puedes esperar a que tus vidas se recarguen con el tiempo para seguir leyendo, o puedes comprar una membresía Premium para recargar tus vidas al instante!',
    fr: 'Vous pouvez attendre que vos vies se rechargent au fil du temps pour continuer à lire, ou vous pouvez acheter un abonnement Premium pour recharger vos vies instantanément !',
    de: 'Sie können warten, bis sich Ihre Leben mit der Zeit wieder auffüllen, um weiterzulesen, oder Sie können eine Premium-Mitgliedschaft erwerben, um Ihre Leben sofort wieder aufzufüllen!',
    it: 'Puoi attendere che le tue vite si ricarichino nel tempo per continuare a leggere, oppure puoi acquistare l\'abbonamento Premium per ricaricarle all\'istante!',
    pt: 'Você pode esperar que suas vidas recarreguem com o tempo para continuar lendo, ou pode adquirir a assinatura Premium para recarregar suas vidas instantaneamente!',
    ru: 'Вы можете подождать, пока жизни восстановятся сами, чтобы продолжить чтение, или приобрести Премиум-подписку, чтобы мгновенно восполнить жизни!',
    ar: 'يمكنك الانتظار حتى تمتلئ أرواحك بمرور الوقت لمواصلة القراءة، أو يمكنك شراء عضوية بريميوم لملء أرواحك على الفور!',
    zh: '您可以等待生命值随着时间推移而自动恢复以继续阅读，也可以购买会员服务来立即充满生命值！',
    hi: 'पढ़ना जारी रखने के लिए आप समय के साथ अपने जीवन के फिर से भरने की प्रतीक्षा कर सकते हैं, या आप तुरंत अपने जीवन को भरने के लिए प्रीमियम सदस्यता खरीद सकते हैं!',
    ja: '時間経過でライフが回復するのを待って読書を続けるか、プレミアム会員に登録して即座にライフを満タンにすることができます！'
  },
  out_of_lives_btn: {
    tr: 'Canları Fulle (Premium Üyelik)', en: 'Refill Lives (Premium Membership)', es: 'Recargar vidas (Membresía Premium)', fr: 'Recharger les vies (Abonnement Premium)', de: 'Leben auffüllen (Premium-Mitgliedschaft)',
    it: 'Ricarica vite (Abbonamento Premium)', pt: 'Recarregar Vidas (Assinatura Premium)', ru: 'Восполнить жизни (Премиум-подписка)', ar: 'ملء الأرواح (عضوية بريميوم)', zh: '充满生命值（会员服务）', hi: 'जीवन फिर से भरें (प्रीमियम सदस्यता)', ja: 'ライフを満タンにする（プレミアム会員）'
  },

  // Active Checkpoint Quiz Card
  quiz_title: {
    tr: 'BARAJ SORUSU {index} / 5',
    en: 'CHECKPOINT QUESTION {index} / 5',
    es: 'PREGUNTA DE CONTROL {index} / 5',
    fr: 'QUESTION DE CONTRÔLE {index} / 5',
    de: 'KONTROLLFRAGE {index} / 5',
    it: 'DOMANDA DI CONTROLLO {index} / 5',
    pt: 'PERGUNTA DE CONTROLE {index} / 5',
    ru: 'ВОПРОС ПРОВЕРКИ {index} / 5',
    ar: 'سؤال الحاجز {index} / 5',
    zh: '检查站问题 {index} / 5',
    hi: 'चेकपॉइंट प्रश्न {index} / 5',
    ja: 'チェックポイント問題 {index} / 5'
  },
  quiz_fill_blank_prompt: {
    tr: 'Cümledeki boşluğu doldurun.', en: 'Fill in the blank in the sentence.', es: 'Completa el espacio en blanco de la oración.', fr: 'Remplissez le vide dans la phrase.', de: 'Füllen Sie die Lücke im Satz aus.',
    it: 'Riempi lo spazio vuoto nella frase.', pt: 'Preencha a lacuna na frase.', ru: 'Заполните пропуск в предложении.', ar: 'املأ الفراغ في الجملة.', zh: '填写句子中的空白。', hi: 'वाक्य में रिक्त स्थान भरें।', ja: '文の空欄を埋めてください。'
  },
  quiz_meaning_prompt: {
    tr: 'kelimesinin anlamı nedir?', en: 'what does it mean?', es: '¿qué significa?', fr: 'que signifie-t-il ?', de: 'was bedeutet das?',
    it: 'cosa significa?', pt: 'o que significa?', ru: 'что это означает?', ar: 'ماذا تعني؟', zh: '是什么意思？', hi: 'इसका क्या अर्थ है?', ja: 'の意味は何ですか？'
  },
  quiz_translation_prompt: {
    tr: 'kelimesinin İngilizce karşılığı nedir?', en: 'what is the English equivalent?', es: '¿cuál es el equivalente en inglés?', fr: 'quel is l\'équivalent en anglais ?', de: 'was ist die englische Entsprechung?',
    it: 'qual è l\'equivalente in inglese?', pt: 'qual é o equivalente em inglês?', ru: 'каков эквивалент на английском?', ar: 'ما هو المقابل باللغة الإنجليزية؟', zh: '的英文对应词是什么？', hi: 'इसका अंग्रेजी समकक्ष क्या है?', ja: 'の英語での表現は何ですか？'
  },
  quiz_hint_prefix: {
    tr: 'İpucu: ', en: 'Hint: ', es: 'Pista: ', fr: 'Indice : ', de: 'Hinweis: ',
    it: 'Suggerimento: ', pt: 'Dica: ', ru: 'Подсказка: ', ar: 'تلميح: ', zh: '提示：', hi: 'सुझाव: ', ja: 'ヒント: '
  },
  quiz_explanation_prefix: {
    tr: 'Açıklama: ', en: 'Explanation: ', es: 'Explicación: ', fr: 'Explication : ', de: 'Erklärung: ',
    it: 'Spiegazione: ', pt: 'Explicação: ', ru: 'Объяснение: ', ar: 'الشرح: ', zh: '解析：', hi: 'स्पष्टीकरण: ', ja: '解説: '
  },
  quiz_loading: {
    tr: 'Quiz Soruları Hazırlanıyor...', en: 'Preparing Quiz Questions...', es: 'Preparando preguntas del cuestionario...', fr: 'Préparation des questions du quiz...', de: 'Quizfragen werden vorbereitet...',
    it: 'Preparazione delle domande del quiz...', pt: 'Preparando Perguntas do Quiz...', ru: 'Подготовка вопросов квиза...', ar: 'جاري تحضير أسئلة الاختبار...', zh: '正在准备测试问题...', hi: 'क्виज़ प्रश्न तैयार किए जा रहे हैं...', ja: 'クイズ問題を作成中...'
  },
  quiz_timer: {
    tr: 'Kalan Süre: {time} saniye', en: 'Time Left: {time} seconds', es: 'Tiempo restante: {time} segundos', fr: 'Temps restant : {time} secondes', de: 'Verbleibende Zeit: {time} Sekunden',
    it: 'Tempo rimasto: {time} secondi', pt: 'Tempo restante: {time} segundos', ru: 'Осталось времени: {time} сек.', ar: 'الوقت المتبقي: {time} ثواني', zh: '剩余时间：{time} 秒', hi: 'समय बचा: {time} सेकंड', ja: '残り時間: {time} 秒'
  },
  translating_sentence: {
    tr: 'Cümle çeviriliyor...', en: 'Translating sentence...', es: 'Traduciendo frase...', fr: 'Traduction de la phrase...', de: 'Satz wird übersetzt...',
    it: 'Traduzione della frase...', pt: 'Traduzindo frase...', ru: 'Перевод предложения...', ar: 'جاري ترجمة الجملة...', zh: '正在 ترجمة الجملة...', hi: 'वाक्य का अनुवाद किया जा रहा है...', ja: '文を翻訳中...'
  },
  welcome_back: {
    tr: 'Tekrar Hoş Geldin,', en: 'Welcome Back,', es: 'Bienvenido de nuevo,', fr: 'Bon retour,', de: 'Willkommen zurück,',
    it: 'Bentornato,', pt: 'Bem-vindo de volta,', ru: 'С возвращением,', ar: 'مرحباً بعودتك،', zh: '欢迎回来，', hi: 'वापसी पर स्वागत है,', ja: 'おかえりなさい、'
  },
  default_reader_name: {
    tr: 'Okur', en: 'Reader', es: 'Lector', fr: 'Lecteur', de: 'Leser',
    it: 'Lettore', pt: 'Leitor', ru: 'Читатель', ar: 'قارئ', zh: '读者', hi: 'पाठक', ja: '読者'
  },
  playstore_card_title: {
    tr: 'Uygulamamızı Beğendiniz mi?',
    en: 'Do you like our app?',
    es: '¿Te gusta nuestra aplicación?',
    fr: 'Aimez-vous notre application ?',
    de: 'Gefällt dir unsere App?',
    it: 'Ti piace la nostra applicazione?',
    pt: 'Gosta do nosso aplicativo?',
    ru: 'Вам нравится наше приложение?',
    ar: 'هل أعجبك تطبيقنا؟',
    zh: '你喜欢我们的应用吗？',
    hi: 'क्या आपको हमारा ऐप पसंद आया?',
    ja: '私たちのアプリは気に入りましたか？'
  },
  playstore_card_desc: {
    tr: 'Play Store\'da bizi puanlayıp yorum yaparak destek olabilirsiniz! Görüşleriniz bizim için çok değerlidir.',
    en: 'You can support us by rating and reviewing on Play Store! Your feedback is very valuable to us.',
    es: '¡Puedes apoyarnos calificando y reseñando en Play Store! Tu opinión es muy valiosa para nosotros.',
    fr: 'Vous pouvez nous soutenir en nous évaluant et en laissant un commentaire sur le Play Store ! Votre avis est très précieux.',
    de: 'Du kannst uns unterstützen, indem du uns im Play Store bewertest und rezensierst! Dein Feedback ist uns sehr wichtig.',
    it: 'Puoi supportarci valutando e recensendo l\'app su Play Store! Il tuo feedback è molto prezioso per noi.',
    pt: 'Você pode nos apoiar avaliando e comentando na Play Store! Seu feedback é muito valioso para nós.',
    ru: 'Вы можете поддержать нас, оценив и оставив отзыв в Play Store! Ваш отзыв очень важен для нас.',
    ar: 'يمكنك دعمنا من خلال تقييمنا وكتابة مراجعة على Play Store! آرائكم تهمنا كثيراً.',
    zh: '您可以在 Play Store 上给我们评分和撰写评论来支持我们！您的反馈对我们非常宝贵。',
    hi: 'आप Play Store पर हमें रेटिंग और समीक्षा देकर हमारा समर्थन कर सकते हैं! आपकी प्रतिक्रिया हमारे लिए बहुत मूल्यवान है।',
    ja: 'Play Storeで評価やレビューを書いて、私たちをサポートしてください！皆様のフィードバックは非常に貴重です。'
  },
  btn_rate_review: {
    tr: 'Puanla ve Yorum Yap',
    en: 'Rate & Review',
    es: 'Calificar y reseñar',
    fr: 'Évaluer et commenter',
    de: 'Bewerten & Rezensieren',
    it: 'Valuta e recensisci',
    pt: 'Avaliar e comentar',
    ru: 'Оценить и написать отзыв',
    ar: 'التقييم والمراجعة',
    zh: '评分与评论',
    hi: 'रेटिंग और समीक्षा करें',
    ja: '評価とレビュー'
  },
  ready_to_read: {
    tr: 'Bugün ne okumak istersin?', en: 'What would you like to read today?', es: '¿Qué te gustaría leer hoy?', fr: "Que voudriez-vous lire aujourd'hui ?", de: 'Was möchtest du heute lesen?',
    it: 'Cosa vorresti leggere oggi?', pt: 'O que você gostaria de ler hoje?', ru: 'Что бы вы хотели почитать сегодня?', ar: 'ماذا تحب أن تقرأ اليوم؟', zh: '今天你想读点什么？', hi: 'आज आप क्या पढ़ना चाहेंगे?', ja: '今日は何を読みますか？'
  },
  select_language: {
    tr: 'Dil Seçimi', en: 'Language Selection', es: 'Selección de idioma', fr: 'Choix de la langue', de: 'Sprachauswahl',
    it: 'Selezione della lingua', pt: 'Seleção de idioma', ru: 'Выбор языка', ar: 'اختيار اللغة', zh: '选择语言', hi: 'भाषा चयन', ja: '言語選択'
  },
  quiz_type_fill_blank: {
    tr: 'CÜMLE DOLDURMA (CLOZE)', en: 'FILL IN THE BLANK (CLOZE)', es: 'COMPLETAR EL ESPACIO (CLOZE)', fr: 'REMPLIR LE VIDE (CLOZE)', de: 'SATZ VERVOLLSTÄNDIGEN (CLOZE)',
    it: 'RIEMPI LO SPAZIO (CLOZE)', pt: 'PREENCHER A LACUNA (CLOZE)', ru: 'ЗАПОЛНИТЬ ПРОПУСК (CLOZE)', ar: 'املأ الفراغ (CLOZE)', zh: '填空 (CLOZE)', hi: 'रिक्त स्थान भरें (CLOZE)', ja: '空欄を埋める (CLOZE)'
  },
  difficulty_label: {
    tr: 'Zorluk', en: 'Difficulty', es: 'Dificultad', fr: 'Difficulté', de: 'Schwierigkeit',
    it: 'Difficoltà', pt: 'Dificuldade', ru: 'Сложность', ar: 'الصعوبة', zh: '难度', hi: 'कठिनाई', ja: '難易度'
  },
  quiz_incorrect_explanation: {
    tr: 'YANLIŞ CEVAP İPUCU & AÇIKLAMASI', en: 'INCORRECT ANSWER HINT & EXPLANATION', es: 'PISTA Y EXPLICACIÓN DE RESPUESTA INCORRECTA', fr: 'INDICE & EXPLICATION DE RÉPONSE INCORRECTE', de: 'HINWEIS & ERKLÄRUNG ZUR FALSCHEN ANTWORT',
    it: 'SUGGERIMENTO E SPIEGAZIONE DELLA RISPOSTA ERRATA', pt: 'DICA E EXPLICAÇÃO DE RESPOSTA INCORRETA', ru: 'ПОДСКАЗКА И ОБЪЯСНЕНИЕ НЕВЕРНОГО ОТВЕТА', ar: 'تلميح وشرح الإجابة الخاطئة', zh: '错误答案提示与解析', hi: 'गलत उत्तर का संकेत और स्पष्टीकरण', ja: '不正解のヒントと解説'
  },
  quiz_question_count: {
    tr: 'SORU {index} / {total}', en: 'QUESTION {index} / {total}', es: 'PREGUNTA {index} / {total}', fr: 'QUESTION {index} / {total}', de: 'FRAGE {index} / {total}',
    it: 'DOMANDA {index} / {total}', pt: 'PERGUNTA {index} / {total}', ru: 'ВОПРОС {index} / {total}', ar: 'السؤال {index} / {total}', zh: '问题 {index} / {total}', hi: 'प्रश्न {index} / {total}', ja: '質問 {index} / {total}'
  },
  quiz_next_question: {
    tr: 'Sonraki Soruya Geç', en: 'Next Question', es: 'Siguiente pregunta', fr: 'Question suivante', de: 'Nächste Frage',
    it: 'Prossima domanda', pt: 'Próxima pergunta', ru: 'Следующий вопрос', ar: 'السؤال التالي', zh: '下一题', hi: 'अगला प्रश्न', ja: '次の問題へ'
  },
  quiz_min_words_required: {
    tr: 'Kelime Dağarcığı pratik testlerini çözebilmek için en az 3 adet isim/özel isim olmayan kelime kaydetmiş olmanız gerekmektedir. Şu anda geçerli kelime sayınız: {current} (Toplam: {total})',
    en: 'To solve Vocabulary practice tests, you must have saved at least 3 non-proper name words. Your current valid word count: {current} (Total: {total})',
    es: 'Para resolver las pruebas de práctica de vocabulario, debes haber guardado al menos 3 palabras que no sean nombres propios. Tu cantidad actual de palabras válidas: {current} (Total: {total})',
    fr: "Pour résoudre les tests pratiques de vocabulaire, vous devez avoir enregistré au moins 3 mots qui ne sont pas des noms propres. Votre nombre actuel de mots valides : {current} (Total : {total})",
    de: 'Um Vokabeltests zu lösen, müssen Sie mindestens 3 Wörter gespeichert haben, die keine Eigennamen sind. Ihre aktuelle Anzahl gültiger Wörter: {current} (Gesamt: {total})',
    it: 'Per risolvere i test di vocabolario, devi aver salvato almeno 3 parole che non siano nomi propri. Il tuo numero attuale di parole valide: {current} (Totale: {total})',
    pt: 'Para resolver os testes de prática de vocabulário, você deve ter salvo pelo menos 3 palavras que não sejam nomes próprios. Seu número atual de palavras válidas: {current} (Total: {total})',
    ru: 'Чтобы проходить тесты словарного запаса, у вас должно быть сохранено не менее 3 слов (за исключением имен собственных). Ваше текущее количество подходящих слов: {current} (Всего: {total})',
    ar: 'لحل اختبارات مفردات اللغة التدريبية، يجب أن تكون قد حفظت 3 كلمات على الأقل ليست أسماء علم. عدد كلماتك الصالحة حالياً: {current} (الإجمالي: {total})',
    zh: '要进行词汇练习测试，您必须保存至少3个非专有名词。您当前有效的单词数：{current}（总计：{total}）',
    hi: 'शब्दावली अभ्यास परीक्षणों को हल करने के लिए, आपके पास कम से कम 3 गैर-व्यक्तिवाचक संज्ञा शब्द सहेजे होने चाहिए। आपकी वर्तमान मान्य शब्द संख्या: {current} (कुल: {total})',
    ja: '語彙練習テストを解くには、固有名詞ではない単語を少なくとも3語保存している必要があります。現在の有効な単語数: {current}（合計: {total}）'
  },
  btn_go_to_library: {
    tr: 'Kütüphaneye Git', en: 'Go to Library', es: 'Ir a la biblioteca', fr: 'Aller à la bibliothèque', de: 'Zur Bibliothek gehen',
    it: 'Vai alla biblioteca', pt: 'Ir para a biblioteca', ru: 'В библиотеку', ar: 'الذهاب إلى المكتبة', zh: '前往图书馆', hi: 'पुस्तकालय जाएं', ja: '図書館へ行く'
  },
  quiz_completed_title: {
    tr: 'Harika! Testi Tamamladın! 🎉', en: 'Great! You Completed the Test! 🎉', es: '¡Genial! ¡Completaste la prueba! 🎉', fr: 'Super ! Vous avez terminé le test ! 🎉', de: 'Großartig! Du hast den Test abgeschlossen! 🎉',
    it: 'Fantastico! Hai completato il test! 🎉', pt: 'Incrível! Você completou o teste! 🎉', ru: 'Отлично! Вы завершили тест! 🎉', ar: 'رائع! لقد أكملت الاختبار! 🎉', zh: '太棒了！你完成了测试！🎉', hi: 'बहुत बढ़िया! आपने परीक्षण पूरा कर लिया! 🎉', ja: '素晴らしい！テストを完了しました！🎉'
  },
  quiz_completed_desc: {
    tr: 'Kelime dağarcığı pekiştirme testini başarıyla bitirdiniz. İlerledikçe yeni rozetler açılmaya devam edecektir.',
    en: 'You have successfully completed the vocabulary reinforcement test. New badges will continue to unlock as you progress.',
    es: 'Has completado con éxito la prueba de refuerzo de vocabulario. Se seguirán desbloqueando nuevas insignias a medida que progreses.',
    fr: 'Vous avez terminé avec succès le test de renforcement du vocabulaire. De nouveaux badges continueront à se débloquer au fur et à mesure de votre progression.',
    de: 'Sie haben den Vokabeltest erfolgreich abgeschlossen. Mit fortschreitendem Erfolg werden weitere Abzeichen freigeschaltet.',
    it: 'Hai completato con successo il test di consolidamento del vocabolario. Nuovi badge continueranno a essere sbloccati mentre avanzi.',
    pt: 'Você concluiu com sucesso o teste de reforço de vocabulário. Novos selos continuarão sendo desbloqueados conforme você avança.',
    ru: 'Вы успешно прошли тест на закрепление словарного запаса. Новые значки будут открываться по мере прохождения.',
    ar: 'لقد أكملت بنجاح اختبار تعزيز المفردات. ستستمر الشارات الجديدة في فتح القفل مع تقدمك.',
    zh: '您已成功完成词汇巩固测试。随着您的进步，新的徽章将继续解锁。',
    hi: 'आपने शब्दावली सुदृढीकरण परीक्षण सफलतापूर्वक पूरा कर लिया है। जैसे-se आप आगे बढ़ेंगे, नए बैज अनलॉक होते रहेंगे।',
    ja: '語彙定着テストを正常に完了しました。進むにつれて新しいバッジがアンロックされ続けます。'
  },
  quiz_success_rate: {
    tr: 'BAŞARI ORANI', en: 'SUCCESS RATE', es: 'TASA DE ÉXITO', fr: 'TAUX DE RÉUSSITE', de: 'ERFOLGSQUOTE',
    it: 'TASSO DI SUCESSO', pt: 'TAXA DE SUCESSO', ru: 'УСПЕШНОСТЬ', ar: 'نسبة النجاح', zh: '成功率', hi: 'सफलता दर', ja: '正解率'
  },
  quiz_back_to_words: {
    tr: 'Kelime Odasına Geri Dön', en: 'Back to Vocabulary Room', es: 'Volver a la sala de vocabulario', fr: 'Retour à la salle de vocabulaire', de: 'Zurück zum Vokabelraum',
    it: 'Torna alla stanza dei vocaboli', pt: 'Voltar para a sala de vocabulário', ru: 'Назад в комнату слов', ar: 'العودة إلى غرفة الكلمات', zh: '返回词汇空间', hi: 'शब्दावली कक्ष में वापस जाएं', ja: '単語ルームに戻る'
  },
  back_to_library: {
    tr: 'Kitaplığa Geri Dön', en: 'Back to Library', es: 'Volver a la biblioteca', fr: 'Retour à la bibliothèque', de: 'Zurück zur Bibliothek',
    it: 'Torna alla biblioteca', pt: 'Voltar para a biblioteca', ru: 'Назад в библиотеку', ar: 'العودة إلى المكتبة', zh: '返回图书馆', hi: 'पुस्तकालय में वापस जाएं', ja: '図書館に戻る'
  },
  quiz_explanation_fill_blank: {
    tr: '"{word}" kelimesi "{translation}" anlamına gelir. Cümle: "{sentence}"',
    en: '"{word}" means "{translation}". Sentence: "{sentence}"',
    es: '"{word}" significa "{translation}". Frase: "{sentence}"',
    fr: '"{word}" signifie "{translation}". Phrase : "{sentence}"',
    de: '"{word}" bedeutet "{translation}". Satz: "{sentence}"',
    it: '"{word}" significa "{translation}". Frase: "{sentence}"',
    pt: '"{word}" significa "{translation}". Frase: "{sentence}"',
    ru: '"{word}" означает "{translation}". Предложение: "{sentence}"',
    ar: '"{word}" تعني "{translation}". الجملة: "{sentence}"',
    zh: '"{word}" 的意思是 "{translation}"。句子："{sentence}"',
    hi: '"{word}" का अर्थ "{translation}" है। वाक्य: "{sentence}"',
    ja: '「{word}」は「{translation}」を意味します。例文: 「{sentence}」'
  },
  quiz_hint_level: {
    tr: 'İpucu: Bu kelime {level} seviyesindedir.',
    en: 'Hint: This word is at {level} level.',
    es: 'Pista: Esta palabra está en el nivel {level}.',
    fr: 'Indice : Ce mot est de niveau {level}.',
    de: 'Hinweis: Dieses Wort ist auf dem Niveau {level}.',
    it: 'Suggerimento: Questa parola è al livello {level}.',
    pt: 'Dica: Esta palavra está no nível {level}.',
    ru: 'Подсказка: Это слово уровня {level}.',
    ar: 'تلميح: هذه الكلمة في المستوى {level}.',
    zh: '提示：这个单词是 {level} 级别的。',
    hi: 'सुझाव: यह शब्द {level} स्तर का है।',
    ja: 'ヒント: この単語はレベル {level} です。'
  },
  quiz_explanation_tr_to_en: {
    tr: '"{translation}" kelimesinin İngilizce karşılığı "{word}" şeklindedir.',
    en: 'The English equivalent of "{translation}" is "{word}".',
    es: 'El equivalente en inglés de "{translation}" es "{word}".',
    fr: 'L\'equivalent en anglais de "{translation}" es "{word}".',
    de: 'Die englische Entsprechung für "{translation}" ist "{word}".',
    it: 'L\'equivalente in inglese di "{translation}" è "{word}".',
    pt: 'O equivalente em inglês de "{translation}" es "{word}".',
    ru: 'Английский эквивалент слова "{translation}" — "{word}".',
    ar: 'المقابل باللغة الإنجليزية لـ "{translation}" هو "{word}".',
    zh: '"{translation}" 的英文对应词是 "{word}"。',
    hi: '"{translation}" का अंग्रेजी समकक्ष "{word}" है।',
    ja: '「{translation}」に相当する英語は「{word}」です。'
  },
  quiz_explanation_en_to_tr: {
    tr: '"{word}" kelimesinin anlamı "{translation}" şeklindedir.',
    en: 'The meaning of "{word}" is "{translation}".',
    es: 'El significado of "{word}" es "{translation}".',
    fr: 'La signification de "{word}" est "{translation}".',
    de: 'Die Bedeutung von "{word}" ist "{translation}".',
    it: 'Il significato di "{word}" è "{translation}".',
    pt: 'O significado de "{word}" é "{translation}".',
    ru: 'Значение слова "{word}" — "{translation}".',
    ar: 'معنى "{word}" هو "{translation}".',
    zh: '"{word}" 的意思是 "{translation}"。',
    hi: '"{word}" का अर्थ "{translation}" है।',
    ja: '「{word}」の意味は「{translation}」です。'
  },
  english: {
    tr: 'İngilizce', en: 'English', es: 'Inglés', fr: 'Anglais', de: 'Englisch',
    it: 'Inglese', pt: 'Inglês', ru: 'Английский', ar: 'الإنجليزية', zh: '英语', hi: 'अंग्रेज़ी', ja: '英語'
  },
  translation: {
    tr: 'Türkçe Çevirisi', en: 'Translation', es: 'Traducción', fr: 'Traduction', de: 'Übersetzung',
    it: 'Traduzione', pt: 'Tradução', ru: 'Перевод', ar: 'الترجمة', zh: '翻译', hi: 'अनुवाद', ja: '翻訳'
  },
  // Additional Vocabulary Tab & Game Translations
  btn_close: {
    tr: 'Kapat', en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen',
    it: 'Chiudi', pt: 'Fechar', ru: 'Закрыть', ar: 'إغلاق', zh: '关闭', hi: 'बंद करें', ja: '閉じる'
  },
  words_count_suffix: {
    tr: 'KELİME', en: 'WORDS', es: 'PALABRAS', fr: 'MOTS', de: 'WÖRTER',
    it: 'PAROLE', pt: 'PALAVRAS', ru: 'СЛОВ', ar: 'كلمات', zh: '单词', hi: 'शब्द', ja: '単語'
  },
  no_records: {
    tr: 'Kayıt Yok', en: 'No Saved Words', es: 'Sin palabras', fr: 'Aucun mot', de: 'Keine Wörter',
    it: 'Nessuna parola', pt: 'Sem palavras', ru: 'Нет слов', ar: 'لا يوجد كلمات', zh: '暂无单词', hi: 'कोई शब्द नहीं', ja: '単語なし'
  },
  btn_practice_start: {
    tr: 'Pratiğe Başla', en: 'Start Practice', es: 'Comenzar práctica', fr: 'Pratiquer', de: 'Üben starten',
    it: 'Inizia pratica', pt: 'Iniciar Prática', ru: 'Начать практику', ar: 'ابدأ التدريب', zh: '开始练习', hi: 'अभ्यास शुरू करें', ja: '練習を開始'
  },
  btn_practice_add_first: {
    tr: 'Önce Kelime Ekle', en: 'Add Words First', es: 'Añade palabras primero', fr: "Ajouter des mots d'abord", de: 'Zuerst Wörter hinzufügen',
    it: 'Aggiungi parole prima', pt: 'Adicione palavras primeiro', ru: 'Сначала добавьте слова', ar: 'أضف كلمات أولاً', zh: '请先添加单词', hi: 'पहले शब्द जोड़ें', ja: '先に単語を追加'
  },
  practice_desc_saved: {
    tr: 'Kitap okurken kaydettiğin özel kelimelerle kelime dağarcığını pekiştir.',
    en: 'Reinforce your vocabulary with special words you saved while reading books.',
    es: 'Refuerza tu vocabulario con las palabras especiales que guardaste al leer libros.',
    fr: 'Renforcez votre vocabulaire avec les mots spéciaux enregistrés lors de vos lectures.',
    de: 'Festigen Sie Ihren Wortschatz mit den Wörtern, die Sie beim Lesen gespeichert haben.',
    it: 'Rafforza il tuo vocabolario con le parole speciali salvate mentre leggevi.',
    pt: 'Reforce seu vocabulário com as palavras especiais que você salvou ao ler livros.',
    ru: 'Закрепляйте словарный запас с помощью слов, сохраненных во время чтения.',
    ar: 'عزز مفرداتك بالكلمات الخاصة التي حفظتها أثناء قراءة الكتب.',
    zh: '通过阅读书籍时保存的专属单词来巩固您的词汇量。',
    hi: 'किताबें पढ़ते समय आपके द्वारा सहेजे गए विशेष शब्दों से अपनी शब्दावली को मजबूत करें।',
    ja: '本を読んでいるときに保存した特別な単語で語彙力を強化しましょう。'
  },
  practice_desc_random: {
    tr: 'Seviyene göre otomatik seçilen kelimelerle pratik yap.',
    en: 'Practice with words automatically selected according to your level.',
    es: 'Practica con palabras seleccionadas automáticamente según tu nivel.',
    fr: 'Pratiquez avec des mots sélectionnés automatiquement selon votre niveau.',
    de: 'Üben Sie mit Wörtern, die automatisch nach Ihrem Niveau ausgewählt werden.',
    it: 'Pratica con parole selezionate automaticamente in base al tuo livello.',
    pt: 'Pratique com palavras selecionadas automaticamente de acordo com seu nível.',
    ru: 'Практикуйтесь со словами, выбранными автоматически по вашему уровню.',
    ar: 'تدرب على كلمات مختارة تلقائيًا وفقًا لمستواك.',
    zh: '根据您的水平自动选择单词进行练习。',
    hi: 'अपने स्तर के अनुसार स्वचालित रूप से चुने गए शब्दों के साथ अभ्यास करें।',
    ja: 'レベルに応じて自動的に選択された単語で練習します。'
  },
  random_practice_title: {
    tr: 'Rastgele Pratik', en: 'Random Practice', es: 'Práctica aleatoria', fr: 'Pratique aléatoire', de: 'Zufälliges Üben',
    it: 'Pratica casuale', pt: 'Prática Aleatória', ru: 'Случайная практика', ar: 'تدريب عشوائي', zh: '随机练习', hi: 'यादृच्छिक अभ्यास', ja: 'ランダム練習'
  },
  game_match_desc: {
    tr: 'Zorluk seç, 10 İngilizce kelimeyi Türkçe anlamlarıyla eşleştir!',
    en: 'Choose difficulty, match 10 English words with their meanings!',
    es: '¡Elige la dificultad y empareja 10 palabras en inglés con sus significados!',
    fr: 'Choisissez la difficulté, associez 10 mots anglais avec leurs significations !',
    de: 'Wählen Sie den Schwierigkeitsgrad, ordnen Sie 10 englische Wörter ihren Bedeutungen zu!',
    it: 'Scegli la difficoltà, abbina 10 parole inglesi con i loro significati!',
    pt: 'Escolha a dificuldade e associe 10 palavras em inglês aos seus significados!',
    ru: 'Выберите сложность, сопоставьте 10 английских слов с их значениями!',
    ar: 'اختر الصعوبة، وطابق 10 كلمات إنجليزية بمعانيها!',
    zh: '选择难度，将10个英文单词与其释义配对！',
    hi: 'कठिनाई चुनें, 10 अंग्रेजी शब्दों को उनके अर्थों से मिलाएं!',
    ja: '難易度を選択し、10個の英単語とその意味をマッチングさせましょう！'
  },
  game_fill_desc: {
    tr: 'Zorluk seç, cümledeki boşluğa doğru kelimeyi bul!',
    en: 'Choose difficulty, find the correct word for the blank in the sentence!',
    es: '¡Elige la dificultad y encuentra la palabra correcta para el espacio en la oración!',
    fr: 'Choisissez la difficulté, trouvez le mot correct pour remplir le vide dans la phrase !',
    de: 'Wählen Sie den Schwierigkeitsgrad, finden Sie das richtige Wort für die Lücke im Satz!',
    it: 'Scegli la difficoltà, trova la parola corretta per lo spazio nella frase!',
    pt: 'Escolha a dificuldade, encontre a palavra correta para o espaço na frase!',
    ru: 'Выберите сложность, найдите правильное слово для пропуска в предложении!',
    ar: 'اختر الصعوبة، وجد الكلمة المناسبة للفراغ في الجملة!',
    zh: '选择难度，找出句子中填空的正确单词！',
    hi: 'कठिनाई चुनें, वाक्य में रिक्त स्थान के लिए सही शब्द खोजें!',
    ja: '難易度を選択し、文の空欄に当てはまる正しい単語を見つけましょう！'
  },
  play_game_btn: {
    tr: 'Oynamaya Başla', en: 'Start Playing', es: 'Empezar a jugar', fr: 'Jouer', de: 'Spielen',
    it: 'Gioca', pt: 'Jogar', ru: 'Играть', ar: 'ابدأ اللعب', zh: '开始游戏', hi: 'खेलना शुरू करें', ja: 'ゲームを開始'
  },
  search_saved_placeholder: {
    tr: 'Kaydettiğin kelimelerde ara...', en: 'Search in saved words...', es: 'Buscar en palabras guardadas...', fr: 'Rechercher dans les mots enregistrés...', de: 'In gespeicherten Wörtern suchen...',
    it: 'Cerca tra le parole salvate...', pt: 'Buscar em palavras salvas...', ru: 'Поиск по сохраненным словам...', ar: 'البحث في الكلمات المحفوظة...', zh: '在保存的单词中搜索...', hi: 'सहेजे गए शब्दों में खोजें...', ja: '保存した単語から検索...'
  },
  difficulty_easy_label: {
    tr: 'Kolay Mod', en: 'Easy Mode', es: 'Modo fácil', fr: 'Mode facile', de: 'Leichter Modus',
    it: 'Modalità facile', pt: 'Modo Fácil', ru: 'Легкий режим', ar: 'الوضع السهل', zh: '简单模式', hi: 'आसान मोड', ja: '簡単モード'
  },
  difficulty_medium_label: {
    tr: 'Orta Mod', en: 'Orta Mod', es: 'Modo medio', fr: 'Mode moyen', de: 'Mittlerer Modus',
    it: 'Modalità media', pt: 'Modo Médio', ru: 'Средний режим', ar: 'الوضع المتوسط', zh: '中等模式', hi: 'मध्यम मोड', ja: '普通モード'
  },
  difficulty_hard_label: {
    tr: 'Zor Mod', en: 'Hard Mode', es: 'Modo difícil', fr: 'Mode difficile', de: 'Schwerer Modus',
    it: 'Modalità difficile', pt: 'Modo Difícil', ru: 'Сложный режим', ar: 'الوضع الصعب', zh: '困难模式', hi: 'कठिन मोड', ja: '難関モード'
  },
  game_select_diff_prompt: {
    tr: 'Oynamak için bir zorluk seviyesi seç', en: 'Choose a difficulty level to play', es: 'Elige un nivel de dificultad para jugar', fr: 'Choisissez un niveau de difficulté pour jouer', de: 'Wählen Sie einen Schwierigkeitsgrad zum Spielen',
    it: 'Scegli un livello di difficoltà per giocare', pt: 'Escolha um nível de dificuldade para jogar', ru: 'Выберите уровень сложности для игры', ar: 'اختر مستوى الصعوبة للعب', zh: '选择难度等级开始游戏', hi: 'खेलने के लिए एक कठिनाई स्तर चुनें', ja: 'プレイする難易度を選択してください'
  },
  game_match_en_label: {
    tr: '🇬🇧 İngilizce', en: '🇬🇧 English', es: '🇬🇧 English', fr: '🇬🇧 Anglais', de: '🇬🇧 Englisch',
    it: '🇬🇧 Inglese', pt: '🇬🇧 Inglês', ru: '🇬🇧 Английский', ar: '🇬🇧 الإنجليزية', zh: '🇬🇧 英语', hi: '🇬🇧 अंग्रेजी', ja: '🇬🇧 英語'
  },
  game_match_tr_label: {
    tr: 'Anlamı', en: 'Meaning', es: 'Significado', fr: 'Signification', de: 'Bedeutung',
    it: 'Significato', pt: 'Significado', ru: 'Значение', ar: 'المعنى', zh: '释义', hi: 'अर्थ', ja: '意味'
  },
  game_match_title: {
    tr: 'Eş Bulma', en: 'Match Pairs', es: 'Emparejar palabras', fr: 'Trouver les paires', de: 'Paare finden',
    it: 'Trova le coppie', pt: 'Encontrar Pares', ru: 'Найди пару', ar: 'مطابقة الأزواج', zh: '连线配对', hi: 'जोड़े मिलाएं', ja: 'ペアマッチング'
  },
  game_match_subtitle: {
    tr: 'Zorluk seç, kelimeleri eşleştir', en: 'Choose difficulty, match words', es: 'Elige dificultad, empareja palabras', fr: 'Choisissez la difficulté, associez les mots', de: 'Schwierigkeitsgrad wählen, Wörter zuordnen',
    it: 'Scegli la difficoltà, abbina le parole', pt: 'Escolha a dificuldade, associe as palavras', ru: 'Выберите сложность, сопоставляйте слова', ar: 'اختر الصعوبة، وطابق الكلمات', zh: '选择难度，配对单词', hi: 'कठिनाई चुनें, शब्द मिलाएं', ja: '難易度を選択し、単語をマッチング'
  },
  game_fill_title: {
    tr: 'Boşluk Doldurmaca', en: 'Fill in the Blanks', es: 'Completar espacios', fr: 'Texte à trous', de: 'Lückentext',
    it: 'Riempi gli spazi', pt: 'Preencher as Lacunas', ru: 'Заполнить пропуски', ar: 'املأ الفراغات', zh: '填空游戏', hi: 'रिक्त स्थान भरें', ja: '穴埋め問題'
  },
  game_fill_subtitle: {
    tr: 'Zorluk seç, cümleyi tamamla', en: 'Choose difficulty, complete the sentence', es: 'Elige dificultad, completa la oración', fr: 'Choisissez la difficulté, complétez la phrase', de: 'Schwierigkeitsgrad wählen, Satz vervollständigen',
    it: 'Scegli la difficoltà, completa la frase', pt: 'Escolha a dificuldade, complete a frase', ru: 'Выберите сложность, заполните предложение', ar: 'اختر الصعوبة، وأكمل الجملة', zh: '选择难度，完成句子', hi: 'कठिनाई चुनें, वाक्य पूरा करें', ja: '難易度を選択し、文を完成'
  },
  game_new_game: {
    tr: 'Yeni Oyun', en: 'New Game', es: 'Nuevo juego', fr: 'Nouveau jeu', de: 'Neues Spiel',
    it: 'Nuovo gioco', pt: 'Novo Jogo', ru: 'Новая игра', ar: 'لعبة جديدة', zh: '新游戏', hi: 'नया खेल', ja: '新しいゲーム'
  },
  game_completed_awesome: {
    tr: 'Harika!', en: 'Awesome!', es: '¡Genial!', fr: 'Génial !', de: 'Großartig!',
    it: 'Fantastico!', pt: 'Incrível!', ru: 'Отлично!', ar: 'رائع!', zh: '太棒了！', hi: 'बहुत बढ़िया!', ja: '素晴らしい！'
  },
  game_completed_good: {
    tr: 'İyi İş!', en: 'Good Job!', es: '¡Buen trabajo!', fr: 'Beau travail !', de: 'Gute Arbeit!',
    it: 'Bel lavoro!', pt: 'Bom Trabalho!', ru: 'Хорошая работа!', ar: 'عمل جيد!', zh: '做得好！', hi: 'अच्छा काम!', ja: 'よくできました！'
  },
  game_completed_keep: {
    tr: 'Devam Et!', en: 'Keep Going!', es: '¡Sigue así!', fr: 'Continuez !', de: 'Weiter so!',
    it: 'Continua così!', pt: 'Continue!', ru: 'Продолжай в том же духе!', ar: 'واصل التقدم!', zh: '继续加油！', hi: 'आगे बढ़ते रहो!', ja: 'その調子！'
  },
  game_completed_stats: {
    tr: '{total} sorudan {count} tanesini doğru yanıtladın',
    en: 'you answered {count} out of {total} questions correctly',
    es: 'respondiste correctamente {count} de {total} preguntas',
    fr: 'vous avez répondu correctement à {count} questions sur {total}',
    de: 'Sie haben {count} von {total} Fragen richtig beantwortet',
    it: 'hai risposto correttamente a {count} domande su {total}',
    pt: 'você respondeu corretamente a {count} de {total} perguntas',
    ru: 'вы правильно ответили на {count} из {total} вопросов',
    ar: 'لقد أجبت بشكل صحيح على {count} من أصل {total} أسئلة',
    zh: '您在 {total} 道题中答对了 {count} 道',
    hi: 'आपने {total} में से {count} प्रश्नों के सही उत्तर दिए हैं',
    ja: '合計 {total} 問中 {count} 問正解しました'
  },
  game_correct_feedback: {
    tr: '✓ Doğru! Harika iş çıkardın.', en: '✓ Correct! Great job.', es: '✓ ¡Correcto! Gran trabajo.', fr: '✓ Correct ! Bon travail.', de: '✓ Richtig! Gute Arbeit.',
    it: '✓ Corretto! Ottimo lavoro.', pt: '✓ Correto! Bom trabalho.', ru: '✓ Правильно! Отличная работа.', ar: '✓ صحيح! عمل رائع.', zh: '✓ 正确！做得好。', hi: '✓ सही! बहुत बढ़िया।', ja: '✓ 正解！素晴らしい。'
  },
  game_incorrect_feedback: {
    tr: '✗ Yanlış. Doğru cevap: "{answer}"',
    en: '✗ Incorrect. Correct answer: "{answer}"',
    es: '✗ Incorrecto. Respuesta correcta: "{answer}"',
    fr: '✗ Incorrect. Réponse correcte : "{answer}"',
    de: '✗ Falsch. Richtige Antwort: "{answer}"',
    it: '✗ Errato. Risposta corretta: "{answer}"',
    pt: '✗ Incorreto. Resposta correta: "{answer}"',
    ru: '✗ Неправильно. Правильный ответ: "{answer}"',
    ar: '✗ خاطئ. الإجابة الصحيحة هي: "{answer}"',
    zh: '✗ 错误。正确答案："{answer}"',
    hi: '✗ गलत। सही उत्तर: "{answer}"',
    ja: '✗ 不正解。正解は「{answer}」です。'
  },
  game_next_question: {
    tr: 'Sonraki Soru', en: 'Next Question', es: 'Siguiente pregunta', fr: 'Question suivante', de: 'Nächste Frage',
    it: 'Prossima domanda', pt: 'Próxima Pergunta', ru: 'Следующий вопрос', ar: 'السؤال التالي', zh: '下一题', hi: 'अगला प्रश्न', ja: '次の問題'
  },
  game_see_results: {
    tr: 'Sonuçları Gör', en: 'See Results', es: 'Ver resultados', fr: 'Voir les résultats', de: 'Ergebnisse sehen',
    it: 'Vedi i risultati', pt: 'Ver Resultados', ru: 'Посмотреть результаты', ar: 'عرض النتائج', zh: '查看结果', hi: 'परिणाम देखें', ja: '結果を表示'
  },
  game_play_again: {
    tr: 'Tekrar Oyna', en: 'Play Again', es: 'Jugar de nuevo', fr: 'Rejouer', de: 'Nochmal spielen',
    it: 'Gioca ancora', pt: 'Jogar Novamente', ru: 'Играть снова', ar: 'اللعب مجدداً', zh: '再玩一次', hi: 'फिर से खेलें', ja: 'もう一度プレイ'
  },
  game_match_mistakes: {
    tr: 'hata yaptın', en: 'mistakes made', es: 'errores cometidos', fr: 'erreurs commises', de: 'Fehler gemacht',
    it: 'errori commessi', pt: 'erros cometidos', ru: 'ошибок совершено', ar: 'أخطاء ارتكبت', zh: '犯错次数', hi: 'गलतियां कीं', ja: 'お手つき'
  },
  game_match_perfect: {
    tr: 'Hiç hata yapmadan geçtin! ⭐', en: 'You passed without any mistakes! ⭐', es: '¡Pasaste sin cometer errores! ⭐', fr: 'Vous avez réussi sans aucune erreur ! ⭐', de: 'Sie haben ohne Fehler bestanden! ⭐',
    it: 'Hai superato senza commettere errori! ⭐', pt: 'Você passou sem cometer erros! ⭐', ru: 'Вы прошли без единой ошибки! ⭐', ar: 'لقد اجtزت دون ارتكاب أي أخطاء! ⭐', zh: '您没有犯错就通关了！⭐', hi: 'आपने बिना किसी गलती के पास किया! ⭐', ja: 'ノーミスでクリアしました！⭐'
  },
  game_match_completed_msg: {
    tr: 'Tüm {count} eşleştirmeyi tamamladın',
    en: 'You completed all {count} matches',
    es: 'Completaste las {count} parejas',
    fr: 'Vous avez complété les {count} paires',
    de: 'Sie haben alle {count} Paare vervollständigt',
    it: 'Hai completato tutte le {count} coppie',
    pt: 'Você completou todos os {count} pares',
    ru: 'Вы сопоставили все {count} пар',
    ar: 'لقد أكملت جميع الأزواج الـ {count}',
    zh: '您完成了所有 {count} 组配对',
    hi: 'आपने सभी {count} जोड़े पूरे किए',
    ja: 'すべての {count} ペアを完成させました'
  },
  game_words_in_this_game: {
    tr: 'Bu Oyundaki Kelimeler ({count})',
    en: 'Words in this game ({count})',
    es: 'Palabras en este juego ({count})',
    fr: 'Mots dans ce jeu ({count})',
    de: 'Wörter in diesem Spiel ({count})',
    it: 'Parole in questo gioco ({count})',
    pt: 'Palavras neste jogo ({count})',
    ru: 'Слова в этой игре ({count})',
    ar: 'الكلمات في هذه اللعبة ({count})',
    zh: '本局游戏中的单词 ({count})',
    hi: 'इस खेल में शब्द ({count})',
    ja: 'このゲームの単語 ({count})'
  },
  vocab_remove_tooltip: {
    tr: 'Kelimelerimden Kaldır',
    en: 'Remove from Vocabulary',
    es: 'Quitar de mi vocabulario',
    fr: 'Retirer de mon vocabulaire',
    de: 'Aus meinem Wortschatz entfernen',
    it: 'Rimuovi dal mio vocabolario',
    pt: 'Remover do meu vocabulário',
    ru: 'Удалить из моего словаря',
    ar: 'إزالة من مفرداتي',
    zh: '从我的生词本中移除',
    hi: 'मेरी शब्दावली से हटाएं',
    ja: '単語帳から削除'
  },
  vocab_add_tooltip: {
    tr: 'Kelimelerime Ekle',
    en: 'Add to Vocabulary',
    es: 'Añadir a mi vocabulario',
    fr: 'Ajouter à mon vocabulaire',
    de: 'In meinen Wortschatz aufnehmen',
    it: 'Aggiungi al mio vocabolario',
    pt: 'Adicionar ao meu vocabulário',
    ru: 'Добавить в мой словарь',
    ar: 'إضافة إلى مفرداتي',
    zh: '添加至我的生词本',
    hi: 'मेरी शब्दावली में जोड़ें',
    ja: '単語帳に追加'
  },
  vocab_note_prefix: {
    tr: 'Not: {note}',
    en: 'Note: {note}',
    es: 'Nota: {note}',
    fr: 'Note : {note}',
    de: 'Hinweis: {note}',
    it: 'Nota: {note}',
    pt: 'Nota: {note}',
    ru: 'Примечание: {note}',
    ar: 'ملاحظة: {note}',
    zh: '备注：{note}',
    hi: 'नोट: {note}',
    ja: 'メモ: {note}'
  },
  vocab_saved_from_story: {
    tr: 'Hikaye okumasından kaydedildi.', en: 'Saved from story reading.', es: 'Guardado de la lectura de historias.', fr: "Enregistré à partir de la lecture de l'histoire.", de: 'Aus der Geschichtenlesung gespeichert.',
    it: 'Salvato dalla lettura della storia.', pt: 'Salvo da leitura da história.', ru: 'Сохранено из чтения истории.', ar: 'تم الحفظ من قراءة القصة.', zh: '从故事阅读中保存。', hi: 'कहानी पढ़ने से सहेजा गया।', ja: 'ストーリーの閲覧から保存されました。'
  },
  vocab_saved_from_story_updated: {
    tr: 'Hikaye okumasından kaydedildi (Çeviri güncellendi).', en: 'Saved from story reading (Translation updated).', es: 'Guardado de la lectura de historias (Traducción actualizada).', fr: "Enregistré à partir de la lecture de l'histoire (Traduction mise à jour).", de: 'Aus der Geschichtenlesung gespeichert (Übersetzung aktualisiert).',
    it: 'Salvato dalla lettura della storia (Traduzione aggiornata).', pt: 'Salvo da leitura da história (Tradução atualizada).', ru: 'Сохранено из чтения истории (Перевод обновлен).', ar: 'تم الحفظ من قراءة القصة (تم تحديث الترجمة).', zh: '从故事阅读中保存（翻译已更新）。', hi: 'कहानी पढ़ने से सहेजा गया (अनुवाद अपडेट किया गया)।', ja: 'ストーリーの閲覧から保存されました（翻訳が更新されました）。'
  },
  fav_title: {
    tr: 'Beğendiğim Hikayeler', en: 'Favorite Stories', es: 'Historias favoritas', fr: 'Histoires favorites', de: 'Lieblingsgeschichten',
    it: 'Storie preferite', pt: 'Histórias Favoritas', ru: 'Любимые истории', ar: 'القصص المفضلة', zh: '最喜爱的故事', hi: 'पसंदीदा कहानियाँ', ja: 'お気に入り'
  },
  fav_total_count: {
    tr: 'Toplam {count} Eser', en: 'Total {count} Books', es: 'Total {count} libros', fr: 'Total {count} livres', de: 'Insgesamt {count} Bücher',
    it: 'Totale {count} libri', pt: 'Total {count} livros', ru: 'Всего {count} книг', ar: 'إجمالي {count} كتاب', zh: '共 {count} 本书', hi: 'कुल {count} पुस्तकें', ja: '合計 {count} 冊'
  },
  fav_empty_title: {
    tr: 'Henüz Favori Hikayeniz Yok', en: 'No Favorite Stories Yet', es: 'Aún no hay historias favoritas', fr: "Pas encore d'histoires favorites", de: 'Noch keine Lieblingsgeschichten',
    it: 'Ancora nessuna storia preferita', pt: 'Nenhuma História Favorita Ainda', ru: 'Пока нет любимых историй', ar: 'لا توجد قصص مفضلة بعد', zh: '暂无喜爱的故事', hi: 'अभी तक कोई पसंदीदा कहानी नहीं है', ja: 'お気に入りのストーリーはまだありません'
  },
  fav_empty_desc: {
    tr: 'Kitaplıktaki hikayelerin köşesinde bulunan yıldız butonuna tıklayarak beğendiğiniz eserleri bu sayfaya ekleyebilirsiniz.',
    en: 'You can add the stories you like to this page by clicking the star button in the corner of the stories in the library.',
    es: 'Puedes añadir las historias que te gusten a esta página haciendo clic en el botón de estrella en la esquina de las historias de la biblioteca.',
    fr: 'Vous pouvez ajouter les histoires que vous aimez à cette page en cliquant sur le bouton étoile dans le coin des histoires de la bibliothèque.',
    de: 'Sie können die Geschichten, die Ihnen gefallen, zu dieser Seite hinzufügen, indem Sie auf die Sternschaltfläche in der Ecke der Geschichten in der Bibliothek klicken.',
    it: 'Puoi aggiungere le storie che ti piacciono a questa pagina facendo clic sul pulsante a stella nell\'angolo delle storie nella biblioteca.',
    pt: 'Você pode adicionar as histórias de que gosta a esta página clicando no botão de estrela no canto das histórias na biblioteca.',
    ru: 'Вы можете добавить понравившиеся истории на эту страницу, нажав на кнопку со звездочкой в углу истории в библиотеке.',
    ar: 'يمكنك إضافة القصص التي تعجبك إلى هذه الصفحة بالنقر فوق زر النجمة في زاوية القصص بالمكتبة.',
    zh: '您可以通过点击图书馆中故事角落的星星按钮，将您喜爱的故事添加到此页面。',
    hi: 'आप पुस्तकालय में कहानियों के कोने में स्टार बटन पर क्लिक करके अपनी पसंद की कहानियों को इस पृष्ठ पर जोड़ सकते हैं।',
    ja: '図書館のストーリーの隅にある星ボタンをクリックして、お気に入りのストーリーをこのページに追加できます。'
  },
  fav_explore_btn: {
    tr: 'Kitaplığı Keşfet', en: 'Explore Library', es: 'Explorar biblioteca', fr: 'Explorer la bibliothèque', de: 'Bibliothek erkunden',
    it: 'Esplora la biblioteca', pt: 'Explorar Biblioteca', ru: 'Исследовать библиотеку', ar: 'استكشاف المكتبة', zh: '探索图书馆', hi: 'पुस्तकालय का पता लगाएं', ja: '図書館を探索する'
  },
  fav_remove_tooltip: {
    tr: 'Favorilerden Çıkar', en: 'Remove from Favorites', es: 'Quitar de favoritos', fr: 'Retirer des favoris', de: 'Aus Favoriten entfernen',
    it: 'Rimuovi dai preferiti', pt: 'Remover dos Favoritos', ru: 'Удалить из избранного', ar: 'إزالة من المفضلة', zh: '从收藏夹中移除', hi: 'पसंदीदा से हटाएं', ja: 'お気に入りから削除'
  },
  completed_status: {
    tr: 'TAMAMLANDI', en: 'COMPLETED', es: 'COMPLETADO', fr: 'TERMINÉ', de: 'ABGESCHLOSSEN',
    it: 'COMPLETATO', pt: 'CONCLUÍDO', ru: 'ПРОЧИТАНО', ar: 'تمت القراءة', zh: '已完成', hi: 'पूर्ण', ja: '読了'
  },
  pages_count: {
    tr: '{count} Sayfa', en: '{count} Pages', es: '{count} Páginas', fr: '{count} Pages', de: '{count} Seiten',
    it: '{count} Pagine', pt: '{count} Páginas', ru: '{count} страниц', ar: '{count} صفحات', zh: '{count} 页', hi: '{count} पृष्ठ', ja: '{count} ページ'
  },
  quiz_type_tr_to_en: {
    tr: 'TÜRKÇE -> İNGİLİZCE ÇEVİRİ', en: 'NATIVE -> ENGLISH TRANSLATION', es: 'TRADUCCIÓN AL INGLÉS', fr: 'TRADUCTION EN ANGLAIS', de: 'ENGLISCHÜBERSETZUNG',
    it: 'TRADUZIONE IN INGLESE', pt: 'TRADUÇÃO PARA INGLÊS', ru: 'ПЕРЕВОД НА АНГЛИЙСКИЙ', ar: 'الترجمة إلى الإنجليزية', zh: '翻译成英文', hi: 'अंग्रेजी अनुवाद', ja: '英語への翻訳'
  },
  quiz_type_en_to_tr: {
    tr: 'İNGİLİZCE -> TÜRKÇE ANLAM', en: 'ENGLISH -> NATIVE MEANING', es: 'SIGNIFICADO EN ESPAÑOL', fr: 'SIGNIFICATION EN FRANÇAIS', de: 'ENGLISCH -> BEDEUTUNG',
    it: 'SIGNIFICATO IN ITALIANO', pt: 'SIGNIFICADO EM PORTUGUÊS', ru: 'ЗНАЧЕНИЕ НА РОДНОМ ЯЗЫКЕ', ar: 'المعنى باللغة الأصلية', zh: '英文 -> 母语释义', hi: 'अंग्रेजी -> स्थानीय अर्थ', ja: '英語 -> 母国語での意味'
  },
  quiz_header_random: {
    tr: 'RASTGELE PRATİK ({level})', en: 'RANDOM PRACTICE ({level})', es: 'PRÁCTICA ALEATORIA ({level})', fr: 'PRATIQUE ALÉATOIRE ({level})', de: 'ZUFÄLLIGES ÜBEN ({level})',
    it: 'PRATICA CASUALE ({level})', pt: 'PRÁTICA ALEATÓRIA ({level})', ru: 'СЛУЧАЙНАЯ ПРАКТИКА ({level})', ar: 'تدريب عشوائي ({level})', zh: '随机练习 ({level})', hi: 'यादृच्छिक अभ्यास ({level})', ja: 'ランダム練習 ({level})'
  },
  quiz_header_saved: {
    tr: 'KELİMELERİMLE PRATİK', en: 'PRACTICE MY WORDS', es: 'PRÁCTICA CON MIS PALABRAS', fr: 'PRATIQUE DE MES MOTS', de: 'MEINE WÖRTER ÜBEN',
    it: 'PRATICA CON LE MIE PAROLE', pt: 'PRATICAR MINHAS PALAVRAS', ru: 'ПРАКТИКА МОИХ СЛОВ', ar: 'تدريب على كلماتي', zh: '我的单词练习', hi: 'मेरे शब्दों का अभ्यास', ja: '保存した単語の練習'
  },
  quiz_end_btn: {
    tr: 'TESTİ BİTİR', en: 'END TEST', es: 'TERMINAR PRUEBA', fr: 'TERMINER LE TEST', de: 'TEST BEENDEN',
    it: 'TERMINA TEST', pt: 'TERMINAR TESTE', ru: 'ЗАВЕРШИТЬ ТЕСТ', ar: 'إنهاء الاختبار', zh: '结束测试', hi: 'परीक्षण समाप्त करें', ja: 'テストを終了'
  },
  quiz_insufficient_vocab: {
    tr: 'Yetersiz Kelime Dağarcığı! 📚', en: 'Insufficient Vocabulary! 📚', es: '¡Vocabulario insuficiente! 📚', fr: 'Vocabulaire insuffisant ! 📚', de: 'Unzureichender Wortschatz! 📚',
    it: 'Vocabolario insufficiente! 📚', pt: 'Vocabulário Insuficiente! 📚', ru: 'Недостаточный словарный запас! 📚', ar: 'مفردات غير كافية! 📚', zh: '词汇量不足！📚', hi: 'अपर्याप्त शब्दावली! 📚', ja: '語彙数が不足しています！📚'
  },
  quiz_learning_note: {
    tr: 'Öğrenim Notu:', en: 'Learning Note:', es: 'Nota de aprendizaje:', fr: "Note d'apprentissage :", de: 'Lernhinweis:',
    it: 'Nota di apprendimento:', pt: 'Nota de Aprendizado:', ru: 'Учебная заметка:', ar: 'ملاحظة تعليمية:', zh: '学习笔记：', hi: 'अध्ययन नोट:', ja: '学習メモ:'
  },
  quiz_difficulty_level: {
    tr: 'Quiz Zorluk Seviyesi', en: 'Quiz Difficulty Level', es: 'Nivel de dificultad del cuestionario', fr: 'Niveau de difficulté du quiz', de: 'Schwierigkeitsgrad des Quizzes',
    it: 'Livello di difficoltà del quiz', pt: 'Nível de Dificuldade do Quiz', ru: 'Уровень сложности квиза', ar: 'مستوى صعوبة الاختبار', zh: '测试难度等级', hi: 'क्विज़ कठिनाई स्तर', ja: 'クイズ難易度'
  },
  difficulty_easy: {
    tr: 'Kolay (A1-A2)', en: 'Easy (A1-A2)', es: 'Fácil (A1-A2)', fr: 'Facile (A1-A2)', de: 'Einfach (A1-A2)',
    it: 'Facile (A1-A2)', pt: 'Fácil (A1-A2)', ru: 'Легко (A1-A2)', ar: 'سهل (A1-A2)', zh: '简单 (A1-A2)', hi: 'आसान (A1-A2)', ja: '初級 (A1-A2)'
  },
  difficulty_medium: {
    tr: 'Orta (B1-B2)', en: 'Medium (B1-B2)', es: 'Medio (B1-B2)', fr: 'Moyen (B1-B2)', de: 'Mittel (B1-B2)',
    it: 'Medio (B1-B2)', pt: 'Médio (B1-B2)', ru: 'Средне (B1-B2)', ar: 'متوسط (B1-B2)', zh: '中等 (B1-B2)', hi: 'मध्यम (B1-B2)', ja: '中級 (B1-B2)'
  },
  difficulty_hard: {
    tr: 'Zor (C1)', en: 'Hard (C1)', es: 'Difícil (C1)', fr: 'Difficile (C1)', de: 'Schwer (C1)',
    it: 'Difficile (C1)', pt: 'Difícil (C1)', ru: 'Сложно (C1)', ar: 'صعب (C1)', zh: '困难 (C1)', hi: 'कठिन (C1)', ja: '上級 (C1)'
  },
  toast_difficulty_changed: {
    tr: 'Zorluk seviyesi değiştirildi: {level} 🎉', en: 'Difficulty level changed to: {level} 🎉', es: 'Nivel de dificultad cambiado a: {level} 🎉', fr: 'Niveau de difficulté changé pour : {level} 🎉', de: 'Schwierigkeitsgrad geändert auf: {level} 🎉',
    it: 'Livello di difficoltà modificato in: {level} 🎉', pt: 'Nível de dificuldade alterado para: {level} 🎉', ru: 'Уровень сложности изменен на: {level} 🎉', ar: 'تم تغيير مستوى الصعوبة إلى: {level} 🎉', zh: '难度等级已更改为：{level} 🎉', hi: 'कठिनाई स्तर बदलकर {level} किया गया 🎉', ja: '難易度が変更されました: {level} 🎉'
  },
  daily_goals_title: {
    tr: 'Günlük Hedefler', en: 'Daily Goals', es: 'Objetivos Diarios', fr: 'Objectifs Quotidiens', de: 'Tägliche Ziele',
    it: 'Obiettivi Giornalieri', pt: 'Metas Diárias', ru: 'Ежедневные цели', ar: 'الأهداف اليومية', zh: '每日目标', hi: 'दैनिक लक्ष्य', ja: 'デイリー目標'
  },
  daily_goals_reset: {
    tr: 'Günlük Sıfırlanır', en: 'Resets Daily', es: 'Se reinicia diariamente', fr: 'Réinitialisation quotidienne', de: 'Täglich zurückgesetzt',
    it: 'Si azzera ogni giorno', pt: 'Redefine Diariamente', ru: 'Сбрасывается ежедневно', ar: 'تصفير يومي', zh: '每日重置', hi: 'दैनिक रीसेट', ja: '毎日リセット'
  },
  daily_goals_desc: {
    tr: 'Her gün düzenli okuma ve pratik yaparak günlük hedeflerini tamamla, İngilizce öğrenimini alışkanlık haline getir!',
    en: 'Complete your daily goals by reading and practicing regularly every day, make learning English a habit!',
    es: '¡Completa tus objetivos diarios leyendo y practicando regularmente todos los días, haz del aprendizaje del inglés un hábito!',
    fr: 'Complétez vos objectifs quotidiens en lisant et en vous entraînant régulièrement chaque jour, faites de l\'apprentissage de l\'anglais une habitude !',
    de: 'Erreiche deine täglichen Ziele durch regelmäßiges Lesen und Üben jeden Tag. Mach das Englischlernen zur Gewohnheit!',
    it: 'Completa i tuoi obiettivi giornalieri leggendo e facendo pratica regolarmente ogni giorno, rendi l\'apprendimento dell\'inglese un\'abitudine!',
    pt: 'Complete suas metas diárias lendo e praticando regularmente todos os dias, torne o aprendizado de inglês um hábito!',
    ru: 'Выполняйте свои ежедневные цели, регулярно читая и практикуясь каждый день, сделайте изучение английского языка привычкой!',
    ar: 'أكمل أهدافك اليومية من خلال القراءة والممارسة بانتظام كل يوم، واجعل تعلم اللغة الإنجليزية عادة!',
    zh: '通过每天定期阅读和练习来完成您的每日目标，让学习英语成为一种习惯！',
    hi: 'हर दिन नियमित रूप से पढ़कर और अभ्यास करके अपने दैनिक लक्ष्यों को पूरा करें, अंग्रेजी सीखने को एक आदत बनाएं!',
    ja: '毎日定期的に読書と練習を行ってデイリー目標を達成し、英語学習を習慣にしましょう！'
  },
  daily_goal_time: {
    tr: 'Günlük Okuma Süresi', en: 'Daily Reading Time', es: 'Tiempo de Lectura Diario', fr: 'Temps de Lecture Quotidien', de: 'Tägliche Lesezeit',
    it: 'Tempo di Lettura Giornaliero', pt: 'Tempo de Leitura Diário', ru: 'Ежедневное время чтения', ar: 'وقت القراءة اليومي', zh: '每日阅读时间', hi: 'दैनिक पठन समय', ja: 'デイリー読書時間'
  },
  daily_goal_time_desc: {
    tr: 'Hikayelerde geçirdiğin aktif süre (Hedef: 20 dk).',
    en: 'Active time spent reading stories (Goal: 20 mins).',
    es: 'Tiempo activo dedicado a leer historias (Objetivo: 20 min).',
    fr: 'Temps actif passé à lire des histoires (Objectif : 20 min).',
    de: 'Aktive Lesezeit in den Geschichten (Ziel: 20 Min.).',
    it: 'Tempo attivo trascorso a leggere storie (Obiettivo: 20 min).',
    pt: 'Tempo ativo gasto lendo histórias (Meta: 20 min).',
    ru: 'Активное время, проведенное за чтением историй (Цель: 20 мин).',
    ar: 'الوقت الفعلي الذي تقضيه في قراءة القصص (الهدف: 20 دقيقة).',
    zh: '阅读故事的累计时间（目标：20分钟）。',
    hi: 'कहानियों को पढ़ने में बिताया गया सक्रिय समय (लक्ष्य: 20 मिनट)।',
    ja: 'ストーリーを読んでいるアクティブな時間（目標：20分）。'
  },
  daily_goal_words: {
    tr: 'Günlük Kelime Kaydı', en: 'Daily Vocabulary Saved', es: 'Vocabulario Diario Guardado', fr: 'Vocabulaire Quotidien Enregistré', de: 'Täglich gespeicherte Wörter',
    it: 'Vocaboli Giornalieri Salvati', pt: 'Vocabulário Diário Salvo', ru: 'Ежедневно сохраненные слова', ar: 'الكلمات المحفوظة يومياً', zh: '每日保存单词', hi: 'दैनिक सहेजे गए शब्द', ja: 'デイリー保存単語'
  },
  daily_goal_words_desc: {
    tr: 'Hikayelerden kaydettiğin yeni kelimeler (Hedef: 10).',
    en: 'New words saved from stories (Goal: 10).',
    es: 'Nuevas palabras guardadas de las historias (Objetivo: 10).',
    fr: 'Nouveaux mots enregistrés à partir des histoires (Objectif : 10).',
    de: 'Aus den Geschichten gespeicherte neue Wörter (Ziel: 10).',
    it: 'Nuovi vocaboli salvati dalle storie (Obiettivo: 10).',
    pt: 'Novas palavras salvas das histórias (Meta: 10).',
    ru: 'Новые слова, сохраненные из историй (Цель: 10).',
    ar: 'الكلمات الجديدة المحفوظة من القصص (الهدف: 10).',
    zh: '故事中保存的新单词（目标：10个）。',
    hi: 'कहानियों से सहेजे गए नए शब्द (लक्ष्य: 10)।',
    ja: 'ストーリーから保存した新しい単語（目標：10語）。'
  },
  daily_goal_unit_mins: {
    tr: '{count} dk', en: '{count} min', es: '{count} min', fr: '{count} min', de: '{count} Min.',
    it: '{count} min', pt: '{count} min', ru: '{count} мин.', ar: '{count} دقيقة', zh: '{count} 分钟', hi: '{count} मिनट', ja: '{count} 分'
  },
  daily_goal_unit_words: {
    tr: '{count} kelime', en: '{count} words', es: '{count} palabras', fr: '{count} mots', de: '{count} Wörter',
    it: '{count} parole', pt: '{count} palavras', ru: '{count} слов', ar: '{count} كلمة', zh: '{count} 单词', hi: '{count} शब्द', ja: '{count} 単語'
  },
  daily_goal_unit_quizzes: {
    tr: '{count} quiz', en: '{count} quizzes', es: '{count} cuestionarios', fr: '{count} quiz', de: '{count} Quizzes',
    it: '{count} quiz', pt: '{count} quizzes', ru: '{count} квизов', ar: '{count} اختبار', zh: '{count} 测试', hi: '{count} क्विज़', ja: '{count} クイズ'
  },
  daily_goal_unit_percent: {
    tr: '%{percent}', en: '{percent}%', es: '{percent}%', fr: '{percent} %', de: '{percent}%',
    it: '{percent}%', pt: '{percent}%', ru: '{percent}%', ar: '{percent}%', zh: '{percent}%', hi: '{percent}%', ja: '{percent}%'
  },
  daily_goal_quizzes: {
    tr: 'Günlük Sınav Başarısı', en: 'Daily Quiz Success', es: 'Éxito en Cuestionarios Diarios', fr: 'Réussite du Quiz Quotidien', de: 'Täglicher Quizerfolg',
    it: 'Successo nei Quiz Giornalieri', pt: 'Sucesso no Quiz Diário', ru: 'Ежедневный успех в квизах', ar: 'نجاح الاختبارات اليومية', zh: '每日测试表现', hi: 'दैनिक क्विज़ सफलता', ja: 'デイリークイズ成績'
  },
  daily_goal_quizzes_desc_locked: {
    tr: '5 quiz tamamlandığında başarı yüzdeniz hesaplanır.',
    en: 'Your success percentage is calculated when 5 quizzes are completed.',
    es: 'El porcentaje de éxito se calcula cuando se completan 5 cuestionarios.',
    fr: 'Votre pourcentage de réussite est calculé lorsque 5 quiz sont terminés.',
    de: 'Deine Erfolgsquote wird berechnet, sobald 5 Quizzes abgeschlossen sind.',
    it: 'La percentuale di successo viene calcolata al completamento di 5 quiz.',
    pt: 'Sua porcentagem de sucesso é calculada quando 5 quizzes são concluídos.',
    ru: 'Процент успеха рассчитывается после прохождения 5 квизов.',
    ar: 'يتم حساب نسبة نجاحك عند إكمال 5 اختبارات.',
    zh: '完成 5 个测试后将计算您的成功率。',
    hi: '5 क्विज़ पूरे होने पर आपकी सफलता का प्रतिशत निकाला जाता है।',
    ja: '5回のクイズを完了すると、正解率が計算されます。'
  },
  daily_goal_quizzes_desc_unlocked: {
    tr: 'Çözdüğün tüm quizlerin ortalama başarısı.',
    en: 'Average success rate of all solved quizzes.',
    es: 'Tasa de éxito promedio de todos los cuestionarios resueltos.',
    fr: 'Taux de réussite moyen de tous les quiz résolus.',
    de: 'Durchschnittliche Erfolgsquote aller gelösten Quizzes.',
    it: 'Tasso medio di successo di tutti i quiz risolti.',
    pt: 'Taxa média de sucesso de todos os quizzes resolvidos.',
    ru: 'Средний уровень успеха всех пройденных квизов.',
    ar: 'متوسط نسبة النجاح لجميع الاختبارات التي تم حلها.',
    zh: '所有已完成测试的平均成功率。',
    hi: 'हल किए गए सभी क्विज़ की औसत सफलता दर।',
    ja: '解答したすべてのクイズの平均正解率。'
  },
  daily_goal_success: {
    tr: 'Başarıldı! 🎉', en: 'Completed! 🎉', es: '¡Logrado! 🎉', fr: 'Réussi ! 🎉', de: 'Erreicht! 🎉',
    it: 'Raggiunto! 🎉', pt: 'Concluído! 🎉', ru: 'Выполнено! 🎉', ar: 'تم بنجاح! 🎉', zh: '已达成！ 🎉', hi: 'सफल! 🎉', ja: '達成！ 🎉'
  },
  daily_goal_in_progress: {
    tr: 'Devam Ediyor', en: 'In Progress', es: 'En progreso', fr: 'En cours', de: 'In Bearbeitung',
    it: 'In corso', pt: 'Em andamento', ru: 'В процессе', ar: 'قيد التقدم', zh: '进行中', hi: 'प्रगति पर है', ja: '進行中'
  },
  daily_goal_locked: {
    tr: 'Kilitli', en: 'Locked', es: 'Bloqueado', fr: 'Verrouillé', de: 'Gesperrt',
    it: 'Bloccato', pt: 'Bloqueado', ru: 'Заблокировано', ar: 'مغلق', zh: '未解锁', hi: 'किकित', ja: 'ロック中'
  },
  chart_unit_word: {
    tr: 'kelime', en: 'words', es: 'palabras', fr: 'mots', de: 'Wörter',
    it: 'parole', pt: 'palavras', ru: 'слов', ar: 'كلمات', zh: '单词', hi: 'शब्द', ja: '単語'
  },
  chart_unit_minute: {
    tr: 'dakika', en: 'minutes', es: 'minutos', fr: 'minutes', de: 'Minuten',
    it: 'minuti', pt: 'minutos', ru: 'минут', ar: 'دقائق', zh: '分钟', hi: 'मिनट', ja: '分'
  },
  chart_title_words: {
    tr: 'Öğrenilen Kelime', en: 'Words Learned', es: 'Palabras Aprendidas', fr: 'Mots Appris', de: 'Gelernte Wörter',
    it: 'Parole Apprese', pt: 'Palavras Aprendidas', ru: 'Изучено слов', ar: 'الكلمات المتعلمة', zh: '已学单词', hi: 'सीखे गए शब्द', ja: '学習した単語'
  },
  chart_title_minutes: {
    tr: 'Okuma Süresi', en: 'Reading Time', es: 'Tiempo de Lectura', fr: 'Temps de Lecture', de: 'Lesezeit',
    it: 'Tempo di Lettura', pt: 'Tempo de Leitura', ru: 'Время чтения', ar: 'وقت القراءة', zh: '阅读时间', hi: 'पठन समय', ja: '読書時間'
  },
  chart_summary: {
    tr: '{day} Günü Özeti {today}', en: 'Summary for {day} {today}', es: 'Resumen del {day} {today}', fr: 'Résumé du {day} {today}', de: 'Zusammenfassung für {day} {today}',
    it: 'Riepilogo del {day} {today}', pt: 'Resumo de {day} {today}', ru: 'Итоги за {day} {today}', ar: 'ملخص يوم {day} {today}', zh: '{day} 总结 {today}', hi: '{day} का सारांश {today}', ja: '{day}の概要 {today}'
  },
  chart_today: {
    tr: '(Bugün)', en: '(Today)', es: '(Hoy)', fr: '(Aujourd\'hui)', de: '(Heute)',
    it: '(Oggi)', pt: '(Hoje)', ru: '(Сегодня)', ar: '(اليوم)', zh: '(今天)', hi: '(आज)', ja: '(今日)'
  },
  chart_desc_success: {
    tr: 'Harika! O gün tam {val} {unit} tamamladın. 🚀',
    en: 'Great! You completed {val} {unit} that day. 🚀',
    es: '¡Genial! Completaste exactamente {val} {unit} ese día. 🚀',
    fr: 'Super ! Vous avez complété {val} {unit} ce jour-là. 🚀',
    de: 'Großartig! Du hast an diesem Tag {val} {unit} abgeschlossen. 🚀',
    it: 'Fantastico! Hai completato {val} {unit} quel giorno. 🚀',
    pt: 'Ótimo! Você completou {val} {unit} naquele dia. 🚀',
    ru: 'Отлично! В тот день вы выполнили {val} {unit}. 🚀',
    ar: 'رائع! لقد أكملت {val} {unit} في ذلك اليوم. 🚀',
    zh: '太棒了！那一天您完成了 {val} {unit}。 🚀',
    hi: 'बहुत बढ़िया! आपने उस दिन {val} {unit} पूरे किए। 🚀',
    ja: '素晴らしいです！この日は {val} {unit} の学習を完了しました。 🚀'
  },
  chart_desc_empty: {
    tr: 'O gün henüz {unit} kaydı bulunmuyor.',
    en: 'No {unit} records for that day yet.',
    es: 'Aún no hay registros de {unit} para ese día.',
    fr: 'Aucun enregistrement de {unit} pour ce jour-là.',
    de: 'Noch keine Einträge für {unit} an diesem Tag.',
    it: 'Nessun record di {unit} per quel giorno.',
    pt: 'Nenhum registro de {unit} para esse dia ainda.',
    ru: 'В этот день записей о {unit} пока нет.',
    ar: 'لا توجد سجلات {unit} لهذا اليوم بعد.',
    zh: '那一天还没有 {unit} 记录。',
    hi: 'उस दिन के लिए अभी तक कोई {unit} रिकॉर्ड नहीं है।',
    ja: 'この日の {unit} 記録はまだありません。'
  },
  badges_unlocked_count: {
    tr: '{unlocked} / {total} Açıldı', en: '{unlocked} / {total} Unlocked', es: '{unlocked} / {total} Desbloqueado', fr: '{unlocked} / {total} Déverrouillé', de: '{unlocked} / {total} Freigeschaltet',
    it: '{unlocked} / {total} Sbloccato', pt: '{unlocked} / {total} Desbloqueado', ru: 'Разблокировано: {unlocked} / {total}', ar: 'تم فتح {unlocked} / {total}', zh: '已解锁 {unlocked} / {total}', hi: '{unlocked} / {total} अनलॉक', ja: '{unlocked} / {total} 解鎖済み'
  },
  badge_status_locked: {
    tr: 'Kilitli', en: 'Locked', es: 'Bloqueado', fr: 'Verrouillé', de: 'Gesperrt',
    it: 'Bloccato', pt: 'Bloqueado', ru: 'Заблокировано', ar: 'مغلق', zh: '未解锁', hi: 'लॉक', ja: 'ロック中'
  },
  badge_status_unlocked: {
    tr: 'Açıldı', en: 'Unlocked', es: 'Desbloqueado', fr: 'Déverrouillé', de: 'Freigeschaltet',
    it: 'Sbloccato', pt: 'Desbloqueado', ru: 'Разблокировано', ar: 'مفتوح', zh: '已解锁', hi: 'अनलॉक', ja: '解鎖済み'
  },
  btn_cancel: {
    tr: 'Vazgeç', en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen',
    it: 'Annulla', pt: 'Cancelar', ru: 'Отмена', ar: 'إلغاء', zh: '取消', hi: 'रद्द करें', ja: 'キャンセル'
  },
  clear_search_tooltip: {
    tr: 'Aramayı Temizle', en: 'Clear Search', es: 'Borrar búsqueda', fr: 'Effacer la recherche', de: 'Suche löschen',
    it: 'Cancella ricerca', pt: 'Limpar pesquisa', ru: 'Очистить поиск', ar: 'مسح البحث', zh: '清除搜索', hi: 'खोज साफ़ करें', ja: '検索をクリア'
  },
  btn_remove: {
    tr: 'Çıkar', en: 'Remove', es: 'Quitar', fr: 'Retirer', de: 'Entfernen',
    it: 'Rimuovi', pt: 'Remover', ru: 'Удалить', ar: 'إزالة', zh: '移除', hi: 'हटाएं', ja: '削除'
  },
  confirm_remove_book_title: {
    tr: 'Kitabı Okunanlardan Çıkar', en: 'Remove Book from Reading List', es: 'Quitar libro de la lista de lectura', fr: 'Retirer le livre de la liste de lecture', de: 'Buch aus der Leseliste entfernen',
    it: 'Rimuovi libro dalla lista di lettura', pt: 'Remover livro da lista de leitura', ru: 'Удалить книгу из списка чтения', ar: 'إزالة الكتاب من قائمة القراءة', zh: '从阅读列表中移除书籍', hi: 'पठन सूची से पुस्तक हटाएं', ja: '読書リストから本を削除'
  },
  confirm_remove_book_desc: {
    tr: 'Bu kitabı okunanlar listenizden çıkarmak istediğinize emin misiniz?',
    en: 'Are you sure you want to remove this book from your reading list?',
    es: '¿Está seguro de que desea quitar este libro de su lista de lectura?',
    fr: 'Êtes-vous sûr de vouloir retirer ce livre de votre liste de lecture ?',
    de: 'Bist du sicher, dass du dieses Buch aus deiner Leseliste entfernen möchtest?',
    it: 'Sei sicuro di voler rimuovere questo libro dalla tua lista di lettura?',
    pt: 'Tem certeza de que deseja remover este livro da sua lista de leitura?',
    ru: 'Вы уверены, что хотите удалить эту книгу из своего списка чтения?',
    ar: 'هل أنت متأكد أنك تريد إزالة هذا الكتاب من قائمة القراءة الخاصة بك؟',
    zh: '您确定要将这本书从您的阅读列表中移除吗？',
    hi: 'क्या आप वाकई इस पुस्तक को अपनी पठन सूची से हटाना चाहते हैं?',
    ja: 'この本を読書リストから削除してもよろしいですか？'
  },
  remove_from_reading_tooltip: {
    tr: 'Okunanlar listesinden çıkar', en: 'Remove from reading list', es: 'Quitar de la lista de lectura', fr: 'Retirer de la liste de lecture', de: 'Aus der Leseliste entfernen',
    it: 'Rimuovi dalla lista di lettura', pt: 'Remover da lista de leitura', ru: 'Удалить из списка чтения', ar: 'إزالة من قائمة القراءة', zh: '从阅读列表中移除', hi: 'पठन सूची से हटाएं', ja: '読書リストから削除'
  },
  btn_yes_remove: {
    tr: 'Evet, Çıkar', en: 'Yes, Remove', es: 'Sí, quitar', fr: 'Oui, retirer', de: 'Ja, entfernen',
    it: 'Sì, rimuovi', pt: 'Sim, remover', ru: 'Да, удалить', ar: 'نعم, أزل', zh: '是的，移除', hi: 'हाँ, हटाएं', ja: 'はい、削除します'
  },
  exit_app_title: {
    tr: 'Uygulamadan Çık', en: 'Exit App', es: 'Salir de la aplicación', fr: "Quitter l'application", de: 'App beenden',
    it: "Esci dall'app", pt: 'Sair do aplicativo', ru: 'Выйти из приложения', ar: 'الخروج من التطبيق', zh: '退出应用', hi: 'ऐप से बाहर निकलें', ja: 'アプリを終了'
  },
  exit_app_desc: {
    tr: 'Uygulamadan çıkmak istediğinize emin misiniz?', en: 'Are you sure you want to exit the app?', es: '¿Está seguro de que desea salir de la aplicación?', fr: "Êtes-vous sûr de vouloir quitter l'application ?", de: 'Bist du sicher, dass du die App beenden möchtest?',
    it: "Sei sicuro di voler uscire dall'app?", pt: 'Tem certeza de que deseja sair do aplicativo?', ru: 'Вы уверены, что хотите выйти из приложения?', ar: 'هل أنت متأكد أنك تريد الخروج من التطبيق؟', zh: '您确定要退出应用吗？', hi: 'क्या आप वाकई ऐप से बाहर निकलना चाहते हैं?', ja: 'アプリを終了してもよろしいですか？'
  },
  btn_no: {
    tr: 'Hayır', en: 'No', es: 'No', fr: 'Non', de: 'Nein',
    it: 'No', pt: 'Não', ru: 'Нет', ar: 'لا', zh: '否', hi: 'नहीं', ja: 'いいえ'
  },
  btn_yes_exit: {
    tr: 'Evet, Çık', en: 'Yes, Exit', es: 'Sí, salir', fr: 'Oui, quitter', de: 'Ja, beenden',
    it: 'Sì, esci', pt: 'Sim, sair', ru: 'Да, выйти', ar: 'نعم، اخرج', zh: '是的，退出', hi: 'हाँ, बाहर निकलें', ja: 'はい、終了します'
  },
  sub_payment_error: {
    tr: 'Ödeme sırasında bir hata oluştu.', en: 'An error occurred during payment.', es: 'Ocurrió un error durante el pago.', fr: 'Une erreur est survenue lors du paiement.', de: 'Während des Zahlungsvorgangs ist ein Fehler aufgetreten.',
    it: 'Si è verificato un errore durante il pagamento.', pt: 'Ocorreu um erro durante o pagamento.', ru: 'Произошла ошибка во время оплаты.', ar: 'حدث خطأ أثناء الدفع.', zh: '支付过程中发生错误。', hi: 'भुगतान के दौरान एक त्रुटि हुई।', ja: '決済中にエラーが発生しました。'
  },
  sub_restore_success: {
    tr: 'Aboneliğiniz başarıyla geri yüklendi! 🎉', en: 'Your subscription has been successfully restored! 🎉', es: '¡Tu suscripción se ha restaurado con éxito! 🎉', fr: 'Votre abonnement a été restored avec succès ! 🎉', de: 'Dein Abonnement wurde erfolgreich wiederhergestellt! 🎉',
    it: 'Il tuo abbonamento è stato ripristinato con successo! 🎉', pt: 'Sua assinatura foi restaurada com sucesso! 🎉', ru: 'Ваша подписка была успешно восстановлена! 🎉', ar: 'تم استعادة اشتراكك بنجاح! 🎉', zh: '您的订阅已成功恢复！🎉', hi: 'आपकी सदस्यता सफलतापूर्वक बहाल कर दी गई है! 🎉', ja: '定期購読が正常に復元されました！🎉'
  },
  sub_restore_empty: {
    tr: 'Aktif abonelik bulunamadı.', en: 'No active subscription found.', es: 'No se encontró ninguna suscripción activa.', fr: 'Aucun abonnement actif trouvé.', de: 'Kein aktives Abonnement gefunden.',
    it: 'Nessun abbonamento attivo trovato.', pt: 'Nenhuma assinatura ativa encontrada.', ru: 'Активная подписка не найдена.', ar: 'لم يتم العثور على اشتراك نشط.', zh: '未找到有效的订阅。', hi: 'कोई सक्रिय सदस्यता नहीं मिली।', ja: '有効な定期購読が見つかりませんでした。'
  },
  confirm_logout_title: {
    tr: 'Oturumu Kapat', en: 'Log Out', es: 'Cerrar sesión', fr: 'Se déconnecter', de: 'Abmelden',
    it: 'Disconnetti', pt: 'Sair', ru: 'Выйти', ar: 'تسجيل الخروج', zh: '退出登录', hi: 'لॉग आउट', ja: 'ログアウト'
  },
  confirm_logout_desc: {
    tr: 'Çıkış yapmak istediğinize emin misiniz? Çevrimdışı okuma ilerlemeniz ve verileriniz bu cihazda saklanacaktır.',
    en: 'Are you sure you want to log out? Your offline reading progress and data will be kept on this device.',
    es: '¿Está seguro de que desea cerrar sesión? Su progreso de lectura fuera de línea y sus datos se guardarán en este dispositivo.',
    fr: 'Êtes-vous sûr de vouloir vous déconnecter ? Votre progression de lecture hors ligne et vos données seront conservées sur cet appareil.',
    de: 'Bist du sicher, dass du dich abmelden möchtest? Dein Offline-Lesefortschritt und deine Daten verbleiben auf diesem Gerät.',
    it: 'Sei sicuro di voler uscire? I tuoi progressi di lettura offline e i dati rimarranno su questo dispositivo.',
    pt: 'Tem certeza de que deseja sair? Seu progresso de leitura offline e dados serão mantidos neste dispositivo.',
    ru: 'Вы уверены, что хотите выйти? Ваш прогресс чтения оффлайн и данные останутся на этом устройстве.',
    ar: 'هل أنت متأكد أنك تريد تسجيل الخروج؟ سيتم الاحتفاظ بتقدم القراءة والبيانات في وضع عدم الاتصال على هذا الجهاز.',
    zh: '您确定要退出登录吗？您的离线阅读进度和数据仍将保留在此设备上。',
    hi: 'क्या आप वाकई लॉग आउट करना चाहते हैं? आपकी ऑफ़लाइन पठन प्रगति और डेटा इस डिवाइस पर सुरक्षित रहेगा।',
    ja: 'ログアウトしてもよろしいですか？オフラインでの読書進捗やデータはこのデバイスに保持されます。'
  },
  confirm_logout_toast: {
    tr: '{provider} oturumu güvenli bir şekilde kapatıldı. 🚪',
    en: '{provider} session closed safely. 🚪',
    es: 'Sesión de {provider} cerrada de forma segura. 🚪',
    fr: 'Session {provider} fermée en toute sécurité. 🚪',
    de: '{provider}-Sitzung sicher beendet. 🚪',
    it: 'Sessione {provider} chiusa in modo sicuro. 🚪',
    pt: 'Sessão do {provider} encerrada com segurança. 🚪',
    ru: 'Сессия {provider} успешно завершена. 🚪',
    ar: 'تم إغلاق جلسة {provider} بأمان. 🚪',
    zh: '{provider} 账号已安全退出登录。 🚪',
    hi: '{provider} सत्र सुरक्षित रूप से बंद कर दिया गया。 🚪',
    ja: '{provider} から安全にログアウトしました。 🚪'
  },
  confirm_delete_title: {
    tr: 'Hesabımı ve Verilerimi Sil', en: 'Delete Account & Data', es: 'Eliminar cuenta y datos', fr: 'Supprimer le compte et les données', de: 'Konto & Daten löschen',
    it: 'Elimina account e dati', pt: 'Excluir Conta e Dados', ru: 'Удалить аккаунт и данные', ar: 'حذف الحساب والبيانات', zh: '删除帐户和数据', hi: 'खाता और डेटा हटाएं', ja: 'アカウントとデータを削除'
  },
  confirm_delete_desc: {
    tr: 'Hesabınızı ve tüm verilerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm okuma ilerlemeniz kalıcı olarak silinecektir.',
    en: 'Are you sure you want to delete your account and all your data? This action cannot be undone and all your reading progress will be permanently deleted.',
    es: '¿Está seguro de que desea eliminar su cuenta y todos sus datos? Esta acción no se puede deshacer y todo su progreso de lectura se eliminará permanentemente.',
    fr: 'Êtes-vous sûr de vouloir supprimer votre compte et toutes vos données ? Cette action est irréversible et toute votre progression de lecture sera définitivement supprimée.',
    de: 'Bist du sicher, dass du dein Konto und alle deine Daten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden und all dein Lesefortschritt wird dauerhaft gelöscht.',
    it: 'Sei sicuro di voler eliminare il tuo account e tutti i dati? Questa azione non può essere annullata e tutti i tuoi progressi di lettura verranno eliminati in modo permanente.',
    pt: 'Tem certeza de que deseja excluir sua conta e todos os seus dados? Esta ação não pode ser desfeita e todo o seu progresso de leitura será excluído permanentemente.',
    ru: 'Вы уверены, что хотите удалить свой аккаунт и все данные? Это действие нельзя отменить, и весь ваш прогресс чтения будет удален безвозвратно.',
    ar: 'هل أنت متأكد من أنك تريد حذف حسابك وجميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع تقدم القراءة بشكل دائم.',
    zh: '您确定要删除您的帐户和所有数据吗？此操作无法撤销，您的所有阅读进度将被永久删除。',
    hi: 'क्या आप वाकई अपना खाता और सभी डेटा हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती है और आपकी सभी पठन प्रगति स्थायी रूप से हटा दी जाएगी।',
    ja: 'アカウントとすべてのデータを削除してもよろしいですか？この操作は取り消すことができず、すべての読書進捗が完全に削除されます。'
  },
  confirm_delete_toast_success: {
    tr: 'Hesabınız başarıyla silindi. 🚪', en: 'Your account was deleted successfully. 🚪', es: 'Su cuenta fue eliminada con éxito. 🚪', fr: 'Votre compte a été supprimé avec succès. 🚪', de: 'Dein Konto wurde erfolgreich gelöscht. 🚪',
    it: 'Account eliminato con successo. 🚪', pt: 'Sua conta foi excluída com sucesso. 🚪', ru: 'Ваш аккаунт успешно удален. 🚪', ar: 'تم حذف حسابك بنجاح. 🚪', zh: '您的帐户已成功删除。 🚪', hi: 'आपका खाता सफलतापूर्वक हटा दिया गया। 🚪', ja: 'アカウントが正常に削除されました。 🚪'
  },
  confirm_delete_btn_confirm: {
    tr: 'Kalıcı Olarak Sil', en: 'Permanently Delete', es: 'Eliminar permanentemente', fr: 'Supprimer définitivement', de: 'Dauerhaft löschen',
    it: 'Elimina definitivamente', pt: 'Excluir Permanentemente', ru: 'Удалить навсегда', ar: 'حذف نهائي', zh: '永久删除', hi: 'स्थायी रूप से हटाएं', ja: '完全に削除'
  },
  share_toast_success: {
    tr: '{platform} üzerinde ilerlemeniz başarıyla paylaşıldı! 🚀',
    en: 'Your progress shared successfully on {platform}! 🚀',
    es: '¡Su progreso se compartió con éxito en {platform}! 🚀',
    fr: 'Votre progression a été partagée avec succès sur {platform} ! 🚀',
    de: 'Dein Fortschritt wurde erfolgreich auf {platform} geteilt! 🚀',
    it: 'I tuoi progressi sono stati condivisi con successo su {platform}! 🚀',
    pt: 'Seu progresso foi compartilhado com sucesso no {platform}! 🚀',
    ru: 'Ваш прогресс успешно опубликован в {platform}! 🚀',
    ar: 'تمت مشاركة تقدمك بنجاح على {platform}! 🚀',
    zh: '您的进度已成功分享到 {platform}！ 🚀',
    hi: 'आपकी प्रगति {platform} पर सफलतापूर्वक साझा की गई! 🚀',
    ja: '{platform} で学習の進捗を共有しました！ 🚀'
  },
  profile_update_success: {
    tr: 'Profiliniz başarıyla güncellendi! 🎉', en: 'Your profile updated successfully! 🎉', es: '¡Tu perfil se actualizó con éxito! 🎉', fr: 'Votre profil a été mis à jour avec succès ! 🎉', de: 'Dein Profil wurde erfolgreich aktualisiert! 🎉',
    it: 'Profilo aggiornato con successo! 🎉', pt: 'Seu perfil foi atualizado com sucesso! 🎉', ru: 'Ваш профиль успешно обновлен! 🎉', ar: 'تم تحديث ملفك الشخصi بنجاح! 🎉', zh: '您的个人资料已成功更新！ 🎉', hi: 'आपकी प्रोफ़ाइल सफलतापूर्वक अपडेट की गई! 🎉', ja: 'プロフィールが正常に更新されました！ 🎉'
  },
  profile_update_invalid_name: {
    tr: 'Geçersiz isim girdiniz! ⚠️', en: 'Invalid name entered! ⚠️', es: '¡Nombre no válido! ⚠️', fr: 'Nom invalide ! ⚠️', de: 'Ungültiger Name eingegeben! ⚠️',
    it: 'Nome inserito non valido! ⚠️', pt: 'Nome inválido inserido! ⚠️', ru: 'Введено недействительное имя! ⚠️', ar: 'الاسم المدخل غير صالح! ⚠️', zh: '输入的名称无效！ ⚠️', hi: 'अमान्य नाम दर्ज किया गया! ⚠️', ja: '無効な名前が入力されました！ ⚠️'
  },
  profile_update_profane: {
    tr: 'Girdiğiniz isim uygunsuz kelimeler içeriyor! ⚠️',
    en: 'The name you entered contains inappropriate words! ⚠️',
    es: '¡El nombre que ingresó contiene palabras inapropiadas! ⚠️',
    fr: 'Le nom que vous avez saisi contient des mots inappropriés ! ⚠️',
    de: 'Der eingegebene Name enthält unangemessene Wörter! ⚠️',
    it: 'Il nome inserito contiene parole inappropriate! ⚠️',
    pt: 'O nome que você digitou contém palavras inadequadas! ⚠️',
    ru: 'Введенное имя содержит неподобающие слова! ⚠️',
    ar: 'الاسم الذي أدخلته يحتوي على كلمات غير لائقة! ⚠️',
    zh: '您输入的名称包含不当词语！ ⚠️',
    hi: 'आपके द्वारा दर्ज किए गए नाम में अनुपयुक्त शब्द हैं! ⚠️',
    ja: '入力された名前には不適切な言葉が含まれています！ ⚠️'
  },
  referral_applied_success: {
    tr: 'Davet kodu başarıyla uygulandı! 🎁', en: 'Referral code successfully applied! 🎁', es: '¡Código de invitación aplicado con éxito! 🎁', fr: 'Code d\'invitation appliqué avec succès ! 🎁', de: 'Einladungscode erfolgreich angewendet! 🎁',
    it: 'Codice di invito applicato con successo! 🎁', pt: 'Código de convite aplicado com sucesso! 🎁', ru: 'Код приглашения успешно применен! 🎁', ar: 'تم تطبيق كود الدعوة بنجاح! 🎁', zh: '已成功应用邀请码！ 🎁', hi: 'आमंत्रण कोड सफलतापूर्वक लागू किया गया! 🎁', ja: '招待コードが正常に適用されました！ 🎁'
  },
  share_word_text: {
    tr: '"{word}" kelimesinin Türkçe karşılığı: "{translation}". İngilizce Öyküm ile İngilizce öğreniyorum!',
    en: 'Translation of "{word}" is "{translation}". I am learning English with My English Story!',
    es: 'La traducción de "{word}" es "{translation}". ¡Estoy aprendiendo inglés con My English Story!',
    fr: 'La traduction de "{word}" est "{translation}". J\'apprends l\'anglais avec My English Story !',
    de: 'Die Übersetzung von "{word}" ist "{translation}". Ich lerne Englisch mit My English Story!',
    it: 'La traduzione di "{word}" è "{translation}". Sto imparando l\'inglese con My English Story!',
    pt: 'A tradução de "{word}" é "{translation}". Estou aprendendo inglês com o My English Story!',
    ru: 'Перевод слова "{word}" - "{translation}". Я учу английский с My English Story!',
    ar: 'ترجمة "{word}" هي "{translation}". أنا أتعلم الإنجليزية مع My English Story!',
    zh: '“{word}”的翻译是“{translation}”。我正在使用 My English Story 学习英语！',
    hi: '"{word}" का अनुवाद "{translation}" है। मैं My English Story के साथ अंग्रेजी सीख रहा हूँ!',
    ja: '「{word}」の翻訳は「{translation}」です。My English Storyで英語を勉強しています！'
  },
  share_word_copied: {
    tr: 'Kelime ve çeviri kopyalandı, artık paylaşabilirsiniz! 🔗',
    en: 'Word and translation copied, you can share now! 🔗',
    es: '¡Palabra y traducción copiadas, ya puedes compartir! 🔗',
    fr: 'Mot et traduction copiés, vous pouvez partager maintenant ! 🔗',
    de: 'Wort und Übersetzung kopiert, du kannst jetzt teilen! 🔗',
    it: 'Parola e traduzione copiate, ora puoi condividere! 🔗',
    pt: 'Palavra e tradução copiadas, você já pode compartilhar! 🔗',
    ru: 'Слово и перевод скопированы, теперь можно поделиться! 🔗',
    ar: 'تم نسخ الكلمة والترجمة، يمكنك مشاركتها الآن! 🔗',
    zh: '单词和翻译已复制，您现在可以分享了！ 🔗',
    hi: 'शब्द और अनुवाद कॉपी किया गया, अब आप साझा कर सकते हैं! 🔗',
    ja: '単語と翻訳がコピーされました。共有できます！ 🔗'
  },
  share_word_fallback: {
    tr: 'İpucu: Kelimeyi seçip kendiniz kopyalayabilirsiniz.',
    en: 'Tip: You can select the word and copy it yourself.',
    es: 'Sugerencia: Puedes seleccionar la palabra y copiarla tú mismo.',
    fr: 'Conseil : Vous pouvez sélectionner le mot et le copier vous-même.',
    de: 'Tipp: Du kannst das Wort auswählen und selbst kopieren.',
    it: 'Consiglio: Puoi selezionare la parola e copiarla da solo.',
    pt: 'Dica: Você pode selecionar a palavra e copiá-la você mesmo.',
    ru: 'Подсказка: Вы можете выделить слово и скопировать его сами.',
    ar: 'تلميح: يمكنك تحديد الكلمة ونسخها بنفسك.',
    zh: '提示：您可以选择单词并自己复制。',
    hi: 'सुझाव: आप शब्द का चयन कर सकते हैं और इसे स्वयं कॉपी कर सकते हैं।',
    ja: 'ヒント：単語を選択してご自身でコピーすることもできます。'
  },
  translation_header: {
    tr: 'TÜRKÇE ÇEVİRİSİ', en: 'TRANSLATION', es: 'TRADUCCIÓN', fr: 'TRADUCTION', de: 'ÜBERSETZUNG',
    it: 'TRADUZIONE', pt: 'TRADUÇÃO', ru: 'ПЕРЕВОД', ar: 'الترجمة', zh: '翻译', hi: 'अनुवाद', ja: '翻訳'
  },
  listen_meaning: {
    tr: 'Anlamını Dinle', en: 'Listen to meaning', es: 'Escuchar significado', fr: 'Écouter le sens', de: 'Bedeutung anhören',
    it: 'Ascolta il significato', pt: 'Ouvir significado', ru: 'Прослушать значение', ar: 'استمع إلى المعنى', zh: '倾听词意', hi: 'अर्थ सुनें', ja: '発音を聴く'
  },
  badge_title_b6: { tr: 'İlk Adım', en: 'First Step', es: 'Primer Paso', fr: 'Premier Pas', de: 'Erster Schritt', it: 'Primo Passo', pt: 'Primeiro Passo', ru: 'Первый шаг', ar: 'الخطوة الأولى', zh: '第一步', hi: 'पहला कदम', ja: '第一歩' },
  badge_desc_b6: { tr: 'İlk hikayeni başarıyla tamamla.', en: 'Successfully complete your first story.', es: 'Completa con éxito tu primera historia.', fr: 'Terminez avec succès votre première histoire.', de: 'Schließe deine erste Geschichte erfolgreich ab.', it: 'Completa con successo la tua prima storia.', pt: 'Complete com sucesso sua primeira história.', ru: 'Успешно завершите свою первую историю.', ar: 'أكمل قصتك الأولى بنجاح.', zh: '成功完成你的第一个故事。', hi: 'अपनी पहली कहानी सफलतापूर्वक पूरी करें।', ja: '最初のストーリーを完了させましょう。' },
  badge_title_b11: { tr: 'Okumaya Alışmak', en: 'Getting Used to Reading', es: 'Acostumbrándose a Leer', fr: 'Habitude de Lecture', de: 'Ans Lesen gewöhnen', it: 'Abituarsi alla Lettura', pt: 'Acostumando-se a Ler', ru: 'Привыкание к чтению', ar: 'الاعتياد على القراءة', zh: '习惯阅读', hi: 'पढ़ने की आदत', ja: '読書の習慣' },
  badge_desc_b11: { tr: 'Toplam 10 dakika okuma süresine ulaş.', en: 'Reach a total of 10 minutes of reading time.', es: 'Alcanza un total de 10 minutos de lectura.', fr: 'Atteignez un total de 10 minutes de lecture.', de: 'Erreiche eine Gesamtlesezeit von 10 Minuten.', it: 'Raggiungi un totale di 10 minuti di lettura.', pt: 'Alcance um total de 10 minutos de leitura.', ru: 'Достигните в общей сложности 10 минут чтения.', ar: 'الوصول إلى إجمالي 10 دقائق من وقت القراءة.', zh: '累计阅读时间达到 10 分钟。', hi: 'कुल 10 मिनट पढ़ने के समय तक पहुँचें।', ja: '累計読書時間10分を達成しましょう。' },
  badge_title_b7: { tr: 'Kelime Meraklısı', en: 'Word Curious', es: 'Curioso de las Palabras', fr: 'Curieux de Mots', de: 'Wortneugierig', it: 'Curioso di Parole', pt: 'Curioso por Palavras', ru: 'Любознательный', ar: 'فضول الكلمات', zh: '词汇爱好者', hi: 'शब्द जिज्ञासु', ja: '単語への好奇心' },
  badge_desc_b7: { tr: 'Kelime haznesine 20 yeni kelime kaydet.', en: 'Save 20 new words to your vocabulary.', es: 'Guarda 20 palabras nuevas en tu vocabulario.', fr: 'Enregistrez 20 nouveaux mots dans votre vocabulaire.', de: 'Speichere 20 neue Wörter in deinem Wortschatz.', it: 'Salva 20 nuove parole nel tuo vocabolario.', pt: 'Salve 20 novas palavras no seu vocabulário.', ru: 'Сохраните 20 новых слов в свой словарь.', ar: 'احفظ 20 كلمة جديدة في مفرداتك.', zh: '在词汇本中保存 20 个新单词。', hi: 'अपनी शब्दावली में 20 नए शब्द सहेजें।', ja: '単語帳に20語の新しい単語を保存しましょう。' },
  badge_title_b1: { tr: 'Kitap Kurdu', en: 'Bookworm', es: 'Devorador de Libros', fr: 'Rat de Bibliothèque', de: 'Bücherwurm', it: 'Topo di Biblioteca', pt: 'Devorador de Livros', ru: 'Книжный червь', ar: 'دودة كتب', zh: '书虫', hi: 'किताबी कीड़ा', ja: '本の虫' },
  badge_desc_b1: { tr: 'En az 5 farklı İngilizce hikaye oku.', en: 'Read at least 5 different English stories.', es: 'Lee al menos 5 historias en inglés diferentes.', fr: 'Lisez au moins 5 histoires différentes en anglais.', de: 'Lies mindestens 5 verschiedene englische Geschichten.', it: 'Leggi almeno 5 storie diverse in inglese.', pt: 'Leia pelo menos 5 histórias diferentes em inglês.', ru: 'Прочитайте как минимум 5 разных историй на английском.', ar: 'اقرأ ما لا يقل عن 5 قصص مختلفة باللغة الإنجليزية.', zh: '阅读至少 5 个不同的英文故事。', hi: 'कम से कम 5 अलग-अलग अंग्रेजी कहानियां पढ़ें।', ja: '少なくとも5つの異なる英語のストーリーを読みましょう。' },
  badge_title_b14: { tr: 'Çelik İrade', en: 'Iron Will', es: 'Voluntad de Hierro', fr: 'Volonté de Fer', de: 'Eiserner Wille', it: 'Volontà di Ferro', pt: 'Vontade de Ferro', ru: 'Железная воля', ar: 'إرادة حديدية', zh: '钢铁意志', hi: 'दृढ़ इच्छाशक्ति', ja: '不屈の精神' },
  badge_desc_b14: { tr: 'Günlük hedefini üst üste 5 gün tamamla.', en: 'Complete your daily goal 5 days in a row.', es: 'Completa tu objetivo diario 5 días seguidos.', fr: 'Complétez votre objectif quotidien 5 jours de suite.', de: 'Erreiche dein tägliches Ziel 5 Tage hintereinander.', it: 'Completa il tuo obiettivo giornaliero per 5 giorni di fila.', pt: 'Complete sua meta diária por 5 dias seguidos.', ru: 'Выполняйте ежедневную цель 5 дней подряд.', ar: 'أكمل هدفك اليومي لمدة 5 أيام متتالية.', zh: '连续 5 天完成每日目标。', hi: 'लगातार 5 दिनों तक अपना दैनिक लक्ष्य पूरा करें।', ja: '5日連続でデイリー目標を達成しましょう。' },
  badge_title_b12: { tr: 'Kelime Koleksiyoneri', en: 'Word Collector', es: 'Coleccionista de Palabras', fr: 'Collectionneur de Mots', de: 'Wortsammler', it: 'Collezionista di Parole', pt: 'Colecionador de Palavras', ru: 'Коллекционер слов', ar: 'جامع الكلمات', zh: '单词收藏家', hi: 'शब्द संग्राहक', ja: '単語コレクター' },
  badge_desc_b12: { tr: 'Kelime haznesine 50 yeni kelime kaydet.', en: 'Save 50 new words to your vocabulary.', es: 'Guarda 50 palabras nuevas en tu vocabulario.', fr: 'Enregistrez 50 nouveaux mots dans votre vocabulaire.', de: 'Speichere 50 neue Wörter in deinem Wortschatz.', it: 'Salva 50 nuove parole nel tuo vocabolario.', pt: 'Salve 50 novas palavras no seu vocabulário.', ru: 'Сохраните 50 новых слов в свой словарь.', ar: 'احفظ 50 كلمة جديدة in مفرداتك.', zh: '在词汇本中保存 50 个新单词。', hi: 'अपनी शब्दावली में 50 नए शब्द सहेजें।', ja: '単語帳に50語の新しい単語を保存しましょう。' },
  badge_title_b13: { tr: 'Dil Kaşifi', en: 'Language Explorer', es: 'Explorador del Idioma', fr: 'Explorateur de Langues', de: 'Sprachforscher', it: 'Esploratore Linguistico', pt: 'Explorador de Idiomas', ru: 'Исследователь языка', ar: 'مستكشف اللغة', zh: '语言探险家', hi: 'भाषा अन्वेषक', ja: '言語の探検家' },
  badge_desc_b13: { tr: '3 farklı zorluk seviyesinden hikayeler bitir.', en: 'Finish stories from 3 different difficulty levels.', es: 'Termina historias de 3 niveles de dificultad diferentes.', fr: 'Terminez des histoires de 3 niveaux de difficulté différents.', de: 'Schließe Geschichten aus 3 verschiedenen Schwierigkeitsgraden ab.', it: 'Termina storie da 3 diversi livelli di difficoltà.', pt: 'Termine histórias de 3 níveis de dificultad diferentes.', ru: 'Завершите истории 3 разных уровней сложности.', ar: 'إنهاء قصص من 3 مستويات صعوبة مختلفة.', zh: '完成来自 3 个不同难度等级的故事。', hi: '3 अलग-अलग कठिनाई स्तरों की कहानियां समाप्त करें。', ja: '3つの異なる難易度のストーリーを読了しましょう。' },
  badge_title_b9: { tr: 'Kütüphaneci', en: 'Librarian', es: 'Bibliotecario', fr: 'Bibliothécaire', de: 'Bibliothekar', it: 'Bibliotecario', pt: 'Bibliotecário', ru: 'Библиотекарь', ar: 'أمين مكتبة', zh: '图书管理员', hi: 'पुस्तकालयाध्यक्ष', ja: '司書' },
  badge_desc_b9: { tr: 'En az 10 farklı hikayeye başla.', en: 'Start at least 10 different stories.', es: 'Comienza al menos 10 historias diferentes.', fr: 'Commencez au moins 10 histoires différentes.', de: 'Beginne mindestens 10 verschiedene Geschichten.', it: 'Inizia almeno 10 storie diverse.', pt: 'Comece pelo menos 10 histórias diferentes.', ru: 'Начните как минимум 10 разных историй.', ar: 'ابدأ ما لا يقل عن 10 قصص مختلفة.', zh: '开始阅读至少 10 个不同的故事。', hi: 'कम से कम 10 अलग-अलग कहानियां शुरू करें。', ja: '少なくとも10の異なるストーリーを読み始めましょう。' },
  badge_title_b8: { tr: 'Zaman Bükücü', en: 'Time Bender', es: 'Manipulador del Tiempo', fr: 'Maître du Temps', de: 'Zeithüter', it: 'Signore del Tempo', pt: 'Manipulador do Tempo', ru: 'Повелитель времени', ar: 'سيد الوقت', zh: '时间使者', hi: 'समय बेंडर', ja: '時の支配者' },
  badge_desc_b8: { tr: 'Toplam 100 dakika okuma süresine ulaş.', en: 'Reach a total of 100 minutes of reading time.', es: 'Alcanza un total de 100 minutos de lectura.', fr: 'Atteignez un total de 100 minutes de lecture.', de: 'Erreiche eine Gesamtlesezeit von 100 Minuten.', it: 'Raggiungi un totale di 100 minuti di lettura.', pt: 'Alcance um total de 100 minutos de leitura.', ru: 'Достигните в общей сложности 100 минут чтения.', ar: 'الوصول إلى إجمالي 100 دقيقة من وقت القراءة.', zh: '累计阅读时间达到 100 分钟。', hi: 'कुल 100 मिनट पढ़ने के समय तक पहुँचें。', ja: '累計読書時間100分を達成しましょう。' },
  badge_title_b4: { tr: 'Kusursuz Akıl', en: 'Perfect Mind', es: 'Mente Perfecta', fr: 'Esprit Parfait', de: 'Perfekter Verstand', it: 'Mente Perfetta', pt: 'Mente Perfeita', ru: 'Идеальный разум', ar: 'عقل مثالي', zh: '完美心智', hi: 'उत्कृष्ट मस्तिष्क', ja: '完全なる知性' },
  badge_desc_b4: { tr: 'Bir kelime quizini can kaybetmeden bitir.', en: 'Finish a vocabulary quiz without losing any lives.', es: 'Termina un cuestionario de vocabulario sin perder ninguna vida.', fr: 'Terminez un quiz de vocabulaire sans perdre de vie.', de: 'Schließe ein Wortschatz-Quiz ab, ohne Leben zu verlieren.', it: 'Termina un quiz di vocaboli senza perdere vite.', pt: 'Termine um quiz de vocabulário sem perder nenhuma vida.', ru: 'Пройдите квиз по словам, не потеряв ни одной жизни.', ar: 'إنهاء اختبار المفردات دون خسارة أي أرواح.', zh: '无伤（不损失生命值）完成一次单词测试。', hi: 'बिना कोई जीवन खोए एक शब्दावली क्विज़ पूरा करें。', ja: 'ライフを失わずに単語クイズを完了しましょう。' },
  badge_title_b3: { tr: 'Kelime Avcısı', en: 'Word Hunter', es: 'Cazador de Palabras', fr: 'Chasseur de Mots', de: 'Wortjäger', it: 'Cacciatore di Parole', pt: 'Caçador de Palavras', ru: 'Охотник за словами', ar: 'صائد الكلمات', zh: '单词猎人', hi: 'शब्द शिकारी', ja: '単語ハンター' },
  badge_desc_b3: { tr: 'Kelime haznesine 100 yeni kelime kaydet.', en: 'Save 100 new words to your vocabulary.', es: 'Guarda 100 palabras nuevas en tu vocabulario.', fr: 'Enregistrez 100 nouveaux mots dans votre vocabulaire.', de: 'Speichere 100 neue Wörter in deinem Wortschatz.', it: 'Salva 100 nuove parole nel tuo vocabolario.', pt: 'Salve 100 novas palavras no seu vocabulário.', ru: 'Сохраните 100 новых слов в свой словарь.', ar: 'احفظ 100 كلمة جديدة في مفرداتك.', zh: '在词汇本中保存 100 个新单词。', hi: 'अपनी शब्दावली में 100 नए शब्द सहेजें。', ja: '単語帳に100語の新しい単語を保存しましょう。' },
  badge_title_b2: { tr: 'Azimli Sebat', en: 'Persistent Perseverance', es: 'Perseverancia Persistente', fr: 'Persévérance', de: 'Beharrlichkeit', it: 'Costanza', pt: 'Perseverança', ru: 'Упорство', ar: 'المثابرة الدؤوبة', zh: '持之以恒', hi: 'दृढ़ता', ja: '不屈の努力' },
  badge_desc_b2: { tr: 'Günlük hedefini üst üste 15 gün tamamla.', en: 'Complete your daily goal 15 days in a row.', es: 'Completa tu objetivo diario 15 días seguidos.', fr: 'Complétez votre objectif quotidien 15 jours de suite.', de: 'Erreiche dein tägliches Ziel 15 Tage hintereinander.', it: 'Completa il tuo obiettivo giornaliero per 15 giorni di fila.', pt: 'Complete sua meta diária por 15 dias seguidos.', ru: 'Выполняйте ежедневную цель 15 дней подряд.', ar: 'أكمل هدفك اليومي لمدة 15 يوماً متتالية.', zh: '连续 15 天完成每日目标。', hi: 'लगातार 15 दिनों तक अपना दैनिक लक्ष्य पूरा करें।', ja: '15日連続でデイリー目標を達成しましょう。' },
  badge_title_b10: { tr: 'Bilge Gezgin', en: 'Wise Traveler', es: 'Viajero Sabio', fr: 'Sage Voyageur', de: 'Weiser Reisender', it: 'Viaggiatore Saggio', pt: 'Viajante Sábio', ru: 'Мудрый путешественник', ar: 'مسافر حكيم', zh: '智者行者', hi: 'बुद्धिमान यात्री', ja: '賢明な旅人' },
  badge_desc_b10: { tr: 'C1 seviyesinde en az bir hikaye bitir.', en: 'Finish at least one C1 level story.', es: 'Termina al menos una historia de nivel C1.', fr: 'Terminez au moins une histoire de niveau C1.', de: 'Schließe mindestens eine C1-Geschichte ab.', it: 'Termina almeno una storia di livello C1.', pt: 'Termine pelo menos uma história de nível C1.', ru: 'Завершите хотя бы одну историю уровня C1.', ar: 'إنهاء قصة واحدة على الأقل بمستوى C1.', zh: '完成至少一个 C1 等级的故事。', hi: 'कम से कम एक C1 स्तर की कहानी समाप्त करें।', ja: 'C1レベルのストーリーを少なくとも1つ読了しましょう。' },
  badge_title_b15: { tr: 'Efsanevi Okur', en: 'Legendary Reader', es: 'Lector Legendario', fr: 'Lecteur Légendaire', de: 'Legendärer Leser', it: 'Lettore Leggendario', pt: 'Leitor Lendário', ru: 'Легендарный читатель', ar: 'قارئ أسطوري', zh: '传奇读者', hi: 'महान पाठक', ja: '伝説の読者' },
  badge_desc_b15: { tr: 'Toplam 500 dakika okuma süresine ulaş.', en: 'Reach a total of 500 minutes of reading time.', es: 'Alcanza un total de 500 minutos de lectura.', fr: 'Atteignez un total de 500 minutes de lecture.', de: 'Erreiche eine Gesamtlesezeit von 500 Minuten.', it: 'Raggiungi un totale di 500 minuti di lettura.', pt: 'Alcance um total de 500 minutos de leitura.', ru: 'Достигните в общей сложности 500 минут чтения.', ar: 'الوصول إلى إجمالي 500 دقيقة من وقت القراءة.', zh: '累计阅读时间达到 500 分钟。', hi: 'कुल 500 मिनट पढ़ने के समय तक पहुँचें।', ja: '累計読書時間500分を達成しましょう。' },
  badge_title_b5: { tr: 'Premium Üye', en: 'Premium Member', es: 'Miembro Premium', fr: 'Membre Premium', de: 'Premium-Mitglied', it: 'Membro Premium', pt: 'Membro Premium', ru: 'Премиум-пользователь', ar: 'عضو بريميوم', zh: '会员用户', hi: 'प्रीमियम सदस्य', ja: 'プレミアム会員' },
  badge_desc_b5: { tr: 'Sınırsız can ve premium ayrıcalıkları aktif et.', en: 'Activate unlimited lives and premium benefits.', es: 'Activa vidas ilimitadas y beneficios premium.', fr: 'Activez les vies illimitées et les avantages premium.', de: 'Aktiviere unbegrenzte Leben und Premium-Vorteile.', it: 'Attiva vite illimitate e vantaggi premium.', pt: 'Ative vidas ilimitadas e benefícios premium.', ru: 'Активируйте бесконечные жизни и премиум-преимущества.', ar: 'تفعيل أرواح غير محدودة ومزايا بريميوم.', zh: '激活无限生命值和会员特权。', hi: 'असीमित जीवन और प्रीमियम लाभों को सक्रिय करें।', ja: 'ライフ無制限とプレミアム特典を有効にしましょう。' },
  badge_title_b16: { tr: 'Eşleme Çırağı', en: 'Matching Apprentice', es: 'Aprendiz de Emparejamiento', fr: 'Apprenti du Match', de: 'Zuordnungslehrling', it: 'Apprendista dell\'Abbinamento', pt: 'Aprendiz de Combinação', ru: 'Ученик сопоставления', ar: 'متدرب المطابقة', zh: '配对学徒', hi: 'मिलान प्रशिक्षु', ja: 'マッチングの見習い' },
  badge_desc_b16: { tr: 'İlk eş bulma oyununu başarıyla tamamla.', en: 'Successfully complete your first word matching game.', es: 'Completa con éxito tu primer juego de emparejar palabras.', fr: 'Terminez avec succès votre premier jeu d\'association de mots.', de: 'Schließe dein erstes Wortzuordnungsspiel erfolgreich ab.', it: 'Completa con successo il tuo primo gioco di abbinamento parole.', pt: 'Complete com sucesso seu primeiro jogo de combinação de palavras.', ru: 'Успешно завершите свою первую игру на сопоставление слов.', ar: 'أكمل أول لعبة مطابقة كلمات بنجاح.', zh: '成功完成第一次单词配对游戏。', hi: 'अपना पहला शब्द मिलान गेम सफलतापूर्वक पूरा करें।', ja: '最初の単語マッチングゲームをクリアしましょう。' },
  badge_title_b17: { tr: 'Eşleme Ustası', en: 'Matching Master', es: 'Maestro de Emparejamiento', fr: 'Maître du Match', de: 'Zuordnungsmeister', it: 'Maestro dell\'Abbinamento', pt: 'Mestre de Combinação', ru: 'Мастер сопоставления', ar: 'رائد المطابقة', zh: '配对大师', hi: 'मिलान मास्टर', ja: 'マッチングの達人' },
  badge_desc_b17: { tr: '5 kez eş bulma oyununu başarıyla tamamla.', en: 'Successfully complete the word matching game 5 times.', es: 'Completa con éxito el juego de emparejar palabras 5 veces.', fr: 'Terminez avec succès le jeu d\'association de mots 5 fois.', de: 'Schließe das Wortzuordnungsspiel 5-mal erfolgreich ab.', it: 'Completa con successo il gioco di abbinamento parole 5 volte.', pt: 'Complete com sucesso o jogo de combinação de palavras 5 vezes.', ru: 'Успешно завершите игру на сопоставление слов 5 раз.', ar: 'أكمل لعبة مطابقة الكلمات بنجاح 5 مرات.', zh: '成功完成 5 次单词配对游戏。', hi: '5 बार मिलान गेम सफलतापूर्वक पूरा करें।', ja: '単語マッチングゲームを5回クリアしましょう。' },
  badge_title_b18: { tr: 'Kelime Dedektifi', en: 'Word Detective', es: 'Detective de Palabras', fr: 'Détective de Mots', de: 'Wortdetektiv', it: 'Investigatore di Parole', pt: 'Detetive de Palavras', ru: 'Словесный детектив', ar: 'محقق الكلمات', zh: '单词侦探', hi: 'शब्द जासूस', ja: '単語の探偵' },
  badge_desc_b18: { tr: 'İlk boşluk doldurma oyununu başarıyla tamamla.', en: 'Successfully complete your first fill-in-the-blanks game.', es: 'Completa con éxito tu primer juego de rellenar huecos.', fr: 'Terminez avec succès votre premier jeu de texte à trous.', de: 'Schließe dein erstes Lückentextspiel erfolgreich ab.', it: 'Completa con successo il tuo primo gioco di riempimento spazi.', pt: 'Complete com sucesso seu primeiro jogo de preencher lacunas.', ru: 'Успешно завершите свою первую игру с заполнением пропусков.', ar: 'أكمل أول لعبة ملء فراغات بنجاح.', zh: '成功完成第一次填空游戏。', hi: 'अपना पहला रिक्त स्थान भरें गेम सफलतापूर्वक पूरा करें।', ja: '最初の穴埋めゲームをクリアしましょう。' },
  badge_title_b19: { tr: 'Boşluk Bükücü', en: 'Blank Bender', es: 'Dominador de Espacios', fr: 'Maître des Vides', de: 'Lückenbezwinger', it: 'Signore degli Spazi', pt: 'Dominador de Lacunas', ru: 'Повелитель пропусков', ar: 'مروض الفراغات', zh: '填空专家', hi: 'ब्लैंक बेंडर', ja: '穴埋めの達人' },
  badge_desc_b19: { tr: '5 kez boşluk doldurma oyununu başarıyla tamamla.', en: 'Successfully complete the fill-in-the-blanks game 5 times.', es: 'Completa con éxito el juego de rellenar huecos 5 veces.', fr: 'Terminez avec succès le jeu de texte à trous 5 fois.', de: 'Schließe das Lückentextspiel 5-mal erfolgreich ab.', it: 'Completa con successo il gioco di riempimento spazi 5 volte.', pt: 'Complete com sucesso o jogo de preencher lacunas 5 vezes.', ru: 'Успешно завершите игру с заполнением пропусков 5 раз.', ar: 'أكمل لعبة ملء الفراغات بنجاح 5 مرات.', zh: '成功完成 5 次填空游戏。', hi: '5 बार रिक्त स्थान भरें गेम सफलतापूर्वक पूरा करें।', ja: '穴埋めゲームを5回クリアしましょう。' },
  notify_prompt_text: {
    tr: 'Yeni hikayeler, kelime hatırlatıcıları ve can yenileme bildirimlerini almak ister misiniz?',
    en: 'Would you like to receive notifications for new stories, vocabulary reminders, and heart refills?',
    es: '¿Te gustaría recibir notificaciones sobre nuevas historias, recordatorios de vocabulario y recargas de vidas?',
    fr: 'Souhaitez-vous recevoir des notifications pour les nouvelles histoires, les rappels de vocabulaire et les recharges de vies ?',
    de: 'Möchtest du Benachrichtigungen für neue Geschichten, Vokabelerinnerungen und Lebensaufladungen erhalten?',
    it: 'Desideri ricevere notifiche per nuove storie, promemoria di vocaboli e ricariche di vite?',
    pt: 'Gostaria de receber notificações de novas histórias, lembretes de vocabulário e recargas de vidas?',
    ru: 'Хотите получать уведомления о новых историях, напоминаниях о словах и пополнении жизней?',
    ar: 'هل ترغب في تلقي إشعارات للقصص الجديدة وتذكيرات المفردات وإعادة تعبئة القلوب؟',
    zh: '您想接收新故事、单词提醒和生命值恢复的通知吗？',
    hi: 'क्या आप नई कहानियों, शब्दावली रिमाइंडर्स और जीवन रीफिल के लिए सूचनाएं प्राप्त करना चाहेंगे?',
    ja: '新しいストーリー、単語のリマインダー、ライフ回復 of 通知を受け取りますか？'
  },
  notify_hearts_title: {
    tr: 'Canların Doldu! ❤️',
    en: 'Hearts Refilled! ❤️',
    es: '¡Vidas completas! ❤️',
    fr: 'Vies rechargées ! ❤️',
    de: 'Leben voll aufgeladen! ❤️',
    it: 'Vite ricaricate! ❤️',
    pt: 'Vidas recarregadas! ❤️',
    ru: 'Жизни пополнены! ❤️',
    ar: 'القلوب ممتلئة! ❤️',
    zh: '生命值已满！ ❤️',
    hi: 'दिल फिर से भर गए! ❤️',
    ja: 'ライフが満タンになりました！ ❤️'
  },
  notify_hearts_body: {
    tr: 'Hikayelerine kaldığın yerden devam etmek için canların tamamen yenilendi. Keyifli okumalar!',
    en: 'Your lives are fully replenished. Jump back in and continue reading your stories!',
    es: 'Tus vidas se han restablecido por completo. ¡Vuelve a leer tus historias!',
    fr: 'Vos vies sont entièrement reconstituées. Revenez vite pour continuer la lecture de vos histoires !',
    de: 'Deine Leben sind wieder voll. Lies jetzt deine Geschichten weiter!',
    it: 'Le tue vite sono state ricaricate. Torna a leggere le senin storie!',
    pt: 'Suas vidas foram totalmente restauradas. Volte para continuar lendo suas histórias!',
    ru: 'Ваши жизни полностью восстановлены. Вернитесь к чтению своих историй!',
    ar: 'تمت إعادة تعبئة قلوبك بالكامل. عد الآن وتابع قراءة قصصك!',
    zh: '您的生命值已完全恢复。快回来继续阅读您的故事吧！',
    hi: 'आपके जीवन पूरी तरह से भर गए हैं। वापस आएं & अपनी कहानियों को पढ़ना जारी रखें!',
    ja: 'ライフが完全に回復しました。ストーリーの続きを読むために戻ってきましょう！'
  },
  notify_daily_title_1: {
    tr: 'Bugünkü okuma hedefini tamamladın mı? 📚',
    en: 'Have you read your story today? 📚',
    es: '¿Has leído tu historia hoy? 📚',
    fr: 'As-tu lu ton histoire aujourd\'hui ? 📚',
    de: 'Hast du heute schon gelesen? 📚',
    it: 'Hai letto la tua storia oggi? 📚',
    pt: 'Você leu sua história hoje? 📚',
    ru: 'Вы читали сегодня свою историю? 📚',
    ar: 'هل قرأت قصتك اليوم؟ 📚',
    zh: '你今天读故事了吗？ 📚',
    hi: 'क्या आपने आज अपनी कहानी पढ़ी है? 📚',
    ja: '今日はストーリーを読みましたか？ 📚'
  },
  notify_daily_body_1: {
    tr: 'İngilizceni geliştirmek için her gün 10 dakika okumak harika bir alışkanlıktır. Hadi başlayalım!',
    en: 'Reading just 10 minutes a day is a great habit to improve your English. Let\'s start!',
    es: 'Leer solo 10 minutos al día es un hábito excelente para mejorar tu inglés. ¡Comencemos!',
    fr: 'Lire seulement 10 minutes par jour est une excellente habitude pour progresser en anglais. Commençons !',
    de: 'Täglich nur 10 Minuten zu lesen, ist eine großartige Angewohnheit, um dein Englisch zu verbessern. Lass uns anfangen!',
    it: 'Leggere solo 10 minuti al giorno è un\'optima abitudine per migliorare l\'inglese. Cominciamo!',
    pt: 'Ler apenas 10 minutos por dia é um ótimo hábito para melhorar seu inglês. Vamos começar!',
    ru: 'Чтение всего 10 минут в день — отличная привычка для улучшения английского. Давайте начнем!',
    ar: 'القراءة لمدة 10 دقائق فقط يوميًا هي عادة رائعة لتحسين لغتك الإنجليزية. لنبدأ!',
    zh: '每天坚持阅读10分钟是提高英语水平的好习惯。让我们开始吧！',
    hi: 'दिन में केवल 10 minut पढ़ना आपकी अंग्रेजी को बेहतर बनाने की een nesil alışkanlıktır. Hadi başlayalım!',
    ja: '1日わずか10分間読むことは、英語力を向上させる素晴らしい習慣です. 手軽に始めましょう！'
  },
  notify_daily_title_2: {
    tr: 'Pazartesi motivasyonu! 💪',
    en: 'Monday Motivation! 💪',
    es: '¡Motivación de lunes! 💪',
    fr: 'Motivation du lundi ! 💪',
    de: 'Montagsmotivation! 💪',
    it: 'Motivazione del lunedì! 💪',
    pt: 'Motivação de segunda-feira! 💪',
    ru: 'Мотивация на понедельник! 💪',
    ar: 'تحفيز يوم الاثنين! 💪',
    zh: '周一动力！ 💪',
    hi: 'सोमवार की प्रेरणा! 💪',
    ja: '月曜日のモチベーション！ 💪'
  },
  notify_daily_body_2: {
    tr: 'Yeni bir haftaya yeni bir İngilizce hikaye ile başlamaya ne dersin? Seni bekleyen maceralar var!',
    en: 'Start your week with a fresh English story. Adventure is waiting for you!',
    es: 'Comienza tu semana con una nueva historia en inglés. ¡Te esperan grandes aventuras!',
    fr: 'Commencez la semaine avec une nouvelle histoire en anglais. L\'aventure vous attend !',
    de: 'Starte deine Woche mit einer neuen englischen Geschichte. Das Abenteuer wartet auf dich!',
    it: 'Inizia la settimana con una nuova storia in inglese. L\'avventura ti aspetta!',
    pt: 'Comece sua semana com uma nova história em inglês. A aventura está te esperando!',
    ru: 'Начните неделю с новой истории на английском. Вас ждут приключения!',
    ar: 'ابدأ أسبوعك بقصة إنجليزية جديدة. المغامرة في انتظارك!',
    zh: '用一个全新的英语故事开启新的一周。冒险在等着你！',
    hi: 'एक yeni İngilizce hikaye ile yeni bir haftaya başlamaya ne dersin?',
    ja: '新しい英語のストーリーで1週間をスタートしましょう。冒険があなたを待っています！'
  },
  notify_daily_title_3: {
    tr: 'Kelime haznene yeni bir kelime ekle! 🔑',
    en: 'Add a new word to your vocabulary! 🔑',
    es: '¡Añade una palabra nueva a tu vocabulario! 🔑',
    fr: 'Ajoute un nouveau mot à ton vocabulaire ! 🔑',
    de: 'Füge eine neue Vokabel hinzu! 🔑',
    it: 'Aggiungi una nuova parola al tuo vocabolario! 🔑',
    pt: 'Adicione uma nova palavra ao seu vocabulário! 🔑',
    ru: 'Добавьте новое слово в свой словарь! 🔑',
    ar: 'أضف كلمة جديدة إلى مفرداتك! 🔑',
    zh: '在你的词汇表中添加一个新单词！ 🔑',
    hi: 'अपनी शब्दावली में एक नया शब्द जोड़ें! 🔑',
    ja: '語彙に新しい単語を追加しましょう！ 🔑'
  },
  notify_daily_body_3: {
    tr: 'Günde sadece birkaç yeni kelime öğrenmek bile uzun vadede büyük fark yaratır.',
    en: 'Learning just a few words every day makes a huge difference in the long run.',
    es: 'Aprender solo unas pocas palabras al día marka una gran diferencia a largo plazo.',
    fr: 'Apprendre seulement quelques mots par jour fait une énorme différence sur le long terme.',
    de: 'Jeden Tag nur ein paar neue Wörter zu lernen, macht langfristig einen riesigen Unterschied.',
    it: 'Imparare anche solo poche parole al giorno fa una grande differenza a lungo termine.',
    pt: 'Aprender apenas algumas palavras todos os dias faz uma enorme diferença a prazo.',
    ru: 'Изучение всего нескольких новых слов каждый день приносит огромную пользу в долгосрочной перспективе.',
    ar: 'تعلم كلمات قليلة كل يوم يصنع فارقًا كبيرًا على المدى الطويل.',
    zh: '每天只需学习几个新单词，长此以往就会带来巨大的改变。',
    hi: 'हर दिन केवल कुछ शब्द सीखने से भी लंबे समय में बहुत बड़ा अंतर आता. है।',
    ja: '毎日数単語学習するだけでも、長期的には大きな違いが生まれます。'
  },
  notify_daily_title_4: {
    tr: 'Yarı yola geldik! 🌟',
    en: 'Halfway through the week! 🌟',
    es: '¡Mitad de semana! 🌟',
    fr: 'Déjà le milieu de la semaine ! 🌟',
    de: 'Halbzeit der Woche! 🌟',
    it: 'Metà settimana! 🌟',
    pt: 'Metade da semana! 🌟',
    ru: 'Середина недели! 🌟',
    ar: 'منتصف الأسبوع! 🌟',
    zh: '周中过半！ 🌟',
    hi: 'सप्ताह का मध्य आ गया! 🌟',
    ja: '週の半分が過ぎました！ 🌟'
  },
  notify_daily_body_4: {
    tr: 'Haftalık okuma serini korumak için bugün de kısa bir hikaye okumaya ne dersin?',
    en: 'Keep your reading streak alive! Read a short story today.',
    es: '¡Mantén viva tu racha de lectura! Lee una historia corta hoy.',
    fr: 'Conservez votre rythme de lecture ! Lisez une histoire courte aujourd\'hui.',
    de: 'Halte deine Leseserie aufrecht! Lies heute eine kurze Geschichte.',
    it: 'Mantieni viva la tua serie di letture! Leggi una breve storia oggi.',
    pt: 'Mantenha sua sequência de leitura activa! Leia uma história curta hoje.',
    ru: 'Поддерживайте свою серию чтения! Прочитайте сегодня короткую историю.',
    ar: 'حافظ على استمرار سلسلة قراءتك اليومية! اقرأ قصة قصيرة اليوم.',
    zh: '保持你的阅读记录！今天读一个简短的故事吧。',
    hi: 'अपनी पढ़ने की लकीर को जीवित रखें! आज एक छोटी कहानी पढ़ें।',
    ja: '読書記録を維持しましょう！今日は短いストーリーを読んでみませんか。'
  },
  notify_daily_title_5: {
    tr: 'Yeni dünyalar keşfetmeye hazır mısın? 🌍',
    en: 'Ready to explore new worlds? 🌍',
    es: '¿Listo para explorar nuevos mundos? 🌍',
    fr: 'Prêt à explorer de nouveaux mondes ? 🌍',
    de: 'Bereit, neue Welten zu erkunden? 🌍',
    it: 'Pronto a esplorare nuovi mondi? 🌍',
    pt: 'Pronto para explorar novos mundos? 🌍',
    ru: 'Готовы исследовать новые миры? 🌍',
    ar: 'هل أنت مستعد لاستكشاف عوالم جديدة؟ 🌍',
    zh: '准备好探索新世界了吗？ 🌍',
    hi: 'क्या आप नई दुनिया की खोज करने के लिए तैयार हैं? 🌍',
    ja: '新しい世界を探検する準備はできましたか？ 🌍'
  },
  notify_daily_body_5: {
    tr: 'Bugün seni sürükleyici bir macera hikayesi bekliyor. Hemen oku!',
    en: 'An exciting adventure story is waiting for you today. Let\'s read!',
    es: 'Hoy te espera una emocionante historia de aventuras. ¡Vamos a leer!',
    fr: 'Une histoire d\'aventure capturese vous attend aujourd\'hui. Bonne lecture !',
    de: 'Eine spannende Abenteuergeschichte wartet heute auf dich. Lass uns lesen!',
    it: 'Una storia d\'avventura avvincente ti aspetta oggi. Cominciamo a leggere!',
    pt: 'Uma história de aventura emocionante está te esperando hoje. Vamos ler!',
    ru: 'Сегодня вас ждет захватывающая приключенческая история. Скорее к чтению!',
    ar: 'قصة مغامرة مثيرة في انتظارك اليوم. دعنا نقرأ!',
    zh: '今天有一个引人入胜的冒险故事在等着你。快来阅读吧！',
    hi: 'आज एक रोमांचक साहसिक कहानी आपका इंतजार कर रही है. चलिए पढ़ते हैं!',
    ja: '今日はワクワクする冒険のストーリーがあなたを待っています。読んでみましょう！'
  },
  notify_daily_title_6: {
    tr: 'Hafta sonuna yaklaşırken... ☕',
    en: 'Unwind with a story... ☕',
    es: 'Relájate con una historia... ☕',
    fr: 'Se détendre avec une histoire... ☕',
    de: 'Entspanne dich mit einer Geschichte... ☕',
    it: 'Rilasati con una storia... ☕',
    pt: 'Relaxe com uma história... ☕',
    ru: 'Отдохните за чтением истории... ☕',
    ar: 'استرخ مع قصة... ☕',
    zh: '读个故事，放松一下... ☕',
    hi: 'एक कहानी के साथ आराम करें... ☕',
    ja: 'ストーリーでリラックスタイム... ☕'
  },
  notify_daily_body_6: {
    tr: 'Günün yorgunluğunu güzel bir İngilizce hikaye okuyarak atmaya ne dersin?',
    en: 'Relax and wind down from a busy week by reading a beautiful English story.',
    es: 'Relájate del cansancio del día leyendo una hermosa historia en inglés.',
    fr: 'Oubliez la fatigue de la journée en lisant une jolie histoire en anglais.',
    de: 'Lass den Tag entspannt ausklingen, indem du eine schöne englische Geschichte liest.',
    it: 'Dimentica la stanchezza del giorno leggendo una piacevole storia in inglese.',
    pt: 'Relaxe do cansaço do dia lendo uma bela história em inglês.',
    ru: 'Снимите усталость дня, прочитав интересную историю на английском.',
    ar: 'ما رأيك في التخلص من تعب اليوم بقراءة قصة إنجليزية لطيفة؟',
    zh: '读一个精美的英语故事，消除一天的疲惫怎么样？',
    hi: 'एक खूबसूरत अंग्रेजी कहानी पढ़कर दिन की थकान मिटाने के बारे में क्या ख्याल है?',
    ja: '素敵な英語のストーリーを読んで、1日の疲れを癒しませんか？'
  },
  notify_daily_title_7: {
    tr: 'Hafta sonu okuma zamanı! 🛋️',
    en: 'Weekend Reading Time! 🛋️',
    es: '¡Tiempo de leitura de fin de semana! 🛋️',
    fr: 'Temps de lecture du week-end ! 🛋️',
    de: 'Lesezeit am Wochenende! 🛋️',
    it: 'Tempo di leitura del fine settimana! 🛋️',
    pt: 'Hora da leitura de fim de semana! 🛋️',
    ru: 'Время чтения на выходных! 🛋️',
    ar: 'وقت القراءة في عطلة نهاية الأسبوع! 🛋️',
    zh: '周末阅读时间！ 🛋️',
    hi: 'सप्ताहांत में पढ़ने का समय! 🛋️',
    ja: '週末の読書タイム！ 🛋️'
  },
  notify_daily_body_7: {
    tr: 'Rahatla, kahveni al ve İngilizce öykünle güzel bir serüvene yelken aç.',
    en: 'Grab a cup of coffee and enjoy a wonderful journey with your English story.',
    es: 'Relájate, toma un café y embárcate en una hermosa aventura con tu historia en inglés.',
    fr: 'Détendez-vous, prenez un café et évadez-vous dans une jolie histoire en anglais.',
    de: 'Nimm dir einen Kaffee, mach es dir bequem und genieße deine englische Geschichte.',
    it: 'Prendi un caffè, mettiti comodo e goditi una bella avventura con la tua storia in inglese.',
    pt: 'Relaxe, tome um café e embarque em uma bela aventura com sua história em inglês.',
    ru: 'Расслабьтесь, выпейте чашечку кофе ve погрузитесь в интересную историю на английском.',
    ar: 'استرح، تناول قهوتك وانطلق في مغامرة جميلة مع قصتك الإنجليزية.',
    zh: '放松一下，喝杯咖啡，用你的英语故事开启一段奇妙の冒险之旅。',
    hi: 'आराम करें, अपनी कॉफी लें ve अपनी अंग्रेजी कहानी के साथ एक सुंदर यात्रा पर निकलें।',
    ja: 'リラックスしてコーヒーを片手に、英語のストーリーで素晴らしい旅に出かけましょう。'
  },
  btn_view: {
    tr: 'İncele', en: 'View', es: 'Ver', fr: 'Voir', de: 'Ansehen',
    it: 'Vedi', pt: 'Ver', ru: 'Посмотреть', ar: 'عرض', zh: '查看', hi: 'देखें', ja: '表示'
  },
  about_dear_reader: {
    tr: 'Sevgili Okurumuz,', en: 'Dear Reader,', es: 'Estimado Lector,', fr: 'Cher Lecteur,', de: 'Lieber Leser,',
    it: 'Caro Lettore,', pt: 'Caro Leitor,', ru: 'Уважаемый читатель,', ar: 'عزيزي القارئ،', zh: '亲爱的读者，', hi: 'प्रिय पाठक,', ja: '読者の皆様へ、'
  },
  about_text_1: {
    tr: 'Sizler için pratik, eğlenceli ve verimli bir İngilizce okuma uygulaması geliştirmeye çalıştık. Her bir öyküyü özenle seçip Türkçeleştirdik, kelime kelime çevirileri ve premium telaffuzları entegre ettik.',
    en: 'We tried to develop a practical, fun and efficient English reading application for you. We carefully selected and translated each story, integrated word-by-word translations and premium pronunciations.',
    es: 'Intentamos desarrollar una aplicación de lectura en inglés práctica, divertida y eficiente para usted. Seleccionamos y traducimos cuidadosamente cada historia, integrando traducciones palabra por palabra y pronunciaciones premium.',
    fr: 'Nous avons essayé de développer pour vous une application de lecture d\'anglais pratique, amusante et efficace. Nous avons soigneusement sélectionné et traduit chaque histoire, intégré des traductions mot à mot et des prononciations premium.',
    de: 'Wir haben versucht, eine praktische, unterhaltsame und effiziente Englisch-Lese-App für dich zu entwickeln. Jede Geschichte wurde sorgfältig ausgewählt und übersetzt, inklusive Wort-für-Wort-Übersetzungen und Premium-Aussprachen.',
    it: 'Abbiamo cercato di sviluppare per te un\'applicazione di lettura in inglese pratica, divertente ed efficiente. Abbiamo selezionato e tradotto con cura ogni storia, integrato traduzioni parola per parola e pronunce premium.',
    pt: 'Tentamos desenvolver um aplicativo de leitura de inglês prático, divertido e eficiente para você. Selecionamos e traduzimos cuidadosamente cada história, integramos traduções palavra por palavra e pronúncias premium.',
    ru: 'Мы постарались разработать для вас практичное, увлекательное и эффективное приложение для чтения на английском языке. Мы тщательно отобрали и перевели каждую историю, интегрировали пословный перевод и профессиональное произношение.',
    ar: 'لقد حاولنا تطوير تطبيق قراءة باللغة الإنجليزية عملي وممتع وفعال من أجلك. لقد اخترنا وترجمنا كل قصة بعناية، ودمجنا ترجمات الكلمات ونطق الكلمات الممتاز.',
    zh: '我们努力为您开发一款实用、有趣且高效的英语阅读应用。我们精心挑选并翻译了每个故事，整合了逐词翻译和优质发音。',
    hi: 'हमने आपके लिए एक व्यावहारिक, मजेदार और कुशल अंग्रेजी पठन ऐप विकसित करने का प्रयास किया। हमने प्रत्येक कहानी को ध्यान से चुना और उसका अनुवाद किया, शब्द-दर-शब्द अनुवाद और उच्चारणों को एकीकृत किया।',
    ja: '実用的で楽しく、効率的な英語リーディングアプリを目指して開発しました。すべてのストーリーを慎重に選定・翻訳し、単語ごとの訳文や高品質な音声を統合しています。'
  },
  about_text_2: {
    tr: 'Uygulamamızın gelişmesi ve daha fazla kişiye ulaşması için Google Play Store\'da görüşlerinizi belirterek bize puan verebilirsiniz!',
    en: 'To help our application grow and reach more people, you can rate us and share your feedback on the Google Play Store!',
    es: '¡Para ayudar a que nuestra aplicación crezca y llegue a más personas, puede calificarnos y compartir sus comentarios en Google Play Store!',
    fr: 'Pour aider notre application à grandir et à toucher plus de personnes, vous pouvez nous évaluer et partager vos commentaires sur le Google Play Store !',
    de: 'Um unserer App beim Wachsen zu helfen und mehr Menschen zu erreichen, kannst du uns im Google Play Store bewerten und dein Feedback teilen!',
    it: 'Per aiutare la nostra applicazione a crescere e raggiungere più persone, puoi valutarci e condividere il tuo feedback sul Google Play Store!',
    pt: 'Para ajudar nosso aplicativo a crescer e alcançar mais pessoas, você pode nos avaliar e compartilhar seu feedback na Google Play Store!',
    ru: 'Чтобы помочь нашему приложению расти и охватывать больше людей, вы можете оценить нас и оставить свой отзыв в Google Play Store!',
    ar: 'لمساعدة تطبيقنا على النمو والوصول إلى المزيد من الأشخاص، يمكنك تقييمنا ومشاركة ملاحظاتك على متجر Google Play!',
    zh: '为了帮助我们的应用成长并惠及更多人，您可以在 Google Play 商店中为我们评分并分享您的反馈！',
    hi: 'हमारे एप्लिकेशन को बढ़ने और अधिक लोगों तक पहुँचने में मदद करने के लिए, आप Google Play Store पर हमें रेटिंग दे सकते हैं और अपनी प्रतिक्रिया साझा कर सकते हैं!',
    ja: 'アプリのさらなる発展と普及のため、Google Playストアでご意見やご感想をお寄せいただき、評価をお願いいたします！'
  },
  about_rate_btn: {
    tr: 'Google Play\'de Yorum Yap & Puan Ver', en: 'Rate & Review on Google Play', es: 'Calificar y Reseñar en Google Play', fr: 'Évaluer et Noter sur Google Play', de: 'Bewerten & Rezensieren bei Google Play',
    it: 'Valuta e Recensisci su Google Play', pt: 'Avaliar na Google Play Store', ru: 'Оценить в Google Play', ar: 'التقييم والمراجعة على Google Play', zh: '在 Google Play 评分与评论', hi: 'Google Play पर रेट और समीक्षा करें', ja: 'Google Playで評価・レビューを書く'
  },
  share_title: {
    tr: 'Uygulamayı Paylaş', en: 'Share App', es: 'Compartir aplicación', fr: 'Partager l\'application', de: 'App teilen',
    it: 'Condividi app', pt: 'Compartilhar Aplicativo', ru: 'Поделиться приложением', ar: 'مشاركة التطبيق', zh: '分享应用', hi: '앱 साझा करें', ja: 'アプリを共有'
  },
  share_desc: {
    tr: 'İngilizce Öyküm ile harika hikayeler okuyup yeni kelimeler öğreniyorum! Sen de hemen indir ve bana katıl:',
    en: 'I read great stories and learn new words with My English Story! Download now and join me:',
    es: '¡Leo grandes historias y aprendo nuevas palabras con My English Story! Descárgalo ahora y únete a mí:',
    fr: 'Je lis de superbes histoires et j\'apprends de nouveaux mots avec My English Story ! Téléchargez maintenant et rejoignez-moi :',
    de: 'Ich lese tolle Geschichten und lerne neue Wörter mit My English Story! Lade es jetzt herunter und mach mit:',
    it: 'Leggo storie fantastiche e imparo nuovi vocaboli con My English Story! Scarica ora e unisciti a me:',
    pt: 'Eu leio ótimas histórias e aprendo novas palavras com o My English Story! Baixe agora e junte-se a mim:',
    ru: 'Я читаю отличные истории и учу новые слова с My English Story! Скачайте сейчас и присоединяйтесь ко мне:',
    ar: 'أنا أقرأ قصصاً رائعة وأتعلم كلمات جديدة مع My English Story! حمل التطبيق الآن وانضم إليّ:',
    zh: '我正在使用 My English Story 阅读精彩故事并学习新单词！立即下载并加入我：',
    hi: 'मैं My English Story के साथ बेहतरीन कहानियाँ पढ़ता हूँ और नए शब्द सीखता हूँ! अभी डाउनलोड करें और मेरे साथ जुड़ें:',
    ja: 'My English Storyで素晴らしいストーリーを読み、新しい単語を学んでいます！今すぐダウンロードして一緒に始めましょう：'
  },
  share_code_label: {
    tr: 'Davet Kodum:', en: 'My Invite Code:', es: 'Mi código de invitación:', fr: 'Mon code d\'invitation :', de: 'Mein Einladungscode:',
    it: 'Il mio codice d\'invito:', pt: 'Meu código de convite:', ru: 'Мой код приглашения:', ar: 'رمز الدعوة الخاص بي:', zh: '我的邀请码：', hi: 'मेरा आमंत्रण कोड:', ja: '招待コード：'
  },
  share_btn_copy_link: {
    tr: 'Paylaşım Bağlantısını Kopyala', en: 'Copy Share Link', es: 'Copiar enlace de compartir', fr: 'Copier le lien de partage', de: 'Freigabelink kopieren',
    it: 'Copia link di condivisione', pt: 'Copiar Link de Compartilhamento', ru: 'Копировать ссылку', ar: 'نسخ رابط المشاركة', zh: '复制分享链接', hi: 'साझाकरण लिंक कॉपी करें', ja: '共有リンクをコピー'
  },
  share_btn_copy_code: {
    tr: 'Davet Kodunu Kopyala', en: 'Copy Invite Code', es: 'Copiar código de invitación', fr: 'Copier le code d\'invitation', de: 'Einladungscode kopieren',
    it: 'Copia codice d\'invito', pt: 'Copiar Código de Convite', ru: 'Копировать код приглашения', ar: 'نسخ رمز الدعوة', zh: '复制邀请码', hi: 'आमंत्रण कोड कॉपी करें', ja: '招待コードをコピー'
  },
  share_toast_code_copied: {
    tr: 'Paylaşım Kodu panoya kopyalandı! 📋', en: 'Invite Code copied to clipboard! 📋', es: '¡Código de invitación copiado al portapapeles! 📋', fr: 'Code d\'invitation copié dans le presse-papiers ! 📋', de: 'Einladungscode in die Zwischenablage kopiert! 📋',
    it: 'Codice d\'invito copiato negli appunti! 📋', pt: 'Código de convite copiado para a área de transferência! 📋', ru: 'Код приглашения скопирован в буфер обмена! 📋', ar: 'تم نسخ رمز الدعوة إلى الحافظة! 📋', zh: '邀请码已复制到剪贴板！ 📋', hi: 'आमंत्रण कोड क्लिपबोर्ड पर कॉपी किया गया! 📋', ja: '招待コードをクリップボードにコピーしました！ 📋'
  },
  share_toast_link_copied: {
    tr: 'Uygulama Paylaşım Bağlantısı kopyalandı! 🔗', en: 'App Share Link copied! 🔗', es: '¡Enlace de la aplicación copiado! 🔗', fr: 'Lien de partage de l\'application copié ! 🔗', de: 'App-Freigabelink kopiert! 🔗',
    it: 'Link di condivisione dell\'app copiato! 🔗', pt: 'Link de compartilhamento do app copiado! 🔗', ru: 'Ссылка на приложение скопирована! 🔗', ar: 'تم نسخ رابط مشاركة التطبيق! 🔗', zh: '应用分享链接已复制！ 🔗', hi: 'ऐप साझाकरण लिंक कॉपी किया गया! 🔗', ja: 'アプリ共有リンクをコピーしました！ 🔗'
  },
  share_qr_label: {
    tr: 'Davet Kodu & QR Kodu', en: 'Invite Code & QR Code', es: 'Código de invitación y código QR', fr: 'Code d\'invitation et code QR', de: 'Einladungscode & QR-Code',
    it: 'Codice d\'invito e codice QR', pt: 'Código de Convite e Código QR', ru: 'Код приглашения и QR-код', ar: 'رمز الدعوة ورمز QR', zh: '邀请码和二维码', hi: 'आमंत्रण कोड और क्यूआर कोड', ja: '招待コード＆QRコード'
  },
  share_qr_desc: {
    tr: 'Arkadaşının kamerasına bu QR kodu taratarak paylaş.', en: 'Have your friend scan this QR code with their camera.', es: 'Pídele a tu amigo que escanee este código QR con su cámara.', fr: 'Faites scanner ce code QR par votre ami avec son appareil photo.', de: 'Lassen Sie Ihren Freund diesen QR-Code mit seiner Kamera scannen.',
    it: 'Fai scansionare questo codice QR al tuo amico con la fotocamera.', pt: 'Peça ao seu amigo para escanear este código QR com a câmera.', ru: 'Попросите друга отсканировать этот QR-код камерой.', ar: 'اجعل صديقك يمسح رمز QR هذا بكاميرته.', zh: '让你的朋友用相机扫描这个二维码。', hi: 'अपने मित्र से इस क्यूआर कोड को अपने कैमरे से स्कैन करवाएं।', ja: '友達のカメラでこのQRコードをスキャンしてもらいます。'
  },
  about_title: {
    tr: 'Hakkımızda & Puan Ver', en: 'About Us & Rate', es: 'Sobre nosotros y calificar', fr: 'À propos et évaluer', de: 'Über uns & Bewerten',
    it: 'Chi siamo e valuta', pt: 'Sobre nós e avaliar', ru: 'О нас и оценить', ar: 'من نحن والتقييم', zh: '关于我们 with 评分', hi: 'हमारे बारे में और रेट करें', ja: '会社情報＆評価'
  },
  oauth_cancel: {
    tr: 'İptal', en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen',
    it: 'Annulla', pt: 'Cancelar', ru: 'Отмена', ar: 'إلغاء', zh: '取消', hi: 'रद्द करें', ja: 'キャンセル'
  },
  oauth_continue_as: {
    tr: 'Olarak Devam Et', en: 'Continue as', es: 'Continuar como', fr: 'Continuer en tant que', de: 'Fortfahren als',
    it: 'Continua come', pt: 'Continuar como', ru: 'Продолжить как', ar: 'الاستمرار باسم', zh: '以该身份继续', hi: 'के रूप में जारी रखें', ja: 'として続行'
  },
  oauth_login_success: {
    tr: 'Giriş Başarılı!', en: 'Login Successful!', es: '¡Inicio de sesión correcto!', fr: 'Connexion réussie !', de: 'Anmeldung erfolgreich!',
    it: 'Accesso riuscito!', pt: 'Login com sucesso!', ru: 'Вход выполнен успешно!', ar: 'تم تسجيل الدخول بنجاح!', zh: '登录成功！', hi: 'लॉगिन सफल!', ja: 'ログイン成功！'
  },
  oauth_redirecting: {
    tr: 'Bağlantı doğrulandı, İngilizce Öyküm uygulamasına güvenle yönlendiriliyorsunuz...',
    en: 'Connection verified, redirecting you securely to İngilizce Öyküm...',
    es: 'Conexión verificado, redirigiéndole de forma segura a İngilizce Öyküm...',
    fr: 'Connexion vérifiée, redirection sécurisée vers İngilizce Öyküm...',
    de: 'Verbindung verifiziert, Sie werden sicher zu İngilizce Öyküm weitergeleitet...',
    it: 'Connessione verificata, ti stiamo reindirizzando in modo sicuro a İngilizce Öyküm...',
    pt: 'Conexão verificada, redirecionando você com segurança para İngilizce Öyküm...',
    ru: 'Соединение подтверждено, безопасное перенаправление в İngilizce Öyküm...',
    ar: 'تم التحقق من الاتصال، جاري إعادة توjيهك بأمان إلى İngilizce Öyküm...',
    zh: '连接已验证，正在安全地重定向到 İngilizce Öyküm...',
    hi: 'कनेक्शन सत्यापित, आपको सुरक्षित रूप से İngilizce Öyküm पर रीडायरेक्ट किया जा रहा है...',
    ja: '接続が確認されました。İngilizce Öykümへ安全にリダイレクトしています...'
  },
  premium_benefit_3_title: {
    tr: '700+ Premium Hikaye', en: '700+ Premium Stories', es: '700+ Historias Premium', fr: '700+ Histoires Premium', de: '700+ Premium-Geschichten',
    it: '700+ Storie Premium', pt: '700+ Histórias Premium', ru: '700+ Премиум историй', ar: '700+ قصص بريميوم', zh: '700+ 优质故事', hi: '700+ प्रीमियम कहानियां', ja: '700+ プレミアムストーリー'
  },
  premium_benefit_3_desc: {
    tr: 'En popüler 10 hikayeyle sınırlı kalmayın, 700\'den fazla dünya klasiği ve modern hikayeye anında ulaşın.', en: 'Don\'t be limited to the top 10 stories; access over 700 world classics and modern stories instantly.', es: 'No te limites a las 10 mejores historias; accede a más de 700 clásicos mundiales e historias modernas al instante.', fr: 'Ne vous limitez pas aux 10 meilleures histoires ; accédez instantanément à plus de 700 classiques mondiaux et histoires modernes.', de: 'Begrenzen Sie sich nicht auf die Top 10 Geschichten; greifen Sie sofort auf über 700 Weltklassiker und moderne Geschichten zu.',
    it: 'Non limitarti alle prime 10 storie; accedi istantaneamente a oltre 700 classici mondiali e storie moderne.', pt: 'Não se limite às 10 melhores histórias; acesse mais de 700 clássicos mundiais e histórias modernas instantaneamente.', ru: 'Не ограничивайтесь 10 историями; получите мгновенный доступ к более чем 700 мировым классическим и современным рассказам.', ar: 'لا تقتصر على أفضل 10 قصص؛ احصل على وصول فوري إلى أكثر من 700 من روائع الأدب العالمي والقصص الحديثة.', zh: '不仅限于前 10 个故事，即刻阅读 700 多篇世界名著和现代故事。', hi: 'शीर्ष 10 कहानियों तक सीमित न रहें; 700 से अधिक विश्व क्लासिक्स और आधुनिक कहानियों तक तुरंत पहुँच प्राप्त करें।', ja: '人気の10作品だけでなく、700以上の世界的な名作や現代ストーリーを制限なしで閲覧できます。'
  },
  premium_benefit_4_title: {
    tr: 'Tüm Seviyeleri Açın', en: 'Unlock All Levels', es: 'Desbloquea todos los niveles', fr: 'Débloquer tous les niveaux', de: 'Alle Stufen freischalten',
    it: 'Sblocca tutti i livelli', pt: 'Desbloquear todos os níveis', ru: 'Разблокировать все уровни', ar: 'فتح جميع المستويات', zh: '解锁所有级别', hi: 'सभी स्तरों को अनलॉक करें', ja: 'すべてのレベルをアンロック'
  },
  premium_benefit_4_desc: {
    tr: 'A1\'den C1\'e kadar tüm zorluk seviyelerini açın, dil öğrenme hedefinize uygun seviyelerde okuma yapın.', en: 'Unlock all difficulty levels from A1 to C1, and read at levels that suit your language learning goals.', es: 'Desbloquea todos los niveles de dificultad de A1 a C1 y lee en los niveles que se adapten a tus objetivos de aprendizaje.', fr: 'Débloquez tous les niveaux de difficulty de A1 à C1 et lisez aux niveaux qui correspondent à vos objectifs d\'apprentissage.', de: 'Schalten Sie alle Schwierigkeitsgrade von A1 bis C1 frei und lesen Sie auf Niveaus, die Ihren Sprachlernzielen entsprechen.',
    it: 'Sblocca tutti i livelli di difficoltà da A1 a C1 e leggi nei livelli adatti ai tuoi obiettivi di apprendimento.', pt: 'Desbloqueie todos os níveis de dificuldade de A1 a C1 e leia em níveis que correspondam aos seus objetivos de aprendizado.', ru: 'Разблокируйте все уровни сложности от A1 до C1 и читайте на уровнях, соответствующих вашим целям изучения языка.', ar: 'افتح جميع مستويات الصعوبة من A1 إلى C1، واقرأ في المستويات التي تناسب أهدافك في تعلم اللغة.', zh: '解锁从 A1 到 C1 的所有难度级别，并阅读适合您语言学习目标的内容。', hi: 'A1 से C1 तक के सभी कठिनाई स्तरों को अनलॉक करें, और अपनी भाषा सीखने के लक्ष्यों के अनुकूल स्तरों पर पढ़ें।', ja: 'A1からC1までのすべての難易度レベルをアンロックし、ご自身の学習目標に合わせた読書が可能です。'
  },
  oauth_title_google: {
    tr: 'İngilizce Öyküm\'e izin verin', en: 'Allow İngilizce Öyküm', es: 'Permitir İngilizce Öyküm', fr: 'Autoriser İngilizce Öyküm', de: 'İngilizce Öyküm zulassen',
    it: 'Consenti a İngilizce Öyküm', pt: 'Permitir İngilizce Öyküm', ru: 'Разрешить İngilizce Öyküm', ar: 'السماح لـ İngilizce Öyküm', zh: '允许 İngilizce Öyküm', hi: 'İngilizce Öyküm को अनुमति दें', ja: 'İngilizce Öyküm を許可'
  },
  oauth_action_account: {
    tr: 'İşlem yapılacak hesap:', en: 'Account to proceed:', es: 'Cuenta a proceder:', fr: 'Compte à traiter :', de: 'Konto zum Fortfahren:',
    it: 'Account da procedere:', pt: 'Conta a prosseguir:', ru: 'Аккаунт для продолжения:', ar: 'الحساب الذي سيتم استخدامه:', zh: '要继续的账户：', hi: 'आगे बढ़ने के लिए खाता:', ja: '処理するアカウント：'
  },
  oauth_wants_access: {
    tr: 'İNGİLİZCE ÖYKÜM UYGULAMASI ŞUNLARA ERİŞMEK İSTİYOR:', en: 'İNGİLİZCE ÖYKÜM APP WANTS TO ACCESS:', es: 'LA APLICACIÓN İNGİLİZCE ÖYKÜM QUIERE ACCEDER A:', fr: 'L\'APPLICATION İNGİLİZCE ÖYKÜM SOUHAITE ACCÉDER À :', de: 'İNGİLİZCE ÖYKÜM APP MÖCHTE ZUGREIFEN AUF:',
    it: 'L\'APP İNGİLİZCE ÖYKÜM VUOLE ACCEDERE A:', pt: 'O APLICATIVO İNGİLİZCE ÖYKÜM DESEJA ACESSAR:', ru: 'ПРИЛОЖЕНИЕ İNGİLİZCE ÖYKÜM ЗАПРАШИВАЕТ ДОСТУП К:', ar: 'تطبيق İNGİLİZCE ÖYKÜM YERİD EL-WUSUL ILA:', zh: 'İNGİLİZCE ÖYKÜM 应用想要访问：', hi: 'İNGİLİZCE ÖYKÜM ऐप पहुंचना चाहता है:', ja: 'İNGİLİZCE ÖYKÜM アプリがアクセスを求めています：'
  },
  oauth_personal_info: {
    tr: 'Kişisel Bilgiler:', en: 'Personal Info:', es: 'Información personal:', fr: 'Infos personnelles :', de: 'Persönliche Infos:',
    it: 'Informazioni personali:', pt: 'Informações personali:', ru: 'Личные данные:', ar: 'معلومات شخصية:', zh: '个人信息：', hi: 'व्यक्तिगत जानकारी:', ja: '個人情報：'
  },
  oauth_personal_info_desc: {
    tr: 'Adınız, profil resminiz ve temel hesap bilgileriniz.', en: 'Your name, profile picture, and basic account details.', es: 'Su nombre, foto de perfil y detalles básicos de la cuenta.', fr: 'Votre nom, photo de profil et détails de base du compte.', de: 'Ihr Name, Profilbild und grundlegende Kontodetails.',
    it: 'Il tuo nome, immagine del profilo e dettagli dell\'account di base.', pt: 'Seu nome, foto do perfil e detalhes básicos da conta.', ru: 'Ваше имя, аватар и основные данные аккаунта.', ar: 'اسمك وصورة ملفك الشخصي وتفاصيل الحساب الأساسية.', zh: '您的姓名、头像和基本账户信息。', hi: 'आपका नाम, प्रोफ़ाइल चित्र, और बुनियादी खाता विवरण।', ja: 'お名前、プロフィール画像、基本アカウント情報。'
  },
  oauth_email_address: {
    tr: 'E-posta adresi:', en: 'Email address:', es: 'Dirección de correo electrónico:', fr: 'Adresse e-mail :', de: 'E-Mail-Adresse:',
    it: 'Indirizzo e-mail:', pt: 'Endereço de e-mail:', ru: 'Адрес эл. почты:', ar: 'البريد الإلكتروني:', zh: '电子邮件地址：', hi: 'ईमेल पता:', ja: 'メールアドレス：'
  },
  oauth_email_address_desc: {
    tr: 'Google hesabınıza kayıtlı birincil e-posta adresi.', en: 'Primary email address registered to your Google account.', es: 'Dirección de correo electrónico principal registrada en su cuenta de Google.', fr: 'Adresse e-mail principale enregistrée sur votre compte Google.', de: 'Primäre E-Mail-Adresse, die in Ihrem Google-Konto registriert ist.',
    it: 'Indirizzo e-mail principale registrato sul tuo account Google.', pt: 'Endereço de e-mail principal registrado na sua conta do Google.', ru: 'Основной адрес электронной почты вашего аккаунта Google.', ar: 'البريد الإلكتروني الأساسي المسجل في حساب Google الخاص بك.', zh: '注册到您的 Google 账户的主要电子邮件地址。', hi: 'आपके Google खाते में पंजीकृत प्राथमिक ईमेल पता।', ja: 'Google アカウントに登録されているプライマリ メールアドレス。'
  },
  oauth_consent_desc: {
    tr: 'Onayla butonuna tıklayarak İngilizce Öyküm\'ün verilerinizi Hizmet Şartları ve Gizlilik Politikası kapsamında kullanmasına izin vermiş olursunuz.', en: 'By clicking approve, you allow İngilizce Öyküm to use your data under the Terms of Service and Privacy Policy.', es: 'Al hacer clic en aprobar, permite que İngilizce Öyküm use sus datos según los Términos de servicio y la Política de privacidad.', fr: 'En cliquant sur approuver, vous autorisez İngilizce Öyküm à utiliser vos données conformément aux Conditions d\'utilisation et à la Politique de confidentialité.', de: 'Mit dem Klick auf Zustimmen erlauben Sie İngilizce Öyküm, Ihre Daten gemäß den Nutzungsbedingungen und der Datenschutzerklärung zu verwenden.',
    it: 'Cliccando su approva, consenti a İngilizce Öyküm di utilizzare i tuoi dati in base ai Termini di servizio e all\'Informativa sulla privacy.', pt: 'Ao clicar em aprovar, você permite que o İngilizce Öyküm use seus datos sob os Termos de Serviço e a Política de Privacidade.', ru: 'Нажимая «Принять», вы разрешаете İngilizce Öyküm использовать ваши данные в соответствии с Условиями использования и Политикой конфиденциальности.', ar: 'بالنقر على موافقة، فإنك تسمح لـ İngilizce Öyküm باستخدام بياناتك بموجب شروط الخدمة وسياسة الخصوصية.', zh: '点击同意即表示您允许 İngilizce Öyküm 根据服务条款 and 隐私政策使用您的数据。', hi: 'स्वीकार करें पर क्लिक करके, आप İngilizce Öyküm को सेवा की शर्तों और गोपनीयता नीति के तहत अपने डेटा का उपयोग करने की अनुमति देते हैं।', ja: '「同意」をクリックすることで、利用規約およびプライバシーポリシーに従ってİngilizce Öykümがデータを使用することを許可したことになります。'
  },
  oauth_confirm_btn: {
    tr: 'Bağlantıyı Onayla', en: 'Confirm Connection', es: 'Confirmar conexión', fr: 'Confirmer la connexion', de: 'Verbindung bestätigen',
    it: 'Conferma connessione', pt: 'Confirmar conexão', ru: 'Подтвердить соединение', ar: 'تأكيد الاتصال', zh: '确认连接', hi: 'कनेक्शन की पुष्टि करें', ja: '接続を確認'
  },
  oauth_title_facebook: {
    tr: 'Uygulama Yetkilendirme', en: 'App Authorization', es: 'Autorización de aplicación', fr: 'Autorisation de l\'application', de: 'App-Autorisierung',
    it: 'Autorizzazione app', pt: 'Autorização do aplicativo', ru: 'Авторизация приложения', ar: 'تفويض التطبيق', zh: '应用授权', hi: '应用授权', ja: 'アプリ認証'
  },
  oauth_desc_facebook: {
    tr: 'İngilizce Öyküm uygulaması hesabınıza bağlanmak istiyor.', en: 'İngilizce Öyküm app wants to connect to your account.', es: 'La aplicación İngilizce Öyküm quiere conectarse a su cuenta.', fr: 'L\'application İngilizce Öyküm souhaite se connecter à votre compte.', de: 'İngilizce Öyküm App möchte sich mit Ihrem Konto verbinden.',
    it: 'L\'app İngilizce Öyküm desidera connettersi al tuo account.', pt: 'O aplicativo İngilizce Öyküm deseja se conectar à sua conta.', ru: 'Приложение İngilizce Öyküm хочет подключиться к вашему аккаунту.', ar: 'يريد تطبيق İngilizce Öyküm الاتصال بحسابك.', zh: 'İNGİLİZCE ÖYKÜM 应用想要连接到您的账户。', hi: 'İngilizce Öyküm ऐप आपके खाते से जुड़ना चाहता है。', ja: 'İngilizce Öyküm アプリがアクセスを求めています：'
  },
  oauth_logging_in_fb: {
    tr: 'Facebook ile Giriş yapılıyor', en: 'Logging in with Facebook', es: 'Iniciando sesión con Facebook', fr: 'Connexion avec Facebook', de: 'Anmeldung mit Facebook',
    it: 'Accesso con Facebook', pt: 'Entrando com o Facebook', ru: 'Вход через Facebook', ar: 'تسجيل الدخول باستخدام فيسبوك', zh: '正在使用 Facebook 登录', hi: 'फेसबुक से लॉग इन किया जा रहा है', ja: 'Facebookでログイン中'
  },
  oauth_permissions_requested: {
    tr: 'İSTENEN İZİNLER:', en: 'REQUESTED PERMISSIONS:', es: 'PERMISOS SOLICITADOS:', fr: 'AUTORISATIONS DEMANDÉES :', de: 'ANGEFORDERTE BERECHTIGUNGEN:',
    it: 'PERMESSI RICHIESTI:', pt: 'PERMISSÕES SOLICITADAS:', ru: 'ЗАПРАШИВАЕМЫЕ РАЗРЕШЕНИЯ:', ar: 'الأذونات المطلوبة:', zh: '请求的权限：', hi: 'अनुरोधित अनुमतियाँ:', ja: '要求された権限：'
  },
  oauth_perm_public_profile: {
    tr: '• Herkese açık profil bilgileriniz (isim, resim)', en: '• Your public profile info (name, picture)', es: '• Su información de perfil público (nombre, foto)', fr: '• Vos informations de profil public (nom, photo)', de: '• Ihre öffentlichen Profilinfos (Name, Bild)',
    it: '• Le tue informazioni del profilo pubblico (nome, foto)', pt: '• Suas informações de perfil público (nome, foto)', ru: '• Информация вашего общедоступного профиля (имя, фото)', ar: '• معلومات ملفك الشخصي العامة (الاسم، الصورة)', zh: '• 您的公开个人资料信息（姓名、照片）', hi: '• आपकी सार्वजनिक प्रोफ़ाइल जानकारी (नाम, चित्र)', ja: '• 公開プロフィール情報（名前、写真）'
  },
  oauth_perm_email: {
    tr: '• E-posta adresiniz', en: '• Your email address', es: '• Su dirección de correo electrónico', fr: '• Votre adresse e-mail', de: '• Ihre E-Mail-Adresse',
    it: '• Il tuo indirizzo e-mail', pt: '• Seu endereço de e-mail', ru: '• Ваш адрес электронной почты', ar: '• عنوان بريدك الإلكتروني', zh: '• 您的电子邮件地址', hi: '• आपका ईमेल पता', ja: '• メールアドレス'
  },
  // Profile edit
  profile_edit_title: {
    tr: 'Profili Düzenle', en: 'Edit Profile', es: 'Editar Perfil', fr: 'Modifier le Profil', de: 'Profil bearbeiten',
    it: 'Modifica Profilo', pt: 'Editar Perfil', ru: 'Редактировать profil', ar: 'تعديل الملف الشخصي', zh: '编辑个人资料', hi: 'प्रोफ़ाइल संपादित करें', ja: 'プロフィール編集'
  },
  profile_avatar_selected: {
    tr: 'Seçilen Avatar', en: 'Selected Avatar', es: 'Avatar seleccionado', fr: 'Avatar sélectionné', de: 'Ausgewählter Avatar',
    it: 'Avatar selezionato', pt: 'Avatar selecionado', ru: 'Выбранный аватар', ar: 'الرمز التعبيري المحدد', zh: '已选头像', hi: 'चयनित अवतार', ja: '選択されたアバター'
  },
  profile_avatar_select: {
    tr: 'PROFİL RESMİ SEÇİN', en: 'CHOOSE A PROFILE PICTURE', es: 'ELIGE UNA FOTO DE PERFIL', fr: 'CHOISIR UNE PHOTO DE PROFIL', de: 'WÄHLEN SIE EIN PROFILBILD',
    it: 'SCEGLI UN\'IMMAGINE DI PROFILO', pt: 'ESCOLHA UMA FOTO DE PERFIL', ru: 'ВЫБЕРИТЕ ФОТО ПРОФИЛЯ', ar: 'اختر صورة الملف الشخصي', zh: '选择个人头像', hi: 'एक प्रोफ़ाइल चित्र चुनें', ja: 'プロフィール画像を選択してください'
  },
  profile_name_label: {
    tr: 'İSMİNİZ', en: 'YOUR NAME', es: 'TU NOMBRE', fr: 'VOTRE NOM', de: 'IHR NAME',
    it: 'IL TUO NOME', pt: 'SEU NOME', ru: 'ВАШЕ ИМЯ', ar: 'اسمك', zh: '您的名字', hi: 'आपका नाम', ja: 'お名前'
  },
  profile_name_placeholder: {
    tr: 'İsim belirtilmemiş (Boş bırakabilirsiniz)', en: 'No name specified (You can leave it blank)', es: 'Sin nombre especificado (Puedes dejarlo en blanco)', fr: 'Aucun nom spécifié (Vous pouvez laisser vide)', de: 'Kein Name angegeben (Sie können ihn leer lassen)',
    it: 'Nessun nome specificato (Puoi lasciarlo vuoto)', pt: 'Nenhum nome especificado (Você pode deixar em branco)', ru: 'Имя не указано (можно оставить пустым)', ar: 'لم يتم تحديد اسم (يمكنك ترke فارغًا)', zh: '未指定名字（可保持空白）', hi: 'कोई नाम निर्दिष्ट नहीं है (आप इसे खाली छोड़ सकते हैं)', ja: '名前が指定されていません（空白でも構いません）'
  },
  profile_name_length_error: {
    tr: 'İsim 3-25 karakter arasında olmalıdır. ⚠️', en: 'Name must be between 3 and 25 characters. ⚠️', es: 'El nombre debe tener entre 3 y 25 caracteres. ⚠️', fr: 'Le nom doit contenir entre 3 et 25 caractères. ⚠️', de: 'Der Name muss zwischen 3 and 25 Zeichen lang sein. ⚠️',
    it: 'Il nome deve essere compreso tra 3 e 25 caratteri. ⚠️', pt: 'O nome deve ter entre 3 e 25 caracteres. ⚠️', ru: 'Имя должно содержать от 3 до 25 символов. ⚠️', ar: 'yazılan isim 3-25 karakter arasında olmalıdır. ⚠️', zh: '名字必须在 3 到 25 个字符之间。⚠️', hi: 'नाम 3 से 25 वर्णों के बीच होना चाहिए। ⚠️', ja: '名前は3〜25文字である必要があります。⚠️'
  },
  profile_name_chars_error: {
    tr: 'İsim sadece harf, sayı ve boşluk içerebilir. ⚠️', en: 'Name can only contain letters, numbers, and spaces. ⚠️', es: 'El nombre solo puede contener letras, números y espacios. ⚠️', fr: 'Le nom ne peut contenir que des lettres, des chiffres et des espaces. ⚠️', de: 'Der Name darf nur Buchstaben, Zahlen und Leerzeichen enthalten. ⚠️',
    it: 'Il nome può contenere solo lettere, numeri e spazi. ⚠️', pt: 'O nome só pode conter letras, números e espaços. ⚠️', ru: 'Имя может содержать только буквы, цифры и пробелы. ⚠️', ar: 'İsim sadece harf, sayı ve boşluk içerebilir. ⚠️', zh: '名字只能包含字母、数字和空格。⚠️', hi: 'नाम में केवल अक्षर, संख्या और स्थान हो सकते हैं। ⚠️', ja: '名前には文字、数字、スペースのみを含めることができます。⚠️'
  },
  profile_name_inappropriate_error: {
    tr: 'Girdiğiniz isim uygunsuz veya yetkili unvanları (admin, yönetici vb.) içeremez. ⚠️', en: 'The name you entered cannot contain inappropriate content or administrative titles (admin, manager, etc.). ⚠️', es: 'El nombre ingresado no puede contener contenido inapropiado o títulos administrativos (administrador, gerente, etc.). ⚠️', fr: 'Le nom saisi ne peut pas contenir de contenu inapproprié ou de titres administratifs (admin, gestionnaire, etc.). ⚠️', de: 'Der eingegebene Name darf keine unangemessenen Inhalte oder administrative Titel (Admin, Manager usw.) enthalten. ⚠️',
    it: 'Il nome inserito non può contenere contenuti inappropriati o titoli amministrativi (admin, manager, ecc.). ⚠️', pt: 'O nome inserido não pode contener conteúdo inadequado ou títulos administrativos (admin, gerente, etc.). ⚠️', ru: 'Введенное имя не может содержать неприемлемый контент или административные титулы (администратор, менеджер и т. д.). ⚠️', ar: 'Girdiğiniz isim uygunsuz içeremez. ⚠️', zh: '您输入的名字不能包含不当内容或管理员头衔（admin、管理员等）。⚠️', hi: 'आपके द्वारा दर्ज किया गया नाम अनुचित सामग्री नहीं रख सकता। ⚠️', ja: '入力された名前には、不適切なコンテンツや管理者の肩書き（管理者、マネージャーなど）を含めることはできません。⚠️'
  },
  profile_updated_toast: {
    tr: 'Profiliniz başarıyla güncellendi! 🎉', en: 'Profile successfully updated! 🎉', es: '¡Perfil actualizado con éxito! 🎉', fr: 'Profil mis à jour avec succès ! 🎉', de: 'Profil erfolgreich aktualisiert! 🎉',
    it: 'Profilo aggiornato con successo! 🎉', pt: 'Perfil atualizado com sucesso! 🎉', ru: 'Профиль успешно обновлен! 🎉', ar: 'تم تحديث الملف الشخصي بنجاح! 🎉', zh: '个人资料更新成功！🎉', hi: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई! 🎉', ja: 'プロフィールが正常に更新されました！🎉'
  },
  profile_avatar_change_title: {
    tr: 'Profil Resmini Değiştir', en: 'Change Profile Picture', es: 'Cambiar foto de perfil', fr: 'Modifier la photo de profil', de: 'Profilbild ändern',
    it: 'Cambia immagine del profilo', pt: 'Alterar foto do perfil', ru: 'Изменить фото профиля', ar: 'تغيير صورة الملف الشخصي', zh: '更改头像', hi: 'प्रोफ़ाइल चित्र बदलें', ja: 'プロフィール画像を変更'
  },
  profile_avatar_change_btn: {
    tr: 'DEĞİŞTİR', en: 'CHANGE', es: 'CAMBIAR', fr: 'MODIFIER', de: 'ÄNDERN',
    it: 'CAMBIA', pt: 'ALTERAR', ru: 'ИЗМЕНИТЬ', ar: 'تغيير', zh: '更改', hi: 'बदलें', ja: '変更'
  },
  profile_name_not_specified: {
    tr: '(İsim belirtilmedi)', en: '(No name specified)', es: '(Sin nombre especificado)', fr: '(Nom non spécifié)', de: '(Kein Name angegeben)',
    it: '(Nome non specificato)', pt: '(Nome não especificado)', ru: '(Имя не указано)', ar: '(لم يتم تحديد اسم)', zh: '(未指定名字)', hi: '(कोई नाम निर्दिष्ट नहीं है)', ja: '(名前未指定)'
  },
  reading_skip_quiz_toast: {
    tr: 'Quizi premium ayrıcalığı ile geçtiniz! Keyifli okumalar. 🚀', en: 'You skipped the quiz with Premium! Happy reading. 🚀', es: '¡Te saltaste el cuestionario con Premium! Feliz lectura. 🚀', fr: 'Vous avez sauté le quiz avec Premium ! Bonne lecture. 🚀', de: 'Sie haben das Quiz mit Premium übersprungen! Viel Spaß beim Lesen. 🚀',
    it: 'Hai saltato il quiz con Premium! Buona leitura. 🚀', pt: 'Você pulou o quiz com o Premium! Boa leitura. 🚀', ru: 'Вы пропустили тест благодаря Премиум! Приятного чтения. 🚀', ar: 'لقد تخطيت الاختبار باستخدام بريميوم! قراءة ممتعة. 🚀', zh: '您使用会员特权跳过了测试！阅读愉快。🚀', hi: 'आपने premium के साथ quiz छोड़ दिया! हैप्पी रीडिंग। 🚀', ja: 'プレミアム特典でクイズをスキップしました！読書をお楽しみください。🚀'
  },
  next_life_label: {
    tr: 'Bir sonraki can:', en: 'Next life in:', es: 'Próxima vida en:', fr: 'Prochaine vie dans :', de: 'Nächstes Leben in:',
    it: 'Prossima vita tra:', pt: 'Próxima vida em:', ru: 'Следующая жизнь через:', ar: 'الحياة التالية خلال:', zh: '下一次生命：', hi: 'अगला जीवन:', ja: '次のライフまで:'
  },
  status_refilling: {
    tr: 'Doluyor...', en: 'Refilling...', es: 'Cargando...', fr: 'Recharge...', de: 'Aufladen...',
    it: 'Ricarica...', pt: 'Recarregando...', ru: 'Восстановление...', ar: 'جاري الشحن...', zh: '充能中...', hi: 'भर रहा है...', ja: '回復中...'
  },
  quiz_streak_tooltip: {
    tr: 'Can kazanmak için hata yapmadan 15 doğru cevap verin!', en: 'Give 15 correct answers without mistakes to earn a life!', es: '¡Da 15 respuestas correctas sin errores para ganar una vida!', fr: 'Donnez 15 bonnes réponses sans erreur pour gagner une vie !', de: 'Geben Sie 15 richtige Antworten ohne Fehler, um ein Leben zu erhalten!',
    it: 'Dai 15 risposte corrette senza errori per ottenere una vita!', pt: 'Dê 15 respostas corretas sem erros para ganhar una vita!', ru: 'Дайте 15 правильных ответов без ошибок, чтобы получить жизнь!', ar: 'أعطِ 15 إجابة صحيحة دون أخطاء لكسب حياة!', zh: '无失误连续答对 15 道题即可获得 1 点生命值！', hi: 'एक जीवन अर्जित करने के लिए बिना किसी गलती के 15 सही उत्तर दें!', ja: 'ノーミスで15問連続正解するとライフを1獲得できます！'
  },
  quiz_streak_label: {
    tr: 'Seri: {streak}/15', en: 'Streak: {streak}/15', es: 'Racha: {streak}/15', fr: 'Série : {streak}/15', de: 'Serie: {streak}/15',
    it: 'Serie: {streak}/15', pt: 'Racha: {streak}/15', ru: 'Серия: {streak}/15', ar: 'النشاط: {streak}/15', zh: '连击：{streak}/15', hi: 'सिलसिला: {streak}/15', ja: '連続: {streak}/15'
  },
  quiz_lives_label: {
    tr: 'Can', en: 'Lives', es: 'Vidas', fr: 'Vies', de: 'Leben',
    it: 'Vite', pt: 'Vidas', ru: 'Жизни', ar: 'أرواح', zh: '生命值', hi: 'जीवन', ja: 'ライフ'
  },
  profile_user_title: {
    tr: 'İngilizce Öyküm Okuru', en: 'My English Story Reader', es: 'Lector de My English Story', fr: 'Lecteur de My English Story', de: 'My English Story Leser',
    it: 'Lettore di My English Story', pt: 'Leitor do My English Story', ru: 'Читатель My English Story', ar: 'قارئ My English Story', zh: 'My English Story 读者', hi: 'My English Story पाठक', ja: 'My English Story リーダー'
  },
  share_preparing: {
    tr: '{platform} için hazırlanıyor...', en: 'Preparing for {platform}...', es: 'Preparándose para {platform}...', fr: 'Préparation pour {platform}...', de: 'Vorbereitung für {platform}...',
    it: 'Preparazione per {platform}...', pt: 'Preparando para {platform}...', ru: 'Подготовка к {platform}...', ar: 'جاري التحضير لـ {platform}...', zh: '正在为 {platform} 做准备...', hi: '{platform} के लिए तैयारी कर रहा है...', ja: '{platform} の準備中...'
  },
  auth_login_google_title: {
    tr: 'Google ile Giriş Yap', en: 'Log In with Google', es: 'Iniciar sesión con Google', fr: 'Se connecter avec Google', de: 'Mit Google anmelden',
    it: 'Accedi con Google', pt: 'Entrar com o Google', ru: 'Войти через Google', ar: 'تسجيل الدخول باستخدام Google', zh: '使用 Google 登录', hi: 'Google के साथ लॉग इन करें', ja: 'Googleでログイン'
  },
  auth_login_facebook_title: {
    tr: 'Facebook ile Giriş Yap', en: 'Log In with Facebook', es: 'Iniciar sesión con Facebook', fr: 'Se connecter avec Facebook', de: 'Mit Facebook anmelden',
    it: 'Accedi con Facebook', pt: 'Entrar com o Facebook', ru: 'Войти через Facebook', ar: 'تسجيل الدخول باستخدام فيسبوك', zh: '使用 Facebook 登录', hi: 'फेसबुक के साथ लॉग इन करें', ja: 'Facebookでログイン'
  },
  auth_login_apple_title: {
    tr: 'Apple ile Giriş Yap', en: 'Log In with Apple', es: 'Iniciar sesión con Apple', fr: 'Se connecter avec Apple', de: 'Mit Apple anmelden',
    it: 'Accedi con Apple', pt: 'Entrar com o Apple', ru: 'Войти через Apple', ar: 'تسجيل الدخول باستخدام Apple', zh: '使用 Apple 登录', hi: 'Apple के साथ लॉग in करें', ja: 'Appleでログイン'
  },
  auth_login_email_title: {
    tr: 'E-posta ile Giriş Yap', en: 'Log In with Email', es: 'Iniciar sesión con correo', fr: 'Se connecter avec e-mail', de: 'Mit E-Mail anmelden',
    it: 'Accedi con e-mail', pt: 'Entrar com e-mail', ru: 'Войти через эл. почту', ar: 'تسجيل الدخول بالبريد الإلكتروني', zh: '使用邮箱登录', hi: 'ईमेल के साथ लॉग इन करें', ja: 'メールでログイン'
  },
  auth_gmail_desc: {
    tr: 'Gmail adresinizi ve şifrenizi girerek bağlanın.', en: 'Connect by entering your Gmail address and password.', es: 'Conéctese ingresando su dirección de Gmail y contraseña.', fr: 'Connectez-vous en saisissant votre adresse Gmail et votre mot de passe.', de: 'Verbinden Sie sich, indem Sie Ihre Gmail-Adresse und Ihr Passwort eingeben.',
    it: 'Accedi inserendo il tuo indirizzo Gmail e password.', pt: 'Conecte-se inserindo seu endereço do Gmail e senha.', ru: 'Войдите, введя свой adres Gmail и пароль.', ar: 'اتصل بإدخال عنوان Gmail وكلمة المرور الخاصة بك.', zh: '输入您的 Gmail 地址和密码进行连接。', hi: 'अपना जीमेल पता और पासवर्ड दर्ज करके कनेक्ट करें।', ja: 'Gmailアドレスとパスワードを入力して接続します。'
  },
  auth_fb_desc: {
    tr: 'Facebook e-posta adresinizi ve şifrenizi girerek bağlanın.', en: 'Connect by entering your Facebook email and password.', es: 'Conéctese ingresando su correo electrónico y contraseña de Facebook.', fr: 'Connectez-vous en saisissant votre e-mail et votre mot de passe Facebook.', de: 'Verbinden Sie sich, indem Sie Ihre Facebook-E-Mail-Adresse und Ihr Passwort eingeben.',
    it: 'Accedi inserendo la tua e-mail e password di Facebook.', pt: 'Conecte-se inserindo seu e-mail e senha do Facebook.', ru: 'Войдите, введя свою эл. почту и пароль Facebook.', ar: 'اتصل بإدخال بريدك الإلكتروني في فيسبوك وكلمة المرور.', zh: '输入您的 Facebook 邮箱和密码进行连接。', hi: 'अपना फेसबुक ईमेल और पासवर्ड दर्ज करके कनेक्ट करें。', ja: 'Facebookのメールアドレスとパスワードを入力して接続します。'
  },
  auth_apple_desc: {
    tr: 'Apple ID e-posta adresinizi ve şifrenizi girerek bağlanın.', en: 'Connect by entering your Apple ID email and password.', es: 'Conéctese ingresando su correo electrónico y contraseña de Apple ID.', fr: 'Connectez-vous en saisissant votre e-mail et votre mot de passe Apple ID.', de: 'Verbinden Sie sich, indem Sie Ihre Apple-ID und Ihr Passwort eingeben.',
    it: 'Accedi inserendo la tua e-mail e password dell\'Apple ID.', pt: 'Conecte-se inserindo seu e-mail e senha do Apple ID.', ru: 'Войдите, введя свой Apple ID и пароль.', ar: 'اتصل بإدخال معرف Apple وكلمة المرور الخاصة بك.', zh: '输入您的 Apple ID 邮箱和密码进行连接。', hi: 'अपना एप्पल आईडी & पासवर्ड दर्ज करके कनेक्ट करें。', ja: 'Apple IDのメールアドレスとパスワードを入力して接続します。'
  },
  auth_email_desc: {
    tr: 'Kullanıcı adınızı ve şifrenizi girerek giriş yapın.', en: 'Log in by entering your username and password.', es: 'Inicie sesión ingresando su nombre de usuario y contraseña.', fr: 'Connectez-vous en saisissant votre nom d\'utilisateur et votre mot de passe.', de: 'Melden Sie sich an, indem Sie Ihren Benutzernamen und Ihr Passwort eingeben.',
    it: 'Accedi inserendo il tuo nome utente e password.', pt: 'Faça login inserindo seu nome de usuário e senha.', ru: 'Войдите, введя свое имя пользователя и пароль.', ar: 'قم بتسجيل الدخول بإدخال اسم المستخدم وكلمة المرور.', zh: '输入您的用户名和密码进行登录。', hi: 'अपना उपयोगकर्ता नाम और पासवर्ड दर्ज करके लॉग इन करें。', ja: 'ユーザー名とパスワードを入力してログインします。'
  },
  auth_login_google_btn: {
    tr: 'Google Hesabı ile Giriş Yap', en: 'Log In with Google Account', es: 'Iniciar sesión con cuenta de Google', fr: 'Se connecter avec un compte Google', de: 'Mit Google-Konto anmelden',
    it: 'Accedi con account Google', pt: 'Entrar com conta do Google', ru: 'Войти через аккаунт Google', ar: 'تسجيل الدخول بحساب Google', zh: '使用 Google 账户登录', hi: 'Google खाते के साथ लॉग इन करें', ja: 'Googleアカウントでログイン'
  },
  auth_login_facebook_btn: {
    tr: 'Facebook Hesabı ile Giriş Yap', en: 'Log In with Facebook Account', es: 'Iniciar sesión con cuenta de Facebook', fr: 'Se connecter avec un compte Facebook', de: 'Mit Facebook-Konto anmelden',
    it: 'Accedi con account Facebook', pt: 'Entrar com conta do Facebook', ru: 'Войти через аккаунт Facebook', ar: 'تسجيل الدخول بحساب فيسبوك', zh: '使用 Facebook 账户登录', hi: 'फेसबुक खाते के साथ लॉग इन करें', ja: 'Facebookアカウントでログイン'
  },
  auth_login_apple_btn: {
    tr: 'Apple ID ile Giriş Yap', en: 'Log In with Apple ID', es: 'Iniciar sesión con Apple ID', fr: 'Se connecter avec Apple ID', de: 'Mit Apple-ID anmelden',
    it: 'Accedi con Apple ID', pt: 'Entrar com Apple ID', ru: 'Войти через Apple ID', ar: 'تسجيل الدخول بمعرف Apple', zh: '使用 Apple ID 登录', hi: 'एप्पल आईडी के साथ लॉग इन करें', ja: 'Apple IDでログイン'
  },
  auth_login_btn: {
    tr: 'Giriş Yap', en: 'Log In', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Einloggen',
    it: 'Accedi', pt: 'Entrar', ru: 'Войти', ar: 'تسجيل الدخول', zh: '登录', hi: 'लॉग इन करें', ja: 'ログイン'
  },
  auth_register_username_label: {
    tr: 'KULLANICI ADI (İSİM)', en: 'USERNAME (NAME)', es: 'NOMBRE DE USUARIO (NOMBRE)', fr: 'NOM D\'UTILISATEUR (NOM)', de: 'BENUTZERNAME (NAME)',
    it: 'NOME UTENTE (NOME)', pt: 'NOME DE USUÁRIO (NOME)', ru: 'ИМЯ ПОЛЬЗОВАТЕЛЯ (ИМЯ)', ar: 'اسم المستخدم (الاسم)', zh: '用户名（姓名）', hi: 'उपयोगकर्ता नाम (नाम)', ja: 'ユーザー名（名前）'
  },
  auth_register_name_placeholder: {
    tr: 'İsminiz', en: 'Your name', es: 'Tu name', fr: 'Votre nom', de: 'Ihr Name',
    it: 'Il tuo nome', pt: 'Seu nome', ru: 'Ваше имя', ar: 'اسمك', zh: '您的名字', hi: 'आपका नाम', ja: 'お名前'
  },
  auth_btn_close: {
    tr: 'Kapat', en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen',
    it: 'Chiudi', pt: 'Fechar', ru: 'Закрыть', ar: 'إغلاق', zh: '关闭', hi: 'बंद करें', ja: '閉じる'
  },
  auth_select_saved_account_desc: {
    tr: 'Devam etmek için cihazınızda kayıtlı hesabı seçin', en: 'Select the saved account on your device to continue', es: 'Selecciona la cuenta guardada en tu dispositivo para continuar', fr: 'Sélectionnez le compte enregistré sur votre appareil pour continuer', de: 'Wählen Sie das auf Ihrem Gerät gespeicherte Konto aus, um fortzufahren',
    it: 'Seleziona l\'account salvato sul tuo dispositivo per continuare', pt: 'Selecione a conta salva no seu dispositivo para continuar', ru: 'Выберите сохраненный аккаунт на вашем устройстве, чтобы продолжить', ar: 'حدد الحساب المحفوظ على جهازك للمتابعة', zh: '选择您设备上保存的账户以继续', hi: 'जारी रखने के लिए अपने डिवाइस पर सहेजे गए खाते का चयन करें', ja: '続行するにはデバイスに保存されているアカウントを選択してください'
  },
  auth_login_saved_session: {
    tr: 'Kayıtlı Oturumla Giriş', en: 'Login with Saved Session', es: 'Iniciar sesión con sesión guardada', fr: 'Connexion avec session enregistrée', de: 'Anmeldung mit gespeicherter Sitzung',
    it: 'Accedi con sessione salvata', pt: 'Entrar com sessão salva', ru: 'Вход с сохраненным сеансом', ar: 'تسجيل الدخول بجلسة محفوظة', zh: '使用已存会话登录', hi: 'सहेजे गए सत्र के साथ लॉगिन करें', ja: '保存されたセッションでログイン'
  },
  auth_saved_tag: {
    tr: 'Kayıtlı', en: 'Saved', es: 'Guardado', fr: 'Enregistré', de: 'Gespeichert',
    it: 'Salvato', pt: 'Salvo', ru: 'Сохранено', ar: 'محفوظ', zh: '已保存', hi: 'सहेजा गया', ja: '保存済み'
  },
  auth_use_other_gmail: {
    tr: 'Başka bir Gmail adresi kullan', en: 'Use another Gmail address', es: 'Usar otra dirección de Gmail', fr: 'Utiliser une autre adresse Gmail', de: 'Anderes Gmail-Konto verwenden',
    it: 'Usa un altro indirizzo Gmail', pt: 'Usar outro endereço do Gmail', ru: 'Использовать другой адрес Gmail', ar: 'استخدام عنوان Gmail آخر', zh: '使用另一个 Gmail 地址', hi: 'दूसरे जीमेल पते का उपयोग करें', ja: '別の Gmail アドレスを使用する'
  },
  auth_use_other_fb: {
    tr: 'Başka bir Facebook hesabı kullan', en: 'Use another Facebook account', es: 'Usar otra cuenta de Facebook', fr: 'Utiliser un autre compte Facebook', de: 'Anderes Facebook-Konto verwenden',
    it: 'Usa un altro account Facebook', pt: 'Usar outra conta do Facebook', ru: 'Использовать другой аккаунт Facebook', ar: 'استخدام حساب فيسبوك آخر', zh: '使用另一个 Facebook 账户', hi: 'दूसरे फेसबुक खाते का उपयोग करें', ja: '別の Facebook アカウントを使用する'
  },
  auth_use_other_apple: {
    tr: 'Başka bir Apple ID kullan', en: 'Use another Apple ID', es: 'Usar otro Apple ID', fr: 'Utiliser un autre Apple ID', de: 'Anderes Apple ID verwenden',
    it: 'Usa un altro Apple ID', pt: 'Usar outro Apple ID', ru: 'Использовать другой Apple ID', ar: 'استخدام Apple ID آخر', zh: '使用另一个 Apple ID', hi: 'दूसरे एप्पल आईडी का उपयोग करें', ja: '別の Apple ID を使用する'
  },
  auth_use_other_email: {
    tr: 'Başka bir kullanıcı adı veya e-posta kullan', en: 'Use another username or email', es: 'Usar otro nombre de usuario o correo', fr: 'Utiliser un autre nom d\'utilisateur ou email', de: 'Anderen Benutzernamen oder E-Mail verwenden',
    it: 'Usa un altro nome utente o e-mail', pt: 'Usar outro nome de usuário ou e-mail', ru: 'Использовать другое имя пользователя или эл. почту', ar: 'استخدام اسم مستخدم أو بريد آخر', zh: '使用另一个用户名或邮箱', hi: 'दूसरे उपयोगकर्ता नाम या ईमेल का उपयोग करें', ja: '別のユーザー名またはメールを使用する'
  },
  auth_error_gmail_format: {
    tr: 'Lütfen geçerli bir Gmail adresi girin (@gmail.com ile bitmelidir). ⚠️',
    en: 'Please enter a valid Gmail address (must end with @gmail.com). ⚠️',
    es: 'Ingrese una dirección de Gmail válida (debe terminar con @gmail.com). ⚠️',
    fr: 'Veuillez saisir une adresse Gmail valide (doit se terminer par @gmail.com). ⚠️',
    de: 'Bitte geben Sie eine gültige Gmail-Adresse ein (muss auf @gmail.com enden). ⚠️',
    it: 'Inserisci un indirizzo Gmail valido (deve finire con @gmail.com). ⚠️',
    pt: 'Por favor, insira um endereço do Gmail válido (deve terminar com @gmail.com). ⚠️',
    ru: 'Пожалуйста, введите действительный адрес Gmail (должен заканчиваться на @gmail.com). ⚠️',
    ar: 'يرجى إدخال عنوان Gmail صالح (يجب أن ينتهي بـ @gmail.com). ⚠️',
    zh: '请输入有效的 Gmail 地址（必须以 @gmail.com 结尾）。⚠️',
    hi: 'कृपया एक वैध जीमेल पता दर्ज करें (@gmail.com के साथ समाप्त होना चाहिए)। ⚠️',
    ja: '有効な Gmail アドレスを入力してください（@gmail.com で終わる必要があります）。⚠️'
  },
  auth_error_generic: {
    tr: 'Bir hata oluştu. Lütfen tekrar deneyin. ⚠️', en: 'An error occurred. Please try again. ⚠️', es: 'Ocurrió un error. Por favor inténtelo de nuevo. ⚠️', fr: 'Une erreur est survenue. Veuillez réessayer. ⚠️', de: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut. ⚠️',
    it: 'Si è verificato un errore. Riprova. ⚠️', pt: 'Ocorreu um erro. Por favor tente novamente. ⚠️', ru: 'Произошла ошибка. Пожалуйста, попробуйте еще раз. ⚠️', ar: 'حدث خطأ. يرجى المحاولة مرة أخرى. ⚠️', zh: '发生错误。请重试。⚠️', hi: 'एक त्रुटi हुई। कृपया पुन: प्रयास करें。 ⚠️', ja: 'エラーが発生しました。もう一度お試しください。⚠️'
  },
  auth_new_user_prompt: {
    tr: 'Yeni kullanıcı mısınız? ', en: 'New user? ', es: '¿Nuevo usuario? ', fr: 'Nouvel utilisateur ? ', de: 'Neuer Benutzer? ',
    it: 'Nuovo utente? ', pt: 'Novo usuário? ', ru: 'Новый пользователь? ', ar: 'مستخدم جديد؟ ', zh: '新用户？ ', hi: 'नया उपयोगकर्ता? ', ja: '新規ユーザーですか？ '
  },
  auth_create_account_link: {
    tr: 'Yeni Hesap Oluşturun', en: 'Create a New Account', es: 'Crear una nueva cuenta', fr: 'Créer un nouveau compte', de: 'Neues Konto erstellen',
    it: 'Crea un nuovo account', pt: 'Criar uma nova conta', ru: 'Создать новый аккаунт', ar: 'إنشاء حساب جديد', zh: '创建新账户', hi: 'नया खाता बनाएं', ja: '新しいアカウントを作成する'
  },
  oauth_secure_tag: {
    tr: 'Güvenli', en: 'Secure', es: 'Seguro', fr: 'Sécurisé', de: 'Sicher',
    it: 'Sicuro', pt: 'Seguro', ru: 'Безопасно', ar: 'آمن', zh: '安全', hi: 'सुरक्षित', ja: '保護された通信'
  },
  auth_provider_loading: {
    tr: '{provider} yükleniyor...', en: 'Loading {provider}...', es: 'Cargando {provider}...', fr: 'Chargement de {provider}...', de: '{provider} wird geladen...',
    it: 'Caricamento di {provider}...', pt: 'Carregando {provider}...', ru: 'Загрузка {provider}...', ar: 'جاري تحميل {provider}...', zh: '正在加载 {provider}...', hi: '{provider} लोड हो रहा है...', ja: '{provider} を読み込み中...'
  },
  oauth_choose_account: {
    tr: 'Bir hesap seçin', en: 'Choose an account', es: 'Elige una cuenta', fr: 'Choisissez un compte', de: 'Konto auswählen',
    it: 'Scegli un account', pt: 'Escolha uma conta', ru: 'Выберите аккаунт', ar: 'اختر حسابًا', zh: '选择一个账户', hi: 'एक खाता चुनें', ja: 'アカウントの選択'
  },
  oauth_to_continue: {
    tr: 'İngilizce Öyküm uygulamasına devam etmek için', en: 'to continue to İngilizce Öyküm', es: 'para continuar a İngilizce Öyküm', fr: 'pour continuer vers İngilizce Öyküm', de: 'um mit İngilizce Öyküm fortzufahren',
    it: 'per continuare su İngilizce Öyküm', pt: 'para continuar para İngilizce Öyküm', ru: 'чтобы продолжить в İngilizce Öyküm', ar: 'للمتابعة إلى İngilizce Öyküm', zh: '以继续使用 İngilizce Öyküm', hi: 'İngilizce Öyküm पर जारी रखने के लिए', ja: 'İngilizce Öyküm に移動する'
  },
  btn_next: {
    tr: 'İleri', en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter',
    it: 'Avanti', pt: 'Avançar', ru: 'Далее', ar: 'التالي', zh: '下一步', hi: 'आगे', ja: '次へ'
  },
  oauth_continue_as_format: {
    tr: '{name} Olarak Devam Et', en: 'Continue as {name}', es: 'Continuar como {name}', fr: 'Continuer en tant que {name}', de: 'Als {name} fortfahren',
    it: 'Continua come {name}', pt: 'Continuar como {name}', ru: 'Продолжить как {name}', ar: 'الاستمرار باسم {name}', zh: '以 {name} 身份继续', hi: '{name} के रूप में जारी रखें', ja: '{name} として続行'
  },
  auth_logging_in_toast: {
    tr: 'Giriş Yapılıyor...', en: 'Logging in...', es: 'Iniciando sesión...', fr: 'Connexion...', de: 'Anmeldung...',
    it: 'Accesso...', pt: 'Entrando...', ru: 'Вход...', ar: 'جاري تسجيل الدخول...', zh: '正在登录...', hi: 'लॉग इन किया जा रहा है...', ja: 'ログイン中...'
  },
  profile_install_date: {
    tr: 'Uygulamayı Yükleme Tarihi: {date}', en: 'App Install Date: {date}', es: 'Fecha de instalación de la app: {date}', fr: 'Date d\'installation de l\'app : {date}', de: 'App-Installationsdatum: {date}',
    it: 'Data installazione app: {date}', pt: 'Data de instalação do app: {date}', ru: 'Дата установки приложения: {date}', ar: 'تاريخ تثبيت التطبيق: {date}', zh: '应用安装日期：{date}', hi: 'ऐप इंस्टॉल तिथि: {date}', ja: 'アプリインストール日: {date}'
  },
  profile_change_name_btn: {
    tr: 'İsmini Değiştir', en: 'Change Name', es: 'Cambiar nombre', fr: 'Changer de nom', de: 'Name ändern',
    it: 'Cambia nome', pt: 'Alterar nome', ru: 'Изменить имя', ar: 'تغيير الاسم', zh: '更改名字', hi: 'नाम बदलें', ja: '名前を変更'
  },
  profile_premium_member: {
    tr: 'PREMIUM ÜYE', en: 'PREMIUM MEMBER', es: 'MIEMBRO PREMIUM', fr: 'MEMBRE PREMIUM', de: 'PREMIUM-MITGLIED',
    it: 'MEMBRO PREMIUM', pt: 'MEMBRO PREMIUM', ru: 'ПРЕМИУМ УЧАСТНИК', ar: 'عضو بريميوم', zh: '会员用户', hi: 'प्रीमियम सदस्य', ja: 'プレミアム会員'
  },
  profile_premium_features: {
    tr: 'Premium Özellikler', en: 'Premium Features', es: 'Características Premium', fr: 'Fonctionnalités Premium', de: 'Premium-Funktionen',
    it: 'Funzionalità Premium', pt: 'Recursos Premium', ru: 'Премиум-функции', ar: 'ميزات بريميوم', zh: '高级功能', hi: 'प्रीमियम विशेषताएं', ja: 'プレミアム機能'
  },
  profile_premium_purchase_date: {
    tr: 'Alındığı Tarih: {date}', en: 'Purchase Date: {date}', es: 'Fecha de compra: {date}', fr: 'Date d\'achat : {date}', de: 'Kaufdatum: {date}',
    it: 'Data di acquisto: {date}', pt: 'Data de compra: {date}', ru: 'Дата покупки: {date}', ar: 'تاريخ الشراء: {date}', zh: '购买日期：{date}', hi: 'खरीद तिथि: {date}', ja: '購入日: {date}'
  },
  profile_premium_remaining_time: {
    tr: 'Kalan Süre: {days}', en: 'Remaining Time: {days}', es: 'Tiempo restante: {days}', fr: 'Temps restant : {days}', de: 'Verbleibende Zeit: {days}',
    it: 'Tempo rimasto: {days}', pt: 'Tempo restante: {days}', ru: 'Оставшееся время: {days}', ar: 'الوقت المتبقي: {days}', zh: '剩余时间：{days}', hi: 'शेष समय: {days}', ja: '残り時間: {days}'
  },
  profile_premium_expiry: {
    tr: ' (Bitiş: {date})', en: ' (Expiry: {date})', es: ' (Vencimiento: {date})', fr: ' (Expiration : {date})', de: ' (Ablauf: {date})',
    it: ' (Scadenza: {date})', pt: ' (Expiração: {date})', ru: ' (Окончание: {date})', ar: ' (الانتهاء: {date})', zh: ' (到期：{date})', hi: ' (समाप्ति: {date})', ja: ' (有効期限: {date})'
  },
  profile_stat_saved_words: {
    tr: 'KAYITLI KELİME', en: 'SAVED WORDS', es: 'PALABRAS GUARDADAS', fr: 'MOTS ENREGISTRÉS', de: 'GESPEICHERTE WÖRTER',
    it: 'PAROLE SALVATE', pt: 'PALABRAS SALVAS', ru: 'СОХРАНЕННЫЕ СЛОВА', ar: 'الكلمات المحفوظة', zh: '已存单词', hi: 'सहेजे गए शब्द', ja: '保存した単語'
  },
  profile_stat_completed_books: {
    tr: 'OKUNAN KİTAP', en: 'COMPLETED BOOKS', es: 'LIBROS LEÍDOS', fr: 'LIVRES LUS', de: 'GELESENE BÜCHER',
    it: 'LIBRI LETTI', pt: 'LIVROS LIDOS', ru: 'ПРОЧИТАННЫЕ КНИГИ', ar: 'الكتب المقروءة', zh: '已读完书籍', hi: 'पूरी की गई किताबें', ja: '読了した本'
  },
  profile_stat_daily_streak: {
    tr: 'GÜNLÜK SERİ 🔥', en: 'DAILY STREAK 🔥', es: 'RACHA DIARIA 🔥', fr: 'SÉRIE QUOTIDIENNE 🔥', de: 'TÄGLICHE SERIE 🔥',
    it: 'SERIE GIORNALIERA 🔥', pt: 'RACHA DIÁRIA 🔥', ru: 'ДНЕВНАЯ СЕРИЯ 🔥', ar: 'النشاط اليومي 🔥', zh: '每日连击 🔥', hi: 'दैनिक सिलसिला 🔥', ja: '継続日数 🔥'
  },
  profile_stat_streak_day_format: {
    tr: '{count}. Gün', en: 'Day {count}', es: 'Día {count}', fr: 'Jour {count}', de: 'Tag {count}',
    it: 'Giorno {count}', pt: 'Dia {count}', ru: 'День {count}', ar: 'اليوم {count}', zh: '第 {count} 天', hi: 'दिन {count}', ja: '{count}日目'
  },
  
  // Auth Form
  auth_gmail_address: {
    tr: 'GMAIL ADRESİ', en: 'GMAIL ADDRESS', es: 'DIRECCIÓN GMAIL', fr: 'ADRESSE GMAIL', de: 'GMAIL-ADRESSE',
    it: 'INDIRIZZO GMAIL', pt: 'ENDEREÇO GMAIL', ru: 'GMAIL АДРЕС', ar: 'عنوان GMAIL', zh: 'GMAIL 地址', hi: 'जीमेल पता', ja: 'GMAIL アドレス'
  },
  auth_fb_email: {
    tr: 'FACEBOOK E-POSTA / TELEFON', en: 'FACEBOOK EMAIL / PHONE', es: 'FACEBOOK CORREO / TELÉFONO', fr: 'FACEBOOK EMAIL / TÉLÉPHONE', de: 'FACEBOOK E-MAIL / TELEFON',
    it: 'FACEBOOK EMAIL / TELEFONO', pt: 'FACEBOOK E-MAIL / TELEFONE', ru: 'FACEBOOK EMAIL / ТЕЛЕФОН', ar: 'بريد فيسبوك / هاتف', zh: 'FACEBOOK 邮箱/电话', hi: 'फेसबुक ईमेल / फोन', ja: 'FACEBOOK メール / 電話番号'
  },
  auth_apple_id: {
    tr: 'APPLE ID / E-POSTA', en: 'APPLE ID / EMAIL', es: 'APPLE ID / CORREO', fr: 'APPLE ID / EMAIL', de: 'APPLE ID / E-MAIL',
    it: 'APPLE ID / EMAIL', pt: 'APPLE ID / E-MAIL', ru: 'APPLE ID / EMAIL', ar: 'APPLE ID / بريد', zh: 'APPLE ID / 邮箱', hi: 'एप्पल आईडी / ईमेल', ja: 'APPLE ID / メールアドレス'
  },
  auth_username_label: {
    tr: 'KULLANICI ADI', en: 'USERNAME', es: 'NOMBRE DE USUARIO', fr: 'NOM D\'UTILISATEUR', de: 'BENUTZERNAME',
    it: 'NOME UTENTE', pt: 'NOME DE USUÁRIO', ru: 'ИМЯ ПОЛЬЗОВАТЕЛЯ', ar: 'اسم المستخدم', zh: '用户名', hi: 'उपयोगकर्ता नाम', ja: 'ユーザー名'
  },
  auth_password_label: {
    tr: 'ŞİFRE', en: 'PASSWORD', es: 'CONTRASEÑA', fr: 'MOT DE PASSE', de: 'PASSWORT',
    it: 'PASSWORD', pt: 'SENHA', ru: 'ПАРОЛЬ', ar: 'كلمة المرور', zh: '密码', hi: 'पासवर्ड', ja: 'パスワード'
  },
  auth_password_min_label: {
    tr: 'ŞİFRE (EN AZ 6 KARAKTER)', en: 'PASSWORD (MIN 6 CHARACTERS)', es: 'CONTRASEÑA (MÍN 6 CARACTERES)', fr: 'MOT DE PASSE (MIN 6 CARACTÈRES)', de: 'PASSWORT (MIN 6 ZEICHEN)',
    it: 'PASSWORD (MIN 6 CARATTERI)', pt: 'SENHA (MÍN 6 CARACTERES)', ru: 'ПАРОЛЬ (МИНИМУМ 6 СИМВОЛОВ)', ar: 'كلمة المرور (6 أحرف على الأقل)', zh: '密码（最少 6 个字符）', hi: 'पासवर्ड (कम से कम 6 वर्ण)', ja: 'パスワード（最小6文字）'
  },
  auth_username_placeholder: {
    tr: 'Kullanıcı adınız', en: 'Your username', es: 'Tu nombre de usuario', fr: 'Votre nom d\'utilisateur', de: 'Ihr Benutzername',
    it: 'Il tuo nome utente', pt: 'Seu nome de usuário', ru: 'Ваше имя пользователя', ar: 'اسم المستخدم الخاص بك', zh: '您的用户名', hi: 'आपका उपयोगकर्ता नाम', ja: 'ユーザー名を入力'
  },
  auth_back_btn: {
    tr: 'Geri Dön', en: 'Go Back', es: 'Volver', fr: 'Retourner', de: 'Zurückgehen',
    it: 'Torna indietro', pt: 'Voltar', ru: 'Назад', ar: 'الرجوع للخلف', zh: '返回', hi: 'वापस जाएँ', ja: '戻る'
  },
  auth_registering_toast: {
    tr: 'Kayıt Yapılıyor...', en: 'Registering...', es: 'Registrando...', fr: 'Inscription en cours...', de: 'Registrierung läuft...',
    it: 'Registrazione in corso...', pt: 'Registrando...', ru: 'Регистрация...', ar: 'جاري التسجيل...', zh: '正在注册...', hi: 'पंजीकरण किया जा रहा है...', ja: '登録中...'
  },
  auth_register_btn: {
    tr: 'Kayıt Ol ve Başla', en: 'Register & Start', es: 'Registrarse y comenzar', fr: 'S\'inscrire et commencer', de: 'Registrieren & Starten',
    it: 'Registrati e inizia', pt: 'Registrar e iniciar', ru: 'Зарегистрироваться и начать', ar: 'سجل وابدأ', zh: '注册并开始', hi: 'रजिस्टर करें और शुरू करें', ja: '登録して開始'
  },
  auth_have_account: {
    tr: 'Zaten bir hesabınız var mı? ', en: 'Already have an account? ', es: '¿Ya tienes una cuenta? ', fr: 'Vous avez déjà un compte ? ', de: 'Haben Sie bereits ein Konto? ',
    it: 'Hai già un account? ', pt: 'Já tem uma conta? ', ru: 'Уже есть аккаунт? ', ar: 'هل لديك حساب بالفعل؟ ', zh: '已经有账户？ ', hi: 'पहले से ही एक खाता है? ', ja: 'すでにアカウントをお持ちですか？ '
  },
  auth_login_link: {
    tr: 'Giriş Yapın', en: 'Log In', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Anmelden',
    it: 'Accedi', pt: 'Entrar', ru: 'Войти', ar: 'تسجيل الدخول', zh: '登录', hi: 'लॉग इन करें', ja: 'ログインする'
  },
  auth_invalid_username_toast: {
    tr: 'Lütfen geçerli bir kullanıcı adı girin. ⚠️', en: 'Please enter a valid username. ⚠️', es: 'Ingrese un nombre de usuario válido. ⚠️', fr: 'Veuillez saisir un nom d\'utilisateur valide. ⚠️', de: 'Bitte geben Sie einen gültigen Benutzernamen ein. ⚠️',
    it: 'Inserisci un nome utente valido. ⚠️', pt: 'Por favor, insira um nome de usuário válido. ⚠️', ru: 'Пожалуйста, введите правильное имя пользователя. ⚠️', ar: 'يرجى إدخال اسم مستخدم صالح. ⚠️', zh: '请输入有效的用户名。⚠️', hi: 'कृपया एक वैध उपयोगकर्ता नाम दर्ज करें। ⚠️', ja: '有効なユーザー名を入力してください。⚠️'
  },
  auth_invalid_password_toast: {
    tr: 'Şifre en az 6 karakter olmalıdır. ⚠️', en: 'Password must be at least 6 characters. ⚠️', es: 'La contraseña debe tener al menos 6 caracteres. ⚠️', fr: 'Le mot de passe doit contenir au moins 6 caractères. ⚠️', de: 'Das Passwort muss mindestens 6 Zeichen lang sein. ⚠️',
    it: 'La password deve essere di almeno 6 caratteri. ⚠️', pt: 'La senha deve ter pelo menos 6 caracteres. ⚠️', ru: 'Пароль должен состоять минимум из 6 символов. ⚠️', ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل. ⚠️', zh: '密码必须至少为 6 个字符。⚠️', hi: 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए। ⚠️', ja: 'パスワードは6文字以上である必要があります。⚠️'
  },
  auth_google_use_other: {
    tr: 'Başka bir Gmail adresi kullan', en: 'Use another Gmail address', es: 'Usar otra dirección de Gmail', fr: 'Utiliser une autre adresse Gmail', de: 'Anderes Gmail-Konto verwenden',
    it: 'Usa un altro indirizzo Gmail', pt: 'Usar outro endereço do Gmail', ru: 'Использовать другой адрес Gmail', ar: 'استخدام عنوان Gmail آخر', zh: '使用另一个 Gmail 地址', hi: 'दूसरे जीमेल पते का उपयोग करें', ja: '別の Gmail アドレスを使用する'
  },
  auth_facebook_use_other: {
    tr: 'Başka bir Facebook hesabı kullan', en: 'Use another Facebook account', es: 'Usar otra cuenta de Facebook', fr: 'Utiliser un autre compte Facebook', de: 'Anderes Facebook-Konto verwenden',
    it: 'Usa un altro account Facebook', pt: 'Usar outra conta do Facebook', ru: 'Использовать другой аккаунт Facebook', ar: 'استخدام حساب فيسبوك آخر', zh: '使用另一个 Facebook 账户', hi: 'दूसरे फेसबुक खाते का उपयोग करें', ja: '別の Facebook アカウントを使用する'
  },
  auth_apple_use_other: {
    tr: 'Başka bir Apple ID kullan', en: 'Use another Apple ID', es: 'Usar otro Apple ID', fr: 'Utiliser un autre Apple ID', de: 'Anderes Apple ID verwenden',
    it: 'Usa un altro Apple ID', pt: 'Usar outro Apple ID', ru: 'Использовать другой Apple ID', ar: 'استخدام Apple ID آخر', zh: '使用另一个 Apple ID', hi: 'दूसरे एप्पल आईडी का उपयोग करें', ja: '別の Apple ID を使用する'
  },
  auth_email_use_other: {
    tr: 'Başka bir kullanıcı adı veya e-posta kullan', en: 'Use another username or email', es: 'Usar otro nombre de usuario o correo', fr: 'Utiliser un autre nom d\'utilisateur ou email', de: 'Anderen Benutzernamen oder E-Mail verwenden',
    it: 'Usa un altro nome utente o e-mail', pt: 'Usar outro nome de usuário ou e-mail', ru: 'Использовать другое имя пользователя или эл. почту', ar: 'استخدام اسم مستخدم أو بريد آخر', zh: '使用另一个用户名 or 邮箱', hi: 'दूसरे उपयोगकर्ता नाम या ईमेल का उपयोग करें', ja: '別のユーザー名またはメールを使用する'
  },

  // Invite Modal
  invite_modal_title: {
    tr: 'Davet Kodu Gir', en: 'Enter Invite Code', es: 'Ingresar código de invitación', fr: 'Entrer le code d\'invitation', de: 'Einladungscode eingeben',
    it: 'Inserisci codice d\'invito', pt: 'Inserir código de convite', ru: 'Ввести kod приглашения', ar: 'أدخل رمز الدعوة', zh: '输入邀请码', hi: 'आमंत्रण कोड दर्ज करें', ja: '招待コードを入力'
  },
  invite_modal_desc: {
    tr: 'Arkadaşınızın davet kodunu girerek onunla bağlantı kurun.', en: 'Connect with your friend by entering their invite code.', es: 'Conéctate con tu amigo ingresando su código de invitación.', fr: 'Connectez-vous avec votre ami en saisissant son code d\'invitation.', de: 'Verbinden Sie sich mit Ihrem Freund, indem Sie dessen Einladungscode eingeben.',
    it: 'Connettiti con il tuo amico inserendo il suo codice d\'invito.', pt: 'Conecte-se com seu amigo inserindo o código de convite dele.', ru: 'Свяжитесь со своим другом, введя его код приглашения.', ar: 'تواصل مع صديقك بإدخال رمز الدعوة الخاص به.', zh: '通过输入您朋友的邀请码与其建立连接。', hi: 'अपने मित्र के आमंत्रण कोड को दर्ज करके उससे जुड़ें।', ja: '友達の招待コードを入力して接続します。'
  },
  invite_modal_placeholder: {
    tr: 'Örn: OYKUM-ABCDE', en: 'e.g. OYKUM-ABCDE', es: 'Ej: OYKUM-ABCDE', fr: 'ex : OYKUM-ABCDE', de: 'z.B. OYKUM-ABCDE',
    it: 'es: OYKUM-ABCDE', pt: 'ex: OYKUM-ABCDE', ru: 'Напр.: OYKUM-ABCDE', ar: 'مثال: OYKUM-ABCDE', zh: '例如：OYKUM-ABCDE', hi: 'जैसे: OYKUM-ABCDE', ja: '例: OYKUM-ABCDE'
  },
  invite_toast_enter_code: {
    tr: 'Lütfen bir kod girin. ⚠️', en: 'Please enter a code. ⚠️', es: 'Por favor ingrese un código. ⚠️', fr: 'Veuillez entrer un code. ⚠️', de: 'Bitte geben Sie einen Code ein. ⚠️',
    it: 'Inserisci un codice. ⚠️', pt: 'Por favor, insira um código. ⚠️', ru: 'Пожалуйста, введите код. ⚠️', ar: 'يرجى إدخال رمز. ⚠️', zh: '请输入代码。⚠️', hi: 'कृपया एक kod दर्ज करें। ⚠️', ja: 'コードを入力してください。⚠️'
  },
  invite_toast_success: {
    tr: 'Davet kodu başarıyla uygulandı! 🎁', en: 'Invite code successfully applied! 🎁', es: '¡Código de invitación aplicado con éxito! 🎁', fr: 'Code d\'invitation appliqué avec succès ! 🎁', de: 'Einladungscode erfolgreich angewendet! 🎁',
    it: 'Codice d\'invito applicato con successo! 🎁', pt: 'Código de convite aplicado com successo! 🎁', ru: 'Код приглашения успешно применен! 🎁', ar: 'تم تطبيق رمز الدعوة بنجاح! 🎁', zh: '邀请码应用成功！🎁', hi: 'आमंत्रण कोड सफलतापूर्वक लागू किया गया! 🎁', ja: '招待コードが正常に適用されました！🎁'
  },
  btn_apply: {
    tr: 'Uygula', en: 'Apply', es: 'Aplicar', fr: 'Appliquer', de: 'Anwenden',
    it: 'Applica', pt: 'Aplicar', ru: 'Применить', ar: 'تطبيق', zh: '应用', hi: 'laagu karein', ja: '適用'
  },

  // Premium Benefits Detail
  premium_benefits_title: {
    tr: 'Premium Ayrıcalıklarınız', en: 'Your Premium Benefits', es: 'Tus beneficios Premium', fr: 'Vos avantages Premium', de: 'Ihre Premium-Vorteile',
    it: 'I tuoi vantaggi Premium', pt: 'Seus Benefícios Premium', ru: 'Ваши Премиум преимущества', ar: 'مزايا بريميوم الخاصة بك', zh: '您的会员特权', hi: 'आपके प्रीमियम लाभ', ja: 'プレミアム特典'
  },
  premium_benefits_tag: {
    tr: 'İNGİLİZCE ÖYKÜM PREMİUM', en: 'MY ENGLISH STORY PREMIUM', es: 'MY ENGLISH STORY PREMIUM', fr: 'MY ENGLISH STORY PREMIUM', de: 'MY ENGLISH STORY PREMIUM',
    it: 'MY ENGLISH STORY PREMIUM', pt: 'MY ENGLISH STORY PREMIUM', ru: 'MY ENGLISH STORY PREMIUM', ar: 'MY ENGLISH STORY PREMIUM', zh: 'MY ENGLISH STORY 会员', hi: 'MY ENGLISH STORY premium', ja: 'MY ENGLISH STORY プレミアム'
  },
  premium_benefit_1_title: {
    tr: 'Sınırsız Enerji & Can', en: 'Unlimited Energy & Lives', es: 'Energía y vidas ilimitadas', fr: 'Énergie & vies illimitées', de: 'Unbegrenzte Energie & Leben',
    it: 'Energia e vite illimitate', pt: 'Energia e Vidas Ilimitadas', ru: 'Безлимитная энергия и жизни', ar: 'طاقة وأرواح غير محدودة', zh: '无限体力和生命值', hi: 'असीमित ऊर्जा और जीवन', ja: 'ライフ・エネルギー無制限'
  },
  premium_benefit_1_desc: {
    tr: 'Hata yapmaktan korkmayın! Canınız hiçbir zaman azalmaz, kesintisiz okuma keyfini sürersiniz.', en: 'Do not be afraid of making mistakes! Your lives will never decrease, and you will enjoy uninterrupted reading.', es: '¡No tengas miedo de cometer errores! Tus vidas nunca disminuirán y disfrutarás de una lectura ininterrumpida.', fr: 'N\'ayez pas peur de faire des erreurs ! Vos vies ne diminueront jamais et vous profiterez d\'une lecture ininterrompue.', de: 'Keine Angst vor Fehlern! Ihr Leben wird sich nie verringern, und Sie werden ungestörten Lesespaß genießen.',
    it: 'Non aver paura di commettere errori! Le tue vite non diminuiranno mai e potrai goderti una lettura senza interruzioni.', pt: 'Não tenha medo de cometer erros! Suas vidas nunca diminuirão e você desfrutará de uma leitura ininterrupta.', ru: 'Не бойтесь ошибаться! Ваши жизни никогда не уменьшатся, и вы сможете наслаждаться чтением без перерывов.', ar: 'لا تخف من ارتكاب الأخطاء! لن تنقص أرواحك أبدًا، وستستمتع بالقراءة دون انقطاع.', zh: '不要害怕犯错！您的生命值永远不会减少，尽情享受无间断 of 阅读乐趣。', hi: 'गलतियाँ करने से न डरें! आपका जीवन कभी कम नहीं होगा, और आप निर्बाध पढ़ने का आनंद लेंगे।', ja: '間違えることを恐れる必要はありません！ライフが減ることはなく、いつでも読書を楽しめます。'
  },
  premium_benefit_2_title: {
    tr: 'Quiz Barajlarını Anında Atla', en: 'Skip Quiz Checkpoints Instantly', es: 'Omite controles de cuestionario al instante', fr: 'Passer les contrôles de quiz instantanément', de: 'Quiz-Checkpoints sofort überspringen',
    it: 'Salta i checkpoint dei quiz all\'istante', pt: 'Pular Checkpoints de Quiz Instantaneamente', ru: 'Мгновенный пропуск тестов', ar: 'تخطي حواجز الاختبارات فورًا', zh: '瞬间跳过测试卡点', hi: 'क्виज़ चेकपॉइंट तुरंत छोड़ें', ja: 'クイズチェックポイントを即座にスキップ'
  },
  premium_benefit_2_desc: {
    tr: 'Dilediğiniz an quizi çözmek zorunda kalmadan, tek tuşla bir sonraki sayfaya veya bölüme atlayabilirsiniz.', en: 'At any time, you can skip to the next page or section with a single button without having to solve the quiz.', es: 'En cualquier momento, puedes pasar a la siguiente página o sección con un solo botón sin tener que resolver el cuestionario.', fr: 'À tout moment, vous pouvez pasar à la page ou à la section suivante d\'un simple bouton sans avoir à résoudre le quiz.', de: 'Sie können jederzeit mit einer einzigen Taste zur nächsten Seite oder zum nächsten Abschnitt springen, ohne das Quiz lösen zu müssen.',
    it: 'In qualsiasi momento, puoi passare alla pagina o alla sezione successiva con un solo pulsante senza dover risolvere il quiz.', pt: 'A qualquer momento, você pode pular para a próxima página ou seção com un único botão, sem precisar resolver o quiz.', ru: 'В любой момент вы можете перейти к следующей странице или разделу одной кнопкой, без необходимости проходить тест.', ar: 'في أي وقت، يمكنك الانتقال إلى الصفحة أو القسم التالي بزر واحد دون الحاجة إلى حل الاختبار.', zh: '无需解开测试，一键即可跳转 to 下一页或下一章节。', hi: 'किसी भी समय, आप क्विज़ को hel किए बिना bir butonla geçebilirsiniz.', ja: 'クイズを解くことなく、ボタン一つで次のページやセクションにスキップできます。'
  },
  premium_benefits_thanks: {
    tr: 'Harika, Teşekkürler!', en: 'Great, Thanks!', es: '¡Genial, gracias!', fr: 'Super, merci !', de: 'Großartig, danke!',
    it: 'Ottimo, grazie!', pt: 'Ótimo, obrigado!', ru: 'Отлично, спасибо!', ar: 'رائع، شكراً!', zh: '太棒了，谢谢！', hi: 'çok iyi, teşekkürler!', ja: '素晴らしい、ありがとう！'
  },
  
  // ReadingView extra localizations
  reading_streak_reset_toast: {
    tr: 'Süre doldu, seri sıfırlandı! ⏱️😢', en: 'Time expired, streak reset! ⏱️😢', es: '¡Tiempo expirado, racha reiniciada! ⏱️😢', fr: 'Temps écoulé, série réinitialisée ! ⏱️😢', de: 'Zeit abgelaufen, Serie zurückgesetzt! ⏱️😢',
    it: 'Tempo scaduto, serie azzerata! ⏱️😢', pt: 'Tempo expirado, racha reiniciado! ⏱️😢', ru: 'Время isteko, seri sıfırlandı! ⏱️😢', ar: 'انتهى الوقت، تم إعادة تعيين النشاط! ⏱️😢', zh: '时间已过，连击已重置！⏱️😢', hi: 'समय समाप्त, सिलसिला रीसेट! ⏱️😢', ja: '時間が経過したため、継続日数がリセットされました！⏱️😢'
  },
  reading_checkpoint_success_toast: {
    tr: 'Tebrikler! Sayfa Geçiş Testini Başarıyla Geçtiniz. 🎉', en: 'Congratulations! You passed the page transition quiz. 🎉', es: '¡Felicitaciones! Pasaste el cuestionario de transición de página. 🎉', fr: 'Félicitations ! Vous avez réussi le quiz de transition de page. 🎉', de: 'Herzlichen Glückwunsch! Sie haben das Seitenübergangs-Quiz bestanden. 🎉',
    it: 'Congratulazioni! Hai superato il quiz di transizione pagina. 🎉', pt: 'Parabéns! Você passou no quiz de transição de página. 🎉', ru: 'Поздравляем! Вы успешно прошли тест перехода страницы. 🎉', ar: 'تهانينا! لقد اجتزت اختبار انتقال الصفحة بنجاح. 🎉', zh: '恭喜！您成功通过了页面过渡测试。🎉', hi: 'बधाई हो! आपने पृष्ठ संक्रमण क्विज़ सफलतापूर्वक पास कर लिया। 🎉', ja: 'おめでとうございます！ページ移行テストに合格しました。🎉'
  },
  reading_streak_15_toast_1: {
    tr: 'Harika! 15 Doğru Cevap Serisi Yakaladınız! 🔥', en: 'Great! You got a streak of 15 correct answers! 🔥', es: '¡Genial! ¡Conseguiste una racha de 15 respuestas correctas! 🔥', fr: 'Génial ! Vous avez obtenu une série de 15 bonnes réponses ! 🔥', de: 'Großartig! Sie haben eine Serie von 15 richtigen Antworten erreicht! 🔥',
    it: 'Ottimo! Hai ottenuto eine serie de 15 risposte corrette! 🔥', pt: 'Excelente! Você conseguiu eine racha de 15 respostas corretas! 🔥', ru: 'Отлично! Вы получили серию из 15 правильных ответов! 🔥', ar: 'رائع! لقد حصلت على سلسلة من 15 إجابة صحيحة! 🔥', zh: '太棒了！您连续答对了 15 道题！🔥', hi: 'बहुत बढ़िया! आपने लगातार 15 सही उत्तर दिए! 🔥', ja: '素晴らしい！15問連続正解を達成しました！🔥'
  },
  reading_streak_15_toast_2: {
    tr: 'Mükemmel! 15 Doğru Cevap Serisi! (Canınız Zaten Dolu) 🔥', en: 'Perfect! 15 correct answer streak! (Lives already full) 🔥', es: '¡Perfecto! ¡Racha de 15 respuestas correctas! (Vidas ya llenas) 🔥', fr: 'Parfait ! Série de 15 bonnes réponses ! (Vies déjà pleines) 🔥', de: 'Perfekt! Serie von 15 richtigen Antworten! (Leben bereits voll) 🔥',
    it: 'Perfetto! Serie di 15 risposte corrette! (Vite già piene) 🔥', pt: 'Perfeito! Racha de 15 respostas corretas! (Vidas já cheias) 🔥', ru: 'Великолепно! Серия из 15 правильных ответов! (Жизни уже полны) 🔥', ar: 'ممتاز! سلسلة من 15 إجابة صحيحة! (الأرواح ممتلئة بالفعل) 🔥', zh: '完美！连续答对 15 道题！（生命值已满）🔥', hi: 'उत्कृष्ट! लगातार 15 सही उत्तर! (जीवन önce den dolu) 🔥', ja: 'パーフェクト！15問連続正解達成！（ライフはすでに満タンです）🔥'
  },
  reading_streak_15_toast_3: {
    tr: 'Tebrikler! 15 Doğru Cevap Serisi ile 1 Can Kazandınız! ❤️', en: 'Congratulations! You earned 1 life with a streak of 15 correct answers! ❤️', es: '¡Felicitaciones! ¡Ganaste 1 vida con una racha de 15 respuestas correctas! ❤️', fr: 'Félicitations ! Vous avez gagné 1 vie avec une série de 15 bonnes réponses ! ❤️', de: 'Herzlichen Glückwunsch! Sie haben 1 Leben mit einer Serie von 15 richtigen Antworten verdient! ❤️',
    it: 'Congratulazioni! Hai guadagnato 1 vita con una serie di 15 risposte corrette! ❤️', pt: 'Parabéns! Você ganhou 1 vida con una racha de 15 respostas corretas! ❤️', ru: 'Поздравляем! Вы заработали 1 жизнь за серию из 15 правильных ответов! ❤️', ar: 'تهانينا! لقد كسبت حياة واحدة بسلسلة من 15 إجابة صحيحة! ❤️', zh: '恭喜！您通过连续答对 15 道题获得了 1 点生命值！❤️', hi: 'बधाई हो! आपने लगातार 15 सही उत्तर देकर 1 जीवन अर्जित किया! ❤️', ja: 'おめでとうございます！15問連続正解でライフを1獲得しました！❤️'
  },
  reading_streak_reset_simple_toast: {
    tr: 'Seri sıfırlandı! 😢', en: 'Streak reset! 😢', es: '¡Racha reiniciada! 😢', fr: 'Série réinitialisée ! 😢', de: 'Serie zurückgesetzt! 😢',
    it: 'Serie azzerata! 😢', pt: 'Racha reiniciado! 😢', ru: 'Серия сброшена! 😢', ar: 'تم إعادة تعيين النشاط! 😢', zh: '连击已重置！😢', hi: 'सिलसिला रीसेट! 😢', ja: '継続日数がリセットされました！😢'
  },
  dict_loading_placeholder: {
    tr: 'Sözlük karşılığı yükleniyor...', en: 'Loading definition...', es: 'Cargando definición...', fr: 'Chargement de la définition...', de: 'Definition wird geladen...',
    it: 'Caricamento definizione...', pt: 'Carregando definição...', ru: 'Загрузка определения...', ar: 'جاري تحميل التعريف...', zh: '正在加载定义...', hi: 'परिभाषा लोड हो रही है...', ja: '定義を読み込み中...'
  },
  dict_offline_label: {
    tr: 'Çevrimdışı Sözlük', en: 'Offline Dictionary', es: 'Diccionario sin conexión', fr: 'Dictionnaire hors ligne', de: 'Offline-Wörterbuch',
    it: 'Dizionario offline', pt: 'Dicionario offline', ru: 'Офлайн-словарь', ar: 'قاموس دون اتصال', zh: '离线词典', hi: 'ऑफ़लाइन डिक्शनरी', ja: 'オフライン辞書'
  },
  dict_global_offline_label: {
    tr: 'Ortak Kelime • Çevrimdışı Sözlük', en: 'Common Word • Offline Dictionary', es: 'Palabra común • Diccionario sin conexión', fr: 'Mot commun • Dictionnaire hors ligne', de: 'Häufiges Wort • Offline-Wörterbuch',
    it: 'Parola comune • Dizionario offline', pt: 'Palavra comune • Dicionário offline', ru: 'Общее слово • Офлайн-словарь', ar: 'كلمة مشتركة • قاموس دون اتصال', zh: '常见单词 • 离线词典', hi: 'सामान्य शब्द • ऑफ़लाइन डिक्शनरी', ja: '一般単語・オフライン辞書'
  },
  dict_level_label: {
    tr: '{level} Seviyesi', en: 'Level {level}', es: 'Nivel {level}', fr: 'Niveau {level}', de: 'Stufe {level}',
    it: 'Livello {level}', pt: 'Nível {level}', ru: 'Уровень {level}', ar: 'مستوى {level}', zh: '级别 {level}', hi: 'स्तर {level}', ja: 'レベル {level}'
  },
  dict_proper_noun_label: {
    tr: 'Özel İsim', en: 'Proper Noun', es: 'Nombre propio', fr: 'Nom propre', de: 'Eigenname',
    it: 'Nome proprio', pt: 'Nome proprio', ru: 'Имя собственное', ar: 'اسم علم', zh: '专有名词', hi: 'व्यक्तिवाचक संज्ञा', ja: '固有名詞'
  },
  btn_save: {
    tr: 'Kaydet', en: 'Save', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern',
    it: 'Salva', pt: 'Salvar', ru: 'Сохранить', ar: 'حفظ', zh: '保存', hi: 'सहेजें', ja: '保存'
  },
  btn_continue: {
    tr: 'Devam Et', en: 'Continue', es: 'Continuar', fr: 'Continuer', de: 'Weiter',
    it: 'Continua', pt: 'Continuar', ru: 'Продолжить', ar: 'متابعة', zh: '继续', hi: 'जारी रखें', ja: '続ける'
  },
  unit_days: {
    tr: 'Gün', en: 'Days', es: 'Días', fr: 'Jours', de: 'Tage',
    it: 'Giorni', pt: 'Dias', ru: 'Дней', ar: 'أيام', zh: '天', hi: 'दिन', ja: '日'
  },
  unit_hours: {
    tr: 'sa', en: 'h', es: 'h', fr: 'h', de: 'Std.', it: 'h', pt: 'h', ru: 'ч.', ar: 'س', zh: '小时', hi: 'घंटे', ja: '時間'
  },
  unit_minutes: {
    tr: 'dk', en: 'm', es: 'm', fr: 'm', de: 'Min.', it: 'm', pt: 'm', ru: 'мин.', ar: 'د', zh: '分钟', hi: 'मिनट', ja: '分'
  },
  page_label: {
    tr: 'Sayfa', en: 'Page', es: 'Página', fr: 'Page', de: 'Seite',
    it: 'Pagina', pt: 'Página', ru: 'Страница', ar: 'صفحة', zh: '页', hi: 'पृष्ठ', ja: 'ページ'
  },
  translating_word: {
    tr: 'Çeviriliyor...', en: 'Translating...', es: 'Traduciendo...', fr: 'Traduction...', de: 'Wird übersetzt...',
    it: 'Traduzione...', pt: 'Traduzindo...', ru: 'Перевод...', ar: 'جاري الترجمة...', zh: '正在翻译...', hi: 'अनुवाद...', ja: '翻訳中...'
  },
  toast_word_copied: {
    tr: 'Kelime ve çeviri kopyalandı, artık paylaşabilirsiniz! 🔗', en: 'Word and translation copied to clipboard! 🔗', es: '¡Palabra y traducción copiadas al portapapeles! 🔗', fr: 'Mot et traduction copiés dans le presse-papiers ! 🔗', de: 'Wort und Übersetzung in die Zwischenablage kopiert! 🔗',
    it: 'Parola e traduzione copiate negli appunti! 🔗', pt: 'Palavra e tradução copiadas para a área de transferência! 🔗', ru: 'Слово и перевод скопированы в буфер обмена! 🔗', ar: 'تم نسخ الكلمة والترجمة إلى الحافظة! 🔗', zh: '单词和翻译已复制到剪贴板！🔗', hi: 'शब्द और अनुवाद क्लिपबोर्ड पर कॉपी हो गए! 🔗', ja: '単語と翻訳がクリップボードにコピーされました！🔗'
  },
  toast_copy_tip: {
    tr: 'İpucu: Kelimeyi seçip kendiniz kopyalayabilirsiniz.', en: 'Tip: You can select the word and copy it yourself.', es: 'Sugerencia: Puedes seleccionar la palabra y copiarla tú mismo.', fr: 'Conseil : Vous pouvez sélectionner le mot et le copier vous-même.', de: 'Tipp: Sie können das Wort auswählen und selbst kopieren.',
    it: 'Suggerimento: puoi selezionare la parola e copiarla tu stesso.', pt: 'Dica: Você pode selecionar a palavra e copiá-la você mesmo.', ru: 'Совет: вы можете выбрать слово и скопировать его самостоятельно.', ar: 'نصيحة: يمكنك تحديد الكلمة ونسخها بنفسك.', zh: '提示：您可以选择单词并自行复制。', hi: 'सुझाव: आप शब्द का चयन करके उसे स्वयं कॉपी कर सकते हैं।', ja: 'ヒント：単語を選択して自分でコピーできます。'
  },
  toast_copy_failed: {
    tr: 'Sözcük kopyalanmadı ama okumaya devam edebilirsiniz.', en: 'Word could not be copied, but you can continue reading.', es: 'La palabra no se pudo copiar, pero puedes seguir leyendo.', fr: 'Le mot n\'a pas pu être copié, mais vous pouvez continuer à lire.', de: 'Wort konnte nicht kopiert werden, aber Sie können weiterlesen.',
    it: 'La parola non è stata copiata, ama puoi continuare a leggere.', pt: 'A palavra não pôde ser copiada, mas você pode continuar lendo.', ru: 'Слово не скопировано, но вы можете продолжить чтение.', ar: 'لم يتم نسخ الكلمة ولكن يمكنك الاستمرار في القراءة.', zh: '无法复制单词，但您可以继续阅读。', hi: 'शब्द कॉपी नहीं किया जा सका, लेकिन आप पढ़ना जारी रख सकते हैं।', ja: '単語をコピーできませんでしたが、読書を続けることができます。'
  },
  next_heart_refill: {
    tr: 'Bir sonraki can: {time}', en: 'Next life in: {time}', es: 'Próxima vida en: {time}', fr: 'Prochaine vie dans : {time}', de: 'Nächstes Leben in: {time}',
    it: 'Prossima vita in: {time}', pt: 'Próxima vida em: {time}', ru: 'Следующая жизнь через: {time}', ar: 'الحياة التالية خلال: {time}', zh: '距离下一次恢复生命值：{time}', hi: 'अगला जीवन: {time}', ja: 'ライフ回復まで: {time}'
  },
  loading_countdown: {
    tr: 'Doluyor...', en: 'Refilling...', es: 'Cargando...', fr: 'Chargement...', de: 'Wird geladen...',
    it: 'In ricarica...', pt: 'Recarregando...', ru: 'Загрузка...', ar: 'جاري الملء...', zh: '正在恢复...', hi: 'भर रहा है...', ja: '回復中...'
  },
  btn_refill_lives_premium: {
    tr: 'Canları Fulle (Premium Üyelik)', en: 'Refill Lives (Premium Membership)', es: 'Recargar vidas (Membresía Premium)', fr: 'Recharger les vies (Abonnement Premium)', de: 'Leben auffüllen (Premium-Mitgliedschaft)',
    it: 'Ricarica vite (Abbonamento Premium)', pt: 'Recarregar Vidas (Assinatura Premium)', ru: 'Пополнить жизни (Премиум)', ar: 'ملء الأرواح (عضوية بريميوم)', zh: '恢复生命值（高级会员）', hi: 'जीवन भरें (प्रीमियम सदस्यता)', ja: 'ライフを全回復（プレミアム）'
  },
  btn_next_page_index: {
    tr: 'Sonraki Sayfa (Sayfa {index}\'ye Geç)', en: 'Next Page (Go to Page {index})', es: 'Siguiente página (Ir a la página {index})', fr: 'Page suivante (Aller à la page {index})', de: 'Nächste Seite (Gehe zu Seite {index})',
    it: 'Pagina successiva (Vai alla pagina {index})', pt: 'Próxima página (Ir para a página {index})', ru: 'Следующая страница (Перейти к странице {index})', ar: 'الصفحة التالية (الذهاب إلى صفحة {index})', zh: '下一页（转到第 {index} 页）', hi: 'अगला पृष्ठ (पृष्ठ {index} पर जाएं)', ja: '次のページ（{index} ページへ）'
  },
  book_no_story: {
    tr: 'Bu kitapta hikaye bulunamadı', en: 'No story found in this book', es: 'No se encontró ninguna historia en este libro', fr: 'Aucune histoire trouvée dans ce livre', de: 'Keine Geschichte in diesem Buch gefunden',
    it: 'Nessuna storia trovata in questo libro', pt: 'Nenhuma história encontrada neste livro', ru: 'История в этой книге не найдена', ar: 'لم يتم العثdir على قصة في هذا الكتاب', zh: '本书未找到故事', hi: 'इस पुस्तक में कोई कहानी नहीं मिली', ja: 'この本にストーリーが見つかりませんでした'
  },
  btn_complete: {
    tr: 'Tamamla', en: 'Complete', es: 'Completar', fr: 'Terminer', de: 'Fertigstellen',
    it: 'Completa', pt: 'Concluir', ru: 'Завершить', ar: 'إكمال', zh: '完成', hi: 'पूरा करें', ja: '完了'
  },
  quiz_feedback_timeout_premium: {
    tr: '⏱️ Süre Doldu! ⏰', en: '⏱️ Time Out! ⏰', es: '⏱️ ¡Tiempo agotado! ⏰', fr: '⏱️ Temps écoulé ! ⏰', de: '⏱️ Zeit abgelaufen! ⏰',
    it: '⏱️ Tempo scaduto! ⏰', pt: '⏱️ Tempo esgotado! ⏰', ru: '⏱️ Время истекло! ⏰', ar: '⏱️ انتهى الوقت! ⏰', zh: '⏱️ 时间到！ ⏰', hi: '⏱️ समय समाप्त! ⏰', ja: '⏱️ 時間切れです！ ⏰'
  },
  quiz_feedback_timeout_normal: {
    tr: '⏱️ Süre Doldu! 1 Can eksildi.', en: '⏱️ Time Out! Lost 1 life.', es: '⏱️ ¡Tiempo agotado! Perdiste 1 vida.', fr: '⏱️ Temps écoulé ! 1 vie perdue.', de: '⏱️ Zeit abgelaufen! 1 Leben verloren.',
    it: '⏱️ Tempo scaduto! 1 vita persa.', pt: '⏱️ Tempo esgotado! Perdeu 1 vida.', ru: '⏱️ Время истекло! Потеряна 1 жизнь.', ar: '⏱️ انتهى الوقت! خسرت حياة واحدة.', zh: '⏱️ 时间到！减少 1 点生命值。', hi: '⏱️ समय समाप्त! 1 जीवन खो दिया।', ja: '⏱️ 時間切れです！ライフが1減少しました。'
  },
  quiz_feedback_correct: {
    tr: '🎉 Doğru cevap! İlerleniyor...', en: '🎉 Correct answer! Moving forward...', es: '🎉 ¡Respuesta correcta! Avanzando...', fr: '🎉 Bonne réponse ! En avant...', de: '🎉 Richtige Antwort! Weiter geht\'s...',
    it: '🎉 Risposta corretta! Si procede...', pt: '🎉 Resposta correta! Avançando...', ru: '🎉 Верно! Переход...', ar: '🎉 إجابة صحيحة! جاري التقدم...', zh: '🎉 回答正确！正在继续...', hi: '🎉 सही उत्तर! आगे बढ़ रहे हैं...', ja: '🎉 正解です！進みます...'
  },
  quiz_feedback_incorrect_premium: {
    tr: '😔 Yanlış cevap!', en: '😔 Incorrect answer!', es: '😔 ¡Respuesta incorrecta!', fr: '😔 Mauvaise réponse !', de: '😔 Falsche Antwort!',
    it: '😔 Risposta errata!', pt: '😔 Resposta incorreta!', ru: '😔 Неверно!', ar: '😔 إجابة خاطئة!', zh: '😔 回答错误！', hi: '😔 गलत उत्तर!', ja: '😔 不正解です！'
  },
  quiz_feedback_incorrect_normal: {
    tr: '😔 Yanlış cevap! 1 Can eksildi', en: '😔 Incorrect answer! Lost 1 life', es: '😔 ¡Respuesta incorrecta! Perdiste 1 vida', fr: '😔 Mauvaise réponse ! 1 vie perdue', de: '😔 Falsche Antwort! 1 Leben verloren',
    it: '😔 Risposta errata! 1 vita persa', pt: '😔 Resposta incorreta! Perdeu 1 vida', ru: '😔 Неверно! Потеряна 1 жизнь', ar: '😔 إجابة خاطئة! خسرت حياة واحدة', zh: '😔 回答错误！减少 1 点生命值', hi: '😔 गलत उत्तर! 1 जीवन खो दिया', ja: '😔 不正解です！ライフが1減少しました'
  },
  main_text_title: {
    tr: 'Ana Metin', en: 'Main Text', es: 'Texto Principal', fr: 'Texte Principal', de: 'Haupttext',
    it: 'Testo Principale', pt: 'Texto Principal', ru: 'Основной текст', ar: 'النص الرئيسي', zh: '正文', hi: 'मुख्य पाठ', ja: '本文'
  },
  dict_translation_failed: {
    tr: 'Çeviri yüklenemedi', en: 'Translation failed', es: 'Error de traducción', fr: 'Échec de la traduction', de: 'Übersetzung fehlgeschlagen',
    it: 'Traduzione fallita', pt: 'Falha na tradução', ru: 'Ошибка перевода', ar: 'فشلت الترجمة', zh: '翻译失败', hi: 'अनुवाद विफल', ja: '翻訳に失敗しました'
  },
  dict_proper_noun_desc: {
    tr: 'Özel isim veya Karakter adı', en: 'Proper noun or character name', es: 'Nombre propio o nombre del personaje', fr: 'Nom propre ou nom de personnage', de: 'Eigenname oder Charaktername',
    it: 'Nome proprio o nome del personaggio', pt: 'Nome próprio ou nome do personagem', ru: 'Имя собственное или имя персонажа', ar: 'اسم علم أو اسم شخصية', zh: '专有名词或角色名称', hi: 'व्यक्तिवाचक संज्ञा या चरित्र का नाम', ja: '固有名詞またはキャラクター名'
  },
  dict_connection_required: {
    tr: 'İnternet bağlantısı gerekiyor', en: 'Internet connection required', es: 'Se requiere conexión a Internet', fr: 'Connexion Internet requise', de: 'Internetverbindung erforderlich',
    it: 'Connessione Internet richiesta', pt: 'Conexão com a Internet necessária', ru: 'Требуется подключение к интернету', ar: 'يتطلب اتصالاً بالإنترنت', zh: '需要互联网连接', hi: 'इंटरनेट कनेक्शन की आवश्यकता है', ja: 'インターネット接続が必要です'
  },
  dict_ai_placeholder: {
    tr: 'Yapay zeka bağlamsal sözlük...', en: 'AI Contextual Dictionary...', es: 'Diccionario contextual de IA...', fr: 'Dictionnaire contextuel IA...', de: 'KI-Kontextwörterbuch...',
    it: 'Dizionario contestuale IA...', pt: 'Dicionário contextual de IA...', ru: 'Контекстный словарь ИИ...', ar: 'قاموس الذكاء الاصطناعي السياقي...', zh: '人工智能上下文词典...', hi: 'एआई प्रासंगिक शब्दकोश...', ja: 'AI文脈辞書...'
  },
  dict_proper_noun_detailed: {
    tr: 'Karakter veya Yer Adı • Özel İsim', en: 'Character or Place Name • Proper Noun', es: 'Nombre de personaje o lugar • Nombre propio', fr: 'Nom de personnage ou de lieu • Nom propre', de: 'Charakter- oder Ortsname • Eigenname',
    it: 'Nome di personaggio o luogo • Nome proprio', pt: 'Nome de personagem ou lugar • Nome próprio', ru: 'Имя персонажа или географическое название • Имя собственное', ar: 'اسم شخصية أو مكان • اسم علم', zh: '人物或地名 • 专有名词', hi: 'चरित्र या स्थान का नाम • व्यक्तिवाचक संज्ञा', ja: '人名または地名・固有名詞'
  },
  dict_derived_word: {
    tr: 'Çevrimdışı Sözlük • Türetilmiş', en: 'Offline Dictionary • Derived Word', es: 'Diccionario sin conexión • Palabra derivada', fr: 'Dictionnaire hors ligne • Mot dérivé', de: 'Offline-Wörbuch • Abgeleitetes Wort',
    it: 'Dizionario offline • Parola derivata', pt: 'Dicionário offline • Palavra derivada', ru: 'Офлайн-словарь • Производное слово', ar: 'قاموس دون اتصال • كلمة مشتقة', zh: '离线词典 • 派生词', hi: 'ऑफ़लाइन डिक्शनरी • व्युत्पnn शब्द', ja: 'オフライン辞書・派生語'
  },
  dict_contextual_word: {
    tr: 'Bağlamsal Sözcük', en: 'Contextual Word', es: 'Palabra contextual', fr: 'Mot contextuel', de: 'Kontextuelles Wort',
    it: 'Parola contestuale', pt: 'Palavra contextual', ru: 'Контекстное слово', ar: 'كلمة سياقية', zh: '上下文单词', hi: 'प्रासंगिक शब्द', ja: '文脈上の単語'
  },
  dict_translation_api: {
    tr: 'Çeviri API', en: 'Translation API', es: 'API de traducción', fr: 'API de traduction', de: 'Übersetzungs-API',
    it: 'API di traduzione', pt: 'API de tradução', ru: 'API перевода', ar: 'واجهة برمجة تطبيقات الترجمة', zh: '翻译 API', hi: 'अनुवाद एपीआई', ja: '翻訳API'
  },
  user_placeholder: {
    tr: 'Kullanıcı', en: 'User', es: 'Usuario', fr: 'Utilisateur', de: 'Benutzer',
    it: 'Utente', pt: 'Usuário', ru: 'Пользователь', ar: 'مستخدم', zh: '用户', hi: 'उपयोगकर्ता', ja: 'ユーザー'
  },
  share_download_link: {
    tr: 'Uygulama İndirme Bağlantısı', en: 'App Download Link', es: 'Enlace de descarga de la aplicación', fr: 'Lien de téléchargement de l\'application', de: 'App-Download-Link',
    it: 'Link per scaricare l\'applicazione', pt: 'Link de download do aplicativo', ru: 'Ссылка на скачивание приложения', ar: 'رابط تحميل التطبيق', zh: '应用下载链接', hi: 'ऐप डाउनलोड लिंक', ja: 'アプリダウンロードリンク'
  },
  share_system_btn: {
    tr: 'Sistem Paylaşımı ile Gönder', en: 'Send with System Share', es: 'Enviar con Compartir sistema', fr: 'Envoyer avec le Partage système', de: 'Mit Systemfreigabe senden',
    it: 'Invia con condivisione di sistema', pt: 'Enviar com Compartilhar sistema', ru: 'Отправить через системный шеринг', ar: 'إرسال عبر مشاركة النظام', zh: '通过系统分享发送', hi: 'सिस्टम शेयर के साथ भेजें', ja: 'システム共有で送信'
  },
  dict_selected_word: {
    tr: 'SEÇİLEN KELİME', en: 'SELECTED WORD', es: 'PALABRA SELECCIONADA', fr: 'MOT SÉLECTIONNÉ', de: 'AUSGEWÄHLTES WORT',
    it: 'PAROLA SELEZIONATA', pt: 'PALAVRA SELECIONADA', ru: 'ВЫБРАННОЕ СЛОВО', ar: 'الكلمة المختارة', zh: '已选单词', hi: 'चयनित शब्द', ja: '選択された単語'
  },
  dict_saved_success: {
    tr: 'Kelimeye Kaydedildi', en: 'Saved to Words', es: 'Guardado en Palabras', fr: 'Enregistré dans les mots', de: 'In Wörtern gespeichert',
    it: 'Salvato nelle parole', pt: 'Salvo em palavras', ru: 'Сохранено в слова', ar: 'تم الحفظ في الكلمات', zh: '已保存至单词', hi: 'शब्दों में सहेजा गया', ja: '単語に保存されました'
  },
  dict_save_to_vocab: {
    tr: 'Kelime Dağarcığına Kaydet', en: 'Save to Vocabulary', es: 'Guardar en vocabulario', fr: 'Enregistrer dans le vocabulaire', de: 'Im Wortschatz speichern',
    it: 'Salva nel vocabolario', pt: 'Salvar no vocabulário', ru: 'Сохранить в словарь', ar: 'حفظ في المفردات', zh: '保存至生词本', hi: 'शब्दावली में सहेजें', ja: '単語帳に保存'
  },
  fallback_word_story: {
    tr: 'hikaye', en: 'story', es: 'historia', fr: 'histoire', de: 'Geschichte',
    it: 'storia', pt: 'história', ru: 'история', ar: 'قصة', zh: '故事', hi: 'कहानी', ja: '物語'
  },
  fallback_sent_story: {
    tr: 'İlginç bir hikaye okudu.', en: 'She read an interesting story.', es: 'Ella leyó una historia interesante.', fr: 'Elle a lu une histoire intéressante.', de: 'Sie las eine interessante Geschichte.',
    it: 'Ha letto una storia interessante.', pt: 'Ela leu uma história interessante.', ru: 'Она прочитала интересную историю.', ar: 'قرأت قصة مثيرة للاهتمام.', zh: '她读了一个有趣的故事。', hi: 'उसने एक दिलचस्प कहानी पढ़ी।', ja: '彼女は面白い物語を読みました。'
  },
  fallback_word_friend: {
    tr: 'arkadaş', en: 'friend', es: 'amigo', fr: 'ami', de: 'Freund',
    it: 'amico', pt: 'amigo', ru: 'друг', ar: 'صديق', zh: '朋友', hi: 'मित्र', ja: '友達'
  },
  fallback_sent_friend: {
    tr: 'En iyi arkadaşıyla buluştu.', en: 'He met his best friend.', es: 'Se reunió con su mejor amigo.', fr: 'Il a rencontré son meilleur ami.', de: 'Er traf seinen besten Freund.',
    it: 'Ha incontrato il suo migliore amico.', pt: 'Ele se encontrou com seu melhor amigo.', ru: 'Он встретил своего лучшего друга.', ar: 'التقى بأعز أصدقائه.', zh: '他见了他最好的朋友。', hi: 'वह अपने सबसे अच्छे दोस्त से मिला।', ja: '彼は親友に会いました。'
  },
  fallback_word_happy: {
    tr: 'mutlu', en: 'happy', es: 'feliz', fr: 'heureux', de: 'glücklich',
    it: 'felice', pt: 'feliz', ru: 'счастливый', ar: 'سعيد', zh: '快乐', hi: 'खुश', ja: '幸せ'
  },
  fallback_sent_happy: {
    tr: 'Mutlu bir hayat yaşadılar.', en: 'They lived a happy life.', es: 'Vivieron una vida feliz.', fr: 'Ils ont vécu une vie heureuse.', de: 'Sie führten ein glückliches Leben.',
    it: 'Hanno vissuto una vita felice.', pt: 'Eles viveram uma vida feliz.', ru: 'Они жили счастливой жизнью.', ar: 'عاشوا حياة سعيدة.', zh: '他们过着幸福的生活。', hi: 'उन्होंने एक खुशहाल जीवन जिया।', ja: '彼らは幸せな人生を送りました。'
  },
  fallback_word_time: {
    tr: 'zaman', en: 'time', es: 'tiempo', fr: 'temps', de: 'Zeit',
    it: 'tempo', pt: 'tempo', ru: 'время', ar: 'وقت', zh: '时间', hi: 'समय', ja: '時間'
  },
  fallback_sent_time: {
    tr: 'Bir varmış bir yokmuş.', en: 'Once upon a time.', es: 'Había una vez.', fr: 'Il était une fois.', de: 'Es war einmal.',
    it: 'C\'era una volta.', pt: 'Era uma vez.', ru: 'Однажды.', ar: 'كان يا ما كان.', zh: '从前。', hi: 'एक समय की बात है।', ja: '昔々あるところに。'
  },
  fallback_word_day: {
    tr: 'gün', en: 'day', es: 'día', fr: 'jour', de: 'Tag',
    it: 'giorno', pt: 'dia', ru: 'день', ar: 'يوم', zh: '天', hi: 'दिन', ja: '日'
  },
  fallback_sent_day: {
    tr: 'Güneşli bir gündü.', en: 'It was a sunny day.', es: 'Era un día soleado.', fr: 'C\'était un jour ensoleillé.', de: 'Es war ein sonniger Tag.',
    it: 'Era una giornata di sole.', pt: 'Foi um dia ensolarado.', ru: 'Это был солнечный день.', ar: 'كان يومًا مشمشًا.', zh: '那是一个晴朗的一天。', hi: 'यह एक धूप वाला दिन था।', ja: '晴れた日でした。'
  },
  fallback_word_house: {
    tr: 'ev', en: 'house', es: 'casa', fr: 'maison', de: 'Haus',
    it: 'casa', pt: 'casa', ru: 'дом', ar: 'بيت', zh: '房子', hi: 'घर', ja: '家'
  },
  fallback_sent_house: {
    tr: 'Eve yürüdüler.', en: 'They walked to the house.', es: 'Caminaron hacia la casa.', fr: 'Ils ont marché vers la maison.', de: 'Sie gingen zum Haus.',
    it: 'Camminarono verso la casa.', pt: 'Eles caminharam para a casa.', ru: 'Они пошли к дому.', ar: 'مشوا إلى البيت.', zh: '他们走向那栋房子。', hi: 'वे घर की ओर चले गए।', ja: '彼らは家に向かって歩きました。'
  },
  fallback_word_word: {
    tr: 'kelime', en: 'word', es: 'palabra', fr: 'mot', de: 'Wort',
    it: 'parola', pt: 'palavra', ru: 'слово', ar: 'كلمة', zh: '单词', hi: 'शब्द', ja: '単語'
  },
  fallback_sent_word: {
    tr: 'Kelimeyi yazın.', en: 'Write down the word.', es: 'Escribe la palabra.', fr: 'Écrivez le mot.', de: 'Schreib das Wort auf.',
    it: 'Scrivi la parola.', pt: 'Escreva a palavra.', ru: 'Запишите слово.', ar: 'اكتب الكلمة.', zh: '写下这个单词。', hi: 'शब्द लिखो।', ja: '単語を書き留めてください。'
  },
  distractor_run: {
    tr: 'koşmak', en: 'run', es: 'correr', fr: 'courir', de: 'laufen',
    it: 'correre', pt: 'correr', ru: 'бежать', ar: 'يجري', zh: '跑', hi: 'दौड़ना', ja: '走る'
  },
  distractor_eat: {
    tr: 'yemek', en: 'eat', es: 'comer', fr: 'manger', de: 'essen',
    it: 'mangiare', pt: 'comer', ru: 'есть', ar: 'يأكل', zh: '吃', hi: 'खाना', ja: '食べる'
  },
  distractor_smile: {
    tr: 'gülümsemek', en: 'smile', es: 'sonreír', fr: 'soure', de: 'lächeln',
    it: 'sorridere', pt: 'sorrir', ru: 'улыбаться', ar: 'يبتسم', zh: '微笑', hi: 'मुस्कुराना', ja: '微笑む'
  },
  distractor_tree: {
    tr: 'ağaç', en: 'tree', es: 'árbol', fr: 'arbre', de: 'Baum',
    it: 'albero', pt: 'árvore', ru: 'дерево', ar: 'شجرة', zh: '树', hi: 'पेड़', ja: '木'
  },
  distractor_basket: {
    tr: 'sepet', en: 'basket', es: 'cesta', fr: 'panier', de: 'Korb',
    it: 'cesto', pt: 'cesta', ru: 'корзина', ar: 'سلة', zh: '篮子', hi: 'टोकरी', ja: 'バスケット'
  },
  distractor_dog: {
    tr: 'köpek', en: 'dog', es: 'perro', fr: 'chien', de: 'Hund',
    it: 'cane', pt: 'cachorro', ru: 'собака', ar: 'كلب', zh: '狗', hi: 'कुत्ता', ja: '犬'
  },
  sentence_label: {
    tr: 'Cümle', en: 'Sentence', es: 'Oración', fr: 'Phrase', de: 'Satz',
    it: 'Frase', pt: 'Frase', ru: 'Предложение', ar: 'جملة', zh: '句子', hi: 'वाक्य', ja: '文章'
  },
  dict_listen_pronunciation: {
    tr: 'Telaffuzu Dinle', en: 'Listen to Pronunciation', es: 'Escuchar pronunciación', fr: 'Écouter la prononciation', de: 'Aussprache anhören',
    it: 'Ascolta la pronuncia', pt: 'Ouvir pronúncia', ru: 'Слушать произношение', ar: 'استمع إلى النطق', zh: '听发音', hi: 'उच्चारण सुनें', ja: '発音を聞く'
  },
  dict_share_word: {
    tr: 'Kelimeyi Paylaş', en: 'Share Word', es: 'Compartir palabra', fr: 'Partager le mot', de: 'Wort teilen',
    it: 'Condividi parola', pt: 'Compartilhar palavra', ru: 'Поделиться словом', ar: 'مشاركة الكلمة', zh: '分享单词', hi: 'शब्द साझा करें', ja: '単語を共有する'
  },
  quiz_fill_blank_hint_prefix: {
    tr: 'Anlamı:', en: 'Meaning:', es: 'Significado:', fr: 'Signification :', de: 'Bedeutung:',
    it: 'Significato:', pt: 'Significado:', ru: 'Значение:', ar: 'المعنى:', zh: '意思：', hi: 'अर्थ:', ja: '意味:'
  },
  privacy_title: {
    tr: 'Gizlilik Politikası', en: 'Privacy Policy', es: 'Política de privacidad', fr: 'Politique de confidentialité', de: 'Datenschutzerklärung',
    it: 'Informativa sulla privacy', pt: 'Política de Privacidade', ru: 'Политика конфиденциальности', ar: 'سياسة الخصوصية', zh: '隐私政策', hi: 'गोपनीयता नीति', ja: 'プライバシーポリシー'
  },
  privacy_intro: {
    tr: 'İngilizce Öyküm, kullanıcılarımızın gizliliğini korumaya büyük önem verir. Bu belge, verilerinizin nasıl toplandığı ve korunduğu hakkında bilgi sağlamak amacıyla hazırlanmıştır.',
    en: 'İngilizce Öyküm attaches great importance to protecting the privacy of our users. This document has been prepared to provide information about how your data is collected and protected.',
    es: 'İngilizce Öyküm le da gran importancia a proteger la privacidad de nuestros usuarios. Este documento ha sido preparado para proporcionar información sobre cómo se recopilan y protegen sus datos.',
    fr: 'İngilizce Öyküm accorde une grande importance à la protection de la vie privée de ses utilisateurs. Ce document a été préparé pour fournir des informations sur la manière dont vos données sont collectées et protégées.',
    de: 'İngilizce Öyküm legt großen Wert auf den Schutz der Privatsphäre unserer Nutzer. Dieses Dokument wurde erstellt, um Informationen darüber bereitzustellen, wie Ihre Daten erhoben und geschützt werden.',
    it: 'İngilizce Öyküm attribuisce grande importanza alla protezione della privacy dei nostri utenti. Questo documento è stato redatto per fornire informazioni su come i tuoi dati vengono raccolti e protetti.',
    pt: 'İngilizce Öyküm dá grande importância à proteção da privacidade dos nossos usuários. Este documento foi elaborado para fornecer informações sobre como seus dados são coletados e protegidos.',
    ru: 'İngilizce Öyküm уделяет большое внимание защите конфиденциальности наших пользователей. Этот документ подготовлен для предоставления информации о том, как ваши данные собираются и защищаются.',
    ar: 'تولي İngilizce Öyküm أهمية كبيرة لحماية خصوصية مستخدمينا. تم إعداد هذه الوثيقة لتقديم معلومات حول كيفية جمع بياناتك وحمايتها.',
    zh: 'İngilizce Öyküm 非常重视保护用户隐私。本文件旨在为您提供有关如何收集和保护您数据的信息。',
    hi: 'İngilizce Öyküm हमारे उपयोगकर्ताओं की गोपनीयता की रक्षा करने को बहुत महत्व देता है। यह दस्तावेज़ इस बारे में जानकारी प्रदान करने के लिए तैयार किया गया है कि आपका डेटा कैसे एकत्र और सुरक्षित किया जाता है।',
    ja: 'İngilizce Öyküm は、ユーザーのプライバシー保護を非常に重視しています。このドキュメントは、データがどのように収集および保護されるかについての情報を提供するために作成されました。'
  },
  privacy_section_1_title: {
    tr: '1. Toplanan Bilgiler ve Amacı', en: '1. Collected Information and Purpose', es: '1. Información Recopilada y Propósito', fr: '1. Informations collectées et objectif', de: '1. Erhobene Daten und Zweck',
    it: '1. Informazioni raccolte e scopo', pt: '1. Informações Coletadas e Finalidade', ru: '1. Сбор информации и цель', ar: '1. المعلومات التي يتم جمعها والغرض منها', zh: '1. 收集的信息及其目的', hi: '1. एकत्रित जानकारी और उद्देश्य', ja: '1. 収集する情報とその目的'
  },
  privacy_section_1_desc: {
    tr: 'Uygulamamız doğrudan üyelik (şifre, e-posta) veya sosyal medya girişleri kullanmamaktadır. Cihazınızda tamamen anonim bir Cihaz Kimliği (Device UUID) üretilir. Bu kimlik, okuma ilerlemeniz, kazandığınız rozetler ve kaydettiğiniz kelimelerin sunucumuzda güvenli bir şekilde yedeklenmesini sağlamak için kullanılır.',
    en: 'Our application does not use direct membership (password, email) or social media logins. A completely anonymous Device ID (Device UUID) is generated on your device. This ID is used to securely back up your reading progress, earned badges, and saved words on our server.',
    es: 'Nuestra aplicación no utiliza membresía directa (contraseña, correo electrónico) ni inicios de sesión en redes sociales. Se genera un ID de dispositivo (UUID de dispositivo) completamente anónimo en su dispositivo. Este ID se utiliza para realizar copias de seguridad de forma segura de su progreso de lectura, insignias ganadas y palabras guardadas en nuestro servidor.',
    fr: 'Notre application n\'utilise pas d\'inscription directe (mot de passe, e-mail) ni de connexions aux réseaux sociaux. Un identifiant de périphérique (UUID du périphérique) totalement anonyme est généré sur votre appareil. Cet identifiant est utilisé pour sauvegarder en toute sécurité votre progression de lecture, les badges gagnés et les mots enregistrés sur notre serveur.',
    de: 'Unsere Anwendung verwendet keine direkte Mitgliedschaft (Passwort, E-Mail) oder Social-Media-Logins. Auf Ihrem Gerät wird eine völlig anonyme Geräte-ID (Device UUID) generiert. Diese ID wird verwendet, um Ihren Lesefortschritt, verdiente Abzeichen und gespeicherte Wörter auf unserem Server sicher zu sichern.',
    it: 'La nostra applicazione non utilizza l\'iscrizione diretta (password, e-mail) o gli accessi ai social media. Sul tuo dispositivo viene generato un ID dispositivo (UUID dispositivo) completamente anonimo. Questo ID viene utilizzato per eseguire il backup sicuro dei tuoi progressi di lettura, dei badge guadagnati e delle parole salvate sul nostro server.',
    pt: 'Nosso aplicativo não usa associação direta (senha, e-mail) ou logins de mídia social. Um ID de dispositivo (Device UUID) totalmente anônimo é gerado no seu dispositivo. Este ID é usado para fazer backup seguro do seu progresso de leitura, badges conquistados e palavras salvas no nosso servidor.',
    ru: 'Наше приложение не использует прямую регистрацию (пароль, эл. почта) или вход через соцсети. На вашем устройстве генерируется полностью анонимный идентификатор устройства (UUID устройства). Этот ID используется для надежного резервного копирования вашего прогресса чтения, полученных значков и сохраненных слов на нашем сервере.',
    ar: 'لا يستخدم تطبيقنا العضوية المباشرة (كلمة المرور، البريد الإلكتروني) أو تسجيلات الدخول إلى وسائل التواصل الاجتماعي. يتم إنشاء معرف جهاز مجهول الهوية بالكامل (Device UUID) على جهازك. يُستخدم هذا المعرف لإجراء نسخ احتياطي آمن لتقدمك في القراءة والbadges التي حصلت عليها والكلمات المحفوظة على خادمنا.',
    zh: '我们的应用程序不使用直接会员资格（密码、邮箱）或社交媒体登录。您的设备上会生成 un 完全匿名的设备 ID (Device UUID)。此 ID 用于在我们的服务器上安全地备份您的阅读进度、获得的徽章和保存的单词。',
    hi: 'हमारा एप्लिकेशन सीधे सदस्यता (पासवर्ड, ईमेल) या सोशल मीडिया लॉगिन का उपयोग नहीं करता है। आपके डिवाइस पर पूरी तरह से एक अनाम डिवाइस आईडी (Device UUID) उत्पन्न होती है। इस आईडी का उपयोग हमारे सर्वर पर आपके पढ़ने की प्रगति, अर्जित बैज और सहेजे गए शब्दों को सुरक्षित रूप से बैकअप करने के लिए किया जाता है।',
    ja: '当アプリは、直接の会員登録（パスワード、メール）やソーシャルメディアログインを使用しません。デバイス上に完全に匿名のデバイスID（Device UUID）が生成されます。このIDは、読書の進捗状況、獲得したバッジ、保存された単語をサーバー上に安全にバックアップするために使用されます。'
  },
  privacy_section_2_title: {
    tr: '2. Çocukların Gizliliği', en: '2. Children\'s Privacy', es: '2. Privacidad de los Niños', fr: '2. Confidentialité des enfants', de: '2. Privatsphäre von Kindern',
    it: '2. Privacy dei bambini', pt: '2. Privacidade das Crianças', ru: '2. Конфиденциальность детей', ar: '2. خصوصية الأطفال', zh: '2. 儿童隐私', hi: '2. बच्चों की गोपनीयता', ja: '2. 子どものプライバシー'
  },
  privacy_section_2_desc: {
    tr: 'Uygulamamız COPPA ve GDPR çocuk gizliliği kurallarına tam uyumludur. Çocuklardan gerçek ad, soyad, e-posta adresi, telefon numarası veya konum bilgisi gibi hiçbir kişisel veri talep edilmez ve toplanmaz. Tüm süreç tamamen anonim cihaz kimliğiyle yürütülür.',
    en: 'Our application is fully compliant with COPPA and GDPR children\'s privacy rules. No personal data such as real name, surname, email address, phone number or location information is requested or collected from children. The entire process is carried out entirely with an anonymous device ID.',
    es: 'Nuestra aplicación cumple totalmente con las reglas de privacidad infantil COPPA y GDPR. No se solicita ni se recopila de los niños ningún dato personal como nombre real, apellido, dirección de correo electrónico, número de teléfono o información de ubicación. Todo el proceso se lleva a cabo en su totalidad con un ID de dispositivo anónimo.',
    fr: 'Notre application est entièrement conforme aux règles de confidentialité des enfants COPPA et GDPR. Aucune donnée personnelle telle que le nom réel, le nom de famille, l\'adresse e-mail, le numéro de téléphone ou les informations de localisation n\'est demandée ou collectée auprès des enfants. L\'ensemble du processus est mené entièrement avec un identifiant de périphérique anonyme.',
    de: 'Unsere Anwendung entspricht vollständig den Kinderschutzbestimmungen von COPPA und DSGVO. Von Kindern werden keine personenbezogenen Daten wie echter Name, Nachname, E-Mail-Adresse, Telefonnummer oder Standortinformationen angefordert oder erhoben. Der gesamte Prozess wird ausschließlich über eine anonyme Geräte-ID abgewickelt.',
    it: 'La nostra applicazione è pienamente conforme alle norme sulla privacy dei bambini COPPA e GDPR. Ai bambini non vengono richiesti né raccolti dati personali come nome, cognome, indirizzo e-mail, numero di telefono o informazioni sulla posizione. L\'intero processo si svolge interamente con un ID dispositivo anonimo.',
    pt: 'Nosso aplicativo está em total conformidade com as regras de privacidade infantil do COPPA e GDPR. Nenhum dado pessoal como nome real, sobrenome, endereço de e-mail, número de telefone ou informações de localização é solicitado ou coletado de crianças. Todo o processo é realizado inteiramente com um ID de dispositivo anônimo.',
    ru: 'Наше приложение полностью соответствует правилам конфиденциальности детей COPPA и GDPR. У детей не запрашиваются и не собираются никакие личные данные, такие как настоящее имя, фамилия, адрес электронной почты, номер телефона или информация о местоположении. Весь процесс осуществляется полностью по анонимному идентификатору устройства.',
    ar: 'يتوافق تطبيقنا تمامًا مع قواعد خصوصية الأطفال COPPA و GDPR. لا يُطلب من الأطفال أو يُجمع منهم أي بيانات شخصية مثل الاسم الحقيقي أو اسم العائلة أو عنوان البريد الإلكتروني أو رقم الهاتف أو معلومات الموقع. تتم العملية برمتها بالكامل باستخدام معرف جهاز مجهول الهوية.',
    zh: '我们的应用程序完全符合 COPPA 和 GDPR 儿童隐私规则。我们不会向儿童索取或收集任何个人数据，例如真实姓名、姓氏、电子邮件地址、电话号码或位置信息。整个过程完全使用匿名的设备 ID 进行。',
    hi: 'हमारा एप्लिकेशन COPPA और GDPR बच्चों की गोपनीयता नियमों का पूरी तरह से पालन करता है। बच्चों से कोई भी व्यक्तिगत डेटा जैसे वास्तविक नाम, उपनाम, ईमेल पता, फोन नंबर या स्थान की जानकारी का अनुरोध या संग्रह नहीं किया जाता है। पूरी प्रक्रिया पूरी तरह से एक अनाम डिवाइस आईडी के साथ की जाती है।',
    ja: '当アプリは、COPPAおよびGDPRの児童プライバシー規則に完全に準拠しています。児童から本名、姓、メールアドレス、電話番号、位置情報などの個人情報を要求または収集することはありません。すべてのプロセスは、完全に匿名のデバイスIDによって行われます。'
  },
  privacy_section_3_title: {
    tr: '3. Veri Paylaşımı', en: '3. Data Sharing', es: '3. Compartir Datos', fr: '3. Partage des données', de: '3. Weitergabe von Daten',
    it: '3. Condivisione dei dati', pt: '3. Compartilhamento de Dados', ru: '3. Передача данных', ar: '3. مشاركة البيانات', zh: '3. 数据共享', hi: '3. डेटा साझा करना', ja: '3. データの共有'
  },
  privacy_section_3_desc: {
    tr: 'Toplanan veriler üçüncü şahıslarla, reklam ağlarıyla veya veri şirketleriyle kesinlikle paylaşılmaz veya satılmaz. Uygulamamızda üçüncü taraf reklamları bulunmamaktadır.',
    en: 'Collected data is strictly not shared or sold to third parties, ad networks or data companies. There are no third-party advertisements in our application.',
    es: 'Los datos recopilados no se comparten ni se venden en absoluto a terceros, redes publicitarias o empresas de datos. No hay anuncios de terceros en nuestra aplicación.',
    fr: 'Les données collectées ne sont strictement pas partagées ni vendues à des tiers, des réseaux publicitaires ou des sociétés de données. Il n\'y a pas de publicités de tiers dans notre application.',
    de: 'Die erhobenen Daten werden strengstens nicht an Dritte, Werbenetzwerke oder Datenunternehmen weitergegeben oder verkauft. Es gibt keine Werbung von Drittanbietern in unserer Anwendung.',
    it: 'I dati raccolti non vengono assolutamente condivisi o venduti a terzi, reti pubblicitarie o società de dati. Nella nostra applicazione non sono presenti annunci pubblicitari di terze parti.',
    pt: 'Os dados coletados não são estritamente compartilhados ou vendidos a terceiros, redes de anunciantes ou empresas de dados. Não há anúncios de terceiros no nosso aplicativo.',
    ru: 'Собранные данные категорически не передаются и не продаются третьим лицам, рекламным сетям или аналитическим компаниям. В нашем приложении нет сторонней рекламы.',
    ar: 'لا يتم مشاركة البيانات التي يتم جمعها أو بيعها لأطراف ثالثة أو شبكات إcelانية أو شركات بيانات بأي حال من الأحوال. لا توجد إعلانات من جهات خارجية في تطبيقنا.',
    zh: '收集的数据绝不会与第三方、广告网络或数据公司共享或出售。我们的 app 中没有第三方广告。',
    hi: 'एकत्रित डेटा को तीसरे पक्ष, विज्ञापन नेटवर्क या डेटा कंपनियों के साथ बिल्कुल भी साझा या बेचा नहीं जाता है। हमारे एप्लिकेशन में कोई तीसरे पक्ष के विज्ञापन नहीं हैं।',
    ja: '収集されたデータが第三者、広告ネットワーク、またはデータ企業と共有または販売されることは厳重にありません。当アプリには基本広告は含まれていません。'
  },
  privacy_section_4_title: {
    tr: '4. Hesap ve Veri Silme', en: '4. Account and Data Deletion', es: '4. Eliminación de Cuentas y Datos', fr: '4. Suppression du compte et des données', de: '4. Löschung von Konto und Daten',
    it: '4. Cancellazione dell\'account e dei dati', pt: '4. Exclusão de Conta e Dados', ru: '4. Удаление аккаунта и данных', ar: '4. حذف الحساب والبيانات', zh: '4. 删除账户和数据', hi: '4. खाता और डेटा हटाना', ja: '4. アカウントとデータの削除'
  },
  privacy_section_4_desc: {
    tr: 'Dilediğiniz an Profil > Genel Ayarlar menüsündeki "Hesabımı ve Verilerimi Sil" butonunu kullanarak tüm sunucu yedeklerinizi ve cihazınızdaki yerel verilerinizi kalıcı olarak silebilirsiniz.',
    en: 'At any time, you can permanently delete all server backups and local data on your device using the "Delete My Account and Data" button in the Profile > General Settings menu.',
    es: 'En cualquier momento, puede eliminar permanentemente todas las copias de seguridad del servidor y los datos locales de su dispositivo utilizando el botón "Eliminar mi cuenta y datos" en el menú Perfil > Configuración general.',
    fr: 'À tout moment, vous pouvez supprimer définitivement toutes les sauvegardes du serveur et les données locales de votre appareil en utilisant le bouton « Supprimer mon compte et mes données » dans le menu Profil > Paramètres généraux.',
    de: 'Sie können jederzeit alle Server-Backups und lokalen Daten auf Ihrem Gerät dauerhaft löschen, indem Sie im Menü Profil > Allgemeine Einstellungen auf die Schaltfläche "Mein Konto und meine Daten löschen" klicken.',
    it: 'In qualsiasi momento, puoi eliminare definitivamente tutti i backup del server e i dati locali sul tuo dispositivo utilizzando il pulsante "Elimina il mio account e i dati" nel menu Profilo > Impostazioni generali.',
    pt: 'A qualquer momento, você pode excluir permanentemente todos os backups do servidor e dados locais no seu dispositivo usando o botão "Excluir minha conta e dados" no menu Perfil > Configurações Gerais.',
    ru: 'В любой момент вы можете навсегда удалить все резервные копии с сервера и локальные данные на вашем устройстве, используя кнопку «Удалить мой аккаунт и данные» в меню Профиль > Общие настройки.',
    ar: 'في أي وقت، يمكنك حذف جميع النسخ الاحتياعية على الخادم والبيانات المحلية على جهازك نهائيًا باستخدام زر "حذف حسابي وبياناتي" في قائمة الملف الشخصي > الإعدادات العامة.',
    zh: '您随时可以使用“个人资料 > 通用设置”菜单中的“删除我的账户和数据”按钮，永久删除您设备上的所有服务器备份和本地数据。',
    hi: 'किसी भी समय, आप प्रोफ़ाइल > सामान्य सेटिंग्स मेनू में "मेरा खाता और डेटा हटाएं" बटन का उपयोग करके अपने डिवाइस पर सभी सर्ver बैकअप और स्थानीय डेटा को स्थायी रूप से हटा सकते हैं।',
    ja: 'プロフィール ＞ 一般設定メニュー内の「アカウントとデータの削除」ボタンを使用することで、いつでもすべてのサーバーバックアップおよびデバイス上のローカルデータを完全に削除できます。'
  },
  privacy_section_5_title: {
    tr: '5. İletişim', en: '5. Contact', es: '5. Contacto', fr: '5. Contact', de: '5. Kontakt',
    it: '5. Contatti', pt: '5. Contato', ru: '5. Контакты', ar: '5. الاتصال', zh: '5. 联系我们', hi: '5. संपर्क', ja: '5. お問い合わせ'
  },
  privacy_section_5_desc: {
    tr: 'Gizlilik ile ilgili sorularınız için bizimle colorstrikearda@gmail.com e-posta adresi üzerinden iletişime geçebilirsiniz.',
    en: 'For privacy-related questions, you can contact us via email at colorstrikearda@gmail.com.',
    es: 'Para preguntas relacionadas con la privacidad, puede contactarnos por correo electrónico a colorstrikearda@gmail.com.',
    fr: 'Pour toute question relative à la confidentialité, vous pouvez nous contacter par e-mail à colorstrikearda@gmail.com.',
    de: 'Bei Fragen zum Datenschutz können Sie uns per E-Mail unter colorstrikearda@gmail.com kontaktieren.',
    it: 'Per domande relative alla privacy, puoi contattarci via e-mail all\'indirizzo colorstrikearda@gmail.com.',
    pt: 'Para dúvidas relacionadas à privacidade, você pode entrar em contato conosco pelo e-mail colorstrikearda@gmail.com.',
    ru: 'По вопросам конфиденциальности вы можете связаться с нами по электронной почте colorstrikearda@gmail.com.',
    ar: 'للأسئلة المتعلقة بالخصوصية، يمكنك الاتصال بنا عبر البريد الإلكتروني على colorstrikearda@gmail.com.',
    zh: '如有隐私相关问题，您可以通过电子邮件 colorstrikearda@gmail.com 与我们联系。',
    hi: 'गोपनीयता से संबंधित प्रश्नों के लिए, आप colorstrikearda@gmail.com पर ईमेल के माध्यम से हमसे संपर्क कर सकते हैं।',
    ja: 'プライバシーに関するお問い合わせは、メール（colorstrikearda@gmail.com）にてご連絡ください。'
  },
  congratulations: {
    tr: 'TEBRİKLER! 🏆', en: 'CONGRATULATIONS! 🏆', es: '¡FELICITACIONES! 🏆', fr: 'FÉLICITATIONS ! 🏆', de: 'HERZLICHEN GLÜCKWUNSCH! 🏆',
    it: 'CONGRATULAZIONI! 🏆', pt: 'PARABÉNS! 🏆', ru: 'ПОЗДРАВЛЯЕМ! 🏆', ar: 'تهانينا! 🏆', zh: '恭喜！🏆', hi: 'बधाई हो! 🏆', ja: 'おめでとうございます！🏆'
  },
  alert_premium_expired: {
    tr: 'Premium üyeliğinizin süresi dolmuştur. Devam etmek için lütfen aboneliğinizi yenileyin.',
    en: 'Your Premium membership has expired. Please renew your subscription to continue.',
    es: 'Tu suscripción Premium ha expirado. Por favor, renueva tu suscripción para continuar.',
    fr: 'Votre abonnement Premium a expiré. Veuillez renouveler votre abonnement pour continuer.',
    de: 'Ihr Premium-Abonnement ist abgelaufen. Bitte erneuern Sie Ihr Abonnement, um fortzufahren.',
    it: 'Il tuo abbonamento Premium è scaduto. Rinnova l\'abbonamento per continuare.',
    pt: 'Sua assinatura Premium expirou. Por favor, renove sua assinatura para continuar.',
    ru: 'Срок действия вашей премиум-подписки истек. Пожалуйста, продлите подписку, чтобы продолжить.',
    ar: 'لقد انتهت صلاحية اشتراك بريميوم الخاص بك. يرجى تجديد اشتراكك للمتابعة.',
    zh: '您的会员已过期。请续订以继续使用。',
    hi: 'आपकी premium सदस्यता समाप्त हो गई है। जारी रखने के लिए कृपया अपनी सदस्यता का नवीनीकरण करें।',
    ja: 'プレミアム会員の期限が切れました。続行するには定期購入を更新してください。'
  },
  daily_goal_completed_title: {
    tr: 'GÜNLÜK HEDEF TAMAMLANDI! 🏆', en: 'DAILY GOAL COMPLETED! 🏆', es: '¡OBJETIVO DIARIO COMPLETADO! 🏆', fr: 'OBJECTIF DIARY REMPLI ! 🏆', de: 'TÄGLICHES ZIEL ERREICHT! 🏆',
    it: 'OBIETTIVO GIORNALIERO COMPLETATO! 🏆', pt: 'OBJETIVO DIÁRIO CONCLUÍDO! 🏆', ru: 'ЕЖЕДНЕВНАЯ ЦЕЛЬ ДОСТИГНУТА! 🏆', ar: 'تم تحقيق الهدف اليومي! 🏆', zh: '达成每日目标！🏆', hi: 'दैनिक लक्ष्य पूरा हुआ! 🏆', ja: 'デイリー目標達成！🏆'
  },
  daily_goal_read_desc: {
    tr: 'Tebrikler, günlük 20 dakika okuma hedefine ulaştın! 📚🔥',
    en: 'Congratulations, you reached the daily 20-minute reading goal! 📚🔥',
    es: '¡Felicitaciones, lograste el objetivo diario de 20 minutos de lectura! 📚🔥',
    fr: 'Félicitations, vous avez atteint l\'objectif quotidien de 20 minutes de lecture ! 📚🔥',
    de: 'Glückwunsch, du hast das tägliche Leseziel von 20 Minuten erreicht! 📚🔥',
    it: 'Congratulazioni, hai raggiunto l\'obiettivo giornaliero de 20 minuti di leitura! 📚🔥',
    pt: 'Parabéns, você alcançou a meta diária de 20 minutos de leitura! 📚🔥',
    ru: 'Поздравляем, вы достигли ежедневной цели чтения в 20 минут! 📚🔥',
    ar: 'تهانينا، لقد حققت هدف القراءة اليومي البالغ 20 دقيقة! 📚🔥',
    zh: '恭喜您，达成了每日阅读20分钟的目标！📚🔥',
    hi: 'बधाई हो, आपने दैनिक 20-मिनट पढ़ने का लक्ष्य पूरा कर लिया है! 📚🔥',
    ja: 'おめでとうございます、今日の読書目標（20分）を達成しました！📚🔥'
  },
  daily_goal_vocab_desc: {
    tr: 'Tebrikler, bugün 10 yeni kelime kaydetme hedefine ulaştın! 📝✨',
    en: 'Congratulations, you saved 10 new words today! 📝✨',
    es: '¡Felicitaciones, guardaste 10 palabras nuevas hoy! 📝✨',
    fr: 'Félicitations, vous avez enregistré 10 nouveaux mots aujourd\'hui ! 📝✨',
    de: 'Glückwunsch, du hast heute 10 neue Wörter gespeichert! 📝✨',
    it: 'Congratulazioni, hai salvato 10 parole nuove oggi! 📝✨',
    pt: 'Parabéns, você salvou 10 palavras novas hoje! 📝✨',
    ru: 'Поздравляем, вы сохранили сегодня 10 новых слов! 📝✨',
    ar: 'تهانينا، لقد حفظت 10 كلمات جديدة اليوم! 📝✨',
    zh: '恭喜您，今天保存了10个新单词！📝✨',
    hi: 'बधाई हो, आपने आज 10 नए शब्द सहेजे हैं! 📝✨',
    ja: 'おめでとうございます、今日10個の新しい単語を保存しました！📝✨'
  },
  daily_goal_quiz_desc: {
    tr: 'Tebrikler, 5 quizi tamamladın! Günlük Başarı Ortalaman: %{avg} 🎯',
    en: 'Congratulations, you completed 5 quizzes! Daily Success Average: {avg}% 🎯',
    es: '¡Felicitaciones, completaste 5 cuestionarios! Promedio de éxito diario: {avg}% 🎯',
    fr: 'Félicitations, vous avez terminé 5 quiz ! Moyenne de réussite quotidienne : {avg} % 🎯',
    de: 'Glückwunsch, du hast 5 Quizzes abgeschlossen! Tägliche Erfolgsquote: {avg}% 🎯',
    it: 'Congratulazioni, hai completato 5 quiz! Media successi giornaliera: {avg}% 🎯',
    pt: 'Parabéns, você completou 5 quizzes! Média de sucesso diária: {avg}% 🎯',
    ru: 'Поздравляем, вы прошли 5 квизов! Средний балл за день: {avg}% 🎯',
    ar: 'تهانينا، لقد أكملت 5 اختبارات! متوسط نجاحك اليومي: {avg}% 🎯',
    zh: '恭喜您完成5次测试！每日平均正确率：{avg}% 🎯',
    hi: 'बधाई हो, आपने 5 क्विज़ पूरे कर लिए हैं! दैनिक सफलता औसत: {avg}% 🎯',
    ja: 'おめでとうございます、5つのクイズを完了しました！今日の平均正解率: {avg}% 🎯'
  },
  badge_unlocked_msg: {
    tr: 'Tebrikler! "{title}" rozetini kazandınız! 🎉',
    en: 'Congratulations! You unlocked the "{title}" badge! 🎉',
    es: '¡Felicitaciones! ¡Ganaste la insignia "{title}"! 🎉',
    fr: 'Félicitations ! Vous avez remporté le badge « {title} » ! 🎉',
    de: 'Herzlichen Glückwunsch! Du hast das Abzeichen „{title}“ freigeschaltet! 🎉',
    it: 'Congratulazioni! Hai sbloccato il distintivo "{title}"! 🎉',
    pt: 'Parabéns! Você ganhou o distintivo "{title}"! 🎉',
    ru: 'Поздравляем! Вы получили значок «{title}»! 🎉',
    ar: 'تهانينا! لقد حصلت على شارة "{title}"! 🎉',
    zh: '恭喜您！获得了“{title}”徽章！🎉',
    hi: 'बधाई हो! आपने "{title}" पदक जीत लिया है! 🎉',
    ja: 'おめでとうございます！「{title}」バッジを獲得しました！🎉'
  },
  premium_unlocked_msg: {
    tr: 'Tebrikler! Premium üye oldunuz, ayrıcalıklarınızdan faydalanabilirsiniz! 👑',
    en: 'Congratulations! You are now a Premium member, enjoy your privileges! 👑',
    es: '¡Felicitaciones! Ahora eres miembro Premium, ¡disfruta de tus privilegios! 👑',
    fr: 'Félicitations ! Vous êtes désormais membre Premium, profitez de vos privilèges ! 👑',
    de: 'Herzlichen Glückwunsch! Du bist jetzt Premium-Mitglied, genieße deine Vorteile! 👑',
    it: 'Congratulazioni! Ora sei un membro Premium, goditi i tuoi privilegi! 👑',
    pt: 'Parabéns! Você agora é um membro Premium, aproveite seus privilégios! 👑',
    ru: 'Поздравляем! Теперь вы Премиум-участник, пользуйтесь своими привилегиями! 👑',
    ar: 'تهانينا! لقد أصبحت عضوًا في باقة بريميوم، استمتع بمزاياك! 👑',
    zh: '恭喜您！您已成为会员，尽情享受您的特权吧！👑',
    hi: 'बधाई हो! अब आप प्रीमियम सदस्य हैं, अपने विशेषाधिकारों का आनंद लें! 👑',
    ja: 'おめでとうございます！プレミアム会員になりました。すべての機能をご利用いただけます！👑'
  },
  fav_add_tooltip: {
    tr: 'Favorilere Ekle', en: 'Add to Favorites', es: 'Añadir a favoritos', fr: 'Ajouter aux favoris', de: 'Zu Favoriten hinzufügen',
    it: 'Aggiungi ai preferiti', pt: 'Adicionar aos Favoritos', ru: 'Добавить в избранное', ar: 'إضافة إلى المفضلة', zh: '添加到收藏夹', hi: 'पसंदीदा में जोड़ें', ja: 'お気に入りに追加'
  },
  library_remove_reading_list: {
    tr: 'Okunanlar listesinden çıkar', en: 'Remove from reading list', es: 'Quitar de la lista de lectura', fr: 'Retirer de la liste de lecture', de: 'Aus der Leseliste entfernen',
    it: 'Rimuovi dalla lista di lettura', pt: 'Remover da lista de leitura', ru: 'Удалить из списка чтения', ar: 'إزالة من قائمة القراءة', zh: '从阅读列表中移除', hi: 'पढ़ने की सूची से हटाएं', ja: '閲覧リストから削除'
  },
  library_total_stories_all: {
    tr: 'Toplam {count} Hikaye', en: 'Total {count} Stories', es: 'Total {count} historias', fr: 'Total {count} histoires', de: 'Insgesamt {count} Geschichten',
    it: 'Totale {count} storie', pt: 'Total de {count} histórias', ru: 'Всего {count} историй', ar: 'إجمالي {count} قصص', zh: '共 {count} 个故事', hi: 'कुल {count} कहानियाँ', ja: '合計 {count} 件のストーリー'
  },
  library_total_stories_category: {
    tr: 'Toplam {count} {category}', en: 'Total {count} {category} Stories', es: 'Total {count} historias de {category}', fr: 'Total {count} histoires de {category}', de: 'Insgesamt {count} {category}-Geschichten',
    it: 'Totale {count} storie di {category}', pt: 'Total de {count} histórias de {category}', ru: 'Всего {count} историй {category}', ar: 'إجمالي {count} قصص {category}', zh: '共 {count} 个{category}故事', hi: 'कुल {count} {category} कहानियाँ', ja: '合計 {count} 件の{category}ストーリー'
  },
  all_levels: {
    tr: 'Tüm Seviyeler', en: 'All Levels', es: 'Todos los niveles', fr: 'Tous les niveaux', de: 'Alle Stufen',
    it: 'Tutti i livelli', pt: 'Todos os níveis', ru: 'Все уровни', ar: 'جميع المستويات', zh: '所有级别', hi: 'सभी स्तर', ja: 'すべてのレベル'
  },
  no_books_found_filter: {
    tr: 'Bu filtre kombinasyonunda kitap bulunamadı.',
    en: 'No books found matching this filter combination.',
    es: 'No se encontraron libros en esta combinación de filtros.',
    fr: 'Aucun livre trouvé dans cette combinaison de filtres.',
    de: 'Keine Bücher in dieser Filterkombination gefunden.',
    it: 'Nessun libro trovato in questa combinazione di filtri.',
    pt: 'Nenhum livro encontrado nesta combinação de filtros.',
    ru: 'Книги по этому сочетанию фильтров не найдены.',
    ar: 'لم يتم العثور على كتب في هذه المجموعة من الفلاتر.',
    zh: '在此筛选组合下未找到书籍。',
    hi: 'इस फ़िल्टर संयोजन में कोई पुस्तक नहीं मिली।',
    ja: 'このフィルターの組み合わせに一致する本は見つかりませんでした。'
  },
  percentage_completed: {
    tr: '%{percent} tamamlandı', en: '{percent}% completed', es: '{percent}% completado', fr: '{percent}% complété', de: '{percent}% abgeschlossen',
    it: '{percent}% completato', pt: '{percent}% concluído', ru: '{percent}% завершено', ar: 'تم إكمال {percent}%', zh: '已完成 {percent}%', hi: '{percent}% पूर्ण', ja: '{percent}% 完了'
  },
  library_other_reading_books: {
    tr: 'Diğer Okunan Kitaplar ({count})', en: 'Other Books Being Read ({count})', es: 'Otros libros que estás leyendo ({count})', fr: 'Autres livres en cours de lecture ({count})', de: 'Andere gelesene Bücher ({count})',
    it: 'Altri libri in lettura ({count})', pt: 'Outros livros sendo lidos ({count})', ru: 'Другие читаемые книги ({count})', ar: 'كتب أخرى قيد القراءة ({count})', zh: '其他正在阅读的书籍 ({count})', hi: 'पढ़ी जा रही अन्य पुस्तकें ({count})', ja: '現在読んでいる他の本 ({count})'
  },
  library_quick_recommendations: {
    tr: 'HIZLI ÖNERİLER', en: 'QUICK RECOMMENDATIONS', es: 'RECOMENDACIONES RÁPIDAS', fr: 'RECOMMANDATIONS RAPIDES', de: 'SCHNELLE EMPFEHLUNGEN',
    it: 'RACCOMANDAZIONI RAPIDE', pt: 'RECOMENDAÇÕES RÁPIDAS', ru: 'БЫСТРЫЕ РЕКОМЕНДАЦИИ', ar: 'توصيات سريعة', zh: '快速推荐', hi: 'त्वरित अनुशंसाएँ', ja: 'クイックおすすめ'
  },
  library_double_click_category: {
    tr: '(Çift tıklayarak sayfasına gidin)', en: '(Double click to go to its page)', es: '(Doble clic para ir a su página)', fr: '(Double-cliquez pour aller sur sa page)', de: '(Doppelklicken, um zur Seite zu gelangen)',
    it: '(Doppio clic per andare alla sua pagina)', pt: '(Duplo clique para ir para a página)', ru: '(Дважды щелкните, чтобы перейти на страницу)', ar: '(انقر نقرًا مزدوجًا للانتقال إلى صفحته)', zh: '（双击前往其页面）', hi: '(इसके पृष्ठ पर जाने के लिए डबलクリック करें)', ja: '（ダブルクリックしてページへ移動）'
  },
  filter_all_levels: {
    tr: 'Tümü', en: 'All', es: 'Todos', fr: 'Tous', de: 'Alle',
    it: 'Tutti', pt: 'Todos', ru: 'Все', ar: 'الكل', zh: '全部', hi: 'सभी', ja: 'すべて'
  },
  stats_words_read: {
    tr: 'OKUNAN KELİME', en: 'WORDS READ', es: 'PALABRAS LEÍDAS', fr: 'MOTS LUS', de: 'GELESENE WÖRTER',
    it: 'PAROLE LETTE', pt: 'PALABRAS LIDAS', ru: 'ПРОЧИТАННЫЕ СЛОВА', ar: 'الكلمات المقروءة', zh: '已读单词', hi: 'पढ़े गए शब्द', ja: '読んだ単語'
  },
  stats_reading_time: {
    tr: 'OKUMA SÜRESİ', en: 'READING TIME', es: 'TIEMPO DE LECTURA', fr: 'TEMPS DE LECTURE', de: 'LESEZEIT',
    it: 'TEMPO DI LETTURA', pt: 'TEMPO DE LEITURA', ru: 'ВРЕМЯ ЧТЕНИЯ', ar: 'وقت القراءة', zh: '阅读时间', hi: 'पढ़ने का समय', ja: '読書時間'
  },
  reading_time_expired: {
    tr: 'Süre doldu, seri sıfırlandı! ⏱️😢', en: 'Time expired, streak reset! ⏱️😢', es: '¡Se acabó el tiempo, racha reiniciada! ⏱️😢', fr: 'Temps écoulé, série réinitialisée ! ⏱️😢', de: 'Zeit abgelaufen, Serie zurückgesetzt! ⏱️😢',
    it: 'Tempo scaduto, serie azzerata! ⏱️😢', pt: 'O tempo expirou, sequência redefinida! ⏱️😢', ru: 'Время истекло, серия сброшена! ⏱️😢', ar: 'انتهى الوقت، تم إعادة ضبط السلسلة! ⏱️😢', zh: '时间到，连击重置！⏱️😢', hi: 'समय समाप्त, स्ट्रीक रीसेट! ⏱️😢', ja: '制限時間終了、ストリークがリセットされました！⏱️😢'
  },
  reading_streak_reset: {
    tr: 'Seri sıfırlandı! 😢', en: 'Streak reset! 😢', es: '¡Racha reiniciada! 😢', fr: 'Série réinitialisée ! 😢', de: 'Serie zurückgesetzt! 😢',
    it: 'Serie azzerata! 😢', pt: 'Sequência redefinida! 😢', ru: 'Серия сброшена! 😢', ar: 'تم إعادة ضبط السلسلة! 😢', zh: '连击重置！😢', hi: 'स्ट्रीक रीसेट! 😢', ja: 'ストリークがリセットされました！😢'
  },
  quiz_premium_skipped: {
    tr: 'Quizi premium ayrıcalığı ile geçtiniz! Keyifli okumalar. 🚀', en: 'You passed the quiz with Premium privilege! Happy reading. 🚀', es: '¡Pasaste el cuestionario con privilegios Premium! Feliz lectura. 🚀', fr: 'Vous avez réussi le quiz grâce au privilège Premium ! Bonne lecture. 🚀', de: 'Sie haben das Quiz mit Premium-Privileg bestanden! Viel Spaß beim Lesen. 🚀',
    it: 'Hai superato il quiz con i privilegi Premium! Buona lettura. 🚀', pt: 'Você passou no quiz com privilégio Premium! Boa leitura. 🚀', ru: 'Вы прошли квиз благодаря Премиум-привилегии! Приятного чтения. 🚀', ar: 'لقد اجتزت الاختبار بميزة بريميوم! قراءة ممتعة. 🚀', zh: '您凭借会员特权免试通过！阅读愉快。🚀', hi: 'आपने प्रीमियम विशेषाधिकार के साथ क्विज़ पास कर लिया! हैप्पी रीडिंग। 🚀', ja: 'プレミアム特典によりクイズをパスしました！読書をお楽しみください。🚀'
  },
  book_started_success: {
    tr: 'Harika! Hikayeye başarıyla başlandı. Kitap, kitaplığınızdaki "Şu Anda Okunanlar" listenize eklendi. 🎉',
    en: 'Great! Story successfully started. The book has been added to your "Currently Reading" list in the library. 🎉',
    es: '¡Estupendo! La historia ha comenzado con éxito. El libro se ha añadido a tu lista de "Leyendo actualmente" en la biblioteca. 🎉',
    fr: 'Génial ! L\'histoire a commencé avec succès. Le livre a été ajouté à votre liste « Lecture en cours » dans la bibliothèque. 🎉',
    de: 'Großartig! Geschichte erfolgreich gestartet. Das Buch wurde Ihrer Liste „Gerade gelesen“ in der Bibliothek hinzugefügt. 🎉',
    it: 'Fantastico! Storia iniziata con successo. Il libro è stato aggiunto alla tua lista "In lettura" nella biblioteca. 🎉',
    pt: 'Excelente! História iniciada com sucesso. O livro foi adicionado à sua lista de "Lendo Atualmente" na biblioteca. 🎉',
    ru: 'Отлично! История успешно начата. Книга добавлена в ваш список «Читаю сейчас» в библиотеке. 🎉',
    ar: 'رائع! تم بدء القصة بنجاح. تمت إضافة الكتاب إلى قائمة "قيد القراءة حاليًا" في المكتبة. 🎉',
    zh: '太棒了！故事已成功开始。该书已添加到图书馆的“正在阅读”列表中。🎉',
    hi: 'बहुत बढ़िया! कहानी सफलतापूर्वक शुरू हो गई है। पुस्तक को पुस्तकालय में आपकी "अभी पढ़ी जा रही" सूची में जोड़ दिया गया है। 🎉',
    ja: '素晴らしい！ストーリーが正常に開始されました。本がライブラリの「現在読んでいる本」リストに追加されました。 🎉'
  },
  reading_next_page_prompt: {
    tr: 'Sonraki Sayfa (Sayfa {page}e Geç)', en: 'Next Page (Go to Page {page})', es: 'Siguiente página (Ir a la página {page})', fr: 'Page suivante (Aller à la page {page})', de: 'Nächste Seite (Gehe zu Seite {page})',
    it: 'Pagina successiva (Vai alla pagina {page})', pt: 'Próxima página (Ir para a página {page})', ru: 'Следующая страница (Перейти к странице {page})', ar: 'الصفحة التالية (الذهاب إلى صفحة {page})', zh: '下一页（前往第 {page} 页）', hi: 'अगला पृष्ठ (पृष्ठ {page} पर जाएं)', ja: '次のページ（{page} ページへ進む）'
  },
  reading_next_page_btn: {
    tr: 'İleri →', en: 'Next →', es: 'Siguiente →', fr: 'Suivant →', de: 'Weiter →',
    it: 'Avanti →', pt: 'Avançar →', ru: 'Далее →', ar: 'التالي →', zh: '下一页 →', hi: 'आगे →', ja: '次へ →'
  },
  no_lives_title: {
    tr: 'Canınız Kalmadı!', en: 'No Lives Left!', es: '¡No te quedan vidas!', fr: 'Plus de vies !', de: 'Keine Leben mehr!',
    it: 'Nessuna vita rimasta!', pt: 'Sem vidas restantes!', ru: 'Не осталось жизней!', ar: 'نفدت الأرواح!', zh: '没有生命值了！', hi: 'कोई जीवन नहीं बचा!', ja: 'ライフがなくなりました！'
  },
  no_lives_desc: {
    tr: 'Okumaya devam etmek için canlarınızın zamanla dolmasını bekleyebilir veya Premium üyeliğe geçerek canınızı anında fulleyebilirsiniz!',
    en: 'To continue reading, you can wait for your lives to refill over time, or upgrade to Premium to instantly refill your lives!',
    es: 'Para seguir leyendo, puedes esperar a que tus vidas se recarguen con el tiempo, o actualizar a Premium para recargarlas instantáneamente.',
    fr: 'Pour continuer à lire, vous pouvez attendre que vos vies se rechargent avec le temps, ou passer à Premium pour les recharger instantanément !',
    de: 'Um weiterzulesen, können Sie warten, bis sich Ihre Leben mit der Zeit wieder auffüllen, oder auf Premium upgraden, um Ihre Leben sofort aufzufüllen!',
    it: 'Per continuare a leggere, puoi attendere che le tue vite si ricarichino nel tempo, oppure passare a Premium per ricaricarle all\'istante!',
    pt: 'Para continuar lendo, você pode esperar que suas vidas recarreguem com o tempo ou atualizar para Premium para recarregá-las instantaneamente!',
    ru: 'Чтобы продолжить чтение, вы можете подождать, пока ваши жизни восстановятся со временем, или перейти на Премиум, чтобы мгновенно восстановить их!',
    ar: 'لمواصلة القراءة، يمكنك الانتظار حتى تمتلئ أرواحك بمرور الوقت، أو الترقية إلى بريميوم لملء أرواحك على الفور!',
    zh: '若要继续阅读，您可以等待生命值随时间恢复，或升级到会员以立即补满生命值！',
    hi: 'पढ़ना जारी रखने के लिए, आप समय के साथ अपने जीवन के फिर से भरने की प्रतीक्षा कर सकते हैं, या तुरंत अपना जीवन भरने के लिए प्रीमियम में अपग्रेड कर सकते हैं!',
    ja: '読書を続けるには、時間経過によるライフの回復を待つか、プレミアムにアップグレードしてライフを即座に全回復できます！'
  },
  premium_access_title: {
    tr: 'İngilizce Öyküm Premium Erişimi', en: 'My English Story Premium Access', es: 'Acceso Premium a My English Story', fr: 'Accès Premium My English Story', de: 'My English Story Premium-Zugriff',
    it: 'Accesso Premium My English Story', pt: 'Acesso Premium My English Story', ru: 'Премиум-доступ My English Story', ar: 'اشتراك بريميوم في My English Story', zh: 'My English Story 会员通道', hi: 'My English Story प्रीमियम एक्सेस', ja: 'My English Story プレミアムアクセス'
  },
  refill_countdown_desc: {
    tr: 'Bir sonraki can {time} içinde dolacak.', en: 'Next life will refill in {time}.', es: 'La próxima vida se recargará en {time}.', fr: 'La prochaine vie se rechargera dans {time}.', de: 'Das nächste Leben wird in {time} aufgeladen.',
    it: 'La prossima vita si ricaricherà in {time}.', pt: 'A próxima vida recarregará em {time}.', ru: 'Следующая жизнь восстановится через {time}.', ar: 'ستمتلئ الحياة التالية خلال {time}.', zh: '下一次生命将在 {time} 内恢复。', hi: 'अगला जीवन {time} में फिर से भर जाएगा।', ja: '次のライフは {time} 内に回復します。'
  },
  premium_features_desc: {
    tr: 'Sınırsız can, interaktif kelime pratikleri, ssl şifreli ödeme altyapısı ve düşük gecikmeli veri senkronizasyonu sizi bekliyor!',
    en: 'Unlimited lives, interactive vocabulary practice, SSL-encrypted payment infrastructure, and low-latency data synchronization await you!',
    es: '¡Vidas ilimitadas, práctica interactiva de vocabulario, infraestructura de pago encriptada SSL y sincronización de datos de baja latencia te esperan!',
    fr: 'Des vies illimitées, des exercices de vocabulaire interactifs, une infrastructure de paiement cryptée SSL et une synchronisation des données à faible latence vous attendent !',
    de: 'Unbegrenzte Leben, interaktives Wortschatztraining, SSL-verschlüsselte Zahlungsinfrastruktur und Datensynchronisierung mit geringer Latenz erwarten Sie!',
    it: 'Vite illimitate, pratica interattiva dei vocaboli, infrastruttura di pagamento crittografata SSL e sincronizzazione dei dati a bassa latenza ti aspettano!',
    pt: 'Vidas ilimitadas, prática interativa de vocabulário, infraestrutura de pagamento criptografada SSL e sincronização de dados de baixa latência esperam por você!',
    ru: 'Вас ждут безлимитные жизни, интерактивная практика слов, инфраструктура платежей с шифрованием SSL и синхронизация данных с низкой задержкой!',
    ar: 'أرواح غير محدودة، وممارسة مفردات تفاعلية، وبنية تحتية للمدفوعات مشفرة بـ SSL، ومزامنة بيانات سريعة بانتظارك!',
    zh: '无限生命值、互动单词练习、SSL 加密支付以及超低延迟数据同步等您体验！',
    hi: 'असीमित जीवन, इंटरैक्टिव शब्दावली अभ्यास, एसएसएल-एन्क्रिप्टेड भुगतान बुनियादी ढांचा, और कम-विलंबता डेटा सिंक्रनाइज़ेशन आपका इंतजार कर रहे हैं!',
    ja: '無制限のライフ、インタラクティブな単語練習、SSL暗号化決済システム、低遅延のデータ同期をご利用いただけます！'
  },
  subscription_plans: {
    tr: 'ÜYELİK ABONELİK PAKETLERİ', en: 'MEMBERSHIP SUBSCRIPTION PLANS', es: 'PLANES DE SUSCRIPCIÓN DE MEMBRESÍA', fr: "PLANS D'ABONNEMENT DE MEMBRE", de: 'MITGLIEDSCHAFTS-ABONNEMENTS',
    it: 'PIANI DI ABBONAMENTO ASSOCIATIVO', pt: 'PLANOS DE ASSINATURA DE MEMBRO', ru: 'ТАРИФНЫЕ ПЛАНЫ ПОДПИСКИ', ar: 'باقات اشتراك العضوية', zh: '会员订阅计划', hi: 'सदस्यता योजनाएं', ja: 'メンバーシップ購読プラン'
  },
  monthly_subscription: {
    tr: 'Aylık Abonelik', en: 'Monthly Subscription', es: 'Suscripción mensual', fr: 'Abonnement mensuel', de: 'Monatliches Abonnement',
    it: 'Abbonamento mensile', pt: 'Assinatura mensal', ru: 'Ежемесячная подписка', ar: 'اشتراك شهري', zh: '月度订阅', hi: 'मासिक सदस्यता', ja: '月間サブスクリプション'
  },
  cancel_anytime: {
    tr: 'İstediğin zaman iptal et.', en: 'Cancel anytime.', es: 'Cancela en cualquier momento.', fr: 'Annulez à tout moment.', de: 'Jederzeit kündbar.',
    it: 'Cancella in qualsiasi momento.', pt: 'Cancele a qualquer momento.', ru: 'Отмена в любое время.', ar: 'إلغاء في أي وقت.', zh: '随时取消。', hi: 'किसी भी সময় रद्द करें。', ja: 'いつでもキャンセル可能。'
  },
  percent_discount: {
    tr: '%{percent} İNDİRİMLİ', en: '{percent}% OFF', es: '{percent}% DE DESCUENTO', fr: '{percent}% DE RÉDUCTION', de: '{percent}% RABATT',
    it: '{percent}% SCONTO', pt: '{percent}% DE DESCONTO', ru: 'СКИДКА {percent}%', ar: 'خصم {percent}%', zh: '享 {percent}% 优惠', hi: '{percent}% की छूट', ja: '{percent}% 割引'
  },
  yearly_subscription: {
    tr: 'Yıllık Abonelik', en: 'Yearly Subscription', es: 'Suscripción anual', fr: 'Abonnement annuel', de: 'Jährliches Abonnement',
    it: 'Abbonamento annuale', pt: 'Assinatura anual', ru: 'Ежегодная подписка', ar: 'اشتراك سنوي', zh: '年度订阅', hi: 'वार्षिक सदस्यता', ja: '年間サブスクリプション'
  },
  yearly_payment_detail: {
    tr: 'Toplam 712₺ tek çekim ödeme.', en: 'Total 712₺ single payment.', es: 'Total 712₺ en un solo pago.', fr: 'Total 712 ₺ paiement unique.', de: 'Insgesamt 712 ₺ Einmalzahlung.',
    it: 'Totale 712 ₺ pagamento unico.', pt: 'Total de 712 ₺ pagamento único.', ru: 'Всего 712 ₺ разовым платежом.', ar: 'إجمالي 712 ₺ دفعة واحدة.', zh: '总共 712 ₺ 单次付清。', hi: 'कुल 712 ₺ एकल भुगतान।', ja: '合計 712 ₺ 一括払い。'
  },
  google_play_payment: {
    tr: 'GOOGLE PLAY ÖDEMESİ', en: 'GOOGLE PLAY PAYMENT', es: 'PAGO DE GOOGLE PLAY', fr: 'PAIEMENT GOOGLE PLAY', de: 'GOOGLE PLAY ZAHLUNG',
    it: 'PAGAMENTO GOOGLE PLAY', pt: 'PAGAMENTO DO GOOGLE PLAY', ru: 'ОПЛАТА GOOGLE PLAY', ar: 'دفع جوجل بلاي', zh: 'GOOGLE PLAY 支付', hi: 'गूगल प्ले भुगतान', ja: 'GOOGLE PLAY 決済'
  },
  google_play_protected: {
    tr: 'Google Play Korumalı', en: 'Google Play Protected', es: 'Protegido por Google Play', fr: 'Protégé par Google Play', de: 'Über Google Play geschützt',
    it: 'Protetto da Google Play', pt: 'Protegido pelo Google Play', ru: 'Защищено Google Play', ar: 'محمي بواسطة جوجل بلاي', zh: 'Google Play 安全防范', hi: 'गूगल प्ले संरक्षित', ja: 'Google Play 保護'
  },
  processing_google_play: {
    tr: 'Google Play ile İşleniyor...', en: 'Processing with Google Play...', es: 'Procesando con Google Play...', fr: 'Traitement avec Google Play...', de: 'Verarbeitung über Google Play...',
    it: 'Elaborazione con Google Play...', pt: 'Processando com o Google Play...', ru: 'Обработка через Google Play...', ar: 'جاري المعالجة بواسطة جوجل بلاي...', zh: '正在使用 Google Play 处理...', hi: 'गूगल प्ले के साथ संसाधित किया जा रहा है...', ja: 'Google Play で処理中...'
  },
  payment_success_premium: {
    tr: 'Ödeme Başarılı! Premium Aktive Edildi. 🎉', en: 'Payment Successful! Premium Activated. 🎉', es: '¡Pago exitoso! Premium activado. 🎉', fr: 'Paiement réussi ! Premium activé. 🎉', de: 'Zahlung erfolgreich! Premium aktiviert. 🎉',
    it: 'Pagamento riuscito! Premium attivato. 🎉', pt: 'Pagamento bem-sucedido! Premium ativado. 🎉', ru: 'Оплата прошла успешно! Премиум активирован. 🎉', ar: 'تم الدفع بنجاح! تم تفعيل اشتراك بريميوم. 🎉', zh: '支付成功！已激活会员。🎉', hi: 'भुगतान सफल! प्रीमियम सक्रिय। 🎉', ja: '決済完了！プレミアムが有効化されました。🎉'
  },
  google_play_method: {
    tr: 'Google Play Tanımlı Ödeme Yöntemi', en: 'Google Play Defined Payment Method', es: 'Método de pago definido en Google Play', fr: 'Mode de paiement défini sur Google Play', de: 'In Google Play hinterlegte Zahlungsmethode',
    it: 'Metodo di pagamento definito su Google Play', pt: 'Método de pagamento definido no Google Play', ru: 'Способ оплаты, указанный в Google Play', ar: 'طريقة الدفع المحددة في جوجل بلاي', zh: 'Google Play 已设定的支付方式', hi: 'गूगल प्ले परिभाषित भुगतान विधि', ja: 'Google Play 設定済みの決済方法'
  },
  default_label: {
    tr: 'Varsayılan', en: 'Default', es: 'Predeterminado', fr: 'Par défaut', de: 'Standard',
    it: 'Predefinito', pt: 'Padrão', ru: 'По умолчанию', ar: 'افتراضي', zh: '默认', hi: 'डिफ़ॉルト', ja: 'デフォルト'
  },
  google_play_terms_desc: {
    tr: 'Satın Al butonuna tıklayarak Google Play Hizmet Şartları\'nı kabul etmiş olursunuz. Aboneliğiniz, son faturalandırma döneminden en az 24 saat önce iptal edilmediği sürece otomatik olarak yenilenir ve seçtiğiniz tutar üzerinden ({amount}) Google Play tanımlı kartınızdan tahsil edilir. Aboneliklerinizi dilediğiniz zaman Google Play Store ayarlarınızdan yönetebilir veya iptal edebilirsiniz.',
    en: 'By clicking Buy, you agree to the Google Play Terms of Service. Your subscription automatically renews unless canceled at least 24 hours before the end of the billing cycle, and you will be charged {amount} to your Google Play payment method. You can manage or cancel your subscription anytime in Google Play settings.',
    es: 'Al hacer clic en Comprar, aceptas las Condiciones del servicio de Google Play. Tu suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del ciclo de facturación, y se te cobrarán {amount} en tu método de pago de Google Play. Puedes administrar o cancelar tu suscripción en cualquier momento en los ajustes de Google Play.',
    fr: 'En cliquant sur Acheter, vous acceptez les Conditions d\'utilisation de Google Play. Votre abonnement se renouvelle automatiquement sauf s\'il est résilié au moins 24 heures avant la fin du cycle de facturation, et vous serez facturé de {amount} sur votre mode de paiement Google Play. Vous pouvez gérer ou résilier votre abonnement à tout moment dans les paramètres de Google Play.',
    de: 'Durch Klicken auf Kaufen stimmen Sie den Nutzungsbedingungen von Google Play zu. Ihr Abonnement verlängert sich automatisch, sofern es nicht mindestens 24 Stunden vor Ablauf des Abrechnungszeitraums gekündigt wird, und Ihre Google Play-Zahlungsmethode wird mit {amount} belastet. Sie können Ihr Abonnement jederzeit in den Google Play-Einstellungen verwalten oder kündigen.',
    it: 'Facendo clic su Acquista, accetti i Termini di servizio di Google Play. L\'abbonamento si rinnova automaticamente a meno que non venga annullato almeno 24 ore prima della fine del ciclo di fatturazione, e ti verranno addebitati {amount} sul tuo metodo di pagamento Google Play. Puoi gestire o annullare l\'abbonamento in qualsiasi momento nelle impostazioni di Google Play.',
    pt: 'Ao clicar em Comprar, você concorda com os Termos de Serviço do Google Play. Sua assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do final do ciclo de faturamento, e você receberá uma cobrança de {amount} em sua forma de pagamento do Google Play. Você pode gerenciar ou cancelar sua assinatura a qualquer momento nas configurações do Google Play.',
    ru: 'Нажимая кнопку «Купить», вы соглашаетесь с Условиями использования Google Play. Ваша подписка продлевается автоматически, если вы не отмените ее по крайней мере за 24 часа до окончания расчетного периода, и с вашего способа оплаты в Google Play будет списано {amount}. Вы можете управлять подпиской или отменить ее в любое время в настройках Google Play.',
    ar: 'بالنقر فوق شراء، فإنك توافق على بنود خدمة جوجل بلاي. يتم تجديد اشتراكك تلقائيًا ما لم يتم إلغاؤه قبل 24 ساعة على الأقل من نهاية دورة الفوترة، وسيتم فرض {amount} على طريقة دفع جوجل بلاي الخاصة بك. يمكنك إدارة اشتراكك أو إلغاؤه في أي وقت في إعدادات جوجل بلاي.',
    zh: '点击购买即表示您同意 Google Play 服务条款。除非在计费周期结束前至少 24 小时取消，否则您的订阅会自动续订，并且将从您的 Google Play 支付方式中扣除 {amount}。您可以随时在 Google Play 设置中管理或取消订阅。',
    hi: 'खरीदें पर क्लिक करके, आप Google Play सेवा की शर्तों से सहमत होते हैं। आपकी सदस्यता स्वतः नवीनीकृत हो जाती है जब तक कि बिलिंग चक्र की समाप्ति से कम से कम 24 घंटे पहले रद्द न की जाए, और आपके Google Play भुगतान विधि से {amount} शुल्क लिया जाएगा। आप अपनी सदस्यता को Google Play सेटिंग्स में कभी भी प्रबंधित या रद्द कर सकते हैं।',
    ja: '購入をクリックすると、Google Play利用規約に同意したことになります。請求サイクルの終了の24時間前までにキャンセルされない限り、定期購入は自動的に更新され、Google Playの決済方法に {amount} が請求されます。定期購入はGoogle Playの設定でいつでも管理または解約できます。'
  },
  restore_purchases: {
    tr: 'Satın Almaları Geri Yükle (Restore)', en: 'Restore Purchases', es: 'Restaurar compras', fr: 'Restaurer les achats', de: 'Käufe wiederherstellen',
    it: 'Ripristina acquisti', pt: 'Restaurar compras', ru: 'Восстановить покупки', ar: 'استعادة المشتриات', zh: '恢复购买', hi: 'खरीदारी पुनर्स्थापित करें', ja: '購入履歴を復元'
  },
  btn_subscribe: {
    tr: 'Abone Ol', en: 'Subscribe', es: 'Suscribirse', fr: "S'abonner", de: 'Abonnieren',
    it: 'Abbonati', pt: 'Inscrever-se', ru: 'Подписаться', ar: 'اشترك', zh: '订阅', hi: 'सदस्यता लें', ja: '定期購入'
  },
  unit_per_month: {
    tr: '/ ay', en: '/ mo', es: '/ mes', fr: '/ mois', de: '/ Mon.',
    it: '/ mese', pt: '/ mês', ru: '/ мес.', ar: '/ شهر', zh: '/ 月', hi: '/ माह', ja: '/ 月'
  },
  secure_checkout_desc: {
    tr: 'Google Play Ödeme Altyapısı ile Güvenli ve Korumalı Satın Alım', en: 'Secure Checkout with Google Play Payment Infrastructure', es: 'Compra segura y protegida con la infraestructura de pago de Google Play', fr: 'Achat sécurisé avec l\'infrastructure de paiement Google Play', de: 'Sicherer Checkout mit der Google Play-Zahlungsinfrastruktur',
    it: 'Pagamento sicuro con l\'infrastruttura di pagamento Google Play', pt: 'Pagamento seguro com a infraestrutura de pagamento do Google Play', ru: 'Безопасная оплата через платежную инфраструктуру Google Play', ar: 'شراء آمن ومحمي باستخدام البنية التحتية لمدفوعات جوجل بلاi', zh: '通过 Google Play 支付系统进行安全结账', hi: 'गूगल प्ले भुगतान बुनियादी ढांचे के साथ सुरक्षित चेकआउट', ja: 'Google Play 決済システムによる安全な決済'
  },
  header_select_language: {
    tr: 'Ana Dilinizi Seçin / Select Native Language', en: 'Select Native Language', es: 'Selecciona tu idioma nativo', fr: 'Sélectionnez votre langue maternelle', de: 'Muttersprache auswählen',
    it: 'Seleziona la tua lingua madre', pt: 'Selecione seu idioma nativo', ru: 'Выберите родной язык', ar: 'اختر لغتك الأم', zh: '选择母语', hi: 'अपनी मातृभाषा चुनें', ja: '母国語を選択'
  },
  header_native_lang: {
    tr: 'ANA DİL / NATIVE LANG', en: 'NATIVE LANGUAGE', es: 'IDIOMA NATIVO', fr: 'LANGUE MATERNELLE', de: 'MUTTERSPRACHE',
    it: 'LINGUA MADRE', pt: 'IDIOMA NATIVO', ru: 'РОДНОЙ ЯЗЫК', ar: 'اللغة الأم', zh: '母语', hi: 'मातृभाषा', ja: '母国語'
  },
  theme_light: {
    tr: 'Açık Moda Geç', en: 'Switch to Light Mode', es: 'Cambiar a modo claro', fr: 'Passer au mode clair', de: 'In den hellen Modus wechseln',
    it: 'Passa alla modalità chiara', pt: 'Mudar para o modo claro', ru: 'Перейти на светлую тему', ar: 'التحويل إلى الوضع الفاتح', zh: '切换到亮色模式', hi: 'लाइट मोड पर स्विच करें', ja: 'ライトモードに切り替え'
  },
  theme_dark: {
    tr: 'Koyu Moda Geç', en: 'Switch to Dark Mode', es: 'Cambiar a modo oscuro', fr: 'Passer au mode sombre', de: 'In den dunklen Modus wechseln',
    it: 'Passa alla modalità scura', pt: 'Mudar para o modo escuro', ru: 'Перейти на темную тему', ar: 'التحويل إلى الوضع الداكن', zh: '切换到暗色模式', hi: 'डार्क मोड पर स्विच करें', ja: 'ダークモードに切り替え'
  },
  header_go_to_profile: {
    tr: 'Profilime Git', en: 'Go to Profile', es: 'Ir al Perfil', fr: 'Aller au Profil', de: 'Zum Profil gehen',
    it: 'Vai al Profilo', pt: 'Ir para o Perfil', ru: 'Перейти в профиль', ar: 'الانتقال إلى الملف الشخصي', zh: '前往个人资料', hi: 'प्रोफ़ाइल पर जाएं', ja: 'プロフィールへ移動'
  },
  user_profile: {
    tr: 'Kullanıcı', en: 'User', es: 'Usuario', fr: 'Utilisateur', de: 'Benutzer',
    it: 'Utente', pt: 'Usuário', ru: 'Пользователь', ar: 'المستخدم', zh: '用户', hi: 'उपयोगकर्ता', ja: 'ユーザー'
  },
  auth_error_auth_failed: {
    tr: 'Kimlik doğrulama başarısız oldu. ⚠️', en: 'Authentication failed. ⚠️', es: 'Autenticación fallida. ⚠️', fr: 'Échec de l\'authentification. ⚠️', de: 'Authentifizierung fehlgeschlagen. ⚠️',
    it: 'Autenticazione fallita. ⚠️', pt: 'Falha na autenticação. ⚠️', ru: 'Ошибка аутентификации. ⚠️', ar: 'فشلت عملية التحقق من الهوية. ⚠️', zh: '身份验证失败。⚠️', hi: 'प्रमाणीकरण विफल रहा। ⚠️', ja: '認証に失敗しました。⚠️'
  },
  auth_provider_connected: {
    tr: '{provider} hesabı başarıyla bağlandı! 🔗', en: '{provider} account successfully connected! 🔗', es: '¡Cuenta de {provider} conectada con éxito! 🔗', fr: 'Compte {provider} connecté avec succès ! 🔗', de: '{provider}-Konto erfolgreich verbunden! 🔗',
    it: 'Account {provider} collegato con successo! 🔗', pt: 'Conta do {provider} conectada com sucesso! 🔗', ru: 'Аккаунт {provider} успешно подключен! 🔗', ar: 'تم ربط حساب {provider} بنجاح! 🔗', zh: '{provider} 账户连接成功！🔗', hi: '{provider} खाता सफलतापूर्वक जुड़ गया! 🔗', ja: '{provider} アカウントが正常に接続されました！🔗'
  },
  auth_provider_logged_in: {
    tr: '{provider} ile giriş yapıldı ve veriler eşitlendi! 🔄', en: 'Logged in with {provider} and data synced! 🔄', es: '¡Sesión iniciada con {provider} y datos sincronizados! 🔄', fr: 'Connecté avec {provider} et données synchronisées ! 🔄', de: 'Mit {provider} angemeldet und Daten synchronisiert! 🔄',
    it: 'Accesso effettuato con {provider} e dati sincronizzati! 🔄', pt: 'Conectado com {provider} e dados sincronizados! 🔄', ru: 'Вход выполнен через {provider}, данные синхронизированы! 🔄', ar: 'تم تسجيل الدخول باستخدام {provider} ومزامنة البيانات! 🔄', zh: '已通过 {provider} 登录并同步数据！🔄', hi: '{provider} के साथ लॉग इन किया गया और डेटा सिंक हो गया! 🔄', ja: '{provider} でログインし、データを同期しました！🔄'
  },
  auth_saved_session_invalid: {
    tr: 'Kayıtlı oturum geçersiz veya süresi dolmuş. Lütfen şifrenizi girin. ⚠️', en: 'Saved session invalid or expired. Please enter your password. ⚠️', es: 'Sesión guardada no válida o caducada. Ingrese su contraseña. ⚠️', fr: 'Session enregistrée invalide ou expirée. Veuillez saisir votre mot de passe. ⚠️', de: 'Gespeicherte Sitzung ungültig oder abgelaufen. Bitte Passwort eingeben. ⚠️',
    it: 'Sessione salvata non valida o scaduta. Inserisci la tua password. ⚠️', pt: 'Sessão salva inválida ou expirada. Por favor, insira sua senha. ⚠️', ru: 'Сохраненный сеанс недействителен или истек. Пожалуйста, введите пароль. ⚠️', ar: 'الجلسة المحفوظة غير صالحة أو منتهية الصلاحية. يرجى إدخال كلمة المرور. ⚠️', zh: '保存的会话无效或已过期。请输入密码。⚠️', hi: 'सहेजा गया सत्र अमान्य या समाप्त हो गया है। कृपया अपना पासवर्ड दर्ज करें। ⚠️', ja: '保存されたセッションが無効または期限切れです。パスワードを入力してください。⚠️'
  },
  auth_account_connected: {
    tr: 'Hesabınız başarıyla bağlandı! 🔗', en: 'Your account has been successfully connected! 🔗', es: '¡Tu cuenta ha sido conectada con éxito! 🔗', fr: 'Votre compte a été connecté avec succès ! 🔗', de: 'Ihr Konto wurde erfolgreich verbunden! 🔗',
    it: 'Il tuo account è stato collegato con successo! 🔗', pt: 'Sua conta foi conectada com sucesso! 🔗', ru: 'Ваш аккаунт успешно подключен! 🔗', ar: 'تم ربط حسابك بنجاح! 🔗', zh: '您的账户已成功连接！🔗', hi: 'आपका खाता सफलतापूर्वक जुड़ गया है! 🔗', ja: 'アカウントが正常に接続されました！🔗'
  },
  auth_new_account_welcome: {
    tr: 'Yeni hesap oluşturuldu. Hoş geldiniz, {name}! 🎉', en: 'New account created. Welcome, {name}! 🎉', es: 'Nueva cuenta creada. ¡Bienvenido, {name}! 🎉', fr: 'Nouveau compte créé. Bienvenue, {name} ! 🎉', de: 'Neues Konto erstellt. Willkommen, {name}! 🎉',
    it: 'Nuovo account creato. Benvenuto, {name}! 🎉', pt: 'Nova conta criada. Bem-vindo, {name}! 🎉', ru: 'Новый аккаунт создан. Добро пожаловать, {name}! 🎉', ar: 'تم إنشاء حساب جديد. مرحبًا بك، {name}! 🎉', zh: '新账户已创建。欢迎，{name}！🎉', hi: 'नया खाता बनाया गया। स्वागत है, {name}! 🎉', ja: '新しいアカウントが作成されました。ようこそ、{name}さん！🎉'
  },
  auth_login_welcome: {
    tr: 'Giriş başarılı. Tekrar hoş geldiniz, {name}! 👋', en: 'Login successful. Welcome back, {name}! 👋', es: 'Inicio de sesión exitoso. ¡Bienvenido de nuevo, {name}! 👋', fr: 'Connexion réussie. Bon retour, {name} ! 👋', de: 'Anmeldung erfolgreich. Willkommen zurück, {name}! 👋',
    it: 'Accesso effettuato. Bentornato, {name}! 👋', pt: 'Login bem-sucedido. Bem-vindo de volta, {name}! 👋', ru: 'Вход выполнен успешно. С возвращением, {name}! 👋', ar: 'تم تسجيل الدخول بنجاح. أهلاً بك مجددًا، {name}! 👋', zh: '登录成功。欢迎回来，{name}！👋', hi: 'लॉगिन सफल। वापसी पर स्वागत है, {name}! 👋', ja: 'ログインに成功しました。おかえりなさい、{name}さん！👋'
  },
  auth_register_success: {
    tr: 'Kayıt başarılı! Hoş geldiniz, {name} 🎉', en: 'Registration successful! Welcome, {name} 🎉', es: '¡Registro exitoso! Bienvenido, {name} 🎉', fr: 'Inscription réussie ! Bienvenue, {name} 🎉', de: 'Registrierung erfolgreich! Willkommen, {name} 🎉',
    it: 'Registrazione completata! Benvenuto, {name} 🎉', pt: 'Registro bem-sucedido! Bem-vindo, {name} 🎉', ru: 'Регистрация прошла успешно! Добро пожаловать, {name} 🎉', ar: 'تم التسجيل بنجاح! مرحبًا بك، {name} 🎉', zh: '注册成功！欢迎，{name} 🎉', hi: 'पंजीकरण सफल! स्वागत है, {name} 🎉', ja: '登録が完了しました！ようこそ、{name}さん 🎉'
  },
  auth_error_register_failed: {
    tr: 'Kayıt sırasında bir hata oluştu. ⚠️', en: 'An error occurred during registration. ⚠️', es: 'Ocurrió un error durante el registro. ⚠️', fr: 'Une erreur est survenue lors de l\'inscription. ⚠️', de: 'Bei der Registrierung ist ein Fehler aufgetreten. ⚠️',
    it: 'Si è verificato un errore durante la registrazione. ⚠️', pt: 'Ocorreu um erro durante o registro. ⚠️', ru: 'Произошла ошибка при регистрации. ⚠️', ar: 'حدث خطأ أثناء التسجيل. ⚠️', zh: '注册过程中发生错误。⚠️', hi: 'पंजीकरण के दौरान एक त्रुटi हुई। ⚠️', ja: '登録中にエラーが発生しました。⚠️'
  },
  auth_error_login_failed: {
    tr: 'Giriş işlemi başarısız oldu. ⚠️', en: 'Login operation failed. ⚠️', es: 'Operación de inicio de sesión fallida. ⚠️', fr: 'Échec de l\'opération de connexion. ⚠️', de: 'Anmeldevorgang fehlgeschlagen. ⚠️',
    it: 'Operazione di accesso fallita. ⚠️', pt: 'Operação de login falhou. ⚠️', ru: 'Ошибка операции входа. ⚠️', ar: 'فشلت عملية تسجيل الدخول. ⚠️', zh: '登录操作失败。⚠️', hi: 'लॉगिन ऑपरेशन विफल रहा। ⚠️', ja: 'ログイン操作に失敗しました。⚠️'
  },
  auth_error_login_generic: {
    tr: 'Oturum açılamadı. Lütfen tekrar deneyin. ⚠️', en: 'Could not log in. Please try again. ⚠️', es: 'No se pudo iniciar sesión. Por favor intente de nuevo. ⚠️', fr: 'Impossible de se connecter. Veuillez réessayer. ⚠️', de: 'Anmeldung nicht möglich. Bitte versuchen Sie es erneut. ⚠️',
    it: 'Impossibile accedere. Riprova. ⚠️', pt: 'Não foi possível fazer o login. Por favor tente novamente. ⚠️', ru: 'Не удалось войти в систему. Пожалуйста, попробуйте еще раз. ⚠️', ar: 'تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى. ⚠️', zh: '无法登录。请重试。⚠️', hi: 'लॉग इन नहीं किया जा सका। कृपया पुनः प्रयास करें। ⚠️', ja: 'ログインできませんでした。もう一度お試しください。⚠️'
  },
  dict_lookups_left: {
    tr: 'Bugün için {count} kelime hakkınız kaldı',
    en: '{count} lookups left today',
    es: 'Quedan {count} consultas de palabras hoy',
    fr: "Il reste {count} recherches de mots aujourd'hui",
    de: 'Heute noch {count} Wortabfragen übrig',
    it: 'Rimangono {count} ricerche di parole oggi',
    pt: 'Restam {count} consultas de palavras hoje',
    ru: 'Сегодня осталось {count} поисков слов',
    ar: 'متبقي {count} عمليات بحث عن كلمات اليوم',
    zh: '今天还剩 {count} 次单词查询次数',
    hi: 'आज {count} शब्द खोजें शेष हैं',
    ja: '今日の単語検索は残り {count} 回です'
  },
  sentence_trans_left: {
    tr: 'Bugün için {count} cümle hakkınız kaldı',
    en: '{count} translations left today',
    es: 'Quedan {count} traducciones de oraciones hoy',
    fr: "Il reste {count} traductions de phrases aujourd'hui",
    de: 'Heute noch {count} Satzübersetzungen übrig',
    it: 'Rimangono {count} traduzioni di frasi oggi',
    pt: 'Restam {count} traduções de frases hoje',
    ru: 'Сегодня осталось {count} переводов предложений',
    ar: 'متبقي {count} ترجمة جمل اليوم',
    zh: '今天还剩 {count} 次句子翻译次数',
    hi: 'आज {count} वाक्य अनुवाद शेष हैं',
    ja: '今日の文章翻訳は残り {count} 回です'
  },
  limit_reached_title_word: {
    tr: 'Kelime Çeviri Limitine Ulaştınız',
    en: 'Word Limit Reached',
    es: 'Límite de consulta de palabras alcanzado',
    fr: 'Limite de recherche de mots atteinte',
    de: 'Wortabfragelimit erreicht',
    it: 'Limite di ricerca parole raggiunto',
    pt: 'Limite de consulta de palavras atingido',
    ru: 'Лимит поиска слов исчерпан',
    ar: 'تم الوصول إلى حد الكلمات',
    zh: '单词查询次数已达上限',
    hi: 'शब्द सीमा समाप्त',
    ja: '単語検索の上限に達しました'
  },
  limit_reached_desc_word: {
    tr: 'Hikayelerde günlük ücretsiz kelime çeviri limitine (30) ulaştınız. Kelimelerin bağlamsal anlamlarını ve detaylı açıklamalarını sınırsız görmek için Premium\'a geçebilirsiniz.',
    en: 'You have reached your daily free word lookup limit (30) in stories. You can upgrade to Premium to view contextual word meanings and detailed explanations without limits.',
    es: 'Has alcanzado tu límite diario de consulta de palabras gratuitas (30) en las historias. Puedes pasarte a Premium para ver los significados contextuales de las palabras y explicaciones detalladas sin límites.',
    fr: "Vous avez atteint votre limite quotidienne de recherche de mots gratuite (30) dans les histoires. Vous pouvez passer à Premium pour afficher les significations contextuelles des mots et des explications détaillées sans limites.",
    de: 'Sie haben Ihr tägliches Limit für die kostenlose Wortsuche (30) in Geschichten erreicht. Sie können auf Premium upgraden, um kontextbezogene Wortbedeutungen und detaillierte Erklärungen unbegrenzt anzuzeigen.',
    it: 'Hai raggiunto il limite giornaliero gratuito di ricerca parole (30) nelle storie. Puoi passare a Premium per visualizzare i significati contestuali delle parole e spiegazioni dettagliate senza limiti.',
    pt: 'Você atingiu o limite diário de consulta de palavras gratuitas (30) nas histórias. Você pode atualizar para o Premium para visualizar significados de palavras contextuais e explicações detalhadas sem limites.',
    ru: 'Вы достигли дневного лимита бесплатных поисков слов (30) в историях. Вы можете перейти на Премиум, чтобы без ограничений просматривать контекстные значения слов и подробные объяснения.',
    ar: 'لقد وصلت إلى الحد اليومي المجاني للبحث عن الكلمات (30) في القصص. يمكنك الترقية إلى بريميوم لعرض معاني الكلمات السياقية والشروحات التفصيلية بلا حدود.',
    zh: '您已达到故事中每日免费单词查询上限（30次）。您可以升级到会员以无限制地查看单词的上下文含义和详细解释。',
    hi: 'आप कहानियों में अपनी दैनिक निःशुल्क शब्द खोज सीमा (30) तक पहुँच चुके हैं। आप संदर्भ के अनुसार शब्दों के अर्थ और विस्तृत स्पष्टीकरण बिना किसी सीमा के देखने के लिए प्रीमियम में अपग्रेड कर सकते हैं।',
    ja: 'ストーリーでの今日の無料単語検索上限（30回）に達しました。プレミアムプランに加入すると、文脈に応じた単語の意味や詳細な解説を無制限で閲覧できるようになります。'
  },
  limit_reached_title_sentence: {
    tr: 'Cümle Çeviri Limitine Ulaştınız',
    en: 'Sentence Limit Reached',
    es: 'Límite de traducción de oraciones alcanzado',
    fr: 'Limite de traduction de phrases atteinte',
    de: 'Satzübersetzungslimit erreicht',
    it: 'Limite di traduzione frasi raggiunto',
    pt: 'Limite de tradução de frases atingido',
    ru: 'Лимит переводов предложений исчерпан',
    ar: 'تم الوصول إلى حد ترجمة الجمل',
    zh: '句子翻译次数已达上限',
    hi: 'वाक्य अनुवाद सीमा समाप्त',
    ja: '文章翻訳の上限に達しました'
  },
  limit_reached_desc_sentence: {
    tr: 'Hikayelerde günlük ücretsiz cümle çeviri limitine (15) ulaştınız. Cümleleri ve deyimleri sınırsız çevirmek için Premium\'a geçebilirsiniz.',
    en: 'You have reached your daily free sentence translation limit (15) in stories. You can upgrade to Premium to translate sentences and phrases without limits.',
    es: 'Has alcanzado tu límite diario de traducción de oraciones gratuitas (15) en las historias. Puedes pasarte a Premium para traducir frases y oraciones sin límites.',
    fr: "Vous avez atteint votre limite quotidienne de traduction de phrases gratuite (15) dans les histoires. Vous pouvez passer à Premium pour traduire des phrases et des expressions sans limites.",
    de: 'Sie haben Ihr tägliches Limit für die kostenlose Satzübersetzung (15) in Geschichten erreicht. Sie können auf Premium upgraden, um Sätze und Phrasen unbegrenzt zu übersetzen.',
    it: 'Hai raggiunto il limite giornaliero gratuito di traduzione frasi (15) nelle storie. Puoi passare a Premium per tradurre frasi e locuzioni senza limiti.',
    pt: 'Você atingiu o limite diário de tradução de frases gratuitas (15) nas histórias. Você pode atualizar para o Premium para traduzir frases e expressões sem limites.',
    ru: 'Вы достигли дневного лимита бесплатных переводов предложений (15) в историях. Вы можете перейти на Премиум, чтобы без ограничений переводить предложения и фразы.',
    ar: 'لقد وصلت إلى الحد اليومي المجاني لترجمة الجمل (15) في القصص. يمكنك الترقية إلى بريميوم لترجمة الجمل والعبارات بلا حدود.',
    zh: '您已达到故事中每日免费句子翻译上限（15次）。您可以升级到会员以无限制地翻译句子 and 短语。',
    hi: 'आप कहानियों में अपनी दैनिक निःशुल्क वाक्य अनुवाद सीमा (15) तक पहुँच चुके हैं। आप वाक्यों और मुहावरों का बिना किसी सीमा के अनुवाद करने के लिए प्रीमियम में अपग्रेड कर सकते हैं।',
    ja: 'ストーリーでの今日の無料文章翻訳上限（15回）に達しました。プレミアムプランに加入すると、文章やフレーズを無制限に翻訳できるようになります。'
  },
  limit_btn_premium: {
    tr: 'Premium ile Sınırları Kaldır',
    en: 'Remove Limits with Premium',
    es: 'Eliminar límites con Premium',
    fr: 'Supprimer les limites avec Premium',
    de: 'Grenzen aufheben mit Premium',
    it: 'Rimuovi i limiti con Premium',
    pt: 'Remover limites com o Premium',
    ru: 'Снять ограничения с Премиум',
    ar: 'إزالة الحدود مع بريميوم',
    zh: '通过会员消除限制',
    hi: 'प्रीमियम के साथ सीमाएं हटाएं',
    ja: 'プレミアムで制限を解除する'
  },
  btn_maybe_later: {
    tr: 'Daha Sonra',
    en: 'Maybe Later',
    es: 'Tal vez más tarde',
    fr: 'Plus tard',
    de: 'Vielleicht später',
    it: 'Forse più tardi',
    pt: 'Talvez mais tarde',
    ru: 'Возможно позже',
    ar: 'ربما لاحقاً',
    zh: '以后再说',
    hi: 'बाद में',
    ja: 'また後で'
  }
};

export const getDayTranslation = (day: string, langCode: LanguageCode): string => {
  const dayIndex = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].indexOf(day);
  if (dayIndex === -1) return day;
  
  const translations: Record<LanguageCode, string[]> = {
    tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    de: ['Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam', 'Son'],
    it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    ru: ['Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Сбт', 'Вск'],
    ar: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    hi: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
    ja: ['月', '火', '水', '木', '金', '土', '日']
  };
  
  return translations[langCode]?.[dayIndex] || translations['en'][dayIndex] || day;
};

export const t = (key: string, lang: LanguageCode): string => {
  const translationsForKey = TRANSLATIONS[key];
  if (!translationsForKey) return key;
  return translationsForKey[lang] || translationsForKey['en'] || key;
};

export const translateWithGoogleClient = async (text: string, targetLang: string): Promise<string> => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);
    const data = await response.json();
    if (data && data[0]) {
      let fullTranslation = "";
      if (Array.isArray(data[0])) {
        for (const part of data[0]) {
          if (part && part[0]) {
            fullTranslation += part[0];
          }
        }
      }
      if (fullTranslation.trim()) {
        return fullTranslation.trim();
      }
    }
    throw new Error("Unrecognized formats from Google Translate");
  } catch (err) {
    console.error("Client-side translation fallback error:", err);
    throw err;
  }
};

export function getLocalizedUsername(userName: string, nativeLanguage: LanguageCode): string {
  if (!userName) return '';
  const trimmed = userName.trim();
  if (trimmed.toLowerCase() === 'okur') {
    return t('default_reader_name', nativeLanguage);
  }
  const match = trimmed.match(/^okur-(\d+)$/i);
  if (match) {
    return `${t('default_reader_name', nativeLanguage)}-${match[1]}`;
  }
  return userName;
}

export function getLocalizedLevelName(level: string, levelName: string, nativeLanguage: LanguageCode): string {
  const cleanLevel = (level || '').toUpperCase().trim();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cleanLevel)) {
    return t('dict_level_label', nativeLanguage).replace('{level}', cleanLevel);
  }
  return levelName;
}

export const PLACEHOLDER_STRINGS = new Set<string>([
  '...',
  'Çeviriliyor...',
  'Translating...',
  'Loading...'
]);

// Populating all values dynamically from translation keys
const keysToCollect = ['dict_loading_placeholder', 'dict_connection_required', 'dict_translation_failed'];
keysToCollect.forEach(key => {
  const transObj = TRANSLATIONS[key];
  if (transObj) {
    Object.values(transObj).forEach(val => {
      if (val) {
        PLACEHOLDER_STRINGS.add(val.trim());
      }
    });
  }
});



