import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Banner from "../components/Banner/Banner.jsx";
import css from "./Home.module.css";
import Card from "../components/Cards/Card.jsx";
import AuthModal from "../components/AuthModal/AuthModal.jsx";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../App";

function veiculoEstaDisponivel(carro) {
    if (!carro) return false;

    const status = carro.STATUS ?? carro.status ?? carro.SITUACAO ?? carro.situacao;
    const vendido = carro.VENDIDO ?? carro.vendido ?? carro.ID_VENDA ?? carro.id_venda;
    const disponibilidade = carro.DISPONIBILIDADE ?? carro.disponibilidade ?? carro.ESTADO ?? carro.estado;

    if (vendido !== undefined && vendido !== null && String(vendido) !== "0" && String(vendido) !== "") {
        return false;
    }

    const textoStatus = String(status ?? disponibilidade ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (textoStatus.includes("vend") || textoStatus.includes("inativo") || textoStatus.includes("indisponivel")) {
        return false;
    }

    if (status !== undefined && status !== null && status !== "") {
        return Number(status) === 0;
    }

    return true;
}

function normalizarDescontoAVista(data = {}) {
    const valor =
        data.DESCONTO_A_VISTA ??
        data.desconto_a_vista ??
        data.desconto ??
        data.porcentagem ??
        0;

    const numero = Number(valor);

    return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

const comentariosClientes = [
    {
        nome: "Cliente WebCar",
        texto: "Consegui comparar os carros com calma e entender o valor antes de falar com a equipe.",
        detalhe: "Compra com Pix",
    },
    {
        nome: "Cliente WebCar",
        texto: "As fotos e os dados do veiculo ajudaram bastante na decisao. A experiencia ficou bem direta.",
        detalhe: "Catalogo online",
    },
    {
        nome: "Cliente WebCar",
        texto: "Gostei de acompanhar as informacoes da compra e das parcelas em um lugar so.",
        detalhe: "Area do cliente",
    },
];

export default function Home({ authModalInicial = "" }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [carros, setCarros] = useState([]);
    const [erro, setErro] = useState("");
    const [descontoAVista, setDescontoAVista] = useState(0);
    const [comentarioAtivo, setComentarioAtivo] = useState(0);
    const auth = searchParams.get("auth");
    const authModal = auth === "login" || auth === "cadastro" ? auth : authModalInicial;

    useEffect(() => {
        const intervalo = setInterval(() => {
            setComentarioAtivo((atual) => (atual + 1) % comentariosClientes.length);
        }, 5200);

        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        async function buscarDados() {
            try {
                const response = await fetch(`${API_URL}/buscar_veiculo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    const erroApi = await response.json();
                    setErro(erroApi.mensagem || "Não foi possível carregar os veículos.");
                    return;
                }

                const data = await response.json();
                const lista = (data.veiculos || data).filter(veiculoEstaDisponivel);

                setCarros(lista.slice(0, 4));

                const responseDesconto = await fetch(`${API_URL}/verporcentagem_desconto`, {
                    method: "GET",
                    credentials: "include",
                });

                if (responseDesconto.ok) {
                    const dataDesconto = await responseDesconto.json();
                    setDescontoAVista(normalizarDescontoAVista(dataDesconto));
                }
            } catch (error) {
                setErro("Erro ao conectar com o servidor.");
                console.log(error);
            }
        }

        buscarDados();
    }, []);

    return (
        <>
            <Header />

            <main className={css.home}>
                <Banner />

                <section className={css.destaques}>
                    <div className={css.cabecalhoSecao}>
                        <div>
                            <span className={css.kicker}>Selecionados para você</span>
                            <h2>Veículos em destaque</h2>
                            <p>Confira opcoes com fotos, dados essenciais e informacoes claras para decidir com calma.</p>
                        </div>

                        <Link to="/catalogo" className={css.linkCatalogo}>
                            Ver todos
                        </Link>
                    </div>

                    {erro && <p className={css.erro}>{erro}</p>}

                    {!erro && carros.length === 0 && (
                        <p className={css.vazio}>Nenhum veículo em destaque no momento.</p>
                    )}

                    <div className={css.gridDestaques}>
                        {carros.map((carro) => (
                            <Card
                                key={carro.ID_VEICULO || carro.id}
                                idVeiculo={carro.ID_VEICULO}
                                modelo={carro.MODELO}
                                valor={carro.PRECO_VENDA}
                                combustivel={carro.COMBUSTIVEL}
                                ano={carro.ANO_MODELO}
                                nome={carro.MARCA}
                                km={carro.KM}
                                cambio={carro.CAMBIO}
                                descontoAVista={descontoAVista}
                            />
                        ))}
                    </div>
                </section>

                <section className={css.comentarios}>
                    <div className={css.comentariosTexto}>
                        <span className={css.kicker}>Experiencia WebCar</span>
                        <h2>Mais confianca antes de escolher seu proximo carro.</h2>
                        <p>
                            Um espaco para destacar comentarios reais dos seus clientes e reforcar o atendimento da loja.
                        </p>
                    </div>

                    <div className={css.carrosselComentarios}>
                        {comentariosClientes.map((comentario, index) => (
                            <article
                                className={`${css.comentarioCard} ${index === comentarioAtivo ? css.comentarioAtivo : ""}`}
                                key={`${comentario.nome}-${comentario.detalhe}`}
                                aria-hidden={index !== comentarioAtivo}
                            >
                                <span>{comentario.detalhe}</span>
                                <p>"{comentario.texto}"</p>
                                <strong>{comentario.nome}</strong>
                            </article>
                        ))}

                        <div className={css.controlesComentarios} aria-label="Selecionar comentario">
                            {comentariosClientes.map((comentario, index) => (
                                <button
                                    type="button"
                                    className={index === comentarioAtivo ? css.indicadorAtivo : ""}
                                    onClick={() => setComentarioAtivo(index)}
                                    aria-label={`Mostrar comentario ${index + 1}`}
                                    key={comentario.detalhe}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className={css.confianca}>
                    <div className={css.confiancaTexto}>
                        <span className={css.kickerClaro}>Por que comprar pela WebCar</span>
                        <h2>Uma experiência pensada para comprar sem pressa e sem dúvida.</h2>
                        <p>
                            Veja informacoes importantes, compare os veiculos com calma e fale com a equipe para confirmar disponibilidade, condicoes e proximos passos.
                        </p>

                        <Link to="/catalogo" className={css.botaoClaro}>
                            Encontrar meu veículo
                        </Link>
                    </div>

                    <div className={css.metricas}>
                        <div>
                            <strong>Fotos reais</strong>
                            <span>Anúncios com imagem e dados do estoque.</span>
                        </div>
                        <div>
                            <strong>Atendimento claro</strong>
                            <span>Fale com a equipe para confirmar disponibilidade e proximos passos.</span>
                        </div>
                        <div>
                            <strong>Compra assistida</strong>
                            <span>Atendimento para tirar dúvidas.</span>
                        </div>
                        <div>
                            <strong>Catálogo claro</strong>
                            <span>Filtros e detalhes para decidir melhor.</span>
                        </div>
                    </div>
                </section>
            </main>

            <AuthModal
                aberto={Boolean(authModal)}
                modoInicial={authModal || "login"}
                voltarPara={location.state?.voltarPara}
                onClose={() => {
                    navigate("/", { replace: true });
                }}
            />

            <Footer />
        </>
    );
}
