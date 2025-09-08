import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coluna } from './Coluna';

export function Quadro() {
    const [tarefas, setTarefas] = useState([]);

    useEffect(() => {
        const apiUrl = 'http://127.0.0.1:8000/api/v1/task/';
        axios.get(apiUrl)
            .then(response => {
                setTarefas(response.data);
            })
            .catch(error => {
                console.error("Deu ruim", error);
            });
    }, []);

    const tarefasAfazer = tarefas.filter(tarefa => tarefa.status === "todo");
    const tarefasEmAndamento = tarefas.filter(tarefa => tarefa.status === "in_progress");
    const tarefasConcluidas = tarefas.filter(tarefa => tarefa.status === "done");

    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold mb-4">Quadro de Tarefas</h1>
            <div className="grid grid-cols-3 gap-4">
                <Coluna titulo="A fazer" tarefas={tarefasAfazer} />
                <Coluna titulo="Fazendo" tarefas={tarefasEmAndamento} />
                <Coluna titulo="Pronto" tarefas={tarefasConcluidas} />
            </div>
        </main>
    );
}
