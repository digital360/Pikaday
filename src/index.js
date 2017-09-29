'use strict';

const moment = require('moment')

const {
    hasEventListeners,
    addClass,
    addEvent,
    hasClass,
    removeClass,
    removeEvent,
    isArray,
    isDate,
    setToStartOfDay,
    extend,
    fireEvent,
    adjustCalendar
} = require('./utils')

const {
    renderTitle
} = require('./renderUtils')

const {
    renderDays,
    renderMonths,
    renderYears,
    renderFinancialYears
} = require('./render')

let defaults = require('./defaults')

/**
 * feature detection and helper functions
 */
const document = window.document
const sto = window.setTimeout

/**
 * Pikaday constructor
 */
let Pikaday = function(options)
{
    var self = this,
        opts = self.config(options);

    self._onMouseDown = function(e)
    {
        if (!self._v) {
            return;
        }
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (!target) {
            return;
        }

        if (!hasClass(target, 'is-disabled')) {
            if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {

                // We set a different date depending on the chosen layout
                if (opts.layout === 'days') {
                    self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                } else if (opts.layout === 'months') {
                    self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), 0));
                } else if (opts.layout === 'years') {
                    self.setDate(new Date(target.getAttribute('data-pika-year'), 0, 0));
                } else if (opts.layout === 'financialYears') {
                    self.setDate(new Date(target.getAttribute('data-pika-year'), 0, 0));
                } else {
                    self.setDate(new Date());
                }

                if (opts.bound) {
                    sto(function() {
                        self.hide();
                        if (opts.blurFieldOnSelect && opts.field) {
                            opts.field.blur();
                        }
                    }, 100);
                }
            }
            else if (hasClass(target, 'pika-prev')) {
                if (opts.layout === 'days') {
                    self.prevMonth();
                } else if (opts.layout === 'months') {
                    self.prevYear();
                }
            }
            else if (hasClass(target, 'pika-next')) {
                if (opts.layout === 'days') {
                    self.nextMonth();
                } else if (opts.layout === 'months') {
                    self.nextYear();
                }
            }
        }
        if (!hasClass(target, 'pika-select')) {
            // if this is touch event prevent mouse events emulation
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
                return false;
            }
        } else {
            self._c = true;
        }
    };

    self._onChange = function(e)
    {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (!target) {
            return;
        }
        if (hasClass(target, 'pika-select-month')) {
            self.gotoMonth(target.value);
        }
        else if (hasClass(target, 'pika-select-year')) {
            self.gotoYear(target.value);
        }
    };

    self._onKeyChange = function(e)
    {
        e = e || window.event;

        if (self.isVisible()) {

            switch(e.keyCode){
                case 13:
                case 27:
                    if (opts.field) {
                        opts.field.blur();
                    }
                    break;
                case 37:
                    e.preventDefault();
                    self.adjustDate('subtract', 1);
                    break;
                case 38:
                    self.adjustDate('subtract', 7);
                    break;
                case 39:
                    self.adjustDate('add', 1);
                    break;
                case 40:
                    self.adjustDate('add', 7);
                    break;
            }
        }
    };

    self._onInputChange = function(e)
    {
        var date;

        if (e.firedBy === self) {
            return;
        }
        if (opts.parse) {
            date = opts.parse(opts.field.value, opts.format);
        } else {
            date = moment(opts.field.value, opts.format, opts.formatStrict);
            date = (date && date.isValid()) ? date.toDate() : null;
        }
        if (isDate(date)) {
          self.setDate(date);
        }
        if (!self._v) {
            self.show();
        }
    };

    self._onInputFocus = function()
    {
        self.show();
    };

    self._onInputClick = function()
    {
        self.show();
    };

    self._onInputBlur = function()
    {
        // IE allows pika div to gain focus; catch blur the input field
        var pEl = document.activeElement;
        do {
            if (hasClass(pEl, 'pika-single')) {
                return;
            }
        }
        while ((pEl = pEl.parentNode));

        if (!self._c) {
            self._b = sto(function() {
                self.hide();
            }, 50);
        }
        self._c = false;
    };

    self._onClick = function(e)
    {
        e = e || window.event;
        var target = e.target || e.srcElement,
            pEl = target;
        if (!target) {
            return;
        }
        if (!hasEventListeners && hasClass(target, 'pika-select')) {
            if (!target.onchange) {
                target.setAttribute('onchange', 'return;');
                addEvent(target, 'change', self._onChange);
            }
        }
        do {
            if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                return;
            }
        }
        while ((pEl = pEl.parentNode));
        if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
            self.hide();
        }
    };

    self.el = document.createElement('div');
    self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

    addEvent(self.el, 'mousedown', self._onMouseDown, true);
    addEvent(self.el, 'touchend', self._onMouseDown, true);
    addEvent(self.el, 'change', self._onChange);

    if (opts.keyboardInput) {
        addEvent(document, 'keydown', self._onKeyChange);
    }

    if (opts.field) {
        if (opts.container) {
            opts.container.appendChild(self.el);
        } else if (opts.bound) {
            document.body.appendChild(self.el);
        } else {
            opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
        }
        addEvent(opts.field, 'change', self._onInputChange);

        if (!opts.defaultDate) {
            if (opts.field.value) {
                opts.defaultDate = moment(opts.field.value, opts.format).toDate();
            } else {
                opts.defaultDate = new Date(Date.parse(opts.field.value));
            }
            opts.setDefaultDate = true;
        }
    }

    var defDate = opts.defaultDate;

    if (isDate(defDate)) {
        if (opts.setDefaultDate) {
            self.setDate(defDate, true);
        } else {
            self.gotoDate(defDate);
        }
    } else {
        self.gotoDate(new Date());
    }

    if (opts.bound) {
        this.hide();
        self.el.className += ' is-bound';
        addEvent(opts.trigger, 'click', self._onInputClick);
        addEvent(opts.trigger, 'focus', self._onInputFocus);
        addEvent(opts.trigger, 'blur', self._onInputBlur);
    } else {
        this.show();
    }
};


/**
 * public Pikaday API
 */
Pikaday.prototype = {


    /**
     * configure functionality
     */
    config: function(options)
    {
        if (!this._o) {
            this._o = extend({}, defaults, true);
        }

        var opts = extend(this._o, options, true);

        opts.isRTL = !!opts.isRTL;

        opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

        opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

        opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

        opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

        opts.disableWeekends = !!opts.disableWeekends;

        opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

        var nom = parseInt(opts.numberOfMonths, 10) || 1;
        opts.numberOfMonths = nom > 4 ? 4 : nom;

        if (!isDate(opts.minDate)) {
            opts.minDate = false;
        }
        if (!isDate(opts.maxDate)) {
            opts.maxDate = false;
        }
        if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
            opts.maxDate = opts.minDate = false;
        }
        if (opts.minDate) {
            this.setMinDate(opts.minDate);
        }
        if (opts.maxDate) {
            this.setMaxDate(opts.maxDate);
        }

        if (isArray(opts.yearRange)) {
            var fallback = new Date().getFullYear() - 10;
            opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
            opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
        } else {
            opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
            if (opts.yearRange > 100) {
                opts.yearRange = 100;
            }
        }

        return opts;
    },

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString: function(format)
    {
        format = format || this._o.format;
        if (!isDate(this._d)) {
            return '';
        }
        if (this._o.toString) {
          return this._o.toString(this._d, format);
        }
        return moment(this._d).format(format);
    },

    /**
     * return a Moment.js object of the current selection (if available)
     */
    getMoment: function()
    {
        return moment(this._d);
    },

    /**
     * set the current selection from a Moment.js object (if available)
     */
    setMoment: function(date, preventOnSelect)
    {
        if (moment.isMoment(date)) {
            this.setDate(date.toDate(), preventOnSelect);
        }
    },

    /**
     * return a Date object of the current selection
     */
    getDate: function()
    {
        return isDate(this._d) ? new Date(this._d.getTime()) : null;
    },

    /**
     * set the current selection
     */
    setDate: function(date, preventOnSelect)
    {
        if (!date) {
            this._d = null;

            if (this._o.field) {
                this._o.field.value = '';
                fireEvent(this._o.field, 'change', { firedBy: this });
            }

            return this.draw();
        }
        if (typeof date === 'string') {
            date = new Date(Date.parse(date));
        }
        if (!isDate(date)) {
            return;
        }

        var min = this._o.minDate,
            max = this._o.maxDate;

        if (isDate(min) && date < min) {
            date = min;
        } else if (isDate(max) && date > max) {
            date = max;
        }

        this._d = new Date(date.getTime());
        setToStartOfDay(this._d);
        this.gotoDate(this._d);

        if (this._o.field) {
            this._o.field.value = this.toString();
            fireEvent(this._o.field, 'change', { firedBy: this });
        }
        if (!preventOnSelect && typeof this._o.onSelect === 'function') {
            this._o.onSelect.call(this, this.getDate());
        }
    },

    /**
     * change view to a specific date
     */
    gotoDate: function(date)
    {
        var newCalendar = true;

        if (!isDate(date)) {
            return;
        }

        if (this.calendars) {
            var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                lastVisibleDate = new Date(this.calendars[this.calendars.length-1].year, this.calendars[this.calendars.length-1].month, 1),
                visibleDate = date.getTime();
            // get the end of the month
            lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);
            lastVisibleDate.setDate(lastVisibleDate.getDate()-1);
            newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
        }

        if (newCalendar) {
            this.calendars = [{
                month: date.getMonth(),
                year: date.getFullYear()
            }];
            if (this._o.mainCalendar === 'right') {
                this.calendars[0].month += 1 - this._o.numberOfMonths;
            }
        }

        this.adjustCalendars();
    },

    adjustDate: function(sign, days) {

        var day = this.getDate() || new Date();
        var difference = parseInt(days)*24*60*60*1000;

        var newDay;

        if (sign === 'add') {
            newDay = new Date(day.valueOf() + difference);
        } else if (sign === 'subtract') {
            newDay = new Date(day.valueOf() - difference);
        }

        this.setDate(newDay);
    },

    adjustCalendars: function() {
        this.calendars[0] = adjustCalendar(this.calendars[0]);
        for (var c = 1; c < this._o.numberOfMonths; c++) {
            this.calendars[c] = adjustCalendar({
                month: this.calendars[0].month + c,
                year: this.calendars[0].year
            });
        }
        this.draw();
    },

    gotoToday: function()
    {
        this.gotoDate(new Date());
    },

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth: function(month)
    {
        if (!isNaN(month)) {
            this.calendars[0].month = parseInt(month, 10);
            this.adjustCalendars();
        }
    },

    nextMonth: function()
    {
        this.calendars[0].month++;
        this.adjustCalendars();
    },

    prevMonth: function()
    {
        this.calendars[0].month--;
        this.adjustCalendars();
    },

    nextYear: function()
    {
        this.calendars[0].year++;
        this.adjustCalendars();
    },

    prevYear: function()
    {
        this.calendars[0].year--;
        this.adjustCalendars();
    },

    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear: function(year)
    {
        if (!isNaN(year)) {
            this.calendars[0].year = parseInt(year, 10);
            this.adjustCalendars();
        }
    },

    /**
     * change the minDate
     */
    setMinDate: function(value)
    {
        if(value instanceof Date) {
            setToStartOfDay(value);
            this._o.minDate = value;
            this._o.minYear  = value.getFullYear();
            this._o.minMonth = value.getMonth();
        } else {
            this._o.minDate = defaults.minDate;
            this._o.minYear  = defaults.minYear;
            this._o.minMonth = defaults.minMonth;
            this._o.startRange = defaults.startRange;
        }

        this.draw();
    },

    /**
     * change the maxDate
     */
    setMaxDate: function(value)
    {
        if(value instanceof Date) {
            setToStartOfDay(value);
            this._o.maxDate = value;
            this._o.maxYear = value.getFullYear();
            this._o.maxMonth = value.getMonth();
        } else {
            this._o.maxDate = defaults.maxDate;
            this._o.maxYear = defaults.maxYear;
            this._o.maxMonth = defaults.maxMonth;
            this._o.endRange = defaults.endRange;
        }

        this.draw();
    },

    setStartRange: function(value)
    {
        this._o.startRange = value;
    },

    setEndRange: function(value)
    {
        this._o.endRange = value;
    },

    /**
     * refresh the HTML
     */
    draw: function(force)
    {
        if (!this._v && !force) {
            return;
        }
        var opts = this._o,
            layout = opts.layout,
            minYear = opts.minYear,
            maxYear = opts.maxYear,
            minMonth = opts.minMonth,
            maxMonth = opts.maxMonth,
            html = '',
            randId;

        if (this._y <= minYear) {
            this._y = minYear;
            if (!isNaN(minMonth) && this._m < minMonth) {
                this._m = minMonth;
            }
        }
        if (this._y >= maxYear) {
            this._y = maxYear;
            if (!isNaN(maxMonth) && this._m > maxMonth) {
                this._m = maxMonth;
            }
        }

        randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

        for (var c = 0; c < opts.numberOfMonths; c++) {
            let renderedBody = '';

            if (layout === 'days') {
                renderedBody = renderDays(this.calendars[c].year, this.calendars[c].month, randId, this._o)
            } else if (layout === 'months') {
                renderedBody = renderMonths(this.calendars[c].year, randId, this._o)
            } else if (layout === 'years') {
                renderedBody = renderYears(this.calendars[c].year, this.calendars[c].month, randId, this._o)
            } else if (layout === 'financialYears') {
                renderedBody = renderFinancialYears(this.calendars[c].year, this.calendars[c].month, randId, this._o)
            }

            html += '<div class="pika-lendar">' 
                + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) 
                + renderedBody
                + '</div>';
        }

        this.el.innerHTML = html;

        if (opts.bound) {
            if(opts.field.type !== 'hidden') {
                sto(function() {
                    opts.trigger.focus();
                }, 1);
            }
        }

        if (typeof this._o.onDraw === 'function') {
            this._o.onDraw(this);
        }

        if (opts.bound) {
            // let the screen reader user know to use arrow keys
            opts.field.setAttribute('aria-label', opts.ariaLabel);
        }
    },

    adjustPosition: function()
    {
        var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect;

        if (this._o.container) return;

        this.el.style.position = 'absolute';

        field = this._o.trigger;
        pEl = field;
        width = this.el.offsetWidth;
        height = this.el.offsetHeight;
        viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

        if (typeof field.getBoundingClientRect === 'function') {
            clientRect = field.getBoundingClientRect();
            left = clientRect.left + window.pageXOffset;
            top = clientRect.bottom + window.pageYOffset;
        } else {
            left = pEl.offsetLeft;
            top  = pEl.offsetTop + pEl.offsetHeight;
            while((pEl = pEl.offsetParent)) {
                left += pEl.offsetLeft;
                top  += pEl.offsetTop;
            }
        }

        // default position is bottom & left
        if ((this._o.reposition && left + width > viewportWidth) ||
            (
                this._o.position.indexOf('right') > -1 &&
                left - width + field.offsetWidth > 0
            )
        ) {
            left = left - width + field.offsetWidth;
        }
        if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
            (
                this._o.position.indexOf('top') > -1 &&
                top - height - field.offsetHeight > 0
            )
        ) {
            top = top - height - field.offsetHeight;
        }

        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
    },

    isVisible: function()
    {
        return this._v;
    },

    show: function()
    {
        if (!this.isVisible()) {
            this._v = true;
            this.draw();
            removeClass(this.el, 'is-hidden');
            if (this._o.bound) {
                addEvent(document, 'click', this._onClick);
                this.adjustPosition();
            }
            if (typeof this._o.onOpen === 'function') {
                this._o.onOpen.call(this);
            }
        }
    },

    hide: function()
    {
        var v = this._v;
        if (v !== false) {
            if (this._o.bound) {
                removeEvent(document, 'click', this._onClick);
            }
            this.el.style.position = 'static'; // reset
            this.el.style.left = 'auto';
            this.el.style.top = 'auto';
            addClass(this.el, 'is-hidden');
            this._v = false;
            if (v !== undefined && typeof this._o.onClose === 'function') {
                this._o.onClose.call(this);
            }
        }
    },

    /**
     * GAME OVER
     */
    destroy: function()
    {
        var opts = this._o;

        this.hide();
        removeEvent(this.el, 'mousedown', this._onMouseDown, true);
        removeEvent(this.el, 'touchend', this._onMouseDown, true);
        removeEvent(this.el, 'change', this._onChange);
        if (opts.keyboardInput) {
            removeEvent(document, 'keydown', this._onKeyChange);
        }
        if (opts.field) {
            removeEvent(opts.field, 'change', this._onInputChange);
            if (opts.bound) {
                removeEvent(opts.trigger, 'click', this._onInputClick);
                removeEvent(opts.trigger, 'focus', this._onInputFocus);
                removeEvent(opts.trigger, 'blur', this._onInputBlur);
            }
        }
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

};

module.exports = Pikaday