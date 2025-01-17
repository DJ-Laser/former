export interface NumberByOptions {
  start: number;
  step: number;
  postfix: string;
  check: boolean;
  spacing: boolean | "true" | "false" | "zero";
}

export class Selector<Item> {
  private _items: () => readonly Item[];
  private _check: (input: string) => number | null;

  public get items(): readonly Item[] {
    return this._items();
  }

  constructor(items?: Item[]) {
    this._items = () => items ?? [];
    this._check = () => null;
  }

  public clone(): Selector<Item> {
    const newSelector = new Selector<Item>();
    newSelector._items = this._items;
    newSelector._check = this._check;

    return newSelector;
  }

  public check(input: string): number | null {
    return this._check(input);
  }

  public mapItems<NewItem>(
    fn: (item: Item, index: number, items: readonly Item[]) => NewItem
  ): Selector<NewItem> {
    const newSelector = new Selector<NewItem>();
    newSelector._items = () => this.items.map(fn);
    return newSelector;
  }

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

  public prefixWith(
    this: Item extends string ? Selector<Item> : never,
    prefix: string
  ): Selector<string> {
    return this.mapItems((item) => prefix + item);
  }

  public number(
    this: Item extends string ? Selector<Item> : never,
    {
      start = 1,
      step = 1,
      postfix = ". ",
      check = true,
      spacing = true,
    }: Partial<NumberByOptions> = {}
  ): Selector<string> {
    const max_number_length = (this.items.length * step + start).toString()
      .length;

    let newSelector = this.mapItems((item, index) => {
      const item_number = index * step + start;
      const spacing_num = max_number_length - item_number.toString().length;
      let spacing_char;

      switch (spacing) {
        case true:
        case "true":
          spacing_char = " ";
          break;

        case false:
        case "false":
          spacing_char = "";
          break;

        case "zero":
          spacing_char = "0";
          break;
      }

      return (
        spacing_char.repeat(spacing_num) +
        item_number.toString() +
        postfix +
        item
      );
    });

    if (check) {
      newSelector = newSelector.checkWith((input, _item, index) => {
        const item_number = index * step + start;
        const input_number = parseInt(input);

        return input_number == item_number;
      });
    }

    return newSelector;
  }
}

export function promptSelector<T extends string>(
  selector: Selector<T>,
  prompt_str: string = "> "
): number | null {
  for (const item of selector.items) {
    console.log(item);
  }

  return selector.check(prompt(prompt_str) ?? "");
}
