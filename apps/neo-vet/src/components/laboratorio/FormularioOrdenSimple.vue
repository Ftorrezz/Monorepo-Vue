<template>
  <q-card style="min-width: 1000px; max-width: 1500px; width: 95vw" class="shadow-2">
    <q-card-section class="row items-center">
      <div class="text-h6">Nueva Orden de Laboratorio</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator />

    <!-- MODAL: Búsqueda de Mascota -->
    <q-dialog v-model="mostrarBusquedaMascota" full-width>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white q-pb-none">
          <div class="text-h6">Buscar Mascota</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="formBusquedaMascota.propietario.nombre"
                label="Nombre Propietario"
                dense outlined
                @keyup.enter="buscarMascotas"
                class="uppercase"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="formBusquedaMascota.propietario.primerapellido"
                label="Apellido Propietario"
                dense outlined
                @keyup.enter="buscarMascotas"
                class="uppercase"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="formBusquedaMascota.mascota.nombre"
                label="Nombre Mascota"
                dense outlined
                @keyup.enter="buscarMascotas"
              />
            </div>
            <div class="col-12 col-md-3 flex items-center">
              <q-btn color="primary" icon="search" label="Buscar" @click="buscarMascotas" class="full-width" />
            </div>
          </div>
          <div v-if="mascotasEncontradas.length > 0" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Resultados encontrados:</div>
            <q-item
              v-for="mascota in mascotasEncontradas"
              :key="mascota.id"
              clickable
              v-ripple
              @click="seleccionarMascota(mascota)"
              class="bg-blue-1 q-mb-xs rounded-borders"
            >
              <q-item-section avatar>
                <q-icon name="pets" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label><strong>{{ mascota.nombre }}</strong></q-item-label>
                <q-item-label caption>
                  {{ mascota.especie }} • {{ mascota.raza }} • {{ mascota.edad || 'edad desconocida' }}
                  <span v-if="mascota.propietario"> • {{ mascota.propietario.nombre }}</span>
                  <span v-else class="text-orange-7"> • Sin propietario</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL: SelectorEstudios -->
    <q-dialog v-model="mostrarSelector" maximized>
      <SelectorEstudios
        @estudios-seleccionados="estudiosSeleccionadosDelModal"
        @cancelar="mostrarSelector = false"
      />
    </q-dialog>

    <q-card-section class="q-pa-md" style="overflow-y: auto; max-height: calc(100vh - 180px)">
      <!-- SECCIÓN 1: DATOS DEL PACIENTE (MASCOTA/PROPIETARIO) -->
      <div class="text-subtitle2 q-mb-md text-weight-bold">📋 Datos del Paciente</div>

      <div class="row q-col-gutter-sm q-mb-md">
        <!-- Búsqueda y datos del paciente en primera fila -->
        <div class="col-12 col-lg-3">
          <q-btn
            color="primary"
            icon="pets"
            label="Buscar Paciente"
            @click="mostrarBusquedaMascota = true"
            outlined
            class="full-width"
          />
          <div class="text-caption text-grey-6 q-mt-xs">
            Buscar mascota existente
          </div>
        </div>

        <div class="col-12 col-lg-3">
          <q-input
            v-model="orden.paciente"
            label="Nombre Paciente *"
            outlined
            dense
            :rules="[val => !!val || 'Requerido']"
            hint="Se llena al buscar"
          />
        </div>

        <!-- Datos del paciente (informativos, de lectura) -->
        <div class="col-12 col-lg-2">
          <q-input
            v-model="datos_paciente.especie"
            label="Especie"
            outlined
            dense
            readonly
          />
          <div class="text-caption text-grey-6">Dato del paciente</div>
        </div>

        <div class="col-12 col-lg-2">
          <q-input
            v-model.number="datos_paciente.edad"
            label="Edad"
            outlined
            dense
            readonly
            type="number"
          />
          <div class="text-caption text-grey-6">Dato del paciente</div>
        </div>

        <div class="col-12 col-lg-2">
          <q-input
            v-model="datos_paciente.sexo"
            label="Sexo"
            outlined
            dense
            readonly
          />
          <div class="text-caption text-grey-6">Dato del paciente</div>
        </div>

        <!-- Profesional Solicitante (opcional) + Centro -->
        <div class="col-12 col-lg-4">
          <q-select
            v-model="orden.profesionalSolicitante"
            :options="profesionalesOpciones"
            option-label="label"
            option-value="value"
            label="Profesional Solicitante"
            outlined
            dense
            clearable
            :loading="cargandoProfesionales"
          >
            <template v-slot:prepend>
              <q-icon name="medical_services" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-lg-3">
          <q-select
            v-model="orden.centroVeterinario"
            :options="centrosDisponibles"
            label="Centro Veterinario"
            outlined
            dense
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="local_hospital" />
            </template>
          </q-select>
        </div>

        <!-- ID Externo -->
        <div class="col-12 col-lg-3">
          <q-input
            v-model="orden.idExterno"
            label="ID Externo"
            outlined
            dense
            hint="Ref. sistema externo"
          />
        </div>

        <!-- Diagnóstico de Catálogo -->
        <div class="col-12 col-lg-5">
          <q-select
            v-model="orden.diagnosticoCatalogo"
            :options="diagnosticosDisponibles"
            option-label="label"
            option-value="value"
            label="Diagnóstico Presuntivo"
            outlined
            dense
            clearable
            filterable
          >
            <template v-slot:prepend>
              <q-icon name="assessment" />
            </template>
          </q-select>
        </div>

        <!-- Modo de Reporte de Resultado -->
        <div class="col-12 col-lg-4">
          <q-select
            v-model="orden.modoReporte"
            :options="[
              { label: 'Email', value: 'email' },
              { label: 'Teléfono', value: 'telefono' },
              { label: 'Presencial', value: 'presencial' },
              { label: 'WhatsApp', value: 'whatsapp' }
            ]"
            option-label="label"
            option-value="value"
            label="Reporter resultado"
            outlined
            dense
          />
        </div>

        <!-- Urgencia en tercera fila -->
        <div class="col-auto">
          <q-checkbox
            v-model="orden.esUrgente"
            label="⚠️ URGENTE"
            color="negative"
          />
        </div>
      </div>

      <!-- Observación de Diagnóstico en su propia sección -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12">
          <q-input
            v-model="orden.diagnosticoObservacion"
            label="Observación / Detalles del Diagnóstico"
            outlined
            dense
            type="textarea"
            rows="2"
            hint="Detalles adicionales del diagnóstico"
          />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- SECCIÓN 2: AGREGAR ESTUDIOS -->
      <div class="text-subtitle2 q-mb-md text-weight-bold">🧪 Estudios</div>

      <div class="row q-col-gutter-sm q-mb-md">
        <!-- Búsqueda rápida por código -->
        <div class="col-12 col-lg-8">
          <q-input
            v-model="busquedaEstudio"
            label="Buscar por código o nombre"
            outlined
            dense
            clearable
            @keyup.enter="buscarYAgregar"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="busquedaEstudio">
              <q-btn
                flat
                dense
                round
                icon="add_circle"
                color="primary"
                @click="buscarYAgregar"
              />
            </template>
          </q-input>
        </div>

        <!-- Selector visual -->
        <div class="col-12 col-lg-4">
          <q-btn
            color="primary"
            label="Catálogo..."
            icon="view_agenda"
            @click="mostrarSelector = true"
            class="full-width"
          />
        </div>
      </div>

      <!-- Estudios sugeridos o agrupados por categoría -->
      <div v-if="estudiosPorCategoria.length > 0 && orden.estudios.length === 0" class="q-mb-md">
        <div class="text-caption text-weight-bold text-grey-7 q-mb-sm">📌 Estudios más usados:</div>
        <div class="row q-col-gutter-sm">
          <div v-for="categoria in estudiosPorCategoria.slice(0, 5)" :key="categoria.codigo" class="col-auto">
            <q-btn
              flat
              outline
              size="sm"
              :label="`${categoria.codigo} (${categoria.tipoMuestra})`"
              @click="agregarEstudio(categoria)"
              color="primary"
            />
          </div>
        </div>
      </div>

      <!-- TABLA DE ESTUDIOS AGREGADOS -->
      <div v-if="orden.estudios.length > 0" class="q-mb-md">
        <div class="text-subtitle3 q-mb-sm text-weight-bold">
          ✓ {{ orden.estudios.length }} estudio{{ orden.estudios.length > 1 ? 's' : '' }} agregado{{ orden.estudios.length > 1 ? 's' : '' }}
        </div>

        <q-table
          :rows="orden.estudios"
          :columns="columnasTabla"
          row-key="codigo"
          flat
          bordered
          dense
          separator="cell"
        >
          <template v-slot:body-cell-muestra="props">
            <q-td>
              <q-chip
                size="sm"
                dense
                :label="props.row.muestra?.numeroMuestra || 'N/A'"
                color="blue"
                text-color="white"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td>
              <q-chip
                size="sm"
                dense
                :label="props.row.tipoMuestra"
                color="teal"
                text-color="white"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td align="center">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete"
                color="negative"
                @click="removerEstudio(props.rowIndex)"
              />
            </q-td>
          </template>
        </q-table>
      </div>

      <div v-else class="text-center q-pa-md text-grey-7">
        <q-icon name="info" size="48px" class="q-mb-md" />
        <div>Agrega al menos un estudio</div>
      </div>

      <!-- RESUMEN DE MUESTRAS -->
      <div v-if="orden.estudios.length > 0" class="q-mt-md q-pa-md bg-blue-1 rounded-borders">
        <div class="text-subtitle3 text-weight-bold q-mb-sm">📦 Muestras que se generarán:</div>
        <div v-for="muestra in muestrasUnicas" :key="muestra.tipoMuestra" class="q-mb-sm">
          <q-icon name="local_shipping" size="xs" />
          <strong>{{ muestra.tipoMuestra.toUpperCase() }}:</strong>
          {{ muestra.numeroMuestra }}
          <span class="text-caption text-grey-7">({{ obtenerEstudiosPorTipo(muestra.tipoMuestra).length }} estudio{{ obtenerEstudiosPorTipo(muestra.tipoMuestra).length > 1 ? 's' : '' }})</span>
        </div>
      </div>
    </q-card-section>

    <!-- MODAL: Selector de Estudios -->
    <q-dialog v-model="mostrarSelector" maximized>
      <SelectorEstudios
        @estudios-seleccionados="estudiosSeleccionadosDelModal"
        @cancelar="mostrarSelector = false"
      />
    </q-dialog>

    <q-separator />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn flat label="Cancelar" color="secondary" v-close-popup />
      <q-btn
        color="primary"
        label="Crear Orden"
        icon="check"
        :disable="!puedeGuardar"
        @click="guardarOrden"
        :loading="guardando"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { OrdenLaboratorio, Estudio, TipoMuestra, EstadoOrden, EstadoResultado } from '../../types/laboratorio'
import GeneradorMuestrasService from '../../services/generadorMuestras.service'
import SelectorEstudios from './SelectorEstudios.vue'
import NdPeticionControl from '../../controles/rest.control'
import { DtoParametros } from '../../controles/dto.parametros'

const $q = useQuasar()

const emit = defineEmits<{
  (e: 'cancelar'): void
  (e: 'guardar', orden: OrdenLaboratorio): void
}>()

const guardando = ref(false)
const cargandoProfesionales = ref(false)
const nuevoEstudio = ref<any>(null)
const busquedaEstudio = ref('')
const mostrarSelector = ref(false)
const mostrarBusquedaMascota = ref(false)
const mascotasEncontradas = ref<any[]>([])

// Datos del paciente encontrado (read-only en la forma)
const datos_paciente = ref({
  especie: '',
  edad: undefined as number | undefined,
  sexo: '',
  raza: ''
})

// Form para búsqueda (similar a AtencionPaciente.vue)
const formBusquedaMascota = ref({
  propietario: { nombre: '', primerapellido: '' },
  mascota: { nombre: '' }
})

const orden = ref<OrdenLaboratorio>({
  numeroOrden: `ORD${Date.now().toString().slice(-6)}`,
  paciente: '',
  profesionalSolicitante: '',
  diagnostico: '',
  diagnosticoCatalogo: '',
  diagnosticoObservacion: '',
  centroVeterinario: '',
  idExterno: '',
  modoReporte: '',
  esUrgente: false,
  estado: EstadoOrden.BORRADOR,
  estudios: [],
  muestras: [],
  fechaCreacion: new Date().toISOString()
} as any)

const profesionalesDisponibles = ref<any[]>([])
const centrosDisponibles = ref([
  { label: 'Clínica', value: 'clinica' },
  { label: 'Hospital Veterinario', value: 'hospital' },
  { label: 'Consultorio', value: 'consultorio' },
  { label: 'Refugio', value: 'refugio' }
])
const cargandoInicial = ref(true)

const especies = ref(['Canino', 'Felino', 'Equino', 'Bovino', 'Ovino', 'Porcino', 'Ave'])

// Catálogos de diagnósticos (ejemplos - en producción vendrían de un servicio)
const diagnosticosDisponibles = ref([
  { label: 'Anemia', value: 'anemia' },
  { label: 'Diarrea', value: 'diarrea' },
  { label: 'Infección urinaria', value: 'infeccion_urinaria' },
  { label: 'Enfermedad renal crónica', value: 'erc' },
  { label: 'Diabetes', value: 'diabetes' },
  { label: 'Gastroenteritis', value: 'gastroenteritis' },
  { label: 'Pancreatitis', value: 'pancreatitis' },
  { label: 'Hepatitis', value: 'hepatitis' },
  { label: 'Hipotiroidismo', value: 'hipotiroidismo' },
  { label: 'Control rutina', value: 'control_rutina' }
])

// Base de estudios más completa
const estudiosDisponibles = ref<Estudio[]>([
  // SANGRE
  { codigo: 'GLU', nombre: 'Glucosa', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'CRTNN', nombre: 'Creatinina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'URE', nombre: 'Urea', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'ALB', nombre: 'Albúmina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'PROT', nombre: 'Proteína Total', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'ALAT', nombre: 'ALAT', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'ASAT', nombre: 'ASAT', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'FAL', nombre: 'Fosfatasa Alcalina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'HEM', nombre: 'Hemograma', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'TP', nombre: 'Tiempo de Protrombina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  // ORINA
  { codigo: 'EO', nombre: 'Examen de Orina', tipoMuestra: 'orina' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'UC', nombre: 'Urocultivo', tipoMuestra: 'orina' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  // HECES
  { codigo: 'EH', nombre: 'Examen de Heces', tipoMuestra: 'heces' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'COP', nombre: 'Coprocultivo', tipoMuestra: 'heces' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  // OTROS
  { codigo: 'CULT', nombre: 'Cultivo General', tipoMuestra: 'fluido' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
])

const columnasTabla = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipoMuestra', align: 'center' as const },
  { name: 'muestra', label: 'Número de Muestra', field: (row: any) => row.muestra?.numeroMuestra, align: 'left' as const },
  { name: 'acciones', label: 'Acción', field: 'acciones', align: 'center' as const }
]

// Computed para opciones de profesionales
const profesionalesOpciones = computed(() => {
  return profesionalesDisponibles.value.map(p => ({
    label: p.nombre_completo || `${p.nombre || ''} ${p.primerapellido || ''}`.trim() || 'Sin nombre',
    value: p.id,
    cedula: p.cedula || null,
    especialidad: p.especialidad || null
  }))
})

// Estudios agrupados por categoría para sugerencias
const estudiosPorCategoria = computed(() => {
  return estudiosDisponibles.value.filter(
    e => !orden.value.estudios.some((o: any) => o.codigo === e.codigo)
  )
})

// Buscar mascotas según criterios del formulario
const buscarMascotas = async () => {
  const form = formBusquedaMascota.value
  const tieneAlgunFiltro = form.propietario.nombre || form.propietario.primerapellido || form.mascota.nombre

  if (!tieneAlgunFiltro) {
    mascotasEncontradas.value = []
    return
  }

  try {
    const peticion = new NdPeticionControl()
    const params = new DtoParametros()
    params.filtro = {
      id_sitio: 1,
      nombre: form.propietario.nombre,
      primerapellido: form.propietario.primerapellido,
      nombre_mascota: form.mascota.nombre
    }

    const respuesta = await peticion.invocarMetodo('filtropropietariomascota/filtro', 'post', params)
    mascotasEncontradas.value = respuesta || []
  } catch (error) {
    console.error('Error al buscar mascotas:', error)
    mascotasEncontradas.value = []
    $q.notify({
      type: 'warning',
      message: 'Error al buscar mascotas',
      position: 'top'
    })
  }
}

// Seleccionar una mascota de los resultados
const seleccionarMascota = (mascota: any) => {
  // Llenar datos del paciente (son read-only en el form)
  orden.value.paciente = mascota.nombre || ''
  datos_paciente.value.especie = mascota.especie || ''
  datos_paciente.value.raza = mascota.raza || ''
  datos_paciente.value.edad = mascota.edad || undefined
  datos_paciente.value.sexo = mascota.sexo || ''

  // Limpiar búsqueda y cerrar modal
  formBusquedaMascota.value = {
    propietario: { nombre: '', primerapellido: '' },
    mascota: { nombre: '' }
  }
  mascotasEncontradas.value = []
  mostrarBusquedaMascota.value = false

  $q.notify({
    type: 'positive',
    message: `✓ Mascota "${mascota.nombre}" seleccionada`,
    position: 'top'
  })
}

// Cargar profesionales desde el catálogo
const cargarProfesionales = async () => {
  try {
    cargandoProfesionales.value = true
    const peticion = new NdPeticionControl()
    const respuesta = await peticion.invocarMetodo('profesionales', 'get', null)

    if (Array.isArray(respuesta)) {
      profesionalesDisponibles.value = respuesta
    } else if (respuesta?.data && Array.isArray(respuesta.data)) {
      profesionalesDisponibles.value = respuesta.data
    } else {
      profesionalesDisponibles.value = []
    }
  } catch (error) {
    console.error('Error al cargar profesionales:', error)
    // Usar datos por defecto si falla
    profesionalesDisponibles.value = [
      { id: 1, nombre_completo: 'Dr. Juan Pérez', nombre: 'Juan', primerapellido: 'Pérez' },
      { id: 2, nombre_completo: 'Dra. María García', nombre: 'María', primerapellido: 'García' },
      { id: 3, nombre_completo: 'Dr. Carlos López', nombre: 'Carlos', primerapellido: 'López' }
    ]
  } finally {
    cargandoProfesionales.value = false
  }
}

// Búsqueda rápida: filtrar por código o nombre
const buscarYAgregar = () => {
  const termino = busquedaEstudio.value.toLowerCase().trim()
  if (!termino) return

  const encontrado = estudiosDisponibles.value.find(
    e => e.codigo.toLowerCase() === termino ||
         e.nombre.toLowerCase().includes(termino)
  )

  if (encontrado) {
    agregarEstudio(encontrado)
    busquedaEstudio.value = ''
  } else {
    $q.notify({
      type: 'warning',
      message: `No encontrado: ${termino}`,
      position: 'top'
    })
  }
}

const agregarEstudio = (estudio: Estudio) => {
  // Verificar duplicado
  if (orden.value.estudios.some((e: any) => e.codigo === estudio.codigo)) {
    $q.notify({
      type: 'warning',
      message: 'Este estudio ya está agregado',
      position: 'top'
    })
    return
  }

  // Generar número de muestra
  const numeroMuestra = GeneradorMuestrasService.generarNumeroMuestra(
    orden.value.numeroOrden,
    estudio.tipoMuestra as TipoMuestra
  )

  const muestra = {
    numeroMuestra: numeroMuestra.numeroMuestra,
    tipoMuestra: estudio.tipoMuestra,
    descripcion: `Muestra para ${estudio.nombre}`,
    estado: 'recepcionada' as const,
    fechaGeneracion: new Date().toISOString()
  }

  const nuevoEst: Estudio = {
    ...estudio,
    estado: EstadoResultado.PENDIENTE,
    muestra
  }

  orden.value.estudios.push(nuevoEst)
  orden.value.muestras.push(muestra)

  nuevoEstudio.value = null

  $q.notify({
    type: 'positive',
    message: `✓ ${estudio.nombre} agregado`,
    position: 'top'
  })
}

// Procesa los estudios seleccionados desde el SelectorEstudios modal
const estudiosSeleccionadosDelModal = (ejemplosSeleccionados: any[]) => {
  if (!ejemplosSeleccionados || ejemplosSeleccionados.length === 0) return

  let agregados = 0
  ejemplosSeleccionados.forEach(estudioDelSelector => {
    const estudioMapeado: Estudio = {
      codigo: estudioDelSelector.codigo,
      nombre: estudioDelSelector.nombre,
      tipoMuestra: (estudioDelSelector.tipoMuestra || 'sangre') as TipoMuestra,
      id: estudioDelSelector.id,
      prioridad: 'normal',
      estado: EstadoResultado.PENDIENTE,
      descripcion: estudioDelSelector.descripcion
    }

    if (!orden.value.estudios.some((e: any) => e.codigo === estudioMapeado.codigo)) {
      agregarEstudio(estudioMapeado)
      agregados++
    }
  })

  mostrarSelector.value = false

  $q.notify({
    type: 'positive',
    message: `✓ ${agregados} estudio${agregados > 1 ? 's' : ''} agregado${agregados > 1 ? 's' : ''}`,
    position: 'top'
  })
}

const removerEstudio = (index: number) => {
  const estudio = orden.value.estudios[index]
  orden.value.estudios.splice(index, 1)
  orden.value.muestras = orden.value.muestras.filter((m: any) => m.numeroMuestra !== estudio.muestra?.numeroMuestra)

  $q.notify({
    type: 'info',
    message: `✗ ${estudio.nombre} removido`,
    position: 'top'
  })
}

const muestrasUnicas = computed(() => {
  const map = new Map()
  orden.value.estudios.forEach((estudio: any) => {
    if (estudio.muestra && !map.has(estudio.muestra.tipoMuestra)) {
      map.set(estudio.muestra.tipoMuestra, estudio.muestra)
    }
  })
  return Array.from(map.values())
})

const obtenerEstudiosPorTipo = (tipo: string) => {
  return orden.value.estudios.filter((e: any) => e.tipoMuestra === tipo)
}

const puedeGuardar = computed(() => {
  return (
    !!orden.value.paciente &&
    // Profesional es opcional, pero se requiere al menos profesional O centroVeterinario
    (!!orden.value.profesionalSolicitante || !!orden.value.centroVeterinario) &&
    orden.value.estudios.length > 0
  )
})

const guardarOrden = async () => {
  if (!puedeGuardar.value) return

  guardando.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('guardar', orden.value)

    $q.notify({
      type: 'positive',
      message: `✓ Orden ${orden.value.numeroOrden} creada exitosamente`,
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al crear la orden',
      position: 'top'
    })
  } finally {
    guardando.value = false
  }
}

// Cargar datos iniciales
onMounted(() => {
  cargarProfesionales()
})
</script>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 4px;
}
</style>
