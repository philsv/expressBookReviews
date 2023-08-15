const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);

    if (!user) {
        return false;
    }
    return user.password === password;
}


regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'secret', { expiresIn: '24h' });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ message: "Login successful", accessToken });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.query.review;
    const isbn = req.params.isbn;
    const session = req.session;
    const username = session?.authorization?.username ?? null;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (book) {
        if (book.reviews && username in book.reviews) {
            return res.status(208).json({
                message: "Review already exists",
                review: book.reviews[username],
                username: username,
                isbn: isbn,
                book: book,
            });
        } else {
            if (!book.reviews) {
                book.reviews = {};
            }

            book.reviews[username] = review;
            return res.status(200).json({
                message: "Review added successfully",
                review: book.reviews[username]
            });
        }
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const session = req.session;
    const username = session?.authorization?.username ?? null;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (book) {
        if (username in book.reviews) {
            delete book.reviews[username];
            res.status(200).json({ 
                message: "Review deleted successfully",
                review: book.reviews[username],
                username: username,
                isbn: isbn,
                book: book,
            });
        } else {
            res.status(404).json({ 
                message: "Review not found",
            });
        }
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
