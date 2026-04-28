import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./Garagem.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../App";

export default function Garagem() {
    const navigate = useNavigate();

    const [veiculos, setVeiculos] = useState([]);
    const [erro, setErro] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [veiculoParaDeletar, setVeiculoParaDeletar] = useState(null);

    useEffect(() => {
        buscarVeiculos();
    }, []);

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

    const valorGaragem = veiculos.reduce((total, carro) => {
        return total + Number(carro.PRECO_VENDA || 0);
    }, 0);

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function abrirModalDelete(carro) {
        setVeiculoParaDeletar(carro);
        setModalAberto(true);
    }

    function fecharModalDelete() {
        setVeiculoParaDeletar(null);
        setModalAberto(false);
    }

    async function confirmarDelete() {
        if (!veiculoParaDeletar) return;

        try {
            const response = await fetch(
                `${API_URL}/deletar_veiculo/${veiculoParaDeletar.ID_VEICULO}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem || "Erro ao deletar veículo.");
                fecharModalDelete();
                return;
            }

            setVeiculos((atuais) =>
                atuais.filter((carro) => carro.ID_VEICULO !== veiculoParaDeletar.ID_VEICULO)
            );

            fecharModalDelete();
        } catch (error) {
            setErro("Erro ao conectar com o servidor.");
            fecharModalDelete();
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.garagem}>
                    <div className={css.topo}>
                        <h1 className={css.titulo}>Garagem</h1>
                    </div>

                    <section className={css.cards}>
                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.azul}`}>
                                <span>▣</span>
                            </div>
                            <div>
                                <p className={css.cardLabel}>Estoque total</p>
                                <h2 className={css.cardValor}>{veiculos.length}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.verde}`}>
                                <span>$</span>
                            </div>
                            <div>
                                <p className={css.cardLabel}>Valor da garagem</p>
                                <h2 className={css.cardValor}>{formatarPreco(valorGaragem)}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.laranja}`}>
                                <span>◫</span>
                            </div>
                            <div>
                                <p className={css.cardLabel}>Veículos ativos</p>
                                <h2 className={css.cardValor}>{veiculos.length}</h2>
                            </div>
                        </div>
                    </section>

                    {erro && <p className={css.erro}>{erro}</p>}

                    <section className={css.tabelaBox}>
                        <table className={css.tabela}>
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
                                <tr key={carro.ID_VEICULO || carro.RENAVAM || index}>
                                    <td
                                        onClick={() => navigate("/VisualizarAdm", { state: { carro } })}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className={css.modeloCell}>
                                            <img
                                                src={carro.IMAGEM}
                                                onError={(e) => (e.target.src = "/sem-imagem.png")}
                                                alt={carro.MODELO}
                                            />
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
                                        <button
                                            type="button"
                                            className={css.btnAcao}
                                            onClick={() => navigate("/EdicaoVeiculo", { state: { carro } })}
                                        >
                                            ✎
                                        </button>

                                        <button
                                            type="button"
                                            className={css.btnAcaoDelete}
                                            onClick={() => abrirModalDelete(carro)}
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className={css.paginacao}>
                            <button className={css.paginaSeta}>‹</button>
                            <button className={`${css.pagina} ${css.ativa}`}>1</button>
                            <button className={css.paginaSeta}>›</button>
                        </div>
                    </section>
                </main>
            </div>

            {modalAberto && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h3>Deletar veículo?</h3>

                        <p>
                            Tem certeza que deseja deletar{" "}
                            <strong>
                                {veiculoParaDeletar?.MARCA} {veiculoParaDeletar?.MODELO}
                            </strong>
                            ?
                        </p>

                        <div className={css.modalBotoes}>
                            <button
                                type="button"
                                className={css.cancelarModal}
                                onClick={fecharModalDelete}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={css.confirmarModal}
                                onClick={confirmarDelete}
                            >
                                Deletar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}