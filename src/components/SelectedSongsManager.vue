<template>
    <div>
      <p class="text-lg mb-2">Set the order for your selected ilahis.</p>
  
      <div class="space-y-2">
        <div class="flex items-center mb-2 font-semibold">
          <span class="w-24 mr-2">Order</span>
          <span class="flex-grow">Title</span>
          <span class="w-10"></span>
        </div>
  
        <div
          v-for="(song, index) in localSelectedSongs"
          :key="song.title"
          class="flex items-center"
        >
          <label :for="`order-${index}`" class="sr-only">Order for {{ song.title }}</label>
          <input
            :id="`order-${index}`"
            class="input input-bordered w-24 mr-2"
            type="number"
            :min="1"
            :max="localSelectedSongs.length"
            :aria-label="`Order for ${song.title}`"
             v-model.lazy.number="song.order"
            @focus="isEditing = true"
            @change="onOrderCommit(index)"
            @blur="onOrderCommit(index)"
          />
          <span class="flex-grow text-base-content">{{ song.title }}</span>
          <button
            class="btn btn-ghost btn-xs text-error ml-2"
            type="button"
            @click="removeSong(index)"
            aria-label="Remove {{ song.title }}"
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>
  
      <div class="mt-4 flex gap-2">
        <button @click="sortAlphabetically" class="btn btn-outline btn-primary">Sort A–Z</button>
        <button @click="renumberSequential" class="btn btn-outline">Renumber 1..N</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import { SongData } from '../utils/types';
  
  const props = defineProps<{ selectedSongs: SongData[] }>();
  const emit = defineEmits<{
    (e: 'update:selectedSongs', value: SongData[]): void
    (e: 'generate-book'): void
  }>();
  
  const localSelectedSongs = ref(
    props.selectedSongs.map((song, i) => ({ ...song, order: song.order ?? i + 1 }))
  );
  
  const isEditing = ref(false);


  watch(() => props.selectedSongs, (newSongs, oldSongs) => {
    if (isEditing.value || newSongs === oldSongs) return; // don’t reset while editing
    localSelectedSongs.value = newSongs.map((song, i) => ({ ...song, order: song.order ?? i + 1 }));
  }, { deep: false });
  
  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }
  
  function normalizeAndEmit() {
    // Sort by desired order then by original index (stable), then renumber uniquely
    const withIndex = localSelectedSongs.value.map((s, i) => ({ s, i, o: Number(s.order) || i + 1 }));
    withIndex.sort((a, b) => a.o - b.o || a.i - b.i);
    withIndex.forEach((item, idx) => { item.s.order = idx + 1; });
    localSelectedSongs.value = withIndex.map(w => w.s);
    emit('update:selectedSongs', localSelectedSongs.value);
  }
  
  function onOrderCommit(index: number) {
    const n = Number(localSelectedSongs.value[index].order);
    localSelectedSongs.value[index].order = clamp(isFinite(n) ? Math.round(n) : index + 1, 1, localSelectedSongs.value.length);
    normalizeAndEmit();
    isEditing.value = false;
  }
  
  function removeSong(index: number) {
    localSelectedSongs.value.splice(index, 1);
    renumberSequential();
  }
  
  function sortAlphabetically() {
    localSelectedSongs.value.sort((a, b) => a.title.localeCompare(b.title));
    renumberSequential();
  }
  
  function renumberSequential() {
    localSelectedSongs.value.forEach((s, i) => { s.order = i + 1; });
    emit('update:selectedSongs', localSelectedSongs.value);
  }
  </script>