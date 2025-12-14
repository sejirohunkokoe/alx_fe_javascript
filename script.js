// Step 2: Manage an array of quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "JavaScript is the future of web development.", category: "Technology" }
];

// Select DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');

/**
 * Displays a random quote from the quotes array in the DOM.
 */
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available.</p>';
        return;
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Create and style the quote elements
    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${quote.text}"`;

    const quoteCategory = document.createElement('p');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `Category: ${quote.category}`;

    // Clear previous quote and append new elements
    quoteDisplay.innerHTML = '';
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
}

/**
 * Dynamically creates and injects the 'Add Quote' form into the DOM.
 */
function createAddQuoteForm() {
    // Check if the form already exists to prevent duplication
    if (document.getElementById('addQuoteForm')) {
        return;
    }

    const formDiv = document.createElement('div');
    formDiv.id = 'addQuoteForm';

    // 1. Quote Text Input
    const textInput = document.createElement('input');
    textInput.id = 'newQuoteText';
    textInput.type = 'text';
    textInput.placeholder = 'Enter a new quote';
    
    // 2. Category Input
    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    // 3. Add Button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    // Attach the addQuote function directly as an event listener
    addButton.addEventListener('click', addQuote); 

    // Append elements to the form container
    formDiv.appendChild(textInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);

    // Append the entire form to the designated container
    formContainer.appendChild(formDiv);
}

/**
 * Adds a new quote to the array and updates the DOM dynamically.
 * This function is called by the dynamically generated 'Add Quote' button.
 */
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText === "") {
        alert("Please enter quote text.");
        return;
    }
    if (newQuoteCategory === "") {
        alert("Please enter a category.");
        return;
    }

    // 1. Update the JavaScript array
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };
    quotes.push(newQuote);

    // 2. Update the DOM (Clear inputs and show feedback)
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    alert(`New Quote added to category: ${newQuoteCategory}`);
    
    // Optional: Show the newly added quote immediately
    showRandomQuote();
}


// --- Initialization and Event Listeners ---

document.addEventListener('DOMContentLoaded', function() {
    // 1. Show an initial quote on page load
    showRandomQuote();
    
    // 2. Dynamically create the Add Quote form
    createAddQuoteForm();

    // 3. Attach event listener to the "Show New Quote" button
    newQuoteButton.addEventListener('click', showRandomQuote);
});