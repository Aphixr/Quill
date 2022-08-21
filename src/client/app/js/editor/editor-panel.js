/**
 * js/editor/editor-panel.js
 * 
 * Controls for editing notebooks. Menu tabs and tab
 * content are found here. Does not include notebook
 * navigation (found in editor-view.js).
 */


"use strict";

// Editor menu bar
// Has tabs that you can click on and edit notebook title
const EditorMenu = {
    // Element
    element: document.createElement("div"),

    // Initialize
    init: function() {
        
    },

    // Render the element
    render: function(where) {
        
    }
};

// Editor controls
// Controls for editing the notebook. Click on the tabs
// in `EditorMenu` to change what `EditorControls`
// will display
const EditorControls = {
    // Element
    element: document.createElement("div"),

    // Initialize
    init: function() {
        
    },

    // Render the element
    render: function(where) {
        
    }
};

// Editor panel
// Includes the editor menu and the controls
const EditorPanel = {
    // Element
    element: document.createElement("div"),

    // Components
    Menu: EditorMenu,
    Controls: EditorControls,

    // Initialize
    init: function() {
        
    },

    // Render the element
    render: function(where) {
        
    }
};

// Export
export default EditorPanel
export { EditorMenu, EditorControls }


