import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// Capitalize first letters of name parts
function capitalizeName(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((parte) =>
      parte
        .split("-")
        .map(
          (subparte) =>
            subparte.charAt(0).toUpperCase() + subparte.slice(1).toLowerCase()
        )
        .join("-")
    )
    .join(" ");
}

// Schema for name, email, and phone validation
const schemaUsuario = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(30, "Máximo 30 caracteres")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
      "Digite nome completo (nome e sobrenome), sem números ou símbolos, sem espaços no início/fim"
    )
    .transform((val) => capitalizeName(val))
    .refine((val) => val.split(" ").length >= 2, {
      message: "Digite pelo menos nome e sobrenome",
    })
    .refine(
      (val) => val.split(" ").every((parte) => parte.length >= 2),
      { message: "Cada parte do nome deve ter pelo menos 2 letras" }
    ),

  email: z
    .string()
    .min(1, "Email é obrigatório")
    .max(50, "Máximo 50 caracteres")
    .email("Formato de email inválido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de email inválido")
    .transform((val) => val.trim().toLowerCase())
    .refine(
      (val) => !val.includes("tempmail") && !val.includes("mailinator"),
      { message: "Emails temporários não são permitidos" }
    )
    .refine(
      (val) =>
        val.endsWith("@gmail.com") ||
        val.endsWith("@hotmail.com") ||
        val.endsWith("@empresa.com.br"),
      { message: "Use apenas email válido (@gmail, @hotmail ou @empresa.com.br)" }
    ),

  phone: z
    .string()
    .min(14, "Telefone incompleto")
    .max(15, "Telefone inválido")
    .regex(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      "Telefone inválido, use o formato (xx) xxxxx-xxxx"
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

  // Handle name input
  const handleNomeChange = (e) => {
    let valor = e.target.value;
    valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, "");
    valor = valor.replace(/\s{2,}/g, " ");
    if (valor.length > 30) valor = valor.slice(0, 30);
    setValue("name", valor);
  };

  // Handle email input
  const handleEmailChange = (e) => {
    let valor = e.target.value.trim();
    if (valor.length > 50) valor = valor.slice(0, 50);
    setValue("email", valor);
  };

  // Handle phone input
  const handlePhoneChange = (e) => {
    let valor = e.target.value;
    // Remove non-digits
    valor = valor.replace(/\D/g, "");
    // Apply mask: (xx) xxxxx-xxxx or (xx) xxxx-xxxx
    if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
    } else if (valor.length > 0) {
      valor = `(${valor.slice(0, 2)}`;
    }
    // Limit to 15 characters (max for (xx) xxxxx-xxxx)
    if (valor.length > 15) valor = valor.slice(0, 15);
    setValue("phone", valor);
  };

  const onSubmit = async (data) => {
    try {
      const resp = await axios.post("http://127.0.0.1:8000/api/v1/user/", {
        name: data.name,
        email: data.email,
        phone: data.phone,
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
    <form className="form-container" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <label htmlFor="name">Nome Completo:</label>
        <input
          id="name"
          placeholder="Ex: Maria Silva"
          {...register("name")}
          onChange={handleNomeChange}
        />
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Telefone:</label>
        <input
          id="phone"
          placeholder="Ex: (11) 91234-5678"
          {...register("phone")}
          onChange={handlePhoneChange}
          maxLength={15}
        />
        {errors.phone && <p className="error-message">{errors.phone.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          placeholder="Ex: maria@email.com"
          {...register("email")}
          onChange={handleEmailChange}
        />
        {errors.email && <p className="error-message">{errors.email.message}</p>}
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Cadastrar Usuário"}
      </button>
    </form>
  );
}