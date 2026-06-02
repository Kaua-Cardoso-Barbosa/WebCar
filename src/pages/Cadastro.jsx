import "./Cadastro.module.css";
import css from "./Cadastro.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { rotaDepoisLogin, salvarSessaoUsuario } from "../utils/authSession";


export default function Cadastro() {

    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [erro, setErro] = useState("");
    const [errosCampos, setErrosCampos] = useState({});

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, "");
    }

    function formatarTelefone(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;

        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    function formatarCpf(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 3) return numeros;
        if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
        if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];

        if (arquivo) {
            setImagem(arquivo);
            setPreview(URL.createObjectURL(arquivo));
        }
    }

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    function concluirCadastroGoogle(data) {
        const usuario = salvarSessaoUsuario(data);
        if (!usuario) {
            setErro("Não foi possível identificar o usuário.");
            return;
        }

        navigate(rotaDepoisLogin(usuario));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setErro("");
        setErrosCampos({});

        const camposObrigatorios = [
            { chave: "nome", valor: nome, mensagem: "Informe seu nome completo." },
            { chave: "telefone", valor: telefone, mensagem: "Informe seu telefone." },
            { chave: "email", valor: email, mensagem: "Informe seu e-mail." },
            { chave: "cpf", valor: cpf, mensagem: "Informe seu CPF." },
            { chave: "senha", valor: senha, mensagem: "Informe sua senha." },
            { chave: "confirmarSenha", valor: confirmarSenha, mensagem: "Confirme sua senha." },
        ];
        const campoVazio = camposObrigatorios.find((campo) => !String(campo.valor || "").trim());

        if (campoVazio) {
            setErrosCampos({ [campoVazio.chave]: campoVazio.mensagem });
            return;
        }

        if (senha !== confirmarSenha) {
            setErrosCampos({ confirmarSenha: "As senhas não coincidem." });
            return;
        }

        const formData = new FormData();
        formData.append("nome", nome);
        formData.append("telefone", apenasNumeros(telefone));
        formData.append("email", email);
        formData.append("cpf", apenasNumeros(cpf));
        formData.append("senha", senha);
        formData.append("confirma", confirmarSenha);
        formData.append("tipo", "2");

        if (imagem) {
            formData.append("imagem", imagem);
        }

        try {
            const response = await fetch(`${API_URL}/adicionar_usuario`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem || "Não foi possível salvar as alterações.");
                return;
            }

            localStorage.setItem("emailVerificacao", email);

            navigate("/VerificarEmailConta", {
                state: { email }
            });

        } catch {
            setErro("Não foi possível salvar as alterações.");
        }
    }

    return (
        <>
            <Header />

            <main className={css.paginaCadastro}>
                <section className={css.areaCadastro}>
                    <h1 className={css.tituloCadastro}>Crie sua conta</h1>

                    <p className={css.subtituloCadastro}>
                        Gerencie seus veículos usados com a melhor plataforma do mercado.
                    </p>

                    <div className={css.cardCadastro}>
                        <form className={css.formularioCadastro} onSubmit={handleSubmit}>
                            <p className={css.avisoObrigatorio}>Todos os campos são obrigatórios.</p>

                            <div className={css.grupoCampo}>
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome completo"
                                    className={`${css.inputCadastro} ${errosCampos.nome ? css.inputErro : ""}`}
                                    value={nome}
                                    onChange={(e) => {
                                        setNome(e.target.value);
                                        setErrosCampos((atuais) => ({ ...atuais, nome: "" }));
                                    }}
                                />
                                {errosCampos.nome && <span className={css.erroCampo}>{errosCampos.nome}</span>}
                            </div>

                            <div className={css.grupoCampo}>
                                <label>Telefone</label>
                                <input
                                    type="text"
                                    placeholder="(11) 99999-9999"
                                    className={`${css.inputCadastro} ${errosCampos.telefone ? css.inputErro : ""}`}
                                    value={telefone}
                                    onChange={(e) => {
                                        setTelefone(formatarTelefone(e.target.value));
                                        setErrosCampos((atuais) => ({ ...atuais, telefone: "" }));
                                    }}
                                    inputMode="numeric"
                                    maxLength={15}
                                />
                                {errosCampos.telefone && <span className={css.erroCampo}>{errosCampos.telefone}</span>}
                            </div>

                            <div className={css.grupoCampo}>
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    className={`${css.inputCadastro} ${errosCampos.email ? css.inputErro : ""}`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrosCampos((atuais) => ({ ...atuais, email: "" }));
                                    }}
                                />
                                {errosCampos.email && <span className={css.erroCampo}>{errosCampos.email}</span>}
                            </div>

                            <div className={css.grupoCampo}>
                                <label>CPF</label>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    className={`${css.inputCadastro} ${errosCampos.cpf ? css.inputErro : ""}`}
                                    value={cpf}
                                    onChange={(e) => {
                                        setCpf(formatarCpf(e.target.value));
                                        setErrosCampos((atuais) => ({ ...atuais, cpf: "" }));
                                    }}
                                    inputMode="numeric"
                                    maxLength={14}
                                />
                                {errosCampos.cpf && <span className={css.erroCampo}>{errosCampos.cpf}</span>}
                            </div>

                            <div className={css.linhaSenha}>
                                <div className={css.grupoCampo}>
                                    <label>Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className={`${css.inputCadastro} ${errosCampos.senha ? css.inputErro : ""}`}
                                        value={senha}
                                        onChange={(e) => {
                                            setSenha(e.target.value);
                                            setErrosCampos((atuais) => ({ ...atuais, senha: "" }));
                                        }}
                                    />
                                    {errosCampos.senha && <span className={css.erroCampo}>{errosCampos.senha}</span>}
                                </div>

                                <div className={css.grupoCampo}>
                                    <label>Confirmar <span className={css.sumir}>Senha</span></label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className={`${css.inputCadastro} ${errosCampos.confirmarSenha ? css.inputErro : ""}`}
                                        value={confirmarSenha}
                                        onChange={(e) => {
                                            setConfirmarSenha(e.target.value);
                                            setErrosCampos((atuais) => ({ ...atuais, confirmarSenha: "" }));
                                        }}
                                    />
                                    {errosCampos.confirmarSenha && <span className={css.erroCampo}>{errosCampos.confirmarSenha}</span>}
                                </div>
                            </div>

                            <div className={css.uploadArea}>
                                <div className={css.containerPreview}>
                                    {!preview && <img src="/Nuvem.png" alt="upload" />}

                                    <input
                                        type="file"
                                        className={css.inputImg}
                                        onChange={handleImagem}
                                    />

                                    {preview && (
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className={css.previewImagem}
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <button type="submit" className={css.botaoCadastro}>
                                    Cadastrar
                                </button>
                            </div>

                            <div className={css.divisor}>
                                <span>ou</span>
                            </div>

                            <GoogleAuthButton
                                className={css.google}
                                onSuccess={concluirCadastroGoogle}
                                onError={setErro}
                            />

                            {erro && (
                                <p className={css.erro}>
                                    {erro}
                                </p>
                            )}

                            <p className={css.textoLogin}>
                                Já tem uma conta? <a href="/login">Entre aqui</a>
                            </p>

                        </form>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
