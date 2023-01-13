import { writable } from 'svelte/store';
import chroma from 'chroma-js';
const init = chroma('#fafafa');

export const pageBgColour = writable(init);
export const userAllTime = writable(init);
