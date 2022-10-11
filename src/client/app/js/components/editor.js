/**
 * js/components/editor.js
 * 
 * The main part of the app. Includes the editor panel on
 * the top, with controls and menus, and the editor content,
 * which displays the notebook sections and pages
 */


"use strict";

// Import
import { Component } from "../quartz.js"
import { Navigator, NavigatorButton, Button, Toggler, TextField, View } from "./input.js"

// Editor menu bar
// Has tabs that you can click on and edit notebook title
class EditorMenu extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-menu", "flex");

        // Holds the buttons
        this.buttons = {};

        // Attach the menu button
        // This button toggles the EditorSideBar
        (function menuToggler() {
            // Create the menu toggler
            const toggler = new Toggler(true, {
                innerHTML: /* html */ `<span>&#9776;</span>`
            });
            
            // Initialize classes and listeners
            toggler.classes.add("menu", "opacity-70");
            toggler.setActiveListener(() => {
                const sideBar = this.getParent().getParent().view.sideBar;
                sideBar.style.width = sideBar.width || "";
                sideBar.style.minWidth = "";
            });
            toggler.setInactiveListener(() => {
                const sideBar = this.getParent().getParent().view.sideBar;
                sideBar.style.width = sideBar.style.minWidth = "0px";
            });

            // Attach component
            this.buttons.sideBar = this.addComponent(toggler);
        }).call(this);

        // Attach a notebook related <div> notebookPanel
        // This notebook panel will hold notebook related actions and buttons
        // including the notebook title and menu buttons
        this.notebookPanel = this.addComponent(new Component(
            document.createElement("div")
        ));
        this.notebookPanel.classes.add("main", "grow");

        // Notebook title text field
        (function notebookTitleTextField() {
            // Attach the title text field
            this.notebookPanel.notebookTitleTextField =
                this.notebookPanel.addComponent(new TextField({
                    value: "New notebook"
                }));
            
            // Constant
            const notebookTitleInput = this.notebookPanel.notebookTitleTextField;

            notebookTitleInput.classes.add("title");

            // Automatically resize input element
            notebookTitleInput.resizeWidth = () => {
                // Create an element
                let valueElement = this.element.querySelector("#notebook-title-text-field-value");
                if (!valueElement) {
                    valueElement = document.createElement("div");
                    valueElement.id = "notebook-title-text-field-value";
                    valueElement.classList.add("visually-hidden");
                    Object.assign(valueElement.style, {
                        fontSize: "18px",
                        whiteSpace: "auto",
                        width: "auto"
                    });
                    this.element.appendChild(valueElement);
                }
                valueElement.innerText = notebookTitleInput.element.value;
                notebookTitleInput.style.width =
                    (valueElement.clientWidth + 27) + "px";
            };

            // Maximum length
            notebookTitleInput.setAttribute("maxlength", 64);

            // Auto select all the text when focused on
            notebookTitleInput.addEventListener("focus", (event) => {
                notebookTitleInput.element.select();
            }, undefined, false);

            // On unfocus (blur)
            notebookTitleInput.addEventListener("blur", (event) => {
                if (notebookTitleInput.element.value.trim() === "") {
                    notebookTitleInput.element.value = "New notebook";
                    notebookTitleInput.resizeWidth();
                }
            }, undefined, false);

            // When the user types something
            notebookTitleInput.addEventListener("input", (event) => {
                notebookTitleInput.resizeWidth();
            }, undefined, false);
        }).call(this);

        // Settings button on the right
        (function settingsButton() {
            // Attach the settings button
            this.buttons.settings = this.addComponent(new Button({
                innerHTML: /* html */ `<img src="img/settings.svg">`
            }));
            this.buttons.settings.classes.add("settings", "opacity-70");
        }).call(this);
    }
}

// Editor controls
// Controls for editing the notebook. Click on the tabs
// in `EditorMenu` to change what `EditorControls` will display
class EditorControls extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-controls");
    }
}

// Editor panel
// Includes the editor menu and the controls
class EditorPanel extends Component {
    constructor() {
        // Initialize element
        super(document.createElement("div"));
        this.classes.add("editor-panel");

        // Add some components
        this.menu = this.addComponent(new EditorMenu);
        this.controlsNavigator = new Navigator();
        this.controlsNavigatorMenu = this.menu.notebookPanel.addComponent(this.controlsNavigator.menu);
        this.controls = this.addComponent(new EditorControls);

        this.controlsNavigator.addPages(
            {
                button: new NavigatorButton("edit", { innerText: "Edit" }),
                view: new View("edit")
            },
            {
                button: new NavigatorButton("insert", { innerText: "Insert" }),
                view: new View("insert")
            },
            {
                button: new NavigatorButton("draw", { innerText: "Draw" }),
                view: new View("draw")
            },
            {
                button: new NavigatorButton("interaction", { innerText: "Interaction" }),
                view: new View("interaction")
            },
            {
                button: new NavigatorButton("view", { innerText: "View" }),
                view: new View("view")
            },
        );

        // The blue bar on the bottom that moves
        // when the user click on something
        this.menu.notebookPanel.activeIndicator =
            this.menu.notebookPanel.addComponent(new Component(
                document.createElement("div")
            ));
        this.menu.notebookPanel.activeIndicator.classes.add("active-indicator");

        // Set click listeners for the menu buttons
        this.controlsNavigator.menu.setSharedActiveListener((button) => {
            // Constants
            const activeIndicator = this.menu.notebookPanel.activeIndicator.element;

            // Translate the active indicator
            activeIndicator.style.transform = `translateX(${button.element.offsetLeft - 70 - 53}px)`;
            activeIndicator.style.width = `${button.element.clientWidth}px`;
        });
    }
}

// Editor sidebar
// Displays content of whatever tab user clicked on in EditorActivity
class EditorSideBar extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-side-bar");
    }
}

// Editor content
// Displays the content of a notebook page
class EditorContent extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-content");
    }
}

// Editor view
// Shows the contents of the notebook and notebook page
class EditorView extends Component {
    constructor() {
        // Initialize this element
        super(document.createElement("div"));
        this.classes.add("editor-view");
        this.classes.add("flex");

        // Add components
        this.sideBar = this.addComponent(new EditorSideBar);
        this.content = this.addComponent(new EditorContent);
        
        // Initialize the navigator
        this.activityNavigator = new Navigator();
    }
}

// Editor
// The main part of editing is here
class Editor extends Component {
    constructor() {
        // Initialize element
        super(document.createElement("div"));
        this.classes.add("editor");

        // Add some components
        this.panel = this.addComponent(new EditorPanel);
        this.view = this.addComponent(new EditorView);
    }
}

// Export
export default Editor
export {
    Editor,
    EditorMenu, EditorControls, EditorPanel,
    EditorSideBar, EditorContent, EditorView
}


