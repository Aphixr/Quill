/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be loaded and displayed to the user.
 */


"use strict";

import dev from "./dev.js"
import quill from "./quill.js"
import { Editor, HorizontalResizer, Navigator, NavigatorButton, Icon } from "./components.js"
import { Component } from "./quartz.js";

// Import views
import home from "./views/home.js"
import notebooks from "./views/notebooks.js"
import templates from "./views/templates.js"
import trash from "./views/trash.js"
import settings from "./views/settings.js"


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
    static memory = new Proxy(
        JSON.parse(localStorage.getItem("memory")) || {},
        {
            get(target, property) {
                return target[property];
            },
            set(target, property, value) {
                target[property] = value;
                localStorage.setItem("memory", JSON.stringify(target));
                return true;
            }
        }
    );

    /* =================== */
    /* Load                */
    /* =================== */
    static load() {
        // Navigator
        (function navigator() {
            const createButton = (index, name) => {
                const button = new NavigatorButton();
                button.element.classList.add("opacity-60");
                button.addComponent(new Icon("img/navigation-icons.svg", -26 * index, 0));
                button.setName(name.toLowerCase());

                const label = document.createElement("span");
                label.classList.add("label");
                label.innerHTML = /* html */ `${name}`;
                button.addComponent(new Component(label));
                return button;
            }

            App.navigator.addPages({
                button: createButton(0, "Home"),
                view: home
            }, {
                button: createButton(1, "Notebooks"),
                view: notebooks
            }, {
                button: createButton(2, "Templates"),
                view: templates
            }, {
                button: createButton(3, "Trash"),
                view: trash
            }, {
                button: createButton(4, "Settings"),
                view: settings
            });
        })();

        // Editor view sidebar resizer
        (function resizer() {
            // Add the horizontal resizer
            App.editorViewSidebar.resizer = App.editorViewSidebar.addComponent(new HorizontalResizer("right"));
            App.editorViewSidebar.element.style.width = App.memory.editorSideBarWidth || "";
            
            // Add listeners
            App.editorViewSidebar.resizer
                .setMousemoveListener(function({ clientX: mouseX }) {
                    const sideBar = this.element;
                    const toggler = App.editorPanelMenu.buttons.sideBar;
                    const appNavigatorWidth = +getComputedStyle(App.navigator.menu.element).width.replace(/px/, "");

                    // Deactivate side bar if mouse is in an area
                    if (mouseX < 100 + appNavigatorWidth) {
                        toggler.deactivate();
                        return;
                    }

                    toggler.activate();
                    // `sideBar.width` is for remembering the width
                    App.memory.editorSideBarWidth = sideBar.style.width = sideBar.width =
                        mouseX - appNavigatorWidth + "px";
                });
        })();
        
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
        App.navigator.viewer.render(quill.app);
        App.editor.render(App.navigator.viewer.element);
        
        // Auto activate some buttons
        // This must be done after the editor is rendered
        App.navigator.menu.buttons.home.activate();
        App.editor.panel.controlsNavigator.menu.buttons.edit.activate();

        // Display milestone (4/4)
        quill.milestoneTrack.done("display");
    }
}

App.load();

App.display();


