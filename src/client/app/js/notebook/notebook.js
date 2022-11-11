/**
 * js/notebook/notebooks.js
 * 
 * Classes for notebooks.
 * Notebooks should have NotebookPages and
 * NotebookCover?{1} <- NotebookPage.
 */


"use strict";

import dev from "../dev.js"

// A piece of a notebook (abstract)
// Pieces can have a title and a owner
class NotebookPiece {
    constructor(title="", owner=null) {
        dev.class.abstract(NotebookPiece);

        // Properties
        this.title = title;
        this.owner = owner;
    }

    set title(value) {
        return this._title = String(value);
    }

    set owner(value) {
        if (!(owner instanceof Notebook)) {
            throw new TypeError("Expected instance of Notebook for argument 'value'");
        }
        return this._owner = value;
    }

    get title() {
        return this._title;
    }

    get owner() {
        return this._owner;
    }
}

// Notebook page
class NotebookPage extends NotebookPiece {
    constructor(title, owner) {
        super(title, owner);

        // Labels on this page
        this.labelFlags = [];
        this.labelSymbols = [];

        // The object contents on this page
        this.contents = [];
    }
}

// A page, but will be used for thumbnail of Notebook
class NotebookCover extends NotebookPage {
    constructor(owner) {
        super(owner.title, owner);
    }
}

// Notebook section
// Sections can have sections and pages
class NotebookSection extends NotebookPiece {
    constructor(title, owner) {
        super(title, owner);

        // Properties
        this._pages = {};
    }
}

// Notebook
class Notebook {
    constructor(title) {
        this.title = title;
    }

    set title(value) {
        return this._title = String(value);
    }

    get title() {
        return this._title;
    }
}

export { Notebook, NotebookPage, NotebookCover, NotebookSection }


