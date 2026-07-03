const DEFAULT_TABS = ["Tech", "Fashion", "Home", "Books", "Games", "Other"];
let items = [];
let customCats = [];
let overrides = {}; // hostname -> category, learned when the user drags an item
let active = "All";
let query = "";

const key = (item) => "item_" + item.id;
const allCats = () => [...DEFAULT_TABS, ...customCats];

function render() {
  const tabButtons = ["All", ...allCats()].map((t) => {
    const b = document.createElement("button");
    b.textContent = t;
    b.className = t === active ? "tab on" : "tab";
    b.onclick = () => { active = t; render(); };
    if (t !== "All") {
      b.ondragover = (e) => { e.preventDefault(); b.classList.add("drop"); };
      b.ondragleave = () => b.classList.remove("drop");
      b.ondrop = (e) => { e.preventDefault(); moveItem(e.dataTransfer.getData("text/plain"), t); };
    }
    if (customCats.includes(t)) {
      const x = document.createElement("span");
      x.className = "x";
      x.textContent = "×";
      x.title = "Delete category (items move to Other)";
      x.onclick = (e) => { e.stopPropagation(); removeCategory(t); };
      b.appendChild(x);
    }
    return b;
  });
  document.getElementById("tabs").replaceChildren(...tabButtons, newCategoryButton());

  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (i) =>
      (active === "All" || i.category === active) &&
      (!q || (i.title + " " + i.url).toLowerCase().includes(q))
  );
  document.getElementById("empty").hidden = shown.length > 0;
  document.getElementById("grid").replaceChildren(...shown.map((item) => {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = item.url;
    tile.target = "_blank";
    tile.title = item.title;
    tile.draggable = true;
    tile.ondragstart = (e) => e.dataTransfer.setData("text/plain", item.id);
    const label = () => {
      const l = document.createElement("span");
      l.className = "label";
      l.textContent = item.title;
      return l;
    };
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;
      // Broken image URL: fall back to a title card.
      img.onerror = () => img.replaceWith(label());
      tile.appendChild(img);
    } else {
      tile.appendChild(label());
    }
    const del = document.createElement("span");
    del.className = "del";
    del.textContent = "×";
    del.onclick = async (e) => {
      e.preventDefault();
      items = items.filter((i) => i !== item);
      await chrome.storage.sync.remove(key(item));
      render();
    };
    tile.appendChild(del);
    return tile;
  }));
}

function newCategoryButton() {
  const plus = document.createElement("button");
  plus.className = "tab new";
  plus.textContent = "+ New";
  plus.title = "New category";
  plus.onclick = () => {
    const inp = document.createElement("input");
    inp.className = "tab";
    inp.placeholder = "Name";
    plus.replaceWith(inp);
    inp.focus();
    inp.onblur = () => render();
    inp.onkeydown = async (e) => {
      if (e.key === "Escape") return render();
      if (e.key !== "Enter") return;
      const name = inp.value.trim();
      if (name && !["All", ...allCats()].includes(name)) {
        customCats.push(name);
        await chrome.storage.sync.set({ categories: customCats });
        active = name;
      }
      render();
    };
  };
  return plus;
}

async function moveItem(id, cat) {
  const item = items.find((i) => i.id === id);
  if (!item || item.category === cat) return;
  item.category = cat;
  overrides[new URL(item.url).hostname] = cat; // future adds from this site land here too
  await chrome.storage.sync.set({ [key(item)]: item, overrides });
  render();
}

async function removeCategory(cat) {
  customCats = customCats.filter((c) => c !== cat);
  const moved = {};
  for (const i of items.filter((i) => i.category === cat)) {
    i.category = "Other";
    moved[key(i)] = i;
  }
  for (const [host, c] of Object.entries(overrides)) if (c === cat) delete overrides[host];
  await chrome.storage.sync.set({ categories: customCats, overrides, ...moved });
  if (active === cat) active = "All";
  render();
}

const addBtn = document.getElementById("add");
addBtn.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.startsWith("http") || items.some((i) => i.url === tab.url)) return;

  let image = tab.favIconUrl || "";
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const meta = (sel) => document.querySelector(sel)?.content || "";
        return meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]');
      },
    });
    if (res?.result) image = res.result;
  } catch {} // page not scriptable, favicon fallback stays

  const item = {
    id: crypto.randomUUID(),
    added: Date.now(),
    url: tab.url,
    title: tab.title || tab.url,
    image,
    category: categorize(tab.title || "", tab.url, overrides),
  };
  try {
    await chrome.storage.sync.set({ [key(item)]: item });
  } catch {
    // ponytail: sync quota is ~100KB (~200 items); surface it and bail
    addBtn.textContent = "Storage full";
    return;
  }
  items.unshift(item);
  render();
};

const search = document.getElementById("search");
const searchInput = document.getElementById("search-input");
document.getElementById("search-toggle").onclick = () => {
  search.classList.add("open");
  searchInput.focus();
};
searchInput.oninput = () => { query = searchInput.value; render(); };
searchInput.onkeydown = (e) => { if (e.key === "Escape") closeSearch(); };
document.getElementById("search-cancel").onclick = closeSearch;
function closeSearch() {
  search.classList.remove("open");
  searchInput.value = query = "";
  render();
}

async function load() {
  // One-time migration from the pre-sync local format.
  const { items: old } = await chrome.storage.local.get("items");
  if (old?.length) {
    const put = {};
    for (const it of old) {
      it.id = crypto.randomUUID();
      it.added = Date.now();
      put["item_" + it.id] = it;
    }
    await chrome.storage.sync.set(put);
    await chrome.storage.local.remove("items");
  }

  const all = await chrome.storage.sync.get(null);
  customCats = all.categories || [];
  overrides = all.overrides || {};
  items = Object.keys(all)
    .filter((k) => k.startsWith("item_"))
    .map((k) => all[k])
    .sort((a, b) => (b.added || 0) - (a.added || 0));
  render();
}

load();
