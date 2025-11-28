import { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

type Carro = {
  id_carro?: number;
  modelo: string;
  placa: string;
  cor: string;
};

type FormState = {
  nome: string;
  dt_nascimento: string;
  carros: Carro[];
};

export default function EditarCliente() {
  const { id_cliente } = useParams<{ id_cliente: string }>();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<FormState>({
    nome: "",
    dt_nascimento: "",
    carros: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id_cliente || !token) {
      toast.error("ID do cliente ou token inválido.");
      navigate("/app/clientes");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/cliente/pesquisa/${id_cliente}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Cliente não encontrado");

        const data = await res.json();
        const c = data.data;

        const [dia, mes, ano] = c.dt_nascimento.split("/");
        const dt_formatada = `${ano}-${mes}-${dia}`;

        setForm({
          nome: c.nome,
          dt_nascimento: dt_formatada,
          carros:
            c.carros?.map((carro: any) => ({
              id_carro: carro.id_carro,
              modelo: carro.modelo,
              placa: carro.placa,
              cor: carro.cor || "",
            })) || [],
        });
      } catch (error) {
        toast.error("Erro ao carregar dados");
        navigate("/app/clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_cliente, token, API_URL, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const updatedCarros = [...form.carros];
      updatedCarros[index] = { ...updatedCarros[index], [name]: value };
      setForm({ ...form, carros: updatedCarros });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const addCarro = () => {
    setForm({
      ...form,
      carros: [...form.carros, { modelo: "", placa: "", cor: "" }],
    });
  };

  const removeCarro = async (index: number) => {
    const carro = form.carros[index];

    if (carro.id_carro) {
      await fetch(`${API_URL}/carro/delete/${carro.id_carro}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setForm({
      ...form,
      carros: form.carros.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Atualiza Cliente
      await fetch(`${API_URL}/cliente/edit/${id_cliente}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: form.nome,
          dt_nascimento: form.dt_nascimento,
        }),
      });

      // Atualiza carros
      for (const carro of form.carros) {
        if (!carro.modelo.trim() || !carro.placa.trim()) continue;

        const req = carro.id_carro
          ? {
              url: `${API_URL}/carro/edit/${carro.id_carro}`,
              method: "PUT",
            }
          : {
              url: `${API_URL}/carro/cad`,
              method: "POST",
            };

        await fetch(req.url, {
          method: req.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            modelo: carro.modelo,
            placa: carro.placa,
            cor: carro.cor,
            id_cliente: Number(id_cliente),
          }),
        });
      }

      toast.success("Cliente atualizado com sucesso!");
      navigate("/app/clientes");
    } catch (err) {
      toast.error("Erro ao salvar alterações");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={8} lg={6}>
        <Card>
          <Card.Body>
            <h3>Editar Cliente</h3>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Data de Nascimento</Form.Label>
                <Form.Control
                  type="date"
                  name="dt_nascimento"
                  value={form.dt_nascimento}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </Form.Group>

              <hr />
              <h5>Carros</h5>

              {form.carros.map((carro, index) => (
                <div key={index} className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    name="modelo"
                    value={carro.modelo}
                    placeholder="Modelo"
                    onChange={(e) => handleChange(e, index)}
                  />
                  <Form.Control
                    type="text"
                    name="placa"
                    value={carro.placa}
                    placeholder="Placa"
                    onChange={(e) => handleChange(e, index)}
                  />
                  <Form.Control
                    type="text"
                    name="cor"
                    value={carro.cor}
                    placeholder="Cor"
                    onChange={(e) => handleChange(e, index)}
                  />

                  <Button variant="danger" onClick={() => removeCarro(index)}>
                    X
                  </Button>
                </div>
              ))}

              <Button variant="secondary" onClick={addCarro}>
                Adicionar Carro
              </Button>

              <div className="mt-3 d-flex gap-2">
                <Button variant="success" type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>
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
