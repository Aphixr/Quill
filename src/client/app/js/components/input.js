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
// REV: is this class too general?
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
    constructor(initialIsActive, info) {
        super(info);
        this.isActive = !!initialIsActive;
        this.onActive = this.onInactive = null;
        this.element.classList.add("toggler");
    }
    setClickListener() {
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
            this.setClickListener();
        }
    }
    setInactiveListener(callback) {
        this.onInactive = callback;
        if (this.onActive) {
            this.setClickListener();
        }
    }
}

// Input field
class TextField extends Input {
    constructor(info) {
        super(document.createElement("input"));
        this.setProperties(info);
        this.element.classList.add("text-field");
    }
}

/* ===================== */
/* Other components      */
/* ===================== */

// Resizer (abstract)
class Resizer extends Input {
    constructor(direction, info) {
        dev.class.abstract(Resizer);
        if (!dev.isValid(direction, "horizontal", "vertical")) {
            dev.throw({
                Type: SyntaxError,
                message: "'direction' argument must be 'horizontal' or 'vertical'"
            });
        }
        super(document.createElement("div"));
        this.setProperties(info);
        this.direction = direction; 
        this.isMouseDown = false;
        this.element.classList.add("resizer");
    }

    // Set the mousedown listener
    setMousedownListener(callback=function(){}) {
        // Callback cannot be an arrow function!
        // .call does not work with arrow functions
        if (dev.isArrowFunction()) {
            dev.throw({
                Type: SyntaxError,
                message: "'callback' cannot me an arrow function"
            });
        }

        // Add the event listener
        this.element.addEventListener("mousedown", (event) => {
            // Update info
            this.isMouseDown = true;
            this.element.classList.add("active");
            this.element.classList.remove("inactive");

            // This makes sure the cursor stays the way it is
            // even if the cursor is not on this.element
            document.body.style.cursor =
                this.direction === "horizontal"
                    ? "ew-resize"
                    : "ns-resize";

            // Call the callback
            callback.call(this.getParentComponent(), event);
        });
    }

    // Set the mouseup listener
    setMouseupListener(callback=function(){}) {
        // Callback cannot be an arrow function!
        // .call does not work with arrow functions
        if (dev.isArrowFunction()) {
            dev.throw({
                Type: SyntaxError,
                message: "'callback' cannot me an arrow function"
            });
        }

        // Add event listener
        // This must be on <body>
        document.body.addEventListener("mouseup", (event) => {
            // If mouse is not held down, just ignore it
            if (!this.isMouseDown) {
                return;
            }

            // Update info
            this.isMouseDown = false;
            this.element.classList.add("inactive");
            this.element.classList.remove("active");

            // Resets cursor
            document.body.style.cursor = "";

            // Call the callback
            callback.call(this.getParentComponent(), event);
        });
    }

    // Set the mousemove listener
    // Provide a simple default callback if they did not provide one
    // Just sets the element's width property
    setMousemoveListener(callback = function(event) {
        const element = this.element;
        element.style.width =
            `${element.getBoundingClientRect().x + event.clientX}px`;
    }) {
        // Callback cannot be an arrow function!
        // .call does not work with arrow functions
        if (dev.isArrowFunction()) {
            dev.throw({
                Type: SyntaxError,
                message: "'callback' cannot me an arrow function"
            });
        }

        // Add event listener
        // This must be on <body>
        document.body.addEventListener("mousemove", (event) => {
            // If mouse is not held down, just ignore it
            if (!this.isMouseDown) {
                return;
            }

            // Call the callback
            callback.call(this.getParentComponent(), event);
        });
    }
}

// Horizontal resizer
class HorizontalResizer extends Resizer {
    constructor(position, info) {
        super("horizontal", info);
        this.element.classList.add("horizontal-resizer");

        // Set the position
        // Checks if `position` argument has a valid value
        if (!dev.isValid(position, "left", "right")) {
            dev.throw({
                Type: SyntaxError,
                message: "'position' argument must be 'left' or 'right'"
            });
        }
        this.element.setAttribute("data-horizontal-resizer-position", position);
    }
}

/* ===================== */
/* Navigator classes     */
/* ===================== */

// Navigator button
// A button in the menu the user can click on
// This class shouldn't be directly constructed (use new Navigator)
class NavigatorButton extends Button {
    constructor(info) {
        super(info);
        this.element.classList.add("navigator-button");
    }
}

// Navigator menu
// Shows all the links/buttons
// This class shouldn't be directly constructed (use new Navigator)
class NavigatorMenu extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
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
// This class shouldn't be directly constructed (use new Navigator)
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
        super(false, superArgument);

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
    constructor(menuElement) {
        // Properties
        // The menu; all buttons will be display here
        this.menu = new NavigatorMenu(menuElement);
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
    HorizontalResizer,
    // Navigator related
    Navigator, NavigatorButton
}


