import { useState } from "react";
import css from "./Filtro.module.css";

export default function Filtro({ carros, setCarrosFiltrados }) {
    const [marcasSelecionadas, setMarcasSelecionadas] = useState([]);
    const [precoMax, setPrecoMax] = useState(150000);
    const [anoDe, setAnoDe] = useState("");
    const [anoAte, setAnoAte] = useState("");

    const marcas = [...new Set(carros.map((carro) => carro.MARCA).filter(Boolean))];

    function filtrar({ marcas = marcasSelecionadas, preco = precoMax, de = anoDe, ate = anoAte }) {
        const filtrados = carros.filter((carro) => {
            const precoCarro = Number(carro.PRECO_VENDA);
            const anoCarro = Number(carro.ANO_MODELO);

            const passaMarca =
                marcas.length === 0 || marcas.includes(carro.MARCA);

            const passaPreco = precoCarro <= preco;

            const passaAnoDe =
                de === "" || anoCarro >= Number(de);

            const passaAnoAte =
                ate === "" || anoCarro <= Number(ate);

            return passaMarca && passaPreco && passaAnoDe && passaAnoAte;
        });

        setCarrosFiltrados(filtrados);
    }

    function mudarMarca(marca) {
        const novasMarcas = marcasSelecionadas.includes(marca)
            ? marcasSelecionadas.filter((item) => item !== marca)
            : [...marcasSelecionadas, marca];

        setMarcasSelecionadas(novasMarcas);
        filtrar({ marcas: novasMarcas });
    }

    function mudarPreco(valor) {
        const novoPreco = Number(valor);
        setPrecoMax(novoPreco);
        filtrar({ preco: novoPreco });
    }

    function mudarAnoDe(valor) {
        setAnoDe(valor);
        filtrar({ de: valor });
    }

    function mudarAnoAte(valor) {
        setAnoAte(valor);
        filtrar({ ate: valor });
    }

    function resetarFiltros() {
        setMarcasSelecionadas([]);
        setPrecoMax(150000);
        setAnoDe("");
        setAnoAte("");
        setCarrosFiltrados(carros);
    }

    return (
        <div className={css.filtro}>
            <div className={css.topo}>
                <h3>Filtro</h3>

                <button type="button" onClick={resetarFiltros}>
                    Resetar todos
                </button>
            </div>

            <div className={css.grupo}>
                <h4>MARCA</h4>

                {marcas.map((marca) => (
                    <label className={css.check} key={marca}>
                        <input
                            type="checkbox"
                            checked={marcasSelecionadas.includes(marca)}
                            onChange={() => mudarMarca(marca)}
                        />
                        <span>{marca}</span>
                    </label>
                ))}
            </div>

            <div className={css.grupo}>
                <h4>PREÇO MÁXIMO</h4>

                <p className={css.valorPreco}>
                    Até R$ {precoMax.toLocaleString("pt-BR")}
                </p>

                <input
                    type="range"
                    min="0"
                    max="150000"
                    step="5000"
                    value={precoMax}
                    onChange={(e) => mudarPreco(e.target.value)}
                    className={css.range}
                />

                <div className={css.precoLinha}>
                    <span>R$0</span>
                    <span>R$150k+</span>
                </div>
            </div>

            <div className={css.grupo}>
                <h4>ANO</h4>

                <div className={css.ano}>
                    <input
                        type="number"
                        placeholder="De"
                        value={anoDe}
                        onChange={(e) => mudarAnoDe(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Até"
                        value={anoAte}
                        onChange={(e) => mudarAnoAte(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}