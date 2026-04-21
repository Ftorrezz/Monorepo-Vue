<template>
  <q-dialog v-model="internalModel" persistent maximized transition-show="scale" transition-hide="scale">
    <q-card class="column bg-grey-2">
      <!-- Header -->
      <q-card-section class="row items-center bg-white q-py-sm shadow-1">
        <div class="text-h6 text-secondary row items-center">
          <q-icon name="history_edu" class="q-mr-sm" size="md" />
          Previsualización y Firma de Documento
        </div>
        <q-space />
        <div class="q-gutter-sm">
          <q-btn flat round icon="close" v-close-popup />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Content Area -->
      <q-card-section class="col scroll q-pa-lg flex flex-center">
        <div class="document-container shadow-15 bg-white q-pa-none overflow-hidden" ref="pdfContent">
           <!-- El contenido HTML se inyecta aquí -->
           <div v-html="htmlContent" class="document-preview" style="width: 210mm; min-height: 297mm; padding: 20mm; background: white;"></div>
        </div>
      </q-card-section>

      <!-- Signature Pad Area -->
      <q-card-section class="bg-white q-pa-md shadow-up-1">
        <div class="row justify-center q-col-gutter-lg">
          <div class="col-12 col-md-6 col-lg-4">
            <div class="signature-box border-dashed rounded-borders q-pa-sm bg-grey-1 relative-position">
              <div class="text-caption text-grey-6 q-mb-xs row items-center">
                <q-icon name="edit" class="q-mr-xs" /> Trace su firma aquí:
              </div>
              <VueSignaturePad
                width="100%"
                height="200px"
                ref="signaturePad"
                :options="{
                  penColor: '#000000',
                  onEnd: () => { emptySignature = false }
                }"
                class="bg-white rounded-borders"
              />
              <q-btn
                flat round dense
                icon="delete"
                color="negative"
                class="absolute-top-right q-ma-xs"
                @click="clearSignature"
              >
                <q-tooltip>Limpiar Firma</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <div class="row justify-center q-mt-md q-gutter-md">
          <q-btn outline label="Cancelar" color="grey-7" v-close-popup style="min-width: 120px" />
          <q-btn
            unelevated
            label="Firmar y Guardar Documento"
            color="primary"
            icon="cloud_upload"
            @click="onSave"
            :disable="emptySignature"
            style="min-width: 220px"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueSignaturePad } from 'vue-signature-pad'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  htmlContent: { type: String, default: '' },
  documentName: { type: String, default: 'Documento' }
})

const emit = defineEmits(['update:modelValue', 'signed-and-saved'])

const signaturePad = ref(null)
const emptySignature = ref(true)
const pdfContent = ref(null)

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const clearSignature = () => {
  signaturePad.value.clearSignature()
  emptySignature.value = true
}

const onSave = () => {
  const { isEmpty, data } = signaturePad.value.saveSignature()
  if (isEmpty) return

  emit('signed-and-saved', {
    signatureBase64: data,
    htmlElement: pdfContent.value,
    name: props.documentName
  })
}
</script>

<style scoped>
.document-container {
  width: 210mm;
  min-height: 297mm;
  transition: transform 0.3s ease;
}

.document-preview {
  font-family: 'Times New Roman', Times, serif;
  color: #333;
  line-height: 1.5;
  box-sizing: border-box;
}

.signature-box {
  border: 2px dashed #ddd;
}

.border-dashed {
  border: 2px dashed #ccc;
}

/* Simular papel A4 */
@media screen and (max-width: 800px) {
  .document-container {
    transform: scale(0.4);
    transform-origin: top center;
  }
}
</style>
