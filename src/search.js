export function getParams(fields, searchOptions, separator = "%") {
    return fields
        .map(field => `${field}:${separator}${searchOptions.text}${separator}`)
        .join(";");
}
