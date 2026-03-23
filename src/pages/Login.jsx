import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import { Link } from "react-router-dom";
import { useState } from "react";
import Sucesso from "../components/Sucesso/Sucesso.jsx";

export default function Login() {
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [email, setEmail] = useState("");
    const [mostrarPopup, setMostrarPopup] = useState(false);

    function toggleSenha() {
        setMostrarSenha(!mostrarSenha);
    }

    function fazerLogin(e) {
        e.preventDefault();

        // aqui depois você coloca validação ou API
        // se o login der certo:
        setMostrarPopup(true);
    }

    function fecharPopup() {
        setMostrarPopup(false);
    }

    return (
        <>
            <Header />

            <div className={css.loginFundo}>
                <div className={css.cartao}>
                    <h2 className={css.h2}>Bem-vindo!</h2>

                    <form onSubmit={fazerLogin}>
                        <div className={css.grupoInput}>
                            <label className={css.label}>E-mail</label>
                            <div className={css.input}>
                                <img src="/email.png" alt="Ícone do email" />
                                <input
                                    type="email"
                                    placeholder="User@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={css.grupoInput}>
                            <label className={css.label}>Senha</label>
                            <div className={css.input}>
                                <img src="/cadeado.png" alt="Cadeado" />
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    placeholder="*******"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                                <span
                                    className="input-group-text"
                                    onClick={toggleSenha}
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                </span>
                            </div>
                        </div>

                        <div className="d-grid gap-2 col-12 mx-auto">
                            <button className="btn btn-primary" type="submit">
                                Entre
                            </button>
                        </div>

                        <div className={css.senha}>
                            <Link to="/">Esqueceu a senha?</Link>
                        </div>

                        <div className={css.cadastro}>
                            <p>
                                Não tem uma conta ainda? <Link to="/Cadastro">Cadastre-se</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {mostrarPopup && (
                <Sucesso
                    mensagem="Login realizado com sucesso! Bem-vindo à WebCar "
                    onClose={fecharPopup}
                />
            )}
        </>
    );
}