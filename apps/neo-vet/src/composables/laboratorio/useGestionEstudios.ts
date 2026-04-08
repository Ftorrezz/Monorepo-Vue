import { ref, computed } from 'vue'
import { OrdenLaboratorio, Estudio, Muestra, TipoMuestra, EstadoResultado, EstadoOrden } from 'src/types/laboratorio'
import GeneradorMuestrasService from 'src/services/generadorMuestras.service'

export default function useGestionEstudios(origenOrden?: Partial<OrdenLaboratorio>) {
  const orden = ref<OrdenLaboratorio>({
    numeroOrden: '',
    paciente: '',
    profesionalSolicitante: '',
    estado: EstadoOrden.BORRADOR,
    estudios: [],
    muestras: [],
    esUrgente: false,
    dateCreation: new Date().toISOString(),
    ...origenOrden
  })

  const estudioAgregado = ref<Partial<Estudio>>({
    tipoMuestra: TipoMuestra.SANGRE,
    prioridad: 'normal',
    estado: EstadoResultado.PENDIENTE
  })

  const estudiosDisponibles = ref<Estudio[]>([
    { codigo: 'GLU', nombre: 'Glucosa', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'CRTNN', nombre: 'Creatinina', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'URE', nombre: 'Urea', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'ALB', nombre: 'Albúmina', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'PROT', nombre: 'Proteína Total', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'ALAT', nombre: 'ALAT', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'ASAT', nombre: 'ASAT', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'FAL', nombre: 'Fosfatasa Alcalina', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'CA', nombre: 'Calcio', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'P', nombre: 'Fósforo', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    
    { codigo: 'HEM', nombre: 'Hemograma', tipoMuestra: TipoMuestra.SANGRE, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'EO', nombre: 'Examen de Orina', tipoMuestra: TipoMuestra.ORINA, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'EH', nombre: 'Examen de Heces', tipoMuestra: TipoMuestra.HECES, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'CULT', nombre: 'Cultivo', tipoMuestra: TipoMuestra.CULTIVO, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'CIT', nombre: 'Citología', tipoMuestra: TipoMuestra.CITOLOGIA, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
    { codigo: 'HIS', nombre: 'Histología', tipoMuestra: TipoMuestra.HISTOLOGIA, prioridad: 'normal', estado: EstadoResultado.PENDIENTE }
  ])

  /**
   * Agregar un estudio a la orden y generar muestra automáticamente
   */
  const agregarEstudio = () => {
    if (!estudioAgregado.value.codigo || !estudioAgregado.value.nombre) {
      return
    }

    // Verificar que no esté duplicado
    if (orden.value.estudios.some(e => e.codigo === estudioAgregado.value.codigo)) {
      return
    }

    const muestra: Muestra = {
      numeroMuestra: '',
      tipoMuestra: estudioAgregado.value.tipoMuestra || TipoMuestra.SANGRE,
      descripcion: `Muestra para ${estudioAgregado.value.nombre}`,
      estado: 'generada',
      fechaGeneracion: new Date().toISOString()
    }

    // Generar número de muestra
    const numeroMuestraGenerado = GeneradorMuestrasService.generarNumeroMuestra(
      orden.value.numeroOrden,
      muestra.tipoMuestra
    )
    muestra.numeroMuestra = numeroMuestraGenerado.numeroMuestra

    const estudio: Estudio = {
      ...estudioAgregado.value,
      estado: EstadoResultado.PENDIENTE,
      muestra
    } as Estudio

    orden.value.estudios.push(estudio)
    orden.value.muestras.push(muestra)

    // Resetear formulario
    estudioAgregado.value = {
      tipoMuestra: TipoMuestra.SANGRE,
      prioridad: 'normal',
      estado: EstadoResultado.PENDIENTE
    }
  }

  /**
   * Remover un estudio de la orden
   */
  const removerEstudio = (index: number) => {
    const estudio = orden.value.estudios[index]
    if (estudio?.id) {
      // Remover muestra asociada
      orden.value.muestras = orden.value.muestras.filter(m => m.id !== estudio.muestra?.id)
    }
    orden.value.estudios.splice(index, 1)
  }

  /**
   * Editar un estudio
   */
  const editarEstudio = (index: number, estudioActualizado: Partial<Estudio>) => {
    if (index >= 0 && index < orden.value.estudios.length) {
      orden.value.estudios[index] = {
        ...orden.value.estudios[index],
        ...estudioActualizado
      }
    }
  }

  /**
   * Obtener estudios agrupados por tipo de muestra
   */
  const estudiosAgrupadosPorMuestra = computed(() => {
    const agrupados = new Map<TipoMuestra, Estudio[]>()
    
    orden.value.estudios.forEach(estudio => {
      const tipo = estudio.tipoMuestra
      if (!agrupados.has(tipo)) {
        agrupados.set(tipo, [])
      }
      agrupados.get(tipo)!.push(estudio)
    })

    return agrupados
  })

  /**
   * Obtener muestras únicas por tipo
   */
  const muestrasUnicas = computed(() => {
    const muestrasMap = new Map<TipoMuestra, Muestra>()
    
    orden.value.muestras.forEach(muestra => {
      if (!muestrasMap.has(muestra.tipoMuestra)) {
        muestrasMap.set(muestra.tipoMuestra, muestra)
      }
    })

    return Array.from(muestrasMap.values())
  })

  /**
   * Obtener resumen de la orden
   */
  const resumenOrden = computed(() => {
    const pendientes = orden.value.estudios.filter(e => e.estado === EstadoResultado.PENDIENTE).length
    const cargados = orden.value.estudios.filter(e => e.estado === EstadoResultado.CARGADO).length
    const validados = orden.value.estudios.filter(e => e.estado === EstadoResultado.VALIDADO).length

    return {
      totalEstudios: orden.value.estudios.length,
      totalMuestras: orden.value.muestras.length,
      tiposMuestra: Array.from(new Set(orden.value.muestras.map(m => m.tipoMuestra))).length,
      pendientes,
      cargados,
      validados,
      porcentajeCompletitud: orden.value.estudios.length > 0 ? ((cargados + validados) / orden.value.estudios.length * 100).toFixed(2) : 0
    }
  })

  /**
   * Validar que la orden esté lista para enviar
   */
  const validarOrden = (): { valida: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!orden.value.numeroOrden) errores.push('Número de orden requerido')
    if (!orden.value.paciente) errores.push('Paciente requerido')
    if (!orden.value.profesionalSolicitante) errores.push('Profesional solicitante requerido')
    if (orden.value.estudios.length === 0) errores.push('Se requiere al menos un estudio')

    return {
      valida: errores.length === 0,
      errores
    }
  }

  /**
   * Obtener configuración de muestra para un tipo específico
   */
  const obtenerConfiguracionMuestra = (tipoMuestra: TipoMuestra) => {
    return GeneradorMuestrasService.obtenerConfiguracion(tipoMuestra)
  }

  /**
   * Obtener instrucciones para un tipo de muestra
   */
  const obtenerInstrugcionesMuestra = (tipoMuestra: TipoMuestra) => {
    return GeneradorMuestrasService.obtenerInstrucciones(tipoMuestra)
  }

  return {
    orden,
    estudioAgregado,
    estudiosDisponibles,
    agregarEstudio,
    removerEstudio,
    editarEstudio,
    estudiosAgrupadosPorMuestra,
    muestrasUnicas,
    resumenOrden,
    validarOrden,
    obtenerConfiguracionMuestra,
    obtenerInstrugcionesMuestra
  }
}
