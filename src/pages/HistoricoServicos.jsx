import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Header from "../components/Header/Header.jsx";
import css from "./HistoricoServicos.module.css";
import { API_URL } from "../App";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HistoricoServicos() {
    const navigate = useNavigate();

    const [servicos, setServicos] = useState([]);
    const [idServico, setIdServico] = useState("");
    const [historico, setHistorico] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function formatarData(valor) {
        if (!valor) return "Não informado";

        if (String(valor).includes("/")) {
            return String(valor);
        }

        try {
            return new Date(valor).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
            });
        } catch {
            return String(valor);
        }
    }

    const totalPaginas = Math.max(1, Math.ceil(historico.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const historicoPaginado = historico.slice(inicioPagina, inicioPagina + 15);

    async function buscarServicos() {
        try {
            const response = await fetch(`${API_URL}/buscar_servico`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (response.ok) {
                setServicos(data.servicos || []);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function buscarHistorico(servico = "") {
        try {
            setCarregando(true);
            setPaginaAtual(1);
            setMensagem("");
            setTipoMensagem("");

            const response = await fetch(`${API_URL}/buscar_historico_servico`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_servico: servico ? Number(servico) : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setHistorico([]);
                setMensagem(data.mensagem || "Nenhum histórico encontrado.");
                setTipoMensagem("erro");
                return;
            }

            setHistorico(data["manutenções"] || []);
        } catch (error) {
            console.error(error);
            setHistorico([]);
            setMensagem("Não foi possível carregar os dados. Tente novamente.");
            setTipoMensagem("erro");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarServicos();
        buscarHistorico();
    }, []);

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <div>
                            <h1>Histórico de Serviços</h1>
                            <p>Consulte os reajustes registrados nos valores dos serviços.</p>
                        </div>

                        <button type="button" className={css.cancelar} onClick={() => navigate("/servicos")}>
                            Voltar
                        </button>
                    </div>

                    <section className={css.cardFiltro}>
                        <label>Serviço</label>
                        <div className={css.filtroLinha}>
                            <select
                                value={idServico}
                                onChange={(e) => setIdServico(e.target.value)}
                            >
                                <option value="">Todos os serviços</option>
                                {servicos.map((servico) => (
                                    <option key={servico.id_servico} value={servico.id_servico}>
                                        {servico.descricao}
                                    </option>
                                ))}
                            </select>

                            <button type="button" className={css.salvar} onClick={() => buscarHistorico(idServico)}>
                                Buscar
                            </button>
                        </div>
                    </section>

                    {mensagem && (
                        <div className={`${css.mensagem} ${tipoMensagem === "erro" ? css.erro : css.sucesso}`}>
                            {mensagem}
                        </div>
                    )}

                    <section className={css.tabelaCard}>
                        <table>
                            <thead>
                            <tr>
                                <th>Serviço</th>
                                <th>Valor</th>
                                <th>Data</th>
                            </tr>
                            </thead>

                            <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="3" className={css.vazio}>Carregando dados...</td>
                                </tr>
                            ) : historico.length > 0 ? (
                                historicoPaginado.map((item, index) => (
                                    <tr key={`${item["descrição"]}-${index}`}>
                                        <td>{item["descrição"]}</td>
                                        <td>{formatarPreco(item["valor_unitário"])}</td>
                                        <td>{formatarData(item["data_histórico"])}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className={css.vazio}>Nenhum histórico encontrado.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>

                    <div className={css.paginacao}>
                        <button
                            type="button"
                            disabled={paginaAtual === 1}
                            onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                        >
                            Anterior
                        </button>
                        <span>{paginaAtual} / {totalPaginas}</span>
                        <button
                            type="button"
                            disabled={paginaAtual === totalPaginas}
                            onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                        >
                            Próxima
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
}
