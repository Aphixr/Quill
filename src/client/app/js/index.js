/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be loaded and displayed to the user.
 */


"use strict";

import dev from "./dev.js"
import quill from "./quill.js"
import {
    Editor, Navigator, TextField, HorizontalResizer
} from "./components.js"


/* =================== */
/* Load                */
/* =================== */

// Components
const navigator = new Navigator();
const editor = new Editor();
const editorPanelMenu = editor.getComponent("panel", "menu");
const editorViewNavigation = editor.getComponent("view", "navigation");
const editorViewContent = editor.getComponent("view", "content");

// Attaches the navigator toggler to the menu bar
// Toggler is an image of logo
editorPanelMenu.addComponent("navigatorToggler", navigator.toggler);

// Attach the input for changing the notebook title
editorPanelMenu.addComponent("notebookTitleTextField", new TextField({
    id: "notebook-title",
    value: "Untitled notebook",
    placeholder: "Notebook title",
    title: "Notebook title"
}));

// Add the horizontal resizer
editorViewNavigation.addComponent("horizontalResizer", new HorizontalResizer("right"));

// Add listeners
editorViewNavigation.getComponent("horizontalResizer").setMousedownListener();
editorViewNavigation.getComponent("horizontalResizer")
    .setMouseupListener(function(event) {
        // Collapse the editor navigation completely
        // if the cursor reaches a certain point
        if (event.clientX < 120) {
            this.element.style.width = this.element.style.minWidth = "0px";
        } else {
            this.element.style.minWidth = "14rem";
        }
    });
editorViewNavigation.getComponent("horizontalResizer")
    .setMousemoveListener(function(event) {
        // Update width
        const nav = this.element;
        nav.style.minWidth = "";
        nav.style.width = `${event.clientX}px`;
        editorViewContent.element.style.width = `${dev.getPageSize().width - event.clientX}px`;
    });

// Loading milestone (3/4)
quill.milestoneTrack.done("loading");


/* =================== */
/* Display             */
/* =================== */

editor.render(quill.app);

// Display milestone (4/4)
quill.milestoneTrack.done("display");


