// Initial quotes. This array holds the application state.
let quotes = []; 
const SERVER_MOCK_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API for simulation

// Select DOM Elements
const filteredQuotesDisplay = document.getElementById('filteredQuotesDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const exportJsonButton = document.getElementById('exportJson');
const categoryFilter = document.getElementById('categoryFilter');

// Initialize sync status element (must be done on DOMContentLoaded, but declared globally)
const syncStatusElement = document.createElement('div');


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
    
    updateSyncStatus('Simulated server response received.');
    return serverQuotes;
}

/**
 * Simulates posting a new quote to the server. (NEW MOCK POST IMPLEMENTATION)
 * Returns a promise resolving after a simulated delay.
 */
async function postQuoteToServer(quoteObject) {
    updateSyncStatus('Simulating POST of new quote to server...', false);
    
    // Simulate network delay and server processing (0.5 - 1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); 
    
    updateSyncStatus('New quote successfully simulated POST to server.', false);
    return { status: 201, quote: quoteObject };
}


// ======================================================================
// Data Syncing and Conflict Resolution (Step 2 & 3)
// ======================================================================

function resolveConflicts(serverData) {
    const localQuotes = quotes;
    let resolvedCount = 0;
    
    // Simplified LWW: Server Precedence
    
    if (localQuotes.length !== serverData.length || localQuotes.some((q, i) => q.text !== serverData[i].text)) {
        // If there are any differences, overwrite local data with server data.
        quotes = serverData; 
        
        saveQuotes(); 
        populateCategories(); 
        updateSyncStatus(`Sync successful! Data updated from server (Server Precedence applied).`, false);
    } else {
        updateSyncStatus('Sync successful! Local data was already up to date.');
    }
}

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

/**
 * Adds a new quote, updates local storage, and attempts to POST to the server.
 */
async function addQuote() { // Made async to await postQuoteToServer
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please enter both quote text and category.");
        return;
    }

    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    
    // 1. Update local data
    quotes.push(newQuote);
    saveQuotes(); 

    // 2. Simulate POST to server (NEW LOGIC)
    try {
        await postQuoteToServer(newQuote);
    } catch (error) {
        updateSyncStatus(`Warning: Failed to POST new quote. Local save successful. Error: ${error.message}`, true);
    }
    
    // 3. Update UI
    populateCategories(); 
    filterQuotes(); 

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

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


// ======================================================================
// Initialization
// ======================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Setup sync status element
    const h1 = document.querySelector('h1');
    if (h1) h1.after(syncStatusElement);
    syncStatusElement.id = 'syncStatus';
    syncStatusElement.style.margin = '10px 0';
    syncStatusElement.style.padding = '5px';
    syncStatusElement.style.border = '1px dashed #FF6565';
    syncStatusElement.style.backgroundColor = '#ffe0e0';
    syncStatusElement.style.display = 'none';

    // 1. Load data from Local Storage
    loadQuotes(); 

    // 2. Populate the filter dropdown and restore the last filter preference
    populateCategories(); 
    
    // 3. Dynamically create the Add Quote form
    createAddQuoteForm();

    // 4. Attach event listeners
    newQuoteButton.addEventListener('click', showRandomQuote);
    exportJsonButton.addEventListener('click', exportToJson);
    categoryFilter.addEventListener('change', filterQuotes);

    // 5. Implement periodic data fetching/syncing
    syncData(); // Run once immediately on load
    setInterval(syncData, 30000); // Repeat sync every 30 seconds
    
    updateSyncStatus('Application initialized. Performing initial data sync.');
});