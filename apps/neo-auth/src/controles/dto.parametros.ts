export class DtoParametros {
    id?: number;
    atributos?: string[];
    filtro?: Record<string, any>;
}

export class DtParametrosReporte {
    id?: string;
    filtro?: object;
    datos?: object;
    imprimir?: boolean;
    salida?: string;
    nombreimpresora?: string;
}