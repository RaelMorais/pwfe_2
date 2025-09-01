import React, { useState, useEffect } from "react"; // Added useState

export function Coluna({ column, tasks, onDragStart, onDrop }){
    return(
        <>
         <section
        className="coluna"
        onDragOver={(e) => e.preventDefault()} // Allow dropping
        onDrop={(e) => onDrop(e, column.id)}
        >
        <h2 className="titulo">{column.title}</h2>
        {tasks.length > 0 ? (
            tasks.map((task) => (
            <div
                key={task.id}
                className="tarefa"
                draggable
                onDragStart={(e) => onDragStart(e, task.id, column.id)}
            >
                <p><strong>{task.description}</strong></p>
                <p>Setor: {task.name_class}</p>
                <p>Prioridade: {task.priority}</p>
                <p>Usuário: {task.user_name || task.user}</p>
            </div>
            ))
        ) : (
            <p className="no-tasks">Nenhuma tarefa</p>
        )}
        </section>
        </>
    );
}