const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function to check if the username exists
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Helper function to check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the user by adding them to the users array
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Login a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Validate the user's credentials
  if (!authenticatedUser(username, password)) {
    return res
      .status(401)
      .json({ message: "Invalid login. Check username and password" });
  }

  // Generate a JWT token
  const accessToken = jwt.sign({ data: username }, "access", {
    expiresIn: "1h",
  });

  // Save the token in the session
  req.session.authorization = {
    accessToken,
    username,
  };

  return res
    .status(200)
    .json({ message: "User successfully logged in", token: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query; // Use query to get the review
  const username = req.session.authorization?.username; // Get the username from the session

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if a review exists for the user and modify it, otherwise add a new review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {}; // Initialize reviews if not present
  }

  books[isbn].reviews[username] = review;

  return res
    .status(200)
    .json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews,
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let ISBN = req.params.isbn;
  books[ISBN].reviews = {}
  return res.status(200).json({messsage:"Review has been deleted"})
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
