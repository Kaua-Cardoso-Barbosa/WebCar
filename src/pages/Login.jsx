import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer/Footer.jsx";
import { useState } from "react";
import Sucesso from "../components/Sucesso/Sucesso.jsx";
import { API_URL } from "../App";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { rotaDepoisLogin, salvarSessaoUsuario } from "../utils/authSession";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const voltarPara = location.state?.voltarPara;

    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [email, setEmail] = useState("");
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [erro, setErro] = useState("");

    function toggleSenha() {
        setMostrarSenha(!mostrarSenha);
    }

    function concluirLogin(data) {
        const usuario = salvarSessaoUsuario(data);
        if (!usuario) {
            setErro("Nao foi possivel identificar o usuario.");
            return;
        }

        setMostrarPopup(true);

        setTimeout(() => {
            navigate(rotaDepoisLogin(usuario, voltarPara));
        }, 1000);
    }

    async function fazerLogin(e) {
        e.preventDefault();

        setErro("");

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem);
                return;
            }

            concluirLogin(data);

        }
        catch (error) {
            console.log("ERRO REAL:", error);
            setErro("Erro ao conectar com o servidor");
        }
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
                                    onClick={toggleSenha}
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className={mostrarSenha ? "bi bi-eye" : "bi bi-eye-slash"}></i>
                                </span>
                            </div>
                        </div>

                        <div className="d-grid gap-2 col-12 mx-auto">
                            <button className={css.botao} type="submit">
                                Entrar
                            </button>
                        </div>

                        <div className={css.divisor}>
                            <span>ou</span>
                        </div>

                        <GoogleAuthButton
                            className={css.google}
                            onSuccess={concluirLogin}
                            onError={setErro}
                        />

                        {erro && (
                            <p
                                style={{
                                    color: "var(--cor-erro-alerta)",
                                    marginTop: "10px",
                                    textAlign: "center",
                                    fontWeight: "500"
                                }}
                            >
                                {erro}
                            </p>
                        )}

                        <div className={css.senha}>
                            <Link to="/recuperarsenhaemail">
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <div className={css.cadastro}>
                            <p>
                                Não tem uma conta ainda?{" "}
                                <Link to="/cadastro">
                                    Cadastre-se
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />

            {mostrarPopup && (
                <Sucesso
                    mensagem="Login realizado com sucesso! Bem-vindo à WebCar"
                    onClose={fecharPopup}
                />
            )}
        </>
    );
}
