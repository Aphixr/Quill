/**
 * js/init.js
 * 
 * Initialize some things. Utilities in the `dev` object can
 * be used for development and debugging.
 */

"use strict";

// Dev object
// Useful things for development
const dev = {
    print: function() {
        console.log(...arguments);
    },
    assert: function(assertion, ...obj) {
        console.assert(assertion, ...obj);
    },
    trace: function() {
        console.trace(...arguments);
    },

    // Call this function to throw an error
    throw: function({ Type, fatal, message, code }) {
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
    isType: function(type, ...value) {
        for (let i = 0, len = value.length; i < len; i++) {
            switch (type.toLowerCase().trim()) {
                case "number":
                    return typeof value === "number";
                case "string":
                    return typeof value === "string";
                case "boolean":
                    return typeof value === "boolean";
                case "array":
                    return Array.isArray(value);
                case "object":
                    return value && value.constructor === Object;
                case "function":
                    return typeof value === "function";
                case "symbol":
                    return typeof value === "symbol";
                default:
                    throw new Error(`Invalid first argument '${type}'`);
            }
        }
    },

    // Other checking functions
    isIterable: function(value) {
        return typeof value[Symbol.isIterable] === "function";
    },
    isElement: function(value) {
        return value instanceof Element;
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
            if (this.milestones[this.index] !== milestone) {
                throw new SyntaxError(
                    `Unexpected milestone '${milestone}'; expected '${this.milestones[this.index]}'`
                );
            }
            
            this.index++;
            this.action.call(this, {
                name: this.name,
                milestone: milestone,
                index: this.index,
                time: +new Date - this.startTime
            });
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
        }
    }
};

// Quill
const quill = {
    // App properties
    _version: "0.1.0",

    // Milestone tracking
    milestoneTrack: new dev.MilestoneTrack("quill",
        ["initialize", "quartz.js", "components", "loading", "display"],
        function({ name, milestone, index, time }) {
            document.querySelector("#loading .progress-bar").style.width =
                `${(index + 1) / this.milestones.length * 100}%`;
            console.log(
                `${name} milestone: '${milestone}'\t(${index+1}/${this.milestones.length}; ${time}ms)`
            );
            if (index === this.milestones.length - 1) {
                const loading = document.querySelector("#loading");
                loading.classList.add("animation-fade-out")
                setTimeout(() => {
                    loading.classList.add("hidden");
                }, 750 + 200 - 10);
            }
        }
    )
};

// Enumerated type
// Might switch to using TypeScript some day
// const Color = new Enum("red", "blue", "green");
class Enum {
    constructor() {
        for (let i = 0, len = arguments.length; i < len; i++) {
            this[String(arguments[i])] = String(arguments[i]);
        }
    }
}

// Error codes
const ErrorCode = new Enum(
    "FileFailure",
    "_Other", "_Unknown", "_Unspec"
);

quill.milestoneTrack.next();


