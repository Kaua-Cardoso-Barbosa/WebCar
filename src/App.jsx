import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.jsx"
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
import Not from "./pages/Not.jsx"

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