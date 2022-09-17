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

    // Cookies
    cookies: {
        // Set a cookie
        set: function({ name, value, expires, path, domain, secure }) {
            let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
            if (expires instanceof Date) {
                cookie += ";expires=" + expires.toGMTString();
            }
            if (path) {
                cookie += ";path=" + path;
            }
            if (domain) {
                cookie += ";domain=" + domain;
            }
            if (secure) {
                cookie += ";secure";
            }
            document.cookie = cookie;
            return this;
        },
        get: function(name) {
            const cookie = document.cookie;
            let index = NaN, semicolon = NaN;
            name = decodeURIComponent(name);
            return decodeURIComponent(cookie.slice(
                index = cookie.indexOf(name + "=") + name.length + 1,
                (semicolon = cookie.substring(index).indexOf(";")) !== -1 ? semicolon + index : undefined
            ));
        },
        remove: function({ name, path, domain, secure }) {
            this.set({
                name: name,
                value: "",
                expires: new Date(0),
                path: path,
                domain: domain,
                secure: secure
            });
            return this;
        }
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

quill.milestoneTrack.done("initialize");

export default quill


