import { Buffer } from "buffer";

window.Buffer = Buffer;

// Minimal process polyfill
window.process = {
  env: {},
};
