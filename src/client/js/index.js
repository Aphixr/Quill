/**
 * js/index.js
 * 
 * The main script. Puts everything together. Things
 * will be displayed to the user.
 */


"use strict";

import quill from "./quill.js"
import { Editor } from "./components.js"


Editor.init();

quill.milestoneTrack.done("loading");


Editor.render();

quill.milestoneTrack.done("display");


