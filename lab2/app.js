// function to get data from data.json
/**
 * function to get data from a data.json
 * @returns all data about books from a data.json
 */
/*
async function getData(){
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}
*/

// function to get data from database
/**
 * function to get data from database. is done firstly to get the genres for <select> element
 * @returns  a list of genres
 */
async function getGenresFirst(){
    const response = await fetch("http://127.0.0.1:8000/books/genres", {method: "GET"})
    const data = await response.json();
    return data;
}


// element arrow --> to filter needed books by user 
const searchBooks = document.getElementById('SearchP');

const selectGenre = document.querySelector('select');
const selectYear = document.getElementById('yearInput');
const selectRating = document.getElementById('ratingInput');

// apply only when the the whole page is loaded
// otherwise - error
window.addEventListener('DOMContentLoaded', () => {

    // may only use numbers in number inputs
    [selectYear, selectRating].forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');
        });
    });

});

let allBooks = [];
let rowSelected = null;
let bookIdSelected = null;

let sortYearAsc = true;
let sortRatingAsc = true;

const tableBooks = document.querySelector('table');

// filter and then show selected books
/**
 * Shows books in the table. Sorts books by year, rating when the arrows near Year, Rating are pressed (in the table)
 * @param {*} sortField - sort by Year / Rating
 * @param {*} ascending - Sort to ascending / descending order
 */
async function showBooks(sortField = null, ascending = true){

    // fill in table header
    tableBooks.innerHTML = `
        <tr>
            <th>N</th>
            <th>Title</th>
            <th>Author</th>
            <th>Year <span id="sortYear">${ascending && sortField === 'year' ? '&#8595;' : '&#8593;'}</span></th>
            <th>Genre</th>
            <th>Rating <span id="sortRating">${ascending && sortField === 'rating' ? '&#8595;' : '&#8593;'}</span></th>
        </tr>
    `;
    // if ascending is true and sortField is '_' - arrow down
    // otherwise - arrow up
    // &#8593;  - arrow up
    // &#8595;  - arrow down 

    /*
    // filter
    const genre = selectGenre.value;
    const year = selectYear.value;
    const rating = selectRating.value;

    // when goint to http server - already get filtered books as a result

    const filteredBooks = allBooks.filter(book => {
        const matchGenre = genre === 'all' || book.genre.toLowerCase() === genre;
        const matchYear = year === '' || String(book.year) === year;
        const matchRating = rating === '' || String(book.rating) === rating;

        return matchGenre && matchYear && matchRating;
    });

    */

    const filteredBooks = allBooks;
    console.log(filteredBooks);

    // sort the selected books by year / rating
    if (sortField) {
        filteredBooks.sort((a, b) => {
        if (ascending) return a[sortField] - b[sortField];
        else return b[sortField] - a[sortField];
        });
    }

    // show results - fill in the table
    /*
    if (filteredBooks.length === 0) {
        const row = document.createElement('tr');

        row.innerHTML = `
        <td colspan='6'>
            За запитом не знайдено книжок.
        </td>
        `
        tableBooks.appendChild(row);
        return
    }
        else {}
            // else intil the event listeners
    */
    
        filteredBooks.forEach((book, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>${book.genre}</td>
                <td>${book.rating}</td>
            `;

            // ads id to each book
            // to be able to select that data by id
            row.dataset.bookId = book.id;

            // event listener to the rows (to be able to select row)
            row.addEventListener('click' , () =>{
                document.querySelectorAll('table tr').forEach(r => r.classList.remove('selectedRow'));

                row.classList.add('selectedRow');

                rowSelected = row;
                bookIdSelected = book.id;

                console.log(rowSelected);

                // for change option:
                // when selecting a row - add text to the inputs for edit
                const form = document.querySelector('form');
                if (form && selectedOption === changeDataOption) {
                    const titleInput = document.getElementById('tittleAdd');
                    const authorInput = document.getElementById('authorAdd');
                    const yearInput = document.getElementById('yearAdd');
                    const genreInput = document.getElementById('genreAdd');
                    const ratingInput = document.getElementById('ratingAdd');

                    titleInput.value = book.title;
                    authorInput.value = book.author;
                    yearInput.value = book.year;
                    genreInput.value = book.genre;
                    ratingInput.value = book.rating;
                }
            })

            tableBooks.appendChild(row);
            
        });
    
    
    
    
    // events for arrows in <span>
    document.getElementById('sortYear').addEventListener('click', () => {
        sortYearAsc = !sortYearAsc;
        showBooks('year', sortYearAsc);
    });

    document.getElementById('sortRating').addEventListener('click', () => {
        sortRatingAsc = !sortRatingAsc;
        showBooks('rating', sortRatingAsc);
    });

}

/**
 * function to get books in the search by genre, year, rating values
 * @param {string} genre 
 * @param {int} year 
 * @param {int} rating 
 */
async function requestSelect(genre, year, rating){
    const params = new URLSearchParams();
    if (genre && genre !== "All") params.set("genre", genre);
    if (!Number.isNaN(year)) params.set("year", String(year));
    if (!Number.isNaN(rating)) params.set("rating", String(rating));

    
    const url = "http://127.0.0.1:8000/books" + (params.toString() ? ("?" + params.toString()) : "");
    console.log(url);

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        // handle HTTP errors
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${text}`);
    }

    const data = await response.json(); // await here gives parsed JSON
    return data;
}




// arrow in search field
searchBooks.addEventListener('click', async ()=> {
    const genre = selectGenre.value || "";              // string
    let year = parseInt(selectYear.value, 10);         // int or NaN
    let rating = parseInt(selectRating.value, 10);     // int or NaN

    console.log(genre);
    
    // Validate using Number.isNaN
    if (Number.isNaN(year) && Number.isNaN(rating)) {
    // If both are NaN, you may want to treat them as "no filter" rather than an error.
    // We'll proceed to request without those filters.
        year = NaN;
        rating = NaN;
    }

    if (!Number.isNaN(year) && (year > 2050 || year < 0)) {
        showMessage("Incorrect value: Year must be in [0; 2050]");
        return;
    }
    if (!Number.isNaN(rating) && (rating > 5 || rating < 1)) {
        showMessage("Incorrect value: Rating must be in [1; 5]");
        return;
    }

    //console.log('genre:')
    //console.log(genre);

    try {
    // Await the promise — this is the key fix
        allBooks = await requestSelect(genre, year, rating);

        // Now allBooks is the actual JSON (array), not a Promise
        showBooks();
    } catch (err) {
        // network / parsing / server errors
        console.error(err);
        showMessage("Failed to fetch books: " + err.message);
    }

});

// firstly load all books available
/*
getData().then((data) => {
    console.log("http:");
    console.log(data);

    allBooks = data;

    selectGenresOptions(allBooks);
});
*/


getGenresFirst().then(data => {
    console.log(data);
    selectGenresOptions2(data);
})


// function to get all unique genres and add it to the  select genre 
// from a .json
/*
function selectGenresOptions(books){
    // all option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    selectGenre.appendChild(allOption);
    
    // get all genres 
    const genres = books.map(function (book) { return book.genre.trim();})

    // get onlu unique values
    const uniqueGenres = new Set(genres);

    // create option for each genre
    uniqueGenres.forEach(genre =>{
            const option = document.createElement('option');
            option.value = genre.toLowerCase();

            // make the first letter be Caps
            const genreText = genre.charAt(0).toUpperCase() + genre.slice(1);
            option.textContent = genreText;

            selectGenre.appendChild(option);
        }
    );
    
}
*/
// from backend server
/**
 * function to get all unique genres and add it to the 'select' element.
 * get genres from backend 
 * @param {*} genresList - a list of genres from backend
 */
function selectGenresOptions2(genresList){
    // all option
    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All';
    selectGenre.appendChild(allOption);

    // get onlu unique values
    const uniqueGenres = new Set(genresList);

    // create option for each genre
    uniqueGenres.forEach(genre =>{
            //console.log('genres from the catch');
            //console.log(genre);
            const option = document.createElement('option');
            option.value = genre;

            // make the first letter be Caps
            //const genreText = genre.charAt(0).toUpperCase() + genre.slice(1);
            option.textContent = genre;

            selectGenre.appendChild(option);
        }
    );
    
}











//const changeDiv = document.getElementById('ChangeDataDiv');
// options to read only, change data about books, add new book;
const readOnlyOption = document.getElementById('ReadOnly');
const changeDataOption = document.getElementById('ChangeData');
const addNewOption = document.getElementById('AddNew');
const deleteOption = document.getElementById('DeleteRow');

const options = [readOnlyOption, changeDataOption, addNewOption, deleteOption];
let selectedOption = null;

// event listener to all options

options.forEach(option => {
    option.addEventListener('click', () => {

        // when clicking on not selected option - clear all options 
        if(option.className !== 'selected') {
            options.forEach(option =>{
                option.className = '';
            })

            // and apply to selected option
            option.className = 'selected';
            selectedOption = option;

            if(selectedOption == deleteOption) {
                const formForBooks = document.querySelector('form');
                if(formForBooks) formForBooks.remove();
                return;
            } 
            
        }

        optionAction(option);
});
});


// read only option 

// change data option - can change data in the table, save it to 'allBooks' array or delete book
// when deleting - need to check if a table row is selected


// add new option - creates a blank row, where user can add info and then 
// save to 'allBooks' array
// or cancel


// events for each option
async function optionAction(option){
    
    // delete form if exist
    const formForBooks = document.getElementById('bookEditForm');
    if(formForBooks) formForBooks.remove();

    // get inputs

    if (option == addNewOption || option == changeDataOption) {

        // then creae a form, add after the option
        const formForAdd = createForm();
        option.after(formForAdd);

        // after submititng - add data to allBooks[] or change data, then showBooks()
    }

    else if(option == deleteOption) {

        if(!rowSelected) {
            window.alert('Choose row to delete.');
            return;
        }
        else {
            try {
                // знайти id вибраної книжки
                const id = Number(bookIdSelected);
                // надсилання запиту на видаленняі
                await deleteBook(id);

                // delete row
                //rowSelected.remove();
                if (rowSelected && rowSelected.remove) {
                    rowSelected.remove();
                }

                // delete that book from the 'allBooks'[]  - create new array without deleted book
                allBooks = allBooks.filter(book => book.id !== bookIdSelected);

                showMessage("Book deleted successfully!");

                rowSelected = null;
                bookIdSelected = null;
            }
            catch (error){
                console.error('Failed to delete book:', error);
                showMessage("Failed to delete book: " + (error.message || error), 'show-error');
            }
        }
    }

}
const msgBox = document.getElementById("message-box");



/**
 * function to show box message
 * @param {message} message message of the box after add, change, delete actions
 * @param {string} [className="show"] the default class 'show' to show the box. pass 'show-error' for error
 */
function showMessage(message, className = "show") {
    // error class is .show-error
    msgBox.textContent = message;
    msgBox.classList.remove("hidden", "show", "show-error");
    msgBox.classList.add(className);

    setTimeout(() => {
        msgBox.classList.remove(className);
        setTimeout(() => msgBox.classList.add("hidden"), 300);
    }, 3000);
}


// 
/**
 * creates a form in add or change option when option is selected
 * @returns a form to user to fill in
 */
function createForm(){
    const formForBooks = document.createElement('form');
    formForBooks.id = 'bookEditForm';

    // helper function to create label and input pairs
    function addField(labelText, inputType = 'text', inputId, extra = {}) {
        const label = document.createElement('label');
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = inputType;
        input.id = inputId;
        input.value = '';

        // apply extra attributes if any (e.g., min, max)
        Object.entries(extra).forEach(([key, value]) => {
            input.setAttribute(key, value);
        });

        formForBooks.appendChild(label);
        formForBooks.appendChild(input);
    }

    addField('Title:', 'text', 'tittleAdd');
    addField('Author:', 'text', 'authorAdd');
    addField('Year:', 'number', 'yearAdd', {max: 2050});
    addField('Genre:', 'text', 'genreAdd');
    addField('Rating (1-5):', 'number', 'ratingAdd', { min: 1, max: 5 });

    const buttonSubmit = document.createElement('button');
    // Browsers treat unknown button types as submit.
    buttonSubmit.type = 'button';
    buttonSubmit.textContent = 'Add';
    formForBooks.appendChild(buttonSubmit);

    formForBooks.addEventListener('click', (event) => { event.preventDefault(); });
    formForBooks.addEventListener('submit', (event) => { event.preventDefault(); });

    buttonSubmit.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            const result = await updateData();
            console.log(result);
        } catch (err) {
            console.error(err);
        }
    });

    return formForBooks;
}

// function to add/change data in the allBooks[]
/**
 * function to add and change data in the databsae and in allBooks[]. 
 * has a showMessage() if action (add, change) is succssessfull / unsuccessfull
 */

/**
 * 
 * @returns 
 */
async function updateData(){
    const titleInput = document.getElementById('tittleAdd');
    const authorInput = document.getElementById('authorAdd');
    const yearInput = document.getElementById('yearAdd');
    const genreInput = document.getElementById('genreAdd');
    const ratingInput = document.getElementById('ratingAdd');

    let newTitle = titleInput.value.trim();
    let newAuthor = authorInput.value.trim();
    let newYear = Number(yearInput.value);
    let newGenre = genreInput.value.trim();
    let newRating = Number(ratingInput.value);

    // validation for values
    if (!newTitle || !newAuthor || !newYear || !newGenre || !newRating) {
        alert('Please fill in all fields.');
        return;
    }
    else if(newRating > 5 || newRating < 1){
        window.alert('Incorrect rating.')
        return;
    }

    else if (selectedOption == addNewOption) {
   
        // delete index - the db has autoincrement

        /*
        const newIndex = allBooks.length;
        // creates object with properties
        const newBook = {
            id: newIndex,
            title: newTitle,
            author: newAuthor,
            year: newYear,
            genre: newGenre,
            rating: newRating
        };
        */
       // створюється книжка
        const newBookToAdd = {
            title: newTitle,
            author: newAuthor,
            year: newYear,
            genre: newGenre,
            rating: newRating
        }

        // send a new book to databse
        try {
            // і надсилається до сервера
            const createdBook = await addNewBook(newBookToAdd);
            console.log(createdBook);
            //allBooks.push(created);
            showMessage("New book added successfully !");
            //showBooks();
        } 
        catch (err) {
            console.error("Failed to add book:", err);
            showMessage("Error occurred: " + err.message, 'show-error');
        }
        finally {
            console.log('Add has been done');
        }
    }
    else if(selectedOption == changeDataOption) {

        if(!rowSelected) {
            window.alert('Choose row to update.');
            return;
        }
        // знаходиться id 
        let bookId = allBooks.findIndex(book => book.id == bookIdSelected);
        bookId = Number(bookId);

        // створюється нова книжка
        const bookToChange = {
            
            title: newTitle,
            author: newAuthor,
            year: newYear,
            genre: newGenre,
            rating: newRating
        }

        try {
            const id = Number(bookIdSelected);
            // надсилається до сервера
            const updatedBook = await chandeBookData(id, bookToChange);
            console.log('Updated book: ' + updatedBook);

            /*
            allBooks[bookId].title = newTitle;
            allBooks[bookId].author = newAuthor;
            allBooks[bookId].year = newYear;
            allBooks[bookId].genre = newGenre;
            allBooks[bookId].rating = newRating;
            */
            allBooks[bookId] = updatedBook;

            showMessage("Book updated successfully!");
            showBooks();

            rowSelected = null;
            bookIdSelected = null;
        }
        catch (error){
            console.error("Failed to change book:", err);
            showMessage("Error occurred: " + err.message, 'show-error');
        }

    }

    return 'data updated'
}





/**
 * Sends a book to add to backedn server. Waits for response to adding a book
 * @param {Object} book  - a book that need to be added
 * @returns result of an action - a created book with id (database has autoincrement)
 */
async function addNewBook(book) {
    // send a json of a new book to backend
    const url = "http://127.0.0.1:8000/books/";
    console.log(url);
    const response = await fetch(url, { method: "POST" ,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(book)
    });

    if (!response.ok) {
        // handle HTTP errors
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${text}`);
    }

    const result = await response.json();
    console.log(response);
    console.log(result);

    
    return result
}


/**
 * Delets book from databse based on sent book id 
 * @param {int} book_id 
 */
async function deleteBook(book_id){
    const url = `http://127.0.0.1:8000/books/${encodeURIComponent(book_id)}`;
    console.log('DELETE ', url);
    const response = await fetch(url, { method: "DELETE" ,
        headers: {"Content-Type": "application/json"}
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${text}`);
    }

    if (response.status === 204) return null;
    try {
        return await response.json();
    } catch (err) {
        return null;
    }
}

/**
 * function to change data about a book bu its id
 * @param {int} book_id 
 * @param {Object} book 
 * @returns 
 */
async function chandeBookData(book_id, book) {
    // send a json of a new book to backend
    const url = `http://127.0.0.1:8000/books/${encodeURIComponent(book_id)}`;
    console.log(url);
    const response = await fetch(url, { method: "PUT" ,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(book)
    });

    if (!response.ok) {
        // handle HTTP errors
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${text}`);
    }

    const result = await response.json();
    return result
}



/*
async function addNewBook(book) {
  const url = "http://127.0.0.1:8000/books";
  console.log('[addNewBook] sending to', url, 'payload:', book);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(book)
    });

    console.log('[addNewBook] fetch returned status:', response.status);
    // Log all response headers
    for (const pair of response.headers.entries()) {
      console.log('[addNewBook] response header:', pair[0], pair[1]);
    }

    // Read text so we can inspect non-JSON replies too
    const text = await response.text();
    console.log('[addNewBook] raw response body:', text.slice(0, 1000)); // limit log size

    // Try to parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(text);
      console.log('[addNewBook] parsed JSON:', parsed);
    } catch (err) {
      console.warn('[addNewBook] response not JSON');
      parsed = text;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
    }

    return parsed;
  } catch (err) {
    console.error('[addNewBook] fetch error:', err);
    throw err;
  }
}
*/
