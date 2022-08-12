/** Quartz.js - vGamma.1.0.0
 * 
 * hope I don't have to go back to this file to fix anything
 * or even worse, start all over
 * 
 * note to self, example usage:
 *
    class Counter extends Component {
        constructor() {
            super();
            this.state.count = 0;
            this.action.incre = (n) => this.state.count += n;
        }
        render() {
            return html`
                <button @click="${this.action.incre(Math.random())}">
                    counter: ${this.state.count}
                </button>
            `;
        }
    }
    const counter = new Counter();
    Component.render(editor.content, counter);
    counter.action.incre()(1); // < using actions outside
 *
 */



"use strict";

console.time("Quartz.js vGamma");

// HTML content class
class HTMLContent {
    // Constructor
    constructor(content, actions) {
        this.element = document.createElement("div");
        this.content = content;
        this.actions = actions;

        // Add things to the element
        this.element.innerHTML = this.content;
        this.element.classList.add("q-html-content");
    }

    // Initialize event listeners
    initEventListeners(thisBind) {
        // Loop through all children
        for (let i = 0, len = this.element.children.length; i < len; i++) {
            const child = this.element.children[i];

            // Get all attributes that start with '@'
            const ats = child.getAttributeNames().filter((name) => name.charAt(0) === "@");
            
            // Add event listeners
            for (let j = 0, len = ats.length, actIdx = 0; j < len; j++, actIdx++) {
                child.addEventListener(ats[j].substring(1), (evt) => {
                    if (this.actions[actIdx] && this.actions[actIdx].toString() == child.getAttribute(ats[j])) {
                        return this.actions[actIdx].call(thisBind, ...this.actions[j].args);
                    } else {
                        actIdx--;
                        return new Function(`const event = ${JSON.stringify(evt)};${child.getAttribute(ats[j])}`)();
                    }
                });
            }
        }
    }
}

// HTML tag function
// Returns an instance of `HTMLContent`
const html = (strings, ...expressions) => {
    // Piece the strings and expressions array together
    let content = "";
    const actions = [];
    for (let i = 0, len = expressions.length; i < len; i++) {
        // Put the string
        content += strings[i];

        // Put the expressions
        content += (() => {
            // Check an expression is a component state or action
            if (expressions[i] instanceof ComponentState) {
                return `<q-state name='${expressions[i].name}'>${String(expressions[i])}</q-state>`;
            }
            if (expressions[i] && expressions[i].isAction) {
                actions.push(expressions[i]);
                return `${String(expressions[i])}`
                    .replace(/(?<!\\)(")/g, "`")
                    .replace(/(?<!\\)(')/g, "`");
            }

            return expressions[i];
        })();
    }
    // Add last string
    content += strings[strings.length - 1];

    // Return HTMLContent
    return new HTMLContent(content.trim(), actions);
};

// State class
class ComponentState {
    constructor(owner, name, value) {
        this.owner = owner;
        this.name = String(name);
        this.value = value;

        // Symbol.toPrimitive can convert an object into a number or string
        this[Symbol.toPrimitive] = function(type) {
            switch (type) {
                case "number":
                    return Number(this.value);
                case "string":
                    return String(this.value);
                case "default":
                default:
                    return this.value;
            }
        }
    }
}

// Action class
class ComponentAction {
    constructor(owner, name, func) {
        this.owner = owner;
        this.name = String(name);

        if (typeof func !== "function") {
            throw new TypeError("ComponentAction ctor arg 3 is not a function");
        }
        this.func = func;
        
        // Attach some properties to the function
        // that will be used else where
        // such as the `html` tag function
        this.func.isAction = true;
        this.func.owner = this.owner;
        const fn = this.func;
        this.costume = function() {
            fn.args = arguments;
            return fn;
        };
    }
}

// Component class
// Inherit from this class to create a component
class Component {
    // Constructor
    constructor() {
        this.element = document.createElement("div");
        this.where = null;
        this.id = (Math.random() * new Date).toString(36).substring(0, 6);
        this.element.classList.add(`q-ci-${this.id}`);
        this.element.classList.add("q-component");
        
        // State and action proxies
        const stateTarget = {}, actionTarget = {};
        this.state = new Proxy(stateTarget, {
            get: (_, property) => {
                return stateTarget[property];
            },
            set: (_, property, value) => {
                // If the property already exists,
                // just change the value and update component
                if (property in stateTarget) {
                    stateTarget[property].value = value;

                    const placesUsed = this.element.querySelectorAll(`q-state[name="${property}"]`);
                    for (let i = 0, len = placesUsed.length; i < len; i++) {
                        placesUsed[i].innerText = value;
                    }
                }
                return stateTarget[property] = new ComponentState(this, property, value);
            }
        });
        this.action = new Proxy(actionTarget, {
            get: (_, property) => {
                return actionTarget[property].costume;
            },
            set: (_, property, func) => {
                // Check if it's a fun! (-ction)
                if (typeof func !== "function") {
                    throw new TypeError(`this.action['${property}'] rhs is not a function`);
                }
                
                // If the property already exists, say no
                if (property in actionTarget) {
                    throw new TypeError(`this.action['${property}'] cannot be redefined`);
                }
                return actionTarget[property] = new ComponentAction(this, property, func);
            }
        });
    }

    // Attach component(s)
    static render(where, ...components) {
        // where.innerHTML = "";

        // Loop through all the components the user wants to attach
        for (let i = 0, len = components.length; i < len; i++) {
            const component = components[i];

            // Check if the argument passed is actually a Component
            if (component instanceof Component) {
                component.where = where;

                // Render
                const render = component.render();
                render.initEventListeners(component);
                component.element.appendChild(render.element);
                // console.log(components[i].element.content);

                // Append component element
                where.appendChild(component.element);
            }
        }
    }
}

console.timeEnd("Quartz.js vGamma");


