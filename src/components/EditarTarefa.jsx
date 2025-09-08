import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Schema Zod atualizado
const schemaEditarTarefas = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  name_class: z.string().min(1, { message: "Nome da classe é obrigatório" }),
  priority: z.enum(['low', 'mid', 'high'], {
    errorMap: () => ({ message: "Escolha uma prioridade" })
  }),
  status: z.enum(['todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: "Escolha um status" })
  }),
});

export function EditarTarefa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schemaEditarTarefas),
  });

  // Carrega os dados da tarefa
  useEffect(() => {
    async function fetchTarefa() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/task/${id}`);
        reset({
          description: response.data.description,
          name_class: response.data.name_class,
          priority: response.data.priority,
          status: response.data.status,
        });
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar tarefa", error);
        alert("Erro ao carregar tarefa");
      }
    }

    fetchTarefa();
  }, [id, reset]);

  // Função para atualizar tarefa
  async function onSubmit(data) {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/task/${id}`, {
        description: data.description,
        name_class: data.name_class,
        priority: data.priority,
        status: data.status,
      });
      alert("Tarefa atualizada com sucesso!");
      navigate("/"); // volta para a tela inicial ou quadro
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
      alert("Erro ao atualizar tarefa");
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold mb-4">Editar Tarefa</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Descrição */}
        <div className="form-group">
          <label>Descrição</label>
          <input type="text" {...register("description")} placeholder="Digite a descrição" />
          {errors.description && <p className="error-message">{errors.description.message}</p>}
        </div>

        {/* Nome da classe */}
        <div className="form-group">
          <label>Classe</label>
          <input type="text" {...register("name_class")} placeholder="Nome da classe" />
          {errors.name_class && <p className="error-message">{errors.name_class.message}</p>}
        </div>

        {/* Priority */}
        <div className="form-group">
          <label>Prioridade</label>
          <select {...register("priority")}>
            <option value="">Selecione</option>
            <option value="low">Low</option>
            <option value="mid">Mid</option>
            <option value="high">High</option>
          </select>
          {errors.priority && <p className="error-message">{errors.priority.message}</p>}
        </div>

        {/* Status */}
        <div className="form-group">
          <label>Status</label>
          <select {...register("status")}>
            <option value="">Selecione</option>
            <option value="todo">A fazer</option>
            <option value="in_progress">Fazendo</option>
            <option value="done">Pronto</option>
          </select>
          {errors.status && <p className="error-message">{errors.status.message}</p>}
        </div>

        <button type="submit" className="submit-button">Salvar Alterações</button>
      </form>
    </div>
  );
}
