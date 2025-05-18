// ==UserScript==
// @name               CustomsForge Ignition4 CDLC Randomizer
// @namespace    https://github.com/hallgatolaszlo/CustomsForge-Ignition4-CDLC-Randomizer
// @version            1.0
// @description    Random CDLC Picker for CustomsForge
// @author             Hallgató László
// @license             MIT
// @match              https://ignition4.customsforge.com/*
// @grant               none
// ==/UserScript==

/*
 * Copyright © 2025 Hallgató László
 * Licensed under the MIT License: https://opensource.org/licenses/MIT
 */

(function() {
    'use strict';

    // Get the total number of pages from the "of N" span
    function getMaxPages() {
        const span = document.querySelector('.dt-paging-input span');
        if (!span) return null;
        const match = span.textContent.trim().match(/of\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
    }

    // Pick a random integer between 1 and max
    function randomPage(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    // Insert the “Random CDLC” button inside #nav-controls
    function injectButton() {
        const navControls = document.querySelector('#nav-controls');
        if (!navControls || navControls.querySelector('.random-cdlc-btn')) return;

        const btn = document.createElement('button');
        btn.textContent = '🎲 Random CDLC';
        btn.className = 'tw:btn tw:btn-primary tw:font-normal random-cdlc-btn';
        btn.style.marginLeft = '0.5rem';

        navControls.appendChild(btn);

        btn.addEventListener('click', async () => {
            const max = getMaxPages();
            if (max && max > 1) {
                // Multiple pages exist, randomize page

                const page = randomPage(max);
                const input = document.querySelector('.dt-paging-input input');

                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value').set;
                    if (valueSetter) {
                        valueSetter.call(element, value);
                    } else {
                        element.value = value;
                    }
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }

                setNativeValue(input, page.toString());

                input.dispatchEvent(new KeyboardEvent('keydown', {
                    bubbles: true, cancelable: true, key: 'Enter', code: 'Enter'
                }));

                // Wait for results to load
                await new Promise(res => {
                    const list = document.querySelector('tbody');
                    if (!list) return res();

                    const obs = new MutationObserver(() => {
                        if (list.querySelectorAll('a.dropdown-item.dropdown-search').length > 0) {
                            obs.disconnect();
                            res();
                        }
                    });

                    obs.observe(list, { childList: true, subtree: true });
                });

                pickRandomLinkAndOpen();

            } else {
                // Only one page or no pagination, pick from current page directly
                pickRandomLinkAndOpen();
            }
        });
    }

    function pickRandomLinkAndOpen() {
        const allLinks = Array.from(document.querySelectorAll('a.dropdown-item.dropdown-search'));

        const validLinks = allLinks.filter(a => {
            return /^https:\/\/ignition4\.customsforge\.com\/cdlc\/\d+$/.test(a.href);
        });

        if (!validLinks.length) {
            alert('No valid CDLC links found on this page.');
            return;
        }

        const pick = validLinks[Math.floor(Math.random() * validLinks.length)];

        window.open(pick.href, '_blank');
    }

    // Wait for #nav-controls before injecting the button
    const obs = new MutationObserver((_, observer) => {
        if (document.querySelector('#nav-controls')) {
            observer.disconnect();
            injectButton();
        }
    });

    obs.observe(document.body, { childList: true, subtree: true });
})();
