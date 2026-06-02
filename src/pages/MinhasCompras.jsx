import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { API_URL } from "../App";
import css from "./MinhasCompras.module.css";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#f1f5f9"/>
  <text x="320" y="180" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="28" font-weight="700" fill="#64748b">Sem imagem</text>
</svg>
`)}`;

function getCampo(objeto, nomes, fallback = "") {
    for (const nome of nomes) {
        if (objeto?.[nome] !== undefined && objeto?.[nome] !== null && objeto?.[nome] !== "") {
            return objeto[nome];
        }
    }

    return fallback;
}

function imagensVeiculo(idVeiculo) {
    if (!idVeiculo) return [IMAGEM_PADRAO];

    const versao = Date.now();

    return [
        `${API_URL}/uploads/veiculo/${idVeiculo}/foto_1.jpg?v=${versao}`,
        `${API_URL}/static/uploads/veiculo/${idVeiculo}/foto_1.jpg?v=${versao}`,
        `${API_URL}/static/veiculo/${idVeiculo}/foto_1.jpg?v=${versao}`,
        `${API_URL}/veiculo/${idVeiculo}/foto_1.jpg?v=${versao}`,
        IMAGEM_PADRAO,
    ];
}

function tentarProximaImagem(e, imagens) {
    const indiceAtual = Number(e.currentTarget.dataset.indice || 0);
    const proximoIndice = indiceAtual + 1;

    if (proximoIndice < imagens.length) {
        e.currentTarget.dataset.indice = String(proximoIndice);
        e.currentTarget.src = imagens[proximoIndice];
    }
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarMoedaDigitada(valor) {
    const apenasNumeros = String(valor || "").replace(/\D/g, "");
    const centavos = Number(apenasNumeros || 0) / 100;

    return centavos.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function moedaParaNumero(valor) {
    const apenasNumeros = String(valor || "").replace(/\D/g, "");

    return Number(apenasNumeros || 0) / 100;
}

function formatarData(valor) {
    if (!valor) return "Não informado";

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

function formaPagamentoTexto(valor) {
    return Number(valor) === 1 ? "Financiamento" : "à vista";
}

function statusParcela(parcela) {
    return Number(getCampo(parcela, ["status", "STATUS"], 0));
}

function parcelaQuitada(parcela) {
    return [1, 2].includes(statusParcela(parcela));
}

function textoStatusParcela(parcela) {
    const status = statusParcela(parcela);
    const pagamento = getCampo(parcela, ["data_pagamento", "DATA_PAGAMENTO"]);

    if (status === 2) return "Amortizada";
    if (status === 1) return `Pago em ${formatarData(pagamento)}`;

    return "Em aberto";
}

function normalizarCompra(compra) {
    const parcelas = getCampo(compra, ["parcelas", "PARCELAS", "itens_financiamento", "ITENS_FINANCIAMENTO"], []);

    return {
        idVenda: getCampo(compra, ["id_venda", "ID_VENDA"]),
        idVeiculo: getCampo(compra, ["id_veiculo", "ID_VEICULO"]),
        marca: getCampo(compra, ["marca", "MARCA"], "Marca"),
        modelo: getCampo(compra, ["modelo", "MODELO"], "Modelo"),
        anoModelo: getCampo(compra, ["ano_modelo", "ANO_MODELO"]),
        placa: getCampo(compra, ["placa", "PLACA"]),
        dataVenda: getCampo(compra, ["data_venda", "DATA_VENDA"]),
        valorVenda: Number(getCampo(compra, ["valor_venda", "VALOR_VENDA"], 0)),
        formaPagamento: getCampo(compra, ["forma_pagamento", "FORMA_PAGAMENTO"], 0),
        vendedor: getCampo(compra, ["vendedor", "VENDEDOR", "nome_vendedor", "NOME_VENDEDOR"], "Não informado"),
        financiamento: {
            idFinanciamento: getCampo(compra, ["id_financiamento", "ID_FINANCIAMENTO"]),
            valorOriginal: Number(getCampo(compra, ["valor_original", "VALOR_ORIGINAL", "valor_venda_original", "VALOR_VENDA_ORIGINAL"], 0)),
            valorFinanciado: Number(getCampo(compra, ["valor_financiado", "VALOR_FINANCIADO", "valor_venda_financiamento", "VALOR_VENDA_FINANCIAMENTO"], 0)),
        },
        parcelas: Array.isArray(parcelas) ? parcelas : [],
    };
}

export default function MinhasCompras() {
    const [compras, setCompras] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [parcelasAbertas, setParcelasAbertas] = useState({});
    const [qrCodeParcela, setQrCodeParcela] = useState(null);
    const [tempoQrCode, setTempoQrCode] = useState(60);
    const [baixandoParcela, setBaixandoParcela] = useState(false);
    const [mensagemPagamento, setMensagemPagamento] = useState("");
    const [erroPagamento, setErroPagamento] = useState("");
    const [amortizacao, setAmortizacao] = useState(null);
    const [salvandoAmortizacao, setSalvandoAmortizacao] = useState(false);
    const [mensagemAmortizacao, setMensagemAmortizacao] = useState("");
    const [erroAmortizacao, setErroAmortizacao] = useState("");

    async function carregarCompras({ mostrarCarregando = true } = {}) {
        try {
            if (mostrarCarregando) setCarregando(true);
            setErro("");

            const response = await fetch(`${API_URL}/minhas_compras`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErro(data.mensagem || "Não foi possível carregar suas compras.");
                setCompras([]);
                return;
            }

            setCompras((data.compras || data.vendas || data || []).map(normalizarCompra));
        } catch {
            setErro("Não foi possível conectar com o servidor.");
            setCompras([]);
        } finally {
            if (mostrarCarregando) setCarregando(false);
        }
    }

    useEffect(() => {
        carregarCompras();
    }, []);

    useEffect(() => {
        if (!qrCodeParcela || baixandoParcela || mensagemPagamento) {
            return;
        }

        setTempoQrCode(60);

        const contador = setInterval(() => {
            setTempoQrCode((tempoAtual) => Math.max(0, tempoAtual - 1));
        }, 1000);

        const expiracao = setTimeout(() => {
            concluirPagamentoParcela();
        }, 60000);

        return () => {
            clearInterval(contador);
            clearTimeout(expiracao);
        };
    }, [qrCodeParcela, baixandoParcela, mensagemPagamento]);

    function alternarParcelas(idVenda) {
        setParcelasAbertas((atuais) => ({
            ...atuais,
            [idVenda]: !atuais[idVenda],
        }));
    }

    function urlQrCodeParcela(compra, parcela) {
        const urlInformada = getCampo(parcela, ["qrcode_url", "qr_code_url", "QRCODE_URL", "QR_CODE_URL"]);
        const numero = getCampo(parcela, ["numero_parcela", "NUMERO_PARCELA"]);

        if (urlInformada) return urlInformada;
        if (!compra.financiamento.idFinanciamento || !numero) return "";

        return `${API_URL}/qrcode_financiamento/${compra.financiamento.idFinanciamento}/${numero}`;
    }

    function abrirPagamentoParcela(compra, parcela, qrcodeUrl) {
        setQrCodeParcela({
            numero: getCampo(parcela, ["numero_parcela", "NUMERO_PARCELA"]),
            valor: getCampo(parcela, ["valor_parcela", "VALOR_PARCELA"], 0),
            vencimento: getCampo(parcela, ["data_vencimento", "DATA_VENCIMENTO"]),
            url: qrcodeUrl,
            idFinanciamento: compra.financiamento.idFinanciamento,
        });
        setTempoQrCode(60);
        setMensagemPagamento("");
        setErroPagamento("");
        setBaixandoParcela(false);
    }

    function fecharPagamentoParcela() {
        setQrCodeParcela(null);
        setTempoQrCode(60);
        setMensagemPagamento("");
        setErroPagamento("");
        setBaixandoParcela(false);
    }

    async function concluirPagamentoParcela() {
        if (!qrCodeParcela || baixandoParcela || mensagemPagamento) return;

        try {
            setBaixandoParcela(true);
            setErroPagamento("");

            const response = await fetch(`${API_URL}/adicionar_baixa/${qrCodeParcela.idFinanciamento}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    parcela: Number(qrCodeParcela.numero),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroPagamento(data.mensagem || "Não foi possível confirmar o pagamento.");
                return;
            }

            setMensagemPagamento(data.mensagem || "Pagamento concluido com sucesso.");
            await carregarCompras({ mostrarCarregando: false });

            setTimeout(() => {
                fecharPagamentoParcela();
            }, 1400);
        } catch {
            setErroPagamento("Não foi possível conectar com o servidor para confirmar o pagamento.");
        } finally {
            setBaixandoParcela(false);
        }
    }

    // funcao da amortizacao no front
    // funcao da mortizacao no front
    function abrirAmortizacao(compra) {
        setAmortizacao({
            idFinanciamento: compra.financiamento.idFinanciamento,
            veiculo: `${compra.marca} ${compra.modelo}`,
            valorFinanciado: compra.financiamento.valorFinanciado || compra.valorVenda,
            parcelasAbertas: compra.parcelas.filter((parcela) => !parcelaQuitada(parcela)).length,
            valor: "",
            tipo: "1",
        });
        setMensagemAmortizacao("");
        setErroAmortizacao("");
        setSalvandoAmortizacao(false);
    }

    // fecha modal de amortizacao
    function fecharAmortizacao() {
        if (salvandoAmortizacao) return;

        setAmortizacao(null);
        setMensagemAmortizacao("");
        setErroAmortizacao("");
        setSalvandoAmortizacao(false);
    }

    // atualiza campos da amortizacao
    function atualizarAmortizacao(campo, valor) {
        setErroAmortizacao("");
        setAmortizacao((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor,
        }));
    }

    // envia amortizacao para o backend
    async function confirmarAmortizacao(e) {
        e.preventDefault();

        if (!amortizacao || salvandoAmortizacao) return;

        const valorAmortizado = moedaParaNumero(amortizacao.valor);

        if (!amortizacao.idFinanciamento) {
            setErroAmortizacao("Financiamento nao encontrado para esta compra.");
            return;
        }

        if (!Number.isFinite(valorAmortizado) || valorAmortizado <= 0) {
            setErroAmortizacao("Informe um valor de amortizacao maior que zero.");
            return;
        }

        try {
            setSalvandoAmortizacao(true);
            setErroAmortizacao("");
            setMensagemAmortizacao("");

            // chamada da rota de amortizacao
            const response = await fetch(`${API_URL}/amortizar/${amortizacao.idFinanciamento}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    tipo_amortizacao: Number(amortizacao.tipo),
                    valor_amortizado: valorAmortizado,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroAmortizacao(data.mensagem || "Nao foi possivel concluir a amortizacao.");
                return;
            }

            setMensagemAmortizacao(data.mensagem || "Amortizacao concluida com sucesso.");
            await carregarCompras({ mostrarCarregando: false });

            setTimeout(() => {
                fecharAmortizacao();
            }, 1400);
        } catch {
            setErroAmortizacao("Nao foi possivel conectar com o servidor para amortizar.");
        } finally {
            setSalvandoAmortizacao(false);
        }
    }

    const resumo = useMemo(() => {
        const totalInvestido = compras.reduce((total, compra) => total + Number(compra.valorVenda || 0), 0);
        const financiamentos = compras.filter((compra) => Number(compra.formaPagamento) === 1).length;
        const parcelasAbertas = compras.reduce((total, compra) => {
            return total + compra.parcelas.filter((parcela) => !parcelaQuitada(parcela)).length;
        }, 0);

        return { totalInvestido, financiamentos, parcelasAbertas };
    }, [compras]);

    return (
        <>
            <Header />

            <main className={css.pagina}>
                <section className={css.hero}>
                    <div>
                        <span className={css.kicker}>Area do cliente</span>
                        <h1>Minhas compras</h1>
                        <p>Acompanhe seus veículos comprados, valores, forma de pagamento e parcelas de financiamento.</p>
                    </div>

                    <div className={css.resumoHero}>
                        <strong>{compras.length}</strong>
                        <span>compras registradas</span>
                    </div>
                </section>

                <section className={css.cardsResumo}>
                    <div>
                        <span>Total comprado</span>
                        <strong>{formatarPreco(resumo.totalInvestido)}</strong>
                    </div>
                    <div>
                        <span>Financiamentos</span>
                        <strong>{resumo.financiamentos}</strong>
                    </div>
                    <div>
                        <span>Parcelas em aberto</span>
                        <strong>{resumo.parcelasAbertas}</strong>
                    </div>
                </section>

                {carregando && <p className={css.estado}>Carregando suas compras...</p>}
                {erro && <p className={css.erro}>{erro}</p>}

                {!carregando && !erro && compras.length === 0 && (
                    <p className={css.estado}>Você ainda não possui compras registradas.</p>
                )}

                <section className={css.lista}>
                    {compras.map((compra) => {
                        const imagens = imagensVeiculo(compra.idVeiculo);
                        const ehFinanciamento = Number(compra.formaPagamento) === 1;
                        const parcelasVisiveis = Boolean(parcelasAbertas[compra.idVenda]);
                        const parcelasPagas = compra.parcelas.filter(parcelaQuitada).length;
                        const parcelasEmAberto = Math.max(0, compra.parcelas.length - parcelasPagas);

                        return (
                            <article className={css.compra} key={compra.idVenda}>
                                <div className={css.topoCompra}>
                                    <img
                                        src={imagens[0]}
                                        data-indice="0"
                                        onError={(e) => tentarProximaImagem(e, imagens)}
                                        alt={`${compra.marca} ${compra.modelo}`}
                                    />

                                    <div>
                                        <span className={css.status}>{formaPagamentoTexto(compra.formaPagamento)}</span>
                                        <h2>{compra.marca} {compra.modelo}</h2>
                                        <p>{compra.anoModelo || "Ano não informado"} - {compra.placa || "Placa não informada"}</p>
                                    </div>

                                    <div className={css.valorCompra}>
                                        <span>Valor da compra</span>
                                        <strong>{formatarPreco(compra.valorVenda)}</strong>
                                    </div>
                                </div>

                                <div className={css.detalhes}>
                                    <div>
                                        <span>Data da compra</span>
                                        <strong>{formatarData(compra.dataVenda)}</strong>
                                    </div>
                                    <div>
                                        <span>Vendedor</span>
                                        <strong>{compra.vendedor}</strong>
                                    </div>
                                    {ehFinanciamento && (
                                        <>
                                            <div>
                                                <span>Valor original</span>
                                                <strong>{formatarPreco(compra.financiamento.valorOriginal)}</strong>
                                            </div>
                                            <div>
                                                <span>Total financiado</span>
                                                <strong>{formatarPreco(compra.financiamento.valorFinanciado || compra.valorVenda)}</strong>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {ehFinanciamento && (
                                    <div className={css.parcelas}>
                                        <div className={css.parcelasTopo}>
                                            <div>
                                                <h3>Parcelas do financiamento</h3>
                                                <span>{compra.parcelas.length} parcelas - {parcelasEmAberto} em aberto</span>
                                            </div>

                                            <div className={css.acoesParcelas}>
                                                <button
                                                    type="button"
                                                    className={css.botaoParcelas}
                                                    onClick={() => alternarParcelas(compra.idVenda)}
                                                >
                                                    {parcelasVisiveis ? "Ocultar parcelas" : "Ver parcelas"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className={css.botaoAmortizar}
                                                    disabled={!compra.financiamento.idFinanciamento || parcelasEmAberto === 0}
                                                    onClick={() => abrirAmortizacao(compra)}
                                                >
                                                    Amortizar
                                                </button>
                                            </div>
                                        </div>

                                        {parcelasVisiveis && compra.parcelas.length > 0 ? (
                                            <div className={css.gradeParcelas}>
                                                {compra.parcelas.map((parcela) => {
                                                    const numero = getCampo(parcela, ["numero_parcela", "NUMERO_PARCELA"]);
                                                    const valor = getCampo(parcela, ["valor_parcela", "VALOR_PARCELA"], 0);
                                                    const vencimento = getCampo(parcela, ["data_vencimento", "DATA_VENCIMENTO"]);
                                                    const pago = parcelaQuitada(parcela);
                                                    const qrcodeUrl = urlQrCodeParcela(compra, parcela);

                                                    return (
                                                        <div className={css.parcela} key={`${compra.idVenda}-${numero}`}>
                                                            <div>
                                                                <strong>Parcela {numero}</strong>
                                                                <span>{formatarData(vencimento)}</span>
                                                            </div>
                                                            <div>
                                                                <strong>{formatarPreco(valor)}</strong>
                                                                <span className={pago ? css.pago : css.aberto}>
                                                                    {textoStatusParcela(parcela)}
                                                                </span>
                                                                {!pago && qrcodeUrl && (
                                                                    <button
                                                                        type="button"
                                                                        className={css.botaoQrCode}
                                                                        onClick={() => abrirPagamentoParcela(compra, parcela, qrcodeUrl)}
                                                                    >
                                                                        Pagar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : parcelasVisiveis ? (
                                            <p className={css.estadoInterno}>Nenhuma parcela encontrada para este financiamento.</p>
                                        ) : null}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            </main>

            {qrCodeParcela && (
                <div className={css.modalFundo} role="dialog" aria-modal="true">
                    <div className={css.modalQrCode}>
                        <div className={css.modalTopo}>
                            <div>
                                <span>Parcela {qrCodeParcela.numero}</span>
                                <h2>Pagamento Pix</h2>
                            </div>
                            <button type="button" onClick={fecharPagamentoParcela} aria-label="Fechar">
                                x
                            </button>
                        </div>

                        {!mensagemPagamento && (
                            <img src={qrCodeParcela.url} alt={`QR Code da parcela ${qrCodeParcela.numero}`} />
                        )}

                        <div className={css.modalDetalhes}>
                            <span>Valor</span>
                            <strong>{formatarPreco(qrCodeParcela.valor)}</strong>
                            <span>Vencimento</span>
                            <strong>{formatarData(qrCodeParcela.vencimento)}</strong>
                        </div>

                        {!mensagemPagamento && !erroPagamento && (
                            <p className={css.expiracaoQr}>QR Code expira em {tempoQrCode}s</p>
                        )}

                        {erroPagamento && <p className={css.erroPagamento}>{erroPagamento}</p>}
                        {mensagemPagamento && <p className={css.sucessoPagamento}>{mensagemPagamento}</p>}

                        <div className={css.modalAcoes}>
                            <button type="button" className={css.botaoFechar} onClick={fecharPagamentoParcela}>
                                Fechar
                            </button>
                            <button
                                type="button"
                                className={css.botaoConcluir}
                                onClick={concluirPagamentoParcela}
                                disabled={baixandoParcela || Boolean(mensagemPagamento)}
                            >
                                {baixandoParcela ? "Confirmando..." : "Concluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* modal de amortizacao do financiamento */}
            {/* modal de mortizacao do financiamento */}
            {amortizacao && (
                <div className={css.modalFundo} role="dialog" aria-modal="true">
                    <form className={css.modalAmortizacao} onSubmit={confirmarAmortizacao}>
                        <div className={css.modalTopo}>
                            <div>
                                <span>{amortizacao.veiculo}</span>
                                <h2>Amortizar financiamento</h2>
                            </div>
                            <button type="button" onClick={fecharAmortizacao} aria-label="Fechar">
                                x
                            </button>
                        </div>

                        <div className={css.modalDetalhes}>
                            <span>Total financiado</span>
                            <strong>{formatarPreco(amortizacao.valorFinanciado)}</strong>
                            <span>Parcelas em aberto</span>
                            <strong>{amortizacao.parcelasAbertas}</strong>
                        </div>

                        <label className={css.campoAmortizacao}>
                            Valor a amortizar
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="R$ 0,00"
                                value={amortizacao.valor}
                                onChange={(e) => atualizarAmortizacao("valor", formatarMoedaDigitada(e.target.value))}
                            />
                        </label>

                        {/* tipos de amortizacao: valor menor ou menos parcelas */}
                        <div className={css.tipoAmortizacao}>
                            <button
                                type="button"
                                className={amortizacao.tipo === "1" ? css.tipoAmortizacaoAtivo : ""}
                                onClick={() => atualizarAmortizacao("tipo", "1")}
                            >
                                Valor menor
                            </button>

                            <button
                                type="button"
                                className={amortizacao.tipo === "2" ? css.tipoAmortizacaoAtivo : ""}
                                onClick={() => atualizarAmortizacao("tipo", "2")}
                            >
                                Menos parcelas
                            </button>
                        </div>

                        {erroAmortizacao && <p className={css.erroPagamento}>{erroAmortizacao}</p>}
                        {mensagemAmortizacao && <p className={css.sucessoPagamento}>{mensagemAmortizacao}</p>}

                        <div className={css.modalAcoes}>
                            <button type="button" className={css.botaoFechar} onClick={fecharAmortizacao}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={css.botaoConcluir}
                                disabled={salvandoAmortizacao || Boolean(mensagemAmortizacao)}
                            >
                                {salvandoAmortizacao ? "Amortizando..." : "Confirmar"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <Footer />
        </>
    );
}
