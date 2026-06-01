import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { API_URL } from "../App";
import css from "./MinhasVendas.module.css";

function getCampo(objeto, nomes, fallback = "") {
    for (const nome of nomes) {
        if (objeto?.[nome] !== undefined && objeto?.[nome] !== null && objeto?.[nome] !== "") {
            return objeto[nome];
        }
    }

    return fallback;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(valor) {
    if (!valor) return "Nao informado";
    const data = dataLocal(valor);
    if (Number.isNaN(data.getTime())) return String(valor);
    return data.toLocaleDateString("pt-BR");
}

function dataLocal(valor) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
        const [ano, mes, dia] = String(valor).split("-").map(Number);
        return new Date(ano, mes - 1, dia, 12);
    }

    return new Date(valor);
}

function normalizarVenda(venda) {
    return {
        idVenda: getCampo(venda, ["id_venda", "ID_VENDA"]),
        dataVenda: getCampo(venda, ["data_venda", "DATA_VENDA"]),
        cliente: getCampo(venda, ["cliente", "CLIENTE", "nome_cliente"], "Sem cliente"),
        veiculo: getCampo(venda, ["veiculo", "VEICULO"], `${getCampo(venda, ["marca", "MARCA"], "")} ${getCampo(venda, ["modelo", "MODELO"], "")}`.trim()),
        placa: getCampo(venda, ["placa", "PLACA"], "Nao informada"),
        formaPagamento: getCampo(venda, ["forma_pagamento", "FORMA_PAGAMENTO"], "Nao informado"),
        valorVenda: Number(getCampo(venda, ["valor_venda", "VALOR_VENDA"], 0)),
        lucroBruto: Number(getCampo(venda, ["lucro_bruto", "LUCRO_BRUTO", "lucro"], 0)),
    };
}

export default function MinhasVendas() {
    const [dados, setDados] = useState({ resumo: {}, vendas: [] });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarVendas() {
            try {
                setCarregando(true);
                setErro("");

                const response = await fetch(`${API_URL}/minhas_vendas`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setErro(data.mensagem || "Nao foi possivel carregar suas vendas.");
                    setDados({ resumo: {}, vendas: [] });
                    return;
                }

                setDados({
                    resumo: data.resumo || {},
                    vendas: (data.vendas || []).map(normalizarVenda),
                });
            } catch {
                setErro("Nao foi possivel conectar com o servidor.");
                setDados({ resumo: {}, vendas: [] });
            } finally {
                setCarregando(false);
            }
        }

        carregarVendas();
    }, []);

    const resumo = useMemo(() => {
        const qtd = Number(getCampo(dados.resumo, ["qtd_vendas"], 0)) || dados.vendas.length;
        const total = Number(getCampo(dados.resumo, ["valor_total_vendido"], 0)) || dados.vendas.reduce((soma, venda) => soma + venda.valorVenda, 0);
        const lucro = Number(getCampo(dados.resumo, ["lucro_bruto_total"], 0)) || dados.vendas.reduce((soma, venda) => soma + venda.lucroBruto, 0);

        return {
            qtd,
            total,
            lucro,
            ticket: qtd > 0 ? total / qtd : 0,
        };
    }, [dados]);

    return (
        <>
            <Header />

            <main className={css.pagina}>
                <section className={css.topo}>
                    <div>
                        <span>Area do vendedor</span>
                        <h1>Minhas vendas</h1>
                        <p>Veja as vendas que voce realizou e os clientes atendidos.</p>
                    </div>
                </section>

                {carregando ? (
                    <div className={css.estado}>Carregando vendas...</div>
                ) : erro ? (
                    <div className={css.erro}>{erro}</div>
                ) : (
                    <>
                        <section className={css.cards}>
                            <div>
                                <span>Vendas</span>
                                <strong>{resumo.qtd}</strong>
                            </div>
                            <div>
                                <span>Total vendido</span>
                                <strong>{formatarMoeda(resumo.total)}</strong>
                            </div>
                            <div>
                                <span>Lucro bruto</span>
                                <strong>{formatarMoeda(resumo.lucro)}</strong>
                            </div>
                            <div>
                                <span>Ticket medio</span>
                                <strong>{formatarMoeda(resumo.ticket)}</strong>
                            </div>
                        </section>

                        <section className={css.conteudo}>
                            <div className={css.lista}>
                                <div className={css.cardTopo}>
                                    <div>
                                        <h2>Vendas realizadas</h2>
                                        <p>Cliente, veiculo e valor de cada venda.</p>
                                    </div>
                                    <span>{dados.vendas.length} registros</span>
                                </div>

                                {dados.vendas.length === 0 ? (
                                    <p className={css.vazio}>Nenhuma venda registrada para voce ainda.</p>
                                ) : (
                                    <div className={css.tabelaWrap}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Data</th>
                                                    <th>Cliente</th>
                                                    <th>Veiculo</th>
                                                    <th>Placa</th>
                                                    <th>Pagamento</th>
                                                    <th>Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dados.vendas.map((venda) => (
                                                    <tr key={venda.idVenda}>
                                                        <td>{formatarData(venda.dataVenda)}</td>
                                                        <td>{venda.cliente}</td>
                                                        <td>{venda.veiculo}</td>
                                                        <td>{venda.placa}</td>
                                                        <td>{venda.formaPagamento}</td>
                                                        <td>{formatarMoeda(venda.valorVenda)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </>
    );
}
