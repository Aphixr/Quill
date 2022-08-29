/**
 * Quartz.js Delta
 * 
 * A much simpler version, without states and actions.
 * Extend from `Component` class to create a component
 * 
 * Example usage:
    class Counter extends Component {
        constructor() {
            super(document.createElement('button'));
            this.count = 0;
            this.element.addEventListener('click', () => {
                return this.element.innerText = this.increase();
            });
        }
        increase() {
            return ++this.count;
        }
    }
    const counter = new Counter();
    counter.render(document.body);
 */


"use strict";

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
        this.element = element;
        this.components = {};
    }

    /**
     * Renders the component at a place
     * @param {Element} where Where to render the component
     * @returns {void} `undefined`
     */
    render(where) {
        where.appendChild(this.element);
        return this;
    }

    /**
     * Adds a component to this component
     * @param {string} name The name of the component
     * @param {Component} component A component instance
     * @returns {void} `undefined`
     */
    addComponent(name, component) {
        if (!(component instanceof Component)) {
            throw new TypeError("Unexpected value for argument 1");
        }
        component.parentComponent = this;
        this.components[name] = component;
        this.element.appendChild(component.element);
    }

    /**
     * Get a component that was added to this component
     * @param {...string} names The name of the component. Multiple parameters searches components in a component
     * @returns {(Component|void)} The component or `undefined` if component does not exist
     */
    getComponent(...names) {
        let component;
        for (let i = 0; i < names.length; i++) {
            if (i == 0) {
                component = this.components[names[0]];
                continue;
            }
            component = component.getComponent(names[i]);
        }
        return component;
    }

    /**
     * Get the parent component of this component
     * @returns {(Component|void)} The parent component or `null` if has no parent
     */
    getParentComponent() {
        return this.parentComponent ? this.parentComponent : null;
    }

    /**
     * Get a component that was added to this component
     * @param {object} name The objects that will be copied to the element
     * @returns {void} `undefined`
     */
    setProperties(...object) {
        Object.assign(this.element, ...object);
    }
}

export default Component


