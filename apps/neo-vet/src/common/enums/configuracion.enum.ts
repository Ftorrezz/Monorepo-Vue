/**
 * Enums para el sistema de Configuración de Parámetros
 * Basado en las definiciones del Backend.
 */

export enum Modulo {
    ATENCION = 1,
    INVENTARIO = 2,
    MASCOTA = 3,
    PENSION = 4,
    PROPIETARIO = 5,
    VENTA = 6,
    VACUNA = 7,
}

export enum Tabla {
    // Mascota
    COLOR = 1,
    COMPORTAMIENTO = 2,
    DIETA = 3,
    ESPECIE = 5,
    HABITAT = 8,
    RAZA = 10,
    SEXO = 12,
    TAMANIO = 13,

    // Propietario
    ESCOLARIDAD = 4,
    ESTADO_CIVIL = 6,
    GENERO = 7,
    PROFESION = 9,
    RELIGION = 11,

    // Vacuna
    TIPO_VACUNA = 14,
    VIA_ADMINISTRACION = 15,
    LABORATORIO = 16,
}

export const RelacionModuloTipo = {
    [Modulo.MASCOTA]: [Tabla.DIETA, Tabla.ESPECIE, Tabla.COLOR, Tabla.COMPORTAMIENTO, Tabla.HABITAT, Tabla.RAZA, Tabla.SEXO, Tabla.TAMANIO],
    [Modulo.PROPIETARIO]: [Tabla.ESCOLARIDAD, Tabla.ESTADO_CIVIL, Tabla.GENERO, Tabla.PROFESION, Tabla.RELIGION],
    [Modulo.VACUNA]: [Tabla.TIPO_VACUNA, Tabla.VIA_ADMINISTRACION, Tabla.LABORATORIO],
};
