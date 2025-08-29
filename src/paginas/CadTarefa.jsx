import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

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
    .max(200, "Máximo 200 caracteres")
    // impede números, aceita letras, acentos, espaços e hífen
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/, "Descrição não pode conter números")
    // remove espaços extras
    .transform((val) => val.trim().replace(/\s{2,}/g, " ")),

  name_class: z
    .string()
    .min(1, "Nome da classe é obrigatório")
    .max(50, "Máximo 50 caracteres")
    // impede números, aceita letras, acentos, espaços e hífen
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/, "Nome da classe não pode conter números")
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label>Descrição:</label>
        <input {...register("description")} placeholder="Descrição da task" />
        {errors.description && <p>{errors.description.message}</p>}
      </div>

      <div>
        <label>Nome da Classe:</label>
        <input {...register("name_class")} placeholder="Nome da classe" />
        {errors.name_class && <p>{errors.name_class.message}</p>}
      </div>

      <div>
        <label>Prioridade:</label>
        <select {...register("priority")}>
          <option value="">Selecione</option>
          <option value="low">Low</option>
          <option value="mid">Mid</option>
          <option value="high">High</option>
        </select>
        {errors.priority && <p>{errors.priority.message}</p>}
      </div>

      <div>
        <label>Status:</label>
        <select {...register("status")}>
          <option value="">Selecione</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {errors.status && <p>{errors.status.message}</p>}
      </div>

      <div>
        <label>Usuário:</label>
        <select {...register("user", { valueAsNumber: true })}>
          <option value="">Selecione um usuário</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        {errors.user && <p>{errors.user.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Cadastrar Task"}
      </button>
    </form>
  );
}
