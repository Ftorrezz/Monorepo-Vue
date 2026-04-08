import { Estudio, ResultadoEstudio, OrdenLaboratorio } from 'src/types/laboratorio'
import { validarValorContraReferencia, obtenerValorReferencia } from 'src/config/valoresReferencia'

class ValidacionResultadosService {
  /**
   * Valida un resultado individual contra valores de referencia
   * Considerando edad, especie y sexo del paciente
   */
  validarResultado(
    estudio: Estudio,
    resultado: ResultadoEstudio,
    paciente?: { especie?: string; edad?: number; sexo?: string }
  ): {
    valido: boolean
    mensajes: string[]
    dentroDeRango: boolean
  } {
    const errores: string[] = []
    let dentroDeRango = true

    // Validación básica
    if (!resultado.valor) {
      errores.push('El valor del resultado es requerido')
      return { valido: false, mensajes: errores, dentroDeRango: false }
    }

    if (!resultado.unidad) {
      errores.push('La unidad es requerida')
    }

    // Validación contra rango de referencia (solo para numéricos)
    if (estudio.tipoMuestra && resultado.valor && paciente?.especie) {
      const valorNumerico = Number(resultado.valor)
      
      if (!isNaN(valorNumerico)) {
        const validacion = validarValorContraReferencia(
          valorNumerico,
          estudio.codigo,
          paciente.especie,
          paciente.edad
        )
        
        dentroDeRango = validacion.valido
        if (!validacion.valido) {
          errores.push(validacion.mensaje)
        }
      }
    }

    return {
      valido: errores.length === 0,
      mensajes: errores,
      dentroDeRango
    }
  }

  /**
   * Valida múltiples resultados de una orden
   */
  validarMultiplesResultados(
    estudios: Estudio[],
    resultados: Map<string, ResultadoEstudio>,
    orden?: OrdenLaboratorio
  ): {
    valido: boolean
    erroresPorEstudio: Map<string, string[]>
    advertencias: string[]
  } {
    const erroresPorEstudio = new Map<string, string[]>()
    const advertencias: string[] = []

    estudios.forEach(estudio => {
      const resultado = resultados.get(estudio.codigo)
      
      if (resultado) {
        const validacion = this.validarResultado(estudio, resultado, {
          especie: orden?.especie,
          edad: orden?.edad,
          sexo: orden?.sexo
        })
        
        if (!validacion.valido) {
          erroresPorEstudio.set(estudio.codigo, validacion.mensajes)
        }
      }
    })

    // Advertencia si hay pocos estudios
    if (estudios.length < 3) {
      advertencias.push('Se recomienda hacer mínimo 3 estudios para un análisis completo')
    }

    return {
      valido: erroresPorEstudio.size === 0,
      erroresPorEstudio,
      advertencias
    }
  }

  /**
   * Detecta anomalías en los resultados
   */
  detectarAnomalias(
    estudios: Estudio[],
    resultados: Map<string, ResultadoEstudio>,
    paciente?: { especie?: string; edad?: number; sexo?: string }
  ): string[] {
    const anomalias: string[] = []

    estudios.forEach(estudio => {
      const resultado = resultados.get(estudio.codigo)
      if (!resultado?.valor) return

      const valorNumerico = Number(resultado.valor)
      if (isNaN(valorNumerico)) return

      // Verificar si está fuera de rango
      const referencia = obtenerValorReferencia(estudio.codigo, paciente?.especie || '', paciente?.edad)
      
      if (referencia) {
        if (valorNumerico < referencia.minimo * 0.5) {
          anomalias.push(`⚠️ ${estudio.nombre}: Valor crítico bajo (${valorNumerico})`)
        } else if (valorNumerico > referencia.maximo * 2) {
          anomalias.push(`⚠️ ${estudio.nombre}: Valor crítico alto (${valorNumerico})`)
        }
      }
    })

    return anomalias
  }

  /**
   * Compara resultados actuales con previos
   */
  compararConResultadosPrevios(
    estudio: Estudio,
    resultado: ResultadoEstudio,
    resultadoPrevio?: ResultadoEstudio
  ): {
    cambio: string | null
    porcentajeCambio?: number
    advertencia?: string
  } {
    if (!resultadoPrevio?.valor || !resultado.valor) {
      return { cambio: null }
    }

    const valActual = Number(resultado.valor)
    const valPrevio = Number(resultadoPrevio.valor)

    if (isNaN(valActual) || isNaN(valPrevio)) {
      return { cambio: null }
    }

    const diferencia = valActual - valPrevio
    const porcentajeCambio = (diferencia / valPrevio) * 100

    let cambio = 'Estable'
    let advertencia: string | undefined

    if (Math.abs(porcentajeCambio) > 20) {
      cambio = porcentajeCambio > 0 ? 'Aumento importante' : 'Disminución importante'
      advertencia = `Cambio significativo: ${porcentajeCambio.toFixed(1)}% desde el valor previo (${valPrevio})`
    } else if (Math.abs(porcentajeCambio) > 10) {
      cambio = porcentajeCambio > 0 ? 'Aumento leve' : 'Disminución leve'
    }

    return {
      cambio,
      porcentajeCambio,
      advertencia
    }
  }

  /**
   * Genera reporte de validación
   */
  generarReporteValidacion(
    orden: OrdenLaboratorio,
    resultados: Map<string, ResultadoEstudio>
  ): {
    resumen: string
    detalles: string[]
    erroresCriticos: string[]
    advertencias: string[]
  } {
    const validacion = this.validarMultiplesResultados(orden.estudios || [], resultados, orden)
    const anomalias = this.detectarAnomalias(orden.estudios || [], resultados, {
      especie: orden.especie,
      edad: orden.edad,
      sexo: orden.sexo
    })

    const erroresCriticos: string[] = []
    const detalles: string[] = []

    validacion.erroresPorEstudio.forEach((mensajes, codigoEstudio) => {
      mensajes.forEach(msg => {
        erroresCriticos.push(`${codigoEstudio}: ${msg}`)
      })
    })

    orden.estudios?.forEach(estudio => {
      const resultado = resultados.get(estudio.codigo)
      if (resultado) {
        detalles.push(`${estudio.codigo}: ${resultado.valor || 'Sin valor'} ${resultado.unidad || ''}`)
      }
    })

    return {
      resumen: validacion.valido ? 'Validación aprobada' : 'Validación rechazada',
      detalles,
      erroresCriticos,
      advertencias: [...validacion.advertencias, ...anomalias]
    }
  }
}

export default new ValidacionResultadosService()
