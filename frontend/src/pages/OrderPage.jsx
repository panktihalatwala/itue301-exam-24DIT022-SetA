import { useRef, useState } from "react";
import { menu } from "../data/menu";
import { kcal } from "../utils/nutrition";

const KCAL_LIMIT = 1000;

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const nextLineId = useRef(1);

  // Derived values: always computed from the cart, never stored in state
  const itemCount = cart.length;
  const totalPrice = cart.reduce((sum, line) => sum + line.price, 0);
  const totalKcal = cart.reduce((sum, line) => sum + kcal(line), 0);

  const addItem = (item) => {
    if (!item.available) return;
    if (totalKcal + kcal(item) > KCAL_LIMIT) {
      setMessage("Calorie limit of 1000 kcal exceeded");
      return;
    }
    setMessage("");
    setCart((prev) => [...prev, { ...item, lineId: nextLineId.current++ }]);
  };

  const removeItem = (lineId) => {
    setMessage("");
    setCart((prev) => prev.filter((line) => line.lineId !== lineId));
  };

  return (
    <main>
      <h2>Place an Order</h2>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Order for: {name || "—"}</p>

      {menu.filter((i) => i.available).map((item) => (
        <button key={item.id} onClick={() => addItem(item)}>
          Add {item.name}
        </button>
      ))}

      {message && <p role="alert">{message}</p>}

      <p>Items in cart: {itemCount}</p>
      <p>Total price: ₹{totalPrice.toFixed(2)}</p>
      <p>Total energy: {totalKcal} kcal</p>

      <ul>
        {cart.map((line) => (
          <li key={line.lineId}>
            {line.name} - ₹{line.price.toFixed(2)} - {kcal(line)} kcal{" "}
            <button onClick={() => removeItem(line.lineId)}>Remove</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
