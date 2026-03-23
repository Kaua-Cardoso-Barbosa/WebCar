import css from './Login.module.css';
import Header from "../components/Header/Header.jsx";
import {Link} from "react-router-dom";
import {useState} from "react";



export default function Login() {

    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    function toggleSenha() {
        setMostrarSenha(!mostrarSenha);
    }

    return (
        <>
            <Header />
            <div className={css.loginFundo}>
                <div className={css.cartao}>

                    <h2 className={css.h2} >Bem-vindo!</h2>



                    <form>

                        <div className={css.grupoInput}>
                            <label  className={css.label}>E-mail</label>
                            <div className={css.input}>
                                <img src="/email.png" alt="Icone do email"/>
                                <input
                                    type="email"
                                    placeholder="User@gmail.com"
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
                                    required
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                                <span className="input-group-text" onClick={toggleSenha} style={{cursor:"pointer"}}>
        <i className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"}></i>
      </span>
                            </div>
                        </div>

                        <Link to="/PaginaDeSucesso">
                            <div className="d-grid gap-2 col-12 mx-auto">
                                <button className="btn btn-primary" type="button">Entre</button>
                            </div>
                        </Link>
                        <div className={css.senha}>
                            <Link to="/">Esqueceu a senha?</Link>
                        </div>

                        <div className={css.cadastro}>
                            <p>Não tem uma conta ainda?<Link to="/Cadastro">Cadastre-se</Link></p>
                        </div>

                    </form>

                </div>
            </div>
        </>

    );
}