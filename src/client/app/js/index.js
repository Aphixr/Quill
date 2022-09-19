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
    Editor, HorizontalResizer, Navigator
} from "./components.js"


// App (singleton)
class App {
    constructor() {
        dev.class.singleton();
    }

    // Components
    static editor = new Editor();
    static editorPanelMenu = App.editor.panel.menu;
    static editorViewSidebar = App.editor.view.sideBar;
    static editorViewContent = App.editor.view.content;
    static navigator = new Navigator();


    /* =================== */
    /* Load                */
    /* =================== */
    static load() {
        // Add the horizontal resizer
        App.editorViewSidebar.resizer = App.editorViewSidebar.addComponent(new HorizontalResizer("right"));
        
        // Add listeners
        App.editorViewSidebar.resizer
            .setMousemoveListener(function(event) {
                // Collapse the editor navigation completely
                // if the cursor reaches a certain point
                if (event.clientX < 100) {
                    this.element.style.width = this.element.style.minWidth = "0px";
                    App.editorViewContent.element.style.width = `${dev.getPageSize().width}px`;
                    return;
                } else {
                    this.element.style.width = this.element.style.minWidth = "";
                }
        
                // Update width
                const nav = this.element;
                nav.style.minWidth = "";
                nav.style.width = `${event.clientX}px`;
                App.editorViewContent.element.style.width = `${dev.getPageSize().width - event.clientX}px`;
            });
        
        // Event delegation
        quill.eventDelegation.mergeAll();
        
        // Loading milestone (3/4)
        quill.milestoneTrack.done("loading");
    }


    /* =================== */
    /* Display             */
    /* =================== */
    static display() {
        // Render
        // App.editor.render(quill.app);
        App.navigator.menu.render(quill.app);
        App.editor.render(quill.app);
        
        // Auto activate the Edit button
        // This must be done after the editor is rendered
        // Otherwise, the active indicator cannot use .getBoundingClientRect()
        App.editor.panel.controlsNavigator.menu.buttons[0].activate();

        // Display milestone (4/4)
        quill.milestoneTrack.done("display");
    }
}

App.load();

App.display();


