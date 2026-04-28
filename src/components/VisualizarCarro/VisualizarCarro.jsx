import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = "http://localhost:5000";

export default function VisualizarCarro() {
    const { id } = useParams();

    const [carro, setCarro] = useState(null);
    const [imagemSelecionada, setImagemSelecionada] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/buscar_veiculo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id_veiculo: id })
        })
            .then(res => res.json())
            .then(data => {
                const veiculo = data.veiculos[0];

                setCarro(veiculo);


                if (veiculo.IMAGENS && veiculo.IMAGENS.length > 0) {
                    setImagemSelecionada(API_URL + veiculo.IMAGENS[0]);
                }
            });
    }, [id]);

    if (!carro) return <div className="text-center mt-5">Carregando...</div>;

    const imagensExtras = carro.IMAGENS.slice(1);

    return (
        <div className="container py-4">
            <div className="row g-4">


                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-3">

                        <div style={{ height: "420px", background: "#f8f9fa" }}>
                            <img
                                src={imagemSelecionada}
                                className="w-100 h-100 rounded"
                                style={{ objectFit: "cover" }}
                            />
                        </div>

                        <div className="d-flex flex-nowrap gap-2 mt-3 overflow-auto">


                            <img
                                src={API_URL + carro.IMAGENS[0]}
                                onClick={() => setImagemSelecionada(API_URL + carro.IMAGENS[0])}
                                style={{
                                    width: "110px",
                                    height: "70px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    border: imagemSelecionada === API_URL + carro.IMAGENS[0]
                                        ? "2px solid #0d6efd"
                                        : "2px solid transparent",
                                }}
                            />


                            {imagensExtras.map((img, index) => (
                                <img
                                    key={index}
                                    src={API_URL + img}
                                    onClick={() => setImagemSelecionada(API_URL + img)}
                                    style={{
                                        width: "110px",
                                        height: "70px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        border: imagemSelecionada === API_URL + img
                                            ? "2px solid #0d6efd"
                                            : "2px solid transparent",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>


                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4">
                        <small className="text-muted">Veículo</small>
                        <h4>{carro.MODELO}</h4>

                        <small className="text-muted mt-2">Preço</small>
                        <h2 className="fw-bold">
                            R$ {Number(carro.PRECO_VENDA).toLocaleString()}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}