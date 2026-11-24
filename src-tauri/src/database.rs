use sqlx::{sqlite::SqliteConnectOptions, Connection, SqliteConnection};
use tauri::{plugin, Manager, Runtime};

pub(crate) fn migration_compatibility<R: Runtime>() -> plugin::TauriPlugin<R> {
    plugin::Builder::new("sqlite-migration-compatibility")
        .setup(|app, _| {
            let path = app.path().app_config_dir()?.join("utility.db");
            if path.try_exists()? {
                tauri::async_runtime::block_on(normalize_migration_checksum(
                    SqliteConnectOptions::new().filename(path),
                ))?;
            }
            Ok(())
        })
        .build()
}

async fn normalize_migration_checksum(options: SqliteConnectOptions) -> Result<(), sqlx::Error> {
    let mut db = SqliteConnection::connect_with(&options).await?;
    let has_migrations = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '_sqlx_migrations')",
    )
    .fetch_one(&mut db)
    .await?;
    if has_migrations {
        // v0.1.0 shipped migration 2 with CRLF. Both copies execute identical SQL.
        sqlx::query(
            "UPDATE _sqlx_migrations
             SET checksum = X'AA2F2766BDC3F25776584AF89F5D8A7DE750C52E2CA5BEC73442CF6B1B21BC9D0D22FB516B36711CA894EC2C9AAD51F0'
             WHERE version = 2 AND success = 1
               AND checksum = X'8938EAFED3B9BB29A1587E5CBA9DBC33AE0C18E42C881E11FC51DA0D6A580FCE8D76AED5EB90675ADD2751695080905F'",
        )
        .execute(&mut db)
        .await?;
    }
    db.close().await
}
