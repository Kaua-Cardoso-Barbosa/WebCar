import { useEffect, useMemo, useState } from "react";
import css from "./Filtro.module.css";

export default function Filtro({ carros, setCarrosFiltrados }) {
    const anoAtual = new Date().getFullYear();
    const menorAnoLoja = useMemo(() => {
        const anos = carros
            .map((carro) => Number(carro.ANO_MODELO))
            .filter((ano) => ano > 0 && ano <= anoAtual);

        return anos.length > 0 ? Math.min(...anos) : 1900;
    }, [carros, anoAtual]);

    const [marcasSelecionadas, setMarcasSelecionadas] = useState([]);
    const precoMaximoLoja = useMemo(() => {
        const maiorPreco = carros.reduce((maior, carro) => {
            const preco = Number(carro.PRECO_VENDA || 0);
            return preco > maior ? preco : maior;
        }, 0);

        return Math.ceil(maiorPreco / 5000) * 5000;
    }, [carros]);

    const [precoMax, setPrecoMax] = useState(0);
    const [anoDe, setAnoDe] = useState("");
    const [anoAte, setAnoAte] = useState("");

    const marcas = [...new Set(carros.map((carro) => carro.MARCA).filter(Boolean))];

    function normalizarAno(valor) {
        if (valor === "") return "";

        const ano = Number(valor);
        if (Number.isNaN(ano)) return "";
        if (ano < menorAnoLoja) return String(menorAnoLoja);
        if (ano > anoAtual) return String(anoAtual);

        return String(ano);
    }

    useEffect(() => {
        setPrecoMax(precoMaximoLoja);
        setCarrosFiltrados(carros);
    }, [carros, precoMaximoLoja, setCarrosFiltrados]);

    function filtrar({ marcas = marcasSelecionadas, preco = precoMax, de = anoDe, ate = anoAte }) {
        const filtrados = carros.filter((carro) => {
            const precoCarro = Number(carro.PRECO_VENDA);
            const anoCarro = Number(carro.ANO_MODELO);

            const passaMarca =
                marcas.length === 0 || marcas.includes(carro.MARCA);

            const passaPreco = preco === 0 || precoCarro <= preco;

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
        const ano = normalizarAno(valor);
        setAnoDe(ano);
        filtrar({ de: ano });
    }

    function mudarAnoAte(valor) {
        const ano = normalizarAno(valor);
        setAnoAte(ano);
        filtrar({ ate: ano });
    }

    function resetarFiltros() {
        setMarcasSelecionadas([]);
        setPrecoMax(precoMaximoLoja);
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
                    max={precoMaximoLoja}
                    step="5000"
                    value={precoMax}
                    onChange={(e) => mudarPreco(e.target.value)}
                    className={css.range}
                    disabled={precoMaximoLoja === 0}
                />

                <div className={css.precoLinha}>
                    <span>R$0</span>
                    <span>
                        {precoMaximoLoja.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                        })}
                    </span>
                </div>
            </div>

            <div className={css.grupo}>
                <h4>ANO</h4>

                <div className={css.ano}>
                    <input
                        type="number"
                        placeholder={`De ${menorAnoLoja}`}
                        min={menorAnoLoja}
                        max={anoAtual}
                        step="1"
                        value={anoDe}
                        onChange={(e) => mudarAnoDe(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder={`Até ${anoAtual}`}
                        min={menorAnoLoja}
                        max={anoAtual}
                        step="1"
                        value={anoAte}
                        onChange={(e) => mudarAnoAte(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
