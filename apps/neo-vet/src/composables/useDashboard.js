import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from 'src/stores/Auth'
import { useDialogStore } from 'src/stores/DialogoUbicacion'

export function useDashboard() {
    const socketDebugEnabled = import.meta.env.VITE_SOCKET_DEBUG === 'true'
    const debugSocketLog = (...args) => {
        if (socketDebugEnabled) {
            console.log('[dashboard-socket]', ...args)
        }
    }

    // Estado reactivo centralizado
    const stats = ref({
        mascotas_atendidas: 0, citas_asignadas: 0, vacunas_aplicadas: 0,
        desparasitaciones: 0, hospitalizaciones: 0, cirugias_realizadas: 0,
        consultas_emergencia: 0, ingresos_mes: 0, clientes_nuevos: 0,
        medicamentos_dispensados: 0, servicios_totales: 0, citas_hoy: 0,
        citas_pendientes: 0, asistencia: 0
    })

    // Tareas / To-Do List
    const tasks = ref([])

    // Inventory Data
    const lowStockItems = ref([])

    const expiringItems = ref([])

    const upcomingAppointments = ref([])

    const alerts = ref([])

    // Getters computados para organizar los datos
    // Versión compacta para la barra superior
    const mainStats = computed(() => [
        {
            id: 'citas',
            title: 'Control de Citas',
            value: stats.value.citas_asignadas,
            icon: 'calendar_today',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            subtitle: 'Hoy',
            trend: '+12%'
        },
        {
            id: 'ingresos', // Kept ID for compatibility
            title: 'Ingresos',
            value: stats.value.ingresos_mes,
            icon: 'payments',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            subtitle: 'Programadas',
            trend: '+5%'
        },
        {
            id: 'servicios',
            title: 'Servicios Aplicados',
            value: stats.value.servicios_totales,
            icon: 'medical_services',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            subtitle: 'Este mes',
            trend: '+18%'
        },
        {
            id: 'ingresos', // Duplicate logic, but aiming for mainStats[2] usage in view
            title: 'Ingresos',
            value: stats.value.ingresos_mes,
            icon: 'payments',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            subtitle: 'Total mes',
            trend: '+8%',
            prefix: '$'
        }
    ])
    const secondaryStats = computed(() => [
        { id: 'desparasitaciones', title: 'Despar.', value: stats.value.desparasitaciones, icon: 'shield', color: 'teal' },
        { id: 'hospitalizaciones', title: 'Hosp.', value: stats.value.hospitalizaciones, icon: 'local_hospital', color: 'negative' },
        { id: 'cirugias', title: 'Cirug.', value: stats.value.cirugias_realizadas, icon: 'healing', color: 'deep-purple' },
        { id: 'emergencias', title: 'Emerg.', value: stats.value.consultas_emergencia, icon: 'orange' },
        { id: 'clientes', title: 'Nuevos', value: stats.value.clientes_nuevos, icon: 'group_add', color: 'blue' },
        { id: 'medicamentos', title: 'Meds.', value: stats.value.medicamentos_dispensados, icon: 'medication', color: 'pink' }
    ])

    // Mock de actualización via Socket
    const updateStat = (key, value) => {
        if (stats.value[key] !== undefined) {
            stats.value[key] = value
        }
    }

    const addAlert = (alert) => {
        alerts.value.unshift({
            id: Date.now(),
            time: 'Ahora mismo',
            type: 'info',
            title: 'Notificación',
            ...alert
        })
        if (alerts.value.length > 5) alerts.value.pop()
    }

    const applyDashboardPayload = (payload) => {
        if (!payload || typeof payload !== 'object') return

        if (payload.stats && typeof payload.stats === 'object') {
            stats.value = { ...stats.value, ...payload.stats }
        }

        if (payload.tasks) {
            tasks.value = Array.isArray(payload.tasks) ? payload.tasks : tasks.value
        }

        if (payload.lowStockItems) lowStockItems.value = payload.lowStockItems
        if (payload.expiringItems) expiringItems.value = payload.expiringItems
        if (payload.charts) chartData.value = payload.charts
        if (payload.upcomingAppointments) upcomingAppointments.value = payload.upcomingAppointments
        if (payload.alerts) alerts.value = payload.alerts

        if (payload.data && typeof payload.data === 'object') {
            applyDashboardPayload(payload.data)
        }

        Object.keys(payload).forEach(key => {
            if (['stats', 'tasks', 'lowStockItems', 'expiringItems', 'charts', 'upcomingAppointments', 'alerts', 'data'].includes(key)) {
                return
            }
            if (stats.value[key] !== undefined) {
                updateStat(key, payload[key])
            }
        })
    }

    const toggleTask = (id) => {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            task.completed = !task.completed
            if (socket) {
                socket.emit('toggle_task', { id, completed: task.completed })
            }
        }
    }

    const addTask = (text, priority = 'medium') => {
        const newTask = {
            id: Date.now(),
            text,
            completed: false,
            priority,
            category: 'General'
        }
        tasks.value.unshift(newTask)
        if (socket) {
            socket.emit('add_task', newTask)
        }
    }

    const chartData = ref({
        appointments: { labels: [], data: [] },
        services: { labels: [], data: [] },
        stock: { labels: [], data: [] },
        expiration: { labels: [], data: [] }
    })

    // Lógica de Socket
    let socket = null

    const initSockets = () => {
        console.log('Iniciando escucha de sockets para dashboard...')

        const authStore = useAuthStore()
        const dialogStore = useDialogStore()
        const token = authStore.token

        const requestDashboardData = () => {
            if (!socket) return
            const context = {
                id_sitio: dialogStore.id_sitio || authStore.sucursales?.[0]?.id_sitio,
                id_sucursal: dialogStore.id_sucursal || authStore.sucursales?.[0]?.id,
                id_usuario: authStore.id_usuario
            }
            debugSocketLog('Solicitando dashboard data', { socketId: socket.id, ...context })
            socket.emit('request_dashboard_data', context)
        }

        // Conectar al socket server (Puerto 81 según configuración backend)
        socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:81', {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: token
            }
        })

        socket.on('connect', () => {
            const context = {
                socketId: socket.id,
                id_usuario: authStore.id_usuario,
                id_sitio: dialogStore.id_sitio || authStore.sucursales?.[0]?.id_sitio,
                id_sucursal: dialogStore.id_sucursal || authStore.sucursales?.[0]?.id
            }
            console.log('Socket conectado:', socket.id)
            debugSocketLog('Conectado con contexto del dashboard', context)
            // Unirse a la sala 'dashboard'
            socket.emit('event_join', 'dashboard')
            if (authStore.id_usuario) socket.emit('user_join', authStore.id_usuario)
            // Solicitar datos reales para inicializar el dashboard
            requestDashboardData()
        })

        socket.on('disconnect', () => {
            console.log('Socket desconectado')
        })

        socket.on('connect_error', (err) => {
            console.error('Error de conexión socket:', err)
        })

        socket.on('dashboard_error', (payload) => {
            console.error('Error al cargar dashboard:', payload)
        })

        // Escuchar datos iniciales
        socket.on('dashboard_initial_data', (payload) => {
            console.log('Datos iniciales recibidos:', payload)
            debugSocketLog('dashboard_initial_data', {
                stats: payload?.stats,
                charts: payload?.charts,
                lowStockItems: payload?.lowStockItems?.length,
                expiringItems: payload?.expiringItems?.length,
                id_sitio: payload?.id_sitio,
                id_sucursal: payload?.id_sucursal
            })
            applyDashboardPayload(payload)
        })

        // Escuchar actualizaciones del dashboard (en vivo)
        socket.on('dashboard_update', (payload) => {
            console.log('Actualización recibida:', payload)
            debugSocketLog('dashboard_update', {
                type: payload?.type,
                room: payload?.room,
                stats: payload?.stats,
                hasData: !!payload?.data,
                dataKeys: payload?.data ? Object.keys(payload.data).slice(0, 10) : []
            })
            if (payload?.type || payload?.data || payload?.stats || payload?.charts) {
                applyDashboardPayload(payload)
            }

            if (payload?.type === 'alert') {
                addAlert(payload.data)
            }

            if (payload?.type === 'creada' || payload?.type === 'actualizada' || payload?.type === 'cancelada' || payload?.type === 'appointment_created' || payload?.type === 'appointment_updated') {
                setTimeout(() => requestDashboardData(), 200)
            }
        })

        const agendaEventNames = [
            'agenda_updated',
            'agenda_actualizada',
            'cita_creada',
            'cita_agendada',
            'appointment_created',
            'citas_updated',
            'dashboard_appointments_updated',
            'appointment_updated'
        ]

        agendaEventNames.forEach((eventName) => {
            socket.on(eventName, (payload) => {
                console.log(`Actualización de agenda recibida (${eventName}):`, payload)
                debugSocketLog(`evento-${eventName}`, {
                    type: payload?.type,
                    room: payload?.room,
                    stats: payload?.stats,
                    data: payload?.data ? { id: payload.data.id, fecha: payload.data.fecha, estado: payload.data.estado } : null
                })
                applyDashboardPayload(payload)
                setTimeout(() => requestDashboardData(), 200)
            })
        })

        socket.onAny((eventName, payload) => {
            if (!eventName || typeof eventName !== 'string') return
            const normalized = eventName.toLowerCase()
            const ignoredEventNames = new Set([
                'dashboard_initial_data',
                'dashboard_error',
                'request_dashboard_data',
                'dashboard_update',
                'task_added',
                'task_toggled'
            ])

            if (ignoredEventNames.has(normalized)) return

            if (agendaEventNames.includes(normalized) || normalized.includes('agenda') || normalized.includes('cita')) {
                debugSocketLog('socket.onAny', { eventName, type: payload?.type, room: payload?.room, hasStats: !!payload?.stats })
                applyDashboardPayload(payload)
                setTimeout(() => requestDashboardData(), 200)
            }
        })

        // Escuchar actualizaciones de tareas
        socket.on('task_added', (task) => {
            // Evitar duplicados si fue el mismo cliente quien la agregó
            if (!tasks.value.find(t => t.id === task.id)) {
                tasks.value.unshift(task)
            }
        })

        socket.on('task_toggled', (payload) => {
            const task = tasks.value.find(t => t.id === payload.id)
            if (task) {
                task.completed = payload.completed
            }
        })
    }

    onMounted(() => {
        initSockets()
    })

    onUnmounted(() => {
        if (socket) {
            socket.emit('event_leave', 'dashboard')
            socket.disconnect()
        }
    })

    return {
        stats,
        tasks,
        lowStockItems,
        expiringItems,
        mainStats,
        secondaryStats,
        upcomingAppointments,
        alerts,
        chartData,
        updateStat,
        addAlert,
        toggleTask,
        addTask
    }
}
