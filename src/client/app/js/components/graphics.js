/**
 * js/components/graphicsicons.js
 * 
 * All classes graphics related
 * Icons, SpriteSheet
 */


"use strict";

import { Component } from "../quartz.js"

// SpriteSheet class
class SpriteSheet {
    constructor(path, intervalWidth, intervalHeight) {
        this.path = path;
        this.intervalWidth = +intervalWidth;
        this.intervalHeight = +intervalHeight;
    }
    createIcon(x, y) {
        return new Icon(this.path, x * this.intervalWidth, y * this.intervalHeight);
    }
}

// Icon class
class Icon extends Component {
    constructor(source, x, y) {
        super(document.createElement("span"));
        this.element.classList.add("icon");

        // Set the background
        this.element.style.backgroundImage = `url('${source}')`;
        if (x) {
            this.element.style.backgroundPositionX = x + "px";
        }
        if (y) {
            this.element.style.backgroundPositionY = y + "px";
        }
    }
}

// Export
export { SpriteSheet, Icon }


