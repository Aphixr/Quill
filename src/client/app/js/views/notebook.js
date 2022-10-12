/**
 * js/views/notebook.js
 * 
 * Edit notebooks and notebook pages.
 */


"use strict";

import memory from "../storage.js"
import { Editor, View, HorizontalResizer } from "../components.js"

const notebook = new View("notebook");

(() => {
    
    // Editor constants
    const editor = new Editor();
    const editorViewSideBar = editor.view.sideBar;

    // Editor view sidebar resizer
    (function resizer() {
        // Add the horizontal resizer
        editorViewSideBar.resizer = editorViewSideBar.addComponent(new HorizontalResizer("right"));
        editorViewSideBar.style.width = memory["editor.sideBar.width"] || "";
        
        // Add listeners
        // (this === editorViewSide)
        editorViewSideBar.resizer.setMousemoveListener(function({ clientX: mouseX }) {
            // Constants
            const toggler = editor.panel.menu.toggleSideBar;
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
            memory["editor.sideBar.width"] = this.style.width = this.width =
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


