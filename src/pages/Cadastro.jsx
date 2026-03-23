import "./Cadastro.module.css"
import css from "./Cadastro.module.css"
import Header from "../components/Header/Header";

export default function Cadastro() {
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
                        <form className={css.formularioCadastro}>
                            <div className={css.grupoCampo}>
                                <label className={css.rotuloCampo}>Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome completo"
                                    className={css.inputCadastro}
                                />
                            </div>

                            <div className={css.grupoCampo}>
                                <label className={css.rotuloCampo}>Telefone</label>
                                <input
                                    type="text"
                                    placeholder="(19) 98847-3521"
                                    className={css.inputCadastro}
                                />
                            </div>

                            <div className={css.grupoCampo}>
                                <label className={css.rotuloCampo}>E-mail</label>
                                <input
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    className={css.inputCadastro}
                                />
                            </div>

                            <div className={css.linhaSenha}>
                                <div className={css.grupoCampo}>
                                    <label className={css.rotuloCampo}>Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className={css.inputCadastro}
                                    />
                                </div>

                                <div className={css.grupoCampo}>
                                    <label className="rotulo-campo">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className={css.inputCadastro}
                                    />
                                </div>
                            </div>

                            <div className={"p-5 text-center mb-3" + css.uploadArea}>
                                <div className="mb-3">
                                    <span className="material-symbols-outlined fs-1 text-secondary">
                                        upload
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-light border px-4 py-2 fw-semibold"
                                >
                                    Selecionar Fotos
                                </button>
                            </div>

                            <button type="submit" className={css.botaoCadastro}>
                                Criar Minha Conta
                            </button>

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