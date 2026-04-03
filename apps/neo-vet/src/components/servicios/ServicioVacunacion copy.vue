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
            :disable="modoLectura"
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
      <q-card-section v-if="vacunasAgregadas.length > 0" class="q-pb-none">
        <div class="text-subtitle2 q-mb-sm">Vacunas por Aplicar ({{ vacunasAgregadas.length }})</div>
        <q-list bordered separator class="rounded-borders bg-grey-1">
          <q-item v-for="(v, index) in vacunasAgregadas" :key="index">
            <q-item-section avatar>
              <q-icon name="vaccines" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ v.tipoVacuna?.label || v.tipoVacuna }}</q-item-label>
              <q-item-label caption>
                {{ v.producto?.label || 'Producto manual' }} | Lote: {{ v.numeroLote }} | Dosis: {{ v.dosisAplicada }}ml
              </q-item-label>
              <q-item-label caption v-if="v.proximaVacuna">
                Próximo refuerzo: {{ v.proximaVacuna }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="!modoLectura">
              <q-btn flat round color="negative" icon="delete" size="sm" @click="quitarVacuna(index)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- Formulario para Agregar Nueva Vacuna -->
      <q-card-section v-if="!modoLectura">
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
              option-label="label"
              option-value="value"
            />
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="datosVacuna.laboratorio"
              :options="laboratorios"
              label="Laboratorio *"
              outlined dense
              use-input
              fill-input
              hide-selected
              input-debounce="0"
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
              label="Observaciones de esta vacuna"
              outlined dense
              type="textarea"
              rows="2"
            />
          </div>

          <div class="col-12 flex justify-end">
            <q-btn
              color="primary"
              outline
              icon="add"
              label="Agregar a la Lista"
              @click="agregarVacuna"
              :disable="!formularioValido"
              no-caps
            />
          </div>
        </div>
      </q-card-section>

      <!-- Estado y acciones finales -->
      <q-card-section v-if="!modoLectura" class="bg-grey-1 border-top">
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
              color="positive"
              icon="check"
              label="Finalizar Vacunación"
              @click="completarVacunacion"
              :disable="vacunasAgregadas.length === 0"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Vista Lectura: Mostrar vacunas guardadas -->
      <q-card-section v-if="modoLectura" class="q-pt-none">
        <div class="text-subtitle2 q-mb-sm">Vacunas Aplicadas</div>
        <q-list bordered separator class="rounded-borders">
          <q-item v-for="(v, index) in vacunasAgregadas" :key="index">
            <q-item-section avatar>
              <q-icon name="verified" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ v.tipoVacuna?.label || v.tipoVacuna }}</q-item-label>
              <q-item-label caption>
                {{ v.producto?.label || 'Producto manual' }} | Lote: {{ v.numeroLote }} | Dosis: {{ v.dosisAplicada }}ml
              </q-item-label>
            </q-item-section>
            <q-item-section side>
               <q-chip dense outline color="grey-7" size="sm">{{ v.vencimiento || 'Sin vencimiento' }}</q-chip>
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

  const $q = useQuasar()
  
  const props = defineProps({
    atencionId: { type: String, required: true },
    servicioId: { type: String, required: true },
    modoLectura: { type: Boolean, default: false },
    datosIniciales: { type: Object, default: () => ({}) }
  })
  
  const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio'])
  
  // Lista de vacunas agregadas
  const vacunasAgregadas = ref([])

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
    reaccionesAdversas: false,
    descripcionReacciones: '',
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
      reaccionesAdversas: false,
      descripcionReacciones: '',
      observaciones: ''
    }
  }

  const productosVacuna = ref([])
  const lotesDisponibles = ref([])
  
  const tiposVacuna = [
    { label: 'Triple Felina (FVRCP)', value: 'triple_felina' },
    { label: 'Rabia', value: 'rabia' },
    { label: 'Parvovirus Canino', value: 'parvovirus' },
    { label: 'Hepatitis Canina', value: 'hepatitis' },
    { label: 'Moquillo Canino', value: 'moquillo' },
    { label: 'Bordetella', value: 'bordetella' },
    { label: 'Leucemia Felina', value: 'leucemia_felina' },
    { label: 'Pentavalente', value: 'pentavalente' },
    { label: 'Otra', value: 'otra' }
  ]
  
  const laboratorios = ['Zoetis', 'MSD Animal Health', 'Boehringer Ingelheim', 'Virbac', 'HIPRA', 'Fort Dodge', 'Otro']
  const viasAdministracion = [
    { label: 'Subcutánea', value: 'subcutanea' },
    { label: 'Intramuscular', value: 'intramuscular' },
    { label: 'Intranasal', value: 'intranasal' },
    { label: 'Oral', value: 'oral' }
  ]
  
  const formularioValido = computed(() => {
    return (datosVacuna.value.tipoVacuna || datosVacuna.value.producto) && 
           datosVacuna.value.laboratorio && 
           datosVacuna.value.numeroLote &&
           datosVacuna.value.dosisAplicada
  })
  
  const agregarVacuna = () => {
    if (formularioValido.value) {
      vacunasAgregadas.value.push({ ...datosVacuna.value })
      resetForm()
      $q.notify({ type: 'positive', message: 'Vacuna agregada a la lista', position: 'bottom-right', timeout: 1000 })
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

  const alSeleccionarLote = (lote) => {
    if (!lote) return
    datosVacuna.value.numeroLote = lote.numeroLote
    datosVacuna.value.fechaVencimiento = lote.fechaVencimiento
  }

  const completarVacunacion = async () => {
    if (vacunasAgregadas.length === 0 && formularioValido.value) {
        // Si hay datos en el form pero no se agregaron a la lista, agregarlos antes de completar
        agregarVacuna()
    }

    if (vacunasAgregadas.value.length > 0) {
      try {
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
      } catch (error) {
        console.error(error)
        $q.notify({ color: 'negative', message: 'Error al actualizar inventario parcial' })
        // Aun así emitimos para completar la parte clínica
        emit('servicio-completado', props.servicioId, { vacunas: vacunasAgregadas.value })
      } finally {
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
  
  onMounted(() => {
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