export function capitalizeFirstLetter(text:string) {
    if (!text) return ''; // Verifica si la cadena está vacía
    return text.charAt(0).toUpperCase() + text.slice(1);
}
