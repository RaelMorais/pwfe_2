import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coluna } from './Coluna';
// import '../styles/quadro.scss';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
export function Quadro() {
    const [tarefas, setTarefas] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/v1/task/')
            .then(response => setTarefas(response.data))
            .catch(error => console.error(error));
    }, []);

    const tarefasAfazer = tarefas.filter(t => t.status === "todo");
    const tarefasEmAndamento = tarefas.filter(t => t.status === "in_progress");
    const tarefasConcluidas = tarefas.filter(t => t.status === "done");

    return (
        <DndProvider backend={HTML5Backend}>
        <div className="container">
            <h1>Quadro de Tarefas</h1>
            <Coluna titulo="A fazer" tarefas={tarefasAfazer} />
            <Coluna titulo="Fazendo" tarefas={tarefasEmAndamento} />
            <Coluna titulo="Pronto" tarefas={tarefasConcluidas} />
        </div>
        </DndProvider>
    );
}
