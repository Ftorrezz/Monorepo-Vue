import { api } from 'src/boot/axios'
import { Prueba, CreatePrueba, PaginatedResponse } from 'src/types/laboratorio-catalogo'

class PruebasService {
  private resource = 'laboratorio/pruebas'

  // Obtener todas las pruebas
  async obtenerPruebas(page: number = 1, limit: number = 50) {
    return await api.get<PaginatedResponse<Prueba>>(`${this.resource}`, {
      params: { page, limit }
    })
  }

  // Obtener pruebas por estudio
  async obtenerPorEstudio(idEstudio: number) {
    return await api.get<Prueba[]>(`${this.resource}/estudio/${idEstudio}`)
  }

  // Obtener una prueba por ID
  async obtenerPrueba(id: number) {
    return await api.get<Prueba>(`${this.resource}/${id}`)
  }

  // Buscar pruebas por término
  async buscarPruebas(termino: string) {
    return await api.get<Prueba[]>(`${this.resource}/search`, {
      params: { q: termino }
    })
  }

  // Obtener pruebas activas
  async obtenerActivas() {
    return await api.get<Prueba[]>(`${this.resource}?estado=activo`)
  }

  // Crear prueba
  async crearPrueba(prueba: CreatePrueba) {
    return await api.post<Prueba>(`${this.resource}`, prueba)
  }

  // Crear múltiples pruebas para un estudio
  async crearMultiples(idEstudio: number, pruebas: CreatePrueba[]) {
    return await api.post<Prueba[]>(`${this.resource}/estudio/${idEstudio}/batch`, {
      pruebas
    })
  }

  // Actualizar prueba
  async actualizarPrueba(id: number, prueba: Partial<CreatePrueba>) {
    return await api.put<Prueba>(`${this.resource}/${id}`, prueba)
  }

  // Eliminar prueba
  async eliminarPrueba(id: number) {
    return await api.delete(`${this.resource}/${id}`)
  }

  // Desactivar prueba
  async desactivarPrueba(id: number) {
    return await api.patch<Prueba>(`${this.resource}/${id}/desactivar`, {})
  }
}

export default new PruebasService()
