/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be loaded and displayed to the user.
 */


"use strict";

import quill from "./quill.js"
import { Editor } from "./components.js"


const editor = new Editor();

quill.milestoneTrack.done("loading");


editor.render(quill.app);

quill.milestoneTrack.done("display");


