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
    Editor, HorizontalResizer, Navigator, NavigatorButton, Icon
} from "./components.js"
import { Component } from "./quartz.js";


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
        localStorage.getItem("memory") ? JSON.parse(localStorage.getItem("memory")) : {},
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
        {
            const createButton = (index, name) => {
                const button = new NavigatorButton();
                button.addComponent(new Icon("img/navigation-icons.svg", -27 * index, 0));

                const label = document.createElement("span");
                label.classList.add("label");
                label.innerHTML = /* html */ `<br>${name}`;
                button.addComponent(new Component(label));
                return button;
            }

            App.navigator.menu.addButtons(
                createButton(0, "Home"),
                createButton(1, "Notebooks"),
                createButton(2, "Templates"),
                createButton(3, "Trash"),
                createButton(4, "Settings")
            );
        }
        
        // Add properties to all the buttons in the navigator
        for (const button of App.navigator.menu.buttons) {
            button.setActiveListener((event) => {

            });
        }

        // Add the horizontal resizer
        App.editorViewSidebar.resizer = App.editorViewSidebar.addComponent(new HorizontalResizer("right"));
        App.editorViewSidebar.element.style.width = App.memory.editorSideBarWidth || "";
        
        // Add listeners
        App.editorViewSidebar.resizer
            .setMousemoveListener(function({ clientX: mouseX }) {
                const sideBar = this.element;
                const toggler = App.editorPanelMenu.buttons.sideBar;
                const appNavigatorWidth = +getComputedStyle(App.navigator.menu.element).width.replace(/px/, "");

                if (mouseX < 100 + appNavigatorWidth) {
                    toggler.deactivate();
                    return;
                }

                toggler.activate();
                // `sideBar.width` is for remembering the width
                App.memory.editorSideBarWidth = sideBar.style.width = sideBar.width =
                    mouseX - appNavigatorWidth + "px";
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


