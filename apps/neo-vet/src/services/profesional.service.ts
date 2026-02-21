import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface Profesional {
    id?: number
    nombre: string
    primerapellido?: string
    segundoapellido?: string
    especialidad?: string
    cedula?: string
    id_genero?: number | any
    id_estadocivil?: number | any
    id_escolaridad?: number | any
    fechanacimiento?: string | null
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
    id_sitio?: number | any
    id_sucursal?: number | any
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
