/**
 * js/editor/editor.js
 * 
 * The main part of the app. Includes the editor panel on
 * the top, with controls and menus, and the editor content,
 * which displays the notebook sections and pages
 */


"use strict";

import EditorPanel, { EditorMenu, EditorControls } from "./editor-panel.js"
import EditorView, { EditorNavigation, EditorContent } from "./editor-view.js"

// Editor
// The main part of the program is here
const Editor = {
    // Editor element
    element: document.createElement("div"),

    // Components
    Panel: EditorPanel,
    View: EditorView,

    // Initialize
    init: function() {
        
    },

    // Render the element
    render: function(where) {
        
    }
};

// Export
export default Editor
export {
    Editor,
    EditorMenu, EditorControls, EditorPanel,
    EditorNavigation, EditorContent, EditorView
}


