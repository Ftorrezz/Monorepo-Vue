/**
 * Configuración de Valores de Referencia para Laboratorio
 * Incluye ajustes por edad, especie y sexo
 */

export interface RangoReferencia {
  minimo: number
  maximo: number
  unidad: string
}

export interface ValorReferenciaEspecie {
  especie: string
  rango: RangoReferencia
  edadMin?: number // En años
  edadMax?: number
  sexo?: 'macho' | 'hembra' | 'indeterminado'
  notas?: string
}

export interface ConfiguracionPrueba {
  codigo: string
  nombre: string
  unidadMedida: string
  tipoResultado: 'numerico' | 'cualitativo' | 'texto'
  metodos: string[]
  valoresReferencia: ValorReferenciaEspecie[]
  opcionesCualitativas?: string[] // Para resultados cualitativos
  observaciones?: string
}

/**
 * Valores de referencia por especie
 * Basados en estándares veterinarios
 */
export const valoresReferenciaConfig: Record<string, ConfiguracionPrueba> = {
  // HEMATOLOGÍA
  HEM: {
    codigo: 'HEM',
    nombre: 'Hemograma',
    unidadMedida: 'Células/µL',
    tipoResultado: 'numerico',
    metodos: ['Analizador automático', 'Conteo manual'],
    valoresReferencia: [
      // Canino
      {
        especie: 'Canino',
        rango: { minimo: 5.5, maximo: 8.5, unidad: '10^6/µL' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Hematocritos en machos y hembras'
      }
    ]
  },
  
  // QUÍMICA CLÍNICA - GLUCOSA
  GLU: {
    codigo: 'GLU',
    nombre: 'Glucosa',
    unidadMedida: 'mg/dL',
    tipoResultado: 'numerico',
    metodos: ['Glucómetro', 'Laboratorio automático', 'Método enzimático'],
    valoresReferencia: [
      // Canino
      {
        especie: 'Canino',
        rango: { minimo: 70, maximo: 110, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 1,
        notas: 'Cachorros'
      },
      {
        especie: 'Canino',
        rango: { minimo: 80, maximo: 110, unidad: 'mg/dL' },
        edadMin: 1,
        edadMax: 100,
        notas: 'Adultos'
      },
      // Felino
      {
        especie: 'Felino',
        rango: { minimo: 80, maximo: 130, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Gatos (rango más alto que perros)'
      }
    ]
  },

  // QUÍMICA CLÍNICA - CREATININA
  CRTNN: {
    codigo: 'CRTNN',
    nombre: 'Creatinina',
    unidadMedida: 'mg/dL',
    tipoResultado: 'numerico',
    metodos: ['Método Jaffe', 'Método enzimático'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 0.5, maximo: 1.5, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 0.8, maximo: 2.0, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Equino',
        rango: { minimo: 0.7, maximo: 1.8, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 100
      }
    ]
  },

  // QUÍMICA CLÍNICA - UREA
  URE: {
    codigo: 'URE',
    nombre: 'Urea (Nitrógeno ureico)',
    unidadMedida: 'mg/dL',
    tipoResultado: 'numerico',
    metodos: ['Método enzimático', 'Método colorimétrico'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 15, maximo: 45, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 15, maximo: 50, unidad: 'mg/dL' },
        edadMin: 0,
        edadMax: 100
      }
    ]
  },

  // QUÍMICA CLÍNICA - ALBÚMINA
  ALB: {
    codigo: 'ALB',
    nombre: 'Albúmina',
    unidadMedida: 'g/dL',
    tipoResultado: 'numerico',
    metodos: ['Electroforesis', 'Método de bromocresol verde'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 2.7, maximo: 4.4, unidad: 'g/dL' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 2.1, maximo: 3.3, unidad: 'g/dL' },
        edadMin: 0,
        edadMax: 100
      }
    ]
  },

  // QUÍMICA CLÍNICA - PROTEÍNA TOTAL
  PROT: {
    codigo: 'PROT',
    nombre: 'Proteína Total',
    unidadMedida: 'g/dL',
    tipoResultado: 'numerico',
    metodos: ['Refractómetro', 'Método de Biuret'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 6.0, maximo: 7.5, unidad: 'g/dL' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 6.3, maximo: 8.0, unidad: 'g/dL' },
        edadMin: 0,
        edadMax: 100
      }
    ]
  },

  // HÍGADO - ALAT
  ALAT: {
    codigo: 'ALAT',
    nombre: 'ALAT (ALT/GPT)',
    unidadMedida: 'U/L',
    tipoResultado: 'numerico',
    metodos: ['Método enzimático'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 10, maximo: 40, unidad: 'U/L' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 20, maximo: 50, unidad: 'U/L' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Gatos más sensibles a cambios hepáticos'
      }
    ]
  },

  // HÍGADO - ASAT
  ASAT: {
    codigo: 'ASAT',
    nombre: 'ASAT (AST/GOT)',
    unidadMedida: 'U/L',
    tipoResultado: 'numerico',
    metodos: ['Método enzimático'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 15, maximo: 45, unidad: 'U/L' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 10, maximo: 40, unidad: 'U/L' },
        edadMin: 0,
        edadMax: 100
      }
    ]
  },

  // HÍGADO - FOSFATASA ALCALINA
  FAL: {
    codigo: 'FAL',
    nombre: 'Fosfatasa Alcalina (ALP/FA)',
    unidadMedida: 'U/L',
    tipoResultado: 'numerico',
    metodos: ['Método enzimático'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 14, maximo: 105, unidad: 'U/L' },
        edadMin: 0,
        edadMax: 2,
        notas: 'Cachorros (valor aumentado por crecimiento)'
      },
      {
        especie: 'Canino',
        rango: { minimo: 14, maximo: 42, unidad: 'U/L' },
        edadMin: 2,
        edadMax: 100,
        notas: 'Adultos'
      },
      {
        especie: 'Felino',
        rango: { minimo: 25, maximo: 90, unidad: 'U/L' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Gatos (naturalmente más alto)'
      }
    ]
  },

  // COAGULACIÓN - TIEMPO PROTROMBINA
  TP: {
    codigo: 'TP',
    nombre: 'Tiempo de Protrombina (PT/INR)',
    unidadMedida: 'segundos',
    tipoResultado: 'numerico',
    metodos: ['Coagulómetro', 'Método manual'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 5.5, maximo: 8.0, unidad: 's' },
        edadMin: 0,
        edadMax: 100
      },
      {
        especie: 'Felino',
        rango: { minimo: 6.0, maximo: 9.0, unidad: 's' },
        edadMin: 0,
        edadMax: 100
      }
    ]
  },

  // UROANÁLISIS - EXAMEN DE ORINA
  EO: {
    codigo: 'EO',
    nombre: 'Examen de Orina (Uroanálisis)',
    unidadMedida: 'Color/Densidad/Proteína',
    tipoResultado: 'texto',
    metodos: ['Análisis físico químico', 'Tira reactiva'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 1.003, maximo: 1.030, unidad: 'Densidad' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Normal: Claro a amarillo pálido, Proteína: negativa'
      },
      {
        especie: 'Felino',
        rango: { minimo: 1.003, maximo: 1.035, unidad: 'Densidad' },
        edadMin: 0,
        edadMax: 100
      }
    ],
    opcionesCualitativas: ['Normal', 'Proteína +', 'Glucosa +', 'Cuerpos cetónicos +', 'Sangre +']
  },

  // UROCULTIVO
  UC: {
    codigo: 'UC',
    nombre: 'Urocultivo',
    unidadMedida: 'UFC/mL',
    tipoResultado: 'cualitativo',
    metodos: ['Cultivo bacteriano', 'Siembra en agar'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 0, maximo: 1000, unidad: 'UFC/mL' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Menos de 1000 UFC/mL se considera normal'
      }
    ],
    opcionesCualitativas: ['Negativo', 'Positivo', 'Contaminación']
  },

  // ANÁLISIS DE HECES
  EH: {
    codigo: 'EH',
    nombre: 'Examen de Heces',
    unidadMedida: 'Presencia/Ausencia',
    tipoResultado: 'texto',
    metodos: ['Examen microscópico directo', 'Flotación', 'Tinción'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 0, maximo: 0, unidad: 'Parásitos' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Negativo para parásitos, bacterias anaeróbicas normales'
      }
    ],
    opcionesCualitativas: ['Negativo', 'Parásitos presentes', 'Sangre oculta +', 'Grasas fecales +']
  },

  // COPROCULTIVO
  COP: {
    codigo: 'COP',
    nombre: 'Coprocultivo',
    unidadMedida: 'Colonias',
    tipoResultado: 'cualitativo',
    metodos: ['Cultivo en agar selectivo'],
    valoresReferencia: [
      {
        especie: 'Canino',
        rango: { minimo: 0, maximo: 0, unidad: 'Patógenos' },
        edadMin: 0,
        edadMax: 100,
        notas: 'Negativo para patógenos comunes'
      }
    ],
    opcionesCualitativas: ['Negativo', 'Salmonella +', 'E. coli enteroinvasiva +', 'Campylobacter +']
  }
}

/**
 * Función auxiliar para obtener valores de referencia
 */
export function obtenerValorReferencia(
  codigoPrueba: string,
  especie: string,
  edad?: number
): RangoReferencia | null {
  const config = valoresReferenciaConfig[codigoPrueba]
  if (!config) return null

  const referencias = config.valoresReferencia.filter(ref => {
    if (ref.especie.toLowerCase() !== especie.toLowerCase()) return false
    
    if (edad !== undefined) {
      const edadEnAños = edad / 12 // Asumiendo que viene en meses
      if (ref.edadMin !== undefined && edadEnAños < ref.edadMin) return false
      if (ref.edadMax !== undefined && edadEnAños > ref.edadMax) return false
    }
    
    return true
  })

  return referencias.length > 0 ? referencias[0].rango : null
}

/**
 * Función para validar valor contra rango
 */
export function validarValorContraReferencia(
  valor: number,
  codigoPrueba: string,
  especie: string,
  edad?: number
): { valido: boolean; mensaje: string } {
  const referencia = obtenerValorReferencia(codigoPrueba, especie, edad)
  
  if (!referencia) {
    return {
      valido: true,
      mensaje: 'Sin valores de referencia'
    }
  }

  if (valor < referencia.minimo || valor > referencia.maximo) {
    return {
      valido: false,
      mensaje: `Valor ${valor} ${referencia.unidad} fuera de rango (${referencia.minimo}-${referencia.maximo})`
    }
  }

  return {
    valido: true,
    mensaje: `Valor dentro de rango normal`
  }
}
