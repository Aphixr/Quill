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
    const editorViewSidebar = editor.view.sideBar;

    // Editor view sidebar resizer
    (function resizer() {
        // Add the horizontal resizer
        editorViewSidebar.resizer = editorViewSidebar.addComponent(new HorizontalResizer("right"));
        editorViewSidebar.style.width = memory["editor.sideBar.width"] || "";
        
        // Add listeners
        editorViewSidebar.resizer.setMousemoveListener(function({ clientX: mouseX }) {
            // Constants
            const sideBar = this.element;
            const toggler = editor.panel.menu.buttons.sideBar;
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
            memory["editor.sideBar.width"] = sideBar.style.width = sideBar.width =
                mouseX - appNavigatorWidth + "px";
        });
    })();

    // Add editor to the notebook view
    notebook.editor = notebook.addComponent(editor);

    // On show
    notebook.setShowListener(() => {
        // Activate edit button
        notebook.editor.panel.controlsNavigator.menu.buttons.edit.activate();
    });

})();

export default notebook


