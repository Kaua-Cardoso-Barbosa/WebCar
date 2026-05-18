import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./Header.module.css";
import { API_URL } from "../../App";

const LOGO_PADRAO = "/Logo.png";
const LOGO_CACHE_KEY = "webcar_logo_url";
const IMAGEM_USUARIO_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" rx="160" fill="#e2e8f0"/>
  <circle cx="160" cy="122" r="58" fill="#94a3b8"/>
  <path d="M62 272c18-61 55-92 98-92s80 31 98 92" fill="#94a3b8"/>
</svg>
`)}`;

function urlArquivo(valor, fallback) {
    if (!valor) return fallback;
    if (valor.startsWith("http") || valor.startsWith("data:") || valor.startsWith("blob:") || valor.startsWith("/")) {
        return valor;
    }

    return `${API_URL}/${valor.replace(/^\/+/, "")}`;
}

async function carregarLogoSite() {
    const response = await fetch(`${API_URL}/verdadosempresa`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) return localStorage.getItem(LOGO_CACHE_KEY) || LOGO_PADRAO;

    const data = await response.json();
    const empresa = data.empresas?.[0] || {};

    const logoUrl = urlArquivo(empresa.logo_url || empresa.logoUrl || empresa.LOGO_URL, LOGO_PADRAO);
    localStorage.setItem(LOGO_CACHE_KEY, logoUrl);
    return logoUrl;
}

function apenasNumeros(valor) {
    return String(valor ?? "").replace(/\D/g, "");
}

function formatarCpf(valor) {
    return apenasNumeros(valor)
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(valor) {
    const numeros = apenasNumeros(valor).slice(0, 11);

    if (numeros.length <= 10) {
        return numeros
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function Header({ busca = "", setBusca = null }) {
    const location = useLocation();
    const navigate = useNavigate();

    const tipoUsuario = localStorage.getItem("usuario_tipo");
    const estaLogado = !!tipoUsuario;
    const tipoNumero = Number(tipoUsuario);
    const usuarioVendedor = tipoNumero === 1;
    const usuarioInterno = tipoNumero === 0 || tipoNumero === 1;
    const usuarioCliente = tipoNumero === 2;
    const linkLogo = tipoNumero === 0 ? "/dashboard" : tipoNumero === 1 ? "/restrita-vendedor" : "/";
    const idUsuario = localStorage.getItem("usuario_id");

    const [buscaLocal, setBuscaLocal] = useState("");
    const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem(LOGO_CACHE_KEY) || LOGO_PADRAO);
    const [modalDadosAberta, setModalDadosAberta] = useState(false);
    const [dadosCliente, setDadosCliente] = useState({
        nome: "",
        email: "",
        telefone: "",
        cpf: "",
        senha: "",
    });
    const [fotoCliente, setFotoCliente] = useState(null);
    const [previewCliente, setPreviewCliente] = useState(IMAGEM_USUARIO_PADRAO);
    const [salvandoCliente, setSalvandoCliente] = useState(false);
    const [mensagemCliente, setMensagemCliente] = useState("");
    const [erroCliente, setErroCliente] = useState("");

    const valorBusca = setBusca ? busca : buscaLocal;

    function handleBuscaChange(e) {
        if (setBusca) {
            setBusca(e.target.value);
            return;
        }

        setBuscaLocal(e.target.value);
    }

    function handleBuscar(e) {
        e.preventDefault();

        if (!setBusca && buscaLocal.trim()) {
            navigate(`/catalogo?busca=${encodeURIComponent(buscaLocal.trim())}`);
        }
    }

    function handleLogout() {
        localStorage.removeItem("usuario_id");
        localStorage.removeItem("usuario_nome");
        localStorage.removeItem("usuario_email");
        localStorage.removeItem("usuario_telefone");
        localStorage.removeItem("usuario_cpf");
        localStorage.removeItem("usuario_tipo");
        localStorage.removeItem("token");

        navigate("/login");
    }

    function atualizarDadosCliente(campo, valor) {
        const normalizadores = {
            cpf: formatarCpf,
            telefone: formatarTelefone,
        };

        setMensagemCliente("");
        setErroCliente("");
        setDadosCliente((dados) => ({
            ...dados,
            [campo]: normalizadores[campo] ? normalizadores[campo](valor) : valor,
        }));
    }

    async function carregarDadosCliente() {
        const dadosLocais = {
            nome: localStorage.getItem("usuario_nome") || "",
            email: localStorage.getItem("usuario_email") || "",
            telefone: formatarTelefone(localStorage.getItem("usuario_telefone") || ""),
            cpf: formatarCpf(localStorage.getItem("usuario_cpf") || ""),
            senha: "",
        };

        setDadosCliente(dadosLocais);
        setPreviewCliente(idUsuario ? `${API_URL}/uploads/Usuarios/${idUsuario}.jpg?v=${Date.now()}` : IMAGEM_USUARIO_PADRAO);
        setFotoCliente(null);
        setMensagemCliente("");
        setErroCliente("");

        if (!idUsuario) return;

        try {
            const response = await fetch(`${API_URL}/buscar_usuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_usuario: idUsuario }),
            });

            if (!response.ok) return;

            const data = await response.json();
            const usuario = data.usuarios?.[0];

            if (!usuario) return;

            setDadosCliente({
                nome: usuario.nome || dadosLocais.nome,
                email: usuario.email || dadosLocais.email,
                telefone: formatarTelefone(usuario.telefone || dadosLocais.telefone),
                cpf: formatarCpf(usuario.cpf || dadosLocais.cpf),
                senha: "",
            });
            setPreviewCliente(usuario.imagem ? `${usuario.imagem}?v=${Date.now()}` : `${API_URL}/uploads/Usuarios/${idUsuario}.jpg?v=${Date.now()}`);
        } catch {
            // Cliente pode nao ter permissao para /buscar_usuario; nesse caso usamos localStorage.
        }
    }

    function abrirModalDados() {
        setModalDadosAberta(true);
        carregarDadosCliente();
    }

    function fecharModalDados() {
        setModalDadosAberta(false);
        setMensagemCliente("");
        setErroCliente("");
    }

    function selecionarFotoCliente(e) {
        const arquivo = e.target.files?.[0];

        if (!arquivo) return;

        if (previewCliente?.startsWith("blob:")) URL.revokeObjectURL(previewCliente);

        setMensagemCliente("");
        setErroCliente("");
        setFotoCliente(arquivo);
        setPreviewCliente(URL.createObjectURL(arquivo));
    }

    async function salvarDadosCliente(e) {
        e.preventDefault();

        if (!idUsuario) {
            setErroCliente("Usuário não encontrado. Faça login novamente.");
            return;
        }

        if (!dadosCliente.nome.trim() || !dadosCliente.email.trim() || !dadosCliente.telefone.trim() || !dadosCliente.cpf.trim()) {
            setErroCliente("Preencha nome, email, telefone e CPF para salvar.");
            return;
        }

        try {
            setSalvandoCliente(true);
            setMensagemCliente("");
            setErroCliente("");

            const formData = new FormData();
            formData.append("nome", dadosCliente.nome);
            formData.append("email", dadosCliente.email);
            formData.append("telefone", apenasNumeros(dadosCliente.telefone));
            formData.append("cpf", apenasNumeros(dadosCliente.cpf));

            if (dadosCliente.senha.trim()) {
                formData.append("senha", dadosCliente.senha);
            }

            if (fotoCliente) {
                formData.append("imagem", fotoCliente);
            }

            const response = await fetch(`${API_URL}/edicao_usuario/${idUsuario}`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCliente(data.mensagem || "Não foi possível salvar seus dados.");
                return;
            }

            localStorage.setItem("usuario_nome", dadosCliente.nome);
            localStorage.setItem("usuario_email", dadosCliente.email);
            localStorage.setItem("usuario_telefone", apenasNumeros(dadosCliente.telefone));
            localStorage.setItem("usuario_cpf", apenasNumeros(dadosCliente.cpf));
            setDadosCliente((dados) => ({ ...dados, senha: "" }));
            setFotoCliente(null);
            setPreviewCliente(`${API_URL}/uploads/Usuarios/${idUsuario}.jpg?v=${Date.now()}`);
            setMensagemCliente(data.mensagem || "Dados atualizados com sucesso.");
        } catch {
            setErroCliente("Não foi possível conectar com o servidor.");
        } finally {
            setSalvandoCliente(false);
        }
    }

    useEffect(() => {
        async function buscarLogo() {
            try {
                setLogoUrl(await carregarLogoSite());
            } catch {
                setLogoUrl(LOGO_PADRAO);
            }
        }

        buscarLogo();

        function atualizar(e) {
            const novaLogo = e.detail?.logoUrl || LOGO_PADRAO;
            localStorage.setItem(LOGO_CACHE_KEY, novaLogo);
            setLogoUrl(novaLogo);
        }

        window.addEventListener("webcar:configuracoes-site", atualizar);
        return () => window.removeEventListener("webcar:configuracoes-site", atualizar);
    }, []);

    useEffect(() => {
        return () => {
            if (previewCliente?.startsWith("blob:")) URL.revokeObjectURL(previewCliente);
        };
    }, [previewCliente]);

    useEffect(() => {
        const offcanvasElement = document.getElementById("offcanvasNavbar");

        if (offcanvasElement) {
            const offcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (offcanvas) {
                offcanvas.hide();
            }
        }

        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        const backdrop = document.querySelector(".offcanvas-backdrop");
        if (backdrop) {
            backdrop.remove();
        }
    }, [location]);

    const linksCliente = (
        <>
            <Link className="nav-link" to="/minhas-compras">Minhas compras</Link>
            <button type="button" className={css.linkBotao} onClick={abrirModalDados}>
                Meus dados
            </button>
        </>
    );

    return (
        <header className={"top-0 z-50 " + css.header}>
            <nav className="navbar">
                <div className="container-fluid d-flex align-items-center">
                    <div className={css.juntar}>
                        <Link className="navbar-brand d-flex align-items-center gap-2" to={linkLogo}>
                            <img src={logoUrl} alt="Logo" width="60" height="40" />
                        </Link>

                        <div className={"container-fluid " + css.mobile}>
                            <button
                                className={"navbar-toggler " + css.corrigir}
                                type="button"
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvasNavbar"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>

                            <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
                                <div className="offcanvas-header">
                                    <Link className="navbar-brand d-flex align-items-center gap-2" to={linkLogo}>
                                        <img src={logoUrl} alt="Logo" width="60" height="40" />
                                    </Link>

                                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                                </div>

                                <div className="offcanvas-body">
                                    <ul className="navbar-nav flex-grow-1">
                                        {!usuarioInterno && (
                                            <>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="/catalogo">Comprar</Link>
                                                </li>

                                                {usuarioCliente && estaLogado ? (
                                                    <>
                                                        <li className="nav-item">
                                                            <Link className="nav-link" to="/minhas-compras">Minhas compras</Link>
                                                        </li>
                                                        <li className="nav-item">
                                                            <button type="button" className={css.linkBotao} onClick={abrirModalDados}>
                                                                Meus dados
                                                            </button>
                                                        </li>
                                                    </>
                                                ) : (
                                                    <li className="nav-item">
                                                        <Link className="nav-link" to="/">Sobre nós</Link>
                                                    </li>
                                                )}
                                            </>
                                        )}

                                        {usuarioVendedor && estaLogado && (
                                            <li className="nav-item">
                                                <button type="button" className={css.linkBotao} onClick={abrirModalDados}>
                                                    Meus dados
                                                </button>
                                            </li>
                                        )}

                                        {!estaLogado ? (
                                            <>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="/login">Entrar</Link>
                                                </li>

                                                <li className="nav-item">
                                                    <Link className={"btn btn-primary " + css.corFundo} to="/cadastro">
                                                        Cadastrar
                                                    </Link>
                                                </li>
                                            </>
                                        ) : (
                                            <li className="nav-item">
                                                <button className={"btn btn-primary " + css.corFundo} onClick={handleLogout}>
                                                    Logout
                                                </button>
                                            </li>
                                        )}
                                    </ul>

                                    <form className={usuarioInterno ? css.oculto : css.buscaMobile} onSubmit={handleBuscar}>
                                        <input
                                            className="form-control"
                                            type="search"
                                            placeholder="Buscar veículos..."
                                            value={valorBusca}
                                            onChange={handleBuscaChange}
                                        />
                                        <button type="submit" className={css.botaoBuscar}>Buscar</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className={usuarioInterno ? css.oculto : css.buscaDesktop} onSubmit={handleBuscar}>
                        <input
                            className="form-control"
                            type="search"
                            placeholder="Buscar veículos..."
                            value={valorBusca}
                            onChange={handleBuscaChange}
                        />
                    </form>

                    <div className={css.sumir}>
                        <div className="d-flex align-items-center gap-3">
                            {!usuarioInterno && (
                                <>
                                    <Link className="nav-link" to="/catalogo">Comprar</Link>
                                    {usuarioCliente && estaLogado ? linksCliente : <Link className="nav-link" to="/">Sobre nós</Link>}
                                </>
                            )}

                            {usuarioVendedor && estaLogado && (
                                <button type="button" className={css.linkBotao} onClick={abrirModalDados}>
                                    Meus dados
                                </button>
                            )}

                            {!estaLogado ? (
                                <>
                                    <Link className="nav-link" to="/login">Entrar</Link>
                                    <Link className={"btn btn-primary " + css.corFundo} to="/cadastro">Cadastrar</Link>
                                </>
                            ) : (
                                <button className={"btn btn-primary " + css.corFundo} onClick={handleLogout}>
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {modalDadosAberta && (
                <div className={css.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="meus-dados-titulo">
                    <div className={css.modalDados}>
                        <div className={css.modalTopo}>
                            <div>
                                <span>Perfil</span>
                                <h2 id="meus-dados-titulo">Meus dados</h2>
                            </div>
                            <button type="button" className={css.fecharModal} onClick={fecharModalDados} aria-label="Fechar">
                                ×
                            </button>
                        </div>

                        {mensagemCliente && <p className={css.sucessoModal}>{mensagemCliente}</p>}
                        {erroCliente && <p className={css.erroModal}>{erroCliente}</p>}

                        <form className={css.formDados} onSubmit={salvarDadosCliente}>
                            <section className={css.fotoPerfil}>
                                <img src={previewCliente} alt="Foto do cliente" />
                                <label>
                                    Alterar foto
                                    <input type="file" accept="image/*" onChange={selecionarFotoCliente} />
                                </label>
                            </section>

                            <section className={css.camposPerfil}>
                                <label>
                                    Nome
                                    <input value={dadosCliente.nome} onChange={(e) => atualizarDadosCliente("nome", e.target.value)} />
                                </label>

                                <label>
                                    Email
                                    <input type="email" value={dadosCliente.email} onChange={(e) => atualizarDadosCliente("email", e.target.value)} />
                                </label>

                                <label>
                                    Telefone
                                    <input value={dadosCliente.telefone} onChange={(e) => atualizarDadosCliente("telefone", e.target.value)} inputMode="numeric" />
                                </label>

                                <label>
                                    CPF
                                    <input value={dadosCliente.cpf} onChange={(e) => atualizarDadosCliente("cpf", e.target.value)} inputMode="numeric" />
                                </label>

                                <label className={css.campoInteiro}>
                                    Nova senha opcional
                                    <input
                                        type="password"
                                        value={dadosCliente.senha}
                                        onChange={(e) => atualizarDadosCliente("senha", e.target.value)}
                                        placeholder="Deixe em branco para manter"
                                    />
                                </label>
                            </section>

                            <div className={css.acoesModal}>
                                <button type="button" className={css.cancelarModal} onClick={fecharModalDados}>Cancelar</button>
                                <button type="submit" className={css.salvarModal} disabled={salvandoCliente}>
                                    {salvandoCliente ? "Salvando..." : "Salvar dados"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
}
