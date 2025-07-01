// Helper para extraer el '.value' si el campo es un objeto proveniente de los componentes de lista
export const obtenerIDValue = (fieldValue: any) => {
    if (fieldValue && typeof fieldValue === 'object' && fieldValue !== null && fieldValue.hasOwnProperty('value')) {
        return fieldValue.value;
    }
    return fieldValue;
};