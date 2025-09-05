import React, {useState, useEffect, use} from 'react';
import axios from 'axios'; 
import { Coluna } from './Coluna';


export function Quadro(){
    const [tarefas, setTarefas] = useState([]); 




    // effect é um hook que permite renderização de alguma coisa na tela
    // fofoqueiro que conta pra todo mundo oq o state está armazenado 

    useEffect(() =>{
        const apiUrl = 'http://127.0.0.1:8000/api/v1/task/'; 
        axios.get(apiUrl)
            .then(response => {setTarefas(response.data)})
            .catch(error => {
                console.log("Deu ruim", error)
            });


    }, [])
    const tarefasAfazer = tarefas.filter(tarefa => tarefa.status === "todo");
    const tarefasEmAndamento = tarefas.filter(tarefa => tarefa.status === "in_progress");
    const tarefasConcluidas = tarefas.filter(tarefa => tarefa.status === "done");

    return(
        <main className=''>
            <h1>Quadro</h1>
            <Coluna titulo = 'A fazer' tarefas={tarefasAfazer}/>
            <Coluna titulo = 'Fazendo' tarefas={tarefasEmAndamento}/>
            <Coluna titulo = 'Pronto' tarefas={tarefasConcluidas}/>
        </main>
    )
}