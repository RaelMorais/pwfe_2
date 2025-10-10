import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

// Função para capitalizar corretamente nomes e classes
function capitalizeString(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split("-")
        .map((sub) => sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase())
        .join("-")
    )
    .join(" ");
}

// Lógica de validação com Zod
const schemaTask = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(255, "Máximo 255 caracteres")
    // remove espaços extras
    .transform((val) => val.trim().replace(/\s{2,}/g, " ")),

  name_class: z
    .string()
    .trim()
    .min(1, "Nome da classe é obrigatório")
    .max(15, "Máximo 15 caracteres")
    // aplica capitalização correta
    .transform((val) => capitalizeString(val)),

  // só permite três opções de prioridade
  priority: z.enum(["low", "mid", "high"], {
    errorMap: () => ({ message: "Prioridade inválida" }),
  }),

  // só permite três opções de status
  status: z.enum(["todo", "in_progress", "done"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),

  // user precisa ser número inteiro positivo
  user: z.number({ required_error: "Selecione um usuário" })
         .int()
         .positive(),
});

export function CadTarefa() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schemaTask),
    mode: "onChange",
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const resp = await axios.get("http://127.0.0.1:8000/api/v1/user/");
        setUsers(resp.data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        register_date: new Date().toISOString().split("T")[0],
      };

      const resp = await axios.post("http://127.0.0.1:8000/api/v1/task/", payload);

      alert("Task cadastrada com sucesso!");
      console.log("Resposta da API:", resp.data);
      reset();
      navigate("/inicial");
    } catch (error) {
      console.error("Erro ao cadastrar task:", error);
      if (error.response) {
        alert(`Erro: ${error.response.data.detail || "Verifique os dados"}`);
      } else {
        alert("Erro de conexão com o servidor.");
      }
    }
  };

  return (
  <form class="form-container" onSubmit={handleSubmit(onSubmit)} noValidate>
 <div className="form-group">
  <label htmlFor="name_class">Nome do Setor:</label>
  <input
    id="name_class"
    className="form-control"
    {...register("name_class")}
    placeholder="Nome do Setor"
  />
  {errors.name_class && <p className="error-message">{errors.name_class.message}</p>}
</div>

<div className="form-group">
  <label htmlFor="priority">Prioridade:</label>
  <select
    id="priority"
    className="form-control"
    {...register("priority")}
  >
    <option value="">Selecione</option>
    <option value="low">Low</option>
    <option value="mid">Mid</option>
    <option value="high">High</option>
  </select>
  {errors.priority && <p className="error-message">{errors.priority.message}</p>}
</div>

<div className="form-group">
  <label htmlFor="status">Status:</label>
  <select
    id="status"
    className="form-control"
    {...register("status")}
  >
    <option value="">Selecione</option>
    <option value="todo">Todo</option>
    <option value="in_progress">In Progress</option>
    <option value="done">Done</option>
  </select>
  {errors.status && <p className="error-message">{errors.status.message}</p>}
</div>

<div className="form-group">
  <label htmlFor="user">Usuário:</label>
  <select
    id="user"
    className="form-control"
    {...register("user", { valueAsNumber: true })}
  >
    <option value="">Selecione um usuário</option>
    {users.map(u => (
      <option key={u.id} value={u.id}>{u.name}</option>
    ))}
  </select>
  {errors.user && <p className="error-message">{errors.user.message}</p>}
</div>

<div className="form-group">
  <label htmlFor="description">Descrição:</label>
  <textarea
    id="description"
    className="form-control"
    {...register("description")}
    placeholder="Descrição da task"
    rows={5}
    cols={42}
  />
  {errors.description && <p className="error-message">{errors.description.message}</p>}
</div>

  <button type="submit" class="submit-button" disabled={isSubmitting}>
    {isSubmitting ? "Enviando..." : "Cadastrar Task"}
  </button>
</form>
  );
}
