import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Dependencias from "./pages/Dependencias";
import Catalogo from "./pages/Catalogo";
import Solicitudes from "./pages/Solicitudes";
import Aprobaciones from "./pages/Aprobaciones";
import Oficios from "./pages/Oficios";
import Almacen from "./pages/Almacen";
import Presupuesto from "./pages/Presupuesto";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import Auditoria from "./pages/Auditoria";
import Configuracion from "./pages/Configuracion";

// HashRouter porque la app se sirve como archivo local dentro de Tauri
// (sin servidor con enrutamiento de historial real).
export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dependencias" element={<Dependencias />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
            <Route path="/aprobaciones" element={<Aprobaciones />} />
            <Route path="/oficios" element={<Oficios />} />
            <Route path="/almacen" element={<Almacen />} />
            <Route path="/presupuesto" element={<Presupuesto />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/auditoria" element={<Auditoria />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
