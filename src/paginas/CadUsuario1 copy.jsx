import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema com validação para cada campo
const schemaUsuario = z.object({
  name: z
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
    .email("Formato de email inválido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de email inválido"),

  phone: z
    .string()
    .min(14, "Telefone incompleto") // formato (xx) xxxxx-xxxx tem 14 caracteres
    .max(15, "Telefone inválido")
    .regex(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      "Telefone inválido, use o formato (xx) xxxxx-xxxx"
    ),
});

export function CadUsuario1() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaUsuario),
    mode: "onChange",
  });

  // Tratamento para o campo nome
  const handleNomeChange = (e) => {
    let valor = e.target.value;

    // Só letras e espaços
    valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, "");

    // Remove múltiplos espaços
    valor = valor.replace(/\s{2,}/g, " ");

    // Limita 30 chars
    if (valor.length > 30) valor = valor.slice(0, 30);

    setValue("name", valor);
  };

  // Tratamento para o campo email
  const handleEmailChange = (e) => {
    let valor = e.target.value;

    // Remove espaços extras (não remove espaços internos válidos em e-mail, mas eles normalmente não existem)
    valor = valor.trim();

    // Limita 50 chars
    if (valor.length > 50) valor = valor.slice(0, 50);

    setValue("email", valor);
  };

  // Máscara e tratamento para telefone no formato (xx) xxxxx-xxxx
  const handlePhoneChange = (e) => {
    let valor = e.target.value;

    // Remove tudo que não é número
    valor = valor.replace(/\D/g, "");

    // Limita máximo 11 dígitos (DDD + telefone)
    if (valor.length > 11) valor = valor.slice(0, 11);

    // Aplica máscara
    if (valor.length > 10) {
      // (xx) xxxxx-xxxx
      valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (valor.length > 5) {
      // (xx) xxxx-xxxx
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (valor.length > 0) {
      valor = valor.replace(/^(\d{0,2})/, "($1");
    }

    setValue("phone", valor);
  };

  const onSubmit = (data) => {
    alert(`Dados válidos enviados:\nNome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone}`);
    // Aqui você pode enviar via axios para API
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 20 }}>
          <label>
            Nome Completo:
            <input
              {...register("name")}
              onChange={handleNomeChange}
              placeholder="Ex: Maria Silva"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>
            Email:
            <input
              {...register("email")}
              type="email"
              onChange={handleEmailChange}
              placeholder="Ex: maria@email.com"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>
            Telefone:
            <input
              {...register("phone")}
              onChange={handlePhoneChange}
              placeholder="Ex: (11) 91234-5678"
              maxLength={15}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          {errors.phone && <p style={{ color: "red" }}>{errors.phone.message}</p>}
        </div>

        <button type="submit" style={{ padding: "10px 15px", cursor: "pointer" }}>
          Cadastrar Usuário
        </button>
      </form>
    </div>
  );
}
