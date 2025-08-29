import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// garante que cada as primeiras letras sejam maiusculas 
function capitalizeName(name) {
  return name
    .trim() // remove espaços no início/fim
    .split(/\s+/) // divide por qualquer quantidade de espaços
    .map((parte) =>
      // trata nomes compostos com hífen
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

// Schema com validação para nome e email
const schemaUsuario = z.object({
    name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(30, "Máximo 30 caracteres")
    .regex(
        /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
        "Digite nome completo (nome e sobrenome), sem números ou símbolos, sem espaços no início/fim"
    )
    .transform((val) => capitalizeName(val)) // <- CORRETO: fora do regex
    .refine((val) => val.split(" ").length >= 2, {
        message: "Digite pelo menos nome e sobrenome",
    })
    .refine(
        (val) => val.split(" ").every((parte) => parte.length >= 2),
        { message: "Cada parte do nome deve ter pelo menos 2 letras" }
    ),


//  z.string() → garante que o valor é uma string.

// .min(1, "Nome é obrigatório") → impede que o campo fique vazio.

// .max(30, "Máximo 30 caracteres") → limita a 30 caracteres no total.

// .regex(...) → usa expressão regular (Regex) para validar:

// ^[A-Za-zÀ-ÖØ-öø-ÿ]+ → o nome deve começar com letras maiúsculas ou minúsculas (incluindo acentos).

// (?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$ → deve haver pelo menos um espaço seguido de outro nome (sobrenome).


  email: z
    .string()
    .min(1, "Email é obrigatório")
    .max(50, "Máximo 50 caracteres")
    .email("Formato de email inválido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de email inválido")
    .transform((val) => val.trim().toLowerCase()) // normaliza para minúsculo
    .refine(
      (val) => !val.includes("tempmail") && !val.includes("mailinator"),
      { message: "Emails temporários não são permitidos" }
    )
    .refine(
      (val) => val.endsWith("@gmail.com") || val.endsWith("@hotmail.com") || val.endsWith("@empresa.com.br"),
      { message: "Use apenas email válido (@gmail, @hotmail ou @empresa.com.br)" }
    ),
});

// z.string() → deve ser string.

// .min(1, "Email é obrigatório") → não pode ser vazio.

// .max(50, "Máximo 50 caracteres") → limite de tamanho.

// .email("Formato de email inválido") → valida formato de e-mail (usa a regra interna do Zod, que já cobre boa parte dos casos).

// .regex(...) → reforço extra para evitar espaços ou caracteres estranhos:

// ^[^\s@]+ → antes do @, não pode ter espaço e deve ter pelo menos 1 caractere.

// @[^\s@]+ → depois do @, deve ter ao menos 1 caractere.

// \.[^\s@]+$ → deve terminar com . seguido de algo (ex.: .com, .org, .gov.br).


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

  // Tratamento para o campo nome
    //   Função para garantir que durante a entrada do usuario, ele digite correto
  const handleNomeChange = (e) => {
    let valor = e.target.value;
    valor = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, "");
    valor = valor.replace(/\s{2,}/g, " ");
    if (valor.length > 30) valor = valor.slice(0, 30);
    setValue("name", valor);
  };

  // Tratamento para o campo email
      //   Função para garantir que durante a entrada do usuario, ele digite correto
  const handleEmailChange = (e) => {
    let valor = e.target.value.trim();
    if (valor.length > 50) valor = valor.slice(0, 50);
    setValue("email", valor);
  };

  // Diferença entre Tratar no Schema e Na função é: O schema verifica só após o Submit, na função verifica durante
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
