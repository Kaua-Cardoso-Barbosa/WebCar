import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";
import Header from "../components/Header/Header";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Footer from "../components/Footer/Footer";
import css from "./ListaUsuarios.module.css";

export default function ListaUsuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [tiposSelecionados, setTiposSelecionados] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [modalSituacao, setModalSituacao] = useState(false);
    const [usuarioSituacao, setUsuarioSituacao] = useState(null);
    const [novaSituacao, setNovaSituacao] = useState(null);
    const [modalCadastro, setModalCadastro] = useState(false);
    const [cadastro, setCadastro] = useState({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        senha: "",
        confirma: "",
        tipo: "1",
    });
    const [imagemCadastro, setImagemCadastro] = useState(null);
    const [previewCadastro, setPreviewCadastro] = useState(null);
    const [salvandoCadastro, setSalvandoCadastro] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");

    const navigate = useNavigate();

    function apenasNumeros(valor) {
        return String(valor).replace(/\D/g, "");
    }

    function formatarTelefone(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;

        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    function formatarCpf(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 3) return numeros;
        if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
        if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }

    function textoTipo(tipo) {
        if (Number(tipo) === 0) return "Administrador";
        if (Number(tipo) === 1) return "Vendedor";
        if (Number(tipo) === 2) return "Cliente";
        return "Nao informado";
    }

    function classeTipo(tipo) {
        if (Number(tipo) === 0) return css.admin;
        if (Number(tipo) === 1) return css.vendedor;
        if (Number(tipo) === 2) return css.cliente;
        return css.semTipo;
    }

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const situacao = Number(usuario.situacao ?? usuario.SITUACAO);

        if (![0, 1].includes(situacao)) {
            return false;
        }

        const termo = busca.trim().toLowerCase();
        const textoBusca = [
            usuario.nome,
            usuario.email,
            usuario.telefone,
            usuario.cpf,
            textoTipo(usuario.tipo),
        ].filter(Boolean).join(" ").toLowerCase();

        const passaBusca = !termo || textoBusca.includes(termo);
        const passaTipo =
            tiposSelecionados.length === 0 ||
            tiposSelecionados.includes(String(usuario.tipo));

        return passaBusca && passaTipo;
    });

    const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const usuariosPaginados = usuariosFiltrados.slice(inicioPagina, inicioPagina + 15);

    const usuariosAtivos = usuarios.filter((usuario) =>
        [0, 1].includes(Number(usuario.situacao ?? usuario.SITUACAO))
    );
    const totalClientes = usuariosAtivos.filter((usuario) => Number(usuario.tipo) === 2).length;
    const totalVendedores = usuariosAtivos.filter((usuario) => Number(usuario.tipo) === 1).length;
    const totalAdmins = usuariosAtivos.filter((usuario) => Number(usuario.tipo) === 0).length;

    async function buscarUsuarios() {
        try {
            setCarregando(true);
            setErro("");

            const res = await fetch(`${API_URL}/buscar_usuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (!res.ok) {
                setUsuarios([]);
                setErro(data.mensagem || "Nao foi possivel carregar os usuarios.");
                return;
            }

            setUsuarios(data.usuarios || []);
        } catch {
            setUsuarios([]);
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarUsuarios();
    }, []);

    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, tiposSelecionados]);

    useEffect(() => {
        return () => {
            if (previewCadastro) {
                URL.revokeObjectURL(previewCadastro);
            }
        };
    }, [previewCadastro]);

    function editarUsuario(usuario) {
        navigate(`/editarcliente/${usuario.id_usuario}`);
    }

    function alternarTipo(tipo) {
        setTiposSelecionados((tiposAtuais) =>
            tiposAtuais.includes(tipo)
                ? tiposAtuais.filter((item) => item !== tipo)
                : [...tiposAtuais, tipo]
        );
    }

    function resetarFiltros() {
        setBusca("");
        setTiposSelecionados([]);
        setPaginaAtual(1);
    }

    function abrirModalSituacao(usuario, situacao) {
        setErro("");
        setSucesso("");
        setUsuarioSituacao(usuario);
        setNovaSituacao(situacao);
        setModalSituacao(true);
    }

    function fecharModalSituacao() {
        setUsuarioSituacao(null);
        setNovaSituacao(null);
        setModalSituacao(false);
    }

    function atualizarCadastro(campo, valor) {
        setErroCadastro("");
        setCadastro((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor,
        }));
    }

    function abrirModalCadastro() {
        setErro("");
        setSucesso("");
        setCadastro({
            nome: "",
            telefone: "",
            email: "",
            cpf: "",
            senha: "",
            confirma: "",
            tipo: "1",
        });
        setImagemCadastro(null);
        setPreviewCadastro(null);
        setErroCadastro("");
        setModalCadastro(true);
    }

    function fecharModalCadastro() {
        setModalCadastro(false);
        setImagemCadastro(null);
        setPreviewCadastro(null);
        setSalvandoCadastro(false);
        setErroCadastro("");
    }

    function selecionarImagemCadastro(e) {
        const arquivo = e.target.files[0];

        if (!arquivo) return;

        setErroCadastro("");

        if (previewCadastro) {
            URL.revokeObjectURL(previewCadastro);
        }

        setImagemCadastro(arquivo);
        setPreviewCadastro(URL.createObjectURL(arquivo));
    }

    async function alterarSituacaoUsuario() {
        if (!usuarioSituacao || novaSituacao === null) return;

        try {
            const formData = new FormData();
            formData.append("situacao", String(novaSituacao));

            const res = await fetch(`${API_URL}/alterar_situacao/${usuarioSituacao.id_usuario}`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setErro(data.mensagem || "Erro ao alterar situacao do usuario.");
                fecharModalSituacao();
                return;
            }

            setSucesso(
                novaSituacao === 1
                    ? "Usuario bloqueado com sucesso."
                    : "Usuario desbloqueado com sucesso."
            );
            fecharModalSituacao();
            buscarUsuarios();
        } catch {
            setErro("Erro ao alterar situacao do usuario.");
            fecharModalSituacao();
        }
    }

    async function cadastrarUsuarioInterno(e) {
        e.preventDefault();

        if (
            !cadastro.nome.trim() ||
            !cadastro.email.trim() ||
            !cadastro.cpf.trim() ||
            !cadastro.senha ||
            !cadastro.confirma
        ) {
            setErroCadastro("Preencha todos os campos obrigatorios.");
            return;
        }

        if (cadastro.senha !== cadastro.confirma) {
            setErroCadastro("As senhas nao coincidem.");
            return;
        }

        try {
            setErroCadastro("");
            setSucesso("");
            setSalvandoCadastro(true);

            const formData = new FormData();
            formData.append("nome", cadastro.nome);
            formData.append("telefone", apenasNumeros(cadastro.telefone));
            formData.append("email", cadastro.email);
            formData.append("cpf", apenasNumeros(cadastro.cpf));
            formData.append("senha", cadastro.senha);
            formData.append("confirma", cadastro.confirma);
            formData.append("tipo", cadastro.tipo);

            if (imagemCadastro) {
                formData.append("imagem", imagemCadastro);
            }

            const response = await fetch(`${API_URL}/adicionar_usuario`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setErroCadastro(data.mensagem || "Nao foi possivel cadastrar o usuario.");
                return;
            }

            setSucesso("Usuario cadastrado com sucesso.");
            fecharModalCadastro();
            buscarUsuarios();
        } catch {
            setErroCadastro("Nao foi possivel cadastrar o usuario.");
        } finally {
            setSalvandoCadastro(false);
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className={css.topo}>
                        <div>
                            <h1>Usuarios</h1>
                            <p>Gerencie clientes, vendedores e administradores cadastrados.</p>
                        </div>

                        <button
                            type="button"
                            className={css.botaoNovo}
                            onClick={abrirModalCadastro}
                        >
                            <span className={css.mais}>+</span>
                            Adicionar vendedor/adm
                        </button>
                    </div>

                    <section className={css.cards}>
                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.azul}`}>Qtd</span>
                            <div>
                                <p className={css.cardLabel}>Usuarios totais</p>
                                <h2 className={css.cardValor}>{usuariosAtivos.length}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.verde}`}>Cli</span>
                            <div>
                                <p className={css.cardLabel}>Clientes</p>
                                <h2 className={css.cardValor}>{totalClientes}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.laranja}`}>Vend</span>
                            <div>
                                <p className={css.cardLabel}>Vendedores</p>
                                <h2 className={css.cardValor}>{totalVendedores}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.roxo}`}>Adm</span>
                            <div>
                                <p className={css.cardLabel}>Administradores</p>
                                <h2 className={css.cardValor}>{totalAdmins}</h2>
                            </div>
                        </div>
                    </section>

                    {erro && <p className={css.erro}>{erro}</p>}
                    {sucesso && <p className={css.sucesso}>{sucesso}</p>}

                    <section className={css.filtros}>
                        <div className={css.busca}>
                            <input
                                type="text"
                                placeholder="Buscar por nome, email, telefone ou tipo..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        <div className={css.filtroTipos}>
                            <button
                                type="button"
                                className={`${css.filtroBotao} ${tiposSelecionados.includes("2") ? css.ativoCliente : ""}`}
                                onClick={() => alternarTipo("2")}
                            >
                                Cliente
                            </button>

                            <button
                                type="button"
                                className={`${css.filtroBotao} ${tiposSelecionados.includes("1") ? css.ativoVendedor : ""}`}
                                onClick={() => alternarTipo("1")}
                            >
                                Vendedor
                            </button>

                            <button
                                type="button"
                                className={`${css.filtroBotao} ${tiposSelecionados.includes("0") ? css.ativoAdmin : ""}`}
                                onClick={() => alternarTipo("0")}
                            >
                                Administrador
                            </button>

                            <button type="button" className={css.resetar} onClick={resetarFiltros}>
                                Limpar filtros
                            </button>
                        </div>
                    </section>

                    <section className={css.tabelaCard}>
                        <table className={css.tabela}>
                            <thead>
                            <tr>
                                <th>FOTO</th>
                                <th>NOME</th>
                                <th>EMAIL</th>
                                <th>TIPO</th>
                                <th>ACOES</th>
                            </tr>
                            </thead>

                            <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="5" className={css.vazio}>
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : usuariosFiltrados.length > 0 ? (
                                usuariosPaginados.map((usuario) => (
                                    <tr
                                        key={usuario.id_usuario}
                                        className={Number(usuario.situacao) === 1 ? css.linhaBloqueada : ""}
                                    >
                                        <td>
                                            <img
                                                src={`${usuario.imagem}?v=${usuario.id_usuario}`}
                                                alt={usuario.nome}
                                                className={`${css.logoUsuario} ${classeTipo(usuario.tipo)}`}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        </td>

                                        <td className={css.nomeUsuario}>{usuario.nome}</td>
                                        <td>{usuario.email || "Nao informado"}</td>

                                        <td>
                                            <span className={`${css.tipo} ${classeTipo(usuario.tipo)}`}>
                                                {textoTipo(usuario.tipo)}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={css.acoes}>
                                                {Number(usuario.situacao) === 1 ? (
                                                    <button
                                                        type="button"
                                                        className={`${css.icone} ${css.desbloquear}`}
                                                        onClick={() => abrirModalSituacao(usuario, 0)}
                                                    >
                                                        Desbloquear
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={css.icone}
                                                            onClick={() => editarUsuario(usuario)}
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`${css.icone} ${css.bloquear}`}
                                                            onClick={() => abrirModalSituacao(usuario, 1)}
                                                        >
                                                            Bloquear
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={css.vazio}>
                                        Nenhum usuario encontrado.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        <div className={css.paginacao}>
                            <button
                                type="button"
                                disabled={paginaAtual === 1}
                                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>

                            <span>{paginaAtual} / {totalPaginas}</span>

                            <button
                                type="button"
                                disabled={paginaAtual === totalPaginas}
                                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                            >
                                Proxima
                            </button>
                        </div>
                    </section>
                </main>
            </div>

            {modalSituacao && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>
                            {novaSituacao === 1 ? "Confirmar bloqueio" : "Confirmar desbloqueio"}
                        </h2>

                        <p>
                            Tem certeza que deseja{" "}
                            {novaSituacao === 1 ? "bloquear" : "desbloquear"} o usuario{" "}
                            <strong>{usuarioSituacao?.nome}</strong>?
                        </p>

                        <div className={css.modalBotoes}>
                            <button
                                type="button"
                                className={css.cancelar}
                                onClick={fecharModalSituacao}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={novaSituacao === 1 ? css.excluir : css.confirmar}
                                onClick={alterarSituacaoUsuario}
                            >
                                {novaSituacao === 1 ? "Bloquear" : "Desbloquear"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalCadastro && (
                <div className={css.modalFundo}>
                    <div className={css.modalCadastro}>
                        <div className={css.modalTopo}>
                            <div>
                                <h2>Adicionar usuario interno</h2>
                                <p>Use o mesmo padrao do cadastro, escolhendo o tipo de acesso.</p>
                            </div>

                            <button
                                type="button"
                                className={css.fecharModal}
                                onClick={fecharModalCadastro}
                                aria-label="Fechar"
                            >
                                x
                            </button>
                        </div>

                        <form className={css.formCadastro} onSubmit={cadastrarUsuarioInterno}>
                            <div className={css.tipoCadastro}>
                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${cadastro.tipo === "1" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarCadastro("tipo", "1")}
                                >
                                    Vendedor
                                </button>

                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${cadastro.tipo === "0" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarCadastro("tipo", "0")}
                                >
                                    Administrador
                                </button>
                            </div>

                            <label className={css.uploadCadastro}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagemCadastro}
                                />

                                {previewCadastro ? (
                                    <img src={previewCadastro} alt="Preview" />
                                ) : (
                                    <span>Adicionar imagem</span>
                                )}
                            </label>

                            {erroCadastro && (
                                <p className={css.erroCadastro}>
                                    {erroCadastro}
                                </p>
                            )}

                            <div className={css.campo}>
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    value={cadastro.nome}
                                    onChange={(e) => atualizarCadastro("nome", e.target.value)}
                                />
                            </div>

                            <div className={css.gradeCampos}>
                                <div className={css.campo}>
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        inputMode="numeric"
                                        maxLength={15}
                                        value={cadastro.telefone}
                                        onChange={(e) =>
                                            atualizarCadastro("telefone", formatarTelefone(e.target.value))
                                        }
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label>CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        maxLength={14}
                                        value={cadastro.cpf}
                                        onChange={(e) =>
                                            atualizarCadastro("cpf", formatarCpf(e.target.value))
                                        }
                                    />
                                </div>
                            </div>

                            <div className={css.campo}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={cadastro.email}
                                    onChange={(e) => atualizarCadastro("email", e.target.value)}
                                />
                            </div>

                            <div className={css.gradeCampos}>
                                <div className={css.campo}>
                                    <label>Senha</label>
                                    <input
                                        type="password"
                                        placeholder="Digite a senha"
                                        value={cadastro.senha}
                                        onChange={(e) => atualizarCadastro("senha", e.target.value)}
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label>Confirmar senha</label>
                                    <input
                                        type="password"
                                        placeholder="Confirme a senha"
                                        value={cadastro.confirma}
                                        onChange={(e) => atualizarCadastro("confirma", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={css.modalBotoes}>
                                <button
                                    type="button"
                                    className={css.cancelar}
                                    onClick={fecharModalCadastro}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={css.confirmar}
                                    disabled={salvandoCadastro}
                                >
                                    {salvandoCadastro ? "Cadastrando..." : "Cadastrar"}
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
