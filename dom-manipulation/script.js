// Initial quotes. This will only be used if Local Storage is empty.
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "JavaScript is key to dynamic web pages.", category: "Technology" }
];

// Select DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const exportJsonButton = document.getElementById('exportJson');

// ======================================================================
// Helper Functions for Web Storage
// ======================================================================

/**
 * Saves the current quotes array to Local Storage.
 */
function saveQuotes() {
    // Step 1: Using Local Storage - Save quotes
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Loads quotes from Local Storage on initialization.
 */
function loadQuotes() {
    // Step 1: Using Local Storage - Load existing quotes
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // If Local Storage is empty, save the initial array
        saveQuotes();
    }
}

/**
 * Demonstrates Session Storage by tracking the last viewed quote.
 */
function setLastViewedQuote(quoteText) {
    // Step 1: Using Session Storage (Optional)
    sessionStorage.setItem('lastQuote', quoteText);
}

// ======================================================================
// Core Quote Display Functions
// ======================================================================

function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Add one!</p>';
        setLastViewedQuote('No quotes');
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${quote.text}"`;

    const quoteCategory = document.createElement('p');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `Category: ${quote.category}`;

    quoteDisplay.innerHTML = '';
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);

    // Update Session Storage with the quote text
    setLastViewedQuote(quote.text);
}

function createAddQuoteForm() {
    // (Function body remains the same as previous task, creating inputs and button)
    if (document.getElementById('addQuoteForm')) {
        return;
    }

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

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please enter both quote text and category.");
        return;
    }

    // 1. Update the JavaScript array
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };
    quotes.push(newQuote);

    // 2. Update Local Storage
    saveQuotes(); // Modified to save after adding

    // 3. Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    alert(`New Quote added successfully!`);
    showRandomQuote();
}

// ======================================================================
// JSON Import and Export Functions
// ======================================================================

/**
 * Exports the current quotes array to a downloadable JSON file.
 */
function exportToJson() {
    // Step 2: Implement JSON Export
    const dataStr = JSON.stringify(quotes, null, 2); // null, 2 for pretty printing
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a temporary link element
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    
    // Programmatically click the link to trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Quotes exported successfully!');
}

/**
 * Imports quotes from an uploaded JSON file.
 */
function importFromJsonFile(event) {
    // Step 2: Implement JSON Import
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Basic validation to ensure imported data is an array
            if (Array.isArray(importedQuotes)) {
                // Add imported quotes to the existing array
                quotes.push(...importedQuotes);
                
                // Update Local Storage
                saveQuotes();
                
                showRandomQuote(); // Display a quote from the updated list
                alert(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                alert('Error: Imported file does not contain a valid JSON array.');
            }
        } catch (e) {
            alert('Error parsing JSON file: ' + e.message);
        }
    };
    
    // Check if a file was selected
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}


// ======================================================================
// Initialization
// ======================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 1. Load quotes from Local Storage on startup
    loadQuotes(); 

    // 2. Show an initial quote
    showRandomQuote();
    
    // 3. Dynamically create the Add Quote form
    createAddQuoteForm();

    // 4. Attach event listeners
    newQuoteButton.addEventListener('click', showRandomQuote);
    exportJsonButton.addEventListener('click', exportToJson);
});