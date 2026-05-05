import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import { API_URL } from "../App";
import css from "./EditarCliente.module.css";

export default function EditarCliente() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id_usuario } = useParams();

    const usuarioState = location.state?.usuario;
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario")) || {};
    const idUsuario = id_usuario || usuarioState?.id_usuario || usuarioLogado.id_usuario;

    const [nome, setNome] = useState(usuarioState?.nome || usuarioLogado.nome || "");
    const [email, setEmail] = useState(usuarioState?.email || usuarioLogado.email || "");
    const [telefone, setTelefone] = useState(usuarioState?.telefone || "");
    const [cpf, setCpf] = useState(usuarioState?.cpf || "");
    const [senha, setSenha] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    function apenasNumeros(valor) {
        return String(valor).replace(/\D/g, "");
    }

    function formatarCPF(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        return numeros
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    function formatarTelefone(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 10) {
            return numeros
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        }

        return numeros
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2");
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];

        if (arquivo) {
            setImagem(arquivo);
            setPreview(URL.createObjectURL(arquivo));
        }
    }

    async function salvarEdicao() {
        if (!nome.trim() || !email.trim() || !telefone.trim() || !cpf.trim() || !senha.trim()) {
            setMensagem("Preencha todos os campos.");
            setTipoMensagem("erro");
            return;
        }

        if (!idUsuario) {
            setMensagem("Erro ao identificar usuário.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setCarregando(true);
            setMensagem("");
            setTipoMensagem("");

            const formData = new FormData();
            formData.append("nome", nome);
            formData.append("email", email);
            formData.append("telefone", apenasNumeros(telefone));
            formData.append("cpf", apenasNumeros(cpf));
            formData.append("senha", senha);

            if (imagem) {
                formData.append("imagem", imagem);
            }

            const response = await fetch(`${API_URL}/edicao_usuario/${idUsuario}`, {
                method: "PUT",
                credentials: "include",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Erro ao salvar.");
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem || "Cliente atualizado com sucesso.");
            setTipoMensagem("sucesso");

            setTimeout(() => {
                navigate("/usuarios");
            }, 800);
        } catch (error) {
            console.log(error);
            setMensagem("Erro ao editar cliente.");
            setTipoMensagem("erro");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <div className="container-fluid px-0">
                        <div className={css.topo}>
                            <h1 className={css.titulo}>Editar Cliente</h1>
                            <p className={css.subtitulo}>
                                Atualize as informações pessoais, foto e senha do cliente.
                            </p>
                        </div>

                        {mensagem && (
                            <div
                                className={
                                    tipoMensagem === "sucesso"
                                        ? css.sucesso
                                        : css.erroMensagem
                                }
                            >
                                {mensagem}
                            </div>
                        )}

                        <div className="row g-4 w-100">
                            <div className="col-12 col-xl-4">
                                <section className={css.card}>
                                    <div className={css.cardHeader}>
                                        <h3>Foto do Cliente</h3>
                                        <span>Imagem de perfil</span>
                                    </div>

                                    <label className={css.uploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImagem}
                                        />

                                        {preview ? (
                                            <img
                                                className={css.preview}
                                                src={preview}
                                                alt="Preview"
                                            />
                                        ) : (
                                            <div className={css.uploadContent}>
                                                <img
                                                    className={css.uploadIcon}
                                                    src="/Nuvem.png"
                                                    alt="Upload"
                                                />
                                                <p>Clique para adicionar imagem</p>
                                                <small>
                                                    A imagem será atualizada ao salvar
                                                </small>
                                            </div>
                                        )}
                                    </label>
                                </section>
                            </div>

                            <div className="col-12 col-xl-8">
                                <section className={css.card}>
                                    <div className={css.cardHeader}>
                                        <h3>Dados do Cliente</h3>
                                        <span>Informações principais da conta</span>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className={css.label}>Nome</label>
                                            <input
                                                className={`form-control ${css.input}`}
                                                placeholder="Digite o nome completo"
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className={css.label}>Email</label>
                                            <input
                                                className={`form-control ${css.input}`}
                                                placeholder="Digite o email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className={css.label}>Telefone</label>
                                            <input
                                                className={`form-control ${css.input}`}
                                                placeholder="Digite o telefone"
                                                value={telefone}
                                                onChange={(e) =>
                                                    setTelefone(formatarTelefone(e.target.value))
                                                }
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className={css.label}>CPF</label>
                                            <input
                                                className={`form-control ${css.input}`}
                                                placeholder="Digite o CPF"
                                                value={cpf}
                                                onChange={(e) =>
                                                    setCpf(formatarCPF(e.target.value))
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="col-12">
                                <section className={css.card}>
                                    <div className={css.cardHeader}>
                                        <h3>Segurança</h3>
                                        <span>Informe uma nova senha para salvar a edição</span>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className={css.label}>Nova senha</label>
                                            <input
                                                className={`form-control ${css.input}`}
                                                type="password"
                                                placeholder="Digite a nova senha"
                                                value={senha}
                                                onChange={(e) => setSenha(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className={css.actions}>
                            <button
                                type="button"
                                className={css.cancelar}
                                onClick={() => navigate("/usuarios")}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={css.salvar}
                                onClick={salvarEdicao}
                                disabled={carregando}
                            >
                                {carregando ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}