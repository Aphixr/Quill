/**
 * js/views/notebook.js
 * 
 * Edit notebooks and notebook pages.
 */


"use strict";

import storage from "../storage.js"
import { Editor } from "../notebook/editor.js"
import { View, HorizontalResizer } from "../components.js"

const notebook = new View("notebook");

(() => {
    
    // Editor constants
    const editor = new Editor();
    const editorSideBar = editor.sideBar;

    // Editor view sidebar resizer
    (function resizer() {
        // Add the horizontal resizer
        editorSideBar.resizer = editorSideBar.addComponent(new HorizontalResizer("right"));
        editorSideBar.style.width = storage.memory["editor.sideBar.width"] || "";
        
        // Add listeners
        // (this === editorViewSide)
        editorSideBar.resizer.setMousemoveListener(function({ clientX: mouseX }) {
            // Constants
            const toggler = editor.topBar.buttons.sideBar;
            const appNavigatorWidth = 
                +getComputedStyle(document.querySelector("#app > .navigator-menu"))
                .width.replace(/px/, "");

            // Deactivate side bar if mouse is in an area
            if (mouseX < 100 + appNavigatorWidth) {
                toggler.deactivate();
                return;
            }

            toggler.activate();
            // `sideBar.width` is for remembering the width
            storage.memory["editor.sideBar.width"] = this.style.width = this.width =
                mouseX - appNavigatorWidth + "px";
        });
    })();

    // Add editor to the notebook view
    notebook.editor = notebook.addComponent(editor);

    // On show
    notebook.setShowListener(() => {
        // Activate edit button
        notebook.editor.panel.navigator.menu.buttons.edit.activate();
    });

})();

export default notebook


