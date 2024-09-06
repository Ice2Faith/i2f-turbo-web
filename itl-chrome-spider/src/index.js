document.body.contentEditable = true;

// 创建一个panel
chrome.devtools.panels.create(
    "spider",
    null,
    "panel.html"
);