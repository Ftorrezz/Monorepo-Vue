import { defineStore } from 'pinia'
import { ref } from 'vue'
import LaboratorioService from 'src/services/laboratorio.service'

export const useOrdenLaboratorioStore = defineStore('ordenLaboratorio', () => {
  const ordenes = ref<any[]>([])
  const ordenSeleccionada = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cargarOrdenes = async () => {
    loading.value = true
    error.value = null

    try {
      const respuesta = await LaboratorioService.obtenerOrdenes()
      ordenes.value = Array.isArray(respuesta) ? respuesta : []
    } catch (err: any) {
      error.value = err?.message || 'Error al cargar órdenes de laboratorio.'
    } finally {
      loading.value = false
    }
  }

  const seleccionarOrden = (orden: any) => {
    ordenSeleccionada.value = orden
  }

  const crearOrden = async (orden: any) => {
    loading.value = true
    error.value = null

    try {
      const respuesta = await LaboratorioService.crearOrden(orden)
      ordenes.value.unshift(respuesta)
      return respuesta
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
      const respuesta = await LaboratorioService.actualizarOrden(orden)
      const index = ordenes.value.findIndex((item) => item.id === respuesta.id)
      if (index !== -1) {
        ordenes.value[index] = respuesta
      }
      if (ordenSeleccionada.value?.id === respuesta.id) {
        ordenSeleccionada.value = respuesta
      }
      return respuesta
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
      fechaRecepcion: new Date().toISOString()
    }

    const respuesta = await actualizarOrden(ordenRecepcionada)
    return respuesta
  }

  return {
    ordenes,
    ordenSeleccionada,
    loading,
    error,
    cargarOrdenes,
    seleccionarOrden,
    crearOrden,
    actualizarOrden,
    recepcionarOrden,
  }
})
