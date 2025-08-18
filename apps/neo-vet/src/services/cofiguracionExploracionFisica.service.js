// services/configuracionExploracionService.js
import { api } from '@/boot/axios' // Ajusta según tu configuración de Axios

export class ConfiguracionExploracionService {
  
  /**
   * Obtiene la configuración de exploración física para un sitio específico
   * @param {string} sitioId - ID del sitio
   * @returns {Promise<Array>} Lista de grupos de exploración configurados
   */
  async obtenerConfiguracionSitio(sitioId) {
    try {
      const response = await api.get(`/sitios/${sitioId}/configuracion-exploracion`)
      return response.data
    } catch (error) {
      console.error('Error al obtener configuración del sitio:', error)
      throw error
    }
  }

  /**
   * Guarda la configuración completa de exploración física para un sitio
   * @param {string} sitioId - ID del sitio
   * @param {Array} configuracion - Array de grupos de configuración
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async guardarConfiguracionSitio(sitioId, configuracion) {
    try {
      const response = await api.put(`/sitios/${sitioId}/configuracion-exploracion`, {
        grupos: configuracion
      })
      return response.data
    } catch (error) {
      console.error('Error al guardar configuración del sitio:', error)
      throw error
    }
  }

  /**
   * Crea un nuevo grupo de exploración
   * @param {string} sitioId - ID del sitio
   * @param {Object} grupo - Datos del grupo
   * @returns {Promise<Object>} Grupo creado
   */
  async crearGrupo(sitioId, grupo) {
    try {
      const response = await api.post(`/sitios/${sitioId}/configuracion-exploracion/grupos`, grupo)
      return response.data
    } catch (error) {
      console.error('Error al crear grupo:', error)
      throw error
    }
  }

  /**
   * Actualiza un grupo existente
   * @param {string} sitioId - ID del sitio
   * @param {string} grupoId - ID del grupo
   * @param {Object} grupo - Datos actualizados del grupo
   * @returns {Promise<Object>} Grupo actualizado
   */
  async actualizarGrupo(sitioId, grupoId, grupo) {
    try {
      const response = await api.put(`/sitios/${sitioId}/configuracion-exploracion/grupos/${grupoId}`, grupo)
      return response.data
    } catch (error) {
      console.error('Error al actualizar grupo:', error)
      throw error
    }
  }

  /**
   * Elimina un grupo de exploración
   * @param {string} sitioId - ID del sitio
   * @param {string} grupoId - ID del grupo
   * @returns {Promise<void>}
   */
  async eliminarGrupo(sitioId, grupoId) {
    try {
      await api.delete(`/sitios/${sitioId}/configuracion-exploracion/grupos/${grupoId}`)
    } catch (error) {
      console.error('Error al eliminar grupo:', error)
      throw error
    }
  }

  /**
   * Cambia el estado activo/inactivo de un grupo
   * @param {string} sitioId - ID del sitio
   * @param {string} grupoId - ID del grupo
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>} Grupo actualizado
   */
  async cambiarEstadoGrupo(sitioId, grupoId, activo) {
    try {
      const response = await api.patch(`/sitios/${sitioId}/configuracion-exploracion/grupos/${grupoId}/estado`, {
        activo
      })
      return response.data
    } catch (error) {
      console.error('Error al cambiar estado del grupo:', error)
      throw error
    }
  }

  /**
   * Obtiene plantillas predefinidas de grupos de exploración
   * @returns {Promise<Array>} Lista de plantillas disponibles
   */
  async obtenerPlantillas() {
    try {
      const response = await api.get('/configuracion-exploracion/plantillas')
      return response.data
    } catch (error) {
      console.error('Error al obtener plantillas:', error)
      throw error
    }
  }

  /**
   * Aplica una plantilla predefinida a un sitio
   * @param {string} sitioId - ID del sitio
   * @param {string} plantillaId - ID de la plantilla
   * @returns {Promise<Array>} Configuración aplicada
   */
  async aplicarPlantilla(sitioId, plantillaId) {
    try {
      const response = await api.post(`/sitios/${sitioId}/configuracion-exploracion/aplicar-plantilla`, {
        plantillaId
      })
      return response.data
    } catch (error) {
      console.error('Error al aplicar plantilla:', error)
      throw error
    }
  }

  /**
   * Exporta la configuración de un sitio
   * @param {string} sitioId - ID del sitio
   * @returns {Promise<Object>} Datos de configuración para exportar
   */
  async exportarConfiguracion(sitioId) {
    try {
      const response = await api.get(`/sitios/${sitioId}/configuracion-exploracion/exportar`)
      return response.data
    } catch (error) {
      console.error('Error al exportar configuración:', error)
      throw error
    }
  }

  /**
   * Importa configuración desde otro sitio o archivo
   * @param {string} sitioId - ID del sitio destino
   * @param {Object} configuracion - Datos de configuración a importar
   * @returns {Promise<Array>} Configuración importada
   */
  async importarConfiguracion(sitioId, configuracion) {
    try {
      const response = await api.post(`/sitios/${sitioId}/configuracion-exploracion/importar`, {
        configuracion
      })
      return response.data
    } catch (error) {
      console.error('Error al importar configuración:', error)
      throw error
    }
  }

  /**
   * Valida una configuración antes de guardarla
   * @param {Array} configuracion - Configuración a validar
   * @returns {Promise<Object>} Resultado de validación
   */
  async validarConfiguracion(configuracion) {
    try {
      const response = await api.post('/configuracion-exploracion/validar', {
        configuracion
      })
      return response.data
    } catch (error) {
      console.error('Error al validar configuración:', error)
      throw error
    }
  }

  /**
   * Obtiene el historial de cambios de configuración
   * @param {string} sitioId - ID del sitio
   * @param {number} limite - Número máximo de registros
   * @returns {Promise<Array>} Historial de cambios
   */
  async obtenerHistorial(sitioId, limite = 50) {
    try {
      const response = await api.get(`/sitios/${sitioId}/configuracion-exploracion/historial`, {
        params: { limite }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener historial:', error)
      throw error
    }
  }

  /**
   * Restaura una configuración desde el historial
   * @param {string} sitioId - ID del sitio
   * @param {string} versionId - ID de la versión a restaurar
   * @returns {Promise<Array>} Configuración restaurada
   */
  async restaurarVersion(sitioId, versionId) {
    try {
      const response = await api.post(`/sitios/${sitioId}/configuracion-exploracion/restaurar`, {
        versionId
      })
      return response.data
    } catch (error) {
      console.error('Error al restaurar versión:', error)
      throw error
    }
  }
}

// Composable para usar el servicio
export function useConfiguracionExploracion() {
  const service = new ConfiguracionExploracionService()
  
  const cargarConfiguracion = async (sitioId) => {
    try {
      const configuracion = await service.obtenerConfiguracionSitio(sitioId)
      return configuracion
    } catch (error) {
      // Manejar error o mostrar notificación
      throw error
    }
  }

  const guardarConfiguracion = async (sitioId, configuracion) => {
    try {
      const resultado = await service.guardarConfiguracionSitio(sitioId, configuracion)
      return resultado
    } catch (error) {
      // Manejar error o mostrar notificación
      throw error
    }
  }

  const aplicarPlantilla = async (sitioId, plantillaId) => {
    try {
      const configuracion = await service.aplicarPlantilla(sitioId, plantillaId)
      return configuracion
    } catch (error) {
      throw error
    }
  }

  return {
    service,
    cargarConfiguracion,
    guardarConfiguracion,
    aplicarPlantilla
  }
}

// Plantillas predefinidas comunes
export const PLANTILLAS_EXPLORACION = {
  CANINOS_BASICA: {
    id: 'caninos_basica',
    nombre: 'Exploración Básica - Caninos',
    descripcion: 'Configuración básica para exploración física de caninos',
    grupos: [
      {
        id: 'signos_vitales',
        nombre: 'Signos Vitales',
        descripcion: 'Mediciones básicas de signos vitales',
        icono: 'thermostat',
        color: 'red',
        orden: 1,
        activo: true,
        preguntas: [
          {
            id: 'temperatura',
            etiqueta: 'Temperatura (°C)',
            codigo: 'temperatura',
            tipo: 'numerico',
            requerido: true,
            minimo: 37,
            maximo: 40,
            unidad: '°C',
            paso: '0.1',
            orden: 1
          },
          {
            id: 'fc',
            etiqueta: 'Frecuencia Cardíaca (lpm)',
            codigo: 'frecuencia_cardiaca',
            tipo: 'numerico',
            requerido: true,
            minimo: 60,
            maximo: 180,
            unidad: 'lpm',
            orden: 2
          },
          {
            id: 'fr',
            etiqueta: 'Frecuencia Respiratoria (rpm)',
            codigo: 'frecuencia_respiratoria',
            tipo: 'numerico',
            requerido: true,
            minimo: 10,
            maximo: 40,
            unidad: 'rpm',
            orden: 3
          },
          {
            id: 'peso',
            etiqueta: 'Peso (kg)',
            codigo: 'peso',
            tipo: 'numerico',
            requerido: true,
            minimo: 0.5,
            maximo: 100,
            unidad: 'kg',
            paso: '0.1',
            orden: 4
          }
        ]
      },
      {
        id: 'examen_general',
        nombre: 'Examen General',
        descripcion: 'Evaluación general del paciente',
        icono: 'pets',
        color: 'blue',
        orden: 2,
        activo: true,
        preguntas: [
          {
            id: 'actitud',
            etiqueta: 'Actitud',
            codigo: 'actitud',
            tipo: 'select',
            requerido: true,
            orden: 1,
            opciones: [
              { label: 'Alerta', value: 'alerta' },
              { label: 'Deprimido', value: 'deprimido' },
              { label: 'Letárgico', value: 'letargico' },
              { label: 'Estuporoso', value: 'estuporoso' }
            ]
          },
          {
            id: 'condicion_corporal',
            etiqueta: 'Condición Corporal (1-9)',
            codigo: 'condicion_corporal',
            tipo: 'numerico',
            requerido: true,
            minimo: 1,
            maximo: 9,
            paso: '0.5',
            orden: 2
          },
          {
            id: 'hidratacion',
            etiqueta: 'Estado de Hidratación',
            codigo: 'hidratacion',
            tipo: 'select',
            requerido: true,
            orden: 3,
            opciones: [
              { label: 'Normal', value: 'normal' },
              { label: 'Deshidratación leve (5%)', value: 'leve' },
              { label: 'Deshidratación moderada (7-8%)', value: 'moderada' },
              { label: 'Deshidratación severa (>10%)', value: 'severa' }
            ]
          }
        ]
      }
    ]
  },
  
  FELINOS_BASICA: {
    id: 'felinos_basica',
    nombre: 'Exploración Básica - Felinos',
    descripcion: 'Configuración básica para exploración física de felinos',
    grupos: [
      {
        id: 'signos_vitales',
        nombre: 'Signos Vitales',
        descripcion: 'Mediciones básicas de signos vitales para felinos',
        icono: 'thermostat',
        color: 'red',
        orden: 1,
        activo: true,
        preguntas: [
          {
            id: 'temperatura',
            etiqueta: 'Temperatura (°C)',
            codigo: 'temperatura',
            tipo: 'numerico',
            requerido: true,
            minimo: 37.7,
            maximo: 39.2,
            unidad: '°C',
            paso: '0.1',
            orden: 1
          },
          {
            id: 'fc',
            etiqueta: 'Frecuencia Cardíaca (lpm)',
            codigo: 'frecuencia_cardiaca',
            tipo: 'numerico',
            requerido: true,
            minimo: 120,
            maximo: 240,
            unidad: 'lpm',
            orden: 2
          },
          {
            id: 'fr',
            etiqueta: 'Frecuencia Respiratoria (rpm)',
            codigo: 'frecuencia_respiratoria',
            tipo: 'numerico',
            requerido: true,
            minimo: 20,
            maximo: 40,
            unidad: 'rpm',
            orden: 3
          },
          {
            id: 'peso',
            etiqueta: 'Peso (kg)',
            codigo: 'peso',
            tipo: 'numerico',
            requerido: true,
            minimo: 0.5,
            maximo: 15,
            unidad: 'kg',
            paso: '0.1',
            orden: 4
          }
        ]
      }
    ]
  },

  EXOTICOS_BASICA: {
    id: 'exoticos_basica',
    nombre: 'Exploración Básica - Exóticos',
    descripcion: 'Configuración básica para animales exóticos',
    grupos: [
      {
        id: 'signos_vitales',
        nombre: 'Signos Vitales',
        descripcion: 'Mediciones adaptadas para animales exóticos',
        icono: 'thermostat',
        color: 'red',
        orden: 1,
        activo: true,
        preguntas: [
          {
            id: 'temperatura',
            etiqueta: 'Temperatura (°C)',
            codigo: 'temperatura',
            tipo: 'numerico',
            requerido: true,
            minimo: 35,
            maximo: 42,
            unidad: '°C',
            paso: '0.1',
            orden: 1
          },
          {
            id: 'peso',
            etiqueta: 'Peso (gramos)',
            codigo: 'peso',
            tipo: 'numerico',
            requerido: true,
            minimo: 10,
            unidad: 'g',
            paso: '1',
            orden: 2
          },
          {
            id: 'especie_especifica',
            etiqueta: 'Consideraciones Específicas de Especie',
            codigo: 'especie_especifica',
            tipo: 'textarea',
            requerido: false,
            orden: 3,
            placeholder: 'Registre consideraciones específicas para esta especie...'
          }
        ]
      }
    ]
  }
}

// Utilidades para validación
export const validarConfiguracion = (configuracion) => {
  const errores = []
  
  if (!Array.isArray(configuracion)) {
    errores.push('La configuración debe ser un array de grupos')
    return { valida: false, errores }
  }

  configuracion.forEach((grupo, grupoIndex) => {
    // Validar estructura del grupo
    if (!grupo.id) {
      errores.push(`Grupo ${grupoIndex + 1}: ID es requerido`)
    }
    if (!grupo.nombre) {
      errores.push(`Grupo ${grupoIndex + 1}: Nombre es requerido`)
    }
    if (!grupo.icono) {
      errores.push(`Grupo ${grupoIndex + 1}: Icono es requerido`)
    }
    if (!grupo.color) {
      errores.push(`Grupo ${grupoIndex + 1}: Color es requerido`)
    }

    // Validar preguntas
    if (!Array.isArray(grupo.preguntas)) {
      errores.push(`Grupo ${grupo.nombre || grupoIndex + 1}: Las preguntas deben ser un array`)
      return
    }

    const codigosPregunta = new Set()
    grupo.preguntas.forEach((pregunta, preguntaIndex) => {
      if (!pregunta.id) {
        errores.push(`Grupo ${grupo.nombre}, Pregunta ${preguntaIndex + 1}: ID es requerido`)
      }
      if (!pregunta.codigo) {
        errores.push(`Grupo ${grupo.nombre}, Pregunta ${preguntaIndex + 1}: Código es requerido`)
      } else if (codigosPregunta.has(pregunta.codigo)) {
        errores.push(`Grupo ${grupo.nombre}: Código duplicado "${pregunta.codigo}"`)
      } else {
        codigosPregunta.add(pregunta.codigo)
      }
      
      if (!pregunta.etiqueta) {
        errores.push(`Grupo ${grupo.nombre}, Pregunta ${preguntaIndex + 1}: Etiqueta es requerida`)
      }
      if (!pregunta.tipo) {
        errores.push(`Grupo ${grupo.nombre}, Pregunta ${preguntaIndex + 1}: Tipo es requerido`)
      }

      // Validaciones específicas por tipo
      if (pregunta.tipo === 'select' && (!pregunta.opciones || pregunta.opciones.length === 0)) {
        errores.push(`Grupo ${grupo.nombre}, Pregunta ${pregunta.etiqueta}: Las preguntas de selección deben tener opciones`)
      }

      if (pregunta.tipo === 'numerico') {
        if (pregunta.minimo !== null && pregunta.maximo !== null && pregunta.minimo > pregunta.maximo) {
          errores.push(`Grupo ${grupo.nombre}, Pregunta ${pregunta.etiqueta}: El mínimo no puede ser mayor que el máximo`)
        }
      }
    })
  })

  return {
    valida: errores.length === 0,
    errores
  }
}

// Utilidad para migrar configuraciones antiguas
export const migrarConfiguracion = (configuracionAntigua, version = '1.0') => {
  // Aquí implementarías la lógica de migración según la versión
  // Por ejemplo, convertir formatos antiguos al nuevo formato
  
  return {
    version,
    grupos: configuracionAntigua,
    migrada: true,
    fechaMigracion: new Date().toISOString()
  }
}