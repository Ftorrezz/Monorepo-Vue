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

    // Helper para generar claves de fecha consistentes (YYYY-MM-DD)
    const formatDateKey = (date) => {
        if (!date) return ''

        // 1. Si es un string, intentar extraer YYYY-MM-DD directamente
        if (typeof date === 'string') {
            const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
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

    const loadDisponibilidad = async (idServicio, fechaInicio, fechaFin) => {
        try {
            const peticion = new NdPeticionControl()
            const queryParams = new URLSearchParams()
            queryParams.append('filtro[id_servicio]', idServicio)
            queryParams.append('filtro[fecha_inicio]', formatDateKey(fechaInicio))
            queryParams.append('filtro[fecha_fin]', formatDateKey(fechaFin))
            queryParams.append('filtro[id_sucursal]', store.sucursalSeleccionada.id)

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
            queryParams.append('filtro[id_sucursal]', store.sucursalSeleccionada.id)

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
            queryParams.append('filtro[id_sucursal]', store.sucursalSeleccionada.id)

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
            const disponibilidad = await loadDisponibilidad(selectedService.value.id, firstDay, lastDay)

            if (disponibilidad && disponibilidad.length > 0) {
                procesarDisponibilidad(disponibilidad)
            } else {
                limpiarCacheMes()
                $q.notify({ type: 'info', message: 'No hay agenda generada para este período' })
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
            const disponibilidad = await loadDisponibilidadDia(selectedService.value.id, fecha)

            if (disponibilidad && disponibilidad.length > 0) {
                procesarDisponibilidadDia(disponibilidad, fecha)
                const citas = await loadCitasPorFecha(fecha)
                procesarCitas(citas, fecha)
            } else {
                const dateKey = formatDateKey(fecha)
                const cacheKey = `${selectedService.value.id}-${dateKey}`
                disponibilidadCache.value = {
                    ...disponibilidadCache.value,
                    [cacheKey]: []
                }
                $q.notify({ type: 'info', message: 'No hay agenda generada para este día' })
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

                return {
                    time: formatTime(horario.hora || horario.hora_inicio),
                    status: status,
                    id_slot: horario.id || horario.id_slot,
                    appointment: (status === 'booked' || status === 'confirmed') ? {
                        id: horario.cita?.id || horario.id_cita,
                        ownerName: [
                            horario.propietario_poblador_nombre,
                            horario.propietario_poblador_primerapellido,
                            horario.propietario_poblador_segundoapellido
                        ].filter(Boolean).join(' ') || horario.nombre_propietario || 'Sin nombre',
                        ownerPhone: horario.propietario_poblador_telefono || horario.telefono_propietario || '',
                        petName: horario.nombre_mascota || 'Sin nombre',
                        petType: horario.cita?.mascota?.especie || horario.mascota_especie || 'Mascota',
                        professionalName: horario.profesional_nombre || 'No asignado'
                    } : null
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
            console.log('horario', horario)
            return {
                time: formatTime(horario.hora || horario.hora_inicio),
                status: status,
                id_slot: horario.id || horario.id_slot,
                appointment: (status === 'booked' || status === 'confirmed') ? {
                    id: horario.cita?.id || horario.id_cita,
                    ownerName: [
                        horario.propietario_poblador_nombre,
                        horario.propietario_poblador_primerapellido,
                        horario.propietario_poblador_segundoapellido
                    ].filter(Boolean).join(' ') || horario.nombre_propietario || 'Sin nombre',
                    ownerPhone: horario.propietario_poblador_telefono || horario.telefono_propietario || '',
                    petName: horario.nombre_mascota || 'Sin nombre',
                    petType: horario.cita?.mascota?.especie || horario.mascota_especie || 'Mascota',
                    professionalName: horario.profesional_nombre || 'No asignado'
                } : null
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

    const selectService = (service) => {
        selectedService.value = service
        selectedSlot.value = null
        loadDisponibilidadMes()
    }

    const getServiceStats = (serviceId) => ({
        todayAppointments: Math.floor(Math.random() * 10) + 1,
        weekAppointments: Math.floor(Math.random() * 50) + 5
    })

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

    const previousDay = () => {
        const d = new Date(selectedDate.value)
        d.setDate(d.getDate() - 1)
        selectedDate.value = d
        loadDisponibilidadDiaActual()
    }

    const nextDay = () => {
        const d = new Date(selectedDate.value)
        d.setDate(d.getDate() + 1)
        selectedDate.value = d
        loadDisponibilidadDiaActual()
    }

    const goToToday = () => {
        const today = new Date()
        if (viewMode.value === 'month') {
            currentYear.value = today.getFullYear()
            currentMonth.value = today.getMonth()
            loadDisponibilidadMes()
        } else {
            selectedDate.value = new Date(today)
            loadDisponibilidadDiaActual()
        }
    }

    const selectDayForDayView = (day) => {
        if (!day.isCurrentMonth || day.isPast || (!selectedService.value || selectedService.value.id !== 8) && day.isWeekend) return
        viewMode.value = 'day'
        selectedDate.value = new Date(day.fullDate)
        loadDisponibilidadDiaActual()
    }

    const updateSelectedDate = (newDate) => {
        const dateToParse = typeof newDate === 'string' && newDate.match(/^\d{4}-\d{2}-\d{2}$/)
            ? newDate + 'T00:00:00'
            : newDate;
        selectedDate.value = new Date(dateToParse)
        showDatePicker.value = false
        loadDisponibilidadDiaActual()
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
        const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6
        const isPast = targetDate < today && !isSameDay(targetDate, today)
        return !isPast && (selectedService.value?.id === 8 || !isWeekend)
    }

    watch(viewMode, (newMode) => {
        newMode === 'day' ? loadDisponibilidadDiaActual() : loadDisponibilidadMes()
    })

    onMounted(() => {
        loadServices()
    })

    return {
        currentDate, currentYear, currentMonth, selectedService, selectedSlot, viewMode, dayViewMode,
        selectedDate, showDatePicker, sidebarCollapsed, disponibilidadCache, citasCache,
        isLoadingDisponibilidad, weekdays, dayColumns, services, serviceSearch,
        currentMonthName, selectedDateString, filteredServices, totalAppointmentsToday,
        totalServicesActive, daySlots, calendarDays, currentStats, dateOptions,
        toggleSidebar, selectService, getServiceStats, getTimeIcon, getTimeIconColor,
        getStatusLabel, viewAppointment, cancelAppointment, previousMonth, nextMonth,
        previousDay, nextDay, goToToday, selectDayForDayView, updateSelectedDate,
        selectTimeSlot, refrescarDisponibilidad, mostrarDialogoAsignarCita,
        slotSeleccionado, onCitaCreada, imprimirCertificadoCita
    }
}
