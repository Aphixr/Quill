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
    Section, Main, Header, SideBar, Icon
} from "../components.js"

// Editor top bar
// The bar on the very top of the editor
class EditorTopBar extends Header {
    constructor() {
        super();
        this.classes.add("editor-top-bar", "flex");

        // Holds the buttons
        this.buttons = {};
    }

    initView() {
        this.toggleMenu = this.addComponent(new Toggler(true));
        this.main = this.addComponent(new Main());
        this.textFieldTitle = this.main.addComponent(new TextField());
        this.buttonSettings = this.addComponent(new Button());

        this.toggleMenu.html = /* html */ `<img src="img/menu.svg">`;
        this.toggleMenu.classes.add("menu", "opacity-70");
        this.getParent().app.pointingTooltip.addTarget(this.toggleMenu, "Menu");

        this.main.classes.add("main", "flex", "grow");

        this.textFieldTitle.classes.add("title");
        this.textFieldTitle.setAttribute("maxlength", 64);

        this.buttonSettings.html = /* html */ `<img src="img/settings.svg">`;
        this.buttonSettings.classes.add("settings", "opacity-70");
        this.getParent().app.pointingTooltip.addTarget(this.buttonSettings, "Settings");

        // Resizes title input to fit value
        this.textFieldTitle.resize = () => {
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
            valueElement.innerText = this.textFieldTitle.value;
            this.textFieldTitle.style.width =
                (valueElement.clientWidth + 25) + "px";
        };
    }

    initFunction() {
        // Menu toggler
        const sideBar = this.getParent().sideBar;
        this.toggleMenu.setActiveListener(() => {
            sideBar.style.width = sideBar.width || "";
            sideBar.style.minWidth = "";
        });
        this.toggleMenu.setInactiveListener(() => {
            sideBar.style.width = sideBar.style.minWidth = "0px";
        });

        // Title input
        const titleInput = this.textFieldTitle;

        // Auto select all the text when focused on
        titleInput.addEventListener("focus", (event) => {
            titleInput.element.select();
        }, null, false);

        // On unfocus (blur)
        titleInput.addEventListener("blur", (event) => {
            // If the notebook title is empty,
            // set it to the default "New notebook"
            if (titleInput.element.value.trim() === "") {
                titleInput.element.value = "New notebook";
                titleInput.resize();
            }
        }, null, false);

        // When the user types something, resize to fit to value
        titleInput.addEventListener("input", (event) => {
            titleInput.resize();
        }, null, false);
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
    constructor(app) {
        // Initialize element
        super(document.createElement("div"));
        this.classes.add("editor", "flex");

        this.app = app;

        // Notebook handler
        this.notebookHandler = app.notebookHandler;

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
        this.topBar.initView();
        this.topBar.initFunction();
    }

    // Get the active notebook
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


