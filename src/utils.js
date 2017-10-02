const hasEventListeners = !!window.addEventListener

const trim = function(str)
{
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
}

const addClass = function(el, cn)
{
    if (!hasClass(el, cn)) {
        el.className = (el.className === '') ? cn : el.className + ' ' + cn;
    }
}

const addEvent = function(el, e, callback, capture)
{
    if (hasEventListeners) {
        el.addEventListener(e, callback, !!capture);
    } else {
        el.attachEvent('on' + e, callback);
    }
}

const hasClass = function(el, cn)
{
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
}

const removeClass = function(el, cn)
{
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
}

const removeEvent = function(el, e, callback, capture)
{
    if (hasEventListeners) {
        el.removeEventListener(e, callback, !!capture);
    } else {
        el.detachEvent('on' + e, callback);
    }
}

const isArray = function(obj)
{
    return (/Array/).test(Object.prototype.toString.call(obj));
}

const isDate = function(obj)
{
    return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
}

const isWeekend = function(date)
{
    var day = date.getDay();
    return day === 0 || day === 6;
}

const isLeapYear = function(year)
{
    // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}

const getDaysInMonth = function(year, month)
{
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

const setToStartOfDay = function(date)
{
    if (isDate(date)) date.setHours(0,0,0,0);
}

const setToStartOfMonth = function(date)
{
    if (isDate(date)) date.setDate(0);
}

const compareDates = function(a,b)
{
    // weak date comparison (use setToStartOfDay(date) to ensure correct result)
    return a.getTime() === b.getTime();
}

const compareMonths = function(a, b)
{
    return a.getMonth() === b.getMonth() && a.getYear() === b.getYear();
}

const compareYears = function(a, b)
{
    return a.getYear() === b.getYear();
}

const extend = function(to, from, overwrite)
{
    var prop, hasProp;
    for (prop in from) {
        hasProp = to[prop] !== undefined;
        if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
            if (isDate(from[prop])) {
                if (overwrite) {
                    to[prop] = new Date(from[prop].getTime());
                }
            }
            else if (isArray(from[prop])) {
                if (overwrite) {
                    to[prop] = from[prop].slice(0);
                }
            } else {
                to[prop] = extend({}, from[prop], overwrite);
            }
        } else if (overwrite || !hasProp) {
            to[prop] = from[prop];
        }
    }
    return to;
}

const fireEvent = function(el, eventName, data)
{
    var ev;

    if (document.createEvent) {
        ev = document.createEvent('HTMLEvents');
        ev.initEvent(eventName, true, false);
        ev = extend(ev, data);
        el.dispatchEvent(ev);
    } else if (document.createEventObject) {
        ev = document.createEventObject();
        ev = extend(ev, data);
        el.fireEvent('on' + eventName, ev);
    }
}

const adjustCalendar = function(calendar) {
    if (calendar.month < 0) {
        calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
        calendar.month += 12;
    }
    if (calendar.month > 11) {
        calendar.year += Math.floor(Math.abs(calendar.month)/12);
        calendar.month -= 12;
    }
    return calendar;
}

const getDecade = function (date) {
    if (isDate(date)) {
        date = date.getFullYear();
    }

    const decadeOrigin = date - (date % 10);
    return decadeOrigin;
}

module.exports = {
    hasEventListeners,
    addClass,
    addEvent,
    hasClass,
    removeClass,
    removeEvent,
    isArray,
    isDate,
    isWeekend,
    isLeapYear,
    getDaysInMonth,
    setToStartOfDay,
    setToStartOfMonth,
    compareDates,
    compareMonths,
    compareYears,
    extend,
    fireEvent,
    adjustCalendar,
    getDecade
}