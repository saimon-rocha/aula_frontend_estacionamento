import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Clientes from "./pages/cliente/Listagem";
import CadastrarCliente from "./pages/cliente/Cadastro";
import EditarCliente from "./pages/cliente/Editar";

import Patio from "./pages/carros/Listagem";

import Operador from "./pages/operador/Listagem";
import OperadorCadastro from "./pages/operador/Cadastro";
import OperadorEditar from "./pages/operador/Editar";
import PrivateLayout from "./pages/PrivateLayout";

// Função que exige autenticação
function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Sessão expirada. Faça login novamente.");
    return redirect("/login");
  }
  return null;
}

function App() {
  const router = createBrowserRouter([
    // Rota pública de login
    {
      path: "/login",
      element: <Login />,
    },
    // Rotas privadas
    {
      path: "/app",
      element: <PrivateLayout />,
      loader: requireAuth, // garante login antes de renderizar qualquer rota filha
      children: [
        { index: true, loader: () => redirect("/app/clientes") }, // rota padrão
        { path: "clientes", element: <Clientes /> },
        { path: "cadastrarCliente", element: <CadastrarCliente /> },
        { path: "cliente/editar/:id_cliente", element: <EditarCliente /> },
        { path: "patio", element: <Patio /> },
        { path: "operador", element: <Operador /> },
        { path: "cadastrarOperador", element: <OperadorCadastro /> },
        { path: "operador/editar/:id_operador", element: <OperadorEditar /> },
      ],
    },
    // Qualquer rota desconhecida
    { path: "*", loader: () => redirect("/login") },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
