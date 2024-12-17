import { Date } from "src/react/Lib/DateTime";
import { toFormat } from "../../Lib/DateTime/date-time-helpers";
import { getGregorianMonths, isLeapGregorianYear, getGregorianWeekDays } from "../../Lib/DateTime/gregorian-calendar";
import { getPersianMonths, isLeapPersianYear, getPersianWeekDays } from "../../Lib/DateTime/persian-calendar";
import { getLanguageCode, getMuiLocale } from "../../Lib/helpers";
import { CalendarScopes } from "./index.d";
import { Calendar, LanguageCodes, Local } from "../../../Electron/Configuration/renderer.d";

export class CalendarManager {
    private type: Calendar;
    private scope: CalendarScopes = 'days';
    private languageCode: LanguageCodes;
    private local: Local;
    selectedYear: number;
    selectedMonth: number;

    days: (number | null)[];
    months: { name: string; days: number; }[];
    years: number[];

    constructor(selectedYear: number, selectedMonth: number, local: Local) {
        this.type = local.calendar;
        this.selectedYear = selectedYear;
        this.selectedMonth = selectedMonth;
        this.languageCode = local.language;
        this.local = local;
        this.setMonths(selectedYear);
        this.setDays(selectedYear, selectedMonth);
        this.setYears(selectedYear - 19, 20);
    }

    getScope() {
        return this.scope;
    }

    setScope(scope: CalendarScopes, year: number, month: number) {
        if (this.scope === scope)
            return;

        this.selectedYear = year;
        this.selectedMonth = month;
        this.scope = scope;

        this.setMonths(year);
        this.setDays(year, month);
        this.setYears(year - 19, 20);
    }

    getScopeValues(): (number | null)[] | { name: string; days: number; }[] {
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
            ? getPersianMonths(isLeapPersianYear(year), getLanguageCode(getMuiLocale(this.languageCode)))
            : getGregorianMonths(isLeapGregorianYear(year), getLanguageCode(getMuiLocale(this.languageCode)));
    }

    getDays(): (number | null)[] {
        return this.days;
    }

    setDays(year: number, month: number): void {
        const weekDay = this.getWeekDay({ year, month, day: 1 });
        let index;
        if (this.local.language === 'en' && this.type === 'Persian') {
            index = getGregorianWeekDays(this.languageCode).findIndex(f => f === weekDay);
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

        const days = this.getMonths()[month - 1].days;
        for (let i = 1; i <= days; i++)
            this.days.push(i);
    }

    getWeekDays(): string[] {
        return this.type === 'Persian' ? getPersianWeekDays(this.languageCode) : getGregorianWeekDays(this.languageCode);
    }

    getWeekDay(date: Date): string {
        return toFormat({ date, time: { hour: 0, minute: 0, second: 0 } }, { ...this.local, calendar: this.type }, { ...this.local, calendar: this.type }, 'cccc');
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
