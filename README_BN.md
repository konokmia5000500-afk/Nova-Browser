# Nova Browser PWA — বাংলা নির্দেশিকা

এটি HTML, CSS এবং JavaScript দিয়ে তৈরি একটি browser-style PWA starter project।

## কী কাজ করে
- মোবাইল-উপযোগী browser-like UI
- Google search বা URL input
- একাধিক tab তৈরি, নির্বাচন ও বন্ধ করা
- localStorage-এ tab state, history এবং bookmarks সংরক্ষণ
- UI zoom control
- PWA manifest ও service worker
- GitHub Pages-এ হোস্ট করার উপযোগী static files

## গুরুত্বপূর্ণ সীমাবদ্ধতা
এটি পূর্ণাঙ্গ Chrome replacement নয়। ওয়েবসাইট render করার browser engine এতে নেই। বহু ওয়েবসাইট iframe/embed ব্লক করে, তাই search/address submit করলে URL বাইরের browser tab-এ খোলার চেষ্টা করে। Chrome Extensions, browser-engine-level zoom, সব ওয়েবসাইটের in-app rendering, private browsing এবং secure password manager এই starter-এ নেই। এই আচরণ Android/Chrome-এর সংস্করণ ও ব্যবহারকারীর সেটিংসের ওপরও নির্ভর করতে পারে।

## GitHub Pages-এ প্রকাশ
1. GitHub-এ একটি নতুন repository তৈরি করো, যেমন `nova-browser`.
2. এই ZIP-এর ভেতরের ফাইলগুলো extract করে repository-এর root-এ upload করো।
3. Repository → **Settings** → **Pages** এ যাও।
4. **Build and deployment**-এ **Deploy from a branch** নির্বাচন করো।
5. Branch হিসেবে `main` এবং folder হিসেবে `/(root)` নির্বাচন করে Save করো।
6. Pages URL প্রকাশিত হলে Android-এ Chrome দিয়ে খোলো।
7. Chrome-এর ⋮ মেনু থেকে **Install app** বা **Add to Home screen** নির্বাচন করো।

GitHub Pages-এ HTTPS পাওয়া যায়, যা PWA service worker-এর জন্য প্রয়োজনীয়।

## স্থানীয়ভাবে পরীক্ষা
ফাইল ম্যানেজার থেকে `index.html` খোলা হলে service worker/PWA install কাজ নাও করতে পারে। GitHub Pages-এ deploy করে পরীক্ষা করাই সবচেয়ে সহজ।

## Storage
Tabs, history ও bookmarks ব্রাউজারের localStorage-এ থাকে। Browser data clear করলে বা site storage মুছে ফেললে এগুলো হারিয়ে যেতে পারে। এটি cloud sync নয়।

## Zoom
Zoom control মূলত app UI-কে scale করে। এটি external browser-এ খোলা website-এর browser-level zoom পরিবর্তন করতে পারে না।


## Updated interaction and logo
- Zoom-in/zoom-out buttons have been removed.
- Use a two-finger pinch gesture on the app content area to scale the PWA content. The app's top browser controls remain fixed.
- The logo is now a classic blue star with a search-glass motif.
- This pinch gesture scales the PWA UI, not an external website. Once a website is opened in Chrome or another browser, use that browser's own pinch-to-zoom.
