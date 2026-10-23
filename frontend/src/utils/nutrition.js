export function weightOf(item) {
  return item.weightG ?? 100;
}

export function kcal(item) {
  return Math.round((item.caloriesPer100g * weightOf(item)) / 100);
}
