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
    Editor, Button, TextField, HorizontalResizer
} from "./components.js"


/* =================== */
/* Load                */
/* =================== */

// Globals
const quickSettings = new Proxy({
    getCookie: () => {
        return quill.cookies.get("quick-settings");
    }
}, {});

// Components
const editor = new Editor();
const editorPanelMenu = editor.getComponent("panel", "menu");
const editorViewSidebar = editor.getComponent("view", "side-bar");
const editorViewContent = editor.getComponent("view", "content");

// Add the horizontal resizer
editorViewSidebar.addComponent("horizontalResizer", new HorizontalResizer("right"));

// Add listeners
editorViewSidebar.getComponent("horizontalResizer").setMousedownListener();
editorViewSidebar.getComponent("horizontalResizer").setMouseupListener();
editorViewSidebar.getComponent("horizontalResizer")
    // The extra +/-55 is for the activity bar
    .setMousemoveListener(function(event) {
        // Collapse the editor navigation completely
        // if the cursor reaches a certain point
        if (event.clientX < 100 + 55) {
            this.element.style.width = this.element.style.minWidth = "0px";
            editorViewContent.element.style.width = `${dev.getPageSize().width - 55}px`;
            return;
        } else {
            this.element.style.width = this.element.style.minWidth = "";
        }

        // Update width
        const nav = this.element;
        nav.style.minWidth = "";
        nav.style.width = `${event.clientX - 55}px`;
        editorViewContent.element.style.width = `${dev.getPageSize().width - event.clientX}px`;
    });

// Loading milestone (3/4)
quill.milestoneTrack.done("loading");


/* =================== */
/* Display             */
/* =================== */

editor.render(quill.app);

// Auto activate the Edit button
// This must be done after the editor is rendered
// Otherwise, the active indicator cannot use .getBoundingClientRect()
editor.getComponent("panel").controlsNavigator.menu.components["button-1"].activate();

// Display milestone (4/4)
quill.milestoneTrack.done("display");


