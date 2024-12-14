import { Calendar as CalendarType, Date } from "../../Lib/DateTime";
import { fromDateTimePartsToFormat } from "../../Lib/DateTime/date-time-helpers";
import { getGregorianMonths, isLeapGregorianYear, getGregorianWeekDays } from "../../Lib/DateTime/gregorian-calendar";
import { getPersianMonths, isLeapPersianYear, getPersianWeekDays } from "../../Lib/DateTime/persian-calendar";
import { getLanguageCode, getMuiLocale } from "../../Lib/helpers";
import { Languages, Local } from "../../Lib/Localization";
import { CalendarScope } from "./index.d";

export class CalendarManager {
    private type: CalendarType;
    private scope: CalendarScope = 'days';
    private code: Languages;
    private locale: Local;
    selectedYear: number;
    selectedMonth: number;

    days: number[];
    months: { name: string; days: number; }[];
    years: number[];

    constructor(type: CalendarType, selectedYear: number, selectedMonth: number, code: Languages, locale: Local) {
        this.type = type;
        this.selectedYear = selectedYear;
        this.selectedMonth = selectedMonth;
        this.code = code;
        this.locale = locale;
        this.setMonths(selectedYear);
        this.setDays(selectedYear, selectedMonth);
        this.setYears(selectedYear - 19, 20);
    }

    getScope() {
        return this.scope;
    }

    setScope(scope: CalendarScope, year: number, month: number) {
        if (this.scope === scope)
            return;

        this.selectedYear = year;
        this.selectedMonth = month;
        this.scope = scope;

        this.setMonths(year);
        this.setDays(year, month);
        this.setYears(year - 19, 20);
    }

    getScopeValues(): number[] | { name: string; days: number; }[] {
        switch (this.scope) {
            case 'days':
                return this.days;
            case 'months':
                return this.months;
            case 'years':
                return this.years;

            default:
                throw new Error('Invalid scope provided');
        }
    }

    getTitle(): string {
        switch (this.scope) {
            case 'days':
                return `${this.selectedYear}, ${this.getMonths()[this.selectedMonth - 1].name}`;
            case 'months':
                return this.selectedYear.toString();
            case 'years':
                return '';
            default:
                throw new Error('Invalid scope provided');
        }
    }

    getYears(): number[] {
        return this.years;
    }

    setYears(startYear: number, length: number): void {
        this.years = [];
        for (let i = 0; i < length; i++)
            this.years.push(startYear + i);
    }

    getMonths(): { name: string; days: number; }[] {
        return this.months;
    }

    setMonths(year: number): void {
        if (this.months && this.months.length > 0)
            return;

        this.months = this.type === 'Persian'
            ? getPersianMonths(isLeapPersianYear(year), getLanguageCode(getMuiLocale(this.code)))
            : getGregorianMonths(isLeapGregorianYear(year), getLanguageCode(getMuiLocale(this.code)));
    }

    getDays(): number[] {
        return this.days;
    }

    setDays(year: number, month: number): void {
        const weekDay = this.getWeekDay({ year, month, day: 1 });
        let index;
        if (this.locale.code === 'en' && this.type === 'Persian') {
            index = getGregorianWeekDays(this.code).findIndex(f => f === weekDay);
            if (index === -1)
                throw new Error('Invalid Week Day!');

            index = (index + 2) % 7;
        } else {
            index = this.getWeekDays().findIndex(f => f === weekDay);
            if (index === -1)
                throw new Error('Invalid Week Day!');
        }

        this.days = [];
        for (let i = 0; i < index; i++)
            this.days.push(null);

        const days = this.getMonths()[month].days;
        for (let i = 1; i <= days; i++)
            this.days.push(i);
    }

    getWeekDays(): string[] {
        return this.type === 'Persian' ? getPersianWeekDays(this.code) : getGregorianWeekDays(this.code);
    }

    getWeekDay(date: Date): string {
        return fromDateTimePartsToFormat({ ...this.locale, calendar: this.type }, { ...this.locale, calendar: this.type }, date, undefined, 'cccc');
    }

    next() {
        switch (this.scope) {
            case 'days':
                if (this.selectedMonth <= 11)
                    this.selectedMonth += 1;
                else {
                    this.selectedMonth = 1;
                    this.selectedYear += 1;
                }

                this.setDays(this.selectedYear, this.selectedMonth);
                break;

            case 'months':
                this.selectedYear += 1;
                this.setMonths(this.selectedYear);
                break;

            case 'years':
                this.setYears(this.years[0] + 20, 20);
                break;

            default:
                throw new Error('Invalid scope provided');
        }
    }

    previous() {
        switch (this.scope) {
            case 'days':
                if (this.selectedMonth > 1)
                    this.selectedMonth -= 1;
                else {
                    this.selectedMonth = 12;
                    this.selectedYear -= 1;
                }

                this.setDays(this.selectedYear, this.selectedMonth);
                break;

            case 'months':
                this.selectedYear -= 1;
                this.setMonths(this.selectedYear);
                break;

            case 'years':
                this.setYears(this.years[0] - 20, 20);
                break;

            default:
                throw new Error('Invalid scope provided');
        }
    }
}
