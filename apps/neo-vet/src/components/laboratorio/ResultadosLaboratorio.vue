<template>
  <div class="resultados-container">
    <!-- Header con filtros y acciones -->
    <div class="resultados-header">
      <div class="header-title">
        <q-icon name="analytics" size="24px" color="primary" />
        <span class="title-text">Resultados de Laboratorio</span>
        <q-chip 
          :color="getEstadoColorOrden()" 
          text-color="white" 
          size="sm"
          :label="`${contadorEstados.validados}/${contadorEstados.total} validados`"
        />
      </div>
      
      <div class="header-actions">
        <q-input
          v-model="filtro"
          dense
          outlined
          placeholder="Buscar prueba, estudio o sector..."
          class="search-input"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
        
        <q-separator vertical inset class="q-mx-sm" />
        
        <!-- Botones de validación masiva -->
        <div class="validacion-masiva-actions">
          <q-btn
            color="positive"
            icon="verified_user"
            label="Validar Todo"
            :disable="!hayResultadosParaValidarTodo"
            size="sm"
            @click="confirmarValidarTodo"
            class="btn-validacion-masiva"
          >
            <q-tooltip>Validar todos los resultados cargados</q-tooltip>
          </q-btn>
          
          <q-btn-dropdown
            color="info"
            icon="domain"
            label="Por Sector"
            size="sm"
            :disable="sectoresConResultados.length === 0"
            class="btn-validacion-masiva"
          >
            <q-list>
              <q-item
                v-for="sector in sectoresConResultados"
                :key="sector.id"
                clickable
                @click="confirmarValidarSector(sector)"
                :disable="!sector.tieneResultadosParaValidar"
              >
                <q-item-section avatar>
                  <div 
                    class="sector-indicator-dropdown"
                    :style="{ backgroundColor: getSectorColor(sector.id) }"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ sector.nombre }}</q-item-label>
                  <q-item-label caption>
                    {{ sector.resultadosCargados }} de {{ sector.totalResultados }} para validar
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge 
                    :color="sector.tieneResultadosParaValidar ? 'positive' : 'grey-5'"
                    :label="sector.resultadosCargados"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          
          <q-btn-dropdown
            color="primary"
            icon="assignment"
            label="Por Estudio"
            size="sm"
            :disable="estudiosConResultados.length === 0"
            class="btn-validacion-masiva"
          >
            <q-list style="max-height: 300px" class="scroll">
              <q-item
                v-for="estudio in estudiosConResultados"
                :key="estudio.id"
                clickable
                @click="confirmarValidarEstudio(estudio)"
                :disable="!estudio.tieneResultadosParaValidar"
              >
                <q-item-section avatar>
                  <div 
                    class="sector-indicator-dropdown"
                    :style="{ backgroundColor: getSectorColor(estudio.sectorId) }"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ estudio.nombre }}</q-item-label>
                  <q-item-label caption>
                    {{ estudio.sectorNombre }} • {{ estudio.codigo }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ estudio.resultadosCargados }} de {{ estudio.totalResultados }} para validar
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge 
                    :color="estudio.tieneResultadosParaValidar ? 'positive' : 'grey-5'"
                    :label="estudio.resultadosCargados"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        
        <q-separator vertical inset class="q-mx-sm" />
        
        <!-- Botones de selección múltiple -->
        <q-btn-group flat>
          <q-btn
            :color="modoValidacionMasiva ? 'primary' : 'grey-7'"
            :icon="modoValidacionMasiva ? 'check_box' : 'check_box_outline_blank'"
            :label="modoValidacionMasiva ? 'Cancelar selección' : 'Selección múltiple'"
            size="sm"
            @click="toggleModoValidacionMasiva"
          />
          
          <q-btn
            v-if="modoValidacionMasiva"
            color="positive"
            icon="verified"
            label="Validar seleccionados"
            :disable="!hayResultadosSeleccionados"
            size="sm"
            @click="validarSeleccionados"
          />
          
          <q-btn
            v-if="modoValidacionMasiva"
            color="warning"
            icon="undo"
            label="Desvalidar seleccionados"
            :disable="!hayValidadosSeleccionados"
            size="sm"
            @click="desvalidarSeleccionados"
          />
        </q-btn-group>
      </div>
    </div>

    <!-- Tabla moderna -->
    <div class="tabla-wrapper">
      <q-table
        :rows="pruebasFiltradasYOrdenadas"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 50, sortBy: 'sectorNombre' }"
        :filter="filtro"
        :filter-method="filtrarPruebas"
        class="tabla-moderna"
        separator="horizontal"
        :selected-rows-label="getSelectedString"
        :selection="modoValidacionMasiva ? 'multiple' : 'none'"
        v-model:selected="pruebasSeleccionadas"
      >
        <!-- Encabezados personalizados -->
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-if="modoValidacionMasiva" auto-width>
              <q-checkbox 
                v-model="props.selected" 
                size="sm"
              />
            </q-th>
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              :class="col.headerClass"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Filas personalizadas -->
        <template v-slot:body="props">
          <q-tr 
            :props="props" 
            :class="getRowClass(props.row)"
            @click="modoValidacionMasiva && toggleSelection(props.row)"
          >
            <!-- Checkbox de selección -->
            <q-td v-if="modoValidacionMasiva" auto-width>
              <q-checkbox 
                v-model="props.selected" 
                size="sm"
                :disable="props.row.estado === 'pendiente'"
              />
            </q-td>
            
            <!-- Sector -->
            <q-td key="sectorNombre" :props="props">
              <div class="sector-info">
                <div 
                  class="sector-indicator"
                  :style="{ backgroundColor: getSectorColor(props.row.sectorId) }"
                />
                <div>
                  <div class="sector-name">{{ props.row.sectorNombre }}</div>
                  <div class="sector-id">{{ props.row.sectorId }}</div>
                </div>
              </div>
            </q-td>
            
            <!-- Estudio -->
            <q-td key="estudioNombre" :props="props">
              <div class="estudio-info">
                <div class="estudio-nombre">{{ props.row.estudioNombre }}</div>
                <div class="estudio-codigo">{{ props.row.codigo }}</div>
              </div>
            </q-td>
            
            <!-- Prueba -->
            <q-td key="nombre" :props="props">
              <div class="prueba-nombre">{{ props.row.nombre }}</div>
            </q-td>

            <!-- Rango Normal -->
            <q-td key="rango" :props="props">
              <div class="rango-info">
                <span v-if="props.row.valorMinimo || props.row.valorMaximo" class="rango-valores">
                  {{ formatearRango(props.row) }}
                </span>
                <span v-else class="no-rango">-</span>
              </div>
            </q-td>

            <!-- Unidad -->
            <q-td key="unidad" :props="props">
              <div class="unidad-info">
                <span v-if="props.row.unidad" class="unidad-text">{{ props.row.unidad }}</span>
                <span v-else class="no-unidad">-</span>
              </div>
            </q-td>
            
            <!-- Resultado -->
            <q-td key="resultado" :props="props" class="resultado-cell">
              <div class="resultado-container">
                <q-input
                  :model-value="getResultadoValue(props.row.id)"
                  @update:model-value="(val) => updateResultadoValue(props.row.id, val)"
                  type="text"
                  dense
                  outlined
                  square
                  :disable="props.row.estado === 'validado'"
                  @keyup.enter="focusNextResult(props.rowIndex)"
                  @blur="() => procesarResultadoFinal(props.row.id)"
                  :error="estaFueraDeRango(props.row)"
                  :error-message="getMensajeError(props.row)"
                  class="resultado-input"
                  :class="getInputClass(props.row)"
                  :placeholder="props.row.tipo === 'numerico' ? 'Ej: 12.5' : 'Ingrese resultado'"
                />
                
                <!-- Botón de validación rápida -->
                <div v-if="getResultadoValue(props.row.id) && props.row.estado === 'cargado'" class="validacion-rapida">
                  <q-btn
                    dense
                    flat
                    round
                    size="sm"
                    icon="check"
                    color="positive"
                    @click="validarResultadoRapido(props.row)"
                  >
                    <q-tooltip>Validar resultado</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-td>
            
            <!-- Estado -->
            <q-td key="estado" :props="props">
              <q-badge 
                :color="getEstadoColor(props.row.estado)"
                :label="props.row.estado.toUpperCase()"
                class="estado-badge"
              />
            </q-td>
            
            <!-- Usuario que cargó -->
            <q-td key="usuarioCargo" :props="props">
              <div v-if="props.row.usuarioCargo" class="usuario-info">
                <div class="usuario-nombre">{{ props.row.usuarioCargo }}</div>
                <div v-if="props.row.fechaCarga" class="fecha-accion">
                  {{ formatearFecha(props.row.fechaCarga) }}
                </div>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
            
            <!-- Usuario que validó -->
            <q-td key="usuarioValido" :props="props">
              <div v-if="props.row.usuarioValido" class="usuario-info">
                <div class="usuario-nombre">{{ props.row.usuarioValido }}</div>
                <div v-if="props.row.fechaValidacion" class="fecha-accion">
                  {{ formatearFecha(props.row.fechaValidacion) }}
                </div>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
            
            <!-- Acciones -->
            <q-td key="acciones" :props="props">
              <div class="acciones-cell">
                <q-btn-group flat dense>
                  <q-btn
                    v-if="props.row.estado === 'cargado'"
                    dense
                    flat
                    round
                    icon="verified"
                    color="positive"
                    size="sm"
                    @click="validarResultado(props.row)"
                  >
                    <q-tooltip>Validar resultado</q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    v-if="props.row.estado === 'validado'"
                    dense
                    flat
                    round
                    icon="undo"
                    color="warning"
                    size="sm"
                    @click="desvalidarResultado(props.row)"
                  >
                    <q-tooltip>Desvalidar resultado</q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    dense
                    flat
                    round
                    icon="history"
                    color="info"
                    size="sm"
                    @click="mostrarHistorial(props.row)"
                  >
                    <q-tooltip>Ver historial</q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    v-if="estaFueraDeRango(props.row)"
                    dense
                    flat
                    round
                    icon="warning"
                    color="orange"
                    size="sm"
                  >
                    <q-tooltip>Valor fuera de rango normal</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- Slot para cuando no hay datos -->
        <template v-slot:no-data>
          <div class="no-data-container">
            <q-icon name="science" size="48px" color="grey-4" />
            <div class="no-data-text">No hay resultados para mostrar</div>
            <div class="no-data-subtitle">Los resultados aparecerán aquí una vez que se genere la orden</div>
          </div>
        </template>
      </q-table>
    </div>

    <!-- Footer con estadísticas -->
    <div class="tabla-footer">
      <div class="estadisticas">
        <q-chip outline color="grey-7" size="sm">
          <q-icon name="assignment" class="q-mr-xs" />
          Total: {{ contadorEstados.total }}
        </q-chip>
        <q-chip outline color="orange" size="sm">
          <q-icon name="pending" class="q-mr-xs" />
          Pendientes: {{ contadorEstados.pendientes }}
        </q-chip>
        <q-chip outline color="blue" size="sm">
          <q-icon name="edit" class="q-mr-xs" />
          Cargados: {{ contadorEstados.cargados }}
        </q-chip>
        <q-chip outline color="positive" size="sm">
          <q-icon name="check_circle" class="q-mr-xs" />
          Validados: {{ contadorEstados.validados }}
        </q-chip>
      </div>
      
      <div class="progreso-validacion">
        <q-linear-progress
          :value="progresoValidacion"
          color="positive"
          size="4px"
          class="q-mt-xs"
        />
        <div class="progreso-texto">
          {{ Math.round(progresoValidacion * 100) }}% completado
        </div>
      </div>
    </div>

    <!-- Diálogos de confirmación -->
    <q-dialog v-model="mostrarDialogoConfirmacion" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon :name="dialogoConfirmacion.icono" :color="dialogoConfirmacion.color" size="32px" class="q-mr-md" />
          <div class="text-h6">{{ dialogoConfirmacion.titulo }}</div>
        </q-card-section>

        <q-card-section>
          <div>{{ dialogoConfirmacion.mensaje }}</div>
          <div v-if="dialogoConfirmacion.detalles" class="text-caption text-grey-7 q-mt-sm">
            {{ dialogoConfirmacion.detalles }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" @click="cerrarDialogoConfirmacion" />
          <q-btn 
            flat 
            :label="dialogoConfirmacion.labelConfirmar" 
            :color="dialogoConfirmacion.color" 
            @click="ejecutarAccionConfirmada"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, reactive } from 'vue'
import { useQuasar } from 'quasar'

// Types
interface Prueba {
  id: string
  estudioId: string
  codigo: string
  nombre: string
  tipo: 'numerico' | 'texto'
  resultado: string | number | null
  valorMinimo?: number
  valorMaximo?: number
  unidad?: string
  estado: 'pendiente' | 'cargado' | 'validado'
  sectorId: string
  sectorNombre: string
  estudioNombre: string
  usuarioCargo?: string
  fechaCarga?: string
  usuarioValido?: string
  fechaValidacion?: string
}

interface SectorResumen {
  id: string
  nombre: string
  totalResultados: number
  resultadosCargados: number
  resultadosValidados: number
  tieneResultadosParaValidar: boolean
}

interface EstudioResumen {
  id: string
  codigo: string
  nombre: string
  sectorId: string
  sectorNombre: string
  totalResultados: number
  resultadosCargados: number
  resultadosValidados: number
  tieneResultadosParaValidar: boolean
}

interface DialogoConfirmacion {
  titulo: string
  mensaje: string
  detalles?: string
  icono: string
  color: string
  labelConfirmar: string
  accion: () => void
}

// Props
const props = defineProps<{
  orden: {
    estudios: Array<{
      id: number
      codigo: string
      nombre: string
      sectorId: string
      sector: { nombre: string }
      estado: string
      pruebas: Prueba[]
    }>
  }
}>()

// Emits
const emit = defineEmits(['resultados-actualizados'])

// Composables
const $q = useQuasar()

// Estados reactivos
const filtro = ref('')
const modoValidacionMasiva = ref(false)
const pruebasSeleccionadas = ref<Prueba[]>([])
const mostrarDialogoConfirmacion = ref(false)
const dialogoConfirmacion = ref<DialogoConfirmacion>({
  titulo: '',
  mensaje: '',
  icono: '',
  color: '',
  labelConfirmar: '',
  accion: () => {}
})

// Estado local para manejar los valores de los inputs independientemente
const valoresResultados = reactive<Record<string, string>>({})
// Estado local para manejar los estados de las pruebas
const estadosPruebas = reactive<Record<string, 'pendiente' | 'cargado' | 'validado'>>({})
// Estado local para metadatos de las pruebas
const metadatosPruebas = reactive<Record<string, {
  usuarioCargo?: string
  fechaCarga?: string
  usuarioValido?: string
  fechaValidacion?: string
}>>({})

// Inicializar valores de resultados y estados
const inicializarDatos = () => {
  if (!props.orden?.estudios) return
  
  props.orden.estudios.forEach(estudio => {
    if (Array.isArray(estudio.pruebas)) {
      estudio.pruebas.forEach(prueba => {
        // Inicializar valores solo si no existen
        if (!valoresResultados[prueba.id]) {
          valoresResultados[prueba.id] = prueba.resultado?.toString() || ''
        }
        if (!estadosPruebas[prueba.id]) {
          estadosPruebas[prueba.id] = prueba.estado
        }
        if (!metadatosPruebas[prueba.id]) {
          metadatosPruebas[prueba.id] = {
            usuarioCargo: prueba.usuarioCargo,
            fechaCarga: prueba.fechaCarga,
            usuarioValido: prueba.usuarioValido,
            fechaValidacion: prueba.fechaValidacion
          }
        }
      })
    }
  })
}

// Inicializar datos al montar el componente
inicializarDatos()

// Columnas de la tabla
const columns = [
  { 
    name: 'sectorNombre', 
    label: 'Sector', 
    field: 'sectorNombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 140px'
  },
  { 
    name: 'estudioNombre', 
    label: 'Estudio', 
    field: 'estudioNombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 180px'
  },
  { 
    name: 'nombre', 
    label: 'Prueba', 
    field: 'nombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 200px'
  },
  { 
    name: 'rango', 
    label: 'Rango Normal', 
    field: 'rango', 
    align: 'center',
    style: 'width: 120px'
  },
  { 
    name: 'unidad', 
    label: 'Unidad', 
    field: 'unidad', 
    align: 'center',
    style: 'width: 80px'
  },
  { 
    name: 'resultado', 
    label: 'Resultado', 
    field: 'resultado', 
    align: 'center',
    style: 'width: 140px'
  },
  { 
    name: 'estado', 
    label: 'Estado', 
    field: 'estado', 
    align: 'center', 
    sortable: true,
    style: 'width: 100px'
  },
  { 
    name: 'usuarioCargo', 
    label: 'Cargado por', 
    field: 'usuarioCargo', 
    align: 'left',
    style: 'width: 120px'
  },
  { 
    name: 'usuarioValido', 
    label: 'Validado por', 
    field: 'usuarioValido', 
    align: 'left',
    style: 'width: 120px'
  },
  { 
    name: 'acciones', 
    label: 'Acciones', 
    field: '', 
    align: 'center',
    style: 'width: 120px'
  }
]

// Computed properties
const pruebasAplanadas = computed(() => {
  const pruebas: Prueba[] = []
  
  if (!props.orden?.estudios) return pruebas

  props.orden.estudios.forEach(estudio => {
    if (Array.isArray(estudio.pruebas)) {
      estudio.pruebas.forEach(prueba => {
        // Crear copia de la prueba con estados locales actualizados
        const pruebaActualizada: Prueba = {
          ...prueba,
          sectorNombre: estudio.sector?.nombre || '',
          estudioNombre: estudio.nombre,
          estudioId: estudio.id.toString(),
          resultado: valoresResultados[prueba.id] ? 
            (prueba.tipo === 'numerico' ? 
              parseFloat(valoresResultados[prueba.id].replace(',', '.')) || valoresResultados[prueba.id] : 
              valoresResultados[prueba.id]) : 
            null,
          estado: estadosPruebas[prueba.id] || prueba.estado,
          usuarioCargo: metadatosPruebas[prueba.id]?.usuarioCargo,
          fechaCarga: metadatosPruebas[prueba.id]?.fechaCarga,
          usuarioValido: metadatosPruebas[prueba.id]?.usuarioValido,
          fechaValidacion: metadatosPruebas[prueba.id]?.fechaValidacion
        }
        
        pruebas.push(pruebaActualizada)
      })
    }
  })
  
  return pruebas
})

const pruebasFiltradasYOrdenadas = computed(() => {
  return pruebasAplanadas.value.sort((a, b) => {
    if (a.sectorNombre !== b.sectorNombre) {
      return a.sectorNombre.localeCompare(b.sectorNombre)
    }
    if (a.estudioNombre !== b.estudioNombre) {
      return a.estudioNombre.localeCompare(b.estudioNombre)
    }
    return a.nombre.localeCompare(b.nombre)
  })
})

const contadorEstados = computed(() => {
  const total = pruebasAplanadas.value.length
  const pendientes = pruebasAplanadas.value.filter(p => p.estado === 'pendiente').length
  const cargados = pruebasAplanadas.value.filter(p => p.estado === 'cargado').length
  const validados = pruebasAplanadas.value.filter(p => p.estado === 'validado').length
  
  return { total, pendientes, cargados, validados }
})

const progresoValidacion = computed(() => {
  if (contadorEstados.value.total === 0) return 0
  return contadorEstados.value.validados / contadorEstados.value.total
})

const hayResultadosSeleccionados = computed(() => 
  pruebasSeleccionadas.value.some(p => p.estado === 'cargado')
)

const hayValidadosSeleccionados = computed(() => 
  pruebasSeleccionadas.value.some(p => p.estado === 'validado')
)

const hayResultadosParaValidarTodo = computed(() => 
  pruebasAplanadas.value.some(p => p.estado === 'cargado')
)

const sectoresConResultados = computed((): SectorResumen[] => {
  const sectoresMap = new Map<string, SectorResumen>()
  
  pruebasAplanadas.value.forEach(prueba => {
    const sectorId = prueba.sectorId
    if (!sectoresMap.has(sectorId)) {
      sectoresMap.set(sectorId, {
        id: sectorId,
        nombre: prueba.sectorNombre,
        totalResultados: 0,
        resultadosCargados: 0,
        resultadosValidados: 0,
        tieneResultadosParaValidar: false
      })
    }
    
    const sector = sectoresMap.get(sectorId)!
    sector.totalResultados++
    
    if (prueba.estado === 'cargado') {
      sector.resultadosCargados++
      sector.tieneResultadosParaValidar = true
    } else if (prueba.estado === 'validado') {
      sector.resultadosValidados++
    }
  })
  
  return Array.from(sectoresMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const estudiosConResultados = computed((): EstudioResumen[] => {
  const estudiosMap = new Map<string, EstudioResumen>()
  
  pruebasAplanadas.value.forEach(prueba => {
    const estudioId = prueba.estudioId
    if (!estudiosMap.has(estudioId)) {
      estudiosMap.set(estudioId, {
        id: estudioId,
        codigo: prueba.codigo,
        nombre: prueba.estudioNombre,
        sectorId: prueba.sectorId,
        sectorNombre: prueba.sectorNombre,
        totalResultados: 0,
        resultadosCargados: 0,
        resultadosValidados: 0,
        tieneResultadosParaValidar: false
      })
    }
    
    const estudio = estudiosMap.get(estudioId)!
    estudio.totalResultados++
    
    if (prueba.estado === 'cargado') {
      estudio.resultadosCargados++
      estudio.tieneResultadosParaValidar = true
    } else if (prueba.estado === 'validado') {
      estudio.resultadosValidados++
    }
  })
  
  return Array.from(estudiosMap.values()).sort((a, b) => {
    if (a.sectorNombre !== b.sectorNombre) {
      return a.sectorNombre.localeCompare(b.sectorNombre)
    }
    return a.nombre.localeCompare(b.nombre)
  })
})

// Métodos para manejar los valores de los inputs
const getResultadoValue = (pruebaId: string): string => {
  return valoresResultados[pruebaId] || ''
}

const updateResultadoValue = (pruebaId: string, valor: string) => {
  console.log(`Actualizando valor - ID: ${pruebaId}, Valor: "${valor}"`)
  valoresResultados[pruebaId] = valor
}

const procesarResultadoFinal = (pruebaId: string) => {
  console.log(`Procesando resultado final - ID: ${pruebaId}`)
  
  const valor = valoresResultados[pruebaId]?.trim() || ''
  const estadoAnterior = estadosPruebas[pruebaId] || 'pendiente'
  
  // Encontrar la prueba original para obtener tipo y rangos
  const pruebaOriginal = props.orden?.estudios
    ?.flatMap(e => e.pruebas || [])
    ?.find(p => p.id === pruebaId)
  
  if (!pruebaOriginal) return
  
  if (!valor) {
    // Valor vacío - volver a pendiente solo si no estaba validado
    if (estadoAnterior !== 'validado') {
      estadosPruebas[pruebaId] = 'pendiente'
      metadatosPruebas[pruebaId] = {
        usuarioCargo: undefined,
        fechaCarga: undefined,
        usuarioValido: metadatosPruebas[pruebaId]?.usuarioValido,
        fechaValidacion: metadatosPruebas[pruebaId]?.fechaValidacion
      }
      
      console.log(`Resultado vacío - volviendo a pendiente`)
    }
  } else {
    // Hay valor, procesar según tipo
    let resultadoValido = true
    
    if (pruebaOriginal.tipo === 'numerico') {
      const valorNumerico = parseFloat(valor.replace(',', '.'))
      
      if (isNaN(valorNumerico)) {
        resultadoValido = false
        $q.notify({
          type: 'warning',
          message: `"${valor}" no es un número válido para ${pruebaOriginal.nombre}`,
          position: 'top-right',
          timeout: 3000
        })
      }
    }
    
    // Solo cambiar estado si no está validado y el resultado es válido
    if (estadoAnterior !== 'validado' && resultadoValido) {
      if (estadoAnterior === 'pendiente') {
        // Primera vez que se ingresa un resultado
        estadosPruebas[pruebaId] = 'cargado'
        metadatosPruebas[pruebaId] = {
          ...metadatosPruebas[pruebaId],
          usuarioCargo: 'Usuario Actual',
          fechaCarga: new Date().toISOString()
        }
        
        console.log(`Primer resultado ingresado - cambiando a cargado`)
        
        $q.notify({
          type: 'positive',
          message: `Resultado cargado para ${pruebaOriginal.nombre}`,
          position: 'top-right',
          timeout: 2000
        })
      } else if (estadoAnterior === 'cargado') {
        // Modificando un resultado ya cargado
        metadatosPruebas[pruebaId] = {
          ...metadatosPruebas[pruebaId],
          fechaCarga: new Date().toISOString()
        }
        console.log(`Resultado modificado - manteniendo estado cargado`)
      }
    }
    
    // Verificar rango si el resultado es válido y es numérico
    if (resultadoValido && pruebaOriginal.tipo === 'numerico') {
      const valorNumerico = parseFloat(valor.replace(',', '.'))
      const fueraDeRango = (
        (pruebaOriginal.valorMinimo !== undefined && valorNumerico < pruebaOriginal.valorMinimo) ||
        (pruebaOriginal.valorMaximo !== undefined && valorNumerico > pruebaOriginal.valorMaximo)
      )
      
      if (fueraDeRango) {
        const rango = pruebaOriginal.valorMinimo && pruebaOriginal.valorMaximo ? 
          `${pruebaOriginal.valorMinimo} - ${pruebaOriginal.valorMaximo}` :
          pruebaOriginal.valorMinimo ? `≥ ${pruebaOriginal.valorMinimo}` : 
          `≤ ${pruebaOriginal.valorMaximo}`
        
        $q.notify({
          type: 'warning',
          message: `⚠️ Valor fuera del rango normal: ${rango}`,
          position: 'top-right',
          timeout: 4000
        })
      }
    }
  }
  
  // Emitir cambios con la prueba actualizada
  const pruebaActualizada = pruebasAplanadas.value.find(p => p.id === pruebaId)
  if (pruebaActualizada) {
    emit('resultados-actualizados', [pruebaActualizada])
  }
  
  console.log(`Resultado procesado - Estado: ${estadoAnterior} → ${estadosPruebas[pruebaId]}, Resultado: ${valor}`)
}

// Métodos para estilos y colores
const getSectorColor = (sectorId: string) => {
  const colores: Record<string, string> = {
    'HEM': '#7c3aed',
    'BQ': '#0d9488', 
    'QUI': '#059669',
    'MICRO': '#475569'
  }
  return colores[sectorId] || '#6b7280'
}

const getEstadoColor = (estado: string) => {
  const colores: Record<string, string> = {
    'pendiente': 'grey-5',
    'cargado': 'orange',
    'validado': 'positive'
  }
  return colores[estado] || 'grey-5'
}

const getEstadoColorOrden = () => {
  const { validados, total } = contadorEstados.value
  if (validados === total && total > 0) return 'positive'
  if (validados > 0) return 'orange'
  return 'grey-5'
}

const getRowClass = (prueba: Prueba) => {
  return [
    'tabla-row',
    `estado-${prueba.estado}`,
    { 'fuera-rango': estaFueraDeRango(prueba) },
    { 'row-selectable': modoValidacionMasiva.value }
  ]
}

const getInputClass = (prueba: Prueba) => {
  return [
    'resultado-input-modern',
    { 'input-validado': prueba.estado === 'validado' },
    { 'input-error': estaFueraDeRango(prueba) },
    { 'input-cargado': prueba.estado === 'cargado' }
  ]
}

// Métodos de validación
const estaFueraDeRango = (prueba: Prueba) => {
  if (prueba.tipo !== 'numerico' || !prueba.resultado) return false
  
  let valorNumerico: number
  if (typeof prueba.resultado === 'string') {
    valorNumerico = parseFloat(prueba.resultado.replace(',', '.'))
    if (isNaN(valorNumerico)) return false
  } else {
    valorNumerico = Number(prueba.resultado)
  }
  
  return (
    (prueba.valorMinimo !== undefined && valorNumerico < prueba.valorMinimo) ||
    (prueba.valorMaximo !== undefined && valorNumerico > prueba.valorMaximo)
  )
}

const getMensajeError = (prueba: Prueba) => {
  if (!estaFueraDeRango(prueba)) return ''
  return ''
}

// Métodos de formateo
const formatearRango = (prueba: Prueba) => {
  if (!prueba.valorMinimo && !prueba.valorMaximo) return 'No definido'
  if (prueba.valorMinimo && prueba.valorMaximo) {
    return `${prueba.valorMinimo} - ${prueba.valorMaximo}`
  }
  if (prueba.valorMinimo) return `≥ ${prueba.valorMinimo}`
  if (prueba.valorMaximo) return `≤ ${prueba.valorMaximo}`
  return ''
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos de navegación
const focusNextResult = async (currentIndex: number) => {
  await nextTick()
  
  const inputs = document.querySelectorAll('.tabla-moderna .resultado-input input')
  
  if (inputs && currentIndex + 1 < inputs.length) {
    const nextInput = inputs[currentIndex + 1] as HTMLInputElement
    if (nextInput && !nextInput.disabled) {
      nextInput.focus()
      nextInput.select()
    }
  }
}

// Métodos de validación individual
const validarResultadoRapido = (prueba: Prueba) => {
  const valor = getResultadoValue(prueba.id)
  
  if (!valor) {
    $q.notify({
      type: 'warning',
      message: 'Debe ingresar un resultado antes de validar',
      position: 'top-right',
      timeout: 2000
    })
    return
  }
  
  const estadoActual = estadosPruebas[prueba.id] || prueba.estado
  
  if (estadoActual !== 'cargado') {
    $q.notify({
      type: 'warning',
      message: 'Solo se pueden validar resultados en estado "Cargado"',
      position: 'top-right',
      timeout: 2000
    })
    return
  }
  
  // Primero procesar el resultado para asegurar que esté guardado
  procesarResultadoFinal(prueba.id)
  
  // Luego validar
  estadosPruebas[prueba.id] = 'validado'
  metadatosPruebas[prueba.id] = {
    ...metadatosPruebas[prueba.id],
    usuarioValido: 'Usuario Actual',
    fechaValidacion: new Date().toISOString()
  }
  
  const pruebaActualizada = pruebasAplanadas.value.find(p => p.id === prueba.id)
  if (pruebaActualizada) {
    emit('resultados-actualizados', [pruebaActualizada])
  }
  
  $q.notify({
    type: 'positive',
    message: `✅ ${prueba.nombre} validado correctamente`,
    position: 'top-right',
    timeout: 1500
  })
}

const validarResultado = (prueba: Prueba) => {
  const estadoActual = estadosPruebas[prueba.id] || prueba.estado
  
  if (estadoActual !== 'cargado') {
    $q.notify({
      type: 'warning',
      message: 'Solo se pueden validar resultados en estado "Cargado"',
      position: 'top-right',
      timeout: 2000
    })
    return
  }
  
  estadosPruebas[prueba.id] = 'validado'
  metadatosPruebas[prueba.id] = {
    ...metadatosPruebas[prueba.id],
    usuarioValido: 'Usuario Actual',
    fechaValidacion: new Date().toISOString()
  }
  
  const pruebaActualizada = pruebasAplanadas.value.find(p => p.id === prueba.id)
  if (pruebaActualizada) {
    emit('resultados-actualizados', [pruebaActualizada])
  }
  
  $q.notify({
    type: 'positive',
    message: `✅ ${prueba.nombre} validado correctamente`,
    position: 'top-right',
    timeout: 1500
  })
}

const desvalidarResultado = (prueba: Prueba) => {
  const estadoActual = estadosPruebas[prueba.id] || prueba.estado
  
  if (estadoActual !== 'validado') {
    $q.notify({
      type: 'warning',
      message: 'Solo se pueden desvalidar resultados que estén validados',
      position: 'top-right',
      timeout: 2000
    })
    return
  }
  
  estadosPruebas[prueba.id] = 'cargado'
  metadatosPruebas[prueba.id] = {
    ...metadatosPruebas[prueba.id],
    usuarioValido: undefined,
    fechaValidacion: undefined
  }
  
  const pruebaActualizada = pruebasAplanadas.value.find(p => p.id === prueba.id)
  if (pruebaActualizada) {
    emit('resultados-actualizados', [pruebaActualizada])
  }
  
  $q.notify({
    type: 'info',
    message: `↩️ ${prueba.nombre} desvalidado - vuelve a estado "Cargado"`,
    position: 'top-right',
    timeout: 1500
  })
}

// Métodos de validación masiva por diferentes niveles
const confirmarValidarTodo = () => {
  const pruebasParaValidar = pruebasAplanadas.value.filter(p => p.estado === 'cargado')
  
  if (pruebasParaValidar.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay resultados cargados para validar',
      position: 'top-right'
    })
    return
  }
  
  mostrarConfirmacion({
    titulo: 'Validar Todos los Resultados',
    mensaje: `¿Está seguro de que desea validar TODOS los resultados cargados?`,
    detalles: `Se validarán ${pruebasParaValidar.length} resultados de todos los sectores y estudios.`,
    icono: 'verified_user',
    color: 'positive',
    labelConfirmar: 'Validar Todo',
    accion: () => validarTodo()
  })
}

const confirmarValidarSector = (sector: SectorResumen) => {
  if (!sector.tieneResultadosParaValidar) {
    $q.notify({
      type: 'warning',
      message: `No hay resultados cargados en el sector ${sector.nombre}`,
      position: 'top-right'
    })
    return
  }
  
  mostrarConfirmacion({
    titulo: `Validar Sector: ${sector.nombre}`,
    mensaje: `¿Está seguro de que desea validar todos los resultados del sector ${sector.nombre}?`,
    detalles: `Se validarán ${sector.resultadosCargados} resultados cargados de este sector.`,
    icono: 'domain',
    color: 'info',
    labelConfirmar: 'Validar Sector',
    accion: () => validarSector(sector.id)
  })
}

const confirmarValidarEstudio = (estudio: EstudioResumen) => {
  if (!estudio.tieneResultadosParaValidar) {
    $q.notify({
      type: 'warning',
      message: `No hay resultados cargados en el estudio ${estudio.nombre}`,
      position: 'top-right'
    })
    return
  }
  
  mostrarConfirmacion({
    titulo: `Validar Estudio: ${estudio.nombre}`,
    mensaje: `¿Está seguro de que desea validar todos los resultados del estudio "${estudio.nombre}"?`,
    detalles: `Se validarán ${estudio.resultadosCargados} resultados cargados de este estudio (${estudio.sectorNombre}).`,
    icono: 'assignment',
    color: 'primary',
    labelConfirmar: 'Validar Estudio',
    accion: () => validarEstudio(estudio.id)
  })
}

// Métodos de validación masiva
const validarTodo = () => {
  const pruebasParaValidar = pruebasAplanadas.value.filter(p => p.estado === 'cargado')
  
  pruebasParaValidar.forEach(prueba => {
    estadosPruebas[prueba.id] = 'validado'
    metadatosPruebas[prueba.id] = {
      ...metadatosPruebas[prueba.id],
      usuarioValido: 'Usuario Actual',
      fechaValidacion: new Date().toISOString()
    }
  })
  
  const pruebasActualizadas = pruebasAplanadas.value.filter(p => 
    pruebasParaValidar.some(pp => pp.id === p.id)
  )
  emit('resultados-actualizados', pruebasActualizadas)
  
  $q.notify({
    type: 'positive',
    message: `✅ ${pruebasParaValidar.length} resultados validados correctamente`,
    position: 'top-right',
    timeout: 3000
  })
  
  cerrarDialogoConfirmacion()
}

const validarSector = (sectorId: string) => {
  const pruebasParaValidar = pruebasAplanadas.value.filter(p => 
    p.sectorId === sectorId && p.estado === 'cargado'
  )
  
  pruebasParaValidar.forEach(prueba => {
    estadosPruebas[prueba.id] = 'validado'
    metadatosPruebas[prueba.id] = {
      ...metadatosPruebas[prueba.id],
      usuarioValido: 'Usuario Actual',
      fechaValidacion: new Date().toISOString()
    }
  })
  
  const pruebasActualizadas = pruebasAplanadas.value.filter(p => 
    pruebasParaValidar.some(pp => pp.id === p.id)
  )
  emit('resultados-actualizados', pruebasActualizadas)
  
  const sector = sectoresConResultados.value.find(s => s.id === sectorId)
  $q.notify({
    type: 'positive',
    message: `✅ Sector ${sector?.nombre}: ${pruebasParaValidar.length} resultados validados`,
    position: 'top-right',
    timeout: 3000
  })
  
  cerrarDialogoConfirmacion()
}

const validarEstudio = (estudioId: string) => {
  const pruebasParaValidar = pruebasAplanadas.value.filter(p => 
    p.estudioId === estudioId && p.estado === 'cargado'
  )
  
  pruebasParaValidar.forEach(prueba => {
    estadosPruebas[prueba.id] = 'validado'
    metadatosPruebas[prueba.id] = {
      ...metadatosPruebas[prueba.id],
      usuarioValido: 'Usuario Actual',
      fechaValidacion: new Date().toISOString()
    }
  })
  
  const pruebasActualizadas = pruebasAplanadas.value.filter(p => 
    pruebasParaValidar.some(pp => pp.id === p.id)
  )
  emit('resultados-actualizados', pruebasActualizadas)
  
  const estudio = estudiosConResultados.value.find(e => e.id === estudioId)
  $q.notify({
    type: 'positive',
    message: `✅ Estudio ${estudio?.nombre}: ${pruebasParaValidar.length} resultados validados`,
    position: 'top-right',
    timeout: 3000
  })
  
  cerrarDialogoConfirmacion()
}

// Métodos de validación masiva con selección múltiple
const toggleModoValidacionMasiva = () => {
  modoValidacionMasiva.value = !modoValidacionMasiva.value
  if (!modoValidacionMasiva.value) {
    pruebasSeleccionadas.value = []
  }
}

const toggleSelection = (prueba: Prueba) => {
  if (prueba.estado === 'pendiente') return
  
  const index = pruebasSeleccionadas.value.findIndex(p => p.id === prueba.id)
  if (index > -1) {
    pruebasSeleccionadas.value.splice(index, 1)
  } else {
    pruebasSeleccionadas.value.push(prueba)
  }
}

const validarSeleccionados = () => {
  const pruebasAValidar = pruebasSeleccionadas.value.filter(p => p.estado === 'cargado')
  
  pruebasAValidar.forEach(prueba => {
    estadosPruebas[prueba.id] = 'validado'
    metadatosPruebas[prueba.id] = {
      ...metadatosPruebas[prueba.id],
      usuarioValido: 'Usuario Actual',
      fechaValidacion: new Date().toISOString()
    }
  })
  
  const pruebasActualizadas = pruebasAplanadas.value.filter(p => 
    pruebasAValidar.some(pp => pp.id === p.id)
  )
  emit('resultados-actualizados', pruebasActualizadas)
  pruebasSeleccionadas.value = []
  
  $q.notify({
    type: 'positive',
    message: `${pruebasAValidar.length} resultados validados`,
    position: 'top-right'
  })
}

const desvalidarSeleccionados = () => {
  const pruebasADesvalidar = pruebasSeleccionadas.value.filter(p => p.estado === 'validado')
  
  pruebasADesvalidar.forEach(prueba => {
    estadosPruebas[prueba.id] = 'cargado'
    metadatosPruebas[prueba.id] = {
      ...metadatosPruebas[prueba.id],
      usuarioValido: undefined,
      fechaValidacion: undefined
    }
  })
  
  const pruebasActualizadas = pruebasAplanadas.value.filter(p => 
    pruebasADesvalidar.some(pp => pp.id === p.id)
  )
  emit('resultados-actualizados', pruebasActualizadas)
  pruebasSeleccionadas.value = []
  
  $q.notify({
    type: 'info',
    message: `${pruebasADesvalidar.length} resultados desvalidados`,
    position: 'top-right'
  })
}

// Métodos auxiliares para diálogos
const mostrarConfirmacion = (config: DialogoConfirmacion) => {
  dialogoConfirmacion.value = config
  mostrarDialogoConfirmacion.value = true
}

const cerrarDialogoConfirmacion = () => {
  mostrarDialogoConfirmacion.value = false
}

const ejecutarAccionConfirmada = () => {
  dialogoConfirmacion.value.accion()
}

// Métodos auxiliares
const filtrarPruebas = (rows: Prueba[], terms: string) => {
  if (!terms) return rows
  
  const terminos = terms.toLowerCase().split(' ')
  return rows.filter(row => 
    terminos.every(termino => 
      row.nombre.toLowerCase().includes(termino) ||
      row.estudioNombre.toLowerCase().includes(termino) ||
      row.sectorNombre.toLowerCase().includes(termino) ||
      row.codigo.toLowerCase().includes(termino)
    )
  )
}

const getSelectedString = () => {
  return pruebasSeleccionadas.value.length === 0 
    ? '' 
    : `${pruebasSeleccionadas.value.length} de ${pruebasAplanadas.value.length} seleccionados`
}

const mostrarHistorial = (prueba: Prueba) => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de historial en desarrollo',
    position: 'top-right'
  })
}
</script>

<style scoped>
/* Contenedor principal */
.resultados-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 16px 0;
}

/* Header */
.resultados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.search-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.search-input :deep(.q-field__native) {
  color: white;
}

.search-input :deep(.q-field__native)::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

/* Validación masiva */
.validacion-masiva-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-validacion-masiva {
  font-weight: 600;
  border-radius: 6px;
  text-transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.btn-validacion-masiva:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.sector-indicator-dropdown {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Tabla */
.tabla-wrapper {
  background: white;
  min-height: 400px;
}

.tabla-moderna {
  background: white;
}

.tabla-moderna :deep(.q-table__top) {
  display: none;
}

.tabla-moderna :deep(.q-table thead) {
  background: #f8fafc;
}

.tabla-moderna :deep(.q-table thead th) {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
}

.tabla-moderna :deep(.q-table thead th:last-child) {
  border-right: none;
}

.tabla-moderna :deep(.q-table tbody td) {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f8fafc;
  vertical-align: middle;
  font-size: 13px;
}

.tabla-moderna :deep(.q-table tbody td:last-child) {
  border-right: none;
}

.tabla-row {
  transition: all 0.2s ease;
}

.tabla-row:hover {
  background-color: #f8fafc !important;
}

.tabla-row.row-selectable {
  cursor: pointer;
}

.tabla-row.estado-validado {
  background-color: #f0fdf4;
  border-left: 3px solid #22c55e;
}

.tabla-row.estado-cargado {
  background-color: #fffbeb;
  border-left: 3px solid #f59e0b;
}

.tabla-row.estado-pendiente {
  background-color: #f9fafb;
  border-left: 3px solid #9ca3af;
}

.tabla-row.fuera-rango {
  background-color: #fef2f2;
  border-left: 3px solid #ef4444;
}

.sector-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sector-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sector-name {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.sector-id {
  font-size: 10px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

.estudio-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.estudio-nombre {
  font-weight: 500;
  color: #374151;
  font-size: 13px;
  line-height: 1.3;
}

.estudio-codigo {
  font-size: 10px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

.prueba-nombre {
  font-weight: 500;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
}

.rango-info {
  text-align: center;
}

.rango-valores {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #374151;
  font-weight: 600;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.no-rango {
  color: #9ca3af;
  font-size: 12px;
}

.unidad-info {
  text-align: center;
}

.unidad-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #374151;
  font-weight: 600;
  background: #e0f2fe;
  padding: 4px 8px;
  border-radius: 4px;
}

.no-unidad {
  color: #9ca3af;
  font-size: 12px;
}

.resultado-cell {
  width: 140px;
}

.resultado-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.resultado-input {
  flex: 1;
}

.resultado-input :deep(.q-field__control) {
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 36px;
}

.resultado-input :deep(.q-field__native) {
  text-align: center;
  padding: 8px 12px;
}

.resultado-input-modern.input-validado :deep(.q-field__control) {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #15803d;
}

.resultado-input-modern.input-cargado :deep(.q-field__control) {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #d97706;
}

.resultado-input-modern.input-error :deep(.q-field__control) {
  background: #fef2f2;
  border-color: #ef4444;
}

.resultado-input-modern.input-error :deep(.q-field__native) {
  color: #dc2626;
}

.resultado-input:focus-within :deep(.q-field__control) {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.validacion-rapida {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resultado-container:hover .validacion-rapida {
  opacity: 1;
}

.estado-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.usuario-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.usuario-nombre {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.fecha-accion {
  font-size: 10px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}

.acciones-cell {
  width: 120px;
  text-align: center;
}

.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  color: #9ca3af;
}

.no-data-text {
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
  color: #6b7280;
}

.no-data-subtitle {
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  color: #9ca3af;
}

.tabla-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.estadisticas {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.progreso-validacion {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 140px;
}

.progreso-texto {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  margin-top: 4px;
}

.tabla-moderna :deep(.q-table tbody tr.selected) {
  background-color: rgba(59, 130, 246, 0.08) !important;
  border-left: 4px solid #3b82f6 !important;
}

/* Responsive */
@media (max-width: 1400px) {
  .validacion-masiva-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .btn-validacion-masiva {
    font-size: 11px;
    padding: 6px 12px;
  }
}

@media (max-width: 1200px) {
  .resultados-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
    max-width: 280px;
  }
  
  .validacion-masiva-actions {
    justify-content: center;
    order: 1;
  }
}

@media (max-width: 768px) {
  .resultados-container {
    border-radius: 0;
    margin: 0 -16px;
  }
  
  .resultados-header {
    padding: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .validacion-masiva-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn-validacion-masiva {
    flex: 1;
    max-width: 120px;
    font-size: 10px;
  }
  
  .tabla-moderna :deep(.q-table thead th),
  .tabla-moderna :deep(.q-table tbody td) {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .tabla-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .estadisticas {
    justify-content: center;
  }
  
  .progreso-validacion {
    align-items: center;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tabla-row {
  animation: fadeIn 0.3s ease;
}

.q-tooltip {
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tabla-moderna :deep(.q-btn:hover) {
  transform: scale(1.05);
  transition: transform 0.1s ease;
}

.resultado-input :deep(.q-field__messages) {
  font-size: 10px;
  min-height: 14px;
  padding-top: 2px;
}

/* Print styles */
@media print {
  .resultados-header,
  .tabla-footer,
  .acciones-cell,
  .validacion-rapida {
    display: none !important;
  }
  
  .resultados-container {
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }
}
</style>