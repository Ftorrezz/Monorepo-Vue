import NdPeticionControl from 'src/controles/rest.control'
import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface AtencionServicioValor {
    id_campo: number
    valor_texto?: string
    valor_numerico?: number
    valor_bit?: boolean
    valor_fecha?: string
}

export interface AtencionServicioDto {
    id_atencion: number
    id_servicio: number     // FK → SERVICIO.id (catálogo maestro)
    estado?: string             // 'pendiente' | 'completado' | 'cancelado'
    observaciones?: string
    valores?: AtencionServicioValor[]
}

export interface AtencionServicio {
    id: number
    id_atencion: number
    id_servicio: number
    estado: string
    fecha_creacion?: string
    fecha_completado?: string
    id_usuario_crea?: number
    observaciones?: string
    servicio?: {
        id: number
        nombre: string
        icono?: string
        color?: string
        componente_clave?: string
        tipo_renderizado?: string
    }
    valores?: AtencionServicioValor[]
}

export interface AtencionServicioVacunacion {
    id?: number
    id_atencion_servicio: number
    id_producto?: number
    id_tipo_vacuna?: number
    id_laboratorio?: number
    lote?: string
    fecha_vencimiento?: string
    dosis?: number
    id_via_administracion?: number
    sitio_aplicacion?: string
    proxima_vacuna?: string
    reacciones_adversas?: string
}

export interface AtencionServicioDesparasitacion {
    id?: number
    id_atencion_servicio: number
    tipo_desparasitante?: string
    producto_nombre?: string
    laboratorio?: string
    lote?: string
    dosis?: string
    via_administracion?: string
    parasitos_objetivo?: string
    proxima_desparasitacion?: string
    observaciones?: string
}

export interface AtencionServicioConsulta {
    id?: number
    id_atencion_servicio: number
    id_motivo?: number
    motivo_consulta?: string
    motivo_detallado?: string
    anamnesis?: string
    hallazgos_examen?: string
    id_diagnostico?: number
    diagnostico?: string
    diagnostico_complemento?: string
    plan_tratamiento?: string
    indicaciones_medicas?: string
    receta_indicaciones?: string
    pronostico?: string
    proxima_cita?: string
    observaciones?: string
}

export interface AtencionServicioReceta {
    id?: number
    id_atencion_servicio: number
    receta_indicaciones?: string
    observaciones?: string
}

export interface AtencionServicioRayosX {
    id?: number
    id_atencion_servicio: number
    region_anatomica?: string
    proyecciones?: string
    hallazgos?: string
    interpretacion?: string
    tecnica_kv?: number
    tecnica_ma?: number
}

export interface AtencionServicioUltrasonido {
    id?: number
    id_atencion_servicio: number
    tipo_estudio?: string
    descripcion_detallada?: string
    conclusiones?: string
    recomendaciones?: string
}

export interface AtencionServicioHospitalizacion {
    id?: number
    id_atencion_servicio: number
    fecha_ingreso?: string
    fecha_egreso?: string
    motivo_hospitalizacion?: string
    jaula_asignada?: string
    estado_paciente?: string
}

export interface AtencionServicioMedicamentos {
    id?: number
    id_atencion_servicio: number
    prescripciones_json?: string
}

export interface AtencionServicioFisioterapia {
    id?: number
    id_atencion_servicio: number
    tipo_rehabilitacion?: string
    total_sesiones_plan?: number
    sesion_actual?: number
    evaluacion_inicial?: string
}

export interface AtencionServicioUrgencia {
    id?: number
    id_atencion_servicio: number
    triage_color?: string
    motivo_urgencia?: string
    estabilizacion_procedimientos?: string
    diagnostico_presuntivo?: string
    pronostico?: string
    resultado_final?: string
}

export interface AtencionServicioEstetica {
    id?: number
    id_atencion_servicio: number
    servicios_realizados?: string
    tipo_corte?: string
    estado_pelaje_inicial?: string
    productos_utilizados?: string
    comportamiento_paciente?: string
    satisfaccion_cliente?: string
    proxima_cita_sugerida?: string
}

export interface NotificacionServicio {
    id?: number
    id_atencion_servicio: number
    id_propietario: number
    id_mascota: number
    tipo_notificacion: string
    mensaje: string
    fecha_programada: string
    estado?: string
}

export const atencionServicioService = {

    /**
     * Crea un nuevo registro de servicio en una atención.
     * Devuelve el objeto creado con su ID de BD.
     */
    async crear(datos: AtencionServicioDto): Promise<AtencionServicio> {
        const response = await peticionService.crear('atencionservicios', datos)
        // El backend puede devolver en distintas formas, normalizamos:
        if (Array.isArray(response) && response[0]?.elemento) {
            return response[0].elemento[0]
        }
        return response?.data || response
    },

    /**
     * Actualiza estado u observaciones de un servicio ya creado.
     * También puede actualizar los valores EAV del formulario.
     */
    async actualizar(id: number, datos: Partial<AtencionServicioDto>): Promise<void> {
        await peticionService.actualizar('atencionservicios', { id, ...datos })
    },

    /**
     * Marca el servicio como completado, guardando los datos del formulario
     * como valores EAV (array de id_campo + valor).
     */
    async completar(id: number, datos: {
        observaciones?: string
        valores?: AtencionServicioValor[]
    }): Promise<void> {
        await peticionService.actualizar('atencionservicios', {
            id,
            estado: 'completado',
            fecha_completado: new Date().toISOString(),
            ...datos
        })
    },

    /**
     * Obtiene todos los servicios de una atención específica.
     * Usa GET genérico filtrando por id_atencion.
     */
    async getPorAtencion(idAtencion: number): Promise<AtencionServicio[]> {
        try {
            const peticion = new NdPeticionControl()
            const response = await peticion.invocarMetodo('atencionservicios', 'get', null, {
                filtro: { id_atencion: idAtencion }
            })
            if (Array.isArray(response) && response[0]?.elemento) {
                return response[0].elemento || []
            }
            return Array.isArray(response) ? response : (response?.data || [])
        } catch (error) {
            console.error('Error al obtener servicios de la atención:', error)
            return []
        }
    },

    /**
     * Convierte los datos de un formulario de servicio especializado
     * al formato EAV (array de id_campo + valor tipado).
     * @param campos Map de nombre_interno → id_campo (viene del schema del servicio)
     * @param datos  Objeto con los datos del formulario
     */
    mapearDatosAValores(
        campos: Record<string, { id: number; tipo: string }>,
        datos: Record<string, any>
    ): AtencionServicioValor[] {
        const valores: AtencionServicioValor[] = []

        for (const [nombreInterno, config] of Object.entries(campos)) {
            const valor = datos[nombreInterno]
            if (valor === undefined || valor === null || valor === '') continue

            const valorEAV: AtencionServicioValor = { id_campo: config.id }

            switch (config.tipo) {
                case 'numerico':
                case 'number':
                    valorEAV.valor_numerico = Number(valor)
                    break
                case 'checkbox':
                    valorEAV.valor_bit = Boolean(valor)
                    break
                case 'date':
                    valorEAV.valor_fecha = valor
                    break
                default:
                    // texto, select, textarea y cualquier otro → valor_texto
                    valorEAV.valor_texto = Array.isArray(valor)
                        ? valor.join(', ')  // campos múltiples (chips) → string separado por coma
                        : String(valor)
            }

            valores.push(valorEAV)
        }

        return valores
    },

    /**
     * Convierte los valores EAV de vuelta al objeto de datos del formulario.
     * Útil para cargar un servicio guardado en modo lectura.
     */
    mapearValoresADatos(
        campos: Record<string, { id: number; tipo: string }>,
        valores: AtencionServicioValor[]
    ): Record<string, any> {
        const datos: Record<string, any> = {}
        const camposById = Object.fromEntries(
            Object.entries(campos).map(([nombre, config]) => [config.id, { nombre, tipo: config.tipo }])
        )

        for (const valor of valores) {
            const campo = camposById[valor.id_campo]
            if (!campo) continue

            if (valor.valor_numerico !== undefined && valor.valor_numerico !== null) {
                datos[campo.nombre] = valor.valor_numerico
            } else if (valor.valor_bit !== undefined && valor.valor_bit !== null) {
                datos[campo.nombre] = valor.valor_bit
            } else if (valor.valor_fecha) {
                datos[campo.nombre] = valor.valor_fecha
            } else {
                datos[campo.nombre] = valor.valor_texto
            }
        }

        return datos
    },

    /**
     * Obtiene el detalle especializado de una vacunación.
     */
    async getVacunacionByAtencionServicio(idAtencionServicio: number): Promise<AtencionServicioVacunacion[]> {
        const peticion = new NdPeticionControl()
        const response = await peticion.invocarMetodo('atencionserviciovacunacion', 'get', null, {
            filtro: { id_atencion_servicio: idAtencionServicio }
        })
        if (Array.isArray(response) && response[0]?.elemento) {
            return response[0].elemento || []
        }
        return Array.isArray(response) ? response : (response?.data || [])
    },

    /**
     * Obtiene el detalle especializado de una consulta general.
     */
    async getConsultaByAtencionServicio(idAtencionServicio: number): Promise<AtencionServicioConsulta[]> {
        const peticion = new NdPeticionControl()
        const response = await peticion.invocarMetodo('atencionservicioconsulta', 'get', null, {
            filtro: { id_atencion_servicio: idAtencionServicio }
        })
        if (Array.isArray(response) && response[0]?.elemento) {
            return response[0].elemento || []
        }
        return Array.isArray(response) ? response : (response?.data || [])
    },

    /**
     * Obtiene el detalle especializado de una desparasitación.
     */
    async getDesparasitacionByAtencionServicio(idAtencionServicio: number): Promise<AtencionServicioDesparasitacion[]> {
        const peticion = new NdPeticionControl()
        const response = await peticion.invocarMetodo('atencionserviciodesparasitacion', 'get', null, {
            filtro: { id_atencion_servicio: idAtencionServicio }
        })
        if (Array.isArray(response) && response[0]?.elemento) {
            return response[0].elemento || []
        }
        return Array.isArray(response) ? response : (response?.data || [])
    },

    /**
     * Obtiene el detalle especializado de una receta médica.
     */
    async getRecetaByAtencionServicio(idAtencionServicio: number): Promise<AtencionServicioReceta[]> {
        const peticion = new NdPeticionControl()
        const response = await peticion.invocarMetodo('atencionservicioreceta', 'get', null, {
            filtro: { id_atencion_servicio: idAtencionServicio }
        })
        if (Array.isArray(response) && response[0]?.elemento) {
            return response[0].elemento || []
        }
        return Array.isArray(response) ? response : (response?.data || [])
    },

    /**
     * Guarda el detalle especializado de una vacunación.
     */
    async guardarVacunacion(datos: AtencionServicioVacunacion): Promise<void> {
        await peticionService.crear('atencionserviciovacunacion', datos)
    },

    /**
     * Actualiza el detalle especializado de una vacunación.
     */
    async actualizarVacunacion(id: number, datos: Partial<AtencionServicioVacunacion>): Promise<void> {
        await peticionService.actualizar('atencionserviciovacunacion', { id, ...datos })
    },

    /**
     * Guarda el detalle especializado de una desparasitación.
     */
    async guardarDesparasitacion(datos: AtencionServicioDesparasitacion): Promise<void> {
        await peticionService.crear('atencionserviciodesparasitacion', datos)
    },

    /**
     * Guarda el detalle especializado de una consulta general.
     */
    async guardarConsulta(datos: AtencionServicioConsulta): Promise<void> {
        await peticionService.crear('atencionservicioconsulta', datos)
    },

    /**
     * Guarda el detalle especializado de una receta médica.
     */
    async guardarReceta(datos: AtencionServicioReceta): Promise<void> {
        await peticionService.crear('atencionservicioreceta', datos)
    },

    /**
     * Crea una notificación programada para un servicio.
     */
    async crearNotificacion(datos: NotificacionServicio): Promise<void> {
        await peticionService.crear('notificacionservicio', datos)
    },

    async guardarRayosX(datos: AtencionServicioRayosX): Promise<void> {
        await peticionService.crear('atencionserviciorayosx', datos)
    },

    async guardarUltrasonido(datos: AtencionServicioUltrasonido): Promise<void> {
        await peticionService.crear('atencionservicioultrasonido', datos)
    },

    async guardarHospitalizacion(datos: AtencionServicioHospitalizacion): Promise<void> {
        await peticionService.crear('atencionserviciohospitalizacion', datos)
    },

    async guardarMedicamentos(datos: AtencionServicioMedicamentos): Promise<void> {
        await peticionService.crear('atencionserviciomedicamentos', datos)
    },

    async guardarFisioterapia(datos: AtencionServicioFisioterapia): Promise<void> {
        await peticionService.crear('atencionserviciofisioterapia', datos)
    },

    async guardarUrgencia(datos: AtencionServicioUrgencia): Promise<void> {
        await peticionService.crear('atencionserviciourgencia', datos)
    },

    async guardarEstetica(datos: AtencionServicioEstetica): Promise<void> {
        await peticionService.crear('atencionservicioestetica', datos)
    }
}
