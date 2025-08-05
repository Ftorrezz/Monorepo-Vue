<template>
  <q-page class="q-pa-md full-width">
    <!-- Header compacto unificado -->
    
    <q-card class="q-mb-md rounded-borders shadow-2">
      <q-card-section class="header-gradient q-py-md q-px-lg text-white">
        <div class="row items-center q-col-gutter-md no-wrap">
    
    <!--<q-card class="q-mb-md modern-header-card">
      <q-card-section class="modern-header q-py-md q-px-lg">
        <div class="row items-center q-col-gutter-md no-wrap">-->
          <!-- Info del paciente -->
          <div class="col-auto">
            <q-avatar size="64px" icon="pets" color="white" text-color="primary" />
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
                  {{ paciente.propietario?.nombre }} {{ paciente.propietario?.primerapellido }} {{ paciente.propietario?.segundoapellido }}
                  <span v-if="paciente.propietario?.telefono1" class="phone-info">
                    • <q-icon name="phone" size="14px" /> {{ paciente.propietario?.telefono1 }}
                  </span>
                </div>
              </div>

              <!-- Columna 2: Info de atención actual -->
              <div class="attention-info">
                <div class="attention-number"> Atención actual: {{ atenciones[atencionActual].numero }}</div>
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

        <!-- Sistema de tarjetas compacto -->
        <div class="attention-cards-section q-mt-lg">
          <div class="attention-cards-container">
            <div class="attention-cards-scroll">
              <div
                v-for="(atencion, index) in atenciones"
                :key="atencion.id"
                @click="atencionActual = index"
                :class="[
                  'attention-card-compact',
                  atencionActual === index ? 'attention-card-compact--active' : '',
                  atencion.estado === 'En curso' ? 'attention-card-compact--in-progress' : 'attention-card-compact--completed'
                ]"
              >
                <!-- Indicador de estado -->
                <div class="card-status-indicator">
                  <div 
                    :class="[
                      'status-dot',
                      atencion.estado === 'En curso' ? 'status-dot--active' : 'status-dot--completed'
                    ]"
                  ></div>
                </div>

                <!-- Contenido principal compacto -->
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-number">{{ atencion.numero }}</div>
                    <q-icon 
                      v-if="atencionActual === index" 
                      name="radio_button_checked" 
                      size="16px" 
                      class="active-indicator"
                    />
                  </div>

                  <div class="card-meta">
                    <div class="card-date">
                      <q-icon name="event" size="12px" class="q-mr-xs" />
                      {{ formatDate(atencion.fecha) }} • {{ atencion.hora }}
                    </div>
                  </div>

                  <div class="card-vet">
                    <q-icon name="medical_services" size="12px" class="q-mr-xs" />
                    {{ atencion.veterinario }}
                  </div>

                  <div class="card-footer">
                    <q-chip
                      :color="atencion.estado === 'En curso' ? 'orange-6' : 'green-6'"
                      text-color="white"
                      :label="atencion.estado"
                      size="xs"
                      class="status-chip-small"
                    />
                    <div class="card-services">{{ atencion.servicios.length }} serv.</div>
                  </div>
                </div>

                <!-- Overlay para tarjeta activa -->
                <div v-if="atencionActual === index" class="active-overlay"></div>
              </div>
            </div>

            <!-- Navegación -->
            <div class="cards-navigation" v-if="atenciones.length > 3">
              <q-btn
                dense
                round
                icon="chevron_left"
                color="white"
                text-color="primary"
                size="sm"
                @click="navigateCards('prev')"
                :disable="atencionActual === 0"
                class="nav-btn"
              />
              <q-btn
                dense
                round
                icon="chevron_right"
                color="white"
                text-color="primary"
                size="sm"
                @click="navigateCards('next')"
                :disable="atencionActual === atenciones.length - 1"
                class="nav-btn"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resto del contenido permanece igual -->
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
          <div v-if="serviciosAplicados.length === 0" class="text-center q-py-xl text-grey-6" style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <q-icon name="info" size="xl" class="q-mb-md" />
          <div class="text-h6">No se han aplicado servicios aún</div>
          <div class="text-subtitle2">Usa el botón "Agregar Servicio" para añadir servicios</div>
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
              <!-- Componente de Laboratorio -->
              <OrdenLaboratorio
                v-else-if="servicio.tipo === 'laboratorio'"
                :servicio-id="servicio.id"
                :atencion-id="atenciones[atencionActual].id"
                :datos-iniciales="servicio.datos"
                :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                @servicio-actualizado="actualizarServicio"
                @servicio-completado="completarServicio"
                @servicio-eliminado="eliminarServicio"  
              />
              <!-- Componente de Rayos X -->
              <ServicioRayosX
                v-else-if="servicio.tipo === 'rayosx'"
                :servicio-id="servicio.id"
                :atencion-id="atenciones[atencionActual].id"
                :datos-iniciales="servicio.datos"
                :modo-lectura="servicio.completado || atenciones[atencionActual].estado === 'Finalizada'"
                @servicio-actualizado="actualizarServicio"
                @servicio-completado="completarServicio"
                @servicio-eliminado="eliminarServicio"  
              />
              <ServicioUltrasonido
                v-else-if="servicio.tipo === 'ultrasonido'"
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
import OrdenLaboratorio from '../components/laboratorio/OrdenLaboratorio.vue';
import ServicioRayosX from '../components/servicios/ServicioRayosX.vue';
import ServicioUltrasonido from 'src/components/servicios/ServicioUltrasonido.vue';
export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparacitacion,
    ServiciosDisponibles,
    OrdenLaboratorio,
    ServicioRayosX,
    ServicioUltrasonido
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
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      })
    }

    const navigateCards = (direction) => {
      if (direction === 'prev' && atencionActual.value > 0) {
        atencionActual.value--
      } else if (direction === 'next' && atencionActual.value < atenciones.value.length - 1) {
        atencionActual.value++
      }
    }

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
      formatDate,
      navigateCards,
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
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(25, 118, 210, 0.3);
  border: none;
}

.modern-header {
  color: white;
  position: relative;
}

.modern-avatar {
  background: rgba(255, 255, 255, 0.95);
  color: #1976d2;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-icon {
  color: #1976d2 !important;
  font-weight: 600;
}

/* Información del paciente */
.patient-info {
  min-width: 250px;
}

.patient-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.patient-details {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.age-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.owner-info {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

.phone-info {
  margin-left: 8px;
}

/* Información de la atención */
.attention-info {
  min-width: 220px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.attention-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.attention-details {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.vet-info {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

/* Estado y servicios */
.status-info {
  min-width: 160px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.status-chip {
  font-weight: 500;
  border-radius: 20px;
  font-size: 0.85rem;
}

.services-count {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

/* Botones modernos */
.modern-btn-large {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #1976d2;
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-btn-large:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  color: #1976d2;
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

/* SISTEMA DE TARJETAS COMPACTO */
.attention-cards-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.attention-cards-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.attention-cards-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.attention-cards-scroll::-webkit-scrollbar {
  height: 3px;
}

.attention-cards-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.attention-cards-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.attention-card-compact {
  min-width: 220px;
  max-width: 240px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(10px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.attention-card-compact:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.attention-card-compact--active {
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px) scale(1.05);
  z-index: 10;
}

.attention-card-compact--active * {
  color: #333 !important;
}

.attention-card-compact--active .active-indicator {
  color: #FFD700 !important;
}

.attention-card-compact--in-progress:not(.attention-card-compact--active) {
  border-left: 3px solid #FF9800;
}

.attention-card-compact--completed:not(.attention-card-compact--active) {
  border-left: 3px solid #4CAF50;
}

.card-status-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--active {
  background: #FF9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.4);
  animation: pulse-orange 2s infinite;
}

.status-dot--completed {
  background: #4CAF50;
}

@keyframes pulse-orange {
  0% { box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.2); }
  100% { box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.4); }
}

.card-content {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-number {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
}

.active-indicator {
  color: #FFD700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
}

.card-meta {
  margin-bottom: 6px;
}

.card-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  line-height: 1;
}

.card-vet {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  line-height: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-chip-small {
  font-size: 0.65rem;
  font-weight: 600;
  height: 18px;
  padding: 0 6px;
}

.card-services {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.active-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.05));
  pointer-events: none;
  border-radius: 10px;
}

.cards-navigation {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 5;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 28px;
  height: 28px;
}

.nav-btn:hover {
  background: white;
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.4;
  transform: none;
}

/* Resto de estilos */
.services-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
}

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

.modern-tabs {
  background: #f8fafc;
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

.modern-tab-panels {
  background: white;
  min-height: 400px;
}

.modern-tab-panels .q-tab-panel {
  padding: 1.5rem;
}

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

/* MODO OSCURO - MEJORAS */
.body--dark .modern-header-card {
  background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
}

.body--dark .modern-avatar {
  background: rgba(255, 255, 255, 0.95);
  color: #1976d2;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.body--dark .avatar-icon {
  color: #1976d2 !important;
}

.body--dark .modern-btn-large {
  background: rgba(255, 255, 255, 0.95);
  color: #1976d2;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.body--dark .modern-btn-large:hover {
  background: white;
  color: #1976d2;
}

.body--dark .attention-card-compact {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.body--dark .attention-card-compact:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.body--dark .attention-card-compact--active {
  background: rgba(30, 30, 30, 0.95);
  border-color: #FFD700;
}

.body--dark .attention-card-compact--active * {
  color: white !important;
}

.body--dark .attention-card-compact--active .active-indicator {
  color: #FFD700 !important;
}

.body--dark .services-card {
  background: #1e1e1e;
  color: white;
}

.body--dark .empty-services {
  background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
}

.body--dark .empty-title {
  color: white;
}

.body--dark .empty-subtitle {
  color: #aaa;
}

.body--dark .empty-icon {
  color: #666;
}

.body--dark .modern-tabs {
  background: #2a2a2a;
}

.body--dark .modern-tab-panels {
  background: #1e1e1e;
}

.body--dark .nav-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.body--dark .nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 1024px) {
  .patient-info,
  .attention-info,
  .status-info {
    min-width: auto;
    padding-left: 12px;
  }
  
  .attention-card-compact {
    min-width: 200px;
    max-width: 220px;
    height: 90px;
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
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    padding-top: 16px;
    margin-top: 12px;
  }
  
  .attention-card-compact {
    min-width: 180px;
    max-width: 200px;
    height: 85px;
  }
  
  .card-content {
    padding: 8px;
  }
  
  .cards-navigation {
    display: none;
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
  
  .attention-card-compact {
    min-width: 160px;
    max-width: 180px;
    height: 80px;
  }
  
  .card-number {
    font-size: 0.9rem;
  }
  
  .card-date,
  .card-vet {
    font-size: 0.7rem;
  }
}

/* Transiciones suaves */
* {
  transition: all 0.2s ease-in-out;
}

/* Mejoras adicionales */
.attention-card-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.02) 100%);
  pointer-events: none;
  border-radius: inherit;
}

.attention-card-compact--active::before {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%);
}

/* Estados de hover mejorados */
.modern-header-card {
  transform: translateY(0);
  transition: all 0.3s ease;
}

.modern-header-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(25, 118, 210, 0.4);
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
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.attention-card-compact:focus {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}

.modern-tab:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Estados para impresión */
@media print {
  .floating-actions,
  .modern-btn-large,
  .cards-navigation {
    display: none !important;
  }
  
  .modern-header-card,
  .services-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
  
  .modern-header {
    background: #e0e0e0 !important;
    color: black !important;
  }
  
  .modern-header-card {
    background: #e0e0e0 !important;
    box-shadow: none !important;
  }
  
  .attention-cards-scroll {
    display: none;
  }
}

/* Estilos para diálogos */
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
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

/* Estados de loading mejorados */
.q-btn .q-spinner {
  color: rgba(255, 255, 255, 0.9);
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

/* Mejoras para formularios */
.q-field .q-field__control {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  border-color: #1976d2;
}

/* Mejoras para diálogos generales */
.q-dialog .q-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.body--dark .q-dialog .q-card {
  background: rgba(30, 30, 30, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.05);
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

/* Mejoras para la accesibilidad - reducción de movimiento */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .status-dot--active {
    animation: none !important;
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
  
  .attention-card-compact {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
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

/* Mejoras para touch devices */
@media (hover: none) {
  .modern-btn-large:hover,
  .attention-card-compact:hover,
  .action-btn:hover {
    transform: none;
  }
  
  .modern-btn-large:active,
  .attention-card-compact:active,
  .action-btn:active {
    transform: scale(0.95);
  }
  
  .attention-card-compact--active:active {
    transform: translateY(-4px) scale(1.05);
  }
}

/* Mejoras finales para visibilidad */
.q-card-section {
  color: inherit;
}

.modern-header * {
  color: white !important;
}

.attention-card-compact * {
  color: rgba(255, 255, 255, 0.9);
}

.attention-card-compact--active .card-number,
.attention-card-compact--active .card-date,
.attention-card-compact--active .card-vet,
.attention-card-compact--active .card-services {
  color: #333 !important;
}

.attention-card-compact--active .active-indicator {
  color: #FFD700 !important;
}

/* Asegurar que todos los elementos sean clickeables */
.modern-btn-large,
.attention-card-compact,
.action-btn,
.nav-btn {
  pointer-events: all;
  cursor: pointer;
}

/* Efectos de entrada suaves para las tarjetas */
.attention-card-compact {
  animation: slideInFromBottom 0.5s ease-out;
}

@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mejoras para la selección de texto */
.attention-card-compact * {
  user-select: none;
}

.card-number,
.card-date,
.card-vet {
  user-select: text;
}

/* Estados finales para completar el diseño */
.attention-cards-section {
  position: relative;
  z-index: 1;
}

.modern-header * {
  z-index: auto;
}

/* Optimizaciones de rendimiento */
.attention-card-compact,
.modern-header-card,
.services-card {
  will-change: transform;
  transform: translateZ(0);
}

.header-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  position: relative;
  overflow: hidden;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at top left, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(-15deg);
  pointer-events: none;
}

/* Fin de estilos */
</style>
