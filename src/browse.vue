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

        <div v-show="!loading">
            <div class="table-container m-b-0">
                <slot
                    :data="{ searchOptions }"
                    name="resource-actions"
                    v-bind="{ searchOptions, getData, filterableFields }"
                >
                    <resource-actions
                        v-if="showResourceActions"
                        :bulk-actions="bulkActionsList"
                        :create-resource-url="createResourceUrl"
                        :current-resource="resource"
                        :custom-filter-fields="customFilterFields"
                        :filterable-fields="filterableFields"
                        :search-options="searchOptions"
                        :search-placeholder="searchPlaceholder"
                        :show-bulk-actions="showBulkActions"
                        :show-create-resource="showCreateResource"
                        :show-search-filters="showSearchFilters"
                        :quick-filters="quickFilters"
                        @getData="getData"
                        @run-action="runAction"
                        @show-custom-filters-form="
                            $modal.show('custom-filters-form')
                        "
                    >
                        <template #before-search-bar>
                            <slot name="before-search-bar" />
                        </template>
                        <template #after-search-bar>
                            <slot name="after-search-bar" />
                        </template>

                        <template #after-create-resource>
                            <slot name="after-create-resource" />
                        </template>
                    </resource-actions>
                </slot>

                <div
                    v-if="showPagination && showPaginationTop"
                    class="pagination-controls pc-top row"
                >
                    <slot name="before-pagination" />

                    <!-- <div class="d-flex">
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
                    </div> -->
                </div>
                <div class="table-responsive">
                    <vuetable
                        ref="Vuetable"
                        :api-url="resourceURL"
                        :append-params="vuetableQueryParams"
                        :css="vuetableStyles"
                        :data-path="dataPath"
                        :fields="tableFields"
                        :http-fetch="httpFetch"
                        :http-options="httpOptions"
                        :pagination-path="paginationPath"
                        :per-page="perPage"
                        :query-params="queryParams"
                        :row-class="rowClass"
                        :show-sort-icons="true"
                        :sort-order="sortOrder"
                        class="table table-condensed"
                        track-by="id"
                        @vuetable:load-error="
                            response => $emit('load-error', response)
                        "
                        @vuetable:loaded="loading = false"
                        @vuetable:loading="loading = true"
                        @vuetable:pagination-data="onPaginationData"
                        @vuetable:row-clicked="open"
                    >
                        <slot
                            slot="actions"
                            slot-scope="props"
                            v-bind="{ ...props }"
                            name="actions"
                        >
                            <div
                                class="d-flex align-items-center justify-content-end"
                            >
                                <slot
                                    v-bind="{ ...props }"
                                    name="actions-before"
                                />
                                <slot v-bind="{ ...props }" name="actions-edit">
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
                <div
                    v-if="showPagination && showPaginationBottom"
                    class="pagination-controls pc-bottom row"
                >
                    <template v-if="showResultsPerPage">
                        <div
                            style="display: flex; flex-direction: row; justify-content: center; align-content: flex-start;"
                        >
                            <div class="mx-3">
                                <label class="mt-1">Results per page:</label>
                            </div>
                            <div>
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
                        </div>
                        <!-- <div v-show="totalPages > 1" class="col-auto separator">
                            |
                        </div> -->
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
                <img
                    src="https://mc-canvas.s3.amazonaws.com/progress-circle.svg"
                    width="48"
                    height="48"
                >
            </div>
        </slot>
    </div>
</template>

<script>
import _clone from "lodash/clone";
import {
    generateSearchParams,
    generateAppSearchParams,
    getQuickFiltersParams,
    APP_SEARCH_URL
} from "./search";
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
                return {};
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
                return {};
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
                return {};
            }
        },
        queryParams: {
            type: Object,
            default() {
                return {
                    sort: "sort",
                    page: "page",
                    perPage: "per_page"
                };
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
        rowClass: {
            type: [String, Function],
            default: ""
        },
        searchOptions: {
            type: Object,
            default() {
                return {
                    text: "",
                    filters: []
                };
            }
        },
        searchPlaceholder: {
            type: String,
            default: "Search"
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
                return [];
            }
        },
        /**
         * Uses app-search for the resources searches.
         * Override the searchable fields.
         */
        appSearch: {
            type: Boolean,
            default: false
        },
        /**
         * A quick filter
         * @typedef {Object} QuickFilter
         * @property {int} id - An id
         * @property {string} name - A name
         * @property {string} - title - The title showed to the user
         * @property {boolean} - active - If the filter is active or not by default
         * @property {function} - getValue - Returns the value of the filter with the active value passed
         * @property {string} - appendParam - set the filter as an extra param (filters inside q not supported yet)
         */

        /**
         * @param {QuickFilter[]} - quickFilters - The list of quick filters to display
         */
        quickFilters: {
            type: Array,
            default: () => []
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
            vuetableQueryParams: _clone({
                ...this.appendParams,
                ...getQuickFiltersParams(this.quickFilters)
            }),
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
            },
            sortOrder: [
                {
                    field: "created_at",
                    direction: "desc"
                }
            ]
        };
    },
    computed: {
        filterableFields() {
            return this.tableFields.filter(field => field.filterable);
        },
        searchableFields() {
            return this.tableFields
                .filter(field => field.searchable)
                .map(field => {
                    if (typeof field.name === "object") {
                        return field.searchField || field.name.searchName;
                    }

                    return field.searchField || field.name;
                });
        },
        mainDateField() {
            const mainDateField = this.tableFields
                .filter(field => field.dateFilter)
                .map(field => field.name);
            return mainDateField.length ? mainDateField[0] : "";
        },
        resourceURL() {
            const baseURL = `/${this.resource.endpoint || this.resource.slug}`;

            if (this.appSearch) {
                return `/${APP_SEARCH_URL}${baseURL}`;
            }

            return baseURL;
        }
    },
    watch: {
        appendParams() {
            this.vuetableQueryParams = _clone({
                ...this.appendParams,
                ...getQuickFiltersParams(this.quickFilters)
            });
        },
        quickFilters() {
            this.vuetableQueryParams = _clone({
                ...this.appendParams,
                ...getQuickFiltersParams(this.quickFilters)
            });
        },
        resource() {
            this.$refs.Vuetable.resetData();
            this.resetSortOrder();
            this.resetQueryParams();
            this.getSchema(this.resource);
            this.resetQueryParams();
        }
    },
    created() {
        this.setPerPage();
        this.getSchema(this.resource);
        if (this.appSearch) {
            this.$set(this.vuetableQueryParams, "text", "");
        }
    },
    methods: {
        open(event) {
            const target = event.event.target;
            const id = event.data.id;

            const isAction =
                target.classList.contains("fa-solid") ||
                target.classList.contains("fa-ellipsis-vertical") ||
                target.classList.contains("table-actions") ||
                target.classList.contains("justify-content-end");

            if (!isAction) {
                this.$router.push({ path: `/browse/leads/edit/${id}` });
            }
        },
        bulkDelete() {},
        closeAddCustomFilter() {
            this.$modal.hide("custom-filters-form");
        },
        changePerPage() {
            this.$refs.Vuetable.currentPage = 1;
            this.perPage = this.selectedPerPage;
        },
        confirmDelete(data) {
            this.$modal.show(
                ResourceDeleteModal,
                {
                    buttons: [
                        {
                            title: "Cancel",
                            handler: () => {
                                this.$modal.hide("delete-resource");
                            }
                        },
                        {
                            title: "Confirm",
                            class: "btn-danger",
                            handler: () => {
                                this.deleteResource(data);
                            }
                        }
                    ]
                },
                {
                    adaptive: true,
                    clickToClose: false,
                    height: "auto",
                    name: "delete-resource",
                    width: 500
                }
            );
        },
        deleteResource(data) {
            axios({
                url: `/${this.resource.slug}/${data.rowData.id}`,
                method: "DELETE"
            })
                .then(response => {
                    this.$emit("delete-success", response, data);
                    this.refresh();
                })
                .catch(error => {
                    this.$emit("delete-error", error, data);
                })
                .finally(() => {
                    this.$modal.hide("delete-resource");
                });
        },
        editResource(resourceId) {
            this.$router.push({
                name: "edit-resource",
                params: {
                    resource: this.resource.slug,
                    id: resourceId
                }
            });
        },
        exportCsv() {},
        exportPdf() {},
        getAllQueryParams() {
            return this.$refs.Vuetable.getAllQueryParams();
        },
        getData(searchOptions) {
            const searchArgs = [
                searchOptions,
                this.searchableFields,
                {
                    formatDate: this.formatDate,
                    mainDateField: this.mainDateField
                }
            ];
            const params = this.appSearch
                ? generateAppSearchParams(...searchArgs)
                : generateSearchParams(...searchArgs);
            for (const param in params) {
                this.$set(this.vuetableQueryParams, param, params[param]);
            }
            this.refresh();
        },
        getSchema() {
            axios({
                url: `/schema/${this.resource.slug}`
            }).then(response => {
                this.tableFields = this.processTableFields(
                    response.data.tableFields
                );
                const bulkActions = response.data.bulkActions || [];

                this.validateBulkActions(bulkActions);
                this.setBulkActions(bulkActions);
                this.showBulkActions &&
                    this.tableFields.unshift(this.vuetableSelection);
                (this.showActionsDelete || this.showActionsEdit) &&
                    this.tableFields.push(this.vuetableActions);
            });
        },
        processTableFields(endpointFields) {
            this.extraFields.forEach(fieldDefinition => {
                // find field to replace the render
                const fieldIndex = endpointFields.findIndex(field => [fieldDefinition.name, fieldDefinition.field].includes(
                    field.name
                )
                );
                if (fieldIndex != -1) {
                    const fieldName = endpointFields[fieldIndex].name;
                    endpointFields[fieldIndex] = {
                        ...endpointFields[fieldIndex],
                        ...fieldDefinition,
                        fieldName
                    };
                } else {
                    endpointFields.push(fieldDefinition);
                }
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
            this.showPagination &&
                this.showPaginationBottom &&
                this.$refs.paginationBottom.setPaginationData(data);
            this.showPagination &&
                this.showPaginationTop &&
                this.$refs.paginationTop.setPaginationData(data);
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

            this.bulkActionsList = [...bulkActions, ...this.bulkActions];

            this.bulkActions.forEach(action => {
                this.bulkActionsMethods[action.action] =
                    this.bulkMethods[action.action] || this[action.action];
            });
        },
        setPerPage() {
            const optionIncluded = this.resultsPerPageOptions.includes(
                this.resultsPerPage
            );
            this.selectedPerPage = optionIncluded
                ? this.resultsPerPage
                : this.resultsPerPageOptions[0];
            this.perPage = this.selectedPerPage;
        },
        validateBulkActions(actions) {
            const areValid = actions.every(
                action => action.name && action.action
            );

            if (!areValid) {
                throw new Error("Invalid bulk action definition.");
            }
        },
        resetQueryParams() {
            this.vuetableQueryParams.q = null;
            this.$set(this.vuetableQueryParams, "text", "");
        },
        resetSortOrder() {
            this.sortOrder = [
                {
                    field: "created_at",
                    sortField: "created_at",
                    direction: "desc"
                }
            ];
        }
    }
};
</script>

<style lang="scss">
.browse-list .pagination.menu .item {
    background-color: var(--base-color);
    color: white;
    padding: 5px;
    margin-left: 5px !important;
    border-radius: 0% !important;
    width: 30px !important;
    height: 30px !important;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    line-height: 0;
    font-weight: bold;
    cursor: pointer;
}

tr {
    th {
        background-color: var(--base-color);
        color: white !important;
        margin: 0px !important;
    }
}

small {
    display: none !important;
}

tr:hover {
    background-color: #f5f4f4 !important;
    cursor: pointer !important;
}

.browse-list {
    table {
        table-layout: initial !important;
        // border-collapse: initial;

        thead,
        tbody {
            tr {
                th,
                td {
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
                    color: #a5a5a5;
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
                    border-top: 1px solid #e1e8ed;
                    color: #4b4b4b;
                    font-weight: 600;

                    &:first-child {
                        border-left: 1px solid #e1e8ed;
                    }

                    &:last-child {
                        border-right: 1px solid #e1e8ed;
                    }
                }

                &:last-child {
                    td {
                        border-bottom: 1px solid #e1e8ed;
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
            content: "\f0d8";
        }
    }
    .sorted-asc {
        ::after {
            font-family: "Font Awesome 5 Free";
            font-style: normal;
            content: "\f0d7";
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
        justify-content: flex-start;
        justify-content: space-between;

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
