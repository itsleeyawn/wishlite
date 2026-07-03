// ponytail: naive keyword match on title+url, first hit wins.
// Learned overrides (domain -> category, from user drags) beat keywords.
const CATEGORIES = {
  Tech: ["phone", "laptop", "tablet", "headphone", "earbud", "camera", "monitor", "keyboard", "gpu", "console", "apple.com", "bestbuy", "newegg", "samsung"],
  Fashion: ["nike", "adidas", "zara", "asos", "zalando", "uniqlo", "shoe", "sneaker", "jacket", "dress", "shirt", "jeans", "hoodie", "bag"],
  Home: ["ikea", "wayfair", "furniture", "sofa", "lamp", "kitchen", "decor", "rug", "chair", "desk", "mattress"],
  Books: ["goodreads", "audible", "kindle", "paperback", "hardcover", "novel", "bookshop", "bookstore"],
  Games: ["steam", "playstation", "xbox", "nintendo", "gog.com", "board game", "video game"]
};

function categorize(title, url, overrides = {}) {
  try {
    const host = new URL(url).hostname;
    if (overrides[host]) return overrides[host];
  } catch {} // not a URL, fall through to keywords
  const hay = (title + " " + url).toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORIES)) {
    if (words.some((w) => hay.includes(w))) return cat;
  }
  return "Other";
}

if (typeof module !== "undefined") module.exports = { categorize, CATEGORIES };
