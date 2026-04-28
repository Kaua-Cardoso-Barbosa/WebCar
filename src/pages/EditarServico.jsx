import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./EditarServico.module.css";
import { useEffect, useState } from "react";
import Header from "../components/Header/Header.jsx";
import { API_URL } from "../App";
import { useNavigate, useParams } from "react-router-dom";

export default function EditarServico() {
    const { id_servico } = useParams();
    const navigate = useNavigate();

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);

    function formatarMoeda(valorDigitado) {
        const apenasNumeros = String(valorDigitado).replace(/\D/g, "");

        if (!apenasNumeros) return "";

        const numero = (parseInt(apenasNumeros, 10) / 100).toFixed(2);
        return numero.replace(".", ",");
    }

    function handleValor(e) {
        setValor(formatarMoeda(e.target.value));
    }

    async function buscarServico() {
        try {
            setCarregando(true);

            const response = await fetch(`${API_URL}/buscar_servico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_servico: Number(id_servico),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Serviço não encontrado.");
                setTipoMensagem("erro");
                return;
            }

            const servico = data.servicos[0];

            setDescricao(servico.descricao);
            setValor(
                Number(servico.valor_unitario).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
            );
        } catch (error) {
            console.error(error);
            setMensagem("Erro ao conectar com o servidor.");
            setTipoMensagem("erro");
        } finally {
            setCarregando(false);
        }
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

            const response = await fetch(`${API_URL}/edicao_servico/${id_servico}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    descricao: descricao.trim(),
                    valor_unitario: valor.replace(/\./g, "").replace(",", "."),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Erro ao editar serviço.");
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem || "Serviço atualizado com sucesso.");
            setTipoMensagem("sucesso");

            setTimeout(() => {
                navigate("/servicos");
            }, 800);
        } catch (error) {
            console.error(error);
            setMensagem("Erro ao conectar com o servidor.");
            setTipoMensagem("erro");
        } finally {
            setSalvando(false);
        }
    }

    useEffect(() => {
        buscarServico();
    }, [id_servico]);

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <h1>Editar Serviço</h1>
                        <p>Atualize a descrição e o valor do serviço selecionado.</p>
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

                        {carregando ? (
                            <p>Carregando serviço...</p>
                        ) : (
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
                                        {salvando ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}