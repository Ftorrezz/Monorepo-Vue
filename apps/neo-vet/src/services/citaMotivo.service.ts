import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface CitaMotivo {
    id?: number
    nombre: string
    descripcion?: string
    activo?: string
}

export const citaMotivoService = {
    async getMotivos() {
        const response = await peticionService.obtenerGet('citamotivo')
        return Array.isArray(response) ? response : (response?.data || [])
    }
}
