import { ref } from 'vue'
import LaboratorioService from 'src/services/laboratorio.service'
import { normalizarOrden, prepararOrdenParaGuardarResultados, calcularEstadoOrden } from './laboratorioOrdenHelpers'

const ordenes = ref<any[]>([])
const ordenSeleccionada = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const service = LaboratorioService

export default function useLaboratorioOrdenes() {
  const cargarOrdenes = async () => {
    loading.value = true
    error.value = null

    try {
      const respuesta = await service.obtenerOrdenes()
      ordenes.value = Array.isArray(respuesta) ? respuesta.map(normalizarOrden) : []
      const seleccion = ordenSeleccionada.value
      if (seleccion && seleccion.id) {
        const ordenActualizada = ordenes.value.find(item => item.id === seleccion.id)
        if (ordenActualizada) {
          ordenSeleccionada.value = ordenActualizada
        }
      }
    } catch (err: any) {
      error.value = err?.message || 'Error al cargar órdenes de laboratorio.'
    } finally {
      loading.value = false
    }
  }

  const cargarOrden = async (id: string | number) => {
    loading.value = true
    error.value = null

    try {
      const respuesta = await service.obtenerOrden(id)
      const ordenNormalizada = normalizarOrden(respuesta)
      ordenSeleccionada.value = ordenNormalizada
      const index = ordenes.value.findIndex(item => item.id === ordenNormalizada.id)
      if (index !== -1) {
        ordenes.value[index] = ordenNormalizada
      } else {
        ordenes.value.unshift(ordenNormalizada)
      }
      return ordenNormalizada
    } catch (err: any) {
      error.value = err?.message || 'Error al cargar la orden seleccionada.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const seleccionarOrden = (orden: any) => {
    if (!orden) {
      ordenSeleccionada.value = null
      return
    }

    const ordenNormalizada = normalizarOrden(orden)
    ordenSeleccionada.value = ordenNormalizada

    const index = ordenes.value.findIndex(item => item.id === ordenNormalizada.id)
    if (index !== -1) {
      ordenes.value[index] = ordenNormalizada
    }
  }

  const crearOrden = async (orden: any) => {
    loading.value = true
    error.value = null

    try {
      const respuesta = await service.crearOrden(orden)
      const ordenNormalizada = normalizarOrden(respuesta)
      ordenes.value.unshift(ordenNormalizada)
      ordenSeleccionada.value = ordenNormalizada
      return ordenNormalizada
    } catch (err: any) {
      error.value = err?.message || 'Error al crear la orden.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarOrden = async (orden: any) => {
    loading.value = true
    error.value = null

    try {
      const respuesta = await service.actualizarOrden(orden)
      const ordenNormalizada = normalizarOrden(respuesta)
      const index = ordenes.value.findIndex((item) => item.id === ordenNormalizada.id)
      if (index !== -1) {
        ordenes.value[index] = ordenNormalizada
      }
      if (ordenSeleccionada.value?.id === ordenNormalizada.id) {
        ordenSeleccionada.value = ordenNormalizada
      }
      return ordenNormalizada
    } catch (err: any) {
      error.value = err?.message || 'Error al actualizar la orden.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const recepcionarOrden = async (orden: any) => {
    const ordenRecepcionada = {
      ...orden,
      estado: 'recepcionada',
      fechaRecepcion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }

    return await actualizarOrden(ordenRecepcionada)
  }

  const generarOrden = async (orden: any) => {
    const ordenGenerada = {
      ...orden,
      estado: 'generada',
      fechaGeneracion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }

    return await actualizarOrden(ordenGenerada)
  }

  const guardarResultados = async (orden: any) => {
    if (!orden || !orden.id) {
      throw new Error('Orden inválida para guardar resultados.')
    }

    loading.value = true
    error.value = null

    try {
      const ordenActualizada = {
        ...orden,
        estado: calcularEstadoOrden(orden),
        fechaActualizacion: new Date().toISOString()
      }
      const payload = prepararOrdenParaGuardarResultados(ordenActualizada)
      const respuesta = await service.guardarResultados(orden.id, payload)
      const ordenNormalizada = normalizarOrden(respuesta)
      const index = ordenes.value.findIndex((item) => item.id === ordenNormalizada.id)
      if (index !== -1) {
        ordenes.value[index] = ordenNormalizada
      } else {
        ordenes.value.unshift(ordenNormalizada)
      }
      if (ordenSeleccionada.value?.id === ordenNormalizada.id) {
        ordenSeleccionada.value = ordenNormalizada
      }
      return ordenNormalizada
    } catch (err: any) {
      error.value = err?.message || 'Error al guardar resultados de la orden.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarOrdenLocal = (orden: any) => {
    if (!orden || !orden.id) {
      return
    }

    const ordenNormalizada = normalizarOrden(orden)
    const index = ordenes.value.findIndex((item) => item.id === ordenNormalizada.id)
    if (index !== -1) {
      ordenes.value[index] = ordenNormalizada
    }
    if (ordenSeleccionada.value?.id === ordenNormalizada.id) {
      ordenSeleccionada.value = ordenNormalizada
    }
  }

  return {
    ordenes,
    ordenSeleccionada,
    loading,
    error,
    cargarOrdenes,
    cargarOrden,
    seleccionarOrden,
    crearOrden,
    actualizarOrden,
    recepcionarOrden,
    generarOrden,
    guardarResultados,
    actualizarOrdenLocal,
  }
}
