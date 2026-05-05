import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Banner from "../components/Banner/Banner.jsx";
import css from "./Home.module.css";
import Card from "../components/Cards/Card.jsx";
import {Link} from "react-router-dom";
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

            <Banner />

            <div style={{ marginTop: "70px" }} className="container align-content-center">
                <div className="mb-4">
                    <h4 className="fw-bold">Veículos em destaque</h4>
                    <p className="text-muted">
                        Descubra os carros de maior destaque do nosso catálogo.
                    </p>
                </div>


                <div style={{ marginBottom: "70px" }} className="row g-4 justify-content-center">
                    {erro && <p className="text-center text-danger fw-semibold">{erro}</p>}

                    {!erro && carros.length === 0 && (
                        <p className="text-center text-muted fw-semibold">
                            Nenhum veículo em destaque no momento.
                        </p>
                    )}

                    {carros.map((carro) => (
                        <div className="col-12 col-sm-6 col-md-3" key={carro.ID_VEICULO || carro.id}>
                            <Card
                                idVeiculo={carro.ID_VEICULO}
                                modelo={carro.MODELO}
                                valor={carro.PRECO_VENDA}
                                combustivel={carro.COMBUSTIVEL}
                                ano={carro.ANO_MODELO}
                                nome={carro.MARCA}
                                km={carro.KM}
                                cambio={carro.CAMBIO}
                            />
                        </div>
                    ))}

                </div>
            </div>

            <section className={css.azul}>
                <img className={css.imagem} src="/Container.png" />

                <div className={"cta mt-5 " + css.azul}>

                    <div className="row align-items-center pt-5 m-5">

                        <div className="col-md-6 pt-5 text-start mb-3">
                            <h2 style={{ fontWeight: "bold" }}>
                                Pronto para comprar seu carro?
                            </h2>

                            <p className={css.letrafina}>
                                Mais de 2.500 concessionárias e vendedores utilizam o
                                WebCar para gerenciar seus estoques e fechar negócios
                                mais rápido com ferramentas de precificação inteligente.
                            </p>

                            <Link to={"/catalogo"}>
                                <button className={css.botao}>
                                    Compre Agora
                                </button>
                            </Link>
                        </div>

                        <div className="col-md-6 pt-5">

                            <div className="row g-3">

                                <div className="col-12 col-md-6">
                                    <div className={"stat-card " + css.fundobranquinho}>
                                        <h4 style={{marginTop:"15px"}}>45%</h4>
                                        <p style={{marginTop:"15px"}}>Vendas mais rápidas</p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className={"stat-card " + css.fundobranquinho}>
                                        <h4 style={{marginTop:"15px"}}>24/7</h4>
                                        <p style={{marginTop:"15px"}}>Monitoramento</p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className={"stat-card " + css.fundobranquinho}>
                                        <h4 style={{marginTop:"15px"}}>Ilimitado</h4>
                                        <p style={{marginTop:"15px"}}>Anúncios</p>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className={"stat-card " + css.fundobranquinho}>
                                        <h4 style={{marginTop:"15px"}}>Seguro</h4>
                                        <p style={{marginTop:"15px"}}>Proteção de dados</p>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

            <Footer />
        </>
    );
}
