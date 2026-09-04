<template>
  <q-card class="able-card bitacora-card column shadow-2">
    <q-card-section class="row items-center justify-between border-bottom q-py-md q-px-md bg-blue-1">
      <div>
        <div class="text-h6 text-weight-bolder text-primary row items-center" style="letter-spacing: -0.5px;">
          <q-icon name="assignment_turned_in" size="sm" class="q-mr-sm" />
          Bitácora de Tareas
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">Pendientes de la sucursal activa · revisión rápida</div>
      </div>
      <div class="row q-gutter-sm items-center">
        <div class="row items-center q-gutter-sm" style="margin-right:8px">
          <q-select v-model="filtros.estado" dense outlined bg-color="white" label="Estado" :options="estados" emit-value map-options style="width:140px" @update:model-value="cargarActivas" />
          <q-select v-model="filtros.prioridad" dense outlined bg-color="white" label="Prioridad" :options="prioridades" emit-value map-options style="width:120px" @update:model-value="cargarActivas" />
        </div>
        <q-btn flat round dense icon="history" color="grey-7" class="hover-icon" @click="mostrarHistorial = true">
          <q-tooltip>Ver historial</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="refresh" color="grey-7" class="hover-icon" @click="cargarUsuarios">
          <q-tooltip>Recargar usuarios</q-tooltip>
        </q-btn>
        <q-btn class="btn-nueva" icon="add" label="Nueva Tarea" no-caps @click="abrirNueva" />
      </div>
    </q-card-section>

    <!-- Filters moved to header to save space -->

    <q-card-section class="q-pa-none col" style="overflow-y: auto; overflow-x: hidden;">
      <q-list separator>
        <q-item v-for="tarea in tareas" :key="tarea.id" class="q-py-md" :class="{ 'tarea-completada': tarea.estado === 'COMPLETADA' }">
          <q-item-section side top style="z-index: 10;">
            <q-btn
              :color="estadoColor(tarea.estado)"
              glossy
              padding="4px 12px"
              icon-right="keyboard_arrow_down"
              :label="estadoLabel(tarea.estado)"
              no-caps
              size="sm"
            >
              <q-menu fit anchor="bottom right" self="top right" transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 160px">
                  <q-item clickable v-close-popup @click="setEstado(tarea, 'PENDIENTE')">
                    <q-item-section avatar style="min-width: 36px"><q-icon name="schedule" color="grey-6" size="sm" /></q-item-section>
                    <q-item-section>Pendiente</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setEstado(tarea, 'EN_PROCESO')">
                    <q-item-section avatar style="min-width: 36px"><q-icon name="autorenew" color="orange" size="sm" /></q-item-section>
                    <q-item-section>En proceso</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setEstado(tarea, 'COMPLETADA')">
                    <q-item-section avatar style="min-width: 36px"><q-icon name="check_circle" color="positive" size="sm" /></q-item-section>
                    <q-item-section>Completada</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ tarea.titulo?.toUpperCase() }}</q-item-label>
            <q-item-label caption lines="1" class="row items-center q-gutter-x-sm q-mt-xs">
              <q-badge :color="colorPrioridad(tarea.prioridad)" :label="tarea.prioridad" />
              <span v-if="tarea.descripcion" class="ellipsis text-grey-8" style="max-width: 250px" :title="tarea.descripcion">{{ tarea.descripcion }}</span>
              <span v-if="tarea.descripcion" class="text-grey-5">•</span>
              <span>Asignada a <span class="text-weight-medium">{{ nombreUsuario(tarea.id_usuario_asignado) }}</span></span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="forum" :color="(comentariosMapa[tarea.id] || 0) > 0 ? 'negative' : 'primary'" @click="abrirComentarios(tarea)">
              <q-tooltip>Comentarios</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item v-if="!cargando && tareas.length === 0">
          <q-item-section class="text-center text-grey-6 q-pa-lg">No hay tareas pendientes</q-item-section>
        </q-item>
        <q-item v-if="cargando"><q-item-section class="text-center q-pa-lg"><q-spinner color="primary" /></q-item-section></q-item>
      </q-list>
      </q-card-section>
  </q-card>

  <q-dialog v-model="mostrarNueva" transition-show="jump-up" transition-hide="jump-down">
    <q-card style="width: 560px; max-width: 95vw; border-radius: 12px;" class="shadow-4">
      <q-card-section class="bg-primary text-white row items-center q-py-sm">
        <q-icon name="add_task" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold" style="letter-spacing: -0.5px">Crear Nueva Tarea</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-lg q-pb-md q-px-lg">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input v-model="form.titulo" outlined label="Título de la tarea" color="primary" class="text-weight-medium">
              <template v-slot:prepend>
                <q-icon name="title" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <q-input v-model="form.descripcion" outlined type="textarea" label="Descripción detallada (opcional)" color="primary" rows="3">
              <template v-slot:prepend>
                <q-icon name="notes" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-select v-model="form.id_usuario_asignado" outlined label="Asignar a" :options="usuariosOpciones" emit-value map-options color="primary">
              <template v-slot:prepend>
                <q-icon name="person_outline" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6">
            <q-select v-model="form.prioridad" outlined label="Prioridad" :options="prioridades.filter(p => p.value !== 'TODAS')" emit-value map-options color="primary">
              <template v-slot:prepend>
                <q-icon name="flag" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12">
            <q-input v-model="form.fecha_limite" outlined type="date" label="Fecha límite" color="primary">
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-px-lg q-py-md bg-grey-1">
        <q-btn flat label="Cancelar" color="grey-8" class="q-mr-sm" v-close-popup no-caps />
        <q-btn class="btn-nueva" icon="save" label="Guardar Tarea" :loading="guardando" @click="guardar" no-caps />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarComentarios">
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section class="text-h6">Comentarios: {{ tareaSeleccionada?.titulo }}</q-card-section>
      <q-card-section class="q-pa-none" style="max-height: 320px; overflow: auto">
          <q-list separator>
            <q-item v-for="comentario in comentarios" :key="comentario.id">
            <q-item-section><q-item-label>{{ comentario.comentario }}</q-item-label><q-item-label caption>{{ comentario.fecha_creacion }}</q-item-label></q-item-section>
          </q-item>
          <q-item v-if="comentarios.length === 0"><q-item-section class="text-grey-6">Aún no hay comentarios</q-item-section></q-item>
        </q-list>
      </q-card-section>
      <q-card-section><q-input v-model="nuevoComentario" outlined dense label="Agregar comentario" @keyup.enter="agregarComentario" /></q-card-section>
      <q-card-actions align="right"><q-btn flat label="Cerrar" v-close-popup /><q-btn color="primary" label="Comentar" :disable="!nuevoComentario.trim()" @click="agregarComentario" /></q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarHistorial">
    <q-card style="width: 760px; max-width: 95vw">
      <q-card-section class="row items-center justify-between"><div class="text-h6">Historial de tareas</div><q-btn flat round dense icon="refresh" @click="cargarHistorial" /></q-card-section>
      <q-card-section class="q-pa-none" style="max-height: 520px; overflow: auto">
        <q-list separator>
          <q-item v-for="tarea in historial" :key="tarea.id"><q-item-section><q-item-label>{{ tarea.titulo }}</q-item-label><q-item-label caption>{{ tarea.estado }} · {{ tarea.prioridad }} · {{ tarea.fecha_creacion }}</q-item-label></q-item-section></q-item>
          <q-item v-if="historial.length === 0"><q-item-section class="text-grey-6">No hay tareas anteriores</q-item-section></q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useDialogStore } from 'src/stores/DialogoUbicacion'
import { useAuthStore } from 'src/stores/Auth'
import { io } from 'socket.io-client'
import bitacoraTareasService from 'src/services/bitacoraTareas.service'

const $q = useQuasar()
const sucursalStore = useDialogStore()
const authStore = useAuthStore()
const tareas = ref([])
const historial = ref([])
const usuarios = ref([])
const comentarios = ref([])
const tareaSeleccionada = ref(null)
const nuevoComentario = ref('')
const cargando = ref(false)
const guardando = ref(false)
const mostrarNueva = ref(false)
const mostrarComentarios = ref(false)
const mostrarHistorial = ref(false)
const filtros = reactive({ estado: 'TODOS', prioridad: 'TODAS' })
const form = reactive({ titulo: '', descripcion: '', id_usuario_asignado: null, prioridad: 'MEDIA', fecha_limite: '' })
const estados = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'En proceso', value: 'EN_PROCESO' },
  { label: 'Completadas', value: 'COMPLETADA' }
]
const prioridades = [
  { label: 'Todas', value: 'TODAS' },
  { label: 'Baja', value: 'BAJA' },
  { label: 'Media', value: 'MEDIA' },
  { label: 'Alta', value: 'ALTA' },
  { label: 'Urgente', value: 'URGENTE' }
]
let socket = null
const usuariosOpciones = computed(() => usuarios.value.filter(usuario => usuario.activo !== 'N').map(usuario => ({ label: usuario.nombreusuario, value: usuario.id })))
const comentariosMapa = reactive({})

const cargarActivas = async () => {
  cargando.value = true
  try {
    const parametros = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value !== null && value !== undefined && value !== ''))
    
    if (parametros.estado === 'TODOS') delete parametros.estado
    if (parametros.prioridad === 'TODAS') delete parametros.prioridad

    let nuevasTareas = []
    if (filtros.estado === 'COMPLETADA') {
      nuevasTareas = await bitacoraTareasService.historial(parametros)
    } else if (filtros.estado === 'TODOS') {
      const [activas, historial] = await Promise.all([
        bitacoraTareasService.activas(parametros),
        bitacoraTareasService.historial(parametros)
      ])
      const map = new Map()
      activas.forEach(t => map.set(t.id, t))
      historial.forEach(t => map.set(t.id, t))
      nuevasTareas = Array.from(map.values())
    } else {
      nuevasTareas = await bitacoraTareasService.activas(parametros)
    }
    
    tareas.value = nuevasTareas

    // Cargar cantidad de comentarios en segundo plano para colorear el botón
    nuevasTareas.forEach(async (t) => {
      try {
        const coms = await bitacoraTareasService.comentarios(t.id)
        comentariosMapa[t.id] = coms.length
      } catch (e) {}
    })
  } catch (error) {
    console.error('Error al cargar tareas:', error)
    $q.notify({ type: 'negative', message: error?.response?.status === 401 ? 'Sesión no autorizada. Vuelve a iniciar sesión.' : 'No se pudieron cargar las tareas' })
  } finally {
    cargando.value = false
  }
}
const cargarHistorial = async () => { historial.value = await bitacoraTareasService.historial() }
const cargarUsuarios = async () => {
  try {
    usuarios.value = await bitacoraTareasService.usuarios()
  } catch (error) {
    console.error('Error al cargar usuarios de bitácora:', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.status === 401 ? 'Sesión no autorizada. Vuelve a iniciar sesión.' : 'No se pudieron cargar los usuarios de la bitácora',
      actions: [
        { label: 'Reintentar', color: 'white', handler: () => cargarUsuarios() }
      ]
    })
    usuarios.value = []
  }
}
const abrirNueva = () => { Object.assign(form, { titulo: '', descripcion: '', id_usuario_asignado: null, prioridad: 'MEDIA', fecha_limite: '' }); mostrarNueva.value = true }
const guardar = async () => {
  if (!form.titulo.trim()) return $q.notify({ type: 'warning', message: 'El título es requerido' })
  // Force uppercase for titles
  form.titulo = form.titulo.toUpperCase()
  guardando.value = true
  try {
    await bitacoraTareasService.crear(form)
    mostrarNueva.value = false
    await cargarActivas()
    $q.notify({ type: 'positive', message: 'Tarea creada correctamente' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'No se pudo crear la tarea' })
  } finally { guardando.value = false }
}
const openEstadoMenu = ref(null)
const cambiarEstado = async tarea => {
  // backward-compatible quick toggle: PENDIENTE -> EN_PROCESO -> COMPLETADA
  const siguiente = tarea.estado === 'PENDIENTE' ? 'EN_PROCESO' : (tarea.estado === 'EN_PROCESO' ? 'COMPLETADA' : 'PENDIENTE')
  try {
    await bitacoraTareasService.actualizarEstado(tarea.id, siguiente)
    await cargarActivas()
  } catch (error) {
    console.error('Error cambiando estado:', error)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar el estado' })
  }
}

const setEstado = async (tarea, estado) => {
  try {
    await bitacoraTareasService.actualizarEstado(tarea.id, estado)
    await cargarActivas()
  } catch (error) {
    console.error('Error al establecer estado:', error)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar el estado' })
  }
}
const estadoLabel = (estado) => (estado === 'COMPLETADA' ? 'Completada' : (estado === 'EN_PROCESO' ? 'En proceso' : 'Pendiente'))
const estadoColor = (estado) => (estado === 'COMPLETADA' ? 'positive' : (estado === 'EN_PROCESO' ? 'orange' : 'grey-6'))
const abrirComentarios = async tarea => {
  tareaSeleccionada.value = tarea
  comentarios.value = await bitacoraTareasService.comentarios(tarea.id)
  comentariosMapa[tarea.id] = comentarios.value.length
  nuevoComentario.value = ''
  mostrarComentarios.value = true
}
const agregarComentario = async () => { await bitacoraTareasService.agregarComentario(tareaSeleccionada.value.id, nuevoComentario.value.trim()); comentarios.value = await bitacoraTareasService.comentarios(tareaSeleccionada.value.id); nuevoComentario.value = '' }
const nombreUsuario = id => usuarios.value.find(usuario => Number(usuario.id) === Number(id))?.nombreusuario || 'sin asignar'
const colorPrioridad = prioridad => ({ URGENTE: 'negative', ALTA: 'orange', MEDIA: 'primary', BAJA: 'positive' }[prioridad] || 'grey')
watch(() => sucursalStore.id_sucursal, cargarActivas)
watch(mostrarHistorial, valor => { if (valor) cargarHistorial() })
onMounted(() => {
  cargarUsuarios()
  cargarActivas()
  if (authStore.token && authStore.id_usuario) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:81', { transports: ['websocket'], auth: { token: authStore.token } })
    socket.on('connect', () => socket.emit('user_join', authStore.id_usuario))
    socket.on('tarea_asignada', tarea => {
      tareas.value = [tarea, ...tareas.value.filter(item => item.id !== tarea.id)]
      $q.notify({ type: 'info', icon: 'assignment', message: `Te asignaron: ${tarea.titulo}`, position: 'top' })
    })
  }
})
onUnmounted(() => { if (socket) socket.disconnect() })
</script>

<style scoped>
.bitacora-card { height: 440px; border-radius: 12px; overflow: hidden; }
.tarea-completada .q-item-label { text-decoration: line-through; opacity: 0.6; }
.tarea-completada .q-badge { opacity: 0.6; }
.bitacora-card .q-list .q-item { transition: background-color .2s ease, transform .2s ease; border-left: 3px solid transparent; }
.bitacora-card .q-list .q-item:hover { background-color: #f8faff; transform: translateX(2px); border-left-color: #448aff; }

/* Modern New Button */
.btn-nueva {
  background: linear-gradient(135deg, #448aff 0%, #2962ff 100%);
  color: white;
  border-radius: 8px;
  padding: 4px 18px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(68, 138, 255, 0.35);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn-nueva:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(68, 138, 255, 0.5);
}

.hover-icon { transition: transform 0.2s; }
.hover-icon:hover { transform: scale(1.1); color: #448aff !important; }
</style>
