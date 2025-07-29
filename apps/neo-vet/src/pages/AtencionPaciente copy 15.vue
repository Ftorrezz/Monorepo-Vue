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
              Propietario: <span class="text-weight-medium">{{ paciente.propietario?.nombre }} {{ paciente.propietario?.primerapellido }}</span>
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

    <!-- Panel de información de la atención actual y servicios disponibles -->
    <div class="row q-gutter-md q-mb-md">
      <!-- Información de la atención actual -->
      <div class="col-12 col-md-6">
        <q-card class="full-height">
          <q-card-section class="bg-grey-1">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">Atención Actual: {{ atenciones[atencionActual].numero }}</div>
                <div class="text-subtitle2">
                  {{ atenciones[atencionActual].fecha }} - {{ atenciones[atencionActual].hora }} |
                  {{ atenciones[atencionActual].veterinario }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  outline
                  color="primary"
                  icon="visibility"
                  label="Ver Detalles"
                  @click="verDetallesAtencion"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Servicios Disponibles -->
      <div class="col-12 col-md-6">
        <q-card class="full-height">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              <q-icon name="medical_services" class="q-mr-sm" />
              Servicios Disponibles
            </div>
            <div class="text-subtitle2 q-mt-xs">Selecciona un servicio para agregar</div>
          </q-card-section>
          <q-card-section class="q-pa-sm">
            <div class="row q-gutter-xs">
              <div
                v-for="servicio in serviciosDisponibles"
                :key="servicio.id"
                class="col-12 col-sm-6"
              >
                <q-btn
                  :class="[
                    'service-card full-width',
                    { 'service-card--disabled': isServicioYaAgregado(servicio.tipo) }
                  ]"
                  :disable="isServicioYaAgregado(servicio.tipo)"
                  @click="agregarServicio(servicio)"
                  no-caps
                  unelevated
                >
                  <div class="service-card-content">
                    <q-icon :name="servicio.icono" :color="servicio.color" size="lg" class="q-mb-xs" />
                    <div class="text-weight-bold">{{ servicio.nombre }}</div>
                    <div class="text-caption text-grey-6">{{ servicio.descripcion }}</div>
                    <q-icon
                      v-if="isServicioYaAgregado(servicio.tipo)"
                      name="check_circle"
                      color="positive"
                      size="sm"
                      class="service-added-icon"
                    />
                  </div>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Panel de servicios aplicados con pestañas -->
    <q-card>
      <q-card-section class="q-pa-none">
        <div class="text-h6 q-pa-md q-pb-none">
          <q-icon name="assignment" class="q-mr-sm" />
          Servicios Aplicados ({{ serviciosAplicados.length }})
        </div>

        <div v-if="serviciosAplicados.length === 0" class="text-center q-py-xl text-grey-6" style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <q-icon name="info" size="xl" class="q-mb-md" />
          <div class="text-h6">No se han aplicado servicios aún</div>
          <div class="text-subtitle2">Selecciona un servicio del panel superior</div>
        </div>

        <div v-else>
          <!-- Pestañas de servicios -->
          <q-tabs
            v-model="servicioActivoTab"
            dense
            class="text-grey"
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
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn-group>
        <q-btn
          fab
          icon="save"
          color="primary"
          @click="guardarAtencion"
          :loading="guardandoAtencion"
        >
          <q-tooltip>Guardar Atención</q-tooltip>
        </q-btn>
        <q-btn
          fab
          icon="close"
          color="negative"
          @click="finalizarAtencion"
        >
          <q-tooltip>Finalizar Atención</q-tooltip>
        </q-btn>
      </q-btn-group>
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

export default {
  name: 'AtencionPaciente',
  components: {
    ServicioVacunacion,
    ServicioDesparacitacion,
  },
  setup() {
    const $q = useQuasar()
    const mascotaSeleccionadaStore = useMascotaSeleccionadaStore()

    // Estados reactivos
    const guardandoAtencion = ref(false)
    const servicioActivoTab = ref(null)

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

    // Servicios disponibles
    const serviciosDisponibles = ref([
      {
        id: 'vacunacion',
        nombre: 'Vacunación',
        descripcion: 'Aplicación de vacunas',
        icono: 'vaccines',
        color: 'green',
        tipo: 'vacunacion'
      },
      {
        id: 'desparacitacion',
        nombre: 'Desparacitación',
        descripcion: 'Tratamiento antiparasitario',
        icono: 'medication',
        color: 'orange',
        tipo: 'desparacitacion'
      },
      {
        id: 'exploracion',
        nombre: 'Exploración Física',
        descripcion: 'Examen clínico general',
        icono: 'health_and_safety',
        color: 'blue',
        tipo: 'exploracion'
      },
      {
        id: 'certificado',
        nombre: 'Certificado',
        descripcion: 'Emisión de certificados',
        icono: 'description',
        color: 'purple',
        tipo: 'certificado'
      },
      {
        id: 'cirugia',
        nombre: 'Cirugía',
        descripcion: 'Procedimiento quirúrgico',
        icono: 'local_hospital',
        color: 'red',
        tipo: 'cirugia'
      },
      {
        id: 'laboratorio',
        nombre: 'Laboratorio',
        descripcion: 'Análisis de laboratorio',
        icono: 'biotech',
        color: 'teal',
        tipo: 'laboratorio'
      }
    ])

    // Servicios aplicados en esta atención
    const serviciosAplicados = computed(() => {
      return atenciones.value[atencionActual.value]?.servicios || []
    })

    // Verificar si un servicio ya está agregado
    const isServicioYaAgregado = (tipoServicio) => {
      return serviciosAplicados.value.some(servicio => servicio.tipo === tipoServicio)
    }

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

    const agregarServicio = (servicio) => {
      // Verificar si ya existe un servicio del mismo tipo en la atención actual
      const serviciosActuales = atenciones.value[atencionActual.value].servicios
      const yaExiste = serviciosActuales.some(s => s.tipo === servicio.tipo)

      if (yaExiste) {
        $q.notify({
          type: 'negative',
          message: `El servicio "${servicio.nombre}" ya ha sido agregado a esta atención`,
          position: 'top-right'
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
        message: `${servicio.nombre} agregado a la atención`,
        position: 'top-right',
        icon: servicio.icono
      })
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
      serviciosDisponibles,
      serviciosAplicados,
      servicioActivoTab,
      guardandoAtencion,
      isServicioYaAgregado,
      verDetallesAtencion,
      nuevaAtencion,
      mostrarAtenciones,
      agregarServicio,
      actualizarServicio,
      completarServicio,
      eliminarServicio,
      guardarAtencion,
      finalizarAtencion
    }
  }
}
</script>

<style scoped>
/* Estilos para las tarjetas de servicios */
.service-card {
  height: 100px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.service-card:hover:not(.service-card--disabled) {
  border-color: #1976d2;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.15);
}

.service-card--disabled {
  background: linear-gradient(145deg, #f5f5f5, #eeeeee);
  opacity: 0.6;
  cursor: not-allowed;
}

.service-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.service-added-icon {
  position: absolute;
  top: 4px;
  right: 4px;
}

/* Estilos para las pestañas */
.tab-completed {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px 8px 0 0;
}

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

/* Estilos para el header del paciente */
.q-card-section.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

/* Estilos para los chips de estado */
.q-chip {
  font-weight: 500;
  border-radius: 12px;
}

/* Estilos para los formularios de servicios */
.q-field--outlined .q-field__control {
  border-radius: 8px;
}

.q-field--outlined .q-field__control:hover {
  border-color: #1976d2;
}

/* Estilos para los iconos */
.q-icon {
  color: inherit;
}

/* Animaciones para los elementos */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.q-expansion-item .q-card {
  animation: fadeInUp 0.3s ease;
}

/* Estilos responsive */
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

  .service-card {
    height: 80px;
  }

  .service-card-content {
    padding: 8px;
  }

  .service-card-content .q-icon {
    font-size: 1.5rem;
  }

  .service-card-content .text-weight-bold {
    font-size: 0.875rem;
  }

  .service-card-content .text-caption {
    font-size: 0.75rem;
  }
}

/* Estilos para mejorar la accesibilidad */
.q-btn:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.q-item:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Estilos para el estado vacío */
.text-grey-6 {
  color: #757575;
}

/* Estilos para mejorar la legibilidad */
.q-item-label {
  font-weight: 500;
}

.q-item-label[caption] {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Estilos para las transiciones de estado */
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

/* Efecto de luz/textura para el degradado */
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

/* Animaciones para las pestañas */
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

/* Efectos hover para los botones de servicio */
.service-card .q-btn__content {
  pointer-events: none;
}

/* Estilos para mejorar la visualización de pestañas completadas */
.tab-completed .q-tab__content {
  color: #4caf50;
}

/* Sombras mejoradas para las tarjetas */
.q-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.q-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Estilos para los badges de completado */
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

/* Mejoras visuales para las notificaciones */
.q-notification {
  border-radius: 8px;
}

/* Estilos para el loading del botón guardar */
.q-btn .q-spinner {
  color: white;
}

/* Estilos adicionales para mejorar la experiencia visual */
.q-tab-panels {
  min-height: 400px;
}

.q-tab-panel {
  position: relative;
}

/* Estilos para los estados de servicios */
.service-status-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 0 2px white;
}

/* Mejoras para los botones flotantes */
.q-page-sticky .q-btn-group .q-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.q-page-sticky .q-btn-group .q-btn:hover {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 1);
}

/* Estilos para las transiciones de las tarjetas de servicio */
.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 0%, rgba(25, 118, 210, 0.05) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card:hover::before {
  opacity: 1;
}

/* Efectos de partículas para servicios completados */
.service-completed-effect {
  position: relative;
  overflow: hidden;
}

.service-completed-effect::after {
  content: '✨';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  opacity: 0;
  animation: sparkle 2s ease-in-out;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Estilos para modo oscuro */
.body--dark .service-card {
  background: linear-gradient(145deg, #2d2d2d, #1a1a1a);
  color: white;
}

.body--dark .service-card:hover:not(.service-card--disabled) {
  background: linear-gradient(145deg, #1976d2, #1565c0);
}

.body--dark .service-card--disabled {
  background: linear-gradient(145deg, #424242, #303030);
}

.body--dark .mini-card-atencion {
  background: #2d2d2d;
  color: white;
}

.body--dark .mini-card-atencion--active {
  background: #1976d2;
}

/* Efectos de carga para las pestañas */
.tab-loading {
  position: relative;
}

.tab-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1976d2, transparent);
  animation: loading-bar 1.5s infinite;
}

@keyframes loading-bar {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Estilos para mejorar la legibilidad en pantallas pequeñas */
@media (max-width: 600px) {
  .header-gradient {
    padding: 12px !important;
  }
  
  .mini-card-atencion {
    min-width: 220px;
    max-width: 280px;
    padding: 8px 12px;
  }
  
  .service-card {
    height: 70px;
  }
  
  .service-card-content .text-weight-bold {
    font-size: 0.8rem;
  }
  
  .service-card-content .text-caption {
    font-size: 0.7rem;
    display: none; /* Ocultar en móviles para ahorrar espacio */
  }
  
  .q-tab {
    min-width: 80px;
    padding: 0 8px;
  }
  
  .q-tab .q-tab__content {
    font-size: 0.8rem;
  }
  
  .q-page-sticky {
    bottom: 70px !important; /* Evitar conflicto con navegación móvil */
  }
}

/* Estilos para impresión */
@media print {
  .q-page-sticky,
  .service-card,
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

/* Animaciones de entrada para elementos */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.fade-in-left {
  animation: fadeInLeft 0.6s ease-out;
}

.fade-in-right {
  animation: fadeInRight 0.6s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Efectos de glassmorphism para elementos modernos */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Estilos para indicadores de progreso */
.progress-ring {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estilos para tooltips personalizados */
.custom-tooltip {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  backdrop-filter: blur(5px);
}

/* Efectos de micro-interacciones */
.micro-bounce {
  animation: microBounce 0.3s ease-in-out;
}

@keyframes microBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Estilos para estados de error */
.error-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* Mejoras finales para la cohesión visual */
.q-card {
  border-radius: 12px;
}

.q-btn {
  border-radius: 8px;
  font-weight: 500;
}

.q-field .q-field__control {
  border-radius: 8px;
}

/* Estilos para scrollbars personalizados en WebKit */
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

/* Estilos finales para completar la experiencia */
.component-enter-active {
  transition: all 0.3s ease-out;
}

.component-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.component-enter-from,
.component-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>