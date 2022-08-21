/**
 * index.js
 * 
 * Running Quill with Electron
 */

"use strict";

const { app, BrowserWindow } = require("electron");

// Window object
const Quill = {
    // Create a window
    createWindow: function() {
        const mainWindow = new BrowserWindow({
            backgroundColor: "#f0f0f0",
            show: false,
            width: 1024,
            height: 576,
            resizeable: true,
            autoHideMenuBar: true
        });

        // Load HTML
        mainWindow.loadFile("src/client/index.html");

        // Maximize automatically
        mainWindow.once("ready-to-show", () => {
            mainWindow.maximize();
        });
    }
};

// When Electron is ready
app.whenReady().then(() => {
    // Open the window
    Quill.createWindow();
    app.on("activate", () => {
        // MacOS
        if (BrowserWindow.getAllWindows().length === 0) {
            Quill.createWindow();
        }
    });
});

// Exit
app.on("windows-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})


