export class ServiciosFactory {
    static crearServicio(tipo, atencionId, datosIniciales = {}) {
      const serviciosMap = {
        'vacunacion': {
          componente: 'ServicioVacunacion',
          icono: 'vaccines',
          color: 'green',
          titulo: 'Vacunación'
        },
        'desparacitacion': {
          componente: 'ServicioDesparacitacion',
          icono: 'medication',
          color: 'orange',
          titulo: 'Desparacitación'
        },
        'exploracion': {
          componente: 'ServicioExploracion',
          icono: 'health_and_safety',
          color: 'blue',
          titulo: 'Exploración Física'
        },
        'cirugia': {
          componente: 'ServicioCirugia',
          icono: 'local_hospital',
          color: 'red',
          titulo: 'Cirugía'
        },
        'laboratorio': {
          componente: 'ServicioLaboratorio',
          icono: 'biotech',
          color: 'teal',
          titulo: 'Análisis de Laboratorio'
        },
        'certificado': {
          componente: 'ServicioCertificado',
          icono: 'description',
          color: 'purple',
          titulo: 'Certificado'
        }
      }
      
      const config = serviciosMap[tipo]
      if (!config) {
        throw new Error(`Tipo de servicio no reconocido: ${tipo}`)
      }
      
      return {
        id: `${tipo}_${Date.now()}`,
        atencionId,
        tipo,
        ...config,
        timestamp: new Date().toISOString(),
        datos: datosIniciales,
        estado: 'pendiente'
      }
    }
    
    static obtenerComponente(tipo) {
      const componentes = {
        'vacunacion': ServicioVacunacion,
        'desparacitacion': ServicioDesparacitacion,
        // ... otros componentes
      }
      
      return componentes[tipo] || null
    }
  }
  