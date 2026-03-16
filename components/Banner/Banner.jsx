import css from "./Banner.module.css"
export default function Banner() {
    return (
        <section className="container my-4">
            <div className="banner rounded-4 overflow-hidden position-relative">
                <img
                    src="/Banner.png" alt="Banner" className="banner-img"
                />

                <div className="banner-overlay"></div>

                <div className={"banner-content position-absolute top-50 start-0 translate-middle-y text-white px-4 px-md-5" + css.fonte}>
                    <h1 className="fw-bold display-5 mb-3">
                        Escolha Com <span className="text-primary">Confiança</span>
                        <br />
                        Compre Com <span className="text-primary">Segurança</span>
                    </h1>

                    <p className="fs-5 mb-4 banner-text">
                        A plataforma ideal para vendedores e compradores. Com a WebCar você tem a praticidade de
                        conectar oportunidades, encontrar as melhores ofertas e fechar negócios com total confiança.
                    </p>

                    <button className="btn btn-primary btn-lg px-4 py-2 fw-semibold">
                                  Comece agora
                    </button>
                </div>
            </div>
        </section>
    );
}