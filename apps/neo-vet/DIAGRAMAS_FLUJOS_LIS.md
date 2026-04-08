# Diagrama de Flujos - Módulo LIS

## 🔄 Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     MÓDULO LIS VETERINARIA                      │
└─────────────────────────────────────────────────────────────────┘

                           ENTRADA PRINCIPAL
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐        ┌──────▼────────┐
            │  NUEVA ORDEN   │        │ CARGA RESULTADOS
            │                │        │                │
            │ Formulario     │        │ Vista Split    │
            │ Mejorado       │        │ Arriba/Abajo   │
            └────────────────┘        └────────────────┘
                    │
        ┌───────────┼───────────┐
        │                       │
    PASO 1                  PASO 2
    Datos                  Estudios
    Básicos               + Muestras
        │                       │
        └───────────┬───────────┘
                    │
                PASO 3
            Impresión
                    │
        ┌───────────┼───────────┐
        │                       │
    Etiquetas           Reportes
        │                       │
        └───────────┬───────────┘
                    │
                PASO 4
            Confirmación
                    │
                    ▼
            ORDEN GENERADA ──────┐
                                 │
                    ┌────────────┴─────────────┐
                    │                          │
            RECEPCIONAR                   CARGA DE
            (Opcional)                    RESULTADOS
                    │                          │
                    ▼                          ▼
            RECEPCIONADA ────────────────> EN PROCESO
                                               │
                                               ▼
                                           COMPLETADA
```

## 📊 Generación de Muestras

```
ORDEN ORD001
│
├─ Estudio: Glucosa (Sangre)
│  └─ Muestra: S-ORD001-01 ◄─── Prefijo: S, Secuencia: 01
│
├─ Estudio: Hemograma (Sangre)
│  └─ Muestra: S-ORD001-02 ◄─── Prefijo: S, Secuencia: 02
│
├─ Estudio: Examen Orina (Orina)
│  └─ Muestra: O-ORD001-01 ◄─── Prefijo: O, Secuencia: 01 (nueva serie)
│
└─ Estudio: Examen Heces (Heces)
   └─ Muestra: H-ORD001-01 ◄─── Prefijo: H, Secuencia: 01 (nueva serie)

REGLA: Cada tipo de muestra tiene su propia secuencia
```

## 🖨️ Proceso de Impresión

```
PASO 3: IMPRESIÓN
│
├─ TAB: ETIQUETAS
│  ├─ Seleccionar formato (50x30mm, térmica, etc)
│  ├─ Opciones: Código barras, Instrucciones
│  ├─ Vista previa
│  └─ Click → Impresora
│
└─ TAB: REPORTE ORDEN
   ├─ Seleccionar formato (PDF, Impresión, Email)
   ├─ Opciones: Incluir muestras, instrucciones, resultados
   ├─ Vista previa
   └─ Click → Descarga/Imprime/Envía

CONTENIDO DE ETIQUETA:
┌──────────────────────┐
│ ORDEN: S-ORD001-01   │
│ █████ (código barras)│
│ Tipo: Sangre         │
│ Desc: Hemograma      │
│ Fecha: 15/12/2024    │
│                      │
│ Instrucciones:       │
│ • No congelar        │
│ • Sedar si necesario │
│                      │
│ Almacenamiento:      │
│ 2-8°C / 48 horas     │
└──────────────────────┘
```

## 📈 Carga de Resultados (Split View)

```
┌─────────────────────────────┬────────────────────────────────────┐
│                             │                                    │
│   LISTADO DE ÓRDENES        │   CARGA DE RESULTADOS              │
│   (Arriba Izquierda)        │   (Abajo Derecha)                  │
│                             │                                    │
│  Filtros:                   │  Orden Seleccionada:               │
│  ┌────────────────────────┐ │  ┌──────────────────────────────┐  │
│  │ Búsqueda: [Luna      ]│ │  │ ORD001 - Luna                │  │
│  │ ☑ Solo pendientes    │ │  │ Estado: En Proceso           │  │
│  └────────────────────────┘ │  │ Urgente: Sí                  │  │
│                             │  └──────────────────────────────┘  │
│  Tabla:                     │                                    │
│  ┌──────────────────────┐   │  Tabs por Muestra:                 │
│  │ Orden│Paciente │Progr.│  │  [Sangre] [Orina] [Heces]         │
│  ├──────────────────────┤   │                                    │
│  │ORD001│Luna    │▓▓▓▓▓│   │  SANGRE (3 estudios)               │
│  │ORD002│Rex     │▓▓▓░░│   │  ┌────────────────────────────┐    │
│  │ORD003│Mimi    │▓░░░░│   │  │ Estudio: Glucosa           │    │
│  └──────────────────────┘   │  │ Valor: [95            ]    │    │
│  ◄─ Seleccionar (click)     │  │ Unidad: [mg/dL        ]    │    │
│                             │  │ Referencia: 70-110     │    │
│                             │  │ ☑ Dentro de rango      │    │
│                             │  │                        │    │
│                             │  │ [Guardar] [Validar]    │    │
│                             │  └────────────────────────┘    │
│                             │                                 │
│                             │  VALIDACIÓN EN TIEMPO REAL:      │
│                             │  ✅ Valor dentro de rango       │
│                             │  ⚠️  Otros valores a revisar    │
│                             │                                 │
└─────────────────────────────┴────────────────────────────────────┘
```

## ✅ Estados de Resultado

```
ESTADO: PENDIENTE
│
├─ Usuario ingresa valor
│
▼
ESTADO: CARGADO
│
├─ Sistema valida
├─ Compara con referencia
├─ ¿Dentro de rango?
│  ├─ Sí  → Usuario puede validar
│  └─ No  → Alerta pero permite validar
│
▼
ESTADO: VALIDADO ← Usuario confirma
│
├─ Resultado revisado
├─ Datos verificados
└─ ✓ Completado

OPCIONAL:
ESTADO: VALIDADO → Detecta error
│
▼
ESTADO: ENMENDADO ← Usuario corrige
│
└─ Vuelve a VALIDADO
```

## 🔄 Ciclo Completo de Orden

```
START
  │
  ▼
┌─────────────┐
│  BORRADOR   │  (Estado inicial si se guarda como borrador)
└──────┬──────┘
       │
       │ (Se completa formulario)
       │
       ▼
┌─────────────┐
│  GENERADA   │  ← Orden completada y confirmada
└──────┬──────┘   (Números de muestra ya asignados)
       │          (Etiquetas impresas)
       │          (Reporte generado)
       │
       │ (OPCIONAL: Recepción física en laboratorio)
       │
       ▼
┌─────────────┐
│RECEPCIONADA │  (Muestras recibidas en laboratorio)
└──────┬──────┘
       │
       │ (Comienzo de procesamiento)
       │
       ▼
┌─────────────┐
│ EN PROCESO  │  (Se cargan resultados)
└──────┬──────┘
       │
       │ (Todos los resultados validados)
       │
       ▼
┌─────────────┐
│ COMPLETADA  │  (Orden finalizada)
└──────┬──────┘   (Resultados disponibles)
       │          (Reporte final generado)
       │
       ▼
   END

NOTA: CANCELADA puede ocurrir desde cualquier estado
```

## 🧬 Matriz de Tipos de Muestra

```
TIPO        │ PREFIJO │ CONTENEDOR        │ ESTABILIDAD  │ EJEMPLO ESTUDIOS
────────────┼─────────┼──────────────────┼──────────────┼──────────────────
Sangre      │ S       │ EDTA/SST          │ 48 horas     │ Glucosa, Proteína
Orina       │ O       │ Vaso estéril      │ 24 horas     │ Uroanálisis
Heces       │ H       │ Vaso estéril      │ 48 horas     │ Coprolograma
Fluido      │ F       │ Tubo estéril      │ 2 horas      │ Peritoneal
Biopsia     │ B       │ Formol 10%        │ 7 días       │ Histopatología
Cultivo     │ C       │ Medio específico  │ Inmediato    │ Bacteriología
Citología   │ CT      │ Portaobjetos      │ Indefinido   │ Citología vaginal
Histología  │ HT      │ Formol 10%        │ 7 días       │ Histopatología

REGLA DE ORO: Cada tipo ocupa filas independientes en la tabla de muestras
```

## 📊 Validación de Resultados

```
INGRESA VALOR
    │
    ▼
¿TIENE VALOR?
    │
    ├─ NO → ❌ Error: Valor requerido
    │
    └─ SÍ
         │
         ▼
    ¿ES NUMÉRICO?
         │
         ├─ NO → ⚠️ Advertencia: Verificar formato
         │
         └─ SÍ
              │
              ▼
         ¿EXISTE REFERENCIA?
              │
              ├─ NO → ✓ Sin validación. Guardar
              │
              └─ SÍ
                   │
                   ▼
              ¿DENTRO DE RANGO?
                   │
                   ├─ SÍ → ✓ VALIDADO
                   │
                   └─ NO → ⚠️ FUERA DE RANGO
                        → Permitir pero alertar
                        → Usuario confirma

RESULTADO FINAL: VALIDADO o RECHAZADO
```

## 🎯 Arquitectura de Componentes

```
GestionOrdenes.vue
├─ FormularioOrdenMejorado.vue ◄─── Nueva orden
│  ├─ Paso 1: Datos bases
│  ├─ Paso 2: CapturaEstudios.vue
│  │  └─ useGestionEstudios (composable)
│  ├─ Paso 3: ImpresionEtiquetas.vue + ReporteOrden.vue
│  └─ Paso 4: Review + Guardar
│
└─ TablaOrdenes.vue ◄─── Listar órdenes existentes

CargaResultadosMejorada.vue ◄─── Nueva página
├─ Arriba: TableOrdenes
├─ Abajo: CargaResultadosEstudios.vue
│  └─ ValidacionResultadosService
└─ Servicios:
   ├─ GeneradorMuestrasService
   ├─ ValidacionResultadosService
   └─ LaboratorioService
```

---

**Fecha de Creación**: 15/12/2024
**Versión**: 1.0
**Status**: Completo y documentado
