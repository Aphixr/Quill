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
    Component.render(document.body, counter);
 */


"use strict";

// Component class
class Component {
    // Constructor
    constructor(element) {
        this.element = element;
        this.components = {};
    }

    // Render the component
    render(where) {
        where.appendChild(this.element);
        return this;
    }

    // Adds a component to this component
    setComponent(name, component) {
        if (!(component instanceof Component)) {
            throw new TypeError("Unexpected value for argument 2");
        }
        this.components[name] = component;
        return this.components[name];
    }

    // Get a component
    getComponent(name) {
        return this.components[name];
    }

    // Attach a component onto this component's element
    attachComponent(name) {
        if (!(name in this.components)) {
            throw new ReferenceError(`Cannot attach non-existing component '${name}'`);
        }
        this.element.appendChild(this.components[name].element);
        return this.components[name];
    }
}

export default Component


