import { useEffect, useState } from "react";
import { CircleDollarSign, Pencil, Receipt, Trash2 } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import Header from "../components/Header/Header.jsx";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import { API_URL } from "../App";
import styles from "./Financeiro.module.css";

function hojeInputData() {
    return new Date().toISOString().slice(0, 10);
}

function dataInputParaApi(valor) {
    if (!valor) return "";
    const [ano, mes, dia] = String(valor).split("-");
    if (!ano || !mes || !dia) return valor;
    return `${dia}/${mes}/${ano}`;
}

function dataParaInput(valor) {
    if (!valor) return hojeInputData();
    if (/^\d{4}-\d{2}-\d{2}/.test(String(valor))) return String(valor).slice(0, 10);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(valor))) {
        const [dia, mes, ano] = String(valor).split("/");
        return `${ano}-${mes}-${dia}`;
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return hojeInputData();

    return data.toISOString().slice(0, 10);
}

function timestampData(valor) {
    if (!valor) return 0;
    const texto = String(valor);

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
        const [dia, mes, ano] = texto.split("/");
        return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
    }

    const data = new Date(texto);
    return Number.isNaN(data.getTime()) ? 0 : data.getTime();
}

function numero(valor) {
    if (valor === null || valor === undefined || valor === "") return 0;
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    const limpo = String(valor).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const convertido = Number(limpo);
    return Number.isFinite(convertido) ? convertido : 0;
}

function formatarMoeda(valor) {
    return numero(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mascararMoedaInput(valor) {
    const apenasNumeros = String(valor || "").replace(/\D/g, "");
    if (!apenasNumeros) return "";

    return (Number(apenasNumeros) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatarMoedaEixo(valor) {
    const base = numero(valor);
    const absoluto = Math.abs(base);

    if (absoluto >= 1000000) {
        return `R$ ${(base / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
    }

    if (absoluto >= 1000) {
        return `R$ ${(base / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
    }

    return formatarMoeda(base);
}

function formatarData(valor) {
    if (!valor) return "-";
    if (/^\d{4}-\d{2}-\d{2}/.test(String(valor))) {
        const [ano, mes, dia] = String(valor).slice(0, 10).split("-");
        return `${dia}/${mes}/${ano}`;
    }

    const data = new Date(valor);

    if (!Number.isNaN(data.getTime())) {
        return data.toLocaleDateString("pt-BR");
    }

    return String(valor);
}

async function lerRespostaJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function buscarOpcional(endpoint, fallback) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: "GET",
            credentials: "include",
        });
        const data = await lerRespostaJson(response);

        return response.ok ? data || fallback : fallback;
    } catch {
        return fallback;
    }
}

function idLancamento(item) {
    return item.id_despesa || item.ID_DESPESA || item.id_receita || item.ID_RECEITA || item.id || item.ID;
}

function dataLancamento(item) {
    return item.data_despesa || item.DATA_DESPESA || item.data_receita || item.DATA_RECEITA || item.data;
}

function normalizarLancamentos(despesas, receitas) {
    return [
        ...receitas.map((item) => ({ ...item, tipoLancamento: "receita" })),
        ...despesas.map((item) => ({ ...item, tipoLancamento: "despesa" })),
    ].sort((a, b) => timestampData(dataLancamento(b)) - timestampData(dataLancamento(a)));
}

export default function Financeiro() {
    const ITENS_POR_PAGINA = 15;
    const [controle, setControle] = useState({
        tipo: "despesa",
        descricao: "",
        valor: "",
        data: hojeInputData(),
    });
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [despesas, setDespesas] = useState([]);
    const [receitas, setReceitas] = useState([]);
    const [financeiroMensal, setFinanceiroMensal] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [editando, setEditando] = useState(null);
    const [excluindo, setExcluindo] = useState(null);
    const [processandoAcao, setProcessandoAcao] = useState(false);

    async function carregarFinanceiro() {
        setCarregando(true);

        const [dadosDespesas, dadosReceitas, dadosGraficos] = await Promise.all([
            buscarOpcional("dashboard_despesas", { despesas: [] }),
            buscarOpcional("dashboard_receitas", { receitas: [] }),
            buscarOpcional("dashboard_graficos", {}),
        ]);

        setDespesas(Array.isArray(dadosDespesas.despesas) ? dadosDespesas.despesas : []);
        setReceitas(Array.isArray(dadosReceitas.receitas) ? dadosReceitas.receitas : []);
        setFinanceiroMensal(Array.isArray(dadosGraficos.financeiro_mensal) ? dadosGraficos.financeiro_mensal : []);
        setCarregando(false);
    }

    useEffect(() => {
        carregarFinanceiro();
    }, []);

    function atualizarControle(campo, valor) {
        setErro("");
        setMensagem("");
        setControle((atual) => ({
            ...atual,
            [campo]: valor,
        }));
    }

    function atualizarFiltroTipo(tipo) {
        setFiltroTipo(tipo);
        setPaginaAtual(1);
    }

    function abrirEdicao(item) {
        setErro("");
        setMensagem("");
        setEditando({
            id: idLancamento(item),
            tipo: item.tipoLancamento,
            descricao: item.descricao || item.DESCRICAO || "",
            valor: mascararMoedaInput(Math.round(numero(item.valor ?? item.VALOR) * 100)),
            data: dataParaInput(dataLancamento(item)),
        });
    }

    function fecharEdicao() {
        if (processandoAcao) return;
        setEditando(null);
    }

    function atualizarEdicao(campo, valor) {
        setEditando((atual) => ({
            ...atual,
            [campo]: valor,
        }));
    }

    function abrirExclusao(item) {
        setErro("");
        setMensagem("");
        setExcluindo({
            id: idLancamento(item),
            tipo: item.tipoLancamento,
            descricao: item.descricao || item.DESCRICAO || "lançamento",
        });
    }

    function fecharExclusao() {
        if (processandoAcao) return;
        setExcluindo(null);
    }

    async function salvarControle(event) {
        event.preventDefault();
        if (salvando) return;

        const valorControle = numero(controle.valor);
        const descricao = controle.descricao.trim();

        if (!descricao) {
            setErro("Informe uma descricao.");
            return;
        }

        if (!Number.isFinite(valorControle) || valorControle <= 0) {
            setErro("Informe um valor maior que zero.");
            return;
        }

        if (!controle.data) {
            setErro("Informe uma data.");
            return;
        }

        const ehReceita = controle.tipo === "receita";
        const endpoint = ehReceita ? "adicionar_receita" : "adicionar_despesa";
        const campoData = ehReceita ? "data_receita" : "data_despesa";

        try {
            setSalvando(true);
            setErro("");
            setMensagem("");

            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    descricao,
                    valor: valorControle,
                    [campoData]: dataInputParaApi(controle.data),
                }),
            });
            const data = await lerRespostaJson(response);

            if (!response.ok) {
                throw new Error(data?.mensagem || "Não foi possível salvar o lançamento.");
            }

            setMensagem(data?.mensagem || "Lancamento cadastrado com sucesso.");
            setControle((atual) => ({
                ...atual,
                descricao: "",
                valor: "",
                data: hojeInputData(),
            }));
            await carregarFinanceiro();
        } catch (error) {
            setErro(error.message || "Erro ao salvar lançamento.");
        } finally {
            setSalvando(false);
        }
    }

    async function salvarEdicao(event) {
        event.preventDefault();
        if (!editando || processandoAcao) return;

        const descricao = editando.descricao.trim();
        const valorEditado = numero(editando.valor);

        if (!descricao) {
            setErro("Informe uma descrição.");
            return;
        }

        if (!Number.isFinite(valorEditado) || valorEditado <= 0) {
            setErro("Informe um valor maior que zero.");
            return;
        }

        if (!editando.data) {
            setErro("Informe uma data.");
            return;
        }

        const ehReceita = editando.tipo === "receita";
        const endpoint = ehReceita ? `edicao_receita/${editando.id}` : `edicao_despesa/${editando.id}`;
        const campoData = ehReceita ? "data_receita" : "data_despesa";

        try {
            setProcessandoAcao(true);
            setErro("");
            setMensagem("");

            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    descricao,
                    valor: valorEditado,
                    [campoData]: dataInputParaApi(editando.data),
                }),
            });
            const data = await lerRespostaJson(response);

            if (!response.ok) {
                throw new Error(data?.mensagem || "Não foi possível editar o lançamento.");
            }

            setMensagem(data?.mensagem || "Lançamento editado com sucesso.");
            setEditando(null);
            await carregarFinanceiro();
        } catch (error) {
            setErro(error.message || "Erro ao editar lançamento.");
        } finally {
            setProcessandoAcao(false);
        }
    }

    async function confirmarExclusao() {
        if (!excluindo || processandoAcao) return;

        const endpoint = excluindo.tipo === "receita"
            ? `deletar_receita/${excluindo.id}`
            : `deletar_depesa/${excluindo.id}`;

        try {
            setProcessandoAcao(true);
            setErro("");
            setMensagem("");

            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await lerRespostaJson(response);

            if (!response.ok) {
                throw new Error(data?.mensagem || "Não foi possível deletar o lançamento.");
            }

            setMensagem(data?.mensagem || "Lançamento deletado com sucesso.");
            setExcluindo(null);
            await carregarFinanceiro();
        } catch (error) {
            setErro(error.message || "Erro ao deletar lançamento.");
        } finally {
            setProcessandoAcao(false);
        }
    }

    const lancamentos = normalizarLancamentos(despesas, receitas);
    const lancamentosFiltrados = lancamentos.filter((item) => (
        filtroTipo === "todos" || item.tipoLancamento === filtroTipo
    ));
    const totalPaginas = Math.max(1, Math.ceil(lancamentosFiltrados.length / ITENS_POR_PAGINA));
    const paginaSegura = Math.min(paginaAtual, totalPaginas);
    const inicioPagina = (paginaSegura - 1) * ITENS_POR_PAGINA;
    const lancamentosPaginados = lancamentosFiltrados.slice(inicioPagina, inicioPagina + ITENS_POR_PAGINA);

    return (
        <>
            <Header />
            <div className={styles.layout}>
                <SidebarMenu />

                <main className={styles.main}>
                    <div className={styles.topo}>
                        <span>Controle financeiro</span>
                        <h1>Receitas e despesas</h1>
                        <p>Cadastre lançamentos avulsos da operação.</p>
                    </div>

                    <section className={styles.card}>
                        <div className={styles.cardTopo}>
                            <div>
                                <h2>Novo lançamento</h2>
                                <p>Escolha o tipo, informe a descricao, valor e data.</p>
                            </div>
                            <span className={styles.icone}>
                                {controle.tipo === "receita" ? <CircleDollarSign size={22} /> : <Receipt size={22} />}
                            </span>
                        </div>

                        <form className={styles.form} onSubmit={salvarControle}>
                            <div className={styles.tipo} aria-label="Tipo do lançamento">
                                <button
                                    className={controle.tipo === "despesa" ? styles.tipoAtivo : ""}
                                    onClick={() => atualizarControle("tipo", "despesa")}
                                    type="button"
                                >
                                    Despesa
                                </button>
                                <button
                                    className={controle.tipo === "receita" ? styles.tipoAtivo : ""}
                                    onClick={() => atualizarControle("tipo", "receita")}
                                    type="button"
                                >
                                    Receita
                                </button>
                            </div>

                            <label>
                                Descricao
                                <input
                                    maxLength={120}
                                    onChange={(event) => atualizarControle("descricao", event.target.value)}
                                    placeholder="Ex: Aluguel da loja"
                                    type="text"
                                    value={controle.descricao}
                                />
                            </label>

                            <label>
                                Valor
                                <input
                                    inputMode="decimal"
                                    onChange={(event) => atualizarControle("valor", mascararMoedaInput(event.target.value))}
                                    placeholder="0,00"
                                    type="text"
                                    value={controle.valor}
                                />
                            </label>

                            <label>
                                Data
                                <input
                                    onChange={(event) => atualizarControle("data", event.target.value)}
                                    type="date"
                                    value={controle.data}
                                />
                            </label>

                            <button className={styles.submit} disabled={salvando} type="submit">
                                {salvando ? "Salvando..." : "Adicionar"}
                            </button>
                        </form>

                        {(erro || mensagem) && (
                            <p className={erro ? styles.erro : styles.sucesso}>
                                {erro || mensagem}
                            </p>
                        )}
                    </section>

                    <section className={styles.graficoCard}>
                        <div className={styles.secaoTopo}>
                            <div>
                                <h2>Fluxo financeiro mensal</h2>
                                <p>Receitas e despesas consideradas nos graficos gerenciais.</p>
                            </div>
                        </div>

                        <div className={styles.grafico}>
                            {financeiroMensal.length === 0 ? (
                                <p className={styles.vazio}>Nenhum dado financeiro encontrado.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financeiroMensal} margin={{ top: 12, right: 22, bottom: 8, left: 34 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="mes" tickMargin={10} />
                                        <YAxis width={82} tickMargin={8} tickFormatter={formatarMoedaEixo} />
                                        <Tooltip formatter={(valor) => formatarMoeda(valor)} />
                                        <Legend />
                                        <Bar dataKey="receita" fill="#2563eb" name="Receita" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="despesas" fill="#dc2626" name="Despesas" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <section className={styles.tabelaCard}>
                        <div className={styles.secaoTopo}>
                            <div>
                                <h2>Histórico financeiro</h2>
                                <p>
                                    {lancamentosFiltrados.length} lançamento
                                    {lancamentosFiltrados.length === 1 ? "" : "s"} encontrado
                                    {lancamentosFiltrados.length === 1 ? "" : "s"}
                                </p>
                            </div>
                            <div className={styles.filtrosTabela} aria-label="Filtrar lançamentos">
                                <button
                                    className={filtroTipo === "todos" ? styles.filtroAtivo : ""}
                                    onClick={() => atualizarFiltroTipo("todos")}
                                    type="button"
                                >
                                    Todos
                                </button>
                                <button
                                    className={filtroTipo === "receita" ? styles.filtroAtivo : ""}
                                    onClick={() => atualizarFiltroTipo("receita")}
                                    type="button"
                                >
                                    Receitas
                                </button>
                                <button
                                    className={filtroTipo === "despesa" ? styles.filtroAtivo : ""}
                                    onClick={() => atualizarFiltroTipo("despesa")}
                                    type="button"
                                >
                                    Despesas
                                </button>
                            </div>
                        </div>

                        <TabelaLancamentos
                            dados={lancamentosPaginados}
                            onEditar={abrirEdicao}
                            onExcluir={abrirExclusao}
                            vazio={carregando ? "Carregando lançamentos..." : "Nenhum lançamento encontrado."}
                        />

                        {lancamentosFiltrados.length > ITENS_POR_PAGINA && (
                            <div className={styles.paginacao}>
                                <span>
                                    Mostrando {inicioPagina + 1}-
                                    {Math.min(inicioPagina + ITENS_POR_PAGINA, lancamentosFiltrados.length)} de{" "}
                                    {lancamentosFiltrados.length}
                                </span>
                                <div>
                                    <button
                                        disabled={paginaSegura === 1}
                                        onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                                        type="button"
                                    >
                                        Anterior
                                    </button>
                                    <strong>{paginaSegura} de {totalPaginas}</strong>
                                    <button
                                        disabled={paginaSegura === totalPaginas}
                                        onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                                        type="button"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {editando && (
                        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="editar-financeiro">
                            <form className={styles.modalCard} onSubmit={salvarEdicao}>
                                <div className={styles.modalTopo}>
                                    <span>{editando.tipo === "receita" ? "Receita" : "Despesa"}</span>
                                    <h2 id="editar-financeiro">Editar lançamento</h2>
                                    <p>Atualize os dados e salve para refletir no financeiro.</p>
                                </div>

                                <label>
                                    Descrição
                                    <input
                                        maxLength={120}
                                        onChange={(event) => atualizarEdicao("descricao", event.target.value)}
                                        type="text"
                                        value={editando.descricao}
                                    />
                                </label>
                                <label>
                                    Valor
                                    <input
                                        inputMode="decimal"
                                        onChange={(event) => atualizarEdicao("valor", mascararMoedaInput(event.target.value))}
                                        placeholder="0,00"
                                        type="text"
                                        value={editando.valor}
                                    />
                                </label>
                                <label>
                                    Data
                                    <input
                                        onChange={(event) => atualizarEdicao("data", event.target.value)}
                                        type="date"
                                        value={editando.data}
                                    />
                                </label>

                                {erro && <p className={styles.erro}>{erro}</p>}

                                <div className={styles.modalAcoes}>
                                    <button className={styles.botaoSecundario} onClick={fecharEdicao} type="button">
                                        Cancelar
                                    </button>
                                    <button className={styles.botaoPrimario} disabled={processandoAcao} type="submit">
                                        {processandoAcao ? "Salvando..." : "Salvar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {excluindo && (
                        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="deletar-financeiro">
                            <div className={styles.modalCard}>
                                <div className={styles.modalTopo}>
                                    <span>{excluindo.tipo === "receita" ? "Receita" : "Despesa"}</span>
                                    <h2 id="deletar-financeiro">Deletar lançamento?</h2>
                                    <p>Essa ação remove "{excluindo.descricao}" do financeiro.</p>
                                </div>

                                {erro && <p className={styles.erro}>{erro}</p>}

                                <div className={styles.modalAcoes}>
                                    <button className={styles.botaoSecundario} onClick={fecharExclusao} type="button">
                                        Cancelar
                                    </button>
                                    <button className={styles.botaoPerigo} disabled={processandoAcao} onClick={confirmarExclusao} type="button">
                                        {processandoAcao ? "Deletando..." : "Deletar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

function TabelaLancamentos({ dados, vazio, onEditar, onExcluir }) {
    return (
        <div className={styles.tabelaWrap}>
                <table>
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Origem</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.length === 0 ? (
                            <tr>
                                <td className={styles.vazioTabela} colSpan={7}>
                                    {vazio}
                                </td>
                            </tr>
                        ) : dados.map((item) => {
                            const tipo = item.tipoLancamento;
                            const status = Number(item.status ?? item.STATUS);
                            const id = idLancamento(item);

                            return (
                                <tr key={`${tipo}-${id}`}>
                                    <td className={styles.colTipo} data-label="Tipo">
                                        <span className={tipo === "receita" ? styles.tipoReceita : styles.tipoDespesa}>
                                            {tipo === "receita" ? "Receita" : "Despesa"}
                                        </span>
                                    </td>
                                    <td className={styles.colDescricao} data-label="Descrição">
                                        {item.descricao || item.DESCRICAO || "-"}
                                    </td>
                                    <td data-label="Valor" className={tipo === "receita" ? styles.valorReceita : styles.valorDespesa}>
                                        {formatarMoeda(item.valor ?? item.VALOR)}
                                    </td>
                                    <td className={styles.colData} data-label="Data">{formatarData(dataLancamento(item))}</td>
                                    <td className={styles.colOrigem} data-label="Origem">{item.tabela || item.TABELA || "Avulsa"}</td>
                                    <td className={styles.colStatus} data-label="Status">
                                        <span className={status === 1 ? styles.statusInativo : styles.statusAtivo}>
                                            {status === 1 ? "Estornada" : "Ativa"}
                                        </span>
                                    </td>
                                    <td className={styles.colAcoes} data-label="Ações">
                                        <button
                                            aria-label="Editar lançamento"
                                            className={`${styles.acaoBotao} ${styles.acaoEditar}`}
                                            onClick={() => onEditar(item)}
                                            type="button"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            aria-label="Deletar lançamento"
                                            className={`${styles.acaoBotao} ${styles.acaoExcluir}`}
                                            onClick={() => onExcluir(item)}
                                            type="button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
        </div>
    );
}
