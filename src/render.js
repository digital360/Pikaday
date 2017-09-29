const {
    isDate,
    isWeekend,
    getDaysInMonth,
    setToStartOfDay,
    setToStartOfMonth,
    compareDates,
    compareMonths
} = require('./utils')

const {
    renderDay,
    renderWeek,
    renderMonth,
    renderYear,
    renderFinancialYear,
    renderRow,
    renderTable
} = require('./renderUtils')

const renderDays = function (year, month, randId, opts) {
    var now    = new Date(),
        days   = getDaysInMonth(year, month),
        // gets the first days number from this specific year and month (0..6)
        // Used to calculate the spaces before the days start getting painted
        before = new Date(year, month, 1).getDay(),
        data   = [],
        row    = [];

    setToStartOfDay(now);
    if (opts.firstDay > 0) {
        // If we select a day other than Monday (0) to be the first day of the
        // week, we should sustract this to before.
        before -= opts.firstDay;

        // if after the operation before is smaller than 0, we add another week
        if (before < 0) {
            before += 7;
        }
    }
    var previousMonth = month === 0 ? 11 : month - 1,
        nextMonth = month === 11 ? 0 : month + 1,
        yearOfPreviousMonth = month === 0 ? year - 1 : year,
        yearOfNextMonth = month === 11 ? year + 1 : year,
        daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);

    // This is the minimum number of cells we need to draw (number of days in
    // the current month plus the before days).
    var cells = days + before,
        // the number of extra cells we need to draw is the total of cells
        // we already have module 7.
        after = cells % 7;

    // while(after > 7) {
    //     after -= 7;
    // }

    // Total of cells we need to draw (hopefully multiple of 7)
    cells += 7 - after;
    var isWeekSelected = false;

    // For each day we need to draw
    for (var i = 0, r = 0; i < cells; i++)
    {
        var day = new Date(year, month, 1 + (i - before)),
            isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
            isToday = compareDates(day, now),
            hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
            isEmpty = i < before || i >= (days + before),
            dayNumber = 1 + (i - before),
            monthNumber = month,
            yearNumber = year,
            isStartRange = opts.startRange && compareDates(opts.startRange, day),
            isEndRange = opts.endRange && compareDates(opts.endRange, day),
            isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
            isDisabled = (opts.minDate && day < opts.minDate) ||
                         (opts.maxDate && day > opts.maxDate) ||
                         (opts.disableWeekends && isWeekend(day)) ||
                         (opts.disableDayFn && opts.disableDayFn(day));

        if (isEmpty) {
            if (i < before) {
                dayNumber = daysInPreviousMonth + dayNumber;
                monthNumber = previousMonth;
                yearNumber = yearOfPreviousMonth;
            } else {
                dayNumber = dayNumber - days;
                monthNumber = nextMonth;
                yearNumber = yearOfNextMonth;
            }
        }

        var dayConfig = {
                day: dayNumber,
                month: monthNumber,
                year: yearNumber,
                hasEvent: hasEvent,
                isSelected: isSelected,
                isToday: isToday,
                isDisabled: isDisabled,
                isEmpty: isEmpty,
                isStartRange: isStartRange,
                isEndRange: isEndRange,
                isInRange: isInRange,
                showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
                enableSelectionDaysInNextAndPreviousMonths: opts.enableSelectionDaysInNextAndPreviousMonths
            };

        if (opts.pickWholeWeek && isSelected) {
            isWeekSelected = true;
        }

        row.push(renderDay(dayConfig));

        if (++r === 7) {
            if (opts.showWeekNumber) {
                row.unshift(renderWeek(i - before, month, year));
            }
            data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected));
            row = [];
            r = 0;
            isWeekSelected = false;
        }
    }
    return renderTable(opts, data, randId);
}

const renderMonths = function (year, randId, opts) {
    const now = new Date();
    const months = 12;

    let data = [];
    let row = [];

    let previousYear = year - 1;
    let nextYear = year + 1;

    for (var i = 0, r = 0; i < months; i++) {
        let month = new Date(year, i);
        let isSelected = isDate(this._d) ? compareMonths(month, this._d) : false;
        let isThisMonth = compareMonths(month, now);
        let monthNumber = i + 1;
        let yearNumber = year;
        let monthConfig = {
            month: monthNumber,
            monthName: opts.i18n.months[i],
            monthNameShort: opts.i18n.monthsShort[i],
            year: yearNumber,
            isSelected: isSelected,
            isThisMonth: isThisMonth
        };

        row.push(renderMonth(monthConfig));

        if (++r === 4) {
            data.push(renderRow(row, opts.isRTL));
            row = [];
            r = 0;
        }
    }

    return renderTable(opts, data, randId);
}

const renderYears = function () {
    return ''
}

const renderFinancialYears = function () {
    return ''
}

module.exports = {
    renderDays,
    renderMonths,
    renderYears,
    renderFinancialYears
}