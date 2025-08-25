import axios from "axios"
import {useForm } from 'react-hook-form'; 
import { z } from 'zod'; 
import { zodResolver } from '@hookform/resolvers/zod'; 


export function CadUsuario(){

    const schemaCadUsuario = z.object({
        nome: z.string()
        .min(1, 'Insira ao menos 1 caractere')
        .max(30, 'Máximo de até 30 caracterers')
        .refine((value) => /^([A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+){1,})$/.test(value ?? ""),"Digite nome completo (nome e sobrenome)"),

        email: z.string()
        .min(1, 'Insira o Email')
        .max(30, 'Insira o endereço de email com até 30 caracteres')
        .email("E-mail inválido")
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de e-mail inválido"),

    })
    return(
    <main>
        <form>
            <h2>Cadastro do Usuario</h2>

            <label>Nome: </label>
            <input type="text" placeholder="Nome do usuario"/>
            
            <label>Email: </label>
            <input type="email" placeholder="Email do usuario"/>

            <label>Telefone: </label>
            <input type="telefone" placeholder="Telefone do usuario"/>
            
        </form>

    </main>    
    )

}
    
