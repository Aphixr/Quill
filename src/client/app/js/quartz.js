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

    /**
     * Adds a component to this component
     * @param {Component} component A component instance
     * @returns {Component} The attached component
     */
    addComponent(component) {
        if (!(component instanceof Component)) {
            throw new TypeError("`component` argument expected instance of Component");
        }
        component.parentComponent = this;
        this.components.push(component);
        this.element.appendChild(component.element);
        return component;
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
     * Get the parent component of this component
     * @returns {(Component|void)} The parent component or `null` if has no parent
     */
    getParent() {
        return this.parentComponent;
    }

    /**
     * Set properties to the element
     * @param {...*} objects The objects that will be copied to the element
     * @returns {void} `undefined`
     */
    setProperties(...objects) {
        Object.assign(this.element, ...objects);
    }

    /**
     * Renders the component at a place
     * @param {Element} where Where to render the component
     * @returns {void} `undefined`
     */
    render(where) {
        if (!(where instanceof Element)) {
            throw new TypeError("`where` argument expected instance of Element");
        }
        where.appendChild(this.element);
    }

    /**
     * Attach components to an element
     * @param {Element} where The element the components should be rendered in
     * @param {...any} components Components to render
     * @returns {void} `undefined`
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


