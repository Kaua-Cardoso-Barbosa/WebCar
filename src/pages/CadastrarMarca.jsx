import css from "./CadastrarMarca.module.css";
import Header from "../components/Header/Header";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";


export default function CadastrarMarca() {

    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [erro, setErro] = useState("");

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

        if (!nome) {
            setErro("Preencha todos os campos.");
            return;
        }

        const formData = new FormData();
        formData.append("nome", nome);


        if (imagem) {
            formData.append("imagem", imagem);
        }

        try {
            const response = await fetch(`${API_URL}/adicionar_marca`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem || "Não foi possível salvar as alterações.");
                return;
            }

            navigate("/dashboard");

        } catch (error) {
            setErro("Não foi possível salvar as alterações.");
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.paginaCadastro}>
                    <section className={css.areaCadastro}>
                        <div className={css.topo}>
                            <div>
                                <h1 className={css.tituloCadastro}>Cadastrar Marca</h1>
                                <p className={css.subtituloCadastro}>
                                    Adicione uma marca ao sistema.
                                </p>
                            </div>
                        </div>

                        <div className={css.cardCadastro}>
                            <form className={css.formularioCadastro} onSubmit={handleSubmit}>

                                <div className={css.grupoCampo}>
                                    <label>Nome da marca</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Toyota"
                                        className={css.inputCadastro}
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                    />
                                </div>

                                <div className={css.grupoCampo}>
                                    <label>Imagem da marca</label>
                                    <div className={css.uploadArea}>
                                        <div className={css.containerPreview}>
                                            {!preview && <span className={css.uploadTexto}>Selecionar imagem</span>}

                                            <input
                                                type="file"
                                                className={css.inputImg}
                                                onChange={handleImagem}
                                            />

                                            {preview && (
                                                <img
                                                    src={preview}
                                                    alt="Prévia da marca"
                                                    className={css.previewImagem}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {erro && (
                                    <p className={css.erro}>
                                        {erro}
                                    </p>
                                )}

                                <div className={css.botoes}>
                                    <button
                                        type="button"
                                        className={css.cancelar}
                                        onClick={() => navigate("/listarmarcas")}
                                    >
                                        Cancelar
                                    </button>

                                    <button type="submit" className={css.botaoCadastro}>
                                        Cadastrar
                                    </button>
                                </div>

                            </form>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
