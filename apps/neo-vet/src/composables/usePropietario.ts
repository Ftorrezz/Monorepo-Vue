import { ref } from 'vue';

export interface Propietario {
  primerapellido: string;
  segundoapellido: string;
  nombre: string;
  correo: string;
  telefonocelular: string;
  // ... resto de propiedades
}

export function usePropietario() {
  const tabPropietario = ref('general');
  const formData = ref({
    propietario: {
      primerapellido: '',
      segundoapellido: '',
      nombre: '',
      correo: '',
      telefonocelular: '',
      // ... resto de campos
    }
  });

  // ... funciones de cámara y validación

  const guardarPropietario = async () => {
    // Lógica para guardar el propietario
    return formData.value.propietario;
  };

  return {
    tabPropietario,
    formData,
    guardarPropietario,
    // ... resto de funciones
  };
}