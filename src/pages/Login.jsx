import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [geoAllowed, setGeoAllowed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({ usuario: "", password: "", dependencia: "" });

  const canSubmit =
    form.usuario.trim().length > 0 &&
    form.password.length >= 8 &&
    form.dependencia.length > 0 &&
    geoAllowed;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    // Vista únicamente: no hay validación real de credenciales.
    navigate("/dashboard");
  }

  return (
    <div className="login-screen">
      <div className="login-visual">
        <div className="mark">GI</div>
        <h2>Sistema Integral de Control de Insumos Gubernamentales</h2>
        <div className="quote">
          "Cada folio, cada firma, cada movimiento — trazable de principio a fin."
        </div>
      </div>

      <div className="login-form-wrap">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h1>Iniciar sesión</h1>
          <p className="lede">Ingresa con tu usuario institucional para continuar.</p>

          <div className="geo-notice">
            📍
            <div>
              Este sistema requiere autorizar tu ubicación para validar el acceso.
              <br />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setGeoAllowed(true)}
              >
                {geoAllowed ? "Ubicación autorizada ✓" : "Autorizar ubicación"}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Usuario o número de empleado</label>
            <input
              className="input"
              placeholder="EMP-04821"
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <div className="password-field">
              <input
                className="input"
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPass((s) => !s)}>
                {showPass ? "OCULTAR" : "MOSTRAR"}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Dependencia</label>
            <select
              className="input"
              value={form.dependencia}
              onChange={(e) => setForm({ ...form, dependencia: e.target.value })}
            >
              <option value="">Selecciona tu dependencia…</option>
              <option>Secretaría de Obras y Servicios</option>
              <option>Sistema para el Desarrollo Integral de la Familia</option>
              <option>Seguridad Pública y Vialidad</option>
              <option>Contraloría Interna</option>
            </select>
          </div>

          {touched && !canSubmit && (
            <div className="form-error">
              Completa usuario, contraseña (8+ caracteres), dependencia y autoriza la ubicación.
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "11px 0" }}
          >
            Iniciar sesión
          </button>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <a href="#" style={{ fontSize: 12.5, color: "var(--muted)" }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
