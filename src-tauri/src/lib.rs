use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg(target_os = "windows")]
mod window_style;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "windows")]
            window_style::apply(app)?;
            Ok(())
        })
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:utility.db", vec![Migration {
                    version: 1,
                    description: "create_notes",
                    sql: "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
                    kind: MigrationKind::Up,
                }])
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("failed to run desktop application");
}
