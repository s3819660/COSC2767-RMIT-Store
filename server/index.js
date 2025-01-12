// Load environment variables from a .env file into process.env
require("dotenv").config();
console.log("MONGO_URI",process.env.MONGO_URI)
console.log("CLIENT_URL=",process.env.CLIENT_URL) 

// Import required modules
const express = require("express");
const chalk = require("chalk");
const cors = require("cors");
const helmet = require("helmet");

// Import custom modules
const keys = require("./config/keys");
const routes = require("./routes");
const socket = require("./socket");
const setupDB = require("./utils/db");

// Destructure port from keys configuration
const { port } = keys;

// Initialize the Express application
const app = express();

// Middleware to parse URL-encoded data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to enhance security by setting various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for compatibility reasons
    frameguard: true, // Enable frameguard to prevent clickjacking
  })
);

// Middleware to enable Cross-Origin Resource Sharing
app.use(cors());

// Setup the database connection
setupDB();

// Configure Passport.js for authentication
require("./config/passport")(app);

// Use the defined routes for handling requests
app.use(routes);

// module.exports = app;

// Start the server and listen on the specified port
const server = app.listen(port, "0.0.0.0", () => {
  console.log(
    `${chalk.green("✓")} ${chalk.blue(
      `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
    )}`
  );
});

// Initialize WebSocket server
socket(server);
