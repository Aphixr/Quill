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
import { NotebookPiece } from "./notebook.js"
import {
    Navigator, NavigatorButton, View,
    Button, Toggler, TextField,
    DropdownFacade, DropdownToggler, Dropdown,
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
    }

    initView() {
        this.toggleMenu = this.addComponent(new Toggler(
            new Icon("img/menu.svg", 0, 0, 20, 20), true, ["menu", "opacity-70"]
        ));
        this.main = this.addComponent(new Main());
        this.textFieldTitle = this.main.addComponent(new TextField("title"));
        this.buttonSettings = this.addComponent(new Button(
            /* html */ `<img src="img/settings.svg">`, ["settings", "opacity-70"]
        ));

        this.getParent().app.pointingTooltip.addTarget(this.toggleMenu, "Menu");

        this.main.classes.add("main", "flex", "grow");

        // this.textFieldTitle.classes.add("title");
        this.textFieldTitle.setAttribute("maxlength", 64);

        // this.buttonSettings.html = /* html */ `<img src="img/settings.svg">`;
        // this.buttonSettings.classes.add("settings", "opacity-70");
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
        // Also update the notebook cover title
        titleInput.addEventListener("input", (event) => {
            titleInput.resize();
            this.notebookHandler.active.cover.title = titleInput.value;
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

        // Initialize
        this.initView();
    }

    initView() {
        this.main = this.addComponent(new Main());
        this.main.classes.add("main", "grow");
    }
}

// Editor controls
// Controls for editing the notebook. Click on the tabs
// in `EditorMenu` to change what `EditorControls` will display
class EditorControls extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("editor-controls", "flex");
    }

    initView() {
        // Fixed controls
        // These controls will be always be on the editor controls,
        // even after switching editor panel tabs
        // Initialized in EditorPanel..constructor
        this.fixed = this.addComponent(new Section());
        this.fixed.classes.add("fixed");
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
        this.initView();
        this.controls.initView();
        this.initFunction();
    }

    initView() {
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
            this.navigator.addPage({
                button: new NavigatorButton(capName),
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
    }
    
    initFunction() {
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
}

// Editor sidebar
// Displays content of whatever tab user clicked on in EditorActivity
class EditorSideBar extends SideBar {
    constructor() {
        super();
        this.classes.add("editor-side-bar");

        // Header
        this.container = this.addComponent(new Container());
        this.header = this.container.addComponent(new Header());
        this.main = this.container.addComponent(new Main());
        this.navigator;

        // Keep track of pages and sections added
        this.numPagesAdded = 0;
        this.numSectionsAdded = 0;
    }

    // Initialize view
    initView() {
        const header = this.header;
        header.location = header.addComponent(new Section("location"));
        header.dropdownAdd = new Dropdown({
            alignment: "right",
            width: 120,
            rowHeight: 24
        });
        header.buttonAdd = new DropdownToggler(
            new Icon("img/new.svg", 0, 0, 12, 12), header.dropdownAdd, ["new", "opacity-70"]
        );
        header.dropdownFacade = header.addComponent(new DropdownFacade(
            header.buttonAdd, header.dropdownAdd
        ));

        header.classes.add("flex");
        header.location.classes.add("location", "grow");
        header.dropdownAdd.createRows(2);
        // header.buttonAdd.classes.add("new", "opacity-70");
        // header.buttonAdd.addComponent(new Icon("img/new.svg", 0, 0, 12, 12));
        this.addPage = header.dropdownAdd.rows[0].addComponent(new Button("Add page"));
        this.addSection = header.dropdownAdd.rows[1].addComponent(new Button("Add section"));
        
        this.navigator = new Navigator(this.main.element, this.editor.content.element);
    }

    // Initialize function
    initFunction() {
        this.addPage.addClickListener(() => {
            this.numPagesAdded++;
            
            const page = this.notebookHandler.active.createPage();

            const button = new NavigatorButton(null, "page" + this.numPagesAdded);
            const view = new View("page" + this.numPagesAdded);
            
            this.addNavigatorPage(page, button, view);
        });

        this.addSection.addClickListener(() => {
            this.numSectionsAdded++;

            const section = this.notebookHandler.active.createSection();

            const button = new NavigatorButton(null, "section" + this.numSectionsAdded);
            const view = new View("section" + this.numSectionsAdded);
            
            this.addNavigatorPage(section, button, view);
        });
    }

    // Add a navigator page
    addNavigatorPage(piece, button, view) {
        if (!(piece instanceof NotebookPiece)) {
            throw new TypeError("'piece' argument expected instance of NotebookPiece");
        }
        if (!(button instanceof NavigatorButton)) {
            throw new TypeError("'button' argument expected instance of NavigatorButton");
        }
        if (!(view instanceof View)) {
            throw new TypeError("'view' argument expected instance of View");
        }

        button.classes.add("notebook-piece", "notebook-section");
        
        // Cancel toggle if not clicked on button or main
        button.setBeforeChangeListener((event) => {
            return button.element.contains(event.target) &&
                   event.target !== button.element &&
                   event.target !== button.main.element;
        });

        // Create components
        button.main = button.addComponent(new Main("title"));
        button.textFieldTitle = button.main.addComponent(new TextField());
        button.dropdownMore = new Dropdown({
            alignment: "right",
            width: 120,
            rowHeight: 24
        });
        button.buttonMore = new DropdownToggler(
            new Icon("img/menu.svg", 15, 0, 15, 15), button.dropdownMore
        );
        button.dropdownFacade = button.addComponent(new DropdownFacade(
            button.buttonMore, button.dropdownMore
        ));

        // Title text field
        button.textFieldTitle.value = piece.title;
        button.textFieldTitle.disable();
        
        // Let the user rename on double click
        button.textFieldTitle.on = () => {
            button.textFieldTitle.enable();
            button.textFieldTitle.style.pointerEvents = "auto";
            button.textFieldTitle.select();
        };
        // Disable text field when it loses focus
        button.textFieldTitle.off = () => {
            button.textFieldTitle.disable();
            button.textFieldTitle.style.pointerEvents = "none";
            window.getSelection().removeAllRanges();
            piece.title = button.textFieldTitle.value;
        };

        // Dropdown compoennts
        // button.buttonMore.addComponent(new Icon("img/menu.svg", 15, 0, 15, 15));
        button.dropdownFacade.classes.add("more");
        button.dropdownMore.createRows(2);
        const buttonRename = button.dropdownMore.rows[0].addComponent(new Button(
            "Rename", "rename"
        ));
        const buttonDelete = button.dropdownMore.rows[1].addComponent(new Button(
            "Delete", "delete"
        ));

        // Rename piece
        buttonRename.addClickListener(button.textFieldTitle.on);
        
        // Delete piece
        buttonDelete.addClickListener(() => {
            // If the user deleted this button while it was active
            // Another page needs to be made active
            if (button.isActive) {
                const index = this.navigator.menu.children.indexOf(button);

                // Open next if it exists
                if (this.navigator.menu.children[index + 1]) {
                    this.navigator.menu.children[index + 1].activate();
                }
                // Open previous if it exists
                else if (index - 1 >= 0) {
                    this.navigator.menu.children[index - 1].activate();
                }
                // If none, it means there are no pages
                else;
            }

            // CSS transition will make the button slide away
            button.style.overflowY = "hidden";
            button.style.height = "0px";
            button.style.opacity = "0";

            // Delete page from notebook and navigator
            setTimeout(() => {
                this.notebookHandler.active.deletePage(piece.symbol);
                this.navigator.deletePage(button.getIndex());
            }, 120);
        });

        // For text field
        button.main.addEventListener("dblclick", button.textFieldTitle.on);
        button.textFieldTitle.addEventListener("blur", button.textFieldTitle.off, null, false);

        // Add page to navigator
        const activeButton = this.navigator.menu.activeButton;
        this.navigator.addPage({
            // Adds page after the active page
            index: activeButton ? activeButton.getIndex() + 1 : undefined,
            button: button,
            view: view
        });

        // CSS transition will make button slide down
        setTimeout(() => {
            button.style.top = "0px";
            button.style.height = "32px";
            button.style.opacity = "1";
        });

        // Let the user rename immediately after creating
        button.textFieldTitle.on();

        // Open this new page
        button.element.click();
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

        // Assign this object to this editor's components
        const editor = this;
        const info = {
            app: app,
            notebookHandler: editor.notebookHandler,
            editor: editor
        };

        Object.assign(this.topBar, info);
        Object.assign(this.sideBar, info);
        Object.assign(this.panel, info);
        Object.assign(this.content, info);

        // Initailize components
        this.topBar.initView();
        this.topBar.initFunction();
        this.sideBar.initView();
        this.sideBar.initFunction();
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


