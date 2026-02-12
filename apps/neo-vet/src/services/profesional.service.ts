import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface Profesional {
    id?: number
    nombre: string
    primerapellido?: string
    segundoapellido?: string
    especialidad?: string
    cedula?: string
    activo?: string
}

export const profesionalService = {
    async getProfesionales() {
        const response = await peticionService.obtenerGet('profesional')
        return Array.isArray(response) ? response : (response?.data || [])
    },

    async getProfesional(id: number) {
        return await peticionService.obtenerGet(`profesional/${id}`)
    }
}
