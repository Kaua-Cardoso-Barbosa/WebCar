import css from "./Banner.module.css";
import { Link } from "react-router-dom";

export default function Banner() {
    return (
        <section className={css.banner}>
            <div className={css.bannerMedia}>
                <img
                    src="/Banner.png"
                    alt="Carro em destaque"
                    className={css.bannerImg}
                />

                <div className={css.bannerOverlay}></div>

                <div className={css.bannerContent}>
                    <h1>Escolha com confiança. Compre com segurança.</h1>

                    <p>
                        Veículos anunciados com dados claros, fotos reais e agendamento direto para você conhecer antes de fechar negócio.
                    </p>

                    <div className={css.acoes}>
                        <Link to="/catalogo" className={css.primario}>
                            Ver catálogo
                        </Link>
                        <Link to="/Login" className={css.secundario}>
                            Entrar
                        </Link>
                    </div>

                    <div className={css.provas}>
                        <span>Atendimento consultivo</span>
                        <span>Visita agendada</span>
                        <span>Dados conferidos</span>
                    </div>
                </div>

                <div className={css.painel}>
                    <strong>Compra mais tranquila</strong>
                    <span>Compare modelos, veja detalhes e fale com a loja em poucos cliques.</span>
                </div>
            </div>
        </section>
    );
}
