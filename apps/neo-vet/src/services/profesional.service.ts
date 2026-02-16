import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface Profesional {
    id?: number
    nombre: string
    primerapellido?: string
    segundoapellido?: string
    especialidad?: string
    cedula?: string
    id_tipoprofesional?: number | any
    tipoprofesional?: any
    email?: string
    telefono1?: string
    telefono2?: string
    observaciones?: string
    // Dirección
    id_pais?: number | any
    id_estado?: number | any
    id_municipio?: number | any
    id_colonia?: number | any
    calle?: string
    exterior?: string
    interior?: string
    codigopostal?: string

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
