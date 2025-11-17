<template>
    <ul 
      class="menu p-2 shadow rounded-box w-52 bg-base-100 text-base-content" 
      :class=" { 
        'bg-gray-800/90 text-white': themeStore.theme === 'dark', 
        'bg-white/90 text-gray-800': themeStore.theme === 'light'
      }"
  @click.stop="handleMenuClick"
  >
      <li><router-link to="/zikr-practice" class="btn btn-ghost btn-sm">Zikr Practice</router-link></li>
      <li><router-link to="/wirds" class="btn btn-ghost btn-sm">Wird Slide</router-link></li>
      <li><router-link to="/poems" class="btn btn-ghost btn-sm">Poems</router-link></li>
      <li><router-link to="/books" class="btn btn-ghost btn-sm">Other ilahi Books</router-link></li>
      <li><router-link to="/miscellaneous" class="btn btn-ghost btn-sm">Miscellaneous</router-link></li>
      <li><button 
        @click="() => { handleIlahiClassesClick(); emit('menu-item-click') }"
        class="btn btn-ghost btn-sm w-full text-left">Join ilahi Community</button></li>
      <li><router-link to="/history" class="btn btn-ghost btn-sm">History</router-link></li>
      <li><router-link to="/book" class="btn btn-ghost btn-sm">Download ilahi Book</router-link></li>
      <li><router-link to="/about" class="btn btn-ghost btn-sm">About ilahi</router-link></li>
    </ul>
  </template>
  
  <script setup lang="ts">
  import { useThemeStore } from '../stores/themeStore';
  
  const themeStore = useThemeStore();
  
  // Emit an event when ilahi classes is clicked
  // const emit = defineEmits(['ilahiClassesClick']);
  
  const emit = defineEmits(['menu-item-click', 'ilahiClassesClick'])

function handleMenuClick(event: MouseEvent) {
  // Only emit if a menu item (li or its child) is clicked
  // You may want to refine this if you have nested elements
  const target = event.target as HTMLElement
  // Don't emit for the "Join ilahi Community" button, since it has its own logic
  if (target.closest('button')) return
  emit('menu-item-click')
}


  const handleIlahiClassesClick = () => {
    emit('ilahiClassesClick');
  };
  </script>