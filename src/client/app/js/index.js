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
    Editor, HorizontalResizer
} from "./components.js"


// App (singleton)
class App {
    constructor() {
        dev.class.singleton();
    }

    // Components
    static editor = new Editor();
    static editorPanelMenu = App.editor.getComponent("panel", "menu");
    static editorViewSidebar = App.editor.getComponent("view", "side-bar");
    static editorViewContent = App.editor.getComponent("view", "content");


    /* =================== */
    /* Load                */
    /* =================== */
    static load() {
        // Add the horizontal resizer
        App.editorViewSidebar.addComponent("horizontalResizer", new HorizontalResizer("right"));
        
        // Add listeners
        App.editorViewSidebar.getComponent("horizontalResizer").setMousedownListener();
        App.editorViewSidebar.getComponent("horizontalResizer").setMouseupListener();
        App.editorViewSidebar.getComponent("horizontalResizer")
            // The extra +/-55 is for the activity bar
            .setMousemoveListener(function(event) {
                // Collapse the editor navigation completely
                // if the cursor reaches a certain point
                if (event.clientX < 100 + 55) {
                    this.element.style.width = this.element.style.minWidth = "0px";
                    App.editorViewContent.element.style.width = `${dev.getPageSize().width - 55}px`;
                    return;
                } else {
                    this.element.style.width = this.element.style.minWidth = "";
                }
        
                // Update width
                const nav = this.element;
                nav.style.minWidth = "";
                nav.style.width = `${event.clientX - 55}px`;
                App.editorViewContent.element.style.width = `${dev.getPageSize().width - event.clientX}px`;
            });
        
        // Loading milestone (3/4)
        quill.milestoneTrack.done("loading");
    }


    /* =================== */
    /* Display             */
    /* =================== */
    static display() {
        // Render
        App.editor.render(quill.app);
        
        // Auto activate the Edit button
        // This must be done after the editor is rendered
        // Otherwise, the active indicator cannot use .getBoundingClientRect()
        App.editor.getComponent("panel").controlsNavigator.menu.components["button-1"].activate();

        // Display milestone (4/4)
        quill.milestoneTrack.done("display");
    }
}

App.load();

App.display();


