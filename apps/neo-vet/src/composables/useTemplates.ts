import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export function useTemplates() {
  const $q = useQuasar()
  const templates = ref([])
  const loading = ref(false)
  const moduleFilter = ref(null)
  const showInactive = ref(false)

  const filteredTemplates = computed(() => {
    let filtered = [...templates.value]
    if (moduleFilter.value) {
      filtered = filtered.filter(t => t.modules.includes(moduleFilter.value))
    }
    if (!showInactive.value) {
      filtered = filtered.filter(t => t.active)
    }
    return filtered
  })

  const loadTemplates = async () => {
    loading.value = true
    try {
      // Aquí iría la llamada a la API
      templates.value = []
    } catch (error) {
      $q.notify({ message: 'Error al cargar plantillas', color: 'negative' })
    } finally {
      loading.value = false
    }
  }

  const saveTemplate = async (template) => {
    try {
      // Aquí iría la llamada a la API
      await loadTemplates()
      return true
    } catch (error) {
      $q.notify({ message: 'Error al guardar plantilla', color: 'negative' })
      return false
    }
  }

  return {
    templates,
    loading,
    moduleFilter,
    showInactive,
    filteredTemplates,
    loadTemplates,
    saveTemplate
  }
}
