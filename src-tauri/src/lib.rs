use walkdir::WalkDir;

#[tauri::command]
fn get_dir_paths(dir_path: String) -> Result<Vec<String>, String> {
    let base = std::path::Path::new(&dir_path);

    let mut paths: Vec<String> = WalkDir::new(base)
        .min_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            // Skip hidden entries
            !e.file_name().to_string_lossy().starts_with('.')
        })
        .filter_map(|e| {
            let is_dir = e.file_type().is_dir();
            let rel = e
                .path()
                .strip_prefix(base)
                .ok()
                .map(|p| p.to_string_lossy().to_string())?;
            // Append trailing slash for directories so @pierre/trees can
            // distinguish empty directories from files.
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
