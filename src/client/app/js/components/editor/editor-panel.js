/**
 * js/editor/editor-panel.js
 * 
 * Controls for editing notebooks. Menu tabs and tab
 * content are found here. Does not include notebook
 * navigation (found in editor-view.js).
 */


"use strict";

import Component from "../../quartz.js"
import quill from "../../quill.js"
import { Navigator, NavigatorButton, Button, TextField } from "../input.js"

// Editor menu bar
// Has tabs that you can click on and edit notebook title
class EditorMenu extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.id = "editor-menu";
        this.element.classList.add("flex");

        // Holds the buttons
        this.buttons = {};
        
        // Attach the home button
        // Home button brings user to a page where they see all the notebooks
        this.buttons.home = this.addComponent("home-button", new Button({
            id: "home-button",
            innerHTML: /* html */ `<img src="${quill.path.logo}">`,
            onclick: (event) => {
                location.hash = "#view:notebooks";
            }
        }));

        // Attach a notebook related <div> notebookPanel
        // This notebook panel will hold notebook related actions and buttons
        // including the notebook title and menu buttons
        this.notebookPanel = this.addComponent("notebook-panel", new Component(
            document.createElement("div")
        ));
        this.notebookPanel.element.classList.add("section");

        // Notebook title text field
        {
            // Attach the title text field
            this.notebookPanel.notebookTitleTextField =
                this.notebookPanel.addComponent("notebook-title-text-field", new TextField({
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
        this.buttons.settings = this.addComponent("settings-button", new Button({
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
        this.element.id = "editor-controls";
    }
}

// Editor panel
// Includes the editor menu and the controls
class EditorPanel extends Component {
    constructor() {
        // Initialize element
        super(document.createElement("div"));
        this.element.id = "editor-panel";

        // Add some components
        this.menu = this.addComponent("menu", new EditorMenu);
        this.controlsNavigator = new Navigator();
        this.controlsNavigatorMenu = this.menu.notebookPanel.addComponent("controls-navigator-menu", this.controlsNavigator.menu);
        this.controls = this.addComponent("controls", new EditorControls);

        this.controlsNavigator.menu.addButtons(
            new NavigatorButton({
                innerText: "Setup"
            }),
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
            this.menu.notebookPanel.addComponent("active-indicator", new Component(
                document.createElement("div")
            ));
        this.menu.notebookPanel.activeIndicator.element.classList.add("active-indicator");

        // Set click listeners
        {
            // Temporary variable pointing to `this`
            let editorPanel = this;
            for (const i in this.controlsNavigator.menu.components) {
                this.controlsNavigator.menu.components[i].setClickListener(function(event) {
                    // Constants
                    const activeIndicator = editorPanel.menu.notebookPanel.activeIndicator.element;
                    const boundingRect = this.element.getBoundingClientRect();

                    // Translate the active indicator
                    activeIndicator.style.transform = `translateX(calc(${boundingRect.x}px - 60px))`;
                    activeIndicator.style.width = `${boundingRect.width}px`;

                    // Auto unfocus the button
                    this.element.blur();
                });
            }
        }
    }
}

// Export
export default EditorPanel
export { EditorMenu, EditorControls }


