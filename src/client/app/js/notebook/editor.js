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
import { NotebookPage, NotebookSection } from "./notebook.js"
import {
    Navigator, NavigatorMenu, NavigatorViewer, NavigatorButton, View,
    Button, Toggler, Expander, TextField,
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

        // Like focused element, but stays focused when clicked off
        this.activeButton = null;
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
        this.addPage = header.dropdownAdd.rows[0].addComponent(new Button("Add page"));
        this.addSection = header.dropdownAdd.rows[1].addComponent(new Button("Add section"));
        
        this.navigator = new Navigator(
            new NavigatorMenu(this.main.element),
            new NavigatorViewer(this.editor.content.element)
        );
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
            
            this.addNotebookSection(section);
        });
    }

    // Make a button active
    makeActive(button) {
        // Old active
        if (this.activeButton) {
            this.activeButton.classes.remove("latest");
        }
        // New active
        this.activeButton = button;
        this.activeButton.classes.add("latest");
    }

    // Create components
    createButtonComponents(piece, menuButton, contentView) {
        const button = menuButton || new NavigatorButton();
        const view = contentView || null;
        const main = button.addComponent(new Main("title"));
        const title = main.addComponent(new TextField());
        const dropdown = new Dropdown({
            alignment: "right",
            width: 120,
            rowHeight: 24
        });
        const more = new DropdownToggler(
            new Icon("img/menu.svg", 15, 0, 15, 15), dropdown
        );
        const dropdownFacade = button.addComponent(new DropdownFacade(more, dropdown));

        button.classes.add(
            "notebook-piece",
            piece instanceof NotebookPage ? "notebook-page" : "notebook-section"
        );

        // Return all objects
        return {
            button: button,
            view: view,
            main: main,
            title: title,
            dropdown: dropdown,
            more: more,
            dropdownFacade: dropdownFacade
        }
    }

    // Initialize components
    initializeButtonComponents(piece, components, sectionComponents={}) {
        const { button, main, title, dropdown, dropdownFacade } = components;
        const { container, notebookPieces } = sectionComponents;
        
        // Dropdown
        dropdownFacade.classes.add("more");
        dropdown.createRows(2);
        const renamePage = dropdown.rows[0].addComponent(new Button("Rename", "rename"));
        const deletePage = dropdown.rows[1].addComponent(new Button("Delete", "delete"));

        // Cancel toggle if not clicked on button or main
        button.setBeforeChangeListener((event) => {
            return button.element.contains(event.target) &&
                   event.target !== button.element &&
                   event.target !== main.element;
        });

        // Make this the active button when clicked on
        button.addClickListener(() => {
            this.makeActive(button);
        });
        
        // Title
        title.value = piece.title;
        title.disable();

        // Rename title
        title.on = () => {
            title.enable();
            title.style.pointerEvents = "auto";
            title.select();
        };

        // Disable text field
        title.off = () => {
            title.disable();
            title.style.pointerEvents = "none";
            window.getSelection().removeAllRanges();
            piece.title = title.value;
        };

        if (piece instanceof NotebookPage) {
            main.addEventListener("dblclick", title.on);
        }
        title.addEventListener("blur", title.off, null, false);

        // Rename
        renamePage.addClickListener(title.on);

        // Delete
        deletePage.addClickListener(() => {
            // If the user deleted this button while it was active
            // Another page needs to be made active
            if (button.isActive) {
                const index = this.navigator.menu.buttons.indexOf(button);

                // Open next if it exists
                if (this.navigator.menu.buttons[index + 1]) {
                    this.navigator.menu.buttons[index + 1].activate();
                }
                // Open previous if it exists
                else if (index - 1 >= 0) {
                    this.navigator.menu.buttons[index - 1].activate();
                }
                // If none, it means there are no pages
                else;
            }

            // CSS transition will make the button slide away
            button.style.overflowY = "hidden";
            button.style.height = "0px";
            button.style.opacity = "0";

            if (piece instanceof NotebookSection) {
                // Remove the notebook pieces
                container.removeComponent(notebookPieces);
            }

            // Set the new active button to the active navigator button
            this.makeActive(this.navigator.menu.activeButton);

            // Delete page/section from notebook and navigator
            setTimeout(() => {
                this.notebookHandler.active.deletePage(piece.symbol);
                if (piece instanceof NotebookPage) {
                    this.navigator.deletePage(button.getIndex());
                }
                if (piece instanceof NotebookSection) {
                    container.getParent().removeComponent(container);
                }
            }, 120);
        });
    }

    // Add a button
    addButton(piece, components, sectionComponents={}) {
        const { button, title, view } = components;
        const { container, empty } = sectionComponents;

        // Add page to navigator
        if (piece instanceof NotebookPage) {
            const shouldAddButton = !this.activeButton || this.activeButton.parentElement instanceof NavigatorMenu
            this.navigator.addPage({
                // Adds page after the active page
                index: (() => {
                    if (!this.activeButton) {
                        return;
                    }
                    if (this.activeButton instanceof NavigatorButton) {
                        return this.activeButton.getIndex() + 1;
                    } else {
                        return this.navigator.menu.children.indexOf(this.activeButton.getParent());
                    }
                })(),
                button: button,
                view: view,
                shouldAddButton: shouldAddButton
            });
        }

        // Manually add the button
        const child = piece instanceof NotebookPage ? button : container;
        if (this.activeButton) {
            const activeButton = this.activeButton;
            const activeButtonParent = activeButton.getParent();

            // If the active button is a navigator button
            // Add this button after the active button
            if (activeButton instanceof NavigatorButton) {
                // Get the index of the active button in its parent
                const index = activeButtonParent.children.indexOf(this.activeButton) + 1;

                if (index === activeButtonParent.children.length) {
                    activeButtonParent.addComponent(child);
                } else {
                    activeButtonParent.insertComponentBefore(child, this.activeButton.parent.children[index]);
                }
            }
            // If the active button is a section expander
            // Add the button to the end of the section
            else {
                // Automatically expand section if it is closed
                if (!activeButton.isActive) {
                    activeButton.element.click();
                }

                activeButton.targets[0].addComponent(child);
            }
        }

        // CSS transition will make button slide down
        setTimeout(() => {
            button.style.top = "0px";
            button.style.height = "32px";
            button.style.opacity = "1";
        });

        // Set padding left based on how many sections it is in (deep)
        let deep = 0;
        // deep += 0.5 because the buttons is in a .notebook-pieces and a .notebook-section
        for (let parent = button.getParent(), menu = this.navigator.menu; parent !== menu; deep += 0.5) {
            parent = parent.getParent();
        }
        // Set padding left
        // 14 is the amount of padding left to increase by for every piece
        if (piece instanceof NotebookPage) {
            button.style.paddingLeft = (14 * deep + 35) + "px";
        }
        if (piece instanceof NotebookSection) {
            const paddingLeft = 14 * (deep - 0.5);
            button.style.paddingLeft = paddingLeft + "px";
            empty.style.paddingLeft = (paddingLeft + 35 + 14) + "px";
        }

        // Let the user rename immediately after creating
        if (piece instanceof NotebookSection || (piece instanceof NotebookPage && button.getIndex() !== 0)) {
            title.on();
        }

        // Open this
        button.element.click();
    }

    // Add a navigator page
    addNavigatorPage(notebookPage, button, view) {
        if (!(notebookPage instanceof NotebookPage)) {
            throw new TypeError("'notebookPage' argument expected instance of NotebookPage");
        }
        if (!(button instanceof NavigatorButton)) {
            throw new TypeError("'button' argument expected instance of NavigatorButton");
        }
        if (!(view instanceof View)) {
            throw new TypeError("'view' argument expected instance of View");
        }

        const components = this.createButtonComponents(notebookPage, button, view);
        this.initializeButtonComponents(notebookPage, components);
        this.addButton(notebookPage, components);
    }

    // Add a section
    addNotebookSection(notebookSection) {
        if (!(notebookSection instanceof NotebookSection)) {
            throw new TypeError("'notebookSection' argument expected instance of NotebookSection");
        }

        // Create section components
        const container = new Container("notebook-section");
        const button = container.addComponent(new Expander(new Icon("img/arrows.svg", 12, 0, 12, 12)));
        const notebookPieces = container.addComponent(new Container("notebook-pieces"));
        const empty = notebookPieces.addComponent(new Component(document.createElement("span")));

        button.addTarget(notebookPieces);
        notebookPieces.classes.add("notebook-pieces");
        empty.classes.add("empty");
        empty.text = "(empty)";

        const sectionComponents = {
            container: container,
            notebookPieces: notebookPieces,
            empty: empty
        };

        const components = this.createButtonComponents(notebookSection, button);
        this.initializeButtonComponents(notebookSection, components, sectionComponents);
        this.addButton(notebookSection, components, sectionComponents);
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


