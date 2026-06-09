import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../App";
import GoogleAuthButton from "../GoogleAuthButton.jsx";
import { rotaDepoisLogin, salvarSessaoUsuario } from "../../utils/authSession";
import css from "./AuthModal.module.css";

function apenasNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
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

function cpfValido(valor) {
    const cpf = apenasNumeros(valor);

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i += 1) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(cpf[9])) return false;

    soma = 0;

    for (let i = 0; i < 10; i += 1) {
        soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    return digito === Number(cpf[10]);
}

export default function AuthModal({ aberto, modoInicial = "login", voltarPara, onClose }) {
    const navigate = useNavigate();
    const [modo, setModo] = useState(modoInicial);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarSenhaCadastro, setMostrarSenhaCadastro] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [preview, setPreview] = useState(null);
    const [imagem, setImagem] = useState(null);
    const [login, setLogin] = useState({
        email: "",
        senha: "",
    });
    const [cadastro, setCadastro] = useState({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        senha: "",
        confirmarSenha: "",
    });

    useEffect(() => {
        if (aberto) {
            setModo(modoInicial);
            setErro("");
            setCarregando(false);
            setMostrarSenha(false);
            setMostrarSenhaCadastro(false);
            setMostrarConfirmarSenha(false);
        }
    }, [aberto, modoInicial]);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    if (!aberto) return null;

    function concluirLogin(data) {
        const usuario = salvarSessaoUsuario(data);

        if (!usuario) {
            setErro("Não foi possível identificar o usuário.");
            return;
        }

        onClose?.();
        navigate(rotaDepoisLogin(usuario, voltarPara));
    }

    async function fazerLogin(e) {
        e.preventDefault();
        setErro("");

        try {
            setCarregando(true);

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(login),
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem || "Não foi possível entrar.");
                return;
            }

            concluirLogin(data);
        } catch {
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }

    function selecionarImagem(e) {
        const arquivo = e.target.files?.[0];

        if (!arquivo) return;

        if (preview) URL.revokeObjectURL(preview);

        setImagem(arquivo);
        setPreview(URL.createObjectURL(arquivo));
    }

    async function fazerCadastro(e) {
        e.preventDefault();
        setErro("");

        if (
            !cadastro.nome.trim() ||
            !cadastro.telefone.trim() ||
            !cadastro.email.trim() ||
            !cadastro.cpf.trim() ||
            !cadastro.senha.trim() ||
            !cadastro.confirmarSenha.trim()
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        if (!cpfValido(cadastro.cpf)) {
            setErro("Informe um CPF válido.");
            return;
        }

        if (cadastro.senha !== cadastro.confirmarSenha) {
            setErro("Senhas não coincidem.");
            return;
        }

        try {
            setCarregando(true);

            const formData = new FormData();
            formData.append("nome", cadastro.nome);
            formData.append("telefone", apenasNumeros(cadastro.telefone));
            formData.append("email", cadastro.email);
            formData.append("cpf", apenasNumeros(cadastro.cpf));
            formData.append("senha", cadastro.senha);
            formData.append("confirma", cadastro.confirmarSenha);
            formData.append("tipo", "2");

            if (imagem) {
                formData.append("imagem", imagem);
            }

            const response = await fetch(`${API_URL}/adicionar_usuario`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem || "Não foi possível cadastrar.");
                return;
            }

            localStorage.setItem("emailVerificacao", cadastro.email);
            onClose?.();
            navigate("/VerificarEmailConta", {
                state: { email: cadastro.email },
            });
        } catch {
            setErro("Não foi possível salvar o cadastro.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className={css.overlay} role="dialog" aria-modal="true" aria-labelledby="auth-modal-titulo">
            <div className={`${css.modal} ${modo === "cadastro" ? css.modalCadastro : ""}`}>
                <div className={css.topo}>
                    <div>
                        <span>{modo === "login" ? "Acesso" : "Cadastro"}</span>
                        <h2 id="auth-modal-titulo">{modo === "login" ? "Entrar na WebCar" : "Criar conta"}</h2>
                    </div>
                    <button type="button" className={css.fechar} onClick={onClose} aria-label="Fechar">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {modo === "login" ? (
                    <form className={css.form} onSubmit={fazerLogin}>
                        <label>
                            Email
                            <input
                                type="email"
                                value={login.email}
                                onChange={(e) => setLogin((dados) => ({ ...dados, email: e.target.value }))}
                                placeholder="User@gmail.com"
                                required
                            />
                        </label>

                        <label>
                            Senha
                            <div className={css.senhaCampo}>
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    value={login.senha}
                                    onChange={(e) => setLogin((dados) => ({ ...dados, senha: e.target.value }))}
                                    placeholder="*******"
                                    required
                                />
                                <button
                                    type="button"
                                    className={css.olhoSenha}
                                    onClick={() => setMostrarSenha((valor) => !valor)}
                                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    <i className={`bi bi-eye${mostrarSenha ? "-slash" : ""}`}></i>
                                </button>
                            </div>
                        </label>

                        <Link to="/recuperarsenhaemail" className={css.esqueciSenha} onClick={onClose}>
                            Esqueci minha senha
                        </Link>

                        <button type="submit" className={css.botaoPrincipal} disabled={carregando}>
                            {carregando ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                ) : (
                    <form className={css.form} onSubmit={fazerCadastro}>
                        <label>
                            Nome completo
                            <input
                                value={cadastro.nome}
                                onChange={(e) => setCadastro((dados) => ({ ...dados, nome: e.target.value }))}
                                placeholder="Digite seu nome completo"
                            />
                        </label>

                        <div className={css.duasColunas}>
                            <label>
                                Telefone
                                <input
                                    value={cadastro.telefone}
                                    onChange={(e) => setCadastro((dados) => ({ ...dados, telefone: formatarTelefone(e.target.value) }))}
                                    placeholder="(11) 99999-9999"
                                    inputMode="numeric"
                                    maxLength={15}
                                />
                            </label>

                            <label>
                                CPF
                                <input
                                    value={cadastro.cpf}
                                    onChange={(e) => setCadastro((dados) => ({ ...dados, cpf: formatarCpf(e.target.value) }))}
                                    placeholder="000.000.000-00"
                                    inputMode="numeric"
                                    maxLength={14}
                                />
                            </label>
                        </div>

                        <label>
                            Email
                            <input
                                type="email"
                                value={cadastro.email}
                                onChange={(e) => setCadastro((dados) => ({ ...dados, email: e.target.value }))}
                                placeholder="seuemail@exemplo.com"
                            />
                        </label>

                        <div className={css.duasColunas}>
                            <label>
                                Senha
                                <div className={css.senhaCampo}>
                                    <input
                                        type={mostrarSenhaCadastro ? "text" : "password"}
                                        value={cadastro.senha}
                                        onChange={(e) => setCadastro((dados) => ({ ...dados, senha: e.target.value }))}
                                        placeholder="*******"
                                    />
                                    <button
                                        type="button"
                                        className={css.olhoSenha}
                                        onClick={() => setMostrarSenhaCadastro((valor) => !valor)}
                                        aria-label={mostrarSenhaCadastro ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        <i className={`bi bi-eye${mostrarSenhaCadastro ? "-slash" : ""}`}></i>
                                    </button>
                                </div>
                            </label>

                            <label>
                                Confirmar senha
                                <div className={css.senhaCampo}>
                                    <input
                                        type={mostrarConfirmarSenha ? "text" : "password"}
                                        value={cadastro.confirmarSenha}
                                        onChange={(e) => setCadastro((dados) => ({ ...dados, confirmarSenha: e.target.value }))}
                                        placeholder="*******"
                                    />
                                    <button
                                        type="button"
                                        className={css.olhoSenha}
                                        onClick={() => setMostrarConfirmarSenha((valor) => !valor)}
                                        aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        <i className={`bi bi-eye${mostrarConfirmarSenha ? "-slash" : ""}`}></i>
                                    </button>
                                </div>
                            </label>
                        </div>

                        <label className={css.upload}>
                            {preview ? <img src={preview} alt="Preview" /> : <span>Adicionar foto</span>}
                            <input type="file" accept="image/*" onChange={selecionarImagem} />
                        </label>

                        <button type="submit" className={css.botaoPrincipal} disabled={carregando}>
                            {carregando ? "Cadastrando..." : "Cadastrar"}
                        </button>
                    </form>
                )}

                <div className={css.divisor}>
                    <span>ou</span>
                </div>

                <GoogleAuthButton
                    className={css.google}
                    onSuccess={concluirLogin}
                    onError={setErro}
                />

                {erro && <p className={css.erro}>{erro}</p>}

            </div>
        </div>
    );
}
