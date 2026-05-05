import css from "./Cards.module.css";
import { API_URL } from "../../App";
import { useNavigate } from "react-router-dom";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#f1f5f9"/>
  <text x="320" y="180" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="28" font-weight="700" fill="#64748b">Sem imagem</text>
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

export default function Card({ idVeiculo, modelo, valor, combustivel, ano, nome, km, cambio }) {
    const navigate = useNavigate();
    const imagens = imagensVeiculo(idVeiculo);

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function textoCombustivel(valor) {
        if (String(valor) === "0") return "Flex";
        if (String(valor) === "1") return "Gasolina";
        if (String(valor) === "2") return "Etanol";
        if (String(valor) === "3") return "Diesel";
        return valor || "Não informado";
    }

    function textoCambio(valor) {
        if (String(valor) === "0") return "Manual";
        if (String(valor) === "1") return "Automático";
        return valor || "Não informado";
    }

    function formatarKm(valor) {
        return Number(valor || 0).toLocaleString("pt-BR");
    }

    const combustivelFormatado = textoCombustivel(combustivel);
    const cambioFormatado = textoCambio(cambio);

    return (
        <div
            className={css.card}
            role="button"
            tabIndex={0}
            onClick={() => idVeiculo && navigate(`/Visualizar/${idVeiculo}`)}
            onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && idVeiculo) {
                    e.preventDefault();
                    navigate(`/Visualizar/${idVeiculo}`);
                }
            }}
        >
            <img
                src={imagens[0]}
                data-indice="0"
                className={css.imagem}
                alt={`${nome || "Veículo"} ${modelo || ""}`}
                onError={(e) => tentarProximaImagem(e, imagens)}
            />

            <div className={css.topo}>
                <h3>{nome} {modelo}</h3>
                <span className={css.preco}>{formatarPreco(valor)}</span>
            </div>

            <p className={css.info}>
                {combustivelFormatado} - {ano || "Não informado"} - {cambioFormatado}
            </p>

            <div className={css.rodape}>
                <div>
                    <img src="/velocimetro.png" alt="" />
                    <span>{formatarKm(km)} km</span>
                </div>

                <div>
                    <img src="/engrenagem.png" alt="" />
                    <span>{cambioFormatado}</span>
                </div>

                <div>
                    <img src="/gasolina.png" alt="" />
                    <span>{combustivelFormatado}</span>
                </div>
            </div>
        </div>
    );
}
