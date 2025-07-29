<template>
  <q-page class="q-pa-md full-width">
    <!-- Header compacto unificado -->
    <q-card class="q-mb-md modern-header-card">
      <q-card-section class="modern-header q-py-md q-px-lg">
        <div class="row items-center q-col-gutter-md no-wrap">
          <!-- Info del paciente -->
          <div class="col-auto">
            <q-avatar size="56px" class="modern-avatar">
              <q-icon name="pets" size="28px" />
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
                  <q-icon name="person" size="16px" class="q-mr-xs" />
                  {{ paciente.propietario?.nombre }} {{ paciente.propietario?.primerapellido }}
                  <span v-if="paciente.propietario?.telefono1" class="phone-info">
                    • <q-icon name="phone" size="14px" /> {{ paciente.propietario?.telefono1 }}
                  </span>
                </div>
              </div>

              <!-- Columna 2: Info de atención actual -->
              <div class="attention-info">
                <div class="attention-number">{{ atenciones[atencionActual].numero }}</div>
                <div class="attention-details">
                  <q-icon name="event" size="16px" class="q-mr-xs" />
                  {{ atenciones[atencionActual].fecha }} • {{ atenciones[atencionActual].hora }}
                </div>
                <div class="vet-info">
                  <q-icon name="medical_services" size="16px" class="q-mr-xs" />
                  {{ atenciones[atencionActual].veterinario }}
                </div>
              </div>

              <!-- Columna 3: Estado y servicios -->
              <div class="status-info">
                <q-chip
                  :color="atenciones[atencionActual].estado === 'En curso' ? 'orange' : 'green'"
                  text-color="white"
                  :label="atenciones[atencionActual].estado"
                  size="md"
                  class="status-chip"
                >
                  <q-icon 
                    :name="atenciones[atencionActual].estado === 'En curso' ? 'play_circle' : 'check_circle'" 
                    size="sm" 
                    class="q-mr-xs" 
                  />
                </q-chip>
                <div class="services-count">
                  <q-icon name="assignment" size="16px" class="q-mr-xs" />
                  {{ serviciosAplicados.length }} servicios
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción más grandes -->
          <div class="col-auto">
            <div class="row q-gutter-sm">
              <q-btn
                dense
                round
                icon="add"
                color="primary"
                size="md"
                @click="nuevaAtencion"
                class="modern-btn-large"
              >
                <q-tooltip>Nueva Atención</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                icon="history"
                color="grey-6"
                size="md"
                @click="mostrarAtenciones"
                class="modern-btn-large"
              >
                <q-tooltip>Historial</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                icon="visibility"
                color="info"
                size="md"
                @click="verDetallesAtencion"
                class="modern-btn-large"
              >
                <q-tooltip>Ver Detalles</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                icon="add_circle"
                color="positive"
                size="md"
                @click="showAddServiceDialog = true"
                :disable="atenciones[atencionActual].estado === 'Finalizada'"
                class="modern-btn-large"
              >
                <q-tooltip>Agregar Servicio</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <div style="display: flex; overflow-x: auto; gap: 16px; padding-bottom: 8px;">
          <div
            v-for="(atencion, index) in atenciones"
            :key="atencion.id"
            @click="atencionActual = index"
            :class="[
              'mini-card-atencion',
              atencionActual === index ? 'mini-card-atencion--active' : '',
              $q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-dark'
            ]"
            style="min-width: 260px; max-width: 340px; cursor: pointer; user-select: none;"
          >
            <div class="row items-center no-wrap q-mb-xs">
              <q-icon :name="atencion.estado === 'En curso' ? 'play_circle' : 'check_circle'" :color="atencionActual === index ? 'primary' : 'grey-6'" size="sm" class="q-mr-xs" />
              <span class="text-weight-medium" style="font-size: 1rem;">{{ atencion.numero }}</span>
              <q-btn
                v-if="atencionActual === index"
                dense flat round size="sm"
                icon="expand_more"
                @click.stop="atencionExpandida = atencionExpandida === index ? null : index"
                :aria-label="atencionExpandida === index ? 'Ocultar detalles' : 'Mostrar detalles'"
                class="q-ml-xs"
                :class="{'rotate-180': atencionExpandida === index}"
              />
            </div>
            <div class="row items-center no-wrap text-caption text-grey-7 q-mb-xs" style="font-size: 0.92rem;">
              <q-icon name="event" size="xs" class="q-mr-xs" />
              <span>{{ atencion.fecha }} {{ atencion.hora }}</span>
              <q-chip
                :color="atencion.estado === 'En curso' ? 'orange' : 'green'"
                text-color="white"
                :label="atencion.estado"
                size="sm"
                class="q-ml-sm"
                style="font-size: 0.85rem;"
              />
            </div>
            <transition name="fade">
              <div v-if="atencionExpandida === index && atencionActual === index" class="q-mt-xs" style="font-size: 0.92rem;">
                <div class="text-caption text-grey-7">Veterinario: {{ atencion.veterinario }}</div>
                <div class="text-caption">Servicios: {{ atencion.servicios.length }}</div>
                <div
                  v-if="atencion.fechaFinalizacion"
                  class="row items-center no-wrap text-caption text-grey-7 q-mb-xs"
                  style="font-size: 0.92rem;"
                >
                  <q-icon name="event_available" size="xs" class="q-mr-xs" />
                  <span>Finalizada: {{ atencion.fechaFinalizacion }} {{ atencion.horaFinalizacion }}</span>
                </div>
                <div v-if="atencionActual === index" class="text-primary text-caption q-mt-xs"><q-icon name="check_circle" size="xs" /> Activa</div>
              </div>
            </transition>
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
          size="lg"
        >
          <q-tooltip anchor="center left" self="center right">Guardar Atención</q-tooltip>
        </q-btn>
        <q-btn
          fab
          icon="check_circle"
          color="positive"
          @click="finalizarAtencion"
          class="action-btn q-ml-sm"
          size="lg"
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
  background: #1976d2; /* Cambiado a un color primario sólido */
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(25, 118, 210, 0.3); /* Ajustado a la sombra del nuevo color */
  /* overflow: hidden;  Eliminado para simplicidad */
  border: none;
}

.modern-header {
  /* background: transparent; Eliminado */
  color: white; /* Asegura que el texto sea blanco */
  position: relative;
}

.modern-header::before {
  /* Regla eliminada */
}

.modern-avatar {
  background: white; /* Fondo blanco para mayor contraste */
  color: #1976d2; /* Color primario para el icono */
  /* backdrop-filter: blur(8px); Eliminado o no necesario sin el ::before */
  border: 2px solid rgba(255, 255, 255, 0.6); /* Borde más visible */
}

/* Información del paciente - mejorada */
.patient-info {
  min-width: 250px;
}

.patient-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: white; /* Asegura color blanco */
  margin-bottom: 4px;
}

.patient-details {
  font-size: 0.9rem;
  color: white; /* Asegura color blanco */
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.age-badge {
  background: rgba(255, 255, 255, 0.4); /* Opacidad ajustada */
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white; /* Asegura color blanco */
}

.owner-info {
  font-size: 0.85rem;
  color: white; /* Asegura color blanco */
  display: flex;
  align-items: center;
}

.phone-info {
  margin-left: 8px;
}

/* Información de la atención - mejorada */
.attention-info {
  min-width: 220px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.3); /* Borde ajustado */
}

.attention-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: white; /* Asegura color blanco */
  margin-bottom: 4px;
}

.attention-details {
  font-size: 0.85rem;
  color: white; /* Asegura color blanco */
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.vet-info {
  font-size: 0.85rem;
  color: white; /* Asegura color blanco */
  display: flex;
  align-items: center;
}

/* Estado y servicios - mejorado */
.status-info {
  min-width: 160px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.3); /* Borde ajustado */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.status-chip {
  font-weight: 500;
  border-radius: 20px;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.3); /* Fondo más claro para chip */
  color: white; /* Asegura texto blanco */
}

.services-count {
  font-size: 0.85rem;
  color: white; /* Asegura color blanco */
  display: flex;
  align-items: center;
}

/* Botones modernos más grandes */
.modern-btn-large {
  /* backdrop-filter: blur(8px); Eliminado */
  background: white; /* Fondo blanco */
  border: 1px solid rgba(0, 0, 0, 0.1); /* Borde sutil */
  color: #1976d2; /* Color primario para los iconos */
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;
}

.modern-btn-large:hover {
  background: #f0f0f0; /* Ligeramente gris en hover */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); /* Sombra más suave */
  color: #1976d2; /* Asegura color primario */
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

/* Carrusel de atenciones más grande */
.attention-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: none;
}

.attention-carousel::-webkit-scrollbar {
  display: none;
}

.attention-card-mini {
  min-width: 100px; /* Aumentado de 85px a 100px */
  height: 85px; /* Aumentado de 70px a 85px */
  background: rgba(255, 255, 255, 0.2); /* Fondo semitransparente para inactivas */
  border: 1px solid rgba(255, 255, 255, 0.3); /* Borde más visible */
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  /* backdrop-filter: blur(10px); Eliminado */
}

.attention-card-mini:hover {
  background: rgba(255, 255, 255, 0.3); /* Más opaco en hover */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.attention-card-mini--active {
  background: white; /* Fondo blanco para la tarjeta activa */
  border-color: #1976d2; /* Borde con color primario */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada */
  transform: translateY(-1px);
}

.attention-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 8px;
}

.attention-card-number {
  font-size: 1rem; /* Aumentado de 0.85rem a 1rem */
  font-weight: 600;
  color: #333; /* Texto oscuro para la tarjeta activa */
  line-height: 1;
}

.attention-card-date {
  font-size: 0.85rem; /* Aumentado de 0.75rem a 0.85rem */
  color: #555; /* Texto oscuro para la tarjeta activa */
  line-height: 1;
  margin: 4px 0;
}

.attention-card-status {
  margin-top: 4px;
}

.more-card {
  background: rgba(255, 255, 255, 0.2); /* Fondo semitransparente para 'más' */
  border: 1px dashed rgba(255, 255, 255, 0.4); /* Borde ajustado */
}

.more-card:hover {
  background: rgba(255, 255, 255, 0.3); /* Más opaco en hover */
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
  animation: none; /* Eliminar animación para simplicidad */
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

/* Botones de acción flotantes más grandes */
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
    padding: 16px 20px !important;
  }
  
  .modern-header .row.items-center {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
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
    border-top: 1px solid rgba(255, 255, 255, 0.3); /* Borde ajustado */
    padding-top: 16px;
    margin-top: 12px;
  }
  
  .modern-btn-large {
    width: 40px;
    height: 40px;
  }
  
  .attention-carousel {
    justify-content: flex-start;
  }
  
  .attention-card-mini {
    min-width: 85px; /* Aumentado de 75px a 85px para media query */
    height: 70px; /* Aumentado de 60px a 70px para media query */
  }
  
  .floating-actions {
    flex-direction: column;
    gap: 8px;
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
  
  .modern-btn-large {
    width: 36px;
    height: 36px;
  }
  
  .attention-card-mini {
    min-width: 80px; /* Aumentado de 70px a 80px para media query */
    height: 65px; /* Aumentado de 55px a 65px para media query */
  }
}

/* Animaciones de entrada */
.modern-header-card {
  animation: none; /* Desactivar animación de entrada para evitar conflictos visuales */
}

.services-card {
  animation: none; /* Desactivar animación de entrada */
}

.floating-actions {
  animation: none; /* Desactivar animación de entrada */
}

/* Efectos de hover mejorados - ahora siempre visibles */
.modern-header-card {
  transform: translateY(0);
  transition: all 0.3s ease;
}

.modern-header-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(25, 118, 210, 0.4); /* Ajustado a la sombra del nuevo color */
}

.services-card {
  transform: translateY(0);
  transition: all 0.3s ease;
}

.services-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Mejoras para accesibilidad */
.modern-btn-large:focus {
  outline: 2px solid rgba(0, 0, 0, 0.8); /* Ajustado a color oscuro para contraste */
  outline-offset: 2px;
}

.attention-card-mini:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8); /* Mantener blanco para contraste en fondo azul */
  outline-offset: 2px;
}

.modern-tab:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Modo oscuro */
.body--dark .modern-header-card {
  background: #0d47a1; /* Azul oscuro para modo oscuro */
}

.body--dark .modern-avatar {
  background: #333; /* Color oscuro para avatar */
  color: white; /* Color blanco para icono */
  border: 2px solid rgba(255, 255, 255, 0.2); /* Borde más sutil */
}

.body--dark .modern-btn-large {
  background: #333; /* Fondo oscuro para botones */
  color: white; /* Color blanco para iconos */
  border: 1px solid #555; /* Borde más visible */
}

.body--dark .modern-btn-large:hover {
  background: #444; /* Oscurecer en hover */
  color: white; /* Mantener blanco */
}

.body--dark .attention-card-mini {
  background: rgba(0, 0, 0, 0.3); /* Fondo oscuro semitransparente para inactivas */
  border: 1px solid rgba(0, 0, 0, 0.4); /* Borde más visible */
}

.body--dark .attention-card-mini:hover {
  background: rgba(0, 0, 0, 0.4); /* Más opaco en hover */
}

.body--dark .attention-card-mini--active {
  background: #333; /* Fondo más oscuro para la tarjeta activa */
  border-color: #1976d2; /* Borde con color primario */
}

.body--dark .attention-card-number,
.body--dark .attention-card-date,
.body--dark .attention-card-status {
  color: white; /* Texto blanco en modo oscuro */
}

/* Transiciones globales suaves */
* {
  transition: all 0.2s ease-in-out; /* Transición más general para suavidad */
}

/* Elementos que no necesitan transform en hover para ser visibles */
.patient-info,
.attention-info,
.status-info {
  opacity: 1;
  transform: none;
}

/* Estilos para impresión */
@media print {
  .floating-actions,
  .modern-btn-large {
    display: none !important;
  }
  
  .modern-header-card,
  .services-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
  
  .modern-header {
    background: #e0e0e0 !important; /* Fondo claro para impresión */
    color: black !important;
  }
  
  .modern-header-card {
    background: #e0e0e0 !important; /* Fondo claro para impresión */
    box-shadow: none !important;
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

/* Mejoras para notificaciones */
.q-notification {
  backdrop-filter: blur(8px); /* Blur ligeramente reducido */
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1); /* Borde más sutil */
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

/* Mejoras para tooltips */
.q-tooltip {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 0.85rem;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Estados hover específicos - siempre visibles */
.patient-name,
.attention-number,
.status-chip,
.services-count {
  opacity: 1;
  visibility: visible;
}

/* Mejoras para badges y chips */
.q-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.q-badge {
  font-weight: 600;
  font-size: 0.75rem;
}

/* Botones flotantes más visibles */
.action-btn[size="lg"] {
  width: 60px;
  height: 60px;
}

/* Scroll personalizado para carrusel */
.attention-carousel {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.4) transparent; /* Ajustado el color del scrollbar */
}

.attention-carousel::-webkit-scrollbar {
  height: 4px;
}

.attention-carousel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.attention-carousel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4); /* Ajustado el color del thumb */
  border-radius: 2px;
}

.attention-carousel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.6); /* Ajustado el hover del thumb */
}

/* Mejoras adicionales para mejor visibilidad */
.modern-header .q-icon {
  opacity: 1;
  visibility: visible;
}

/* Estados de loading mejorados */
.q-btn .q-spinner {
  color: rgba(255, 255, 255, 0.9); /* Color más claro para el spinner */
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

/* Mejoras para formularios (si los hay) */
.q-field .q-field__control {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9); /* Fondo más opaco */
  backdrop-filter: blur(8px); /* Blur ligeramente reducido */
  border: 1px solid rgba(0, 0, 0, 0.05); /* Borde más sutil */
}

.q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  border-color: #1976d2;
}

/* Mejoras para diálogos */
.q-dialog .q-card {
  backdrop-filter: blur(10px); /* Blur reducido */
  background: rgba(255, 255, 255, 0.98); /* Más opaco */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Borde más sutil */
}

.body--dark .q-dialog .q-card {
  background: rgba(30, 30, 30, 0.98); /* Más opaco en modo oscuro */
  border: 1px solid rgba(255, 255, 255, 0.05); /* Borde más sutil */
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
    box-shadow: 0 8px 32px rgba(25, 118, 210, 0.4);
  }
  
  .services-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

/* Efectos de profundidad mejorados */
.depth-1,
.depth-2,
.depth-3 {
  box-shadow: none; /* Eliminar para simplicidad */
}

/* Animaciones de estado */
.pulse,
.bounce-in {
  animation: none; /* Eliminar animaciones para simplicidad y evitar conflictos */
}

/* Estilos para scrollbars personalizados */
.modern-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.modern-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.modern-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modern-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Mejoras finales para visibilidad */
.q-card-section {
  color: inherit;
}

.modern-header * {
  color: white !important; /* Asegura que todo el texto e iconos sean blancos */
}

.attention-card-mini * {
  color: white; /* Por defecto, texto blanco para tarjetas inactivas */
}

.attention-card-mini--active .attention-card-number,
.attention-card-mini--active .attention-card-date,
.attention-card-mini--active .attention-card-status {
  color: #333 !important; /* Texto oscuro para la tarjeta activa */
}

/* Asegurar que todos los elementos sean clickeables */
.modern-btn-large,
.attention-card-mini,
.action-btn {
  pointer-events: all;
  cursor: pointer;
}

/* Hover states más suaves */
.modern-btn-large,
.attention-card-mini {
  transition: all 0.2s ease-in-out;
}

/* Mejoras para touch devices */
@media (hover: none) {
  .modern-btn-large:hover,
  .attention-card-mini:hover,
  .action-btn:hover {
    transform: none;
  }
  
  .modern-btn-large:active,
  .attention-card-mini:active,
  .action-btn:active {
    transform: scale(0.95);
  }
}
</style>