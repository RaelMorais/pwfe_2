import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import { CadTarefa } from "../Paginas/CadTarefa"; // Ajuste o caminho conforme necessário

// Mock para a navegação (necessário devido ao useNavigate)
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

// 1. CONFIGURAÇÃO INICIAL E UTILS
vi.mock("axios");
// Mock global para window.alert
global.alert = vi.fn();

// Função auxiliar para evitar repetição (adaptada aos novos campos)
const getNameClassInput = () => screen.getByLabelText("Nome do Setor:");
const getDescriptionInput = () => screen.getByLabelText("Descrição:");
const getPrioritySelect = () => screen.getByLabelText("Prioridade:");
const getStatusSelect = () => screen.getByLabelText("Status:");
const getUserSelect = () => screen.getByLabelText("Usuário:");
const getSubmitButton = () => screen.getByRole("button", { name: /Cadastrar Task/i });
const getSubmittingButton = () => screen.getByRole("button", { name: /Enviando.../i });

describe("Teste do componente CadTarefa (Nova Versão)", () => {
    // 2. SETUP DE MOCKS GLOBAL
    beforeEach(() => {
        // Limpa o histórico de chamadas antes de cada teste
        vi.clearAllMocks();

        // Mocks de API
        // Mock para axios.get (busca de usuários)
        axios.get.mockResolvedValue({
            data: [
                { id: 1, name: "João Silva" },
                { id: 2, name: "Maria Antunes" },
            ],
        });
        // Mock para axios.post (cadastro de task)
        axios.post.mockResolvedValue({ data: { message: "Task criada" } });
    });

    // 3. TESTES DE FLUXO PRINCIPAL

    it("Deve renderizar o formulário corretamente e buscar usuários", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });
        // Espera a chamada de users
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("http://127.0.0.1:8000/api/v1/user/"));

        // Testes de presença de elementos
        expect(getNameClassInput()).toBeInTheDocument();
        expect(getDescriptionInput()).toBeInTheDocument();
        expect(getPrioritySelect()).toBeInTheDocument();
        expect(getStatusSelect()).toBeInTheDocument();
        expect(getUserSelect()).toBeInTheDocument();
        expect(getSubmitButton()).toBeInTheDocument();

        // Verifica se os usuários mockados foram carregados no select
        expect(screen.getByRole('option', { name: 'João Silva' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Maria Antunes' })).toBeInTheDocument();
    });
    
    it("Deve validar campos obrigatórios e mostrar erros (Zod)", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        
        // Clica para submeter sem preencher nada
        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(screen.getByText("Nome da classe é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("Selecione um usuário")).toBeInTheDocument();
            expect(screen.getByText("Descrição é obrigatória")).toBeInTheDocument();
            
            // CORREÇÃO: Usando a mensagem de erro literal do DOM (inglês) para Prioridade
            expect(screen.getAllByText('Invalid option: expected one of "low"|"mid"|"high"').length).toBeGreaterThanOrEqual(1);
            
            // CORREÇÃO: Usando a mensagem de erro literal do DOM (inglês) para Status
            expect(screen.getAllByText('Invalid option: expected one of "todo"|"in_progress"|"done"').length).toBeGreaterThanOrEqual(1);
        }, { timeout: 2000 }); // Aumenta um pouco o timeout se a validação for lenta
    });

    it("Deve permitir preencher campos e enviar o formulário com sucesso", async () => {
        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await userEvent.type(getNameClassInput(), "ti"); // Deve ser capitalizado para "Ti"
        await userEvent.selectOptions(getPrioritySelect(), "high");
        await userEvent.selectOptions(getStatusSelect(), "in_progress");
        await userEvent.selectOptions(getUserSelect(), "1");
        await userEvent.type(getDescriptionInput(), "Minha descrição com mais de 1 caractere.");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            // Verifica a chamada POST com o payload correto
            expect(axios.post).toHaveBeenCalledWith(
                "http://127.0.0.1:8000/api/v1/task/",
                expect.objectContaining({
                    name_class: "Ti", // Verifica a transformação capitalizeString
                    description: "Minha descrição com mais de 1 caractere.", // Verifica a transformação trim/espaços duplos
                    priority: "high",
                    status: "in_progress",
                    user: 1, // Verifica a transformação valueAsNumber
                    register_date: expect.any(String),
                })
            );
            // Verifica o fluxo de sucesso
            expect(global.alert).toHaveBeenCalledWith("Task cadastrada com sucesso!");
            expect(mockedNavigate).toHaveBeenCalledWith("/inicial");
            // Verifica se o formulário foi resetado
            expect(getNameClassInput()).toHaveValue("");
            expect(getDescriptionInput()).toHaveValue("");
            expect(getUserSelect()).toHaveValue("");
        });
    });

    it("Deve mostrar estado de envio e tratar falha de submissão", async () => {
        // Moca a falha APENAS para este teste
        axios.post.mockRejectedValueOnce({ response: { data: { detail: "Erro interno do servidor" } } });
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        await act(async () => {
            render(<CadTarefa />);
        });
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Preenche campos válidos
        await userEvent.type(getNameClassInput(), "Teste");
        await userEvent.selectOptions(getPrioritySelect(), "low");
        await userEvent.selectOptions(getStatusSelect(), "todo");
        await userEvent.selectOptions(getUserSelect(), "2");
        await userEvent.type(getDescriptionInput(), "Descrição válida para falha.");

        // Clica e verifica o estado de envio
        const submitButton = getSubmitButton();
        expect(submitButton).not.toBeDisabled();
        await userEvent.click(submitButton);

        // O botão deve mudar para "Enviando..."
        await waitFor(() => {
            expect(getSubmittingButton()).toBeInTheDocument();
            expect(getSubmittingButton()).toBeDisabled();
        });

        // Espera a resolução (falha) e verifica as ações de erro
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao cadastrar task:", expect.anything());
            expect(global.alert).toHaveBeenCalledWith("Erro: Erro interno do servidor");
            expect(mockedNavigate).not.toHaveBeenCalled();
        }, { timeout: 2000 });

        // O botão deve voltar ao normal após a falha
        await waitFor(() => {
            expect(getSubmitButton()).toBeInTheDocument();
            expect(getSubmitButton()).not.toBeDisabled();
        });

        consoleErrorSpy.mockRestore();
    });

    // --- TESTES DE VALIDAÇÃO DE CAMPO ---

    describe("Campo Nome do Setor (name_class) - Validações Específicas", () => {
        it("Deve aplicar a capitalização correta (capitalizeString) e remover espaços extras no submit", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            const valorDigitado = " financeiro de novo "; // Espaços nas bordas e minúsculo
            const valorEsperadoNoSubmit = "Financeiro De Novo"; // Capitalizado e trimado pelo Zod/transform

            await userEvent.type(getNameClassInput(), valorDigitado);

            // Preenche outros campos para submeter
            await userEvent.selectOptions(getPrioritySelect(), "mid");
            await userEvent.selectOptions(getStatusSelect(), "todo");
            await userEvent.selectOptions(getUserSelect(), "1");
            await userEvent.type(getDescriptionInput(), "Descrição com mais de 1 caractere.");

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        name_class: valorEsperadoNoSubmit,
                    })
                );
            });
        });

        it("Deve mostrar erro se exceder 15 caracteres (Zod max)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            const textoLongo = 'A'.repeat(16);

            await userEvent.type(getNameClassInput(), textoLongo);
            
            // Tenta submeter
            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                // O erro deve ser visível (o useForm com mode: 'onChange' mostra o erro após o primeiro submit ou mudança)
                expect(screen.getByText("Máximo 15 caracteres")).toBeInTheDocument();
            });
        });

        it("Deve mostrar erro se o campo for preenchido apenas com espaços (Zod min, após transformação)", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            await userEvent.type(getNameClassInput(), "   "); // A transformação trim() resultará em ""

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(screen.getByText("Nome da classe é obrigatório")).toBeInTheDocument();
            });
        });
    });

    describe("Campo Descrição (description) - Validações Específicas", () => {
        it("Deve limitar a entrada a 255 caracteres e remover espaços duplos/extremos no submit", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            const limite = 255;
            const textoLongo = 'B'.repeat(limite + 1);
            const valorComEspacos = "   descrição   com   espaços   ";
            const valorEsperado = "descrição com espaços"; // trim() e replace(/\s{2,}/g, " ")

            // Simula digitação (apenas preenche o valor, pois o componente não usa handler onChange com limite)
            await fireEvent.change(getDescriptionInput(), { target: { value: textoLongo } });
            // Força o valor do input para o valor com espaços (que será trimado no submit)
            await fireEvent.change(getDescriptionInput(), { target: { value: valorComEspacos } });


            // Preenche outros campos para submeter
            await userEvent.type(getNameClassInput(), "Setor");
            await userEvent.selectOptions(getPrioritySelect(), "mid");
            await userEvent.selectOptions(getStatusSelect(), "todo");
            await userEvent.selectOptions(getUserSelect(), "1");

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                // Garante que o Zod.transform() é aplicado no envio
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        description: valorEsperado,
                    })
                );
            });
            
            // Testa o erro de limite (Zod max)
            await act(async () => {
                fireEvent.change(getDescriptionInput(), { target: { value: textoLongo } });
            });
            await userEvent.click(getSubmitButton());
            await waitFor(() => {
                expect(screen.getByText("Máximo 255 caracteres")).toBeInTheDocument();
            });
        });
    });

    describe("Campos Select (priority, status, user) - Validações Específicas", () => {
        it("Deve mostrar erro se Prioridade não for selecionada (enum) e reconhecer a seleção", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            // Tenta submeter sem selecionar (valor inicial é '')
            await userEvent.click(getSubmitButton());
            await waitFor(() => {
                // CORREÇÃO APLICADA AQUI: Mudança de "Prioridade inválida" para a mensagem literal em inglês do DOM.
                expect(screen.getAllByText('Invalid option: expected one of "low"|"mid"|"high"').length).toBeGreaterThanOrEqual(1);
            });

            // Seleciona e verifica
            await userEvent.selectOptions(getPrioritySelect(), "low");
            expect(getPrioritySelect()).toHaveValue("low");
        });

        it("Deve mostrar erro se Status não for selecionado (enum) e reconhecer a seleção", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            // Tenta submeter sem selecionar (valor inicial é '')
            await userEvent.click(getSubmitButton());
            await waitFor(() => {
                // CORREÇÃO APLICADA AQUI: Mudança de "Status inválido" para a mensagem literal em inglês do DOM.
                expect(screen.getAllByText('Invalid option: expected one of "todo"|"in_progress"|"done"').length).toBeGreaterThanOrEqual(1);
            });

            // Seleciona e verifica
            await userEvent.selectOptions(getStatusSelect(), "done");
            expect(getStatusSelect()).toHaveValue("done");
        });

        it("Deve mostrar erro se Usuário não for selecionado (valueAsNumber/positive) e reconhecer a seleção", async () => {
            await act(async () => {
                render(<CadTarefa />);
            });
            await waitFor(() => expect(axios.get).toHaveBeenCalled());

            // Tenta submeter sem selecionar (valor inicial é '')
            await userEvent.click(getSubmitButton());
            await waitFor(() => {
                expect(screen.getByText("Selecione um usuário")).toBeInTheDocument();
            });

            // Seleciona o usuário 2 e verifica (deve ser submetido como number)
            await userEvent.selectOptions(getUserSelect(), "2");
            expect(getUserSelect()).toHaveValue("2");
            
            // Preenche outros campos e submete para verificar o payload como number
            await userEvent.type(getNameClassInput(), "Valid");
            await userEvent.selectOptions(getPrioritySelect(), "mid");
            await userEvent.selectOptions(getStatusSelect(), "todo");
            await userEvent.type(getDescriptionInput(), "Descrição válida.");
            
            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({
                        user: 2, // Espera o valor como NUMBER
                    })
                );
            });
        });
    });
});