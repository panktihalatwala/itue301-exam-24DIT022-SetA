const mongoose = require("mongoose");
const connect = require("./db");
const MenuItem = require("./models/MenuItem");
const { formatValidationError } = require("./utils/formatError");

(async () => {
  try {
    await connect();

    // Re-running the seed must not pile up duplicates
    await MenuItem.deleteMany({ name: "Veg Thali" });

    // 1) One VALID item: gets saved
    const saved = await MenuItem.create({
      name: "Veg Thali",
      price: 80,
      category: "meal",
      available: true,
      caloriesPer100g: 150,
      weightG: 400,
    });
    console.log("Saved document:");
    console.log(saved.toObject());

    // 2) One INVALID item: rejected, error printed in the clean format
    try {
      await MenuItem.create({
        name: "Mega Shake",
        price: -5,
        category: "drink",
        caloriesPer100g: 1200,
        weightG: 600,
      });
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        console.log("Invalid item rejected:");
        console.log(JSON.stringify(formatValidationError(err), null, 2));
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
