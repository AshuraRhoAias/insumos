// Este binario solo levanta la ventana de escritorio y sirve el frontend
// construido con Vite (dist/). No expone comandos de Tauri porque esta
// build es "solo vista": no hay lógica de backend real, todo vive en
// datos de ejemplo dentro del React app.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error al iniciar la aplicación de Tauri");
}
