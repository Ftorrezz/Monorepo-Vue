import { TipoMuestra, ConfiguracionMuestra, NumeroMuestraGenerado, GeneradorMuestrasConfig } from 'src/types/laboratorio'

class GeneradorMuestrasService {
  private configuracion: GeneradorMuestrasConfig = {
    [TipoMuestra.SANGRE]: {
      tipoMuestra: TipoMuestra.SANGRE,
      prefijo: 'S',
      contenedor: 'EDTA/Tubo SST',
      volumenMinimo: '2-3 ml',
      conservador: 'Sin conservador',
      temperatura: '2-8°C',
      estabilidad: '48 horas',
      instruccionesEspeciales: ['No congelar', 'Sedar si es necesario']
    },
    [TipoMuestra.ORINA]: {
      tipoMuestra: TipoMuestra.ORINA,
      prefijo: 'O',
      contenedor: 'Vaso estéril',
      volumenMinimo: '30-50 ml',
      conservador: 'Con preservante si demora > 2h',
      temperatura: '2-8°C',
      estabilidad: '24 horas',
      instruccionesEspeciales: ['Muestra de mitad de micción', 'Si es cateterismo anotar']
    },
    [TipoMuestra.HECES]: {
      tipoMuestra: TipoMuestra.HECES,
      prefijo: 'H',
      contenedor: 'Vaso estéril',
      volumenMinimo: '5-10 g',
      conservador: 'Sin conservador',
      temperatura: '2-8°C',
      estabilidad: '48 horas',
      instruccionesEspeciales: ['No contaminar con orina', 'Evitar materia fecal del suelo']
    },
    [TipoMuestra.FLUIDO]: {
      tipoMuestra: TipoMuestra.FLUIDO,
      prefijo: 'F',
      contenedor: 'Tubo estéril',
      volumenMinimo: '2-5 ml',
      conservador: 'EDTA si es para celularidad',
      temperatura: 'Temperatura ambiente',
      estabilidad: '2 horas',
      instruccionesEspeciales: ['Aspirar asépticamente', 'Transportar rápidamente']
    },
    [TipoMuestra.BIOPSIA]: {
      tipoMuestra: TipoMuestra.BIOPSIA,
      prefijo: 'B',
      contenedor: 'Frasco con formol o alcohol',
      volumenMinimo: 'Variable',
      conservador: 'Formol 10%',
      temperatura: 'Temperatura ambiente',
      estabilidad: '7 días',
      instruccionesEspeciales: ['Describir localización', 'Anotar tamaño y aspecto']
    },
    [TipoMuestra.CULTIVO]: {
      tipoMuestra: TipoMuestra.CULTIVO,
      prefijo: 'C',
      contenedor: 'Medio de cultivo específico',
      volumenMinimo: 'Variable',
      conservador: 'Según medio',
      temperatura: '35-37°C',
      estabilidad: 'Inmediato',
      instruccionesEspeciales: ['Trasporte rápido', 'Evitar contaminación']
    },
    [TipoMuestra.CITOLOGIA]: {
      tipoMuestra: TipoMuestra.CITOLOGIA,
      prefijo: 'CT',
      contenedor: 'Portaobjetos o vial',
      volumenMinimo: 'Variable',
      conservador: 'Fijador citológico',
      temperatura: 'Temperatura ambiente',
      estabilidad: 'Indefinida',
      instruccionesEspeciales: ['Fijar inmediatamente', 'Marcar clara la localización']
    },
    [TipoMuestra.HISTOLOGIA]: {
      tipoMuestra: TipoMuestra.HISTOLOGIA,
      prefijo: 'HT',
      contenedor: 'Frasco con formol',
      volumenMinimo: 'mínimo 5x5x3 mm',
      conservador: 'Formol 10%',
      temperatura: 'Temperatura ambiente',
      estabilidad: '7 días',
      instruccionesEspeciales: ['Describir hallazgos', 'Cantidad de fragmentos']
    }
  }

  private contadores: Map<string, Map<TipoMuestra, number>> = new Map()

  /**
   * Obtiene la configuración de un tipo de muestra
   */
  obtenerConfiguracion(tipoMuestra: TipoMuestra): ConfiguracionMuestra | undefined {
    return this.configuracion[tipoMuestra]
  }

  /**
   * Genera un número de muestra único basado en el tipo y orden
   */
  generarNumeroMuestra(numeroOrden: string, tipoMuestra: TipoMuestra): NumeroMuestraGenerado {
    const config = this.configuracion[tipoMuestra]
    if (!config) {
      throw new Error(`Tipo de muestra no configurado: ${tipoMuestra}`)
    }

    // Inicializar contador para esta orden si no existe
    if (!this.contadores.has(numeroOrden)) {
      this.contadores.set(numeroOrden, new Map())
    }

    const contadoresOrden = this.contadores.get(numeroOrden)!
    const secuencia = (contadoresOrden.get(tipoMuestra) || 0) + 1
    contadoresOrden.set(tipoMuestra, secuencia)

    // Generar número con formato: {PREFIJO}-{NUMERO_ORDEN}-{SECUENCIA}
    // Ej: S-ORD001-01, O-ORD001-01
    const numeroMuestra = `${config.prefijo}-${numeroOrden}-${String(secuencia).padStart(2, '0')}`

    return {
      numeroMuestra,
      tipoMuestra,
      codigoOrden: numeroOrden,
      secuencia
    }
  }

  /**
   * Genera múltiples números de muestra para diferentes tipos
   */
  generarMultiplesMuestras(
    numeroOrden: string,
    tiposMuestra: TipoMuestra[]
  ): NumeroMuestraGenerado[] {
    return tiposMuestra.map(tipo => this.generarNumeroMuestra(numeroOrden, tipo))
  }

  /**
   * Reinicia los contadores para una orden (útil para regenerar)
   */
  resetearContadores(numeroOrden: string): void {
    this.contadores.delete(numeroOrden)
  }

  /**
   * Obtiene todos los tipos de muestra disponibles
   */
  obtenerTiposMuestraDisponibles(): TipoMuestra[] {
    return Object.values(TipoMuestra)
  }

  /**
   * Obtiene instrucciones para un tipo de muestra
   */
  obtenerInstrucciones(tipoMuestra: TipoMuestra): string[] {
    const config = this.configuracion[tipoMuestra]
    return config?.instruccionesEspeciales || []
  }

  /**
   * Valida si una muestra cumple con los requisitos mínimos
   */
  validarMuestra(muestra: any): { valido: boolean; errores: string[] } {
    const errores: string[] = []
    const config = this.configuracion[muestra.tipoMuestra]

    if (!config) {
      errores.push(`Tipo de muestra desconocido: ${muestra.tipoMuestra}`)
      return { valido: false, errores }
    }

    if (!muestra.numeroMuestra) {
      errores.push('Número de muestra requerido')
    }

    if (!muestra.tipoMuestra) {
      errores.push('Tipo de muestra requerido')
    }

    return { valido: errores.length === 0, errores }
  }
}

export default new GeneradorMuestrasService()
