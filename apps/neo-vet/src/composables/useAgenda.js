import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import NdPeticionControl from 'src/controles/rest.control'
import { useDialogStore } from 'neo-vet/src/stores/DialogoUbicacion'
import { usePlantillas } from 'src/composables/usePlantillas'

export function useAgenda() {
    const $q = useQuasar()
    const store = useDialogStore()
    const { cargarPlantillaPorCodigo, generarPDF, procesarHtml } = usePlantillas()

    // Estados principales
    const currentDate = ref(new Date())
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth())
    const selectedService = ref(null)
    const selectedSlot = ref(null)
    const viewMode = ref('month')
    const dayViewMode = ref('cards')
    const selectedDate = ref(new Date())
    const showDatePicker = ref(false)
    const sidebarCollapsed = ref(false)

    // Estados para cache y carga
    const disponibilidadCache = ref({})
    const citasCache = ref({})
    const isLoadingDisponibilidad = ref(false)

    // Estados adicionales
    const mostrarDialogoAsignarCita = ref(false)
    const slotSeleccionado = ref(null)

    // Días de la semana
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    const dayColumns = ref([
        { name: 'time', required: true, label: 'Hora', align: 'left', field: 'time', sortable: false, style: 'width: 120px' },
        { name: 'status', label: 'Estado', align: 'center', field: 'status', sortable: false, style: 'width: 140px' },
        { name: 'owner', label: 'Propietario', align: 'left', field: row => row.appointment?.ownerName || '', sortable: false, style: 'width: 200px' },
        { name: 'pet', label: 'Mascota', align: 'left', field: row => row.appointment?.petName || '', sortable: false, style: 'width: 180px' },
        { name: 'service', label: 'Servicio', align: 'left', field: 'service', sortable: false, style: 'width: 180px' },
        { name: 'actions', label: 'Acciones', align: 'center', field: 'actions', sortable: false, style: 'width: 150px' }
    ])

    // Servicios disponibles
    const services = ref([])
    const serviceSearch = ref('')
    const serviceSchedules = ref({})

    // Helper para generar claves de fecha consistentes (YYYY-MM-DD)
    const formatDateKey = (date) => {
        if (!date) return ''

        // 1. Si es un string, intentar extraer YYYY-MM-DD o YYYY/MM/DD
        if (typeof date === 'string') {
            const match = date.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
            if (match) return `${match[1]}-${match[2]}-${match[3]}`;
        }

        const d = new Date(date)
        if (isNaN(d.getTime())) return ''

        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // ============================================
    // FUNCIONES DE BACKEND
    // ============================================

    const loadServices = async () => {
        try {
            const peticion = new NdPeticionControl()
            const response = await peticion.invocarMetodo('servicioagenda', 'get')
            const data = Array.isArray(response) ? response : (response?.data || [])

            if (Array.isArray(data)) {
                services.value = data.map(s => ({
                    id: s.id,
                    name: s.nombre,
                    duration: s.duracion_minutos,
                    price: s.precio,
                    icon: s.icono || 'pets',
                    color: s.color || 'blue',
                    active: s.activo,
                    urgency: s.urgencias
                }))
            }
        } catch (error) {
            $q.notify({ type: 'negative', message: 'Error al cargar los servicios', caption: error.message })
        }
    }

    const loadServiceSchedules = async () => {
        try {
            const peticion = new NdPeticionControl()
            const response = await peticion.invocarMetodo('servicioagendahorario', 'get')
            const data = Array.isArray(response) ? response : (response?.data || [])

            if (Array.isArray(data)) {
                const grouped = {}
                data.forEach(item => {
                    const servicioId = Number(item.id_servicio ?? item.idServicio ?? item.servicio_id ?? item.ServicioId)
                    if (!servicioId) return
                    grouped[servicioId] = [...(grouped[servicioId] || []), item]
                })
                serviceSchedules.value = grouped
            }
        } catch (error) {
            console.error('Error al cargar horarios del servicio', error)
        }
    }

    const getServiceSchedulesByDay = (idServicio, fecha) => {
        const horarios = serviceSchedules.value[Number(idServicio)] || []
        if (!Array.isArray(horarios) || horarios.length === 0) return []

        const diaSemana = new Date(fecha).getDay()

        return horarios.filter(horario => {
            const activo = horario?.activo ?? horario?.activo_horario ?? horario?.es_activo ?? 'S'
            const activoFlag = String(activo).toUpperCase() === 'S' || activo === true || activo === 1 || activo === 'Y'
            const dia = Number(horario.dia_semana ?? horario?.diaSemana ?? horario?.dia ?? 0)
            return activoFlag && dia === diaSemana
        })
    }

    const hasServiceScheduleForDate = (idServicio, fecha) => {
        if (!idServicio || !fecha) return false
        return getServiceSchedulesByDay(idServicio, fecha).length > 0
    }

    const toMinutes = (timeValue) => {
        if (!timeValue && timeValue !== 0) return 0
        if (typeof timeValue === 'number') return timeValue

        const text = String(timeValue).trim()
        if (!text || text === 'null' || text === 'undefined') return 0

        const [hours, minutes] = text.split(':').map(Number)
        return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0)
    }

    const formatMinutesToTime = (totalMinutes) => {
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }

    const getNestedValue = (obj, path) => {
        if (!obj || !path) return undefined
        const segments = Array.isArray(path) ? path : String(path).split('.')
        let current = obj
        for (const segment of segments) {
            if (current == null) return undefined
            current = current[segment]
        }
        return current
    }

    const normalizeName = (...values) => {
        const name = values
            .flatMap(value => Array.isArray(value) ? value : [value])
            .map(item => String(item ?? '').trim())
            .filter(Boolean)
            .join(' ')
        return name || 'Sin nombre'
    }

    const buildAppointmentFromHorario = (horario) => {
        if (!horario) return null

        const ownerName = normalizeName(
            horario.nombre_propietario,
            horario.propietario_poblador_nombre,
            horario.propietario_poblador_primerapellido,
            horario.propietario_poblador_segundoapellido,
            getNestedValue(horario, 'propietario.nombre'),
            getNestedValue(horario, 'propietario.apellido'),
            getNestedValue(horario, 'cita.propietario.nombre'),
            getNestedValue(horario, 'cita.nombre_propietario')
        )

        const petName = normalizeName(
            horario.nombre_mascota,
            getNestedValue(horario, 'mascota.nombre'),
            getNestedValue(horario, 'cita.nombre_mascota'),
            getNestedValue(horario, 'cita.mascota.nombre')
        )

        const ownerPhone = normalizeName(
            horario.propietario_poblador_telefono,
            horario.telefono_propietario,
            getNestedValue(horario, 'propietario.telefono'),
            getNestedValue(horario, 'cita.propietario.telefono'),
            ''
        )

        const petType = normalizeName(
            horario.mascota_especie,
            getNestedValue(horario, 'mascota.especie'),
            getNestedValue(horario, 'cita.mascota.especie'),
            getNestedValue(horario, 'cita.especie'),
            'Mascota'
        )

        const professionalName = normalizeName(
            horario.profesional_nombre,
            getNestedValue(horario, 'cita.profesional.nombre'),
            getNestedValue(horario, 'cita.profesional_nombre'),
            'No asignado'
        )

        return {
            id: horario.cita?.id || horario.id_cita || horario.id,
            ownerName,
            ownerPhone: ownerPhone === 'Sin nombre' ? '' : ownerPhone,
            petName,
            petType: petType === 'Sin nombre' ? 'Mascota' : petType,
            professionalName: professionalName === 'Sin nombre' ? 'No asignado' : professionalName
        }
    }

    const buildAppointmentFromCita = (cita) => {
        if (!cita) return null

        const ownerName = normalizeName(
            getNestedValue(cita, 'propietario.nombre'),
            getNestedValue(cita, 'propietario.apellido'),
            getNestedValue(cita, 'propietario.primerapellido'),
            getNestedValue(cita, 'propietario.segundoapellido'),
            getNestedValue(cita, 'cliente.nombre'),
            getNestedValue(cita, 'cliente.apellido'),
            cita.nombre_propietario,
            cita.propietario_nombre,
            cita.ownerName,
            getNestedValue(cita, 'mascota.propietario.nombre')
        )

        const petName = normalizeName(
            getNestedValue(cita, 'mascota.nombre'),
            getNestedValue(cita, 'pet.nombre'),
            cita.nombre_mascota,
            cita.petName,
            getNestedValue(cita, 'mascota.nombre_mascota')
        )

        const petType = normalizeName(
            getNestedValue(cita, 'mascota.especie'),
            getNestedValue(cita, 'pet.especie'),
            cita.especie,
            cita.petType,
            'Mascota'
        )

        const professionalName = normalizeName(
            getNestedValue(cita, 'profesional.nombre'),
            cita.profesional_nombre,
            cita.professionalName,
            'No asignado'
        )

        return {
            id: cita.id || cita.id_cita,
            ownerName,
            ownerPhone: normalizeName(getNestedValue(cita, 'propietario.telefono'), getNestedValue(cita, 'cliente.telefono'), cita.telefono_propietario, cita.ownerPhone, ''),
            petName,
            petType: petType === 'Sin nombre' ? 'Mascota' : petType,
            professionalName: professionalName === 'Sin nombre' ? 'No asignado' : professionalName
        }
    }

    const getServiceSlotsFromConfig = (servicio, fecha, citas = []) => {
        const horarios = getServiceSchedulesByDay(servicio.id, fecha)
        if (!Array.isArray(horarios) || horarios.length === 0) return []

        const citasPorHora = new Map()
        citas.forEach(cita => {
            const servicioId = Number(cita.id_servicio ?? cita.idServicio ?? cita.servicio_id ?? cita.ServicioId)
            const fechaCita = formatDateKey(cita.fecha_cita ?? cita.fecha ?? cita.FechaCita)
            const horaCita = cita.hora_cita ?? cita.hora ?? cita.HoraCita
            if (servicioId === Number(servicio.id) && fechaCita === formatDateKey(fecha)) {
                const horaNormalizada = String(horaCita).substring(0, 5)
                const citaMapped = buildAppointmentFromCita(cita)
                citasPorHora.set(horaNormalizada, citaMapped || { petName: 'Ocupado', ownerName: 'Cita ya registrada' })
            }
        })

        const slots = []
        horarios.forEach(horario => {
            const inicio = toMinutes(horario.hora_inicio ?? horario?.horaInicio)
            const fin = toMinutes(horario.hora_fin ?? horario?.horaFin)
            const interval = Number(horario.intervalo_minutos ?? servicio.duration ?? 30)

            if (!inicio || !fin || interval <= 0) return

            for (let minute = inicio; minute < fin; minute += interval) {
                const hora = formatMinutesToTime(minute)
                const appointment = citasPorHora.get(hora)
                const booked = Boolean(appointment)
                slots.push({
                    time: hora,
                    status: booked ? 'booked' : 'available',
                    id_slot: `${servicio.id}-${formatDateKey(fecha)}-${hora}`,
                    appointment: booked ? appointment : null
                })
            }
        })

        const unique = []
        const seen = new Set()
        slots.forEach(slot => {
            if (!seen.has(slot.time)) {
                unique.push(slot)
                seen.add(slot.time)
            }
        })

        return unique.sort((a, b) => a.time.localeCompare(b.time))
    }

    const buildAvailabilityFromServiceConfig = async (fecha) => {
        if (!selectedService.value) return []

        try {
            const citas = await loadCitasPorFecha(fecha)
            return getServiceSlotsFromConfig(selectedService.value, fecha, citas)
        } catch (error) {
            console.error('Error generando disponibilidad desde configuración del servicio', error)
            return []
        }
    }

    const loadDisponibilidad = async (idServicio, fechaInicio, fechaFin) => {
        try {
            const peticion = new NdPeticionControl()
            const queryParams = new URLSearchParams()
            queryParams.append('filtro[id_servicio]', idServicio)
            queryParams.append('filtro[fecha_inicio]', formatDateKey(fechaInicio))
            queryParams.append('filtro[fecha_fin]', formatDateKey(fechaFin))
            queryParams.append('filtro[id_sucursal]', store.id_sucursal)

            const response = await peticion.invocarMetodo(`agenda/disponibilidad?${queryParams.toString()}`, 'get')
            return Array.isArray(response) ? response : []
        } catch (error) {
            $q.notify({ type: 'negative', message: 'Error al cargar disponibilidad', caption: error.message })
            return []
        }
    }

    const loadDisponibilidadDia = async (idServicio, fecha) => {
        try {
            const peticion = new NdPeticionControl()
            const queryParams = new URLSearchParams()
            queryParams.append('filtro[id_servicio]', idServicio)
            queryParams.append('filtro[fecha]', formatDateKey(fecha))
            queryParams.append('filtro[id_sucursal]', store.id_sucursal)

            const response = await peticion.invocarMetodo(`agenda/disponibilidad/dia?${queryParams.toString()}`, 'get')
            return Array.isArray(response) ? response : []
        } catch (error) {
            $q.notify({ type: 'negative', message: 'Error al cargar disponibilidad del día', caption: error.message })
            return []
        }
    }

    const loadCitasPorFecha = async (fecha) => {
        try {
            const peticion = new NdPeticionControl()
            const queryParams = new URLSearchParams()
            queryParams.append('filtro[fecha]', formatDateKey(fecha))
            queryParams.append('filtro[id_sucursal]', store.id_sucursal)

            const response = await peticion.invocarMetodo(`agenda/citas/fecha?${queryParams.toString()}`, 'get')
            return Array.isArray(response) ? response : []
        } catch (error) {
            console.error('Error al cargar citas:', error)
            return []
        }
    }

    // ============================================
    // FUNCIONES DE PROCESAMIENTO
    // ============================================

    const loadDisponibilidadMes = async () => {
        if (!selectedService.value) return
        isLoadingDisponibilidad.value = true
        try {
            const firstDay = new Date(currentYear.value, currentMonth.value, 1)
            const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
            const nextCache = { ...disponibilidadCache.value }

            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                const dateKey = formatDateKey(d)
                const cacheKey = `${selectedService.value.id}-${dateKey}`
                delete nextCache[cacheKey]
            }

            disponibilidadCache.value = nextCache

            const response = await loadDisponibilidad(selectedService.value.id, firstDay, lastDay)
            if (Array.isArray(response) && response.length > 0) {
                procesarDisponibilidad(response)
            }

            const hayDisponibilidad = Object.values(disponibilidadCache.value).some(list => Array.isArray(list) && list.length > 0)
            if (!hayDisponibilidad) {
                $q.notify({ type: 'info', message: 'No hay horarios configurados para este período' })
            }
        } catch (error) {
            $q.notify({ type: 'negative', message: 'Error al cargar la disponibilidad', caption: error.message })
        } finally {
            isLoadingDisponibilidad.value = false
        }
    }

    const loadDisponibilidadDiaActual = async () => {
        if (!selectedService.value) return
        isLoadingDisponibilidad.value = true
        try {
            const fecha = selectedDate.value
            const dateKey = formatDateKey(fecha)
            const cacheKey = `${selectedService.value.id}-${dateKey}`

            const response = await loadDisponibilidadDia(selectedService.value.id, fecha)
            if (Array.isArray(response) && response.length > 0) {
                procesarDisponibilidadDia(response, fecha)
                return
            }

            if (!hasServiceScheduleForDate(selectedService.value.id, fecha)) {
                disponibilidadCache.value = {
                    ...disponibilidadCache.value,
                    [cacheKey]: []
                }
                $q.notify({ type: 'info', message: 'Este servicio no atiende ese día según su configuración' })
                return
            }

            const slots = await buildAvailabilityFromServiceConfig(fecha)
            disponibilidadCache.value = {
                ...disponibilidadCache.value,
                [cacheKey]: slots
            }

            const citas = await loadCitasPorFecha(fecha)
            procesarCitas(citas, fecha)

            if (!slots.length) {
                $q.notify({ type: 'info', message: 'No hay horarios disponibles para este día según la configuración del servicio' })
            }
        } catch (error) {
            $q.notify({ type: 'negative', message: 'Error al cargar la disponibilidad', caption: error.message })
        } finally {
            isLoadingDisponibilidad.value = false
        }
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return ''
        if (timeStr.includes('T')) {
            const date = new Date(timeStr)
            return String(date.getHours()).padStart(2, '0') + ':' +
                String(date.getMinutes()).padStart(2, '0')
        }
        return timeStr
    }

    const getStatus = (horario) => {
        console.log('horario', horario)
        if (!horario) return 'booked'
        const estado = String(horario.estado || '').toUpperCase()
        const disponible = horario.disponible === true || horario.disponible === 'true'

        if (disponible || estado === 'D' || estado === 'DISPONIBLE' || estado === 'X' || estado === 'CANCELADA') {
            return 'available'
        }

        if (estado === 'C' || estado === 'CONFIRMADA') {
            return 'confirmed'
        }

        if (estado === 'P' || estado === 'PROGRAMADA') {
            return 'booked'
        }

        return 'booked'
    }

    const procesarDisponibilidad = (disponibilidad) => {

        if (!Array.isArray(disponibilidad)) return
        disponibilidad.forEach(item => {
            const dateKey = formatDateKey(item.fecha)
            const cacheKey = `${selectedService.value.id}-${dateKey}`
            const slots = item.horarios?.map(horario => {
                const status = getStatus(horario)
                const appointment = (status === 'booked' || status === 'confirmed') ? buildAppointmentFromHorario(horario) : null

                return {
                    time: formatTime(horario.hora || horario.hora_inicio),
                    status: status,
                    id_slot: horario.id || horario.id_slot,
                    appointment
                }
            }) || []
            disponibilidadCache.value = {
                ...disponibilidadCache.value,
                [cacheKey]: slots
            }
        })
    }

    const procesarDisponibilidadDia = (disponibilidad, fecha) => {
        const dateKey = formatDateKey(fecha)
        const cacheKey = `${selectedService.value.id}-${dateKey}`
        const slots = disponibilidad?.map(horario => {
            const status = getStatus(horario)
            const appointment = (status === 'booked' || status === 'confirmed') ? buildAppointmentFromHorario(horario) : null
            return {
                time: formatTime(horario.hora || horario.hora_inicio),
                status: status,
                id_slot: horario.id || horario.id_slot,
                appointment
            }
        }) || []
        disponibilidadCache.value = {
            ...disponibilidadCache.value,
            [cacheKey]: slots
        }
    }

    const procesarCitas = (citas, fecha) => {
        const dateKey = formatDateKey(fecha)
        citasCache.value[dateKey] = citas
    }

    const limpiarCacheMes = () => {
        const firstDay = new Date(currentYear.value, currentMonth.value, 1)
        const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
        const newCache = { ...disponibilidadCache.value }
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const dateKey = formatDateKey(d)
            const cacheKey = `${selectedService.value.id}-${dateKey}`
            delete newCache[cacheKey]
        }
        disponibilidadCache.value = newCache
    }

    const refrescarDisponibilidad = () => {
        if (viewMode.value === 'month') {
            loadDisponibilidadMes()
        } else {
            loadDisponibilidadDiaActual()
        }
    }

    // ============================================
    // COMPUTEDS
    // ============================================

    const currentMonthName = computed(() => {
        return new Date(currentYear.value, currentMonth.value).toLocaleDateString('es-ES', { month: 'long' })
    })

    const selectedDateString = computed({
        get: () => formatDateKey(selectedDate.value),
        set: (value) => { selectedDate.value = new Date(value + 'T00:00:00') }
    })

    const filteredServices = computed(() => {
        if (!serviceSearch.value) return services.value
        return services.value.filter(service =>
            service.name.toLowerCase().includes(serviceSearch.value.toLowerCase())
        )
    })

    const totalAppointmentsToday = computed(() => 12)
    const totalServicesActive = computed(() => services.value.length)

    const daySlots = computed(() => {
        if (!selectedService.value) return []
        const dateKey = formatDateKey(selectedDate.value)
        const cacheKey = `${selectedService.value.id}-${dateKey}`
        return disponibilidadCache.value[cacheKey] || []
    })

    const calendarDays = computed(() => {
        if (!selectedService.value) return []
        const firstDay = new Date(currentYear.value, currentMonth.value, 1)
        const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
        const firstDayWeek = firstDay.getDay()
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const days = []

        for (let i = firstDayWeek - 1; i >= 0; i--) {
            const date = new Date(firstDay)
            date.setDate(date.getDate() - (i + 1))
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            days.push({
                date: date.getDate(), fullDate: new Date(date), isCurrentMonth: false, isToday: false,
                isWeekend: date.getDay() === 0 || date.getDay() === 6, isPast: d < today,
                availableSlots: 0, bookedSlots: 0, slots: []
            })
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear.value, currentMonth.value, day)
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const isToday = d.getTime() === today.getTime()
            const isPast = d < today
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            const dateKey = formatDateKey(date)
            const cacheKey = `${selectedService.value.id}-${dateKey}`
            const slots = disponibilidadCache.value[cacheKey]
            const hasAgenda = slots !== null && slots !== undefined
            const safeSlots = slots || []
            const availableSlots = safeSlots.filter(s => s.status === 'available').length
            const bookedSlots = safeSlots.filter(s => (s.status === 'booked' || s.status === 'confirmed')).length

            days.push({
                date: day, fullDate: new Date(date), isCurrentMonth: true, isToday, isWeekend, isPast,
                availableSlots, bookedSlots, slots: safeSlots, hasAgenda
            })
        }

        const totalCells = 42
        const remainingCells = totalCells - days.length
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(currentYear.value, currentMonth.value + 1, day)
            days.push({
                date: day, fullDate: new Date(date), isCurrentMonth: false, isToday: false,
                isWeekend: date.getDay() === 0 || date.getDay() === 6, isPast: false,
                availableSlots: 0, bookedSlots: 0, slots: []
            })
        }
        return days
    })

    const currentStats = computed(() => {
        if (!selectedService.value) return { available: 0, booked: 0, revenue: 0, efficiency: 0 }
        let available, booked
        if (viewMode.value === 'month') {
            const targetDay = calendarDays.value.find(day => day.isToday)
            available = targetDay?.availableSlots || 0
            booked = targetDay?.bookedSlots || 0
        } else {
            available = daySlots.value.filter(s => s.status === 'available').length
            booked = daySlots.value.filter(s => (s.status === 'booked' || s.status === 'confirmed')).length
        }
        const total = available + booked
        const revenue = booked * selectedService.value.price
        const efficiency = total > 0 ? Math.round((booked / total) * 100) : 0
        return { available, booked, revenue, efficiency }
    })

    // ============================================
    // MÉTODOS DE NAVEGACIÓN Y SELECCIÓN
    // ============================================

    const toggleSidebar = () => { sidebarCollapsed.value = !sidebarCollapsed.value }

    /*const selectService = async (service) => {
        selectedService.value = service
        selectedSlot.value = null
        await loadServiceSchedules()
        await loadDisponibilidadMes()
    }*/
    const selectService = async (service) => {
        selectedService.value = service
        selectedSlot.value = null
        await loadServiceSchedules()

        if (viewMode.value === 'day') {
            await loadDisponibilidadDiaActual()
        } else {
            await loadDisponibilidadMes()
        }
    }

    const getServiceStats = (serviceId) => {
        const today = new Date()
        const todayKey = formatDateKey(today)
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())

        let todayAppointments = 0
        let weekAppointments = 0

        Object.entries(disponibilidadCache.value).forEach(([cacheKey, slots]) => {
            if (!cacheKey.startsWith(`${serviceId}-`)) return
            if (!Array.isArray(slots)) return

            const fecha = cacheKey.replace(`${serviceId}-`, '')
            const booked = slots.filter(slot => ['booked', 'confirmed'].includes(slot.status)).length

            if (fecha === todayKey) {
                todayAppointments += booked
            }

            const fechaDate = new Date(`${fecha}T00:00:00`)
            const fechaMs = fechaDate.getTime()
            const startMs = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate()).getTime()
            const endMs = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6).getTime()

            if (fechaMs >= startMs && fechaMs <= endMs) {
                weekAppointments += booked
            }
        })

        return {
            todayAppointments,
            weekAppointments
        }
    }

    const getTimeIcon = (status) => {
        switch (status) {
            case 'available': return 'check_circle'
            case 'confirmed': return 'verified'
            case 'booked': return 'event_busy'
            case 'selected': return 'radio_button_checked'
            default: return 'schedule'
        }
    }

    const getTimeIconColor = (status) => {
        switch (status) {
            case 'available': return 'positive'
            case 'confirmed': return 'info'
            case 'booked': return 'negative'
            case 'selected': return 'primary'
            default: return 'grey'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'available': return 'Disponible'
            case 'booked': return 'Programada'
            case 'confirmed': return 'Confirmada'
            case 'selected': return 'Seleccionado'
            default: return 'Desconocido'
        }
    }

    const viewAppointment = (slot) => {
        $q.notify({
            type: 'info',
            message: `Cita de ${slot.appointment.petName} con ${slot.appointment.ownerName}`,
            caption: `Hora: ${slot.time}`
        })
    }

    const imprimirCertificadoCita = async (slot) => {
        if (!slot.appointment) return

        try {
            $q.loading.show({ message: 'Preparando certificado...' })

            // 1. Cargar plantilla (por ahora una fija o buscar por servicio)
            const plantilla = await cargarPlantillaPorCodigo('CERT_ASISTENCIA')

            if (!plantilla) {
                $q.notify({ type: 'warning', message: 'No se encontró una plantilla de certificado configurada' })
                return
            }

            // 2. Preparar datos para las variables
            const data = {
                propietario: slot.appointment.ownerName,
                mascota: slot.appointment.petName,
                especie: slot.appointment.petType,
                fecha: selectedDate.value.toLocaleDateString(),
                hora: slot.time,
                servicio: selectedService.value.name,
                profesional: slot.appointment.professionalName || 'Médico Veterinario'
            }

            // 3. Procesar y generar PDF
            const htmlProcesado = procesarHtml(plantilla.contenido, data)
            await generarPDF(htmlProcesado, `Certificado_${slot.appointment.petName}_${formatDateKey(selectedDate.value)}.pdf`)

            $q.notify({ type: 'positive', message: 'Certificado generado con éxito' })
        } catch (error) {
            console.error('Error al generar certificado:', error)
            $q.notify({ type: 'negative', message: 'Error al generar el certificado' })
        } finally {
            $q.loading.hide()
        }
    }

    const cancelAppointment = async (slot) => {
        if (!slot.appointment?.id) {
            $q.notify({ type: 'warning', message: 'No hay cita para cancelar' })
            return
        }
        $q.dialog({
            title: 'Cancelar Cita',
            message: `¿Estás seguro de que deseas cancelar la cita de ${slot.appointment.petName}?`,
            cancel: true, persistent: true
        }).onOk(async () => {
            try {
                const peticion = new NdPeticionControl()
                const response = await peticion.invocarMetodo(`agenda/citas/${slot.appointment.id}`, 'delete')
                if (response?.success) {
                    $q.notify({ type: 'positive', message: 'Cita cancelada exitosamente' })
                    onCitaCreada()
                }
            } catch (error) {
                $q.notify({ type: 'negative', message: 'Error al cancelar la cita', caption: error.message })
            }
        })
    }

    const previousMonth = () => {
        if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
        else { currentMonth.value-- }
        loadDisponibilidadMes()
    }

    const nextMonth = () => {
        if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
        else { currentMonth.value++ }
        loadDisponibilidadMes()
    }

    const previousDay = async () => {
        const d = new Date(selectedDate.value)
        d.setDate(d.getDate() - 1)
        selectedDate.value = d
        await loadDisponibilidadDiaActual()
    }

    const nextDay = async () => {
        const d = new Date(selectedDate.value)
        d.setDate(d.getDate() + 1)
        selectedDate.value = d
        await loadDisponibilidadDiaActual()
    }

    const goToToday = async () => {
        const today = new Date()
        if (viewMode.value === 'month') {
            currentYear.value = today.getFullYear()
            currentMonth.value = today.getMonth()
            await loadDisponibilidadMes()
        } else {
            selectedDate.value = new Date(today)
            await loadDisponibilidadDiaActual()
        }
    }

    /*const selectDayForDayView = async (day) => {
        if (!day || !day.fullDate || !selectedService.value) return
        if (!day.isCurrentMonth || day.isPast) return
        if (!hasServiceScheduleForDate(selectedService.value.id, day.fullDate)) return

        viewMode.value = 'day'
        selectedDate.value = new Date(day.fullDate)
        await loadDisponibilidadDiaActual()
    }*/

    const selectDayForDayView = async (day) => {
        if (!day || !day.fullDate || !selectedService.value) return
        if (!day.isCurrentMonth || day.isPast) return
        if (!hasServiceScheduleForDate(selectedService.value.id, day.fullDate)) return

        selectedDate.value = new Date(day.fullDate)
        _skipViewModeWatch = true   // evitar doble carga desde el watcher
        viewMode.value = 'day'
        // Llamamos explícitamente en lugar de depender del watcher,
        // ya que el watcher puede dispararse antes de que selectedDate
        // esté actualizado en el siguiente ciclo reactivo (condición de carrera).
        await loadDisponibilidadDiaActual()
    }

    const updateSelectedDate = async (newDate) => {
        const dateToParse = typeof newDate === 'string' && newDate.match(/^\d{4}-\d{2}-\d{2}$/)
            ? newDate + 'T00:00:00'
            : newDate;
        selectedDate.value = new Date(dateToParse)
        showDatePicker.value = false
        await loadDisponibilidadDiaActual()
    }

    const selectTimeSlot = (day, slot) => {
        if (slot.status === 'booked' || slot.status === 'confirmed') {
            $q.notify({ type: 'warning', message: `Este horario está ocupado por ${slot.appointment.petName} (${slot.appointment.ownerName})` })
            return
        }
        slotSeleccionado.value = {
            date: day.fullDate.toLocaleDateString('es-ES'),
            dayName: day.fullDate.toLocaleDateString('es-ES', { weekday: 'long' }),
            time: slot.time,
            fullDate: day.fullDate,
            id_slot: slot.id_slot
        }
        mostrarDialogoAsignarCita.value = true
    }

    const onCitaCreada = () => {
        mostrarDialogoAsignarCita.value = false
        const dateKey = formatDateKey(selectedDate.value)
        const cacheKey = `${selectedService.value.id}-${dateKey}`
        const newCache = { ...disponibilidadCache.value }
        delete newCache[cacheKey]
        disponibilidadCache.value = newCache
        if (viewMode.value === 'month') {
            loadDisponibilidadMes()
        } else {
            loadDisponibilidadDiaActual()
        }
    }

    const isSameDay = (date1, date2) => (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    )

    const dateOptions = (date) => {
        const targetDate = new Date(date)
        const today = new Date()
        const isPast = targetDate < today && !isSameDay(targetDate, today)

        if (!selectedService.value) return !isPast

        if (isPast || !hasServiceScheduleForDate(selectedService.value.id, targetDate)) {
            return false
        }

        const dateKey = formatDateKey(targetDate)
        const cacheKey = `${selectedService.value.id}-${dateKey}`
        const slots = disponibilidadCache.value[cacheKey]

        if (slots !== undefined && slots !== null) {
            return slots.some(s => s.status === 'available')
        }

        return true
    }

    const agendaEvents = computed(() => {
        if (!selectedService.value) return []
        const events = []
        const servicePrefix = `${selectedService.value.id}-`

        for (const cacheKey in disponibilidadCache.value) {
            if (cacheKey.startsWith(servicePrefix)) {
                const slots = disponibilidadCache.value[cacheKey]
                if (Array.isArray(slots) && slots.some(s => s.status === 'available')) {
                    // Convertir YYYY-MM-DD a YYYY/MM/DD para q-date
                    events.push(cacheKey.replace(servicePrefix, '').replace(/-/g, '/'))
                }
            }
        }
        return events
    })

    // Flag para prevenir doble carga cuando selectDayForDayView cambia viewMode
    // y también llama explícitamente a loadDisponibilidadDiaActual
    let _skipViewModeWatch = false

    watch(viewMode, async (newMode) => {
        if (_skipViewModeWatch) {
            _skipViewModeWatch = false
            return
        }
        if (newMode === 'day') {
            await loadDisponibilidadDiaActual()
        } else {
            await loadDisponibilidadMes()
        }
    })

    onMounted(() => {
        loadServices()
        loadServiceSchedules()
    })

    return {
        currentDate, currentYear, currentMonth, selectedService, selectedSlot, viewMode, dayViewMode,
        selectedDate, showDatePicker, sidebarCollapsed, disponibilidadCache, citasCache,
        isLoadingDisponibilidad, weekdays, dayColumns, services, serviceSearch,
        currentMonthName, selectedDateString, filteredServices, totalAppointmentsToday,
        totalServicesActive, daySlots, calendarDays, currentStats, dateOptions, agendaEvents,
        loadServices, loadServiceSchedules,
        toggleSidebar, selectService, getServiceStats, getTimeIcon, getTimeIconColor,
        getStatusLabel, viewAppointment, cancelAppointment, previousMonth, nextMonth,
        previousDay, nextDay, goToToday, selectDayForDayView, updateSelectedDate,
        selectTimeSlot, refrescarDisponibilidad, mostrarDialogoAsignarCita,
        slotSeleccionado, onCitaCreada, imprimirCertificadoCita, loadDisponibilidadMes,
        loadDisponibilidadDia, formatDateKey, formatTime
    }
}
