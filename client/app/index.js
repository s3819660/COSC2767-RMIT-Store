/**
 *
 * index.js
 * This is the entry file for the application
 */

// Import React library
import React from 'react';
// Import ReactDOM library for rendering React components
import ReactDOM from 'react-dom';

// Import the main App component
import App from './app';

const apiUrl = process.env.API_URL;
const debugMode = process.env.DEBUG;

console.log("API URL:", apiUrl);
console.log("Debug Mode:", debugMode);

// Render the App component into the root element in the HTML
ReactDOM.render(<App />, document.getElementById('root'));
