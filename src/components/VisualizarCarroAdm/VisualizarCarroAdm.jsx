import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import css from "./VisualizarCarroAdm.module.css";
import { API_URL } from "../../App";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
  <rect width="900" height="520" fill="#f1f5f9"/>
  <text x="450" y="260" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="34" font-weight="700" fill="#64748b">Sem imagem</text>
</svg>
`)}`;

function imagensVeiculo(idVeiculo, numeroFoto = 1) {
    if (!idVeiculo) return [];

    const versao = Date.now();

    return [
        `${API_URL}/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
    ];
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

function tentarProximaImagem(e, imagens = []) {
    const indiceAtual = Number(e.currentTarget.dataset.indice || 0);
    const proximoIndice = indiceAtual + 1;

    if (proximoIndice < imagens.length) {
        e.currentTarget.dataset.indice = String(proximoIndice);
        e.currentTarget.src = imagens[proximoIndice];
    }
}

export default function VisualizarCarroAdm() {
    const location = useLocation();
    const navigate = useNavigate();

    const carro = location.state?.carro;

    const imagemSemFoto = { numero: 0, urls: [IMAGEM_PADRAO], placeholder: true };
    const [imagens, setImagens] = useState([imagemSemFoto]);
    const [imagemPrincipal, setImagemPrincipal] = useState(imagemSemFoto);

    const [itens, setItens] = useState([]);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    const [modalExcluir, setModalExcluir] = useState(false);
    const [itemExcluir, setItemExcluir] = useState(null);

    const totalManutencoes = itens.reduce(
        (total, item) => total + Number(item.valor_total || 0),
        0
    );

    useEffect(() => {
        buscarItens();
        carregarImagensDisponiveis();
    }, [carro]);

    async function carregarImagensDisponiveis() {
        if (!carro?.ID_VEICULO) {
            setImagens([imagemSemFoto]);
            setImagemPrincipal(imagemSemFoto);
            return;
        }

        const encontradas = [];

        for (let numero = 1; numero <= 10; numero += 1) {
            const urls = imagensVeiculo(carro.ID_VEICULO, numero);
            const urlValida = await testarImagem(urls);

            if (!urlValida) break;

            encontradas.push({
                numero,
                urls: [urlValida],
                placeholder: false,
            });
        }

        const listaFinal = encontradas.length > 0 ? encontradas : [imagemSemFoto];

        setImagens(listaFinal);
        setImagemPrincipal(listaFinal[0]);
    }

    async function buscarItens() {
        if (!carro?.ID_VEICULO) return;

        try {
            const response = await fetch(`${API_URL}/buscar_itens_manutencao_veiculo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setItens(data.itens || []);
            } else {
                setItens([]);
            }
        } catch (error) {
            console.error(error);
            setItens([]);
        }
    }

    function mostrarMensagem(texto, tipo) {
        setMensagem(texto);
        setTipoMensagem(tipo);

        setTimeout(() => {
            setMensagem("");
            setTipoMensagem("");
        }, 3000);
    }

    function abrirModalExcluir(item) {
        setItemExcluir(item);
        setModalExcluir(true);
    }

    function fecharModalExcluir() {
        setItemExcluir(null);
        setModalExcluir(false);
    }

    async function confirmarExcluirItem() {
        if (!itemExcluir?.id_item_manutencao) return;

        try {
            const response = await fetch(
                `${API_URL}/deletar_item_manutencao/${itemExcluir.id_item_manutencao}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                mostrarMensagem(data.mensagem || "Não foi possível excluir este item.", "erro");
                return;
            }

            mostrarMensagem(data.mensagem || "Item removido com sucesso.", "sucesso");
            fecharModalExcluir();
            buscarItens();
        } catch (error) {
            console.error(error);
            mostrarMensagem("Não foi possível excluir este item.", "erro");
        }
    }

    if (!carro) {
        return (
            <div className="container py-5">
                <h3>Veículo não encontrado.</h3>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/garagem")}>
                    Voltar para garagem
                </button>
            </div>
        );
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function formatarData(data) {
        if (!data) return "Não informado";

        if (String(data).includes("/")) {
            return String(data);
        }

        try {
            return new Date(data).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
            });
        } catch {
            return String(data);
        }
    }

    function textoCambio(valor) {
        if (String(valor) === "0") return "Manual";
        if (String(valor) === "1") return "Automático";
        return valor || "Não informado";
    }

    function textoCombustivel(valor) {
        if (String(valor) === "0") return "Flex";
        if (String(valor) === "1") return "Gasolina";
        if (String(valor) === "2") return "Etanol";
        if (String(valor) === "3") return "Diesel";
        return valor || "Não informado";
    }

    return (
        <>
            <div className="container py-4">
                {mensagem && (
                    <div
                        className={`alert ${
                            tipoMensagem === "sucesso" ? "alert-success" : "alert-danger"
                        }`}
                    >
                        {mensagem}
                    </div>
                )}

                <button className="btn btn-light mb-3" onClick={() => navigate("/garagem")}>
                    Voltar
                </button>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm p-3">
                            <div style={{ height: "420px", background: "#f8f9fa" }}>
                                <img
                                    src={imagemPrincipal.urls[0]}
                                    data-indice="0"
                                    onError={(e) => tentarProximaImagem(e, imagemPrincipal.urls)}
                                    className="w-100 h-100 rounded"
                                    style={{ objectFit: "cover" }}
                                    alt={carro.MODELO}
                                />
                            </div>

                            <div className="d-flex flex-nowrap gap-2 mt-3 overflow-auto">
                                {!imagemPrincipal.placeholder &&
                                    imagens.map((img, index) => (
                                        <img
                                            key={img.numero}
                                            src={img.urls[0]}
                                            data-indice="0"
                                            onError={(e) => tentarProximaImagem(e, img.urls)}
                                            onClick={() => setImagemPrincipal(img)}
                                            className="rounded flex-shrink-0"
                                            style={{
                                                width: "110px",
                                                height: "70px",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                                border:
                                                    imagemPrincipal.numero === img.numero
                                                        ? "2px solid #0d6efd"
                                                        : "2px solid transparent",
                                            }}
                                            alt={`Imagem ${index + 1}`}
                                        />
                                    ))}
                            </div>
                        </div>

                        <div className="row g-3 mt-3">
                            {[
                                {
                                    icon: "speedometer2",
                                    title: "QUILOMETRAGEM",
                                    value: `${Number(carro.KM || 0).toLocaleString("pt-BR")} km`,
                                },
                                {
                                    icon: "gear",
                                    title: "CÂMBIO",
                                    value: textoCambio(carro.CAMBIO),
                                },
                                {
                                    icon: "fuel-pump",
                                    title: "COMBUSTÍVEL",
                                    value: textoCombustivel(carro.COMBUSTIVEL),
                                },
                                {
                                    icon: "palette",
                                    title: "COR",
                                    value: carro.COR || "Não informado",
                                },
                            ].map((item, index) => (
                                <div className="col-6 col-md-3" key={index}>
                                    <div className="card text-center border-0 shadow-sm p-3 h-100">
                                        <i className={`bi bi-${item.icon} fs-4 text-primary mb-2`}></i>
                                        <small className="text-muted fw-semibold">{item.title}</small>
                                        <div className="fw-bold">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-4">
                            <small className="text-muted">Veículo</small>

                            <h3 className="fw-bold mb-3">
                                {carro.MARCA} {carro.MODELO}
                            </h3>

                            <small className="text-muted">Preço</small>
                            <h2 className="fw-bold">{formatarPreco(carro.PRECO_VENDA)}</h2>

                            <hr />

                            <p><strong>Ano:</strong> {carro.ANO_MODELO}</p>
                            <p><strong>Placa:</strong> {carro.PLACA}</p>
                            <p><strong>Renavam:</strong> {carro.RENAVAM}</p>
                        </div>

                        <div className="card border-0 shadow-sm p-4 mt-3">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h3 className="fw-bold mb-1">Manutenção</h3>
                                    <small className="text-muted">Histórico de serviços</small>
                                </div>

                                <strong className="text-primary">
                                    {formatarPreco(totalManutencoes)}
                                </strong>
                            </div>

                            <button
                                className="btn btn-primary w-100 mb-3"
                                onClick={() => navigate("/adicionarmanutencao", { state: { carro } })}
                            >
                                Adicionar manutenção
                            </button>

                            <div className={css.cabecalhoManutencao}>
                                <div className="flex-fill">Serviço</div>
                                <div>Valor</div>
                                <div>Data</div>
                                <div></div>
                            </div>

                            {itens.length === 0 ? (
                                <p className="text-muted mb-0">Nenhuma manutenção cadastrada.</p>
                            ) : (
                                itens.map((item) => (
                                    <div
                                        key={item.id_item_manutencao}
                                        className={css.linhaManutencao}
                                    >
                                        <div>
                                            <strong>{item.descricao}</strong>
                                            <br />
                                            <small className="text-muted">
                                                Qtd: {item.quantidade}
                                            </small>
                                        </div>

                                        <div>
                                            <small>{formatarPreco(item.valor_total)}</small>
                                        </div>

                                        <div>
                                            <small>{formatarData(item.data)}</small>
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                className="btn btn-light text-danger btn-sm"
                                                onClick={() => abrirModalExcluir(item)}
                                                title="Excluir item"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm p-4">
                            <h5 className="fw-bold mb-3">Detalhes</h5>

                            <p className="text-muted mb-0">
                                {carro.MARCA} {carro.MODELO}, ano {carro.ANO_MODELO}, cor{" "}
                                {carro.COR}, com{" "}
                                {Number(carro.KM || 0).toLocaleString("pt-BR")} km.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {modalExcluir && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        className="bg-white rounded shadow p-4"
                        style={{ width: "100%", maxWidth: "440px" }}
                    >
                        <h4 className="fw-bold mb-2">Excluir item</h4>

                        <p className="text-muted">
                            Tem certeza que deseja excluir este item?{" "}
                            <strong>{itemExcluir?.descricao}</strong>
                        </p>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button className="btn btn-light" onClick={fecharModalExcluir}>
                                Cancelar
                            </button>

                            <button className="btn btn-danger" onClick={confirmarExcluirItem}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
