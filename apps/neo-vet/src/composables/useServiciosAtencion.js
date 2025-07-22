import { ref, computed } from 'vue'

export function useServiciosAtencion() {
  const serviciosAplicados = ref([])
  
  const agregarServicio = (tipoServicio, atencionId, datosIniciales = {}) => {
    const nuevoServicio = {
      id: `${tipoServicio}_${Date.now()}`,
      atencionId,
      tipo: tipoServicio,
      timestamp: new Date().toISOString(),
      fechaCreacion: new Date().toLocaleDateString(),
      horaCreacion: new Date().toLocaleTimeString(),
      estado: 'pendiente', // pendiente, en_proceso, completado
      datos: datosIniciales,
      observaciones: '',
      completado: false
    }
    
    serviciosAplicados.value.push(nuevoServicio)
    return nuevoServicio.id
  }
  
  const actualizarServicio = (servicioId, nuevos_datos) => {
    const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
    if (servicio) {
      servicio.datos = { ...servicio.datos, ...nuevos_datos }
      servicio.fechaModificacion = new Date().toISOString()
    }
  }
  
  const completarServicio = (servicioId) => {
    const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
    if (servicio) {
      servicio.completado = true
      servicio.estado = 'completado'
      servicio.fechaCompletado = new Date().toISOString()
    }
  }
  
  const eliminarServicio = (servicioId) => {
    const index = serviciosAplicados.value.findIndex(s => s.id === servicioId)
    if (index > -1) {
      serviciosAplicados.value.splice(index, 1)
    }
  }
  
  const obtenerServiciosPorAtencion = (atencionId) => {
    return computed(() => 
      serviciosAplicados.value.filter(s => s.atencionId === atencionId)
    )
  }
  
  return {
    serviciosAplicados,
    agregarServicio,
    actualizarServicio,
    completarServicio,
    eliminarServicio,
    obtenerServiciosPorAtencion
  }
}