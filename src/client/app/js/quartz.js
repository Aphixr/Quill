/**
 * Quartz.js Epsilon
 * 
 * Half Gamma, half Delta. Has states like Gamma,
 * (but less complicated), and adding child components like Delta.
 * 
 * Example usage:
    class Counter extends Component {
        constructor() {
            super(document.createElement('button'));
            this.count = this.addState(new State(0, function() {
                this.owner.element.innerText = this.state;
            }));
            this.element.addEventListener('click', () => {
                this.count.state++;
            });
        }
    }
    const counter = new Counter();
    counter.render(document.body);
 */


"use strict";

/**
 * State of a component
 */
class State {
    /**
     * Create a new state of a component
     * @constructor
     * @param {*} value A value for the state
     * @param {Function} onchange The function that will be fired when state is changed
     */
    constructor(value, onchange) {
        this.oldValue = undefined;
        this.value = value;
        this.owner = null;
        this.owners = [];
        this.onchange = typeof onchange === "function" ? onchange : null;
        this[Symbol.toPrimitive] = function() {
            switch (type) {
                case "number":
                    return Number(this.value);
                case "string":
                    return String(this.value);
                case "default":
                default:
                    return this.value;
            }
        };
    }

    // Get the state value
    get state() {
        return this.value;
    }

    // Set the state value
    // This will fire `this.onchange` if it is a function and `old value !== new value`
    set state(value) {
        if (this.value !== value) {
            this.oldValue = this.value;
            this.value = value;
            if (typeof this.onchange === "function") {
                this.onchange.call(this, this);
            }
        }
        return this.value;
    }

    /**
     * Set the event listener for when the state changes
     * @param {function} listener The `onchange` event listener
     * @returns {void} `undefined`
     */
    setChangeListener(listener) {
        if (typeof listener !== "function") {
            throw new TypeError("'listener' argument expected a function");
        }
        this.onchange = listener;
    }
    
    /**
     * Add owner(s) to the state
     * @param {...Component} owner The component that owns the state
     * @returns {void} `undefined`
     */
    addOwners(...owners) {
        for (const i in owners) {
            if (owners[i] instanceof Component) {
                if (i === owners.length - 1) {
                    this.owner = owners[i];
                }
                this.owners = this.owners.push(owners[i]);
            }
        }
    }
}

/**
 * Create components by extending it
 */
class Component {
    /**
     * Create a new component
     * @constructor
     * @param {Element} element A DOM element the component will be using
     */
    constructor(element) {
        if (!(element instanceof Element)) {
            throw new TypeError("'element' argument expected instance of Element");
        }
        this.element = element;
        this.parent = null;
        this.children = [];
        this.states = [];
    }

    /* === Add/Remove === */

    /**
     * Adds a component to this component
     * @param {Component} component A component instance
     * @returns {Component} The attached component
     */
    addComponent(component) {
        if (!(component instanceof Component)) {
            throw new TypeError("`component` argument expected instance of Component");
        }
        component.parent = this;
        this.children.push(component);
        this.element.appendChild(component.element);
        return component;
    }
    
    /**
     * Add multiple components to this component
     * @param {...Component} components Components to attach
     * @returns {Component[]} Array of components passed in
     */
    addComponents(...components) {
        for (const component of components) {
            this.addComponent(component);
        }
        return components;
    }

    /**
     * Add a state to this component
     * @param {State} state The state to attach to this component
     * @returns {State} The attached state
     */
    addState(state) {
        if (!(state instanceof State)) {
            throw new TypeError("`state` argument expected instance of State");
        }
        state.addOwners(this);
        this.states.push(state);
        return state;
    }

    /**
     * Add multiple states to this component
     * @param {...State} states States to attach
     * @returns {State[]} Array of states passed in
     */
    addStates(...states) {
        for (const state of states) {
            this.addState(state);
        }
        return states;
    }
    
    /**
     * Add an event listener to the component
     * @param {String} type Type of event
     * @param {function(): any} listener Function to call
     * @param {(boolean|*)?} options Options for the event listener
     */
    addEventListener(type, listener, options) {
        this.element.addEventListener(type, listener, options);
    }

    /**
     * Insert a component before a child component
     * @param {Component} component The component to insert
     * @param {Component} before A child component to insert before
     * @returns {Component} The component inserted
     */
    insertComponentBefore(component, before) {
        if (!(component instanceof Component)) {
            throw new TypeError("`component` argument expected instance of Component");
        }
        if (!(before instanceof Component)) {
            throw new TypeError("`before` argument expected instance of Component");
        }
        const index = this.children.indexOf(before);
        if (index === -1) {
            throw new SyntaxError("`before` argument expected child Component");
        }
        component.parent = this;
        this.children.splice(index, 0, component);
        this.element.insertBefore(component.element, before.element);
        return component;
    }

    /**
     * Remove a component from this component
     * @param {Component} component The component to remove
     * @returns {Component} The removed component
     */
    removeComponent(component) {
        if (!(component instanceof Component)) {
            throw new TypeError("`component` argument expected instance of Component");
        }
        component.parent = null;
        const index = this.children.indexOf(component);
        this.children.splice(index, 1);
        this.element.removeChild(component.element);
        return component;
    }

    /**
     * Remove a component from this component.
     * The component does not have to be a child of this component,
     * it can be can be a grandchild.
     * @param {Component} component The descendant component to remove
     * @returns {Component} The removed component
     */
    removeDescendantComponent(component) {
        if (!(component instanceof Component)) {
            throw new TypeError("`component` argument expected instance of Component");
        }
        component.parent = null;
        const { index, parent } = (function search(check) {
            let result = null;
            let index = check.children.indexOf(component);
            if (index === -1) {
                for (const child of check.children) {
                    result = search(child);
                }
            } else {
                result = {
                    index: index,
                    parent: check
                }
            }
            return result;
        })(this);
        parent.children.splice(index, 1);
        component.element.remove();
        return component;
    }

    /**
     * Remove an event listener to the component
     * @param {String} type Type of event
     * @param {function(): any} listener Function to remove
     * @param {(boolean|*)?} options Options for the event listener
     */
    removeEventListener(type, listener, options) {
        this.element.removeEventListener(type, listener, options);
    }

    /* === Getters === */

    /**
     * Get the parent component of this component
     * @returns {(Component|null)} The parent component or `null` if has no parent
     */
    getParent() {
        return this.parent;
    }

    /**
     * Get the attribute of the element
     * @param {String} name Name of the attribute to get
     * @returns {(String|null)} Attribute's value or `null` if it has no value
     */
    getAttribute(name) {
        return this.element.getAttribute(name);
    }

    /**
     * Get the id of the element
     */
    get id() {
        return this.element.id;
    }

    /**
     * Returns the `classList` of the element
     */
    get classes() {
        return this.element.classList;
    }

    /**
     * Returns the `style` of the element
     */
    get style() {
        return this.element.style;
    }

    /**
     * Returns the `innerHTML` of the element
     */
    get html() {
        return this.element.innerHTML;
    }

    /**
     * Returns the `innerText` of the element
     */
    get text() {
        return this.element.innerText;
    }

    /* === Setters === */

    /**
     * Set properties to the element
     * @param {...*} objects The objects that will be copied to the element
     */
    setProperties(...objects) {
        Object.assign(this.element, ...objects);
    }

    /**
     * Set an attribute on the element
     * @param {String} name The name of the attribute to set
     * @param {String} value The new value of the attribute
     * @returns {String} The new value passed in
     */
    setAttribute(name, value) {
        this.element.setAttribute(name, value);
        return String(value);
    }

    /**
     * Set the id of the element
     */
    set id(value) {
        return this.element.id = value;
    }
    
    /**
     * Set the `innerHTML` of the element
     */
    set html(value) {
        return this.element.innerHTML = value;
    }
    
    /**
     * Set the `innerText` of the element
     */
    set text(value) {
        return this.element.innerText = value;
    }

    /* === Render === */

    /**
     * Renders the component at a place
     * @param {Element} where Where to render the component
     */
    renderAt(where) {
        if (!(where instanceof Element)) {
            throw new TypeError("`where` argument expected instance of Element");
        }
        where.appendChild(this.element);
    }

    /**
     * Attach components to an element
     * @param {Element} where The element the components should be rendered in
     * @param {...any} components Components to render
     */
    static render(where, ...components) {
        for (const component of components) {
            if (!(where instanceof Element)) {
                throw new TypeError("`where` argument expected instance of Element");
            }
            if (!(component instanceof Component)) {
                throw new TypeError("`...components` argument expected instance of Component");
            }
            where.appendChild(component.element);
        }
    }
}

export { State, Component }


