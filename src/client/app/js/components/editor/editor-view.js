/**
 * js/editor/editor-view.js
 * 
 * Shows the contents of a notebook and notebook pages.
 * Also includes the navigation bar on the left for
 * navigating to sections and pages.
 */


"use strict";

import Component from "../../quartz.js"
import { Navigator } from "../input.js"

// Editor sidebar
// Displays content of whatever tab user clicked on in EditorActivity
class EditorSideBar extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.id = "editor-side-bar";
    }
}

// Editor activity bar
// Shows tabs that can be switched between
class EditorActivityBar extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.id = "editor-activity-bar";
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

        // Add components
        this.activityBar = this.addComponent("activity-bar", new EditorActivityBar);
        this.sideBar = this.addComponent("side-bar", new EditorSideBar);
        this.content = this.addComponent("content", new EditorContent);
        
        // Initialize the navigator
        this.activityNavigator = new Navigator();
    }
}

// Export
export default EditorView
export { EditorSideBar, EditorContent }


