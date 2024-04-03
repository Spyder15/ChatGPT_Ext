chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getSelectedText') {
        const selectedText = window.getSelection().toString();
        sendResponse({ text: selectedText });
    }
});
