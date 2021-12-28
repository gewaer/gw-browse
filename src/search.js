export function getParams(fields, searchOptions, separator = "%") {
    return fields
        .map(field => `${field}:${separator}${searchOptions.text}${separator}`)
        .join(";");
}

export function getFixedFilters(
    searchOptions,
    params,
    { formatDate, mainDateField }
) {
    let fixedFilters = Object.entries(searchOptions.fixedFilters || {});
    const dateFilters = Object.entries(searchOptions.dates || {});
    let dateValues = "";

    if (fixedFilters.length || dateFilters.length) {
        fixedFilters = fixedFilters
            .map(([filterName, value]) => {
                if (Array.isArray(value)) {
                    return `${filterName}${value.join("")}`;
                } else {
                    return `${filterName}:${value}`;
                }
            })
            .join(",");
        if (dateFilters.length && mainDateField) {
            let dateFilterValue = formatDate(searchOptions.dates.start);
            if (searchOptions.dates.end) {
                dateFilterValue += `,${mainDateField}<${formatDate(
                    searchOptions.dates.end
                )}`;
            }
            dateValues = `${mainDateField}>${dateFilterValue}`;
        }
        params = [params, dateValues, fixedFilters]
            .filter(val => val)
            .join(",");
    }

    return params;
}
