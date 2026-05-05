import css from "./EditarManutencao.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useEffect, useState } from "react";
import { API_URL } from "../App";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditarManutencao() {
    const location = useLocation();
    const navigate = useNavigate();

    const manutencao = location.state?.manutencao;
    const carro = location.state?.carro;

    const [data, setData] = useState(formatarDataParaInput(manutencao?.data));
    const [servicos, setServicos] = useState([]);
    const [idServico, setIdServico] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [itensOriginais] = useState((manutencao?.itens || []).map(normalizarItem));
    const [itens, setItens] = useState((manutencao?.itens || []).map(normalizarItem));
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [salvando, setSalvando] = useState(false);
    const hoje = new Date().toISOString().split("T")[0];

    useEffect(() => {
        buscarServicos();
    }, []);

    async function buscarServicos() {
        try {
            const response = await fetch(`${API_URL}/buscar_servico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const result = await response.json();

            if (response.ok) {
                setServicos(result.servicos || []);
            }
        } catch (error) {
            console.error(error);
            setErro("Não foi possível carregar os serviços.");
        }
    }

    async function recarregarItensManutencao() {
        if (!carro?.ID_VEICULO || !manutencao?.id_manutencao) return false;

        try {
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

            const result = await response.json();

            if (!response.ok) return false;

            const manutencoes = extrairManutencoes(result);
            const manutencaoAtualizada = manutencoes.find(
                (item) => String(item.id_manutencao) === String(manutencao.id_manutencao)
            );

            const itensAtualizados = manutencaoAtualizada
                ? manutencaoAtualizada.itens
                : (result.itens || [])
                    .filter((item) =>
                        String(idManutencaoDe(item)) === String(manutencao.id_manutencao)
                    )
                    .map(normalizarItem);

            setItens(itensAtualizados);
            return true;
        } catch (error) {
            console.error(error);
            return false;
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

    function idManutencaoDe(registro) {
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
        ]);
    }

    function idItemDe(registro) {
        return getCampo(registro, [
            "id_item_manutencao",
            "ID_ITEM_MANUTENCAO",
            "idItemManutencao",
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
            "serviços",
            "serviÃ§os",
            "itens_manutencao",
            "itensManutencao",
        ]) || [];
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

        return lista.map((item) => {
            const idManutencao = idManutencaoDe(item);

            return {
                id_manutencao: idManutencao,
                itens: itensDeManutencao(item).map((itemManutencao) =>
                    normalizarItem({
                        ...itemManutencao,
                        id_manutencao: idManutencao,
                    })
                ),
            };
        });
    }

    function normalizarItem(item) {
        const quantidadeItem = Number(item.quantidade || item.QUANTIDADE || 0);
        const valorTotal = Number(item.valor_total || item.VALOR_TOTAL || 0);
        const valorUnitario = Number(
            item.valor_unitario ||
            item.VALOR_UNITARIO ||
            (quantidadeItem > 0 ? valorTotal / quantidadeItem : 0)
        );

        const idServicoItem = getCampo(item, ["id_servico", "ID_SERVICO", "idServico"]);

        return {
            ...item,
            id_manutencao: idManutencaoDe(item) || manutencao?.id_manutencao,
            id_item_manutencao: idItemDe(item) || `local-${idServicoItem || Date.now()}`,
            id_servico: idServicoItem,
            descricao: getCampo(item, ["descricao", "DESCRICAO", "descrição", "descriÃ§Ã£o"]) || "Serviço",
            quantidade: quantidadeItem,
            quantidadeSalva: Number(item.quantidadeSalva || quantidadeItem),
            valor_unitario: valorUnitario,
            valor_total: valorTotal || valorUnitario * quantidadeItem,
        };
    }

    function formatarDataParaInput(dataRecebida) {
        if (!dataRecebida) return "";

        const texto = String(dataRecebida);

        if (texto.includes("-")) {
            const partes = texto.split("-");
            return `${partes[0]}-${partes[1]}-${partes[2].substring(0, 2)}`;
        }

        if (texto.includes("/")) {
            const [dia, mes, ano] = texto.split("/");
            return `${ano}-${mes}-${dia}`;
        }

        const dataConvertida = new Date(texto);

        if (!Number.isNaN(dataConvertida.getTime())) {
            return dataConvertida.toISOString().split("T")[0];
        }

        return "";
    }

    function formatarDataParaBack(dataInput) {
        const [ano, mes, dia] = dataInput.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function atualizarQuantidadeLocal(idItem, novaQuantidade) {
        setItens((listaAtual) =>
            listaAtual.map((item) => {
                if (String(item.id_item_manutencao) !== String(idItem)) return item;

                const quantidadeNumero = Number(novaQuantidade);

                return {
                    ...item,
                    quantidade: novaQuantidade,
                    valor_total:
                        quantidadeNumero > 0
                            ? Number(item.valor_unitario || 0) * quantidadeNumero
                            : 0,
                };
            })
        );
    }

    async function adicionarItemManutencao(idServicoNovo, quantidadeNova) {
        const response = await fetch(`${API_URL}/adicionar_item_manutencao`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                id_manutencao: manutencao.id_manutencao,
                id_servico: idServicoNovo,
                quantidade: quantidadeNova,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensagem || "Não foi possível adicionar o item.");
        }

        return result;
    }

    async function excluirItemManutencao(idItem) {
        const response = await fetch(`${API_URL}/deletar_item_manutencao/${idItem}`, {
            method: "DELETE",
            credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensagem || "Não foi possível excluir o item.");
        }

        return result;
    }

    function adicionarItem() {
        setErro("");
        setSucesso("");

        if (!idServico || !quantidade) {
            setErro("Selecione um serviço e informe a quantidade.");
            return;
        }

        const quantidadeNumero = Number(quantidade);

        if (quantidadeNumero <= 0) {
            setErro("A quantidade precisa ser maior que zero.");
            return;
        }

        const servicoSelecionado = servicos.find(
            (servico) => Number(servico.id_servico) === Number(idServico)
        );

        if (!servicoSelecionado) {
            setErro("Serviço inválido.");
            return;
        }

        const itemExistente = itens.find(
            (item) => Number(item.id_servico) === Number(idServico)
        );

        if (itemExistente) {
            setItens((listaAtual) =>
                listaAtual.map((item) =>
                    Number(item.id_servico) === Number(idServico)
                        ? {
                            ...item,
                            quantidade: Number(item.quantidade || 0) + quantidadeNumero,
                            valor_total:
                                Number(item.valor_unitario || 0) *
                                (Number(item.quantidade || 0) + quantidadeNumero),
                        }
                        : item
                )
            );
        } else {
            setItens((listaAtual) => [
                ...listaAtual,
                {
                    id_item_manutencao: `local-${servicoSelecionado.id_servico}-${Date.now()}`,
                    id_servico: servicoSelecionado.id_servico,
                    descricao: servicoSelecionado.descricao,
                    valor_unitario: Number(servicoSelecionado.valor_unitario),
                    quantidade: quantidadeNumero,
                    quantidadeSalva: quantidadeNumero,
                    valor_total: Number(servicoSelecionado.valor_unitario) * quantidadeNumero,
                },
            ]);
        }

        setIdServico("");
        setQuantidade("");
    }

    async function alterarQuantidadeItem(item, quantidadeNova = item.quantidade) {
        setErro("");
        setSucesso("");

        const quantidadeNumero = Number(quantidadeNova);

        if (quantidadeNumero <= 0) {
            await removerItem(item);
            return;
        }

        try {
            setSalvando(true);
            await excluirItemManutencao(item.id_item_manutencao);
            const itemAtualizado = await adicionarItemManutencao(item.id_servico, quantidadeNumero);
            const recarregou = await recarregarItensManutencao();

            if (recarregou) {
                setSucesso("Quantidade atualizada com sucesso.");
                return;
            }

            setItens((listaAtual) =>
                listaAtual.map((itemAtual) =>
                    String(itemAtual.id_item_manutencao) === String(item.id_item_manutencao)
                        ? {
                            ...itemAtual,
                            id_item_manutencao:
                                itemAtualizado.id_item_manutencao ||
                                itemAtualizado.id_item ||
                                itemAtual.id_item_manutencao,
                            quantidade: quantidadeNumero,
                            quantidadeSalva: quantidadeNumero,
                            valor_total: Number(itemAtual.valor_unitario || 0) * quantidadeNumero,
                        }
                        : itemAtual
                )
            );

            setSucesso("Quantidade atualizada com sucesso.");
        } catch (error) {
            console.error(error);
            setErro(error.message || "Não foi possível atualizar a quantidade.");
        } finally {
            setSalvando(false);
        }
    }

    function removerItem(item) {
        setErro("");
        setSucesso("");

        setItens((listaAtual) =>
            listaAtual.filter(
                (itemAtual) =>
                    String(itemAtual.id_item_manutencao) !== String(item.id_item_manutencao)
            )
        );
    }

    const totalPreview = itens.reduce(
        (total, item) => total + Number(item.valor_total || 0),
        0
    );

    function itemTemIdReal(item) {
        return item?.id_item_manutencao && !String(item.id_item_manutencao).startsWith("local-");
    }

    async function salvarItensDaManutencao() {
        for (const itemOriginal of itensOriginais) {
            if (itemTemIdReal(itemOriginal)) {
                await excluirItemManutencao(itemOriginal.id_item_manutencao);
            }
        }

        for (const item of itens) {
            const quantidadeNumero = Number(item.quantidade || 0);
            const servicoDoItem = servicos.find(
                (servico) =>
                    Number(servico.id_servico) === Number(item.id_servico) ||
                    String(servico.descricao).toLowerCase() ===
                    String(item.descricao).toLowerCase()
            );
            const idServico = item.id_servico || servicoDoItem?.id_servico;

            if (idServico && quantidadeNumero > 0) {
                await adicionarItemManutencao(idServico, quantidadeNumero);
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!manutencao?.id_manutencao) {
            setErro("Manutenção não encontrada.");
            return;
        }

        if (!carro?.ID_VEICULO) {
            setErro("Veículo não encontrado.");
            return;
        }

        if (!data) {
            setErro("Informe a data da manutenção.");
            return;
        }

        if (data < hoje) {
            setErro("A data da manutenção não pode ser passada.");
            return;
        }

        if (itens.some((item) => Number(item.quantidade || 0) <= 0)) {
            setErro("A quantidade dos itens precisa ser maior que zero.");
            return;
        }

        try {
            setSalvando(true);

            const response = await fetch(`${API_URL}/edicao_manutencao/${manutencao.id_manutencao}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                    data: formatarDataParaBack(data),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setErro(result.mensagem || "Não foi possível salvar as alterações.");
                return;
            }

            await salvarItensDaManutencao();

            setSucesso(result.mensagem || "Manutenção atualizada com sucesso.");

            setTimeout(() => {
                navigate(-1);
            }, 700);
        } catch (error) {
            console.error(error);
            setErro("Não foi possível salvar as alterações.");
        } finally {
            setSalvando(false);
        }
    }

    if (!manutencao || !carro) {
        return (
            <>
                <Header />
                <div className={css.container}>
                    <div className={css.card}>
                        <h2>Manutenção não encontrada</h2>
                        <button className={css.cancelar} onClick={() => navigate(-1)}>
                            Voltar
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <div className={css.container}>
                <div className={css.card}>
                    <h2>Editar manutenção</h2>

                    <p className={css.subtitulo}>
                        Veículo: <strong>{carro.MARCA} {carro.MODELO}</strong>
                    </p>

                    {erro && <div className={css.erro}>{erro}</div>}
                    {sucesso && <div className={css.sucesso}>{sucesso}</div>}

                    <form className={css.form} onSubmit={handleSubmit}>
                        <div className={css.inputgroup}>
                            <label>Data da manutenção</label>
                            <input
                                className={css.input}
                                type="date"
                                min={hoje}
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                            />
                        </div>

                        <div className={css.linha}>
                            <div className={css.inputgroup}>
                                <label>Serviço</label>
                                <select
                                    className={css.input}
                                    value={idServico}
                                    onChange={(e) => setIdServico(e.target.value)}
                                >
                                    <option value="">
                                        {servicos.length === 0 ? "Nenhum serviço cadastrado" : "Selecione um serviço"}
                                    </option>

                                    {servicos.map((servico) => (
                                        <option key={servico.id_servico} value={servico.id_servico}>
                                            {servico.descricao} - {formatarPreco(servico.valor_unitario)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={css.inputgroupMenor}>
                                <label>Qtd</label>
                                <input
                                    className={css.input}
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            className={css.btnSecundario}
                            onClick={adicionarItem}
                            disabled={salvando || servicos.length === 0}
                        >
                            Adicionar item
                        </button>

                        <div className={css.listaItens}>
                            <h3>Itens da manutenção</h3>

                            {itens.length === 0 ? (
                                <p className={css.vazio}>Esta manutenção ainda não tem itens.</p>
                            ) : (
                                itens.map((item) => (
                                    <div className={css.item} key={item.id_item_manutencao}>
                                        <div>
                                            <strong>{item.descricao}</strong>
                                            <span>
                                                {formatarPreco(item.valor_unitario)} por unidade
                                            </span>
                                        </div>

                                        <div className={css.itemDireita}>
                                            <input
                                                className={css.quantidadeItem}
                                                type="number"
                                                min="1"
                                                value={item.quantidade}
                                                onChange={(e) =>
                                                    atualizarQuantidadeLocal(
                                                        item.id_item_manutencao,
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <strong>{formatarPreco(item.valor_total)}</strong>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={css.total}>
                            <span>Total da manutenção</span>
                            <strong>{formatarPreco(totalPreview)}</strong>
                        </div>

                        <button type="submit" className={css.btn} disabled={salvando}>
                            {salvando ? "Salvando..." : "Concluir edição"}
                        </button>

                        <button
                            type="button"
                            className={css.cancelar}
                            onClick={() => navigate(-1)}
                        >
                            Voltar
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}
