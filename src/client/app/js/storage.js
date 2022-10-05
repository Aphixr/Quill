/**
 * js/storage.js
 * 
 * Includes cookies, localStorage, and sessionStorage.
 * Memory for quick remembering little things.
 */


"use strict";

// Storage object
const storage = {
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

    // Local storage
    local: localStorage,

    // Session storage
    session: sessionStorage,

    // Memory
    // Remembering little things, such as
    // the size of the editor side bar
    memory: new Proxy(JSON.parse(localStorage.getItem("memory")) || {}, {
        get(target, property) {
            return target[property];
        },
        set(target, property, value) {
            target[property] = value;
            localStorage.setItem("memory", JSON.stringify(target));
            return true;
        }
    })
};

export default storage


