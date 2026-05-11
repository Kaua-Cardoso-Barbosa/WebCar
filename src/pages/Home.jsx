import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Banner from "../components/Banner/Banner.jsx";
import css from "./Home.module.css";
import Card from "../components/Cards/Card.jsx";
import { Link } from "react-router-dom";
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

export default function Home() {
    const [carros, setCarros] = useState([]);
    const [erro, setErro] = useState("");
    const [descontoAVista, setDescontoAVista] = useState(0);

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
                            <p>Confira opções com fotos, dados essenciais e agendamento direto para visita.</p>
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

                <section className={css.confianca}>
                    <div className={css.confiancaTexto}>
                        <span className={css.kickerClaro}>Por que comprar pela WebCar</span>
                        <h2>Uma experiência pensada para comprar sem pressa e sem dúvida.</h2>
                        <p>
                            Veja informações importantes antes da visita, compare os veículos com calma e fale com a equipe para confirmar disponibilidade, condições e próximos passos.
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
                            <strong>Visita marcada</strong>
                            <span>Agende antes de ir até a loja.</span>
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

            <Footer />
        </>
    );
}
