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
    Info,
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
const REGISTROS_POR_PAGINA_RELATORIO = 10;
const EIXO_X_LABELS_ROTACIONADOS = {
    interval: 0,
    height: 86,
    tickMargin: 14,
    tick: {
        angle: -45,
        textAnchor: "end",
    },
};

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

    const data = dataValida(valor);
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
    const nome = normalizarNomeColunaTabela(coluna);
    if (nome.startsWith("id_")) return styles.colunaId;
    if (nome.includes("data")) return styles.colunaData;
    if (nome === "forma_pagamento") return styles.colunaPagamento;
    if (nome === "status" || nome.includes("status") || nome.includes("documentacao") || nome.includes("forma_pagamento")) return styles.colunaCentro;
    if (nome.includes("valor") || nome.includes("preco") || nome.includes("total") || nome.includes("lucro") || nome.includes("saldo") || nome.includes("margem") || nome.includes("qtd") || nome.includes("quantidade") || nome.includes("parcela") || nome.includes("numero") || nome.includes("dias") || nome === "ano" || nome.includes("km") || nome.includes("quilometragem")) return styles.colunaValor;
    if (nome.includes("nome") || nome.includes("cliente") || nome.includes("vendedor") || nome.includes("veiculo") || nome.includes("marca") || nome.includes("modelo") || nome.includes("descricao") || nome.includes("indicador") || nome.includes("origem")) return styles.colunaNome;
    return "";
}

// funcao que limpa nome de coluna da tabela
function normalizarNomeColunaTabela(coluna) {
    return String(coluna || "")
        .replace(/^[._\s]+/, "")
        .replace(/[.\s]+/g, "_")
        .toLowerCase();
}

// funcao que arruma acentuacao e nome das colunas da tabela
// funcao do cabecalho amigavel da tabela
function formatarCabecalhoTabela(coluna) {
    const nome = normalizarNomeColunaTabela(coluna);
    const nomes = {
        id_veiculo: "ID do veículo",
        id_venda: "ID da venda",
        id_usuario: "ID do usuário",
        id_financiamento: "ID do financiamento",
        id_item_financiamento: "ID da parcela",
        id_despesa: "ID da despesa",
        id_tabela: "ID da origem",
        cliente: "Cliente",
        vendedor: "Vendedor",
        veiculo: "Veículo",
        marca: "Marca",
        modelo: "Modelo",
        placa: "Placa",
        ano: "Ano",
        cor: "Cor",
        status: "Status",
        status_parcela: "Status da parcela",
        documentacao: "Documentação",
        combustivel: "Combustível",
        cambio: "Câmbio",
        forma_pagamento: "Forma de pagamento",
        numero_parcela: "Número da parcela",
        valor_parcela: "Valor da parcela",
        valor_venda: "Valor da venda",
        valor_financiado: "Valor financiado",
        valor_a_receber: "Valor a receber",
        valor_parcelas_atrasadas: "Valor das parcelas atrasadas",
        preco_custo: "Preço de custo",
        preco_venda: "Preço de venda",
        data_venda: "Data da venda",
        data_cadastro: "Data de cadastro",
        data_financiamento: "Data do financiamento",
        data_vencimento: "Data de vencimento",
        data_pagamento: "Data de pagamento",
        data_despesa: "Data da despesa",
        dias_estoque: "Dias em estoque",
        saldo_devedor: "Saldo devedor",
        qtd_parcelas: "Quantidade de parcelas",
        parcelas_abertas: "Parcelas em aberto",
        parcelas_pagas: "Parcelas pagas",
        parcelas_atrasadas: "Parcelas atrasadas",
        qtd_estoque: "Quantidade em estoque",
        qtd_total: "Quantidade total",
        capital_estoque: "Capital em estoque",
        margem_valor: "Margem em valor",
        margem_percentual: "Margem percentual",
        lucro_bruto: "Lucro bruto",
        lucro_real: "Lucro real",
        total_manutencao: "Total de manutenção",
        manutencao: "Manutenção",
        despesa: "Despesa",
        despesas: "Despesas",
        descricao: "Descrição",
        receita: "Receita",
        indicador: "Indicador",
        tabela: "Origem",
        mes: "Mês",
        periodo: "Período",
        vencimento: "Vencimento",
    };

    if (nomes[nome]) return nomes[nome];

    return nome
        .split("_")
        .filter(Boolean)
        .map((parte, index) => index === 0 ? parte.charAt(0).toUpperCase() + parte.slice(1) : parte)
        .join(" ");
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

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
        const [ano, mes, dia] = String(valor).split("-").map(Number);
        return new Date(ano, mes - 1, dia, 12);
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

function calcularResumoPeriodo(resumo, periodo, vendas, financiamentos, veiculos, financeiroMensal, parcelas) {
    if (periodo === "geral") return resumo;

    const qtdVendas = vendas.length;
    const receitaVendas = somar(vendas, ["valor_venda", "VALOR_VENDA"]);
    const lucroBruto = somar(vendas, ["lucro_bruto", "lucro"]);
    const despesaTotal = somar(financeiroMensal, ["despesa", "despesas", "despesa_total"]);
    const receitaExtra = somar(financeiroMensal, ["receita_extra"]);
    const veiculosEstoque = veiculos.filter((item) => Number(item?.status ?? item?.STATUS) === 0);
    const capitalEstoque = somar(veiculosEstoque, ["preco_custo", "PRECO_CUSTO"]);
    const parcelasAbertas = paraArray(parcelas).filter((item) => {
        const status = Number(primeiroValor(item, ["status", "STATUS", "status_parcela"], 0));
        return status === 0 || status === 3;
    });
    const parcelasAtrasadas = parcelasAbertas.filter((item) => {
        const dataVencimento = dataValida(primeiroValor(item, ["data_vencimento", "DATA_VENCIMENTO", "vencimento"], ""));
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999);

        return dataVencimento && dataVencimento < hoje;
    });
    const totalAReceber = somar(parcelasAbertas, ["valor_parcela", "VALOR_PARCELA", "valor", "total"]);
    const valorAtrasado = somar(parcelasAtrasadas, ["valor_parcela", "VALOR_PARCELA", "valor", "total"]);

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
        total_a_receber_financiamento: totalAReceber,
        qtd_parcelas_atrasadas: parcelasAtrasadas.length,
        valor_parcelas_atrasadas: valorAtrasado,
        inadimplencia_percentual: totalAReceber > 0 ? (valorAtrasado / totalAReceber) * 100 : 0,
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

// funcao do grafico receita, despesa e lucro
function normalizarFinanceiroMensal(lista) {
    return paraArray(lista).map((item) => ({
        mes: formatarMesAno(textoPorPossiveisChaves(item, ["mes", "MES", "periodo", "data"], "Mês")),
        receita: numero(valorPorPossiveisChaves(item, ["receita", "RECEITA", "receita_total", "total_receita"])),
        despesas: numero(valorPorPossiveisChaves(item, ["despesas", "DESPESAS", "despesa", "despesa_total", "total_despesas"])),
        custo_vendidos: numero(valorPorPossiveisChaves(item, ["custo_vendidos", "CUSTO_VENDIDOS", "custo", "custos"])),
        manutencao: numero(valorPorPossiveisChaves(item, ["manutencao", "MANUTENCAO", "total_manutencao"])),
        lucro_bruto: numero(valorPorPossiveisChaves(item, ["lucro_bruto", "LUCRO_BRUTO", "margem_bruta"])),
        lucro: numero(valorPorPossiveisChaves(item, ["lucro", "LUCRO", "lucro_liquido", "lucro_estimado"])),
    }));
}

function normalizarSerie(lista, labelKeys, valueKeys, valueName = "valor") {
    return paraArray(lista).map((item) => ({
        nome: formatarMesAno(textoPorPossiveisChaves(item, labelKeys)),
        [valueName]: numero(valorPorPossiveisChaves(item, valueKeys)),
    }));
}

function normalizarAnaliseMarcas(lista) {
    return normalizarSerie(lista, ["marca", "nome"], ["qtd_estoque", "quantidade", "total", "valor"])
        .filter((item) => item.valor > 0)
        .sort((a, b) => b.valor - a.valor);
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

// funcao do grafico documentacao pendente
function normalizarDocumentacaoPendente(lista) {
    const resumo = paraArray(lista)
        .filter(itemDocumentacaoPendente)
        .reduce((acumulador, item) => {
            const quantidadeInformada = valorPorPossiveisChaves(item, ["quantidade", "qtd", "total_veiculos"]);
            const capital = numero(valorPorPossiveisChaves(item, ["capital", "preco_custo", "PRECO_CUSTO", "valor_estoque"]));

            acumulador.valor += quantidadeInformada === undefined || quantidadeInformada === null || quantidadeInformada === ""
                ? 1
                : Math.max(1, numero(quantidadeInformada));
            acumulador.capital += capital;

            return acumulador;
        }, { nome: "Pendente", valor: 0, capital: 0 });

    return resumo.valor > 0 ? [resumo] : [];
}

// funcao do grafico vendas por forma de pagamento
function normalizarVendasPorPagamento(lista) {
    const grupos = {};

    paraArray(lista).forEach((item) => {
        const forma = primeiroValor(item, ["forma_pagamento", "FORMA_PAGAMENTO"], "");
        const nomeInformado = textoPorPossiveisChaves(item, ["nome", "forma", "pagamento", "forma_pagamento", "FORMA_PAGAMENTO"], "");
        const nome = nomeInformado && Number.isNaN(Number(nomeInformado)) ? nomeInformado : formatarFormaPagamento(forma);
        const valor = numero(valorPorPossiveisChaves(item, ["valor_total", "quantidade", "total", "valor"]));
        const chave = nome.toLocaleLowerCase("pt-BR");

        if (!grupos[chave]) grupos[chave] = { nome, valor: 0 };
        grupos[chave].valor += valor;
    });

    return Object.values(grupos).filter((item) => item.valor > 0);
}

// funcao do grafico parcelas por status
function normalizarParcelasStatus(lista) {
    return paraArray(lista).map((item) => ({
        nome: textoPorPossiveisChaves(item, ["status", "situacao", "nome"], "Status"),
        valor: numero(valorPorPossiveisChaves(item, ["valor", "total"])),
        quantidade: numero(valorPorPossiveisChaves(item, ["quantidade", "qtd"])),
    }));
}

// funcao do grafico compra x venda por veiculo
function normalizarCompraVenda(lista) {
    return paraArray(lista).map((item) => ({
        nome: textoPorPossiveisChaves(item, ["veiculo", "modelo", "nome", "placa"], "Veículo"),
        compra: numero(valorPorPossiveisChaves(item, ["preco_custo", "compra", "valor_compra", "preco_compra"])),
        venda: numero(valorPorPossiveisChaves(item, ["preco_venda", "venda", "valor_venda"])),
    }));
}

// funcao do grafico preco recomendado x preco cadastrado
function normalizarPrecificacao(lista) {
    return paraArray(lista).map((item) => ({
        nome: textoPorPossiveisChaves(item, ["veiculo", "modelo", "nome", "placa"], "Veículo"),
        recomendado: numero(valorPorPossiveisChaves(item, ["preco_recomendado", "recomendado", "valor_recomendado", "preco_venda", "PRECO_VENDA"])),
        cadastrado: numero(valorPorPossiveisChaves(item, ["preco_cadastrado", "cadastrado", "valor_cadastrado", "preco", "preco_venda", "PRECO_VENDA"])),
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

async function buscarDashboard(endpoint) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "GET",
        credentials: "include",
    });

    const resposta = await lerRespostaJson(response);

    if (!response.ok) {
        throw new Error(mensagemErroHttp(response.status, resposta));
    }

    return resposta || {};
}

async function buscarDashboardOpcional(endpoint, fallback) {
    try {
        return await buscarDashboard(endpoint);
    } catch (error) {
        console.warn(`Falha ao carregar ${endpoint}:`, error);
        return fallback;
    }
}

async function buscarDadosDashboard() {
    const [
        resumo,
        vendas,
        despesas,
        financiamentos,
        parcelas,
        veiculos,
        manutencoes,
        graficos,
    ] = await Promise.all([
        buscarDashboard("dashboard_resumo"),
        buscarDashboardOpcional("dashboard_vendas", { vendas: [] }),
        buscarDashboardOpcional("dashboard_despesas", { despesas: [] }),
        buscarDashboardOpcional("dashboard_financiamentos", { financiamentos: [] }),
        buscarDashboardOpcional("dashboard_parcelas", { parcelas: [] }),
        buscarDashboardOpcional("dashboard_veiculos", { veiculos: [] }),
        buscarDashboardOpcional("dashboard_manutencoes", { manutencoes: [], itens: [] }),
        buscarDashboardOpcional("dashboard_graficos", {}),
    ]);

    return montarDadosDashboard({
        resumo,
        vendas,
        despesas,
        financiamentos,
        parcelas,
        veiculos,
        manutencoes,
        graficos,
    });
}

// funcao dos graficos de veiculos da dashboard
function normalizarVeiculosDashboard(lista) {
    return paraArray(lista).map((veiculo) => {
        const marca = getCampo(veiculo, ["marca", "MARCA"], "");
        const modelo = getCampo(veiculo, ["modelo", "MODELO"], "");
        const precoCusto = numero(valorPorPossiveisChaves(veiculo, ["preco_custo", "PRECO_CUSTO"]));
        const precoVenda = numero(valorPorPossiveisChaves(veiculo, ["preco_venda", "PRECO_VENDA"]));
        const margemValor = precoVenda - precoCusto;
        const margemPercentual = precoCusto > 0 ? (margemValor / precoCusto) * 100 : 0;
        const nome = `${marca} ${modelo}`.trim() || getCampo(veiculo, ["placa", "PLACA"], "Veículo");

        return {
            ...veiculo,
            nome,
            veiculo: nome,
            marca,
            modelo,
            preco_custo: precoCusto,
            preco_venda: precoVenda,
            margem_valor: margemValor,
            margem_percentual: margemPercentual,
            dias_estoque: calcularDiasAteHoje(getCampo(veiculo, ["data_cadastro", "DATA_CADASTRO"], null)),
        };
    });
}

function agruparEstoqueParado(veiculos) {
    const faixas = [
        { faixa: "0-30 dias", min: 0, max: 30, quantidade: 0, capital: 0 },
        { faixa: "31-60 dias", min: 31, max: 60, quantidade: 0, capital: 0 },
        { faixa: "61-90 dias", min: 61, max: 90, quantidade: 0, capital: 0 },
        { faixa: "+90 dias", min: 91, max: Infinity, quantidade: 0, capital: 0 },
    ];

    paraArray(veiculos)
        .filter((veiculo) => Number(veiculo.status ?? veiculo.STATUS) === 0)
        .forEach((veiculo) => {
            const dias = veiculo.dias_estoque ?? 0;
            const faixa = faixas.find((item) => dias >= item.min && dias <= item.max);
            if (!faixa) return;

            faixa.quantidade += 1;
            faixa.capital += numero(veiculo.preco_custo);
        });

    return faixas.map(({ faixa, quantidade, capital }) => ({ faixa, quantidade, capital }));
}

function agruparAnaliseMarcas(veiculos) {
    const grupos = {};

    paraArray(veiculos)
        .filter((veiculo) => Number(veiculo.status ?? veiculo.STATUS) === 0)
        .forEach((veiculo) => {
            const marca = getCampo(veiculo, ["marca", "MARCA"], "Sem marca");
            if (!grupos[marca]) {
                grupos[marca] = { marca, qtd_estoque: 0, capital_estoque: 0 };
            }

            grupos[marca].qtd_estoque += 1;
            grupos[marca].capital_estoque += numero(veiculo.preco_custo);
        });

    return Object.values(grupos).sort((a, b) => b.capital_estoque - a.capital_estoque);
}

function calcularCurvaAbc(veiculos) {
    const estoque = paraArray(veiculos)
        .filter((veiculo) => Number(veiculo.status ?? veiculo.STATUS) === 0)
        .sort((a, b) => numero(b.preco_custo) - numero(a.preco_custo));
    const total = somar(estoque, ["preco_custo", "PRECO_CUSTO"]);
    let acumulado = 0;

    return estoque.map((veiculo) => {
        const precoCusto = numero(veiculo.preco_custo);
        const participacao = total > 0 ? (precoCusto / total) * 100 : 0;
        acumulado += participacao;

        return {
            id_veiculo: veiculo.id_veiculo,
            nome: veiculo.nome,
            preco_custo: precoCusto,
            participacao_percentual: participacao,
            classe: acumulado <= 80 ? "A" : acumulado <= 95 ? "B" : "C",
        };
    });
}

function montarDadosDashboard(respostas) {
    const resumo = respostas.resumo || {};
    const vendas = paraArray(respostas.vendas?.vendas);
    const despesas = paraArray(respostas.despesas?.despesas);
    const financiamentos = paraArray(respostas.financiamentos?.financiamentos);
    const parcelas = paraArray(respostas.parcelas?.parcelas);
    const veiculos = normalizarVeiculosDashboard(respostas.veiculos?.veiculos);
    const manutencoes = paraArray(respostas.manutencoes?.manutencoes);
    const itensManutencao = paraArray(respostas.manutencoes?.itens);
    const graficos = respostas.graficos || {};
    const topLucro = [...veiculos].sort((a, b) => numero(b.margem_valor) - numero(a.margem_valor)).slice(0, 10);
    const topMargem = [...veiculos].sort((a, b) => numero(b.margem_percentual) - numero(a.margem_percentual)).slice(0, 10);

    return {
        resumo,
        graficos: {
            ...graficos,
            compra_venda_veiculo: veiculos,
            margem_veiculos_top_lucro: topLucro,
            margem_veiculos_top_percentual: topMargem,
            precificacao_recomendada: veiculos.map((veiculo) => ({
                id_veiculo: veiculo.id_veiculo,
                nome: veiculo.nome,
                preco_recomendado: veiculo.preco_venda,
                preco_cadastrado: veiculo.preco_venda,
            })),
            estoque_parado: graficos.estoque_parado || agruparEstoqueParado(veiculos),
            analise_marcas: graficos.analise_marcas || agruparAnaliseMarcas(veiculos),
            curva_abc: graficos.curva_abc || calcularCurvaAbc(veiculos),
        },
        relatorios: {
            vendas,
            despesas,
            financiamentos,
            parcelas,
            veiculos,
            manutencoes,
            itens_manutencao: itensManutencao,
            manutencao_por_veiculo: graficos.manutencao_por_veiculo || [],
            servicos_mais_usados: graficos.servicos_mais_usados || [],
        },
    };
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

// funcao dos textos de informacao dos graficos e tabelas
function textoInfoDashboard(titulo) {
    const textos = {
        "Receita, despesas e lucro por mês": "Acompanha o resultado financeiro mês a mês. A receita soma vendas e entradas extras; despesas mostram saídas registradas; lucro bruto considera venda menos custo; lucro líquido considera receita menos despesas.",
        "Fluxo futuro de recebimentos": "Mostra parcelas em aberto que ainda devem entrar no caixa. Facilita a previsão de recebimentos futuros e destaca meses com maior entrada prevista.",
        "Parcelas por status": "Resume o valor das parcelas pagas, em aberto e atrasadas. Use para acompanhar cobrança, inadimplência e volume financeiro pendente.",
        "Compra x venda por veículo": "Compara preço de custo e preço de venda por veículo. Ajuda a identificar margem, veículos vendidos abaixo do esperado e oportunidades de ajuste de preço.",
        "Top veículos por lucro bruto": "Mostra os veículos com maior lucro bruto, calculado pela diferença entre valor de venda e custo do veículo.",
        "Top veículos por margem percentual": "Mostra quais veículos tiveram melhor retorno proporcional em relação ao custo, mesmo quando o valor absoluto da venda não é o maior.",
        "Preço recomendado x preço cadastrado": "Compara o preço recomendado com o preço cadastrado. Use para encontrar veículos fora da estratégia comercial definida.",
        "Estoque parado por faixa de tempo": "Agrupa veículos pelo tempo em estoque. Ajuda a identificar carros parados há muito tempo e capital imobilizado.",
        "Análise por marca": "Mostra como o estoque está distribuído por marca. Ajuda a entender concentração, variedade e peso de cada marca no pátio.",
        "Veículos à venda por marca": "Mostra somente veículos disponíveis para venda, agrupados por marca. Veículos vendidos, reservados ou inativos não entram nesta contagem.",
        "Vendas por forma de pagamento": "Mostra o total vendido por forma de pagamento, como financiamento, Pix, cartão, boleto ou à vista.",
        "Performance dos vendedores": "Compara vendedores por resultado de vendas. Facilita o acompanhamento de produtividade, receita gerada e contribuição comercial.",
        "Lucro real por veículo": "Calcula o lucro mais próximo do real por veículo, descontando custo e manutenções vinculadas antes da venda.",
        "Documentação pendente dos veículos à venda": "Mostra somente veículos disponíveis para venda com documentação pendente. Veículos vendidos, reservados ou inativos não entram nesta contagem.",
        "Curva ABC do estoque": "Classifica os veículos pelo peso financeiro no estoque. A curva A concentra os itens de maior impacto no capital parado.",
        "Serviços mais usados": "Mostra quais serviços de manutenção aparecem com mais frequência. Ajuda a entender custos recorrentes e padrões de preparação dos veículos.",
        "Vendas": "Lista vendas realizadas no período, com cliente, veículo, forma de pagamento, valor e lucro bruto quando disponível.",
        "Financiamentos": "Lista contratos financiados e situação das parcelas para acompanhamento administrativo.",
        "Veículos": "Lista veículos cadastrados, status, documentação, preço de custo e preço de venda.",
        "Carros em estoque": "Mostra os veículos disponíveis e o capital parado em cada item do estoque.",
        "Vendas consideradas": "Mostra as vendas usadas para formar receita, lucro e outros indicadores do período selecionado.",
        "Despesas": "Lista despesas registradas no sistema e consideradas nos cálculos financeiros da dashboard.",
        "Composição do lucro": "Detalha os componentes do lucro líquido estimado: lucro bruto, receitas extras e despesas.",
        "Vendas do período": "Lista as vendas que participam do indicador aberto, respeitando o filtro de período da dashboard.",
        "Vendas usadas no cálculo": "Mostra as vendas utilizadas para calcular o ticket médio e o total vendido.",
        "Carros": "Lista os veículos considerados no indicador de estoque, com dados de status, documentação e valores.",
        "Detalhes dos financiamentos": "Mostra contratos financiados, quantidade de parcelas e parcelas atrasadas.",
        "Detalhes das parcelas": "Lista parcelas relacionadas ao indicador, incluindo vencimento, pagamento, status e valor.",
        "Fluxo de recebimentos": "Mostra os valores previstos para entrada futura no caixa, agrupados por período.",
        "Parcelas detalhadas": "Mostra parcelas pagas, abertas e atrasadas para análise de cobrança e inadimplência.",
    };

    return textos[titulo] || `Informações detalhadas sobre ${String(titulo || "este item").toLowerCase()}.`;
}

// componente do icone de informacao com popup
function InfoTooltip({ texto }) {
    if (!texto) return null;

    return (
        <span className={styles.infoTooltip}>
            <Info size={16} />
            <span>{texto}</span>
        </span>
    );
}

function ChartCard({ titulo, subtitulo, icon = BarChart3, children, cheio = false, info = "" }) {
    return (
        <section className={`${styles.chartCard} ${cheio ? styles.chartCardWide : ""}`}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2>{titulo}</h2>
                    {subtitulo && <p>{subtitulo}</p>}
                </div>
                <span className={styles.sectionIcon}>
                    {createElement(icon, { size: 20 })}
                    <InfoTooltip texto={info || textoInfoDashboard(titulo)} />
                </span>
            </div>
            <ChartBoundary resetKey={titulo}>{children}</ChartBoundary>
        </section>
    );
}

function TabelaRelatorio({ titulo, dados, limiteColunas = 8, info = "" }) {
    const linhas = paraArray(dados);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const colunas = useMemo(() => {
        const primeiraLinha = linhas.find((linha) => linha && typeof linha === "object");
        return primeiraLinha
            ? Object.keys(primeiraLinha).filter((coluna) => coluna !== "atrasada").slice(0, limiteColunas)
            : [];
    }, [linhas, limiteColunas]);
    const totalPaginas = Math.max(1, Math.ceil(linhas.length / REGISTROS_POR_PAGINA_RELATORIO));
    const inicioPagina = (paginaAtual - 1) * REGISTROS_POR_PAGINA_RELATORIO;
    const linhasPagina = linhas.slice(inicioPagina, inicioPagina + REGISTROS_POR_PAGINA_RELATORIO);

    useEffect(() => {
        setPaginaAtual(1);
    }, [titulo, dados]);

    useEffect(() => {
        setPaginaAtual((pagina) => Math.min(pagina, totalPaginas));
    }, [totalPaginas]);

    return (
        <section className={styles.tableCard}>
            <div className={styles.tableTitle}>
                <div className={styles.tableTitleText}>
                    <h3>{titulo}</h3>
                    <InfoTooltip texto={info || textoInfoDashboard(titulo)} />
                </div>
                <span>{formatarNumero(linhas.length)} registros</span>
            </div>
            {linhas.length === 0 || colunas.length === 0 ? (
                <div className={styles.emptyTable}>Nenhum registro encontrado.</div>
            ) : (
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                {/* cabecalho amigavel da tabela */}
                                {colunas.map((coluna) => (
                                    <th className={classeColunaTabela(coluna)} key={coluna}>{formatarCabecalhoTabela(coluna)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {linhasPagina.map((linha, index) => (
                                <tr key={`${titulo}-${inicioPagina + index}`}>
                                    {colunas.map((coluna) => (
                                        <td
                                            className={classeColunaTabela(coluna)}
                                            data-label={formatarCabecalhoTabela(coluna)}
                                            key={coluna}
                                        >
                                            {formatarCampoTabela(coluna, linha[coluna], linha)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {totalPaginas > 1 && (
                            <tfoot>
                                <tr>
                                    <td className={styles.paginacaoCelula} colSpan={colunas.length}>
                                        <div className={styles.paginacaoTabela}>
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
                                                Proxima
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
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
    const nome = normalizarNomeColunaTabela(coluna);
    if (nome.includes("data")) return formatarData(valor);
    if (nome === "dias_estoque") return formatarDiasEstoque(valor, linha);
    if (nome === "forma_pagamento") return formatarFormaPagamento(valor);
    if (nome === "combustivel") return formatarCombustivel(valor);
    if (nome === "cambio") return formatarCambio(valor);
    if (nome === "status_parcela") return Number(valor) === 1 ? "Paga" : "Em aberto";
    if (nome === "status" && linha?.id_despesa) return Number(valor) === 1 ? "Estornada" : "Ativa";
    if (nome === "status" && linha?.id_item_financiamento) return Number(valor) === 1 ? "Paga" : "Em aberto";
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
                const novosDados = await buscarDadosDashboard();

                if (ativo) {
                    setDados(novosDados);
                }
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
        if (!["__detalhe_externo__"].includes(modalGerencial)) {
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
    const despesasRelatorio = [
        relatorios.despesas,
        relatorios.despesa,
        relatorios.lista_despesas,
        relatorios.despesas_operacionais,
        dados?.despesas,
    ].find(Array.isArray) || [];
    const despesasPeriodo = filtrarPeriodo(despesasRelatorio, periodoAtivo, ["data_despesa", "DATA_DESPESA", "data", "DATA"]);
    const parcelasPeriodo = filtrarPeriodo(relatorios.parcelas, periodoAtivo, ["data_vencimento", "DATA_VENCIMENTO", "vencimento"]);
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
        financeiroMensalBase,
        parcelasPeriodo
    );

    const financeiroMensal = normalizarFinanceiroMensal(financeiroMensalBase);
    const fluxoRecebimentos = normalizarSerie(fluxoRecebimentosBase, ["mes", "data", "periodo", "vencimento"], ["valor_a_receber", "valor", "total", "total_receber"]);
    const compraVenda = normalizarCompraVenda(compraVendaBase);
    const compraVendaPrincipais = principaisCompraVenda(compraVenda);
    const topLucro = normalizarSerie(topLucroBase, ["nome", "veiculo", "modelo", "placa"], ["margem_valor", "lucro_bruto", "lucro", "valor"]);
    const topMargem = normalizarSerie(topMargemBase, ["nome", "veiculo", "modelo", "placa"], ["margem_percentual", "percentual", "margem"], "percentual");
    const precificacao = normalizarPrecificacao(periodoAtivo === "geral" ? graficos.precificacao_recomendada : veiculosPeriodo);
    const estoqueParado = normalizarSerie(graficos.estoque_parado, ["faixa", "tempo", "periodo", "nome"], ["quantidade", "total", "valor"]);
    const veiculosAnaliseMarcasBase = periodoAtivo === "geral" ? relatorios.veiculos : veiculosPeriodo;
    const analiseMarcas = normalizarAnaliseMarcas(agruparAnaliseMarcas(veiculosAnaliseMarcasBase));
    const vendasPagamento = normalizarVendasPorPagamento(graficos.vendas_por_forma_pagamento);
    const vendedores = normalizarSerie(graficos.performance_vendedores, ["vendedor", "nome"], ["lucro_bruto", "receita_vendas", "quantidade_vendas", "vendas", "quantidade", "total", "valor"]);
    const lucroRealVeiculos = normalizarSerie(graficos.lucro_real_veiculos, ["veiculo", "nome", "modelo", "placa"], ["lucro_real", "lucro", "valor"]);
    const parcelasStatus = normalizarParcelasStatus(graficos.parcelas_status);
    const documentacao = normalizarDocumentacaoPendente(graficos.documentacao);
    const curvaAbc = normalizarSerie(graficos.curva_abc, ["nome", "classe", "curva"], ["preco_custo", "participacao_percentual", "quantidade", "total", "valor"]);
    const servicosUsados = normalizarSerie(graficos.servicos_mais_usados, ["servico", "nome", "descricao"], ["quantidade", "total", "valor_total", "valor"])
        .filter((item) => item.valor > 0);
    const parcelasDetalhadas = detalhesModal.parcelasAtrasadas.length > 0
        ? detalhesModal.parcelasAtrasadas
        : obterParcelasDetalhadas(dados, modalGerencial === "qtd_parcelas_atrasadas");
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
            descricao: "Receita, despesa e lucro no período selecionado.",
            resumo: [
                { label: "Receita", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Vendas", valor: vendasPeriodo.length, formato: "numero" },
            ],
            tabelaTitulo: "Vendas consideradas",
            tabelaDados: vendasPeriodo,
        },
        despesa_total: {
            titulo: "Despesa total",
            descricao: "Listagem das despesas registradas na operação.",
            resumo: [
                { label: "Despesas", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Registros", valor: despesasPeriodo.length, formato: "numero" },
            ],
            tabelaTitulo: "Despesas",
            tabelaDados: despesasPeriodo.map((despesa) => ({
                despesa: textoPorPossiveisChaves(despesa, ["descricao", "DESCRICAO", "despesa", "nome"], "Despesa"),
                valor: valorPorPossiveisChaves(despesa, ["valor", "VALOR", "total"]),
            })),
        },
        lucro_liquido_estimado: {
            titulo: "Lucro líquido estimado",
            descricao: "Resultado estimado juntando vendas, receitas extras e despesas.",
            resumo: [
                { label: "Lucro estimado", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Despesas", valor: primeiroValor(resumoFiltrado, ["despesa_total", "despesaTotal", "total_despesas"]), formato: "moeda" },
            ],
            tabelaTitulo: "Composição do lucro",
            tabelaDados: [
                {
                    indicador: "Lucro bruto vendas",
                    valor: primeiroValor(resumoFiltrado, ["lucro_bruto_vendas", "lucroBrutoVendas", "lucro_bruto"]),
                },
                {
                    indicador: "Receitas extras",
                    valor: primeiroValor(resumoFiltrado, ["receita_extra", "receitaExtra"]),
                },
                {
                    indicador: "Despesas",
                    valor: -numero(primeiroValor(resumoFiltrado, ["despesa_total", "despesaTotal", "total_despesas"])),
                },
                {
                    indicador: "Lucro líquido estimado",
                    valor: valorCardSelecionado,
                },
            ],
        },
        lucro_bruto_vendas: {
            titulo: "Lucro bruto de vendas",
            descricao: "Vendas e carros com maior contribuição de lucro.",
            resumo: [
                { label: "Lucro bruto", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Vendas", valor: vendasPeriodo.length, formato: "numero" },
            ],
            tabelaTitulo: "Vendas do período",
            tabelaDados: vendasPeriodo,
        },
        ticket_medio: {
            titulo: "Ticket médio",
            descricao: "Valores das vendas que formam o ticket médio.",
            resumo: [
                { label: "Ticket médio", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Total vendido", valor: somar(vendasPeriodo, ["valor_venda", "VALOR_VENDA"]), formato: "moeda" },
            ],
            tabelaTitulo: "Vendas usadas no cálculo",
            tabelaDados: vendasPeriodo,
        },
        qtd_veiculos_estoque: {
            titulo: "Carros em estoque",
            descricao: "Distribuição por marca e lista de carros no estoque.",
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
            descricao: "Contratos financiados, valores em aberto e situação das parcelas.",
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
            descricao: "Fluxo previsto de recebimentos por período.",
            resumo: [
                { label: "A receber", valor: valorCardSelecionado, formato: "moeda" },
                { label: "Parcelas em aberto", valor: primeiroValor(resumoFiltrado, ["qtd_parcelas_atrasadas", "parcelas_atrasadas", "parcelasAtrasadas"]), formato: "numero" },
            ],
            tabelaTitulo: "Fluxo de recebimentos",
            tabelaDados: fluxoRecebimentosBase,
        },
        inadimplencia_percentual: {
            titulo: "Inadimplência percentual",
            descricao: "Comparativo entre parcelas pagas, abertas e atrasadas.",
            resumo: [
                { label: "Inadimplência", valor: valorCardSelecionado, formato: "percentual" },
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
                                <strong>Carregando dashboard...</strong>
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
                                    {/* grafico receita, despesa e lucro */}
                                    <ChartCard titulo="Receita, despesas e lucro por mês" subtitulo="Comparativo financeiro mensal" icon={LineChartIcon} cheio>
                                        {financeiroMensal.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <ComposedChart data={financeiroMensal}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="mes" {...EIXO_X_LABELS_ROTACIONADOS} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={formatarTooltip} />
                                                    <Legend />
                                                    <Bar dataKey="receita" fill="#2563eb" name="Receita" radius={[6, 6, 0, 0]} />
                                                    <Bar dataKey="despesas" fill="#dc2626" name="Despesas" radius={[6, 6, 0, 0]} />
                                                    <Line dataKey="lucro_bruto" stroke="#0891b2" name="Lucro bruto" strokeWidth={3} />
                                                    <Line dataKey="lucro" stroke="#16a34a" name="Lucro líquido" strokeWidth={3} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    {/* grafico fluxo futuro de recebimentos */}
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
                                    {/* grafico parcelas por status */}
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

                                    {categoriaAtiva === "veiculos" && (
                                        <>
                                    {/* grafico compra x venda por veiculo */}
                                    <ChartCard titulo="Compra x venda por veículo" subtitulo="Principais veículos por valor cadastrado" icon={Car} cheio>
                                        {compraVendaPrincipais.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={compraVendaPrincipais} layout="vertical" margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={formatarMoedaCompacta} />
                                                    <YAxis type="category" dataKey="nome" width={128} tickFormatter={formatarRotuloVeiculo} />
                                                    <Tooltip formatter={formatarTooltip} />
                                                    <Legend verticalAlign="top" height={28} />
                                                    <Bar dataKey="compra" fill="#64748b" name="Compra" radius={[0, 6, 6, 0]} />
                                                    <Bar dataKey="venda" fill="#16a34a" name="Venda" radius={[0, 6, 6, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    {/* grafico top veiculos por lucro bruto */}
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

                                    {/* grafico top veiculos por margem percentual */}
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

                                    {/* grafico preco recomendado x preco cadastrado */}
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

                                    {/* grafico estoque parado por faixa de tempo */}
                                    <ChartCard titulo="Estoque parado por faixa de tempo" icon={ClipboardList}>
                                        {estoqueParado.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={estoqueParado}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" {...EIXO_X_LABELS_ROTACIONADOS} />
                                                    <YAxis width={58} tickFormatter={formatarNumeroCompacto} />
                                                    <Tooltip formatter={(v) => [formatarNumero(v), "Veículos"]} />
                                                    <Bar dataKey="valor" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    {/* grafico analise por marca */}
                                    <ChartCard titulo="Veículos à venda por marca" subtitulo="Somente carros disponíveis para venda" icon={BarChart3} cheio>
                                        {analiseMarcas.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={analiseMarcas}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} {...EIXO_X_LABELS_ROTACIONADOS} />
                                                    <YAxis width={58} allowDecimals={false} tickFormatter={formatarNumeroCompacto} />
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
                                    {/* grafico vendas por forma de pagamento */}
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

                                    {/* grafico performance dos vendedores */}
                                    <ChartCard titulo="Performance dos vendedores" icon={Users}>
                                        {vendedores.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={vendedores}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} {...EIXO_X_LABELS_ROTACIONADOS} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Resultado"]} />
                                                    <Bar dataKey="valor" fill="#0891b2" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    {/* grafico lucro real por veiculo */}
                                    <ChartCard titulo="Lucro real por veículo" subtitulo="Venda menos custo e manutenções" icon={TrendingUp} cheio>
                                        {lucroRealVeiculos.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={lucroRealVeiculos} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={formatarMoedaCompacta} />
                                                    <YAxis type="category" dataKey="nome" width={170} tickFormatter={formatarRotuloCurto} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Lucro real"]} />
                                                    <Bar dataKey="valor" fill="#16a34a" radius={[0, 8, 8, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                        </>
                                    )}

                                    {categoriaAtiva === "operacao" && (
                                        <>
                                    {/* grafico documentacao pendente */}
                                    <ChartCard titulo="Documentação pendente dos veículos à venda" subtitulo="Somente carros disponíveis para venda" icon={FileWarning}>
                                        {documentacao.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={documentacao}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" {...EIXO_X_LABELS_ROTACIONADOS} />
                                                    <YAxis width={58} tickFormatter={formatarNumeroCompacto} />
                                                    <Tooltip formatter={(v, _nome, props) => {
                                                        const capital = numero(props?.payload?.capital);
                                                        const detalheCapital = capital > 0 ? ` - ${formatarMoeda(capital)}` : "";
                                                        return [`${formatarNumero(v)}${detalheCapital}`, "Pendências"];
                                                    }} />
                                                    <Bar dataKey="valor" fill="#dc2626" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    {/* grafico curva ABC do estoque */}
                                    <ChartCard titulo="Curva ABC do estoque" icon={BarChart3}>
                                        {curvaAbc.length === 0 ? <EmptyChart /> : (
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <BarChart data={curvaAbc}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="nome" tickFormatter={formatarRotuloCurto} {...EIXO_X_LABELS_ROTACIONADOS} />
                                                    <YAxis width={78} tickFormatter={formatarMoedaCompacta} />
                                                    <Tooltip formatter={(v) => [formatarMoeda(v), "Valor em estoque"]} />
                                                    <Bar dataKey="valor" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </ChartCard>

                                    {/* grafico servicos mais usados */}
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
