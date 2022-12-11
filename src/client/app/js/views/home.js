/**
 * js/views/home.js
 * 
 * The home page. Displays all the notebooks
 * and recent notebooks and pages.
 */


"use strict";

import {
    Button, TextField, View, TooltipBuilder, PointingTooltip,
    Section, Header, Main, SideBar, Icon
} from "../components.js"
import { Component } from "../quartz.js";
import quill from "../quill.js"

const home = new View("home");

(() => {

    // Search, and buttons to create new notebook
    const header = new Header();
    // Displays created notebooks
    const main = new Main();

    // Header
    (() => {
        header.classes.add("flex");

        // Logo
        const logoDiv = header.addComponent(new Component(document.createElement("div")));

        logoDiv.classes.add("logo");
        logoDiv.element.innerHTML = /* html */ `
            <img src="${quill.path.logo}">
        `;

        // Search bar
        const searchDiv = header.addComponent(new Component(document.createElement("div")));
        const search = searchDiv.addComponent(new TextField());

        searchDiv.classes.add("search", "grow");
        search.setAttribute("placeholder", "Search");

        // New notebook button
        const createDiv = header.addComponent(new Component(document.createElement("div")));
        const create = createDiv.addComponent(new Button());
        const createTooltip = createDiv.addComponent(new TooltipBuilder(
            create,
            new PointingTooltip("New notebook", "bottom")
        ));
        const createIcon = create.addComponent(new Icon("./img/new.svg", 0, 0, 12, 12));

        createIcon.classes.add("opacity-80");
        createDiv.classes.add("new");
    })();

    // Main
    (() => {
        main.classes.add("grid");

        // Create the components
        const recent = main.addSection(new Section("recent"));
        const special = main.addSection(new SideBar("special"));
        const all = main.addSection(new Section("all"));

        recent.element.innerHTML = /* html */ `
            <h3>Recent pages</h3>
        `;

        special.element.innerHTML = /* html */ `
            <h3>Starred</h3>
        `;

        all.element.innerHTML = /* html */ `
            <h3>All notebooks</h3>
        `;

        for (const name in main.sections) {
            const section = main.sections[name];
        }
    })();

    // Add sections
    home.header = home.addComponent(header);
    home.main = home.addComponent(main);

})();

export default home


