import NdPeticionControl from "src/controles/rest.control";
import { ref, onMounted } from "vue";

export default function useListas() {
  /**
   * Obtiene una lista genérica desde el backend
   * @param {string} endpoint - El endpoint para obtener la lista
   * @param {Object} options - Opciones de configuración
   * @param {string} options.valueField - Campo a usar como value (default: 'id')
   * @param {string} options.labelField - Campo a usar como label (default: 'descripcion')
   * @param {Object} options.filtro - Filtro opcional para la petición
   * @param {boolean} options.cargarAlIniciar - Si debe cargar al iniciar (default: true)
   * @returns {Object} - Objeto con la lista y métodos para manipularla
   */
  const obtenerLista = (endpoint, options = {}) => {
    const {
      valueField = 'id',
      labelField = 'descripcion',
      filtro = null,
      cargarAlIniciar = true
    } = options;

    const lista = ref([]);
    const cargando = ref(false);
    const error = ref(null);

    // Función para cargar los datos
    const cargarDatos = async () => {
      cargando.value = true;
      error.value = null;
      
      try {
        const _peticion = new NdPeticionControl();
        let parametros = null;
        
        if (filtro) {
          parametros = { filtro };
        }
        
        const _respuesta = await _peticion.invocarMetodo(endpoint, "get", null, parametros);
               
        // Transformar la respuesta al formato esperado por q-select
        lista.value = _respuesta.map(item => ({
          value: item[valueField],
          label: item[labelField],
          // Mantener el objeto original para acceso a otros campos
          original: item
        }));
      } catch (err) {
        error.value = err;
        console.error(`Error al cargar lista desde ${endpoint}:`, err);
      } finally {
        cargando.value = false;
      }
    };

    // Cargar datos al iniciar si se especifica
    if (cargarAlIniciar) {
      onMounted(cargarDatos);
    }

    return {
      lista,
      cargando,
      error,
      cargarDatos
    };
  };

  return {
    obtenerLista
  };
}