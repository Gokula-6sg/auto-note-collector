chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveNote",
        title: "Save to Notes",
        contexts: ["selection"] // Only when text is selected
    });
});


chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "saveNote") {
        let note = {
            text: info.selectionText,
            url: info.pageUrl,
            date: new Date().toLocaleString()
        };


        chrome.storage.local.get({ notes: [] }, (data) => {
            data.notes.push(note);
            chrome.storage.local.set({ notes: data.notes });
        });
    }
});
