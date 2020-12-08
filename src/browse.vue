<template>
    <div class="browse-list">
        <modal
            :draggable="true"
            :adaptive="true"
            :scrollable="true"
            height="auto"
            name="custom-filters-form"
        >
            <custom-filters-form
                :fields="customFilterFields"
                :resource-name="resource.slug"
                mode="form"
                @saved="closeAddCustomFilter()"
            />
        </modal>

        <h4 v-if="showTitle" class="section-title">
            {{ resource.name }}
        </h4>

        <slot :data="{ searchOptions }" name="resource-actions" v-bind="{ searchOptions, getData, filterableFields }">
            <resource-actions
                v-if="showResourceActions"
                :bulk-actions="bulkActionsList"
                :create-resource-url="createResourceUrl"
                :current-resource="resource"
                :custom-filter-fields="customFilterFields"
                :filterable-fields="filterableFields"
                :search-options="searchOptions"
                :show-bulk-actions="showBulkActions"
                :show-create-resource="showCreateResource"
                :show-search-filters="showSearchFilters"
                @getData="getData"
                @run-action="runAction"
                @show-custom-filters-form="$modal.show('custom-filters-form')"
            />
        </slot>

        <div v-show="!loading">
            <div class="table-container m-b-0">
                <div v-if="showPagination && showPaginationTop" class="pagination-controls pc-top row">
                    <slot name="before-pagination" />

                    <div class="d-flex">
                        <template v-if="showResultsPerPage">
                            <div class="col-auto">
                                <label class="mb-0">Results per page:</label>
                            </div>
                            <div class="col-auto">
                                <multiselect
                                    v-model="selectedPerPage"
                                    :allow-empty="false"
                                    :show-labels="false"
                                    :options="resultsPerPageOptions"
                                    :searchable="false"
                                    placeholder=""
                                    @input="changePerPage"
                                />
                            </div>
                            <div v-show="totalPages > 1" class="col-auto separator">
                                |
                            </div>
                        </template>
                        <vuetable-pagination
                            ref="paginationTop"
                            :css="pagination"
                            class="col-auto"
                            @vuetable-pagination:change-page="onChangePage"
                        />
                    </div>
                </div>
                <div class="table-responsive">
                    <vuetable
                        ref="Vuetable"
                        :api-url="`/${resource.endpoint || resource.slug}`"
                        :append-params="vuetableQueryParams"
                        :css="vuetableStyles"
                        :data-path="dataPath"
                        :fields="tableFields"
                        :http-fetch="httpFetch"
                        :http-options="httpOptions"
                        :per-page="perPage"
                        :query-params="queryParams"
                        :pagination-path="paginationPath"
                        :show-sort-icons="true"
                        class="table table-condensed"
                        track-by="id"
                        @vuetable:load-error="response => $emit('load-error', response)"
                        @vuetable:loaded="loading = false"
                        @vuetable:loading="loading = true"
                        @vuetable:pagination-data="onPaginationData"
                    >
                        <slot
                            slot="actions"
                            slot-scope="props"
                            v-bind="{ ...props }"
                            name="actions"
                        >
                            <div class="d-flex align-items-center justify-content-end">
                                <slot
                                    v-bind="{ ...props }"
                                    name="actions-before"
                                />
                                <slot
                                    v-bind="{ ...props }"
                                    name="actions-edit"
                                >
                                    <button
                                        v-if="showActionsEdit"
                                        type="button"
                                        class="btn btn-primary btn-sm"
                                        @click="editResource(props.rowData.id)"
                                    >
                                        <i class="fa fa-edit" />
                                    </button>
                                </slot>
                                <slot
                                    v-bind="{ ...props }"
                                    name="actions-delete"
                                >
                                    <button
                                        v-if="showActionsDelete"
                                        type="button"
                                        class="btn btn-danger btn-sm"
                                        @click="confirmDelete(props)"
                                    >
                                        <i class="fa fa-trash-alt" />
                                    </button>
                                </slot>
                                <slot
                                    v-bind="{ ...props }"
                                    name="actions-after"
                                />
                            </div>
                        </slot>
                    </vuetable>
                </div>
                <div v-if="showPagination && showPaginationBottom" class="pagination-controls pc-bottom row">
                    <template v-if="showResultsPerPage">
                        <div class="col-auto">
                            <label class="mb-0">Results per page:</label>
                        </div>
                        <div class="col-auto">
                            <multiselect
                                v-model="selectedPerPage"
                                :allow-empty="false"
                                :show-labels="false"
                                :options="resultsPerPageOptions"
                                :searchable="false"
                                placeholder=""
                                @input="changePerPage"
                            />
                        </div>
                        <div v-show="totalPages > 1" class="col-auto separator">
                            |
                        </div>
                    </template>
                    <vuetable-pagination
                        ref="paginationBottom"
                        :css="pagination"
                        class="col-auto"
                        @vuetable-pagination:change-page="onChangePage"
                    />
                </div>
            </div>
        </div>
        <slot name="loading">
            <div v-show="loading" class="loading">
                <img src="https://mc-canvas.s3.amazonaws.com/progress-circle.svg" width="48" height="48">
            </div>
        </slot>
    </div>
</template>

<script>
import _clone from "lodash/clone";
import CustomFiltersForm from "./components/custom-filters-form";
import ResourceActions from "./components/resource-actions";
import CheckboxField from "./components/checkbox-field";
import ResourceDeleteModal from "./components/resource-delete-modal";
import Vuetable from "vuetable-2";
import VuetablePagination from "vuetable-2/src/components/VuetablePagination";

export default {
    name: "GwBrowse",
    components: {
        CustomFiltersForm,
        ResourceActions,
        Vuetable,
        VuetablePagination
    },
    props: {
        appendParams: {
            type: Object,
            default() {
                return {}
            }
        },
        bulkActions: {
            type: Array,
            default() {
                return [
                    {
                        name: "Export CSV",
                        action: "exportCsv"
                    },
                    {
                        name: "Export PDF",
                        action: "exportPdf"
                    },
                    {
                        name: "Delete",
                        action: "bulkDelete"
                    }
                ];
            },
            validator(options) {
                return options.every(option => option.name && option.action);
            }
        },
        bulkMethods: {
            type: Object,
            default() {
                return {}
            }
        },
        createResourceUrl: {
            type: [Object, String],
            default: null
        },
        dataPath: {
            type: String,
            default: "data"
        },
        httpFetch: {
            type: Function,
            default: null
        },
        httpOptions: {
            type: Object,
            default() {
                return {}
            }
        },
        queryParams: {
            type: Object,
            default() {
                return {
                    sort: "sort",
                    page: "page",
                    perPage: "per_page"
                }
            }
        },
        paginationData: {
            type: Function,
            default: null
        },
        paginationPath: {
            type: String,
            default: "links.pagination"
        },
        resource: {
            type: Object,
            required: true
        },
        resultsPerPage: {
            type: Number,
            default: 25
        },
        resultsPerPageOptions: {
            type: Array,
            default() {
                return [25, 50, 100];
            }
        },
        searchOptions: {
            type: Object,
            default() {
                return {
                    text: "",
                    filters: []
                }
            }
        },
        showActionsDelete: {
            type: Boolean,
            default: true
        },
        showActionsEdit: {
            type: Boolean,
            default: true
        },
        showBulkActions: {
            type: Boolean,
            default: true
        },
        showCreateResource: {
            type: Boolean,
            default: true
        },
        showPagination: {
            type: Boolean,
            default: true
        },
        showPaginationBottom: {
            type: Boolean,
            default: true
        },
        showPaginationTop: {
            type: Boolean,
            default: true
        },
        showResourceActions: {
            type: Boolean,
            default: true
        },
        showResultsPerPage: {
            type: Boolean,
            default: true
        },
        showSearchFilters: {
            type: Boolean,
            default: true
        },
        showTitle: {
            type: Boolean,
            default: true
        },
        extraFields: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            bulkActionsList: [],
            bulkActionsMethods: {},
            customFilterFields: [],
            loading: true,
            pagination: {
                activeClass: "active",
                icons: {
                    first: "fa fa-angle-double-left",
                    prev: "fa fa-angle-left",
                    next: "fa fa-angle-right",
                    last: "fa fa-angle-double-right"
                }
            },
            perPage: 25,
            selectedPerPage: 25,
            totalPages: 0,
            vuetableActions: {
                name: "actions",
                title: "Actions",
                titleClass: "table-actions",
                dataClass: "table-actions"
            },
            tableFields: [],
            vuetableQueryParams: _clone(this.appendParams),
            vuetableSelection: {
                name: CheckboxField,
                title: "checkbox",
                titleClass: "text-center",
                dataClass: "text-center",
                width: "5%"
            },
            vuetableStyles: {
                ascendingClass: "",
                ascendingIcon: "fa fa-sort-up",
                descendingClass: "",
                descendingIcon: "fa fa-sort-down",
                sortableIcon: "fa fa-sort"
            }
        };
    },
    computed: {
        filterableFields() {
            return this.tableFields.filter(field => field.filterable).map(field => field.name);
        },
        searchableFields() {
            return this.tableFields.filter(field => field.searchable).map(field => field.name);
        },
        mainDateField() {
            const mainDateField = this.tableFields.filter(field => field.dateFilter).map(field => field.name);
            return mainDateField.length ? mainDateField[0] : "";
        }
    },
    watch: {
        appendParams() {
            this.vuetableQueryParams = _clone(this.appendParams);
        },
        resource() {
            this.$refs.Vuetable.resetData();
            this.vuetableQueryParams.q = null;
            this.getSchema(this.resource);
            this.resetQueryParams();
        }
    },
    created() {
        this.setPerPage();
        this.getSchema(this.resource);
    },
    methods: {
        bulkDelete() {},
        closeAddCustomFilter() {
            this.$modal.hide("custom-filters-form");
        },
        changePerPage() {
            this.$refs.Vuetable.currentPage = 1;
            this.perPage = this.selectedPerPage;
        },
        confirmDelete(data) {
            this.$modal.show(ResourceDeleteModal, {
                buttons: [{
                    title: "Cancel",
                    handler: () => {
                        this.$modal.hide("delete-resource");
                    }
                }, {
                    title: "Confirm",
                    class: "btn-danger",
                    handler: () => {
                        this.deleteResource(data);
                    }
                }]
            }, {
                adaptive: true,
                clickToClose: false,
                height: "auto",
                name: "delete-resource",
                width: 500
            });
        },
        deleteResource(data) {
            axios({
                url: `/${this.resource.slug}/${data.rowData.id}`,
                method: "DELETE"
            }).then((response) => {
                this.$emit("delete-success", response, data);
                this.refresh();
            }).catch((error) => {
                this.$emit("delete-error", error, data);
            }).finally(() => {
                this.$modal.hide("delete-resource");
            });
        },
        editResource(resourceId) {
            this.$router.push({
                path: `/${this.resource.slug}/${resourceId}/edit`
            });
        },
        exportCsv() {},
        exportPdf() {},
        getAllQueryParams() {
            return this.$refs.Vuetable.getAllQueryParams();
        },
        getData(searchOptions) {
            let params = "";
            const fixedFilters = Object.keys(searchOptions.fixedFilters || {});
            const dateFilters = Object.keys(searchOptions.dates || {});
            let searchableFields = [];
            searchOptions.text = searchOptions.text.trim();

            if (searchOptions.text.length) {
                if (!searchOptions.filters.length) {
                    searchableFields = this.searchableFields.filter(field => !fixedFilters.includes(field) && !dateFilters.includes(field));
                } else {
                    searchableFields = searchOptions.filters.filter(field => !fixedFilters.includes(field) && !dateFilters.includes(field));
                }
                params += this.getParams(searchableFields, searchOptions);
            }

            params = this.getFixedFilters(searchOptions, params);

            this.vuetableQueryParams.q = `(${params})`;
            this.refresh();
        },
        getParams(fields, searchOptions, separator = "%") {
            return fields.map(field => `${field}:${separator}${searchOptions.text}${separator}`).join(";");
        },
        getSchema() {
            axios({
                url: `/schema/${this.resource.slug}`
            }).then((response) => {
                this.tableFields = this.processTableFields(response.data.tableFields);
                const bulkActions = response.data.bulkActions || [];

                this.validateBulkActions(bulkActions);
                this.setBulkActions(bulkActions);
                this.showBulkActions && this.tableFields.unshift(this.vuetableSelection);
                (this.showActionsDelete || this.showActionsEdit) && this.tableFields.push(this.vuetableActions);
            });
        },

        getFixedFilters(searchOptions, params) {
            let fixedFilters = Object.entries(searchOptions.fixedFilters || {});
            const dateFilters = Object.entries(searchOptions.dates || {});
            let dateValues = "";

            if (fixedFilters.length || dateFilters.length) {
                fixedFilters = fixedFilters.map(([filterName, value]) => `${filterName}:${value}`).join(";");
                if (dateFilters.length && this.mainDateField) {
                    let dateFilterValue = this.formatDate(searchOptions.dates.start);
                    if (searchOptions.dates.end) {
                        dateFilterValue += `,${this.mainDateField}<${this.formatDate(searchOptions.dates.end)}`;
                    }
                    dateValues = `${this.mainDateField}>${dateFilterValue}`;
                }
                params = [params, dateValues, fixedFilters].filter(val => val).join(",");
            }

            return params;
        },

        processTableFields(endpointFields) {
            const newFields = [];
            this.extraFields.forEach((fieldDefinition, index) => {
                // find field to replace the render
                const fieldIndex = endpointFields.findIndex(field => [fieldDefinition.name, fieldDefinition.field].includes(field.name));
                if (fieldIndex != -1) {
                    const fieldName = endpointFields[fieldIndex].name;
                    endpointFields[fieldIndex] = { ...endpointFields[fieldIndex], ...fieldDefinition, fieldName };
                } else {
                    newFields.push(index);
                }
            });
            newFields.forEach((fieldIndex) => {
                endpointFields.push(this.extraFields[fieldIndex]);
            });

            return endpointFields;
        },
        formatDate(date) {
            return date ? date.toISOString().slice(0, 10) : "";
        },
        getSelectedRows() {
            return this.$refs.Vuetable.selectedTo;
        },
        onChangePage(page) {
            this.$refs.Vuetable.changePage(page);
        },
        onPaginationData(data) {
            if (this.paginationData) {
                data = this.paginationData(data);
            }

            this.totalPages = data.last_page;
            this.$refs.Vuetable.tablePagination = data;
            this.showPagination && this.showPaginationBottom && this.$refs.paginationBottom.setPaginationData(data);
            this.showPagination && this.showPaginationTop && this.$refs.paginationTop.setPaginationData(data);
        },
        refresh() {
            this.$refs.Vuetable.refresh();
        },
        runAction(action) {
            this.bulkActionsMethods[action](this.$refs.Vuetable.selectedTo);
        },
        setBulkActions(bulkActions = []) {
            if (!this.showResourceActions || !this.showBulkActions) {
                return;
            }

            !bulkActions.length && (bulkActions = this.bulkActions);
            this.bulkActionsList = bulkActions;

            this.bulkActions.forEach(action => {
                this.bulkActionsMethods[action.action] = this.bulkMethods[action.action] || this[action.action];
            });
        },
        setPerPage() {
            const optionIncluded = this.resultsPerPageOptions.includes(this.resultsPerPage);
            this.selectedPerPage = optionIncluded ? this.resultsPerPage : this.resultsPerPageOptions[0];
            this.perPage = this.selectedPerPage;
        },
        validateBulkActions(actions) {
            const areValid = actions.every(action => action.name && action.action);

            if (!areValid) {
                throw new Error("Invalid bulk action definition.");
            }
        },
        resetQueryParams() {
            this.vuetableQueryParams.q = null
        }
    }
}
</script>

<style lang="scss">
.browse-list {
    table {
        table-layout: initial !important;
        border-collapse: initial;

        thead, tbody {
            tr {
                th, td {
                    white-space: normal !important;
                    overflow: visible !important;
                    text-overflow: initial !important;
                    vertical-align: middle;
                }
            }
        }

        thead {
            tr {
                th {
                    font-weight: bold;
                    color: #A5A5A5;
                    height: 50px;
                    font-family: inherit;
                    font-size: 14px;
                    letter-spacing: initial;
                    text-transform: uppercase;
                    border-top: none;
                    border-bottom: none;

                    i {
                        float: none !important;
                        margin-left: 10px;
                        line-height: 18px;
                    }

                    &.sortable:hover {
                        color: var(--base-color);
                    }

                    &:first-child {
                        padding-left: 10px !important;
                    }
                }
            }
        }

        tbody {
            tr {
                td {
                    border-top: 1px solid #E1E8ED;
                    color: #4B4B4B;
                    font-weight: 600;

                    &:first-child {
                        border-left: 1px solid #E1E8ED;
                    }

                    &:last-child {
                        border-right: 1px solid #E1E8ED;
                    }
                }

                &:last-child {
                    td {
                        border-bottom: 1px solid #E1E8ED;
                    }
                }
            }
        }
    }

    .loading {
        display: flex;
        justify-content: center;
    }

    .sorted-desc {
        ::after {
            font-family: "Font Awesome 5 Free";
            font-style: normal;
            content: "\f0d8"
        }
    }
    .sorted-asc {
        ::after {
            font-family: "Font Awesome 5 Free";
            font-style: normal;
            content: "\f0d7"
        }
    }

    .pagination.menu {
        padding: 10px 10px 10px 4px;

        .item {
            background-color: var(--base-color);
            color: white;
            padding: 5px;
            margin-left: 5px;
            border-radius: 100%;
            width: 25px;
            height: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            line-height: 0;
            font-weight: bold;
            cursor: pointer;

            &.active {
                background-color: white;
                border: 1px solid var(--base-color);
                color: var(--base-color);
                pointer-events: none;
            }

            &:hover {
                background-color: var(--secondary-color);
                border-color: transparent;
                color: white;
            }

            &.disabled {
                opacity: 0.5;
                pointer-events: none;
            }
        }
    }

    .pagination-controls {
        align-items: center;
        display: flex;
        justify-content: flex-end;

        &.pc-top {
            padding-bottom: 3px;
        }

        &.pc-bottom {
            padding-top: 3px;
        }

        .multiselect {
            width: 85px;
        }

        .separator {
            color: #ccc;
            font-size: 18px;
            padding-right: 0;
        }
    }
}
</style>
