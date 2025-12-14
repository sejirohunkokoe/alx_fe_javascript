// Initial quotes. This array holds the application state.
let quotes = []; 
const SERVER_MOCK_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API for simulation

// Select DOM Elements
const filteredQuotesDisplay = document.getElementById('filteredQuotesDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const exportJsonButton = document.getElementById('exportJson');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatusElement = document.createElement('div'); // New element for status/notifications

// Append the new status element near the top
document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1');
    if (h1) h1.after(syncStatusElement);
    syncStatusElement.id = 'syncStatus';
    syncStatusElement.style.margin = '10px 0';
    syncStatusElement.style.padding = '5px';
    syncStatusElement.style.border = '1px dashed #FF6565';
    syncStatusElement.style.backgroundColor = '#ffe0e0';
    syncStatusElement.style.display = 'none';
});


// ======================================================================
// Helper Functions for Web Storage & UI
// ======================================================================

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

function saveFilterPreference(category) {
    localStorage.setItem('lastFilter', category);
}

function loadFilterPreference() {
    return localStorage.getItem('lastFilter') || 'all';
}

/**
 * Displays a status message to the user.
 * @param {string} message - The message to display.
 * @param {boolean} isError - If true, style as an error.
 */
function updateSyncStatus(message, isError = false) {
    syncStatusElement.textContent = message;
    syncStatusElement.style.display = 'block';
    syncStatusElement.style.backgroundColor = isError ? '#ffe0e0' : '#e0ffe0';
    syncStatusElement.style.borderColor = isError ? '#FF6565' : '#00a000';
    
    // Hide after 5 seconds
    setTimeout(() => {
        syncStatusElement.style.display = 'none';
    }, 5000);
}

// ======================================================================
// Server Simulation (Step 1)
// ======================================================================

/**
 * Simulates fetching quote data from a server.
 * Returns a promise resolving with a mock quotes array.
 */
async function fetchQuotesFromServer() {
    updateSyncStatus('Simulating server check...');
    
    // Simulate network delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); 

    // Mock data that the server might hold (could be different from local)
    const serverQuotes = [
        { text: "Server: Consistency is the highest virtue of programming.", category: "Technology" },
        { text: "Server: The only constant in life is change.", category: "Philosophy" },
        { text: "Server: Conflict resolution requires communication.", category: "Life" }
    ];

    // Note: In a real app, this would be an actual fetch call:
    // const response = await fetch(SERVER_MOCK_URL);
    // const data = await response.json();
    
    updateSyncStatus('Simulated server response received.');
    return serverQuotes;
}

// ======================================================================
// Data Syncing and Conflict Resolution (Step 2 & 3)
// ======================================================================

/**
 * Syncs local data with server data using the Last-Write-Wins (Server Precedence) strategy.
 * @param {Array} serverData - The array of quotes received from the server.
 */
function resolveConflicts(serverData) {
    const localQuotes = quotes;
    let mergedQuotes = [...localQuotes];
    let resolvedCount = 0;
    
    // Simplified LWW: Assume server data is always newer/correct and overwrite local
    
    // 1. Identify unique texts in the local array
    const localTexts = new Set(localQuotes.map(q => q.text));
    
    // 2. Add server quotes that do not exist locally
    serverData.forEach(serverQuote => {
        if (!localTexts.has(serverQuote.text)) {
            mergedQuotes.push(serverQuote);
            resolvedCount++;
        }
        // Note: For real LWW, you'd compare timestamps (which we mock here).
        // Since server data takes precedence, if the texts match, we assume the server's version is better.
    });

    if (resolvedCount > 0 || localQuotes.length !== mergedQuotes.length) {
        // If there were any changes or merges, the server's data is now the base.
        quotes = serverData; // Simulating server precedence by making server data the new source.
        
        saveQuotes(); // Persist the new server-merged data locally
        populateCategories(); // Update UI
        updateSyncStatus(`Sync successful! ${resolvedCount} new item(s) merged from server.`, false);
    } else {
        updateSyncStatus('Sync successful! Local data was already up to date.');
    }
}

/**
 * Periodically checks the server for updates and syncs data.
 */
async function syncData() {
    try {
        const serverQuotes = await fetchQuotesFromServer();
        resolveConflicts(serverQuotes);
    } catch (error) {
        updateSyncStatus(`Sync failed: ${error.message}. Using local data.`, true);
    }
}

// ======================================================================
// UI Logic (Populate, Filter, Add, Export, Import)
// ======================================================================

function populateCategories() {
    const categories = quotes.map(quote => quote.category);
    const uniqueCategories = ['all', ...new Set(categories)];

    categoryFilter.innerHTML = ''; 

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    const lastFilter = loadFilterPreference();
    categoryFilter.value = lastFilter;
    
    filterQuotes();
}

function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    saveFilterPreference(selectedCategory); 

    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    const ul = document.createElement('ul');
    filteredQuotesDisplay.innerHTML = ''; 

    if (filteredQuotes.length === 0) {
        filteredQuotesDisplay.innerHTML = `<p>No quotes found for category: ${selectedCategory}.</p>`;
        return;
    }
    
    filteredQuotes.forEach(quote => {
        const li = document.createElement('li');
        li.textContent = `"${quote.text}" - (${quote.category})`;
        ul.appendChild(li);
    });

    filteredQuotesDisplay.appendChild(ul);
}

function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let quotesToDrawFrom = quotes;
    
    if (selectedCategory !== 'all') {
        quotesToDrawFrom = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (quotesToDrawFrom.length === 0) {
        alert(`No quotes available in category: ${selectedCategory}.`);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotesToDrawFrom.length);
    const quote = quotesToDrawFrom[randomIndex];
    
    alert(`Random Quote (${quote.category}): "${quote.text}"`);
}

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please enter both quote text and category.");
        return;
    }

    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);

    saveQuotes(); // Update Local Storage
    
    // Note: In a real app, we would also POST this new quote to the server here.
    
    populateCategories(); 
    filterQuotes(); 

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    updateSyncStatus('Quote added locally. Syncing soon...');
}

// JSON handling functions (Export/Import bodies remain the same)
function exportToJson() { /* ... body remains the same ... */ }
function importFromJsonFile(event) { /* ... body remains the same ... */ }
function createAddQuoteForm() { /* ... body remains the same ... */ }


// ======================================================================
// Initialization
// ======================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 1. Load data from Local Storage first
    loadQuotes(); 

    // 2. Populate the filter dropdown and restore the last filter preference
    populateCategories(); 
    
    // 3. Dynamically create the Add Quote form
    createAddQuoteForm();

    // 4. Attach event listeners
    newQuoteButton.addEventListener('click', showRandomQuote);
    exportJsonButton.addEventListener('click', exportToJson);
    categoryFilter.addEventListener('change', filterQuotes);

    // Step 1 & 2: Implement periodic data fetching/syncing (Every 30 seconds)
    syncData(); // Run once immediately on load
    setInterval(syncData, 30000); // Repeat sync every 30 seconds
    
    updateSyncStatus('Application initialized. Performing initial data sync.');
});

// Since the JSON functions were not provided in the prompt, include the boilerplate here 
// to ensure the final script.js is complete and functional.

function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    updateSyncStatus('Quotes exported successfully!');
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                updateSyncStatus(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                updateSyncStatus('Error: Imported file does not contain a valid JSON array.', true);
            }
        } catch (e) {
            updateSyncStatus('Error parsing JSON file: ' + e.message, true);
        }
    };
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}

function createAddQuoteForm() {
    if (document.getElementById('addQuoteForm')) return;
    const formDiv = document.createElement('div');
    formDiv.id = 'addQuoteForm';
    const textInput = document.createElement('input');
    textInput.id = 'newQuoteText';
    textInput.type = 'text';
    textInput.placeholder = 'Enter a new quote';
    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote); 
    formDiv.appendChild(textInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);
    formContainer.appendChild(formDiv);
}