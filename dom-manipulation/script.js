// Initial quotes. This array holds the application state.
let quotes = []; 
const SERVER_MOCK_URL = 'https://jsonplaceholder.typicode.com/posts'; 

// Select DOM Elements
const filteredQuotesDisplay = document.getElementById('filteredQuotesDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const exportJsonButton = document.getElementById('exportJson');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatusElement = document.createElement('div'); // UI element for Task 3 notifications


// ======================================================================
// Helper Functions for Web Storage & UI
// ======================================================================

function saveQuotes() {
    // Task 1: Using Local Storage - Save quotes
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    // Task 1: Using Local Storage - Load quotes
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

function saveFilterPreference(category) {
    // Task 2: Remember the Last Selected Filter
    localStorage.setItem('lastFilter', category);
}

function loadFilterPreference() {
    // Task 2: Load the Last Selected Filter
    return localStorage.getItem('lastFilter') || 'all';
}

/**
 * Displays a status message to the user. (Task 3: UI Notifications)
 */
function updateSyncStatus(message, isError = false) {
    // Check for UI elements or notifications for data updates or conflicts
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
// Server Simulation (Task 3)
// ======================================================================

/**
 * Simulates fetching quote data from a server.
 */
async function fetchQuotesFromServer() {
    updateSyncStatus('Simulating server check...');
    
    // Simulate network delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); 

    // Mock data that the server might hold 
    const serverQuotes = [
        { text: "Server: Consistency is the highest virtue of programming.", category: "Technology" },
        { text: "Server: The only constant in life is change.", category: "Philosophy" },
        { text: "Server: Conflict resolution requires communication.", category: "Life" }
    ];
    
    updateSyncStatus('Simulated server response received.');
    return serverQuotes;
}

/**
 * Simulates posting a new quote to the server. (Mock POST API)
 */
async function postQuoteToServer(quoteObject) {
    updateSyncStatus('Simulating POST of new quote to server...', false);
    
    // Simulate network delay and server processing (0.5 - 1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); 

    // --- REAL FETCH IMPLEMENTATION (FOR REFERENCE) ---
    /*
    // Demonstrates method, headers, and Content-Type for a real POST request:
    await fetch(SERVER_MOCK_URL, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(quoteObject) 
    });
    */
    // --- END REAL FETCH IMPLEMENTATION ---
    
    updateSyncStatus('New quote successfully simulated POST to server.', false);
    return { status: 201, quote: quoteObject };
}


// ======================================================================
// Data Syncing and Conflict Resolution (Task 3)
// ======================================================================

/**
 * Implements Conflict Resolution: Server's data takes precedence.
 */
function resolveConflicts(serverData) {
    // Check for updating local storage with server data and conflict resolution
    const localQuotes = quotes;
    
    // Simple check for data difference
    if (localQuotes.length !== serverData.length || localQuotes.some((q, i) => q.text !== serverData[i].text)) {
        
        // Conflict Resolution: Overwrite local data with server data.
        quotes = serverData; 
        
        saveQuotes(); // Update local storage with the new server data
        populateCategories(); // Update UI with new categories/filter results
        
        // --- UPDATED HERE ---
        updateSyncStatus("Quotes synced with server!", false);
        
    } else {
        updateSyncStatus('Sync successful! Local data was already up to date.');
    }
}

/**
 * **RENAMED:** The primary function to sync quotes data. (Check for the syncQuotes function)
 */
async function syncQuotes() {
    try {
        const serverQuotes = await fetchQuotesFromServer();
        resolveConflicts(serverQuotes);
    } catch (error) {
        updateSyncStatus(`Sync failed: ${error.message}. Using local data.`, true);
    }
}


// ======================================================================
// Quote Management and UI Logic (Task 0, 1, & 2)
//