export default function Capitalize(text:string):string{
    const textCapitalized = text.charAt(0).toUpperCase() + text.slice(1);
    return textCapitalized;
}