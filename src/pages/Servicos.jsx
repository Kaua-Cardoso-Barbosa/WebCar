import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./Servicos.module.css";
import { useEffect, useState } from "react";
import Header from "../components/Header/Header.jsx";
import { Link } from "react-router-dom";
import { API_URL } from "../App.jsx";

export default function Servicos() {
    const [servicos, setServicos] = useState([]);
    const [busca, setBusca] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    const [modalAberto, setModalAberto] = useState(false);
    const [servicoEditando, setServicoEditando] = useState(null);
    const [descricaoEdit, setDescricaoEdit] = useState("");
    const [valorEdit, setValorEdit] = useState("");
    const [salvandoEdit, setSalvandoEdit] = useState(false);

    const [modalConfirmacao, setModalConfirmacao] = useState(false);
    const [servicoExcluir, setServicoExcluir] = useState(null);
    const [modalHistorico, setModalHistorico] = useState(false);
    const [servicoHistorico, setServicoHistorico] = useState(null);
    const [historicoServico, setHistoricoServico] = useState([]);
    const [servicosComHistorico, setServicosComHistorico] = useState(new Set());
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);

    const [toast, setToast] = useState("");
    const [tipoToast, setTipoToast] = useState("");

    function mostrarToast(texto, tipo) {
        setToast(texto);
        setTipoToast(tipo);

        setTimeout(() => {
            setToast("");
            setTipoToast("");
        }, 3000);
    }

    const totalPaginas = Math.max(1, Math.ceil(servicos.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const servicosPaginados = servicos.slice(inicioPagina, inicioPagina + 15);

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

    function valorHistoricoDe(item) {
        return Number(
            item?.["valor_unitário"] ??
            item?.["valor_unitÃ¡rio"] ??
            item?.valor_unitario ??
            0
        );
    }

    function dataHistoricoDe(item) {
        return item?.["data_histórico"] ?? item?.["data_histÃ³rico"] ?? item?.data_historico;
    }

    function servicoTemHistorico(servico) {
        return servicosComHistorico.has(Number(servico.id_servico));
    }

    function formatarMoeda(valorDigitado) {
        const apenasNumeros = String(valorDigitado).replace(/\D/g, "");
        if (!apenasNumeros) return "";

        const numero = (parseInt(apenasNumeros, 10) / 100).toFixed(2);
        return numero.replace(".", ",");
    }

    function abrirModalEditar(servico) {
        setServicoEditando(servico);
        setDescricaoEdit(servico.descricao || "");
        setValorEdit(
            Number(servico.valor_unitario || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        );
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setServicoEditando(null);
        setDescricaoEdit("");
        setValorEdit("");
    }

    function abrirConfirmacao(servico) {
        setServicoExcluir(servico);
        setModalConfirmacao(true);
    }

    function fecharConfirmacao() {
        setServicoExcluir(null);
        setModalConfirmacao(false);
    }

    function fecharHistorico() {
        setModalHistorico(false);
        setServicoHistorico(null);
        setHistoricoServico([]);
    }

    async function abrirHistorico(servico) {
        setServicoHistorico(servico);
        setModalHistorico(true);
        setHistoricoServico([]);

        try {
            setCarregandoHistorico(true);

            const response = await fetch(`${API_URL}/buscar_historico_servico`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_servico: servico.id_servico,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setHistoricoServico([]);
                return;
            }

            setHistoricoServico(data["manutenções"] || data["manutenÃ§Ãµes"] || []);
        } catch (error) {
            console.error(error);
            setHistoricoServico([]);
        } finally {
            setCarregandoHistorico(false);
        }
    }

    async function sincronizarServicosComHistorico(listaServicos) {
        const idsComHistorico = new Set();

        await Promise.all(
            listaServicos.map(async (servico) => {
                try {
                    const response = await fetch(`${API_URL}/buscar_historico_servico`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            id_servico: servico.id_servico,
                        }),
                    });

                    if (!response.ok) return;

                    const data = await response.json().catch(() => ({}));
                    const historico = data["manutenções"] || data["manutenÃ§Ãµes"] || [];

                    if (historico.length > 0) {
                        idsComHistorico.add(Number(servico.id_servico));
                    }
                } catch (error) {
                    console.error(error);
                }
            })
        );

        setServicosComHistorico(idsComHistorico);
    }

    function linhasHistoricoServico() {
        if (!servicoHistorico) return [];

        const atual = Number(servicoHistorico.valor_unitario || 0);

        return historicoServico.map((item, index) => {
            const valorAnterior = valorHistoricoDe(item);
            const valorNovo = index === 0 ? atual : valorHistoricoDe(historicoServico[index - 1]);
            const diferenca = valorNovo - valorAnterior;

            return {
                data: dataHistoricoDe(item),
                valorAnterior,
                valorNovo,
                diferenca,
            };
        });
    }

    async function buscarServicos(descricao = "") {
        try {
            setCarregando(true);
            setMensagem("");

            const resposta = await fetch(`${API_URL}/buscar_servico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ descricao }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                setServicos([]);
                setMensagem(dados.mensagem || "Não foi possível carregar os dados. Tente novamente.");
                return;
            }

            const listaServicos = dados.servicos || [];
            setServicos(listaServicos);
            sincronizarServicosComHistorico(listaServicos);
        } catch (erro) {
            console.error(erro);
            setMensagem("Não foi possível carregar os dados. Tente novamente.");
        } finally {
            setCarregando(false);
        }
    }

    async function editarServico(e) {
        e.preventDefault();

        if (!descricaoEdit.trim() || !valorEdit.trim()) {
            mostrarToast("Preencha a descrição e o valor.", "erro");
            return;
        }

        try {
            setSalvandoEdit(true);

            const resposta = await fetch(`${API_URL}/edicao_servico/${servicoEditando.id_servico}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    descricao: descricaoEdit.trim(),
                    valor_unitario: valorEdit.replace(/\./g, "").replace(",", "."),
                }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarToast(dados.mensagem || "Não foi possível salvar as alterações.", "erro");
                return;
            }

            mostrarToast(dados.mensagem || "Serviço atualizado com sucesso.", "sucesso");
            fecharModal();
            buscarServicos(busca);
        } catch (erro) {
            console.error(erro);
            mostrarToast("Não foi possível salvar as alterações.", "erro");
        } finally {
            setSalvandoEdit(false);
        }
    }

    async function confirmarExclusao() {
        if (!servicoExcluir) return;

        try {
            const resposta = await fetch(`${API_URL}/deletar_servico/${servicoExcluir.id_servico}`, {
                method: "DELETE",
                credentials: "include",
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarToast(dados.mensagem || "Não foi possível excluir este item.", "erro");
                return;
            }

            mostrarToast(dados.mensagem || "Serviço excluído com sucesso.", "sucesso");
            fecharConfirmacao();
            buscarServicos(busca);
        } catch (erro) {
            console.error(erro);
            mostrarToast("Não foi possível excluir este item.", "erro");
        }
    }

    useEffect(() => {
        buscarServicos();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarServicos(busca);
        }, 500);

        return () => clearTimeout(timer);
    }, [busca]);

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <h1>Serviços</h1>

                        <div className={css.botoes}>
                            <Link to="/cadastrarservicos" className={css.botaoAzul}>
                                Novo Serviço
                            </Link>

                            <Link to="/atualizarvalores" className={css.botaoAzul}>
                                Atualização de Valores
                            </Link>

                        </div>
                    </div>

                    <div className={css.busca}>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>

                    <section className={css.tabelaCard}>
                        <table>
                            <thead>
                            <tr>
                                <th>DESCRIÇÃO</th>
                                <th>PREÇO</th>
                                <th>VARIAÇÃO</th>
                                <th>AÇÕES</th>
                            </tr>
                            </thead>

                            <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="4" className={css.vazio}>
                                        Carregando dados...
                                    </td>
                                </tr>
            ) : servicos.length > 0 ? (
                                servicosPaginados.map((servico) => (
                                    <tr key={servico.id_servico}>
                                        <td>{servico.descricao}</td>

                                        <td>
                                            R${Number(servico.valor_unitario).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                        </td>

                                        <td>
                                                <span
                                                    className={
                                                        servico.valor_porcentagem > 0
                                                            ? css.positivo
                                                            : servico.valor_porcentagem < 0
                                                                ? css.negativo
                                                                : css.neutro
                                                    }
                                                >
                                                    {servico.valor_porcentagem > 0 && "+"}
                                                    {Number(servico.valor_porcentagem || 0).toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 4,
                                                        maximumFractionDigits: 4,
                                                    })}
                                                    %
                                                </span>
                                        </td>

                                        <td>
                                            <div className={css.acoes}>
                                                {servicoTemHistorico(servico) && (
                                                    <button
                                                        type="button"
                                                        className={css.icone}
                                                        onClick={() => abrirHistorico(servico)}
                                                    >
                                                        Histórico
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className={`${css.icone} ${css.editar}`}
                                                    onClick={() => abrirModalEditar(servico)}
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={css.icone}
                                                    onClick={() => abrirConfirmacao(servico)}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className={css.vazio}>
                                        {busca ? "Nenhum resultado encontrado." : mensagem || "Nenhum serviço cadastrado."}
                                    </td>
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

            {modalAberto && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>Editar Serviço</h2>

                        <form onSubmit={editarServico}>
                            <div className={css.campo}>
                                <label>Descrição</label>
                                <input
                                    type="text"
                                    value={descricaoEdit}
                                    onChange={(e) => setDescricaoEdit(e.target.value)}
                                />
                            </div>

                            <div className={css.campo}>
                                <label>Valor (R$)</label>
                                <input
                                    type="text"
                                    value={valorEdit}
                                    onChange={(e) => setValorEdit(formatarMoeda(e.target.value))}
                                />
                            </div>

                            <div className={css.modalBotoes}>
                                <button type="button" className={css.cancelar} onClick={fecharModal}>
                                    Cancelar
                                </button>

                                <button type="submit" className={css.salvar} disabled={salvandoEdit}>
                                    {salvandoEdit ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalConfirmacao && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>Confirmar exclusão</h2>

                        <p>
                            Tem certeza que deseja excluir o serviço{" "}
                            <strong>{servicoExcluir?.descricao}</strong>?
                        </p>

                        <div className={css.modalBotoes}>
                            <button type="button" className={css.cancelar} onClick={fecharConfirmacao}>
                                Cancelar
                            </button>

                            <button type="button" className={css.excluir} onClick={confirmarExclusao}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalHistorico && (
                <div className={css.modalFundo}>
                    <div className={`${css.modal} ${css.modalHistorico}`}>
                        <div className={css.modalTopoHistorico}>
                            <div>
                                <h2>Histórico do serviço</h2>
                                <p>{servicoHistorico?.descricao}</p>
                            </div>

                            <button type="button" className={css.fecharHistorico} onClick={fecharHistorico}>
                                ×
                            </button>
                        </div>

                        <div className={css.resumoHistorico}>
                            <div>
                                <span>Preço atual</span>
                                <strong>{formatarPreco(servicoHistorico?.valor_unitario)}</strong>
                            </div>

                            <div>
                                <span>Última variação</span>
                                <strong
                                    className={
                                        Number(servicoHistorico?.valor_porcentagem || 0) > 0
                                            ? css.positivo
                                            : Number(servicoHistorico?.valor_porcentagem || 0) < 0
                                                ? css.negativo
                                                : css.neutro
                                    }
                                >
                                    {Number(servicoHistorico?.valor_porcentagem || 0) > 0 && "+"}
                                    {Number(servicoHistorico?.valor_porcentagem || 0).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 4,
                                        maximumFractionDigits: 4,
                                    })}
                                    %
                                </strong>
                            </div>
                        </div>

                        {carregandoHistorico ? (
                            <p className={css.vazio}>Carregando histórico...</p>
                        ) : linhasHistoricoServico().length > 0 ? (
                            <div className={css.tabelaHistorico}>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Antes</th>
                                        <th>Depois</th>
                                        <th>Diferença</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {linhasHistoricoServico().map((linha, index) => (
                                        <tr key={`${linha.data}-${index}`}>
                                            <td>{formatarData(linha.data)}</td>
                                            <td>{formatarPreco(linha.valorAnterior)}</td>
                                            <td>{formatarPreco(linha.valorNovo)}</td>
                                            <td className={linha.diferenca >= 0 ? css.positivo : css.negativo}>
                                                {linha.diferenca > 0 && "+"}
                                                {formatarPreco(linha.diferenca)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={css.vazio}>Nenhum histórico encontrado para este serviço.</p>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div className={`${css.toast} ${tipoToast === "sucesso" ? css.toastSucesso : css.toastErro}`}>
                    {toast}
                </div>
            )}
        </>
    );
}
