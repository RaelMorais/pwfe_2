import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


export function Tarefa({ tarefa }) {
    const [status, setStatus] = useState(tarefa.status); // Estado do select

    // Função para excluir tarefa
    async function excluirTarefa(id) {
        if (confirm("Certeza que quer excluir?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/v1/task/${id}`);
                alert("Tarefa excluída!");
                window.location.reload();
            } catch (error) {
                console.error("Erro ao excluir", error);
                alert("Erro ao excluir a tarefa");
            }
        }
    }

    // Função para alterar status
    async function alterarStatus() {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/v1/task/${tarefa.id}`, {
                status: status,
            });
            alert("Status atualizado!");
            window.location.reload();
        } catch (error) {
            console.error("Erro ao alterar status", error);
            alert("Houve um erro ao alterar status");
        }
    }

    return (
        <article className="bg-gray-50 w-64 min-w-[16rem] p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex-shrink-0">
            {/* Título */}
            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                {tarefa.description}
            </h3>

            {/* Detalhes */}
            <dl className="text-sm text-gray-600 space-y-1">
                <div>
                    <dt className="font-semibold inline">📚 </dt>
                    <dd className="inline">{tarefa.name_class}</dd>
                </div>
                <div>
                    <dt className="font-semibold inline">⚡ </dt>
                    <dd className="inline capitalize">{tarefa.priority}</dd>
                </div>
                <div>
                    <dt className="font-semibold inline">👤 </dt>
                    <dd className="inline">{tarefa.user_name}</dd>
                </div>
            </dl>

            {/* Botões Editar / Excluir */}
            <div className="flex gap-2 mt-3">
             <Link
                    to={`/editar/${tarefa.id}`} // passa o id da tarefa na URL
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs inline-block text-center"
                >
                    Editar
                </Link>
                <button
                    type="button"
                    onClick={() => excluirTarefa(tarefa.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs"
                >
                    Excluir
                </button>
            </div>

            {/* Form alterar status */}
            <form
                className="mt-3"
                onSubmit={(e) => e.preventDefault()} // previne submit do form
            >
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alterar Status:
                </label>
                <div className="flex gap-2">
                    <select
                        id={tarefa.id}
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-full"
                    >
                        <option value="todo">A fazer</option>
                        <option value="in_progress">Fazendo</option>
                        <option value="done">Pronto</option>
                    </select>
                    <button
                        type="button"
                        onClick={alterarStatus}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs"
                    >
                        Salvar
                    </button>
                </div>
            </form>
        </article>
    );
}
