import { api } from 'src/boot/axios'
import { Estudio, CreateEstudio, PaginatedResponse } from 'src/types/laboratorio-catalogo'

class EstudiosService {
  private resource = 'laboratorio/estudios'

  // Obtener todos los estudios (con paginación)
  async obtenerEstudios(page: number = 1, limit: number = 20) {
    return await api.get<PaginatedResponse<Estudio>>(`${this.resource}`, {
      params: { page, limit }
    })
  }

  // Obtener un estudio por ID
  async obtenerEstudio(id: number) {
    return await api.get<Estudio>(`${this.resource}/${id}`)
  }

  // Buscar estudios por término
  async buscarEstudios(termino: string) {
    return await api.get<Estudio[]>(`${this.resource}/search`, {
      params: { q: termino }
    })
  }

  // Obtener estudios por categoría
  async obtenerPorCategoria(categoria: string) {
    return await api.get<Estudio[]>(`${this.resource}/categoria/${categoria}`)
  }

  // Obtener estudios activos
  async obtenerActivos() {
    return await api.get<Estudio[]>(`${this.resource}?estado=activo`)
  }

  // Crear estudio
  async crearEstudio(estudio: CreateEstudio) {
    return await api.post<Estudio>(`${this.resource}`, estudio)
  }

  // Actualizar estudio
  async actualizarEstudio(id: number, estudio: Partial<CreateEstudio>) {
    return await api.put<Estudio>(`${this.resource}/${id}`, estudio)
  }

  // Eliminar estudio
  async eliminarEstudio(id: number) {
    return await api.delete(`${this.resource}/${id}`)
  }

  // Desactivar estudio (soft delete)
  async desactivarEstudio(id: number) {
    return await api.patch<Estudio>(`${this.resource}/${id}/desactivar`, {})
  }

  // Importar estudios desde CSV
  async importarCSV(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return await api.post<{ importados: number; errores: string[] }>(`${this.resource}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // Exportar estudios a CSV
  async exportarCSV() {
    return await api.get(`${this.resource}/export`, { responseType: 'blob' })
  }

  // Obtener estadísticas
  async obtenerEstadisticas() {
    return await api.get(`${this.resource}/estadisticas`)
  }
}

export default new EstudiosService()
