/**
 * js/components/input.js
 * 
 * Anything to do with inputs, such as an input box,
 * radios, buttons, checkboxes, select, etc. `Input`
 * is an abstract class. `Tabs`, `Tab`, and `TabContent`
 * are also found here, extending from `Input` class.
 */


"use strict";

import dev from "../dev.js"
import Component from "../quartz.js"

// Input class (abstract)
// Anything the user can input any form of information
// or interaction is extended from this class
class Input extends Component {
    constructor() {
        dev.class.abstract(Input);
        super(document.createElement("div"));

        // Initialize element
        this.element.classList.add("input");
    }

    // Set the container id
    setContainerId(id) {
        return this.element.id = String(id);
    }

    // Set the container classes
    setContainerClasses(...classes) {
        for (const className of classes) {
            this.element.classList.add(className);
        }
        return this.element.classList;
    }

    // Create child element
    createChildElement(name, {
        content, attributes,
        classes, id
    }) {
        // Create inner element
        this.childElement = document.createElement(name);

        // Set inner text
        if (content) {
            this.childElement.innerText = content;
        }
        
        // Set any attributes
        // Must be an object
        if (dev.isType("object", attributes)) {
            for (const attribute in attributes) {
                this.childElement.setAttribute(attribute, attributes[attribute]);
            }
        }

        // Set classes
        // `classes` must be a string or an iterable
        if (dev.isType("string", classes)) {
            this.childElement.className = classes
        } else if (dev.isIterable(classes)) {
            for (const className of classes) {
                this.childElement.classList.add(className);
            }
        } else;

        // Set id
        if (id) {
            this.childElement.id = id;
        }

        // Append child element to container
        this.element.appendChild(this.childElement);

        return this.childElement;
    }

    // Add event listener to child element
    addEventListener() {
        this.childElement.addEventListener(...arguments);
    }

    // Remove event listener to child element
    removeEventListener() {
        this.childElement.removeEventListener(...arguments);
    }
}

// Button class
class Button extends Input {
    constructor(info) {
        super();
        this.createChildElement("button", info);
    }
}

export { Input, Button }


