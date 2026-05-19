import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./AtualizarValores.module.css";
import { useEffect, useState } from "react";
import Header from "../components/Header/Header.jsx";
import { API_URL } from "../App";
import { useNavigate } from "react-router-dom";

export default function AtualizarValores() {
    const [modo, setModo] = useState("todos");
    const [servicos, setServicos] = useState([]);
    const [idServico, setIdServico] = useState("");
    const [porcentagem, setPorcentagem] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [salvando, setSalvando] = useState(false);

    const navigate = useNavigate();

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
        }
    }

    useEffect(() => {
        buscarServicos();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!porcentagem.trim()) {
            setMensagem("Preencha a porcentagem.");
            setTipoMensagem("erro");
            return;
        }

        if (modo === "servico" && !idServico) {
            setMensagem("Selecione um serviço.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setSalvando(true);
            setMensagem("");

            const response = await fetch(`${API_URL}/atualizacao_preco`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_servico: modo === "todos" ? 0 : Number(idServico),
                    tipo: modo === "todos" ? 1 : 0,
                    porcentagem: Number(porcentagem.replace(",", ".")),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Não foi possível salvar as alterações.");
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem || "Valores atualizados com sucesso.");
            setTipoMensagem("sucesso");

            setTimeout(() => {
                navigate("/servicos");
            }, 800);
        } catch (error) {
            console.error(error);
            setMensagem("Não foi possível salvar as alterações.");
            setTipoMensagem("erro");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header/>

            <div className={css.layout}>
                <aside className={css.sidebar}>
                    <SidebarMenu/>
                </aside>

                <main className={css.main}>
                    <div className="container-fluid">

                        <div className={css.topo}>
                            <h1>Atualizar Valores</h1>

                            <p>
                                Atualize o valor dos serviços cadastrados usando uma porcentagem.
                            </p>
                        </div>

                        {mensagem && (
                            <div
                                className={`alert ${
                                    tipoMensagem === "sucesso"
                                        ? "alert-success"
                                        : "alert-danger"
                                }`}
                            >
                                {mensagem}
                            </div>
                        )}

                        <div className="card shadow-sm border-0">
                            <div className="card-body">

                                <h2 className="h5 mb-4">
                                    Informações da Atualização
                                </h2>

                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Aplicar em
                                        </label>

                                        <select
                                            className="form-select"
                                            value={modo}
                                            onChange={(e) => {
                                                setModo(e.target.value);
                                                setIdServico("");
                                            }}
                                        >
                                            <option value="todos">
                                                Todos os serviços
                                            </option>

                                            <option value="servico">
                                                Serviço específico
                                            </option>
                                        </select>
                                    </div>

                                    {modo === "servico" && (
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Serviço
                                            </label>

                                            <select
                                                className="form-select"
                                                value={idServico}
                                                onChange={(e) =>
                                                    setIdServico(e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    Selecione um serviço
                                                </option>

                                                {servicos.map((servico) => (
                                                    <option
                                                        key={servico.id_servico}
                                                        value={servico.id_servico}
                                                    >
                                                        {servico.descricao}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Porcentagem (%)
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: 10"
                                            value={porcentagem}
                                            onChange={(e) =>
                                                setPorcentagem(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="alert alert-warning">
                                        Essa atualização irá aumentar o valor atual
                                        em porcentagem.
                                    </div>

                                    <div className={css.botoes}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                navigate("/servicos")
                                            }
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={salvando}
                                        >
                                            {salvando
                                                ? "Salvando..."
                                                : "Salvar Atualização"}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}