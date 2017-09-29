const {
    isArray
} = require('./utils')

const renderDayName = function(opts, day, abbr)
{
    day += opts.firstDay;
    while (day >= 7) {
        day -= 7;
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
}

const renderDay = function(opts)
{
    var arr = [];
    var ariaSelected = 'false';
    if (opts.isEmpty) {
        if (opts.showDaysInNextAndPreviousMonths) {
            arr.push('is-outside-current-month');

            if(!opts.enableSelectionDaysInNextAndPreviousMonths) {
                arr.push('is-selection-disabled');
            }

        } else {
            return '<td class="is-empty"></td>';
        }
    }
    if (opts.isDisabled) {
        arr.push('is-disabled');
    }
    if (opts.isToday) {
        arr.push('is-today');
    }
    if (opts.isSelected) {
        arr.push('is-selected');
        ariaSelected = 'true';
    }
    if (opts.hasEvent) {
        arr.push('has-event');
    }
    if (opts.isInRange) {
        arr.push('is-inrange');
    }
    if (opts.isStartRange) {
        arr.push('is-startrange');
    }
    if (opts.isEndRange) {
        arr.push('is-endrange');
    }
    return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
             '<button class="pika-button pika-day" type="button" ' +
                'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
                    opts.day +
             '</button>' +
           '</td>';
}

const renderMonth = function (config) {
    let classArray = [];
    let ariaSelected = false;

    if (config.isSelected) {
        classArray.push('is-selected');
        ariaSelected = true;
    }

    if (config.isThisMonth) {
        classArray.push('is-current-month');
    }
    return `<td data-month="${config.month}" class="${classArray.join(' ')}" aria-selected="${ariaSelected}">
                <button abbr="${config.monthName}" class="pika-button pika-month" type="button" 
                data-pika-year="${config.year}" data-pika-month="${config.month}">
                ${config.monthNameShort}
                </button>
            </td>`;
}

const renderYear = function () {
    return '';
}

const renderFinancialYear = function () {
    return '';
}

const renderWeek = function (d, m, y) {
    // Lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
    var onejan = new Date(y, 0, 1),
        weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay()+1)/7);
    return '<td class="pika-week">' + weekNum + '</td>';
}

const renderRow = function(days, isRTL = false, pickWholeWeek = false, isRowSelected = false)
{
    return '<tr class="pika-row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
}

const renderBody = function(rows)
{
    return '<tbody>' + rows.join('') + '</tbody>';
}

const renderHead = function(opts)
{
    var i, arr = [];
    if (opts.showWeekNumber) {
        arr.push('<th></th>');
    }
    if (opts.layout === 'days') {
        for (i = 0; i < 7; i++) {
            arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
        }
    }
    return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
}

const renderTitle = function(instance, c, year, month, refYear, randId)
{
    var i, j, arr,
        opts = instance._o,
        isMinYear = year === opts.minYear,
        isMaxYear = year === opts.maxYear,
        html = '<div id="' + randId + '" class="pika-title" role="heading" aria-live="assertive">',
        monthHtml,
        yearHtml,
        prev = true,
        next = true;

    for (arr = [], i = 0; i < 12; i++) {
        arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
            (i === month ? ' selected="selected"': '') +
            ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled="disabled"' : '') + '>' +
            opts.i18n.months[i] + '</option>');
    }

    monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';

    if (isArray(opts.yearRange)) {
        i = opts.yearRange[0];
        j = opts.yearRange[1] + 1;
    } else {
        i = year - opts.yearRange;
        j = 1 + year + opts.yearRange;
    }

    for (arr = []; i < j && i <= opts.maxYear; i++) {
        if (i >= opts.minYear) {
            arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"': '') + '>' + (i) + '</option>');
        }
    }
    yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';

    if (opts.showMonthAfterYear) {
        html += yearHtml + monthHtml;
    } else {
        html += monthHtml + yearHtml;
    }

    if (isMinYear && (month === 0 || opts.minMonth >= month)) {
        prev = false;
    }

    if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
        next = false;
    }

    if (c === 0) {
        html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
    }
    if (c === (instance._o.numberOfMonths - 1) ) {
        html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
    }

    return html += '</div>';
}

const renderTable = function(opts, data, randId)
{
    return '<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>';
}

module.exports = {
    renderDayName,
    renderDay,
    renderWeek,
    renderMonth,
    renderYear,
    renderFinancialYear,
    renderRow,
    renderBody,
    renderHead,
    renderTitle,
    renderTable
}