export const catalogoEstudios: Record<string, any> = {
  HEM01: {
    id: 'HEM01',
    codigo: 'HEM01',
    nombre: 'Hemograma Completo',
    sectorId: 'HEM',
    sector: { nombre: 'Hematología' },
    pruebas: [
      { id: 'HEM01_01', codigo: 'HGB', nombre: 'Hemoglobina', tipo: 'numerico', valorMinimo: 12, valorMaximo: 18, unidad: 'g/dL', estado: 'pendiente' },
      { id: 'HEM01_02', codigo: 'HTO', nombre: 'Hematocrito', tipo: 'numerico', valorMinimo: 37, valorMaximo: 55, unidad: '%', estado: 'pendiente' }
    ]
  },
  BIO02: {
    id: 'BIO02',
    codigo: 'BIO02',
    nombre: 'Perfil Bioquímico Básico',
    sectorId: 'BQ',
    sector: { nombre: 'Bioquímica' },
    pruebas: [
      { id: 'BIO02_01', codigo: 'GLU', nombre: 'Glucosa', tipo: 'numerico', valorMinimo: 70, valorMaximo: 110, unidad: 'mg/dL', estado: 'pendiente' },
      { id: 'BIO02_02', codigo: 'CRE', nombre: 'Creatinina', tipo: 'numerico', valorMinimo: 0.5, valorMaximo: 1.5, unidad: 'mg/dL', estado: 'pendiente' }
    ]
  },
  ORU01: {
    id: 'ORU01',
    codigo: 'ORU01',
    nombre: 'Uroanálisis',
    sectorId: 'MICRO',
    sector: { nombre: 'Microbiología' },
    pruebas: [
      { id: 'ORU01_01', codigo: 'PH', nombre: 'pH Urinario', tipo: 'numerico', valorMinimo: 5, valorMaximo: 7, unidad: '', estado: 'pendiente' },
      { id: 'ORU01_02', codigo: 'GLU', nombre: 'Glucosa', tipo: 'numerico', valorMinimo: 0, valorMaximo: 15, unidad: 'mg/dL', estado: 'pendiente' }
    ]
  }
}

export const normalizarEstudio = (estudio: any) => {
  if (!estudio) return null

  if (typeof estudio === 'string') {
    return catalogoEstudios[estudio] || {
      id: estudio,
      codigo: estudio,
      nombre: estudio,
      sectorId: 'OTR',
      sector: { nombre: 'Otros' },
      pruebas: []
    }
  }

  if (Array.isArray(estudio.pruebas)) {
    return {
      id: estudio.id ?? estudio.codigo ?? `${estudio.codigo || estudio.id}`,
      codigo: estudio.codigo ?? estudio.id,
      nombre: estudio.nombre ?? estudio.codigo ?? estudio.id,
      sectorId: estudio.sectorId ?? estudio.sector?.id ?? 'OTR',
      sector: estudio.sector ?? { nombre: estudio.sectorNombre || 'Otros' },
      estado: estudio.estado ?? 'pendiente',
      pruebas: estudio.pruebas.map((prueba: any) => ({
        id: prueba.id ?? `${estudio.codigo || estudio.id}_${prueba.codigo || Math.random()}`,
        codigo: prueba.codigo ?? prueba.id,
        nombre: prueba.nombre ?? prueba.codigo ?? prueba.id,
        tipo: prueba.tipo ?? 'texto',
        resultado: prueba.resultado ?? null,
        valorMinimo: prueba.valorMinimo,
        valorMaximo: prueba.valorMaximo,
        unidad: prueba.unidad,
        estado: prueba.estado ?? 'pendiente',
        usuarioCargo: prueba.usuarioCargo,
        fechaCarga: prueba.fechaCarga,
        usuarioValido: prueba.usuarioValido,
        fechaValidacion: prueba.fechaValidacion
      }))
    }
  }

  const codigo = estudio.codigo || estudio.id || 'OTR'
  return catalogoEstudios[codigo] || {
    id: codigo,
    codigo,
    nombre: estudio.nombre || codigo,
    sectorId: estudio.sectorId || 'OTR',
    sector: estudio.sector || { nombre: 'Otros' },
    pruebas: []
  }
}

export const normalizarOrden = (orden: any) => {
  if (!orden) return orden

  return {
    ...orden,
    estudios: Array.isArray(orden.estudios)
      ? orden.estudios.map(normalizarEstudio).filter(Boolean)
      : []
  }
}

export const calcularEstadoOrden = (orden: any) => {
  if (!orden || !Array.isArray(orden.estudios)) {
    return orden?.estado || 'generada'
  }

  const pruebas = orden.estudios.flatMap((estudio: any) => Array.isArray(estudio.pruebas) ? estudio.pruebas : [])
  if (pruebas.length === 0) {
    return orden.estado || 'generada'
  }

  const validadas = pruebas.filter((prueba: any) => prueba.estado === 'validado').length
  const cargadas = pruebas.filter((prueba: any) => prueba.estado === 'cargado' || prueba.estado === 'validado').length

  if (validadas === pruebas.length) {
    return 'completada'
  }

  if (cargadas > 0) {
    return 'en_proceso'
  }

  return orden.estado || 'generada'
}

export const prepararOrdenParaGuardarResultados = (orden: any) => {
  const ordenNormalizada = normalizarOrden(orden)

  return {
    ...ordenNormalizada,
    estudios: ordenNormalizada.estudios.map((estudio: any) => ({
      id: estudio.id,
      codigo: estudio.codigo,
      nombre: estudio.nombre,
      sectorId: estudio.sectorId,
      sector: estudio.sector,
      pruebas: Array.isArray(estudio.pruebas)
        ? estudio.pruebas.map((prueba: any) => ({
            id: prueba.id,
            resultado: prueba.resultado ?? null,
            estado: prueba.estado,
            usuarioCargo: prueba.usuarioCargo,
            fechaCarga: prueba.fechaCarga,
            usuarioValido: prueba.usuarioValido,
            fechaValidacion: prueba.fechaValidacion
          }))
        : []
    }))
  }
}
