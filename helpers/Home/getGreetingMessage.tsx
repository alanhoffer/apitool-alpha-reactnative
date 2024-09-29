export const getGreetingMessage = (): string => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return 'Buenos días!';
    } else if (currentHour < 18) {
        return 'Buenas tardes!';
    } else {
        return 'Buenas noches!';
    }
};
