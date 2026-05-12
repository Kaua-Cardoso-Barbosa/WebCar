import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import Header from "../components/Header/Header.jsx";
import css from "./Dashboard.module.css";


export default function Dashboard() {
    return (
        <>
            <Header />
            <div className="container-fluid p-0">
                <div className="d-flex flex-column flex-md-row">
                    {/* Sidebar fixa ou colapsável no mobile */}
                    <SidebarMenu />

                    <main className="flex-grow-1 p-3 p-md-5 bg-light">
                        <h1 className="h4 fw-bold mb-5">Visão Geral</h1>

                        {/* Seção de Cards: 1 coluna no mobile, 2 no tablet, 4 no desktop */}
                        <section className="row g-4 mb-5">
                            {[
                                { label: "Saldo em Estoque", valor: "R$40000,00" },
                                { label: "Despesa", valor: "R$1000,00", acao: true },
                                { label: "Receita", valor: "R$5000,00", acao: true },
                                { label: "Saldo", valor: "R$4000,00" }
                            ].map((item, i) => (
                                <div className="col-12 col-sm-6 col-xl-3" key={i}>
                                    <div className="card h-100 border-0 shadow-sm p-3 border-radius-12">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <p className="text-muted small fw-bold mb-0">{item.label}</p>
                                            {item.acao && <button className="btn btn-primary btn-sm rounded-3">+</button>}
                                        </div>
                                        <h2 className="h4 fw-bolder mb-0">{item.valor}</h2>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Gráfico Responsivo */}
                        <section className="card border-0 shadow-sm p-4 mb-4 mx-auto" style={{ maxWidth: '800px' }}>
                            <h3 className="h6 fw-bold mb-4">Saldo</h3>
                            <div className="d-flex align-items-end justify-content-between flex-nowrap overflow-auto" style={{ height: '250px' }}>
                                {["JAN", "FEV", "MAR", "ABR", "MAIO", "JUN"].map((mes, index) => (
                                    <div className="text-center flex-grow-1" key={mes} style={{ minWidth: '50px' }}>
                                        <div className={`mx-auto rounded-top bg-primary opacity-${(index + 1) * 10}`}
                                             style={{ height: `${Math.random() * 200 + 50}px`, width: '80%' }}>
                                        </div>
                                        <span className="small text-muted fw-bold d-block mt-2">{mes}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Tabela Responsiva */}
                        <section className="card border-0 shadow-sm overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">TIPO</th>
                                        <th>DESCRIÇÃO</th>
                                        <th>VALOR</th>
                                        <th className="pe-4 text-end">AÇÕES</th>
                                    </tr>
                                    </thead>
                                    <tbody className="align-middle">
                                    <tr>
                                        <td className="ps-4 fw-bold">Despesa</td>
                                        <td>Gasto com Pneus</td>
                                        <td>R$:100,00</td>
                                        <td className="pe-4 text-end">
                                            <button className="btn btn-link text-dark p-0">✎</button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
