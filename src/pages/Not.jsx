import { Link } from "react-router-dom";
import css from "./Not.module.css";
import Footer from "../components/Footer/Footer.jsx";
import Header from "../components/Header/Header.jsx";

export default function Not() {
    return (
        <>
            <Header />
            <main className={css.container}>
                <div className={css.card}>
                    <h1 className={css.codigo}>404</h1>
                    <h2 className={css.titulo}>Página não encontrada</h2>
                    <p className={css.texto}>
                        Parece que a página que está procurando não foi encontrada, deseja ir para a página inicial ?
                    </p>

                    <Link to="/" className={css.botao}>
                        Voltar para o início
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}