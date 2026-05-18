import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { API_URL } from "../../App";
import css from "./VisualizarCarro.module.css";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
  <rect width="900" height="520" fill="#f1f5f9"/>
  <text x="450" y="260" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="34" font-weight="700" fill="#64748b">Sem imagem</text>
</svg>
`)}`;

function imagensVeiculo(idVeiculo, numeroFoto = 1) {
    if (!idVeiculo) return [IMAGEM_PADRAO];

    const versao = Date.now();

    return [
        `${API_URL}/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
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

function testarImagem(urls) {
    return new Promise((resolve) => {
        let indice = 0;

        function tentar() {
            if (indice >= urls.length) {
                resolve(null);
                return;
            }

            const img = new Image();
            img.onload = () => resolve(urls[indice]);
            img.onerror = () => {
                indice += 1;
                tentar();
            };
            img.src = urls[indice];
        }

        tentar();
    });
}

function textoCombustivel(valor) {
    if (String(valor) === "0") return "Flex";
    if (String(valor) === "1") return "Gasolina";
    if (String(valor) === "2") return "Etanol";
    if (String(valor) === "3") return "Diesel";
    return valor || "Nao informado";
}

function textoCambio(valor) {
    if (String(valor) === "0") return "Manual";
    if (String(valor) === "1") return "Automatico";
    return valor || "Nao informado";
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function apenasNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function formatarCpf(valor) {
    const numeros = apenasNumeros(valor).slice(0, 11);

    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

function normalizarDescontoAVista(data = {}) {
    const empresa = data.empresas?.[0] || data.empresa?.[0] || data.empresa || data[0] || data;
    const valor =
        empresa.DESCONTO_A_VISTA ??
        empresa.desconto_a_vista ??
        empresa.descontoAVista ??
        empresa.desconto ??
        empresa.porcentagem ??
        0;

    const numero = Number(valor);

    return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

function normalizarPorcentagemJuro(data = {}) {
    const empresa = data.empresas?.[0] || data.empresa?.[0] || data.empresa || data[0] || data;
    const valor =
        empresa.PORCENTAGEM_JURO ??
        empresa.porcentagem_juro ??
        empresa.porcentagemJuro ??
        empresa.juro ??
        empresa.JURO;

    const numero = Number(valor);

    return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function calcularValorAVista(valor, descontoAVista) {
    const preco = Number(valor || 0);
    const desconto = Number(descontoAVista || 0);

    if (!Number.isFinite(preco) || !Number.isFinite(desconto) || desconto <= 0) {
        return preco;
    }

    return preco - (preco * desconto) / 100;
}

function calcularFinanciamento(valor, porcentagemJuro, parcelas) {
    const preco = Number(valor || 0);
    const juro = Number(porcentagemJuro || 0) / 100;
    const quantidadeParcelas = Number(parcelas || 0);

    if (!Number.isFinite(preco) || preco <= 0 || quantidadeParcelas <= 0) {
        return { parcelaMensal: 0, valorTotal: 0 };
    }

    if (!Number.isFinite(juro) || juro <= 0) {
        return {
            parcelaMensal: preco / quantidadeParcelas,
            valorTotal: preco,
        };
    }

    const parcelaMensal = preco * juro / (1 - (1 + juro) ** -quantidadeParcelas);

    return {
        parcelaMensal,
        valorTotal: parcelaMensal * quantidadeParcelas,
    };
}

export default function VisualizarCarro({ modoVendedor = false }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [carro, setCarro] = useState(null);
    const imagemSemFoto = { numero: 0, urls: [IMAGEM_PADRAO], placeholder: true };
    const [imagens, setImagens] = useState([imagemSemFoto]);
    const [imagemSelecionada, setImagemSelecionada] = useState(imagemSemFoto);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [modalCompraAberta, setModalCompraAberta] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [erroCompra, setErroCompra] = useState("");
    const [gerandoQrCode, setGerandoQrCode] = useState(false);
    const [compraConcluida, setCompraConcluida] = useState(false);
    const [tempoQrCode, setTempoQrCode] = useState(60);
    const [descontoAVista, setDescontoAVista] = useState(0);
    const [porcentagemJuro, setPorcentagemJuro] = useState(null);
    const [carregandoJuro, setCarregandoJuro] = useState(false);
    const [formaPagamento, setFormaPagamento] = useState(0);
    const [parcelas, setParcelas] = useState(12);
    const [cpfClienteVenda, setCpfClienteVenda] = useState("");
    const [mensagemVenda, setMensagemVenda] = useState("");
    const [mensagemSucessoPagina, setMensagemSucessoPagina] = useState("");

    async function carregarImagensDisponiveis(idVeiculo) {
        if (!idVeiculo) {
            setImagens([imagemSemFoto]);
            setImagemSelecionada(imagemSemFoto);
            return;
        }

        const primeiraImagem = {
            numero: 1,
            urls: [...imagensVeiculo(idVeiculo, 1), IMAGEM_PADRAO],
            placeholder: false,
        };

        setImagens([primeiraImagem]);
        setImagemSelecionada(primeiraImagem);

        const encontradas = [];

        for (let numero = 1; numero <= 10; numero += 1) {
            const urls = imagensVeiculo(idVeiculo, numero);
            const urlValida = await testarImagem(urls);

            if (!urlValida) break;

            encontradas.push({
                numero,
                urls: [urlValida],
                placeholder: false,
            });

            setImagens([...encontradas]);

            if (numero === 1) {
                setImagemSelecionada(encontradas[0]);
            }
        }

        const listaFinal = encontradas.length > 0 ? encontradas : [imagemSemFoto];

        setImagens(listaFinal);
        setImagemSelecionada(listaFinal[0]);
    }

    useEffect(() => {
        async function buscarVeiculo() {
            try {
                setCarregando(true);
                setErro("");

                const response = await fetch(`${API_URL}/buscar_veiculo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ id_veiculo: id }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setErro(data.mensagem || "Nao foi possivel carregar o veiculo.");
                    return;
                }

                const veiculo = data.veiculos?.[0] || data[0] || data;

                if (!veiculo?.ID_VEICULO) {
                    setErro("Veiculo nao encontrado.");
                    return;
                }

                setCarro(veiculo);
                carregarImagensDisponiveis(veiculo.ID_VEICULO);

                await carregarDescontoAVistaEmpresa();
                if (modoVendedor) {
                    await carregarTaxaJuroEmpresa();
                }
            } catch {
                setErro("Erro ao conectar com o servidor.");
            } finally {
                setCarregando(false);
            }
        }

        buscarVeiculo();
    }, [id, modoVendedor]);

    async function carregarDescontoAVistaEmpresa() {
        try {
            const rotas = ["/verporcentagem_desconto", "/verdadosempresa"];

            for (const rota of rotas) {
                const responseDesconto = await fetch(`${API_URL}${rota}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (responseDesconto.ok) {
                    const dataDesconto = await responseDesconto.json();
                    const desconto = normalizarDescontoAVista(dataDesconto);

                    if (desconto > 0) {
                        setDescontoAVista(desconto);
                        return desconto;
                    }
                }
            }

            setDescontoAVista(0);
            return 0;
        } catch {
            setDescontoAVista(0);
            return 0;
        }
    }

    async function carregarTaxaJuroEmpresa() {
        try {
            setCarregandoJuro(true);

            const rotas = ["/verdadosempresa", "/verporcentagem_juro"];

            for (const rota of rotas) {
                const responseEmpresa = await fetch(`${API_URL}${rota}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (responseEmpresa.ok) {
                    const dataEmpresa = await responseEmpresa.json();
                    const taxa = normalizarPorcentagemJuro(dataEmpresa);

                    if (taxa !== null) {
                        setPorcentagemJuro(taxa);
                        return taxa;
                    }
                }
            }

            setPorcentagemJuro(null);
            return null;
        } catch {
            setPorcentagemJuro(null);
            return null;
        } finally {
            setCarregandoJuro(false);
        }
    }

    useEffect(() => {
        return () => {
            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
            }
        };
    }, [qrCodeUrl]);

    useEffect(() => {
        if (!modalCompraAberta || !qrCodeUrl || erroCompra || gerandoQrCode || compraConcluida) {
            return;
        }

        setTempoQrCode(60);

        const contador = setInterval(() => {
            setTempoQrCode((tempoAtual) => Math.max(0, tempoAtual - 1));
        }, 1000);

        const expiracao = setTimeout(() => {
            finalizarCompraPix();
        }, 60000);

        return () => {
            clearInterval(contador);
            clearTimeout(expiracao);
        };
    }, [modalCompraAberta, qrCodeUrl, erroCompra, gerandoQrCode, compraConcluida]);

    async function abrirCompra() {
        if (!carro?.ID_VEICULO) return;

        if (modoVendedor) {
            setErroCompra("");
            setMensagemVenda("");
            setMensagemSucessoPagina("");
            setCompraConcluida(false);
            setTempoQrCode(60);
            setFormaPagamento(0);
            setParcelas(12);
            setCpfClienteVenda("");
            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }
            setModalCompraAberta(true);
            return;
        }

        try {
            setErroCompra("");
            setCompraConcluida(false);
            setTempoQrCode(60);
            setGerandoQrCode(true);
            setModalCompraAberta(true);

            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }

            const response = await fetch(`${API_URL}/adicionar_venda`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                    forma_pagamento: 0,
                }),
            });

            const tipoResposta = response.headers.get("content-type") || "";

            if (!response.ok || tipoResposta.includes("application/json")) {
                const data = tipoResposta.includes("application/json") ? await response.json() : null;
                setErroCompra(data?.mensagem || "Não foi possível gerar o QR Code da compra.");
                return;
            }

            const imagemQrCode = await response.blob();
            setQrCodeUrl(URL.createObjectURL(imagemQrCode));
        } catch {
            setErroCompra("Erro ao conectar com o servidor para gerar o QR Code.");
        } finally {
            setGerandoQrCode(false);
        }
    }

    function fecharCompra() {
        setModalCompraAberta(false);
        setErroCompra("");
        setCompraConcluida(false);
        setMensagemVenda("");
        setTempoQrCode(60);
    }

    function finalizarCompraPix() {
        setModalCompraAberta(false);
        setErroCompra("");
        setCompraConcluida(false);
        setMensagemVenda("");
        setTempoQrCode(60);

        if (qrCodeUrl) {
            URL.revokeObjectURL(qrCodeUrl);
            setQrCodeUrl("");
        }

        setMensagemSucessoPagina(
            modoVendedor
                ? "Venda a vista concluida com sucesso."
                : "Carro comprado com sucesso."
        );
    }

    async function registrarVenda() {
        if (!carro?.ID_VEICULO || gerandoQrCode) return;

        if (apenasNumeros(cpfClienteVenda).length !== 11) {
            setErroCompra("Informe o CPF do cliente para registrar a venda.");
            return;
        }

        try {
            setErroCompra("");
            setMensagemVenda("");
            setMensagemSucessoPagina("");
            setCompraConcluida(false);
            setGerandoQrCode(true);
            setTempoQrCode(60);

            if (Number(formaPagamento) === 1 && porcentagemJuro === null) {
                const taxa = await carregarTaxaJuroEmpresa();

                if (taxa === null) {
                    setErroCompra("Nao foi possivel carregar a taxa de juros cadastrada pela empresa.");
                    return;
                }
            }

            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }

            const payload = {
                id_veiculo: carro.ID_VEICULO,
                cpf_cliente: apenasNumeros(cpfClienteVenda),
                forma_pagamento: Number(formaPagamento),
            };

            if (Number(formaPagamento) === 1) {
                payload.parcela = Number(parcelas);
            }

            const response = await fetch(`${API_URL}/adicionar_venda`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const tipoResposta = response.headers.get("content-type") || "";

            if (!response.ok || tipoResposta.includes("application/json")) {
                const data = tipoResposta.includes("application/json") ? await response.json() : null;

                if (!response.ok) {
                    setErroCompra(data?.mensagem || "Nao foi possivel registrar a venda.");
                    return;
                }

                setModalCompraAberta(false);
                setMensagemSucessoPagina(data?.mensagem || "Venda concluida com sucesso.");
                return;
            }

            const imagemQrCode = await response.blob();
            setQrCodeUrl(URL.createObjectURL(imagemQrCode));
            setMensagemVenda("Venda a vista registrada. Use o QR Code Pix para o pagamento.");
        } catch {
            setErroCompra("Erro ao conectar com o servidor para registrar a venda.");
        } finally {
            setGerandoQrCode(false);
        }
    }

    function concluirCompra() {
        finalizarCompraPix();
    }

    if (carregando) {
        return <div className={css.carregando}>Carregando...</div>;
    }

    if (erro || !carro) {
        return (
            <div className={css.estado}>
                <div className={css.erro}>{erro || "Veiculo nao encontrado."}</div>
                <button type="button" className={css.comprar} onClick={() => navigate("/catalogo")}>
                    Voltar para o catalogo
                </button>
            </div>
        );
    }

    const detalhes = [
        {
            icon: "speedometer2",
            title: "QUILOMETRAGEM",
            value: `${Number(carro.KM || 0).toLocaleString("pt-BR")} km`,
        },
        {
            icon: "gear",
            title: "CAMBIO",
            value: textoCambio(carro.CAMBIO),
        },
        {
            icon: "fuel-pump",
            title: "COMBUSTIVEL",
            value: textoCombustivel(carro.COMBUSTIVEL),
        },
        {
            icon: "palette",
            title: "COR",
            value: carro.COR || "Nao informado",
        },
    ];
    const valorAVista = calcularValorAVista(carro.PRECO_VENDA, descontoAVista);
    const temDescontoAVista = Number(descontoAVista) > 0 && valorAVista < Number(carro.PRECO_VENDA || 0);
    const taxaJuroCarregada = porcentagemJuro !== null;
    const financiamento = taxaJuroCarregada
        ? calcularFinanciamento(carro.PRECO_VENDA, porcentagemJuro, parcelas)
        : { parcelaMensal: 0, valorTotal: Number(carro.PRECO_VENDA || 0) };
    const valorModal = Number(formaPagamento) === 0 ? valorAVista : financiamento.valorTotal;
    const deveMostrarRetornoVenda = gerandoQrCode || Boolean(erroCompra) || Boolean(qrCodeUrl) || compraConcluida;
    const parceladoSemTaxa = Number(formaPagamento) === 1 && (!taxaJuroCarregada || carregandoJuro);

    return (
        <main className={css.pagina}>
            <section className={css.hero}>
                <div className={css.conteudo}>
                    <div className={css.barraTopo}>
                        <button className={css.voltar} onClick={() => navigate("/catalogo")}>
                            Voltar ao catalogo
                        </button>

                    </div>

                    {mensagemSucessoPagina && (
                        <div className={css.alertaSucesso}>
                            {mensagemSucessoPagina}
                        </div>
                    )}

                    <div className={css.gridPrincipal}>
                        <div className={css.galeria}>
                            <div className={css.imagemPrincipal}>
                            <img
                                src={imagemSelecionada.urls[0]}
                                data-indice="0"
                                onError={(e) => tentarProximaImagem(e, imagemSelecionada.urls)}
                                alt={`${carro.MARCA || "Veiculo"} ${carro.MODELO || ""}`}
                            />
                        </div>

                            <div className={css.miniaturas}>
                            {!imagemSelecionada.placeholder &&
                                imagens.map((img, index) => (
                                    <img
                                        key={img.numero}
                                        src={img.urls[0]}
                                        data-indice="0"
                                        onError={(e) => tentarProximaImagem(e, img.urls)}
                                        onClick={() => setImagemSelecionada(img)}
                                        className={imagemSelecionada.numero === img.numero ? css.miniaturaAtiva : ""}
                                        alt={`Imagem ${index + 1}`}
                                    />
                                ))}
                        </div>
                    </div>

                        <aside className={css.painelCompra}>
                            <div className={css.painelTopo}>
                                <span className={css.etiqueta}>Disponivel</span>
                                <span className={css.condicao}>Estoque WebCar</span>
                            </div>

                            <h1>{carro.MARCA} {carro.MODELO}</h1>

                            <div className={css.precoBox}>
                                <span>Valor no Pix a vista</span>
                                {temDescontoAVista && (
                                    <del>{formatarPreco(carro.PRECO_VENDA)}</del>
                                )}
                                <strong>{formatarPreco(valorAVista)}</strong>
                                {temDescontoAVista && (
                                    <small>{descontoAVista}% de desconto aplicado</small>
                                )}
                            </div>

                            <div className={css.resumoRapido}>
                                <div>
                                    <span>Ano</span>
                                    <strong>{carro.ANO_MODELO || "Nao informado"}</strong>
                                </div>
                                <div>
                                    <span>Quilometragem</span>
                                    <strong>{Number(carro.KM || 0).toLocaleString("pt-BR")} km</strong>
                                </div>
                                <div>
                                    <span>Cambio</span>
                                    <strong>{textoCambio(carro.CAMBIO)}</strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={css.comprar}
                                onClick={abrirCompra}
                            >
                                {modoVendedor ? "Vender" : "Comprar"}
                            </button>

                            <div className={css.garantias}>
                                <span><i className="bi bi-qr-code"></i> Pagamento via Pix</span>
                                {modoVendedor && (
                                    <span><i className="bi bi-credit-card"></i> Venda a vista ou parcelada</span>
                                )}
                                <span><i className="bi bi-shield-check"></i> Dados do veiculo conferidos</span>
                                {!modoVendedor && (
                                    <span><i className="bi bi-check2-circle"></i> Compra simulada para teste</span>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section className={css.detalhesSecao}>
                <div className={css.conteudo}>
                    <div className={css.detalhesGrid}>
                        {detalhes.map((item) => (
                            <div className={css.detalheCard} key={item.title}>
                                <i className={`bi bi-${item.icon}`}></i>
                                <span>{item.title}</span>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>

                    <div className={css.descricao}>
                        <div>
                            <span className={css.etiquetaEscura}>Detalhes</span>
                            <h2>{carro.MARCA} {carro.MODELO}</h2>
                        </div>

                        <p>
                            {carro.MARCA} {carro.MODELO}, ano {carro.ANO_MODELO}, cor{" "}
                            {carro.COR || "nao informada"}, com{" "}
                            {Number(carro.KM || 0).toLocaleString("pt-BR")} km, cambio{" "}
                            {textoCambio(carro.CAMBIO)} e combustivel {textoCombustivel(carro.COMBUSTIVEL)}.
                        </p>
                    </div>
                </div>
            </section>

            {modalCompraAberta && (
                <div className={css.modalFundo}>
                    <div className={css.modalCompra}>
                        <div className={css.modalTopo}>
                            <div>
                                <span className={css.etiquetaEscura}>{modoVendedor ? "Venda" : "Pagamento Pix"}</span>
                                <h3>{modoVendedor ? "Registrar venda" : "Finalize sua compra"}</h3>
                            </div>
                            <button
                                type="button"
                                className={css.fecharIcone}
                                onClick={fecharCompra}
                                aria-label="Fechar modal"
                            >
                                x
                            </button>
                        </div>

                        <div className={css.resumoModal}>
                            <strong>{carro.MARCA} {carro.MODELO}</strong>
                            <span>{parceladoSemTaxa ? "Carregando juros" : formatarPreco(valorModal)}</span>
                        </div>

                        {modoVendedor && (
                            <div className={css.formaPagamento}>
                                <label className={css.campoVenda}>
                                    <span>CPF do cliente</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={14}
                                        value={cpfClienteVenda}
                                        onChange={(e) => setCpfClienteVenda(formatarCpf(e.target.value))}
                                        placeholder="000.000.000-00"
                                    />
                                </label>

                                <div className={css.opcoesPagamento}>
                                    <button
                                        type="button"
                                        className={Number(formaPagamento) === 0 ? css.opcaoAtiva : ""}
                                        onClick={() => setFormaPagamento(0)}
                                    >
                                        A vista
                                    </button>
                                    <button
                                        type="button"
                                        className={Number(formaPagamento) === 1 ? css.opcaoAtiva : ""}
                                        onClick={() => {
                                            setFormaPagamento(1);
                                            if (porcentagemJuro === null) {
                                                carregarTaxaJuroEmpresa();
                                            }
                                        }}
                                    >
                                        Parcelado
                                    </button>
                                </div>

                                {Number(formaPagamento) === 1 && (
                                    <label className={css.campoVenda}>
                                        <span>Parcelas</span>
                                        <select
                                            value={parcelas}
                                            onChange={(e) => setParcelas(Number(e.target.value))}
                                            disabled={!taxaJuroCarregada || carregandoJuro}
                                        >
                                            {[6, 12, 18, 24, 36, 48, 60].map((quantidade) => (
                                                <option value={quantidade} key={quantidade}>
                                                    {taxaJuroCarregada
                                                        ? `${quantidade}x de ${formatarPreco(calcularFinanciamento(carro.PRECO_VENDA, porcentagemJuro, quantidade).parcelaMensal)}`
                                                        : `${quantidade}x`}
                                                </option>
                                            ))}
                                        </select>
                                        {!taxaJuroCarregada && (
                                            <small className={css.avisoTaxa}>
                                                {carregandoJuro
                                                    ? "Carregando taxa de juros da empresa."
                                                    : "Nao foi possivel carregar a taxa de juros da empresa."}
                                            </small>
                                        )}
                                    </label>
                                )}

                                <div className={css.resumoPagamento}>
                                    <div>
                                        <span>Forma de pagamento</span>
                                        <strong>{Number(formaPagamento) === 0 ? "A vista no Pix" : `${parcelas} parcelas`}</strong>
                                    </div>
                                    {Number(formaPagamento) === 0 && temDescontoAVista && (
                                        <>
                                            <div>
                                                <span>Valor original</span>
                                                <strong className={css.valorRiscado}>{formatarPreco(carro.PRECO_VENDA)}</strong>
                                            </div>
                                            <div>
                                                <span>Desconto a vista</span>
                                                <strong className={css.valorDesconto}>{descontoAVista}%</strong>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <span>{Number(formaPagamento) === 0 ? "Valor com desconto" : "Valor total financiado"}</span>
                                        <strong>{parceladoSemTaxa ? "Carregando juros" : formatarPreco(valorModal)}</strong>
                                    </div>
                                    {Number(formaPagamento) === 1 && (
                                        <div>
                                            <span>Juros</span>
                                            <strong>{taxaJuroCarregada ? `${porcentagemJuro}%` : "Carregando"}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {deveMostrarRetornoVenda && (
                            <div className={css.qrCodeArea}>
                                {gerandoQrCode && <p>{modoVendedor ? "Registrando venda..." : "Gerando QR Code..."}</p>}

                                {!gerandoQrCode && erroCompra && (
                                    <p className={css.erroCompra}>{erroCompra}</p>
                                )}

                                {!gerandoQrCode && qrCodeUrl && !erroCompra && (
                                    <>
                                        <img src={qrCodeUrl} alt="QR Code Pix para pagamento" />
                                        {mensagemVenda && (
                                            <p className={css.mensagemQr}>
                                                {mensagemVenda}
                                            </p>
                                        )}
                                        <p className={css.expiracaoQr}>
                                            QR Code expira em {tempoQrCode}s
                                        </p>
                                    </>
                                )}

                                {compraConcluida && (
                                    <p className={css.sucessoCompra}>
                                        {mensagemVenda || "Compra concluida com sucesso. Pagamento simulado como aprovado."}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className={css.modalAcoes}>
                            <button
                                type="button"
                                className={css.botaoFechar}
                                onClick={fecharCompra}
                            >
                                Fechar
                            </button>
                            <button
                                type="button"
                                className={css.botaoConcluir}
                                onClick={modoVendedor && !qrCodeUrl ? registrarVenda : concluirCompra}
                                disabled={modoVendedor ? gerandoQrCode || compraConcluida || parceladoSemTaxa : !qrCodeUrl || gerandoQrCode || compraConcluida}
                            >
                                {modoVendedor && qrCodeUrl ? "Concluir" : modoVendedor ? "Registrar venda" : "Concluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
