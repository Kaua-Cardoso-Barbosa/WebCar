import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./Header.module.css";

export default function Header({ busca = "", setBusca = null }) {
    const location = useLocation();
    const navigate = useNavigate();

    // agora usamos usuario_tipo e não token
    const tipoUsuario = localStorage.getItem("usuario_tipo");
    const estaLogado = !!tipoUsuario;
    const tipoNumero = Number(tipoUsuario);
    const usuarioInterno = tipoNumero === 0 || tipoNumero === 1;
    const linkLogo = tipoNumero === 0 ? "/dashboard" : tipoNumero === 1 ? "/restrita-vendedor" : "/";
    const [buscaLocal, setBuscaLocal] = useState("");
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

    const handleLogout = () => {
        localStorage.removeItem("usuario_id");
        localStorage.removeItem("usuario_nome");
        localStorage.removeItem("usuario_email");
        localStorage.removeItem("usuario_tipo");
        localStorage.removeItem("token");

        navigate("/login");
    };

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

    return (
        <header className={"top-0 z-50 " + css.header}>
            <nav className="navbar">
                <div className="container-fluid d-flex align-items-center">

                    <div className={css.juntar}>
                        <Link
                            className="navbar-brand d-flex align-items-center gap-2"
                            to={linkLogo}
                        >
                            <img
                                src="/Logo.png"
                                alt="Logo"
                                width="60"
                                height="40"
                            />
                            <p className={"mt-2 " + css.azul}>
                                Web<span className={css.cinza}>Car</span>
                            </p>
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

                            <div
                                className="offcanvas offcanvas-end"
                                tabIndex="-1"
                                id="offcanvasNavbar"
                            >
                                <div className="offcanvas-header">
                                    <Link
                                        className="navbar-brand d-flex align-items-center gap-2"
                                        to={linkLogo}
                                    >
                                        <img
                                            src="/Logo.png"
                                            alt="Logo"
                                            width="60"
                                            height="40"
                                        />
                                        <p className={"mt-2 " + css.azul}>
                                            Web<span className={css.cinza}>Car</span>
                                        </p>
                                    </Link>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="offcanvas"
                                    ></button>
                                </div>

                                <div className="offcanvas-body">
                                    <ul className="navbar-nav flex-grow-1">

                                        {!usuarioInterno && (
                                            <>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="/catalogo">Comprar</Link>
                                                </li>

                                                <li className="nav-item">
                                                    <Link className="nav-link" to="/">Sobre nós</Link>
                                                </li>
                                            </>
                                        )}

                                        {!estaLogado ? (
                                            <>
                                                <li className="nav-item">
                                                    <Link
                                                        className="nav-link"
                                                        to="/login"
                                                    >
                                                        Entrar
                                                    </Link>
                                                </li>

                                                <li className="nav-item">
                                                    <Link
                                                        className={
                                                            "btn btn-primary " +
                                                            css.corFundo
                                                        }
                                                        to="/cadastro"
                                                    >
                                                        Cadastrar
                                                    </Link>
                                                </li>
                                            </>
                                        ) : (
                                            <li className="nav-item">
                                                <button
                                                    className={
                                                        "btn btn-primary " +
                                                        css.corFundo
                                                    }
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        )}
                                    </ul>

                                    <form
                                        className={usuarioInterno ? css.oculto : css.buscaMobile}
                                        onSubmit={handleBuscar}
                                    >
                                        <input
                                            className="form-control"
                                            type="search"
                                            placeholder="Buscar veículos..."
                                            value={valorBusca}
                                            onChange={handleBuscaChange}
                                        />
                                        <button type="submit" className={css.botaoBuscar}>
                                            Buscar
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form
                        className={usuarioInterno ? css.oculto : css.buscaDesktop}
                        onSubmit={handleBuscar}
                    >
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
                                    <Link className="nav-link" to="/">Sobre nós</Link>
                                </>
                            )}

                            {!estaLogado ? (
                                <>
                                    <Link className="nav-link" to="/login">
                                        Entrar
                                    </Link>

                                    <Link
                                        className={
                                            "btn btn-primary " + css.corFundo
                                        }
                                        to="/cadastro"
                                    >
                                        Cadastrar
                                    </Link>
                                </>
                            ) : (
                                <button
                                    className={
                                        "btn btn-primary " + css.corFundo
                                    }
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </nav>
        </header>
    );
}
