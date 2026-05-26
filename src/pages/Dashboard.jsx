import { Component, createElement, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    BarChart3,
    Banknote,
    Car,
    ClipboardList,
    CreditCard,
    DollarSign,
    FileWarning,
    Landmark,
    LineChart as LineChartIcon,
    Percent,
    Receipt,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
    Wrench,
    X,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import Header from "../components/Header/Header.jsx";
import { API_URL } from "../App";
import styles from "./Dashboard.module.css";

const CORES = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#475569"];

const CARD_CONFIGS = [
    { titulo: "Capital em estoque", chaves: ["capital_estoque", "capitalEmEstoque", "saldo_estoque"], formato: "moeda", icon: Wallet },
    { titulo: "Receita total gerencial", chaves: ["receita_total_gerencial", "receitaTotalGerencial", "receita_total"], formato: "moeda", icon: Landmark },
    { titulo: "Despesa total", chaves: ["despesa_total", "despesaTotal", "total_despesas"], formato: "moeda", icon: Receipt },
    { titulo: "Lucro líquido estimado", chaves: ["lucro_liquido_estimado", "lucroLiquidoEstimado", "lucro_liquido"], formato: "moeda", icon: TrendingUp },
    { titulo: "Lucro bruto de vendas", chaves: ["lucro_bruto_vendas", "lucroBrutoVendas", "lucro_bruto"], formato: "moeda", icon: DollarSign },
    { titulo: "Ticket médio", chaves: ["ticket_medio", "ticketMedio"], formato: "moeda", icon: CreditCard },
    { titulo: "Veículos em estoque", chaves: ["qtd_veiculos_estoque", "veiculos_estoque", "veiculosEmEstoque", "total_veiculos_estoque"], formato: "numero", icon: Car },
    { titulo: "Vendas", chaves: ["qtd_vendas", "vendas", "total_vendas", "quantidade_vendas"], formato: "numero", icon: ShoppingCart },
    { titulo: "Financiamentos", chaves: ["qtd_financiamentos", "financiamentos", "total_financiamentos", "quantidade_financiamentos"], formato: "numero", icon: Banknote },
    { titulo: "Parcelas atrasadas", chaves: ["qtd_parcelas_atrasadas", "parcelas_atrasadas", "parcelasAtrasadas"], formato: "numero", icon: AlertTriangle },
    { titulo: "Total a receber", chaves: ["total_a_receber_financiamento", "total_a_receber", "totalAReceber"], formato: "moeda", icon: ClipboardList },
    { titulo: "Inadimplência percentual", chaves: ["inadimplencia_percentual", "inadimplenciaPercentual", "percentual_inadimplencia"], formato: "percentual", icon: Percent },
];

const CHART_HEIGHT = 380;

const CATEGORIAS_GRAFICOS = [
    { id: "financeiro", label: "Financeiro", icon: LineChartIcon },
    { id: "veiculos", label: "Veículos", icon: Car },
    { id: "comercial", label: "Comercial", icon: ShoppingCart },
    { id: "operacao", label: "Operação", icon: Wrench },
];

const PERIODOS = [
    { id: "geral", label: "Geral" },
    { id: "diario", label: "Diário" },
    { id: "mensal", label: "Mensal" },
    { id: "semestral", label: "Semestral" },
    { id: "anual", label: "Anual" },
];

class ChartBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { falhou: false };
    }

    static getDerivedStateFromError() {
        return { falhou: true };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.falhou) {
            this.setState({ falhou: false });
        }
    }

    render() {
        if (this.state.falhou) {
            return <EmptyChart texto="Não foi possível renderizar este gráfico." />;
        }

        return this.props.children;
    }
}

function paraArray(valor) {
    if (Array.isArray(valor)) return valor;
    if (valor && typeof valor === "object") return Object.values(valor);
    return [];
}

function numero(valor) {
    if (valor === null || valor === undefined || valor === "") return 0;
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    const limpo = String(valor).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const convertido = Number(limpo);
    return Number.isFinite(convertido) ? convertido : 0;
}

function primeiroValor(objeto, chaves, fallback = 0) {
    for (const chave of chaves) {
        if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) return objeto[chave];
    }
    return fallback;
}

function valorPorPossiveisChaves(item, chaves) {
    return primeiroValor(item, chaves, 0);
}

function textoPorPossiveisChaves(item, chaves, fallback = "Sem identificação") {
    const valor = primeiroValor(item, chaves, fallback);
    return valor === "" || valor === null || valor === undefined ? fallback : String(valor);
}

function formatarMoeda(valor) {
    return numero(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarMoedaCompacta(valor) {
    const base = numero(valor);
    const absoluto = Math.abs(base);

    if (absoluto >= 1000000) {
        return `R$ ${(base / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
    }

    if (absoluto >= 1000) {
        return `R$ ${(base / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
    }

    return `R$ ${base.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function formatarNumero(valor) {
    return numero(valor).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function formatarNumeroCompacto(valor) {
    const base = numero(valor);
    const absoluto = Math.abs(base);

    if (absoluto >= 1000000) {
        return `${(base / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
    }

    if (absoluto >= 1000) {
        return `${(base / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
    }

    return formatarNumero(base);
}

function formatarPercentual(valor) {
    const base = numero(valor);
    const percentual = Math.abs(base) <= 1 && base !== 0 ? base * 100 : base;
    return `${percentual.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

function formatarData(valor) {
    if (!valor) return "-";
    if (/^\d{4}-\d{2}$/.test(String(valor))) {
        const [ano, mes] = String(valor).split("-");
        return `${mes}/${ano}`;
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return String(valor);
    return data.toLocaleDateString("pt-BR");
}

function formatarValor(valor, formato = "texto") {
    if (formato === "moeda") return formatarMoeda(valor);
    if (formato === "percentual") return formatarPercentual(valor);
    if (formato === "numero") return formatarNumero(valor);
    if (formato === "data") return formatarData(valor);
    return valor === null || valor === undefined || valor === "" ? "-" : String(valor);
}

function getCampo(objeto, nomes, fallback = "") {
    for (const nome of nomes) {
        if (objeto?.[nome] !== undefined && objeto?.[nome] !== null && objeto?.[nome] !== "") {
            return objeto[nome];
        }
    }

    return fallback;
}

function formatarFormaPagamento(valor) {
    const formas = {
        0: "À vista",
        1: "Financiado",
        2: "À vista",
        3: "À vista",
        4: "À vista",
    };

    return formas[Number(valor)] || formatarValor(valor);
}

function formatarCombustivel(valor) {
    const combustiveis = {
        0: "Gasolina",
        1: "Álcool",
        2: "Flex",
        3: "Diesel",
        4: "Elétrico",
        5: "Híbrido",
    };

    return combustiveis[Number(valor)] || formatarValor(valor);
}

function formatarCambio(valor) {
    const cambios = {
        0: "Manual",
        1: "Automático",
        2: "Automatizado",
        3: "CVT",
    };

    return cambios[Number(valor)] || formatarValor(valor);
}

function calcularDiasAteHoje(valor) {
    const data = dataValida(valor);
    if (!data) return null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    return Math.max(0, Math.floor((hoje - data) / 86400000));
}

function formatarDiasEstoque(valor, linha) {
    const diasCalculados = calcularDiasAteHoje(linha?.data_cadastro || linha?.DATA_CADASTRO);
    const dias = diasCalculados ?? numero(valor);
    return formatarNumero(dias);
}

function classeColunaTabela(coluna) {
    const nome = coluna.toLowerCase();
    if (nome.includes("data")) return styles.colunaData;
    if (nome.includes("nome") || nome.includes("cliente") || nome.includes("vendedor") || nome.includes("veiculo")) return styles.colunaNome;
    if (nome.includes("valor") || nome.includes("preco") || nome.includes("total") || nome.includes("lucro")) return styles.colunaValor;
    return "";
}

function formatarStatusVeiculo(valor) {
    const status = {
        0: "Em estoque",
        1: "Vendido",
        2: "Reservado",
        3: "Inativo",
    };

    return status[Number(valor)] || formatarValor(valor);
}

function formatarDocumentacao(valor) {
    const documentacao = {
        0: "Pendente",
        1: "Regularizada",
    };

    return documentacao[Number(valor)] || formatarValor(valor);
}

function formatarRotuloCurto(valor) {
    const texto = String(valor || "-");
    return texto.length > 18 ? `${texto.slice(0, 16)}...` : texto;
}

function formatarMesAno(valor) {
    if (/^\d{4}-\d{2}$/.test(String(valor))) return formatarData(valor);
    return String(valor || "-");
}

function formatarRotuloVeiculo(valor) {
    const texto = String(valor || "-").trim();
    const partes = texto.split(/\s+/);
    const principal = partes.length > 1 ? partes.slice(1).join(" ") : texto;
    return principal.length > 14 ? `${principal.slice(0, 12)}...` : principal;
}

function dataValida(valor) {
    if (!valor) return null;

    if (/^\d{4}-\d{2}$/.test(String(valor))) {
        const [ano, mes] = String(valor).split("-").map(Number);
        return new Date(ano, mes - 1, 1, 12);
    }

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
}

function inicioDoPeriodo(periodo) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    if (periodo === "diario") {
        const inicio = new Date(hoje);
        inicio.setHours(0, 0, 0, 0);
        return inicio;
    }

    if (periodo === "mensal") {
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    if (periodo === "semestral") {
        return new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
    }

    if (periodo === "anual") {
        return new Date(hoje.getFullYear(), 0, 1);
    }

    return null;
}

function itemNoPeriodo(item, periodo, chavesData) {
    if (periodo === "geral") return true;

    const inicio = inicioDoPeriodo(periodo);
    const fim = new Date();
    fim.setHours(23, 59, 59, 999);

    const data = chavesData
        .map((chave) => dataValida(item?.[chave]))
        .find(Boolean);

    if (!data || !inicio) return false;

    return data >= inicio && data <= fim;
}

function filtrarPeriodo(lista, periodo, chavesData) {
    return paraArray(lista).filter((item) => itemNoPeriodo(item, periodo, chavesData));
}

function somar(lista, chaves) {
    return paraArray(lista).reduce((total, item) => total + numero(valorPorPossiveisChaves(item, chaves)), 0);
}

function principaisCompraVenda(lista, limite = 12) {
    return [...paraArray(lista)]
        .sort((a, b) => Math.max(b.venda, b.compra) - Math.max(a.venda, a.compra))
        .slice(0, limite);
}

function calcularResumoPeriodo(resumo, periodo, vendas, financiamentos, veiculos, financeiroMensal) {
    if (periodo === "geral") return resumo;

    const qtdVendas = vendas.length;
    const receitaVendas = somar(vendas, ["valor_venda", "VALOR_VENDA"]);
    const lucroBruto = somar(vendas, ["lucro_bruto", "lucro"]);
    const despesaTotal = somar(financeiroMensal, ["despesa", "despesas", "despesa_total"]);
    const receitaExtra = somar(financeiroMensal, ["receita_extra"]);
    const veiculosEstoque = veiculos.filter((item) => Number(item?.status ?? item?.STATUS) === 0);
    const capitalEstoque = somar(veiculosEstoque, ["preco_custo", "PRECO_CUSTO"]);

    return {
        ...resumo,
        qtd_vendas: qtdVendas,
        receita_vendas: receitaVendas,
        receita_total_gerencial: receitaVendas + receitaExtra,
        despesa_total: despesaTotal,
        lucro_bruto_vendas: lucroBruto,
        lucro_liquido_estimado: lucroBruto + receitaExtra - despesaTotal,
        ticket_medio: qtdVendas > 0 ? receitaVendas / qtdVendas : 0,
        qtd_financiamentos: financiamentos.length,
        qtd_veiculos_estoque: veiculosEstoque.length,
        capital_estoque: capitalEstoque,
    };
}

function obterParcelasDetalhadas(dados, somenteAtrasadas = false) {
    const parcelasDiretas = [
        dados?.relatorios?.parcelas,
        dados?.relatorios?.parcelas_financiamento,
        dados?.relatorios?.itens_financiamento,
        dados?.relatorios?.parcelas_atrasadas,
    ].find((item) => Array.isArray(item));

    const parcelas = parcelasDiretas
        ? parcelasDiretas
        : paraArray(dados?.relatorios?.financiamentos).flatMap((financiamento) => {
            const listaParcelas = financiamento?.parcelas || financiamento?.itens || financiamento?.parcelas_financiamento || [];

            return paraArray(listaParcelas).map((parcela) => ({
                cliente: parcela.cliente || financiamento.cliente || financiamento.usuario || financiamento.nome_usuario,
                id_financiamento: parcela.id_financiamento || financiamento.id_financiamento,
                veiculo: parcela.veiculo || financiamento.veiculo,
                ...parcela,
            }));
        });

    if (!somenteAtrasadas) return parcelas;

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    return parcelas.filter((item) => {
        const status = String(item?.status || item?.situacao || "").toLowerCase();
        const dataVencimento = dataValida(item?.data_vencimento || item?.vencimento || item?.DATA_VENCIMENTO);

        if (status.includes("atras")) return true;
        if (Number(item?.status) === 0 && dataVencimento && dataVencimento < hoje) return true;

        return false;
    });
}

function normalizarCompraUsuario(compra, usuario) {
    const parcelas = getCampo(compra, ["parcelas", "PARCELAS", "itens_financiamento", "ITENS_FINANCIAMENTO"], []);

    return {
        cliente: usuario?.nome || usuario?.NOME || getCampo(compra, ["cliente", "CLIENTE"], "Cliente"),
        id_usuario: usuario?.id_usuario || usuario?.ID_USUARIO,
        id_venda: getCampo(compra, ["id_venda", "ID_VENDA"]),
        id_financiamento: getCampo(compra, ["id_financiamento", "ID_FINANCIAMENTO"]),
        veiculo: `${getCampo(compra, ["marca", "MARCA"], "")} ${getCampo(compra, ["modelo", "MODELO"], "")}`.trim(),
        data_venda: getCampo(compra, ["data_venda", "DATA_VENDA"]),
        valor_venda: Number(getCampo(compra, ["valor_venda", "VALOR_VENDA"], 0)),
        valor_financiado: Number(getCampo(compra, ["valor_financiado", "VALOR_FINANCIADO", "valor_venda_financiamento", "VALOR_VENDA_FINANCIAMENTO"], 0)),
        forma_pagamento: getCampo(compra, ["forma_pagamento", "FORMA_PAGAMENTO"], 0),
        parcelas: Array.isArray(parcelas) ? parcelas : [],
    };
}

function normalizarParcelasCompra(compra) {
    return compra.parcelas.map((parcela) => ({
        cliente: compra.cliente,
        veiculo: compra.veiculo,
        id_financiamento: compra.id_financiamento,
        numero_parcela: getCampo(parcela, ["numero_parcela", "NUMERO_PARCELA"]),
        valor_parcela: Number(getCampo(parcela, ["valor_parcela", "VALOR_PARCELA"], 0)),
        data_vencimento: getCampo(parcela, ["data_vencimento", "DATA_VENCIMENTO"]),
        data_pagamento: getCampo(parcela, ["data_pagamento", "DATA_PAGAMENTO"]),
        status_parcela: Number(getCampo(parcela, ["status", "STATUS"], 0)),
    }));
}

function parcelaEstaAtrasada(parcela) {
    const dataVencimento = dataValida(parcela.data_vencimento);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    return Number(parcela.status_parcela) !== 1 && dataVencimento && dataVencimento < hoje;
}

function normalizarFinanceiroMensal(lista) {
    return paraArray(lista).map((item) => ({
        mes: formatarMesAno(textoPorPossiveisChaves(item, ["mes", "MES", "periodo", "data"], "Mês")),
        receita: numero(valorPorPossiveisChaves(item, ["receita", "RECEITA", "receita_total", "total_receita"])),
        despesas: numero(valorPorPossiveisChaves(item, ["despesas", "DESPESAS", "despesa", "despesa_total", "total_despesas"])),
        lucro: numero(valorPorPossiveisChaves(item, ["lucro", "LUCRO", "lucro_liquido", "lucro_estimado"])),
    }));
}

function normalizarSerie(lista, labelKeys, valueKeys, valueName = "valor") {
    return paraArray(lista).map((item) => ({
        nome: formatarMesAno(textoPorPossiveisChaves(item, labelKeys)),
        [valueName]: numero(valorPorPossiveisChaves(item, valueKeys)),
    }));
}

function itemDocumentacaoPendente(item) {
    const statusBruto = getCampo(item, ["documentacao", "DOCUMENTACAO", "status", "STATUS", "situacao", "SITUACAO", "nome", "tipo"], "");
    const statusNumerico = Number(statusBruto);

    if (Number.isFinite(statusNumerico) && String(statusBruto).trim() !== "") {
        return statusNumerico === 0;
    }

    const textoStatus = String(statusBruto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (["paga", "pago", "regularizada", "regularizado", "concluida", "concluido", "ok"].includes(textoStatus)) {
        return false;
    }

    if (textoStatus === "pendente" || textoStatus.includes("venc") || textoStatus.includes("atras")) {
        return true;
    }

    return !textoStatus.includes("regular") && !textoStatus.includes("pag");
}

function normalizarDocumentacaoPendente(lista) {
    return paraArray(lista)
        .filter(itemDocumentacaoPendente)
        .map((item) => ({
            nome: "Pendente",
            valor: numero(valorPorPossiveisChaves(item, ["quantidade", "capital", "total", "valor"])),
        }))
        .filter((item) => item.valor > 0);
}

function normalizarVendasPorPagamento(lista) {
    const grupos = {
        vista: { nome: "À vista", valor: 0 },
        financiado: { nome: "Financiado", valor: 0 },
    };

    paraArray(lista).forEach((item) => {
        const forma = item?.forma_pagamento;
        const nome = textoPorPossiveisChaves(item, ["nome", "forma", "pagamento"], "").toLowerCase();
        const valor = numero(valorPorPossiveisChaves(item, ["valor_total", "quantidade", "total", "valor"]));
        const chave = Number(forma) === 1 || nome.includes("financi") ? "financiado" : "vista";

        grupos[chave].valor += valor;
    });

    return Object.values(grupos).filter((item) => item.valor > 0);
}

function normalizarParcelasStatus(lista) {
    return paraArray(lista).map((item) => ({
        nome: textoPorPossiveisChaves(item, ["status", "situacao", "nome"], "Status"),
        valor: numero(valorPorPossiveisChaves(item, ["valor", "total"])),
        quantidade: numero(valorPorPossiveisChaves(item, ["quantidade", "qtd"])),
    }));
}

function normalizarCompraVenda(lista) {
    return paraArray(lista).map((item) => ({
        nome: textoPorPossiveisChaves(item, ["veiculo", "modelo", "nome", "placa"], "Veículo"),
        compra: numero(valorPorPossiveisChaves(item, ["preco_custo", "compra", "valor_compra", "preco_compra"])),
        venda: numero(valorPorPossiveisChaves(item, ["preco_venda", "venda", "valor_venda"])),
    }));
}

function normalizarPrecificacao(lista) {
    return paraArray(lista).map((item) => ({
        nome: textoPorPossiveisChaves(item, ["veiculo", "modelo", "nome", "placa"], "Veículo"),
        recomendado: numero(valorPorPossiveisChaves(item, ["preco_recomendado", "recomendado", "valor_recomendado"])),
        cadastrado: numero(valorPorPossiveisChaves(item, ["preco_cadastrado", "cadastrado", "valor_cadastrado", "preco"])),
    }));
}

function mensagemErroHttp(status, corpo) {
    const mensagem = corpo?.mensagem || corpo?.message || corpo?.erro || corpo?.error;
    if (mensagem) return `${mensagem} (${status})`;
    return `Não foi possível carregar os dados gerenciais. Código ${status}.`;
}

async function lerRespostaJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function formatarTooltip(valor, nome) {
    const nomeString = String(nome).toLowerCase();
    const formato = nomeString.includes("percent") || nomeString.includes("margem") ? "percentual" : "moeda";
    return [formatarValor(valor, formato), nome];
}

function EmptyChart({ texto = "Sem dados para este gráfico." }) {
    return (
        <div className={styles.emptyChart}>
            <BarChart3 size={28} />
            <span>{texto}</span>
        </div>
    );
}

function ChartCard({ titulo, subtitulo, icon = BarChart3, children, cheio = false }) {
    return (
        <section className={`${styles.chartCard} ${cheio ? styles.chartCardWide : ""}`}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2>{titulo}</h2>
                    {subtitulo && <p>{subtitulo}</p>}
                </div>
                <span className={styles.sectionIcon}>{createElement(icon, { size: 20 })}</span>
            </div>
            <ChartBoundary resetKey={titulo}>{children}</ChartBoundary>
        </section>
    );
}

function TabelaRelatorio({ titulo, dados, limiteColunas = 8 }) {
    const linhas = paraArray(dados);
    const colunas = useMemo(() => {
        const primeiraLinha = linhas.find((linha) => linha && typeof linha === "object");
        return primeiraLinha ? Object.keys(primeiraLinha).slice(0, limiteColunas) : [];
    }, [linhas, limiteColunas]);

    return (
        <section className={styles.tableCard}>
            <div className={styles.tableTitle}>
                <h3>{titulo}</h3>
                <span>{formatarNumero(linhas.length)} registros</span>
            </div>
            {linhas.length === 0 || colunas.length === 0 ? (
                <div className={styles.emptyTable}>Nenhum registro encontrado.</div>
            ) : (
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                {colunas.map((coluna) => (
                                    <th className={classeColunaTabela(coluna)} key={coluna}>{coluna.replaceAll("_", " ")}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {linhas.slice(0, 10).map((linha, index) => (
                                <tr key={`${titulo}-${index}`}>
                                    {colunas.map((coluna) => (
                                        <td className={classeColunaTabela(coluna)} key={coluna}>{formatarCampoTabela(coluna, linha[coluna], linha)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function ResumoDetalheCard({ itens }) {
    const dados = paraArray(itens).filter(Boolean);

    if (dados.length === 0) return null;

    return (
        <div className={styles.modalResumoGrid}>
            {dados.map((item) => (
                <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{formatarValor(item.valor, item.formato)}</strong>
                </div>
            ))}
        </div>
    );
}

function formatarCampoTabela(coluna, valor, linha = {}) {
    const nome = coluna.toLowerCase();
    if (nome.includes("data")) return formatarData(valor);
    if (nome === "dias_estoque") return formatarDiasEstoque(valor, linha);
    if (nome === "forma_pagamento") return formatarFormaPagamento(valor);
    if (nome === "combustivel") return formatarCombustivel(valor);
    if (nome === "cambio") return formatarCambio(valor);
    if (nome === "status_parcela") return Number(valor) === 1 ? "Paga" : "Em aberto";
    if (nome === "status") return formatarStatusVeiculo(valor);
    if (nome === "documentacao") return formatarDocumentacao(valor);
    if (nome.includes("valor") || nome.includes("preco") || nome.includes("total") || nome.includes("lucro")) return formatarMoeda(valor);
    if (nome.includes("percent") || nome.includes("margem")) return formatarPercentual(valor);
    return formatarValor(valor);
}

export default function Dashboard() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [categoriaAtiva, setCategoriaAtiva] = useState("financeiro");
    const [periodoAtivo, setPeriodoAtivo] = useState("geral");
    const [modalGerencial, setModalGerencial] = useState(null);
    const [carregandoModal, setCarregandoModal] = useState(false);
    const [erroModal, setErroModal] = useState("");
    const [detalhesModal, setDetalhesModal] = useState({ financiamentos: [], parcelasAtrasadas: [] });

    useEffect(() => {
        let ativo = true;

        async function carregarDashboard() {
            try {
                setCarregando(true);
                setErro("");

                const response = await fetch(`${API_URL}/graficos_adm`, {
                    method: "GET",
                    credentials: "include",
                });

                const resposta = await lerRespostaJson(response);

                if (!response.ok) {
                    throw new Error(mensagemErroHttp(response.status, resposta));
                }

                const payload = resposta?.dados || resposta?.data || resposta;
                if (ativo) setDados(payload || {});
            } catch (error) {
                if (ativo) setErro(error.message || "Erro ao carregar a dashboard.");
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarDashboard();

        return () => {
            ativo = false;
        };
    }, []);

    useEffect(() => {
        if (!modalGerencial) return;
        if (!["qtd_financiamentos", "qtd_parcelas_atrasadas"].includes(modalGerencial)) {
            setCarregandoModal(false);
            setErroModal("");
            return;
        }

        let ativo = true;

        async function carregarDetalhesModal() {
            try {
                setCarregandoModal(true);
                setErroModal("");

                const responseUsuarios = await fetch(`${API_URL}/buscar_usuario`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({}),
                });

                const dataUsuarios = await lerRespostaJson(responseUsuarios);

                if (!responseUsuarios.ok) {
                    throw new Error(dataUsuarios?.mensagem || "Não foi possível carregar os usuários.");
                }

                const clientes = paraArray(dataUsuarios?.usuarios)
                    .filter((usuario) => Number(usuario.tipo ?? usuario.TIPO) === 2);

                const comprasPorCliente = await Promise.all(
                    clientes.map(async (usuario) => {
                        const idUsuario = usuario.id_usuario || usuario.ID_USUARIO;
                        if (!idUsuario) return [];

                        const responseCompras = await fetch(`${API_URL}/minhas_compras?id_usuario=${idUsuario}`, {
                            method: "GET",
                            credentials: "include",
                        });

                        const dataCompras = await lerRespostaJson(responseCompras);

                        if (!responseCompras.ok) return [];

                        return paraArray(dataCompras?.compras || dataCompras?.vendas || dataCompras)
                            .map((compra) => normalizarCompraUsuario(compra, usuario))
                            .filter((compra) => Number(compra.forma_pagamento) === 1 || compra.id_financiamento);
                    })
                );

                const financiamentos = comprasPorCliente.flat();
                const parcelas = financiamentos.flatMap(normalizarParcelasCompra);

                if (ativo) {
                    setDetalhesModal({
                        financiamentos,
                        parcelasAtrasadas: parcelas.filter(parcelaEstaAtrasada),
                    });
                }
            } catch (error) {
                if (ativo) {
                    setErroModal(error.message || "Não foi possível carregar os detalhes.");
                    setDetalhesModal({ financiamentos: [], parcelasAtrasadas: [] });
                }
            } finally {
                if (ativo) setCarregandoModal(false);
            }
        }

        carregarDetalhesModal();

        return () => {
            ativo = false;
        };
    }, [modalGerencial]);

    const resumo = dados?.resumo || {};
    const graficos = dados?.graficos || {};
    const relatorios = dados?.relatorios || {};

    const vendasPeriodo = filtrarPeriodo(relatorios.vendas, periodoAtivo, ["data_venda", "DATA_VENDA"]);
    const financiamentosPeriodo = filtrarPeriodo(relatorios.financiamentos, periodoAtivo, ["data_financiamento", "DATA_FINANCIAMENTO"]);
    const veiculosPeriodo = filtrarPeriodo(relatorios.veiculos, periodoAtivo, ["data_cadastro", "DATA_CADASTRO"]);
    const financeiroMensalBase = filtrarPeriodo(graficos.financeiro_mensal, periodoAtivo, ["mes"]);
    const fluxoRecebimentosBase = filtrarPeriodo(graficos.fluxo_recebimentos, periodoAtivo, ["mes", "data", "periodo", "vencimento"]);
    const compraVendaBase = periodoAtivo === "geral" ? graficos.compra_venda_veiculo : veiculosPeriodo;
    const topLucroBase = periodoAtivo === "geral" ? graficos.margem_veiculos_top_lucro : veiculosPeriodo;
    const topMargemBase = periodoAtivo === "geral" ? graficos.margem_veiculos_top_percentual : veiculosPeriodo;

    const resumoFiltrado = calcularResumoPeriodo(
        resumo,
        periodoAtivo,
        vendasPeriodo,
        financiamentosPeriodo,
        veiculosPeriodo,
        financeiroMensalBase
    );

    const financeiroMensal = normalizarFinanceiroMensal(financeiroMensalBase);
    const fluxoRecebimentos = normalizarSerie(fluxoRecebimentosBase, ["mes", "data", "periodo", "vencimento"], ["valor_a_receber", "valor", "total", "total_receber"]);
    const compraVenda = normalizarCompraVenda(compraVendaBase);
    const compraVendaPrincipais = principaisCompraVenda(compraVenda);
    const topLucro = normalizarSerie(topLucroBase, ["nome", "veiculo", "modelo", "placa"], ["margem_valor", "lucro_bruto", "lucro", "valor"]);
    const topMargem = normalizarSerie(topMargemBase, ["nome", "veiculo", "modelo", "placa"], ["margem_percentual", "percentual", "margem"], "percentual");
    const precificacao = normalizarPrecificacao(periodoAtivo === "geral" ? graficos.precificacao_recomendada : veiculosPeriodo);
    const estoqueParado = normalizarSerie(graficos.estoque_parado, ["faixa", "tempo", "periodo", "nome"], ["quantidade", "total", "valor"]);
    const analiseMarcas = normalizarSerie(graficos.analise_marcas, ["marca", "nome"], ["qtd_estoque", "qtd_total", "quantidade", "total", "vendas", "valor"]);
    const vendasPagamento = normalizarVendasPorPagamento(graficos.vendas_por_forma_pagamento);
    const vendedores = normalizarSerie(graficos.performance_vendedores, ["vendedor", "nome"], ["lucro_bruto", "receita_vendas", "quantidade_vendas", "vendas", "quantidade", "total", "valor"]);
    const lucroReal = normalizarSerie(graficos.lucro_real_veiculos, ["nome", "veiculo", "modelo", "placa"], ["lucro_real", "lucro", "valor"]);
    const parcelasStatus = normalizarParcelasStatus(graficos.parcelas_status);
    const documentacao = normalizarDocumentacaoPendente(graficos.documentacao);
    const curvaAbc = normalizarSerie(graficos.curva_abc, ["nome", "classe", "curva"], ["preco_custo", "participacao_percentual", "quantidade", "total", "valor"]);
    const manutencaoVeiculo = normalizarSerie(graficos.manutencao_por_veiculo, ["nome", "veiculo", "modelo", "placa"], ["total_manutencao", "valor", "total", "custo"]);
    const servicosUsados = normalizarSerie(graficos.servicos_mais_usados, ["servico", "nome", "descricao"], ["quantidade", "total", "valor"])
        .filter((item) => item.valor > 0);
    const parcelasDetalhadas = detalhesModal.parcelasAtrasadas.length > 0
        ? detalhesModal.parcelasAtrasadas
        : obterParcelasDetalhadas(dados, modalGerencial === "parcelas_atrasadas");
    const financiamentosDetalhados = detalhesModal.financiamentos.length > 0
        ? detalhesModal.financiamentos
        : paraArray(relatorios.financiamentos);
    const cardSelecionado = CARD_CONFIGS.find((config) => config.chaves[0] === modalGerencial);
    const valorCardSelecionado = cardSelecionado ? primeiroValor(resumoFiltrado, cardSelecionado.chaves) : 0;
    const parcelasAtrasadasPorCliente = Object.values(parcelasDetalhadas.reduce((acumulador, parcela) => {
        const nome = textoPorPossiveisChaves(parcela, ["cliente", "usuario", "nome_usuario"], "Cliente");
        const valor = numero(valorPorPossiveisChaves(parcela, ["valor_parcela", "valor", "total"]));

        if (!acumulador[nome]) acumulador[nome] = { nome, valor: 0 };
        acumulador[nome].valor += valor || 1;

        return acumulador;
    }, {})).slice(0, 12);
    const detalheCard = cardSelecionado ? {
        capital_estoque: {
            titulo: "Capital em estoque",
            descricao: "Valor parado nos carros disponiveis e principais grupos do estoque.",
            resumo: [
                { label: "Capital", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Carros", valor: veiculosPeriodo.length, formato: "numero" },
            ],
            tabelaTitulo: "Carros em estoque",
            tabelaDados: veiculosPeriodo,
        },
        receita_total_gerencial: {
            titulo: "Receita total gerencial",
            descricao: "Receita, despesa e lucro no periodo selecionado.",
            resumo: [
                { label: "Receita", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Vendas", valor: vendasPeriodo.length, formato: "numero" },
            ],
            tabelaTitulo: "Vendas consideradas",
            tabelaDados: vendasPeriodo,
        },
        despesa_total: {
            titulo: "Despesa total",
            descricao: "Evolucao das despesas registradas na operacao.",
            resumo: [
                { label: "Despesas", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Meses", valor: financeiroMensal.length, formato: "numero" },
            ],
            tabelaTitulo: "Financeiro mensal",
            tabelaDados: financeiroMensalBase,
        },
        lucro_liquido_estimado: {
            titulo: "Lucro liquido estimado",
            descricao: "Resultado estimado juntando vendas, receitas extras e despesas.",
            resumo: [
                { label: "Lucro estimado", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Ticket medio", valor: primeiroValor(resumoFiltrado, ["ticket_medio", "ticketMedio"]), formato: "moeda" },
            ],
            tabelaTitulo: "Financeiro mensal",
            tabelaDados: financeiroMensalBase,
        },
        lucro_bruto_vendas: {
            titulo: "Lucro bruto de vendas",
            descricao: "Vendas e carros com maior contribuicao de lucro.",
            resumo: [
                { label: "Lucro bruto", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Vendas", valor: vendasPeriodo.length, formato: "numero" },
            ],
            tabelaTitulo: "Vendas do periodo",
            tabelaDados: vendasPeriodo,
        },
        ticket_medio: {
            titulo: "Ticket medio",
            descricao: "Valores das vendas que formam o ticket medio.",
            resumo: [
                { label: "Ticket medio", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Total vendido", valor: somar(vendasPeriodo, ["valor_venda", "VALOR_VENDA"]), formato: "moeda" },
            ],
            tabelaTitulo: "Vendas usadas no calculo",
            tabelaDados: vendasPeriodo,
        },
        qtd_veiculos_estoque: {
            titulo: "Carros em estoque",
            descricao: "Distribuicao por marca e lista de carros no estoque.",
            resumo: [
                { label: "Em estoque", valor: valorCardSelecionado, formato: "numero" },
                { label: "Capital", valor: primeiroValor(resumoFiltrado, ["capital_estoque", "capitalEmEstoque"]), formato: "moeda" },
            ],
            tabelaTitulo: "Carros",
            tabelaDados: veiculosPeriodo,
        },
        qtd_vendas: {
            titulo: "Vendas",
            descricao: "Volume de vendas por pagamento e detalhamento operacional.",
            resumo: [
                { label: "Vendas", valor: valorCardSelecionado, formato: "numero" },
                { label: "Receita", valor: somar(vendasPeriodo, ["valor_venda", "VALOR_VENDA"]), formato: "moeda" },
            ],
            tabelaTitulo: "Vendas",
            tabelaDados: vendasPeriodo,
        },
        qtd_financiamentos: {
            titulo: "Financiamentos",
            descricao: "Contratos financiados, valores em aberto e situacao das parcelas.",
            resumo: [
                { label: "Financiamentos", valor: valorCardSelecionado, formato: "numero" },
                { label: "A receber", valor: primeiroValor(resumoFiltrado, ["total_a_receber_financiamento", "total_a_receber", "totalAReceber"]), formato: "moeda" },
            ],
            tabelaTitulo: "Detalhes dos financiamentos",
            tabelaDados: financiamentosDetalhados,
        },
        qtd_parcelas_atrasadas: {
            titulo: "Parcelas atrasadas",
            descricao: "Clientes com parcelas vencidas e valores pendentes.",
            resumo: [
                { label: "Atrasadas", valor: valorCardSelecionado, formato: "numero" },
                { label: "Clientes", valor: parcelasAtrasadasPorCliente.length, formato: "numero" },
            ],
            tabelaTitulo: "Detalhes das parcelas",
            tabelaDados: parcelasDetalhadas,
        },
        total_a_receber_financiamento: {
            titulo: "Total a receber",
            descricao: "Fluxo previsto de recebimentos por periodo.",
            resumo: [
                { label: "A receber", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Parcelas em aberto", valor: primeiroValor(resumoFiltrado, ["qtd_parcelas_atrasadas", "parcelas_atrasadas", "parcelasAtrasadas"]), formato: "numero" },
            ],
            tabelaTitulo: "Fluxo de recebimentos",
            tabelaDados: fluxoRecebimentosBase,
        },
        inadimplencia_percentual: {
            titulo: "Inadimplencia percentual",
            descricao: "Comparativo entre parcelas pagas, abertas e atrasadas.",
            resumo: [
                { label: "Inadimplencia", valor: valorCardSelecionado, formato: "percentual" },
                { label: "Atrasadas", valor: primeiroValor(resumoFiltrado, ["qtd_parcelas_atrasadas", "parcelas_atrasadas", "parcelasAtrasadas"]), formato: "numero" },
            ],
            tabelaTitulo: "Parcelas detalhadas",
            tabelaDados: obterParcelasDetalhadas(dados),
        },
    }[cardSelecionado.chaves[0]] : null;

    return (
        <>
            <Header />
            <div className="container-fluid p-0">
                <div className="d-flex flex-column flex-md-row">
                    <SidebarMenu />
                    <main className={styles.dashboard}>
                        <div className={styles.hero}>
                            <div>
                                <span>Painel administrativo</span>
                                <h1>Dashboard gerencial</h1>
                                <p>Indicadores financeiros, estoque, vendas, financiamento e operação em tempo real.</p>
                            </div>
                        </div>

                        {carregando && (
                            <div className={styles.stateBox}>
                                <span className={styles.loader} />
                                <strong>Carregando dashboard ADM...</strong>
                            </div>
                        )}

                        {!carregando && erro && (
                            <div className={styles.errorBox}>
                                <FileWarning size={22} />
                                <div>
                                    <strong>Erro ao buscar dados</strong>
                                    <p>{erro}</p>
                                </div>
                            </div>
                        )}

                        {!carregando && !erro && !dados && (
                            <div className={styles.stateBox}>
                                <strong>Nenhum dado encontrado para montar a dashboard.</strong>
                            </div>
                        )}

                        {!carregando && !erro && dados && (
                            <>
                                <section className={styles.cardsGrid}>
                                    {CARD_CONFIGS.map(({ titulo, chaves, formato, icon }) => {
                                        const tipoModal = chaves[0];
                                        return (
                                        <article
                                            className={`${styles.metricCard} ${styles.metricCardClickable}`}
                                            key={titulo}
                                            onClick={() => setModalGerencial(tipoModal)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    setModalGerencial(tipoModal);
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className={styles.metricTop}>
                                                <span>{titulo}</span>
                                                {createElement(icon, { size: 20 })}
                                            </div>
                                            <strong>{formatarValor(primeiroValor(resumoFiltrado, chaves), formato)}</strong>
                                        </article>
                                        );
                                    })}
                                </section>

                                <section className={styles.periodPanel}>
                                    <div>
                                        <h2>Período de análise</h2>
                                        <p>Recorte atual dos indicadores gerenciais.</p>
                                    </div>
                                    <div className={styles.periodControls} aria-label="Filtro de período">
                                        {PERIODOS.map((periodo) => (
                                            <button
                                                className={`${styles.periodButton} ${periodoAtivo === periodo.id ? styles.periodButtonActive : ""}`}
                                                key={periodo.id}
                                                onClick={() => setPeriodoAtivo(periodo.id)}
                                                type="button"
                                            >
                                                {periodo.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section className={styles.chartControls} aria-label="Categorias de gráficos">
                                    {CATEGORIAS_GRAFICOS.map(({ id, label, icon }) => (
                                        <button
                                            className={`${styles.chartTab} ${categoriaAtiva === id ? styles.chartTabActive : ""}`}
                                            key={id}
                                            onClick={() => setCategoriaAtiva(id)}
                                            type="button"
                                        >
                                            {createElement(icon, { size: 18 })}
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </section>

                                <div className={styles.chartsGrid}>
                                    {categoriaAtiva === "financeiro" && (
                                        <>
                                    <ChartCard titulo="Receita, despesas e lucro por mês" subtitulo="Comparativo financeiro mensal" icon={LineChartIcon} cheio>
                                        {financeiroMensal.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <ComposedChart data={financeiroMensal}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="mes" tickMargin={10} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={formatarTooltip} />
                                                    <Legend />
                                                    <Bar dataKey="receita" fill="#2563eb" name="Receita" radius={[6, 6, 0, 0]} />
                                                    <Bar dataKey="despesas" fill="#dc2626" name="Despesas" radius={[6, 6, 0, 0]} />
                                                    <Line dataKey="lucro" stroke="#16a34a" name="Lucro" strokeWidth={3} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Fluxo futuro de recebimentos" subtitulo="Valores previstos por período" icon={Wallet}>
                                        {fluxoRecebimentos.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <AreaChart data={fluxoRecebimentos}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickMargin={10} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "A receber"]} />
                                                    <Area dataKey="valor" stroke="#2563eb" fill="#bfdbfe" name="A receber" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>
                                        </>
                                    )}

                                    {categoriaAtiva === "veiculos" && (
                                        <>
                                    <ChartCard titulo="Compra x venda por veículo" subtitulo="Principais veículos por valor cadastrado" icon={Car} cheio>
                                        {compraVendaPrincipais.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={compraVendaPrincipais} margin={{ left: 8, right: 18 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloVeiculo} tickMargin={10} interval={0} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={formatarTooltip} />
                                                    <Legend />
                                                    <Bar dataKey="compra" fill="#64748b" name="Compra" radius={[6, 6, 0, 0]} />
                                                    <Bar dataKey="venda" fill="#16a34a" name="Venda" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Top veículos por lucro bruto" icon={TrendingUp}>
                                        {topLucro.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={topLucro} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={formatarMoedaCompacta} />
                                                    <YAxis type="category" dataKey="nome" width={150} tickFormatter={formatarRotuloCurto} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Lucro bruto"]} />
                                                    <Bar dataKey="valor" fill="#16a34a" radius={[0, 8, 8, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Top veículos por margem percentual" icon={Percent}>
                                        {topMargem.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={topMargem} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={formatarPercentual} />
                                                    <YAxis type="category" dataKey="nome" width={150} tickFormatter={formatarRotuloCurto} />
                                                    <Tooltip formatter={(v) => [formatarPercentual(v), "Margem"]} />
                                                    <Bar dataKey="percentual" fill="#7c3aed" radius={[0, 8, 8, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Preço recomendado x preço cadastrado" icon={DollarSign}>
                                        {precificacao.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <LineChart data={precificacao}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} tickMargin={10} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={formatarTooltip} />
                                                    <Legend />
                                                    <Line dataKey="recomendado" stroke="#2563eb" name="Recomendado" strokeWidth={3} />
                                                    <Line dataKey="cadastrado" stroke="#f59e0b" name="Cadastrado" strokeWidth={3} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Estoque parado por faixa de tempo" icon={ClipboardList}>
                                        {estoqueParado.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={estoqueParado}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickMargin={10} />
                                                    <YAxis width={58} tickFormatter={formatarNumeroCompacto} />
                                                    <Tooltip formatter={(v) => [formatarNumero(v), "Veículos"]} />
                                                    <Bar dataKey="valor" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Análise por marca" icon={BarChart3} cheio>
                                        {analiseMarcas.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={analiseMarcas}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} tickMargin={10} />
                                                    <YAxis width={58} tickFormatter={formatarNumeroCompacto} />
                                                    <Tooltip formatter={(v) => [formatarNumero(v), "Veículos"]} />
                                                    <Bar dataKey="valor" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>
                                        </>
                                    )}

                                    {categoriaAtiva === "comercial" && (
                                        <>
                                    <ChartCard titulo="Vendas por forma de pagamento" icon={CreditCard}>
                                        {vendasPagamento.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <PieChart>
                                                    <Pie data={vendasPagamento} dataKey="valor" nameKey="nome" innerRadius={72} outerRadius={125}>
                                                        {vendasPagamento.map((_, index) => <Cell key={index} fill={CORES[index % CORES.length]} />)}
                                                    </Pie>
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Total vendido"]} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Performance dos vendedores" icon={Users}>
                                        {vendedores.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={vendedores}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} tickMargin={10} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Resultado"]} />
                                                    <Bar dataKey="valor" fill="#0891b2" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Lucro real após manutenção" icon={Wrench}>
                                        {lucroReal.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={lucroReal} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={formatarMoedaCompacta} />
                                                    <YAxis type="category" dataKey="nome" width={150} tickFormatter={formatarRotuloCurto} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Lucro real"]} />
                                                    <Bar dataKey="valor" fill="#16a34a" radius={[0, 8, 8, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Parcelas por status" icon={Receipt}>
                                        {parcelasStatus.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <PieChart>
                                                    <Pie data={parcelasStatus} dataKey="valor" nameKey="nome" outerRadius={125}>
                                                        {parcelasStatus.map((_, index) => <Cell key={index} fill={CORES[index % CORES.length]} />)}
                                                    </Pie>
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Valor"]} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>
                                        </>
                                    )}

                                    {categoriaAtiva === "operacao" && (
                                        <>
                                    <ChartCard titulo="Documentação pendente" icon={FileWarning}>
                                        {documentacao.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={documentacao}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickMargin={10} />
                                                    <YAxis width={58} tickFormatter={formatarNumeroCompacto} />
                                                    <Tooltip formatter={(v) => [formatarNumero(v), "Pendências"]} />
                                                    <Bar dataKey="valor" fill="#dc2626" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Curva ABC do estoque" icon={BarChart3}>
                                        {curvaAbc.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={curvaAbc}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} tickMargin={10} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Valor em estoque"]} />
                                                    <Bar dataKey="valor" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Manutenção por veículo" icon={Wrench}>
                                        {manutencaoVeiculo.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={manutencaoVeiculo} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={formatarMoedaCompacta} />
                                                    <YAxis type="category" dataKey="nome" width={150} tickFormatter={formatarRotuloCurto} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Manutenção"]} />
                                                    <Bar dataKey="valor" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    <ChartCard titulo="Serviços mais usados" icon={Wrench} cheio>
                                        {servicosUsados.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={servicosUsados} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" allowDecimals={false} tickFormatter={formatarNumeroCompacto} />
                                                    <YAxis type="category" dataKey="nome" width={170} tickFormatter={formatarRotuloCurto} />
                                                    <Tooltip formatter={(v) => [formatarNumero(v), "Usos"]} />
                                                    <Bar dataKey="valor" fill="#475569" radius={[0, 8, 8, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>
                                        </>
                                    )}
                                </div>

                                <section className={styles.relatorios}>
                                    <div className={styles.sectionHeader}>
                                        <div>
                                            <h2>Relatórios gerenciais</h2>
                                            <p>Tabelas operacionais retornadas pelo backend.</p>
                                        </div>
                                    </div>
                                    <div className={styles.tablesGrid}>
                                        <TabelaRelatorio titulo="Vendas" dados={vendasPeriodo} />
                                        <TabelaRelatorio titulo="Financiamentos" dados={financiamentosPeriodo} />
                                        <TabelaRelatorio titulo="Veículos" dados={periodoAtivo === "geral" ? relatorios.veiculos : veiculosPeriodo} />
                                    </div>
                                </section>

                                {modalGerencial && detalheCard && (
                                    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-gerencial-title">
                                        <section className={styles.modalBox}>
                                            <div className={styles.modalHeader}>
                                                <div>
                                                    <h2 id="modal-gerencial-title">
                                                        {detalheCard.titulo}
                                                    </h2>
                                                    <p>{detalheCard.descricao}</p>
                                                </div>
                                                <button
                                                    className={styles.modalClose}
                                                    onClick={() => setModalGerencial(null)}
                                                    type="button"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            {carregandoModal ? (
                                                <div className={styles.modalEmpty}>
                                                    <span className={styles.loader} />
                                                    <strong>Carregando detalhes...</strong>
                                                </div>
                                            ) : erroModal ? (
                                                <div className={styles.modalEmpty}>
                                                    <AlertTriangle size={26} />
                                                    <strong>Não foi possível carregar os detalhes.</strong>
                                                    <p>{erroModal}</p>
                                                </div>
                                            ) : detalheCard ? (
                                                <div className={styles.modalConteudo}>
                                                    <ResumoDetalheCard itens={detalheCard.resumo} />

                                                    <TabelaRelatorio titulo={detalheCard.tabelaTitulo} dados={detalheCard.tabelaDados} limiteColunas={6} />
                                                </div>
                                            ) : modalGerencial === "financiamentos" && financiamentosDetalhados.length > 0 ? (
                                                <TabelaRelatorio titulo="Detalhes dos financiamentos" dados={financiamentosDetalhados} />
                                            ) : modalGerencial === "parcelas_atrasadas" && parcelasDetalhadas.length > 0 ? (
                                                <TabelaRelatorio titulo="Detalhes das parcelas" dados={parcelasDetalhadas} />
                                            ) : (
                                                <div className={styles.modalEmpty}>
                                                    <AlertTriangle size={26} />
                                                    <strong>Detalhes não disponíveis na resposta atual.</strong>
                                                    <p>
                                                        {modalGerencial === "financiamentos"
                                                            ? "A rota informa o total de financiamentos, mas não enviou uma lista detalhada para esta modal."
                                                            : "A rota informa o total de parcelas atrasadas, mas não enviou usuário, número da parcela e vencimento em uma lista detalhada."}
                                                    </p>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
