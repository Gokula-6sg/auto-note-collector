let container = document.getElementById("notes");
let searchInput = document.getElementById("search");
let clearBtn = document.getElementById("clearBtn");
let exportTxtBtn = document.getElementById("exportTxtBtn");
let exportCsvBtn = document.getElementById("exportCsvBtn");
let darkModeBtn = document.getElementById("darkModeBtn");

// Add Export Selected button dynamically
let exportSelectedBtn = document.createElement("button");
exportSelectedBtn.textContent = "Export Selected";
exportSelectedBtn.style.marginTop = "8px";
exportSelectedBtn.style.width = "100%";
exportSelectedBtn.style.padding = "6px";
exportSelectedBtn.style.borderRadius = "6px";
exportSelectedBtn.style.cursor = "pointer";
container.parentNode.insertBefore(exportSelectedBtn, container.nextSibling);

// Load notes with checkboxes
function loadNotes(filter = "") {
    chrome.storage.local.get({ notes: [] }, (data) => {
        container.innerHTML = "";
        let filtered = data.notes.filter(note =>
            note.text.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = "<p style='text-align:center;color:gray;'>No notes found.</p>";
            return;
        }

        filtered.forEach((note, index) => {
            let div = document.createElement("div");
            div.className = "note";
            div.innerHTML = `
                <input type="checkbox" class="note-checkbox" data-index="${index}" style="margin-right:6px;">
                <span>${note.text}</span>
                <br>
                <small><a href="${note.url}" target="_blank">Source</a> | ${note.date}</small>
                <button class="delete-btn" data-index="${index}" style="float:right;margin-top:-28px;">Delete</button>
            `;
            container.appendChild(div);
        });

        // Delete button logic
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                let idx = parseInt(e.target.getAttribute("data-index"));
                data.notes.splice(idx, 1);
                chrome.storage.local.set({ notes: data.notes }, () => {
                    loadNotes(searchInput.value);
                });
            });
        });
    });
}

// Search
searchInput.addEventListener("input", () => loadNotes(searchInput.value));

// Clear All
clearBtn.addEventListener("click", () => {
    chrome.storage.local.set({ notes: [] }, () => loadNotes());
});

// Export TXT
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

// Export CSV
exportCsvBtn.addEventListener("click", () => {
    chrome.storage.local.get({ notes: [] }, (data) => {
        let rows = [["Note","URL","Date"]];
        data.notes.forEach(n => rows.push([n.text, n.url, n.date]));
        let csv = rows.map(r => r.map(v => `"${v.replace(/"/g,'""')}"`).join(",")).join("\n");
        let blob = new Blob([csv], {type:"text/csv"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "notes.csv";
        a.click();
        URL.revokeObjectURL(url);
    });
});

// Export Selected Notes
exportSelectedBtn.addEventListener("click", () => {
    chrome.storage.local.get({ notes: [] }, (data) => {
        let selectedNotes = [];
        document.querySelectorAll(".note-checkbox").forEach(cb => {
            if (cb.checked) selectedNotes.push(data.notes[cb.getAttribute("data-index")]);
        });

        if (selectedNotes.length === 0) {
            alert("Please select at least one note to export!");
            return;
        }

        let content = selectedNotes.map(n => `${n.text} [${n.url}] (${n.date})`).join("\n\n");
        let blob = new Blob([content], { type: "text/plain" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "selected_notes.txt";
        a.click();
        URL.revokeObjectURL(url);
    });
});

// Dark Mode toggle
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// Initial Load
loadNotes();
