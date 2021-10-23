/**
 * 工数の単位。
 */
export type ManHoursUnit = '人月' | '人日' | '時間' | 'h' | 'd';

/**
 * 工数レコード。
 */
export interface ManHoursReocrd {
  prefix?: string | null;
  amount: number;
  unit: ManHoursUnit;
}

/**
 * 工数。
 */
export class ManHours {

  public get records() {
    return [...this._records];
  }

  public get months() {
    return this._months;
  }
  public get days() {
    return this._days;
  }

  public get hours() {
    return this._hours;
  }

  private _records = [] as ManHoursReocrd[];
  private _months = 0;
  private _days = 0;
  private _hours = 0;

  add(prefix: string | null, amount: number, unit: ManHoursUnit): ManHours {
    if (unit === '人月') {
      this._months += amount;
    }
    if (unit === '人日' || unit === 'd') {
      this._days += amount;
    }
    if (unit === '時間' || unit === 'h') {
      this._hours += amount;
    }
    this._records.push({
      prefix,
      amount,
      unit
    });
    return this;
  }

  totalMonths() {
    const days = this._days + this._hours / 8;
    const months = this._months + days / 20;
    return months;
  }

  totalDays() {
    return this._months * 20 + this._days + this._hours / 8;
  }
}