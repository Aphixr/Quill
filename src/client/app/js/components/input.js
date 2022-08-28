/**
 * js/components/input.js
 * 
 * Anything to do with inputs, such as an input box,
 * radios, buttons, checkboxes, select, etc. `Input`
 * is an abstract class. `navigator` and related
 * classes are also here.
 */


"use strict";

import dev from "../dev.js"
import quill from "../quill.js"
import Component from "../quartz.js"

// Input class (abstract)
// Anything the user can input any form of information
// or interaction is extended from this class
// REV: is this class too useful?
class Input extends Component {
    // Constructor
    // `element` argument should be a `document.createElement()`
    constructor(element) {
        dev.class.abstract(Input);
        super(element);

        // Initialize element
        this.element.classList.add("input");
    }
}

/* ===================== */
/* General Input derived */
/* ===================== */

// Button class
class Button extends Input {
    constructor(info) {
        super(document.createElement("button"));
        this.element.classList.add("button");
        this.setProperties(info);
    }
}

// Toggler
// A button that toggles something on or off
class Toggler extends Button {
    constructor(info, initialIsActive) {
        super(info);
        this.isActive = !!initialIsActive;
        this.onActive = this.onInactive = null;
        this.element.classList.add("toggler");
    }
    setOnclickListener() {
        // Does addEventListener change `this`?
        this.element.addEventListener("click", () => {
            this.isActive = !this.isActive;
            if (this.isActive) {
                this.onActive();
            } else {
                this.onInactive();
            }
        });
    }
    setActiveListener(callback) {
        this.onActive = callback;
        if (this.onInactive) {
            this.setOnclickListener();
        }
    }
    setInactiveListener(callback) {
        this.onInactive = callback;
        if (this.onActive) {
            this.setOnclickListener();
        }
    }
}

// Input field
class TextField extends Input {
    constructor(info) {
        super(document.createElement("input"));
        this.setProperties(info);
    }
}

/* ===================== */
/* Navigator classes    */
/* ===================== */

// Navigator button
// A button in the menu the user can click on
class NavigatorButton extends Button {
    constructor(info) {
        super(info);
        this.element.classList.add("navigator-button");
    }
}

// Navigator menu
// Shows all the links/buttons
class NavigatorMenu extends Component {
    constructor() {
        super(document.createElement("div"));
        this.element.classList.add("navigator-menu");
    }

    // Add some buttons onto the navigator menu
    addButtons(...navigatorButtons) {
        for (let i = 0; i < navigatorButtons; i++) {
            this.addComponent("button-" + i, navigatorButtons[i]);
        }
    }
}

// Navigator toggle button
// Opens and closes the navigator
class NavigatorToggler extends Toggler {
    constructor(targetMenu, info) {
        // Call parent constructor
        const superArgument = {
            // Use Quill logo for the menu
            // REV: add image paths to `quill` object?
            innerHTML: /* html */`
                <img src="${quill.path.logo}">
            `
        };
        Object.assign(superArgument, info);
        super(superArgument);

        // Target menu is the element that will be opened/closed
        // when clicked on
        // Target menu must be a component, not the element
        if (!(targetMenu instanceof Component)) {
            dev.throw({
                Type: TypeError,
                message: "Expected Component instance for argument 1"
            });
        }
        this.targetMenu = targetMenu;

        // Initialize element stuff
        this.element.classList.add("navigator-toggler");

        // Set on (in)active listeners
        this.setActiveListener(() => {
            this.targetMenu.element.classList.add("active");
            this.targetMenu.element.classList.remove("inactive");
        });
        this.setInactiveListener(() => {
            this.targetMenu.element.classList.add("inactive");
            this.targetMenu.element.classList.remove("active");
        });
    }
}

// Navigator
// Combines all the previous classes into one
class Navigator {
    constructor() {
        // Properties
        // The menu; all buttons will be display here
        this.menu = new NavigatorMenu();
        // The toggler button
        this.toggler = new NavigatorToggler(this.menu);
    }
}

// Export
export {
    // Input
    Input,
    Button, Toggler,
    TextField,
    // Navigator related
    Navigator, NavigatorButton
}


