import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav>
      <Link to="/">Menu</Link>
      <Link to="/order">Order</Link>
      <Link to="/specials">Specials</Link>
    </nav>
  );
}
