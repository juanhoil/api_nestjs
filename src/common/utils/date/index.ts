import { randomHour } from "../random";

const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysEs = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

type DateInfo<T extends {}> = T & {    // '{}' can be replaced with 'any'
    "date": string;
    "index": number
    "name": string
};

const getDaysInMonth = <T>(month: number, year: number, option?: any): DateInfo<T>[] => {
    const date = new Date(year, month, 1);
    const list = []
    while (date.getMonth() === +month) {
        const time = new Date(date);
        let payload = {
            date: time.toISOString(),
            index: time.getDay(),
            name: daysEn[time.getDay()]
        }
        if (option) {
            payload = {
                ...payload,
                ...option
            }
        }
        list.push(payload);
        date.setDate(date.getDate() + 1);
    }
    return list;
}


const getMonthWeeks = (month: number, year: number, option?: any) => {
    const list = getDaysInMonth(month, year, option)
    const firstDay = [...list]
    const arregloDeArreglos = [];
    if (firstDay.length > 0) {

        if (firstDay[0].name !== "Sunday") {
            const indexMonday = 0;
            const indexCurrent = daysEn.findIndex((d) => d === firstDay[0].name)
            const size = indexCurrent - indexMonday;
            const time = new Date(firstDay[0].date);
            for (let s = 0; s < size; s++) {
                time.setDate(time.getDate() - 1);

                let data = {
                    date: time.toISOString(),
                    index: time.getDay(),
                    name: daysEn[time.getDay()]

                }
                if (option) {
                    data = {
                        ...data,
                        ...option
                    }
                }
                firstDay.unshift(data)
            }
        }

        if (firstDay[firstDay.length - 1].name !== "Saturday") {
            const indexMonday = 6;
            const indexCurrent = daysEn.findIndex((d) => d === firstDay[firstDay.length - 1].name)
            const size = indexMonday - indexCurrent;
            const time = new Date(firstDay[firstDay.length - 1].date);
            for (let s = 0; s < size; s++) {
                time.setDate(time.getDate() + 1);
                let data = {
                    date: time.toISOString(),
                    index: time.getDay(),
                    name: daysEn[time.getDay()]

                }
                if (option) {
                    data = {
                        ...data,
                        ...option
                    }
                }
                firstDay.push(data)
            }
        }

        const LONGITUD_PEDAZOS = 7;

        for (let i = 0; i < firstDay.length; i += LONGITUD_PEDAZOS) {
            let pedazo = firstDay.slice(i, i + LONGITUD_PEDAZOS);
            arregloDeArreglos.push(pedazo);
        }
    }
    return arregloDeArreglos
}
const getWeekOfMonth = <T>(week: number, month: number, year: number, option?: any): DateInfo<T>[] => {
    const weeks = getMonthWeeks(month, year, option)
    if (weeks.length > 0) {
        if (weeks[week]) {
            return weeks[week]
        }
    }
    return []
}
const startDay = (start = new Date()) => {
    start.setHours(0, 0, 0, 0);
    return start
}

const endDay = (end = new Date()) => {
    end.setHours(23, 59, 59, 999);
    return end
}
const startEnd = (start: Date, end: Date) => {
    return {
        startDay: startDay(start),
        endDay: endDay(end)
    }
}

const percentage = (lengPerc) => {
    if(lengPerc <= 5)
        return Math.round(lengPerc*0.5)

    if(lengPerc <= 10)
        return Math.round(lengPerc*0.4)

    if(lengPerc <= 15)
        return Math.round(lengPerc*0.3)

    if(lengPerc <= 50)
        return Math.round(lengPerc*0.2)

    if(lengPerc >= 51)
        return Math.round( Math.random() * (25 - 10) + 10 )
}

const getRangePreviusMonthFromCurrentMonth = (): { firstDayPrev: Date, lastDayPrev: Date } => {
    const currentDate = new Date();
    const prevMonth = currentDate.getMonth() - 1;

    const prevDate = new Date();
    prevDate.setMonth(prevMonth);
    const firstDayPrev = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1);
    const lastDayPrev = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0);
    return {
        firstDayPrev,
        lastDayPrev
    }
}

const convertMinToHours = (minutes: number): number => {
    return minutes / 60;
}

const convertMsToHours = (ms: number): number => {
    return ms / 3600000;
}


const queueTime = () => {
    const dayNow = new Date();
    const time = `${dayNow.getHours()}:${dayNow.getMinutes()}`
    // * convert hours and minuts to miliseconds
    let hour = dayNow.getHours() * 60 * 60 * 1000;
    let minutes = dayNow.getMinutes() * 60 * 1000;
    // sums hour + minutes
    let timenow = hour + minutes
    // getTime
    let getTime = dayNow.getTime()
    // random data
    const ramdom = randomHour({
        hmin: dayNow.getHours(),
        mmin: dayNow.getMinutes(),
        // todo do time between in hour now
        // hmax: dayNow.getHours(),
        // mmax: dayNow.getMinutes() + 4,
        isPm: true
    })
    // subtract random time - timenow and get Rest of the time to now
    const delay = ramdom.time - timenow
    // what time will it run
    const exetime = getTime + delay
    // convert to human time
    const hourhumna = new Date(exetime).toLocaleString()

    return {
        hourNow: time,
        timeNow: timenow,
        ramdomHour: ramdom.hour,
        ramdomTime: ramdom.time,
        delay: delay,
        exeTime: exetime,
        humanTime: hourhumna,
    }
}
export {
    getDaysInMonth,
    getMonthWeeks,
    getWeekOfMonth,
    percentage,
    startDay,
    endDay,
    startEnd,
    getRangePreviusMonthFromCurrentMonth,
    convertMinToHours,
    convertMsToHours,
    queueTime
}