<template>
  <div class="servicios-disponibles-modern">
    <!-- Header con búsqueda y filtros -->
    <div class="services-header q-mb-md">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-6">
          <q-input
            v-model="filtroTexto"
            outlined
            dense
            placeholder="Buscar servicios..."
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="filtroTexto">
              <q-icon name="close" class="cursor-pointer" @click="filtroTexto = ''" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-6">
          <div class="row q-gutter-sm justify-end">
            <q-btn
              :flat="categoriaSeleccionada !== 'todas'"
              :unelevated="categoriaSeleccionada === 'todas'"
              :color="categoriaSeleccionada === 'todas' ? 'primary' : 'grey-7'"
              label="Todas"
              size="sm"
              no-caps
              @click="categoriaSeleccionada = 'todas'"
            />
            <q-btn
              :flat="categoriaSeleccionada !== 'consultas'"
              :unelevated="categoriaSeleccionada === 'consultas'"
              :color="categoriaSeleccionada === 'consultas' ? 'blue' : 'grey-7'"
              label="Consultas"
              size="sm"
              no-caps
              @click="categoriaSeleccionada = 'consultas'"
            />
            <q-btn
              :flat="categoriaSeleccionada !== 'procedimientos'"
              :unelevated="categoriaSeleccionada === 'procedimientos'"
              :color="categoriaSeleccionada === 'procedimientos' ? 'purple' : 'grey-7'"
              label="Procedimientos"
              size="sm"
              no-caps
              @click="categoriaSeleccionada = 'procedimientos'"
            />
            <q-btn
              :flat="categoriaSeleccionada !== 'diagnostico'"
              :unelevated="categoriaSeleccionada === 'diagnostico'"
              :color="categoriaSeleccionada === 'diagnostico' ? 'teal' : 'grey-7'"
              label="Diagnóstico"
              size="sm"
              no-caps
              @click="categoriaSeleccionada = 'diagnostico'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de servicios -->
    <div class="services-grid">
      <q-card
        v-for="servicio in serviciosFiltrados"
        :key="servicio.id"
        class="service-card"
        :class="{
          'service-card--disabled': isServicioYaAgregado(servicio.tipo),
          'service-card--hover': !isServicioYaAgregado(servicio.tipo)
        }"
        @click="seleccionarServicio(servicio)"
        flat
        bordered
      >
        <!-- Badge premium en esquina -->
        <q-badge
          v-if="servicio.premium"
          floating
          color="amber"
          text-color="white"
          class="premium-ribbon"
        >
          <q-icon name="star" size="12px" class="q-mr-xs" />
          Premium
        </q-badge>

        <q-card-section class="text-center q-pt-md q-pb-sm q-px-sm">
          <!-- Icono grande -->
          <div class="service-icon-wrapper q-mb-sm">
            <q-avatar 
              :color="isServicioYaAgregado(servicio.tipo) ? 'grey-4' : servicio.color" 
              text-color="white" 
              size="48px"
              class="service-icon-large"
            >
              <q-icon :name="servicio.icono" size="28px" />
            </q-avatar>
            
            <!-- Check si ya está agregado -->
            <div v-if="isServicioYaAgregado(servicio.tipo)" class="service-check-overlay">
              <q-icon name="check_circle" color="positive" size="20px" />
            </div>
          </div>

          <!-- Nombre del servicio -->
          <div 
            class="service-title text-h6 text-weight-bold q-mb-xs"
            :class="{ 'text-grey-6': isServicioYaAgregado(servicio.tipo) }"
          >
            {{ servicio.nombre }}
          </div>

          <!-- Descripción -->
          <div class="service-description text-caption text-grey-7">
            {{ servicio.descripcion }}
          </div>

          <!-- Badges de características -->
          <div class="row justify-center q-mt-sm q-gutter-xs">
            <q-badge
              v-if="servicio.integrable"
              outline
              color="blue"
              label="Integrable"
              class="feature-badge"
            />
            <q-badge
              v-if="servicio.esDinamico"
              outline
              color="purple"
              label="Configurable"
              class="feature-badge"
            />
          </div>
        </q-card-section>

        <!-- Botón de acción -->
        <q-card-actions class="q-pa-sm q-pt-none">
          <q-btn
            v-if="!isServicioYaAgregado(servicio.tipo)"
            :color="servicio.color"
            label="Agregar"
            icon="add_circle_outline"
            class="full-width"
            unelevated
            no-caps
            size="sm"
            dense
          />
          <q-btn
            v-else
            color="positive"
            label="Agregado"
            icon="check_circle"
            class="full-width"
            flat
            disable
            size="sm"
            dense
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Información y acciones del footer -->
    <div class="services-footer q-mt-md q-pa-md bg-grey-1 rounded-borders">
      <div class="row items-center justify-between">
        <div class="text-caption text-grey-7">
          <q-icon name="info" size="xs" class="q-mr-xs" />
          Mostrando {{ serviciosFiltrados.length }} de {{ serviciosDisponibles.length }} servicios
        </div>
        <q-btn flat dense label="Cerrar" color="grey-7" @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ServiciosDisponibles',
  
  props: {
    serviciosAplicados: {
      type: Array,
      default: () => []
    },
    serviciosCustom: {
      type: Array,
      default: null
    },
    serviciosDinamicos: {
      type: Array,
      default: () => []
    },
    atencionFinalizada: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['agregar-servicio', 'close'],
  
  setup(props, { emit }) {
    const $q = useQuasar()
    
    // Referencias reactivas para filtros
    const filtroTexto = ref('')
    const categoriaSeleccionada = ref('todas')
    
    // Categorización de servicios
    const categoriasMap = {
      vacunacion: 'consultas',
      desparacitacion: 'consultas',
      exploracion: 'consultas',
      certificado: 'consultas',
      medicamentos: 'consultas',
      cirugia: 'procedimientos',
      hospitalizacion: 'procedimientos',
      estetica: 'procedimientos',
      rehabilitacion: 'procedimientos',
      emergencia: 'procedimientos',
      laboratorio: 'diagnostico',
      rayosx: 'diagnostico',
      ultrasonido: 'diagnostico'
    }
    
    // Lista de servicios fijos
    const serviciosDisponiblesPredeterminados = [
      { id: 'vacunacion', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas preventivas', icono: 'vaccines', color: 'green', tipo: 'vacunacion', esFijo: true },
      { id: 'desparacitacion', nombre: 'Desparacitación', descripcion: 'Tratamiento antiparasitario', icono: 'medication', color: 'orange', tipo: 'desparacitacion', esFijo: true },
      { id: 'exploracion', nombre: 'Exploración Física', descripcion: 'Examen clínico general', icono: 'health_and_safety', color: 'blue', tipo: 'exploracion', esFijo: true },
      { id: 'certificado', nombre: 'Certificado Médico', descripcion: 'Constancias médicas', icono: 'description', color: 'purple', tipo: 'certificado', esFijo: true },
      { id: 'medicamentos', nombre: 'Medicamentos', descripcion: 'Gestión de prescripciones', icono: 'medication', color: 'blue', tipo: 'medicamentos', integrable: true, esFijo: true },
      { id: 'cirugia', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos', icono: 'local_hospital', color: 'red', tipo: 'cirugia', integrable: true, esFijo: true },
      { id: 'laboratorio', nombre: 'Laboratorio', descripcion: 'Análisis y pruebas', icono: 'biotech', color: 'teal', tipo: 'laboratorio', esFijo: true },
      { id: 'rayosx', nombre: 'Rayos X', descripcion: 'Estudios por imagen', icono: 'medical_information', color: 'indigo', tipo: 'rayosx', esFijo: true },
      { id: 'hospitalizacion', nombre: 'Hospitalización', descripcion: 'Cuidados intensivos', icono: 'local_hotel', color: 'pink', tipo: 'hospitalizacion', integrable: true, esFijo: true },
      { id: 'estetica', nombre: 'Estética', descripcion: 'Corte y baño', icono: 'content_cut', color: 'cyan', tipo: 'estetica', esFijo: true },
      { id: 'ultrasonido', nombre: 'Ultrasonido', descripcion: 'Diagnóstico por ultrasonido', icono: 'monitor_heart', color: 'lime', tipo: 'ultrasonido', esFijo: true },
      { id: 'emergencia', nombre: 'Emergencia', descripcion: 'Atención urgente 24/7', icono: 'emergency', color: 'deep-orange', tipo: 'emergencia', integrable: true, premium: true, esFijo: true },
      { id: 'rehabilitacion', nombre: 'Rehabilitación', descripcion: 'Fisioterapia y recuperación', icono: 'accessibility_new', color: 'brown', tipo: 'rehabilitacion', integrable: true, esFijo: true }
    ]
    
    // Mapear servicios dinámicos
    const serviciosDinamicosMapeados = computed(() => {
      return props.serviciosDinamicos.map(servicio => ({
        id: `dinamico_${servicio.id}`,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || 'Servicio configurable',
        icono: servicio.icono || 'auto_awesome',
        color: 'primary',
        tipo: servicio.identificador,
        esDinamico: true,
        integrable: true
      }))
    })
    
    // Combinar servicios
    const serviciosDisponibles = computed(() => {
      if (props.serviciosCustom) {
        return props.serviciosCustom
      }
      
      return [
        ...serviciosDisponiblesPredeterminados,
        ...serviciosDinamicosMapeados.value
      ]
    })
    
    // Servicios filtrados
    const serviciosFiltrados = computed(() => {
      let servicios = serviciosDisponibles.value
      
      // Filtro por texto
      if (filtroTexto.value) {
        const texto = filtroTexto.value.toLowerCase()
        servicios = servicios.filter(s => 
          s.nombre.toLowerCase().includes(texto) ||
          s.descripcion.toLowerCase().includes(texto)
        )
      }
      
      // Filtro por categoría
      if (categoriaSeleccionada.value !== 'todas') {
        servicios = servicios.filter(s => {
          const categoria = categoriasMap[s.tipo] || 'consultas'
          return categoria === categoriaSeleccionada.value
        })
      }
      
      return servicios
    })
    
    const isServicioYaAgregado = (tipoServicio) => {
      return props.serviciosAplicados.some(servicio => servicio.tipo === tipoServicio)
    }
    
    const seleccionarServicio = (servicio) => {
      if (props.atencionFinalizada) {
        $q.notify({ type: 'warning', message: 'Atención finalizada', position: 'top' })
        return
      }
      
      if (isServicioYaAgregado(servicio.tipo)) {
        $q.notify({ type: 'warning', message: 'Servicio ya agregado', position: 'top' })
        return
      }
      
      emit('agregar-servicio', {
        ...servicio,
        timestamp: new Date().toLocaleString()
      })
      
      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado`,
        position: 'top',
        timeout: 2000,
        icon: servicio.icono
      })
    }
    
    return {
      serviciosDisponibles,
      serviciosFiltrados,
      isServicioYaAgregado,
      seleccionarServicio,
      filtroTexto,
      categoriaSeleccionada
    }
  }
})
</script>

<style scoped>
.servicios-disponibles-modern {
  padding: 16px;
}

.search-input {
  font-size: 14px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  max-height: calc(70vh - 120px);
  overflow-y: auto;
  padding: 4px;
}

@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}

.service-card {
  border-radius: 12px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  position: relative;
  overflow: visible;
}

.service-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: var(--q-primary) !important;
}

.service-card--disabled {
  background: #fafafa !important;
  opacity: 0.7;
  cursor: default !important;
}

.service-icon-wrapper {
  position: relative;
  display: inline-block;
}

.service-icon-large {
  transition: transform 0.3s ease;
}

.service-card--hover:hover .service-icon-large {
  transform: scale(1.1) rotate(5deg);
}

.service-check-overlay {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-title {
  font-size: 13px;
  line-height: 1.2;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-description {
  font-size: 11px;
  line-height: 1.2;
  min-height: 26px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feature-badge {
  font-size: 10px;
  padding: 2px 6px;
}

.premium-ribbon {
  position: absolute;
  top: 12px;
  right: -2px;
  padding: 4px 12px;
  border-radius: 4px 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.services-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Scrollbar personalizado */
.services-grid::-webkit-scrollbar {
  width: 8px;
}

.services-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.services-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.services-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animación de entrada */
.service-card {
  animation: fadeInUp 0.4s ease-out;
}

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

/* Dark mode */
.body--dark .service-card {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.body--dark .service-card--hover:hover {
  background: #252525;
  border-color: var(--q-primary) !important;
}

.body--dark .service-card--disabled {
  background: rgba(255, 255, 255, 0.05) !important;
}

.body--dark .services-footer {
  background: #1a1a1a;
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>