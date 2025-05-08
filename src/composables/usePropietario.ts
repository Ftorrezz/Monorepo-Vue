import { ref } from 'vue';

export const usePropietario = () => {
  const propietarioForm = ref({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const validarPropietario = () => {
    // Lógica de validación
  };

  const guardarPropietario = async () => {
    // Lógica para guardar el propietario
  };

  return {
    propietarioForm,
    validarPropietario,
    guardarPropietario
  };
};