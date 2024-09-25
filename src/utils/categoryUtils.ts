import { SongData } from './types';

export const CATEGORIES = {
  BASIC: 'Basic Zikr',
  INTERMEDIATE: 'Intermediate',
};

export const subcategories = {
  "Pen Name": ["Aşık Yunus", "Yunus Emre", "Niyaz", "Fakirullah", "Nesimi", "Üftade", "Şemseddin Sivası", "Ruhi", "Muhyi", "Hatayi", "Hudayi", "Aşık Hüdai", "Kul Yusuf"],
  "Pirs": ["Geylani", "Rifai", "Ansari", "Ensari", "Hashimi", "Muhammed", "Muhyiddin"],
  "Awliya": ["Mevlana", "Haci Bektas", "Evliya", "Awliya"],
  "Sahaba": ["Abu Bakr", "Umar", "Usman", "Ali", "Sahaba"],
  "Anbiya": ["Nuh", "Hud", "Salih", "Ibrahim", "Musa", "Isa", "Muhammad", "Anbiya", "Enbiya", "Prophets"],
  "Dervish Orders": ["Rifai", "Ansari", "Qadiri", "Bektashi", "Nakshbandi", "Mevlevi"],
};

export const categoryShortcuts = {
  "sbt": ["Sung By", "Shaykh Taner"],
  "sbm": ["Sung By", "Shaykh Muhyiddin"],
};

export const turkishToEnglish = (str: string) => {
  const map: { [key: string]: string } = {
    ç: "c", ğ: "g", ı: "i", î: "i", ö: "o", ş: "s", ü: "u",
    Ç: "C", Ğ: "G", İ: "I", Î: "I", Ö: "O", Ş: "S", Ü: "U",
  };
  return str.replace(/[çğıöşüÇĞİÖŞÜ]/g, (letter) => map[letter] || letter);
};

export const normalizeCategory = (category: string) => {
  return turkishToEnglish(category.trim().toLowerCase());
};

export const filterSongsByCategory = (songs: SongData[], categories: string[]): SongData[] => {
  if (categories.length === 0 || categories.includes('All')) return songs;
  
  return songs.filter((song) => 
    categories.some((category) => {
      const normalizedCategory = normalizeCategory(category);
      if (normalizedCategory === 'basic') {
        return song.categories.some(songCategory => 
            normalizeCategory(songCategory).includes('basic') ||
          normalizeCategory(songCategory).includes('basic zikr')
        );
      }
      if (normalizedCategory === 'intermediate') {
        return song.categories.some(songCategory => 
          normalizeCategory(songCategory).includes('inter')
        );
      }
      if (Object.keys(subcategories).includes(category)) {
        return subcategories[category].some((subCategory) => 
          song.categories.some((songCategory) => 
            normalizeCategory(songCategory).includes(normalizeCategory(subCategory))
          )
        );
      }
      return song.categories.some((songCategory) => 
        normalizeCategory(songCategory).includes(normalizedCategory)
      );
    })
  );
};

export const getAllCategories = (songs: SongData[]): string[] => {
  const categories = new Set<string>(["All", CATEGORIES.BASIC, CATEGORIES.INTERMEDIATE]);
  songs.forEach((song) => {
    song.categories.forEach((category) => {
      categories.add(category.trim());
    });
  });
  return Array.from(categories);
};

export const getSortedSubcategories = () => {
  const sorted = {};
  for (const [key, value] of Object.entries(subcategories)) {
    sorted[key] = value.sort((a, b) => turkishToEnglish(a.toLowerCase()).localeCompare(turkishToEnglish(b.toLowerCase())));
  }
  return sorted;
};

export const processShortcuts = () => {
  const processedCategories = { ...subcategories };
  const processedShortcuts = {};

  Object.entries(categoryShortcuts).forEach(([shortcut, [mainCategory, subCategory]]) => {
    if (!processedCategories[mainCategory]) {
      processedCategories[mainCategory] = [];
    }
    if (!processedCategories[mainCategory].includes(subCategory)) {
      processedCategories[mainCategory].push(subCategory);
    }
    processedShortcuts[shortcut] = subCategory;
  });

  return { processedCategories, processedShortcuts };
};

export const getMainCategories = (allCategories: string[]) => {
  const orderedCategories = ['All', CATEGORIES.BASIC, 'Pirs', 'Pen Name'];
  const otherMainCategories = Object.keys(subcategories).filter(cat => !orderedCategories.includes(cat));
  const standaloneCategories = allCategories.filter(cat => 
    !orderedCategories.includes(cat) && 
    !otherMainCategories.includes(cat) &&
    cat !== CATEGORIES.BASIC
  );
  
  return [
    ...orderedCategories,
    ...otherMainCategories.sort((a, b) => turkishToEnglish(a.toLowerCase()).localeCompare(turkishToEnglish(b.toLowerCase()))),
    ...standaloneCategories.sort((a, b) => turkishToEnglish(a.toLowerCase()).localeCompare(turkishToEnglish(b.toLowerCase())))
  ];
};