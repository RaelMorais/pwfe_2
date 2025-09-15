import React from "react";
import { Tarefa } from './Tarefa';
// import '../styles/coluna.scss';

export function Coluna({ titulo, tarefas = [] }) {
    return (
        <section className="coluna">
            <h2 className="titulo">{titulo}</h2>
            <div className="tarefas">
                {tarefas.map(tarefa => (
                    <Tarefa key={tarefa.id} tarefa={tarefa} />
                ))}
            </div>
        </section>
    );
}
