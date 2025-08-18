<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="accessibility_new" color="blue" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Fisioterapia Veterinaria</div>
          <div class="text-caption text-grey-7">
            {{ datosFisioterapia.estado === 'activo' ? `Sesión ${sesionActual} de ${datosFisioterapia.totalSesiones}` : 
               datosFisioterapia.estado === 'completado' ? 'Tratamiento completado' : 'Plan de fisioterapia' }}
          </div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item 
              clickable 
              @click="iniciarTratamiento" 
              v-if="datosFisioterapia.estado === 'planificado'"
              :disable="!formularioValido"
            >
              <q-item-section avatar>
                <q-icon name="play_arrow" color="positive"/>
              </q-item-section>
              <q-item-section>Iniciar Tratamiento</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              @click="agregarSesion" 
              v-if="datosFisioterapia.estado === 'activo'"
            >
              <q-item-section avatar>
                <q-icon name="add_circle" color="primary"/>
              </q-item-section>
              <q-item-section>Nueva Sesión</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              @click="finalizarTratamiento" 
              v-if="datosFisioterapia.estado === 'activo'"
            >
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Finalizar Tratamiento</q-item-section>
            </q-item>
            
            <q-item clickable @click="eliminarServicio">
              <q-item-section avatar>
                <q-icon name="delete" color="negative"/>
              </q-item-section>
              <q-item-section>Eliminar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>
    
    <q-card-section>
      <!-- Plan de tratamiento -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="assignment" color="blue" class="q-mr-sm"/>
            Plan de Tratamiento
          </div>
        </div>
        
        <div class="col-12 col-md-8">
          <q-input
            v-model="datosFisioterapia.indicacionMedica"
            label="Indicación Médica *"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosFisioterapia.estado !== 'planificado'"
            placeholder="Descripción del problema que requiere fisioterapia..."
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosFisioterapia.tipoTratamiento"
            :options="tiposTratamiento"
            label="Tipo de Tratamiento *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosFisioterapia.estado !== 'planificado'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosFisioterapia.areaAfectada"
            :options="areasAfectadas"
            label="Área Afectada"
            outlined
            option-label="label"
            option-value="value"
            multiple
            use-chips
            :readonly="modoLectura || datosFisioterapia.estado !== 'planificado'"
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-input
            v-model="datosFisioterapia.totalSesiones"
            label="Total Sesiones *"
            outlined
            type="number"
            min="1"
            max="50"
            :readonly="modoLectura || datosFisioterapia.estado !== 'planificado'"
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-select
            v-model="datosFisioterapia.frecuencia"
            :options="frecuencias"
            label="Frecuencia"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosFisioterapia.estado !== 'planificado'"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosFisioterapia.objetivosTratamiento"
            label="Objetivos del Tratamiento"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosFisioterapia.estado !== 'planificado'"
            placeholder="Objetivos específicos que se buscan alcanzar..."
          />
        </div>
      </div>

      <!-- Evaluación inicial -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="assessment" color="orange" class="q-mr-sm"/>
            Evaluación Inicial
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosFisioterapia.evaluacionInicial.movilidad"
            label="Evaluación de Movilidad"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
            placeholder="Descripción del rango de movimiento, limitaciones..."
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosFisioterapia.evaluacionInicial.dolor"
            label="Evaluación del Dolor"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
            placeholder="Áreas con dolor, intensidad, comportamiento..."
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-select
            v-model="datosFisioterapia.evaluacionInicial.nivelActividad"
            :options="nivelesActividad"
            label="Nivel de Actividad"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-select
            v-model="datosFisioterapia.evaluacionInicial.estadoAnimo"
            :options="estadosAnimo"
            label="Estado de Ánimo"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosFisioterapia.evaluacionInicial.peso"
            label="Peso (kg)"
            outlined
            type="number"
            step="0.1"
            :readonly="modoLectura"
            suffix="kg"
          />
        </div>
      </div>

      <!-- Progreso del tratamiento (solo si está activo o completado) -->
      <div v-if="datosFisioterapia.estado !== 'planificado'" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="timeline" color="green" class="q-mr-sm"/>
            Progreso del Tratamiento
          </div>
        </div>
        
        <div class="col-12 col-md-4">
          <q-circular-progress
            :value="porcentajeProgreso"
            size="120px"
            :thickness="0.15"
            color="primary"
            track-color="grey-3"
            show-value
            class="q-ma-md"
          >
            {{ Math.round(porcentajeProgreso) }}%
          </q-circular-progress>
          <div class="text-center text-caption">Progreso General</div>
        </div>
        
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                :model-value="sesionActual"
                label="Sesiones Realizadas"
                outlined
                readonly
                :suffix="'/ ' + datosFisioterapia.totalSesiones"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="datosFisioterapia.fechaInicio"
                label="Fecha de Inicio"
                outlined
                type="date"
                readonly
              />
            </div>
            <div class="col-12">
              <q-linear-progress
                :value="porcentajeProgreso / 100"
                size="20px"
                color="primary"
                track-color="grey-3"
                class="q-mt-md"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="primary" :label="`${sesionActual}/${datosFisioterapia.totalSesiones} sesiones`" />
                </div>
              </q-linear-progress>
            </div>
          </div>
        </div>
      </div>

      <!-- Sesiones realizadas -->
      <div v-if="datosFisioterapia.sesiones.length > 0" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="event_note" class="q-mr-sm"/>
            Registro de Sesiones
          </div>
        </div>
        
        <div class="col-12">
          <q-timeline color="primary" layout="comfortable">
            <q-timeline-entry
              v-for="(sesion, index) in datosFisioterapia.sesiones"
              :key="index"
              :color="getSesionColor(sesion.evaluacion?.progreso || 'sin_cambio')"
              :icon="getSesionIcon(sesion.evaluacion?.progreso || 'sin_cambio')"
              :title="`Sesión ${sesion.numeroSesion}`"
              :subtitle="formatDateTime(sesion.fecha)"
            >
              <div class="text-body2 q-mb-sm">
                <strong>Duración:</strong> {{ sesion.duracion }} minutos
              </div>
              
              <div v-if="sesion.tecnicasAplicadas.length > 0" class="q-mb-sm">
                <div class="text-caption text-grey-6">Técnicas aplicadas:</div>
                <q-chip
                  v-for="tecnica in sesion.tecnicasAplicadas"
                  :key="tecnica"
                  dense
                  color="blue"
                  text-color="white"
                  :label="getTecnicaLabel(tecnica)"
                  class="q-mr-xs q-mb-xs"
                  size="sm"
                />
              </div>
              
              <div v-if="sesion.observaciones" class="text-body2 q-mb-sm">
                {{ sesion.observaciones }}
              </div>
              
              <div v-if="sesion.evaluacion" class="q-mt-sm">
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <div class="text-caption text-grey-6">Progreso</div>
                    <q-chip 
                      :color="getProgresoColor(sesion.evaluacion.progreso)"
                      text-color="white"
                      dense
                      :label="getProgresoLabel(sesion.evaluacion.progreso)"
                      size="sm"
                    />
                  </div>
                  <div class="col-4">
                    <div class="text-caption text-grey-6">Dolor</div>
                    <div class="text-body2">{{ sesion.evaluacion.nivelDolor }}/10</div>
                  </div>
                  <div class="col-4">
                    <div class="text-caption text-grey-6">Cooperación</div>
                    <div class="text-body2">{{ getCooperacionLabel(sesion.evaluacion.cooperacion) }}</div>
                  </div>
                </div>
              </div>
              
              <q-btn
                v-if="!modoLectura && sesion.editable && datosFisioterapia.estado === 'activo'"
                flat
                dense
                icon="edit"
                size="sm"
                @click="editarSesion(index)"
                class="q-mt-sm"
              />
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>

      <!-- Información de finalización (solo si está completado) -->
      <div v-if="datosFisioterapia.estado === 'completado'" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="check_circle" color="positive" class="q-mr-sm"/>
            Evaluación Final
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosFisioterapia.fechaFinalizacion"
            label="Fecha de Finalización"
            outlined
            type="date"
            readonly
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosFisioterapia.resultadoTratamiento"
            :options="resultadosTratamiento"
            label="Resultado del Tratamiento"
            outlined
            option-label="label"
            option-value="value"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosFisioterapia.evaluacionFinal"
            label="Evaluación Final"
            outlined
            type="textarea"
            rows="3"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosFisioterapia.recomendacionesContinuas"
            label="Recomendaciones Continuas"
            outlined
            type="textarea"
            rows="3"
            readonly
          />
        </div>
      </div>

      <!-- Observaciones generales -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Observaciones</div>
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosFisioterapia.observacionesGenerales"
            label="Observaciones Generales"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
          />
        </div>
      </div>
    </q-card-section>
    
    <!-- Estado y acciones -->
    <q-card-section class="bg-grey-1">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-chip 
            :color="getEstadoColor()"
            text-color="white"
            :icon="getEstadoIcon()"
            :label="getEstadoLabel()"
          />
          <q-chip 
            v-if="datosFisioterapia.estado === 'activo'"
            color="blue"
            text-color="white"
            icon="timeline"
            :label="`${sesionActual}/${datosFisioterapia.totalSesiones}`"
            class="q-ml-sm"
          />
        </div>
        
        <div class="col-auto" v-if="!modoLectura">
          <q-btn
            v-if="datosFisioterapia.estado === 'planificado'"
            color="positive"
            icon="play_arrow"
            label="Iniciar Tratamiento"
            @click="iniciarTratamiento"
            :disable="!formularioValido"
          />
          <q-btn
            v-else-if="datosFisioterapia.estado === 'activo'"
            color="primary"
            icon="add"
            label="Nueva Sesión"
            @click="agregarSesion"
            class="q-mr-sm"
          />
          <q-btn
            v-if="datosFisioterapia.estado === 'activo'"
            color="positive"
            icon="check_circle"
            label="Finalizar"
            @click="finalizarTratamiento"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Modal para agregar/editar sesión -->
    <q-dialog v-model="mostrarModalSesion" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">
            {{ sesionEditando !== null ? `Editar Sesión ${sesionTemporal.numeroSesion}` : `Nueva Sesión #${sesionActual + 1}` }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="sesionTemporal.fecha"
                label="Fecha y Hora"
                outlined
                type="datetime-local"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="sesionTemporal.duracion"
                label="Duración (minutos)"
                outlined
                type="number"
                min="15"
                max="120"
                step="5"
              />
            </div>
            
            <div class="col-12">
              <q-select
                v-model="sesionTemporal.tecnicasAplicadas"
                :options="tecnicasFisioterapia"
                label="Técnicas Aplicadas"
                outlined
                option-label="label"
                option-value="value"
                multiple
                use-chips
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="sesionTemporal.observaciones"
                label="Observaciones de la Sesión"
                outlined
                type="textarea"
                rows="3"
                placeholder="Describe cómo se desarrolló la sesión, reacciones del paciente..."
              />
            </div>
            
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-subtitle2 q-mb-md">Evaluación de la Sesión</div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-select
                v-model="sesionTemporal.evaluacion.progreso"
                :options="tiposProgreso"
                label="Progreso Observado"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-6 col-md-4">
              <q-input
                v-model="sesionTemporal.evaluacion.nivelDolor"
                label="Nivel de Dolor (0-10)"
                outlined
                type="number"
                min="0"
                max="10"
                step="1"
              />
            </div>
            
            <div class="col-6 col-md-4">
              <q-select
                v-model="sesionTemporal.evaluacion.cooperacion"
                :options="nivelesCooperacion"
                label="Nivel de Cooperación"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="sesionTemporal.evaluacion.observaciones"
                label="Observaciones de Evaluación"
                outlined
                type="textarea"
                rows="2"
                placeholder="Cambios específicos observados, reacciones..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarSesion"/>
          <q-btn color="primary" label="Guardar Sesión" @click="guardarSesion"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para finalizar tratamiento -->
    <q-dialog v-model="mostrarModalFinalizacion" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Finalizar Tratamiento de Fisioterapia</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="finalizacionTemporal.resultado"
                :options="resultadosTratamiento"
                label="Resultado del Tratamiento"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="finalizacionTemporal.evaluacionFinal"
                label="Evaluación Final"
                outlined
                type="textarea"
                rows="4"
                placeholder="Resumen del progreso alcanzado, estado final del paciente..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="finalizacionTemporal.recomendaciones"
                label="Recomendaciones Continuas"
                outlined
                type="textarea"
                rows="3"
                placeholder="Ejercicios en casa, cuidados especiales, próximas evaluaciones..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarFinalizacion"/>
          <q-btn color="primary" label="Finalizar Tratamiento" @click="confirmarFinalizacion"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  atencionId: {
    type: String,
    required: true
  },
  servicioId: {
    type: String,
    required: true
  },
  modoLectura: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])

// Estados del formulario
const datosFisioterapia = ref({
  estado: 'planificado', // planificado, activo, completado
  indicacionMedica: '',
  tipoTratamiento: '',
  areaAfectada: [],
  totalSesiones: 8,
  frecuencia: 'semanal',
  objetivosTratamiento: '',
  fechaInicio: '',
  fechaFinalizacion: '',
  evaluacionInicial: {
    movilidad: '',
    dolor: '',
    nivelActividad: 'moderado',
    estadoAnimo: 'neutral',
    peso: ''
  },
  sesiones: [],
  resultadoTratamiento: '',
  evaluacionFinal: '',
  recomendacionesContinuas: '',
  observacionesGenerales: ''
})

// Estados para modales
const mostrarModalSesion = ref(false)
const mostrarModalFinalizacion = ref(false)
const sesionEditando = ref(null)

const sesionTemporal = ref({
  numeroSesion: 1,
  fecha: new Date().toISOString().slice(0, 16),
  duracion: 30,
  tecnicasAplicadas: [],
  observaciones: '',
  evaluacion: {
    progreso: 'sin_cambio',
    nivelDolor: 0,
    cooperacion: 'buena',
    observaciones: ''
  },
  editable: true
})

const finalizacionTemporal = ref({
  resultado: 'exitoso',
  evaluacionFinal: '',
  recomendaciones: ''
})

// Opciones para selects
const tiposTratamiento = [
  { label: 'Rehabilitación Post-Quirúrgica', value: 'post_quirurgica' },
  { label: 'Tratamiento de Artritis', value: 'artritis' },
  { label: 'Recuperación de Lesiones', value: 'lesiones' },
  { label: 'Fortalecimiento Muscular', value: 'fortalecimiento' },
  { label: 'Mejora de Movilidad', value: 'movilidad' },
  { label: 'Manejo del Dolor', value: 'dolor' },
  { label: 'Neurológico', value: 'neurologico' },
  { label: 'Geriátrico', value: 'geriatrico' },
  { label: 'Deportivo/Performance', value: 'deportivo' }
]

const areasAfectadas = [
  { label: 'Miembros Anteriores', value: 'miembros_anteriores' },
  { label: 'Miembros Posteriores', value: 'miembros_posteriores' },
  { label: 'Columna Vertebral', value: 'columna' },
  { label: 'Cuello', value: 'cuello' },
  { label: 'Cadera', value: 'cadera' },
  { label: 'Rodilla', value: 'rodilla' },
  { label: 'Codo', value: 'codo' },
  { label: 'Hombro', value: 'hombro' },
  { label: 'Todo el Cuerpo', value: 'general' }
]

const frecuencias = [
  { label: 'Diaria', value: 'diaria' },
  { label: '3 veces por semana', value: 'tres_semanal' },
  { label: '2 veces por semana', value: 'dos_semanal' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Quincenal', value: 'quincenal' }
]

const nivelesActividad = [
  { label: 'Muy Bajo', value: 'muy_bajo' },
  { label: 'Bajo', value: 'bajo' },
  { label: 'Moderado', value: 'moderado' },
  { label: 'Alto', value: 'alto' },
  { label: 'Muy Alto', value: 'muy_alto' }
]

const estadosAnimo = [
  { label: 'Deprimido', value: 'deprimido' },
  { label: 'Ansioso', value: 'ansioso' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Cooperativo', value: 'cooperativo' },
  { label: 'Energético', value: 'energetico' }
]

const tecnicasFisioterapia = [
  { label: 'Ejercicios Pasivos', value: 'ejercicios_pasivos' },
  { label: 'Ejercicios Activos', value: 'ejercicios_activos' },
  { label: 'Hidroterapia', value: 'hidroterapia' },
  { label: 'Masaje Terapéutico', value: 'masaje' },
  { label: 'Electroterapia', value: 'electroterapia' },
  { label: 'Termoterapia', value: 'termoterapia' },
  { label: 'Crioterapia', value: 'crioterapia' },
  { label: 'Ultrasonido', value: 'ultrasonido' },
  { label: 'Laser Terapéutico', value: 'laser' },
  { label: 'Acupuntura', value: 'acupuntura' },
  { label: 'Ejercicios de Equilibrio', value: 'equilibrio' },
  { label: 'Caminata Asistida', value: 'caminata_asistida' },
  { label: 'Stretching', value: 'stretching' }
]

const tiposProgreso = [
  { label: 'Excelente Progreso', value: 'excelente' },
  { label: 'Buen Progreso', value: 'bueno' },
  { label: 'Progreso Moderado', value: 'moderado' },
  { label: 'Progreso Lento', value: 'lento' },
  { label: 'Sin Cambio', value: 'sin_cambio' },
  { label: 'Empeoramiento', value: 'empeoramiento' }
]

const nivelesCooperacion = [
  { label: 'Excelente', value: 'excelente' },
  { label: 'Buena', value: 'buena' },
  { label: 'Regular', value: 'regular' },
  { label: 'Pobre', value: 'pobre' },
  { label: 'Resistente', value: 'resistente' }
]

const resultadosTratamiento = [
  { label: 'Exitoso - Objetivos Alcanzados', value: 'exitoso' },
  { label: 'Parcialmente Exitoso', value: 'parcial' },
  { label: 'Sin Mejora Significativa', value: 'sin_mejora' },
  { label: 'Interrumpido por el Cliente', value: 'interrumpido' },
  { label: 'Requiere Tratamiento Adicional', value: 'adicional' }
]

// Computed properties
const formularioValido = computed(() => {
  return datosFisioterapia.value.indicacionMedica && 
         datosFisioterapia.value.tipoTratamiento &&
         datosFisioterapia.value.totalSesiones > 0
})

const sesionActual = computed(() => {
  return datosFisioterapia.value.sesiones.length
})

const porcentajeProgreso = computed(() => {
  if (datosFisioterapia.value.totalSesiones === 0) return 0
  return (sesionActual.value / datosFisioterapia.value.totalSesiones) * 100
})

// Métodos para el estado
const getEstadoColor = () => {
  switch(datosFisioterapia.value.estado) {
    case 'planificado': return 'orange'
    case 'activo': return 'blue'
    case 'completado': return 'green'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(datosFisioterapia.value.estado) {
    case 'planificado': return 'schedule'
    case 'activo': return 'accessibility_new'
    case 'completado': return 'check_circle'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(datosFisioterapia.value.estado) {
    case 'planificado': return 'Planificado'
    case 'activo': return 'En Tratamiento'
    case 'completado': return 'Completado'
    default: return 'Estado Desconocido'
  }
}

// Métodos para sesiones
const getSesionColor = (progreso) => {
  const colores = {
    excelente: 'green',
    bueno: 'light-green',
    moderado: 'blue',
    lento: 'orange',
    sin_cambio: 'grey',
    empeoramiento: 'red'
  }
  return colores[progreso] || 'grey'
}

const getSesionIcon = (progreso) => {
  const iconos = {
    excelente: 'trending_up',
    bueno: 'thumb_up',
    moderado: 'timeline',
    lento: 'trending_flat',
    sin_cambio: 'remove',
    empeoramiento: 'trending_down'
  }
  return iconos[progreso] || 'accessibility_new'
}

const getTecnicaLabel = (tecnicaValue) => {
  const tecnica = tecnicasFisioterapia.find(t => t.value === tecnicaValue)
  return tecnica ? tecnica.label : tecnicaValue
}

const getProgresoColor = (progreso) => {
  return getSesionColor(progreso)
}

const getProgresoLabel = (progreso) => {
  const tipo = tiposProgreso.find(t => t.value === progreso)
  return tipo ? tipo.label : progreso
}

const getCooperacionLabel = (cooperacion) => {
  const nivel = nivelesCooperacion.find(n => n.value === cooperacion)
  return nivel ? nivel.label : cooperacion
}

const formatDateTime = (fechaISO) => {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos de acción
const iniciarTratamiento = () => {
  if (formularioValido.value) {
    datosFisioterapia.value.estado = 'activo'
    datosFisioterapia.value.fechaInicio = new Date().toISOString().split('T')[0]
    
    guardarDatos()
  }
}

const agregarSesion = () => {
  sesionTemporal.value = {
    numeroSesion: sesionActual.value + 1,
    fecha: new Date().toISOString().slice(0, 16),
    duracion: 30,
    tecnicasAplicadas: [],
    observaciones: '',
    evaluacion: {
      progreso: 'sin_cambio',
      nivelDolor: 0,
      cooperacion: 'buena',
      observaciones: ''
    },
    editable: true
  }
  sesionEditando.value = null
  mostrarModalSesion.value = true
}

const editarSesion = (index) => {
  sesionEditando.value = index
  sesionTemporal.value = { ...datosFisioterapia.value.sesiones[index] }
  mostrarModalSesion.value = true
}

const guardarSesion = () => {
  if (sesionEditando.value !== null) {
    datosFisioterapia.value.sesiones[sesionEditando.value] = { ...sesionTemporal.value }
  } else {
    datosFisioterapia.value.sesiones.push({ ...sesionTemporal.value })
    
    // Verificar si se completaron todas las sesiones
    if (datosFisioterapia.value.sesiones.length >= datosFisioterapia.value.totalSesiones) {
      // Sugerir finalizar tratamiento automáticamente
      setTimeout(() => {
        if (datosFisioterapia.value.estado === 'activo') {
          finalizarTratamiento()
        }
      }, 1000)
    }
  }
  
  // Ordenar sesiones por número
  datosFisioterapia.value.sesiones.sort((a, b) => a.numeroSesion - b.numeroSesion)
  
  mostrarModalSesion.value = false
  guardarDatos()
}

const cancelarSesion = () => {
  mostrarModalSesion.value = false
  sesionEditando.value = null
}

const finalizarTratamiento = () => {
  finalizacionTemporal.value = {
    resultado: 'exitoso',
    evaluacionFinal: '',
    recomendaciones: ''
  }
  mostrarModalFinalizacion.value = true
}

const confirmarFinalizacion = () => {
  datosFisioterapia.value.estado = 'completado'
  datosFisioterapia.value.fechaFinalizacion = new Date().toISOString().split('T')[0]
  datosFisioterapia.value.resultadoTratamiento = finalizacionTemporal.value.resultado
  datosFisioterapia.value.evaluacionFinal = finalizacionTemporal.value.evaluacionFinal
  datosFisioterapia.value.recomendacionesContinuas = finalizacionTemporal.value.recomendaciones
  
  mostrarModalFinalizacion.value = false
  
  emit('servicio-completado', props.servicioId, {
    ...datosFisioterapia.value,
    completadaPor: 'Dr. Usuario Actual' // Obtener del contexto
  })
}

const cancelarFinalizacion = () => {
  mostrarModalFinalizacion.value = false
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, datosFisioterapia.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Watchers
watch(datosFisioterapia, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>