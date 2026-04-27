import css from "./Catalogo.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Card from "../components/Cards/Card.jsx";
import Filtro from "../components/Filtro/Filtro.jsx";
import { useState, useEffect } from "react";
import { API_URL } from "../App";



export default function Catalogo() {

    const [carros, setCarros] = useState([]);
    const [erro, setErro] = useState("");

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
                setCarros(data.veiculos || data);

            } catch (error) {
                setErro("Erro ao conectar com o servidor");
                console.log(error);
            }
        }

        buscarDados();
    }, []);

    return (
        <>
            <Header />

            <div style={{ display: "flex" }}>
                <div className="col-lg-3">
                    <Filtro />
                </div>

                <div className="col-lg-9">

                    {erro && <p>{erro}</p>}

                    <div className="row">
                        {carros.map((carro) => (
                            <div className="col-md-4 mb-3" key={carro.id}>
                                <Card
                                    modelo={carro.MODELO}
                                    valor={carro.PRECO_VENDA}
                                    combustivel={carro.COMBUSTIVEL}
                                    ano={carro.ANO_MODELO}
                                    nome={carro.MARCA}
                                    km={carro.KM}
                                    cambio={carro.CAMBIO}
                                />
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
}
