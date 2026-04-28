import { useEffect, useState } from "react";
import { API_URL } from "../App";
import Header from "../components/Header/Header";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Footer from "../components/Footer/Footer";
import css from "./ListarMarcas.module.css";

export default function ListarMarcas() {
    const [marcas, setMarcas] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);

    const [modalAberta, setModalAberta] = useState(false);
    const [editando, setEditando] = useState(false);
    const [idMarca, setIdMarca] = useState(null);

    const [modalExcluir, setModalExcluir] = useState(false);
    const [marcaExcluir, setMarcaExcluir] = useState(null);

    const [nome, setNome] = useState("");
    const [imagem, setImagem] = useState(null);
    const [previewImagem, setPreviewImagem] = useState("");

    const [toast, setToast] = useState("");
    const [tipoToast, setTipoToast] = useState("");

    function mostrarToast(texto, tipo) {
        setToast(texto);
        setTipoToast(tipo);

        setTimeout(() => {
            setToast("");
            setTipoToast("");
        }, 3000);
    }

    async function buscarMarcas(nomeBusca = "") {
        try {
            setCarregando(true);

            const res = await fetch(`${API_URL}/buscar_marca`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ nome: nomeBusca })
            });

            const data = await res.json();

            if (res.ok) {
                setMarcas(data.marcas || []);
            } else {
                setMarcas([]);
            }
        } catch {
            mostrarToast("Erro ao buscar marcas.", "erro");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarMarcas();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarMarcas(busca);
        }, 500);

        return () => clearTimeout(timer);
    }, [busca]);

    function abrirModalAdicionar() {
        setEditando(false);
        setIdMarca(null);
        setNome("");
        setImagem(null);
        setPreviewImagem("");
        setModalAberta(true);
    }

    function abrirModalEditar(marca) {
        setEditando(true);
        setIdMarca(marca.id_marca);
        setNome(marca.nome);
        setImagem(null);
        setPreviewImagem(`${marca.imagem}?v=${Date.now()}`);
        setModalAberta(true);
    }

    function selecionarImagem(e) {
        const arquivo = e.target.files[0];

        setImagem(arquivo);

        if (arquivo) {
            setPreviewImagem(URL.createObjectURL(arquivo));
        }
    }

    async function salvarMarca(e) {
        e.preventDefault();

        if (!nome.trim()) {
            mostrarToast("Digite o nome da marca.", "erro");
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
                mostrarToast(data.mensagem || "Erro ao salvar marca.", "erro");
                return;
            }

            mostrarToast(data.mensagem || "Marca salva com sucesso!", "sucesso");
            setModalAberta(false);
            buscarMarcas(busca);
        } catch {
            mostrarToast("Erro ao salvar marca.", "erro");
        }
    }

    function abrirModalExcluir(marca) {
        setMarcaExcluir(marca);
        setModalExcluir(true);
    }

    function fecharModalExcluir() {
        setMarcaExcluir(null);
        setModalExcluir(false);
    }

    async function excluirMarca() {
        if (!marcaExcluir) return;

        try {
            const res = await fetch(`${API_URL}/deletar_marca/${marcaExcluir.id_marca}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                mostrarToast(data.mensagem || "Erro ao excluir marca.", "erro");
                return;
            }

            mostrarToast(data.mensagem || "Marca excluída com sucesso!", "sucesso");
            fecharModalExcluir();
            buscarMarcas(busca);
        } catch {
            mostrarToast("Erro ao excluir marca.", "erro");
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <h1>Marcas</h1>

                        <button className={css.botaoAzul} onClick={abrirModalAdicionar}>
                            ⊕ Nova Marca
                        </button>
                    </div>

                    <div className={css.busca}>
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Procure uma marca..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    <section className={css.tabelaCard}>
                        <table>
                            <thead>
                            <tr>
                                <th>ÍCONE</th>
                                <th>MARCA</th>
                                <th>AÇÕES</th>
                            </tr>
                            </thead>

                            <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="3" className={css.vazio}>
                                        Carregando marcas...
                                    </td>
                                </tr>
                            ) : marcas.length > 0 ? (
                                marcas.map((marca) => (
                                    <tr key={marca.id_marca}>
                                        <td>
                                            <img
                                                src={`${marca.imagem}?v=${Date.now()}`}
                                                alt={marca.nome}
                                                className={css.logoMarca}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        </td>

                                        <td>{marca.nome}</td>

                                        <td>
                                            <div className={css.acoes}>
                                                <button
                                                    type="button"
                                                    className={css.icone}
                                                    onClick={() => abrirModalEditar(marca)}
                                                >
                                                    ✎
                                                </button>

                                                <button
                                                    type="button"
                                                    className={css.icone}
                                                    onClick={() => abrirModalExcluir(marca)}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className={css.vazio}>
                                        Nenhuma marca encontrada.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>

            {modalAberta && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>{editando ? "Editar Marca" : "Adicionar Marca"}</h2>

                        <form onSubmit={salvarMarca}>
                            <div className={css.campo}>
                                <label>Nome da marca</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Toyota"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className={css.campo}>
                                <label>Imagem da marca</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagem}
                                />
                            </div>

                            {previewImagem && (
                                <div className={css.previewBox}>
                                    <img
                                        src={previewImagem}
                                        alt="Prévia da marca"
                                        className={css.previewImagem}
                                    />
                                </div>
                            )}

                            <div className={css.modalBotoes}>
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

            {modalExcluir && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>Confirmar exclusão</h2>

                        <p>
                            Tem certeza que deseja excluir a marca{" "}
                            <strong>{marcaExcluir?.nome}</strong>?
                        </p>

                        <div className={css.modalBotoes}>
                            <button type="button" className={css.cancelar} onClick={fecharModalExcluir}>
                                Cancelar
                            </button>

                            <button type="button" className={css.excluir} onClick={excluirMarca}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`${css.toast} ${tipoToast === "sucesso" ? css.toastSucesso : css.toastErro}`}>
                    {toast}
                </div>
            )}

            <Footer />
        </>
    );
}