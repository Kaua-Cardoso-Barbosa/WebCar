import css from "./AdicionarManutencao.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useEffect, useState } from "react";
import { API_URL } from "../App";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdicionarManutencao() {
    const location = useLocation();
    const navigate = useNavigate();
    const carro = location.state?.carro;

    const [data, setData] = useState("");
    const [servicos, setServicos] = useState([]);
    const [idServico, setIdServico] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [itens, setItens] = useState([]);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [salvando, setSalvando] = useState(false);

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

            const data = await response.json();

            if (response.ok) {
                setServicos(data.servicos || []);
            }
        } catch (error) {
            console.error(error);
            setErro("Erro ao buscar serviços.");
        }
    }

    function formatarDataParaBack(dataInput) {
        const [ano, mes, dia] = dataInput.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function adicionarItem() {
        setErro("");
        setSucesso("");

        if (!idServico || !quantidade) {
            setErro("Selecione um serviço e informe a quantidade.");
            return;
        }

        const servicoSelecionado = servicos.find(
            (servico) => Number(servico.id_servico) === Number(idServico)
        );

        if (!servicoSelecionado) {
            setErro("Serviço inválido.");
            return;
        }

        const quantidadeNumero = Number(quantidade);

        if (quantidadeNumero <= 0) {
            setErro("A quantidade precisa ser maior que zero.");
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
                            quantidade: item.quantidade + quantidadeNumero,
                            valor_total:
                                Number(servicoSelecionado.valor_unitario) *
                                (item.quantidade + quantidadeNumero),
                        }
                        : item
                )
            );
        } else {
            setItens([
                ...itens,
                {
                    id_servico: servicoSelecionado.id_servico,
                    descricao: servicoSelecionado.descricao,
                    valor_unitario: Number(servicoSelecionado.valor_unitario),
                    quantidade: quantidadeNumero,
                    valor_total: Number(servicoSelecionado.valor_unitario) * quantidadeNumero,
                },
            ]);
        }

        setIdServico("");
        setQuantidade("");
    }

    function removerItem(id_servico) {
        setItens(itens.filter((item) => item.id_servico !== id_servico));
    }

    const totalPreview = itens.reduce((total, item) => total + item.valor_total, 0);

    async function handleSubmit(e) {
        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!carro?.ID_VEICULO) {
            setErro("Veículo não encontrado.");
            return;
        }

        if (!data) {
            setErro("Informe a data da manutenção.");
            return;
        }

        if (itens.length === 0) {
            setErro("Adicione pelo menos um item de manutenção.");
            return;
        }

        try {
            setSalvando(true);

            const responseManutencao = await fetch(`${API_URL}/adicionar_manutencao`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                    data: formatarDataParaBack(data),
                }),
            });

            const dataManutencao = await responseManutencao.json();

            if (!responseManutencao.ok) {
                setErro(dataManutencao.mensagem || "Erro ao cadastrar manutenção.");
                return;
            }

            const idManutencao = dataManutencao.id_manutencao;

            if (!idManutencao) {
                setErro("A manutenção foi criada, mas o ID não foi retornado pelo back.");
                return;
            }

            for (const item of itens) {
                const responseItem = await fetch(`${API_URL}/adicionar_item_manutencao`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        id_manutencao: idManutencao,
                        id_servico: item.id_servico,
                        quantidade: item.quantidade,
                    }),
                });

                const dataItem = await responseItem.json();

                if (!responseItem.ok) {
                    setErro(dataItem.mensagem || "Erro ao cadastrar item da manutenção.");
                    return;
                }
            }

            setSucesso("Manutenção cadastrada com sucesso!");

            setTimeout(() => {
                navigate(-1);
            }, 1000);
        } catch (error) {
            console.error(error);
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header />

            <div className={css.container}>
                <div className={css.card}>
                    <div className={css.topo}>
                        <div>
                            <h2>Adicionar manutenção</h2>

                            {carro && (
                                <p>
                                    Veículo:{" "}
                                    <strong>
                                        {carro.MARCA} {carro.MODELO}
                                    </strong>
                                </p>
                            )}
                        </div>
                    </div>

                    {erro && <div className={css.erro}>{erro}</div>}
                    {sucesso && <div className={css.sucesso}>{sucesso}</div>}

                    <form className={css.form} onSubmit={handleSubmit}>
                        <div className={css.inputgroup}>
                            <label>Data da manutenção</label>
                            <input
                                className={css.input}
                                type="date"
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
                                    <option value="">Selecione um serviço</option>

                                    {servicos.map((servico) => (
                                        <option
                                            key={servico.id_servico}
                                            value={servico.id_servico}
                                        >
                                            {servico.descricao} —{" "}
                                            {Number(servico.valor_unitario).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
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
                        >
                            Adicionar item +
                        </button>

                        <div className={css.listaItens}>
                            <h3>Itens da manutenção</h3>

                            {itens.length === 0 ? (
                                <p className={css.vazio}>Nenhum item adicionado.</p>
                            ) : (
                                itens.map((item) => (
                                    <div className={css.item} key={item.id_servico}>
                                        <div>
                                            <strong>{item.descricao}</strong>
                                            <span>
                                                {item.quantidade}x de{" "}
                                                {item.valor_unitario.toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}
                                            </span>
                                        </div>

                                        <div className={css.itemDireita}>
                                            <strong>
                                                {item.valor_total.toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}
                                            </strong>

                                            <button
                                                type="button"
                                                onClick={() => removerItem(item.id_servico)}
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={css.total}>
                            <span>Total da manutenção</span>
                            <strong>
                                {totalPreview.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </strong>
                        </div>

                        <button type="submit" className={css.btn} disabled={salvando}>
                            {salvando ? "Salvando..." : "Confirmar manutenção"} <span>→</span>
                        </button>

                        <button
                            type="button"
                            className={css.cancelar}
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}