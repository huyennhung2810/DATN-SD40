export const TimeRangeType = {
    TODAY: "TODAY",
    WEEK: "WEEK",
    MONTH: "MONTH",
    YEAR: "YEAR"
} as const;

export type TimeRangeType = typeof TimeRangeType[keyof typeof TimeRangeType];