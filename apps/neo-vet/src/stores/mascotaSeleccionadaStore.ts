import { defineStore } from 'pinia'

export interface MascotaSeleccionada {
  id: number | string | null
  paciente_id: number | string | null
  nombre: string
  historiaclinica?: string
  propietarioId?: number | string | null
  propietario?: Record<string, any>
  [key: string]: any
}

export const useMascotaSeleccionadaStore = defineStore('mascotaSeleccionada', {
  state: () => ({
    mascota: null as MascotaSeleccionada | null
  }),
  getters: {
    idPaciente: (state): number | string | null => state.mascota?.paciente_id ?? null,
    tieneMascotaSeleccionada: (state): boolean => state.mascota !== null
  },
  actions: {
    setMascota(mascota: MascotaSeleccionada) {
      this.mascota = mascota
    },
    limpiarMascota() {
      this.mascota = null
    }
  },
  persist: true
})
