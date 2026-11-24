use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Emitter, Manager, WindowEvent,
};

pub(crate) fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "windows")]
    crate::window_style::apply(app)?;

    let open = MenuItem::with_id(app, "open", "창 열기", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &quit])?;
    let icon = app.default_window_icon().ok_or("tray icon not found")?;
    TrayIconBuilder::new()
        .icon(icon.clone())
        .tooltip("Fluorine")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => show_main_window(app),
            "quit" => {
                if let Err(error) = app.emit_to("main", "tray-quit-requested", ()) {
                    eprintln!("Could not request app quit: {error}");
                    show_main_window(app);
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    let window = app
        .get_webview_window("main")
        .ok_or("main window not found")?;
    let main_window = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            if let Err(error) = main_window.hide() {
                eprintln!("Could not hide main window: {error}");
            }
        }
    });
    Ok(())
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if let Err(error) = window
            .unminimize()
            .and_then(|_| window.show())
            .and_then(|_| window.set_focus())
        {
            eprintln!("Could not restore main window: {error}");
        }
    }
}

#[tauri::command]
pub(crate) fn finish_quit(app: AppHandle, saved: bool) {
    if saved {
        app.exit(0);
    } else {
        show_main_window(&app);
    }
}
