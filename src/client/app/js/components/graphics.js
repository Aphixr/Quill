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
    constructor(path, intervalWidth=0, intervalHeight=0) {
        this.path = path;
        this.intervalWidth = +intervalWidth;
        this.intervalHeight = +intervalHeight;
    }

    // Returns an Icon
    getIcon(x=0, y=0, width=this.intervalWidth, height=this.intervalHeight) {
        return new Icon(this.path, x * this.intervalWidth, y * this.intervalHeight, width, height);
    }
}

// Icon class
class Icon extends Component {
    constructor(source, x, y, width, height) {
        super(document.createElement("span"));
        this.classes.add("icon");

        // Set the background image to the source
        this.style.backgroundImage = `url('${source}')`;

        // Set background position
        // x and y needs to be negative
        if (x) {
            this.style.backgroundPositionX = -x + "px";
        }
        if (y) {
            this.style.backgroundPositionY = -y + "px";
        }

        // Change the size
        if (width) {
            this.style.width = width + "px";
        }
        if (height) {
            this.style.height = height + "px";
        }
    }
}

// Export
export { SpriteSheet, Icon }


