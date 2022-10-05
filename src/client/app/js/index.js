/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be loaded and displayed to the user.
 */


"use strict";

import dev from "./dev.js"
import quill from "./quill.js"
import { Navigator, NavigatorButton, Icon } from "./components.js"
import { Component } from "./quartz.js";

// Import views
import home from "./views/home.js"
import notebook from "./views/notebook.js"
import templates from "./views/templates.js"
import trash from "./views/trash.js"
import settings from "./views/settings.js"

// App (singleton)
class App {
    constructor() {
        dev.class.singleton();
    }

    // Components
    static navigator = new Navigator();

    /* =================== */
    /* Load                */
    /* =================== */
    static load() {
        // Navigator
        (function navigator() {
            // Create a button for the navigator
            // Returns a NavigatorButton
            const createButton = (index, name) => {
                const button = new NavigatorButton();
                button.element.classList.add("opacity-60");
                button.addComponent(new Icon("img/navigation-icons.svg", -26 * index, 0));
                button.setName(name.toLowerCase());

                const label = document.createElement("span");
                label.classList.add("label");
                label.innerHTML = /* html */ `${name}`;
                button.addComponent(new Component(label));
                return button;
            }

            // Add pages
            App.navigator.addPages({
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
        })();
        
        // Event delegation
        quill.eventDelegation.mergeAll();
        
        // Loading milestone (3/4)
        quill.milestoneTrack.done("loading");
    }

    /* =================== */
    /* Display             */
    /* =================== */
    static display() {
        // Render navigator
        App.navigator.menu.render(quill.app);
        App.navigator.viewer.render(quill.app);
        
        // Auto activate a tab
        // Based on hash if there is one
        const hash = location.hash.substring(1);
        App.navigator.menu.buttons[
            hash in App.navigator.pages ? location.hash.substring(1) : "home"
        ].activate();

        // Remove location hash
        location.hash = "";

        // Display milestone (4/4)
        quill.milestoneTrack.done("display");
    }
}

App.load();

App.display();


