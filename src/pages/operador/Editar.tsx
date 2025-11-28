import { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

type FormState = {
  nome: string;
  email: string;
  senha?: string; // <-- opcional agora
  admin: boolean;
};

export default function OperadorEditar() {
  const { id_operador } = useParams<{ id_operador: string }>();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    senha: "",
    admin: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // Carrega dados do operador
  // -----------------------------
  useEffect(() => {
    if (!id_operador || !token) {
      toast.error("ID do operador ou token não fornecido.");
      navigate("/operador");
      return;
    }

    const fetchOperador = async () => {
      try {
        const res = await fetch(`${API_URL}/operador/pesquisa/${id_operador}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Operador não encontrado");

        const data = await res.json();
        const operador = data.data;

        setForm({
          nome: operador.nome || "",
          email: operador.email || "",
          senha: "",
          admin: operador.admin || false,
        });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar operador");
        navigate("/app/operador");
      } finally {
        setLoading(false);
      }
    };

    fetchOperador();
  }, [id_operador, token, API_URL, navigate]);

  // -----------------------------
  // Manipulação do form
  // -----------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -----------------------------
  // Submissão
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id_operador || !token) return;
    setSubmitting(true);

    try {
      // Remove a senha se estiver vazia
      const payload = { ...form };
      if (payload.senha?.trim() === "") delete payload.senha;
      
      const res = await fetch(`${API_URL}/operador/edit/${id_operador}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar operador");

      toast.success("Operador atualizado com sucesso!");
      navigate("/app/operador");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar operador");
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------
  // Renderização
  // -----------------------------
  if (loading) {
    return (
      <Row className="justify-content-center mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Carregando dados do operador...</p>
      </Row>
    );
  }

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={8} lg={6}>
        <Card>
          <Card.Body>
            <h3 className="mb-3">
              Editar Operador {id_operador ? `(ID: ${id_operador})` : ""}
            </h3>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="nome">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="senha">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="Deixe vazio se não quiser alterar"
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="admin">
                <Form.Check
                  type="checkbox"
                  label="Administrador"
                  name="admin"
                  checked={form.admin}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Form.Group>

              <div className="d-flex gap-2 mt-3">
                <Button variant="success" type="submit" disabled={submitting}>
                  {submitting ? "Atualizando..." : "Atualizar"}
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
