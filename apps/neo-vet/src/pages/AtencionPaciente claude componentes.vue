<template>
  <div class="atencion-paciente">
    <!-- Header de la atención -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <div class="text-h5">Atención en Curso</div>
            <div class="text-subtitle2 text-grey-6">
              {{ pacienteActual.nombre }} - {{ pacienteActual.especie }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn-dropdown
              color="primary"
              icon="add"
              label="Agregar Servicio"
            >
              <q-list>
                <q-item 
                  v-for="servicio in tiposServiciosDisponibles" 
                  :key="servicio.tipo"
                  clickable 
                  @click="manejarAgregarServicio(servicio.tipo)"
                >
                  <q-item-section avatar>
                    <q-icon :name="servicio.icono" :color="servicio.color"/>
                  </q-item-section>
                  <q-item-section>{{ servicio.titulo }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista de servicios aplicados -->
    <div class="servicios-container">
      <template v-if="serviciosAplicados.length > 0">
        <div v-for="servicio in serviciosAplicados" :key="servicio.id" class="q-mb-md">
          <!-- Componente de Vacunación -->
          <ServicioVacunacion
            v-if="servicio.tipo === 'vacunacion'"
            :atencion-id="servicio.atencionId"
            :servicio-id="servicio.id"
            :modo-lectura="servicio.completado"
            @servicio-actualizado="manejarActualizacionServicio"
            @servicio-completado="manejarCompletarServicio"
            @servicio-eliminado="manejarEliminarServicio"
          />
          
          <!-- Componente de Desparacitación -->
          <ServicioDesparacitacion
            v-else-if="servicio.tipo === 'desparacitacion'"
            :atencion-id="servicio.atencionId"
            :servicio-id="servicio.id"
            :modo-lectura="servicio.completado"
            @servicio-actualizado="manejarActualizacionServicio"
            @servicio-completado="manejarCompletarServicio"
            @servicio-eliminado="manejarEliminarServicio"
          />
          
          <!-- Componente genérico para otros servicios -->
          <q-card v-else class="servicio-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="info" class="q-mr-md"/>
                <div class="col">
                  <div class="text-h6">{{ servicio.tipo }}</div>
                  <div class="text-caption">En desarrollo...</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
      
      <!-- Estado vacío -->
      <template v-else>
        <q-card class="text-center q-pa-xl">
          <q-card-section>
            <q-icon name="medical_services" size="4rem" color="grey-4" class="q-mb-md"/>
            <div class="text-h6 text-grey-6 q-mb-sm">No hay servicios agregados</div>
            <div class="text-body2 text-grey-5">
              Utiliza el botón "Agregar Servicio" para comenzar con la atención
            </div>
          </q-card-section>
        </q-card>
      </template>
    </div>

    <!-- Panel de resumen -->
    <q-card v-if="serviciosAplicados.length > 0" class="q-mt-md">
      <q-card-section class="bg-blue-1">
        <div class="text-h6">Resumen de la Atención</div>
      </q-card-section>
      
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <q-stat
              :value="serviciosAplicados.length"
              label="Total Servicios"
              color="primary"
            />
          </div>
          <div class="col-6 col-md-3">
            <q-stat
              :value="serviciosCompletados"
              label="Completados"
              color="positive"
            />
          </div>
          <div class="col-6 col-md-3">
            <q-stat
              :value="serviciosPendientes"
              label="Pendientes"
              color="orange"
            />
          </div>
          <div class="col-6 col-md-3">
            <q-stat
              :value="porcentajeCompletado + '%'"
              label="Progreso"
              color="info"
            />
          </div>
        </div>
      </q-card-section>
      
      <q-card-actions align="right" class="bg-grey-1">
        <q-btn
          flat
          label="Guardar Borrador"
          color="grey-8"
          @click="guardarBorrador"
        />
        <q-btn
          :disable="serviciosPendientes > 0"
          color="positive"
          label="Finalizar Atención"
          @click="finalizarAtencion"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useServiciosAtencion } from '../composables/useServiciosAtencion'
import ServicioVacunacion from '../components/servicios/ServicioVacunacion.vue'
import ServicioDesparacitacion from '../components/servicios/ServicioDesparacitacion.vue'

// Props
const props = defineProps({
  pacienteId: {
    type: String,
    required: true
  }
})

// Composables
const $q = useQuasar()
const { 
  serviciosAplicados, 
  agregarServicio, 
  actualizarServicio, 
  completarServicio,
  eliminarServicio 
} = useServiciosAtencion()

// Estados locales
const atencionActual = ref(`atencion_${Date.now()}`)
const pacienteActual = ref({
  nombre: 'Max',
  especie: 'Canino',
  raza: 'Golden Retriever',
  edad: '3 años'
})

// Tipos de servicios disponibles
const tiposServiciosDisponibles = [
  {
    tipo: 'vacunacion',
    titulo: 'Vacunación',
    icono: 'vaccines',
    color: 'green'
  },
  {
    tipo: 'desparacitacion',
    titulo: 'Desparacitación',
    icono: 'medication',
    color: 'orange'
  },
  {
    tipo: 'exploracion',
    titulo: 'Exploración Física',
    icono: 'health_and_safety',
    color: 'blue'
  },
  {
    tipo: 'cirugia',
    titulo: 'Cirugía',
    icono: 'local_hospital',
    color: 'red'
  },
  {
    tipo: 'laboratorio',
    titulo: 'Análisis de Laboratorio',
    icono: 'biotech',
    color: 'teal'
  },
  {
    tipo: 'certificado',
    titulo: 'Certificado',
    icono: 'description',
    color: 'purple'
  }
]

// Computed properties
const serviciosCompletados = computed(() => {
  return serviciosAplicados.value.filter(s => s.completado).length
})

const serviciosPendientes = computed(() => {
  return serviciosAplicados.value.filter(s => !s.completado).length
})

const porcentajeCompletado = computed(() => {
  if (serviciosAplicados.value.length === 0) return 0
  return Math.round((serviciosCompletados.value / serviciosAplicados.value.length) * 100)
})

// Métodos
const manejarAgregarServicio = (tipoServicio) => {
  const servicioId = agregarServicio(tipoServicio, atencionActual.value)
  
  $q.notify({
    type: 'positive',
    message: `Servicio de ${tipoServicio} agregado`,
    position: 'top-right',
    timeout: 2000
  })
}

const manejarActualizacionServicio = (servicioId, nuevosDatos) => {
  actualizarServicio(servicioId, nuevosDatos)
}

const manejarCompletarServicio = (servicioId, datosFinales) => {
  completarServicio(servicioId)
  actualizarServicio(servicioId, datosFinales)
  
  $q.notify({
    type: 'positive',
    message: 'Servicio completado exitosamente',
    position: 'top-right',
    timeout: 2000
  })
}

const manejarEliminarServicio = (servicioId) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este servicio?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    eliminarServicio(servicioId)
    
    $q.notify({
      type: 'info',
      message: 'Servicio eliminado',
      position: 'top-right',
      timeout: 2000
    })
  })
}

const guardarBorrador = () => {
  // Lógica para guardar como borrador
  $q.notify({
    type: 'info',
    message: 'Atención guardada como borrador',
    position: 'top-right',
    timeout: 2000
  })
}

const finalizarAtencion = () => {
  if (serviciosPendientes.value > 0) {
    $q.notify({
      type: 'warning',
      message: 'Completa todos los servicios antes de finalizar',
      position: 'top-right',
      timeout: 3000
    })
    return
  }
  
  $q.dialog({
    title: 'Finalizar Atención',
    message: '¿Deseas finalizar esta atención? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Lógica para finalizar la atención
    $q.notify({
      type: 'positive',
      message: 'Atención finalizada exitosamente',
      position: 'top-right',
      timeout: 3000
    })
  })
}
</script>

<style scoped>
.atencion-paciente {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.servicios-container {
  min-height: 200px;
}

.servicio-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.servicio-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.q-stat {
  text-align: center;
}

.q-stat .q-stat__value {
  font-size: 2rem;
  font-weight: bold;
}

.q-stat .q-stat__label {
  font-size: 0.875rem;
  opacity: 0.8;
}
</style>