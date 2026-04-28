import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./Garagem.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../App";

export default function Garagem() {
    const navigate = useNavigate();
    const [veiculos, setVeiculos] = useState([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarVeiculos() {
            try {
                const response = await fetch(`${API_URL}/buscar_veiculo`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({})
                });

                const data = await response.json();

                if (!response.ok) {
                    setErro(data.mensagem || "Erro ao buscar veículos.");
                    return;
                }

                setVeiculos(data.veiculos || data);
            } catch (error) {
                setErro("Erro ao conectar com o servidor.");
            }
        }

        buscarVeiculos();
    }, []);

    const valorGaragem = veiculos.reduce((total, carro) => {
        return total + Number(carro.PRECO_VENDA || 0);
    }, 0);

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={`${css.garagem} container-fluid`}>
                    <div className={`${css.topo} d-flex flex-column flex-md-row justify-content-between align-items-center gap-3`}>
                        <h1 className={css.titulo}>Garagem</h1>

                        <Link to="/Cadastroveiculo" className={css.botaoNovo}>
                            <span className={css.mais}>⊕</span>
                            Novo Veículo
                        </Link>
                    </div>

                    <section className="row g-4 justify-content-center">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className={css.card}>
                                <div className={`${css.iconeBox} ${css.azul}`}>
                                    <span>▣</span>
                                </div>

                                <div>
                                    <p className={css.cardLabel}>Estoque total</p>
                                    <h2 className={css.cardValor}>{veiculos.length}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <div className={css.card}>
                                <div className={`${css.iconeBox} ${css.verde}`}>
                                    <span>$</span>
                                </div>

                                <div>
                                    <p className={css.cardLabel}>Valor da garagem</p>
                                    <h2 className={css.cardValor}>{formatarPreco(valorGaragem)}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <div className={css.card}>
                                <div className={`${css.iconeBox} ${css.laranja}`}>
                                    <span>◫</span>
                                </div>

                                <div>
                                    <p className={css.cardLabel}>Veículos ativos</p>
                                    <h2 className={css.cardValor}>{veiculos.length}</h2>
                                </div>
                            </div>
                        </div>
                    </section>

                    {erro && <p className={css.erro}>{erro}</p>}

                    <section className={css.tabelaBox}>
                        <div className="table-responsive">
                            <table className={`table align-middle ${css.tabela}`}>
                                <thead>
                                <tr>
                                    <th>MODELO</th>
                                    <th>ANO</th>
                                    <th>KM</th>
                                    <th>PREÇO</th>
                                    <th>AÇÕES</th>
                                </tr>
                                </thead>

                                <tbody>
                                {veiculos.map((carro, index) => (
                                    <tr
                                        key={carro.ID_VEICULO || carro.RENAVAM || index}
                                        onClick={() => navigate("/VisualizarAdm", { state: { carro } })}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>
                                            <div className={css.modeloCell}>
                                                <img src="/Car.png" alt={carro.MODELO} />
                                                <span>{carro.MARCA} {carro.MODELO}</span>
                                            </div>
                                        </td>

                                        <td>{carro.ANO_MODELO}</td>

                                        <td>
                                            {Number(carro.KM || 0).toLocaleString("pt-BR")} km
                                        </td>

                                        <td className={css.preco}>
                                            {formatarPreco(carro.PRECO_VENDA)}
                                        </td>

                                        <td className={css.acoes}>
                                            🔧 ✎ 🗑
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={css.paginacao}>
                            <button className={css.paginaSeta}>‹</button>
                            <button className={`${css.pagina} ${css.ativa}`}>1</button>
                            <button className={css.pagina}>2</button>
                            <button className={css.pagina}>3</button>
                            <button className={css.paginaSeta}>›</button>
                        </div>
                    </section>
                </main>
            </div>

            <Footer />
        </>
    );
}