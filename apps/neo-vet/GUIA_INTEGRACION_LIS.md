# Guía de Integración del Módulo LIS en GestionOrdenes.vue

## Cambios Necesarios

### 1. Actualizar el import del formulario

**Cambiar de**:
```vue
import FormularioOrden from 'src/components/laboratorio/FormularioOrden.vue'
```

**A**:
```vue
import FormularioOrdenMejorado from 'src/components/laboratorio/FormularioOrdenMejorado.vue'
```

### 2. Reemplazar en el template

**Buscar**:
```vue
<q-dialog v-model="mostrarFormulario" persistent>
  <FormularioOrden @cancelar="mostrarFormulario = false" @guardar="guardarOrden" />
</q-dialog>
```

**Reemplazar por**:
```vue
<q-dialog v-model="mostrarFormulario" persistent>
  <FormularioOrdenMejorado @cancelar="mostrarFormulario = false" @guardar="guardarOrden" />
</q-dialog>
```

### 3. Agregar botón para nueva página de carga de resultados

**En la sección de botones principales**:
```vue
<div class="row items-center q-gutter-sm">
  <q-btn 
    color="secondary" 
    flat 
    label="Carga de Resultados" 
    icon="analytics" 
    @click="irACargaResultadosMejorada" 
  />
  <q-btn 
    color="secondary" 
    flat 
    label="Registro de Muestras" 
    icon="science" 
    @click="irARegistroMuestras" 
  />
  <q-btn color="primary" label="Nueva Orden" icon="add" @click="mostrarFormulario = true" />
</div>
```

### 4. Agregar método de navegación

**En el script setup**:
```typescript
const irACargaResultadosMejorada = () => {
  router.push({ 
    name: 'carga-resultados-mejorada',
    // O usa la ruta directa: /laboratorio/carga-resultados-mejorada
  })
}
```

---

## Punto 1: Captura Integrada de Orden + Estudios

El nuevo `FormularioOrdenMejorado` reemplaza completamente el flujo anterior:

### Antes (Antiguo):
1. Crear orden con datos básicos
2. Ir a otra pantalla para recepcionar
3. Ir a otra pantalla para agregar muestras
4. Ir a otra pantalla para imprimir

### Ahora (Nuevo - Todo integrado):
1. Crear orden + Agregar estudios + Imprimir etiquetas + Generar reportes
   - **Todo en una sola interfaz con 4 pasos**

### Ventajas:
✅ Menos clics
✅ Menor confusión de flujo
✅ Números de muestra generados automáticamente
✅ Impresión inmediata
✅ Mejor experiencia usuario

---

## Punto 2: Números de Muestra Únicos

### Ejemplo de Generación Automática:

**Orden: ORD001**
**Estudios capturados**:
- Glucosa (Sangre)
- Hemograma (Sangre)
- Proteína (Sangre)
- Examen de Orina (Orina)
- Examen de Heces (Heces)

**Muestras generadas automáticamente**:
```
Sangre:     S-ORD001-01, S-ORD001-02, S-ORD001-03  ← 3 estudios = 3 números
Orina:      O-ORD001-01                             ← 1 estudio = 1 número
Heces:      H-ORD001-01                             ← 1 estudio = 1 número
```

**Cómo funciona**:
1. Usuario selecciona "Glucosa" (tipo: Sangre)
   → Sistema genera: S-ORD001-01
2. Usuario selecciona "Hemograma" (tipo: Sangre)
   → Sistema genera: S-ORD001-02 (secuencia continua)
3. Usuario selecciona "Examen de Orina" (tipo: Orina)
   → Sistema genera: O-ORD001-01 (nueva secuencia porque es otro tipo)

**El servicio manejador**:
```typescript
// En GeneradorMuestrasService
generarNumeroMuestra(numeroOrden: string, tipoMuestra: TipoMuestra)
```

---

## Punto 3: Etiquetas e Impresión

### Componente: `ImpresionEtiquetas.vue`

**Características**:
- ✅ Múltiples formatos (50x30mm, térmica, etc)
- ✅ Código de barras integrado
- ✅ Instrucciones de manejo
- ✅ Información de almacenamiento
- ✅ Vista previa antes de imprimir
- ✅ Múltiples copias por muestra

**Uso en el Formulario**:
```vue
<ImpresionEtiquetas
  :muestras="formulario.muestras"
  :numero-orden="formulario.numeroOrden"
  @impresion-completada="handleImpresionEtiquetas"
/>
```

---

## Punto 4: Carga de Resultados Split-View

### Nueva página: `CargaResultadosMejorada.vue`

**Layout**:
```
┌─────────────────────────────┬──────────────────────────────────┐
│   LISTADO DE ÓRDENES        │   DETALLES Y CARGA DE RESULTADOS │
│                             │                                   │
│  Filtradores:               │  Orden Seleccionada              │
│  • Búsqueda                 │  ├─ Datos generales              │
│  • Solo pendientes          │  ├─ Tabs por tipo de muestra     │
│  • Por estado               │  │  ├─ Sangre (3 estudios)      │
│                             │  │  ├─ Orina (1 estudio)        │
│  Tabla:                     │  │  └─ Heces (1 estudio)        │
│  ┌──────────────────────┐   │  │                               │
│  │ Orden │ Paciente│Est.│   │  └─ Formulario de resultados     │
│  ├──────────────────────┤   │     ├─ Input: Valor             │
│  │ORD001│Luna    │▓▓▓▓▓│   │     ├─ Input: Unidad            │
│  │ORD002│Rex     │▓▓▓░░│   │     ├─ Check: Dentro rango      │
│  │ORD003│Mimi    │▓▓░░░│   │     ├─ Textarea: Observaciones  │
│  └──────────────────────┘   │     └─ Botones: Guardar/Validar │
│                             │                                   │
└─────────────────────────────┴──────────────────────────────────┘
```

**Componentes utilizados**:
- `CargaResultadosMejorada.vue` (página principal)
- `CargaResultadosEstudios.vue` (formularios individuales)

---

## Integración Paso a Paso

### Paso 1: Agregar ruta en router

**En `src/router/routes.ts`** (o similar):

```typescript
{
  path: 'carga-resultados-mejorada',
  name: 'carga-resultados-mejorada',
  component: () => import('pages/laboratorio/CargaResultadosMejorada.vue'),
  meta: { requiresAuth: true }
}
```

### Paso 2: Importar en GestionOrdenes.vue

```typescript
import FormularioOrdenMejorado from 'src/components/laboratorio/FormularioOrdenMejorado.vue'

const router = useRouter()

const irACargaResultadosMejorada = () => {
  router.push({ name: 'carga-resultados-mejorada' })
}
```

### Paso 3: Actualizar template

```vue
<q-dialog v-model="mostrarFormulario" persistent>
  <FormularioOrdenMejorado 
    @cancelar="mostrarFormulario = false" 
    @guardar="guardarOrden" 
  />
</q-dialog>

<!-- Botón para ir a carga de resultados -->
<q-btn
  color="secondary"
  flat
  label="Carga de Resultados"
  icon="analytics"
  @click="irACargaResultadosMejorada"
/>
```

### Paso 4: Actualizar servicio de laboratorio

El servicio existente `laboratorio.service.ts` ya está bien, pero verifica que tenga:

```typescript
async guardarResultados(id: string | number, datos: any) {
  // Este método es importante para guardar los resultados cargados
}
```

---

## Archivos Nuevos Creados

```
✅ src/types/laboratorio.ts
✅ src/services/generadorMuestras.service.ts
✅ src/services/validacionResultados.service.ts
✅ src/composables/laboratorio/useGestionEstudios.ts
✅ src/components/laboratorio/CapturaEstudios.vue
✅ src/components/laboratorio/ImpresionEtiquetas.vue
✅ src/components/laboratorio/ReporteOrden.vue
✅ src/components/laboratorio/CargaResultadosEstudios.vue
✅ src/components/laboratorio/FormularioOrdenMejorado.vue
✅ src/pages/laboratorio/CargaResultadosMejorada.vue
✅ README_MODULO_LIS.md (este archivo)
```

---

## Testing

### Prueba 1: Crear orden completa

1. Click "Nueva Orden"
2. Llenar datos: Luna, 3 años, hembra, Caniche
3. Agregar 3 estudios de sangre
4. Agregar 1 estudio de orina
5. Imprimir etiquetas
6. Generar reporte
7. Click Finalizar

**Esperado**: Orden GENERADA con muestras: S-ORD001-01, S-ORD001-02, S-ORD001-03, O-ORD001-01

---

### Prueba 2: Cargar resultados

1. Click "Carga de Resultados"
2. Seleccionar orden de la lista
3. Click en Tab "Sangre"
4. Ingresar valores para cada estudio:
   - Glucosa: 95 (dentro de rango)
   - Proteína: 150 (fuera de rango)
5. Click "Guardar" en cada uno
6. Click "Validar" cuando estén correctos
7. Sistema detecta anomalía en Proteína

**Esperado**: Validación correcta, alertas en valores fuera de rango

---

### Prueba 3: Impresión

1. Desde formulario de orden, Paso 3
2. Seleccionar formato "50x30mm"
3. Click "Vista Previa"
4. Verificar que incluye: número, tipo, código de barras, instrucciones
5. Click "Imprimir"

**Esperado**: Se abre ventana de impresión del navegador

---

## Troubleshooting

### Problema: Los números de muestra se repiten
**Solución**: El servicio mantiene contadores en memoria. Si se reinicia la app, se resetea. Implementar persistencia en localStorage si es necesario.

### Problema: La validación no compara correctamente
**Solución**: Verificar que los tipos de dato sean numéricos (no strings). El servicio convierte con `Number()`.

### Problema: Las etiquetas no se imprimen
**Solución**: Verificar que el navegador tenga permisos de impresión. Intentar con diferentes navegadores.

---

## Próximos Pasos

1. Conectar servicios reales con API backend
2. Implementar almacenamiento en localStorage para draft
3. Agregar historial de órdenes por paciente
4. Implementar comparación gráfica de resultados
5. Agregar exportación a PDF real (usar librería como pdfkit o html2pdf)
6. Integrar con sistema de notificaciones
