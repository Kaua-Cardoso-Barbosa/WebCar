import css from "./Catalogo.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Card from "../components/Cards/Card.jsx";
import Filtro from "../components/Filtro/Filtro.jsx";
import { useState, useEffect } from "react";
import { API_URL } from "../App";

export default function Catalogo() {

    const [carros, setCarros] = useState([]);
    const [carrosFiltrados, setCarrosFiltrados] = useState([]);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");

    useEffect(() => {
        async function buscarDados() {
            try {
                const response = await fetch(`${API_URL}/buscar_veiculo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    const erroApi = await response.json();
                    console.log("ERRO BACKEND:", erroApi);
                    setErro(erroApi.mensagem || "Erro na API");
                    return;
                }

                const data = await response.json();
                console.log("VEICULOS DO BACK:", data);

                const lista = data.veiculos || data;

                setCarros(lista);
                setCarrosFiltrados(lista);

            } catch (error) {
                setErro("Erro ao conectar com o servidor");
                console.log(error);
            }
        }

        buscarDados();
    }, []);

    return (
        <>
            <Header busca={busca} setBusca={setBusca} />

            <main className={css.catalogo}>

                {/* SIDEBAR FILTRO */}
                <aside className={css.sidebar}>
                    <Filtro
                        carros={carros}
                        setCarrosFiltrados={setCarrosFiltrados}
                    />
                </aside>

                {/* CONTEÚDO */}
                <section className={css.conteudo}>

                    <h1>Catálogo</h1>
                    <p className={css.subtitulo}>
                        Pesquise e agende uma visita para o seu preferido!
                    </p>

                    {erro && <p>{erro}</p>}

                    <div className={css.grid}>
                        {carrosFiltrados
                            .filter((carro) =>
                                `${carro.MARCA} ${carro.MODELO} ${carro.COR}`
                                    .toLowerCase()
                                    .includes(busca.toLowerCase())
                            )
                            .map((carro) => (
                            <Card
                                key={carro.ID_VEICULO || carro.id}
                                modelo={carro.MODELO}
                                valor={carro.PRECO_VENDA}
                                combustivel={carro.COMBUSTIVEL}
                                ano={carro.ANO_MODELO}
                                nome={carro.MARCA}
                                km={carro.KM}
                                cambio={carro.CAMBIO}
                            />
                        ))}
                    </div>

                </section>
            </main>

            <Footer />
        </>
    );
}