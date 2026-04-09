# Guía de Mejoras - Gestión de Órdenes de Laboratorio

## Resumen de Cambios Realizados

### 1. ✅ Eliminación de botón duplicado "Nueva Orden"
**Problema**: Había dos botones para crear nuevas órdenes
**Solución**: Removido el botón del componente `TablaOrdenes.vue`
**Archivo**: `TablaOrdenes.vue` (línea ~155 anterior)

---

## 2. ✅ Mejorado Formulario de Orden - Mascota sin Propietario

### Campo de Búsqueda de Mascota
```vue
<q-input
  v-model="busquedaMascota"
  label="Buscar Mascota Existente"
  hint="Deja vacío para crear nueva mascota"
>
```
- Permite buscar mascotas existentes de forma **independiente del propietario**
- Usa endpoint: `filtropropietariomascota/filtro`
- Muestra resultados con especie, raza y propietario (si existe)

### Datos Pre-llenos Automáticos
Al seleccionar una mascota, se llenan automáticamente:
- ✅ Nombre de mascota
- ✅ Especie
- ✅ Raza
- ✅ Edad
- ✅ Sexo

### Nuevos Campos Agregados

#### Profesional Solicitante (Obligatorio)
```vue
<q-select
  v-model="orden.profesionalSolicitante"
  :options="profesionalesOpciones"
  label="Profesional Solicitante *"
  :loading="cargandoProfesionales"
>
```
- Carga desde endpoint: `profesionales`
- Usa mismo patrón que AtencionPaciente.vue

#### Diagnóstico de Catálogo
```vue
<q-select
  v-model="orden.diagnosticoCatalogo"
  :options="diagnosticosDisponibles"
  label="Diagnóstico Presuntivo (Catálogo)"
  clearable
  filterable
>
```
**Diagnósticos disponibles**:
- Anemia
- Diarrea
- Infección urinaria
- Enfermedad renal crónica
- Diabetes
- Gastroenteritis
- Pancreatitis
- Hepatitis
- Hipotiroidismo
- Control rutina

#### Observación de Diagnóstico
Campo de texto libre (textarea) para detalles adicionales del diagnóstico.

#### ID Externo
Para referencias de sistemas externos (ej: integración con otras clínicas)

#### Modo de Reporte de Resultado
Opciones:
- 📧 Email
- ☎️ Teléfono
- 🤝 Presencial
- 💬 WhatsApp

---

## 3. SelectorEstudios "Panel Vacío" - NO ESTÁ VACÍO ✅

### Explicación
El componente `SelectorEstudios.vue` tiene dos paneles:

**Panel Izquierdo (col-8)**:
- Catálogo de estudios
- Búsqueda y filtro por categoría
- Vista de tarjetas o lista
- Checkbox para seleccionar

**Panel Derecho (col-4) - "Pruebas Incluidas"**:
- ⚠️ **Aparece VACÍO al inicio** (esto es correcto)
- **Se llena cuando haces clic en el ícono 👁️** (visibility) en un estudio
- Muestra:
  - Información del estudio (código, nombre, categoría)
  - Precio y tiempo
  - Lista de pruebas incluidas
  - Botón para agregar/quitar

### Uso Correcto
1. Busca un estudio o selecciona por categoría en panel izquierdo
2. Haz clic en el ícono 👁️ para ver pruebas
3. Panel derecho se llenará con detalles
4. Selecciona el estudio y agrega a la orden

### Flujo de Selección
```
Estudios disponibles → Click 👁️ → Ver pruebas → Select → Agregar
```

---

## 4. Registro de Muestras - Propósito

### ¿Qué es?
Botón en toolbar: `Registro de Muestras`

### Propósito Probable
- Capturar muestras de forma **externa** (fuera del flujo de orden)
- Ejemplo:
  - Muestras recibidas sin orden previa
  - Recepción de muestras de laboratorios externos
  - Modificación posterior de muestras
  - Tracking de muestras independiente

### Ubicación en el Flujo
```
Crear Orden → Receptor recibe muestra → Carga resultado
      ↓
[Registro Muestras] ← Para muestras sin orden o especiales
```

### Recomendación
✅ **Mantener ambos flujos**:
- Orden Lab → Genera muestras automáticamente
- Registro Muestras → Entrada manual/externa de muestras

**Consolidar solo si**:
- Las muestras externas son < 5% del volumen
- Costo de mantenimiento supera beneficio

---

## Próximas Mejoras Recomendadas

### 1. Integración de Catálogos
Actualmente diagnósticos son estáticos. Considerar:
```typescript
// Cargar diagnósticos desde DB
const cargarDiagnosticos = async () => {
  const respuesta = await peticion.invocarMetodo('catalogos/diagnosticos', 'get')
  diagnosticosDisponibles.value = respuesta
}
```

### 2. Búsqueda Avanzada de Mascotas
```typescript
// Actual: por nombre
// Propuesto: por nombre, historia clínica, propietario
params.filtro = {
  nombre_mascota: busquedaMascota.value,
  historia_clinica: historiaClinica.value,
  propietario_nombre: propietarioNombre.value
}
```

### 3. Validación de Profesional en Turno
```typescript
// Verificar que profesional seleccionado esté disponible
const validarProfesionalDisponible = async (idProfesional) => {
  const disponible = await peticion.invocarMetodo(
    `profesionales/${idProfesional}/disponible`,
    'get'
  )
  return disponible
}
```

### 4. Auto-rellenar Diagnóstico por Especie/Síntomas
```typescript
// Sugerir diagnósticos basado en especie
computed(() => {
  if (!orden.value.especie) return diagnosticosDisponibles.value
  return diagnosticosDisponibles.value.filter(
    d => d.especies?.includes(orden.value.especie)
  )
})
```

---

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `FormularioOrdenSimple.vue` | +Búsqueda mascota, +6 campos nuevos, +funciones de carga |
| `TablaOrdenes.vue` | -Botón "Nueva Orden" duplicado |
| `GestionOrdenes.vue` | Sin cambios (OK) |
| `SelectorEstudios.vue` | Sin cambios (Funciona correctamente) |

---

## Testing Recomendado

### Caso 1: Mascota sin Propietario
- [ ] Buscar mascota por nombre
- [ ] Seleccionar mascota sin propietario
- [ ] Verificar que se llenan edad, sexo, especie, raza
- [ ] Crear orden exitosamente

### Caso 2: Nueva Mascota (Ingreso Manual)
- [ ] Dejar vacío campo de búsqueda
- [ ] Ingresar nombre, especie, raza, edad, sexo manualmente
- [ ] Crear orden exitosamente

### Caso 3: Profesional Solicitante
- [ ] Verificar que lista carga profesionales
- [ ] Seleccionar profesional
- [ ] Crear orden y verificar que se guarda ID

### Caso 4: Diagnóstico y Reporte
- [ ] Seleccionar diagnóstico de catálogo
- [ ] Ingresar observación
- [ ] Seleccionar modo reporte
- [ ] Verificar guardado

---

## Contacto para Dudas
Si necesitas:
- Modificar catálogos de diagnósticos
- Cambiar endpoints de búsqueda
- Agregar validaciones adicionales
- Modificar modo de reporte

Revisar endpoints en servicio backend correspondiente.
