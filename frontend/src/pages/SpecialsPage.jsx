import { useEffect, useState } from "react";

const SPECIALS_URL = "https://jsonplaceholder.typicode.com/todos?_limit=10";

export default function SpecialsPage() {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0); // Retry bumps this to re-run the effect

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(SPECIALS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const todos = await res.json();
        if (!Array.isArray(todos)) throw new Error("Unexpected response");
        if (!cancelled) setSpecials(todos);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attempt]); // runs on mount and on each Retry, not on every render

  if (loading) return <p>Loading specials...</p>;

  if (error) {
    return (
      <main>
        <p role="alert">Could not load specials</p>
        <button onClick={() => setAttempt((a) => a + 1)}>Retry</button>
      </main>
    );
  }

  // Available first, API order kept inside each group
  const sorted = [
    ...specials.filter((t) => !t.completed),
    ...specials.filter((t) => t.completed),
  ];
  const availableCount = specials.filter((t) => !t.completed).length;

  return (
    <main>
      <h2>Today's Specials</h2>
      <p>{availableCount} of {specials.length} available</p>
      <ul>
        {sorted.map((t) => (
          <li key={t.id}>
            <strong>{t.title}</strong> — {t.completed ? "Sold out" : "Available"}
          </li>
        ))}
      </ul>
    </main>
  );
}
