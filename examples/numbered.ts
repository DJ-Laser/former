import { Selector, promptSelector } from "../src/mod.ts";

const firstSelector = new Selector(["a", "b", "c"]);
const numberedSelector = firstSelector.number();

const index = promptSelector(numberedSelector);

// In real code, check for null and handle it accordingly
console.log("The option chosen was: " + firstSelector.items[index!]);
