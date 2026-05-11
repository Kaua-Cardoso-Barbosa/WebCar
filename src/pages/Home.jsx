import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Banner from "../components/Banner/Banner.jsx";
import css from "./Home.module.css";
import Card from "../components/Cards/Card.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../App";

export default function Home() {
    const [carros, setCarros] = useState([]);
    const [erro, setErro] = useState("");

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
                const lista = data.veiculos || data;

                setCarros(lista.slice(0, 4));
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
