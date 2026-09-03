import Api from 'src/controles/api'
import { useDialogStore } from 'src/stores/DialogoUbicacion'
import { useAuthStore } from 'src/stores/Auth'

const contexto = () => {
  const store = useDialogStore()
  const authStore = useAuthStore()
  return {
    idsitio: store.id_sitio || 1,
    idsucursal: store.id_sucursal || 1,
    offset: 0,
    ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
  }
}

const exigirSesion = () => {
  const authStore = useAuthStore()
  if (!authStore.token) throw new Error('La sesión no está autenticada')
}

const datos = (response: any) => {
  const body = response?.data
  if (Array.isArray(body) && body[0]?.elemento !== undefined) return body[0].elemento || []
  return Array.isArray(body) ? body : (body?.data || body || [])
}

export default {
  async activas(filtros: Record<string, any> = {}) {
    exigirSesion()
    const response = await Api.get('/bitacora/tareas/activas', { params: filtros, headers: contexto() })
    return datos(response)
  },

  async historial(filtros: Record<string, any> = {}) {
    exigirSesion()
    const response = await Api.get('/bitacora/tareas/historial', { params: filtros, headers: contexto() })
    return datos(response)
  },

  async crear(tarea: Record<string, any>) {
    exigirSesion()
    const response = await Api.post('/bitacora/tareas', { ...tarea, id_sucursal: contexto().idsucursal }, { headers: contexto() })
    return datos(response)
  },

  async actualizarEstado(id: number, estado: string) {
    exigirSesion()
    const response = await Api.put(`/bitacora/tareas/${id}/estado`, { estado }, { headers: contexto() })
    return datos(response)
  },

  async comentarios(id: number) {
    exigirSesion()
    const response = await Api.get(`/bitacora/tareas/${id}/comentarios`, { headers: contexto() })
    return datos(response)
  },

  async agregarComentario(id: number, comentario: string) {
    exigirSesion()
    const response = await Api.post(`/bitacora/tareas/${id}/comentarios`, { comentario }, { headers: contexto() })
    return datos(response)
  },

  async usuarios() {
    exigirSesion()
    const response = await Api.get('/usuario', { headers: contexto() })
    return datos(response)
  }
}
