/** Options for numbering form elements */
export interface NumberByOptions {
  /**  The starting number, asigned to the first numbered element. */
  start: number;
  /** How much the number should increase (or decrease) per element. */
  step: number;
  /** What to put after the number. Eg, `". "` */
  postfix: string;
  /** Whether to use these numbers for input checking */
  check: boolean;
  /** Whether to use these numbers in the element's text */
  display: boolean;
  /** Whether to pad the number so that they all line up. Can be with spaces, zeros, or disabled. */
  spacing: boolean | "true" | "false" | "zero";
}

export class Selector<Item> {
  private _items: () => readonly Item[];
  private _check: (input: string) => number | null;

  /** The options registered in this selector */
  public get items(): readonly Item[] {
    return this._items();
  }

  /** Create a new `Selector` from a list of options */
  constructor(items?: Item[]) {
    this._items = () => items ?? [];
    this._check = () => null;
  }

  /** Make a copy of this selector referencing the values of this one */
  private clone(): Selector<Item>;
  private clone<NewItem>(fn: () => NewItem[]): Selector<NewItem>;
  private clone<NewItem>(
    fn?: () => NewItem[]
  ): Selector<Item> | Selector<NewItem> {
    let newSelector;

    if (fn) {
      newSelector = new Selector<NewItem>();
      newSelector._items = fn;
    } else {
      newSelector = new Selector<Item>();
      newSelector._items = this._items;
    }

    newSelector._check = this._check;
    return newSelector;
  }

  /**
   * Check a user input against this selector, returning the first index it matched
   * @param input The string input the user chose.
   * @returns the index of the chosen item or null
   */
  public check(input: string): number | null {
    return this._check(input);
  }

  /**
   * Apply a transformation to the selector's items.
   * This can be used to change complex form data into human readable output
   * @param fn The mapping function - Returns the new item
   * @returns A modified copy of the current selector
   */
  public mapItems<NewItem>(
    fn: (item: Item, index: number, items: readonly Item[]) => NewItem
  ): Selector<NewItem> {
    return this.clone(() => this.items.map(fn));
  }

  /**
   * Adds a custom function used to match user input to a form option
   * @param predicate A function that takes in an input and an item, and returns if they match
   * @returns A modified copy of the current selector
   */
  public checkWith(
    predicate: (input: string, item: Item, index: number) => boolean
  ): Selector<Item> {
    const newSelector = this.clone();
    newSelector._check = (input) => {
      for (const [idx, item] of newSelector.items.entries()) {
        if (predicate(input, item, idx)) {
          return idx;
        }
      }

      return null;
    };

    return newSelector;
  }

  /**
   * Prefix the string items with a specified string
   * @param this The `Selector<Item extends string>`
   * @param prefix The string to prepend to the items
   * @returns A modified copy of the current selector
   */
  public prefixWith(
    this: Item extends string ? Selector<Item> : never,
    prefix: string
  ): Selector<string> {
    return this.mapItems((item) => prefix + item);
  }

  /**
   * Apply numbers to this `Selector`
   * Will prefix the numbers if `options.display = true` (only works on string items)
   * Will apply a check function based on the numbers if `options.check = true`
   *
   * @param this The `Selector` if `options.display = true` then Selector<Item> must extend Selector<string>
   * @param options An optional `NumberByOptions` to configure the numbering scheme
   * @returns A modified copy of the current selector
   */
  public number<O extends Partial<NumberByOptions>>(
    this: O["display"] extends false
      ? Selector<Item>
      : Item extends string
      ? Selector<Item>
      : never,
    {
      start = 1,
      step = 1,
      postfix = ". ",
      display = true,
      check = true,
      spacing = true,
    }: O = {} as O
  ): O["display"] extends true ? Selector<string> : Selector<Item> {
    const max_number_length = (this.items.length * step + start).toString()
      .length;

    let newSelector;

    if (check) {
      newSelector = this.checkWith((input, _item, index) => {
        const item_number = index * step + start;
        const input_number = parseInt(input);

        return input_number == item_number;
      });
    } else {
      newSelector = this.clone();
    }

    if (display) {
      return newSelector.mapItems((item, index) => {
        const item_number = index * step + start;
        const spacing_num = max_number_length - item_number.toString().length;
        let spacing_char;

        switch (spacing) {
          case true:
          case "true":
            spacing_char = " ";
            break;

          case "zero":
            spacing_char = "0";
            break;

          case false:
          case "false":
          default:
            spacing_char = "";
            break;
        }

        return (
          spacing_char.repeat(spacing_num) +
          item_number.toString() +
          postfix +
          item
        );
      }) as O["display"] extends true ? Selector<string> : Selector<Item>;
    } else {
      return newSelector as O["display"] extends true
        ? Selector<string>
        : Selector<Item>;
    }
  }
}

/**
 * Display the selector using the deno prompt() function
 * @param selector The selector options to display
 * @param promptString The string to display in the prompt
 * @returns The selected item index or null if none was selected
 */
export function promptSelector<T extends string>(
  selector: Selector<T>,
  promptString: string = "> "
): number | null {
  for (const item of selector.items) {
    console.log(item);
  }

  return selector.check(prompt(promptString) ?? "");
}
