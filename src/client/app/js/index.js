/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be loaded and displayed to the user.
 */


"use strict";

import quill from "./quill.js"
import { Editor, Navigator, TextField } from "./components.js"


/* =================== */
/* Load                */
/* =================== */

const navigator = new Navigator();
const editor = new Editor();

// Attaches the navigator toggler to the menu bar
// Toggler is an image of logo
editor.getComponent("panel", "menu")
    .addComponent("navigatorToggler", navigator.toggler);

// Attach the input for changing the notebook title
editor.getComponent("panel", "menu")
    .addComponent("notebookTitleTextField", new TextField({
        id: "notebook-title",
        value: "Untitled notebook",
        placeholder: "Notebook title",
        title: "Notebook title"
    }));

quill.milestoneTrack.done("loading");


/* =================== */
/* Display             */
/* =================== */

editor.render(quill.app);

quill.milestoneTrack.done("display");


