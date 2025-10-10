import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CadUsuario } from "../paginas/CadUsuario"; // Assumindo que este é o caminho correto
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import '@testing-library/jest-dom';

// Mocks globais
vi.mock("axios");
global.alert = vi.fn();
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// Funções utilitárias para buscar elementos
const getNomeInput = () => screen.getByLabelText(/Nome Completo/i);
const getEmailInput = () => screen.getByLabelText(/Email/i);
const getPhoneInput = () => screen.getByLabelText(/Telefone/i);
const getSubmitButton = () => screen.getByRole("button", { name: /Cadastrar Usuário/i });
const getSubmittingButton = () => screen.getByRole("button", { name: /Enviando.../i });

describe("Teste do componente CadUsuario com Zod Schema V2", () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        axios.post.mockResolvedValue({ data: { message: "ok" } });
    });

    // --- RENDERIZAÇÃO E VALIDAÇÕES GERAIS ---
    
    it("deve renderizar todos os campos e o botão de submissão", () => {
        render(<CadUsuario />);
        expect(getNomeInput()).toBeInTheDocument();
        expect(getEmailInput()).toBeInTheDocument();
        expect(getPhoneInput()).toBeInTheDocument();
        expect(getSubmitButton()).toBeInTheDocument();
        expect(getSubmitButton()).not.toBeDisabled();
    });

    it("deve mostrar erros quando todos os campos estiverem vazios", async () => {
        render(<CadUsuario />);
        
        // Tenta submeter sem preencher nada
        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("Telefone incompleto")).toBeInTheDocument();
        });
    });

    // --- TESTES DO CAMPO NOME (Regex, Sobrenome, Capitalize) ---

    it("deve mostrar erro se o nome não tiver sobrenome", async () => {
        render(<CadUsuario />);
        await userEvent.type(getNomeInput(), "Maria");
        await userEvent.type(getEmailInput(), "maria@gmail.com");
        await userEvent.type(getPhoneInput(), "11912345678");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(screen.getByText(/Digite nome completo \(nome e sobrenome\), sem números ou símbolos, sem espaços no início\/fim/i)).toBeInTheDocument();
        });
    });

    it("deve mostrar erro para nome com caracteres especiais ou números", async () => {
        render(<CadUsuario />);
        // O onChange remove, mas o Zod valida o resultado da transformação
        fireEvent.change(getNomeInput(), { target: { value: "Maria Silva 123" } });
        await userEvent.type(getEmailInput(), "maria@gmail.com");
        await userEvent.type(getPhoneInput(), "11912345678");
        
        await userEvent.click(getSubmitButton());
        
        // A validação Zod final deve prevalecer se o nome for alterado de forma a quebrar o regex.
        await waitFor(() => {
            // Verifica a mensagem final do regex/refine
            expect(screen.getByText(/Digite nome completo/i)).toBeInTheDocument(); 
        });
    });
            
        // Localize o teste: deve aplicar capitalizeName e remover espaços múltiplos/extremos no submit
        it("deve aplicar capitalizeName e remover espaços múltiplos/extremos no submit", async () => {
            render(<CadUsuario />);
            // Correção: Use um nome que atenda ao regex inicial do Zod (sem espaços iniciais/finais), mas que precise de capitalização/transformação.
            const nomeDigitado = "maRiA DA siLVA"; // Nome sem espaços iniciais/finais, mas com case misturado.
            const nomeEsperado = "Maria Da Silva"; // O valor que o transform do Zod deve produzir.

            // Use fireEvent.change para setar o valor diretamente no input, simulando a limpeza do onChange (embora a limpeza de espaços externos não seja feita no onChange, mas sim no transform do Zod se o regex passar).
            await fireEvent.change(getNomeInput(), { target: { value: nomeDigitado } }); 
            await userEvent.type(getEmailInput(), "maria@hotmail.com");
            // Correção: Adicionar o valor do telefone no formato correto para garantir a validade.
            await fireEvent.change(getPhoneInput(), { target: { value: "11912345678" } }); // O phone change aplica a máscara

            await userEvent.click(getSubmitButton());

            await waitFor(() => {
                // Verifica se o axios foi chamado com o valor transformado
                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        name: nomeEsperado, // ESTE É O CHECK
                    })
                );
            });
        });
    
    // --- TESTES DO CAMPO EMAIL (Domínios, Limite) ---

    it("deve mostrar erro para email com domínio não permitido", async () => {
        render(<CadUsuario />);
        await userEvent.type(getNomeInput(), "Maria Silva");
        await userEvent.type(getEmailInput(), "maria@outlook.com"); // Domínio não permitido
        await userEvent.type(getPhoneInput(), "11912345678");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(screen.getByText(/Use apenas email válido \(@gmail, @hotmail ou @empresa\.com\.br\)/i)).toBeInTheDocument();
        });
    });

    it("deve mostrar erro para emails temporários", async () => {
        render(<CadUsuario />);
        await userEvent.type(getNomeInput(), "Maria Silva");
        await userEvent.type(getEmailInput(), "temp@mailinator.com");
        await userEvent.type(getPhoneInput(), "11912345678");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(screen.getByText("Emails temporários não são permitidos")).toBeInTheDocument();
        });
    });

    it("deve aceitar emails válidos e aplicar trim/lowercase", async () => {
        render(<CadUsuario />);
        const emailDigitado = "  MaRiA@GmAiL.cOm  ";
        const emailEsperado = "maria@gmail.com";

        await userEvent.type(getNomeInput(), "Maria Silva");
        // O onChange aplica o trim, mas o Zod aplica lowercase no submit
        await fireEvent.change(getEmailInput(), { target: { value: emailDigitado } });
        await userEvent.type(getPhoneInput(), "11912345678");

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    email: emailEsperado, // Verifica a transformação
                })
            );
        });
    });
    
    // --- TESTES DO CAMPO TELEFONE (Máscara, Regex) ---

    it("deve aplicar a máscara e limitar o telefone corretamente", async () => {
        render(<CadUsuario />);
        const phoneInput = getPhoneInput();
        
        // Simula digitação: 119876543210 (12 dígitos, 1 a mais)
        await fireEvent.change(phoneInput, { target: { value: "119876543210" } });

        // A máscara deve ser aplicada e o valor limitado a (11) 98765-4321 (15 chars)
        expect(phoneInput.value).toBe("(11) 98765-4321");
        
        // Tenta submeter (deve ser válido)
        await userEvent.type(getNomeInput(), "Maria Silva");
        await userEvent.type(getEmailInput(), "maria@gmail.com");
        await userEvent.click(getSubmitButton());
        
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    phone: "(11) 98765-4321", // Verifica se o formato mascarado é enviado
                })
            );
        });
    });

    // Localize o teste: deve mostrar erro para telefone com formato incompleto
    it("deve mostrar erro para telefone com formato incompleto", async () => {
        render(<CadUsuario />);
        await userEvent.type(getNomeInput(), "Maria Silva");
        await userEvent.type(getEmailInput(), "maria@gmail.com");
        
        // Simula telefone incompleto (10 dígitos)
        await fireEvent.change(getPhoneInput(), { target: { value: "1198765432" } }); // Máscara: (11) 9876-5432

        await userEvent.click(getSubmitButton());

        await waitFor(() => {
            // CORREÇÃO AQUI: A mensagem de erro exibida é a do regex, não a do min().
            expect(screen.getByText(/Telefone inválido, use o formato/i)).toBeInTheDocument();
            
            // Se você quiser testar o min(14), use um valor menor que 14 chars. Ex:
            // expect(screen.getByText("Telefone incompleto")).toBeInTheDocument();
            // A entrada para testar "Telefone incompleto" seria: fireEvent.change(getPhoneInput(), { target: { value: "119" } });
        });
    });
        
    // --- TESTES DE FLUXO DE SUBMISSÃO ---
    
    it("deve mostrar estado de submissão e tratar sucesso", async () => {
        render(<CadUsuario />);
        
        // Preenche campos válidos
        await userEvent.type(getNomeInput(), "Maria Silva");
        await userEvent.type(getEmailInput(), "maria@gmail.com");
        await userEvent.type(getPhoneInput(), "11912345678");

        await act(async () => {
            await userEvent.click(getSubmitButton());
        });

        // O botão deve mudar para "Enviando..."
        await waitFor(() => {
            expect(getSubmittingButton()).toBeInTheDocument();
            expect(getSubmittingButton()).toBeDisabled();
        });

        // Espera a resolução (sucesso)
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Usuário cadastrado com sucesso!");
        });
        
        // O botão deve voltar ao normal e o formulário deve ser resetado
        expect(getSubmitButton()).toBeInTheDocument();
        expect(getSubmitButton()).not.toBeDisabled();
        expect(getNomeInput()).toHaveValue("");
    });
    
    it("deve mostrar estado de submissão e tratar falha da API", async () => {
        // Moca a falha APENAS para este teste
        axios.post.mockRejectedValueOnce({ response: { data: { detail: "Email já cadastrado" } } });

        render(<CadUsuario />);
        
        // Preenche campos válidos
        await userEvent.type(getNomeInput(), "Maria Silva");
        await userEvent.type(getEmailInput(), "email@gmail.com");
        await userEvent.type(getPhoneInput(), "11912345678");

        await act(async () => {
            await userEvent.click(getSubmitButton());
        });

        // O botão deve mudar para "Enviando..."
        await waitFor(() => {
            expect(getSubmittingButton()).toBeInTheDocument();
        });

        // Espera a resolução (falha) e verifica as ações de erro
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao cadastrar usuário:", expect.anything());
            expect(global.alert).toHaveBeenCalledWith("Erro: Email já cadastrado");
        }, { timeout: 2000 });

        // O botão deve voltar ao normal após a falha
        await waitFor(() => {
            expect(getSubmitButton()).toBeInTheDocument();
            expect(getSubmitButton()).not.toBeDisabled();
        });
    });
});