import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const API_URL = "http://localhost:5000";

import EditarServico from "./pages/EditarServico.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import RecuperarSenhaEmail from "./pages/RecuperarSenhaEmail.jsx";
import VerificarEmailSenha from "./pages/VerificarEmailSenha.jsx";
import TrocarSenha from "./pages/TrocarSenha.jsx";
import VerificarEmailConta from "./pages/VerificarEmailConta.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import Restrita from "./pages/Restrita.jsx";
import RestritaVendedor from "./pages/RestritaVendedor.jsx";
import Not from "./pages/Not.jsx";
import Visualizar from "./pages/Visualizar.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import AdicionarManutencao from "./pages/AdicionarManutencao.jsx";
import VisualizarAdm from "./pages/VisualizarAdm.jsx";
import AgendarSuaVisita from "./pages/AgendeSuaVisita.jsx";
import Garagem from "./pages/Garagem.jsx";
import NovoVeiculo from "./pages/NovoVeiculo.jsx";
import EditarVeiculo from "./pages/EditarVeiculo.jsx";
import Servicos from "./pages/Servicos.jsx";
import CadastrarServico from "./pages/CadastrarServico.jsx";
import EditarManutencao from "./pages/EditarManutencao.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CadastrarMarca from "./pages/CadastrarMarca.jsx";
import AtualizarValores from "./pages/AtualizarValores.jsx";
import ListarMarcas from "./pages/ListarMarcas.jsx";
import EditarCliente from "./pages/EditarCliente.jsx";
import ListaUsuarios from "./pages/ListaUsuarios.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/recuperarSenhaEmail" element={<RecuperarSenhaEmail />} />
                <Route path="/verificarEmailSenha" element={<VerificarEmailSenha />} />
                <Route path="/trocarSenha" element={<TrocarSenha />} />
                <Route path="/verificarEmailConta" element={<VerificarEmailConta />} />
                <Route path="/Visualizar/:id" element={<Visualizar />} />
                <Route path="/not" element={<Not />} />
                <Route
                    path="/VisualizarAdm"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <VisualizarAdm />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/ListaUsuarios"
                    element={
                    <RotaProtegida tiposPermitidos={[0]}>
                        <ListaUsuarios />
                    </RotaProtegida>
                    }
                />

                <Route
                    path="/Agendar"
                    element={
                        <RotaProtegida>
                            <AgendarSuaVisita />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/garagem"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <Garagem />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/Cadastroveiculo"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <NovoVeiculo />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/EdicaoVeiculo"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarVeiculo />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/cadastrarservicos"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <CadastrarServico />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/adicionarmanutencao"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <AdicionarManutencao />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/editarmanutencao"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarManutencao />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/servicos"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <Servicos />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/cadastrarmarca"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <CadastrarMarca />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/atualizarvalores"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <AtualizarValores />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/editarservico/:id_servico"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarServico />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/editarcliente/:id_usuario"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarCliente />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/listarmarcas"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <ListarMarcas />
                        </RotaProtegida>
                    }
                />
                <Route path="*" element={<Not />} />

                <Route
                    path="/catalogo"
                    element={<Catalogo />}
                />

                <Route
                    path="/restrita"
                    element={
                        <RotaProtegida>
                            <Restrita />
                        </RotaProtegida>
                    }
                />


                <Route
                    path="/dashboard"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <Dashboard />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/restrita-vendedor"
                    element={
                        <RotaProtegida>
                            <RestritaVendedor />
                        </RotaProtegida>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}
