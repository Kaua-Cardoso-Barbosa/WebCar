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

export default function VisualizarCarro() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [carro, setCarro] = useState(null);
    const imagemSemFoto = { numero: 0, urls: [IMAGEM_PADRAO], placeholder: true };
    const [imagens, setImagens] = useState([imagemSemFoto]);
    const [imagemSelecionada, setImagemSelecionada] = useState(imagemSemFoto);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

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
            } catch {
                setErro("Erro ao conectar com o servidor.");
            } finally {
                setCarregando(false);
            }
        }

        buscarVeiculo();
    }, [id]);

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

    return (
        <main className={css.pagina}>
            <section className={css.hero}>
                <div className={css.conteudo}>
                    <div className={css.barraTopo}>
                        <button className={css.voltar} onClick={() => navigate("/catalogo")}>
                            Voltar ao catalogo
                        </button>

                        <span className={css.codigo}>WebCar #{carro.ID_VEICULO}</span>
                    </div>

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
                                <span>Preco anunciado</span>
                                <strong>{formatarPreco(carro.PRECO_VENDA)}</strong>
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
                                onClick={() => navigate("/Agendar", { state: { carro } })}
                            >
                                Comprar
                            </button>

                            <p className={css.avisoCompra}>
                                Agende sua visita para conhecer o veiculo, confirmar disponibilidade e falar com a equipe.
                            </p>

                            <div className={css.garantias}>
                                <span><i className="bi bi-check2-circle"></i> Atendimento especializado</span>
                                <span><i className="bi bi-shield-check"></i> Dados do veiculo conferidos</span>
                                <span><i className="bi bi-calendar2-check"></i> Visita com horario marcado</span>
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
        </main>
    );
}
