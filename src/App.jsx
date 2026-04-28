import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 👇 SUA API GLOBAL (fica aqui)
export const API_URL = "http://localhost:5000";

// 👇 seus imports de páginas
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import RecuperarSenhaEmail from "./pages/RecuperarSenhaEmail.jsx";
import VerificarEmailSenha from "./pages/VerificarEmailSenha.jsx";
import TrocarSenha from "./pages/TrocarSenha.jsx";
import VerificarEmailConta from "./pages/VerificarEmailConta.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import Restrita from "./pages/Restrita.jsx";
import RestritaAdm from "./pages/RestritaAdm.jsx";
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
                <Route path="/Visualizar" element={<Visualizar />} />
                <Route path="/VisualizarAdm" element={<VisualizarAdm />} />
                <Route path="/Agendar" element={<AgendarSuaVisita />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/garagem" element={<Garagem />} />
                <Route path="/Cadastroveiculo" element={<NovoVeiculo />} />
                <Route path="/EdicaoVeiculo" element={<EditarVeiculo />} />
                <Route path="/cadastrarservicos" element={<CadastrarServico />} />
                <Route path="/adicionarmanutencao" element={<AdicionarManutencao />} />
                <Route path="/editarmanutencao" element={<EditarManutencao />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/servicos" element={<Servicos />} />
                <Route path="/cadastrarmarca" element={<CadastrarMarca />} />

                <Route path="*" element={<Not />} />

                <Route
                    path="/restrita"
                    element={
                        <RotaProtegida
                            componente={<Restrita />}
                            tipoPermitido="2"
                        />
                    }
                />

                <Route
                    path="/restrita-adm"
                    element={
                        <RotaProtegida
                            componente={<RestritaAdm />}
                            tipoPermitido="0"
                        />
                    }
                />

                <Route
                    path="/restrita-vendedor"
                    element={
                        <RotaProtegida
                            componente={<RestritaVendedor />}
                            tipoPermitido="1"
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}