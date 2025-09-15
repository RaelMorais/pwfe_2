import React, { useState } from "react";
import { Link } from "react-router-dom";


export function BarraNavegacao() {
  const [menuAtivo, setMenuAtivo] = useState(false);

  return (
    <nav className={`barra ${menuAtivo ? "active" : ""}`}>
      <div className="logo">Kanban</div>
      <span className="menu-toggle" onClick={() => setMenuAtivo(!menuAtivo)}>
        ☰
      </span>
      <ul>
        <li>
          <Link to="/cadUsuario" onClick={() => setMenuAtivo(false)}>
            Cadastro de Usuário
          </Link>
        </li>
        <li>
          <Link to="/cadTarefa" onClick={() => setMenuAtivo(false)}>
            Cadastro de Tarefa
          </Link>
        </li>
        <li>
          <Link to="/" onClick={() => setMenuAtivo(false)}>
            Gerenciamento de Tarefas
          </Link>
        </li>
      </ul>
    </nav>
  );
}
