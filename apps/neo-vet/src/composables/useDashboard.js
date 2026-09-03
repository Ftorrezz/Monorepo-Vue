import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from 'src/stores/Auth'
import { useDialogStore } from 'src/stores/DialogoUbicacion'

export function useDashboard() {
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

        // Conectar al socket server (Puerto 81 según configuración backend)
        socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:81', {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: token
            }
        })

        socket.on('connect', () => {
            console.log('Socket conectado:', socket.id)
            // Unirse a la sala 'dashboard'
            socket.emit('event_join', 'dashboard')
            if (authStore.id_usuario) socket.emit('user_join', authStore.id_usuario)
            // Solicitar datos reales para inicializar el dashboard
            socket.emit('request_dashboard_data', {
                id_sitio: dialogStore.id_sitio || authStore.sucursales?.[0]?.id_sitio,
                id_sucursal: dialogStore.id_sucursal || authStore.sucursales?.[0]?.id
            })
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
            if (payload.stats) stats.value = { ...stats.value, ...payload.stats }
            if (payload.tasks) tasks.value = payload.tasks
            if (payload.lowStockItems) lowStockItems.value = payload.lowStockItems
            if (payload.expiringItems) expiringItems.value = payload.expiringItems
            if (payload.charts) chartData.value = payload.charts
            if (payload.upcomingAppointments) upcomingAppointments.value = payload.upcomingAppointments
            if (payload.alerts) alerts.value = payload.alerts
        })

        // Escuchar actualizaciones del dashboard (en vivo)
        socket.on('dashboard_update', (payload) => {
            console.log('Actualización recibida:', payload)

            // Si payload es un objeto con actualizaciones masivas
            if (typeof payload === 'object') {
                Object.keys(payload).forEach(key => {
                    updateStat(key, payload[key])
                })
            }

            // Si el backend envía un mensaje específico para alertas
            if (payload.type === 'alert') {
                addAlert(payload.data)
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
