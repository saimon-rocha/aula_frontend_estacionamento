import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Cliente = {
  id_cliente: number;
  nome: string;
  carros: { modelo: string; placa: string }[];
};

export default function ListaCliente() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const isAdmin = JSON.parse(localStorage.getItem("isAdmin") ?? "false");

  const navigate = useNavigate();

  const handleTokenExpirado = () => {
    toast.error("Sessão expirada. Faça login novamente.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/cliente/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔧 401 → token expirado
      if (res.status === 401) {
        return handleTokenExpirado();
      }

      if (!res.ok) throw new Error("Erro ao buscar Clientes");

      const json = await res.json();
      const lista = json.data?.clientes || [];
      setClientes(lista);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar Clientes.");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Você precisa estar logado para acessar esta página.");
      navigate("/login");
      return;
    }

    fetchClientes();
  }, [token, navigate, API_URL]);

  const handleCadastrar = () => navigate("/app/cadastrarCliente");

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;

    if (!token) return handleTokenExpirado();

    try {
      const response = await fetch(
        `${API_URL}/cliente/delete/${clienteToDelete.id_cliente}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) return handleTokenExpirado();

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao excluir cliente");
      }

      setClientes((prev) =>
        prev.filter((c) => c.id_cliente !== clienteToDelete.id_cliente)
      );

      toast.success(`Cliente "${clienteToDelete.nome}" excluído com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir cliente.");
    } finally {
      setShowConfirm(false);
      setClienteToDelete(null);
    }
  };

  return (
    <div className="container-arquivos safeArea">
      <h2 style={{ textAlign: "center" }}>Clientes</h2>

      {clientes.length === 0 ? (
        <p>Nenhum cliente cadastrado.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Carro</th>
              <th>Placa</th>
              {isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {clientes.map((op) => (
              <tr key={op.id_cliente}>
                <td>{op.id_cliente}</td>
                <td>{op.nome}</td>
                <td>
                  {op.carros?.length > 0
                    ? op.carros.map((c) => c.modelo).join(", ")
                    : "Sem carro"}
                </td>
                <td>
                  {op.carros.length > 0
                    ? op.carros.map((c) => c.placa).join(", ")
                    : "Sem carro"}
                </td>
                <td>
                  {isAdmin && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(op)}
                    >
                      Excluir
                    </Button>
                  )}

                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() =>
                      navigate(`/app/cliente/editar/${op.id_cliente}`)
                    }
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <button className="btn btn-primary" onClick={handleCadastrar}>
        Cadastrar
      </button>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deseja realmente excluir o cliente "{clienteToDelete?.nome}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Não
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Sim
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
