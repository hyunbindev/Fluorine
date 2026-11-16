import { existsSync } from 'node:fs'
import { delimiter, join } from 'node:path'
import { homedir } from 'node:os'
import { createRequire } from 'node:module'

// Existing terminals may still have the PATH from before Rust was installed.
const cargoHome = process.env.CARGO_HOME || join(homedir(), '.cargo')
const cargoBin = join(cargoHome, 'bin')
if (existsSync(join(cargoBin, process.platform === 'win32' ? 'cargo.exe' : 'cargo'))) {
  process.env.PATH = `${cargoBin}${delimiter}${process.env.PATH || ''}`
}

const require = createRequire(import.meta.url)
const cli = require('@tauri-apps/cli')
cli.run(process.argv.slice(2), 'npm run tauri').catch((error) => {
  cli.logError(error.message)
  process.exitCode = 1
})
