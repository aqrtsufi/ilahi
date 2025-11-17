// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import YouTube from 'vue3-youtube'
import App from './App.vue'
import router from './router'
// import './assets/tailwind.postcss' // Or './main.css'
import './style.css'
import Installation from './components/Installation.vue'
import { FontAwesomeIcon } from './plugins/font-awesome'
import { registerSW } from 'virtual:pwa-register';
// import { useNotificationStore } from './stores/notificationStore'; // Import your notification store
// import { initializeGlobalHyperlinks } from '@/utils/hyperlinkParser.ts';

// function waitForToast(): Promise<void> {
//   return new Promise((resolve) => {
//     if (window.showGlobalToast) {
//       resolve();
//       return;
//     }
//     const interval = setInterval(() => {
//       if (window.showGlobalToast) {
//         clearInterval(interval);
//         resolve();
//       }
//     }, 100);
//   });
// }



router.beforeEach((to, from, next) => {
  // This will ensure all page navigations start at the top
  window.scrollTo(0, 0)
  next()
})

const app = createApp(App)
const pinia = createPinia()
app.component('YouTube', YouTube)
app.component('Installation', Installation)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(pinia)
app.use(router)

// Initialize global hyperlink handling
// initializeGlobalHyperlinks();

if (import.meta.env.PROD) {
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: () => window.showGlobalToast?.('New version available. Tap to update.', () => updateSW(true)),
  onOfflineReady: () => window.showGlobalToast?.('App is ready to work offline.'),
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    navigator.serviceWorker?.getRegistrations().then(rs => rs.forEach(r => r.update()));
  }
});
}



//   onNeedRefresh() {
//     window.showGlobalToast?.('New version available. Tap to update.', () => {
//       updateSW(true);
//     });
//   },
//   onOfflineReady() {
//     window.showGlobalToast?.('App is ready to work offline.', () => {});
//   },
// });


// Register/unregister Service Worker depending on env
const enableSWInDev = import.meta.env.VITE_SW_DEV === 'true'
// Only poll and prompt in production
if (import.meta.env.PROD) {
//   waitForToast().then(() => {
//   setInterval(async () => {
//     const regs = await navigator.serviceWorker.getRegistrations();

//     for (const reg of regs) {
//       if (reg.waiting != null) {
//         const waitingSW = reg.waiting;
//         // Trigger the global toast
//         if (window.showGlobalToast) {
//           window.showGlobalToast(
//             'New version available! Click here to update.',
//             () => {
//               waitingSW.postMessage({ type: 'SKIP_WAITING' });
//               navigator.serviceWorker.addEventListener(
//                 'controllerchange',
//                 () => window.location.reload(),
//                 { once: true }
//               );
//             }
//           );
//         }
//         break;
//       }
//     }
//   }, 15000);
// });

  // Force check for new SW on load
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.update());
  });

} else {
  // Development: ensure no SW controls the page to avoid stale caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
}



// if (import.meta.env.PROD || enableSWInDev) {
//   const updateServiceWorker = registerSW({ immediate: true })


//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.addEventListener('controllerchange', () => {
//       console.log('Service worker controller changed')
//     })
//  // only poll and prompt in production
//  if (import.meta.env.PROD) {
//     setInterval(async () => {
//       const regs = await navigator.serviceWorker.getRegistrations()
//       for (const reg of regs) {
//         if (reg.waiting) {
//           const { show } = useToast()
//           show('New version available! Click to update.', 'info', 10000)      
//           // const accept = window.confirm('A new version of ilahi is available. Reload now?')
//           // if (accept) {
//             // Add a global update function
//   window.updateApp = () => {
//           // Ask the waiting SW to take control, then reload on controller change
//             reg.waiting.postMessage({ type: 'SKIP_WAITING' })
//             navigator.serviceWorker.addEventListener('controllerchange', () => {
//               window.location.reload()
//             }, { once: true })
//           }
//           break
//         }
//       }
//     }, 15000)
//   }
//     navigator.serviceWorker.getRegistrations().then(registrations => {
//       registrations.forEach(registration => registration.update())
//     })
//   }
// } else {
//   // Development default: ensure no SW controls the page to avoid stale caches
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.getRegistrations().then(registrations => {
//       registrations.forEach(registration => registration.unregister());
//     });
//   }
// }

// ...


app.mount('#app')


