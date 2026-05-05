import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import css from "./VisualizarCarroAdm.module.css";
import { API_URL } from "../../App";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
  <rect width="900" height="520" fill="#f1f5f9"/>
  <text x="450" y="260" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="34" font-weight="700" fill="#64748b">Sem imagem</text>
</svg>
`)}`;
const MANUTENCOES_POR_PAGINA = 3;

function imagensVeiculo(idVeiculo, numeroFoto = 1) {
    if (!idVeiculo) return [];

    const versao = Date.now();

    return [
        `${API_URL}/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
    ];
}

function testarImagem(urls) {
    return new Promise((resolve) => {
        let indice = 0;

        function tentar() {
            if (indice >= urls.length) {
                resolve(null);
                return;
            }

            const img = new Image();
            img.onload = () => resolve(urls[indice]);
            img.onerror = () => {
                indice += 1;
                tentar();
            };
            img.src = urls[indice];
        }

        tentar();
    });
}

function tentarProximaImagem(e, imagens = []) {
    const indiceAtual = Number(e.currentTarget.dataset.indice || 0);
    const proximoIndice = indiceAtual + 1;

    if (proximoIndice < imagens.length) {
        e.currentTarget.dataset.indice = String(proximoIndice);
        e.currentTarget.src = imagens[proximoIndice];
    }
}

export default function VisualizarCarroAdm() {
    const location = useLocation();
    const navigate = useNavigate();

    const carro = location.state?.carro;

    const imagemSemFoto = { numero: 0, urls: [IMAGEM_PADRAO], placeholder: true };
    const [imagens, setImagens] = useState([imagemSemFoto]);
    const [imagemPrincipal, setImagemPrincipal] = useState(imagemSemFoto);

    const [itens, setItens] = useState([]);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    const [modalExcluir, setModalExcluir] = useState(false);
    const [itemExcluir, setItemExcluir] = useState(null);
    const [manutencaoAberta, setManutencaoAberta] = useState(null);
    const [manutencaoExcluir, setManutencaoExcluir] = useState(null);
    const [paginaManutencao, setPaginaManutencao] = useState(1);

    const manutencoes = agruparManutencoes(itens);
    const totalPaginasManutencao = Math.max(
        1,
        Math.ceil(manutencoes.length / MANUTENCOES_POR_PAGINA)
    );
    const inicioPaginaManutencao = (paginaManutencao - 1) * MANUTENCOES_POR_PAGINA;
    const manutencoesPaginadas = manutencoes.slice(
        inicioPaginaManutencao,
        inicioPaginaManutencao + MANUTENCOES_POR_PAGINA
    );
    const totalManutencoes = manutencoes.reduce(
        (total, manutencao) => total + Number(manutencao.valor_total || 0),
        0
    );

    useEffect(() => {
        buscarItens();
        carregarImagensDisponiveis();
    }, [carro]);

    useEffect(() => {
        setPaginaManutencao((paginaAtual) =>
            Math.min(paginaAtual, totalPaginasManutencao)
        );
    }, [totalPaginasManutencao]);

    async function carregarImagensDisponiveis() {
        if (!carro?.ID_VEICULO) {
            setImagens([imagemSemFoto]);
            setImagemPrincipal(imagemSemFoto);
            return;
        }

        const encontradas = [];

        for (let numero = 1; numero <= 10; numero += 1) {
            const urls = imagensVeiculo(carro.ID_VEICULO, numero);
            const urlValida = await testarImagem(urls);

            if (!urlValida) break;

            encontradas.push({
                numero,
                urls: [urlValida],
                placeholder: false,
            });
        }

        const listaFinal = encontradas.length > 0 ? encontradas : [imagemSemFoto];

        setImagens(listaFinal);
        setImagemPrincipal(listaFinal[0]);
    }

    async function buscarItens() {
        if (!carro?.ID_VEICULO) return;

        try {
            const manutencoesPendentes = buscarManutencoesPendentes();
            const manutencoesCadastradas = [
                ...manutencoesPendentes,
                ...(await buscarManutencoes()),
            ];
            const response = await fetch(`${API_URL}/buscar_itens_manutencao_veiculo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                const manutencoesDaResposta = extrairManutencoes(data);

                if (manutencoesDaResposta.length > 0) {
                    setItens(
                        mesclarManutencoesComItens(
                            [...manutencoesCadastradas, ...manutencoesDaResposta],
                            []
                        )
                    );
                    return;
                }

                const itensManutencao = data.itens || [];
                setItens(mesclarManutencoesComItens(manutencoesCadastradas, itensManutencao));
            } else {
                setItens(mesclarManutencoesComItens(manutencoesCadastradas, []));
            }
        } catch (error) {
            console.error(error);
            setItens(mesclarManutencoesComItens(buscarManutencoesPendentes(), []));
        }
    }

    function chaveManutencoesPendentes(idVeiculo) {
        return `webcar:manutencoes-sem-itens:${idVeiculo}`;
    }

    function buscarManutencoesPendentes() {
        if (!carro?.ID_VEICULO) return [];

        try {
            const salvas = JSON.parse(
                sessionStorage.getItem(chaveManutencoesPendentes(carro.ID_VEICULO)) || "[]"
            );
            const mapa = new Map();

            salvas.forEach((manutencao) => {
                const id = idManutencaoDe(manutencao);

                if (id) {
                    mapa.set(String(id), manutencao);
                }
            });

            return Array.from(mapa.values());
        } catch {
            return [];
        }
    }

    async function buscarManutencoes() {
        try {
            const response = await fetch(`${API_URL}/buscar_manutencao`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                }),
            });

            if (!response.ok) return [];

            const data = await response.json().catch(() => ({}));
            return data.manutencoes || data["manutenções"] || data.manutencao || [];
        } catch {
            return [];
        }
    }

    function getCampo(objeto, nomes) {
        for (const nome of nomes) {
            if (objeto?.[nome] !== undefined && objeto?.[nome] !== null) {
                return objeto[nome];
            }
        }

        return undefined;
    }

    function idManutencaoDe(registro, fallback) {
        return getCampo(registro, [
            "id_manutencao",
            "ID_MANUTENCAO",
            "idManutencao",
            "ID",
            "id",
            "codigo_manutencao",
            "CODIGO_MANUTENCAO",
            "id manutenção",
            "id manutenÃ§Ã£o",
        ]) || fallback;
    }

    function idItemDe(registro) {
        return getCampo(registro, [
            "id_item_manutencao",
            "ID_ITEM_MANUTENCAO",
            "idItemManutencao",
            "id_item_manutencao_servico",
            "ID_ITEM_MANUTENCAO_SERVICO",
            "id_item_servico",
            "ID_ITEM_SERVICO",
            "idManutencaoServico",
            "id_item",
            "ID_ITEM",
        ]);
    }

    function itensDeManutencao(registro) {
        return getCampo(registro, [
            "itens",
            "ITENS",
            "items",
            "servicos",
            "serviÃ§os",
            "serviços",
            "itens_manutencao",
            "itensManutencao",
        ]) || [];
    }

    function dataManutencaoDe(registro) {
        return getCampo(registro, [
            "data",
            "DATA",
            "data_manutencao",
            "DATA_MANUTENCAO",
            "dataManutencao",
        ]);
    }

    function valorManutencaoDe(registro) {
        return Number(
            getCampo(registro, [
                "valor_total",
                "VALOR_TOTAL",
                "valorTotal",
                "total",
                "TOTAL",
            ]) || 0
        );
    }

    function extrairManutencoes(data) {
        const lista = getCampo(data, [
            "manutencoes",
            "manutenções",
            "manutenÃ§Ãµes",
            "manutencao",
            "manutenção",
            "manutenÃ§Ã£o",
        ]);

        if (!Array.isArray(lista)) return [];

        return lista.map((manutencao, index) =>
            normalizarManutencao(manutencao, `manutencao-${index}`)
        );
    }

    function normalizarItem(item, idManutencao) {
        const quantidade = Number(getCampo(item, ["quantidade", "QUANTIDADE", "qtd", "QTD"]) || 0);
        const valorTotal = Number(getCampo(item, ["valor_total", "VALOR_TOTAL", "valorTotal"]) || 0);
        const valorUnitario = Number(
            getCampo(item, ["valor_unitario", "VALOR_UNITARIO", "valorUnitario"]) ||
            (quantidade > 0 ? valorTotal / quantidade : 0)
        );

        return {
            ...item,
            id_manutencao: idManutencao,
            id_item_manutencao: idItemDe(item),
            id_servico: getCampo(item, ["id_servico", "ID_SERVICO", "idServico"]),
            descricao: getCampo(item, ["descricao", "DESCRICAO", "descrição", "descriÃ§Ã£o"]) || "Serviço",
            quantidade,
            valor_unitario: valorUnitario,
            valor_total: valorTotal || valorUnitario * quantidade,
        };
    }

    function normalizarManutencao(manutencao, fallback) {
        const idManutencao = idManutencaoDe(manutencao, fallback);
        const itensNormalizados = itensDeManutencao(manutencao).map((item) =>
            normalizarItem(item, idManutencao)
        );
        const totalItens = itensNormalizados.reduce(
            (total, item) => total + Number(item.valor_total || 0),
            0
        );

        return {
            id_manutencao: idManutencao,
            data: dataManutencaoDe(manutencao),
            valor_total: totalItens || valorManutencaoDe(manutencao),
            temItens: true,
            ehManutencao: true,
            recebeuItensDoBackend: false,
            itens: itensNormalizados,
        };
    }

    function mesclarManutencoesComItens(manutencoesCadastradas, itensManutencao) {
        const mapa = new Map();

        manutencoesCadastradas.forEach((manutencao, index) => {
            const normalizada = normalizarManutencao(manutencao, `manutencao-${index}`);
            mapa.set(String(normalizada.id_manutencao), normalizada);
        });

        itensManutencao.forEach((item, index) => {
            const idManutencao = idManutencaoDe(item, `sem-id-${index}`);

            if (!mapa.has(String(idManutencao))) {
                mapa.set(String(idManutencao), {
                    id_manutencao: idManutencao,
                    data: dataManutencaoDe(item),
                    valor_total: 0,
                    temItens: true,
                    ehManutencao: true,
                    recebeuItensDoBackend: false,
                    itens: [],
                });
            }

            const manutencao = mapa.get(String(idManutencao));

            if (!manutencao.recebeuItensDoBackend) {
                manutencao.itens = [];
                manutencao.valor_total = 0;
                manutencao.recebeuItensDoBackend = true;
            }

            const itemNormalizado = normalizarItem(item, idManutencao);
            manutencao.itens.push(itemNormalizado);
            manutencao.valor_total += Number(itemNormalizado.valor_total || 0);
        });

        return Array.from(mapa.values());
    }

    function mostrarMensagem(texto, tipo) {
        setMensagem(texto);
        setTipoMensagem(tipo);

        setTimeout(() => {
            setMensagem("");
            setTipoMensagem("");
        }, 3000);
    }

    function abrirModalExcluir(item) {
        setItemExcluir(item);
        setModalExcluir(true);
    }

    function abrirModalManutencao(manutencao) {
        setManutencaoAberta(manutencao);
    }

    function fecharModalManutencao() {
        setManutencaoAberta(null);
    }

    function abrirModalExcluirManutencao(manutencao) {
        setManutencaoExcluir(manutencao);
    }

    function fecharModalExcluirManutencao() {
        setManutencaoExcluir(null);
    }

    function removerManutencaoPendente(idManutencao) {
        if (!carro?.ID_VEICULO || !idManutencao) return;

        try {
            const chave = chaveManutencoesPendentes(carro.ID_VEICULO);
            const salvas = JSON.parse(sessionStorage.getItem(chave) || "[]");
            const atualizadas = salvas.filter(
                (manutencao) =>
                    String(idManutencaoDe(manutencao)) !== String(idManutencao)
            );

            sessionStorage.setItem(chave, JSON.stringify(atualizadas));
        } catch {
            // Mantem a tela funcionando mesmo se a sessao estiver indisponivel.
        }
    }

    function removerManutencaoDaTela(idManutencao) {
        setItens((listaAtual) =>
            listaAtual.filter(
                (item) => String(item.id_manutencao) !== String(idManutencao)
            )
        );
    }

    async function excluirManutencaoInteira() {
        const manutencao = manutencaoExcluir;

        if (!manutencao?.id_manutencao) {
            mostrarMensagem("Manutenção não encontrada para exclusão.", "erro");
            fecharModalExcluirManutencao();
            return;
        }

        try {
            for (const item of manutencao.itens || []) {
                if (item?.id_item_manutencao) {
                    const responseItem = await fetch(
                        `${API_URL}/deletar_item_manutencao/${item.id_item_manutencao}`,
                        {
                            method: "DELETE",
                            credentials: "include",
                        }
                    );
                    const dataItem = await responseItem.json().catch(() => ({}));

                    if (!responseItem.ok) {
                        mostrarMensagem(
                            dataItem.mensagem || "Não foi possível excluir os itens da manutenção.",
                            "erro"
                        );
                        fecharModalManutencao();
                        fecharModalExcluirManutencao();
                        return;
                    }
                }
            }

            const response = await fetch(
                `${API_URL}/deletar_manutencao/${manutencao.id_manutencao}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            const data = await response.json().catch(() => ({}));
            const mensagem = String(data.mensagem || "").toLowerCase();

            if (mensagem.includes("não existe")) {
                removerManutencaoPendente(manutencao.id_manutencao);
                removerManutencaoDaTela(manutencao.id_manutencao);
                fecharModalManutencao();
                fecharModalExcluirManutencao();
                mostrarMensagem("Manutenção removida da tela.", "sucesso");
                return;
            }

            if (!response.ok || mensagem.includes("erro")) {
                mostrarMensagem(data.mensagem || "Não foi possível excluir a manutenção.", "erro");
                fecharModalManutencao();
                fecharModalExcluirManutencao();
                return;
            }

            removerManutencaoPendente(manutencao.id_manutencao);
            removerManutencaoDaTela(manutencao.id_manutencao);
            fecharModalManutencao();
            fecharModalExcluirManutencao();
            mostrarMensagem(data.mensagem || "Manutenção excluída com sucesso.", "sucesso");
        } catch (error) {
            console.error(error);
            fecharModalExcluirManutencao();
            mostrarMensagem("Não foi possível excluir a manutenção.", "erro");
        }
    }

    function agruparManutencoes(listaItens) {
        if (listaItens.every((item) => item.ehManutencao)) {
            return listaItens.sort((a, b) => {
                const dataA = new Date(a.data).getTime() || 0;
                const dataB = new Date(b.data).getTime() || 0;
                return dataB - dataA;
            });
        }

        const mapa = new Map();

        listaItens.forEach((item, index) => {
            const idManutencao =
                item.id_manutencao ||
                item.ID_MANUTENCAO ||
                item.idManutencao ||
                `sem-id-${index}`;

            if (!mapa.has(idManutencao)) {
                mapa.set(idManutencao, {
                    id_manutencao: idManutencao,
                    data: item.data || item.DATA || item.data_manutencao || item.DATA_MANUTENCAO,
                    valor_total: 0,
                    temItens: false,
                    itens: [],
                });
            }

            const manutencao = mapa.get(idManutencao);
            const temItem =
                item.id_item_manutencao ||
                item.ID_ITEM_MANUTENCAO ||
                item.id_servico ||
                item.ID_SERVICO ||
                item.descricao;

            if (temItem) {
                if (!manutencao.temItens) {
                    manutencao.valor_total = 0;
                    manutencao.temItens = true;
                }

                manutencao.itens.push(item);
                manutencao.valor_total += Number(item.valor_total || 0);
            } else if (!manutencao.temItens) {
                manutencao.valor_total = Number(
                    item.valor_total || item.VALOR_TOTAL || manutencao.valor_total || 0
                );
            }
        });

        return Array.from(mapa.values()).sort((a, b) => {
            const dataA = new Date(a.data).getTime() || 0;
            const dataB = new Date(b.data).getTime() || 0;
            return dataB - dataA;
        });
    }

    function fecharModalExcluir() {
        setItemExcluir(null);
        setModalExcluir(false);
    }

    async function confirmarExcluirItem() {
        if (!itemExcluir?.id_item_manutencao) {
            mostrarMensagem(
                "Este item ainda não possui identificador para exclusão. Atualize a página e tente novamente.",
                "erro"
            );
            fecharModalExcluir();
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/deletar_item_manutencao/${itemExcluir.id_item_manutencao}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                mostrarMensagem(data.mensagem || "Não foi possível excluir este item.", "erro");
                return;
            }

            mostrarMensagem(data.mensagem || "Item removido com sucesso.", "sucesso");
            setItens((listaAtual) =>
                listaAtual.map((manutencao) => {
                    if (!manutencao.ehManutencao) return manutencao;

                    const itensAtualizados = manutencao.itens.filter(
                        (item) =>
                            String(item.id_item_manutencao) !==
                            String(itemExcluir.id_item_manutencao)
                    );

                    return {
                        ...manutencao,
                        itens: itensAtualizados,
                        valor_total: itensAtualizados.reduce(
                            (total, item) => total + Number(item.valor_total || 0),
                            0
                        ),
                    };
                })
            );
            fecharModalExcluir();
            buscarItens();
        } catch (error) {
            console.error(error);
            mostrarMensagem("Não foi possível excluir este item.", "erro");
        }
    }

    if (!carro) {
        return (
            <div className="container py-5">
                <h3>Veículo não encontrado.</h3>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/garagem")}>
                    Voltar para garagem
                </button>
            </div>
        );
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function formatarData(data) {
        if (!data) return "Não informado";

        if (String(data).includes("/")) {
            return String(data);
        }

        try {
            return new Date(data).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
            });
        } catch {
            return String(data);
        }
    }

    function textoCambio(valor) {
        if (String(valor) === "0") return "Manual";
        if (String(valor) === "1") return "Automático";
        return valor || "Não informado";
    }

    function textoCombustivel(valor) {
        if (String(valor) === "0") return "Flex";
        if (String(valor) === "1") return "Gasolina";
        if (String(valor) === "2") return "Etanol";
        if (String(valor) === "3") return "Diesel";
        return valor || "Não informado";
    }

    function renderManutencoesDetalhadas() {
        if (manutencoes.length === 0) {
            return (
                <div className={css.estadoVazioManutencao}>
                    <h4>Nenhuma manutenção cadastrada</h4>
                    <p>Adicione uma manutenção para registrar o histórico deste veículo.</p>
                </div>
            );
        }

        return (
            <>
                <div className={css.listaManutencoesCompacta}>
                    {manutencoesPaginadas.map((manutencao, index) => (
                        <button
                            type="button"
                            className={css.botaoManutencaoCompacta}
                            key={manutencao.id_manutencao}
                            onClick={() => abrirModalManutencao(manutencao)}
                        >
                            <div>
                                <span className={css.indiceManutencao}>
                                    Manutenção {inicioPaginaManutencao + index + 1}
                                </span>
                                <strong>{formatarData(manutencao.data)}</strong>
                            </div>

                            <div className={css.resumoManutencaoCompacta}>
                                <span>
                                    {manutencao.itens.length === 0
                                        ? "Sem itens"
                                        : `${manutencao.itens.length} item(ns)`}
                                </span>
                                <strong>{formatarPreco(manutencao.valor_total)}</strong>
                            </div>
                        </button>
                    ))}
                </div>

                {totalPaginasManutencao > 1 && (
                    <div className={css.paginacaoManutencao}>
                        <button
                            type="button"
                            disabled={paginaManutencao === 1}
                            onClick={() =>
                                setPaginaManutencao((pagina) => Math.max(1, pagina - 1))
                            }
                        >
                            Anterior
                        </button>

                        <span>{paginaManutencao} / {totalPaginasManutencao}</span>

                        <button
                            type="button"
                            disabled={paginaManutencao === totalPaginasManutencao}
                            onClick={() =>
                                setPaginaManutencao((pagina) =>
                                    Math.min(totalPaginasManutencao, pagina + 1)
                                )
                            }
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </>
        );
    }

    function renderModalManutencao() {
        if (!manutencaoAberta) return null;

        const indice = manutencoes.findIndex(
            (manutencao) =>
                String(manutencao.id_manutencao) === String(manutencaoAberta.id_manutencao)
        );
        const manutencaoAtual =
            manutencoes.find(
                (manutencao) =>
                    String(manutencao.id_manutencao) === String(manutencaoAberta.id_manutencao)
            ) || manutencaoAberta;

        return (
            <div className={css.modalFundo}>
                <div className={css.modalManutencao}>
                    <div className={css.modalTopo}>
                        <div>
                            <span className={css.indiceManutencao}>
                                Manutenção {indice >= 0 ? indice + 1 : ""}
                            </span>
                            <h3>{formatarData(manutencaoAtual.data)}</h3>
                            <p>
                                {manutencaoAtual.itens.length === 0
                                    ? "Esta manutenção ainda não possui itens."
                                    : `${manutencaoAtual.itens.length} item(ns) cadastrados.`}
                            </p>
                        </div>

                        <button
                            type="button"
                            className={css.fecharModal}
                            onClick={fecharModalManutencao}
                            aria-label="Fechar"
                        >
                            ×
                        </button>
                    </div>

                    <div className={css.modalResumo}>
                        <span>Total da manutenção</span>
                        <strong>{formatarPreco(manutencaoAtual.valor_total)}</strong>
                    </div>

                    <div className={css.modalAcoesManutencao}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                                navigate("/editarmanutencao", {
                                    state: { carro, manutencao: manutencaoAtual },
                                })
                            }
                        >
                            Adicionar ou editar itens
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => abrirModalExcluirManutencao(manutencaoAtual)}
                        >
                            Excluir manutenção
                        </button>
                    </div>

                    {manutencaoAtual.itens.length === 0 ? (
                        <div className={css.modalSemItens}>
                            Nenhum item cadastrado nesta manutenção.
                        </div>
                    ) : (
                        <div className={css.modalListaItens}>
                            {manutencaoAtual.itens.map((item) => (
                                <div className={css.modalItem} key={item.id_item_manutencao}>
                                    <div>
                                        <strong>{item.descricao}</strong>
                                        <span>
                                            Qtd: {item.quantidade} · {formatarPreco(item.valor_unitario)} un.
                                        </span>
                                    </div>

                                    <div className={css.modalItemAcoes}>
                                        <strong>{formatarPreco(item.valor_total)}</strong>
                                        <button
                                            type="button"
                                            className="btn btn-light text-danger btn-sm"
                                            onClick={() => abrirModalExcluir(item)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container py-4">
                {mensagem && (
                    <div
                        className={`alert ${
                            tipoMensagem === "sucesso" ? "alert-success" : "alert-danger"
                        }`}
                    >
                        {mensagem}
                    </div>
                )}

                <button className="btn btn-light mb-3" onClick={() => navigate("/garagem")}>
                    Voltar
                </button>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm p-3">
                            <div style={{ height: "420px", background: "#f8f9fa" }}>
                                <img
                                    src={imagemPrincipal.urls[0]}
                                    data-indice="0"
                                    onError={(e) => tentarProximaImagem(e, imagemPrincipal.urls)}
                                    className="w-100 h-100 rounded"
                                    style={{ objectFit: "cover" }}
                                    alt={carro.MODELO}
                                />
                            </div>

                            <div className="d-flex flex-nowrap gap-2 mt-3 overflow-auto">
                                {!imagemPrincipal.placeholder &&
                                    imagens.map((img, index) => (
                                        <img
                                            key={img.numero}
                                            src={img.urls[0]}
                                            data-indice="0"
                                            onError={(e) => tentarProximaImagem(e, img.urls)}
                                            onClick={() => setImagemPrincipal(img)}
                                            className="rounded flex-shrink-0"
                                            style={{
                                                width: "110px",
                                                height: "70px",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                                border:
                                                    imagemPrincipal.numero === img.numero
                                                        ? "2px solid #0d6efd"
                                                        : "2px solid transparent",
                                            }}
                                            alt={`Imagem ${index + 1}`}
                                        />
                                    ))}
                            </div>
                        </div>

                        <div className="row g-3 mt-3">
                            {[
                                {
                                    icon: "speedometer2",
                                    title: "QUILOMETRAGEM",
                                    value: `${Number(carro.KM || 0).toLocaleString("pt-BR")} km`,
                                },
                                {
                                    icon: "gear",
                                    title: "CÂMBIO",
                                    value: textoCambio(carro.CAMBIO),
                                },
                                {
                                    icon: "fuel-pump",
                                    title: "COMBUSTÍVEL",
                                    value: textoCombustivel(carro.COMBUSTIVEL),
                                },
                                {
                                    icon: "palette",
                                    title: "COR",
                                    value: carro.COR || "Não informado",
                                },
                            ].map((item, index) => (
                                <div className="col-6 col-md-3" key={index}>
                                    <div className="card text-center border-0 shadow-sm p-3 h-100">
                                        <i className={`bi bi-${item.icon} fs-4 text-primary mb-2`}></i>
                                        <small className="text-muted fw-semibold">{item.title}</small>
                                        <div className="fw-bold">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-4">
                            <small className="text-muted">Veículo</small>

                            <h3 className="fw-bold mb-3">
                                {carro.MARCA} {carro.MODELO}
                            </h3>

                            <small className="text-muted">Preço</small>
                            <h2 className="fw-bold">{formatarPreco(carro.PRECO_VENDA)}</h2>

                            <hr />

                            <p><strong>Ano:</strong> {carro.ANO_MODELO}</p>
                            <p><strong>Placa:</strong> {carro.PLACA}</p>
                            <p><strong>Renavam:</strong> {carro.RENAVAM}</p>
                        </div>

                        <div className={`card border-0 shadow-sm p-4 mt-3 ${css.resumoLateralManutencao}`}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h3 className="fw-bold mb-1">Manutenção</h3>
                                    <small className="text-muted">Histórico de serviços</small>
                                </div>

                                <strong className="text-primary">
                                    {formatarPreco(totalManutencoes)}
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary w-100 mb-3"
                                onClick={() => navigate("/adicionarmanutencao", { state: { carro } })}
                            >
                                Nova manutenção
                            </button>

                            {renderManutencoesDetalhadas()}
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm p-4">
                            <h5 className="fw-bold mb-3">Detalhes</h5>

                            <p className="text-muted mb-0">
                                {carro.MARCA} {carro.MODELO}, ano {carro.ANO_MODELO}, cor{" "}
                                {carro.COR}, com{" "}
                                {Number(carro.KM || 0).toLocaleString("pt-BR")} km.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {renderModalManutencao()}

            {manutencaoExcluir && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                        padding: "20px",
                    }}
                >
                    <div
                        className="bg-white rounded shadow p-4"
                        style={{ width: "100%", maxWidth: "460px" }}
                    >
                        <h4 className="fw-bold mb-2">Excluir manutenção</h4>

                        <p className="text-muted mb-0">
                            Tem certeza que deseja excluir esta manutenção inteira?
                        </p>

                        {(manutencaoExcluir.itens || []).length > 0 && (
                            <p className="text-muted mt-2 mb-0">
                                Todos os itens dela também serão removidos.
                            </p>
                        )}

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button className="btn btn-light" onClick={fecharModalExcluirManutencao}>
                                Cancelar
                            </button>

                            <button className="btn btn-danger" onClick={excluirManutencaoInteira}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalExcluir && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        className="bg-white rounded shadow p-4"
                        style={{ width: "100%", maxWidth: "440px" }}
                    >
                        <h4 className="fw-bold mb-2">Excluir item</h4>

                        <p className="text-muted">
                            Tem certeza que deseja excluir este item?{" "}
                            <strong>{itemExcluir?.descricao}</strong>
                        </p>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button className="btn btn-light" onClick={fecharModalExcluir}>
                                Cancelar
                            </button>

                            <button className="btn btn-danger" onClick={confirmarExcluirItem}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
