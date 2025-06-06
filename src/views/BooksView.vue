<!-- we used firebase to store the books. look for firebase on email.  -->
<template>
  <div class="container mx-auto p-4 relative">
    <!-- Secret Door Font Awesome Icon -->
    <button
      class="absolute top-4 right-4 text-2xl z-50"
      @click="$router.push({ name: 'NaatList' })"
      aria-label="Open Naat list"
    >
    <font-awesome-icon :icon="['fas', 'door-open']" />
    </button>

    <!-- Naat Modal -->
    <div v-if="showNaatModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-4xl w-full relative">
        <button
          class="absolute top-2 right-2 text-xl"
          @click="showNaatModal = false"
          aria-label="Close Naat list"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <SongList filePath="naat.txt" />
      </div>
    </div>

    <h1 class="text-3xl font-bold mb-6">ilahi Books</h1>
    
    <div v-if="loading" class="text-center text-xl">Loading books...</div>
    
    <div v-else-if="error" class="text-center text-xl text-red-600">{{ error }}</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- PDF Books -->
      <div v-for="book in pdfBooks" :key="book.id" class="shadow-lg rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-2">{{ book.name }}</h2>
        <p class="text-gray-600 mb-4">PDF Format</p>
        <a :href="book.downloadUrl" target="_blank" rel="noopener noreferrer" 
           class="btn btn-primary">
          View PDF
        </a>
      </div>

      <!-- Image-based Books -->
      <div v-for="folder in imageFolders" :key="folder.id" class="shadow-lg rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-2">{{ folder.name }}</h2>
        <p class="text-gray-600 mb-4">Image-based Book</p>
        <button @click="viewImageBook(folder)" class="btn btn-secondary">
          View Book
        </button>
      </div>
    </div>

    <!-- Modal for displaying image-based books -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="p-4 rounded-lg max-w-3xl w-full">
        <h2 class="text-2xl font-bold mb-4">{{ currentFolder?.name }}</h2>
        <div class="grid grid-cols-2 gap-4">
          <img v-for="image in currentFolder?.images" :key="image.id" 
               :src="image.downloadUrl" :alt="image.name" class="w-full h-auto">
        </div>
        <button @click="showModal = false" class="mt-4 btn btn-primary">Close</button>
      </div>
    </div>
    <button @click="uploadMetadata" class="btn btn-primary mt-4"
    :disabled="uploading"
  aria-label="Upload new book metadata from Firebase Storage"
    >
    <span v-if="uploading" aria-live="polite">Uploading...</span>
  <span v-else>Upload Book Metadata</span>
    <!-- Upload Book Metadata -->
  </button>
  <button
  @click="cleanupDuplicates"
  disabled
  class="btn btn-warning mt-4"
  aria-label="Remove duplicate book metadata"
>
  Remove Duplicate Books
</button>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadBookMetadata } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { db, BookData, ImageFolderData } from '../firebase';
import { removeBookDuplicates } from '../utils/removeBookDuplicates';
import SongList from '../components/SongList.vue';

const pdfBooks = ref<BookData[]>([]);
const imageFolders = ref<ImageFolderData[]>([]);
const loading = ref(true);
const error = ref('');
const showModal = ref(false);
const currentFolder = ref<ImageFolderData | null>(null);
const uploading = ref(false);
const showNaatModal = ref(false);

const uploadMetadata = async () => {
  uploading.value = true;
  try {
    await uploadBookMetadata();
    alert('Book metadata uploaded successfully!');
    await fetchDriveContents(); // Refresh the book list
  } catch (error) {
    console.error('Error uploading metadata:', error);
    alert('Failed to upload book metadata. Check console for details.');
  }finally {
    uploading.value = false;
  }
};

const cleanupDuplicates = async () => {
  const count = await removeBookDuplicates();
  alert(`${count} duplicate book entries removed.`);
};


const fetchDriveContents = async () => {
  try {
    const booksCollection = collection(db, 'books');
    const booksSnapshot = await getDocs(booksCollection);
    
    const books = booksSnapshot.docs.map(doc => doc.data() as BookData);
    
    pdfBooks.value = books.filter(book => book.mimeType === 'application/pdf');
  } catch (err) {
    console.error('Error fetching books:', err);
    error.value = 'Failed to load books. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const viewImageBook = (folder: ImageFolderData) => {
  currentFolder.value = folder;
  showModal.value = true;
};

onMounted(fetchDriveContents);
</script>