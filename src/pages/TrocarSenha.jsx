import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sucesso from "../components/Sucesso/Sucesso.jsx";

export default function TrocarSenha() {

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const navigate = useNavigate();

    async function avancar(e) {
        e.preventDefault();

        setErro("");

        const email = localStorage.getItem("emailVerificacao");
        const codigo = localStorage.getItem("codigoVerificacao");

        if (!novaSenha || !confirmarSenha) {
            setErro("Preencha todos os campos");
            return;
        }

        try {
            const response = await fetch("http://10.92.3.167:5000/trocar_senha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    codigo,
                    nova_senha: novaSenha,
                    confirmar_senha: confirmarSenha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem);
                return;
            }


            setMensagemSucesso("Senha alterada com sucesso!");
            setMostrarPopup(true);


            localStorage.removeItem("emailVerificacao");
            localStorage.removeItem("codigoVerificacao");
            localStorage.removeItem("tipoVerificacao");

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
                    <h2 className={css.h2}>Informe sua nova senha</h2>

                    <form onSubmit={avancar}>


                        <div className={css.grupoInput}>
                            <label className={css.label}>Nova Senha</label>
                            <div className={css.input}>
                                <input
                                    type="password"
                                    placeholder="Digite a nova senha"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                />
                            </div>
                        </div>


                        <div className={css.grupoInput}>
                            <label className={css.label}>Confirmar Senha</label>
                            <div className={css.input}>
                                <input
                                    type="password"
                                    placeholder="Confirme a senha"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="d-grid gap-2 col-12 mx-auto">
                            <button className="btn btn-primary" type="submit">
                                Alterar Senha
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