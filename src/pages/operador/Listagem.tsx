import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Define o tipo de Operador
type Operador = {
  id_operador: number;
  nome: string;
  email: string;
  admin: boolean;
};

export default function ListaOperador() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [operadorToDelete, setOperadorToDelete] = useState<Operador | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token") ?? "";
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin") ?? "false");
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") ?? "null");

  const navigate = useNavigate();

  const fetchOperadores = async () => {
    try {
      const res = await fetch(`${API_URL}/operador/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar operadores");

      const json: { data?: { operador?: Operador[] } } = await res.json();
      let lista: Operador[] = json.data?.operador || [];

      if (!isAdmin && usuarioLogado) {
        lista = lista.filter(
          (op) => Number(op.id_operador) === Number(usuarioLogado.id_operador)
        );
      }

      setOperadores(lista);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar operadores.");
    }
  };

  useEffect(() => {
    fetchOperadores();
  }, []);

  const handleCadastrar = () => {
    navigate("/app/cadastrarOperador");
  };

  const handleDeleteClick = (operador: Operador) => {
    setOperadorToDelete(operador);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!operadorToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/operador/delete/${operadorToDelete.id_operador}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir operador");

      setOperadores((prev) =>
        prev.filter((op) => op.id_operador !== operadorToDelete.id_operador)
      );

      toast.success(`Operador "${operadorToDelete.nome}" excluído com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir operador.");
    } finally {
      setShowConfirm(false);
      setOperadorToDelete(null);
    }
  };

  return (
    <div className="container-arquivos safeArea">
      <h2 style={{ textAlign: "center" }}>Operadores</h2>

      {operadores.length === 0 ? (
        <p>Nenhum operador cadastrado.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Admin</th>
              {isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {operadores.map((op) => (
              <tr key={op.id_operador}>
                <td>{op.id_operador}</td>
                <td>{op.nome}</td>
                <td>{op.email}</td>
                <td>{op.admin ? "Sim" : "Não"}</td>
                {isAdmin && (
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDeleteClick(op)}
                    >
                      Excluir
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        navigate(`/app/operador/editar/${op.id_operador}`)
                      }
                    >
                      Editar
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Button className="btn btn-primary" onClick={handleCadastrar}>
        Cadastrar
      </Button>

      {/* Modal de confirmação */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deseja realmente excluir o operador "{operadorToDelete?.nome}"?
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
