import React from "react";
import { Link } from "react-router-dom";

export function ComponenteHome(){
    return(
        <>
        <section className="tela-inicial">
            {/* Vídeo de fundo */}
            <video
                className="video-fundo"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/videos/fundo.mp4" type="video/mp4" />
                Seu navegador não suporta vídeo em HTML5.
            </video>

            {/* Overlay escuro */}
            <div className="overlay"></div>

            {/* Conteúdo principal */}
            <div className="conteudo">
                <h1>Bem-vindo ao Kanban</h1>
                <p>Organize, acompanhe e conclua suas tarefas de forma simples e intuitiva.</p>
                <Link to='/inicial'>
                <button className="btn-acessar">Acessar</button>
                </Link>
            </div>
        </section>
        </>
    )
}