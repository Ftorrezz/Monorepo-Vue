<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-pink-1">
      <div class="row items-center">
        <q-icon name="pets" color="pink" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Estética Canina</div>
          <div class="text-caption text-grey-7">
            {{ datosEstetica.estado === 'completado' ? 'Servicio completado' : 
               datosEstetica.estado === 'en_proceso' ? 'En proceso' : 'Servicio programado' }}
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
              @click="iniciarServicio" 
              v-if="datosEstetica.estado === 'programado'"
              :disable="!formularioValido"
            >
              <q-item-section avatar>
                <q-icon name="play_arrow" color="positive"/>
              </q-item-section>
              <q-item-section>Iniciar Servicio</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              @click="completarServicio" 
              v-if="datosEstetica.estado === 'en_proceso'"
            >
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Completar Servicio</q-item-section>
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
      <!-- Información del servicio -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="content_cut" color="pink" class="q-mr-sm"/>
            Detalles del Servicio
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.tipoServicio"
            :options="tiposServicio"
            label="Tipo de Servicio *"
            outlined
            option-label="label"
            option-value="value"
            multiple
            use-chips
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.tipoCorte"
            :options="tiposCorte"
            label="Tipo de Corte"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosEstetica.fechaProgramada"
            label="Fecha Programada"
            outlined
            type="datetime-local"
            :readonly="modoLectura || datosEstetica.estado !== 'programado'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosEstetica.duracionEstimada"
            label="Duración Estimada (minutos)"
            outlined
            type="number"
            min="30"
            max="300"
            step="15"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.instruccionesEspeciales"
            label="Instrucciones Especiales"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
            placeholder="Preferencias del cliente, cuidados especiales, estilo deseado..."
          />
        </div>
      </div>

      <!-- Estado del pelaje -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="visibility" color="orange" class="q-mr-sm"/>
            Estado Inicial del Pelaje
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.estadoPelaje.tipo"
            :options="tiposPelaje"
            label="Tipo de Pelaje"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.estadoPelaje.longitud"
            :options="longitudesPelaje"
            label="Longitud del Pelaje"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.estadoPelaje.condicion"
            :options="condicionesPelaje"
            label="Condición del Pelaje"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.estadoPelaje.problemasEspeciales"
            :options="problemasEspeciales"
            label="Problemas Especiales"
            outlined
            option-label="label"
            option-value="value"
            multiple
            use-chips
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.estadoPelaje.observaciones"
            label="Observaciones del Estado Inicial"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
            placeholder="Descripción detallada del estado del pelaje, areas problemáticas..."
          />
        </div>
      </div>

      <!-- Productos utilizados -->
      <div class="row q-col-gutter-md q-mt-md" v-if="datosEstetica.estado !== 'programado'">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="local_pharmacy" color="green" class="q-mr-sm"/>
            Productos y Tratamientos Utilizados
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.productosUtilizados.shampoo"
            :options="tiposShampoo"
            label="Shampoo Utilizado"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.productosUtilizados.acondicionador"
            :options="tiposAcondicionador"
            label="Acondicionador"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12">
          <q-select
            v-model="datosEstetica.productosUtilizados.tratamientosEspeciales"
            :options="tratamientosEspeciales"
            label="Tratamientos Especiales"
            outlined
            option-label="label"
            option-value="value"
            multiple
            use-chips
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.productosUtilizados.observaciones"
            label="Observaciones de Productos"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
            placeholder="Reacciones a productos, efectividad, recomendaciones..."
          />
        </div>
      </div>

      <!-- Proceso del servicio -->
      <div class="row q-col-gutter-md q-mt-md" v-if="datosEstetica.estado !== 'programado'">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="timeline" color="blue" class="q-mr-sm"/>
            Proceso del Servicio
          </div>
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosEstetica.proceso.horaInicio"
            label="Hora de Inicio"
            outlined
            type="time"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosEstetica.proceso.horaFinalizacion"
            label="Hora de Finalización"
            outlined
            type="time"
            :readonly="modoLectura || (datosEstetica.estado !== 'completado' && !mostrarModalCompletar)"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            :model-value="duracionReal"
            label="Duración Real"
            outlined
            readonly
            suffix="min"
          />
        </div>
        
        <div class="col-12">
          <div class="text-caption q-mb-sm">Servicios Realizados:</div>
          <div class="row q-col-gutter-sm">
            <div 
              v-for="servicio in datosEstetica.proceso.serviciosRealizados" 
              :key="servicio.tipo"
              class="col-12 col-md-6"
            >
              <q-card flat bordered class="q-pa-sm">
                <div class="row items-center">
                  <q-checkbox 
                    v-model="servicio.completado"
                    :label="getServicioLabel(servicio.tipo)"
                    :readonly="modoLectura || datosEstetica.estado === 'completado'"
                  />
                </div>
                <q-input
                  v-if="servicio.completado"
                  v-model="servicio.observaciones"
                  label="Observaciones"
                  outlined
                  dense
                  type="textarea"
                  rows="1"
                  class="q-mt-sm"
                  :readonly="modoLectura || datosEstetica.estado === 'completado'"
                />
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Comportamiento del paciente -->
      <div class="row q-col-gutter-md q-mt-md" v-if="datosEstetica.estado !== 'programado'">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="psychology" color="purple" class="q-mr-sm"/>
            Comportamiento del Paciente
          </div>
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosEstetica.comportamiento.cooperacion"
            :options="nivelesCooperacion"
            label="Nivel de Cooperación"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosEstetica.comportamiento.estres"
            :options="nivelesEstres"
            label="Nivel de Estrés"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosEstetica.comportamiento.reaccionAgua"
            :options="reaccionesAgua"
            label="Reacción al Agua"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.comportamiento.observaciones"
            label="Observaciones del Comportamiento"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
            placeholder="Comportamiento específico, necesidad de sujeción, miedos..."
          />
        </div>
      </div>

      <!-- Resultado final -->
      <div class="row q-col-gutter-md q-mt-md" v-if="datosEstetica.estado === 'completado'">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="check_circle" color="positive" class="q-mr-sm"/>
            Resultado Final
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosEstetica.resultado.fechaComplecion"
            label="Fecha de Finalización"
            outlined
            type="date"
            readonly
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosEstetica.resultado.satisfaccionCliente"
            :options="nivelesSatisfaccion"
            label="Satisfacción del Cliente"
            outlined
            option-label="label"
            option-value="value"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.resultado.descripcionFinal"
            label="Descripción del Resultado"
            outlined
            type="textarea"
            rows="3"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.resultado.recomendacionesCuidado"
            label="Recomendaciones de Cuidado"
            outlined
            type="textarea"
            rows="2"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosEstetica.resultado.proximaCita"
            label="Próxima Cita Sugerida"
            outlined
            type="date"
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
            v-model="datosEstetica.observacionesGenerales"
            label="Observaciones Generales"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosEstetica.estado === 'completado'"
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
            v-if="datosEstetica.estado === 'en_proceso' && datosEstetica.proceso.horaInicio"
            color="blue"
            text-color="white"
            icon="schedule"
            :label="`${duracionTranscurrida} min transcurridos`"
            class="q-ml-sm"
          />
        </div>
        
        <div class="col-auto" v-if="!modoLectura">
          <q-btn
            v-if="datosEstetica.estado === 'programado'"
            color="positive"
            icon="play_arrow"
            label="Iniciar Servicio"
            @click="iniciarServicio"
            :disable="!formularioValido"
          />
          <q-btn
            v-else-if="datosEstetica.estado === 'en_proceso'"
            color="positive"
            icon="check_circle"
            label="Completar"
            @click="completarServicio"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Modal para completar servicio -->
    <q-dialog v-model="mostrarModalCompletar" persistent>
      <q-card style="min-width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Completar Servicio de Estética</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="datosComplecion.horaFinalizacion"
                label="Hora de Finalización"
                outlined
                type="time"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-select
                v-model="datosComplecion.satisfaccionCliente"
                :options="nivelesSatisfaccion"
                label="Satisfacción del Cliente"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="datosComplecion.descripcionFinal"
                label="Descripción del Resultado Final"
                outlined
                type="textarea"
                rows="3"
                placeholder="Describe el resultado obtenido, cambios realizados..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="datosComplecion.recomendacionesCuidado"
                label="Recomendaciones de Cuidado"
                outlined
                type="textarea"
                rows="2"
                placeholder="Cuidados posteriores, productos recomendados..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="datosComplecion.proximaCita"
                label="Próxima Cita Sugerida"
                outlined
                type="date"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarComplecion"/>
          <q-btn color="primary" label="Completar Servicio" @click="confirmarComplecion"/>
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
const datosEstetica = ref({
  estado: 'programado', // programado, en_proceso, completado
  tipoServicio: [],
  tipoCorte: '',
  fechaProgramada: '',
  duracionEstimada: 90,
  instruccionesEspeciales: '',
  estadoPelaje: {
    tipo: 'mixto',
    longitud: 'medio',
    condicion: 'regular',
    problemasEspeciales: [],
    observaciones: ''
  },
  productosUtilizados: {
    shampoo: '',
    acondicionador: '',
    tratamientosEspeciales: [],
    observaciones: ''
  },
  proceso: {
    horaInicio: '',
    horaFinalizacion: '',
    serviciosRealizados: []
  },
  comportamiento: {
    cooperacion: 'buena',
    estres: 'bajo',
    reaccionAgua: 'normal',
    observaciones: ''
  },
  resultado: {
    fechaComplecion: '',
    satisfaccionCliente: 'excelente',
    descripcionFinal: '',
    recomendacionesCuidado: '',
    proximaCita: ''
  },
  observacionesGenerales: ''
})

// Estados para modales
const mostrarModalCompletar = ref(false)
const datosComplecion = ref({
  horaFinalizacion: '',
  satisfaccionCliente: 'excelente',
  descripcionFinal: '',
  recomendacionesCuidado: '',
  proximaCita: ''
})

// Opciones para selects
const tiposServicio = [
  { label: 'Baño Completo', value: 'bano_completo' },
  { label: 'Corte de Pelo', value: 'corte_pelo' },
  { label: 'Corte de Uñas', value: 'corte_unas' },
  { label: 'Limpieza de Oídos', value: 'limpieza_oidos' },
  { label: 'Cepillado Profundo', value: 'cepillado_profundo' },
  { label: 'Desenredado', value: 'desenredado' },
  { label: 'Limpieza Dental', value: 'limpieza_dental' },
  { label: 'Perfumado', value: 'perfumado' },
  { label: 'Secado y Cepillado', value: 'secado_cepillado' },
  { label: 'Tratamiento Anti-Pulgas', value: 'anti_pulgas' },
  { label: 'Masaje Relajante', value: 'masaje' }
]

const tiposCorte = [
  { label: 'Corte de Mantenimiento', value: 'mantenimiento' },
  { label: 'Corte Higiénico', value: 'higienico' },
  { label: 'Corte de Verano', value: 'verano' },
  { label: 'Corte Breed Standard', value: 'breed_standard' },
  { label: 'Corte Creativo', value: 'creativo' },
  { label: 'Recorte de Contorno', value: 'contorno' },
  { label: 'Solo Tijera', value: 'solo_tijera' },
  { label: 'Solo Máquina', value: 'solo_maquina' },
  { label: 'Mixto (Tijera y Máquina)', value: 'mixto' }
]

const tiposPelaje = [
  { label: 'Liso', value: 'liso' },
  { label: 'Ondulado', value: 'ondulado' },
  { label: 'Rizado', value: 'rizado' },
  { label: 'Duro/Áspero', value: 'duro' },
  { label: 'Doble Capa', value: 'doble_capa' },
  { label: 'Mixto', value: 'mixto' }
]

const longitudesPelaje = [
  { label: 'Muy Corto', value: 'muy_corto' },
  { label: 'Corto', value: 'corto' },
  { label: 'Medio', value: 'medio' },
  { label: 'Largo', value: 'largo' },
  { label: 'Muy Largo', value: 'muy_largo' }
]

const condicionesPelaje = [
  { label: 'Excelente', value: 'excelente' },
  { label: 'Buena', value: 'buena' },
  { label: 'Regular', value: 'regular' },
  { label: 'Mala', value: 'mala' },
  { label: 'Muy Mala', value: 'muy_mala' }
]

const problemasEspeciales = [
  { label: 'Nudos Severos', value: 'nudos_severos' },
  { label: 'Pelo Apelmazado', value: 'apelmazado' },
  { label: 'Parásitos Externos', value: 'parasitos' },
  { label: 'Dermatitis', value: 'dermatitis' },
  { label: 'Exceso de Grasa', value: 'grasa' },
  { label: 'Caspa', value: 'caspa' },
  { label: 'Mal Olor', value: 'mal_olor' },
  { label: 'Pérdida de Pelo', value: 'perdida_pelo' }
]

const tiposShampoo = [
  { label: 'Shampoo Neutro', value: 'neutro' },
  { label: 'Shampoo Medicinal', value: 'medicinal' },
  { label: 'Shampoo Anti-Pulgas', value: 'anti_pulgas' },
  { label: 'Shampoo Para Piel Sensible', value: 'piel_sensible' },
  { label: 'Shampoo Desenredante', value: 'desenredante' },
  { label: 'Shampoo Blanqueador', value: 'blanqueador' },
  { label: 'Shampoo Nutritivo', value: 'nutritivo' },
  { label: 'Shampoo en Seco', value: 'seco' }
]

const tiposAcondicionador = [
  { label: 'Sin Acondicionador', value: 'ninguno' },
  { label: 'Acondicionador Suave', value: 'suave' },
  { label: 'Acondicionador Nutritivo', value: 'nutritivo' },
  { label: 'Acondicionador Desenredante', value: 'desenredante' },
  { label: 'Acondicionador Reparador', value: 'reparador' },
  { label: 'Acondicionador Para Brillo', value: 'brillo' }
]

const tratamientosEspeciales = [
  { label: 'Tratamiento Hidratante', value: 'hidratante' },
  { label: 'Mascarilla Nutritiva', value: 'mascarilla_nutritiva' },
  { label: 'Aceites Esenciales', value: 'aceites_esenciales' },
  { label: 'Tratamiento Anti-Caspa', value: 'anti_caspa' },
  { label: 'Bálsamo Reparador', value: 'balsamo_reparador' },
  { label: 'Spray Desenredante', value: 'spray_desenredante' },
  { label: 'Perfume Canino', value: 'perfume' }
]

const nivelesCooperacion = [
  { label: 'Excelente', value: 'excelente' },
  { label: 'Buena', value: 'buena' },
  { label: 'Regular', value: 'regular' },
  { label: 'Difícil', value: 'dificil' },
  { label: 'Muy Difícil', value: 'muy_dificil' }
]

const nivelesEstres = [
  { label: 'Sin Estrés', value: 'sin_estres' },
  { label: 'Bajo', value: 'bajo' },
  { label: 'Moderado', value: 'moderado' },
  { label: 'Alto', value: 'alto' },
  { label: 'Muy Alto', value: 'muy_alto' }
]

const reaccionesAgua = [
  { label: 'Le gusta el agua', value: 'le_gusta' },
  { label: 'Normal', value: 'normal' },
  { label: 'Nervioso', value: 'nervioso' },
  { label: 'Miedo al agua', value: 'miedo' },
  { label: 'Pánico extremo', value: 'panico' }
]

const nivelesSatisfaccion = [
  { label: 'Excelente', value: 'excelente' },
  { label: 'Muy Buena', value: 'muy_buena' },
  { label: 'Buena', value: 'buena' },
  { label: 'Regular', value: 'regular' },
  { label: 'Insatisfecho', value: 'insatisfecho' }
]

// Computed properties
const formularioValido = computed(() => {
  return datosEstetica.value.tipoServicio.length > 0 && 
         datosEstetica.value.fechaProgramada &&
         datosEstetica.value.duracionEstimada > 0
})

const duracionReal = computed(() => {
  if (!datosEstetica.value.proceso.horaInicio || !datosEstetica.value.proceso.horaFinalizacion) {
    return '0'
  }
  
  const inicio = new Date(`2000-01-01T${datosEstetica.value.proceso.horaInicio}:00`)
  const fin = new Date(`2000-01-01T${datosEstetica.value.proceso.horaFinalizacion}:00`)
  const diferencia = (fin - inicio) / (1000 * 60) // en minutos
  
  return Math.max(0, diferencia).toString()
})

const duracionTranscurrida = computed(() => {
  if (!datosEstetica.value.proceso.horaInicio) return '0'
  
  const inicio = new Date(`2000-01-01T${datosEstetica.value.proceso.horaInicio}:00`)
  const ahora = new Date()
  const horaActual = new Date(`2000-01-01T${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}:00`)
  const diferencia = (horaActual - inicio) / (1000 * 60)
  
  return Math.max(0, Math.round(diferencia)).toString()
})

// Métodos para el estado
const getEstadoColor = () => {
  switch(datosEstetica.value.estado) {
    case 'programado': return 'orange'
    case 'en_proceso': return 'blue'
    case 'completado': return 'green'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(datosEstetica.value.estado) {
    case 'programado': return 'schedule'
    case 'en_proceso': return 'pets'
    case 'completado': return 'check_circle'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(datosEstetica.value.estado) {
    case 'programado': return 'Programado'
    case 'en_proceso': return 'En Proceso'
    case 'completado': return 'Completado'
    default: return 'Estado Desconocido'
  }
}

// Métodos auxiliares
const getServicioLabel = (servicioValue) => {
  const servicio = tiposServicio.find(s => s.value === servicioValue)
  return servicio ? servicio.label : servicioValue
}

// Inicializar servicios realizados cuando se seleccionan tipos de servicio
const inicializarServiciosRealizados = () => {
  datosEstetica.value.proceso.serviciosRealizados = datosEstetica.value.tipoServicio.map(tipo => ({
    tipo: tipo,
    completado: false,
    observaciones: ''
  }))
}

// Métodos de acción
const iniciarServicio = () => {
  if (formularioValido.value) {
    datosEstetica.value.estado = 'en_proceso'
    datosEstetica.value.proceso.horaInicio = new Date().toTimeString().slice(0, 5)
    
    // Inicializar servicios realizados
    inicializarServiciosRealizados()
    
    guardarDatos()
  }
}

const completarServicio = () => {
  // Configurar datos por defecto para la finalización
  datosComplecion.value.horaFinalizacion = new Date().toTimeString().slice(0, 5)
  
  // Calcular fecha de próxima cita (sugerencia: 6-8 semanas)
  const proximaCita = new Date()
  proximaCita.setDate(proximaCita.getDate() + 45) // 6-7 semanas aproximadamente
  datosComplecion.value.proximaCita = proximaCita.toISOString().split('T')[0]
  
  mostrarModalCompletar.value = true
}

const confirmarComplecion = () => {
  datosEstetica.value.estado = 'completado'
  datosEstetica.value.proceso.horaFinalizacion = datosComplecion.value.horaFinalizacion
  datosEstetica.value.resultado.fechaComplecion = new Date().toISOString().split('T')[0]
  datosEstetica.value.resultado.satisfaccionCliente = datosComplecion.value.satisfaccionCliente
  datosEstetica.value.resultado.descripcionFinal = datosComplecion.value.descripcionFinal
  datosEstetica.value.resultado.recomendacionesCuidado = datosComplecion.value.recomendacionesCuidado
  datosEstetica.value.resultado.proximaCita = datosComplecion.value.proximaCita
  
  mostrarModalCompletar.value = false
  
  emit('servicio-completado', props.servicioId, {
    ...datosEstetica.value,
    completadaPor: 'Estilista Actual' // Obtener del contexto
  })
}

const cancelarComplecion = () => {
  mostrarModalCompletar.value = false
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, datosEstetica.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Watchers
watch(() => datosEstetica.value.tipoServicio, () => {
  if (datosEstetica.value.estado === 'en_proceso') {
    inicializarServiciosRealizados()
  }
}, { deep: true })

watch(datosEstetica, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>