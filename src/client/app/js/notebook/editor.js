/**
 * js/notebook/editor.js
 * 
 * The main part of the app. Includes the editor panel on
 * the top, with controls and menus, and the editor content,
 * which displays the notebook sections and pages.
 */


"use strict";

// Import
import { Component } from "../quartz.js"
import {
    Navigator, NavigatorButton, View,
    Button, Toggler, TextField,
    DropdownFacade, DropdownToggler, Dropdown, DropdownRow,
    TooltipBuilder, PointingTooltip,
    Section, Container, Main, Header, SideBar, Icon
} from "../components.js"

// Editor top bar
// The bar on the very top of the editor
class EditorTopBar extends Header {
    constructor() {
        super();
        this.classes.add("editor-top-bar", "flex");

        // Holds the buttons
        this.buttons = {};

        // Initialize coomponents
        this._init = {
            // Attach the menu button
            // This button toggles the EditorSideBar
            menuToggler: () => {
                // Container for the menu button
                const container = this.addComponent(new Container(
                    "menu-toggler",
                    document.createElement("div")
                ));

                // Create the menu toggler
                const toggler = this.buttons.sideBar = container.addComponent(new Toggler(true, {
                    innerHTML: /* html */ `<img src="./img/menu.svg">`
                }));

                // Side bar that the toggler opens/closes
                const sideBar = this.getParent().sideBar.element;

                // Tooltip builder
                container.addComponent(new TooltipBuilder(
                    toggler,
                    new PointingTooltip("Sidebar", "bottom")
                ));
                
                // Initialize classes
                toggler.classes.add("menu", "opacity-70");
    
                // Opens the menu
                toggler.setActiveListener(() => {
                    // Open side bar to previous position before closed
                    sideBar.style.width = sideBar.width || "";
                    // Set min-width to default
                    sideBar.style.minWidth = "";
                });
    
                // Closes the menu
                toggler.setInactiveListener(() => {
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
                this.main.classes.add("main", "flex", "grow");
            },

            // Title text field
            titleTextField: () => {
                // Attach the title text field
                const titleInput = this.main.titleTextField = this.main.addComponent(new TextField());

                // Set the input properties
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
                            fontSize: "17px",
                            whiteSpace: "pre",
                            width: "auto"
                        });
                        this.element.appendChild(valueElement);
                    }

                    // The input width will resize to the width of the value element
                    valueElement.innerText = titleInput.element.value;
                    titleInput.style.width =
                        (valueElement.clientWidth + 25) + "px";
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
                // Container for the settings button
                const container = this.addComponent(new Container(
                    "settings-button",
                    document.createElement("div")
                ));

                // Attach the settings button
                const button = this.buttons.settings = container.addComponent(new Button({
                    innerHTML: /* html */ `<img src="img/settings.svg">`
                }));
                this.buttons.settings.classes.add("settings", "opacity-70");

                // Tooltip builder for the settings button
                container.addComponent(new TooltipBuilder(
                    button,
                    new PointingTooltip("Settings", "bottom")
                ));
            }
        };
    }
}

// Editor menu bar
// Has tabs that you can click on
class EditorMenu extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-menu", "flex");

        // Holds the buttons
        this.buttons = {};

        // Initialize components
        // Make sure methods should be arrow functions
        this._init = {
            // Attach the main part of the editor menu (grows)
            // NavigatorMenu will go in here
            main: () => {
                this.main = this.addComponent(new Component(
                    document.createElement("div")
                ));
                this.main.classes.add("main", "grow");
            },
        };

        // Initialize
        this._init.main();
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
            // Initialized in EditorPanel..constructor
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

        // Forward
        this.navigator = undefined;
        this.navigatorMenu = undefined;
        this.navigatorViewer = undefined;
        
        // Initialize
        this._init = {
            navigator: () => {
                // Navigator
                this.navigator = new Navigator();
                this.navigatorMenu = this.menu.main.addComponent(this.navigator.menu);
                this.navigatorViewer = this.controls.addComponent(this.navigator.viewer);

                this.navigatorMenu.classes.add("flex");
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
                    activeIndicator.style.transform = `translateX(${
                        button.element.offsetLeft - button.getParent().element.offsetLeft
                    }px)`;
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
class EditorSideBar extends SideBar {
    constructor() {
        super();
        this.classes.add("editor-side-bar");

        // Header
        this.main = this.addComponent(new Main());
        this.header = this.main.addComponent(new Header());

        this._init = {
            header: () => {
                const header = this.header;
                const location = header.addComponent(new Section("location", ""));
                const dropdown = new Dropdown({
                    alignment: "right",
                    width: 120,
                    rowHeight: 24
                });
                const add = new DropdownToggler(dropdown);
                const dropdownFacade = header.addComponent(new DropdownFacade(add, dropdown));

                header.classes.add("flex");

                location.classes.add("location", "grow");

                dropdown.addRow(new DropdownRow());
                dropdown.addRow(new DropdownRow());
                
                add.classes.add("new", "opacity-70");
                add.addComponent(new Icon("./img/new.svg", 0, 0, 12, 12));

                const addPage = dropdown.rows[0].addComponent(new Button());
                const addSection = dropdown.rows[1].addComponent(new Button());
                
                addPage.element.innerText = "Add page";
                addSection.element.innerText = "Add section";
            }
        };

        this._init.header();
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

// Editor
// The main part of editing is here
class Editor extends Component {
    constructor(notebookHandler) {
        // Initialize element
        super(document.createElement("div"));
        this.classes.add("editor", "flex");

        // Notebook handler
        this.notebookHandler = notebookHandler;

        // Add the top bar
        this.topBar = this.addComponent(new EditorTopBar);

        // Add the main section
        this.main = this.addComponent(new Main());
        this.main.classes.add("flex");
        // Left
        this.sideBar = this.main.left = this.main.addComponent(new EditorSideBar);
        // Right
        this.mainMain = this.main.right = this.main.addComponent(new Main());
        this.panel = this.mainMain.addComponent(new EditorPanel);
        this.content = this.mainMain.addComponent(new EditorContent);

        // Initailize top bar stuff
        this.topBar._init.menuToggler();
        this.topBar._init.main();
        this.topBar._init.titleTextField();
        this.topBar._init.settingsButton();
    }
    get notebookOpen() {
        return this.notebookHandler.active;
    }
}

// Export
export default Editor
export {
    Editor,
    EditorTopBar,
    EditorSideBar,
    EditorMenu, EditorControls, EditorPanel,
    EditorContent
}


