import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import { API_URL } from "../App";
import css from "./EditarCliente.module.css";

export default function EditarCliente() {
    const navigate = useNavigate();
    const { id_usuario } = useParams();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function carregarUsuario() {
        try {
            const res = await fetch(`${API_URL}/buscar_usuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_usuario })
            });

            const data = await res.json();

            if (!res.ok) {
                setMensagem(data.mensagem || "Erro ao carregar usuário");
                setTipoMensagem("erro");
                return;
            }

            const usuario = data.usuarios[0];

            setNome(usuario.nome || "");
            setEmail(usuario.email || "");
            setTelefone(usuario.telefone || "");
            setCpf(usuario.cpf || "");


            setPreview(`${usuario.imagem}?v=${Date.now()}`);

        } catch {
            setMensagem("Erro ao carregar usuário.");
            setTipoMensagem("erro");
        }
    }

    useEffect(() => {
        if (id_usuario) {
            carregarUsuario();
        }
    }, [id_usuario]);

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
        if (!nome.trim() || !email.trim() || !telefone.trim() || !cpf.trim()) {
            setMensagem("Preencha todos os campos.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setCarregando(true);
            setMensagem("");

            const formData = new FormData();
            formData.append("nome", nome);
            formData.append("email", email);
            formData.append("telefone", apenasNumeros(telefone));
            formData.append("cpf", apenasNumeros(cpf));

            if (senha.trim()) {
                formData.append("senha", senha);
            }

            if (imagem) {
                formData.append("imagem", imagem);
            }

            const response = await fetch(`${API_URL}/edicao_usuario/${id_usuario}`, {
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

            setMensagem("Usuário atualizado com sucesso.");
            setTipoMensagem("sucesso");

            setTimeout(() => {
                navigate("/ListaUsuarios");
            }, 800);

        } catch {
            setMensagem("Erro ao editar usuário.");
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
                            <h1 className={css.titulo}>Editar Usuário</h1>
                            <p className={css.subtitulo}>
                                Atualize as informações do usuário.
                            </p>
                        </div>

                        {mensagem && (
                            <div className={
                                tipoMensagem === "sucesso"
                                    ? css.sucesso
                                    : css.erroMensagem
                            }>
                                {mensagem}
                            </div>
                        )}

                        <div className="row g-4 w-100">
                            <div className="col-12 col-xl-4">
                                <section className={css.card}>
                                    <div className={css.cardHeader}>
                                        <h3>Foto</h3>
                                    </div>

                                    <label className={css.uploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImagem}
                                        />

                                        {preview ? (
                                            <img className={css.preview} src={preview} alt="Preview" />
                                        ) : (
                                            <div className={css.uploadContent}>
                                                <p>Adicionar imagem</p>
                                            </div>
                                        )}
                                    </label>
                                </section>
                            </div>

                            <div className="col-12 col-xl-8">
                                <section className={css.card}>
                                    <div className={css.cardHeader}>
                                        <h3>Dados</h3>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className={css.label}>Nome</label>
                                            <input className={`form-control ${css.input}`} value={nome} onChange={(e) => setNome(e.target.value)} />
                                        </div>

                                        <div className="col-12">
                                            <label className={css.label}>Email</label>
                                            <input className={`form-control ${css.input}`} value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>

                                        <div className="col-6">
                                            <label className={css.label}>Telefone</label>
                                            <input className={`form-control ${css.input}`} value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} />
                                        </div>

                                        <div className="col-6">
                                            <label className={css.label}>CPF</label>
                                            <input className={`form-control ${css.input}`} value={cpf} onChange={(e) => setCpf(formatarCPF(e.target.value))} />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="col-12">
                                <section className={css.card}>
                                    <div className={css.cardHeader}>
                                        <h3>Senha</h3>
                                    </div>

                                    <input
                                        type="password"
                                        className={`form-control ${css.input}`}
                                        placeholder="Nova senha (opcional)"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                    />
                                </section>
                            </div>
                        </div>

                        <div className={css.actions}>
                            <button className={css.cancelar} onClick={() => navigate("/ListaUsuarios")}>
                                Cancelar
                            </button>

                            <button className={css.salvar} onClick={salvarEdicao} disabled={carregando}>
                                {carregando ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}
