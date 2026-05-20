use ignore::WalkBuilder;

#[tauri::command]
fn get_dir_paths(dir_path: String) -> Result<Vec<String>, String> {
    let base = std::path::Path::new(&dir_path);

    let mut paths: Vec<String> = WalkBuilder::new(base)
        .hidden(true)
        .git_ignore(true)
        .git_global(true)
        .git_exclude(true)
        .build()
        .filter_map(|e| e.ok())
        .filter(|e| e.depth() > 0)
        .filter_map(|e| {
            let is_dir = e.file_type().map(|ft| ft.is_dir()).unwrap_or(false);
            let rel = e
                .path()
                .strip_prefix(base)
                .ok()
                .map(|p| p.to_string_lossy().to_string())?;
            if rel.is_empty() {
                return None;
            }
            if is_dir {
                Some(format!("{}/", rel))
            } else {
                Some(rel)
            }
        })
        .collect();

    paths.sort();
    Ok(paths)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_dir_paths])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
