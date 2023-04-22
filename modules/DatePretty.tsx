export default function DatePretty(date:Date){
    const prettyDate = new Date(date).toLocaleString('es-AR', { month:"long", day:"numeric"})

    return prettyDate;

}