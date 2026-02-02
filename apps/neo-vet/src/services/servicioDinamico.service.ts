import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface ServicioDefinicion {
    id?: number
    identificador: string
    descripcion?: string
    nombre?: string
    icono?: string
    activo: string // 'S' o 'N'
    id_configuracion: number
    id_plantilla?: number
}

export interface ServicioSeccion {
    id_seccion?: number
    id_servicio_def: number
    titulo: string
    orden: number
}

export interface ServicioCampo {
    id_campo?: number
    id_seccion: number
    nombre_interno: string
    label: string
    tipo_dato: string
    placeholder?: string
    hint?: string
    requerido: boolean
    cols: number
    orden: number
    icono?: string
    datasource?: string
    opciones_json?: string
    configuracion_extra_json?: string
}

export const servicioDinamicoService = {
    // --- SERVICIOS DEFINICION ---
    async getServicios() {
        const response = await peticionService.obtenerGet('servicio')
        return Array.isArray(response) ? response : (response?.data || [])
    },

    async createServicio(servicio: ServicioDefinicion) {
        return await peticionService.crear('servicio', servicio)
    },

    async updateServicio(id: number, servicio: ServicioDefinicion) {
        return await peticionService.actualizar('servicio', { ...servicio, id })
    },

    async deleteServicio(id: number) {
        await peticionService.eliminar('servicio', { id }, false)
    },

    // --- SECCIONES ---
    async getSecciones(idServicio: number) {
        const response = await peticionService.obtenerGet(`servicio/${idServicio}/secciones`)
        return Array.isArray(response) ? response : (response?.data || [])
    },

    async createSeccion(seccion: ServicioSeccion) {
        return await peticionService.crear('servicios-secciones', seccion)
    },

    async updateSeccion(id: number, seccion: ServicioSeccion) {
        return await peticionService.actualizar('servicios-secciones', { ...seccion, id })
    },

    async deleteSeccion(id: number) {
        await peticionService.eliminar('servicios-secciones', { id }, false)
    },

    // --- CAMPOS ---
    async getCampos(idSeccion: number) {
        const response = await peticionService.obtenerGet(`servicios-secciones/${idSeccion}/campos`)
        return Array.isArray(response) ? response : (response?.data || [])
    },

    async createCampo(campo: ServicioCampo) {
        return await peticionService.crear('servicios-campos', campo)
    },

    async updateCampo(id: number, campo: ServicioCampo) {
        return await peticionService.actualizar('servicios-campos', { ...campo, id })
    },

    async deleteCampo(id: number) {
        await peticionService.eliminar('servicios-campos', { id }, false)
    }
}
