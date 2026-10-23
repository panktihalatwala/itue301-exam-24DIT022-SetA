# FINDINGS

## T1 - The Menu

**What was wrong:**
- `MenuPage.jsx` passed the props `title` and `cost`, but `MenuCard.jsx` expects `name` and `price`.
- The list items in `MenuPage.jsx` had no `key`.
- `MenuCard.jsx` did not show the portion weight or the energy in kcal.
- `weightOf()` in `utils/nutrition.js` returned `item.weightG` with no default, so items without a weight (Cold Coffee) gave NaN.

**Why it mattered:** The cards showed an empty name and "₹NaN" for the price. React printed a "missing key" warning in the console. Weight and kcal were never displayed, and kcal would have been NaN for Cold Coffee.

**How I fixed it:** In `MenuPage.jsx` I passed the correct prop names (`name`, `price`) and added `key={item.id}`. In `MenuCard.jsx` I added the weight and kcal lines using the helper functions. In `nutrition.js` I changed `weightOf` to return `item.weightG ?? 100`, so a missing weight counts as 100 g.

## T2 - The Order

**What was wrong:**
- `NavBar.jsx` used plain `<a href>` tags, which reload the whole page.
- The name input had a `value` but no `onChange`, so it could not be typed into.
- `addItem` in `OrderPage.jsx` used `cart.push(item)` and then `setCart(cart)`, which mutates the same array.
- There was no remove button, no kcal on cart lines, no total price, no total kcal, and no calorie limit.

**Why it mattered:** Clicking a link reloaded the app and lost the cart. The name could not be entered. React did not re-render when items were added because the array reference did not change. Users could order more than 1000 kcal.

**How I fixed it:** In `NavBar.jsx` I replaced `<a>` with `Link` from react-router-dom. In `OrderPage.jsx` I added `onChange` to the input. I add items without mutating, using `setCart((prev) => [...prev, line])`, and each line gets a unique `lineId` that I use as the key. The item count, total price and total kcal are calculated from `cart` on every render instead of being stored in separate state, so they always match the cart. `addItem` checks whether `totalKcal + kcal(item) > 1000`, and if so shows "Calorie limit of 1000 kcal exceeded" and does not add the item. Remove filters the cart by `lineId`. Only available items have an Add button.

## T3 - The Specials Board

**What was wrong:**
- `useEffect` in `SpecialsPage.jsx` had no dependency array, so it ran after every render.
- The response status was never checked (`res.ok`), so HTTP errors were not treated as failures.
- `loading` was never set to false when the request failed, so "Could not load specials" could never appear.
- The loading text used "…" instead of "...".
- There was no Retry button, no sorting of available specials first, and no "n of total available" line.

**Why it mattered:** Every `setData` caused a re-render, which triggered another fetch, creating an endless loop of requests instead of one. A failed request left the page stuck on "Loading". Bad HTTP statuses were treated as success. Several required features were missing.

**How I fixed it:** I put the effect's dependency array as `[attempt]`, so the request runs once when the page opens and again only when Retry increases `attempt`. The fetch is inside `try/catch/finally`: it throws an error when `!res.ok`, sets the error state in `catch`, and always sets `loading` to false in `finally`. Specials are sorted by putting the not-completed ones first and keeping the API order inside each group. The page shows "n of total available" and uses `Sold out` or `Available` per item. The Retry button changes `attempt` to fetch again without reloading the page. A `cancelled` flag in the cleanup prevents state updates after the component unmounts.

## T4 - The Orders Service

**What was wrong:**
- The logger middleware in `app.js` never called `next()`, so requests hung.
- `express.json()` was registered after the routes, so `req.body` was undefined in POST.
- POST did no validation and ignored `weightG` and `kcal`.
- DELETE `/api/v1/orders/:id` did not exist.
- The error handler had only 3 parameters, so Express did not recognise it as an error handler, and it sent `err.message` and the stack trace to the client.

**Why it mattered:** The API never answered because of the missing `next()`. POST could not read the request body. Invalid orders were accepted. Orders could not be deleted. Internal error details were exposed to clients.

**How I fixed it:** In `app.js` I moved `app.use(express.json())` to the top and added `next()` in the logger. POST now validates that `itemName` is a menu item, `qty` is a whole number from 1 to 10 (default 1), and `weightG` is a number above 0 (default 100); otherwise it returns 400 with `{ error }`. On success it returns 201 with `{ id, itemName, qty, weightG, kcal }`, where `kcal = round(kcalPer100g × weightG ÷ 100 × qty)`. I added DELETE, which returns 200 for an existing order and 404 for an unknown id. The error handler now takes `(err, req, res, next)`, logs the stack on the server only, and returns status 500 with `{ error: "Something went wrong" }`.

## T5 - The Menu Data

**What was wrong:**
- In `models/MenuItem.js`, `price` used `max: 0` instead of `min: 0`.
- The category default was `"Snack"` with a capital S, which is not in the enum (`snack`, `meal`, `drink`).
- The drink weight validator checked `v >= 500`, which is the wrong way round.
- `formatValidationError` in `utils/formatError.js` just returned the raw Mongoose error.
- `seed.js` was empty.

**Why it mattered:** Any price above 0 failed validation. The default category would fail the enum check. Drinks over 500 g were accepted while light drinks were rejected. Clients would receive a raw Mongoose error object instead of a clean message. There was no seed script or evidence that saving and validation work.