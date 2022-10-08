/**
 * js/components/blocks.js
 * 
 * Blocks, elements, and other components of app,
 * such as main, banner, etc.
 */


"use strict";

import dev from "../dev.js";
import { Component } from "../quartz.js"

// Section class
class Section extends Component {
    // Constructor
    constructor(name, info, element) {
        super(element || document.createElement("div"));
        this.element.classList.add("section");
        this.setProperties(info);

        // Properties
        this.name = String(name || "");
        this.group = null;
        this.display = "block";
        this.sections = {};
        dev.class.iterable(this.sections, (value) => value instanceof Section);

        this.element.setAttribute("data-name", this.name);
    }

    // Set CSS display property
    setDisplay(display) {
        this.display = String(display);
    }

    // Add a section
    addSection(section) {
        if (!(section instanceof Section)) {
            return;
        }

        // Update the section's group
        section.group = this;

        // Add the component to this group
        this.sections[section.name || Object.keys(this.sections).length]
            = this.addComponent(section);
    }

    // Add sections
    addSections(...sections) {
        for (const section of sections) {
            this.addSection(section);
        }
    }
}

// Main section class
class Main extends Section {
    // Constructor
    constructor(name="main", info) {
        super(name, info);
        this.element.classList.add("main");
    }
}

// Header section class
class Header extends Section {
    // Constructor
    constructor(name="header", info) {
        super(name, info);
        this.element.classList.add("header");
    }
}

// Footer section class
class Footer extends Section {
    // Constructor
    constructor(name="footer", info) {
        super(name, info);
        this.element.classList.add("footer");
    }
}

// Side bar section class
class SideBar extends Section {
    // Constructor
    constructor(name="side-bar", info) {
        super(name, info);
        this.element.classList.add("side-bar");
    }
}

export { Section, Main, Header, Footer, SideBar }

