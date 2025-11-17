<template>
  <div v-if="loading" class="space-y-2">
  <div class="skeleton h-6 w-1/2"></div>
  <div class="skeleton h-6 w-2/3"></div>
  <div class="skeleton h-6 w-1/3"></div>
</div>
  <div class="w-full max-w-4xl mx-auto p-4">
      <button @click="resetSearch" class="btn btn-secondary">Reset Search</button>
      <button @click="generateRandomIlahi" class="btn btn-primary">What to Sing?</button>
    <div v-if="randomIlahi" class="mt-4 text-center">
      <p>Try to Sing:</p>
      <router-link 
      :to="{ name: 'SongDisplay', params: { slug: randomIlahi.slug }, query: { file: songStore.currentPath } }"
        class="text-primary hover:underline"
        >
        {{ randomIlahi.title }}
      </router-link>
    </div>
    <!-- A-Z filter -->
    <div class="flex flex-wrap justify-center my-4" 
    role="group" 
    aria-label="Filter ilahis by first letter">
  <button
    v-for="letter in 'ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZ'"
    :key="letter"
    @click="filterByLetter(letter)"
    @keydown="handleKeyNavigation($event, letter)"
    :class="[
      'btn btn-sm m-1', 
      { 'btn-primary': currentLetter === letter || 
        (currentLetter && turkishToEnglish(currentLetter) === turkishToEnglish(letter)) 
      }
    ]"
    :aria-pressed="currentLetter === letter"
    :aria-label="`Filter by letter ${letter}`"
    tabindex="0"
  >
    {{ letter }}
  </button>
</div>
    <!-- Category filter -->
    <div class="flex justify-center my-4">
      <div class="flex flex-col items-center">
        <label class="mb-2 font-bold text-lg">Categories</label>
        <div class="flex gap-2 mb-2">
          <span
            v-for="shaykh in ['Shaykh Muhyiddin', 'Shaykh Taner and Shaykha Muzeyyen']"
            :key="shaykh"
            @click="toggleShaykhCategory(shaykh)"
            class="px-2 py-0.5 rounded-full cursor-pointer border text-xs font-semibold transition-colors border-green-200"
            :class="[
              selectedCategories.includes(shaykh)
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            ]"
          >
            {{ shaykh }}
          </span>
        </div>
        <div class="flex items-center mb-2">
          <input
            type="checkbox"
            id="basicCategory"
            v-model="selectedCategories"
            :value="CATEGORIES.BASIC"  
            class="checkbox checkbox-primary mr-2 custom-checkbox"
          />
          <label for="basicCategory" class="text-lg font-semibold text-primary">Basic ilahis For Zikr</label>
        </div>
        <div class="dropdown">
          <label tabindex="0" class="btn btn-secondary m-1" @click="isDropdownOpen = !isDropdownOpen">More Categories</label>
          <ul v-if="isDropdownOpen" tabindex="0" class="dropdown-content z-[1] menu p-2 shadow rounded-box w-52 max-h-60 overflow-y-auto custom-dropdown">
            <li v-for="category in mainCategories" :key="String(category)" class="text-left">
              <template v-if="Object.keys(subcategories).includes(String(category))">
                <details class="dropdown">
                  <summary class="text-base-content">{{ category }}</summary>
                  <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                    <li v-for="subCategory in sortedSubcategories[String(category)]" :key="String(subCategory)" class="text-left">
                      <label class="text-base-content">
                        <input
                          type="checkbox"
                          :value="subCategory"
                          v-model="selectedCategories"
                          class="checkbox custom-checkbox"
                        />
                        {{ subCategory }}
                      </label>
                    </li>
                  </ul>
                </details>
              </template>
              <label v-else class="text-base-content">
                <input
                  type="checkbox"
                  :value="category"
                  v-model="selectedCategories"
                  class="checkbox custom-checkbox"
                />
                {{ category }}
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>


<div class="flex justify-center my-4">
  <div class="flex flex-col items-center">
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-secondary m-1">
    <!-- <label class="mb-2 font-bold text-lg">Zikr</label> -->
    <!-- <div class="flex items-center mb-2"> -->
      <!-- <div class="dropdown"> -->
        <!-- <label tabindex="0" class="btn btn-secondary m-1" @click="isZikrDropdownOpen = !isZikrDropdownOpen"> -->
          Select Zikr 
        </label>
        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 max-h-96 overflow-y-auto">

        <!-- <ul v-if="isZikrDropdownOpen" class="dropdown-content z-[1] menu p-2 shadow rounded-box w-52 max-h-60 overflow-y-auto custom-dropdown"> -->
          <li v-for="zikrGroup in zikrGroups" :key="zikrGroup.group">
            <details class="dropdown" open>
              <summary class="text-base-content font-semibold">{{ zikrGroup.group }}</summary>
              <ul class="p-2">
              <!-- <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"> -->
                <li v-for="zikr in zikrGroup.items" :key="zikr">
                  <label class="flex items-center gap-2 p-2 hover:bg-base-200 rounded">
                  <!-- <label class="text-base-content"> -->
                    <input
                      type="checkbox"
                      :value="zikr"
                      v-model="selectedZikrs"
                      class="checkbox checkbox-primary"
                    />
                    <span class="text-base-content">{{ zikr }}</span>
                  </label>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </div>

<div class="text-center text-base-content/80 mb-4" role="status" aria-live="polite">
  <span v-if="selectedZikrs.length > 0" aria-atomic="true">
    {{ filteredByZikr.length }} ilahi{{ filteredByZikr.length !== 1 ? 's' : '' }} 
    found for: {{ selectedZikrs.join(', ') }}
  </span>
  <span v-else-if="currentLetter" aria-atomic="true">
    {{ sortedFilteredSongs.length }} ilahi{{ sortedFilteredSongs.length !== 1 ? 's' : '' }} 
    found starting with letter "{{ currentLetter }}"
  </span>
  <span v-else-if="selectedCategories.length > 0" aria-atomic="true">
    {{ sortedFilteredSongs.length }} ilahi{{ sortedFilteredSongs.length !== 1 ? 's' : '' }} 
    found in selected categories
  </span>
  <span v-else aria-atomic="true">
    {{ filteredSongs.length }} ilahi{{ filteredSongs.length !== 1 ? 's' : '' }} available
  </span>
</div>


  <div
    v-if="sortedFilteredSongs.length > 0"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
  ></div>


  
    <div
      v-if="paginatedSongs.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="(song, index) in paginatedSongs"
        :key="song.slug"

        class="shadow-md rounded-lg p-4"
      >
        <h3 class="text-xl font-semibold mb-2">
          <router-link
            v-if="song.title"
            :to="{
              name: 'SongDisplay',
              params: { slug: song.slug }, query: { file: songStore.currentPath }
            }"
            class="hover:link-secondary"
          >
            {{ song.title }}
          </router-link>
          <span v-else class="text-gray-500">All</span>
        </h3>
        <div class="text-sm text-gray-600">
          <!-- {{ song.categories.join(', ') }} -->
        </div>
      </div>
    </div>
    <div 
  v-if="sortedFilteredSongs.length === 0 && currentLetter" 
  class="text-center text-xl text-gray-600" 
  role="alert" 
  aria-live="assertive"
>
  Sorry, no ilahi found starting with letter "{{ currentLetter }}".
</div>
<div v-if="paginatedSongs.length === 0 && selectedZikrs.length">
  <p class="text-red-500">No songs found for selected zikrs</p>
</div>



        <!-- Pagination -->
           <!-- Only show pagination if we have songs -->
  <div v-if="sortedFilteredSongs.length > 0" class="mt-6 flex justify-center">
       <!-- <div class="mt-6 flex justify-center"> -->
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="btn btn-primary mr-2"
      >
        &lt; Previous
      </button>
      <span class="mx-2 self-center">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="btn btn-primary ml-2"
      >
        Next &gt;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from "vue";
import { storeToRefs } from "pinia";
import { useSongStore, ParsedZikr } from "../stores/songStore";
import { RouterLink, useRoute, useRouter } from "vue-router";
import SearchBar from "./SearchBar.vue";
import { getCurrentInstance } from "vue";
import { slugify } from '../utils/search';
import { CATEGORIES, getSubcategories, filterSongsByCategory, normalizeCategory, turkishToEnglish, getSortedSubcategories, processShortcuts, getMainCategories } from '../utils/categoryUtils';
// import { ParsedZikr } from '../utils/zikrUtils';

import { SongData } from "@/utils/types";
import type { LocationQueryValue } from 'vue-router'
import { parseZikrLine } from '../utils/zikrUtils';

const props = defineProps<{ filePath?: string }>();

const route = useRoute();
const router = useRouter();
const songStore = useSongStore();
const { filteredSongs, categories, filteredByZikr, selectedZikrs } = storeToRefs(songStore);


const loading = ref(true);

const currentPage = ref(1);
const itemsPerPage = 12;
const currentLetter = ref("");
const selectedCategories = ref<string[]>([]);
const isZikrDropdownOpen = ref(false);

// Add computed properties
const zikrGroups = computed(() => {
return Object.entries(songStore.suggestedZikrs).map(([group, items]) => ({
    group,
    items: Array.isArray(items) ? items : [items]
  }))
});


const randomIlahi = ref<SongData | null>(null)


// Add keyboard navigation for letter filters
const handleKeyNavigation = (event: KeyboardEvent, letter: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    filterByLetter(letter);
  }
};

const generateRandomIlahi = () => {
  if (sortedFilteredSongs.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * sortedFilteredSongs.value.length)
    randomIlahi.value = sortedFilteredSongs.value[randomIndex]
  }
}

const resetGlobalSearch = inject("resetGlobalSearch") as () => void;

const sortedSubcategories = computed((): Record<string, string[]> => {

// const sortedSubcategories = computed(() => {
  const result: Record<string, string[]> = {};
  
  for (const category in subcategories.value) {
  // Ensure we're working with string arrays
  const subCats = subcategories.value[category];
    if (Array.isArray(subCats)) {
      result[category] = [...subCats].sort((a, b) => a.localeCompare(b));
    }
  
  
    // Sort subcategories alphabetically
    // result[category] = [...subcategories.value[category]].sort((a, b) => a.localeCompare(b));
  }
  
  return result;
});

  // getSortedSubcategories(subcategories.value));

const subcategories = computed(() => getSubcategories());

const allCategories = computed(() => {
  const { processedCategories, processedShortcuts } = processShortcuts(subcategories.value);
  // console.log("processedCategories:", processedCategories);
  // console.log("subcategories:", subcategories);
 // Change from Set to Record/object to avoid indexing issues
 const categoriesMap: Record<string, boolean> = {};
  
  // const categories = new Set<string>(songStore.categories);

  const normalizedSubcategories = new Set(
    Object.values(processedCategories).flat().map(normalizeCategory)
  );
  // console.log("normalizedSubcategories:", normalizedSubcategories);


  filteredSongs.value.forEach((song) => {
    song.categories.forEach((category) => {
      const normalizedCategory = normalizeCategory(category);
        // console.log("normalizedCategory:", normalizedCategory);

// Fix the categories access
const matchedMainCategory = Object.keys(categories.value || {}).find((key) => {
        const categoryArray = categories.value?.[key]
        if (!categoryArray || !Array.isArray(categoryArray)) return false
        
        return normalizeCategory(key) === normalizedCategory || 
               categoryArray.some((sub: string) => 
                 normalizeCategory(sub).startsWith(normalizedCategory)
               )
      });
      // console.log("matchedMainCategory:", matchedMainCategory);

      if (matchedMainCategory) {
        categoriesMap[matchedMainCategory] = true;
      } else if (category.trim() !== '' && 
                //  !processedShortcuts[normalizedCategory] && 
                 !normalizedSubcategories.has(normalizedCategory)) {
        categoriesMap[category.trim()] = true;
      }

    });
  });
  // return Array.from(categories);
  return Object.keys(categoriesMap);
});


// First, ensure mainCategories returns string[] instead of any other type
const mainCategories = computed((): string[] => {
  // console.log("All categories from store:", categories);
  // Ensure we're returning an array of strings
  return Array.isArray(categories.value) ? categories.value : Object.keys(categories.value || {});
});

// Computed properties
const sortedFilteredSongs = computed(() => {

  let songsToDisplay = filteredSongs.value;

  if (selectedZikrs.value.length > 0) {
    console.log('[Component] Applying zikr filter');
    songsToDisplay = filteredByZikr.value;
  }



  if (currentLetter.value) {
    songsToDisplay = songsToDisplay.filter(
      (song) =>      {
        const firstLetter = song.title[0].toUpperCase();
        const normalizedFirstLetter = turkishToEnglish(firstLetter);
      const normalizedCurrentLetter = turkishToEnglish(currentLetter.value);      
      return normalizedFirstLetter === normalizedCurrentLetter;
    });
  }
          
    if (selectedCategories.value.length > 0 && !selectedCategories.value.includes('All')) {
    songsToDisplay = filterSongsByCategory(songsToDisplay, selectedCategories.value);
    }

    // Normal alphabetical sorting for non-Basic category
  if (!(selectedCategories.value.length === 1 && selectedCategories.value[0] === CATEGORIES.BASIC)) {
    return songsToDisplay.sort((a, b) => 
      turkishToEnglish(a.title.toLowerCase()).localeCompare(turkishToEnglish(b.title.toLowerCase()))
    );
  }
  return songsToDisplay; 
});

const totalPages = computed(() =>
  Math.ceil(sortedFilteredSongs.value.length / itemsPerPage)
);

const slugifiedSongs = computed(() => {
  return sortedFilteredSongs.value.map(song => ({
    ...song,
    slug: slugify(song.title)
  }));
});

const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedFilteredSongs.value.slice(start, end);
});

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const filterByLetter = (letter: string) => {
  // Force uppercase for consistency
  const upperLetter = letter.toUpperCase();
  currentLetter.value = currentLetter.value === upperLetter ? "" : upperLetter;
// Update query parameters first
const query: Record<string, string | string[]> = {};
  if (currentLetter.value) query.letter = currentLetter.value;
  if (selectedCategories.value.length > 0) query.categories = selectedCategories.value;
  
  // Reset page and update route
  currentPage.value = 1;
  router.push({ query });

};

const updateQueryParams = () => {
  const query: Record<string, string | string[]> = {};
  if (currentLetter.value) query.letter = currentLetter.value;
  if (selectedCategories.value.length > 0) query.categories = selectedCategories.value;
  router.push({ query }).catch(() => {
    // Handle potential navigation errors
    console.log('Navigation prevented');
  });
};

// First, let's add a debug computed property
const debugSongCounts = computed(() => ({
  filtered: sortedFilteredSongs.value.length,
  paginated: paginatedSongs.value.length,
  total: filteredSongs.value.length
}));



// Watchers

watch(selectedZikrs, (newZikrs) => {
  console.log('[Component] Selected Zikrs changed:', newZikrs);
  console.log('Current filtered songs:', filteredByZikr.value.map(s => s.title));
}, { deep: true });

// Add a watch for currentLetter specifically
watch(currentLetter, (newLetter) => {
  currentPage.value = 1;
}, { immediate: true });


watch([filteredSongs, currentLetter, selectedZikrs,selectedCategories], () => {
  currentPage.value = 1;
  updateQueryParams();
});

// watch(
//   () => route.query.search,
//   (newSearch) => {
//     if (newSearch) {
//       songStore.setSearchQuery(newSearch as string);
//       currentPage.value = 1;
//       currentLetter.value = "";
//       selectedCategories.value = [];
//     }
//   }
// );

// Fix the route query handling
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.search) {
      songStore.setSearchQuery(String(newQuery.search));
      currentPage.value = 1;
      currentLetter.value = "";
      selectedCategories.value = [];
    } else if (newQuery.letter) {
      // Add this condition to handle letter parameter
      currentLetter.value = String(newQuery.letter);
      currentPage.value = 1;
      songStore.setSearchQuery("");
    } else if (newQuery.categories) {
      // Handle the LocationQueryValue type safely
      const categories = Array.isArray(newQuery.categories)
        ? newQuery.categories.map(String)
        : [String(newQuery.categories)];
      selectedCategories.value = categories.filter(Boolean); // Remove any null values
      currentPage.value = 1;
      songStore.setSearchQuery("");
    } else {
      songStore.setSearchQuery("");
      currentLetter.value = "";
      selectedCategories.value = [];
      currentPage.value = 1;
    }
  },
  { immediate: true }
);

// Watch filePath and reload songs when it changes
watch(() => props.filePath, async (newPath, oldPath) => {
  if (newPath && newPath !== oldPath) {
    await songStore.fetchSongs(false, newPath);
  }
}, { immediate: true });

// On mount, load songs from filePath (or default)
onMounted(async () => {
  try{
  await songStore.fetchSongs(false, props.filePath || 'ilahi.txt');
  if (route.query.search) {
    songStore.setSearchQuery(String(route.query.search));
  }
  if (route.query.categories) {
    const categories = Array.isArray(route.query.categories)
      ? route.query.categories.map(String)
      : [String(route.query.categories)];
    selectedCategories.value = categories.filter(Boolean);
  }
} finally {
  loading.value = false;
}
});

const resetSearch = () => {
  songStore.setSearchQuery("");
  currentLetter.value = "";
  selectedCategories.value = [];
  selectedZikrs.value = [];
  router.push({ query: {} });
  resetGlobalSearch();
};


const isDropdownOpen = ref(false);

const app = getCurrentInstance()?.appContext.app;

function toggleShaykhCategory(shaykh: string) {
  const idx = selectedCategories.value.indexOf(shaykh);
  if (idx === -1) {
    selectedCategories.value.push(shaykh);
  } else {
    selectedCategories.value.splice(idx, 1);
  }
}
</script>

<style>
.checkbox-primary {
 --chkbg: hsl(120, 60%, 50%); /* Green background */
 --chkfg: white; /* White tick */
 border-color: hsl(120, 60%, 50%);
}

.checkbox-primary:checked {
  background-color: hsl(120, 60%, 50%);
  border-color: hsl(120, 60%, 50%);
}

.checkbox-primary {
  background-color: hsl(120, 60%, 50%);
  border-color: hsl(120, 60%, 50%);
}

.checkbox-primary:checked {
  background-color: hsl(120, 60%, 50%);
  border-color: hsl(120, 60%, 50%);
}


/* Center alignment for the main container */
.w-full.max-w-4xl.mx-auto {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

/* Prevent page jump when checking checkboxes */
input[type="checkbox"] {
  scroll-margin-top: 100px;
}
.select option:checked {
  background-color: theme("colors.white");
  /* color: white; */
}

.select option {
  background-color: white;
  color: black;
}

.custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 1.5em;
  height: 1.5em;
  border: 2px solid currentColor;
  border-radius: 0.25em;
  display: inline-grid;
  place-content: center;
}

.custom-checkbox::before {
  content: "";
  width: 0.85em;
  height: 0.85em;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em currentColor;
  transform-origin: center;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

.custom-checkbox:checked::before {
  transform: scale(1);
}

:root[data-theme="dark"] .custom-checkbox {
  border-color: hsl(var(--bc));
}

:root[data-theme="dark"] .custom-checkbox::before {
  background-color: hsl(var(--bc));
}



.custom-dropdown {
  background-color: white;
  color: black;
  border: 1px solid #e2e8f0;
}

:root[data-theme="dark"] .custom-dropdown {
  background-color: #2d3748;
  color: #e2e8f0;
  border: 1px solid #4a5568;
}

.custom-dropdown li > * {
  color: inherit;
}

.custom-dropdown li > *:hover {
  background-color: #f7fafc;
}

:root[data-theme="dark"] .custom-dropdown li > *:hover {
  background-color: #4a5568;
}

/* Ensure text color for nested dropdowns */
.custom-dropdown .dropdown .dropdown-content {
  background-color: white;
  color: black;
}

:root[data-theme="dark"] .custom-dropdown .dropdown .dropdown-content {
  background-color: #2d3748;
  color: #e2e8f0;
}

.custom-dropdown .dropdown .dropdown-content li > * {
  color: inherit;
}

.custom-dropdown .dropdown .dropdown-content li > *:hover {
  background-color: #f7fafc;
}

:root[data-theme="dark"] .custom-dropdown .dropdown .dropdown-content li > *:hover {
  background-color: #4a5568;
}
</style>
