export default function Capitalize(text:string):string{
    if (!text || text.trim() === '') {
        return '';
    }
    const textCapitalized = text.charAt(0).toUpperCase() + text.slice(1);
    return textCapitalized;
}