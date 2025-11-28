import { useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type FormState = {
  nome: string;
  email: string;
  senha: string;
  admin: boolean;
};

export default function OperadorCadastro() {
  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    senha: "",
    admin: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    if (!form.nome.trim()) return "Nome é obrigatório.";
    if (!form.email.trim()) return "E-mail é obrigatório.";
    // simples regex para email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) return "E-mail inválido.";
    if (!form.senha || form.senha.length < 4)
      return "Senha deve ter pelo menos 4 caracteres.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.warn(err);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/operador/cad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          admin: form.admin,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.message || body?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      await res.json().catch(() => null);
      toast.success("Operador cadastrado com sucesso!");
      // se quiser navegar de volta pra listagem
      navigate("/operador");
    } catch (error: any) {
      console.error("Erro ao cadastrar operador:", error);
      toast.error(`Erro ao cadastrar operador: ${error?.message || error}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={8} lg={6}>
        <Card>
          <Card.Body>
            <h3 className="mb-3">Cadastrar Operador</h3>

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
                  placeholder="usuario@exemplo.com"
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
                  placeholder="Senha (mín. 4 caracteres)"
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

              <div className="d-flex gap-2">
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar"}
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
