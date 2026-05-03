import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./Garagem.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../App";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
  <rect width="160" height="120" fill="#f1f5f9"/>
  <text x="80" y="60" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" font-weight="700" fill="#64748b">Sem imagem</text>
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

function exclusaoFoiConfirmada(data) {
    const mensagem = String(data?.mensagem || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    return mensagem.includes("sucesso") && (
        mensagem.includes("deletado") ||
        mensagem.includes("excluido") ||
        mensagem.includes("excluir")
    );
}

export default function Garagem() {
    const navigate = useNavigate();

    const [veiculos, setVeiculos] = useState([]);
    const [busca, setBusca] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
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
                setErro(data.mensagem || "Não foi possível carregar os dados. Tente novamente.");
                return;
            }

            setVeiculos(data.veiculos || data);
        } catch (error) {
            setErro("Não foi possível carregar os dados. Tente novamente.");
        }
    }

    const valorGaragem = veiculos.reduce((total, carro) => {
        return total + Number(carro.PRECO_VENDA || 0);
    }, 0);

    const veiculosFiltrados = veiculos.filter((carro) =>
        `${carro.MARCA} ${carro.MODELO} ${carro.ANO_MODELO} ${carro.PLACA}`
            .toLowerCase()
            .includes(busca.toLowerCase())
    );
    const totalPaginas = Math.max(1, Math.ceil(veiculosFiltrados.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const veiculosPaginados = veiculosFiltrados.slice(inicioPagina, inicioPagina + 15);

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function abrirModalDelete(carro) {
        setErro("");
        setSucesso("");
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
            setErro("");
            setSucesso("");

            const response = await fetch(
                `${API_URL}/deletar_veiculo/${veiculoParaDeletar.ID_VEICULO}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok || !exclusaoFoiConfirmada(data)) {
                setErro(data.mensagem || "Não foi possível excluir este item. Tente novamente.");
                fecharModalDelete();
                return;
            }

            setVeiculos((atuais) =>
                atuais.filter((carro) => carro.ID_VEICULO !== veiculoParaDeletar.ID_VEICULO)
            );

            setSucesso(data.mensagem || "VeÃ­culo excluÃ­do com sucesso.");
            fecharModalDelete();
        } catch (error) {
            setErro("Não foi possível excluir este item. Tente novamente.");
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
                                <span>Qtd</span>
                            </div>
                            <div>
                                <p className={css.cardLabel}>Estoque total</p>
                                <h2 className={css.cardValor}>{veiculos.length}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.verde}`}>
                                <span>R$</span>
                            </div>
                            <div>
                                <p className={css.cardLabel}>Valor da garagem</p>
                                <h2 className={css.cardValor}>{formatarPreco(valorGaragem)}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.laranja}`}>
                                <span>Ativos</span>
                            </div>
                            <div>
                                <p className={css.cardLabel}>Veículos ativos</p>
                                <h2 className={css.cardValor}>{veiculos.length}</h2>
                            </div>
                        </div>
                    </section>

                    {erro && <p className={css.erro}>{erro}</p>}
                    {sucesso && <p className={css.sucesso}>{sucesso}</p>}

                    <div className={css.busca}>
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo, ano ou placa..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>

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
                            {veiculosPaginados.length > 0 ? (
                                veiculosPaginados.map((carro, index) => (
                                    <tr key={carro.ID_VEICULO || carro.RENAVAM || index}>
                                        <td
                                            onClick={() => navigate("/VisualizarAdm", { state: { carro } })}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className={css.modeloCell}>
                                                <img
                                                    src={imagensVeiculo(carro.ID_VEICULO)[0]}
                                                    data-indice="0"
                                                    onError={(e) => tentarProximaImagem(e, imagensVeiculo(carro.ID_VEICULO))}
                                                    alt={`${carro.MARCA} ${carro.MODELO}`}
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
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className={css.btnAcaoDelete}
                                                onClick={() => abrirModalDelete(carro)}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={css.vazio}>
                                        {busca ? "Nenhum resultado encontrado." : "Nenhum veículo cadastrado."}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        <div className={css.paginacao}>
                            <button
                                type="button"
                                className={css.paginaSeta}
                                disabled={paginaAtual === 1}
                                onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                            >
                                Anterior
                            </button>
                            <button className={`${css.pagina} ${css.ativa}`}>
                                {paginaAtual} / {totalPaginas}
                            </button>
                            <button
                                type="button"
                                className={css.paginaSeta}
                                disabled={paginaAtual === totalPaginas}
                                onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                            >
                                Próxima
                            </button>
                        </div>
                    </section>
                </main>
            </div>

            {modalAberto && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h3>Excluir veículo</h3>

                        <p>
                            Tem certeza que deseja excluir este item?{" "}
                            <strong>
                                {veiculoParaDeletar?.MARCA} {veiculoParaDeletar?.MODELO}
                            </strong>
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
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
