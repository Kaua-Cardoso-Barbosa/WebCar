import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import Sucesso from "../components/Sucesso/Sucesso.jsx";
import { API_URL } from "../App";

export default function VerificarEmailConta() {

    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState("");
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const navigate = useNavigate();

    async function avancar(e) {
        e.preventDefault();
        setErro("");

        const email = localStorage.getItem("emailVerificacao");

        if (!email) {
            setErro("Email não encontrado. Faça o cadastro novamente.");
            navigate("/cadastro");
            return;
        }

        if (!codigo) {
            setErro("Digite o código");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/verificar_email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    codigo
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem);
                return;
            }

            setMensagemSucesso("Cadastro confirmado com sucesso!");
            setMostrarPopup(true);

            localStorage.removeItem("emailVerificacao");

            setTimeout(() => {
                navigate("/login");
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
                    <h2 className={css.h2}>Digite o código enviado no seu email</h2>

                    <form onSubmit={avancar}>
                        <div className={css.grupoInput}>
                            <label className={css.label}>Código</label>
                            <div className={css.input}>
                                <input
                                    type="text"
                                    placeholder="Digite o código"
                                    value={codigo}
                                    maxLength={6}
                                    onChange={(e) => setCodigo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="d-grid gap-2 col-12 mx-auto">
                            <button className="btn btn-primary" type="submit">
                                Verificar Código
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


            {mostrarPopup && (
                <Sucesso
                    mensagem={mensagemSucesso}
                    onClose={() => setMostrarPopup(false)}
                />
            )}

            <Footer />
        </>
    );
}