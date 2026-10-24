(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "nova-browser-state-v1";
  const defaultState = {
    tabs: [{ id: Date.now(), title: "New tab", url: "", view: "home", zoom: 100, history: [] }],
    activeId: null, history: [], bookmarks: []
  };
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState; }
  catch { state = defaultState; }
  if (!state.tabs || !state.tabs.length) state.tabs = defaultState.tabs;
  if (!Array.isArray(state.history)) state.history = [];
  if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
  if (!state.activeId || !state.tabs.some(t => t.id === state.activeId)) state.activeId = state.tabs[0].id;
  let deferredInstallPrompt = null;
  const activeTab = () => state.tabs.find(t => t.id === state.activeId) || state.tabs[0];

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { toast("Storage is full; some changes may not be saved."); }
  }
  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.remove("hidden");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.add("hidden"), 2400);
  }
  function safeTitle(url) {
    try { return new URL(url).hostname.replace(/^www\./, "") || "Website"; }
    catch { return "Website"; }
  }
  function normalizeInput(value) {
    const raw = value.trim();
    if (!raw) return "";
    if (/^(https?:\/\/|file:|about:)/i.test(raw)) return raw;
    if (/^(localhost|[\w-]+(\.[\w-]+)+)(:\d+)?([/?#].*)?$/i.test(raw) && !raw.includes(" ")) {
      return "https://" + raw;
    }
    return "https://www.google.com/search?q=" + encodeURIComponent(raw);
  }
  function setView(view) {
    $("homeScreen").classList.toggle("hidden", view !== "home");
    $("webFallback").classList.toggle("hidden", view !== "website");
    $("historyScreen").classList.toggle("hidden", view !== "history");
    $("bookmarksScreen").classList.toggle("hidden", view !== "bookmarks");
  }
  function render() {
    const tab = activeTab();
    $("tabCount").textContent = state.tabs.length;
    $("sheetTabCount").textContent = `(${state.tabs.length})`;
    $("currentTabLabel").textContent = tab.title || "New tab";
    $("zoomLabel").textContent = "Pinch to zoom";
    $("addressInput").value = tab.url || "";
    setView(tab.view || "home");
    if (tab.view === "website") {
      $("fallbackUrl").textContent = tab.url;
      $("openExternal").href = tab.url;
    }
    renderTabs(); renderHistory(); renderBookmarks(); save();
  }
  function renderTabs() {
    const list = $("tabsList"); list.replaceChildren();
    state.tabs.forEach(tab => {
      const card = document.createElement("div");
      card.className = "tab-card" + (tab.id === state.activeId ? " active" : "");
      const choose = document.createElement("button");
      choose.className = "tab-card"; choose.style.cssText = "border:0;background:transparent;padding:0;color:inherit;width:100%;min-height:0";
      const title = document.createElement("strong"); title.textContent = tab.title || "New tab";
      const url = document.createElement("small"); url.textContent = tab.url || "Nova start page";
      choose.append(title, url);
      choose.addEventListener("click", () => { state.activeId = tab.id; $("tabsOverlay").classList.add("hidden"); render(); });
      const close = document.createElement("button"); close.className = "remove-tab"; close.textContent = "×"; close.setAttribute("aria-label", "Close tab");
      close.addEventListener("click", e => { e.stopPropagation(); closeTab(tab.id); });
      card.append(choose, close); list.append(card);
    });
  }
  function renderHistory() {
    const list = $("historyList"); list.replaceChildren();
    if (!state.history.length) { list.textContent = "No history yet."; return; }
    state.history.slice().reverse().slice(0,80).forEach(item => {
      const b = document.createElement("button"); b.className = "list-item";
      const title = document.createElement("strong"); title.textContent = item.title;
      const url = document.createElement("small"); url.textContent = item.url;
      b.append(title,url); b.addEventListener("click", () => navigate(item.url)); list.append(b);
    });
  }
  function renderBookmarks() {
    const list = $("bookmarkList"); list.replaceChildren();
    if (!state.bookmarks.length) { list.textContent = "No bookmarks saved yet."; return; }
    state.bookmarks.forEach(item => {
      const b = document.createElement("button"); b.className = "list-item";
      const title = document.createElement("strong"); title.textContent = item.title;
      const url = document.createElement("small"); url.textContent = item.url;
      b.append(title,url); b.addEventListener("click", () => navigate(item.url)); list.append(b);
    });
  }
  function navigate(input) {
    const url = normalizeInput(input);
    if (!url) return;
    const tab = activeTab();
    tab.url = url; tab.title = safeTitle(url); tab.view = "website";
    tab.zoom = tab.zoom || 100;
    const item = { url, title: tab.title, time: Date.now() };
    state.history = state.history.filter(x => x.url !== url);
    state.history.push(item); if (state.history.length > 300) state.history.shift();
    tab.history = tab.history || []; tab.history.push(url);
    render();
    // Browsers do not permit a PWA to embed every website. This button opens the URL externally.
  }
  function newTab() {
    const tab = { id: Date.now() + Math.floor(Math.random()*1000), title: "New tab", url: "", view: "home", zoom: 100, history: [] };
    state.tabs.push(tab); state.activeId = tab.id; $("tabsOverlay").classList.add("hidden"); render();
  }
  function closeTab(id) {
    if (state.tabs.length === 1) {
      const only = state.tabs[0]; only.url = ""; only.title = "New tab"; only.view = "home"; only.zoom = 100; only.history = [];
    } else {
      const index = state.tabs.findIndex(t => t.id === id);
      state.tabs = state.tabs.filter(t => t.id !== id);
      if (state.activeId === id) state.activeId = state.tabs[Math.max(0,index-1)].id;
    }
    render();
  }
  function showHistory() { activeTab().view = "history"; $("menuOverlay").classList.add("hidden"); render(); }
  function showBookmarks() { activeTab().view = "bookmarks"; $("menuOverlay").classList.add("hidden"); render(); }
  function addBookmark() {
    const tab = activeTab();
    if (!tab.url) { toast("Open a website first."); return; }
    if (!state.bookmarks.some(b => b.url === tab.url)) state.bookmarks.push({url:tab.url,title:tab.title});
    $("menuOverlay").classList.add("hidden"); toast("Bookmark saved."); render();
  }

  $("addressForm").addEventListener("submit", e => { e.preventDefault(); submitAddress($("addressInput").value); });
  $("homeSearchForm").addEventListener("submit", e => { e.preventDefault(); submitAddress($("homeSearchInput").value); });
  $("newTabButton").addEventListener("click", newTab);
  $("sheetNewTab").addEventListener("click", newTab);
  $("tabsButton").addEventListener("click", () => $("tabsOverlay").classList.remove("hidden"));
  $("closeTabs").addEventListener("click", () => $("tabsOverlay").classList.add("hidden"));
  $("menuButton").addEventListener("click", () => $("menuOverlay").classList.remove("hidden"));
  $("tabsOverlay").addEventListener("click", e => { if (e.target === $("tabsOverlay")) $("tabsOverlay").classList.add("hidden"); });
  $("menuOverlay").addEventListener("click", e => { if (e.target === $("menuOverlay")) $("menuOverlay").classList.add("hidden"); });
  $("reloadButton").addEventListener("click", () => { if (activeTab().url) window.open(activeTab().url, "_blank", "noopener,noreferrer"); else toast("You're on the start page."); });
  $("backButton").addEventListener("click", () => { const h = activeTab().history || []; if (h.length > 1) { h.pop(); navigate(h[h.length-1]); } else toast("No previous page in this app."); });
  $("forwardButton").addEventListener("click", () => toast("Forward navigation is available in the external browser."));
  $("returnHome").addEventListener("click", () => { activeTab().view = "home"; activeTab().url = ""; activeTab().title = "New tab"; render(); });
  $("copyUrl").addEventListener("click", async () => { try { await navigator.clipboard.writeText(activeTab().url); toast("Address copied."); } catch { toast("Copy isn't available in this browser."); } });
  document.querySelectorAll("[data-action]").forEach(b => b.addEventListener("click", () => {
    const action = b.dataset.action;
    if (action === "home") { activeTab().view = "home"; activeTab().url = ""; activeTab().title = "New tab"; render(); }
    if (action === "history") showHistory();
    if (action === "bookmarks") showBookmarks();
  }));
  document.querySelectorAll("[data-url]").forEach(b => b.addEventListener("click", () => submitAddress(b.dataset.url)));
  document.querySelectorAll("[data-menu]").forEach(b => b.addEventListener("click", () => {
    const action = b.dataset.menu;
    if (action === "bookmark") addBookmark();
    if (action === "history") showHistory();
    if (action === "bookmarks") showBookmarks();
    if (action === "install") { $("menuOverlay").classList.add("hidden"); if (deferredInstallPrompt) deferredInstallPrompt.prompt(); else toast("Use Chrome menu → Install app / Add to Home screen."); }
    if (action === "about") { $("menuOverlay").classList.add("hidden"); toast("Nova Browser PWA · browser-style demo"); }
  }));
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstallPrompt = e; $("installButton").classList.remove("hidden"); });
  window.addEventListener("appinstalled", () => { deferredInstallPrompt = null; toast("Nova installed."); });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }

  // Two-finger pinch scales the PWA content area, similar to pinch zoom.
  // External websites opened in another browser use that browser's own zoom.
  const content = $("content");
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let contentScale = 1;
  function touchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
  content.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
      pinchStartDistance = touchDistance(e.touches);
      pinchStartScale = contentScale;
    }
  }, {passive:true});
  content.addEventListener("touchmove", e => {
    if (e.touches.length === 2 && pinchStartDistance > 0) {
      const distance = touchDistance(e.touches);
      contentScale = Math.max(0.75, Math.min(1.8, pinchStartScale * distance / pinchStartDistance));
      content.style.zoom = String(contentScale);
    }
  }, {passive:true});
  content.addEventListener("touchend", e => {
    if (e.touches.length < 2) pinchStartDistance = 0;
  }, {passive:true});


  render();
})();