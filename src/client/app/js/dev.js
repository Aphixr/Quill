/**
 * js/dev.js
 * 
 * Utilities in the `dev` object can be used for
 * development and debugging.
 */


"use strict";

// Dev object
// Useful things for development
const dev = {
    print: () => {
        console.log(...arguments);
    },
    assert: (assertion, ...obj) => {
        console.assert(assertion, ...obj);
    },
    trace: () => {
        console.trace(...arguments);
    },
    
    lorem: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas \
minima vel reiciendis incidunt? Unde suscipit eveniet excepturi possimus deleniti \
nostrum eaque illo voluptatem minima quos, aut atque numquam quam recusandae?",

    // Call this function to throw an error
    throw: ({ Type, fatal, message, code }) => {
        // If the error is fatal, display the something went wrong text
        if (fatal) {
            const errorFatalElem = document.getElementById("error-fatal");
            document.getElementById("app").classList.add("hidden");
            errorFatalElem.classList.remove("hidden");
            errorFatalElem.querySelector(".details").innerText =
                "err::" + (code || "_unspec").toLowerCase();
        }

        // Throw the error
        throw new (Type || Error)(`${fatal ? "(fatal) " : ""}${message || "unknown"}`);
    },

    // Check data type
    isType: (type, ...value) => {
        for (let i = 0, len = value.length; i < len; i++) {
            switch (type.toLowerCase().trim()) {
                case "number":
                    return typeof value[i] === "number";
                case "string":
                    return typeof value[i] === "string";
                case "boolean":
                    return typeof value[i] === "boolean";
                case "array":
                    return Array.isArray(value[i]);
                case "object":
                    return value[i] && value[i].constructor === Object;
                case "function":
                    return typeof value[i] === "function";
                case "symbol":
                    return typeof value[i] === "symbol";
                default:
                    throw new Error(`Invalid first argument '${type}'`);
            }
        }
    },

    // Other checking functions
    isIterable: (value) => {
        return typeof value[Symbol.iterator] === "function";
    },
    isElement: (value) => {
        return value instanceof Element;
    },
    isValid: (value, ...validValues) => {
        return validValues.flat().includes(value);
    },
    isArrowFunction: (func) => {
        return typeof func === "function"
            && func.toString().match(/\)(\s|(\/\*(.|\s)*\*\/))*=>\s\{/);
    },

    // Other helper functions
    getPageSize: () => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        };
    },

    // Class functions
    // Functions related to classes and objects
    class: {
        // Makes a class abstract
        // REV: does this function even work?
        abstract: function(Class) {
            if (new.target === Class) {
                throw new SyntaxError(`Cannot create instance of abstract class '${Class.name}'`);
            }
        },

        // Makes a singleton without using objects
        singleton: (Class) => {
            throw new SyntaxError(`Cannot create instance of singleton class '${Class.name}'`);
        },

        // Makes a property of an object constant
        constant: (object, property, value) => {
            Object.defineProperty(object, property, {
                configurable: false,
                writable: false,
                value: value
            });
        },

        // Makes an object iterable
        iterable: (object, condition) => {
            object[Symbol.iterator] = function* () {
                for (const property in object) {
                    const value = object[property];
                    if (typeof condition === "function" && !condition(value)) {
                        continue;
                    }
                    yield value;
                }
            }
        }
    },

    // Timer class
    Timer: class {
        constructor(name) {
            this.name = name;
            this.startMilliseconds = 0;
            this.endMilliseconds = 0;
            this.milliseconds = 0;
        }

        // Begin timer
        // Returns begin time
        start() {
            this.startMilliseconds = +new Date;
            console.time(this.name);
            return this.startMilliseconds;
        }

        // Log timer
        // Returns time since started
        log() {
            console.timeLog(this.name)
            return +new Date - this.startMilliseconds;
        }

        // End timer
        // Returns time since started
        end() {
            console.timeEnd(this.name);
            this.endMilliseconds = +new Date;
            this.milliseconds = this.endMilliseconds - this.startMilliseconds;
            return this.milliseconds;
        }
    },

    // JS Milestone tracker
    MilestoneTrack: class {
        constructor(name, milestones, action) {
            this.name = name;
            this.milestones = milestones;
            this.action = action;
            this.index = -1;
            this.startTime = +new Date;
        }

        // Reached a milestone
        done(milestone) {
            if (this.milestones[this.index + 1] !== milestone) {
                throw new SyntaxError(
                    `Unexpected milestone '${milestone}'; expected '${this.milestones[this.index + 1]}'`
                );
            }
            
            this.index++;
            this.action.call(this, {
                name: this.name,
                milestone: milestone,
                index: this.index,
                time: +new Date - this.startTime
            });

            return this.index;
        }

        // Another way to finish a milestone
        next() {
            this.index++;
            this.action.call(this, {
                name: this.name,
                milestone: this.milestones[this.index],
                index: this.index,
                time: +new Date - this.startTime
            });

            return this.index;
        }
    }
};

// Highlight an element
// Make an element stand out
// Useful for debugging CSS styling and layout
Element.prototype.highlight = function(style) {
    this.classList.add("highlight");
    Object.assign(this.style, style);
};

// Makes a string lowercase and trimmed
String.prototype.clean = function() {
    return this.valueOf().toLowerCase().trim();
}

// Export
export default dev


