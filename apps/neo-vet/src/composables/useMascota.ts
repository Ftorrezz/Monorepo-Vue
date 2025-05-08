import { ref } from 'vue';

export interface Mascota {
  id?: number;
  id_propietario: number;
  nombre: string;
  chip: string;
  fechachip?: Date;
  tatuaje: string;
  fechanacimiento?: Date;
  edad: number;
  pedrigri: string;
  observaciones: string;
  id_especie: number;
  id_raza: number;
  id_color: number;
  id_sexo: number;
  id_habitat: number;
  id_caracter: number;
  id_dieta: number;
  activo: string;
  esterilizado: string;
}

export function useMascota(propietarioId: number) {
  const tabMascota = ref('general');
  const formData = ref({
    mascota: {
      id_propietario: propietarioId,
      nombre: '',
      chip: '',
      // ... resto de campos
    }
  });

  // ... funciones de cámara

  const guardarMascota = async () => {
    // Lógica para guardar la mascota
    return formData.value.mascota;
  };

  return {
    tabMascota,
    formData,
    guardarMascota,
    // ... resto de funciones
  };
}