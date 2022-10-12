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

        // Initialize components
        // Make sure methods should be arrow functions
        this._init = {
            // Attach the menu button
            // This button toggles the EditorSideBar
            menuToggler: () => {
                // Create the menu toggler
                const toggler = this.toggleSideBar = this.addComponent(new Toggler(true, {
                    innerHTML: /* html */ `<span>&#9776;</span>`
                }));
                
                // Initialize classes and listeners
                toggler.classes.add("menu", "opacity-70");
    
                // Opens the menu
                toggler.setActiveListener(() => {
                    const sideBar = this.getParent().getParent().view.sideBar;
                    // Open side bar to previous position before closed
                    sideBar.style.width = sideBar.width || "";
                    // Set min-width to default
                    sideBar.style.minWidth = "";
                });
    
                // Closes the menu
                toggler.setInactiveListener(() => {
                    const sideBar = this.getParent().getParent().view.sideBar;
                    // Side bar has a min-width by default,
                    // so it needs to be removed to be closed
                    sideBar.style.width = sideBar.style.minWidth = "0px";
                });
            },

            // Attach the main part of the editor menu (grows)
            // This notebook panel will hold notebook related actions and buttons
            // including the notebook title and menu buttons
            main: () => {
                this.main = this.addComponent(new Component(
                    document.createElement("div")
                ));
                this.main.classes.add("main", "grow");
            },

            // Title text field
            titleTextField: () => {
                // Attach the title text field
                this.main.titleTextField = this.main.addComponent(new TextField({
                    value: "New notebook"
                }));
                
                // Constant
                const titleInput = this.main.titleTextField;

                titleInput.classes.add("title");
                titleInput.setAttribute("maxlength", 64);

                // Automatically resize input element
                titleInput.resizeWidth = () => {
                    // Get or create an element if it doesn't exist yet
                    // This element will hold the input's value
                    let valueElement = this.element.querySelector("#editor-menu-title-text-field-value");
                    if (!valueElement) {
                        valueElement = document.createElement("div");
                        valueElement.id = "editor-menu-title-text-field-value";
                        valueElement.classList.add("visually-hidden");
                        Object.assign(valueElement.style, {
                            fontSize: "18px",
                            whiteSpace: "auto",
                            width: "auto"
                        });
                        this.element.appendChild(valueElement);
                    }

                    // The input width will resize to the width of the value element
                    valueElement.innerText = titleInput.element.value;
                    titleInput.style.width =
                        (valueElement.clientWidth + 27) + "px";
                };

                // Auto select all the text when focused on
                titleInput.addEventListener("focus", (event) => {
                    titleInput.element.select();
                }, undefined, false);

                // On unfocus (blur)
                titleInput.addEventListener("blur", (event) => {
                    // If the notebook title is empty,
                    // set it to the default "New notebook"
                    if (titleInput.element.value.trim() === "") {
                        titleInput.element.value = "New notebook";
                        titleInput.resizeWidth();
                    }
                }, undefined, false);

                // When the user types something,
                // Auto resize to fit the value
                titleInput.addEventListener("input", (event) => {
                    titleInput.resizeWidth();
                }, undefined, false);
            },

            // Settings button on the right, opens the notebook's settings
            settingsButton: () => {
                // Attach the settings button
                this.buttons.settings = this.addComponent(new Button({
                    innerHTML: /* html */ `<img src="img/settings.svg">`
                }));
                this.buttons.settings.classes.add("settings", "opacity-70");
            }
        };

        // Initialize
        this._init.menuToggler();
        this._init.main();
        this._init.titleTextField();
        this._init.settingsButton();
    }
}

// Editor controls
// Controls for editing the notebook. Click on the tabs
// in `EditorMenu` to change what `EditorControls` will display
class EditorControls extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-controls", "flex");

        // Initialize
        this._init = {
            // Fixed controls
            // These controls will be always be on the editor controls,
            // even after switching editor panel tabs
            fixed: () => {
                // Create the component
                const fixed = this.fixed = this.addComponent(new Component(
                    document.createElement("div")
                ));

                fixed.classes.add("fixed");
            }
        };
    }
}

// Editor panel
// Includes the editor menu and the controls
class EditorPanel extends Component {
    constructor() {
        // Initialize element
        super(document.createElement("div"));
        this.classes.add("editor-panel");

        // Menu
        this.menu = this.addComponent(new EditorMenu);
        // The controls is the navigator viewer
        this.controls = this.addComponent(new EditorControls);
        
        // Initialize
        this._init = {
            navigator: () => {
                // Navigator
                this.navigator = new Navigator();
                this.navigatorMenu = this.menu.main.addComponent(this.navigator.menu);
                this.navigatorViewer = this.controls.addComponent(this.navigator.viewer);

                this.navigatorViewer.classes.add("grow");

                // Add the pages
                this.navigatorPages = {};
                for (const name of ["edit", "insert", "draw", "interaction", "view"]) {
                    // Converts the first letter to upper case
                    const capName = name[0].toUpperCase() + name.substring(1);

                    // Add the page
                    this.navigator.addPage(this.navigatorPages[name] = {
                        button: new NavigatorButton(name, {
                            innerText: capName
                        }),
                        view: new View(name)
                    });
                }

                // The blue bar on the bottom that moves
                // when the user click on something
                this.menu.main.activeIndicator =
                    this.menu.main.addComponent(new Component(
                        document.createElement("div")
                    ));
                this.menu.main.activeIndicator.classes.add("active-indicator");

                // Set click listeners for the menu buttons
                this.navigator.menu.setSharedActiveListener((button) => {
                    // Constants
                    const activeIndicator = this.menu.main.activeIndicator.element;

                    // Translate the active indicator
                    activeIndicator.style.transform = `translateX(${button.element.offsetLeft - 70 - 53}px)`;
                    activeIndicator.style.width = `${button.element.clientWidth}px`;
                });
            }
        };

        // Initialize
        this._init.navigator();
        this.controls._init.fixed();
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


