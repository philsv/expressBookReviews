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
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    return res.json({ book });
});


public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    
    if (booksByAuthor.length === 0) {
        return res.status(404).json({ error: "No books found by this author" });
    }
    return res.json({ books: booksByAuthor });
});


public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    
    const booksWithTitle = Object.values(books).filter(book => book.title.includes(title));
    
    if (booksWithTitle.length === 0) {
        return res.status(404).json({ error: "No books found with this title" });
    }
    return res.json({ books: booksWithTitle });
});


public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const reviews = book.reviews || {};
    return res.json({ reviews });
});


// Create a new review for a book (logged in users only)
public_users.post('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!isValid(req)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const book = books.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    if (!book.reviews) {
        book.reviews = [];
    }

    book.reviews.push({
        user: req.session.username, // Assuming session username is stored
        review: review
    });
    return res.status(201).json({ message: "Review added successfully", book: book });
});


// Modify a book review (logged in users can modify only their own reviews)
public_users.put('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!isValid(req)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const book = books.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const userReview = book.reviews.find(r => r.user === req.session.username);

    if (!userReview) {
        return res.status(403).json({ error: "You are not authorized to modify this review" });
    }

    userReview.review = review;
    return res.json({ message: "Review modified successfully", book: book });
});


// Delete a book review (logged in users can delete only their own reviews)
public_users.delete('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (!isValid(req)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const book = books.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const userReviewIndex = book.reviews.findIndex(r => r.user === req.session.username);

    if (userReviewIndex === -1) {
        return res.status(403).json({ error: "You are not authorized to delete this review" });
    }

    book.reviews.splice(userReviewIndex, 1);
    return res.json({ message: "Review deleted successfully", book: book });
});


module.exports.general = public_users;
