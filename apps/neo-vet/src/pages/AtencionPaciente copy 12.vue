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
            <!--<div class="text-h6 q-mb-sm">
              <q-icon name="event" class="q-mr-sm" />
              Historial de Atenciones
            </div>-->
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

    <!-- Información de la atención actual (simplificada) -->
    <q-card class="q-mb-md">
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

    <div class="row q-gutter-md no-wrap">
      <!-- Panel de servicios disponibles -->
      <div class="col-auto"> <!-- Cambiado de col-2 a col-auto -->
        <q-card style="height: 600px;" class="services-panel"> <!-- Agregada la clase services-panel -->
          <q-card-section>
            <div class="text-h6 q-mb-md no-wrap">
              <q-icon name="medical_services" class="q-mr-sm" />
              <span class="services-panel-title-text">Servicios Disponibles</span> <!-- Envuelto el texto en un span -->
            </div>

            <q-list>
              <q-item
                v-for="servicio in serviciosDisponibles"
                :key="servicio.id"
                clickable
                @click="agregarServicio(servicio)"
                class="q-mb-sm"
              >
                <q-item-section avatar>
                  <q-icon :name="servicio.icono" :color="servicio.color" />
                </q-item-section>
                <q-item-section class="services-item-text"> <!-- Agregada la clase services-item-text -->
                  <q-item-label>{{ servicio.nombre }}</q-item-label>
                  <q-item-label caption>{{ servicio.descripcion }}</q-item-label>
                </q-item-section>
                <q-item-section side class="services-item-add-button"> <!-- Agregada la clase services-item-add-button -->
                  <q-btn
                    round
                    flat
                    icon="add"
                    size="sm"
                    color="primary"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Panel de servicios aplicados -->
      <div class="col-grow"> <!-- Cambiado de col-10 a col-grow para que ocupe el espacio restante -->
        <q-card style="height: 600px;">
          <q-card-section class="full-height">
            <div class="text-h6 q-mb-md">
              <q-icon name="assignment" class="q-mr-sm" />
              Servicios Aplicados ({{ serviciosAplicados.length }})
            </div>

            <div v-if="serviciosAplicados.length === 0" class="text-center q-py-xl text-grey-6" style="height: 500px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <q-icon name="info" size="xl" class="q-mb-md" />
              <div class="text-h6">No se han aplicado servicios aún</div>
              <div class="text-subtitle2">Selecciona un servicio del panel izquierdo</div>
            </div>

            <div v-else class="scroll" style="height: 500px;">
              <!-- Aquí es donde cambia la implementación: carga dinámica de componentes -->
              <div v-for="servicio in serviciosAplicados" :key="servicio.id" class="q-mb-md">
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
                <q-expansion-item
                  v-else
                  :icon="servicio.icono"
                  :label="servicio.nombre"
                  :caption="servicio.timestamp"
                  :header-class="`text-${servicio.color}`"
                  class="q-mb-sm"
                >
                  <q-card>
                    <q-card-section>
                      <div class="text-center q-py-md">
                        <q-icon :name="servicio.icono" size="4rem" :color="servicio.color" class="q-mb-md"/>
                        <div class="text-h6">{{ servicio.nombre }}</div>
                        <div class="text-body2 text-grey-5 q-mb-md">
                          Componente en desarrollo...
                        </div>
                        <q-btn
                          flat
                          color="negative"
                          icon="delete"
                          label="Eliminar"
                          @click="eliminarServicio(servicio.id)"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Botones de acción -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn-group>
        <q-btn
          fab
          icon="save"
          color="primary"
          @click="guardarAtencion"
        />
        <q-btn
          fab
          icon="close"
          color="negative"
          @click="finalizarAtencion"
        />
      </q-btn-group>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue'
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
    const atencionActual = ref(0) // Índice de la atención actual
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
        descripción: 'Análisis de laboratorio',
        icono: 'biotech',
        color: 'teal',
        tipo: 'laboratorio'
      }
    ])

    // Servicios aplicados en esta atención
    const serviciosAplicados = computed(() => {
      return atenciones.value[atencionActual.value]?.servicios || []
    })

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

      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado a la atención`,
        position: 'top-right'
      })
    }

    // Nuevos métodos para manejar los eventos de los componentes
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
          message: 'Servicio completado exitosamente',
          position: 'top-right',
          timeout: 2000
        })
      }
    }

    const eliminarServicio = (servicioId) => {
      $q.dialog({
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar este servicio?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        const servicios = atenciones.value[atencionActual.value].servicios
        const index = servicios.findIndex(s => s.id === servicioId)
        if (index > -1) {
          servicios.splice(index, 1)
          $q.notify({
            type: 'info',
            message: 'Servicio eliminado',
            position: 'top-right',
            timeout: 2000
          })
        }
      })
    }

    const guardarAtencion = () => {
      $q.notify({
        type: 'positive',
        message: 'Atención guardada correctamente',
        position: 'top-right'
      })

      console.log('Guardando atención:', atenciones.value[atencionActual.value])
    }

    const finalizarAtencion = () => {
      $q.dialog({
        title: 'Finalizar Atención',
        message: '¿Está seguro de que desea finalizar esta atención? Una vez finalizada no se podrá modificar.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        atenciones.value[atencionActual.value].estado = 'Finalizada'

        $q.notify({
          type: 'positive',
          message: 'Atención finalizada correctamente',
          position: 'top-right'
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
/* Mantener todos los estilos originales */
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

  .q-card[style*="height: 600px"] {
    height: auto !important;
    min-height: 400px;
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
  /* El color de fondo ahora lo da la clase dinámica */
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
  /* El color de fondo en hover lo da la clase dinámica */
}
.mini-card-atencion--active {
  border: 2px solid #1976d2;
  /* El color de fondo activo lo da la clase dinámica */
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
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); /* Degradado de azul principal */
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
  pointer-events: none; /* Asegura que no interfiera con los clics */
}

/* Nuevos estilos para el panel de servicios expandible */
.services-panel {
  width: 70px; /* Ancho inicial reducido para solo mostrar iconos */
  overflow: hidden;
  transition: width 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.services-panel:hover {
  width: 280px; /* Ancho expandido al pasar el ratón */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.services-panel .services-panel-title-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.3s ease-in-out, width 0.3s ease-in-out;
}

.services-panel:hover .services-panel-title-text {
  opacity: 1;
  width: auto;
  margin-left: 8px; /* Espacio entre el icono y el texto */
}

.services-panel .q-item-section.services-item-text {
  opacity: 0;
  width: 0; /* Oculta el texto por defecto */
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.3s ease-in-out, width 0.3s ease-in-out;
}

.services-panel:hover .q-item-section.services-item-text {
  opacity: 1;
  width: auto; /* Muestra el texto al pasar el ratón */
}

/* Asegurar que el botón de agregar también se muestre u oculte */
.services-panel .services-item-add-button {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.services-panel:hover .services-item-add-button {
  opacity: 1;
}

/* Ajustes para el item-section avatar para mantener el icono */
.services-panel .q-item-section.q-item-section--avatar {
  min-width: 40px; /* Asegura que el icono tenga espacio */
}

.services-panel .q-item {
  justify-content: center; /* Centra el icono cuando el texto está oculto */
}

.services-panel:hover .q-item {
  justify-content: flex-start; /* Alinea a la izquierda cuando el texto es visible */
}

/* Asegurar que el scrollbar no interfiera con el diseño colapsado */
.services-panel .q-list {
  overflow-y: auto;
  height: calc(100% - 70px); /* Ajusta la altura de la lista */
}
</style>
