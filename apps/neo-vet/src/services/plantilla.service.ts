import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface Plantilla {
    id?: number
    codigo: string
    nombre: string
    descripcion?: string
    icono?: string
    color?: string
    contenido_html: string
    activo: string
    requiere_firma: string
    incluir_logo: string
    tamano_papel: string
    orientacion: string
    variables?: PlantillaVariable[]
}

export interface PlantillaVariable {
    id?: number
    id_plantilla: number
    nombre: string
    etiqueta: string
    tipo_dato: string
    requerido: string
    valor_defecto?: string
    descripcion?: string
    orden: number
}

export const plantillaService = {
    extraerElementos(response: any): any[] {
        if (Array.isArray(response) && response.length > 0 && response[0].elemento) {
            return response[0].elemento
        }
        if (response && response.elemento) {
            return response.elemento
        }
        return Array.isArray(response) ? response : (response?.data || [])
    },

    extraerElementoUnico(response: any): any {
        const elementos = this.extraerElementos(response)
        return elementos.length > 0 ? elementos[0] : null
    },

    async getPlantillas() {
        const response = await peticionService.obtenerGet('plantilla')
        return this.extraerElementos(response)
    },

    async getPlantilla(id: number) {
        const response = await peticionService.obtenerGet(`plantilla/${id}`)
        return this.extraerElementoUnico(response)
    },

    async getPlantillaPorCodigo(codigo: string) {
        const response = await peticionService.obtenerGet(`plantilla/codigo/${codigo}`)
        return this.extraerElementoUnico(response)
    },

    async getPlantillasPorModulo(modulo: string) {
        const response = await peticionService.obtenerGet(`plantilla/modulo/${modulo}`)
        return this.extraerElementos(response)
    },

    async createPlantilla(plantilla: Plantilla) {
        return await peticionService.crear('plantilla', plantilla)
    },

    async updatePlantilla(id: number, plantilla: Plantilla) {
        return await peticionService.actualizar('plantilla', { ...plantilla, id })
    },

    async deletePlantilla(id: number) {
        await peticionService.eliminar('plantilla', { id }, false)
    }
}
