<template>
  <q-card class="full-height">
    <q-card-section>
      <div class="text-h6 text-primary">
        <q-icon name="dns" class="q-mr-sm" />
        Variables Disponibles
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-none">
      <q-expansion-item
        v-for="group in variableGroups"
        :key="group.category"
        :label="group.category"
        :icon="group.icon"
        default-opened
        header-class="text-weight-medium"
      >
        <div class="q-pa-md">
          <q-btn
            v-for="variable in group.variables"
            :key="variable.value"
            :label="variable.label"
            color="primary"
            outline
            size="sm"
            class="full-width q-mb-xs"
            @click="$emit('insert-variable', variable.value)"
          >
            <q-tooltip>{{ variable.value }}</q-tooltip>
          </q-btn>
        </div>
     </q-expansion-item>
   </q-card-section>

   <q-separator />

   <q-card-section>
     <div class="text-subtitle2 q-mb-sm">🎨 Elementos Rápidos</div>
     <q-btn
       label="Encabezado"
       color="secondary"
       outline
       size="sm"
       class="full-width q-mb-xs"
       @click="insertQuickElement('header')"
     />
     <q-btn
       label="Tabla Datos"
       color="secondary"
       outline
       size="sm"
       class="full-width q-mb-xs"
       @click="insertQuickElement('table')"
     />
     <q-btn
       label="Firma"
       color="secondary"
       outline
       size="sm"
       class="full-width"
       @click="insertQuickElement('signature')"
     />
   </q-card-section>
 </q-card>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['insert-variable']);

const variableGroups = ref([
 {
   category: '🏥 Clínica',
   icon: 'local_hospital',
   variables: [
     { label: 'Nombre Clínica', value: '{{clinica.nombre}}' },
     { label: 'Dirección', value: '{{clinica.direccion}}' },
     { label: 'Teléfono', value: '{{clinica.telefono}}' },
     { label: 'Email', value: '{{clinica.email}}' },
     { label: 'Website', value: '{{clinica.website}}' }
   ]
 },
 {
   category: '👨‍⚕️ Veterinario',
   icon: 'person',
   variables: [
     { label: 'Nombre', value: '{{veterinario.nombre}}' },
     { label: 'Cédula', value: '{{veterinario.cedula}}' },
     { label: 'Especialidad', value: '{{veterinario.especialidad}}' },
     { label: 'Título', value: '{{veterinario.titulo}}' }
   ]
 },
 {
   category: '👤 Propietario',
   icon: 'account_circle',
   variables: [
     { label: 'Nombre', value: '{{propietario.nombre}}' },
     { label: 'Teléfono', value: '{{propietario.telefono}}' },
     { label: 'Email', value: '{{propietario.email}}' },
     { label: 'Dirección', value: '{{propietario.direccion}}' },
     { label: 'Documento', value: '{{propietario.documento}}' }
   ]
 },
 {
   category: '🐕 Mascota',
   icon: 'pets',
   variables: [
     { label: 'Nombre', value: '{{mascota.nombre}}' },
     { label: 'Especie', value: '{{mascota.especie}}' },
     { label: 'Raza', value: '{{mascota.raza}}' },
     { label: 'Edad', value: '{{mascota.edad}}' },
     { label: 'Peso', value: '{{mascota.peso}}' },
     { label: 'Color', value: '{{mascota.color}}' },
     { label: 'Sexo', value: '{{mascota.sexo}}' },
     { label: 'ID/Chip', value: '{{mascota.chip}}' }
   ]
 },
 {
   category: '📅 Fecha y Servicios',
   icon: 'event',
   variables: [
     { label: 'Fecha Actual', value: '{{fecha.actual}}' },
     { label: 'Fecha Cita', value: '{{fecha.cita}}' },
     { label: 'Hora', value: '{{fecha.hora}}' },
     { label: 'Tipo Servicio', value: '{{servicio.tipo}}' },
     { label: 'Descripción', value: '{{servicio.descripcion}}' },
     { label: 'Precio', value: '{{servicio.precio}}' },
     { label: 'Observaciones', value: '{{servicio.observaciones}}' }
   ]
 }
]);

const quickElements = {
 header: `
   <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1976d2; padding-bottom: 20px;">
     <h2 style="color: #1976d2; margin-bottom: 10px;">{{clinica.nombre}}</h2>
     <p style="color: #666;">{{clinica.direccion}} | Tel: {{clinica.telefono}}</p>
     <p style="color: #666;">{{clinica.email}}</p>
   </div>
 `,
 table: `
   <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
     <tr>
       <td style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5; font-weight: bold;">Propietario:</td>
       <td style="border: 1px solid #ddd; padding: 10px;">{{propietario.nombre}}</td>
     </tr>
     <tr>
       <td style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5; font-weight: bold;">Mascota:</td>
       <td style="border: 1px solid #ddd; padding: 10px;">{{mascota.nombre}} - {{mascota.especie}}</td>
     </tr>
     <tr>
       <td style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5; font-weight: bold;">Fecha:</td>
       <td style="border: 1px solid #ddd; padding: 10px;">{{fecha.cita}}</td>
     </tr>
   </table>
 `,
 signature: `
   <div style="margin-top: 60px; text-align: center;">
     <div style="border-top: 2px solid #333; width: 250px; margin: 0 auto; padding-top: 10px;">
       <p style="font-weight: bold; font-size: 16px;">{{veterinario.nombre}}</p>
       <p style="font-size: 14px; color: #666;">{{veterinario.especialidad}}</p>
       <p style="font-size: 12px; color: #666;">Cédula Profesional: {{veterinario.cedula}}</p>
     </div>
   </div>
 `
};

const insertQuickElement = (type) => {
 emit('insert-variable', quickElements[type]);
};
</script>