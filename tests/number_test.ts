import { assertEquals } from "@std/assert";
import { Selector } from "../src/selector.ts";

Deno.test(function defaultTest() {
  const selector = new Selector(["a", "b", "c"]).number();
  assertEquals(selector.items, ["1. a", "2. b", "3. c"]);
});

Deno.test(function startingNumberTest() {
  const selector = new Selector(["a", "b", "c"]).number({ start: 5 });
  assertEquals(selector.items, ["5. a", "6. b", "7. c"]);
});

Deno.test(function positiveStepTest() {
  const selector = new Selector(["a", "b", "c"]).number({ step: 2 });
  assertEquals(selector.items, ["1. a", "3. b", "5. c"]);
});

Deno.test(function zeroStepTest() {
  const selector = new Selector(["a", "b", "c"]).number({ step: 0 });
  assertEquals(selector.items, ["1. a", "1. b", "1. c"]);
});

Deno.test(function negativeStepTest() {
  const selector = new Selector(["a", "b", "c"]).number({ step: -1 });
  assertEquals(selector.items, [" 1. a", " 0. b", "-1. c"]);
});

Deno.test(function zeroSpacingTest() {
  const selector = new Selector(["a", "b", "c"]).number({
    spacing: "zero",
    step: 50,
  });

  assertEquals(selector.items, ["001. a", "051. b", "101. c"]);
});

Deno.test(function numberCheckTest() {
  const selector = new Selector(["a", "b", "c"]).number();
  const index = selector.check("2");

  assertEquals(index, 1);
  assertEquals(selector.items[index!], "2. b");
});

Deno.test(function numberDisplayFalseTest() {
  const _selector = new Selector([{}, {}, {}]).number({
    display: false,
  });
});
