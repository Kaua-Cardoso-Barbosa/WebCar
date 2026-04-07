import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import css from "./Header.module.css";

export default function Header() {

    const location = useLocation();

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
                        <Link className="navbar-brand d-flex align-items-center gap-2" to={"/"}>
                            <img src="/Logo.png" alt="Logo" width="60" height="40"/>
                            <p className={"mt-2 " + css.azul}>Web<span className={css.cinza}>Car</span></p>
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
                                    <Link className="navbar-brand d-flex align-items-center gap-2" to={"/"}>
                                        <img src="/Logo.png" alt="Logo" width="60" height="40"/>
                                        <p className={"mt-2 " + css.azul}>Web<span className={css.cinza}>Car</span></p>
                                    </Link>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="offcanvas"
                                    ></button>
                                </div>

                                <div className="offcanvas-body">
                                    <ul className="navbar-nav flex-grow-1">

                                        <li className="nav-item">
                                            <a className="nav-link">Comprar</a>
                                        </li>

                                        <li className="nav-item">
                                            <a className="nav-link">Sobre nós</a>
                                        </li>

                                        <li className="nav-item">
                                            <Link className="nav-link" to="/Login">
                                                Entrar
                                            </Link>
                                        </li>

                                        <li className="nav-item">
                                            <Link className={"btn btn-primary " + css.corFundo} to="/Cadastro">
                                                Cadastrar
                                            </Link>
                                        </li>
                                    </ul>

                                    <form className="d-flex mt-3">
                                        <input
                                            className="form-control me-2"
                                            type="search"
                                            placeholder="Buscar veículos..."
                                        />
                                        <button className="btn btn-outline-success">
                                            Pesquisar
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className={"d-flex mx-4 flex-grow-1 " + css.sumir}>
                        <input
                            className="form-control"
                            type="search"
                            placeholder="Buscar veículos..."
                        />
                    </form>

                    <div className={css.sumir}>
                        <div className="d-flex align-items-center gap-3">
                            <a className="nav-link">Comprar</a>
                            <a className="nav-link">Sobre nós</a>

                            <Link className="nav-link" to="/Login">
                                Entrar
                            </Link>

                            <Link className={"btn btn-primary " + css.corFundo} to="/Cadastro">
                                Cadastrar
                            </Link>
                        </div>
                    </div>

                </div>
            </nav>
        </header>
    );
}