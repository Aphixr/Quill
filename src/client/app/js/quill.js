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
    )
};

document.getElementById("version").innerText = quill._version;

quill.milestoneTrack.done("initialize");

export default quill


