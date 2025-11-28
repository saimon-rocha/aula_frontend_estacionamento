import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Logoff
        </Link>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/app/clientes">
              Clientes
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app/Operador">
              Operador
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app/Patio">
              Patio
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
