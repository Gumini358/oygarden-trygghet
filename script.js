
"use strict";

// Henter lagrede observasjoner fra localStorage
let reports = JSON.parse(
    localStorage.getItem("oygardenReports") || "[]"
);

// Henter skjemaet fra HTML
const reportForm = document.querySelector("#report-form");

 // Holder styr på hvilken observasjon som redigeres
let editingReportId = null;
// Henter knappen for å avbryte redigering
const cancelEditBtn = document.querySelector("#cancel-edit-btn");

// Viser lagrede observasjoner i konsollen
console.log("Lagrede observasjoner:", reports);

// Kontrollerer at skjemaet finnes
console.log("Skjema funnet:", reportForm !== null);

// Lytter etter innsending av skjemaet
reportForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newReport = {
        id : crypto.randomUUID(),
        title: document.querySelector("#report-title").value,
        location: document.querySelector("#report-location").value,
        category: document.querySelector("#report-category").value,
        description: document.querySelector("#report-description").value,
        timestamp: new Date().toISOString()
    };

    
    // Oppdaterer en observasjon eller legger til en ny
    if (editingReportId !== null) {

        reports = reports.map((report) => {
            if (report.id === editingReportId) {
                return {
                    ...report,
                    ...newReport,
                    id: editingReportId
                };
            }

            return report;
        });

        editingReportId = null;

    } else {
        reports.push(newReport);
    }

    // Lagrer observasjonene i localStorage
    localStorage.setItem(
        "oygardenReports",
        JSON.stringify(reports)
    );


    console.log("Ny observasjon lagt til:", newReport);
    
reportForm.reset();
cancelEditBtn.hidden = true;
displayReports();
});
 // Henter listen fra HTML
const reportsList = document.querySelector("#reports-list");

 // Henter filtrene fra HTML
const filterLocation = document.querySelector("#filter-location");
const filterCategory = document.querySelector("#filter-category");

 // Gjør brukerinput trygg før visning i HTML
// Henter sorteringsmenyen fra HTML
const sortReports = document.querySelector("#sort-reports");

function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

 // Beregner statistikk med reduce()
function updateStatistics() {

    const statistics = reports.reduce((total, report) => {

        total.all++;

        if (report.category === "Trafikkfare") {
            total.traffic++;
        }

        if (report.category === "Gatelys") {
            total.lights++;
        }

        return total;

    }, {
        all: 0,
        traffic: 0,
        lights: 0
    });

    // Viser statistikken på nettsiden
    document.querySelector("#total-reports").textContent =
        statistics.all;

    document.querySelector("#traffic-reports").textContent =
        statistics.traffic;

    document.querySelector("#light-reports").textContent =
        statistics.lights;
}

// Viser alle lagrede observasjoner
function displayReports() {
// Oppdaterer statistikken når listen vises
updateStatistics();
    // Leser valgte filterverdier
    const selectedLocation = filterLocation.value;
    const selectedCategory = filterCategory.value;

    // Filtrerer observasjoner etter sted og kategori
    const filteredReports = reports.filter((report) => {
        const matchesLocation =
            selectedLocation === "all" ||
            report.location === selectedLocation;

        const matchesCategory =
            selectedCategory === "all" ||
            report.category === selectedCategory;

        return matchesLocation && matchesCategory;
    });

    // Leser valgt sorteringsmetode
    const selectedSort = sortReports.value;

    // Sorterer de filtrerte observasjonene
    filteredReports.sort((a, b) => {
        switch (selectedSort) {
            case "newest":
                return new Date(b.timestamp) - new Date(a.timestamp);

            case "oldest":
                return new Date(a.timestamp) - new Date(b.timestamp);

            case "az":
                return a.title.localeCompare(b.title, "nb-NO");

            case "za":
                return b.title.localeCompare(a.title, "nb-NO");

            default:
                return 0;
        }
    });

    if (filteredReports.length === 0) {
        reportsList.textContent = "Ingen observasjoner registrert ennå.";
        return;
    }

    // Bruker map() og destructuring
    reportsList.innerHTML = filteredReports.map((report) => {

        const {
            title,
            location,
            category,
            description,
            timestamp
        } = report;

        return `
            <article class="report-card">
                <h3>${escapeHTML(title)}</h3>
               
<p><strong>Sted:</strong> ${escapeHTML(location)}</p>
<p><strong>Kategori:</strong> ${escapeHTML(category)}</p>
<p><strong>Beskrivelse:</strong> ${escapeHTML(description)}</p>

<p><strong>Dato:</strong> ${escapeHTML(new Date(timestamp).toLocaleDateString("nb-NO"))}</p>

<button
    type="button"
    class="delete-btn"
    data-id="${escapeHTML(report.id)}">
    Slett
</button>

<button
    type="button"
    class="edit-btn"
    data-id="${escapeHTML(report.id)}">
    Rediger
</button>

            </article>
        `;
    }).join("");
}

// Viser observasjonene når siden åpnes
displayReports();

 // Sletter en valgt observasjon
reportsList.addEventListener("click", function(event) {
    const deleteButton = event.target.closest(".delete-btn");

    if (!deleteButton) {
        return;
    }

    const reportId = deleteButton.dataset.id;

    // Ber brukeren bekrefte slettingen
    const confirmed = confirm(
        "Er du sikker på at du vil slette denne observasjonen?"
    );

    if (!confirmed) {
        return;
    }

    // Filtrerer bort den valgte observasjonen
    reports = reports.filter((report) => report.id === undefined
        ? false
        : report.id !== reportId
    );

    // Lagrer den oppdaterte listen
    localStorage.setItem("oygardenReports", JSON.stringify(reports));

    // Oppdaterer visningen
    displayReports();
});

 // Redigerer en eksisterende observasjon
reportsList.addEventListener("click", function(event) {
    const editButton = event.target.closest(".edit-btn");

    if (!editButton) {
        return;
    }

    const reportId = editButton.dataset.id;

    // Finner observasjonen som skal redigeres
    const report = reports.find((item) => item.id === reportId);

    if (!report) {
        return;
    }

 // Lagrer ID-en til observasjonen som redigeres
editingReportId = reportId;


    // Fyll// Viser knappen når brukeren redigerer
cancelEditBtn.hidden = false; // Viser knappen når brukeren redigerer
    // Fyller skjemaet med eksisterende informasjon
    document.querySelector("#report-title").value = report.title;
    document.querySelector("#report-location").value = report.location;
    document.querySelector("#report-category").value = report.category;
    document.querySelector("#report-description").value = report.description;

    // Flytter brukeren til skjemaet
    reportForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

 // Avbryter redigering av en observasjon
cancelEditBtn.addEventListener("click", function() {

    // Nullstiller redigeringsmodus
    editingReportId = null;

    // Tømmer skjemaet
    reportForm.reset();

    // Skjuler avbryt-knappen
    cancelEditBtn.hidden = true;

    console.log("Redigering avbrutt");
});

 // Oppdaterer listen når brukeren endrer filtrene
filterLocation.addEventListener("change", displayReports);
filterCategory.addEventListener("change", displayReports);
// Oppdaterer listen når sorteringen endres
sortReports.addEventListener("change", displayReports);


 // Sletter alle lagrede observasjoner
const deleteAllBtn = document.querySelector("#delete-all-btn");

deleteAllBtn.addEventListener("click", function() {

    // Sjekker om det finnes observasjoner
    if (reports.length === 0) {
        alert("Det finnes ingen observasjoner å slette.");
        return;
    }

    // Ber brukeren bekrefte slettingen
    const confirmed = confirm(
        "Er du sikker på at du vil slette ALLE observasjoner?"
    );

    if (!confirmed) {
        return;
    }

    // Tømmer listen med observasjoner
    reports = [];

    // Lagrer den tomme listen i localStorage
    localStorage.setItem(
        "oygardenReports",
        JSON.stringify(reports)
    );

    // Avslutter eventuell redigering
    editingReportId = null;
    reportForm.reset();
    cancelEditBtn.hidden = true;

    // Oppdaterer listen og statistikken
    displayReports();
    updateStatistics();

    console.log("Alle observasjoner er slettet.");
});
