import { kcal, weightOf } from "../utils/nutrition";

export default function MenuCard({ name, price, category, available, caloriesPer100g, weightG }) {
  const item = { caloriesPer100g, weightG };
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{category}</p>
      <span className="price">₹{Number(price).toFixed(2)}</span>
      <p>Weight: {weightOf(item)} g</p>
      <p>Energy: {kcal(item)} kcal</p>
      <p className="badge">{available ? "Available" : "Not Available"}</p>
    </div>
  );
}
