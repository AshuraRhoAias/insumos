# SICIG — Vista (React + Vite + Tauri)

Vista de escritorio **solo frontend** del Sistema Integral de Control de
Insumos Gubernamentales, basada en `Sistema_Insumos_Descripcion_Modulos.pdf`.

No hay backend real: toda la información viene de `src/data/mockData.js`,
y las acciones (crear, aprobar, editar…) son solo de interfaz — no persisten
ni validan nada en un servidor. El objetivo es tener el "esqueleto" navegable
de los 13 módulos para validar flujos y diseño antes de construir la API real.

## Módulos incluidos

1. Login y autenticación (validaciones de campo + aviso de ubicación, simulado)
2. Dashboard (tarjetas y gráficas que cambian según el rol activo)
3. Dependencias y áreas
4. Catálogo de insumos (búsqueda, filtros, vista tarjetas/lista, detalle)
5. Solicitudes (carrito de insumos + listado con filtros de estado)
6. Aprobaciones (bandeja + panel de detalle con acciones)
7. Oficios y documentos (vista previa de folio/QR/hash)
8. Almacén e inventario (entregas, inventario, movimientos)
9. Presupuesto (semáforo de umbrales, tabla por dependencia)
10. Usuarios y roles (alta y listado)
11. Reportes (catálogo de reportes + gráfica de ejemplo)
12. Auditoría (bitácora con cadena de hashes)
13. Configuración (flujos de aprobación, alertas, catálogos)

Como es "solo vista", puedes cambiar el rol activo desde el selector en la
barra superior ("Ver como: ...") para ver cómo cambia el menú lateral y el
dashboard — esto simula lo que en el sistema real decide el token JWT.

## Requisitos

- Node.js 18+
- Rust + `cargo` (solo si vas a correr/compilar la app de escritorio con Tauri)
- Dependencias del sistema de Tauri para tu SO (WebView2 en Windows,
  WebKitGTK en Linux, nada adicional en macOS). Ver:
  https://tauri.app/v1/guides/getting-started/prerequisites

## Uso

Instalar dependencias:

```bash
npm install
```

Correr solo como app web (más rápido para iterar en el diseño):

```bash
npm run dev
```

Correr como app de escritorio con Tauri:

```bash
npx tauri dev
```

Compilar el instalador de escritorio:

```bash
npx tauri build
```

## Notas

- Los íconos en `src-tauri/icons/` son marcadores de posición. Genera los
  definitivos con `npx tauri icon ruta/a/tu/logo.png` (requiere un PNG
  cuadrado de al menos 1024×1024).
- El enrutamiento usa `HashRouter` porque la app se sirve como archivo local
  dentro de la ventana de Tauri.
- Cuando conectes el backend real: reemplaza los imports de
  `src/data/mockData.js` por llamadas a tu API, y usa `AppContext` para
  guardar el usuario/rol que venga del JWT en vez del selector manual.
