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

export function generateSearchParams(
    searchOptions,
    searchableFields,
    dateOptions
) {
    let params = "";
    const fixedFilters = Object.keys(searchOptions.fixedFilters || {});
    const dateFilters = Object.keys(searchOptions.dates || {});
    let searchFields = [];
    searchOptions.text = searchOptions.text.trim();

    if (searchOptions.text.length) {
        if (!searchOptions.filters.length) {
            searchFields = searchableFields.filter(field => {
                return (
                    !fixedFilters.includes(field) &&
                    !dateFilters.includes(field)
                );
            });
        } else {
            searchFields = searchOptions.filters.filter(field => {
                return (
                    !fixedFilters.includes(field) &&
                    !dateFilters.includes(field)
                );
            });
        }
        params += getParams(searchFields, searchOptions);
    }

    params = getFixedFilters(searchOptions, params, {
        formatDate: dateOptions.formatDate,
        mainDateField: dateOptions.mainDateField
    });

    return {
        q: `(${params})`
    };
}
