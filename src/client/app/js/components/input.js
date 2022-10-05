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

        // If it was activated by clicking (true)
        // or activated by code (false)
        // Make sure to reset to false after everything in the click listener is done
        this.isClicked = false;

        // Automatically add event listener
        // Changes between active and inactive when clicked on
        this.addClickListener((event) => {
            this.isClicked = true;
            this.toggle.call(this, event);
            this.isClicked = false;
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

    // Toggle button
    toggle(event=null) {
        if (this.isActive) {
            this.deactivate(event);
        } else {
            this.activate(event);
        }
        return this.isActive;
    }
    
    // Toggle to a active state
    // For less repetitive code and easier for extended classes to override
    toggleTo(active, event=null) {
        // Check if it allows refiring before continuing
        if (!this.allowRefiring && !!this.isActive === !!active) {
            return;
        }

        // Fire onBeforeChange
        if (dev.isType("function", this.onBeforeChange)) {
            this.onBeforeChange(event);
        }

        // Update info
        this.isActive = !!active;
        if (active) {
            this.element.classList.add("active");
        } else {
            this.element.classList.remove("active");
        }

        // Fire onActive/onInactive
        if (active) {
            if (dev.isType("function", this.onActive)) {
                this.onActive(event);
            }
        } else {
            if (dev.isType("function", this.onInactive)) {
                this.onInactive(event);
            }
        }

        // Fire onChange
        if (dev.isType("function", this.onChange)) {
            this.onChange(event);
        }
    }

    // Manual activate
    activate(event=null) {
        this.toggleTo(true, event);
    }

    // Manual deactivate
    deactivate(event=null) {
        this.toggleTo(false, event);
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
    constructor(name, info) {
        super(false, info);
        this.element.classList.add("navigator-button");

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.menu = null;
        this.viewer = null;
        this.navigator = null;

        // Name of this button
        // Used to decided which View to open
        this.name = String(name || "");

        // The view this button is supposed to show
        this.targetView = null;
    }

    toggleTo(active, event=null) {
        // Check if it allows refiring before continuing
        if (!this.allowRefiring && !!this.isActive === !!active) {
            return;
        }

        // Should not be able to deactivate itself
        // A different button must be clicked on to be deactivated
        if (this.menu.activeButton === this && this.isActive && this.isClicked) {
            return;
        }

        // Fire onBeforeChange
        if (dev.isType("function", this.onBeforeChange)) {
            this.onBeforeChange(event);
        }

        // Deactivate the old activeButton
        if (active) {
            this.menu.deactivateActiveButton(event);
        }

        // Call the shared on active listener if there is one
        if (dev.isType("function", this.menu.sharedOnActive)) {
            this.menu.sharedOnActive.call(this, this, event);
        }

        // If targetView is null, retrieve the targetView
        if (!this.targetView && this.viewer.views[this.name]) {
            this.targetView = this.viewer.views[this.name];
            this.targetView.activator = this;
        }

        // If the view is still found, throw an error
        if (!this.targetView) {
            throw new SyntaxError("Unable to get target view");
        }

        // Hide view
        if (!active) {
            this.targetView.hide(event);
        }

        // Display view
        if (active) {
            this.targetView.show(event);
        }

        // Update info
        this.isActive = !!active;
        if (active) {
            this.element.classList.add("active");
        } else {
            this.element.classList.remove("active");
        }

        // Fire onActive/onInactive
        if (active) {
            if (dev.isType("function", this.onActive)) {
                this.onActive(event);
            }
        } else {
            if (dev.isType("function", this.onInactive)) {
                this.onInactive(event);
            }
        }
        
        // If this button is set to active
        // Set activeButton to this
        if (active) {
            this.menu.activeButton = this;
        }

        // Fire onChange
        if (dev.isType("function", this.onChange)) {
            this.onChange(event);
        }
    }

    // Set the name of this button
    setName(name) {
        this.name = String(name);
    }

    // Set which view the button is supposed to open
    for(view) {
        if (!(view instanceof View)) {
            throw new TypeError(`'view' argument expected instance of View`);
        }
        this.name = String(view.name);
        this.targetView = view;
        this.targetView.activator = this;
    }
}

// Navigator menu
// Shows all the links/buttons
// This class shouldn't be directly constructed (use new Navigator)
class NavigatorMenu extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
        this.element.classList.add("navigator-menu");

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.viewer = null;
        this.navigator = null;

        // Properties
        this.sharedOnActive = null;
        this.activeButton = null;
        this.buttons = {};
        dev.class.iterable(this.buttons, (button) => button instanceof NavigatorButton);
    }

    // Add one button onto the navigator menu
    addButton(button) {
        Object.assign(button, {
            menu: this,
            viewer: this.viewer,
            navigator: this.navigator
        });

        // Sets the target view if the view exists yet
        if (!(button.targetView instanceof View) && this.viewer.views[button.name]) {
            button.setName(button.name);
        }

        // Add button
        this.buttons[button.name] = this.addComponent(button);
    }

    // Add some buttons onto the navigator menu
    addButtons(...navigatorButtons) {
        for (const navigatorButton of navigatorButtons) {
            this.addButton(navigatorButton);
        }
    }

    // Set all buttons with a same active listener
    setSharedActiveListener(listener) {
        this.sharedOnActive = listener;
    }

    // Deactivate the current active button
    deactivateActiveButton(event=null) {
        if (this.activeButton instanceof NavigatorButton) {
            this.activeButton.deactivate(event);
            this.activeButton = null;
        }
    }
}

// View class
class View extends Component {
    constructor(name, info) {
        super(document.createElement("div"));
        this.element.classList.add("view", "view-" + this.name, "hidden");
        this.setProperties(info);

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.menu = null;
        this.viewer = null;
        this.navigator = null;

        // Name of this view
        this.name = String(name);

        // Listeners
        this.onShow = null;
        this.onHide = null;
    }

    // Show the view
    show(event=null) {
        // Unhide the view
        this.element.classList.remove("hidden");

        // Fire shared onShow
        if (dev.isType("function", this.viewer.sharedOnShow)) {
            this.viewer.sharedOnShow.call(this, this, event);
        }

        // Fire onShow
        if (dev.isType("function", this.onShow)) {
            this.onShow(event);
        }
    }

    // Hide the view
    hide(event=null) {
        // Hide the view
        this.element.classList.add("hidden");

        // Fire onHide
        if (dev.isType("function", this.onHide)) {
            this.onHide(event);
        }
    }

    // Set the on show listener
    // Fired when View is displayed
    setShowListener(listener) {
        this.onShow = listener;
    }

    // Set the on show listener
    // Fired when View is hidden
    setHideListener(listener) {
        this.onHide = listener;
    }
}

// Navigator viewer
// Shows the content of a tab, using View class
class NavigatorViewer extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
        this.element.classList.add("navigator-viewer");

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.menu = null;
        this.navigator = null;

        // Properties
        this.activeView = null;
        this.views = {};
        dev.class.iterable(this.views, (view) => view instanceof View);

        // Shared on show listener
        this.sharedOnShow = null;
    }

    // Add one view onto the navigator view
    addView(view) {
        Object.assign(view, {
            menu: this.menu,
            viewer: this,
            navigator: this.navigator
        });
        this.views[view.name] = this.addComponent(view);
    }

    // Add some views onto the navigator view
    addViews(...views) {
        for (const view of views) {
            this.addView(view);
        }
    }

    // Set all views with a same show listener
    setSharedShowListener(listener) {
        this.sharedOnShow = listener;
    }
}

// Navigator
// Combines all the previous classes into one
class Navigator {
    constructor(menuElement, viewElement) {
        // The menu; all buttons will be displayed here
        this.menu = new NavigatorMenu(menuElement);

        // The viewer; tab content will be displayed here
        this.viewer = new NavigatorViewer(viewElement);
        
        // Assign properties to menu and viewer
        Object.assign(this.menu, {
            navigator: this,
            viewer: this.viewer
        });
        Object.assign(this.viewer, {
            navigator: this,
            menu: this.menu
        });

        // Pages
        this.pages = {};
    }

    // Add one page onto the navigator
    // Calls NavigatorMenu.addButton() and NavigatorViewer.addView()
    addPage(pageInfo) {
        const { button, view } = pageInfo;
        this.pages[button.name || view.name] = pageInfo;

        // Add buttons and views if there are any
        if (button instanceof Button) {
            this.menu.addButton(button);
        }
        if (view instanceof View) {
            this.viewer.addView(view);
        }
    }

    // Add some pages onto the navigator
    // Calls NavigatorMenu.addButton() and NavigatorViewer.addView()
    addPages(...pages) {
        for (const page of pages) {
            this.addPage(page);
        }
    }
}

// Export
export {
    // Inputs
    Button, Toggler, TextField,
    HorizontalResizer, VerticalResizer,
    // Navigator related
    Navigator, NavigatorButton, View
}


