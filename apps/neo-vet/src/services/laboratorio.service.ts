import PeticionService from 'src/services/peticion.service'

class LaboratorioService {
  private resource = 'laboratorio/ordenes'
  private peticion = new PeticionService()

  async obtenerOrdenes() {
    return await this.peticion.obtenerGet(this.resource)
  }

  async obtenerOrden(id: string | number) {
    return await this.peticion.obtenerGet(this.resource, { id })
  }

  async crearOrden(orden: any) {
    return await this.peticion.crear(this.resource, orden)
  }

  async actualizarOrden(orden: any) {
    return await this.peticion.actualizar(this.resource, orden)
  }

  async guardarResultados(id: string | number, datos: any) {
    const endpoint = `${this.resource}/${id}/resultados`

    try {
      return await this.peticion.actualizar(endpoint, datos)
    } catch (err: any) {
      const status = err?.response?.status || err?.status
      if (status === 404 || String(err?.message).includes('404')) {
        return await this.actualizarOrden({ id, ...datos })
      }
      throw err
    }
  }

  async eliminarOrden(orden: any) {
    return await this.peticion.eliminar(this.resource, orden)
  }
}

export default new LaboratorioService()
