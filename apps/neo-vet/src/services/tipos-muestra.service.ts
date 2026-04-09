import { api } from 'src/boot/axios'
import { TipoMuestra, CreateTipoMuestra, PaginatedResponse } from 'src/types/laboratorio-catalogo'

class TiposMuestraService {
  private resource = 'laboratorio/tipos-muestra'

  // Obtener todos los tipos de muestra
  async obtenerTipos(page: number = 1, limit: number = 20) {
    return await api.get<PaginatedResponse<TipoMuestra>>(`${this.resource}`, {
      params: { page, limit }
    })
  }

  // Obtener un tipo de muestra
  async obtenerTipo(id: number) {
    return await api.get<TipoMuestra>(`${this.resource}/${id}`)
  }

  // Obtener por código
  async obtenerPorCodigo(codigo: string) {
    return await api.get<TipoMuestra>(`${this.resource}/codigo/${codigo}`)
  }

  // Buscar tipos de muestra
  async buscarTipos(termino: string) {
    return await api.get<TipoMuestra[]>(`${this.resource}/search`, {
      params: { q: termino }
    })
  }

  // Obtener tipos activos
  async obtenerActivos() {
    return await api.get<TipoMuestra[]>(`${this.resource}?estado=activo`)
  }

  // Crear tipo de muestra
  async crearTipo(tipo: CreateTipoMuestra) {
    return await api.post<TipoMuestra>(`${this.resource}`, tipo)
  }

  // Actualizar tipo de muestra
  async actualizarTipo(id: number, tipo: Partial<CreateTipoMuestra>) {
    return await api.put<TipoMuestra>(`${this.resource}/${id}`, tipo)
  }

  // Eliminar tipo de muestra
  async eliminarTipo(id: number) {
    return await api.delete(`${this.resource}/${id}`)
  }

  // Desactivar tipo de muestra
  async desactivarTipo(id: number) {
    return await api.patch<TipoMuestra>(`${this.resource}/${id}/desactivar`, {})
  }

  // Importar desde CSV
  async importarCSV(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return await api.post<{ importados: number; errores: string[] }>(`${this.resource}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Exportar a CSV
  async exportarCSV() {
    return await api.get(`${this.resource}/export`, { responseType: 'blob' })
  }
}

export default new TiposMuestraService()
