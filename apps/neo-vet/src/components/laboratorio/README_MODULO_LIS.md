# Módulo LIS (Laboratory Information System) - Veterinaria

## 📋 Descripción General

Módulo completo y desacoplado de gestión de laboratorio veterinario con las siguientes características:

1. ✅ **Captura de Órdenes Integrada**: Crear órdenes y agregar estudios en la misma pantalla
2. ✅ **Generación Automática de Muestras**: Números únicos por tipo de tubo/muestra
3. ✅ **Impresión de Etiquetas**: Diferentes formatos disponibles
4. ✅ **Reportes de Orden**: PDF, impresión y email
5. ✅ **Carga de Resultados Split-View**: Órdenes arriba, resultados abajo
6. ✅ **Validación de Resultados**: Contra valores de referencia
7. ✅ **Comparación de Resultados**: Con históricos
8. ✅ **Detección de Anomalías**: En patrones de resultados

---

## 🏗️ Estructura de Carpetas

```
src/
├── types/
│   └── laboratorio.ts                    # Tipos e interfaces principales
├── services/
│   ├── laboratorio.service.ts           # CRUD de órdenes (existente)
│   ├── generadorMuestras.service.ts     # Generación de números de muestra
│   └── validacionResultados.service.ts  # Validación y análisis de resultados
├── composables/
│   └── laboratorio/
│       ├── useLaboratorioOrdenes.ts     # Gestión de órdenes (existente)
│       └── useGestionEstudios.ts        # Gestión de estudios por orden
├── components/
│   └── laboratorio/
│       ├── FormularioOrdenMejorado.vue         # Formulario con stepper (NUEVO)
│       ├── CapturaEstudios.vue                # Captura de estudios (NUEVO)
│       ├── ImpresionEtiquetas.vue             # Impresión de etiquetas (NUEVO)
│       ├── ReporteOrden.vue                   # Reporte de orden (NUEVO)
│       ├── CargaResultadosEstudios.vue        # Carga de resultados por estudio (NUEVO)
│       ├── CargaResultados.vue                # Componente original
│       ├── FormularioOrden.vue                # Componente original
│       └── ... (otros componentes)
└── pages/
    └── laboratorio/
        ├── CargaResultadosMejorada.vue       # Nueva página split-view (NUEVO)
        ├── GestionOrdenes.vue                # Componente original
        └── ... (otras páginas)
```

---

## 🔑 Flujos Principales

### 1. CREAR ORDEN CON ESTUDIOS

**Componente**: `FormularioOrdenMejorado.vue`

**Flujo de 4 pasos**:

```
Paso 1: Datos Básicos
├── Número de orden
├── Datos del paciente (especie, edad, sexo, raza)
├── Profesional solicitante
└── Información clínica

↓

Paso 2: Estudios y Muestras
├── Seleccionar estudios disponibles
├── El sistema genera números de muestra automáticamente
│   ├── Ejemplo: S-ORD001-01 (Sangre - Orden 001 - Muestra 1)
│   ├── Ejemplo: O-ORD001-01 (Orina - Orden 001 - Muestra 1)
│   └── Diferentes tipos = diferentes números
├── Ver configuración de cada tipo de muestra
└── Agregar instrucciones especiales

↓

Paso 3: Impresión
├── Tab 1: Etiquetas de Muestras
│   ├── Seleccionar formato (50x30mm, térmica, etc)
│   ├── Incluir código de barras
│   ├── Incluir instrucciones de manejo
│   └── Generar e imprimir
├── Tab 2: Reporte de Orden
│   ├── Seleccionar formato (PDF, Impresión, Email)
│   ├── Incluir muestras
│   ├── Incluir instrucciones
│   └── Generar documento
└── Descargar/Imprimir

↓

Paso 4: Resumen y Confirmación
├── Revisar todos los datos
├── Confirmar generación
└── Orden guardada → Estado: GENERADA
```

**Uso en página**:

```vue
<template>
  <q-dialog v-model="mostrarFormulario" persistent>
    <FormularioOrdenMejorado
      @cancelar="mostrarFormulario = false"
      @guardar="guardarOrden"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import FormularioOrdenMejorado from 'src/components/laboratorio/FormularioOrdenMejorado.vue'

const guardarOrden = (orden: OrdenLaboratorio) => {
  console.log('Orden guardada:', orden)
  // Llamar a servicio para guardar
}
</script>
```

---

### 2. RECEPCIONAR ORDEN (Generar Muestras)

**En la página de Gestión de Órdenes**:

```typescript
// Cuando está en estado "generada" o "borrador"
// El usuario hace clic en "Recepcionar"
// La orden pasa a estado "recepcionada"
// Las muestras se marcan como "recepcionadas"

// Los números de muestra ya fueron generados en el paso anterior
// Aquí solo se confirma la recepción física
```

---

### 3. CARGAR RESULTADOS (nuevo flujo split-view)

**Página**: `CargaResultadosMejorada.vue`

**Layout Superior/Inferior**:

```
┌─────────────────────────────────────────────────────┐
│                 LISTADO DE ÓRDENES                  │
│  (Filtro por estado, búsqueda, progreso visual)     │
│  - Orden 001 | Paciente: Luna | Estado: En Proceso │
│  - Orden 002 | Paciente: Rex  | Estado: Pendiente  │
│  - Orden 003 | Paciente: Mimi | Estado: Completada │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          DETALLES Y CARGA DE RESULTADOS             │
│  Orden 001 - Luna                                   │
│                                                      │
│  [Tab Sangre] [Tab Orina] [Tab Heces]              │
│                                                      │
│  Estudio: Glucosa      [Valor] [Unidad] [Ref]     │
│  Estado:  Pendiente     ☐ Guardar ☐ Validar       │
│                                                      │
│  Estudio: Proteína     [Valor] [Unidad] [Ref]     │
│  Estado:  Validado      ✓ Resultado confirmado     │
└─────────────────────────────────────────────────────┘
```

**Componentes Used**:

- `CargaResultadosMejorada.vue` - Contenedor principal
- `CargaResultadosEstudios.vue` - Campos y validación

---

## 🧬 Tipos de Muestra Disponibles

Cada tipo genera un prefijo único:

| Tipo | Prefijo | Contenedor | Estabilidad | Instrucciones |
|------|---------|-----------|------------|---------------|
| Sangre | S | EDTA/SST | 48 horas | No congelar, sedar si es necesario |
| Orina | O | Vaso estéril | 24 horas | Muestra de mitad de micción |
| Heces | H | Vaso estéril | 48 horas | No contaminar, evitar suelo |
| Fluido | F | Tubo estéril | 2 horas | Aspirar aséptico, transportar rápido |
| Biopsia | B | Formol 10% | 7 días | Describir localización |
| Cultivo | C | Medio específico | Inmediato | Trasporte rápido |
| Citología | CT | Portaobjetos | Indefinido | Fijar inmediatamente |
| Histología | HT | Formol 10% | 7 días | mín 5x5x3 mm |

---

## 🔄 Generación Automática de Números de Muestra

**Servicio**: `GeneradorMuestrasService`

```typescript
// Uso:
import GeneradorMuestrasService from 'src/services/generadorMuestras.service'

// Generar un número de muestra
const numeroMuestra = GeneradorMuestrasService.generarNumeroMuestra(
  'ORD001',           // numeroOrden
  TipoMuestra.SANGRE  // tipoMuestra
)
// Resultado: 'S-ORD001-01'

// Generar múltiples
const muestras = GeneradorMuestrasService.generarMultiplesMuestras(
  'ORD001',
  [TipoMuestra.SANGRE, TipoMuestra.ORINA]
)
// Resultado: ['S-ORD001-01', 'O-ORD001-01']

// Obtener instrucciones
const instrucciones = GeneradorMuestrasService.obtenerInstrucciones(
  TipoMuestra.SANGRE
)
// Resultado: ['No congelar', 'Sedar si es necesario']

// Obtener configuración
const config = GeneradorMuestrasService.obtenerConfiguracion(
  TipoMuestra.SANGRE
)
// Resultado: { tipoMuestra, prefijo, contenedor, ... }
```

---

## ✅ Validación de Resultados

**Servicio**: `ValidacionResultadosService`

```typescript
import ValidacionResultadosService from 'src/services/validacionResultados.service'

// Validar un resultado individual
const validacion = ValidacionResultadosService.validarResultado(
  estudio,      // Estudio
  resultado     // ResultadoEstudio
)
// Retorna: { valido, mensajes, dentro_rango }

// Validar múltiples resultados
const validacionMultiple = ValidacionResultadosService.validarMultiplesResultados(
  estudios,     // Estudio[]
  resultados    // Map<string, ResultadoEstudio>
)

// Comparar con resultados previos
const comparacion = ValidacionResultadosService.compararConResultadosPrevios(
  estudio,
  resultadoActual,
  resultadoPrevio  // opcional
)
// Retorna: { cambio, porcentajeCambio, advertencia }

// Detectar anomalías
const anomalias = ValidacionResultadosService.detectarAnomalias(estudios)
// Ejemplo: ['Múltiples valores altos detectados en: GLU, CRTNN']

// Generar reporte
const reporte = ValidacionResultadosService.generarReporteValidacion(
  estudios,
  resultados
)
```

---

## 🖨️ Impresión de Etiquetas

**Componente**: `ImpresionEtiquetas.vue`

**Formatos disponibles**:
- 50x30mm (estándar para laboratorio)
- 50x25mm (compacto)
- Térmica 80mm
- Térmica 58mm

**Contenido de etiqueta**:
```
┌─────────────────────┐
│ ORDEN: S-ORD001-01  │
│ █████████████████   │ ← Código de barras
│                     │
│ Tipo: Sangre        │
│ Desc: Hemograma     │
│ Fecha: 15/12/2024   │
│                     │
│ Instrucciones:      │
│ • No congelar       │
│ • Sedar si necesar. │
│                     │
│ Almacenamiento:     │
│ 2-8°C / 48h         │
└─────────────────────┘
```

---

## 📊 Reporte de Orden

**Componente**: `ReporteOrden.vue`

**Secciones**:
1. Encabezado (título, sistema)
2. Datos Generales (orden, paciente, profesional, fechas)
3. Información Clínica (diagnóstico, indicaciones, observaciones)
4. Estudios Solicitados (tabla completa)
5. Información de Muestras (si se incluye)
6. Resultados (si están disponibles)
7. Pie de página (firma, fecha)

**Formatos de salida**:
- PDF (descarga)
- Impresión (ventana del navegador)
- Email (integración futura)

---

## 📈 Estados de Orden

```
BORRADOR
    ↓
GENERADA (después de completar formulario)
    ↓ (usuario recepciona)
RECEPCIONADA (orden recibida en laboratorio)
    ↓ (usuario comienza carga de resultados)
EN_PROCESO (cargando/validando resultados)
    ↓ (todos los resultados validados)
COMPLETADA (orden finalizada)

    ↓ (opcional)
CANCELADA
```

---

## 📊 Estados de Resultado

```
PENDIENTE        → Sin cargar aún
    ↓
CARGADO         → Valor ingresado, sin validar
    ↓
VALIDADO        → Valor validado, dentro o fuera de rango
    ↓ (si hay error)
ENMENDADO       → Valor corregido
    ↓ (si hay rechazo)
RECHAZADO       → No válido, debe reingresarse
```

---

## 🎯 Casos de Uso

### Caso 1: Nueva orden con múltiples estudios

1. Click "Nueva Orden"
2. Llenar datos básicos (Paso 1)
3. Agregar 5 estudios de sangre + 2 de orina (Paso 2)
   - Sistema genera automáticamente:
     - S-ORD001-01, S-ORD001-02, S-ORD001-03, S-ORD001-04, S-ORD001-05
     - O-ORD001-01, O-ORD001-02
4. Imprimir etiquetas en formato 50x30mm con código de barras (Paso 3)
5. Imprimir reporte de orden en PDF (Paso 3)
6. Click Finalizar → Orden GENERADA

**Tiempo típico**: 3-5 minutos

---

### Caso 2: Recepcionar orden

1. Buscar orden en "Gestión de Órdenes"
2. Click "Recepcionar"
3. Sistema marca orden como RECEPCIONADA
4. Las muestras tienen su número asignado

---

### Caso 3: Cargar resultados

1. Ir a "Carga de Resultados (Mejorada)"
2. Seleccionar orden de la lista
3. Sistema agrupa estudios por tipo de muestra
4. Para cada estudio:
   - Ingresar valor, unidad, referencia
   - Sistema valida automáticamente
   - Click "Guardar" → CARGADO
   - Click "Validar" → VALIDADO
5. Cuando todos estén validados, click "Finalizar Orden" → COMPLETADA

**Flujo de validación**:
```
Ingresa valor (150) →
↓
Sistema compara con rango (70-110) →
↓
¡ALERTA! Fuera de rango →
↓
Usuario revisa, confirma o corrige →
↓
Si está bien: Click "Validar" → VALIDADO
```

---

## 🔧 Integración con API

### Endpoints esperados

```
GET    /api/laboratorio/ordenes              # Listar órdenes
POST   /api/laboratorio/ordenes              # Crear orden
GET    /api/laboratorio/ordenes/:id          # Obtener orden
PUT    /api/laboratorio/ordenes/:id          # Actualizar orden
DELETE /api/laboratorio/ordenes/:id          # Eliminar orden

GET    /api/laboratorio/ordenes/:id/estudios # Listar estudios
POST   /api/laboratorio/estudios             # Crear estudio
PUT    /api/laboratorio/estudios/:id         # Actualizar estudio

POST   /api/laboratorio/ordenes/:id/resultados  # Guardar resultados
GET    /api/laboratorio/ordenes/:id/muestras    # Listar muestras
```

---

## 🚀 Próximas Mejoras (Futuro)

- [ ] Historial de resultados por paciente
- [ ] Comparación visual de gráficos (tendencias)
- [ ] Integración con equipos analizadores
- [ ] QR dinámicos en muestras
- [ ] Firma digital en reportes
- [ ] Exportación a HL7
- [ ] Análisis predictivo
- [ ] Dashboard de KPIs
- [ ] Integración con email/SMS
- [ ] Auditoría completa de cambios

---

## 📝 Notas Importantes

1. **Generación de Números**: Cada tipo de muestra tiene su propia secuencia
2. **Validación**: Los valores se validan contra referencias configurables
3. **Impresión**: Compatible con impresoras térmicas y de etiquetas
4. **Offline**: La aplicación funciona mejor con conexión, pero puede guardar en draft
5. **Seguridad**: Todos los datos sensibles deben encriptarse en tránsito
6. **Auditoría**: Registrar quién cargó/validó cada resultado

---

## 📞 Soporte

Para dudas, cambios o mejoras en el módulo, consultar con el equipo de desarrollo.
