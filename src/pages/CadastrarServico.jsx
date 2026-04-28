import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./CadastrarServico.module.css";
import { useState } from "react";
import Header from "../components/Header/Header.jsx";
import { API_URL } from "../App";
import { useNavigate } from "react-router-dom";

export default function CadastrarServico() {
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [salvando, setSalvando] = useState(false);

    const navigate = useNavigate();

    function formatarMoeda(valorDigitado) {
        const apenasNumeros = valorDigitado.replace(/\D/g, "");

        if (!apenasNumeros) return "";

        const numero = (parseInt(apenasNumeros, 10) / 100).toFixed(2);
        return numero.replace(".", ",");
    }

    function handleValor(e) {
        setValor(formatarMoeda(e.target.value));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!descricao.trim() || !valor.trim()) {
            setMensagem("Preencha a descrição e o valor do serviço.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setSalvando(true);
            setMensagem("");

            const response = await fetch(`${API_URL}/adicionar_servico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    descricao: descricao.trim(),
                    valor_unitario: valor.replace(",", "."),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Erro ao cadastrar serviço.");
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem || "Serviço cadastrado com sucesso.");
            setTipoMensagem("sucesso");

            setTimeout(() => {
                navigate("/servicos");
            }, 700);
        } catch (error) {
            console.error(error);
            setMensagem("Erro ao conectar com o servidor.");
            setTipoMensagem("erro");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <div>
                            <h1>Cadastrar Serviço</h1>
                            <p>Cadastre serviços com descrição e valor.</p>
                        </div>
                    </div>

                    {mensagem && (
                        <div
                            className={`${css.mensagem} ${
                                tipoMensagem === "sucesso" ? css.sucesso : css.erro
                            }`}
                        >
                            {mensagem}
                        </div>
                    )}

                    <section className={css.card}>
                        <h2>Informações do Serviço</h2>

                        <form onSubmit={handleSubmit}>
                            <div className={css.campo}>
                                <label>Descrição</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Troca de óleo"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                />
                            </div>

                            <div className={css.campo}>
                                <label>Valor (R$)</label>
                                <input
                                    type="text"
                                    placeholder="0,00"
                                    value={valor}
                                    onChange={handleValor}
                                />
                            </div>

                            <div className={css.botoes}>
                                <button
                                    type="button"
                                    className={css.cancelar}
                                    onClick={() => navigate("/servicos")}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={css.salvar}
                                    disabled={salvando}
                                >
                                    {salvando ? "Salvando..." : "Salvar Serviço"}
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        </>
    );
}