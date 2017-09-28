const {
    isDate,
    isWeekend,
    getDaysInMonth,
    setToStartOfDay,
    compareDates
} = require('./utils')

const {
    renderDay,
    renderWeek,
    renderRow,
    renderTable
} = require('./renderUtils')

const renderDays = function (year, month, randId, opts) {
    var now    = new Date(),
        days   = getDaysInMonth(year, month),
        before = new Date(year, month, 1).getDay(),
        data   = [],
        row    = [];

    setToStartOfDay(now);
    if (opts.firstDay > 0) {
        before -= opts.firstDay;
        if (before < 0) {
            before += 7;
        }
    }
    var previousMonth = month === 0 ? 11 : month - 1,
        nextMonth = month === 11 ? 0 : month + 1,
        yearOfPreviousMonth = month === 0 ? year - 1 : year,
        yearOfNextMonth = month === 11 ? year + 1 : year,
        daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
    var cells = days + before,
        after = cells;
    while(after > 7) {
        after -= 7;
    }
    cells += 7 - after;
    var isWeekSelected = false;
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

const renderMonths = function () {
    return ''
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