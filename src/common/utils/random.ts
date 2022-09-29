interface OptionsHourRamdom {
    hmin?: number;
    hmax?: number;
    mmin?: number;
    mmax?: number;
    isPm: boolean
}

export const randomHour = (options: OptionsHourRamdom = {isPm: false}) => {
    let hourpmin = options.isPm ? 0 : 1;
    let hourpmax = options.isPm ? 23 : 12;
    let HMIN = options.hmin ? options.hmin : hourpmin
    let HMAX = options.hmax ? options.hmax : hourpmax


    let MMIN = options.mmin ? options.mmin : 1;
    let MMAX = options.mmax ? options.mmax : 59;

    const hour = Math.floor(Math.random() * (HMAX - HMIN)) + HMIN;

    if (options.hmin && options.hmin !== hour) {
        MMIN = 1
    }
    const mins = Math.floor(Math.random() * (MMAX - MMIN)) + MMIN;

    const hourTime = hour * 60 * 60 * 1000
    const minTime = mins * 60 * 1000
    const time = hourTime + minTime

    return {
        hour: `${hour}:${mins}`,
        time,
        hourTime,
        minTime,
    }
}

export const getRandomInterval = (min: number, max: number, options?: { toFixed?: number }): number => {
    const r = Math.random() * (max - min) + min;
    if (options.hasOwnProperty('toFixed')) {
        if (typeof options.toFixed === 'number') {
            return +r.toFixed(options.toFixed)
        }
    }
    return r
}

export const  randomIntFromInterval = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
