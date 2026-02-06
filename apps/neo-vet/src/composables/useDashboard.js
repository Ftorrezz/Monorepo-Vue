import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from 'src/stores/Auth'

export function useDashboard() {
    // Estado reactivo centralizado
    const stats = ref({
        mascotas_atendidas: 847,
        citas_asignadas: 34,
        vacunas_aplicadas: 156,
        desparasitaciones: 89,
        hospitalizaciones: 12,
        cirugias_realizadas: 23,
        consultas_emergencia: 18,
        ingresos_mes: 45750,
        clientes_nuevos: 67,
        medicamentos_dispensados: 234,
        servicios_totales: 342
    })

    // Tareas / To-Do List
    const tasks = ref([
        { id: 1, text: 'Confirmar citas de mañana', completed: false, priority: 'high', category: 'Recepción' },
        { id: 2, text: 'Pedir vacunas de rabia', completed: false, priority: 'medium', category: 'Inventario' },
        { id: 3, text: 'Reporte mensual de ventas', completed: true, priority: 'low', category: 'Administración' },
        { id: 4, text: 'Actualizar historias clínicas', completed: false, priority: 'medium', category: 'Veterinaria' },
        { id: 5, text: 'Revisar equipos de laboratorio', completed: false, priority: 'high', category: 'Mantenimiento' },
        { id: 6, text: 'Llamada seguimiento a Sr. Pérez', completed: false, priority: 'low', category: 'Recepción' },
        { id: 7, text: 'Limpieza de quirófano', completed: true, priority: 'medium', category: 'Limpieza' },
        { id: 8, text: 'Pago a proveedores', completed: false, priority: 'high', category: 'Administración' },
        { id: 9, text: 'Capacitación nuevo personal', completed: false, priority: 'low', category: 'RRHH' }
    ])

    // Inventory Data
    const lowStockItems = ref([
        { id: 1, name: 'Vacuna Rabia', stock: 2, min: 10, category: 'Vacunas' },
        { id: 2, name: 'Amoxicilina 500mg', stock: 5, min: 20, category: 'Farmacia' },
        { id: 3, name: 'Jeringas 3ml', stock: 15, min: 50, category: 'Insumos' },
        { id: 4, name: 'Pipeta Antipulgas', stock: 3, min: 12, category: 'Farmacia' }
    ])

    const expiringItems = ref([
        { id: 1, name: 'Antibiótico Oral', expiration: '2025-05-15', daysLeft: 12, batch: 'B-123' },
        { id: 2, name: 'Solución Salina', expiration: '2025-05-20', daysLeft: 17, batch: 'S-456' },
        { id: 3, name: 'Alimento Premium', expiration: '2025-06-01', daysLeft: 28, batch: 'F-789' }
    ])

    const upcomingAppointments = ref([
        { id: 1, time: '09:00', pet: 'Max', owner: 'Juan Pérez', type: 'Consulta' },
        { id: 2, time: '10:30', pet: 'Luna', owner: 'María García', type: 'Vacuna' },
        { id: 3, time: '11:00', pet: 'Rocky', owner: 'Carlos López', type: 'Cirugía' },
        { id: 4, time: '14:00', pet: 'Bella', owner: 'Ana Martínez', type: 'Consulta' },
        { id: 5, time: '15:30', pet: 'Coco', owner: 'Luis Rodríguez', type: 'Estética' }
    ])

    const alerts = ref([
        {
            id: 1,
            type: 'urgent',
            icon: 'emergency',
            title: 'Urgencia Médica',
            message: 'Paciente Rex requiere atención inmediata',
            time: 'Hace 5 min'
        },
        {
            id: 2,
            type: 'info',
            icon: 'schedule',
            title: 'Recordatorio',
            message: 'Vacunación de Luna mañana',
            time: 'Hace 15 min'
        },
        {
            id: 3,
            type: 'success',
            icon: 'check_circle',
            title: 'Cirugía Exitosa',
            message: 'Cirugía de Max completada',
            time: 'Hace 1 hora'
        },
        {
            id: 4,
            type: 'warning',
            icon: 'inventory_2',
            title: 'Stock Bajo',
            message: 'Quedan pocas dosis de antirrábica',
            time: 'Hace 2 horas'
        },
        {
            id: 5,
            type: 'info',
            icon: 'person_add',
            title: 'Nuevo Cliente',
            message: 'Ana Martínez se registró',
            time: 'Hace 3 horas'
        }
    ])

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
        }
    }

    const addTask = (text, priority = 'medium') => {
        tasks.value.unshift({
            id: Date.now(),
            text,
            completed: false,
            priority,
            category: 'General'
        })
    }

    // Data para Gráficos
    const appointmentsChartData = {
        labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        datasets: [{
            label: 'Citas',
            data: [3, 5, 8, 6, 4, 2, 7, 9, 6, 4, 3],
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78, 115, 223, 0.05)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#4e73df',
            pointBorderColor: '#4e73df',
            pointHoverRadius: 3,
            pointHoverBackgroundColor: '#4e73df',
            pointHoverBorderColor: '#4e73df',
            pointHitRadius: 10,
            pointBorderWidth: 2
        }]
    }

    const servicesChartData = {
        labels: ['Consultas', 'Vacunación', 'Cirugías', 'Otros'],
        datasets: [{
            data: [55, 30, 15, 10],
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
    }

    // Lógica de Socket
    let socket = null

    const initSockets = () => {
        console.log('Iniciando escucha de sockets para dashboard...')

        const authStore = useAuthStore()
        const token = authStore.token

        // Conectar al socket server (Puerto 81 según configuración backend)
        socket = io('http://localhost:81', {
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
        })

        socket.on('disconnect', () => {
            console.log('Socket desconectado')
        })

        socket.on('connect_error', (err) => {
            console.error('Error de conexión socket:', err)
        })

        // Escuchar actualizaciones del dashboard
        // Asumimos que el evento es 'dashboard_update' y el payload trae { key, value } o un objeto completo
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
        appointmentsChartData,
        servicesChartData,
        updateStat,
        addAlert,
        toggleTask,
        addTask
    }
}
