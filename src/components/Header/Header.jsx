import { Link } from "react-router-dom"
import css from "./Header.module.css"

export default function Header() {
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
                            <button className={"navbar-toggler " + css.corrigir} type="button" data-bs-toggle="offcanvas"
                                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar"
                                    aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar"
                                 aria-labelledby="offcanvasNavbarLabel">
                                <div className="offcanvas-header">
                                    <a className="navbar-brand d-flex align-items-center gap-2" href="#">
                                        <img src="/Logo.png" alt="Logo" width="60" height="40"/>
                                        <p className={"mt-2 " + css.azul}>Web<span className={css.cinza}>Car</span></p>
                                    </a>
                                    <h5 className="offcanvas-title" id="offcanvasNavbarLabel"></h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"
                                            aria-label="Close"></button>
                                </div>
                                <div className="offcanvas-body">
                                    <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                                        <li className="nav-item">
                                            <a className="nav-link active" aria-current="page" href="#">Comprar</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link active" aria-current="page" href="#">Sobre nós</a>
                                        </li>
                                        <li className="nav-item">
                                             <Link className="nav-link active" aria-current="page" to="/Login">Entrar</Link>
                                        </li>
                                        <Link className={"btn btn-primary " + css.corFundo} to="/Cadastro">
                                            Cadastrar
                                        </Link>
                                    </ul>
                                    <form className="d-flex mt-3" role="search">
                                        <input className="form-control me-2" type="search" placeholder="Buscar veículos..."
                                               aria-label="Search"/>
                                        <button className="btn btn-outline-success" type="submit">Pesquisar</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className={"d-flex mx-4 flex-grow-1 " + css.sumir}>
                        <input
                            className="form-control "
                            type="search"
                            placeholder="Buscar veículos..."
                        />
                    </form>

                    <div className={css.sumir}>
                        <div className="d-flex align-items-center gap-3 ">
                            <a className="nav-link" href="#">Comprar</a>
                            <a className="nav-link" href="#">Sobre nós</a>
                            <Link className="nav-link" to="/Login">Entrar </Link>

                            <Link className={"btn btn-primary " + css.corFundo} to="/Cadastro">
                                Cadastrar
                            </Link>
                        </div>
                    </div>

                </div>
            </nav>
        </header>
    )
}