import { useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Carro = {
  modelo: string;
  placa: string;
  cor: string; // novo campo
};

type FormState = {
  nome: string;
  dt_nascimento: string; // yyyy-mm-dd
  carros: Carro[];
};

export default function CadastroCliente() {
  const [form, setForm] = useState<FormState>({
    nome: "",
    dt_nascimento: "",
    carros: [{ modelo: "", placa: "", cor: "" }],
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (
      name.startsWith("modelo") ||
      name.startsWith("placa") ||
      name.startsWith("cor")
    ) {
      if (index === undefined) return;
      const updatedCarros = [...form.carros];
      updatedCarros[index] = {
        ...updatedCarros[index],
        [name.split("_")[0]]: value,
      };
      setForm({ ...form, carros: updatedCarros });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addCarro = () => {
    setForm({
      ...form,
      carros: [...form.carros, { modelo: "", placa: "", cor: "" }],
    });
  };

  const removeCarro = (index: number) => {
    const updatedCarros = form.carros.filter((_, i) => i !== index);
    setForm({ ...form, carros: updatedCarros });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1️⃣ Criar o cliente primeiro
      const resCliente = await fetch(`${API_URL}/cliente/cad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: form.nome,
          dt_nascimento: form.dt_nascimento,
        }),
      });

      if (!resCliente.ok) throw new Error("Erro ao cadastrar cliente");

      const clienteCriado = await resCliente.json();

      const id_cliente = clienteCriado.data.id_cliente; // pegar o id retornado

      // 2️⃣ Criar os carros vinculados ao cliente
      for (const carro of form.carros) {
        const resCarro = await fetch(`${API_URL}/carro/cad`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            modelo: carro.modelo,
            placa: carro.placa,
            cor: carro.cor,
            id_cliente, // vincula o carro ao cliente
          }),
        });

        if (!resCarro.ok)
          throw new Error(`Erro ao cadastrar o carro ${carro.modelo}`);
      }

      toast.success("Cliente e carros cadastrados com sucesso!");
      navigate("/app/clientes");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cadastrar cliente e/ou carros.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={8} lg={6}>
        <Card>
          <Card.Body>
            <h3 className="mb-3">Cadastrar Cliente</h3>

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

              <Form.Group className="mb-3" controlId="dt_nascimento">
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
                <div key={index} className="mb-2 d-flex gap-2">
                  <Form.Control
                    type="text"
                    name={`modelo_${index}`}
                    placeholder="Modelo"
                    value={carro.modelo}
                    onChange={(e) => handleChange(e, index)}
                    disabled={submitting}
                  />
                  <Form.Control
                    type="text"
                    name={`placa_${index}`}
                    placeholder="Placa"
                    value={carro.placa}
                    onChange={(e) => handleChange(e, index)}
                    disabled={submitting}
                  />
                  <Form.Control
                    type="text"
                    name={`cor_${index}`}
                    placeholder="Cor"
                    value={carro.cor}
                    onChange={(e) => handleChange(e, index)}
                    disabled={submitting}
                  />
                  <Button
                    variant="danger"
                    onClick={() => removeCarro(index)}
                    disabled={submitting}
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={addCarro}
                disabled={submitting}
              >
                Adicionar Carro
              </Button>

              <div className="d-flex gap-2 mt-3">
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
