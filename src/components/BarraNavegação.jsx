import React, { useState } from "react";
import { Link } from "react-router-dom";


export function BarraNavegacao() {
  // Função para criar estado do botão, caso ele de como desativado, fica com o icone para acesso ao menu
  const [menuAtivo, setMenuAtivo] = useState(false);

  return (
    <header>
    <nav className={`barra ${menuAtivo ? "active" : ""}`}>
      <div className="logo">Kanban</div>
      {/* Botão com aria-label para acessibilidade */}
      <button 
        className="menu-toggle" 
        aria-expanded={menuAtivo}
        aria-controls="menu-principal"
        aria-label="Abrir ou fechar menu"
        onClick={() => setMenuAtivo(!menuAtivo)}>
        ☰
      </button>

      <ul id="menu-principal">
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
    </header>
  );
}
