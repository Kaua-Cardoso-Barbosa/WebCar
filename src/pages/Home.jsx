import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import "./Home.module.css"
import Banner from "../components/Banner/Banner.jsx";

export default function Home(){
    return (
        <>
            <Header />

            <Banner />


                <div className="mb-4">
                    <h4 className="fw-bold">Veículos em destaque</h4>
                    <p className="text-muted">
                        Descubra os carros de maior destaque do nosso catálogo.
                    </p>
                </div>

                <div className="row g-4">

                    <div className="col-md-3">
                        <div className="card car-card">
                            <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e" className="card-img-top"/>
                            <div className="card-body">
                                <h6 className="fw-bold">BMW M4</h6>
                                <p className="price">R$89,900</p>
                                <small className="text-muted">Gasolina • 2014 • RWD</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card car-card">
                            <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537" className="card-img-top"/>
                            <div className="card-body">
                                <h6 className="fw-bold">Volkswagen Fusca</h6>
                                <p className="price">R$124,500</p>
                                <small className="text-muted">Gasolina • 1990 • RWD</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card car-card">
                            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70" className="card-img-top"/>
                            <div className="card-body">
                                <h6 className="fw-bold">Porsche 911</h6>
                                <p className="price">R$68,000</p>
                                <small className="text-muted">Gasolina • 1970 • RWD</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card car-card">
                            <img src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738" className="card-img-top"/>
                            <div className="card-body">
                                <h6 className="fw-bold">Fiat 500</h6>
                                <p className="price">R$54,200</p>
                                <small className="text-muted">Híbrido • 2015 • FWD</small>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="cta mt-5">

                    <div className="row align-items-center">

                        <div className="col-md-6">
                            <h2>Pronto para comprar seu carro?</h2>

                            <p>
                                Mais de 2.500 concessionárias utilizam o WebCar
                                para gerenciar seus estoques e fechar negócios.
                            </p>

                            <button className="btn btn-light">
                                Compre Agora
                            </button>
                        </div>

                        <div className="col-md-6">

                            <div className="row g-3">

                                <div className="col-6">
                                    <div className="stat-card">
                                        <h4>45%</h4>
                                        <p>Vendas mais rápidas</p>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="stat-card">
                                        <h4>24/7</h4>
                                        <p>Monitoramento</p>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="stat-card">
                                        <h4>Ilimitado</h4>
                                        <p>Anúncios</p>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="stat-card">
                                        <h4>Seguro</h4>
                                        <p>Proteção de dados</p>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            <Footer />
        </>
    )
}