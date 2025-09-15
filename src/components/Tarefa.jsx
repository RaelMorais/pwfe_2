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
      ref={drag} // torna o card arrastável
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
      className="card"
    >
      <h3>{tarefa.description}</h3>
      <dl>
        <div>
          <dt>Sala: </dt>
          <dd>{tarefa.name_class}</dd>
        </div>
        <div>
          <dt>Prioridade: </dt>
          <dd>{tarefa.priority}</dd>
        </div>
        <div>
          <dt>Criado por: </dt>
          <dd>{tarefa.user_name}</dd>
        </div>
        <div>
          <dt>Criando em: </dt>
          <dd>{tarefa.register_date}</dd>
        </div>
        <div>
          <dt>Editado em: </dt>
          <dd>{tarefa.update_date}</dd>
        </div>
      </dl>

      <div className="botoes">
        <Link to={`/editar/${tarefa.id}`}>Editar</Link>
        <button onClick={() => excluirTarefa(tarefa.id)}>Excluir</button>
      </div>

      <form className="status-form" onSubmit={(e) => e.preventDefault()}>
        <label>Alterar Status:</label>
        <div className="status-select">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">A fazer</option>
            <option value="in_progress">Fazendo</option>
            <option value="done">Pronto</option>
          </select>
          <button type="button" onClick={alterarStatus}>Salvar</button>
        </div>
      </form>
    </article>
  );
}
