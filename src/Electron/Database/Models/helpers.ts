export const getFields = (fields: string[], filter?: string[]) => {
    if (!filter)
        return fields

    if (!filter.includes('*'))
        return fields.filter(rf => filter.includes(rf))
    else if (filter.length === 1)
        return fields
    else
        return fields.filter(rf => filter.find(f => f === `!${rf}`) === undefined)
}
