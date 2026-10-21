# ChatGPT Library Bulk Select for Firefox

## Load for testing

1. Disable the Greasemonkey version if you installed it.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…**.
4. Select `firefox/manifest.json` from this folder.
5. Refresh your ChatGPT library tab. Allow access to chatgpt.com if Firefox asks.
6. Enter the library's selection mode, then use **Select all loaded images** or **Clear selection** in the bottom-right panel.

Scroll to load additional images and repeat selection as needed. Only image controls currently present in the page can be selected. This extension does not delete images or transmit data.

Temporary add-ons are removed when Firefox restarts. The checkbox selectors have not been verified against a live ChatGPT library.

## Install permanently

Normal Firefox requires a Mozilla-signed extension for permanent installation.

1. Sign in at https://addons.mozilla.org/developers/ and submit a new add-on.
2. Choose **On your own** for private/self distribution.
3. Upload `chatgpt-library-bulk-select-firefox.zip` from this folder.
4. Complete Mozilla's validation/review and download the signed `.xpi` once available.
5. In Firefox, open `about:addons`, choose the gear menu, then **Install Add-on From File…** and select the signed `.xpi`.

The ZIP is source for testing/submission, not an already signed installable add-on.

## Source

`firefox/content.js` is the userscript packaged as a content script. After editing it, click **Reload** for the extension in `about:debugging`, then refresh the ChatGPT tab.

Mozilla instructions:
- https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
- https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/
