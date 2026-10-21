// ==UserScript==
// @name         ChatGPT Library Bulk Select
// @namespace    local.chatgpt.library
// @version      1.0.1
// @description  Bulk select or clear loaded images in the ChatGPT library. Enter selection mode first; scroll to load more images.
// @author       Morgan
// @license      MIT
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  const ID = 'gpt-library-bulk-select';
  const onLibrary = () => /^\/(library|images)(\/|$)/.test(location.pathname);
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  let busy = false;

  function state(el) {
    if (el.matches('input[type="checkbox"]')) return el.checked;
    const value = el.getAttribute('aria-checked') ?? el.getAttribute('aria-pressed') ?? el.getAttribute('data-state');
    if (value === 'true' || value === 'checked') return true;
    if (value === 'false' || value === 'unchecked') return false;
    const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    if (/^(deselect|unselect)\b/i.test(label)) return true;
    if (/^select\b/i.test(label)) return false;
    return null;
  }

  function controls() {
    const root = document.querySelector('main') || document.body;
    const candidates = root.querySelectorAll('input[type="checkbox"], [role="checkbox"], button[aria-pressed], button[aria-label], button[title]');
    return [...candidates].filter(el => {
      if (el.closest(`#${ID}, nav, aside, [role="dialog"]`) || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') return false;
      // Restrict selection to controls in a nearby image card.
      let card = el.parentElement;
      let hasImage = false;
      for (let depth = 0; card && depth < 4 && card !== root; depth++, card = card.parentElement) {
        const images = card.querySelectorAll('img');
        if (images.length > 0 && images.length <= 2) { hasImage = true; break; }
      }
      if (!hasImage || state(el) === null) return false;
      if (el.matches('input[type="checkbox"], [role="checkbox"]')) {
        // A custom checkbox may contain the native input; click only one.
        return !el.matches('[role="checkbox"]') || !el.querySelector('input[type="checkbox"]');
      }
      const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
      return /^(select|deselect|unselect)\b/i.test(label) && !/\ball\b/i.test(label);
    });
  }

  async function applySelection(wanted, panel) {
    if (busy) return;
    busy = true;
    const buttons = panel.querySelectorAll('button');
    buttons.forEach(button => { button.disabled = true; });
    const status = panel.querySelector('[role="status"]');
    let changed = 0;
    // Re-query after every click because React can replace the card elements.
    const attempted = new WeakSet();
    try {
      for (let count = 0; count < 2000 && onLibrary(); count++) {
        const next = controls().find(el => state(el) !== wanted && !attempted.has(el));
        if (!next) break;
        attempted.add(next);
        next.click();
        await pause(100);
        changed++;
        status.textContent = `Processed ${changed} checkboxes…`;
      }
      const found = controls();
      status.textContent = found.length
        ? `${found.filter(el => state(el) === true).length}/${found.length} loaded images selected.`
        : 'No image checkboxes found. Enter selection mode first.';
    } catch (error) {
      console.error('Library bulk select:', error);
      status.textContent = 'Selection stopped. Try again after the library loads.';
    } finally {
      busy = false;
      buttons.forEach(button => { button.disabled = false; });
    }
  }

  function mount() {
    const existing = document.getElementById(ID);
    if (!onLibrary()) { existing?.remove(); return; }
    if (existing) return;
    const panel = document.createElement('section');
    panel.id = ID;
    panel.setAttribute('aria-label', 'Library bulk selection');
    panel.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;padding:12px;background:#202123;color:white;border:1px solid #666;border-radius:12px;box-shadow:0 4px 20px #0006;font:13px system-ui;max-width:310px';
    for (const [label, wanted] of [['Select all loaded images', true], ['Clear selection', false]]) {
      const button = document.createElement('button');
      button.textContent = label;
      button.style.cssText = 'padding:8px 10px;margin:3px;border:1px solid #888;border-radius:7px;background:#343541;color:white;cursor:pointer;font:inherit';
      button.addEventListener('click', () => applySelection(wanted, panel));
      panel.append(button);
    }
    const status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.style.cssText = 'margin-top:7px;line-height:1.4';
    status.textContent = 'Enter selection mode first. Scroll to load more images.';
    panel.append(status);
    document.body.append(panel);
  }

  mount();
  // Also handle ChatGPT navigation without a full page reload.
  setInterval(mount, 1000);
})();
