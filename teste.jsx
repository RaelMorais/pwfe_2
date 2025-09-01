import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// Schema com validação apenas via Regex
const schemaUsuario = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(30, "Máximo 30 caracteres")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
      "Digite nome completo (nome e sobrenome), sem números ou símbolos, sem espaços no início/fim"
    ),

  email: z
    .string()
    .min(1, "Email é obrigatório")
    .max(50, "Máximo 50 caracteres")
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Formato de email inválido"
    ),
});

export function CadUsuario() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schemaUsuario),
    mode: "onChange",
  });

  // Tratamento para o campo nome (apenas para prevenir entrada inválida antes do submit)
  const handleNomeChange = (e) => {
    let valor = e.target.value;
    valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, ""); // só letras e espaço
    valor = valor.replace(/\s{2,}/g, " "); // evita espaços duplos
    if (valor.length > 30) valor = valor.slice(0, 30); // máximo 30 chars
    setValue("name", valor);
  };

  // Tratamento para o campo email
  const handleEmailChange = (e) => {
    let valor = e.target.value.trim();
    if (valor.length > 50) valor = valor.slice(0, 50); // máximo 50 chars
    setValue("email", valor);
  };

  // Submit
  const onSubmit = async (data) => {
    try {
      const resp = await axios.post("http://127.0.0.1:8000/api/v1/user/", {
        name: data.name,
        email: data.email,
      });
      alert("Usuário cadastrado com sucesso!");
      console.log("Resposta da API:", resp.data);
      reset();
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      if (error.response) {
        alert(`Erro: ${error.response.data.detail || "Verifique os dados"}`);
      } else {
        alert("Erro de conexão com o servidor.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Nome Completo:</label>
      <input
        id="name"
        placeholder="Ex: Maria Silva"
        {...register("name")}
        onChange={handleNomeChange}
      />
      {errors.name && <p>{errors.name.message}</p>}

      <label htmlFor="email">Email:</label>
      <input
        id="email"
        type="email"
        placeholder="Ex: maria@email.com"
        {...register("email")}
        onChange={handleEmailChange}
      />
      {errors.email && <p>{errors.email.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Cadastrar Usuário"}
      </button>
    </form>
  );
}
