<template>
    <q-card class="servicio-card">
      <q-card-section class="bg-green-1">
        <div class="row items-center">
          <q-icon name="vaccines" color="green" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Vacunación</div>
            <div class="text-caption text-grey-7">Registro de aplicación de múltiples vacunas</div>
          </div>
          <q-btn-dropdown 
            flat round 
            icon="more_vert"
          >
            <q-list>
              <q-item clickable @click="imprimirCertificado">
                <q-item-section avatar>
                  <q-icon name="print" color="primary"/>
                </q-item-section>
                <q-item-section>Imprimir Certificado</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="completarVacunacion" :disable="vacunasAgregadas.length === 0">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive"/>
                </q-item-section>
                <q-item-section>Finalizar y Guardar Todo</q-item-section>
              </q-item>
              <q-item clickable @click="eliminarServicio">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative"/>
                </q-item-section>
                <q-item-section>Eliminar Servicio</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>
      
      <!-- Listado de Vacunas Agregadas -->
      <q-card-section v-if="vacunasAgregadas.length > 0 && (!modoLectura || modoEdicionManual)" class="q-pb-none">
        <div class="text-subtitle2 q-mb-sm">
          {{ modoEdicionManual ? 'Vacunas Aplicadas (Editando)' : 'Vacunas por Aplicar' }} ({{ vacunasAgregadas.length }})
        </div>
        <q-list bordered separator class="rounded-borders bg-grey-1">
          <q-item v-for="(v, index) in vacunasAgregadas" :key="index">
            <q-item-section avatar>
              <q-icon name="vaccines" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ typeof v.tipoVacuna === 'object' ? (v.tipoVacuna?.label || v.tipoVacuna?.value) : v.tipoVacuna }}
              </q-item-label>
              <q-item-label caption>
                {{ v.producto?.label || 'Producto manual' }} | 
                Lab: {{ typeof v.laboratorio === 'object' ? (v.laboratorio?.label || v.laboratorio?.value) : v.laboratorio }} | 
                Lote: {{ v.numeroLote }} | Dosis: {{ v.dosisAplicada }}ml
              </q-item-label>
              <q-item-label caption v-if="v.observaciones" class="text-italic text-grey-8">
                Obs/Reacciones: {{ v.observaciones }}
              </q-item-label>
              <q-item-label caption v-if="v.proximaVacuna">
                Próximo refuerzo: {{ v.proximaVacuna }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="!modoLectura || modoEdicionManual">
              <div class="row q-gutter-xs">
                <q-btn flat round color="primary" icon="edit" size="sm" @click="editarVacuna(index)" />
                <q-btn flat round color="negative" icon="delete" size="sm" @click="quitarVacuna(index)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- Formulario para Agregar Nueva Vacuna -->
      <q-card-section v-if="!modoLectura || modoEdicionManual">
        <div class="row items-center q-mb-md">
          <q-separator class="col" />
          <div class="q-px-md text-weight-bold text-grey-7">{{ vacunasAgregadas.length === 0 ? 'Registrar Vacuna' : 'Agregar otra Vacuna' }}</div>
          <q-separator class="col" />
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-12">
            <q-select
              v-model="datosVacuna.producto"
              :options="productosVacuna"
              label="Buscar Vacuna en Inventario"
              outlined dense
              use-input
              @filter="buscarVacunas"
              hint="Selecciona para autocompletar lote y laboratorio"
              @update:model-value="alSeleccionarProducto"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron vacunas disponibles
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.tipoVacuna"
              :options="tiposVacuna"
              label="Tipo de Vacuna *"
              outlined dense
              use-input
              @filter="filterFn"
              new-value-mode="add-unique"
              option-label="label"
              option-value="value"
              map-options
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.laboratorio"
              :options="laboratorios"
              label="Laboratorio *"
              outlined dense
              use-input
              @filter="filterFn"
              new-value-mode="add-unique"
              option-label="label"
              option-value="value"
              map-options
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-select
              v-model="datosVacuna.lote"
              :options="lotesDisponibles"
              label="Lote Seleccionado *"
              outlined dense
              :readonly="!datosVacuna.producto"
              @update:model-value="alSeleccionarLote"
              option-label="numeroLote"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.numeroLote }}</q-item-label>
                    <q-item-label caption>Vence: {{ scope.opt.fechaVencimiento }} | Stock: {{ scope.opt.cantidadDisponible }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.numeroLote"
              label="Número de Lote *"
              outlined dense
              hint="Ingresa el lote manualmente o selecciona arriba"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.fechaVencimiento"
              label="Fecha de Vencimiento"
              outlined dense
              type="date"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.dosisAplicada"
              label="Dosis Aplicada (ml) *"
              outlined dense
              type="number"
              step="0.1"
              min="0"
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-select
              v-model="datosVacuna.viaAdministracion"
              :options="viasAdministracion"
              label="Vía de Administración"
              outlined dense
              option-label="label"
              option-value="value"
              map-options
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.sitioAplicacion"
              label="Sitio de Aplicación"
              outlined dense
              placeholder="Ej: Flanco izquierdo, cuello..."
            />
          </div>
          
          <div class="col-12 col-md-4">
            <q-input
              v-model="datosVacuna.proximaVacuna"
              label="Próxima Vacunación"
              outlined dense
              type="date"
            />
          </div>
          
          <div class="col-12">
            <q-input
              v-model="datosVacuna.observaciones"
              label="Observaciones / Reacciones Adversas"
              outlined dense
              type="textarea"
              rows="2"
              placeholder="Registra cualquier reacción adversa u observación clínica relevante..."
            />
          </div>

          <div class="col-12 flex justify-end q-gutter-sm">
            <q-btn
              v-if="indiceEditando > -1"
              flat
              color="grey-7"
              label="Cancelar"
              @click="cancelarEdicionItem"
              no-caps
            />
            <q-btn
              color="primary"
              outline
              :icon="indiceEditando > -1 ? 'save' : 'add'"
              :label="indiceEditando > -1 ? 'Actualizar Vacuna' : 'Agregar a la Lista'"
              @click="agregarVacuna"
              :disable="!formularioValido"
              no-caps
            />
          </div>
        </div>
      </q-card-section>

      <!-- Estado y acciones finales -->
      <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 border-top">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <q-chip 
              v-if="vacunasAgregadas.length > 0"
              color="positive"
              text-color="white"
              icon="check_circle"
              :label="`${vacunasAgregadas.length} vacuna(s) lista(s)`"
            />
            <q-chip 
              v-else
              color="orange"
              text-color="white"
              icon="warning"
              label="Sin vacunas registradas"
            />
          </div>
          
          <div class="col-auto">
            <q-btn
              v-if="!modoEdicionManual && !modoLectura"
              color="positive"
              icon="check"
              label="Finalizar Vacunación"
              @click="completarVacunacion"
              :disable="vacunasAgregadas.length === 0 || procesando"
              :loading="procesando"
            />
            <q-btn
              v-if="modoEdicionManual"
              color="primary"
              icon="save"
              label="Guardar Cambios"
              @click="completarVacunacion"
              :disable="vacunasAgregadas.length === 0 || procesando"
              :loading="procesando"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Vista Lectura: Mostrar vacunas guardadas -->
      <q-card-section v-if="modoLectura && !modoEdicionManual" class="q-pt-none">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2">Vacunas Aplicadas</div>
          <q-btn 
            flat dense round 
            color="primary" 
            icon="edit" 
            size="sm" 
            @click="modoEdicionManual = true"
          >
            <q-tooltip>Habilitar Edición</q-tooltip>
          </q-btn>
        </div>
        <q-list bordered separator class="rounded-borders">
          <q-item v-for="(v, index) in vacunasAgregadas" :key="index">
            <q-item-section avatar>
              <q-icon name="verified" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ typeof v.tipoVacuna === 'object' ? (v.tipoVacuna?.label || v.tipoVacuna?.value) : v.tipoVacuna }}
              </q-item-label>
              <q-item-label caption>
                {{ v.producto?.label || 'Producto manual' }} | 
                Lab: {{ typeof v.laboratorio === 'object' ? (v.laboratorio?.label || v.laboratorio?.value) : v.laboratorio }} | 
                Lote: {{ v.numeroLote }} | Dosis: {{ v.dosisAplicada }}ml
              </q-item-label>
              <q-item-label caption v-if="v.observaciones" class="text-italic text-grey-8">
                Obs/Reacciones: {{ v.observaciones }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
               <q-chip dense outline color="grey-7" size="sm">{{ v.fechaVencimiento || 'Sin vencimiento' }}</q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import inventarioService from 'src/services/inventario.service'
  import { useQuasar } from 'quasar'
  import useCatalogos from 'src/composables/useCatalogos'
  import { Modulo, Tabla } from 'src/common/enums/configuracion.enum'

  const $q = useQuasar()
  const { obtenerCatalogo } = useCatalogos()
  
  const props = defineProps({
    atencionId: { type: String, required: true },
    servicioId: { type: String, required: true },
    modoLectura: { type: Boolean, default: false },
    datosIniciales: { type: Object, default: () => ({}) }
  })
  
  const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio'])
  
  // Lista de vacunas agregadas
  const vacunasAgregadas = ref([])
  const procesando = ref(false)
  const modoEdicionManual = ref(false)
  const indiceEditando = ref(-1)

  // Formulario actual para entrada
  const datosVacuna = ref({
    producto: null,
    lote: null,
    tipoVacuna: '',
    laboratorio: '',
    numeroLote: '',
    fechaVencimiento: '',
    dosisAplicada: '',
    viaAdministracion: 'subcutanea',
    sitioAplicacion: '',
    proximaVacuna: '',
    observaciones: ''
  })

  const resetForm = () => {
    datosVacuna.value = {
      producto: null,
      lote: null,
      tipoVacuna: '',
      laboratorio: '',
      numeroLote: '',
      fechaVencimiento: '',
      dosisAplicada: '',
      viaAdministracion: 'subcutanea',
      sitioAplicacion: '',
      proximaVacuna: '',
      observaciones: ''
    }
    indiceEditando.value = -1
  }

  const cancelarEdicionItem = () => {
    resetForm()
  }

  const editarVacuna = (index) => {
    indiceEditando.value = index
    const v = vacunasAgregadas.value[index]
    datosVacuna.value = JSON.parse(JSON.stringify(v))
    // Asegurar que si es un objeto (select) se mantenga como tal
    // (JSON.parse(JSON.stringify)) es seguro para objetos planos
  }

  const productosVacuna = ref([])
  const lotesDisponibles = ref([])
  
  const tiposVacuna = ref([])
  const laboratorios = ref([])
  const viasAdministracion = ref([])
  
  const cargarCatalogos = async () => {
    try {
      // Cargar catálogos usando los Enums definidos
      const [tipos, labs, vias] = await Promise.all([
        obtenerCatalogo(Modulo.VACUNA, Tabla.TIPO_VACUNA),
        obtenerCatalogo(Modulo.VACUNA, Tabla.LABORATORIO),
        obtenerCatalogo(Modulo.VACUNA, Tabla.VIA_ADMINISTRACION)
      ])
      
      tiposVacuna.value = tipos
      laboratorios.value = labs
      viasAdministracion.value = vias

      // Resolver labels para vacunas cargadas inicialmente si faltan
      resolverLabelsDeVacunas()
    } catch (error) {
      console.error('Error al cargar catálogos de vacunación:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar los catálogos de vacunación'
      })
    }
  }
  
  const resolverLabelsDeVacunas = () => {
    if (!tiposVacuna.value.length) return

    vacunasAgregadas.value.forEach(v => {
      // Tipo Vacuna
      if (v.tipoVacuna && typeof v.tipoVacuna === 'object') {
        if (!v.tipoVacuna.label || v.tipoVacuna.label === v.tipoVacuna.value) {
          const found = tiposVacuna.value.find(t => Number(t.value) === Number(v.tipoVacuna.value))
          if (found) v.tipoVacuna.label = found.label
        }
      }
      
      // Laboratorio
      if (v.laboratorio && typeof v.laboratorio === 'object') {
        if (!v.laboratorio.label || v.laboratorio.label === v.laboratorio.value) {
          const found = laboratorios.value.find(l => Number(l.value) === Number(v.laboratorio.value))
          if (found) v.laboratorio.label = found.label
        }
      }

      // Via Administracion
      if (v.viaAdministracion && typeof v.viaAdministracion === 'object') {
        if (!v.viaAdministracion.label || v.viaAdministracion.label === v.viaAdministracion.value) {
          const found = viasAdministracion.value.find(va => Number(va.value) === Number(v.viaAdministracion.value))
          if (found) v.viaAdministracion.label = found.label
        }
      }
    })
  }

  // Vigilar cambios en la lista para resolver labels si se cargan asíncronamente
  watch(() => vacunasAgregadas.value, () => {
    resolverLabelsDeVacunas()
  }, { deep: true })
  
  const formularioValido = computed(() => {
    return (datosVacuna.value.tipoVacuna || datosVacuna.value.producto) && 
           datosVacuna.value.laboratorio && 
           datosVacuna.value.numeroLote &&
           datosVacuna.value.dosisAplicada
  })
  
  const agregarVacuna = () => {
    if (formularioValido.value) {
      if (indiceEditando.value > -1) {
        // Estamos editando un item existente en la lista
        vacunasAgregadas.value[indiceEditando.value] = { ...datosVacuna.value }
      } else {
        // Nuevo item
        vacunasAgregadas.value.push({ ...datosVacuna.value })
      }
      
      resetForm()
      $q.notify({ type: 'positive', message: indiceEditando.value > -1 ? 'Vacuna actualizada' : 'Vacuna agregada a la lista', position: 'bottom-right', timeout: 1000 })
      emit('servicio-actualizado', props.servicioId, { vacunas: vacunasAgregadas.value })
    }
  }

  const quitarVacuna = (index) => {
    vacunasAgregadas.value.splice(index, 1)
    emit('servicio-actualizado', props.servicioId, { vacunas: vacunasAgregadas.value })
  }

  const calcularProximaVacuna = () => {
    if (datosVacuna.value.tipoVacuna && !datosVacuna.value.proximaVacuna) {
      const hoy = new Date()
      let mesesSiguientes = 12
      const val = datosVacuna.value.tipoVacuna?.value || datosVacuna.value.tipoVacuna
      
      switch(val) {
        case 'parvovirus': case 'moquillo': case 'rabia': mesesSiguientes = 12; break
        case 'bordetella': mesesSiguientes = 6; break
      }
      
      hoy.setMonth(hoy.getMonth() + mesesSiguientes)
      datosVacuna.value.proximaVacuna = hoy.toISOString().split('T')[0]
    }
  }
  
  const buscarVacunas = async (val, update) => {
    if (val.length < 2) { update(() => { productosVacuna.value = [] }); return }
    try {
      const res = await inventarioService.productos.search(val)
      update(() => {
        productosVacuna.value = res.data.map(p => ({
          label: p.nombre, value: p.id, laboratorio: p.proveedor?.nombre || '', ...p
        }))
      })
    } catch (error) { console.error(error) }
  }

  const alSeleccionarProducto = async (producto) => {
    if (!producto) return
    datosVacuna.value.laboratorio = producto.laboratorio
    try {
      const res = await inventarioService.lotes.getByProducto(producto.id)
      lotesDisponibles.value = res.data.filter(l => l.cantidadDisponible > 0)
      if (lotesDisponibles.value.length > 0) {
        const proximoVencer = [...lotesDisponibles.value].sort((a,b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))[0]
        datosVacuna.value.lote = proximoVencer
        alSeleccionarLote(proximoVencer)
      }
    } catch (error) { console.error(error) }
  }

  const filterFn = (val, update) => {
    update(() => {
      // Esta función permite que el q-select muestre las opciones filtradas
      // y también que acepte valores nuevos (new-value-mode)
    })
  }

  const alSeleccionarLote = (lote) => {
    if (!lote) return
    datosVacuna.value.numeroLote = lote.numeroLote
    datosVacuna.value.fechaVencimiento = lote.fechaVencimiento
  }

  const completarVacunacion = async () => {
    if (procesando.value) return
    
    if (vacunasAgregadas.value.length === 0 && formularioValido.value) {
        // Si hay datos en el form pero no se agregaron a la lista, agregarlos antes de completar
        agregarVacuna()
    }

    if (vacunasAgregadas.value.length > 0) {
      try {
        procesando.value = true
        $q.loading.show({ message: 'Procesando aplicaciones e inventario...' })
        
        // Descontar inventario para cada vacuna que tenga lote
        for (const v of vacunasAgregadas.value) {
          if (v.lote) {
            await inventarioService.lotes.ajustarCantidad(v.lote.id, {
              tipo: 'salida',
              cantidad: 1,
              motivo: `Atención #${props.atencionId} (Vacunación: ${v.tipoVacuna?.label || v.tipoVacuna})`
            })
          }
        }

        emit('servicio-completado', props.servicioId, {
          vacunas: vacunasAgregadas.value,
          fechaAplicacion: new Date().toISOString()
        })
        modoEdicionManual.value = false
      } catch (error) {
        console.error(error)
        $q.notify({ color: 'negative', message: 'Error al actualizar inventario parcial' })
        // Aun así emitimos para completar la parte clínica
        emit('servicio-completado', props.servicioId, { vacunas: vacunasAgregadas.value })
      } finally {
        procesando.value = false
        $q.loading.hide()
      }
    }
  }
  
  const imprimirCertificado = () => {
    emit('imprimir-servicio', props.servicioId, { vacunas: vacunasAgregadas.value })
  }

  const eliminarServicio = () => {
    emit('servicio-eliminado', props.servicioId)
  }
  
  onMounted(async () => {
    await cargarCatalogos()
    
    if (props.datosIniciales?.vacunas) {
      vacunasAgregadas.value = props.datosIniciales.vacunas
    }
  })

  watch(() => datosVacuna.value.tipoVacuna, calcularProximaVacuna)
  </script>
  
  <style scoped>
  .servicio-card { margin-bottom: 16px; border-radius: 12px; overflow: hidden; }
  .bg-green-1 { background: #f0fdf4; }
  .border-top { border-top: 1px solid #e2e8f0; }
  </style>