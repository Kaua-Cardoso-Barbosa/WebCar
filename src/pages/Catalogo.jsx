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
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [busca, setBusca] = useState(() => {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get("busca") || "";
    });

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

    const carrosVisiveis = carrosFiltrados.filter((carro) =>
        `${carro.MARCA} ${carro.MODELO} ${carro.COR}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );
    const totalPaginas = Math.max(1, Math.ceil(carrosVisiveis.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const carrosPaginados = carrosVisiveis.slice(inicioPagina, inicioPagina + 15);

    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, carrosFiltrados]);

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

                    {carrosVisiveis.length === 0 ? (
                        <p className={css.vazio}>Nenhum veículo encontrado.</p>
                    ) : (
                        <div className={css.grid}>
                            {carrosPaginados.map((carro) => (
                                <Card
                                    key={carro.ID_VEICULO || carro.id}
                                    idVeiculo={carro.ID_VEICULO}
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
                    )}

                    <div className={css.paginacao}>
                        <button
                            type="button"
                            disabled={paginaAtual === 1}
                            onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                        >
                            Anterior
                        </button>
                        <span>{paginaAtual} / {totalPaginas}</span>
                        <button
                            type="button"
                            disabled={paginaAtual === totalPaginas}
                            onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                        >
                            Próxima
                        </button>
                    </div>

                </section>
            </main>

            <Footer />
        </>
    );
}
