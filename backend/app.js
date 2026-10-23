const express = require("express");
const app = express();

// Request logger: [METHOD] [PATH] [TIMESTAMP] (first, so every request is logged)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} [${new Date().toISOString()}]`);
  next();
});

// Parse JSON bodies BEFORE any route that reads req.body
app.use(express.json());

// Energy content (kcal per 100 g) of every item the canteen serves
const MENU = { "Samosa": 260, "Masala Chai": 50, "Veg Thali": 150, "Cold Coffee": 70 };

let orders = [
  { id: 1, itemName: "Samosa", qty: 2, weightG: 60, kcal: 312 },
  { id: 2, itemName: "Masala Chai", qty: 1, weightG: 150, kcal: 75 },
];
let nextId = 3;

app.get("/api/v1/orders", (req, res) => {
  res.status(200).json(orders);
});

app.get("/api/v1/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.status(200).json(order);
});

app.post("/api/v1/orders", (req, res) => {
  const body = req.body || {};
  const { itemName } = body;
  const qty = body.qty === undefined || body.qty === null ? 1 : body.qty;
  const weightG = body.weightG === undefined || body.weightG === null ? 100 : body.weightG;

  if (typeof itemName !== "string" || !Object.hasOwn(MENU, itemName)) {
    return res.status(400).json({ error: "itemName must be a menu item" });
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return res.status(400).json({ error: "qty must be a whole number from 1 to 10" });
  }
  if (typeof weightG !== "number" || !Number.isFinite(weightG) || weightG <= 0) {
    return res.status(400).json({ error: "weightG must be a number above 0" });
  }

  const kcal = Math.round(((MENU[itemName] * weightG) / 100) * qty);
  const order = { id: nextId++, itemName, qty, weightG, kcal };
  orders.push(order);
  res.status(201).json(order);
});

app.delete("/api/v1/orders/:id", (req, res) => {
  const index = orders.findIndex((o) => o.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Order not found" });
  const [removed] = orders.splice(index, 1);
  res.status(200).json(removed);
});

// Diagnostic route used to test the error handler. Leave it in place.
app.get("/api/v1/boom", () => {
  throw new Error("Kitchen is on fire");
});

// Global error handler: must have 4 parameters for Express to treat it as one
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack); // full detail stays in the server log only
  if (res.headersSent) return next(err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;