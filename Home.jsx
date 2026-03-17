import Header from "../components/Header/Header.jsx";
import "./Home.module.css"
import Banner from "../components/Banner/Banner.jsx";
import Card from "../components/Cards/Card.jsx";
import css from "./Home.module.css"

export default function Home(){
    return (
        <>
            <Header />

            <Banner />


                {/* VEÍCULOS */}
                <div className="mb-4">
                    <h4 className="fw-bold">Veículos em destaque</h4>
                    <p className="text-muted">
                        Descubra os carros de maior destaque do nosso catálogo.
                    </p>
                </div>

                <div className="row g-4">

                    <div className="col-2">
                        <Card />
                    </div>

                    <div className="col-2">
                        <Card />
                    </div>

                    <div className="col-2">
                        <Card />
                    </div>

                    <div className="col-2">
                        <Card />
                    </div>

                </div>


                {/* SEÇÃO AZUL */}
            <section className={css.azul}>
                <img className={css.imagem} src="../../public/Container.png"/>
                <div className={"cta mt-5 " + css.azul}>

                    <div className="row align-items-center pt-5 m-5">

                        <div className="col-md-6 pt-5 text-start mb-3">
                            <h2 style={{fontWeight: "bold"}} >Pronto para comprar seu
                                carro?</h2>

                            <p className={css.letrafina}>
                                Mais de 2.500 concessionárias e vendedores utilizam o
                                WebCar para gerenciar seus estoques e fechar negócios
                                mais rápido com ferramentas de precificação inteligente.
                            </p>

                                <button className={css.botao}>
                                    Compre Agora
                                </button>

                        </div>

                        <div className="col-md-6 pt-5">

                            <div className="row g-3 d-flex">

                                    <div className="col-6">
                                        <div className={"stat-card text-start " + css.fundobranquinho}>
                                                <h4 style={{fontWeight: "bold"}}>45%</h4>
                                                <p style={{fontWeight: "normal"}}>Vendas mais rápidas</p>
                                        </div>
                                    </div>

                                <div className="col-6">
                                    <div className={"stat-card text-start " + css.fundobranquinho}>
                                        <h4 style={{fontWeight:"bold"}}>24/7</h4>
                                        <p style={{fontWeight: "normal"}}>Monitoramento</p>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className={"stat-card text-start " + css.fundobranquinho}>
                                        <h4 style={{fontWeight:"bold"}}>Ilimitado</h4>
                                        <p style={{fontWeight:"normal"}}>Anúncios</p>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className={"stat-card text-start " + css.fundobranquinho}>
                                        <h4 style={{fontWeight:"bold"}}>Seguro</h4>
                                        <p style={{fontWeight:"normal"}}>Proteção de dados</p>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </section>
        </>
    )
}