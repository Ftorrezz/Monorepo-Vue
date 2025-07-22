import { defineStore } from 'pinia'

export const useMascotaSeleccionadaStore = defineStore('mascotaSeleccionada', {
  state: () => ({
    mascota: null as any // { id, nombre, especie, raza, edad, propietario, telefono, ... }
  }),
  actions: {
    setMascota(mascota: any) {
      this.mascota = mascota
    },
    limpiarMascota() {
      this.mascota = null
    }
  },
  persist: true // Opcional: persiste la selección al recargar
}) 