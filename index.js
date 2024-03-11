import { price_table, bus_type } from "./const.js";

const convertToValue = (args) => {
    const dateInfo = args.split("/").map(item => Number(item));
    const date = new Date(dateInfo[0],dateInfo[1]-1,dateInfo[2],dateInfo[3],dateInfo[4],dateInfo[5])
    return date;
}

const caculateKiloFare = (distance, type, num, location) => {
    const convertedValue = Math.ceil(distance/10)*10;
    const result =  price_table[location-1].perKilo[type]*convertedValue*num;
    return result;
}

const calculateHourlyFare = (total, type, num, location) => {
    const result = Math.round(total/3600/1000)*price_table[location-1].perHour[type]*num;
    return result;
}

const calculateDriverFee = (total, type, num, location, distance) => {
    const convertedTime = Math.round(total/3600/1000);
    const convertedDistance = Math.ceil(distance/10)*10;

    if(convertedDistance >= 500 || convertedTime >= 16) {
        const hourlyFee = price_table[location-1].driverFeeHour*convertedTime;
        const kiloFee = price_table[location-1].driverFeeKilo*convertedDistance;

        return hourlyFee + kiloFee;
    } else {
        return 0
    }
}

const calculateBonus = (distance, start, end, type, num, location) => {
    const bonus = calculateTimeBonus(start, end, distance);

    const data = price_table[location-1];

    const bonusHourlyFee = data.perHour[type]*bonus.time*data.bonusFeePercent/100;
    const bonusKiloFee = data.perKilo[type]*bonus.distance*data.bonusFeePercent/100;

    return bonusHourlyFee+bonusKiloFee;

}

const calculateTimeBonus = (start, end, distance) => {
    const theDaybeforeStart = new Date(new Date(start).toLocaleDateString()).valueOf();

    //calculate the day before the start date
    const standardTime = theDaybeforeStart-3600*2*1000;

    //calculate the hours(22:00~5:00) from standard to start time or end time.
    const toStart = new Date(start).valueOf() - standardTime;
    const toEnd = new Date(end).valueOf() - standardTime;

    const start_time = {
        date: Number.parseInt(toStart/3600/1000/24), // total date
        time: Math.min(toStart%(3600*1000*24),3600*1000*7) //bonus hours
    }

    const end_time = {
        date: Number.parseInt(toEnd/3600/1000/24),
        time: Math.min(toEnd%(3600*1000*24),3600*1000*7)
    }

    const realBonusTime = (end_time.date - start_time.date)*7 + (end_time.time - start_time.time)/3600/1000;
    const realBonusDistance = distance*realBonusTime*3600*1000/(toEnd- toStart)

    const convertedBonusTime = Math.round(realBonusTime);
    const convertedBonusDistance = Math.ceil(realBonusDistance/10)*10

    const result = {
        time: convertedBonusTime,
        distance: convertedBonusDistance
    }

    return result;
}

function main() {
    const args = process.argv.slice(2);
    if (args.length !== 6) {
        console.error('invalid input');
        process.exit(1);
    }
    const totalDistance = args[0];
    const start_time = convertToValue(args[1])
    const end_time = convertToValue(args[2])
    const bus_shape = bus_type[args[3]];
    const bus_num = Number(args[4]);
    const location = Number(args[5]);
    const totalTime = new Date(end_time).valueOf() - new Date(start_time).valueOf();

    const kiloFare = caculateKiloFare(totalDistance, bus_shape, bus_num, location);
    const hourlyFare = calculateHourlyFare(totalTime, bus_shape, bus_num, location);
    const driverFee = calculateDriverFee(totalTime,bus_shape, bus_num,location, totalDistance);
    const timeBonusFee = calculateBonus(totalDistance, start_time, end_time, bus_shape, bus_num, location);
    
    const totalPrice = kiloFare + hourlyFare + driverFee + timeBonusFee; 

    console.log(kiloFare, hourlyFare, driverFee, timeBonusFee, totalPrice)
}

// プログラムの実行
main();
