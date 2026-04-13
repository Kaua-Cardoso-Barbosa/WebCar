import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./NovoVeiculo.module.css";
import {useEffect, useState} from "react";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";

export default function NovoVeiculo() {
    const [renavam, setRenavam] = useState("");
    const [erroRenavam, setErroRenavam] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);


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



    function validarRenavam(valor) {
        const renavamLimpo = valor.replace(/\D/g, "").padStart(11, "0");

        let soma = 0;
        let peso = 2;

        for (let i = 10; i >= 0; i--) {
            soma += parseInt(renavamLimpo[i]) * peso;
            peso++;
            if (peso > 9) peso = 2;
        }

        const resto = soma % 11;
        const digito = resto === 0 || resto === 1 ? 0 : 11 - resto;

        return digito === parseInt(renavamLimpo[10]);
    }

    function handleRenavam(e) {
        const valor = e.target.value;
        setRenavam(valor);

        if (valor.length >= 9) {
            if (!validarRenavam(valor)) {
                setErroRenavam("RENAVAM inválido");
            } else {
                setErroRenavam("");
            }
        } else {
            setErroRenavam("");
        }
    }

    return (
        <>
            <Header/>
        <div className={css.layout}>
            <SidebarMenu />

            <main className={css.main}>
                <h1 className={css.titulo}>Adicionar Novo Veículo</h1>
                <p className={css.subtitulo}>
                    Insira os dados técnicos e comerciais para disponibilizar o veículo no estoque.
                </p>

                {/* FOTO */}
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

                {/* FORM */}
                <div className={css.grid}>
                    <div className={css.box}>
                        <h3>Informações Básicas</h3>

                        <input placeholder="Marca" />
                        <input placeholder="Modelo" />

                        <div className={css.row}>
                            <input placeholder="Ano Fabricação" />
                            <input placeholder="Ano Modelo" />
                        </div>

                        <input placeholder="Documento" />
                    </div>

                    <div className={css.box}>
                        <h3>Detalhes Técnicos</h3>

                        <div className={css.row}>
                            <input placeholder="KM" />
                            <input placeholder="Combustível" />
                        </div>

                        <div className={css.row}>
                            <input placeholder="Câmbio" />
                            <input placeholder="Cor" />
                        </div>

                        <input placeholder="Placa" />

                        <input
                            placeholder="Renavam"
                            value={renavam}
                            onChange={handleRenavam}
                            className={erroRenavam ? css.erroInput : ""}
                        />

                        {erroRenavam && (
                            <span className={css.erro}>{erroRenavam}</span>
                        )}
                    </div>
                </div>

                {/* PREÇO */}
                <div className={css.box}>
                    <h3>Precificação</h3>

                    <div className={css.row}>
                        <input placeholder="Valor de Custo" />
                        <input placeholder="Valor de Venda" />
                    </div>
                </div>

                {/* BOTÕES */}
                <div className={css.actions}>
                    <button type="button" className={css.cancelar}>
                        Cancelar
                    </button>
                    <button type="button" className={css.salvar}>
                        Salvar Veículo
                    </button>
                </div>
            </main>
        </div>
            <Footer />
        </>
    );
}