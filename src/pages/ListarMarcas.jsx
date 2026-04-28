import { useEffect, useState } from "react";
import { API_URL } from "../App";
import Header from "../components/Header/Header";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Footer from "../components/Footer/Footer";
import css from "./ListarMarcas.module.css";

export default function ListarMarcas() {
    const [marcas, setMarcas] = useState([]);
    const [modalAberta, setModalAberta] = useState(false);
    const [editando, setEditando] = useState(false);
    const [idMarca, setIdMarca] = useState(null);

    const [nome, setNome] = useState("");
    const [imagem, setImagem] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    useEffect(() => {
        buscarMarcas();
    }, []);

    async function buscarMarcas() {
        try {
            const res = await fetch(`${API_URL}/buscar_marca`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({})
            });

            const data = await res.json();

            if (res.ok) {
                setMarcas(data.marcas);
            } else {
                setMarcas([]);
            }
        } catch {
            setMensagem("Erro ao buscar marcas.");
            setTipoMensagem("erro");
        }
    }

    function abrirModalAdicionar() {
        setEditando(false);
        setIdMarca(null);
        setNome("");
        setImagem(null);
        setModalAberta(true);
    }

    function abrirModalEditar(marca) {
        setEditando(true);
        setIdMarca(marca.id_marca);
        setNome(marca.nome);
        setImagem(null);
        setModalAberta(true);
    }

    async function salvarMarca(e) {
        e.preventDefault();

        if (!nome.trim()) {
            setMensagem("Digite o nome da marca.");
            setTipoMensagem("erro");
            return;
        }

        const formData = new FormData();
        formData.append("nome", nome);

        if (imagem) {
            formData.append("imagem", imagem);
        }

        const rota = editando
            ? `${API_URL}/edicao_marca/${idMarca}`
            : `${API_URL}/adicionar_marca`;

        const metodo = editando ? "PUT" : "POST";

        try {
            const res = await fetch(rota, {
                method: metodo,
                credentials: "include",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                setMensagem(data.mensagem);
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem);
            setTipoMensagem("sucesso");
            setModalAberta(false);
            buscarMarcas();
        } catch {
            setMensagem("Erro ao salvar marca.");
            setTipoMensagem("erro");
        }
    }

    async function excluirMarca(id) {
        const confirmar = window.confirm("Deseja excluir esta marca?");

        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/deletar_marca/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                setMensagem(data.mensagem);
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem);
            setTipoMensagem("sucesso");
            buscarMarcas();
        } catch {
            setMensagem("Erro ao excluir marca.");
            setTipoMensagem("erro");
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <h1>Marcas Cadastradas</h1>

                        <button className={css.btnAdicionar} onClick={abrirModalAdicionar}>
                            + Adicionar Marca
                        </button>
                    </div>

                    {mensagem && (
                        <p className={tipoMensagem === "sucesso" ? css.sucesso : css.erro}>
                            {mensagem}
                        </p>
                    )}

                    <div className={css.card}>
                        {marcas.length === 0 ? (
                            <p className={css.vazio}>Nenhuma marca cadastrada.</p>
                        ) : (
                            <table className={css.tabela}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Marca</th>
                                    <th>Ações</th>
                                </tr>
                                </thead>

                                <tbody>
                                {marcas.map((marca) => (
                                    <tr key={marca.id_marca}>
                                        <td>{marca.id_marca}</td>
                                        <td>{marca.nome}</td>
                                        <td>
                                            <button
                                                className={css.btnEditar}
                                                onClick={() => abrirModalEditar(marca)}
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                className={css.btnExcluir}
                                                onClick={() => excluirMarca(marca.id_marca)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {modalAberta && (
                <div className={css.fundoModal}>
                    <div className={css.modal}>
                        <h2>{editando ? "Editar Marca" : "Adicionar Marca"}</h2>

                        <form onSubmit={salvarMarca}>
                            <label>Nome da marca</label>

                            <input
                                type="text"
                                placeholder="Ex: Toyota"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />

                            <label>Imagem da marca</label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImagem(e.target.files[0])}
                            />

                            <div className={css.botoesModal}>
                                <button
                                    type="button"
                                    className={css.cancelar}
                                    onClick={() => setModalAberta(false)}
                                >
                                    Cancelar
                                </button>

                                <button type="submit" className={css.salvar}>
                                    {editando ? "Salvar Alterações" : "Cadastrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}