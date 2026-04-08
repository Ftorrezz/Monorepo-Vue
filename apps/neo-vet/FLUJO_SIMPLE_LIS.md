# ✅ Flujo Simple - Módulo LIS Simplificado

## 🎯 El Flujo Ahora Es Muy Simple

```
┌─────────────────────────────────────────────────────────┐
│         GESTIÓN DE ÓRDENES DE LABORATORIO              │
│                                                         │
│  [NUEVA ORDEN]  ◄─── Botón arriba a la derecha        │
└─────────────────────────────────────────────────────────┘
            ↓
            
┌─────────────────────────────────────────────────────────┐
│    PASO 1: RELLENA DATOS DEL PACIENTE                  │
│  ├─ Nombre paciente (obligatorio)                      │
│  ├─ Profesional solicitante (obligatorio)              │
│  ├─ Especie (opcional: Canino, Felino, etc)            │
│  ├─ Edad, Sexo, Raza (opcionales)                      │
│  ├─ Diagnóstico presuntivo                             │
│  └─ ⚠️ ¿Urgente?                                        │
└─────────────────────────────────────────────────────────┘
            ↓
            
┌─────────────────────────────────────────────────────────┐
│    PASO 2: AGREGA ESTUDIOS (EN LA MISMA PANTALLA)      │
│  1. Selecciona estudio de la lista                     │
│  2. Click [AGREGAR]                                    │
│  3. ¡Automáticamente genera NÚMERO DE MUESTRA!         │
│  4. Repite si quieres agregar más                      │
│  5. Usa la tabla para quitar alguno si lo necesitas    │
│                                                         │
│  Ejemplo:                                               │
│  ✓ Glucosa    → Muestra: S-ORD123-01 (sangre)         │
│  ✓ Hemograma  → Muestra: S-ORD123-02 (sangre)         │
│  ✓ Orianálisis → Muestra: O-ORD123-01 (orina)         │
└─────────────────────────────────────────────────────────┘
            ↓
            
┌─────────────────────────────────────────────────────────┐
│    VES RESUMEN DE MUESTRAS QUE SE GENERARÁN            │
│  📦 SANGRE: S-ORD123-01, S-ORD123-02 (2 estudios)     │
│  📦 ORINA: O-ORD123-01 (1 estudio)                     │
└─────────────────────────────────────────────────────────┘
            ↓
            
┌─────────────────────────────────────────────────────────┐
│    CLICK [CREAR ORDEN]                                 │
│  ✓ Orden creada con estado: GENERADA                  │
│  ✓ Números de muestra asignados automáticamente        │
│  ✓ Aparece en la lista                                 │
└─────────────────────────────────────────────────────────┘
            ↓
            
┌─────────────────────────────────────────────────────────┐
│    LUEGO (según necesites):                            │
│  1. Ver orden en lista                                 │
│  2. Recepcionar (si quieres confirmar recepción)       │
│  3. Cargar resultados                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Ejemplo Práctico Paso a Paso

### Quiero crear una orden para **Luna** (perrita con vómitos)

**PASO 1: Lleno datos básicos**
```
Nombre: Luna
Profesional: Dra. María García
Especie: Canino
Edad: 3
Sexo: Hembra
Raza: Caniche
Diagnóstico: Gastroenteritis presunta
Urgente: SÍ (marco la casilla)
```

**PASO 2: Agrego estudios (EN LA MISMA PANTALLA)**

1️⃣ Selecciono "Glucosa" → Click [AGREGAR]
```
✓ Agregado: Glucosa
  Muestra generada: S-ORD987654-01
```

2️⃣ Selecciono "Hemograma" → Click [AGREGAR]
```
✓ Agregado: Hemograma
  Muestra generada: S-ORD987654-02
```

3️⃣ Selecciono "Examen de Orina" → Click [AGREGAR]
```
✓ Agregado: Examen de Orina
  Muestra generada: O-ORD987654-01
```

**PASO 3: Veo resumen**
```
✓ 3 estudios agregados

📦 Muestras que se generarán:
   SANGRE: S-ORD987654-01, S-ORD987654-02 (2 estudios)
   ORINA: O-ORD987654-01 (1 estudio)
```

**PASO 4: Hago click [CREAR ORDEN]**
```
✓ Orden ORD987654 creada exitosamente
```

**LISTO. Eso es TODO para crear la orden.**

---

## 🎯 ¿Dónde ve/cargo/uso la orden?

Después de crear, aparece en la **lista de órdenes**:

```
┌──────────────────────────────────────────────┐
│ Orden    │ Paciente  │ Estado    │ Acciones │
├──────────────────────────────────────────────┤
│ORD987654 │ Luna      │ Generada  │ 👁️ 📋 💉 │
│ORD987653 │ Rex       │ Recepcion │ 👁️ 📊    │
└──────────────────────────────────────────────┘

Botones:
- 👁️ = Ver detalles
- 📋 = Recepcionar (opcional, marcar que recibiste las muestras)
- 💉 = Cargar resultados (editar después con los resultados de lab)
```

---

## ❓ Preguntas Frecuentes

### P: ¿Dónde agrego los estudios?
**R**: EN LA MISMA PANTALLA del formulario. No hay que ir a otro lado. Llenas paciente, agregas estudios, guardas.

### P: ¿Quién genera los números de muestra?
**R**: **EL SISTEMA AUTOMÁTICAMENTE** cuando haces click [AGREGAR]. No tienes que hacer nada.

### P: ¿Cómo sé qué número tiene cada muestra?
**R**: Lo ves en la tabla mientras agregas. Y también en el resumen al final.

### P: ¿Puedo cambiar los números?
**R**: No, se generan automáticos. Pero puedes quitar un estudio y agregarlo de nuevo si lo necesitas.

### P: ¿Después puedo agregar más estudios?
**R**: Aún no está implementado. Por ahora es crear la orden con todos los estudios que necesites.

### P: ¿Cómo imprimo las etiquetas?
**R**: Eso viene después. Primero guardas la orden. Luego desde la lista hacés click en la orden y hay un botón para imprimir etiquetas.

### P: ¿Cuándo cargo los resultados?
**R**: DESPUÉS que el laboratorio procesa las muestras. Desde la orden hacés click en "Cargar resultados" y cargas los valores para cada estudio.

---

## 🔄 Flujo Completo Simplificado

```
1. CREAR ORDEN
   ↙─ Llena datos del paciente
   ↙─ Agrega estudios 
   ↙─ Sistema genera #muestras
   └─ Click GUARDAR

2. VER/RECEPCIONAR (opcional)
   └─ Confirmar que recibiste las muestras

3. CARGAR RESULTADOS
   ↙─ Entran los valores del lab
   ↙─ Validar cada uno
   └─ Marcar como completado

LISTO.
```

---

## ✨ Lo Importante

✅ **TODO en una sola pantalla** - No hay confusión
✅ **Números automáticos** - El sistema lo hace
✅ **Simple y directo** - 2 pasos: Datos + Estudios
✅ **Claro** - Ves todo lo que agregas
✅ **Rápido** - Máximo 3 minutos por orden

**No hay stepper confuso. No hay pantallas adicionales para agregar estudios. Just straightforward.**
