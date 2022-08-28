/**
 * js/editor/editor.js
 * 
 * The main part of the app. Includes the editor panel on
 * the top, with controls and menus, and the editor content,
 * which displays the notebook sections and pages
 */


"use strict";

import Component from "../../quartz.js"
import EditorPanel, { EditorMenu, EditorControls } from "./editor-panel.js"
import EditorView, { EditorNavigation, EditorContent } from "./editor-view.js"

// Editor
// The main part of the program is here
class Editor extends Component {
    constructor() {
        // Initialize element
        super(document.createElement("div"));
        this.element.id = "editor";

        // Add some components
        this.addComponent("panel", new EditorPanel);
        this.addComponent("view", new EditorView);
    }
}

// Export
export default Editor
export {
    Editor,
    EditorMenu, EditorControls, EditorPanel,
    EditorNavigation, EditorContent, EditorView
}


