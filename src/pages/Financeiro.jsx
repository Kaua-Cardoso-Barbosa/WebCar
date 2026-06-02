import { useEffect, useState } from "react";
import { CircleDollarSign, Receipt } from "lucide-react";
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

export default function Financeiro() {
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
                throw new Error(data?.mensagem || "Nao foi possivel salvar o lancamento.");
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
            setErro(error.message || "Erro ao salvar lancamento.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header />
            <div className={styles.layout}>
                <SidebarMenu />

                <main className={styles.main}>
                    <div className={styles.topo}>
                        <span>Controle financeiro</span>
                        <h1>Receitas e despesas</h1>
                        <p>Cadastre lancamentos avulsos da operacao.</p>
                    </div>

                    <section className={styles.card}>
                        <div className={styles.cardTopo}>
                            <div>
                                <h2>Novo lancamento</h2>
                                <p>Escolha o tipo, informe a descricao, valor e data.</p>
                            </div>
                            <span className={styles.icone}>
                                {controle.tipo === "receita" ? <CircleDollarSign size={22} /> : <Receipt size={22} />}
                            </span>
                        </div>

                        <form className={styles.form} onSubmit={salvarControle}>
                            <div className={styles.tipo} aria-label="Tipo do lancamento">
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
                                    onChange={(event) => atualizarControle("valor", event.target.value)}
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

                    <section className={styles.tabelasGrid}>
                        <TabelaLancamentos
                            dados={receitas}
                            titulo="Receitas cadastradas"
                            vazio={carregando ? "Carregando receitas..." : "Nenhuma receita cadastrada."}
                            tipo="receita"
                        />
                        <TabelaLancamentos
                            dados={despesas}
                            titulo="Despesas cadastradas"
                            vazio={carregando ? "Carregando despesas..." : "Nenhuma despesa cadastrada."}
                            tipo="despesa"
                        />
                    </section>
                </main>
            </div>
        </>
    );
}

function TabelaLancamentos({ titulo, dados, vazio, tipo }) {
    return (
        <section className={styles.tabelaCard}>
            <div className={styles.secaoTopo}>
                <div>
                    <h2>{titulo}</h2>
                    <p>{dados.length} lancamento{dados.length === 1 ? "" : "s"} no historico geral</p>
                </div>
            </div>

            <div className={styles.tabelaWrap}>
                <table>
                    <thead>
                        <tr>
                            <th>Descricao</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Origem</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.length === 0 ? (
                            <tr>
                                <td className={styles.vazioTabela} colSpan={5}>
                                    {vazio}
                                </td>
                            </tr>
                        ) : dados.map((item) => (
                            <tr key={item.id_despesa || item.id_receita || item.id}>
                                <td className={styles.colDescricao} data-label="Descricao">{item.descricao || item.DESCRICAO || "-"}</td>
                                <td data-label="Valor" className={tipo === "receita" ? styles.valorReceita : styles.valorDespesa}>
                                    {formatarMoeda(item.valor)}
                                </td>
                                <td className={styles.colData} data-label="Data">{formatarData(item.data_despesa || item.data_receita || item.data)}</td>
                                <td className={styles.colOrigem} data-label="Origem">{item.tabela || "Avulsa"}</td>
                                <td className={styles.colStatus} data-label="Status">
                                    <span className={Number(item.status) === 1 ? styles.statusInativo : styles.statusAtivo}>
                                        {Number(item.status) === 1 ? "Estornada" : "Ativa"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
