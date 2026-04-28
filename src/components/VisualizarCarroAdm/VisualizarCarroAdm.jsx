import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import css from "./VisualizarCarroAdm.module.css";

export default function VisualizarCarroAdm() {
    const location = useLocation();
    const navigate = useNavigate();

    const carro = location.state?.carro;

    const imagens = [
        "/Car.png",
        "/Car.png",
        "/Car.png",
        "/Car.png"
    ];

    const [imagemPrincipal, setImagemPrincipal] = useState(imagens[0]);

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
            currency: "BRL"
        });
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
        <div className="container py-4">
            <button className="btn btn-light mb-3" onClick={() => navigate("/garagem")}>
                ← Voltar
            </button>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-3">
                        <div style={{ height: "420px", background: "#f8f9fa" }}>
                            <img
                                src={imagemPrincipal}
                                className="w-100 h-100 rounded"
                                style={{ objectFit: "cover" }}
                                alt={carro.MODELO}
                            />
                        </div>

                        <div className="d-flex flex-nowrap gap-2 mt-3 overflow-auto">
                            {imagens.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    onClick={() => setImagemPrincipal(img)}
                                    className="rounded flex-shrink-0"
                                    style={{
                                        width: "110px",
                                        height: "70px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        border: imagemPrincipal === img ? "2px solid #0d6efd" : "2px solid transparent",
                                    }}
                                    alt={`Imagem ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="row g-3 mt-3">
                        {[
                            { icon: "speedometer2", title: "QUILOMETRAGEM", value: `${Number(carro.KM || 0).toLocaleString("pt-BR")} km` },
                            { icon: "gear", title: "CÂMBIO", value: textoCambio(carro.CAMBIO) },
                            { icon: "fuel-pump", title: "COMBUSTÍVEL", value: textoCombustivel(carro.COMBUSTIVEL) },
                            { icon: "palette", title: "COR", value: carro.COR || "Não informado" },
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
                        <button
                            className="btn btn-primary w-100 mt-3"
                            onClick={() => navigate("/EdicaoVeiculo", { state: { carro } })}
                        >
                            Editar veículo
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-3">Detalhes</h5>
                        <p className="text-muted mb-0">
                            {carro.MARCA} {carro.MODELO}, ano {carro.ANO_MODELO}, cor {carro.COR}, com {Number(carro.KM || 0).toLocaleString("pt-BR")} km.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}