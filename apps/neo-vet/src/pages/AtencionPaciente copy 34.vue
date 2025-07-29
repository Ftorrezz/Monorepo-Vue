<template>
  <q-page class="q-pa-md full-width">
    <!-- Header principal unificado: Contiene toda la información y acciones -->
    <q-card class="q-mb-md rounded-borders shadow-2">
      <q-card-section class="header-gradient q-py-md q-px-lg text-white">
        <div class="row items-center q-col-gutter-md no-wrap">
          <div class="col-auto">
            <q-avatar size="64px" icon="pets" color="white" text-color="primary" />
          </div>
          <div class="col">
            <div class="text-h5 text-weight-bold">{{ paciente.nombre }}</div>
            <div class="text-subtitle2 q-mt-xs">
              {{ paciente.especie }} - {{ paciente.raza }} <span v-if="paciente.edad"> - {{ paciente.edad }} años</span>
            </div>
            <div class="text-caption q-mt-sm">
              <q-icon name="person" class="q-mr-xs" size="xs" />
              Propietario: <span class="text-weight-medium">{{ paciente.propietario?.nombre }} {{ paciente.propietario?.primerapellido }} {{ paciente.propietario?.segundoapellido }}</span>
              <span v-if="paciente.propietario?.telefono1"> | <q-icon name="phone" class="q-mr-xs" size="xs" /> Tel: {{ paciente.propietario?.telefono1 }}</span>
            </div>
          </div>
          <div class="col-auto q-gutter-sm">
            <q-btn
              outline
              label="Nueva Atención"
              icon="add"
              color="white"
              class="q-px-md"
              @click="nuevaAtencion"
            />
            <q-btn
              outline
              label="Atenciones Anteriores"
              icon="history"
              color="white"
              class="q-px-md"
              @click="mostrarAtenciones"
            />
          </div>
        </div>

        <q-separator class="q-my-md" color="white" inset/>

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

    <!-- Panel de información de la atención actual con botón de ver detalles -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-grey-1">
        <div class="row items-center justify-end q-gutter-md">
          <div class="col-grow">
            <div class="text-h6">Atención Actual: {{ atenciones[atencionActual].numero }}</div>
            <div class="text-subtitle2 q-mb-xs">
              {{ atenciones[atencionActual].fecha }} - {{ atenciones[atencionActual].hora }} |
              {{ atenciones[atencionActual].veterinario }}
            </div>
            <div class="row items-center q-gutter-sm">
              <q-chip
                :color="atenciones[atencionActual].estado === 'En curso' ? 'orange' : 'green'"
                text-color="white"
                :label="atenciones[atencionActual].estado"
                size="sm"
                icon="circle"
              />
              <div class="text-caption text-grey-6">
                <q-icon name="medical_services" size="xs" class="q-mr-xs" />
                {{ serviciosAplicados.length }} servicios aplicados
              </div>
            </div>
          </div>

          <!-- Botón Ver Detalles (alineado a la derecha) -->
          <div class="col-auto">
            <q-btn
              outline
              color="primary"
              icon="visibility"
              label="Ver Detalles"
              @click="verDetallesAtencion"
              class="q-px-md"
            />
            <q-btn
              outline
              color="primary"
              icon="add"
              label="Agregar Servicio"
              @click="showAddServiceDialog = true"
              :disable="atenciones[atencionActual].estado === 'Finalizada'"
              class="q-px-md rounded"
            />
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
  <!-- Header del diálogo -->
  

  <!-- Contenido del diálogo -->
  <div class="dialog-content q-pa-lg bg-white">
    <ServiciosDisponibles
      :servicios-aplicados="serviciosAplicados"
      :atencion-finalizada="atenciones[atencionActual].estado === 'Finalizada'"
      @agregar-servicio="agregarServicioEnDialogo"
      @close="showAddServiceDialog = false"
    />
  </div>

  
</q-dialog>

    
    <!--<q-dialog v-model="showAddServiceDialog" persistent>
      
      <ServiciosDisponibles
        :servicios-aplicados="serviciosAplicados"
        :atencion-finalizada="atenciones[atencionActual].estado === 'Finalizada'"
        @agregar-servicio="agregarServicioEnDialogo"
        @close="showAddServiceDialog = false"
      />
    
    </q-dialog>-->

    <!-- Panel de servicios aplicados con pestañas -->
    <q-card>
      <q-card-section class="q-pa-none">
        <div v-if="serviciosAplicados.length === 0" class="text-center q-py-xl text-grey-6" style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <q-icon name="info" size="xl" class="q-mb-md" />
          <div class="text-h6">No se han aplicado servicios aún</div>
          <div class="text-subtitle2">Usa el botón "Agregar Servicio" para añadir servicios</div>
        </div>

        <div v-else>
          <!-- Pestañas de servicios -->
          <q-tabs
            v-model="servicioActivoTab"
            dense
            class="text-grey rounded-borders shadow-2"
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
              :class="{ 'tab-completed': servicio.completado }"
            >
              <q-badge
                v-if="servicio.completado"
                floating
                color="positive"
                rounded
              >
                <q-icon name="check" size="xs" />
              </q-badge>
            </q-tab>
          </q-tabs>

          <q-separator />

          <!-- Contenido de las pestañas -->
          <q-tab-panels
            v-model="servicioActivoTab"
            animated
            swipeable
            vertical
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
              <div v-else class="text-center q-py-xl">
                <q-icon :name="servicio.icono" size="4rem" :color="servicio.color" class="q-mb-md"/>
                <div class="text-h6">{{ servicio.nombre }}</div>
                <div class="text-body2 text-grey-5 q-mb-md">
                  Componente en desarrollo...
                </div>
                <div class="text-caption text-grey-6 q-mb-md">
                  Agregado: {{ servicio.timestamp }}
                </div>
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="Eliminar Servicio"
                  @click="eliminarServicio(servicio.id)"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>

    <!-- Botones de acción -->
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
import ServiciosDisponibles from '../components/servicios/ServiciosDisponibles.vue' // Nuevo componente

export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparacitacion,
    ServiciosDisponibles // Registrar el nuevo componente
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()

    // Estados reactivos
    const guardandoAtencion = ref(false)
    const servicioActivoTab = ref(null)
    const showAddServiceDialog = ref(false) // Controlar la visibilidad del diálogo

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
    const atencionExpandida = ref(null)

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
      // Verificar si la atención está finalizada
      if (atenciones.value[atencionActual.value].estado === 'Finalizada') {
        $q.notify({
          type: 'negative',
          message: 'No se pueden agregar servicios a una atención finalizada',
          position: 'top-right'
        })
        return
      }

      // Verificar si ya existe un servicio del mismo tipo en la atención actual
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

      // Cambiar a la pestaña del servicio recién agregado
      servicioActivoTab.value = nuevoServicio.id

      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado exitosamente`,
        position: 'top-right',
        icon: servicio.icono,
        timeout: 2500,
        actions: [
          {
            label: 'Ver',
            color: 'white',
            handler: () => {
              // Scroll hacia las pestañas
              const tabsElement = document.querySelector('.q-tabs')
              if (tabsElement) {
                tabsElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }
          }
        ]
      })
      showAddServiceDialog.value = false // Cerrar el diálogo después de agregar
    }

    // Métodos para manejar los eventos de los componentes
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
          
          // Si eliminamos el servicio activo, cambiar a otro
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
        // Simular guardado
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

    // Limpiar el store al salir de la pantalla
    onBeforeUnmount(() => {
      mascotaSeleccionadaStore.limpiarMascota()
    })

    return {
      paciente,
      atenciones,
      atencionActual,
      atencionExpandida,
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
/* Estilos existentes mantenidos */
.min-width-250 {
  min-width: 250px;
}

.transition-all {
  transition: all 0.3s ease;
}

.duration-300 {
  transition-duration: 300ms;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.row[style*="overflow-x: auto"] {
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f0f0f0;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar {
  height: 8px;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.row[style*="overflow-x: auto"]::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.border-primary {
  border-color: #1976d2 !important;
}

.border-grey-3 {
  border-color: #e0e0e0 !important;
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.q-expansion-item {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
}

.q-expansion-item.q-expansion-item--expanded {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.q-item:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
}

.scroll {
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f0f0f0;
}

.scroll::-webkit-scrollbar {
  width: 8px;
}

.scroll::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.scroll::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.scroll::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.q-page-sticky .q-btn-group {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-page-sticky .q-btn {
  margin: 0 2px;
}

.mini-card-atencion {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 10px 14px;
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 260px;
  max-width: 320px;
}

.mini-card-atencion:hover {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.10);
}

.mini-card-atencion--active {
  border: 2px solid #1976d2;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.15);
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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

.q-tab-panel {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tab-completed .q-tab__content {
  color: #4caf50;
}

.q-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.q-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.q-badge {
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.q-notification {
  border-radius: 8px;
}

.q-btn .q-spinner {
  color: white;
}

.q-tab-panels {
  min-height: 400px;
}

.q-tab-panel {
  position: relative;
}

.q-page-sticky .q-btn-group .q-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.q-page-sticky .q-btn-group .q-btn:hover {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 1);
}

.body--dark .mini-card-atencion {
  background: #2d2d2d;
  color: white;
}

.body--dark .mini-card-atencion--active {
  background: #1976d2;
}

* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.q-btn {
  border-radius: 8px;
  font-weight: 500;
}

.q-field .q-field__control {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .row.q-gutter-md.no-wrap {
    flex-direction: column;
  }

  .col-3, .col-9 {
    width: 100%;
    max-width: 100%;
  }

  .min-width-250 {
    min-width: 200px;
  }

  .q-tab {
    min-width: 80px;
    padding: 0 8px;
  }
  
  .q-tab .q-tab__content {
    font-size: 0.8rem;
  }
  
  .q-page-sticky {
    bottom: 70px !important;
  }
}

.q-btn:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.q-item:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.text-grey-6 {
  color: #757575;
}

.q-item-label {
  font-weight: 500;
}

.q-item-label[caption] {
  font-size: 0.875rem;
  opacity: 0.7;
}

.q-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
}

.q-btn:active {
  transform: translateY(0);
}

@media print {
  .q-page-sticky,
  .q-btn-dropdown,
  .q-btn {
    display: none !important;
  }
  
  .q-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
  
  .header-gradient {
    background: #f5f5f5 !important;
    color: black !important;
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Estilos para el diálogo optimizado */

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  position: relative;
}

.dialog-header::before {
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



.dialog-footer {
  border-top: 1px solid #e0e0e0;
  min-height: 60px;
}

/* Responsive para tablets */
@media (max-width: 1024px) {
  .servicios-dialog-card {
    width: 95vw;
    max-width: 900px;
    min-width: 600px;
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .servicios-dialog-card {
    width: 95vw;
    max-width: none;
    min-width: 320px;
    max-height: 90vh;
  }
  
  .dialog-content {
    padding: 16px !important;
    max-height: 65vh;
  }
  
  .dialog-header .text-h6 {
    font-size: 1.1rem;
  }
  
  .dialog-header .text-subtitle2 {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .servicios-dialog-card {
    width: 98vw;
    min-width: 300px;
    max-height: 95vh;
  }
  
  .dialog-content {
    padding: 12px !important;
    max-height: 70vh;
  }
}

/* Animación de entrada del diálogo */
.servicios-dialog-card {
  animation: dialogSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Estilos para el diálogo directo */
.servicios-dialog {
  /* El diálogo se maneja directamente con las clases de Quasar */
}

.servicios-dialog .q-dialog__inner {
  padding: 16px;
}

.servicios-dialog .q-dialog__inner > div {
  width: 90vw;
  max-width: 1100px;
  min-width: 700px;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  position: relative;
  flex-shrink: 0;
}

.dialog-header::before {
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

.dialog-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.dialog-footer {
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}

/* Responsive para tablets */
@media (max-width: 1024px) {
  .servicios-dialog .q-dialog__inner > div {
    width: 95vw;
    max-width: 800px;
    min-width: 500px;
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .servicios-dialog .q-dialog__inner {
    padding: 8px;
  }
  
  .servicios-dialog .q-dialog__inner > div {
    width: 98vw;
    max-width: none;
    min-width: 300px;
    max-height: 92vh;
  }
  
  .dialog-header .text-h6 {
    font-size: 1.1rem;
  }
  
  .dialog-header .text-subtitle2 {
    font-size: 0.85rem;
  }
  
  .dialog-content {
    padding: 16px !important;
  }
}

@media (max-width: 480px) {
  .servicios-dialog .q-dialog__inner > div {
    width: 100vw;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
  
  .dialog-content {
    padding: 12px !important;
  }
}

/* Estilos para el scroll del contenido */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Mejoras visuales adicionales */
.dialog-header .opacity-80 {
  opacity: 0.8;
}

/* Estilos para modo oscuro */
.body--dark .dialog-content {
  background: #1e1e1e !important;
}

.body--dark .dialog-footer {
  background: #2a2a2a !important;
  border-top-color: #444;
}

.body--dark .dialog-content::-webkit-scrollbar-track {
  background: #333;
}

.body--dark .dialog-content::-webkit-scrollbar-thumb {
  background: #555;
}

.body--dark .dialog-content::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>