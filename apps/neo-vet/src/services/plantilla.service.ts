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
    async getPlantillas() {
        const response = await peticionService.obtenerGet('plantilla')
        return Array.isArray(response) ? response : (response?.data || [])
    },

    async getPlantilla(id: number) {
        return await peticionService.obtenerGet(`plantilla/${id}`)
    },

    async getPlantillaPorCodigo(codigo: string) {
        return await peticionService.obtenerGet(`plantilla/codigo/${codigo}`)
    },

    async getPlantillasPorModulo(modulo: string) {
        const response = await peticionService.obtenerGet(`plantilla/modulo/${modulo}`)
        return Array.isArray(response) ? response : (response?.data || [])
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
