<template>
  <q-card class="servicio-card">
    <!-- Header común -->
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="science" color="blue" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Orden de Laboratorio</div>
          <div class="text-caption text-grey-7">
            Orden #{{ ordenLab.numeroOrden || 'Nueva' }} - 
            {{ ordenLab.estudios?.length || 0 }} estudio(s)
          </div>
        </div>
        <div class="estado-orden">
          <q-chip 
            :color="getEstadoColor()"
            text-color="white"
            :icon="getEstadoIcon()"
            :label="getEstadoLabel()"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Tabs para separar el contenido -->
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="orden" label="Datos de Orden" icon="description" />
      <q-tab name="estudios" label="Estudios" icon="science" />
      <q-tab 
        name="resultados" 
        label="Resultados" 
        icon="analytics"
        :disable="!ordenLab.numeroOrden || ordenLab.estado === 'borrador'"
      />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- Panel de Datos de Orden -->
      <q-tab-panel name="orden">
        <div class="row q-col-gutter-md">
          <!-- Información básica de la orden -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="ordenLab.numeroOrden"
              label="Número de Orden"
              outlined
              readonly
              prefix="#"
              hint="Se genera automáticamente"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="ordenLab.laboratorioExterno"
              :options="laboratoriosExternos"
              label="Laboratorio Externo"
              outlined
              option-label="nombre"
              option-value="id"
              :readonly="modoLectura"
              clearable
            >
              <template v-slot:hint>
                Dejar vacío si es laboratorio interno
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="ordenLab.prioridad"
              :options="prioridades"
              label="Prioridad *"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="ordenLab.tipoMuestra"
              :options="tiposMuestra"
              label="Tipo de Muestra *"
              outlined
              option-label="label"
              option-value="value"
              :readonly="modoLectura"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="ordenLab.fechaRecoleccion"
              label="Fecha de Recolección"
              outlined
              type="datetime-local"
              :readonly="modoLectura"
            />
          </div>

          <!-- Indicaciones especiales -->
          <div class="col-12">
            <q-input
              v-model="ordenLab.indicacionesEspeciales"
              label="Indicaciones Especiales"
              outlined
              type="textarea"
              rows="2"
              placeholder="Ayuno, medicamentos suspendidos, etc."
              :readonly="modoLectura"
            />
          </div>

          <!-- Observaciones generales -->
          <div class="col-12">
            <q-input
              v-model="ordenLab.observaciones"
              label="Observaciones Generales"
              outlined
              type="textarea"
              rows="2"
              :readonly="modoLectura"
            />
          </div>
        </div>
      </q-tab-panel>

      <!-- Panel de Estudios -->
      <q-tab-panel name="estudios">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle2">Estudios Solicitados</div>
          
          <!-- Entrada rápida por código -->
          <div class="row items-center q-gutter-sm">
            <q-input
              v-model="codigoEstudio"
              dense
              outlined
              placeholder="Ingrese código de estudio"
              class="codigo-input"
              @keyup.enter="buscarPorCodigo"
            >
              <template v-slot:append>
                <q-icon 
                  name="help" 
                  color="grey-6"
                  class="cursor-pointer"
                  @click="mostrarDialogoEstudio = true"
                >
                  <q-tooltip>
                    ¿No conoce el código? Click aquí para buscar
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
            
            <q-btn
              v-if="!modoLectura && ordenLab.estado === 'borrador'"
              color="primary"
              icon="search"
              label="Buscar Estudio"
              @click="mostrarDialogoEstudio = true"
              dense
            />
          </div>
        </div>

        <!-- Lista de estudios -->
        <div class="estudios-container">
          <div v-if="ordenLab.estudios && ordenLab.estudios.length > 0">
            <transition-group name="list">
              <EstudioLaboratorio
                v-for="estudio in ordenLab.estudios"
                :key="estudio.id"
                :estudio="estudio"
                :modo-lectura="modoLectura || ordenLab.estado !== 'borrador'"
                @estudio-actualizado="actualizarEstudio"
                @estudio-eliminado="eliminarEstudio"
                class="q-mb-sm estudio-item"
              />
            </transition-group>
          </div>

          <div v-else class="text-center q-pa-md text-grey-6">
            <q-icon name="science" size="48px" class="q-mb-sm"/>
            <div>No hay estudios agregados</div>
            <div class="text-caption">
              Ingrese el código del estudio o use el botón de búsqueda
            </div>
          </div>
        </div>

        <!-- Botón para confirmar orden -->
        <div v-if="ordenLab.estado === 'borrador'" class="row justify-end q-mt-md">
          <q-btn
            color="positive"
            icon="check_circle"
            label="Confirmar Orden"
            @click="generarOrden"
            :disable="!formularioValido"
          />
        </div>
      </q-tab-panel>

      <!-- Panel de Resultados -->
      <q-tab-panel name="resultados">
        <ResultadosLaboratorio
          v-if="ordenLab.numeroOrden"
          :orden="ordenLab"
          @resultados-actualizados="actualizarResultados"
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>

  <!-- Diálogo para agregar estudios -->
  <q-dialog v-model="mostrarDialogoEstudio" persistent>
    <SelectorEstudios
      v-model="mostrarDialogoEstudio"
      @estudios-seleccionados="agregarEstudiosDesdeSelector"
      @cancelar="mostrarDialogoEstudio = false"
    />
  </q-dialog>
</template>

<script lang="ts">
// Types for the new functionality
export type EstudioEstado = 'pendiente' | 'cargado' | 'validado'
export type OrdenEstado = 'borrador' | 'generada' | 'pendiente' | 'cargada' | 'validada'

export interface Sector {
  id: string
  nombre: string
  codigo: string
  descripcion?: string
}

export interface Estudio {
  id: number
  codigo: string
  nombre: string
  sectorId: string
  sector: Sector
  estado: EstudioEstado
  tipoMuestra: string      // Preestablecido
  tiempoResultado: string  // Preestablecido
  preparacion: string      // Preestablecido
  precio: number          // Preestablecido
  metodoAnalisis?: string // Preestablecido
  valoresReferencia?: string // Preestablecido
  resultado?: string
  observaciones?: string   // Este sí se puede cargar
  validadoPor?: string
  fechaValidacion?: string
  fechaCarga?: string
  fechaAgregado: string
}

interface EstudioSeleccionado {
  codigo: string      // Ejemplo: 'HEM001'
  nombre: string      // Ejemplo: 'Hemograma Completo'
  tipoMuestra?: string
  tiempoResultado?: string
  preparacion?: string
  precio?: number
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EstudioLaboratorio from './EstudioLaboratorio.vue'
import SelectorEstudios from './SelectorEstudios.vue'
import ResultadosLaboratorio from './ResultadosLaboratorio.vue'
import { useQuasar } from 'quasar'

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
const ordenLab = ref({
  numeroOrden: '',
  laboratorioExterno: null,
  prioridad: 'normal',
  tipoMuestra: '',
  fechaRecoleccion: '',
  indicacionesEspeciales: '',
  estudios: [],
  observaciones: '',
  estado: 'borrador', // borrador, generada, en_proceso, completada
  fechaCreacion: new Date().toISOString(),
  creadoPor: 'Usuario Actual'
})

const mostrarDialogoEstudio = ref(false)
const tab = ref('orden')
const codigoEstudio = ref('')
const { notify } = useQuasar()

// Opciones para selects
const laboratoriosExternos = [
  { id: 'lab1', nombre: 'Laboratorio Central', telefono: '555-0001' },
  { id: 'lab2', nombre: 'BioVet Labs', telefono: '555-0002' },
  { id: 'lab3', nombre: 'VetDiagnostic', telefono: '555-0003' }
]

const prioridades = [
  { label: 'Urgente', value: 'urgente' },
  { label: 'Normal', value: 'normal' },
  { label: 'Rutina', value: 'rutina' }
]

const tiposMuestra = [
  { label: 'Sangre - Suero', value: 'suero' },
  { label: 'Sangre - Plasma', value: 'plasma' },
  { label: 'Sangre - Completa', value: 'sangre_completa' },
  { label: 'Orina', value: 'orina' },
  { label: 'Heces', value: 'heces' },
  { label: 'Biopsia', value: 'biopsia' },
  { label: 'Citología', value: 'citologia' },
  { label: 'Cultivo', value: 'cultivo' },
  { label: 'Otro', value: 'otro' }
]

const sectores = [
  { id: 'HEM', nombre: 'Hematología', codigo: 'HEM', descripcion: 'Estudios hematológicos' },
  { id: 'BQ', nombre: 'Bioquímica', codigo: 'BQ', descripcion: 'Estudios bioquímicos' },
  { id: 'QUI', nombre: 'Química', codigo: 'QUI', descripcion: 'Estudios químicos' },
  { id: 'MICRO', nombre: 'Microbiología', codigo: 'MICRO', descripcion: 'Estudios microbiológicos' }
]

// Keep the original constant for predefined studies configuration
const estudiosPorSector = {
  'HEM': {
    'HEM001': {
      nombre: 'Hemograma Completo',
      pruebas: [
        {
          id: 'HEM001_01',
          codigo: 'HGB',
          nombre: 'Hemoglobina',
          tipo: 'numerico',
          valorMinimo: 12,
          valorMaximo: 18,
          unidad: 'g/dL',
          estado: 'pendiente'
        },
        {
          id: 'HEM001_02',
          codigo: 'HTO',
          nombre: 'Hematocrito',
          tipo: 'numerico',
          valorMinimo: 37,
          valorMaximo: 55,
          unidad: '%',
          estado: 'pendiente'
        },
        {
          id: 'HEM001_03',
          codigo: 'LEUC',
          nombre: 'Leucocitos Totales',
          tipo: 'numerico',
          valorMinimo: 4500,
          valorMaximo: 11000,
          unidad: 'cel/mm³',
          estado: 'pendiente'
        },
        {
          id: 'HEM001_04',
          codigo: 'PLQ',
          nombre: 'Plaquetas',
          tipo: 'numerico',
          valorMinimo: 150000,
          valorMaximo: 450000,
          unidad: 'cel/mm³',
          estado: 'pendiente'
        }
      ]
    },
    'HEM002': {
      nombre: 'Tiempo de Coagulación',
      pruebas: [
        {
          id: 'HEM002_01',
          codigo: 'TP',
          nombre: 'Tiempo de Protrombina',
          tipo: 'numerico',
          valorMinimo: 11,
          valorMaximo: 13.5,
          unidad: 'seg',
          estado: 'pendiente'
        },
        {
          id: 'HEM002_02',
          codigo: 'INR',
          nombre: 'INR',
          tipo: 'numerico',
          valorMinimo: 0.8,
          valorMaximo: 1.2,
          unidad: '',
          estado: 'pendiente'
        }
      ]
    },
    'HEM003': {
      nombre: 'Perfil de Coagulación',
      pruebas: [
        {
          id: 'HEM003_01',
          codigo: 'APTT',
          nombre: 'Tiempo Parcial de Tromboplastina',
          tipo: 'numerico',
          valorMinimo: 25,
          valorMaximo: 35,
          unidad: 'seg',
          estado: 'pendiente'
        }
      ]
    }
  },
  'BQ': {
    'BQ001': {
      nombre: 'Perfil Bioquímico Básico',
      pruebas: [
        {
          id: 'BQ001_01',
          codigo: 'GLU',
          nombre: 'Glucosa',
          tipo: 'numerico',
          valorMinimo: 70,
          valorMaximo: 110,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'BQ001_02',
          codigo: 'UREA',
          nombre: 'Urea',
          tipo: 'numerico',
          valorMinimo: 15,
          valorMaximo: 45,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'BQ001_03',
          codigo: 'CREA',
          nombre: 'Creatinina',
          tipo: 'numerico',
          valorMinimo: 0.6,
          valorMaximo: 1.3,
          unidad: 'mg/dL',
          estado: 'pendiente'
        }
      ]
    },
    'BQ002': {
      nombre: 'Perfil Hepático',
      pruebas: [
        {
          id: 'BQ002_01',
          codigo: 'ALT',
          nombre: 'ALT/TGP',
          tipo: 'numerico',
          valorMinimo: 10,
          valorMaximo: 100,
          unidad: 'U/L',
          estado: 'pendiente'
        },
        {
          id: 'BQ002_02',
          codigo: 'AST',
          nombre: 'AST/TGO',
          tipo: 'numerico',
          valorMinimo: 10,
          valorMaximo: 100,
          unidad: 'U/L',
          estado: 'pendiente'
        },
        {
          id: 'BQ002_03',
          codigo: 'GGT',
          nombre: 'Gamma GT',
          tipo: 'numerico',
          valorMinimo: 9,
          valorMaximo: 48,
          unidad: 'U/L',
          estado: 'pendiente'
        }
      ]
    },
    'BQ003': {
      nombre: 'Perfil Lipídico',
      pruebas: [
        {
          id: 'BQ003_01',
          codigo: 'CT',
          nombre: 'Colesterol Total',
          tipo: 'numerico',
          valorMinimo: 150,
          valorMaximo: 200,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'BQ003_02',
          codigo: 'HDL',
          nombre: 'HDL Colesterol',
          tipo: 'numerico',
          valorMinimo: 40,
          valorMaximo: 60,
          unidad: 'mg/dL',
          estado: 'pendiente'
        }
      ]
    },
    'HEP001': {
      nombre: 'Panel Hepático Completo',
      pruebas: [
        {
          id: 'HEP001_01',
          codigo: 'ALT',
          nombre: 'ALT/TGP',
          tipo: 'numerico',
          valorMinimo: 10,
          valorMaximo: 100,
          unidad: 'U/L',
          estado: 'pendiente'
        },
        {
          id: 'HEP001_02',
          codigo: 'AST',
          nombre: 'AST/TGO',
          tipo: 'numerico',
          valorMinimo: 10,
          valorMaximo: 100,
          unidad: 'U/L',
          estado: 'pendiente'
        },
        {
          id: 'HEP001_03',
          codigo: 'GGT',
          nombre: 'Gamma GT',
          tipo: 'numerico',
          valorMinimo: 9,
          valorMaximo: 48,
          unidad: 'U/L',
          estado: 'pendiente'
        },
        {
          id: 'HEP001_04',
          codigo: 'ALP',
          nombre: 'Fosfatasa Alcalina',
          tipo: 'numerico',
          valorMinimo: 20,
          valorMaximo: 156,
          unidad: 'U/L',
          estado: 'pendiente'
        },
        {
          id: 'HEP001_05',
          codigo: 'BT',
          nombre: 'Bilirrubina Total',
          tipo: 'numerico',
          valorMinimo: 0.1,
          valorMaximo: 1.2,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'HEP001_06',
          codigo: 'BD',
          nombre: 'Bilirrubina Directa',
          tipo: 'numerico',
          valorMinimo: 0.0,
          valorMaximo: 0.3,
          unidad: 'mg/dL',
          estado: 'pendiente'
        }
      ]
    },
    'REN001': {
      nombre: 'Perfil Renal',
      pruebas: [
        {
          id: 'REN001_01',
          codigo: 'UREA',
          nombre: 'Urea',
          tipo: 'numerico',
          valorMinimo: 15,
          valorMaximo: 45,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'REN001_02',
          codigo: 'CREA',
          nombre: 'Creatinina',
          tipo: 'numerico',
          valorMinimo: 0.6,
          valorMaximo: 1.3,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'REN001_03',
          codigo: 'BUN',
          nombre: 'Nitrógeno Ureico',
          tipo: 'numerico',
          valorMinimo: 7,
          valorMaximo: 21,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'REN001_04',
          codigo: 'AU',
          nombre: 'Ácido Úrico',
          tipo: 'numerico',
          valorMinimo: 3.5,
          valorMaximo: 7.2,
          unidad: 'mg/dL',
          estado: 'pendiente'
        }
      ]
    }
  },
  'QUI': {
    'QUI001': {
      nombre: 'Química Clínica Básica',
      pruebas: [
        {
          id: 'QUI001_01',
          codigo: 'GLU',
          nombre: 'Glucosa',
          tipo: 'numerico',
          valorMinimo: 70,
          valorMaximo: 110,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'QUI001_02',
          codigo: 'COL',
          nombre: 'Colesterol Total',
          tipo: 'numerico',
          valorMinimo: 150,
          valorMaximo: 200,
          unidad: 'mg/dL',
          estado: 'pendiente'
        },
        {
          id: 'QUI001_03',
          codigo: 'TRI',
          nombre: 'Triglicéridos',
          tipo: 'numerico',
          valorMinimo: 50,
          valorMaximo: 150,
          unidad: 'mg/dL',
          estado: 'pendiente'
        }
      ]
    },
    'QUI002': {
      nombre: 'Electrolitos',
      pruebas: [
        {
          id: 'QUI002_01',
          codigo: 'NA',
          nombre: 'Sodio',
          tipo: 'numerico',
          valorMinimo: 135,
          valorMaximo: 145,
          unidad: 'mEq/L',
          estado: 'pendiente'
        },
        {
          id: 'QUI002_02',
          codigo: 'K',
          nombre: 'Potasio',
          tipo: 'numerico',
          valorMinimo: 3.5,
          valorMaximo: 5.0,
          unidad: 'mEq/L',
          estado: 'pendiente'
        }
      ]
    },
    'QUI003': {
      nombre: 'Enzimas Cardíacas',
      pruebas: [
        {
          id: 'QUI003_01',
          codigo: 'CPK',
          nombre: 'Creatina Fosfoquinasa',
          tipo: 'numerico',
          valorMinimo: 30,
          valorMaximo: 200,
          unidad: 'U/L',
          estado: 'pendiente'
        }
      ]
    }
  },
  'MICRO': {
    'MICRO001': {
      nombre: 'Cultivo y Antibiograma',
      pruebas: [
        {
          id: 'MICRO001_01',
          codigo: 'CULT',
          nombre: 'Cultivo Bacteriológico',
          tipo: 'texto',
          estado: 'pendiente'
        },
        {
          id: 'MICRO001_02',
          codigo: 'ATB',
          nombre: 'Antibiograma',
          tipo: 'texto',
          estado: 'pendiente'
        },
        {
          id: 'MICRO001_03',
          codigo: 'IDEN',
          nombre: 'Identificación',
          tipo: 'texto',
          estado: 'pendiente'
        }
      ]
    },
    'MICRO002': {
      nombre: 'Examen Directo',
      pruebas: [
        {
          id: 'MICRO002_01',
          codigo: 'GRAM',
          nombre: 'Tinción de Gram',
          tipo: 'texto',
          estado: 'pendiente'
        },
        {
          id: 'MICRO002_02',
          codigo: 'FRESCO',
          nombre: 'Examen en Fresco',
          tipo: 'texto',
          estado: 'pendiente'
        }
      ]
    },
    'MICRO003': {
      nombre: 'Tinción de Ziehl-Neelsen',
      pruebas: [
        {
          id: 'MICRO003_01',
          codigo: 'BAAR',
          nombre: 'Bacilos Ácido-Alcohol Resistentes',
          tipo: 'texto',
          estado: 'pendiente'
        }
      ]
    },
    'MICRO004': {
      nombre: 'Parasitología',
      pruebas: [
        {
          id: 'MICRO004_01',
          codigo: 'PARA',
          nombre: 'Examen Parasitológico',
          tipo: 'texto',
          estado: 'pendiente'
        },
        {
          id: 'MICRO004_02',
          codigo: 'CONC',
          nombre: 'Método de Concentración',
          tipo: 'texto',
          estado: 'pendiente'
        }
      ]
    }
  }
}

// Crear un mapeo de códigos especiales a sectores
const codigoASector = {
  'HEP': 'BQ',
  'REN': 'BQ'  // Los estudios que empiezan con REN también pertenecen al sector BQ
}

// Validaciones
const formularioValido = computed(() => {
  return ordenLab.value.prioridad && 
         ordenLab.value.tipoMuestra && 
         ordenLab.value.estudios && 
         ordenLab.value.estudios.length > 0
})

// Métodos para manejo de estudios
const agregarEstudiosDesdeSelector = (estudiosSeleccionados) => {
  console.log('Estudios recibidos del selector:', estudiosSeleccionados) // Debug

  estudiosSeleccionados.forEach(estudio => {
    // Verificar duplicados
    if (ordenLab.value.estudios.some(e => e.codigo === estudio.codigo)) {
      notify({
        type: 'warning',
        message: `El estudio ${estudio.codigo} ya está en la lista`,
        position: 'top'
      })
      return
    }

    const prefijo = estudio.codigo.substring(0, estudio.codigo.indexOf('0'))
    const sectorId = estudio.sectorId || codigoASector[prefijo] || prefijo
    const sector = sectores.find(s => s.id === sectorId)
    const estudioConfig = estudiosPorSector[sectorId]?.[estudio.codigo]

    if (!estudioConfig) {
      console.error('No se encontró configuración:', { sectorId, codigo: estudio.codigo })
      notify({
        type: 'negative',
        message: `No se encontró configuración para el estudio ${estudio.codigo}`,
        position: 'top'
      })
      return
    }

    const nuevoEstudio = {
      id: Date.now() + Math.random(),
      codigo: estudio.codigo,
      nombre: estudioConfig.nombre,
      sectorId: sectorId,
      sector: sector,
      estado: 'pendiente',
      fechaAgregado: new Date().toISOString(),
      pruebas: estudioConfig.pruebas.map(prueba => ({
        ...prueba,
        id: `${prueba.id}_${Date.now()}`,
        sectorId: sectorId,
        sectorNombre: sector?.nombre || '',
        resultado: null,
        estado: 'pendiente'
      }))
    }

    console.log('Nuevo estudio a agregar:', nuevoEstudio) // Debug
    ordenLab.value.estudios.push(nuevoEstudio)

    notify({
      type: 'positive',
      message: `Estudio ${estudio.codigo} agregado correctamente`,
      position: 'top'
    })
  })

  mostrarDialogoEstudio.value = false
  guardarDatos()
}

const buscarPorCodigo = async () => {
  if (!codigoEstudio.value) return
  
  const codigo = codigoEstudio.value.toUpperCase()
  const prefijo = codigo.substring(0, codigo.indexOf('0'))
  // Buscar el sector correcto usando el mapeo
  const sectorId = codigoASector[prefijo] || prefijo
  
  if (!estudiosPorSector[sectorId]?.[codigo]) {
    notify({
      type: 'negative',
      message: 'Código de estudio no encontrado',
      position: 'top'
    })
    return
  }

  await agregarEstudiosDesdeSelector([{ codigo, sectorId }])
  codigoEstudio.value = ''
}

// Simulación de datos preestablecidos - Reemplazar con tu API real
const buscarEstudioPorCodigo = async (codigo) => {
  const codigoUpperCase = codigo.toUpperCase()
  const sectorId = codigoUpperCase.substring(0, codigoUpperCase.indexOf('0'))
  
  const sectorEstudios = estudiosPorSector[sectorId]
  const estudioConfig = sectorEstudios?.[codigoUpperCase]
  
  if (!estudioConfig) return null
  
  const sector = sectores.find(s => s.id === sectorId)
  
  return {
    codigo: codigoUpperCase,
    nombre: estudioConfig.nombre,
    sectorId: sectorId,
    sector: sector,
    tipoMuestra: 'sangre_completa',
    tiempoResultado: '24h',
    preparacion: 'No requiere preparación especial',
    precio: 0,
    pruebas: estudioConfig.pruebas || []
  }
}

// Métodos de estado
const getEstadoColor = () => {
  switch(ordenLab.value.estado) {
    case 'borrador': return 'orange'
    case 'generada': return 'blue'
    case 'en_proceso': return 'purple'
    case 'completada': return 'green'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(ordenLab.value.estado) {
    case 'borrador': return 'edit'
    case 'generada': return 'send'
    case 'en_proceso': return 'hourglass_empty'
    case 'completada': return 'check_circle'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(ordenLab.value.estado) {
    case 'borrador': return 'Borrador'
    case 'generada': return 'Orden Generada'
    case 'en_proceso': return 'En Proceso'
    case 'completada': return 'Completada'
    default: return 'Sin Estado'
  }
}

// Métodos principales
const generarNumeroOrden = () => {
  const fecha = new Date()
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `LAB${year}${month}${day}${random}`
}

const generarOrden = () => {
  if (!formularioValido.value) {
    notify({
      type: 'warning',
      message: 'Complete todos los campos requeridos',
      position: 'top'
    })
    return
  }

  ordenLab.value.estado = 'generada'
  ordenLab.value.numeroOrden = `LAB${Date.now()}`
  ordenLab.value.fechaGeneracion = new Date().toISOString()
  
  guardarDatos()
  
  notify({
    type: 'positive',
    message: 'Orden generada correctamente',
    position: 'top'
  })
  
  // Cambiar a la pestaña de resultados
  tab.value = 'resultados'
}

const confirmarOrden = () => {
  if (formularioValido.value) {
    mostrarDialogoConfirmacion.value = true
  }
}

const duplicarOrden = () => {
  const nuevaOrden = {
    ...ordenLab.value,
    numeroOrden: '',
    estado: 'borrador',
    fechaCreacion: new Date().toISOString(),
    fechaGeneracion: null,
    estudios: ordenLab.value.estudios.map(estudio => ({
      ...estudio,
      id: Date.now() + Math.random(),
      estado: 'pendiente',
      resultados: []
    }))
  }
  
  emit('servicio-actualizado', props.servicioId, nuevaOrden)
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, ordenLab.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Método para actualizar resultados
const actualizarResultados = (resultados) => {
  ordenLab.value.estudios = ordenLab.value.estudios.map(estudio => {
    const resultadoActualizado = resultados.find(r => r.estudioId === estudio.id)
    if (resultadoActualizado) {
      return {
        ...estudio,
        resultado: resultadoActualizado.resultado,
        estado: 'cargado',
        fechaCarga: new Date().toISOString()
      }
    }
    return estudio
  })
  
  actualizarEstadoOrden()
  guardarDatos()
}

// Métodos para manejo de estados
const actualizarEstadoEstudio = (estudioId, nuevoEstado) => {
  const estudio = ordenLab.value.estudios.find(e => e.id === estudioId)
  if (!estudio) return

  switch (nuevoEstado) {
    case 'cargado':
      estudio.estado = 'cargado'
      estudio.fechaCarga = new Date().toISOString()
      break
    case 'validado':
      estudio.estado = 'validado'
      estudio.fechaValidacion = new Date().toISOString()
      estudio.validadoPor = 'Usuario Actual' // Reemplazar con el usuario actual
      break
    case 'pendiente':
      estudio.estado = 'pendiente'
      estudio.fechaValidacion = null
      estudio.validadoPor = null
      break
  }
  
  actualizarEstadoOrden()
  guardarDatos()
}

const actualizarEstadoOrden = () => {
  const estudios = ordenLab.value.estudios
  if (!estudios.length) {
    ordenLab.value.estado = 'borrador'
    return
  }

  const todosValidados = estudios.every(e => e.estado === 'validado')
  const algunoCargado = estudios.some(e => e.estado === 'cargado' || e.estado === 'validado')

  if (todosValidados) {
    ordenLab.value.estado = 'validada'
  } else if (algunoCargado) {
    ordenLab.value.estado = 'cargada'
  } else {
    ordenLab.value.estado = 'pendiente'
  }
}

// Inicializar fechas por defecto
if (!ordenLab.value.fechaRecoleccion) {
  const ahora = new Date()
  ordenLab.value.fechaRecoleccion = ahora.toISOString().slice(0, 16)
}

// Watchers
watch(ordenLab, guardarDatos, { deep: true })

// Add to your setup script in ResultadosLaboratorio
const sectoresConEstudios = computed(() => {
  const sectoresUsados = new Set(orden.value.estudios.map(e => e.sectorId))
  return sectores.filter(s => sectoresUsados.has(s.id))
})

const estudiosAgrupadosPorSector = computed(() => {
  return orden.value.estudios.reduce((acc, estudio) => {
    if (!acc[estudio.sectorId]) {
      acc[estudio.sectorId] = []
    }
    acc[estudio.sectorId].push(estudio)
    return acc
  }, {})
})

const hayEstudiosParaValidar = computed(() => 
  estudiosSeleccionados.value.some(id => {
    const estudio = orden.value.estudios.find(e => e.id === id)
    return estudio && estudio.estado === 'cargado'
  })
)

const hayEstudiosValidados = computed(() => 
  estudiosSeleccionados.value.some(id => {
    const estudio = orden.value.estudios.find(e => e.id === id)
    return estudio && estudio.estado === 'validado'
  })
)
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}

.estado-orden {
  margin-left: auto;
  padding-left: 16px;
}

:deep(.q-tab) {
  padding: 12px 16px;
}

:deep(.q-tab__label) {
  font-size: 14px;
  font-weight: 500;
}

.codigo-input {
  width: 200px;
}

.estudios-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.estudio-item {
  transition: all 0.3s ease;
}

.estudio-item:hover {
  transform: translateX(4px);
}

.estudios-sector {
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
}

.estudio-card {
  margin-bottom: 8px;
}
</style>