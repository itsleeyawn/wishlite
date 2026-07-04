# Wishlite

A minimal browser extension for saving pages to a categorized wishlist. Open the popup on any product page, hit **+ Add this page**, and the item lands in the right category tab as an image tile. Click a tile to open the page, hover for the delete button.

Manifest V3, no build step, no dependencies, no tracking. Browsers load the source files directly.

## Features

- **One-click save** from the toolbar popup, on any page
- **Auto-categorization** by keyword, with drag-to-recategorize that teaches the categorizer per site
- **Image tiles** from the page's `og:image`, with a favicon fallback
- **Custom categories** you can add and remove on the fly
- **Sync** across your devices via `chrome.storage.sync`, no account or server involved

## Install

Wishlite is unpacked-only for now (not yet on the extension stores).

**Chrome / Edge / Brave**
1. Go to `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. **Load unpacked** and select this folder

**Firefox**
1. Go to `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** and select `manifest.json`
3. This is temporary and clears on restart; reload after edits

## Usage

- **Add**: open the popup on a page, click **+ Add this page**
- **Custom categories**: click the `+` tab, type a name, press Enter. Hover a custom tab for its × (deleting moves its items to Other).
- **Recategorize**: drag a tile onto a tab. This also teaches the categorizer, so future items from that site go straight there.

## How it works

| File | Role |
|------|------|
| `manifest.json` | Extension config and permissions |
| `popup.html` / `popup.js` | The entire UI |
| `categorize.js` | Keyword-based auto-categorization |
| `test.js` | `node test.js` checks the categorizer |

Categories and their keywords live in `categorize.js`; the default tab list is `DEFAULT_TABS` in `popup.js`. Data is stored in `chrome.storage.sync`, which syncs when you're signed into the browser. The quota is roughly 100KB, about 200 items.

## Contributing

A handful of plain files, no build step. Edit a file, then reload the extension from the browser's extensions page. Run `node test.js` before opening a PR.
