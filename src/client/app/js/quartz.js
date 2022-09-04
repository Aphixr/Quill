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
        if (!(element instanceof Element)) {
            throw new TypeError("`element` argument should be an element");
        }
        this.element = element;
        this.components = {};
    }

    /**
     * Renders the component at a place
     * @param {Element} where Where to render the component
     * @returns {void} `undefined`
     */
    render(where) {
        if (!(where instanceof Element)) {
            throw new TypeError("`where` argument should be an element");
        }
        where.appendChild(this.element);
    }

    /**
     * Adds a component to this component
     * @param {string} name The name of the component
     * @param {Component} component A component instance
     * @returns {Component} The attached component
     */
    addComponent(name, component) {
        if (!(component instanceof Component)) {
            throw new TypeError("`component` argument should be an instance of Component");
        }
        component.parentComponent = this;
        this.components[name] = component;
        this.element.appendChild(component.element);
        return component;
    }

    /**
     * Get a component that was added to this component
     * @param {...string} names The name of the component. Multiple parameters searches components in a component
     * @returns {(Component|void)} The component or `null` if component does not exist
     */
    getComponent(...names) {
        let component = null;
        for (let i = 0; i < names.length; i++) {
            if (i == 0) {
                component = this.components[names[0]];
                continue;
            }
            try {
                component = component.components[names[i]];
            } catch (error) {
                return null;
            }
        }
        return component;
    }

    /**
     * Get the parent component of this component
     * @returns {(Component|void)} The parent component or `null` if has no parent
     */
    getParentComponent() {
        return this.parentComponent || null;
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


