/**
 * js/quill.js
 * 
 * Some basic properties and functions for the app.
 */


"use strict";

import dev from "./dev.js"

// Quill
const quill = {
    // App properties
    _version: "0.1.0",

    // Basic elements
    app: document.getElementById("app"),
    loading: document.getElementById("loading"),

    // File paths
    path: {
        logo: "../img/logo-256.png"
    },

    // Milestone tracking
    milestoneTrack: new dev.MilestoneTrack("quill",
        ["initialize", "components", "loading", "display"],
        function({ name, milestone, index, time }) {
            // Update progress bar in loading screen
            document.querySelector("#loading .progress-bar").style.width =
                `${(index + 1) / this.milestones.length * 100}%`;
            
            // Log
            console.log(
                `${name} milestone: '${milestone}'\t(${index+1}/${this.milestones.length}; ${time}ms)`
            );

            // If this is the last milestone, end the loading screen
            if (index === this.milestones.length - 1) {
                const loading = document.getElementById("loading");
                loading.classList.add("animation-fade-out");
                setTimeout(() => {
                    loading.classList.add("hidden");
                }, 400 + 150 - 20);
            }
        }
    ),

    // Event delegation
    // click, mousedown, mouseup, mouseover*, mouseout*, keydown, keyup, keypress
    eventDelegation: {
        // Listeners that will be combined
        listeners: {},

        // Good event types for event delegation
        recommended: ["click", "mousedown", "mouseup", "mouseover", "mouseout", "keydown", "keyup", "keypress"],

        // Add a listener
        add: function(type, target, listener, ignore=false) {
            if (!this.recommended.includes(type) && !ignore) {
                console.warn(`Unrecommended type for event delegation: '${type}'`);
            }

            // If the event type does not exist yet, create an array for it
            if (!this.listeners[type]) {
                this.listeners[type] = [];
            }

            // Add the listener to the array
            listener.target = target;
            this.listeners[type].push(listener);
        },

        // Combine into one event listener
        merge: function(type, element=document) {
            element.addEventListener(type, (event) => {
                // Call each listener
                for (const listener of this.listeners[type]) {
                    if (listener.target && !event.composedPath().includes(listener.target)) {
                        continue;
                    }
                    listener(event);
                }
            });
        },

        // Combine all
        mergeAll: function(element=document) {
            for (const type in this.listeners) {
                this.merge(type, element);
            }
        }
    }
};

quill.milestoneTrack.done("initialize");

export default quill


