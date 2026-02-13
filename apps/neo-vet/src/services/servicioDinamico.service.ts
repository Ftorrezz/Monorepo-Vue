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
    id?: number
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
        const response = await peticionService.obtenerGet(`servicioseccion/${idServicio}/secciones`)
        return Array.isArray(response) ? response : (response?.data || [])
    },

    async createSeccion(seccion: ServicioSeccion) {
        return await peticionService.crear('servicioseccion', seccion)
    },

    async updateSeccion(id: number, seccion: ServicioSeccion) {
        return await peticionService.actualizar('servicioseccion', { ...seccion, id })
    },

    async deleteSeccion(id: number) {
        await peticionService.eliminar('servicioseccion', { id }, false)
    },

    // --- CAMPOS ---
    async getCampos(idSeccion: number) {
        const response = await peticionService.obtenerGet(`serviciocampos/${idSeccion}/campos`)

        // Fix para estructura anidada [{ elemento: [...] }]
        if (Array.isArray(response) && response.length > 0 && response[0]?.elemento && Array.isArray(response[0].elemento)) {
            return response[0].elemento
        }

        return Array.isArray(response) ? response : (response?.data || [])
    },

    async createCampo(campo: ServicioCampo) {
        return await peticionService.crear('serviciocampos', campo)
    },

    async updateCampo(id: number, campo: ServicioCampo) {
        return await peticionService.actualizar('serviciocampos', { ...campo, id })
    },

    async deleteCampo(id: number) {
        await peticionService.eliminar('serviciocampos', { id }, false)
    },

    // --- ESQUEMA COMPLETO ---
    async getEsquemaServicio(idServicio: number) {
        try {
            const response = await peticionService.obtenerGet(`servicio/${idServicio}`)
            // El servicio puede venir como { data: servicio } o directamente
            let servicio = response?.data || response
            // Si es un array, tomar el primer elemento
            if (Array.isArray(servicio)) {
                servicio = servicio[0]
            }

            const secciones = await this.getSecciones(idServicio)

            // Cargar campos para cada sección
            for (const seccion of secciones) {
                seccion.campos = await this.getCampos(seccion.id)
            }

            const esquema = {
                id: servicio.id,
                servicio: servicio.nombre,
                icono: servicio.icono || 'auto_awesome',
                descripcion: servicio.descripcion,
                identificador: servicio.identificador,
                id_plantilla: servicio.id_plantilla,
                secciones: secciones.map((sec: any) => ({
                    titulo: sec.titulo,
                    orden: sec.orden,
                    campos: sec.campos.map((campo: any) => ({
                        id: campo.nombre_interno,
                        label: campo.label,
                        tipo: campo.tipo_dato,
                        placeholder: campo.placeholder,
                        hint: campo.hint,
                        requerido: campo.requerido,
                        cols: campo.cols,
                        orden: campo.orden,
                        icono: campo.icono,
                        datasource: campo.datasource,
                        opciones: campo.opciones_json ? JSON.parse(campo.opciones_json) : null,
                        default: null
                    }))
                }))
            }

            console.log('✅ Esquema final construido:', esquema)
            return esquema
        } catch (error) {
            console.error('Error al obtener esquema de servicio:', error)
            return null
        }
    }
}
