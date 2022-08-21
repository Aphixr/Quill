/**
 * index-web.js
 * 
 * Running Quill as a website
 */

"use strict";

// Constants
const express = require("express");
const app = express();
const port = 3000;

// Use / for /client
app.use("/", express.static(__dirname + "/client"));

// Get method /
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/");
});

app.listen(port, () => {
    console.log("quill listening on port " + port);
});


