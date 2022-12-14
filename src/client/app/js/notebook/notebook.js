/**
 * js/notebook/notebooks.js
 * 
 * Classes for notebooks.
 * Notebooks should have NotebookPages and
 * NotebookCover?{1} <- NotebookPage.
 */


"use strict";

import dev from "../dev.js"
import { Editor } from "./editor.js"
import { NavigatorButton, View } from "../components.js"

// A piece of a notebook (abstract)
// Pieces can have a title and a owner
class NotebookPiece {
    constructor(title="", owner=null) {
        dev.class.abstract(NotebookPiece);

        // Properties
        this.symbol = Symbol();
        this._title = title;
        this._owner = owner;
    }

    set title(value) {
        return this._title = String(value);
    }

    set owner(value) {
        if (!(this.owner instanceof Notebook)) {
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
    static DEFAULT_TITLE = "New notebook";

    constructor(title) {
        this.id = (+new Date() * Math.floor(1000 * Math.random()));
        this.symbol = Symbol();
        
        this.title = title || Notebook.DEFAULT_TITLE;
        this.isTrash = false;
        this.isOpen = false;

        this.cover = null;
        this.pieces = {};

        this.countPages = 0;
        this.countSections = 0;

        this.createCover();
    }

    // Get/set title
    set title(value) {
        return this._title = String(value);
    }
    get title() {
        return this._title;
    }

    // Create the cover
    createCover() {
        this.cover = new NotebookCover(this);
        this.pieces[this.cover.symbol] = this.cover;
        return this.cover;
    }

    // Create page
    createPage() {
        this.countPages++;
        const page = new NotebookPage("Untitled page", this);
        this.pieces[page.symbol] = page;
        return page;
    }

    // Create section
    createSection() {
        this.countSections++;
        const section = new NotebookSection("Untitled section", this);
        this.pieces[section.symbol] = section;
        return section;
    }

    // Delete page
    deletePage(symbol) {
        delete this.pieces[symbol];
    }

    // Delete section
    deleteSection(symbol) {
        delete this.pieces[symbol];
    }
}

// Notebook handler
class NotebookHandler {
    constructor() {
        // Contains all the notebooks
        this.notebooks = {};

        // Contains notebooks in the trash
        this.trash = {};

        // The current notebook opened
        this.active = null;

        // The editor object
        this.editor = null;
    }

    // Set the current editor
    setEditor(editor) {
        if (editor instanceof Editor) {
            this.editor = editor;
        }
    }

    // Adds a new notebook
    create(notebook) {
        if (notebook && !(notebook instanceof Notebook)) {
            throw new TypeError("'notebook' argument expected instance of Notebook");
        }

        // Uses notebook passed in or create new notebook
        return this.notebooks[notebook.symbol] = notebook || new Notebook();
    }

    // Remove a notebook
    delete(notebookSymbol) {
        if (notebookSymbol in this.notebooks) {
            this.notebooks[notebookSymbol] = undefined;
        } else if (notebookSymbol in this.trash) {
            this.trash[notebookSymbol] = undefined;
        }
    }

    // Moves a notebook to trash
    trash(notebookSymbol) {
        if (notebookSymbol in this.notebooks) {
            const notebook = this.notebooks[notebookSymbol];
            this.trash[notebookSymbol] = notebook;
            notebook.isTrash = true;
            this.notebooks[notebookSymbol] = undefined;
        }
    }

    // Restore a notebook from trash
    restore(notebookSymbol) {
        if (notebookSymbol in this.trash) {
            const notebook = this.trash[notebookSymbol];
            this.notebooks[notebookSymbol] = notebook;
            notebook.isTrash = false;
            this.trash[notebookSymbol] = undefined;
        }
    }

    // Open the notebook
    // Opened noteboks will be displayed in the editor
    open(notebookSymbol) {
        // Check if there is an active editor first
        if (this.exists(notebookSymbol)) {
            this.active = this.notebooks[notebookSymbol];
            this.notebooks[notebookSymbol].isOpen = true;
        }
    }

    // Close the currently opened notebook
    close() {
        this.active = null;
        this.notebooks[notebookSymbol].isOpen = false;
    }

    // Display the open notebook contents to the active editor
    display() {
        if (!(this.editor instanceof Editor) || !(this.active instanceof Notebook)) {
            return;
        }
        const notebook = this.active;
        this.editor.topBar.textFieldTitle.value = notebook.title;
        this.displayPieces();
    }

    // Display the open notebook's pieces
    displayPieces() {
        if (!(this.editor instanceof Editor) || !(this.active instanceof Notebook)) {
            return;
        }

        const sideBar = this.editor.sideBar;
        
        // Clear contents
        sideBar.main.text = "";

        // Add the cover navigation
        const coverButton = new NavigatorButton(null, "cover");
        const coverView = new View("cover");
        this.editor.sideBar.addNavigatorPage(this.active.cover, coverButton, coverView);

        const notebook = this.active;
        for (const i in notebook.pieces) {
            const piece = notebook.pieces[i];
        }
    }

    // Checks if a notebook exists
    exists(notebookSymbol) {
        return notebookSymbol in this.notebooks || notebookSymbol in this.trash;
    }

    // Iterate through each notebook
    *[Symbol.iterator]() {
        for (const notebook in this.notebooks) {
            yield notebook;
        }
    }
}

export { NotebookHandler, Notebook, NotebookPiece, NotebookPage, NotebookCover, NotebookSection }


