

chrome.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, url }) => {
    chrome.scripting.executeScript({
        target: { tabId },
        files: ['jquery-1.10.2.min.js','hack.js'],
    });
});