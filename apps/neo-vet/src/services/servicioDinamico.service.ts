import { api } from 'src/boot/axios'

export interface ServicioDefinicion {
    id_servicio_def?: number
    codigo: string
    nombre: string
    descripcion?: string
    icono?: string
    activo: boolean
    id_sitio: number
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
        const { data } = await api.get<ServicioDefinicion[]>('/servicios-definicion')
        return data
    },

    async createServicio(servicio: ServicioDefinicion) {
        const { data } = await api.post<ServicioDefinicion>('/servicios-definicion', servicio)
        return data
    },

    async updateServicio(id: number, servicio: ServicioDefinicion) {
        const { data } = await api.put<ServicioDefinicion>(`/servicios-definicion/${id}`, servicio)
        return data
    },

    async deleteServicio(id: number) {
        await api.delete(`/servicios-definicion/${id}`)
    },

    // --- SECCIONES ---
    async getSecciones(idServicio: number) {
        const { data } = await api.get<ServicioSeccion[]>(`/servicios-definicion/${idServicio}/secciones`)
        return data
    },

    async createSeccion(seccion: ServicioSeccion) {
        const { data } = await api.post<ServicioSeccion>('/servicios-secciones', seccion)
        return data
    },

    async updateSeccion(id: number, seccion: ServicioSeccion) {
        const { data } = await api.put<ServicioSeccion>(`/servicios-secciones/${id}`, seccion)
        return data
    },

    async deleteSeccion(id: number) {
        await api.delete(`/servicios-secciones/${id}`)
    },

    // --- CAMPOS ---
    async getCampos(idSeccion: number) {
        const { data } = await api.get<ServicioCampo[]>(`/servicios-secciones/${idSeccion}/campos`)
        return data
    },

    async createCampo(campo: ServicioCampo) {
        const { data } = await api.post<ServicioCampo>('/servicios-campos', campo)
        return data
    },

    async updateCampo(id: number, campo: ServicioCampo) {
        const { data } = await api.put<ServicioCampo>(`/servicios-campos/${id}`, campo)
        return data
    },

    async deleteCampo(id: number) {
        await api.delete(`/servicios-campos/${id}`)
    }
}
