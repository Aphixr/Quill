/**
 * js/views/home.js
 * 
 * The home page. Displays all the notebooks
 * and recent notebooks and pages.
 */


"use strict";

import {
    Button, TextField, View,
    Section, Header, Main, SideBar
} from "../components.js"
import { Component } from "../quartz.js";
import quill from "../quill.js"

const home = new View("home");

(() => {

    // Search, and buttons to create new notebook
    const header = new Header();
    // Displays created notebooks
    const main = new Main();

    // Add sections to main
    main.addSections(
        new Section("recent"),
        new SideBar("special"),
        new Section("notebooks")
    );

    // Header
    (function() {
        header.element.classList.add("flex");

        // Create the components
        const logoDiv = new Component(document.createElement("div"));
        const searchDiv = new Component(document.createElement("div"));
        const createDiv = new Component(document.createElement("div"));
        const search = searchDiv.addComponent(new TextField());
        const create = createDiv.addComponent(new Button());

        // Logo
        logoDiv.element.classList.add("logo");
        logoDiv.element.innerHTML = /* html */ `
            <img src="${quill.path.logo}">
        `;

        // Search bar
        searchDiv.element.classList.add("search", "grow");
        search.element.setAttribute("placeholder", "Search");

        // New notebook button
        createDiv.element.classList.add("new");
        create.element.innerText = "+";

        // Add components to the header
        header.logo = header.addComponent(logoDiv);
        header.search = header.addComponent(searchDiv);
        header.create = header.addComponent(createDiv);
    })();

    // Add sections
    home.header = home.addComponent(header);
    home.main = home.addComponent(main);

})();

export default home


