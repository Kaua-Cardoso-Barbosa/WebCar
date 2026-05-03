import "./Cadastro.module.css";
import css from "./Cadastro.module.css";
import Header from "../components/Header/Header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";


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

    async function handleSubmit(e) {
        e.preventDefault();

        setErro("");

        if (!nome || !email || !cpf || !senha || !confirmarSenha) {
            setErro("Preencha todos os campos.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
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

        } catch (error) {
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

                            <div className={css.grupoCampo}>
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome completo"
                                    className={css.inputCadastro}
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className={css.grupoCampo}>
                                <label>Telefone</label>
                                <input
                                    type="text"
                                    placeholder="(11) 99999-9999"
                                    className={css.inputCadastro}
                                    value={telefone}
                                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                                    inputMode="numeric"
                                    maxLength={15}
                                />
                            </div>

                            <div className={css.grupoCampo}>
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    className={css.inputCadastro}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className={css.grupoCampo}>
                                <label>CPF</label>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    className={css.inputCadastro}
                                    value={cpf}
                                    onChange={(e) => setCpf(formatarCpf(e.target.value))}
                                    inputMode="numeric"
                                    maxLength={14}
                                />
                            </div>

                            <div className={css.linhaSenha}>
                                <div className={css.grupoCampo}>
                                    <label>Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className={css.inputCadastro}
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                    />
                                </div>

                                <div className={css.grupoCampo}>
                                    <label>Confirmar <span className={css.sumir}>Senha</span></label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className={css.inputCadastro}
                                        value={confirmarSenha}
                                        onChange={(e) => setConfirmarSenha(e.target.value)}
                                    />
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
        </>
    );
}
