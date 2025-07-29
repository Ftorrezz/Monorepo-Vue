<template>
  <q-page class="q-pa-md full-width">
    <!-- Header compacto unificado -->
    <q-card class="q-mb-md modern-header-card">
      <q-card-section class="modern-header q-py-sm q-px-lg">
        <div class="row items-center q-col-gutter-md no-wrap">
          <!-- Info del paciente -->
          <div class="col-auto">
            <q-avatar size="48px" class="modern-avatar">
              <q-icon name="pets" size="24px" />
            </q-avatar>
          </div>
          
          <div class="col">
            <div class="row items-center q-gutter-md no-wrap">
              <!-- Columna 1: Info básica del paciente -->
              <div class="patient-info">
                <div class="patient-name">{{ paciente.nombre }}</div>
                <div class="patient-details">
                  {{ paciente.especie }} - {{ paciente.raza }}
                  <span v-if="paciente.edad" class="age-badge">{{ paciente.edad }}a</span>
                </div>
                <div class="owner-info">
                  <q-icon name="person" size="14px" class="q-mr-xs" />
                  {{ paciente.propietario?.nombre }} {{ paciente.propietario?.primerapellido }}
                  <span v-if="paciente.propietario?.telefono1" class="phone-info">
                    • <q-icon name="phone" size="12px" /> {{ paciente.propietario?.telefono1 }}
                  </span>
                </div>
              </div>

              <!-- Columna 2: Info de atención actual -->
              <div class="attention-info">
                <div class="attention-number">{{ atenciones[atencionActual].numero }}</div>
                <div class="attention-details">
                  <q-icon name="event" size="14px" class="q-mr-xs" />
                  {{ atenciones[atencionActual].fecha }} • {{ atenciones[atencionActual].hora }}
                </div>
                <div class="vet-info">
                  <q-icon name="medical_services" size="14px" class="q-mr-xs" />
                  {{ atenciones[atencionActual].veterinario }}
                </div>
              </div>

              <!-- Columna 3: Estado y servicios -->
              <div class="status-info">
                <q-chip
                  :color="atenciones[atencionActual].estado === 'En curso' ? 'orange' : 'green'"
                  text-color="white"
                  :label="atenciones[atencionActual].estado"
                  size="sm"
                  class="status-chip"
                >
                  <q-icon 
                    :name="atenciones[atencionActual].estado === 'En curso' ? 'play_circle' : 'check_circle'" 
                    size="xs" 
                    class="q-mr-xs" 
                  />
                </q-chip>
                <div class="services-count">
                  <q-icon name="assignment" size="14px" class="q-mr-xs" />
                  {{ serviciosAplicados.length }} servicios
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="col-auto">
            <div class="row q-gutter-xs">
              <q-btn
                dense
                round
                icon="add"
                color="primary"
                size="sm"
                @click="nuevaAtencion"
                class="modern-btn"
              >
                <q-tooltip>Nueva Atención</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                icon="history"
                color="grey-6"
                size="sm"
                @click="mostrarAtenciones"
                class="modern-btn"
              >
                <q-tooltip>Historial</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                icon="visibility"
                color="info"
                size="sm"
                @click="verDetallesAtencion"
                class="modern-btn"
              >
                <q-tooltip>Ver Detalles</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                icon="add_circle"
                color="positive"
                size="sm"
                @click="showAddServiceDialog = true"
                :disable="atenciones[atencionActual].estado === 'Finalizada'"
                class="modern-btn"
              >
                <q-tooltip>Agregar Servicio</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Carrusel de atenciones compacto -->
        <div v-if="atenciones.length > 1" class="q-mt-sm">
          <q-separator class="q-mb-sm" />
          <div class="attention-carousel">
            <div
              v-for="(atencion, index) in atenciones.slice(0, 5)"
              :key="atencion.id"
              @click="atencionActual = index"
              :class="[
                'attention-card-mini',
                atencionActual === index ? 'attention-card-mini--active' : ''
              ]"
            >
              <div class="attention-card-content">
                <div class="attention-card-number">{{ atencion.numero.split('-').pop() }}</div>
                <div class="attention-card-date">{{ atencion.fecha.split('-').slice(1).join('/') }}</div>
                <div class="attention-card-status">
                  <q-icon 
                    :name="atencion.estado === 'En curso' ? 'play_circle' : 'check_circle'" 
                    :color="atencion.estado === 'En curso' ? 'orange' : 'green'" 
                    size="xs" 
                  />
                </div>
              </div>
            </div>
            <div v-if="atenciones.length > 5" class="attention-card-mini more-card" @click="mostrarAtenciones">
              <div class="attention-card-content">
                <q-icon name="more_horiz" size="sm" />
                <div class="attention-card-date">+{{ atenciones.length - 5 }}</div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialogo para agregar servicios -->
    <q-dialog 
      v-model="showAddServiceDialog" 
      persistent 
      :maximized="$q.screen.lt.md"
      class="servicios-dialog"
    >
      <div class="dialog-content q-pa-lg bg-white">
        <ServiciosDisponibles
          :servicios-aplicados="serviciosAplicados"
          :atencion-finalizada="atenciones[atencionActual].estado === 'Finalizada'"
          @agregar-servicio="agregarServicioEnDialogo"
          @close="showAddServiceDialog = false"
        />
      </div>
    </q-dialog>

    <!-- Panel de servicios aplicados -->
    <q-card class="services-card">
      <q-card-section class="q-pa-none">
        <div v-if="serviciosAplicados.length === 0" class="empty-services">
          <div class="empty-services-content">
            <q-icon name="assignment_add" size="48px" class="empty-icon" />
            <div class="empty-title">Sin servicios aplicados</div>
            <div class="empty-subtitle">Agrega servicios para comenzar con la atención</div>
            <q-btn
              color="primary"
              icon="add"
              label="Agregar Primer Servicio"
              @click="showAddServiceDialog = true"
              :disable="atenciones[atencionActual].estado === 'Finalizada'"
              class="q-mt-md modern-btn-filled"
            />
          </div>
        </div>

        <div v-else>
          <!-- Pestañas de servicios modernas -->
          <q-tabs
            v-model="servicioActivoTab"
            dense
            class="modern-tabs"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab
              v-for="servicio in serviciosAplicados"
              :key="servicio.id"
              :name="servicio.id"
              :icon="servicio.icono"
              :label="servicio.nombre"
              class="modern-tab"
              :class="{ 'tab-completed': servicio.completado }"
            >
              <q-badge
                v-if="servicio.completado"
                floating
                color="positive"
                rounded
                class="completion-badge"
              >
                <q-icon name="check" size="10px" />
              </q-badge>
            </q-tab>
          </q-tabs>

          <q-separator />

          <!-- Contenido de las pestañas -->
          <q-tab-panels
            v-model="servicioActivoTab"
            animated
            swipeable
            class="modern-tab-panels"
          >
            <q-tab-panel
              v-for="servicio in serviciosAplicados"
              :key="servicio.id"
              :name="servicio.id"
              class="q-pa-md"
            >
              <!-- Componente de Vacunación -->
              <ServicioVacunacion
                v-if="servicio.tipo === 'vacunacion'"
                :servicio-id="servicio.id"
                :atencion-id="atenciones[atencionActual].id"
                :datos-iniciales="servicio.datos"
                :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                @servicio-actualizado="actualizarServicio"
                @servicio-completado="completarServicio"
                @servicio-eliminado="eliminarServicio"
              />

              <!-- Componente de Desparacitación -->
              <ServicioDesparacitacion
                v-else-if="servicio.tipo === 'desparacitacion'"
                :servicio-id="servicio.id"
                :atencion-id="atenciones[atencionActual].id"
                :datos-iniciales="servicio.datos"
                :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                @servicio-actualizado="actualizarServicio"
                @servicio-completado="completarServicio"
                @servicio-eliminado="eliminarServicio"
              />

              <!-- Componente genérico para servicios no implementados -->
              <div v-else class="generic-service">
                <div class="generic-service-content">
                  <q-avatar size="64px" :color="servicio.color" class="q-mb-md">
                    <q-icon :name="servicio.icono" size="32px" color="white" />
                  </q-avatar>
                  <div class="service-name">{{ servicio.nombre }}</div>
                  <div class="service-status">En desarrollo...</div>
                  <div class="service-timestamp">{{ servicio.timestamp }}</div>
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    label="Eliminar"
                    @click="eliminarServicio(servicio.id)"
                    class="q-mt-md"
                  />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>

    <!-- Botones de acción flotantes modernos -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <div class="floating-actions">
        <q-btn
          fab
          icon="save"
          color="primary"
          @click="guardarAtencion"
          :loading="guardandoAtencion"
          class="action-btn"
          size="md"
        >
          <q-tooltip anchor="center left" self="center right">Guardar Atención</q-tooltip>
        </q-btn>
        <q-btn
          fab
          icon="check_circle"
          color="positive"
          @click="finalizarAtencion"
          class="action-btn q-ml-sm"
          size="md"
        >
          <q-tooltip anchor="center left" self="center right">Finalizar Atención</q-tooltip>
        </q-btn>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';

// Importación de los componentes de servicios
import ServicioVacunacion from '../components/servicios/ServicioVacunacion.vue'
import ServicioDesparacitacion from '../components/servicios/ServicioDesparacitacion.vue'
import ServiciosDisponibles from '../components/servicios/ServiciosDisponibles.vue'

export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparacitacion,
    ServiciosDisponibles
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()

    // Estados reactivos
    const guardandoAtencion = ref(false)
    const servicioActivoTab = ref(null)
    const showAddServiceDialog = ref(false)

    // Datos del paciente (ahora vienen del store)
    const paciente = computed(() => mascotaSeleccionadaStore.mascota || {
      id: '', nombre: '', especie: '', raza: '', edad: '', propietario: '', telefono: ''
    })

    // Lista de atenciones del paciente
    const atenciones = ref([
      {
        id: 1,
        numero: 'A-2024-001',
        fecha: '2024-01-15',
        hora: '10:30',
        fechaFinalizacion: '',
        horaFinalizacion: '',
        veterinario: 'Dr. Carlos Mendoza',
        estado: 'En curso',
        servicios: []
      },
      {
        id: 2,
        numero: 'A-2024-002',
        fecha: '2024-01-10',
        hora: '09:15',
        fechaFinalizacion: '2024-01-10',
        horaFinalizacion: '10:00',
        veterinario: 'Dr. Ana Ruiz',
        estado: 'Finalizada',
        servicios: [
          {
            id: 'vac_001',
            tipo: 'vacunacion',
            nombre: 'Vacunación',
            icono: 'vaccines',
            color: 'green',
            completado: true,
            timestamp: '2024-01-10 09:30',
            datos: { vacuna: 'Rabia', laboratorio: 'MSD', lote: 'L123' }
          },
          {
            id: 'exp_001',
            tipo: 'exploracion',
            nombre: 'Exploración Física',
            icono: 'health_and_safety',
            color: 'blue',
            completado: true,
            timestamp: '2024-01-10 09:20',
            datos: { temperatura: '38.5', peso: '25.3' }
          }
        ]
      },
      {
        id: 3,
        numero: 'A-2024-003',
        fecha: '2024-01-05',
        hora: '11:45',
        fechaFinalizacion: '2024-01-05',
        horaFinalizacion: '12:20',
        veterinario: 'Dr. Carlos Mendoza',
        estado: 'Finalizada',
        servicios: [
          {
            id: 'des_001',
            tipo: 'desparacitacion',
            nombre: 'Desparacitación',
            icono: 'medication',
            color: 'orange',
            completado: true,
            timestamp: '2024-01-05 12:00',
            datos: { producto: 'Drontal', dosis: '2 ml' }
          }
        ]
      }
    ])

    // Atención actual seleccionada
    const atencionActual = ref(0)

    // Servicios aplicados en esta atención
    const serviciosAplicados = computed(() => {
      return atenciones.value[atencionActual.value]?.servicios || []
    })

    // Watcher para actualizar la pestaña activa cuando cambien los servicios
    watch(serviciosAplicados, (nuevosServicios) => {
      if (nuevosServicios.length > 0 && !servicioActivoTab.value) {
        servicioActivoTab.value = nuevosServicios[0].id
      } else if (nuevosServicios.length === 0) {
        servicioActivoTab.value = null
      }
    }, { immediate: true })

    // Métodos
    const verDetallesAtencion = () => {
      const atencion = atenciones.value[atencionActual.value]
      $q.dialog({
        title: `Detalles de ${atencion.numero}`,
        message: `
          <div>
            <strong>Fecha:</strong> ${atencion.fecha} ${atencion.hora}<br>
            <strong>Veterinario:</strong> ${atencion.veterinario}<br>
            <strong>Estado:</strong> ${atencion.estado}<br>
            <strong>Servicios:</strong> ${atencion.servicios.length}
          </div>
        `,
        html: true,
        ok: 'Cerrar'
      })
    }

    const nuevaAtencion = () => {
      $q.dialog({
        title: 'Nueva Atención',
        message: '¿Desea crear una nueva atención para este paciente?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        const fecha = new Date()
        const numeroAtencion = `A-${fecha.getFullYear()}-${String(atenciones.value.length + 1).padStart(3, '0')}`

        const nuevaAtencionData = {
          id: atenciones.value.length + 1,
          numero: numeroAtencion,
          fecha: fecha.toISOString().split('T')[0],
          hora: fecha.toTimeString().split(' ')[0].substring(0, 5),
          veterinario: 'Dr. Carlos Mendoza',
          estado: 'En curso',
          servicios: []
        }

        atenciones.value.unshift(nuevaAtencionData)
        atencionActual.value = 0

        $q.notify({
          type: 'positive',
          message: 'Nueva atención creada',
          position: 'top-right'
        })
      })
    }

    const mostrarAtenciones = () => {
      $q.dialog({
        title: 'Historial de Atenciones',
        message: `Este paciente tiene ${atenciones.value.length} atenciones registradas. Haga clic en cualquier tarjeta para seleccionarla.`,
        ok: 'Entendido'
      })
    }

    const agregarServicioEnDialogo = (servicio) => {
      if (atenciones.value[atencionActual.value].estado === 'Finalizada') {
        $q.notify({
          type: 'negative',
          message: 'No se pueden agregar servicios a una atención finalizada',
          position: 'top-right'
        })
        return
      }

      const serviciosActuales = atenciones.value[atencionActual.value].servicios
      const yaExiste = serviciosActuales.some(s => s.tipo === servicio.tipo)

      if (yaExiste) {
        $q.notify({
          type: 'negative',
          message: `El servicio "${servicio.nombre}" ya ha sido agregado a esta atención`,
          position: 'top-right',
          timeout: 3000
        })
        return
      }

      const nuevoServicio = {
        id: `${servicio.tipo}_${Date.now()}`,
        tipo: servicio.tipo,
        nombre: servicio.nombre,
        icono: servicio.icono,
        color: servicio.color,
        completado: false,
        timestamp: new Date().toLocaleString(),
        datos: {}
      }

      serviciosActuales.push(nuevoServicio)
      servicioActivoTab.value = nuevoServicio.id

      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado exitosamente`,
        position: 'top-right',
        icon: servicio.icono,
        timeout: 2500
      })
      showAddServiceDialog.value = false
    }

    const actualizarServicio = (servicioId, nuevosDatos) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (servicio) {
        servicio.datos = { ...servicio.datos, ...nuevosDatos }
      }
    }

    const completarServicio = (servicioId, datosFinales = {}) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      if (servicio) {
        servicio.completado = true
        servicio.datos = { ...servicio.datos, ...datosFinales }

        $q.notify({
          type: 'positive',
          message: `${servicio.nombre} completado exitosamente`,
          position: 'top-right',
          timeout: 2000,
          icon: 'check_circle'
        })
      }
    }

    const eliminarServicio = (servicioId) => {
      const servicio = serviciosAplicados.value.find(s => s.id === servicioId)
      
      $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el servicio "${servicio?.nombre}"?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        const servicios = atenciones.value[atencionActual.value].servicios
        const index = servicios.findIndex(s => s.id === servicioId)
        if (index > -1) {
          servicios.splice(index, 1)
          
          if (servicioActivoTab.value === servicioId) {
            if (servicios.length > 0) {
              servicioActivoTab.value = servicios[0].id
            } else {
              servicioActivoTab.value = null
            }
          }

          $q.notify({
            type: 'info',
            message: 'Servicio eliminado',
            position: 'top-right',
            timeout: 2000
          })
        }
      })
    }

    const guardarAtencion = async () => {
      guardandoAtencion.value = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        $q.notify({
          type: 'positive',
          message: 'Atención guardada correctamente',
          position: 'top-right',
          icon: 'save'
        })

        console.log('Guardando atención:', atenciones.value[atencionActual.value])
      } finally {
        guardandoAtencion.value = false
      }
    }

    const finalizarAtencion = () => {
      $q.dialog({
        title: 'Finalizar Atención',
        message: '¿Está seguro de que desea finalizar esta atención? Una vez finalizada no se podrá modificar.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        const atencion = atenciones.value[atencionActual.value]
        atencion.estado = 'Finalizada'
        atencion.fechaFinalizacion = new Date().toISOString().split('T')[0]
        atencion.horaFinalizacion = new Date().toTimeString().split(' ')[0].substring(0, 5)

        $q.notify({
          type: 'positive',
          message: 'Atención finalizada correctamente',
          position: 'top-right',
          icon: 'check_circle'
        })
      })
    }

    onBeforeUnmount(() => {
      mascotaSeleccionadaStore.limpiarMascota()
    })

    return {
      paciente,
      atenciones,
      atencionActual,
      serviciosAplicados,
      servicioActivoTab,
      guardandoAtencion,
      verDetallesAtencion,
      nuevaAtencion,
      mostrarAtenciones,
      agregarServicioEnDialogo, 
      actualizarServicio,
      completarServicio,
      eliminarServicio,
      guardarAtencion,
      finalizarAtencion,
      showAddServiceDialog 
    }
  }
}
</script>

<style scoped>
/* Header moderno compacto */
.modern-header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  overflow: hidden;
  border: none;
}

.modern-header {
  background: transparent;
  color: white;
  position: relative;
}

.modern-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.modern-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Información del paciente */
.patient-info {
  min-width: 220px;
}

.patient-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.patient-details {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.age-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.owner-info {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
}

.phone-info {
  margin-left: 8px;
}

/* Información de la atención */
.attention-info {
  min-width: 200px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.attention-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.attention-details {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.vet-info {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
}

/* Estado y servicios */
.status-info {
  min-width: 140px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.status-chip {
  font-weight: 500;
  border-radius: 20px;
}

.services-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
}

/* Botones modernos */
.modern-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.modern-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modern-btn-filled {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 12px;
}

.modern-btn-filled:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Carrusel de atenciones */
.attention-carousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.attention-carousel::-webkit-scrollbar {
  display: none;
}

.attention-card-mini {
  min-width: 60px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.attention-card-mini:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.attention-card-mini--active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.attention-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 4px;
}

.attention-card-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  line-height: 1;
}

.attention-card-date {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
  margin-top: 2px;
}

.attention-card-status {
  margin-top: 2px;
}

.more-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.more-card:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Tarjeta de servicios moderna */
.services-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
}

/* Estado vacío moderno */
.empty-services {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.empty-services-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Pestañas modernas */
.modern-tabs {
  background: #f8fafc;
  border-radius: 0;
}

.modern-tab {
  border-radius: 12px 12px 0 0;
  margin: 0 2px;
  transition: all 0.3s ease;
  position: relative;
}

.modern-tab:hover {
  background: rgba(25, 118, 210, 0.1);
}

.modern-tab.q-tab--active {
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.tab-completed {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.tab-completed.q-tab--active {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.completion-badge {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Paneles de pestañas */
.modern-tab-panels {
  background: white;
  min-height: 400px;
}

.modern-tab-panels .q-tab-panel {
  padding: 1.5rem;
}

/* Servicio genérico */
.generic-service {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.generic-service-content {
  text-align: center;
  max-width: 300px;
}

.service-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.service-status {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.service-timestamp {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

/* Botones de acción flotantes */
.floating-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .patient-info,
  .attention-info,
  .status-info {
    min-width: auto;
    padding-left: 12px;
  }
  
  .modern-header .row {
    flex-direction: column;
    gap: 16px;
  }
  
  .modern-header .col {
    width: 100%;
  }
  
  .modern-header .row.q-gutter-md {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .modern-header {
    padding: 12px 16px !important;
  }
  
  .modern-header .row.items-center {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .patient-info,
  .attention-info,
  .status-info {
    border-left: none;
    padding-left: 0;
    min-width: 100%;
  }
  
  .attention-info,
  .status-info {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 12px;
    margin-top: 8px;
  }
  
  .modern-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  
  .attention-carousel {
    justify-content: flex-start;
  }
  
  .attention-card-mini {
    min-width: 55px;
    height: 45px;
  }
  
  .floating-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    size: sm;
  }
  
  .empty-services-content {
    padding: 1rem;
  }
  
  .empty-title {
    font-size: 1.25rem;
  }
  
  .empty-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .modern-header-card {
    border-radius: 12px;
    margin: 0 -8px;
  }
  
  .services-card {
    border-radius: 12px;
    margin: 0 -8px;
  }
  
  .modern-tab {
    min-width: 80px;
    font-size: 0.8rem;
  }
  
  .modern-tab .q-tab__content {
    padding: 8px 4px;
  }
  
  .modern-tab-panels .q-tab-panel {
    padding: 1rem;
  }
}

/* Animaciones de entrada */
.modern-header-card {
  animation: slideInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.services-card {
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.floating-actions {
  animation: slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Efectos de hover mejorados */
.modern-header-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.services-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Mejoras para accesibilidad */
.modern-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.attention-card-mini:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.modern-tab:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Modo oscuro */
.body--dark .modern-header-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.body--dark .services-card {
  background: #1e1e1e;
  border: 1px solid #333;
}

.body--dark .modern-tabs {
  background: #2a2a2a;
}

.body--dark .modern-tab-panels {
  background: #1e1e1e;
}

.body--dark .empty-services {
  background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
}

.body--dark .empty-title {
  color: #e2e8f0;
}

.body--dark .empty-subtitle {
  color: #94a3b8;
}

.body--dark .empty-icon {
  color: #64748b;
}

/* Transiciones globales */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

/* Estilos para impresión */
@media print {
  .floating-actions,
  .modern-btn {
    display: none !important;
  }
  
  .modern-header-card,
  .services-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
  
  .modern-header {
    background: #f5f5f5 !important;
    color: black !important;
  }
  
  .attention-carousel {
    display: none;
  }
}

/* Estilos para el diálogo de servicios */
.servicios-dialog .q-dialog__inner {
  padding: 16px;
}

.servicios-dialog .q-dialog__inner > div {
  width: 90vw;
  max-width: 1000px;
  min-width: 600px;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: white;
}

.dialog-content {
  overflow-y: auto;
  max-height: 80vh;
}

@media (max-width: 768px) {
  .servicios-dialog .q-dialog__inner > div {
    width: 95vw;
    min-width: 300px;
    max-height: 90vh;
  }
}

@media (max-width: 480px) {
  .servicios-dialog .q-dialog__inner > div {
    width: 100vw;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
}

/* Efectos de carga y estados */
.q-skeleton {
  border-radius: 8px;
}

.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Mejoras para notificaciones */
.q-notification {
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.q-notification--positive {
  background: rgba(76, 175, 80, 0.9);
}

.q-notification--negative {
  background: rgba(244, 67, 54, 0.9);
}

.q-notification--info {
  background: rgba(33, 150, 243, 0.9);
}

/* Estilos para scrollbars personalizados */
.modern-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.modern-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.modern-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.modern-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Estados de carga mejorados */
.q-btn .q-spinner {
  color: rgba(255, 255, 255, 0.8);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 16px;
}

/* Mejoras para tooltips */
.q-tooltip {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Estados hover específicos */
.patient-info:hover {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

.attention-info:hover {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

.status-info:hover {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

/* Mejoras para badges y chips */
.q-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.q-badge {
  font-weight: 600;
  font-size: 0.7rem;
}

/* Efectos de profundidad mejorados */
.depth-1 {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.depth-2 {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.depth-3 {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
}

/* Animaciones de estado */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Mejoras para formularios (si los hay) */
.q-field .q-field__control {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  border-color: #1976d2;
}

/* Mejoras para diálogos */
.q-dialog .q-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.body--dark .q-dialog .q-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Estilos para elementos interactivos */
.interactive-element {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.interactive-element:active {
  transform: scale(0.98);
}

/* Mejoras para el rendimiento */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Estados de error y éxito */
.success-state {
  border-left: 4px solid #4caf50;
  background: linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, transparent 100%);
}

.error-state {
  border-left: 4px solid #f44336;
  background: linear-gradient(90deg, rgba(244, 67, 54, 0.1) 0%, transparent 100%);
}

.warning-state {
  border-left: 4px solid #ff9800;
  background: linear-gradient(90deg, rgba(255, 152, 0, 0.1) 0%, transparent 100%);
}

/* Animaciones de entrada para elementos dinámicos */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Mejoras para la accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Focus visible mejorado */
.focus-visible:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Mejoras para pantallas de alta densidad */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .modern-header-card {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  }
  
  .services-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}
</style>