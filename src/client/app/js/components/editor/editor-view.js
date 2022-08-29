/**
 * js/editor/editor-view.js
 * 
 * Shows the contents of a notebook and notebook pages.
 * Also includes the navigation bar on the left for
 * navigating to sections and pages.
 */


"use strict";

import Component from "../../quartz.js"

// Editor navigation
// Navigate between sections and pages of a notebook
class EditorNavigation extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.id = "editor-navigation";
    }
}

// Editor content
// Displays the content of a notebook page
class EditorContent extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.id = "editor-content";
    }
}

// Editor view
// Shows the contents of the notebook and notebook page
class EditorView extends Component {
    constructor() {
        // Initialize this element
        super(document.createElement("div"));
        this.element.id = "editor-view";
        this.element.classList.add("flex");

        // Add navigation and content components
        this.addComponent("navigation", new EditorNavigation);
        this.addComponent("content", new EditorContent);
    }
}

// Export
export default EditorView
export { EditorNavigation, EditorContent }


