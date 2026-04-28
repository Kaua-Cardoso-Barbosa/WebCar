import css from "./Cards.module.css";

export default function Card({ modelo, valor, combustivel, ano, nome, km, cambio }) {

    function formatarPreco(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    return (
        <div className={css.card}>
            <img src="/Car.png" className={css.imagem} alt="carro" />

            <div className={css.topo}>
                <h3>{nome} {modelo}</h3>
                <span className={css.preco}>{formatarPreco(valor)}</span>
            </div>

            <p className={css.info}>
                {combustivel} • {ano} • {cambio}
            </p>

            <div className={css.rodape}>
                <div>
                    <img src="/velocimetro.png" />
                    <span>{km} km</span>
                </div>

                <div>
                    <img src="/engrenagem.png" />
                    <span>{cambio}</span>
                </div>

                <div>
                    <img src="/gasolina.png" />
                    <span>{combustivel}</span>
                </div>
            </div>
        </div>
    );
}