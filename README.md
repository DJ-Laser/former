# Former - A silly system for js forms

Former is a system for creating forms in javascript. The idea is that all form
classes are generic, taking in any kind of data. The data can then be
transformed to be displayed as a string, or it can be displayed using a custom
display function!

## Install

The cli prompt uses deno functions, but you can use node if you are ok with
making your own instead.

- Deno: `deno add jsr:@djlaser/former`
- Node: `npx jsr add @djlaser/former`
- Bun or some other thing: use the instructions on
  https://jsr.io/@djlaser/former

## Inputs

User input is passed as a string, and the corresponding form item can be gotten
with a custom method that checks if the input matches the data. This function is
applied to each item, and the first match is returned. Former provides tow check
functions by default: `checkCaseInsensitive` and `number` which optionally also
adds number prefixes to string inputs.

When you wnat the user to chose an option, you need a prompt function! This
takes a form component with the specified data and prompts the user for a
choice. Former provides the `promptSelector` function for cli use, but you can
easily make your own for web or cli. All a prompt function needs to do is list
the options and accepr user input, calling the `check` function on it.

## Composing

Former elements are `composable`, which means that when you apply a form
function, a new form instance is created, inhetiting it's values from the
previous one. Crucially, **the number of options never changes** so you can
create a form of complex objects, map them to strings using `mapItems`, provide
a custom check function using `checkWith`, get the selected index
`promptSelector` and access the item from the first form, as in
`complexObjectSelector.items[mappedSelectorIndex]`, as through all the steps the
data layout remains constant.

## Examples

A basic form, checking based on the case insensitive value shown

```typescript
const selector = new Selector(["a", "b", "c"]);

promptSelector(selector.checkCaseInsensitive());
```

A more advanced form. The user must select an option by it's displayed number.
The returned index is used in the first form, not the numbered one, so the
console will read: `The option chosen was: a` instead of
`The option chosen was: 1. a`

```typescript
const firstSelector = new Selector(["a", "b", "c"]);
const numberedSelector = firstSelector.number();

const index = promptSelector(numberedSelector);

// In real code, check for null and handle it accordingly
console.log("The option chosen was: " + firstSelector.items[index!]);
```
