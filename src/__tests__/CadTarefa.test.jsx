// CadTarefa.test.jsx
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import CadTarefa from "../paginas/CadTarefa";
import axios from "axios";

vi.mock("axios");

describe("CadTarefa Component", () => {
  it("mostra erro se campos não preenchidos", () => {
    render(<CadTarefa />);
    fireEvent.click(screen.getByText(/Cadastrar Task/i));
    expect(screen.getByText(/Nome do setor é obrigatório/i)).toBeInTheDocument();
  });

  it("cadastra task com sucesso", async () => {
    axios.post.mockResolvedValueOnce({});
    global.alert = vi.fn();

    render(<CadTarefa />);
    fireEvent.change(screen.getByPlaceholderText(/Nome do Setor/i), { target: { value: "Financeiro" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "low" } });
    fireEvent.change(screen.getByPlaceholderText(/Descrição/i), { target: { value: "Task de teste" } });
    fireEvent.click(screen.getByText(/Cadastrar Task/i));

    expect(axios.post).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith("Task cadastrada com sucesso!");
  });
});
