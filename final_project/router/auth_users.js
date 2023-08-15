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
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
  
    if (!isValid(username) || !authenticatedUser(username, password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
  
    res.json({ message: "Login successful", token });
});


regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const token = req.header('Authorization').split(' ')[1];
  
    try {
      const decoded = jwt.verify(token, 'your_secret_key');
      const username = decoded.username;
  
      // Find the book by ISBN
      const book = books[isbn];
  
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
  
      // Add the review to the book's reviews object
      if (!book.reviews) {
        book.reviews = {};
      }
      book.reviews[username] = review;
  
      res.json({ message: "Review added successfully", book });
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
