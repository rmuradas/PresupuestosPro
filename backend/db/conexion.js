import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const carpetaDatos = join(__dirname, '..', 'data')
const rutaBaseDatos = process.env.PRESUPUESTOSPRO_DB_PATH || join(carpetaDatos, 'presupuestospro.db')

mkdirSync(dirname(rutaBaseDatos), { recursive: true })

const db = new Database(rutaBaseDatos)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const migraciones = readFileSync(join(__dirname, 'migraciones.sql'), 'utf-8')
db.exec(migraciones)

export default db
