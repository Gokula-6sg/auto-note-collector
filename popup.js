let container = document.getElementById("notes");
let searchInput = document.getElementById("search");
let clearBtn = document.getElementById("clearBtn");
let exportTxtBtn = document.getElementById("exportTxtBtn");
let exportCsvBtn = document.getElementById("exportCsvBtn");


function loadNotes(filter = "") {
    chrome.storage.local.get({ notes: [] }, (data) => {
        container.innerHTML = "";
        let filtered = data.notes.filter(note =>
            note.text.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = "<p>No notes found.</p>";
            return;
        }

        filtered.forEach(note => {
            let div = document.createElement("div");
            div.className = "note";
            div.innerHTML = `
        <p>${note.text}</p>
        <small><a href="${note.url}" target="_blank">Source</a> | ${note.date}</small>
      `;
            container.appendChild(div);
        });
    });
}


searchInput.addEventListener("input", () => {
    loadNotes(searchInput.value);
});


clearBtn.addEventListener("click", () => {
    chrome.storage.local.set({ notes: [] }, () => {
        loadNotes();
    });
});


exportTxtBtn.addEventListener("click", () => {
    chrome.storage.local.get({ notes: [] }, (data) => {
        let content = data.notes.map(n => `${n.text} [${n.url}] (${n.date})`).join("\n\n");
        let blob = new Blob([content], { type: "text/plain" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "notes.txt";
        a.click();

        URL.revokeObjectURL(url);
    });
});


exportCsvBtn.addEventListener("click", () => {
    chrome.storage.local.get({ notes: [] }, (data) => {
        let rows = [["Note", "URL", "Date"]]; // header
        data.notes.forEach(n => rows.push([n.text, n.url, n.date]));

        let csvContent = rows.map(row =>
            row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")
        ).join("\n");

        let blob = new Blob([csvContent], { type: "text/csv" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "notes.csv";
        a.click();

        URL.revokeObjectURL(url);
    });
});


loadNotes();
