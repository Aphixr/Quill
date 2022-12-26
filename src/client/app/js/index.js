/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be loaded and displayed to the user.
 */


"use strict";

import quill from "./quill.js"
import { Navigator, NavigatorButton, PointingTooltip, SpriteSheet } from "./components.js"
import { Component } from "./quartz.js";

// Import views
import home from "./views/home.js"
import notebook from "./views/notebook.js"
import templates from "./views/templates.js"
import trash from "./views/trash.js"
import settings from "./views/settings.js"
import { NotebookHandler } from "./notebook/notebook.js";

// App (singleton)
class App {
    constructor() {
        this.element = document.getElementById("app");

        // Contains all the notebooks
        this.notebookHandler = new NotebookHandler();

        // Components
        this.navigator = new Navigator();

        // Pages of navigator
        this.pages = {};

        // Pointing tooltip
        this.pointingTooltip = new PointingTooltip("bottom", 500);

        // Initialize
        this._init = {
            // Navigator
            navigator: () => {
                const navigationIcons = new SpriteSheet("img/navigation-icons.svg", 26, 26);

                // Create a button for the navigator
                // Returns a NavigatorButton
                const createButton = (index, name) => {
                    // Navigator button
                    const button = new NavigatorButton(null, name.toLowerCase());
                    button.classes.add("opacity-60");

                    // Label
                    const label = new Component(document.createElement("span"));
                    label.classes.add("label");
                    label.element.innerText = name;

                    // Attach icon and label
                    button.addComponent(navigationIcons.getIcon(index));
                    button.addComponent(label);

                    return button;
                }

                // Initialize all pages
                home.initialize(this);
                notebook.initialize(this);
                templates.initialize();
                trash.initialize();
                settings.initialize();

                // Add pages
                this.navigator.addPages({
                    button: createButton(0, "Home"),
                    view: home
                }, {
                    button: createButton(1, "Notebook"),
                    view: notebook
                }, {
                    button: createButton(2, "Templates"),
                    view: templates
                }, {
                    button: createButton(3, "Trash"),
                    view: trash
                }, {
                    button: createButton(4, "Settings"),
                    view: settings
                });

                this.pages = this.navigator.pages;
            }
        };
    }

    /* =================== */
    /* Load                */
    /* =================== */
    load() {
        // Initialize navigator
        this._init.navigator();
        
        // Event delegation
        quill.eventDelegation.merge("resize", window);
        quill.eventDelegation.mergeAll();
        
        // Loading milestone (3/4)
        quill.milestoneTrack.done("loading");
    }

    /* =================== */
    /* Display             */
    /* =================== */
    display() {
        // Render navigator
        this.navigator.menu.renderAt(quill.app);
        this.navigator.viewer.renderAt(quill.app);

        // Tooltip
        this.pointingTooltip.renderAt(quill.app);
        
        // Auto activate a tab
        // Based on hash if there is one
        const hash = location.hash.substring(1);
        this.navigator.menu.buttons[
            hash in this.pages ? hash : "home"
        ].activate();

        // Remove location hash
        // Added if statement to prevent Firefox from adding an empty #
        // if # is not set to anything on load
        if (location.hash) {
            location.hash = "";
        }

        // Display milestone (4/4)
        quill.milestoneTrack.done("display");
    }
}

const app = new App;
app.load();
app.display();


