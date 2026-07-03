# Wishlite

Minimal MV3 extension. Open the popup on any product page, hit **+ Add this page**, and the item lands in the right category tab as an image tile (og:image, favicon fallback). Click a tile to open the page, hover for the delete button.

No build step: browsers load these files directly.

## Load it

**Chrome / Edge / Brave**
1. Go to `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. **Load unpacked** → select this folder
4. After editing files, click the reload icon on the extension card

**Firefox**
1. Go to `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** → select `manifest.json`
3. Reloads on each browser restart (temporary); click **Reload** after edits

## Files
- `manifest.json` — config, permissions
- `popup.html` / `popup.js` — the whole UI
- `categorize.js` — keyword-based auto-categorization
- `test.js` — `node test.js` checks the categorizer

## Notes
- Categories and their keywords live in `categorize.js`; default tab list in `popup.js` (`DEFAULT_TABS`).
- Data lives in `chrome.storage.sync`: synced across devices when you're signed into the browser. Quota is ~100KB, roughly 200 items.
- **Custom categories**: click the `+` tab, type a name, Enter. Hover a custom tab for its × (deleting moves its items to Other).
- **Drag to recategorize**: drag a tile onto a tab. This also teaches the categorizer, future items from that site go straight to that category.
