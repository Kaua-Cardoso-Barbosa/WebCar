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

function veiculoEstaDisponivel(carro) {
    if (!carro) return false;

    const status = carro.STATUS ?? carro.status ?? carro.SITUACAO ?? carro.situacao;
    const vendido = carro.VENDIDO ?? carro.vendido ?? carro.ID_VENDA ?? carro.id_venda;
    const disponibilidade = carro.DISPONIBILIDADE ?? carro.disponibilidade ?? carro.ESTADO ?? carro.estado;

    if (vendido !== undefined && vendido !== null && String(vendido) !== "0" && String(vendido) !== "") {
        return false;
    }

    const textoStatus = String(status ?? disponibilidade ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (textoStatus.includes("vend") || textoStatus.includes("inativo") || textoStatus.includes("indisponivel")) {
        return false;
    }

    if (status !== undefined && status !== null && status !== "") {
        return Number(status) === 0;
    }

    return true;
}

export default function Garagem() {
    const navigate = useNavigate();

    const [veiculos, setVeiculos] = useState([]);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [veiculoParaDeletar, setVeiculoParaDeletar] = useState(null);

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
        } catch {
            setErro("Não foi possível carregar os dados. Tente novamente.");
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        buscarVeiculos();
    }, []);

    const veiculosAtivos = veiculos.filter(veiculoEstaDisponivel);
    const totalVeiculosAtivos = veiculosAtivos.length;

    const valorGaragem = veiculosAtivos.reduce((total, carro) => {
        return total + Number(carro.PRECO_VENDA || 0);
    }, 0);

    const veiculosFiltrados = veiculos.filter((carro) => {
        const veiculoDisponivel = veiculoEstaDisponivel(carro);
        const passaStatus =
            filtroStatus === "todos" ||
            (filtroStatus === "ativos" && veiculoDisponivel) ||
            (filtroStatus === "vendidos" && !veiculoDisponivel);

        const passaBusca = `${carro.MARCA} ${carro.MODELO} ${carro.ANO_MODELO} ${carro.PLACA}`
            .toLowerCase()
            .includes(busca.toLowerCase());

        return passaStatus && passaBusca;
    });

    const totalPaginas = Math.max(1, Math.ceil(veiculosFiltrados.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;

    const veiculosPaginados = veiculosFiltrados.slice(
        inicioPagina,
        inicioPagina + 15
    );

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
                atuais.filter(
                    (carro) =>
                        carro.ID_VEICULO !== veiculoParaDeletar.ID_VEICULO
                )
            );

            setSucesso(data.mensagem || "Veículo excluído com sucesso.");
            fecharModalDelete();
        } catch {
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
                        <h1>Garagem</h1>

                        <button
                            type="button"
                            className={css.botaoNovo}
                            onClick={() => navigate("/Cadastroveiculo")}
                        >
                            <span className={css.mais}>+</span>
                            Adicionar veículo
                        </button>
                    </div>

                    <section className={css.cards}>
                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.azul}`}>
                                <span>Qtd</span>
                            </div>

                            <div>
                                <p className={css.cardLabel}>
                                    Estoque total
                                </p>

                                <h2 className={css.cardValor}>
                                    {totalVeiculosAtivos}
                                </h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.verde}`}>
                                <span>R$</span>
                            </div>

                            <div>
                                <p className={css.cardLabel}>
                                    Valor ativo da garagem
                                </p>

                                <h2 className={css.cardValor}>
                                    {formatarPreco(valorGaragem)}
                                </h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <div className={`${css.iconeBox} ${css.laranja}`}>
                                <span>Ativos</span>
                            </div>

                            <div>
                                <p className={css.cardLabel}>
                                    Veículos ativos
                                </p>

                                <h2 className={css.cardValor}>
                                    {totalVeiculosAtivos}
                                </h2>
                            </div>
                        </div>
                    </section>

                    {erro && (
                        <p className={css.erro}>
                            {erro}
                        </p>
                    )}

                    {sucesso && (
                        <p className={css.sucesso}>
                            {sucesso}
                        </p>
                    )}

                    <div className={css.busca}>
                        <input
                            type="text"
                            placeholder="Buscar por ..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>

                    <div className={css.filtrosStatus}>
                        <button
                            type="button"
                            className={`${css.filtroStatus} ${filtroStatus === "todos" ? css.filtroStatusAtivo : ""}`}
                            onClick={() => {
                                setFiltroStatus("todos");
                                setPaginaAtual(1);
                            }}
                        >
                            Todos
                        </button>

                        <button
                            type="button"
                            className={`${css.filtroStatus} ${filtroStatus === "ativos" ? css.filtroStatusAtivo : ""}`}
                            onClick={() => {
                                setFiltroStatus("ativos");
                                setPaginaAtual(1);
                            }}
                        >
                            Estoque
                        </button>

                        <button
                            type="button"
                            className={`${css.filtroStatus} ${filtroStatus === "vendidos" ? css.filtroStatusAtivo : ""}`}
                            onClick={() => {
                                setFiltroStatus("vendidos");
                                setPaginaAtual(1);
                            }}
                        >
                            Vendidos
                        </button>
                    </div>

                    <section className={css.tabelaBox}>
                        <div className={css.tableResponsive}>
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

                                <tbody className={css.corpoCarrossel}>
                                {veiculosPaginados.map((carro, index) => {
                                    const veiculoDisponivel = veiculoEstaDisponivel(carro);

                                    return (
                                    <tr
                                        key={carro.ID_VEICULO || index}
                                        className={`${css.cardVeiculo} ${!veiculoDisponivel ? css.veiculoVendido : ""}`}
                                    >
                                        <td
                                            data-label="MODELO"
                                            onClick={() => {
                                                if (!veiculoDisponivel) return;

                                                navigate("/VisualizarAdm", {
                                                    state: { carro },
                                                });
                                            }}
                                            className={!veiculoDisponivel ? css.semClique : ""}
                                        >
                                            <div className={css.modeloCell}>
                                                <img
                                                    src={
                                                        imagensVeiculo(
                                                            carro.ID_VEICULO
                                                        )[0]
                                                    }
                                                    onError={(e) =>
                                                        tentarProximaImagem(
                                                            e,
                                                            imagensVeiculo(
                                                                carro.ID_VEICULO
                                                            )
                                                        )
                                                    }
                                                    alt="veiculo"
                                                />

                                                <span className={!veiculoDisponivel ? css.nomeVendido : ""}>
                                                    {carro.MARCA} {carro.MODELO}
                                                </span>
                                            </div>
                                        </td>

                                        <td data-label="ANO">
                                            {carro.ANO_MODELO}
                                        </td>

                                        <td data-label="KM">
                                            {Number(
                                                carro.KM || 0
                                            ).toLocaleString("pt-BR")} km
                                        </td>

                                        <td
                                            data-label="PREÇO"
                                            className={css.preco}
                                        >
                                            {formatarPreco(
                                                carro.PRECO_VENDA
                                            )}
                                        </td>

                                        <td
                                            data-label="AÇÕES"
                                            className={css.acoes}
                                        >
                                            {veiculoDisponivel ? (
                                                <>
                                                    <button
                                                        className={css.btnAcao}
                                                        onClick={() =>
                                                            navigate(
                                                                "/EdicaoVeiculo",
                                                                {
                                                                    state: {
                                                                        carro,
                                                                    },
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className={
                                                            css.btnAcaoDelete
                                                        }
                                                        onClick={() =>
                                                            abrirModalDelete(carro)
                                                        }
                                                    >
                                                        Excluir
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={css.statusVendido}>Vendido</span>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className={css.paginacao}>
                        <button
                            disabled={paginaAtual === 1}
                            onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                        >
                            Anterior
                        </button>

                        <span>{paginaAtual} / {totalPaginas}</span>

                        <button
                            disabled={
                                paginaAtual === totalPaginas
                            }
                            onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                        >
                            Proxima
                        </button>
                    </div>
                </main>
            </div>

            {modalAberto && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h3>Excluir veículo</h3>

                        <p>
                            Tem certeza que deseja excluir este item?{" "}
                            <strong>
                                {veiculoParaDeletar?.MARCA}{" "}
                                {veiculoParaDeletar?.MODELO}
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
