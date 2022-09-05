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
        
        // Attach the home button
        // Home button brings user to a page where they see all the notebooks
        this.homeButton = this.addComponent("home-button", new Button({
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

        // Notebook title text field
        this.notebookPanel.notebookTitleTextField =
            this.notebookPanel.addComponent("notebook-title-text-field", new TextField({
                id: "notebook-title",
                value: "Untitled notebook",
                placeholder: "Notebook title"
            }));
        this.notebookPanel.notebookTitleTextField.element.setAttribute(
            "maxlength", 40
        );
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
                innerText: "File"
            }),
            new NavigatorButton({
                innerText: "Edit"
            }),
            new NavigatorButton({
                innerText: "Media"
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
                });
            }
        }
    }
}

// Export
export default EditorPanel
export { EditorMenu, EditorControls }


