import { useEffect, useState } from "react";
import { API_URL } from "../App";
import Header from "../components/Header/Header";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Footer from "../components/Footer/Footer";
import css from "./ListaUsuarios.module.css";
import { useNavigate } from "react-router-dom";

export default function ListaUsuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);

    const navigate = useNavigate();

    const usuariosFiltrados = usuarios.filter(u => Number(u.tipo) !== 0);
    const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const usuariosPaginados = usuariosFiltrados.slice(inicioPagina, inicioPagina + 15);
    const [modalBloquear, setModalBloquear] = useState(false);
    const [usuarioBloquear] = useState(null);


    async function buscarUsuarios(nomeBusca = "") {
        try {
            setCarregando(true);

            const res = await fetch(`${API_URL}/buscar_usuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ nome: nomeBusca })
            });

            const data = await res.json();

            if (res.ok) {
                setUsuarios(data.usuarios || []);
            } else {
                setUsuarios([]);
            }
        } catch {
            setUsuarios([]);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarUsuarios();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarUsuarios(busca);
        }, 500);

        return () => clearTimeout(timer);
    }, [busca]);


    function editarUsuario(usuario) {
        navigate(`/editarcliente/${usuario.id_usuario}`);
    }


    async function bloquearUsuario(usuario) {
        const confirmar = window.confirm(`Deseja bloquear ${usuario.nome}?`);

        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/bloquear_usuario/${usuario.id_usuario}`, {
                method: "PUT",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.mensagem || "Erro ao bloquear usuário");
                return;
            }

            alert("Usuário bloqueado com sucesso");


            buscarUsuarios(busca);

        } catch {
            alert("Erro ao bloquear usuário");
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <h1>Usuários</h1>
                    </div>

                    <div className={css.busca}>
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>

                    <section className={css.tabelaCard}>
                        <table>
                            <thead>
                            <tr>
                                <th>FOTO</th>
                                <th>NOME</th>
                                <th>TIPO</th>
                                <th>AÇÕES</th>
                            </tr>
                            </thead>

                            <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="4" className={css.vazio}>
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : usuariosFiltrados.length > 0 ? (
                                usuariosPaginados.map((usuario) => (
                                    <tr key={usuario.id_usuario}>
                                        <td>
                                            <img
                                                src={`${usuario.imagem}?v=${Date.now()}`}
                                                alt={usuario.nome}
                                                className={`${css.logoUsuario} ${usuario.tipo === 1 ? css.vendedor : css.cliente}`}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        </td>

                                        <td>{usuario.nome}</td>

                                        <td>
                                                <span className={`${css.tipo} ${usuario.tipo === 1 ? css.vendedor : css.cliente}`}>
                                                    {usuario.tipo === 1 ? "Vendedor" : "Cliente"}
                                                </span>
                                        </td>

                                        <td>
                                            <div className={css.acoes}>
                                                <button
                                                    className={css.icone}
                                                    onClick={() => editarUsuario(usuario)}
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    className={`${css.icone} ${css.bloquear}`}
                                                    onClick={() => (usuario)}
                                                >
                                                    Bloquear
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className={css.vazio}>
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>

                    <div className={css.paginacao}>
                        <button
                            disabled={paginaAtual === 1}
                            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                        >
                            Anterior
                        </button>

                        <span>{paginaAtual} / {totalPaginas}</span>

                        <button
                            disabled={paginaAtual === totalPaginas}
                            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                        >
                            Próxima
                        </button>
                    </div>
                </main>
            </div>

            {modalBloquear && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>Confirmar bloqueio</h2>

                        <p>
                            Tem certeza que deseja bloquear o usuário{" "}
                            <strong>{usuarioBloquear?.nome}</strong>?
                        </p>

                        <div className={css.modalBotoes}>
                            <button
                                type="button"
                                className={css.cancelar}
                                onClick={() => setModalBloquear(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={css.excluir}
                                onClick={bloquearUsuario}
                            >
                                Bloquear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}