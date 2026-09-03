<template>
  <q-card class="able-card bitacora-card full-height column">
    <q-card-section class="row items-center justify-between border-bottom q-py-sm">
      <div>
        <div class="text-subtitle1 text-weight-bold text-grey-9">Bitácora de tareas</div>
        <div class="text-caption text-grey-6">Pendientes de la sucursal activa</div>
      </div>
      <div class="row q-gutter-xs">
        <q-btn flat round dense icon="history" color="grey-7" @click="mostrarHistorial = true">
          <q-tooltip>Ver historial</q-tooltip>
        </q-btn>
        <q-btn unelevated dense icon="add" label="Nueva" color="primary" no-caps @click="abrirNueva" />
      </div>
    </q-card-section>

    <q-card-section class="q-py-sm row q-col-gutter-sm">
      <q-select v-model="filtros.estado" dense outlined clearable label="Estado" :options="estados" emit-value map-options class="col" @update:model-value="cargarActivas" />
      <q-select v-model="filtros.prioridad" dense outlined clearable label="Prioridad" :options="prioridades" emit-value map-options class="col" @update:model-value="cargarActivas" />
    </q-card-section>

    <q-card-section class="q-pa-none col scroll">
      <q-list separator>
        <q-item v-for="tarea in tareas" :key="tarea.id" class="q-py-md">
          <q-item-section side top>
            <q-btn flat round dense :icon="tarea.estado === 'EN_PROCESO' ? 'pending' : 'radio_button_unchecked'" :color="tarea.estado === 'EN_PROCESO' ? 'orange' : 'grey-6'" @click="cambiarEstado(tarea)">
              <q-tooltip>Cambiar estado</q-tooltip>
            </q-btn>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ tarea.titulo }}</q-item-label>
            <q-item-label v-if="tarea.descripcion" caption lines="2">{{ tarea.descripcion }}</q-item-label>
            <q-item-label caption class="q-mt-xs">
              <q-badge :color="colorPrioridad(tarea.prioridad)" :label="tarea.prioridad" class="q-mr-xs" />
              <span>Asignada a {{ nombreUsuario(tarea.id_usuario_asignado) }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="forum" color="primary" @click="abrirComentarios(tarea)">
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

  <q-dialog v-model="mostrarNueva">
    <q-card style="width: 520px; max-width: 95vw">
      <q-card-section class="text-h6">Nueva tarea</q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input v-model="form.titulo" outlined dense label="Título" />
        <q-input v-model="form.descripcion" outlined dense type="textarea" label="Descripción" />
        <q-select v-model="form.id_usuario_asignado" outlined dense label="Asignar a" :options="usuariosOpciones" emit-value map-options />
        <q-select v-model="form.prioridad" outlined dense label="Prioridad" :options="prioridades" emit-value map-options />
        <q-input v-model="form.fecha_limite" outlined dense type="date" label="Fecha límite" />
      </q-card-section>
      <q-card-actions align="right"><q-btn flat label="Cancelar" v-close-popup /><q-btn color="primary" label="Guardar" :loading="guardando" @click="guardar" /></q-card-actions>
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
const filtros = reactive({ estado: null, prioridad: null })
const form = reactive({ titulo: '', descripcion: '', id_usuario_asignado: null, prioridad: 'MEDIA', fecha_limite: '' })
const estados = [{ label: 'Pendientes', value: 'PENDIENTE' }, { label: 'En proceso', value: 'EN_PROCESO' }]
const prioridades = [{ label: 'Baja', value: 'BAJA' }, { label: 'Media', value: 'MEDIA' }, { label: 'Alta', value: 'ALTA' }, { label: 'Urgente', value: 'URGENTE' }]
let socket = null
const usuariosOpciones = computed(() => usuarios.value.filter(usuario => usuario.activo !== 'N').map(usuario => ({ label: usuario.nombreusuario, value: usuario.id })))

const cargarActivas = async () => {
  cargando.value = true
  try { tareas.value = await bitacoraTareasService.activas(Object.fromEntries(Object.entries(filtros).filter(([, value]) => value))) } catch (error) { console.error('Error al cargar tareas:', error); $q.notify({ type: 'negative', message: error?.response?.status === 401 ? 'Sesión no autorizada. Vuelve a iniciar sesión.' : 'No se pudieron cargar las tareas' }) } finally { cargando.value = false }
}
const cargarHistorial = async () => { historial.value = await bitacoraTareasService.historial() }
const cargarUsuarios = async () => { usuarios.value = await bitacoraTareasService.usuarios() }
const abrirNueva = () => { Object.assign(form, { titulo: '', descripcion: '', id_usuario_asignado: null, prioridad: 'MEDIA', fecha_limite: '' }); mostrarNueva.value = true }
const guardar = async () => {
  if (!form.titulo.trim()) return $q.notify({ type: 'warning', message: 'El título es requerido' })
  guardando.value = true
  try { await bitacoraTareasService.crear(form); mostrarNueva.value = false; await cargarActivas(); $q.notify({ type: 'positive', message: 'Tarea creada correctamente' }) } catch (error) { $q.notify({ type: 'negative', message: 'No se pudo crear la tarea' }) } finally { guardando.value = false }
}
const cambiarEstado = async tarea => { const siguiente = tarea.estado === 'PENDIENTE' ? 'EN_PROCESO' : 'COMPLETADA'; await bitacoraTareasService.actualizarEstado(tarea.id, siguiente); await cargarActivas() }
const abrirComentarios = async tarea => { tareaSeleccionada.value = tarea; comentarios.value = await bitacoraTareasService.comentarios(tarea.id); nuevoComentario.value = ''; mostrarComentarios.value = true }
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
.bitacora-card { min-height: 420px; }
</style>
