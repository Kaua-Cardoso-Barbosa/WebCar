import css from "./Dashboard.module.css";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import Header from "../components/Header/Header.jsx";
import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.dashboard}>
                    <h1 className={css.titulo}>Visão Geral</h1>

                    <section className={css.cards}>
                        <div className={css.card}>
                            <p>Saldo em Estoque</p>
                            <h2>R$40000,00</h2>
                        </div>

                        <div className={css.card}>
                            <div className={css.cardTop}>
                                <p>Despesa</p>
                                <button>+</button>
                            </div>
                            <h2>R$1000,00</h2>
                        </div>

                        <div className={css.card}>
                            <div className={css.cardTop}>
                                <p>Receita</p>
                                <button>+</button>
                            </div>
                            <h2>R$5000,00</h2>
                        </div>

                        <div className={css.card}>
                            <p>Saldo</p>
                            <h2>R$4000,00</h2>
                        </div>
                    </section>

                    <section className={css.chartSection}>
                        <h3>Saldo</h3>

                        <div className={css.chart}>
                            {["JAN", "FEV", "MAR", "ABR", "MAIO", "JUN"].map((mes, index) => (
                                <div className={css.barGroup} key={mes}>
                                    <div className={`${css.bar} ${css[`bar${index + 1}`]}`}></div>
                                    <span>{mes}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={css.tableSection}>
                        <table>
                            <thead>
                                <tr>
                                    <th>TIPO</th>
                                    <th>DESCRIÇÃO</th>
                                    <th>VALOR</th>
                                    <th>AÇÕES</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>Despesa</td>
                                    <td>Gasto com Pneus</td>
                                    <td>R$:100,00</td>
                                    <td>
                                        <button className={css.actionBtn}>✎</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
}