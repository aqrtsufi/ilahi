in View or component? and what code goes in it?
Create a small ToastContainer.vue that renders toasts with DaisyUI alerts and mount it in App.vue near the root.
Replace any alert() calls with show('message', 'success').


where?
In generatePDF path, import pdf-lib only when needed:
const { PDFDocument } = await import('pdf-lib')

optional:
Lazy-load PDF generation code as noted above.

NOT URGENT, folder changes
Data parsing organization
Group utils under sub-folders for clarity:
utils/text/ for songProcessor, poemProcessor, hyperlinkParser, pronunciationService.
utils/pdf/ for PDF-related files.
utils/media/ for playerUtils, audioUtils, qrCodeGenerator.
utils/pwa/ if you add more PWA helpers.

the tooltips go out of the visible screen on phone. give me solutions in chat, and anything else that need fixing here provide concise solution, do not waste my tokens. then the @GlobalToast.vue it did not work really, it used to appear before too often as an alert on dev, we removed it and now in prod it doesn't appear at all the notif. and for some phones why the app does not update on its own when one first opens it, is it an issue with the phone's cache system?
the navigation on the left that appears does not stay long enough. 
fix the theme @themeStore.ts and the song list color is dark blue in dark mode, make them another better color, more visible.@ThemeToggle.vue i'm using in-built daisyUI tailwind, vite vue3, 
the @hyperlinkParser.ts $ hyperlinks can it be like a button form or something that stand out from the texts around it, color change maybe 
give better solutions throughout the app, and users should be able when generate pdf that they can choose a page border, and that the pdf look nice, the qr code centered in it. and with a note saying: link to the ilahi on the app. 

is there a way on the app itself you create a video with a well visible pointer that acts as a tutorial to show the various parts of the app? 1 min length, and a more elaborate one 5 min length. 
ask me for details if to do any of above you need. 





the way on @BookView.vue one can tap the song to build a pdf, 
make a similar component that user can tap (or do something better) and make a playlist of the ilahis that then just play the audios of their choice list continuously. 
look into @src for what is already set up, do not re-invent what is already built. and optimize my files 

subcategories also do not work, fix it. 