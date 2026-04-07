import PeticionService from 'src/services/peticion.service'

const peticionService = new PeticionService()

export interface PlantillaServicio {
    id?: number
    id_plantilla: number
    id_servicio: number
    activo: string // 'S' o 'N'
}

export const plantillaServicioService = {
    async getPorServicio(idServicio: number): Promise<PlantillaServicio[]> {
        const response = await peticionService.obtenerGet('plantillaservicio', {
            filtro: { id_servicio: idServicio }
        })

        let data: PlantillaServicio[] = []
        if (Array.isArray(response) && response[0]?.elemento) {
            data = response[0].elemento
        } else {
            data = Array.isArray(response) ? response : (response?.data || [])
        }

        // Filtro de seguridad por si el backend ignora el filtro del DTO
        return data.filter(p => Number(p.id_servicio) === Number(idServicio))
    },

    async create(data: PlantillaServicio) {
        return await peticionService.crear('plantillaservicio', data)
    },

    async update(id: number, data: Partial<PlantillaServicio>) {
        return await peticionService.actualizar('plantillaservicio', { ...data, id })
    },

    async syncPlantillas(idServicio: number, idsPlantillas: number[] = []) {
        // Asegurar que idsPlantillas sea un array
        const p_ids = Array.isArray(idsPlantillas) ? idsPlantillas : []
        const idS = Number(idServicio)

        // Obtenemos las actuales
        const actuales = await plantillaServicioService.getPorServicio(idS)
        const idsActuales = actuales.filter(a => a.activo === 'S').map(a => Number(a.id_plantilla))
        const idsNuevos = p_ids.map(id => Number(id))

        // Determinar cuáles agregar o reactivar
        for (const idP of idsNuevos) {
            if (!idsActuales.includes(idP)) {
                // Si existe pero estaba inactiva para este servicio específico, activarla
                const existenteInactiva = actuales.find(a =>
                    Number(a.id_plantilla) === idP &&
                    a.activo === 'N' &&
                    Number(a.id_servicio) === idS
                )

                if (existenteInactiva && existenteInactiva.id) {
                    await plantillaServicioService.update(existenteInactiva.id, {
                        id_servicio: idS,
                        id_plantilla: idP,
                        activo: 'S'
                    })
                } else {
                    // Crear nueva entrada para este servicio/plantilla
                    await plantillaServicioService.create({
                        id_plantilla: idP,
                        id_servicio: idS,
                        activo: 'S'
                    })
                }
            }
        }

        // Determinar cuáles desactivar
        for (const actual of actuales) {
            const idActualP = Number(actual.id_plantilla)
            if (actual.activo === 'S' && !idsNuevos.includes(idActualP)) {
                if (actual.id) {
                    await plantillaServicioService.update(actual.id, {
                        id_servicio: idS,
                        id_plantilla: idActualP,
                        activo: 'N'
                    })
                }
            }
        }
    }
}
