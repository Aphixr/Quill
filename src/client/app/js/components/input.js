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
import { State, Component } from "../quartz.js"

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

    // Add an event listener
    addEventListener(type, listener, delegate=true, options) {
        if (delegate) {
            quill.eventDelegation.add(type, this.element, listener);
        } else {
            this.element.addEventListener(type, listener, options);
        }
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

    // Add a onclick event listener
    addClickListener(listener, delegate=true, options) {
        this.addEventListener("click", listener, delegate, options);
    }
}

// Toggler
// A button that toggles something on or off
class Toggler extends Button {
    constructor(initialIsActive, info) {
        super(info);
        this.element.classList.add("toggler");
        this.isActive = !!initialIsActive;

        // Listeners
        this.onActive = null;
        this.onInactive = null;

        // Enable/disable refiring this.on(In)Active even if this.isActive is already true/false
        this.allowRefiring = false;

        // Automatically add event listener
        // Changes between active and inactive when clicked on
        this.addClickListener((event) => {
            if (this.isActive = !this.isActive) {
                this.element.classList.add("active");
                if (dev.isType("function", this.onActive)) {
                    this.onActive(event);
                }
            } else {
                this.element.classList.remove("active");
                if (dev.isType("function", this.onInactive)) {
                    this.onInactive(event);
                }
            }
        });
    }

    // Will call `listener` when button is activated
    setActiveListener(listener) {
        this.onActive = listener;
    }

    // Will call `listener` when button is deactivated
    setInactiveListener(listener) {
        this.onInactive = listener;
    }

    // Manual activate
    activate(event=null) {
        if (this.isActive && !this.allowRefiring) {
            return;
        }
        this.isActive = true;
        this.element.classList.add("active");
        if (dev.isType("function", this.onActive)) {
            this.onActive(event);
        }
    }

    // Manual deactivate
    deactivate(event=null) {
        if (!this.isActive && !this.allowRefiring) {
            return;
        }
        this.isActive = false;
        this.element.classList.remove("active");
        if (dev.isType("function", this.onInactive)) {
            this.onInactive(event);
        }
    }
}

// Input field
class TextField extends Input {
    constructor(info) {
        super(document.createElement("input"));
        this.element.classList.add("text-field");
        this.setProperties(info);
    }
}

/* ===================== */
/* Other components      */
/* ===================== */

// Resizer (abstract)
class Resizer extends Input {
    constructor(direction, info) {
        dev.class.abstract(Resizer);
        if (!dev.isValid(direction.clean(), "horizontal", "vertical")) {
            throw new SyntaxError("'direction' argument must be 'horizontal' or 'vertical'");
        }
        super(document.createElement("div"));
        this.element.classList.add("resizer");
        this.setProperties(info);

        // Properties
        dev.class.constant(this, "direction", direction.clean());
        this.isMousedown = false;

        // Listeners
        this.onMousemove = null;

        // Add the mousedown listener
        quill.eventDelegation.add("mousedown", this.element, (event) => {
            // Update info
            this.isMousedown = true;
            this.element.classList.add("active");

            // This makes sure the cursor stays the way it is
            // even if the cursor is not on this.element
            document.body.style.cursor =
                (this.direction === "horizontal" ? "ew-resize" : "ns-resize");
        });

        // Add the mouseup listener
        // This should be on <body>
        quill.eventDelegation.add("mouseup", document.body, (event) => {
            // If mouse is not held down, just ignore it
            if (!this.isMousedown) {
                return;
            }

            // Update info
            this.isMousedown = false;
            this.element.classList.remove("active");

            // Resets cursor
            document.body.style.cursor = "";
        });
    }

    // Set the mousemove listener
    setMousemoveListener(listener) {
        // Add event listener
        // This must be on <body>
        document.body.addEventListener("mousemove", (event) => {
            // If mouse is not held down, just ignore it
            if (!this.isMousedown) {
                return;
            }

            // Call the listener
            // TODO: replace with `listener(event)`
            listener.call(this.getParent(), event);
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
        if (!dev.isValid(position.clean(), "left", "right")) {
            throw new SyntaxError("'position' argument must be 'left' or 'right'");
        }
        this.element.setAttribute("data-resizer-position", position.clean());
    }
}

// Vertical resizer
class VerticalResizer extends Resizer {
    constructor(position, info) {
        super("vertical", info);
        this.element.classList.add("vertical-resizer");

        // Set the position
        // Checks if `position` argument has a valid value
        if (!dev.isValid(position.clean(), "top", "bottom")) {
            throw new SyntaxError("'position' argument must be 'top' or 'bottom'");
        }
        this.element.setAttribute("data-resizer-position", position.clean());
    }
}

/* ===================== */
/* Navigator classes     */
/* ===================== */

// Navigator button
// A button in the menu the user can click on
// TODO: extend the Toggler class instead
class NavigatorButton extends Button {
    constructor(info) {
        super(info);
        this.element.classList.add("navigator-button");
        this.isActive = false;
        this.onClick = null;
    }

    // Set the click listener
    setClickListener(listener) {
        // Set the onclick event
        this.onClick = (event) => {
            // Deactivate all the buttons in navigator menu
            this.getParent().deactivateAllButtons();

            // Update info
            this.isActive = true;
            this.element.classList.add("active");

            // Call the listener
            listener.call(this, event);
        };

        // Add the click listener
        this.addClickListener(this.onClick);
    }

    // Manual activate
    activate(event=null) {
        this.isActive = true;
        this.element.classList.add("active");
        if (dev.isType("function", this.onClick)) {
            this.onClick(event);
        }
    }

    // Manual deactivate
    deactivate() {
        this.isActive = false;
        this.element.classList.remove("active");
    }
}

// Navigator menu
// Shows all the links/buttons
// This class shouldn't be directly constructed (use new Navigator)
class NavigatorMenu extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
        this.element.classList.add("navigator-menu");
        this.buttons = [];
    }

    // Add some buttons onto the navigator menu
    addButtons(...navigatorButtons) {
        for (let i = 0; i < navigatorButtons.length; i++) {
            this.buttons.push(this.addComponent(navigatorButtons[i]));
        }
    }

    // Makes all the buttons inactive
    deactivateAllButtons() {
        for (const i in this.children) {
            this.children[i].deactivate();
        }
    }
}

// Navigator toggle button
// Opens and closes the navigator
// This class shouldn't be directly constructed (use new Navigator)
// TODO: remove this useless class
class NavigatorToggler extends Toggler {
    constructor(targetMenu, info) {
        // Call parent constructor
        const superArgument = {
            // Use Quill logo for the menu
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
            throw new TypeError("Expected Component instance for argument 1");
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
    Button, Toggler, TextField,
    HorizontalResizer, VerticalResizer,
    // Navigator related
    Navigator, NavigatorButton
}


