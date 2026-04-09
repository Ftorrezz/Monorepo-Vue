import { api } from 'src/boot/axios'
import { ValorReferencia, CreateValorReferencia, Especie, Sexo, PaginatedResponse } from 'src/types/laboratorio-catalogo'

class ValoresReferenciaService {
  private resource = 'laboratorio/valores-referencia'

  // Obtener todos los valores de referencia con filtros
  async obtenerValores(
    filters?: {
      idPrueba?: number
      especie?: Especie
      sexo?: Sexo
      page?: number
      limit?: number
    }
  ) {
    return await api.get<PaginatedResponse<ValorReferencia>>(`${this.resource}`, {
      params: filters
    })
  }

  // Obtener valores de referencia por prueba y especie
  async obtenerPorPruebaYEspecie(idPrueba: number, especie: Especie) {
    return await api.get<ValorReferencia[]>(
      `${this.resource}/prueba/${idPrueba}/especie/${especie}`
    )
  }

  // Obtener valor de referencia específico con todas las condiciones
  // Útil para validar resultados: ¿es normal este valor?
  async obtenerValorAplicable(
    idPrueba: number,
    especie: Especie,
    edad?: number,
    peso?: number,
    sexo?: Sexo
  ) {
    return await api.get<ValorReferencia | null>(
      `${this.resource}/buscar`,
      {
        params: {
          idPrueba,
          especie,
          edad,
          peso,
          sexo
        }
      }
    )
  }

  // Obtener todas las especies disponibles
  async obtenerEspecies() {
    return await api.get<string[]>(`${this.resource}/especies`)
  }

  // Obtener todos los sexos
  async obtenerSexos() {
    return await api.get<string[]>(`${this.resource}/sexos`)
  }

  // Crear valor de referencia
  async crearValor(valor: CreateValorReferencia) {
    return await api.post<ValorReferencia>(`${this.resource}`, valor)
  }

  // Crear múltiples valores (para importacion)
  async crearMultiples(valores: CreateValorReferencia[]) {
    return await api.post<{ creados: number; errores: string[] }>(
      `${this.resource}/batch`,
      { valores }
    )
  }

  // Actualizar valor de referencia
  async actualizarValor(id: number, valor: Partial<CreateValorReferencia>) {
    return await api.put<ValorReferencia>(`${this.resource}/${id}`, valor)
  }

  // Eliminar valor de referencia
  async eliminarValor(id: number) {
    return await api.delete(`${this.resource}/${id}`)
  }

  // Importar desde CSV
  async importarCSV(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return await api.post<{ importados: number; errores: string[] }>(
      `${this.resource}/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }

  // Exportar a CSV
  async exportarCSV(filters?: { especie?: Especie; sexo?: Sexo }) {
    return await api.get(`${this.resource}/export`, {
      params: filters,
      responseType: 'blob'
    })
  }

  // Validar un resultado contra valores de referencia
  async validarResultado(idPrueba: number, valor: number, especie: Especie, edad?: number, peso?: number, sexo?: Sexo) {
    return await api.post<{
      esValido: boolean
      estado: 'normal' | 'alerta_baja' | 'alerta_alta' | 'critico_bajo' | 'critico_alto'
      mensaje: string
      rango: { minimo: number; maximo: number }
    }>(`${this.resource}/validar`, {
      idPrueba,
      valor,
      especie,
      edad,
      peso,
      sexo
    })
  }
}

export default new ValoresReferenciaService()
