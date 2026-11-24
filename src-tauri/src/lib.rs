mod database;
mod tray;

use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg(target_os = "windows")]
mod window_style;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![tray::finish_quit])
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(tray::setup)
        .plugin(database::migration_compatibility())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:utility.db", vec![Migration {
                    version: 1,
                    description: "create_notes",
                    sql: "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
                    kind: MigrationKind::Up,
                }, Migration {
                    version: 2,
                    description: "create_memos",
                    sql: include_str!("../migrations/002_create_memos.sql"),
                    kind: MigrationKind::Up,
                }])
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("failed to run desktop application");
}
