fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("erro ao abrir River Raid");
}
