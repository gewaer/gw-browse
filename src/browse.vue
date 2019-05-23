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
                :resource-name="currentResource.name"
                mode="form"
                @saved="closeAddCustomFilter()"
            />
        </modal>

        <h3 class="section-title p-l-10">{{ currentResource.title }}</h3>

        <resource-actions
            v-if="showResourceActions"
            :bulk-actions="bulkActions"
            :bulk-methods="bulkActionsMethods"
            :current-resource="currentResource"
            :custom-filter-fields="customFilterFields"
            :filterable-fields="filterableFields"
            :search-options="searchOptions"
            :show-bulk-actions="showBulkActions"
            :show-create-resource="showCreateResource"
            @getData="getData"
            @show-custom-filters-form="$modal.show('custom-filters-form')"
        />
        <div v-if="showPagination && showPaginationTop" class="pagination-controls pc-top row">
            <template v-if="showResultsPerPage">
                <div class="col-auto">
                    <label class="mb-0">Results per page:</label>
                </div>
                <div class="col-auto">
                    <multiselect
                        v-model="perPage"
                        :allow-empty="false"
                        :show-labels="false"
                        :options="resultsPerPageOptions"
                        :searchable="false"
                        placeholder=""
                    />
                </div>
                <div v-show="totalPages > 1" class="col-auto separator">|</div>
            </template>
            <vuetable-pagination
                ref="paginationTop"
                :css="pagination"
                class="col-auto"
                @vuetable-pagination:change-page="onChangePage"
            />
        </div>
        <div class="card m-b-0">
            <div class="card-block">
                <div class="table-responsive">
                    <!-- :api-url="`/${currentResource.name}`" -->
                    <vuetable
                        ref="Vuetable"
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
                        api-url="/roles"
                        class="table table-hover table-condensed"
                        track-by="id"
                        @vuetable:pagination-data="onPaginationData"
                    >
                        <template slot="actions">
                            <div class="btn-group">
                                <button
                                    v-if="showActionsEdit"
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    v-if="showActionsDelete"
                                    type="button"
                                    class="btn btn-danger btn-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </template>
                    </vuetable>
                </div>
            </div>
        </div>
        <div v-if="showPagination && showPaginationBottom" class="pagination-controls pc-bottom row">
            <template v-if="showResultsPerPage">
                <div class="col-auto">
                    <label class="mb-0">Results per page:</label>
                </div>
                <div class="col-auto">
                    <multiselect
                        v-model="perPage"
                        :allow-empty="false"
                        :show-labels="false"
                        :options="resultsPerPageOptions"
                        :searchable="false"
                        placeholder=""
                    />
                </div>
                <div v-show="totalPages > 1" class="col-auto separator">|</div>
            </template>
            <vuetable-pagination
                ref="paginationBottom"
                :css="pagination"
                class="col-auto"
                @vuetable-pagination:change-page="onChangePage"
            />
        </div>
    </div>
</template>

<script>
import _clone from "lodash/clone";
import CustomFiltersForm from "./components/custom-filters-form";
import ResourceActions from "./components/resource-actions";
import CheckboxField from "./components/checkbox-field";

export default {
    name: "GwBrowse",
    components: {
        CustomFiltersForm,
        ResourceActions
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
        resources: {
            type: Array,
            required: true,
            validator(options) {
                return options.every(option => option.name && option.title);
            }
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
        }
    },
    data() {
        return {
            bulkActionsMethods: {},
            currentResource: {},
            customFilterFields: [],
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
            tableFields: [],
            totalPages: 0,
            vuetableActions: {
                name: "actions",
                title: "Actions",
                titleClass: "table-actions",
                dataClass: "table-actions"
            },
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
        }
    },
    created() {
        this.setBulkActions();
        this.setPerPage();
        this.getResource(this.$route.params.resource);
        this.getSchema(this.$route.params.resource);
    },
    beforeRouteUpdate(to, from, next) {
        this.getResource(to.params.resource);
        next();
    },
    methods: {
        bulkDelete() {},
        closeAddCustomFilter() {
            this.$modal.hide("custom-filters-form");
        },
        exportCsv() {},
        exportPdf() {},
        getAllQueryParams() {
            return this.$refs.Vuetable.getAllQueryParams();
        },
        getData(searchOptions) {
            let params = "";
            searchOptions.text = searchOptions.text.trim();

            if (searchOptions.text.length) {
                if (!searchOptions.filters.length) {
                    params += this.getParams(this.searchableFields, searchOptions);
                } else {
                    params += this.getParams(searchOptions.filters, searchOptions);
                }
            }

            this.vuetableQueryParams.q = `(${params})`;
            this.$refs.Vuetable.refresh();
        },
        getParams(fields, searchOptions, separator = "%") {
            const encodedParams = encodeURIComponent(searchOptions.text);

            return fields.map(field => `${field}:${separator}${encodedParams}${separator}`).join(";");
        },
        getResource(resourceName) {
            this.currentResource = this.resources.find(resource => resource.name == resourceName);
        },
        getSchema() {
            this.customFilterFields = [
                "name",
                "description"
            ];

            this.tableFields =  [
                {
                    name: "name",
                    title: "Name",
                    sortField: "name",
                    filterable: true,
                    searchable: true
                }, {
                    name: "description",
                    sortField: "description",
                    filterable: true,
                    searchable: true
                }, {
                    name: "users"
                }
            ];

            this.showBulkActions && this.tableFields.unshift(this.vuetableSelection);
            (this.showActionsDelete || this.showActionsEdit) && this.tableFields.push(this.vuetableActions);
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
        setBulkActions() {
            this.bulkActions.forEach(action => {
                this.bulkActionsMethods[action.action] = this.bulkMethods[action.action] || this[action.action];
            });
        },
        setPerPage() {
            const optionIncluded = this.resultsPerPageOptions.includes(this.resultsPerPage);
            this.perPage = optionIncluded ? this.resultsPerPage : this.resultsPerPageOptions[0];
        }
    }
}
</script>

<style lang="scss">
.browse-list {
    .browse-list-row {
        display: flex;
        align-items: center;
        padding: 8px;

        .bulk-actions {
            padding-left: 5px;
            padding-right: 15px;
        }

        .search-bar {
            margin-left: 25px;
            max-width: 320px;
        }

        .browse-list-filters {
            margin-left: auto;
            max-width: 450px;

            .multiselect__tags {
                min-width: 280px;
            }

            .custom-filters-form-btn {
                background-color: var(--base-color);
                color: white;
                padding: 5px;
                cursor: pointer;
            }
        }
    }

    table {
        table-layout: initial !important;

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
            background-color: white;

            tr {
                th {
                    padding-left: 10px !important;
                    padding-right: 10px !important;
                    padding-top: 0;
                    padding-bottom: 0;
                    font-weight: bold;
                    color: black;
                    height: 50px;
                }
            }
        }

        tr {
            td {
            padding: 10px;

                .checkbox label:before {
                    top: 0;
                }

                p {
                    margin-bottom: 0;
                }
            }
        }
    }

    .sorted-desc {
        ::after {
            font-family: "Font Awesome 5 Free";
            font-style: normal;
            content: "\f0d8"
        }
        // add icons
    }
    .sorted-asc {
        ::after {
            font-family: "Font Awesome 5 Free";
            font-style: normal;
            content: "\f0d7"
        }
        // add icons
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
            width: 75px;
        }

        .separator {
            color: #ccc;
            font-size: 18px;
            padding-right: 0;
        }
    }
}
</style>
