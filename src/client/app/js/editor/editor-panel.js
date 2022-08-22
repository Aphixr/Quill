/**
 * js/editor/editor-panel.js
 * 
 * Controls for editing notebooks. Menu tabs and tab
 * content are found here. Does not include notebook
 * navigation (found in editor-view.js).
 */


"use strict";

import Component from "../quartz.js"

// Editor menu bar
// Has tabs that you can click on and edit notebook title
class EditorMenu extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.id = "editor-menu";
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
        this.setComponent("Menu", new EditorMenu);
        this.setComponent("Controls", new EditorControls);
        this.attachComponent("Menu");
        this.attachComponent("Controls");
    }
}

// Export
export default EditorPanel
export { EditorMenu, EditorControls }


