// function to get data from data.json
async function getData(){
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}


// element arrow --> to filter needed books by user 
const searchBooks = document.getElementById('SearchP');

const selectGenre = document.querySelector('select');
const selectYear = document.getElementById('yearInput');
const selectRating = document.getElementById('ratingInput')

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

    // filter
    const genre = selectGenre.value;
    const year = selectYear.value;
    const rating = selectRating.value;

    const filteredBooks = allBooks.filter(book => {
        const matchGenre = genre === 'all' || book.genre.toLowerCase() === genre;
        const matchYear = year === '' || String(book.year) === year;
        const matchRating = rating === '' || String(book.rating) === rating;

        return matchGenre && matchYear && matchRating;
    });

    // sort the selected books by year / rating
    if (sortField) {
        filteredBooks.sort((a, b) => {
        if (ascending) return a[sortField] - b[sortField];
        else return b[sortField] - a[sortField];
        });
    }

    // show results - fill in the table
    if (filteredBooks.length === 0) {
        const row = document.createElement('tr');

        row.innerHTML = `
        <td colspan='6'>
            За запитом не знайдено книжок.
        </td>
        `
        tableBooks.appendChild(row);
    }
    else {
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
    }
    
    
    
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


// arrow in search field
searchBooks.addEventListener('click', showBooks);

// firstly load all books available
getData().then((data) => {
    allBooks = data;

    selectGenresOptions(allBooks);
});

// function to get all unique genres and add it to the  select genre 
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
function optionAction(option){
    
    // delete form if exist
    const formForBooks = document.querySelector('form');
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
            // delete row
            rowSelected.remove();

            // delete that book from the 'allBooks'[]  - create new array without deleted book
            allBooks = allBooks.filter(book => book.id !== bookIdSelected);

            rowSelected = null;
            bookIdSelected = null;
        }
    }

}

// creates a form in add or change option
function createForm(){
    const formForBooks = document.createElement('form');

    // helper function to create label and input pairs
    function addField(labelText, inputType = 'text', inputId, extra = {}) {
        const label = document.createElement('label');
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = inputType;
        input.id = inputId;
        input.value = ' ';

        // apply extra attributes if any (e.g., min, max)
        Object.entries(extra).forEach(([key, value]) => {
            input.setAttribute(key, value);
        });

        formForBooks.appendChild(label);
        formForBooks.appendChild(input);
    }

    addField('Title:', 'text', 'tittleAdd');
    addField('Author:', 'text', 'authorAdd');
    addField('Year:', 'number', 'yearAdd', {max: 2025});
    addField('Genre:', 'text', 'genreAdd');
    addField('Rating (1-5):', 'number', 'ratingAdd', { min: 1, max: 5 });

    const buttonSubmit = document.createElement('button');
    buttonSubmit.type = 'submit';
    buttonSubmit.textContent = 'Add';
    formForBooks.appendChild(buttonSubmit);

    formForBooks.addEventListener('submit', (event) => {
        event.preventDefault();
        updateData();
    })

    return formForBooks;
}

// function to add/change data in the allBooks[]
function updateData(){
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
        allBooks.push(newBook);
        showBooks();
    }
    else if(selectedOption == changeDataOption) {
        const bookId = allBooks.findIndex(book => book.id == bookIdSelected);

        allBooks[bookId].title = newTitle;
        allBooks[bookId].author = newAuthor;
        allBooks[bookId].year = newYear;
        allBooks[bookId].genre = newGenre;
        allBooks[bookId].rating = newRating;

        showBooks();
    }
}


