// Initial quotes. This array holds the application state.
let quotes = []; 

// Select DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay'); // No longer used for single quote, but for reference
const filteredQuotesDisplay = document.getElementById('filteredQuotesDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const exportJsonButton = document.getElementById('exportJson');
const categoryFilter = document.getElementById('categoryFilter'); // New element

// ======================================================================
// Helper Functions for Web Storage (Updated)
// ======================================================================

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } 
    // If empty, the array remains the initial empty array.
}

/**
 * Saves the currently selected filter category to Local Storage.
 * @param {string} category - The category value selected in the dropdown.
 */
function saveFilterPreference(category) {
    // Step 2: Remember the Last Selected Filter
    localStorage.setItem('lastFilter', category);
}

/**
 * Retrieves the last selected filter category from Local Storage.
 * @returns {string} The last saved filter, or 'all' if none is found.
 */
function loadFilterPreference() {
    return localStorage.getItem('lastFilter') || 'all';
}

// ======================================================================
// Category Management and Filtering Logic
// ======================================================================

/**
 * Step 2: Populate Categories Dynamically
 * Extracts unique categories and updates the dropdown menu.
 */
function populateCategories() {
    const categories = quotes.map(quote => quote.category);
    const uniqueCategories = ['all', ...new Set(categories)];

    categoryFilter.innerHTML = ''; // Clear existing options

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    // Step 2: Restore the last selected filter after population
    const lastFilter = loadFilterPreference();
    categoryFilter.value = lastFilter;
    
    // Apply the filter immediately to show the stored results
    filterQuotes();
}

/**
 * Step 2: Filter Quotes Based on Selected Category
 * Filters the quotes array and updates the DOM list.
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    saveFilterPreference(selectedCategory); // Save the new preference

    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    // Update the filtered quotes display area
    const ul = document.createElement('ul');
    filteredQuotesDisplay.innerHTML = ''; // Clear previous results

    if (filteredQuotes.length === 0) {
        filteredQuotesDisplay.innerHTML = `<p>No quotes found for category: ${selectedCategory}.</p>`;
        return;
    }
    
    // Display each filtered quote as a list item
    filteredQuotes.forEach(quote => {
        const li = document.createElement('li');
        li.textContent = `"${quote.text}" - (${quote.category})`;
        ul.appendChild(li);
    });

    filteredQuotesDisplay.appendChild(ul);
}

/**
 * Displays a single random quote from the currently filtered set.
 */
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
    
    // Instead of using the dedicated quoteDisplay area, we'll use an alert 
    // for simplicity or create a temporary element near the button.
    alert(`Random Quote (${quote.category}): "${quote.text}"`);
    
    // This part is mainly for demonstration, as the primary display is now the filtered list.
}


// ======================================================================
// Add/Import/Export Functions (Modified)
// ======================================================================

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
    
    // Step 3: Update Web Storage with Category Data & Repopulate
    populateCategories(); // Regenerates dropdown with the new category (if applicable)
    filterQuotes(); // Updates the filtered list

    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    alert(`New Quote added successfully!`);
}

function exportToJson() {
    // (Function body remains the same)
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
    alert('Quotes exported successfully!');
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                
                saveQuotes(); // Update Local Storage
                populateCategories(); // Update categories and filter
                
                alert(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                alert('Error: Imported file does not contain a valid JSON array.');
            }
        } catch (e) {
            alert('Error parsing JSON file: ' + e.message);
        }
    };
    
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}


function createAddQuoteForm() {
    // (Function body remains the same, creating inputs and button)
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
    // 1. Load data from Local Storage first
    loadQuotes(); 

    // 2. Populate the filter dropdown and restore the last filter preference
    populateCategories(); 
    
    // 3. Dynamically create the Add Quote form
    createAddQuoteForm();

    // 4. Attach event listeners (export button is attached globally via ID)
    newQuoteButton.addEventListener('click', showRandomQuote);
    exportJsonButton.addEventListener('click', exportToJson);
});