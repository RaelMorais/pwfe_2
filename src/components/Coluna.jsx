import React from "react";
import { useDrop } from "react-dnd";
import { Tarefa, ItemTypes } from "./Tarefa";
import axios from "axios";

export function Coluna({ titulo, tarefas }) {
  // Drop hook
  const [, drop] = useDrop({
    accept: ItemTypes.TAREFA,
    drop: async (item) => {
      try {
        // Atualiza no backend o status conforme a coluna
        let novoStatus = "todo";
        if (titulo === "Fazendo") novoStatus = "in_progress";
        if (titulo === "Pronto") novoStatus = "done";

        await axios.patch(`http://127.0.0.1:8000/api/v1/task/${item.tarefa.id}`, {
          status: novoStatus,
        });

        window.location.reload(); 
      } catch (error) {
        console.error(error);
        alert("Erro ao mover tarefa");
      }
    },
  });

  return (
    // Div que contém os cards com as tarefas, onde tudo está em um drop para adicionar 
    <div ref={drop} className="coluna">
      <h2>{titulo}</h2>
      {tarefas.map((t, index) => (
        <Tarefa key={t.id} tarefa={t} index={index} colunaId={titulo} />
      ))}
    </div>
  );
}
