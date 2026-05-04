import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import Sucesso from "../components/Sucesso/Sucesso.jsx";
import { API_URL } from "../App";

export default function VerificarEmailSenha() {

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
            setErro("Email não encontrado");
            return;
        }

        if (!codigo) {
            setErro("Digite o código");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/verificar_codigo`, { // 👈 corrigido
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

            localStorage.setItem("codigoVerificacao", codigo);

            setMensagemSucesso("Código válido!");
            setMostrarPopup(true);

            setTimeout(() => {
                navigate("/trocarSenha");
            }, 2000);

        } catch (error) {
            setErro("Erro ao conectar com o servidor");
        }
    }

    return (
        <>
            <Header />

            <div className={css.verificacaoFundo}>
                <div className={css.cartaoVerificacao}>
                    <h2 className={css.tituloVerificacao}>Digite o código enviado no seu email</h2>

                    <form onSubmit={avancar}>
                        <div className={css.grupoInput}>
                            <label className={css.label}>Código</label>
                            <div className={css.input}>
                                <input
                                    type="text"
                                    placeholder="Digite o código"
                                    value={codigo}
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    onChange={(e) => setCodigo(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (isNaN(e.key)) e.preventDefault();
                                    }}
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
