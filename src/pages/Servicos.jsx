import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./Servicos.module.css";
import { useEffect, useState } from "react";
import Header from "../components/Header/Header.jsx";
import { Link } from "react-router-dom";
import { API_URL } from "../App.jsx";

export default function Servicos() {
    const [servicos, setServicos] = useState([]);
    const [busca, setBusca] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    const [modalAberto, setModalAberto] = useState(false);
    const [servicoEditando, setServicoEditando] = useState(null);
    const [descricaoEdit, setDescricaoEdit] = useState("");
    const [valorEdit, setValorEdit] = useState("");
    const [salvandoEdit, setSalvandoEdit] = useState(false);

    const [modalConfirmacao, setModalConfirmacao] = useState(false);
    const [servicoExcluir, setServicoExcluir] = useState(null);

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
                setMensagem(dados.mensagem || "Nenhum serviço encontrado.");
                return;
            }

            setServicos(dados.servicos || []);
        } catch (erro) {
            console.error(erro);
            setMensagem("Erro ao conectar com o servidor.");
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
                mostrarToast(dados.mensagem || "Erro ao editar serviço.", "erro");
                return;
            }

            mostrarToast(dados.mensagem || "Serviço atualizado com sucesso!", "sucesso");
            fecharModal();
            buscarServicos(busca);
        } catch (erro) {
            console.error(erro);
            mostrarToast("Erro ao conectar com o servidor.", "erro");
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
                mostrarToast(dados.mensagem || "Erro ao deletar serviço.", "erro");
                return;
            }

            mostrarToast(dados.mensagem || "Serviço deletado com sucesso!", "sucesso");
            fecharConfirmacao();
            buscarServicos(busca);
        } catch (erro) {
            console.error(erro);
            mostrarToast("Erro ao conectar com o servidor.", "erro");
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
                                ⊕ Novo Serviço
                            </Link>

                            <Link to="/atualizarvalores" className={css.botaoAzul}>
                                Atualização de Valores
                            </Link>
                        </div>
                    </div>

                    <div className={css.busca}>
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Procure um serviço..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
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
                                        Carregando serviços...
                                    </td>
                                </tr>
                            ) : servicos.length > 0 ? (
                                servicos.map((servico) => (
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
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                    %
                                                </span>
                                        </td>

                                        <td>
                                            <div className={css.acoes}>
                                                <button
                                                    type="button"
                                                    className={css.icone}
                                                    onClick={() => abrirModalEditar(servico)}
                                                >
                                                    ✎
                                                </button>

                                                <button
                                                    type="button"
                                                    className={css.icone}
                                                    onClick={() => abrirConfirmacao(servico)}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className={css.vazio}>
                                        {mensagem || "Nenhum serviço cadastrado."}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>
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

            {toast && (
                <div className={`${css.toast} ${tipoToast === "sucesso" ? css.toastSucesso : css.toastErro}`}>
                    {toast}
                </div>
            )}
        </>
    );
}