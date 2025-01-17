import { Selector, promptSelector } from "../src/mod.ts";

const selector = new Selector(["a", "b", "c"]);

promptSelector(selector.checkCaseInsensitive());
