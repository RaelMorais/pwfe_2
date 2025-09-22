import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDrag } from "react-dnd";

export const ItemTypes = {
  TAREFA: "tarefa",
};

export function Tarefa({ tarefa, index, colunaId }) {
  const [status, setStatus] = useState(tarefa.status);

  // Drag hook
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TAREFA,
    item: { tarefa, index, colunaId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  async function excluirTarefa(id) {
    if (confirm("Certeza que quer excluir?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/task/${id}`);
        alert("Tarefa excluída!");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Erro ao excluir a tarefa");
      }
    }
  }

  async function alterarStatus() {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/task/${tarefa.id}`, { status });
      alert("Status atualizado!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao alterar status");
    }
  }

  return (
    <article
        ref={drag} // torna o card arrastável com react-dnd
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "grab",
        }}
        className="card"
        role="group"
        aria-roledescription="Tarefa"
        aria-label={`Tarefa: ${tarefa.description}`}
      >
        {/* Título da tarefa */}
        <h3 id={`tarefa-${tarefa.id}-titulo`}>{tarefa.description}</h3>

        {/* Lista de detalhes da tarefa */}
        <dl aria-labelledby={`tarefa-${tarefa.id}-titulo`}>
          <div>
            <dt>Sala:</dt>
            <dd>{tarefa.name_class}</dd>
          </div>
          <div>
            <dt>Prioridade:</dt>
            <dd>{tarefa.priority}</dd>
          </div>
          <div>
            <dt>Criado por:</dt>
            <dd>{tarefa.user_name}</dd>
          </div>
          <div>
            <dt>Criado em:</dt>
            <dd>{tarefa.register_date}</dd>
          </div>
          <div>
            <dt>Editado em:</dt>
            <dd>{tarefa.update_date}</dd>
          </div>
        </dl>

        {/* Botões de ação */}
        <div className="botoes" role="group" aria-label="Ações da tarefa">
          <Link to={`/editar/${tarefa.id}`} aria-label={`Editar tarefa: ${tarefa.description}`}>
            Editar
          </Link>
          <button
            onClick={() => excluirTarefa(tarefa.id)}
            aria-label={`Excluir tarefa: ${tarefa.description}`}
          >
            Excluir
          </button>
        </div>

        {/* Formulário de status */}
        <form
          className="status-form"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Alterar status da tarefa"
        >
          <label htmlFor={`status-${tarefa.id}`}>Alterar Status:</label>
          <div className="status-select">
            <select
              id={`status-${tarefa.id}`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">A fazer</option>
              <option value="in_progress">Fazendo</option>
              <option value="done">Pronto</option>
            </select>
            <button
              type="button"
              onClick={alterarStatus}
              aria-label={`Salvar novo status para ${tarefa.description}`}
            >
              Salvar
            </button>
          </div>
        </form>
      </article>

  );
}
