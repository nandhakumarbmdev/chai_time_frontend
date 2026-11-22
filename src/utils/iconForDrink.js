import { Bean, Coffee, Leaf, Milk, Nut } from 'lucide-react';

// Ordered: first matching keyword wins, so "Black Coffee" / "Badam Milk" resolve before generic ones.
const RULES = [
  [/black/, Bean],
  [/badam|almond/, Nut],
  [/milk/, Milk],
  [/tea|chai/, Leaf],
  [/coffee|espresso|latte/, Coffee],
];

export function iconForDrink(name = '') {
  const n = name.toLowerCase();
  return RULES.find(([re]) => re.test(n))?.[1] ?? Coffee;
}
