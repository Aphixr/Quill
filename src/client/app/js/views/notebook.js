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

notebook.setInit(View.InitOn.Manual, function(app) {
    
    // Editor constants
    const editor = new Editor(app);
    const editorSideBar = editor.sideBar;

    // Editor view sidebar resizer
    (function resizer() {
        // Add the horizontal resizer
        editorSideBar.resizer = editorSideBar.container.addComponent(new HorizontalResizer("right"));
        editorSideBar.style.width = storage.memory["editor.sideBar.width"] || "";
        
        // Add listeners
        // (this === editorViewSide)
        editorSideBar.resizer.setMousemoveListener(function({ clientX: mouseX }) {
            // Constants
            const toggler = editor.topBar.toggleMenu;
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
            storage.memory["editor.sideBar.width"] = this.parent.style.width = this.width =
                mouseX - appNavigatorWidth + "px";
        });
    })();

    // Add editor to the notebook view
    this.editor = this.addComponent(editor);

    // On show
    this.setShowListener(() => {
        // Activate edit button
        this.editor.panel.navigator.menu.buttons[0].activate();
    });

});

export default notebook


