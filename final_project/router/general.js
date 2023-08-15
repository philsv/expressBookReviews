const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = { username, password };
    users.push(newUser);

    res.status(201).json({ message: "User registered successfully", user: newUser });
});


public_users.get('/', function (req, res) {
    const getBooksPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 500);  // 0.5 seconds delay
    });

    getBooksPromise
        .then((booksData) => {
            return res.json(booksData);
        })
        .catch((error) => {
            return res.status(500).json({ error: 'An error occurred while fetching books.' });
        });
});


public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const findBookPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = Object.values(books).find(book => book.isbn === isbn);
            if (book) {
                resolve(book);
            } else {
                reject(new Error('Book not found'));
            }
        }, 500);
    });

    findBookPromise
        .then((book) => {
            return res.json({ book });
        })
        .catch((error) => {
            return res.status(404).json({ error: 'Book not found' });
        });
});


public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const findBooksByAuthorPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByAuthor = Object.values(books).filter(book => book.author === author);
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(new Error('No books found by this author'));
            }
        }, 500);
    });

    findBooksByAuthorPromise
        .then((booksByAuthor) => {
            return res.json({ books: booksByAuthor });
        })
        .catch((error) => {
            return res.status(404).json({ error: 'No books found by this author' });
        });
});


public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const findBooksWithTitlePromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksWithTitle = Object.values(books).filter(book => book.title.includes(title));
            if (booksWithTitle.length > 0) {
                resolve(booksWithTitle);
            } else {
                reject(new Error('No books found with this title'));
            }
        }, 500);
    });

    findBooksWithTitlePromise
        .then((booksWithTitle) => {
            return res.json({ books: booksWithTitle });
        })
        .catch((error) => {
            return res.status(404).json({ error: 'No books found with this title' });
        });
})


public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const reviews = book.reviews || {};
    return res.json({ reviews });
});

module.exports.general = public_users;