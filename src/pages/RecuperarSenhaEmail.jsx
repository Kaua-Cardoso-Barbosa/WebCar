import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sucesso from "../components/Sucesso/Sucesso.jsx";
import { API_URL } from "../App";

export default function RecuperarSenhaEmail() {

    const [email, setEmail] = useState("");
    const [erro, setErro] = useState("");
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const navigate = useNavigate();

    async function avancar(e) {
        e.preventDefault();
        setErro("");

        if (!email) {
            setErro("Digite seu email");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/esqueci_senha`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem);
                return;
            }


            localStorage.setItem("emailVerificacao", email);
            localStorage.setItem("tipoVerificacao", "recuperacao");


            setMensagemSucesso("Código enviado para seu email!");
            setMostrarPopup(true);


            setTimeout(() => {
                navigate("/verificarEmailSenha");
            }, 2000);

        } catch (error) {
            setErro("Erro ao conectar com o servidor");
        }
    }

    return (
        <>
            <Header />

            <div className={css.loginFundo}>
                <div className={css.cartao}>
                    <h2 className={css.h2}>Digite o email para receber o código</h2>

                    <form onSubmit={avancar}>
                        <div className={css.grupoInput}>
                            <label className={css.label}>E-mail</label>
                            <div className={css.input}>
                                <img src="/email.png" alt="Ícone do email" />
                                <input
                                    type="email"
                                    placeholder="User@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="d-grid gap-2 col-12 mx-auto">
                            <button className="btn btn-primary" type="submit">
                                Enviar Código
                            </button>
                        </div>


                        {erro && (
                            <p style={{
                                color: "#ff4d4f",
                                marginTop: "10px",
                                textAlign: "center",
                                fontWeight: "500"
                            }}>
                                {erro}
                            </p>
                        )}
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}