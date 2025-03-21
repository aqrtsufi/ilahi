import { SongData } from './types.ts';

export const CATEGORIES = {
  BASIC: 'Basic',
  INTERMEDIATE: 'Intermediate',
};

let subcategories: Record<string, string[]> = {};

export const setSubcategories = (newSubcategories: Record<string, string[]>) => {
  subcategories = newSubcategories;
};

export const getSubcategories = () => subcategories;

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
  const filteredSongs = songs.filter((song) => 
  // return songs.filter((song) => 
    categories.some((category) => {
      const normalizedCategory = normalizeCategory(category);
      if (normalizedCategory === 'basic') {
                // Extract Order value if it exists in categories
        // const orderCategory = song.categories.find(cat => cat.trim().startsWith('Order:'));
        // if (orderCategory) {
        //   song.order = parseInt(orderCategory.split(':')[1], 10);
        // }
        return song.categories.some(songCategory => 
            normalizeCategory(songCategory).includes('basic')
        );
      }
      if (normalizedCategory === 'intermediate') {
        return song.categories.some(songCategory => 
            normalizeCategory(songCategory).includes('basic') ||
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
        normalizeCategory(songCategory) === normalizedCategory ||
        normalizeCategory(songCategory).includes(normalizedCategory)
      );
    })
  );
   // Sort by order if basic category is selected
   if (categories.length === 1 && categories[0] === CATEGORIES.BASIC 
    // && filteredSongs.some(song => song.order !== undefined)
  ) {
    return filteredSongs.sort((a, b) => (a.order || 999999) - (b.order || 999999));
  }

  return filteredSongs;
};

// export const getAllCategories = (songs: SongData[]): string[] => {
//   const categories = new Set<string>(["All", CATEGORIES.BASIC, CATEGORIES.INTERMEDIATE]);
//   songs.forEach((song) => {
//     song.categories.forEach((category) => {
//       categories.add(category.trim());
//     });
//   });
//   return Array.from(categories);
// };

export const getSortedSubcategories = (subcategories: Record<string, string[]>) => {
  const sorted = {};
  for (const [key, value] of Object.entries(subcategories)) {
    sorted[key] = value.sort((a, b) => turkishToEnglish(a.toLowerCase()).localeCompare(turkishToEnglish(b.toLowerCase())));
  }
  return sorted;
};

export const processShortcuts = (subcategories: Record<string, string[]>) => {
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

interface ParsedCategory {
  categories: string[];
  tags: string[];
  order?: number;
}

export function parseCategoryLine(line: string): ParsedCategory {
  // Handle empty or undefined cases
  if (!line || line.trim() === 'Category:') {
    return { categories: [], tags: [] };
  }

  // Remove 'Category:' prefix and trim
  const content = line.replace(/^Category:/, '').trim();
  
  // Split by vertical bar
  const [categoriesStr = '', tagsStr = ''] = content.split('|').map(s => s.trim());
  
  // Process categories
  let categories: string[] = [];
  let order: number | undefined;
  
  if (categoriesStr) {
    const categoryItems = categoriesStr.split(',').map(cat => cat.trim());
    // Extract order if present
    const orderItem = categoryItems.find(cat => cat.startsWith('Order:'));
    if (orderItem) {
      const orderValue = orderItem.split(':')[1];
      order = parseInt(orderValue, 10);
      categories = categoryItems
        .filter(cat => cat !== '' && !cat.startsWith('Order:'));
      // .map(cat => cat.trim());
    } else {
      categories = categoryItems.filter(cat => cat !== '');
    }
  }

  // Process tags
  const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

  return { categories, tags, order };
}