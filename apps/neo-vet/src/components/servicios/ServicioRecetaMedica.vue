<template>
  <q-card class="servicio-card border-left-recipe">

    <!-- ══ HEADER ══════════════════════════════════════════════ -->
    <q-card-section class="bg-purple-1">
      <div class="row items-center">
        <q-icon name="pets" color="secondary" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6 text-secondary">Receta Veterinaria Cuantificada</div>
          <div class="text-caption text-grey-7">Prescripción controlada de medicamentos</div>
        </div>
        <q-btn v-if="modoLectura && !modoEdicionManual"
          flat dense round color="secondary" icon="edit" size="sm"
          class="q-mr-sm" @click="modoEdicionManual = true">
          <q-tooltip>Habilitar Edición</q-tooltip>
        </q-btn>
        <q-btn v-if="modoEdicionManual"
          flat dense round color="grey-7" icon="close" size="sm"
          class="q-mr-sm" @click="cancelarEdicion">
          <q-tooltip>Cancelar Edición</q-tooltip>
        </q-btn>
        <q-btn-dropdown flat round icon="more_vert">
          <q-list>
            <q-item clickable @click="imprimirReceta('especial')">
              <q-item-section avatar><q-icon name="print" color="primary"/></q-item-section>
              <q-item-section>Imprimir Receta</q-item-section>
            </q-item>
            <q-item clickable @click="firmarReceta('especial')">
              <q-item-section avatar><q-icon name="history_edu" color="orange-8"/></q-item-section>
              <q-item-section>Visualizar y Firmar</q-item-section>
            </q-item>
            <q-item v-if="plantillasServicio?.length" clickable>
              <q-item-section avatar><q-icon name="description" color="secondary"/></q-item-section>
              <q-item-section>Otras Plantillas</q-item-section>
              <q-item-section side><q-icon name="chevron_right"/></q-item-section>
              <q-menu anchor="top end" self="top start">
                <q-list style="min-width:200px">
                  <q-item v-for="p in plantillasServicio" :key="p.id_plantilla"
                    clickable v-close-popup>
                    <q-item-section avatar><q-icon name="description" color="secondary" size="xs"/></q-item-section>
                    <q-item-section>{{ p.nombre_plantilla || 'Plantilla ' + p.id_plantilla }}</q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-xs">
                        <q-btn flat round dense icon="print" size="xs" color="grey-7" @click.stop="imprimirReceta('plantilla', p.id_plantilla)" />
                        <q-btn flat round dense icon="history_edu" size="xs" color="orange-8" @click.stop="firmarReceta('plantilla', p.id_plantilla)" />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-separator/>
            <q-item clickable :disable="!formularioValido" @click="completarReceta">
              <q-item-section avatar><q-icon name="check_circle" color="positive"/></q-item-section>
              <q-item-section>Finalizar Receta</q-item-section>
            </q-item>
            <q-item clickable @click="eliminarServicio">
              <q-item-section avatar><q-icon name="delete" color="negative"/></q-item-section>
              <q-item-section>Eliminar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>

    <!-- ══ DATOS DEL PACIENTE ═══════════════════════════════════ -->
    <q-card-section>
      <div class="seccion-titulo">
        <q-icon name="cruelty_free" class="q-mr-xs"/>Datos del Paciente
      </div>
      <div class="row q-col-gutter-md">

        <div class="col-12 col-sm-4">
          <q-select
            v-model="datosReceta.especie"
            :options="especiesOpciones"
            label="Especie *"
            outlined dense emit-value map-options
            :readonly="readonly"
            :rules="[v => !!v || 'Requerido']"
            @update:model-value="datosReceta.raza = ''"
          >
            <template #prepend><q-icon name="pets" color="secondary"/></template>
          </q-select>
        </div>

        <div class="col-12 col-sm-4">
          <q-input
            v-model="datosReceta.raza"
            label="Raza"
            outlined dense :readonly="readonly"
            placeholder="Ej. Labrador, Siamés..."
          />
        </div>

        <div class="col-12 col-sm-4">
          <q-input
            v-model.number="datosReceta.edad"
            label="Edad"
            outlined dense :readonly="readonly"
            placeholder="Ej. 3 años, 6 meses..."
          >
            <template #prepend><q-icon name="cake" color="secondary"/></template>
          </q-input>
        </div>

        <div class="col-12 col-sm-4">
          <q-input
            v-model.number="datosReceta.peso_kg"
            label="Peso (kg) *"
            type="number" min="0" step="0.1"
            outlined dense :readonly="readonly"
            :rules="[v => (v > 0) || 'Ingresa el peso']"
            @update:model-value="recalcularDosisTodos"
          >
            <template #prepend><q-icon name="monitor_weight" color="secondary"/></template>
            <template #append><span class="text-caption text-grey-6">kg</span></template>
          </q-input>
        </div>

        <div class="col-12 col-sm-8">
          <q-input
            v-model="datosReceta.nombre_propietario"
            label="Nombre del propietario *"
            outlined dense :readonly="readonly"
            placeholder="Nombre completo del dueño..."
            :rules="[v => !!v || 'Requerido']"
          >
            <template #prepend><q-icon name="person" color="secondary"/></template>
          </q-input>
        </div>

        <div class="col-12">
          <q-input
            v-model="datosReceta.diagnostico"
            label="Diagnóstico asociado"
            outlined dense :readonly="readonly"
            placeholder="Diagnóstico o motivo de la prescripción..."
          >
            <template #prepend><q-icon name="medical_information" color="secondary"/></template>
          </q-input>
        </div>

      </div>
    </q-card-section>

    <q-separator/>

    <!-- ══ MEDICAMENTOS ══════════════════════════════════════════ -->
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="seccion-titulo col">
          <q-icon name="medication" class="q-mr-xs"/>Medicamentos Prescritos
          <q-badge v-if="datosReceta.medicamentos.length" color="secondary" class="q-ml-sm">
            {{ datosReceta.medicamentos.length }}
          </q-badge>
        </div>
        <q-btn v-if="!readonly"
          color="secondary" icon="add" label="Agregar medicamento"
          size="sm" unelevated @click="agregarMedicamento"/>
      </div>

      <!-- TARJETA POR MEDICAMENTO -->
      <transition-group name="med-list" tag="div">
        <div v-for="(med, idx) in datosReceta.medicamentos" :key="med._uid"
          class="med-card q-pa-md q-mb-md rounded-borders">

          <!-- Cabecera de la tarjeta -->
          <div class="row items-center q-mb-sm">
            <q-chip dense color="secondary" text-color="white" icon="medication" class="q-mr-sm">
              {{ idx + 1 }}
            </q-chip>
            <span class="text-caption text-weight-bold text-grey-8 col">
              {{ med.nombre || 'Nuevo medicamento' }}
            </span>
            <q-btn v-if="!readonly"
              flat dense round icon="delete" color="negative" size="xs"
              @click="eliminarMedicamento(idx)">
              <q-tooltip>Eliminar medicamento</q-tooltip>
            </q-btn>
          </div>

          <div class="row q-col-gutter-sm">

            <!-- ① BÚSQUEDA EN CATÁLOGO -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="med._medicamentoCatalogo"
                :options="med._opcionesBusqueda"
                label="Buscar medicamento *"
                outlined dense use-input hide-selected fill-input
                option-label="nombre_comercial"
                option-value="id_medicamento"
                :readonly="readonly"
                :loading="med._buscando"
                no-error-icon
                :rules="[v => !!v || 'Selecciona un medicamento']"
                @filter="(val, update) => buscarMedicamento(val, update, idx)"
                @update:model-value="val => autocompletar(val, idx)"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ med._buscando ? 'Buscando...' : 'Sin resultados' }}
                    </q-item-section>
                  </q-item>
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                      <q-item-label caption>
                        {{ scope.opt.nombre_generico }} · {{ scope.opt.concentracion }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge color="purple-3" text-color="purple-10">
                        {{ scope.opt.via_administracion }}
                      </q-badge>
                    </q-item-section>
                  </q-item>
                </template>
                <template #prepend>
                  <q-icon name="search" color="secondary"/>
                </template>
              </q-select>
            </div>

            <!-- ② CONCENTRACIÓN (autocompleta, editable) -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="med.concentracion"
                label="Concentración / Presentación"
                outlined dense :readonly="readonly"
                placeholder="Ej. 500 mg/tab, 50 mg/ml..."
              >
                <template #append v-if="med._autocompleto">
                  <q-icon name="auto_fix_high" color="secondary" size="xs">
                    <q-tooltip>Autocompleto desde catálogo</q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- ③ DOSIS CALCULADA POR PESO -->
            <div class="col-6 col-sm-3">
              <q-input
                v-model.number="med.dosis_cantidad"
                label="Dosis *"
                type="number" min="0" step="0.01"
                outlined dense :readonly="readonly"
                :hint="med._dosis_base_kg ? `${med._dosis_base_kg} ${med.dosis_unidad}/kg × ${datosReceta.peso_kg} kg` : ''"
                :rules="[v => (v > 0) || 'Requerido']"
              />
            </div>

            <div class="col-6 col-sm-3">
              <q-select
                v-model="med.dosis_unidad"
                :options="unidadesDosis"
                label="Unidad *"
                outlined dense :readonly="readonly"
                :rules="[v => !!v || 'Requerido']"
              />
            </div>

            <!-- ④ VÍA (autocompleta, editable) -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="med.via"
                :options="viasAdministracion"
                label="Vía de administración *"
                outlined dense :readonly="readonly"
                :rules="[v => !!v || 'Requerido']"
              />
            </div>

            <!-- ⑤ CANTIDAD A DISPENSAR -->
            <div class="col-12 col-sm-3">
              <q-input
                v-model="med.cantidad_dispensar"
                label="Cantidad a dispensar *"
                outlined dense :readonly="readonly"
                placeholder="Ej. 30 tabletas, 100 ml..."
                :rules="[v => !!v || 'Requerido']"
              />
            </div>

            <!-- ⑥ FRECUENCIA -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="med.frecuencia"
                :options="frecuenciasOpciones"
                label="Frecuencia *"
                outlined dense use-input
                :readonly="readonly"
                new-value-mode="add-unique"
                :rules="[v => !!v || 'Requerido']"
              />
            </div>

            <!-- ⑦ DURACIÓN -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="med.duracion"
                :options="duracionesOpciones"
                label="Duración del tratamiento *"
                outlined dense use-input
                :readonly="readonly"
                new-value-mode="add-unique"
                :rules="[v => !!v || 'Requerido']"
              />
            </div>

            <!-- ⑧ INSTRUCCIONES ESPECIALES -->
            <div class="col-12">
              <q-input
                v-model="med.instrucciones"
                label="Instrucciones especiales"
                outlined dense :readonly="readonly"
                placeholder="Ej. Administrar con comida, mantener refrigerado..."
              />
            </div>
          </div>
        </div>
      </transition-group>

      <!-- ESTADO VACÍO -->
      <div v-if="!datosReceta.medicamentos.length"
        class="text-center text-grey-5 q-py-xl">
        <q-icon name="medication_liquid" size="4rem"/>
        <div class="q-mt-sm text-body2">Sin medicamentos agregados</div>
        <q-btn v-if="!readonly"
          unelevated color="secondary" label="Agregar primer medicamento"
          class="q-mt-md" icon="add" @click="agregarMedicamento"/>
      </div>
    </q-card-section>

    <q-separator/>

    <!-- ══ OBSERVACIONES ════════════════════════════════════════ -->
    <q-card-section>
      <q-input
        v-model="datosReceta.observaciones"
        label="Observaciones Internas"
        type="textarea" rows="3"
        outlined :readonly="readonly"
        placeholder="Notas internas que no aparecen en la impresión..."
      />
    </q-card-section>

    <!-- ══ ACCIONES ══════════════════════════════════════════════ -->
    <q-card-section v-if="!readonly" class="bg-grey-1 text-right q-gutter-x-sm">
      <q-btn v-if="modoEdicionManual"
        flat color="grey-7" label="Cancelar" @click="cancelarEdicion"/>
      <q-btn
        :color="modoEdicionManual ? 'orange' : 'secondary'"
        icon="save"
        :label="modoEdicionManual ? 'Guardar Cambios' : 'Guardar Receta'"
        :disable="!formularioValido"
        @click="completarReceta"/>
    </q-card-section>

  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import inventarioService from 'src/services/inventario.service'

// ══ CATÁLOGOS ════════════════════════════════════════════════════
const unidadesDosis = ['mg', 'ml', 'mg/kg', 'ml/kg', 'UI/kg', 'UI', 'gotas', 'tableta(s)', 'cápsula(s)']

const viasAdministracion = [
  'Oral (PO)', 'Subcutánea (SC)', 'Intramuscular (IM)', 'Intravenosa (IV)',
  'Tópica', 'Oftálmica', 'Ótica', 'Inhalatoria', 'Rectal',
]

const especiesOpciones = ['Canino', 'Felino', 'Ave', 'Reptil', 'Roedor', 'Conejo', 'Équido', 'Bovino', 'Otro']

const frecuenciasOpciones = [
  'Una vez al día (SID)', 'Cada 12 horas (BID)', 'Cada 8 horas (TID)',
  'Cada 6 horas (QID)', 'Cada 24 horas', 'Cada 48 horas', 'Una vez a la semana',
]

const duracionesOpciones = [
  '3 días', '5 días', '7 días', '10 días', '14 días', '21 días', '30 días',
  '2 semanas', '3 semanas', '1 mes', 'Indefinido',
]

// ══ MOCK DE CATÁLOGO (reemplaza con tu endpoint real) ════════════
// Estructura esperada del endpoint GET /api/medicamentos?q=:term
// [{ id_medicamento, nombre_comercial, nombre_generico, concentracion,
//    via_administracion, dosis_mg_kg, unidad_dosis }]
const MOCK_CATALOGO = [
  { id_medicamento: 1, nombre_comercial: 'Amoxicilina 500mg', nombre_generico: 'Amoxicilina', concentracion: '500 mg/cáp', via_administracion: 'Oral (PO)',         dosis_mg_kg: 10,  unidad_dosis: 'mg/kg' },
  { id_medicamento: 2, nombre_comercial: 'Meloxicam 1.5mg/ml', nombre_generico: 'Meloxicam',  concentracion: '1.5 mg/ml', via_administracion: 'Oral (PO)',         dosis_mg_kg: 0.1, unidad_dosis: 'mg/kg' },
  { id_medicamento: 3, nombre_comercial: 'Dexametasona 4mg/ml',nombre_generico: 'Dexametasona',concentracion: '4 mg/ml',  via_administracion: 'Intramuscular (IM)', dosis_mg_kg: 0.25,unidad_dosis: 'mg/kg' },
  { id_medicamento: 4, nombre_comercial: 'Enrofloxacina 50mg/ml',nombre_generico:'Enrofloxacina',concentracion:'50 mg/ml', via_administracion:'Subcutánea (SC)',   dosis_mg_kg: 5,   unidad_dosis: 'mg/kg' },
  { id_medicamento: 5, nombre_comercial: 'Furosemida 10mg/ml', nombre_generico: 'Furosemida', concentracion: '10 mg/ml',  via_administracion: 'Intravenosa (IV)',   dosis_mg_kg: 2,   unidad_dosis: 'mg/kg' },
]

// ══ PROPS / EMITS ════════════════════════════════════════════════
const props = defineProps({
  atencionId:         { type: String,  required: true },
  servicioId:         { type: String,  required: true },
  plantillasServicio: { type: Array,   default: () => [] },
  modoLectura:        { type: Boolean, default: false },
  datosIniciales:     { type: Object,  default: () => ({}) },
  // Endpoint de búsqueda: GET {catalogoUrl}?q=<término>
  // Si no se provee se usa el mock interno
  catalogoUrl:        { type: String,  default: '' },
})

const emit = defineEmits([
  'servicio-actualizado', 'servicio-completado',
  'servicio-eliminado',   'imprimir-servicio',
  'firmar-servicio'
])

// ══ ESTADO ══════════════════════════════════════════════════════
const $q = useQuasar()
const modoEdicionManual = ref(false)
const readonly = computed(() => props.modoLectura && !modoEdicionManual.value)

let _uid = 0
const nuevoMedicamento = () => ({
  _uid:                  ++_uid,       // clave única para v-for
  _medicamentoCatalogo:  null,         // objeto seleccionado del catálogo
  _opcionesBusqueda:     [],           // resultados del último filtro
  _buscando:             false,
  _autocompleto:         false,
  _dosis_base_kg:        null,         // mg/kg original del catálogo
  // Campos persistibles (lo que se emite)
  id_medicamento:        null,
  nombre:                '',
  concentracion:         '',
  dosis_cantidad:        null,
  dosis_unidad:          'mg/kg',
  via:                   'Oral (PO)',
  cantidad_dispensar:    '',
  frecuencia:            '',
  duracion:              '',
  instrucciones:         '',
})

const datosReceta = ref({
  especie:            '',
  raza:               '',
  edad:               '',
  peso_kg:            null,
  nombre_propietario: '',
  diagnostico:        '',
  medicamentos:       [],
  observaciones:      '',
})

// ══ VALIDACIÓN ══════════════════════════════════════════════════
const formularioValido = computed(() => {
  const d = datosReceta.value
  if (!d.especie || !d.nombre_propietario) return false
  if (!d.peso_kg || d.peso_kg <= 0)        return false
  if (!d.medicamentos.length)               return false
  return d.medicamentos.every(m =>
    m.nombre && m.dosis_cantidad > 0 && m.dosis_unidad &&
    m.via && m.cantidad_dispensar && m.frecuencia && m.duracion
  )
})

// ══ BÚSQUEDA EN CATÁLOGO ════════════════════════════════════════
const debounceTimers = {}

const buscarMedicamento = (val, update, idx) => {
  const med = datosReceta.value.medicamentos[idx]
  clearTimeout(debounceTimers[idx])

  if (val.length < 2) {
    update(() => { med._opcionesBusqueda = [] })
    return
  }

  med._buscando = true
  debounceTimers[idx] = setTimeout(async () => {
    try {
      let resultados = []

      if (props.catalogoUrl) {
        // ── Llamada real a tu API ─────────────────────────────
        const res = await fetch(`${props.catalogoUrl}?q=${encodeURIComponent(val)}`)
        if (res.ok) resultados = await res.json()
      } else {
        // ── Mock local (eliminar cuando tengas el endpoint) ───
        const term = val.toLowerCase()
        resultados = MOCK_CATALOGO.filter(m =>
          m.nombre_comercial.toLowerCase().includes(term) ||
          m.nombre_generico.toLowerCase().includes(term)
        )
        // simula latencia
        await new Promise(r => setTimeout(r, 200))
      }

      update(() => { med._opcionesBusqueda = resultados })
    } catch (e) {
      console.error('Error buscando medicamentos:', e)
      update(() => { med._opcionesBusqueda = [] })
    } finally {
      med._buscando = false
    }
  }, 300)
}

// ══ AUTOCOMPLETAR AL SELECCIONAR ════════════════════════════════
const autocompletar = (seleccion, idx) => {
  if (!seleccion) return
  const med = datosReceta.value.medicamentos[idx]

  med.id_medicamento    = seleccion.id_medicamento
  med.nombre            = seleccion.nombre_comercial
  med.concentracion     = seleccion.concentracion     ?? ''
  med.via               = seleccion.via_administracion ?? med.via
  med.dosis_unidad      = seleccion.unidad_dosis       ?? med.dosis_unidad
  med._dosis_base_kg    = seleccion.dosis_mg_kg        ?? null
  med._autocompleto     = true

  // Calcular dosis si hay peso
  if (med._dosis_base_kg && datosReceta.value.peso_kg > 0) {
    med.dosis_cantidad = +(med._dosis_base_kg * datosReceta.value.peso_kg).toFixed(2)
  }
}

// Recalcula dosis de todos los medicamentos cuando cambia el peso
const recalcularDosisTodos = (nuevoPeso) => {
  if (!nuevoPeso || nuevoPeso <= 0) return
  datosReceta.value.medicamentos.forEach(med => {
    if (med._dosis_base_kg) {
      med.dosis_cantidad = +(med._dosis_base_kg * nuevoPeso).toFixed(2)
    }
  })
}

// ══ CRUD MEDICAMENTOS ════════════════════════════════════════════
const agregarMedicamento   = ()    => datosReceta.value.medicamentos.push(nuevoMedicamento())
const eliminarMedicamento  = (idx) => datosReceta.value.medicamentos.splice(idx, 1)

// ══ SERIALIZACIÓN (limpia campos internos _ antes de emitir) ════
const serializar = () => {
  const d = { ...datosReceta.value }
  d.medicamentos = d.medicamentos.map(({ _uid, _medicamentoCatalogo, _opcionesBusqueda, _buscando, _autocompleto, _dosis_base_kg, ...limpio }) => limpio)
  return d
}

// ══ ACCIONES ════════════════════════════════════════════════════
const guardarCambios   = ()    => emit('servicio-actualizado', props.servicioId, serializar())
const eliminarServicio = ()    => emit('servicio-eliminado', props.servicioId)
const imprimirReceta   = (tipo = 'especial', id = null) =>
  emit('imprimir-servicio', props.servicioId, serializar(), tipo, id)

const firmarReceta   = (tipo = 'especial', id = null) =>
  emit('firmar-servicio', props.servicioId, serializar(), tipo, id)

const completarReceta = async () => {
  if (!formularioValido.value) return

  try {
    $q.loading.show({ message: 'Deduciendo stock e inventario...' })
    const dataSerializada = serializar()

    // Llamamos al deductor backend por cada medicamento si está ligado a un ID
    for (const med of dataSerializada.medicamentos) {
      if (med.id_medicamento) {
        // Obtenemos solo los números del string cantidad_dispensar, si es complejo lo forzamos a 1 temporal
        const regexNum = med.cantidad_dispensar.toString().match(/\d+/)
        const cantidadNumerica = regexNum ? parseInt(regexNum[0], 10) : 1

        await inventarioService.productos.deducirInventario({
          id_presentacion: med.id_medicamento, // Suponemos que id_medicamento mapea directamente a presentacion/SKU
          cantidad: cantidadNumerica,
          origen: 'RECETA',
          referencia_id: props.atencionId
        })
      }
    }

    emit('servicio-completado', props.servicioId, {
      ...dataSerializada,
      fecha_aplicacion: new Date().toISOString(),
    })
    modoEdicionManual.value = false
    $q.notify({ type: 'positive', message: 'Servicio completado. Stock deducido correctamente.' })

  } catch (error) {
    console.error('Error al deducir inventario:', error)
    $q.notify({ type: 'negative', message: 'Error cerrando la receta: ' + (error.response?.data?.message || error.message) })
  } finally {
    $q.loading.hide()
  }
}

const cancelarEdicion = () => {
  cargarDatosIniciales()
  modoEdicionManual.value = false
}

// ══ INICIALIZACIÓN ═══════════════════════════════════════════════
const cargarDatosIniciales = () => {
  const d = props.datosIniciales
  if (!d || !Object.keys(d).length) return
  datosReceta.value = {
    especie:            d.especie            ?? '',
    raza:               d.raza               ?? '',
    edad:               d.edad               ?? '',
    peso_kg:            d.peso_kg            ?? null,
    nombre_propietario: d.nombre_propietario ?? '',
    diagnostico:        d.diagnostico        ?? '',
    observaciones:      d.observaciones      ?? '',
    medicamentos: (d.medicamentos ?? []).map(m => ({
      ...nuevoMedicamento(),
      ...m,
    })),
  }
}

watch(datosReceta, guardarCambios, { deep: true })
onMounted(cargarDatosIniciales)
</script>

<style scoped>
.servicio-card      { margin-bottom: 20px; border-radius: 12px; }
.border-left-recipe { border-left: 5px solid #9c27b0; }
.bg-purple-1        { background: #f3e5f5; }
.seccion-titulo     { font-size: .85rem; font-weight: 600; color: #6a1b9a; margin-bottom: 12px; }
.med-card           { background: #fafafa; border: 1px solid #e0e0e0; transition: box-shadow .2s; }
.med-card:hover     { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.med-list-enter-active, .med-list-leave-active { transition: all .25s ease; }
.med-list-enter-from, .med-list-leave-to       { opacity: 0; transform: translateY(-8px); }
</style>