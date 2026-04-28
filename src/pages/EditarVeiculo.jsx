import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./EditarVeiculo.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditarVeiculo() {
    const location = useLocation();
    const navigate = useNavigate();

    const carro = location.state?.carro;

    if (!carro) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <h3>Veículo não encontrado.</h3>
                    <button className="btn btn-primary mt-3" onClick={() => navigate("/garagem")}>
                        Voltar para garagem
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function textoCambio(valor) {
        if (String(valor) === "0") return "Manual";
        if (String(valor) === "1") return "Automático";
        return valor || "";
    }

    function textoCombustivel(valor) {
        if (String(valor) === "0") return "Flex";
        if (String(valor) === "1") return "Gasolina";
        if (String(valor) === "2") return "Etanol";
        if (String(valor) === "3") return "Diesel";
        return valor || "";
    }

    function textoDocumento(valor) {
        if (String(valor) === "0") return "Pago";
        if (String(valor) === "1") return "Não Pago";
        return valor || "";
    }

    return (
        <>
            <Header />

            <div className={`d-flex ${css.layout}`}>
                <SidebarMenu />

                <main className={`flex-grow-1 p-4 ${css.main}`}>
                    <div className="container-fluid">
                        <p className={`mb-2 ${css.breadcrumbTexto}`}>
                            Estoque <span className="mx-1">›</span> Editar Veículo
                        </p>

                        <h1 className={`fw-bold mb-2 ${css.titulo}`}>Editar veículo</h1>
                        <p className={`mb-4 ${css.subtitulo}`}>
                            Altere os dados técnicos e comerciais do veículo.
                        </p>

                        <div className={`card border-0 shadow-sm mb-4 ${css.cardCustom}`}>
                            <div className="card-body p-4">
                                <h5 className={`fw-semibold mb-3 ${css.sectionTitle}`}>
                                    📷 Fotos do Veículo
                                </h5>

                                <div className={css.areaFoto}>
                                    <img
                                        src="/Car.png"
                                        alt="Veículo"
                                        className={css.imagemVeiculo}
                                    />

                                    <div className={css.overlayFoto}>
                                        <div className="text-center">
                                            <div className={css.iconeNuvem}>☁</div>
                                            <button type="button" className="btn btn-light btn-sm fw-semibold">
                                                Selecionar Fotos
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-12 col-lg-6">
                                <div className={`card border-0 shadow-sm h-100 ${css.cardCustom}`}>
                                    <div className="card-body p-4">
                                        <h5 className={`fw-semibold mb-4 ${css.sectionTitle}`}>
                                            Informações Básicas
                                        </h5>

                                        <div className="mb-3">
                                            <label className={`form-label ${css.label}`}>Marca</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={carro.MARCA || ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className={`form-label ${css.label}`}>Modelo</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={carro.MODELO || ""}
                                            />
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className={`form-label ${css.label}`}>Ano Fabricação</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue={carro.ANO_FABRICACAO || ""}
                                                />
                                            </div>

                                            <div className="col-6">
                                                <label className={`form-label ${css.label}`}>Ano Modelo</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue={carro.ANO_MODELO || ""}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`form-label ${css.label}`}>Documento</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={textoDocumento(carro.DOCUMENTACAO)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className={`card border-0 shadow-sm h-100 ${css.cardCustom}`}>
                                    <div className="card-body p-4">
                                        <h5 className={`fw-semibold mb-4 ${css.sectionTitle}`}>
                                            Detalhes Técnicos
                                        </h5>

                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className={`form-label ${css.label}`}>Quilometragem (km)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue={carro.KM || ""}
                                                />
                                            </div>

                                            <div className="col-6">
                                                <label className={`form-label ${css.label}`}>Combustível</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue={textoCombustivel(carro.COMBUSTIVEL)}
                                                />
                                            </div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className={`form-label ${css.label}`}>Câmbio</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue={textoCambio(carro.CAMBIO)}
                                                />
                                            </div>

                                            <div className="col-6">
                                                <label className={`form-label ${css.label}`}>Cor</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue={carro.COR || ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className={`form-label ${css.label}`}>Placa</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={carro.PLACA || ""}
                                            />
                                        </div>

                                        <div>
                                            <label className={`form-label ${css.label}`}>Renavam</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={carro.RENAVAM || ""}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`card border-0 shadow-sm mb-4 ${css.cardCustom}`}>
                            <div className="card-body p-4">
                                <h5 className={`fw-semibold mb-4 ${css.sectionTitle}`}>Precificação</h5>

                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <label className={`form-label ${css.label}`}>Valor de Custo (R$)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={formatarPreco(carro.PRECO_CUSTO)}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className={`form-label ${css.label}`}>Valor de Venda (R$)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={formatarPreco(carro.PRECO_VENDA)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-3">
                            <button
                                type="button"
                                className="btn btn-light px-4 py-2 fw-semibold"
                                onClick={() => navigate("/VisualizarAdm", { state: { carro } })}
                            >
                                Cancelar
                            </button>

                            <button type="button" className={`btn px-4 py-2 fw-semibold ${css.botaoSalvar}`}>
                                💾 Salvar Informações
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}