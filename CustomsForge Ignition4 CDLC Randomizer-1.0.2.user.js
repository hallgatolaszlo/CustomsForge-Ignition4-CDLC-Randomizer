// ==UserScript==
// @name            CustomsForge Ignition4 CDLC Randomizer
// @namespace       https://github.com/hallgatolaszlo/CustomsForge-Ignition4-CDLC-Randomizer
// @version         1.0.2
// @description     Random CDLC Picker for CustomsForge
// @author          Hallgató László
// @license         MIT
// @match           https://ignition4.customsforge.com/*
// @grant           none
// ==/UserScript==

(function () {
    "use strict";

    // Get the total number of pages
    function getMaxPages() {
        const span = document.querySelector(".dt-paging-input span");
        if (!span) return 1;

        const match = span.textContent.match(/of\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : 1;
    }

    // Navigate to random page and select random CDLC
    function getRandomCDLC() {
        const maxPages = getMaxPages();

        if (maxPages > 1) {
            // Go to random page first
            const randomPage = Math.floor(Math.random() * maxPages) + 1;
            const pageInput = document.querySelector(".dt-paging-input input");

            if (pageInput) {
                // Set page number and trigger Enter key
                pageInput.value = randomPage;
                pageInput.dispatchEvent(new Event("input", { bubbles: true }));
                pageInput.dispatchEvent(new KeyboardEvent("keydown", {
                    bubbles: true,
                    cancelable: true,
                    key: "Enter",
                    code: "Enter"
                }));

                // Wait for page to load before selecting random CDLC
                setTimeout(selectRandomCDLC, 1000);
            }
        } else {
            // Only one page, select random CDLC directly
            selectRandomCDLC();
        }
    }

    // Select and open a random CDLC from the current page
    function selectRandomCDLC() {
        const cdlcLinks = Array.from(
            document.querySelectorAll("a.dropdown-item.dropdown-search")
        ).filter(link => /\/cdlc\/\d+$/.test(link.href));

        if (cdlcLinks.length === 0) {
            alert("No CDLC links found on this page.");
            return;
        }

        // Select and open random CDLC
        const randomLink = cdlcLinks[Math.floor(Math.random() * cdlcLinks.length)];
        window.open(randomLink.href, "_blank");
    }

    // Add random button to the navigation controls
    function addRandomButton() {
        const navControls = document.querySelector("#nav-controls");
        if (!navControls || navControls.querySelector(".random-cdlc-btn")) return;

        const button = document.createElement("button");
        button.textContent = "🎲 Random CDLC";
        button.className = "tw:btn tw:btn-primary tw:font-normal random-cdlc-btn";
        button.style.marginLeft = "0.5rem";
        button.addEventListener("click", getRandomCDLC);

        navControls.appendChild(button);
    }

    // Wait for page to fully load
    const observer = new MutationObserver(() => {
        if (document.querySelector("#nav-controls")) {
            observer.disconnect();
            addRandomButton();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();