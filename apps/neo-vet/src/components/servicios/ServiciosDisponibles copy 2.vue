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

    <!-- Lista de servicios (Migrado de Grid a Lista) -->
    <div class="services-list-container">
      <q-list separator class="br-md overflow-hidden bg-white shadow-1">
        <q-item
          v-for="servicio in serviciosFiltrados"
          :key="servicio.id"
          clickable
          v-ripple="!isServicioYaAgregado(servicio.tipo)"
          class="service-list-item q-py-sm"
          :class="{
            'service-item--disabled bg-grey-1': isServicioYaAgregado(servicio.tipo)
          }"
          @click="seleccionarServicio(servicio)"
        >
          <q-item-section avatar>
            <q-avatar 
              :color="isServicioYaAgregado(servicio.tipo) ? 'grey-4' : servicio.color" 
              text-color="white" 
              size="38px"
            >
              <q-icon :name="servicio.icono" size="20px" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-blue-10 no-wrap">
              {{ servicio.nombre }}
              <q-badge v-if="servicio.premium" color="amber" text-color="black" label="PREMIUM" size="9px" class="q-ml-sm" />
            </q-item-label>
            <q-item-label caption lines="1" class="text-grey-7">{{ servicio.descripcion }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-x-sm">
              <!-- Badges de características -->
              <div class="row q-gutter-xs hide-mobile">
                <q-badge v-if="servicio.integrable" outline color="blue-4" label="Integrable" size="9px" />
                <q-badge v-if="servicio.esDinamico" outline color="purple-4" label="Configurable" size="9px" />
              </div>

              <!-- Botones de Acción -->
              <q-btn
                v-if="!isServicioYaAgregado(servicio.tipo)"
                flat
                round
                dense
                color="primary"
                icon="add_circle"
                size="sm"
                @click.stop="seleccionarServicio(servicio)"
              >
                <q-tooltip>Agregar Servicio</q-tooltip>
              </q-btn>
              <q-icon
                v-else
                name="check_circle"
                color="positive"
                size="sm"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
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
    // Catálogo desde BD (GEN.SERVICIO con tipo_renderizado y componente_clave)
    serviciosCatalogo: {
      type: Array,
      default: null
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
      desparasitacion: 'consultas',
      desparacitacion: 'consultas', // fallback
      exploracion: 'consultas',
      certificado: 'consultas',
      receta: 'consultas',
      medicamentos: 'consultas',
      cirugia: 'procedimientos',
      hospitalizacion: 'procedimientos',
      estetica: 'procedimientos',
      rehabilitacion: 'procedimientos',
      emergencia: 'procedimientos',
      laboratorio: 'diagnostico',
      rayosx: 'diagnostico',
      ultrasonido: 'diagnostico',
      archivos: 'diagnostico'
    }
    
    // Lista de servicios fijos con su configuración especializada explícita
    const serviciosDisponiblesPredeterminados = [
      { id: 'vacunacion', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas preventivas', icono: 'vaccines', color: 'green', tipo: 'vacunacion', tipo_renderizado: 'especializado', componente_clave: 'vacunacion', esFijo: true },
      { id: 'desparasitacion', nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', icono: 'medication', color: 'orange', tipo: 'desparasitacion', tipo_renderizado: 'especializado', componente_clave: 'desparasitacion', esFijo: true },
      { id: 'exploracion', nombre: 'Exploración Física', descripcion: 'Examen clínico general', icono: 'health_and_safety', color: 'blue', tipo: 'exploracion', tipo_renderizado: 'especializado', componente_clave: 'exploracion', esFijo: true },
      { id: 'certificado', nombre: 'Certificado Médico', descripcion: 'Constancias médicas', icono: 'description', color: 'purple', tipo: 'certificado', tipo_renderizado: 'especializado', componente_clave: 'certificado', esFijo: true },
      { id: 'receta', nombre: 'Receta Médica', descripcion: 'Prescripción de medicamentos', icono: 'receipt_long', color: 'purple', tipo: 'receta', tipo_renderizado: 'especializado', componente_clave: 'receta', esFijo: true },
      { id: 'medicamentos', nombre: 'Medicamentos', descripcion: 'Gestión de prescripciones', icono: 'medication', color: 'blue', tipo: 'medicamentos', tipo_renderizado: 'especializado', componente_clave: 'medicamentos', integrable: true, esFijo: true },
      { id: 'cirugia', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos', icono: 'local_hospital', color: 'red', tipo: 'cirugia', tipo_renderizado: 'especializado', componente_clave: 'cirugia', integrable: true, esFijo: true },
      { id: 'laboratorio', nombre: 'Laboratorio', descripcion: 'Análisis y pruebas', icono: 'biotech', color: 'teal', tipo: 'laboratorio', tipo_renderizado: 'especializado', componente_clave: 'laboratorio', esFijo: true },
      { id: 'rayosx', nombre: 'Rayos X', descripcion: 'Estudios por imagen', icono: 'medical_information', color: 'indigo', tipo: 'rayosx', tipo_renderizado: 'especializado', componente_clave: 'rayosx', esFijo: true },
      { id: 'hospitalizacion', nombre: 'Hospitalización', descripcion: 'Cuidados intensivos', icono: 'local_hotel', color: 'pink', tipo: 'hospitalizacion', tipo_renderizado: 'especializado', componente_clave: 'hospitalizacion', integrable: true, esFijo: true },
      { id: 'estetica', nombre: 'Estética', descripcion: 'Corte y baño', icono: 'content_cut', color: 'cyan', tipo: 'estetica', tipo_renderizado: 'especializado', componente_clave: 'estetica', esFijo: true },
      { id: 'ultrasonido', nombre: 'Ultrasonido', descripcion: 'Diagnóstico por ultrasonido', icono: 'monitor_heart', color: 'lime', tipo: 'ultrasonido', tipo_renderizado: 'especializado', componente_clave: 'ultrasonido', esFijo: true },
      { id: 'emergencia', nombre: 'Emergencia', descripcion: 'Atención urgente 24/7', icono: 'emergency', color: 'deep-orange', tipo: 'emergencia', tipo_renderizado: 'especializado', componente_clave: 'emergencia', integrable: true, premium: true, esFijo: true },
      { id: 'rehabilitacion', nombre: 'Rehabilitación', descripcion: 'Fisioterapia y recuperación', icono: 'accessibility_new', color: 'brown', tipo: 'rehabilitacion', tipo_renderizado: 'especializado', componente_clave: 'rehabilitacion', integrable: true, esFijo: true },
      { id: 'archivos', nombre: 'Archivos Adjuntos', descripcion: 'Subir imágenes, PDFs y otros documentos', icono: 'folder_open', color: 'blue-grey', tipo: 'archivos', tipo_renderizado: 'especializado', componente_clave: 'archivos', esFijo: true }
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
      // 1. Prioridad máxima: prop custom explícito
      if (props.serviciosCustom) return props.serviciosCustom

      // 2. Catálogo desde BD (GEN.SERVICIO con tipo_renderizado)
      if (props.serviciosCatalogo && props.serviciosCatalogo.length > 0) {
        return props.serviciosCatalogo.map(s => {
          const tipo = s.componente_clave || s.identificador || String(s.id)
          
          let pred = serviciosDisponiblesPredeterminados.find(p => 
            p.tipo === tipo || 
            (typeof tipo === 'string' && p.tipo.toLowerCase() === tipo.toLowerCase())
          )
          
          // Si no encuentra por clave, intentar por nombre normalizado (sin acentos)
          if (!pred && s.nombre) {
            const nombreNormalizado = s.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            pred = serviciosDisponiblesPredeterminados.find(p => 
              p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nombreNormalizado ||
              p.tipo === nombreNormalizado
            )
          }

          return {
            // id numérico real de BD → se usa como id_servicio_def en ATENCION_SERVICIOS
            id:              s.id,
            id_servicio:     s.id,
            nombre:          (s.nombre && !s.nombre.toUpperCase().startsWith('SERVICIO ')) ? s.nombre : (pred?.nombre || s.nombre),
            descripcion:     s.descripcion || (pred?.descripcion) || '',
            icono:           s.icono || (pred?.icono) || 'medical_services',
            color:           s.color || (pred?.color) || 'primary',
            categoria:       s.categoria || (pred ? categoriasMap[pred.tipo] : 'consultas'),
            tipo_renderizado: s.tipo_renderizado || 'dinamico',
            // componente_clave: qué componente Vue cargar (ej: 'vacunacion')
            componente_clave: s.componente_clave || null,
            // tipo: para backward compat con isServicioYaAgregado
            tipo:            tipo,
            esDinamico:      s.tipo_renderizado !== 'especializado'
          }
        })
      }

      // 3. Fallback: array hardcodeado + dinámicos (backward compat)
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

.services-list-container {
  max-height: calc(75vh - 150px);
  overflow-y: auto;
  padding: 2px;
}

.service-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.service-list-item:hover:not(.service-item--disabled) {
  background-color: rgba(25, 118, 210, 0.04);
}

.service-item--disabled {
  opacity: 0.6;
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