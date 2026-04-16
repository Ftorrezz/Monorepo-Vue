<template>
  <q-card class="servicio-card border-left-premium">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="folder_open" color="primary" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6 text-primary">Archivos y Documentos</div>
          <div class="text-caption text-grey-7">Anexos, imágenes, PDFs y resultados</div>
        </div>
        
        <q-btn 
          v-if="modoLectura && !modoEdicionManual"
          flat dense round 
          color="primary" 
          icon="edit" 
          size="sm" 
          @click="modoEdicionManual = true"
          class="q-mr-sm"
        >
          <q-tooltip>Habilitar Edición</q-tooltip>
        </q-btn>
        
        <q-btn 
          v-if="modoEdicionManual"
          flat dense round 
          color="grey-7" 
          icon="close" 
          size="sm" 
          @click="cancelarEdicion"
          class="q-mr-sm"
        >
          <q-tooltip>Cancelar Edición</q-tooltip>
        </q-btn>
        
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
        >
          <q-list>
            <q-item clickable @click="completarServicio" :disable="subiendoArchivos">
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Finalizar Edición</q-item-section>
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
      <!-- Zone para ver los archivos ya subidos -->
      <div v-if="archivos.length > 0" class="row q-col-gutter-md q-mb-md">
        <div v-for="(archivo, index) in archivos" :key="index" class="col-12 col-sm-6 col-md-4">
          <q-card class="bg-grey-2" flat bordered>
            <q-card-section class="q-pa-xs">
              <div class="row items-center no-wrap">
                <q-icon 
                  :name="esImagen(archivo.url) ? 'image' : 'picture_as_pdf'" 
                  :color="esImagen(archivo.url) ? 'positive' : 'negative'" 
                  size="md" class="q-mr-sm" 
                />
                <div class="col" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <span class="text-body2" :title="archivo.nombre">{{ archivo.nombre || 'Archivo' }}</span>
                </div>
                <q-btn 
                  flat dense round 
                  icon="visibility" 
                  color="primary" 
                  @click="abrirArchivo(archivo)" 
                >
                  <q-tooltip>Ver Archivo</q-tooltip>
                </q-btn>
                <q-btn 
                  v-if="!modoLectura || modoEdicionManual"
                  flat dense round 
                  icon="delete" 
                  color="negative" 
                  @click="removerArchivo(index)" 
                >
                   <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      
    <div v-else-if="modoLectura && !modoEdicionManual" class="text-caption text-grey q-mb-md">
      No hay archivos adjuntos.
    </div>

    <!-- q-uploader manual (custom implementation de axios) -->
    <q-uploader
      v-if="!modoLectura || modoEdicionManual"
      label="Subir nuevos archivos (PDF, JPEG, PNG)"
      multiple
      accept=".jpg, image/*, .pdf"
      color="primary"
      text-color="white"
      :factory="uploadFactory"
      @start="subiendoArchivos = true"
      @finish="subiendoArchivos = false"
      @uploaded="onFileUploaded"
      @failed="onFileUploadFailed"
      class="full-width"
      style="max-width: 100%"
      hide-upload-btn
      auto-upload
    />
  </q-card-section>

    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 text-right q-gutter-x-sm">
      <q-btn 
        v-if="modoEdicionManual"
        flat
        color="grey-7"
        label="Cancelar"
        @click="cancelarEdicion"
      />
      <q-btn 
        :color="modoEdicionManual ? 'orange' : 'primary'" 
        :icon="modoEdicionManual ? 'save' : 'save'" 
        :label="modoEdicionManual ? 'Guardar Cambios' : 'Completar y Guardar'" 
        @click="completarServicio"
        :disable="subiendoArchivos"
      />
    </q-card-section>

    <!-- Modal visor de archivos -->
    <q-dialog v-model="dialogPreview" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-dark text-white full-height column">
        <q-card-section class="row items-center q-pb-none bg-black">
          <div class="text-h6 text-weight-bold" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">
             {{ archivoPreview?.nombre }}
          </div>
          <q-space />
          <q-btn 
            icon="download" 
            flat round dense 
            class="q-mr-sm"
            @click="descargarArchivo(archivoPreview?.url)"
          >
            <q-tooltip>Descargar Archivo</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense v-close-popup>
            <q-tooltip>Cerrar Visor</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator dark />

        <q-card-section class="col q-pa-none flex flex-center">
          <img 
            v-if="esImagen(archivoPreview?.url)" 
            :src="archivoPreview?.url" 
            style="max-width: 100%; max-height: 100%; object-fit: contain;" 
          />
          <iframe 
            v-else-if="archivoPreview?.url" 
            :src="archivoPreview?.url" 
            width="100%" 
            height="100%" 
            style="border: none;"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Notify } from 'quasar'
import Api from 'src/controles/api'
import { useDialogStore } from 'src/stores/DialogoUbicacion'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])

const modoEdicionManual = ref(false)
const subiendoArchivos = ref(false)
const dialogPreview = ref(false)
const archivoPreview = ref(null)
const store = useDialogStore()

const archivos = ref([]) // formato: { nombre: string, url: string, tipo: string }

const esImagen = (url) => {
  if (!url) return false
  if (url.toLowerCase().endsWith('.pdf')) return false
  return url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) != null || url.includes('/image/upload/')
}

const abrirArchivo = (archivo) => {
  let urlParaVer = archivo.url
  if (urlParaVer && urlParaVer.includes('fl_attachment')) {
    urlParaVer = urlParaVer.replace('fl_attachment/', '')  // Quitamos la bandera de attachment si queremos visualizarlo
  }
  
  archivoPreview.value = {
    ...archivo,
    url: urlParaVer
  }
  dialogPreview.value = true
}

const descargarArchivo = (url) => {
  let downloadUrl = url
  // Para descargar, forzamos fl_attachment si es de cloudinary
  if (url && url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
    downloadUrl = url.replace('/upload/', '/upload/fl_attachment/')
  }
  window.open(downloadUrl, '_blank')
}

const removerArchivo = (index) => {
  archivos.value.splice(index, 1)
}

const uploadFactory = (files) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tomamos solo el primer archivo (q-uploader pasa un array) o puedes iterar
      // pero el factory se suele llamar por cada lote.
      // Modificamos a enviar un FormData al backend
      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('idAtencion', props.atencionId) // Enviamos el id de la atencion según el backend

      const headers = {
        'Content-Type': 'multipart/form-data',
        'idsitio': store.id_sitio,
        'idsucursal': store.id_sucursal
      }

      // Endpoint especificado en el backend: @Controller('cloudinary') / @Post('upload')
      const urlUpload = `/cloudinary/upload` 

      // Hacemos la subida
      const response = await Api.post(urlUpload, formData, { headers })
      
      // Ajustamos asumiendo que el backend nos devuelve el archivo guardado (o al menos info con url)
      if (response.data) {
        archivos.value.push({
          nombre: response.data.nombre_original || file.name,
          url: response.data.url, // la URL que devuelve el backend
          tipo: file.type.includes('pdf') || response.data.url.endsWith('.pdf') ? 'raw' : 'image',
          public_id: response.data.public_id // opcional si el backend lo devuelve
        })
        
        Notify.create({
          type: 'positive',
          message: 'Archivo subido correctamente'
        })
        
        // Finalizamos el state de subida local
        resolve(response.data)
      } else {
        throw new Error('No se recibió la URL del archivo desde el servidor')
      }
    } catch (error) {
      console.error('Error al subir archivo:', error)
      Notify.create({
        type: 'negative',
        message: 'Hubo un error al subir el archivo'
      })
      reject(error)
    }
  })
}

// Estos métodos se pueden dejar vacíos si usamos nuestro custom logic con Axios en el factory,
// o se pueden usar si q-uploader maneja el request nativo (xmlhttprequest). 
// Arriba lo hicimos custom retornando y agregando a la lista directamente.
// Pero si usamos :factory, Quasar espera configs para hacer la subida. 
// Para sobreescribir la subida por completo y usar axios: se debe usar el método "custom" o atrapar el handler un upload method.

// Como hacemos custom upload con factory promise rejected/resolved logic y axios,
// no necesitamos el xhr.response parsing de onFileUploaded, pero lo mantenemos
// simplificado por si hay otros triggers.
const onFileUploaded = () => {
  // La carga exitosa ya de manejó en uploadFactory
}

const onFileUploadFailed = (info) => {
  console.error("Fallo al subir:", info)
  Notify.create({
    type: 'negative',
    message: 'Hubo un error al subir el archivo, verifica tu configuración de Cloudinary'
  })
}

const guardarCambios = () => {
  emit('servicio-actualizado', props.servicioId, {
    archivos_adjuntos: archivos.value
  })
}

const completarServicio = () => {
  if (subiendoArchivos.value) {
    Notify.create({ type: 'warning', message: 'Espera a que terminen de subir los archivos' })
    return
  }
  emit('servicio-completado', props.servicioId, {
    archivos_adjuntos: archivos.value,
    fecha_aplicacion: new Date().toISOString()
  })
  modoEdicionManual.value = false
}

const cancelarEdicion = () => {
  let datosRaw = props.datosIniciales?.adjuntos || props.datosIniciales?.archivos_adjuntos
  if (datosRaw) {
    let datos = datosRaw
    if (typeof datos === 'string') {
      try { datos = JSON.parse(datos) } catch (e) { datos = [] }
    }
    archivos.value = Array.isArray(datos) ? datos.map(d => ({
        nombre: d.nombre_original || d.nombre || 'Archivo',
        url: d.url,
        tipo: (d.url && d.url.toLowerCase().includes('.pdf')) ? 'raw' : 'image',
        public_id: d.public_id
    })) : []
  } else {
    archivos.value = []
  }
  modoEdicionManual.value = false
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

watch(archivos, guardarCambios, { deep: true })

const cargarArchivosBackend = async () => {
  try {
    // IMPORTANTE: Este es el endpoint sugerido, modifícalo si tu backend tiene otra ruta GET
    const urlGet = `/cloudinary/adjuntos/${props.servicioId}`
    const response = await Api.get(urlGet)
    
    if (response.data && Array.isArray(response.data)) {
      archivos.value = response.data.map(d => ({
        nombre: d.nombre_original || d.nombre || 'Archivo',
        url: d.url,
        tipo: (d.url && d.url.toLowerCase().includes('.pdf')) ? 'raw' : 'image',
        public_id: d.public_id
      }))
    }
  } catch (error) {
    console.warn('No se pudieron cargar adjuntos dinámicamente o no existen:', error)
  }
}

onMounted(async () => {
  // 1. Intentamos recuperar de props.datosIniciales
  let datosRaw = props.datosIniciales?.adjuntos || props.datosIniciales?.archivos_adjuntos
  if (datosRaw) {
      let archivosRecuperados = datosRaw
      if (typeof archivosRecuperados === 'string') {
        try {
          archivosRecuperados = JSON.parse(archivosRecuperados)
        } catch (e) {}
      }
      
      if (Array.isArray(archivosRecuperados)) {
        archivos.value = archivosRecuperados.map(d => ({
            nombre: d.nombre_original || d.nombre || 'Archivo',
            url: d.url,
            tipo: (d.url && d.url.toLowerCase().includes('.pdf')) ? 'raw' : 'image',
            public_id: d.public_id
        }))
      }
  }

  // 2. Disparamos la petición GET adicional para asegurar la información actualizada del backend
  if (props.servicioId) {
    await cargarArchivosBackend()
  }
})
</script>

<style scoped>
.servicio-card { margin-bottom: 20px; border-radius: 12px; }
.border-left-premium { border-left: 5px solid #1976d2; }
.bg-blue-1 { background: #ebf8ff; }
</style>
