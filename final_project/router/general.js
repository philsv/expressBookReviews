const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
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
    const booksJSON = JSON.stringify(books);
    return res.json(booksJSON);
});


public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    return res.json({ book });
});


public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = books.filter(book => book.authors.includes(author));
    return res.json({ books: booksByAuthor });
});


public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksWithTitle = books.filter(book => book.title.includes(title));
    return res.json({ books: booksWithTitle });
});


public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const reviews = book.reviews || [];
    return res.json({ reviews });
});

module.exports.general = public_users;
