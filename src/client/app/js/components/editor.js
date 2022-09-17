/**
 * js/editor/editor.js
 * 
 * The main part of the app. Includes the editor panel on
 * the top, with controls and menus, and the editor content,
 * which displays the notebook sections and pages
 */


"use strict";

// Import
import { State, Component } from "../quartz.js"
import quill from "../quill.js"
import { Navigator, NavigatorButton, Button, TextField } from "./input.js"

// Editor menu bar
// Has tabs that you can click on and edit notebook title
class EditorMenu extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.classList.add("editor-menu", "flex");

        // Holds the buttons
        this.buttons = {};

        // Attach a notebook related <div> notebookPanel
        // This notebook panel will hold notebook related actions and buttons
        // including the notebook title and menu buttons
        this.notebookPanel = this.addComponent(new Component(
            document.createElement("div")
        ));
        this.notebookPanel.element.classList.add("section");

        // Notebook title text field
        {
            // Attach the title text field
            this.notebookPanel.notebookTitleTextField =
                this.notebookPanel.addComponent(new TextField({
                    id: "notebook-title",
                    value: "Untitled notebook"
                }));
            
            // Constants
            const notebookTitleInput = this.notebookPanel.notebookTitleTextField;
            // Automatically resize input element
            notebookTitleInput.element.resizeWidth = () => {
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
                notebookTitleInput.element.style.width =
                    (valueElement.clientWidth + 27) + "px";
            };

            // Maximum length
            notebookTitleInput.element.setAttribute(
                "maxlength", 64
            );
            // Auto select all the text when focused on
            notebookTitleInput.element.addEventListener(
                "focus", (event) => {
                    notebookTitleInput.element.select();
                }
            );
            // On unfocus (blur)
            notebookTitleInput.element.addEventListener(
                "blur", (event) => {
                    if (notebookTitleInput.element.value.trim() === "") {
                        notebookTitleInput.element.value = "Untitled notebook";
                        notebookTitleInput.element.resizeWidth();
                    }
                }
            );
            // When the user types something
            notebookTitleInput.element.addEventListener(
                "input", (event) => {
                    notebookTitleInput.element.resizeWidth();
                }
            );
        }

        // Attach the settings button
        this.buttons.settings = this.addComponent(new Button({
            id: "settings-button",
            innerHTML: /* html */ `<img src="img/settings.svg">`
        }));
    }
}

// Editor controls
// Controls for editing the notebook. Click on the tabs
// in `EditorMenu` to change what `EditorControls` will display
class EditorControls extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.classList.add("editor-controls");
    }
}

// Editor panel
// Includes the editor menu and the controls
class EditorPanel extends Component {
    constructor() {
        // Initialize element
        super(document.createElement("div"));
        this.element.classList.add("editor-panel");

        // Add some components
        this.menu = this.addComponent(new EditorMenu);
        this.controlsNavigator = new Navigator();
        this.controlsNavigatorMenu = this.menu.notebookPanel.addComponent(this.controlsNavigator.menu);
        this.controls = this.addComponent(new EditorControls);

        this.controlsNavigator.menu.addButtons(
            new NavigatorButton({
                innerText: "Edit"
            }),
            new NavigatorButton({
                innerText: "Insert"
            }),
            new NavigatorButton({
                innerText: "Draw"
            }),
            new NavigatorButton({
                innerText: "Interactive"
            }),
            new NavigatorButton({
                innerText: "View"
            }),
        );

        // The blue bar on the bottom that moves
        // when the user click on something
        this.menu.notebookPanel.activeIndicator =
            this.menu.notebookPanel.addComponent(new Component(
                document.createElement("div")
            ));
        this.menu.notebookPanel.activeIndicator.element.classList.add("active-indicator");

        // Set click listeners
        {
            // Temporary variable pointing to `this`
            let editorPanel = this;
            for (const i in this.controlsNavigator.menu.children) {
                this.controlsNavigator.menu.children[i].setClickListener(function(event) {
                    // Constants
                    const activeIndicator = editorPanel.menu.notebookPanel.activeIndicator.element;
                    const boundingRect = this.element.getBoundingClientRect();

                    // Translate the active indicator
                    activeIndicator.style.transform = `translateX(calc(${boundingRect.x}px))`;
                    activeIndicator.style.width = `${boundingRect.width}px`;

                    // Auto unfocus the button
                    this.element.blur();
                });
            }
        }
    }
}

// Editor sidebar
// Displays content of whatever tab user clicked on in EditorActivity
class EditorSideBar extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.classList.add("editor-side-bar");
    }
}

// Editor content
// Displays the content of a notebook page
class EditorContent extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.classList.add("editor-content");
    }
}

// Editor view
// Shows the contents of the notebook and notebook page
class EditorView extends Component {
    constructor() {
        // Initialize this element
        super(document.createElement("div"));
        this.element.classList.add("editor-view");
        this.element.classList.add("flex");

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
        this.element.classList.add("editor");

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


