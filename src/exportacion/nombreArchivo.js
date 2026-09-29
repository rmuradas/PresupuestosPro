const CARACTERES_INVALIDOS = /[/\\:*?"<>|]/g

export function sanitizarNombreArchivo(texto) {
  return texto.replace(CARACTERES_INVALIDOS, '-').trim()
}
