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
import { Component } from "../quartz.js"

// Input class (abstract)
// Anything the user can input any form of information
// or interaction is extended from this class
// REV: is this class too general?
class Input extends Component {
    // Constructor
    // `element` argument should be a `document.createElement()`
    constructor(element, content, classes=[], info) {
        dev.class.abstract(Input);
        super(element);

        // Add any content to this component
        if (content) {
            if (content instanceof Component) {
                this.addComponent(content);
            } else {
                this.html = String(content);
            }
        }

        // Add any classes
        if (classes) {
            if (dev.isType("string", classes)) {
                this.classes.add(classes);
            } else if (dev.isIterable(classes)) {
                this.classes.add(...classes);
            } else {
                throw new TypeError("'classes' argument expected string or iterable");
            }
        }

        this.setProperties(info);

        // Initialize element
        this.classes.add("input");
    }

    // Add an event listener
    addEventListener(type, listener, options, delegate=true) {
        if (delegate) {
            quill.eventDelegation.add(type, this.element, listener);
        } else {
            this.element.addEventListener(type, listener, options);
        }
    }

    // Disable input
    disable() {
        this.element.setAttribute("disabled", "disabled");
    }

    // Enable input
    enable() {
        this.element.removeAttribute("disabled");
    }

    // Focus on input
    focus() {
        this.element.focus();
    }

    // Returns true if input is enabled
    get isEnabled() {
        return !this.element.hasAttribute("disabled");
    }
}

/* ===================== */
/* General Input derived */
/* ===================== */

// Button class
class Button extends Input {
    constructor(content, classes, info) {
        super(document.createElement("button"), content, classes, info);
        this.classes.add("button");

        // Auto unfocus on click
        this.blurOnClick = false;
        this.addEventListener("click", () => {
            if (this.blurOnClick) {
                this.element.blur();
            }
        });
    }

    // Add a onclick event listener
    addClickListener(listener, options, delegate=true) {
        this.addEventListener("click", listener, options, delegate);
    }
}

// Toggler
// A button that toggles something on or off
// Order fired when clicked on:
//  onBeforeChange(), onActive()/onInactive(), onChange()
class Toggler extends Button {
    constructor(content, initialIsActive, classes, info) {
        super(content, classes, info);
        this.classes.add("toggler");
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
    toggleTo(active, event={}) {
        // Check if it allows refiring before continuing
        if (!this.allowRefiring && !!this.isActive === !!active) {
            return;
        }

        // Fire onBeforeChange
        if (dev.isType("function", this.onBeforeChange)) {
            if (this.onBeforeChange(event)) {
                return;
            }
        }

        // Update info
        this.isActive = !!active;
        if (active) {
            this.classes.add("active");
        } else {
            this.classes.remove("active");
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
    activate(event={}) {
        this.toggleTo(true, event);
    }

    // Manual deactivate
    deactivate(event={}) {
        this.toggleTo(false, event);
    }
}

// Hover toggler
// Same as Toggler be can hover to activate
class HoverToggler extends Toggler {
    constructor(content, delay=0, initialIsActive, classes, info) {
        super(content, classes, initialIsActive, info);

        this.delay = delay;

        this.addEventListener("mouseenter", (event) => {
            this.toggle.call(this, event);
        });
        this.addEventListener("mouseleave", (event) => {
            this.toggle.call(this, event);
        });
    }
}

// Expander
class Expander extends Toggler {
    constructor(content, initialIsActive, classes, info) {
        super(content, initialIsActive, classes, info);
        this.classes.add("expander");

        // Target component to open/close
        this.targets = [];

        // The style to set the component when opened/closed
        this.openedStyle = {
            display: ""
        };
        this.closedStyle = {
            display: "none"
        };

        // Toggle targets
        this.addClickListener(() => {
            for (const target of this.targets) {
                if (this.isActive) {
                    Object.assign(target.style, this.openedStyle);
                    target.classes.add("expand");
                } else {
                    Object.assign(target.style, this.closedStyle);
                    target.classes.remove("expand");
                }
            }
        });
    }

    // Set the target component to open/close
    addTarget(target) {
        if (!(target instanceof Component)) {
            throw new TypeError("'target' argument expected instance of Component");
        }
        target.expander = this;
        this.targets.push(target);
    }

    // Add multiple targets
    addTargets(...targets) {
        for (const target of targets) {
            this.addTarget(target);
        }
    }

    // Set expand style
    setOpenedStyle(style) {
        this.openedStyle = style;
    }

    // Set closed style
    setClosedStyle(style) {
        this.closedStyle = style;
    }
}

// Input field
class TextField extends Input {
    constructor(classes, info) {
        super(document.createElement("input"), null, classes, info);
        this.classes.add("text-field");
    }

    // Select all contents in text field
    select() {
        this.element.select();
    }

    // Set value
    set value(value) {
        return this.element.value = value;
    }

    // Get value
    get value() {
        return this.element.value;
    }
}

/* ===================== */
/* Other components      */
/* ===================== */

// Resizer (abstract)
class Resizer extends Input {
    constructor(direction, classes, info) {
        dev.class.abstract(Resizer);
        if (!dev.isValid(direction.clean(), "horizontal", "vertical")) {
            throw new SyntaxError("'direction' argument must be 'horizontal' or 'vertical'");
        }
        super(document.createElement("div"), null, classes, info);
        this.classes.add("resizer");

        // Properties
        dev.class.constant(this, "direction", direction.clean());
        this.isMousedown = false;

        // Listeners
        this.onMousemove = null;

        // Add the mousedown listener
        this.addEventListener("mousedown", (event) => {
            // Update info
            this.isMousedown = true;
            this.classes.add("active");

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
            this.classes.remove("active");

            // Resets cursor
            document.body.style.cursor = "";
        });
        
        // Add mouse move event listener
        // This must be on <body>
        document.body.addEventListener("mousemove", (event) => {
            // If mouse is not held down, just ignore it
            if (!this.isMousedown) {
                return;
            }

            // Call the listener
            if (dev.isType("function", this.onMousemove)) {
                this.onMousemove.call(this.getParent(), event);
            }
        });
    }

    // Set the mousemove listener
    setMousemoveListener(listener) {
        this.onMousemove = listener;
    }
}

// Horizontal resizer
class HorizontalResizer extends Resizer {
    constructor(position, classes, info) {
        super("horizontal", classes, info);
        this.classes.add("horizontal-resizer");

        // Set the position
        // Checks if `position` argument has a valid value
        if (!dev.isValid(position.clean(), "left", "right")) {
            throw new SyntaxError("'position' argument must be 'left' or 'right'");
        }
        this.setAttribute("data-resizer-position", position.clean());
    }
}

// Vertical resizer
class VerticalResizer extends Resizer {
    constructor(position, classes, info) {
        super("vertical", classes, info);
        this.classes.add("vertical-resizer");

        // Set the position
        // Checks if `position` argument has a valid value
        if (!dev.isValid(position.clean(), "top", "bottom")) {
            throw new SyntaxError("'position' argument must be 'top' or 'bottom'");
        }
        this.setAttribute("data-resizer-position", position.clean());
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
    constructor(content, classes, info) {
        super(content, false, classes, info);
        this.classes.add("navigator-button");

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.menu = null;
        this.viewer = null;
        this.navigator = null;

        // The view this button is supposed to show
        this.targetView = null;
    }

    toggleTo(active, event={}) {
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
            if (this.onBeforeChange(event)) {
                return;
            }
        }

        // Deactivate the old activeButton
        if (active) {
            this.menu.deactivateActiveButton(event);
        }

        // Call the shared on active listener if there is one
        if (active && dev.isType("function", this.menu.sharedOnActive)) {
            this.menu.sharedOnActive.call(this, this, event);
        }

        // If targetView is null, retrieve the targetView
        if (!this.targetView && this.viewer.views[this.getIndex()]) {
            this.targetView = this.viewer.views[this.getIndex()];
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
            this.classes.add("active");
        } else {
            this.classes.remove("active");
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

    // Get the index of this button in the navigator menu
    getIndex() {
        return this.menu.getButtonIndex(this);
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
        this.classes.add("navigator-menu");

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.viewer = null;
        this.navigator = null;

        // Properties
        this.sharedOnActive = null;
        this.activeButton = null;
        this.buttons = [];
    }

    // Add one button onto the navigator menu
    addButton(button, index, shouldAdd=true) {
        if (!(button instanceof NavigatorButton)) {
            return;
        }

        if (index == undefined) {
            index = this.buttons.length;
        }

        Object.assign(button, {
            menu: this,
            viewer: this.viewer,
            navigator: this.navigator
        });

        // Sets the button's targetView if the view exists NavigatorView
        if (!(button.targetView instanceof View) && this.viewer.views[index]) {
            button.targetView = this.viewer.views[index];
        }

        // Add button
        if (shouldAdd) {
            if (index < this.buttons.length) {
                this.insertComponentBefore(button, this.buttons[index]);
            } else {
                this.addComponent(button);
            }
        }

        // Add button to this.buttons array
        if (index < this.buttons.length) {
            this.buttons.splice(index, 0, button);
        } else {
            this.buttons.push(button);
        }
    }

    // Add some buttons onto the navigator menu
    addButtons(...navigatorButtons) {
        for (const navigatorButton of navigatorButtons) {
            this.addButton(navigatorButton);
        }
    }

    // Remove a button from the navigator menu
    removeButton(button) {
        button.getParent().removeComponent(button);
        this.buttons.splice(this.buttons.indexOf(button), 1);
        return button;
    }

    // Set all buttons with a same active listener
    setSharedActiveListener(listener) {
        this.sharedOnActive = listener;
    }

    // Get the index of a button
    // Returns -1 if not found
    getButtonIndex(button) {
        return this.buttons.indexOf(button);
    }

    // Deactivate the current active button
    deactivateActiveButton(event={}) {
        if (this.activeButton instanceof NavigatorButton) {
            this.activeButton.deactivate(event);
            this.activeButton = null;
        }
    }
}

// View class
class View extends Component {
    static InitOn = {
        Set: Symbol(),    // view.setInit() & manual
        Add: Symbol(),    // navigatorView.addView() & manual
        Manual: Symbol()  // view.initialize()
    };

    constructor(name, info) {
        super(document.createElement("div"));
        this.classes.add("view", "view-" + name, "hidden");
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

        // Initialize
        this.init = null;
        this.initOn = null;
    }

    // Show the view
    show(event=null) {
        // Unhide the view
        this.classes.remove("hidden");

        // Update active view
        this.viewer.activeView = this;

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
        this.classes.add("hidden");

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

    // Set the initializing code
    setInit(initOn, callback, ...args) {
        this.init = callback.bind(this);
        this.initOn = initOn;
        if (initOn == View.InitOn.Set) {
            this.initialize(...args);
        }
    }

    // Initialize by calling this.init
    initialize(...args) {
        return this.init(...args);
    }
}

// Navigator viewer
// Shows the content of a tab, using View class
class NavigatorViewer extends Component {
    constructor(element) {
        super(element || document.createElement("div"));
        this.classes.add("navigator-viewer");

        // Access owner components
        // These properties will be set by the owners when added to owner
        this.menu = null;
        this.navigator = null;

        // Properties
        this.sharedOnShow = null;
        this.activeView = null;
        this.views = [];
    }

    // Add one view onto the navigator view
    addView(view, index, ...args) {
        if (!(view instanceof View)) {
            return;
        }

        if (index == undefined) {
            index = this.views.length;
        }

        Object.assign(view, {
            menu: this.menu,
            viewer: this,
            navigator: this.navigator
        });

        // Add view
        // this.views[index] = this.addComponent(view);
        if (index < this.views.length) {
            // this.views.splice(index, 0, this.insertComponentBefore(view, this.views[index]))
            this.views.splice(index, 0, this.addComponent(view));
        } else {
            this.views.push(this.addComponent(view));
        }

        // Checks the view's initOn
        if (view.initOn == View.InitOn.Add) {
            view.initialize(...args);
        }
    }

    // Add some views onto the navigator view
    addViews(...views) {
        for (const view of views) {
            this.addView(view);
        }
    }

    // Remove a button from the navigator menu
    removeView(view) {
        this.removeComponent(view);
        this.views.splice(this.views.indexOf(view), 1);
        return view;
    }

    // Set all views with a same show listener
    setSharedShowListener(listener) {
        this.sharedOnShow = listener;
    }
}

// Navigator
// Combines all the previous classes into one
class Navigator {
    constructor(menu, viewer) {
        // The menu; all buttons will be displayed here
        this.menu = menu || new NavigatorMenu();

        // The viewer; tab content will be displayed here
        this.viewer = viewer || new NavigatorViewer();
        
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
        const { button, view, index, shouldAddButton } = pageInfo;
        this.pages[button.name || view.name] = pageInfo;

        // Add buttons and views if there are any
        if (button instanceof NavigatorButton) {
            this.menu.addButton(button, index, shouldAddButton);
        }
        if (view instanceof View) {
            this.viewer.addView(view, index);
        }
    }

    // Add some pages onto the navigator
    // Calls NavigatorMenu.addButton() and NavigatorViewer.addView()
    addPages(...pages) {
        for (const page of pages) {
            this.addPage(page);
        }
    }

    // Delete a page
    deletePage(index) {
        delete this.pages[this.viewer.views[index].name];
        this.menu.removeButton(this.menu.buttons[index]);
        this.viewer.removeView(this.viewer.views[index]);
    }

    // Open a page
    open(name) {
        this.pages[name].button.activate();
    }
}

/* ===================== */
/* Dropdown classes      */
/* ===================== */

// DropdownToggler <- Toggler (<- Button <- Input)
// DropdownRow (<- Component)
// Dropdown has DropdownRows (<- Component)
// SubDropdown has DropdownRows <- Dropdown

// Button that toggles the dropdown
class DropdownToggler extends Toggler {
    constructor(content, target=null, classes, info) {
        super(content, false, classes, info);
        this.classes.add("dropdown-toggler");

        this.target = target;

        // Open/close the dropdown when clicked on
        this.addEventListener("click", () => {
            if (this.isActive) {
                this.target.show();
            } else {
                this.target.hide();
            }
        });

        // Conditions that could cause the dropdown to close
        const activeElementNotInDropdown = () => {
            return this.isActive &&
                   document.activeElement !== this.element &&
                   !this.target.element.contains(document.activeElement);
        };
        const activeButtonInDropdown = () => {
            return this.target.element.contains(document.activeElement) &&
                   document.activeElement.tagName === "BUTTON";
        };

        quill.eventDelegation.add("focusin", document.body, () => {
            if (activeElementNotInDropdown()) {
                this.target.hide();
                this.deactivate();
            }
        });
        quill.eventDelegation.add("click", document.body, () => {
            if (activeElementNotInDropdown() || activeButtonInDropdown()) {
                this.target.hide();
                this.deactivate();
            }
        });
    }

    // Set the target Dropdown to toggle
    setTarget(dropdown) {
        if (!(dropdown instanceof Dropdown)) {
            throw new TypeError("'dropdown' argument expected instance of Dropdown");
        }

        this.target = dropdown;
    }
}

// A row in a dropdown
// Can add things to the dropdown
class DropdownRow extends Component {
    constructor() {
        super(document.createElement("div"));
        this.classes.add("dropdown-row");

        this.owner = null;
        this.index = -1;
        this.height = NaN;
    }
}

// The actual dropdown menu
class Dropdown extends Component {
    constructor(info) {
        super(document.createElement("div"));
        this.classes.add("dropdown");
        this.setAttribute("tabindex", "0");

        if (!dev.isValid(info.alignment, "left", "right")) {
            throw new SyntaxError("'position' argument must be 'left' or 'right'");
        }

        this.isOpen = false;
        this.alignment = info.alignment;
        this.width = info.width || 320;
        this.maxHeight = info.maxHeight;
        this.rowHeight = info.rowHeight;

        // Holds all the DropdownRows
        this.rows = [];

        // Initialize element
        Object.assign(this.style, {
            [this.alignment]: "0px",
            width: this.width + "px",
            maxHeight: this.maxHeight + "px" || ""
        });

        // Hide dropdown after fade-out ends
        this.addEventListener("animationend", () => {
            if (!this.isOpen) {
                this.style.display = "none";
            }
        });
    }

    // Add a row to the dropdown using an existing row
    addRow(row, index) {
        if (!(row instanceof DropdownRow)) {
            throw new TypeError("'row' argument expected instance of DropdownRow");
        }

        this.addComponent(row);

        // Insert or append row to this.rows
        // Set index
        this.insertRow(row, index);

        // Set row height and info
        row.element.style.height = this.rowHeight + "px";
        row.height = this.rowHeight;
        row.owner = this;

        return row;
    }

    // Add multiple rows
    addRows(rows, index) {
        if (!dev.isIterable(rows)) {
            throw new TypeError("'rows' argument expected iterable");
        }
        for (const i in rows) {
            this.addRow(rows[i], index + i);
        }
    }
    
    // Create a new row and return it
    createRow(index) {
        const row = this.addComponent(new DropdownRow());

        this.insertRow(row, index);

        // Set height
        row.element.style.height = this.rowHeight + "px";
        row.height = this.rowHeight;
        row.owner = this;

        return row;
    }

    // Create multiple rows
    createRows(amount, index) {
        for (let i = 0; i < amount; i++) {
            this.createRow(index + i);
        }
    }

    // Insert a row at an index
    // Row is added to the end if no index is provided
    insertRow(row, index) {
        if (index) {
            this.rows.splice(index, 0, row);
            row.index = index;
        } else if (row.index >= 0) {
            this.rows.splice(row.index, 0, row);
            // [no setting index]
        } else {
            this.rows.push(row);
            row.index = this.rows.length - 1;
        }
    }

    // Display dropdown
    show() {
        this.style.display = "block";
        this.classes.add("open");
        this.isOpen = true;
    }

    // Hide dropdown
    hide() {
        this.classes.remove("open");
        this.isOpen = false;
    }
}

// Sub-dropdowns must be in a Dropdown or a SubDropdown
class SubDropdown extends Dropdown {
    constructor() {
        super();
        this.classes.add("sub-dropdown");
    }
}

// Contains and combines dropdown classes into one
class DropdownFacade extends Component {
    constructor(toggler, dropdown) {
        super(document.createElement("div"));
        this.classes.add("dropdown-container");

        // Check type
        if (toggler && !(toggler instanceof DropdownToggler)) {
            throw new TypeError("'toggler' argument expected instance of DropdownToggler");
        }
        if (dropdown && !(dropdown instanceof Dropdown)) {
            throw new TypeError("'container' argument expected instance of Dropdown");
        }

        this.dropdown = dropdown || new Dropdown();
        this.toggler = this.addComponent(toggler || new DropdownToggler(this.dropdown));
        this.addComponent(dropdown);
    }
}

/* ===================== */
/* Navigator classes     */
/* ===================== */

// Tooltip class (abstract)
// A single element that goes to an target's position when a it is hovered on
class Tooltip extends Input {
    // Constructor
    // `delay` is in milliseconds
    constructor(delay, classes=[], info) {
        super(document.createElement("div"), null, classes, info);
        this.classes.add("tooltip");

        // Properties
        this.delay = Number(delay) || 500;
        this.timeout = null;

        // Components that will cause the tooltip to appear
        this.targets = [];
    }

    // Add a target
    addTarget(target, tooltipContent) {
        this.targets.push(target);
        target.setAttribute("data-tooltip", tooltipContent);
        target.addEventListener("mouseenter", () => this.on(target), null, false);
        target.addEventListener("focus", () => this.on(target), null, false);
        target.addEventListener("mouseleave", () => this.off(), null, false);
        target.addEventListener("blur", () => this.off(), null, false);
    }

    // Set the position of the tooltip
    setPosition(target) { /* override */ }

    // Activate
    on(target) {
        // Make sure text is set before position
        this.text = target.getAttribute("data-tooltip");
        this.setPosition(target);
        this.setTimeout(target);
    }

    // Deactivate
    off() {
        this.clearTimeout();
        this.hide();
    }

    // Display the tooltip (without delay)
    show() {
        this.classes.add("active");
    }

    // Hide the tooltip
    hide() {
        this.classes.remove("active");
    }

    // Set the timeout
    setTimeout(target) {
        // Set timeout
        this.timeout = setTimeout(this.show.bind(this), this.delay);
    }

    // Clear the timeout
    clearTimeout() {
        clearTimeout(this.timeout);
        this.timeout = null;
    }
}

// Pointing tooltip
// The tooltip has an arrow that points to the target
class PointingTooltip extends Tooltip {
    constructor(position, delay, classes=[], info) {
        super(delay, classes, info);
        this.classes.add("pointing-tooltip");

        // Set the position and check if it's a valid value
        if (!dev.isValid(position, "top", "bottom", "left", "right")) {
            throw new SyntaxError("'position' argument must be 'top', 'bottom', 'left', or 'right'");
        }
        this.position = position;
        this.setAttribute("data-tooltip-position", this.position);
    }

    // Set the position of the tooltip
    setPosition(target) {
        // Get bounding client rect of target and tooltip
        const { x, y, width, height } = target.element.getBoundingClientRect();
        const { width: thisWidth } = this.element.getBoundingClientRect();
        switch (this.position) {
            case "bottom":
                this.style.left = `${x + width / 2 - thisWidth / 2}px`;
                this.style.top = `${y + height + 12}px`;
        }
    }
}

// Mouse location tooltip
// Tooltip appears at mouse position
class MouseTooltip extends Tooltip {
    constructor(delay, classes=[], info) {
        super(delay, classes, info);
        this.classes.add("mouse-tooltip");
    }
}

// Export
export {
    // Inputs
    Button, Toggler, HoverToggler, Expander, TextField,
    // Resizer related
    HorizontalResizer, VerticalResizer,
    // Navigator related
    Navigator, NavigatorMenu, NavigatorViewer, NavigatorButton, View,
    // Dropdown
    DropdownToggler, DropdownRow, Dropdown, SubDropdown, DropdownFacade,
    // Tooltip related
    Tooltip, PointingTooltip, MouseTooltip
}


