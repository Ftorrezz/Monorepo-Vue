<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-tabs v-model="tab" class="text-primary">
        <q-tab name="general" label="General" />
        <q-tab name="facturacion" label="Facturación" />
        <q-tab name="observaciones" label="Observaciones" />
        <q-tab name="otros" label="Otros datos" />
        <q-tab name="rgpd" label="RGPD" />
      </q-tabs>

      <q-tab-panels v-model="tab" class="q-pa-md">
        <q-tab-panel name="general">
          <q-form>
            <q-card-section>
              <div class="text-h6">Identificación</div>
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <q-input v-model="cliente.apellido1" label="Primer Apellido" outlined />
                </div>
                <div class="col-4">
                  <q-input v-model="cliente.apellido2" label="Segundo Apellido" outlined />
                </div>
                <div class="col-4">
                  <q-input v-model="cliente.nombre" label="Nombre" outlined />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="text-h6">Datos de contacto</div>
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <q-input v-model="cliente.documento" label="Documento" outlined />
                </div>
                <div class="col-4">
                  <q-select v-model="cliente.tipoDocumento" :options="['RFC', 'DNI', 'Pasaporte']" label="Tipo Documento" outlined />
                </div>
                <div class="col-4">
                  <q-input v-model="cliente.codigo" label="Código" outlined />
                </div>
              </div>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-3">
                  <q-input v-model="cliente.cp" label="C.P." outlined />
                </div>
                <div class="col-3">
                  <q-input v-model="cliente.poblacion" label="Población" outlined />
                </div>
                <div class="col-3">
                  <q-input v-model="cliente.telefono" label="Teléfono" outlined />
                </div>
                <div class="col-3">
                  <q-input v-model="cliente.fax" label="Fax" outlined />
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <q-select v-model="cliente.pais" :options="['México', 'España', 'Argentina']" label="País" outlined />
                </div>
                <div class="col-4">
                  <q-select v-model="cliente.idioma" :options="['Castellano', 'Inglés', 'Francés']" label="Idioma" outlined />
                </div>
                <div class="col-4">
                  <q-input v-model="cliente.web" label="Web" outlined />
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-sm">
              <q-checkbox v-model="cliente.activo" label="Activo" />
            </q-card-section>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>

      <q-card-actions align="right">
        <q-btn label="Guardar" color="primary" />
        <q-btn label="Cerrar" flat />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      tab: 'general',
      cliente: {
        apellido1: '',
        apellido2: '',
        nombre: '',
        documento: '',
        tipoDocumento: '',
        codigo: '',
        cp: '',
        poblacion: '',
        telefono: '',
        fax: '',
        pais: '',
        idioma: '',
        web: '',
        activo: false
      }
    };
  }
};
</script>
