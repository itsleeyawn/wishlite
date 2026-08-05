// naive keyword match on title+url, first hit wins.
// Learned overrides (domain -> category, from user drags) beat keywords.
const CATEGORIES = {
  Tech: ["phone", "smartphone", "iphone", "android", "laptop", "notebook", "macbook", "tablet", "ipad", "headphone", "earbud", "airpod", "camera", "monitor", "display", "keyboard", "mouse", "gpu", "graphics card", "cpu", "ssd", "router", "charger", "smartwatch", "console", "drone", "printer", "apple.com", "bestbuy", "newegg", "samsung", "microcenter"],
  Fashion: ["nike", "adidas", "zara", "asos", "zalando", "uniqlo", "h&m", "gucci", "levi", "shoe", "sneaker", "boot", "sandal", "jacket", "coat", "dress", "skirt", "shirt", "t-shirt", "tshirt", "sweater", "jeans", "pants", "trousers", "hoodie", "scarf", "belt", "handbag", "backpack", "bag"],
  Jewelry: ["jewelry", "jewellery", "necklace", "bracelet", "earring", "pendant", "brooch", "gemstone", "diamond", "sapphire", "ruby", "emerald", "pearl", "tiffany", "pandora", "swarovski", "cartier"],
  Home: ["ikea", "wayfair", "furniture", "sofa", "couch", "lamp", "kitchen", "cookware", "bedding", "towel", "curtain", "decor", "rug", "chair", "table", "desk", "shelf", "mattress", "pillow", "blanket", "vase", "candle"],
  Books: ["goodreads", "audible", "kindle", "paperback", "hardcover", "novel", "textbook", "ebook", "bookshop", "bookstore", "barnesandnoble"],
  Games: ["steam", "playstation", "xbox", "nintendo", "switch", "gog.com", "epicgames", "board game", "video game", "boardgame", "tabletop", "controller", "gamepad"]
};

function categorize(title, url, overrides = {}) {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
    if (overrides[host]) return overrides[host];
  } catch {} // not a URL, the title keywords still run
  const hay = title.toLowerCase();

  const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // A title word must end at a boundary, so "ring" does not hit "string".
  const inTitle = (w) => new RegExp(`(^|[^a-z])${esc(w)}([^a-z]|$)`).test(hay);
  // A host label only has to start with the word, so "steam" hits
  // "steampowered.com" but "ebook" does not hit "facebook.com".
  const inHost = (w) => host !== "" && new RegExp(`(^|[^a-z])${esc(w)}`).test(host);

  for (const [cat, words] of Object.entries(CATEGORIES)) {
    if (words.some((w) => inTitle(w) || inHost(w))) return cat;
  }
  return "Other";
}

if (typeof module !== "undefined") module.exports = { categorize, CATEGORIES };
