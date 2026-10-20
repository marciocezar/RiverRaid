// Janela do jogo. Toda a lógica roda no frontend (builds/web); aqui só abrimos a janela.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("não foi possível abrir a janela do River Raid");
}
