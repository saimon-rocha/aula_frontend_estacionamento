import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario, senha }),
      });

      if (!res.ok) throw new Error("Usuário ou senha inválidos");

      const data = await res.json();

      const token = data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", JSON.stringify(data.admin));

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          id_operador: data.id_operador,
          nome: data.nome,
          email: data.email,
          admin: data.admin,
        })
      );

      toast.success("Login realizado com sucesso!");

      // Redireciona para rota privada correta
      navigate("/app/clientes", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Erro no login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 100 }}>
      <h2 className="mb-4 text-center">Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>Usuário</label>
          <input
            type="text"
            className="form-control"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Digite seu usuário"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group mb-3">
          <label>Senha</label>
          <input
            type="password"
            className="form-control"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
