// Run: node test.js
const assert = require("node:assert");
const { categorize } = require("./categorize.js");

assert.equal(categorize("MacBook Pro 14 Laptop", "https://www.apple.com/x"), "Tech");
assert.equal(categorize("Air Force 1 Sneaker", "https://www.nike.com/x"), "Fashion");
assert.equal(categorize("MALM desk", "https://www.ikea.com/x"), "Home");
assert.equal(categorize("Dune paperback", "https://example.com/x"), "Books");
assert.equal(categorize("Elden Ring", "https://store.steampowered.com/x"), "Games");
assert.equal(categorize("Some random thing", "https://example.com/x"), "Other");
assert.equal(categorize("My profile", "https://facebook.com/x"), "Other"); // no bare "book" keyword
assert.equal(categorize("Some random thing", "https://example.com/x", { "example.com": "Vinyl" }), "Vinyl"); // learned override wins
assert.equal(categorize("MacBook Pro 14 Laptop", "https://www.apple.com/x", { "www.apple.com": "Gifts" }), "Gifts"); // override beats keywords
assert.equal(categorize("Gold earring set", "https://example.com/x"), "Jewelry");
assert.equal(categorize("Elden Ring", "https://store.steampowered.com/x"), "Games"); // domain keyword inside a longer host
console.log("ok");
