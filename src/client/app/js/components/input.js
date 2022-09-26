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
// Order fired when clicked on:
//  onBeforeChange(), onActive()/onInactive(), onChange()
class Toggler extends Button {
    constructor(initialIsActive, info) {
        super(info);
        this.element.classList.add("toggler");
        this.isActive = !!initialIsActive;

        // Listeners
        this.onActive = null;
        this.onInactive = null;
        this.onBeforeChange = null;
        this.onChange = null;

        // Enable/disable refiring this.on(In)Active even if this.isActive is already true/false
        this.allowRefiring = false;

        // Automatically add event listener
        // Changes between active and inactive when clicked on
        this.addClickListener((event) => {
            if (dev.isType("function", this.onBeforeChange)) {
                this.onBeforeChange(event);
            }
            this.isActive = !this.isActive;
            if (this.isActive) {
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
            if (dev.isType("function", this.onChange)) {
                this.onChange(event);
            }
        });
    }

    // Fire `listener` before any information is updated
    setBeforeChangeListener(listener) {
        this.onBeforeChange = listener;
    }

    // Fire `listener` after information is updated
    // This is fired after (in)active listener
    setChangeListener(listener) {
        this.onChange = listener;
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
            // REV: cancel todo below?
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
// Order fired when clicked on:
//  onBeforeChange(), sharedOnActive(), onActive()/onInactive(), onChange()
class NavigatorButton extends Toggler {
    constructor(info) {
        super(false, info);
        this.element.classList.add("navigator-button");
        this.setBeforeChangeListener((event) => {
            const menu = this.getParent();
            menu.deactivateAllButtons();
            if (dev.isType("function", menu.sharedOnActive)) {
                menu.sharedOnActive.call(this, this, event);
            }
        });
    }

    // Manual activate
    // Override Toggler.activate() to include sharedOnActive()
    activate(event=null) {
        if (this.isActive && !this.allowRefiring) {
            return;
        }
        this.isActive = true;
        this.element.classList.add("active");

        const sharedOnActive = this.getParent().sharedOnActive;
        if (dev.isType("function", sharedOnActive)) {
            sharedOnActive.call(this, this, event);
        }
        if (dev.isType("function", this.onActive)) {
            this.onActive(event);
        }
    }
}

// Navigator menu
// Shows all the links/buttons
// This class shouldn't be directly constructed (use new Navigator)
class NavigatorMenu extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
        this.element.classList.add("navigator-menu");
        this.sharedOnActive = null;
        this.buttons = [];
    }

    // Add one button onto the navigator menu
    addButton(navigatorButton) {
        this.buttons.push(this.addComponent(navigatorButton));
    }

    // Add some buttons onto the navigator menu
    addButtons(...navigatorButtons) {
        for (const navigatorButton of navigatorButtons) {
            this.addButton(navigatorButton);
        }
    }

    // Set all buttons with the same active
    setSharedActiveListener(listener) {
        this.sharedOnActive = listener;
    }

    // Makes all the buttons inactive
    deactivateAllButtons() {
        for (const button of this.buttons) {
            button.deactivate();
        }
    }
}

// Navigator view
// Shows the content of a tab
class NavigatorView extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
        this.element.classList.add("navigator-view");
        this.views = [];
    }

    // Add one view onto the navigator view
    addView(navigatorView) {
        this.views.push(this.addComponent(navigatorView));
    }

    // Add some views onto the navigator view
    addViews(...navigatorViews) {
        for (const navigatorView of navigatorViews) {
            this.addView(navigatorView);
        }
    }
}

// Navigator
// Combines all the previous classes into one
class Navigator {
    constructor(menuElement, viewElement) {
        // Properties
        // The menu; all buttons will be displayed here
        this.menu = new NavigatorMenu(menuElement);

        // The view; tab content will be displayed here
        this.view = new NavigatorView(viewElement);
    }

    // Add one page onto the navigator
    // Calls NavigatorMenu.addButton() and NavigatorView.addView()
    addPage({ button, view }) {
        if (button instanceof Button) {
            this.menu.addButton(button);
        }
        if (view instanceof Component) {
            this.view.addView(view);
        }
    }

    // Add some pages onto the navigator
    // Calls NavigatorMenu.addButton() and NavigatorView.addView()
    addPages(...pages) {
        for (const page of pages) {
            this.addPage(page);
        }
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


