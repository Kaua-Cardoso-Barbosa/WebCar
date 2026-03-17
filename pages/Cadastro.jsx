import "../index.css";
import Header from "../components/Header/Header";
import { Link } from 'react-router-dom';

export default function Cadastro() {
    return (
        <>
            <Header />



            <main className="pagina-cadastro">
                <section className="area-cadastro">
                    <h1 className="titulo-cadastro">Crie sua conta</h1>

                    <p className="subtitulo-cadastro">
                        Gerencie seus veículos usados com a melhor plataforma do mercado.
                    </p>

                    <div className="card-cadastro">
                        <form className="formulario-cadastro">
                            <div className="grupo-campo">
                                <label className="rotulo-campo">Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome completo"
                                    className="input-cadastro"
                                />
                            </div>

                            <div className="grupo-campo">
                                <label className="rotulo-campo">Telefone</label>
                                <input
                                    type="text"
                                    placeholder="(19) 98847-3521"
                                    className="input-cadastro"
                                />
                            </div>

                            <div className="grupo-campo">
                                <label className="rotulo-campo">E-mail</label>
                                <input
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    className="input-cadastro"
                                />
                            </div>

                            <div className="linha-senha">
                                <div className="grupo-campo">
                                    <label className="rotulo-campo">Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="input-cadastro"
                                    />
                                </div>

                                <div className="grupo-campo">
                                    <label className="rotulo-campo">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="input-cadastro"
                                    />
                                </div>
                            </div>

                            <div className="upload-area p-5 text-center mb-3">
                                <div className="mb-3">
                                    <span className="material-symbols-outlined fs-1 text-secondary">
                                        upload
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-light border px-4 py-2 fw-semibold"
                                >
                                    Selecionar Fotos
                                </button>
                            </div>

                            <button className="botao-cadastro">
                                <Link to="/login" style={{ textDecoration: 'none', color: 'white' }}>
                                    Criar Minha Conta
                                </Link>
                            </button>

                            <p className="texto-login">
                                Já tem uma conta? <a href="/login">Entre aqui</a>
                            </p>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}