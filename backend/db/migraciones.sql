CREATE TABLE IF NOT EXISTS perfil (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nombre TEXT NOT NULL,
  nif TEXT NOT NULL,
  contacto TEXT NOT NULL,
  logo TEXT
);

CREATE TABLE IF NOT EXISTS servicios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio_por_defecto_centimos INTEGER NOT NULL CHECK (precio_por_defecto_centimos > 0)
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  nif TEXT NOT NULL,
  contacto TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa_autonomo', 'particular'))
);

CREATE TABLE IF NOT EXISTS presupuestos (
  id TEXT PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  fecha_emision TEXT NOT NULL,
  fecha_validez TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_nif TEXT NOT NULL,
  cliente_contacto TEXT NOT NULL,
  cliente_tipo TEXT NOT NULL CHECK (cliente_tipo IN ('empresa_autonomo', 'particular')),
  retencion_activa INTEGER NOT NULL DEFAULT 0 CHECK (retencion_activa IN (0, 1)),
  retencion_porcentaje INTEGER,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado'))
);

CREATE TABLE IF NOT EXISTS presupuesto_lineas (
  id TEXT PRIMARY KEY,
  presupuesto_id TEXT NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  precio_unitario_centimos INTEGER NOT NULL CHECK (precio_unitario_centimos > 0),
  servicio_origen_id TEXT
);

CREATE TABLE IF NOT EXISTS contador_anual (
  anio INTEGER PRIMARY KEY,
  ultimo_numero_usado INTEGER NOT NULL DEFAULT 0
);
