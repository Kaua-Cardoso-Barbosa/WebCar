import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_URL = "http://localhost:5000";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
  <rect width="900" height="520" fill="#f1f5f9"/>
  <text x="450" y="260" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="34" font-weight="700" fill="#64748b">Sem imagem</text>
</svg>
`)}`;

function imagensVeiculo(idVeiculo, numeroFoto = 1) {
    if (!idVeiculo) return [IMAGEM_PADRAO];

    const versao = Date.now();

    return [
        `${API_URL}/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        IMAGEM_PADRAO,
    ];
}

function tentarProximaImagem(e, imagens) {
    const indiceAtual = Number(e.currentTarget.dataset.indice || 0);
    const proximoIndice = indiceAtual + 1;

    if (proximoIndice < imagens.length) {
        e.currentTarget.dataset.indice = String(proximoIndice);
        e.currentTarget.src = imagens[proximoIndice];
    }
}

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
                const veiculo = data.veiculos?.[0];

                setCarro(veiculo);
                setImagemSelecionada(imagensVeiculo(veiculo?.ID_VEICULO, 1));
            });
    }, [id]);

    if (!carro) return <div className="text-center mt-5">Carregando...</div>;

    const imagens = [1, 2, 3, 4].map((numero) => ({
        numero,
        urls: imagensVeiculo(carro.ID_VEICULO, numero),
    }));

    return (
        <div className="container py-4">
            <div className="row g-4">


                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-3">

                        <div style={{ height: "420px", background: "#f8f9fa" }}>
                            <img
                                src={imagemSelecionada[0]}
                                data-indice="0"
                                onError={(e) => tentarProximaImagem(e, imagemSelecionada)}
                                className="w-100 h-100 rounded"
                                style={{ objectFit: "cover" }}
                                alt={carro.MODELO}
                            />
                        </div>

                        <div className="d-flex flex-nowrap gap-2 mt-3 overflow-auto">
                            {imagens.map((img) => (
                                <img
                                    key={img.numero}
                                    src={img.urls[0]}
                                    data-indice="0"
                                    onError={(e) => tentarProximaImagem(e, img.urls)}
                                    onClick={() => setImagemSelecionada(img.urls)}
                                    style={{
                                        width: "110px",
                                        height: "70px",
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        border: imagemSelecionada === img.urls
                                            ? "2px solid #0d6efd"
                                            : "2px solid transparent",
                                    }}
                                    alt={`Foto ${img.numero}`}
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
