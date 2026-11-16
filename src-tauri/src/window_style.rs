use std::mem::size_of_val;
use tauri::Manager;
use windows_sys::Win32::Graphics::Dwm::{
    DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_ROUND,
};

pub fn apply(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_webview_window("main").ok_or("main window not found")?;
    let hwnd = window.hwnd()?.0;
    let corner = DWMWCP_ROUND;
    // DWMWA_COLOR_NONE suppresses the native one-pixel border.
    let border: u32 = 0xfffffffe;

    // DWM clips the entire native window, including its Acrylic backdrop.
    // Both attributes require Windows 11; older versions keep their default frame.
    unsafe {
        let result = DwmSetWindowAttribute(
            hwnd,
            DWMWA_WINDOW_CORNER_PREFERENCE as u32,
            (&corner as *const i32).cast(),
            size_of_val(&corner) as u32,
        );
        if result < 0 {
            eprintln!("Could not set native window corners: {result:#x}");
        }
        let result = DwmSetWindowAttribute(
            hwnd,
            DWMWA_BORDER_COLOR as u32,
            (&border as *const u32).cast(),
            size_of_val(&border) as u32,
        );
        if result < 0 {
            eprintln!("Could not hide native window border: {result:#x}");
        }
    }
    Ok(())
}
