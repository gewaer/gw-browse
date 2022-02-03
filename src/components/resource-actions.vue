<template>
    <div class="browse-actions row">
        <slot name="before-search-bar" />
        <div class="input-group search-bar col-12 col-md-7 col-lg-7">
            <input
                v-model="search.text"
                :placeholder="searchPlaceholder"
                type="text"
                class="form-control"
                @keydown.enter="getData()"
            >
            <div v-if="showSearchFilters" class="browse-list-filters d-flex align-items-center">
                <multiselect
                    v-model="searchFilters"
                    :limit="1"
                    :multiple="true"
                    :options="filterableFields"
                    :show-labels="false"
                    label="title"
                    placeholder="All fields"
                    track-by="name"
                    @input="getData()"
                >
                    <template v-if="customFilterFields.length" slot="afterList">
                        <div class="custom-filters-form-btn option__desc">
                            <a class="option__title" @click="$emit('show-custom-filters-form')">
                                <i class="fa fa-plus" />
                                Add custom Filter
                            </a>
                        </div>
                    </template>
                </multiselect>
            </div>
            <div v-if="showClearSearch" class="input-group-append">
                <button class="btn btn-danger btn-sm" @click="clearSearch()">
                    <i class="fa fa-times" />
                </button>
            </div>
            <div class="input-group-append">
                <button class="btn btn-primary" @click="getData()">
                    <i class="fa fa-search" />
                    Search
                </button>
            </div>
        </div>
        <slot name="after-search-bar" />

        <div v-if="searchQuickFilters.length" class="col-auto browse-actions__quick-filters">
            <div class="btn-group" role="group" aria-label="quick filters">
                <button 
                    v-for="filter in searchQuickFilters" 
                    :key="`quick-filter-${filter.name}`"
                    :class="{
                        'btn-secondary': filter.active,
                        'btn-outline-secondary': !filter.active
                    }"
                    type="button" 
                    class="btn btn-secondary" 
                    @click="toogleQuickFilter(filter)"
                >
                    {{ filter.title }}
                </button>
            </div>
        </div>


        <dropdown v-if="showBulkActions" :is-icon="false" class="bulk-actions col-auto ml-auto">
            <button
                id="bulk-actions"
                slot="btn"
                class="btn btn-info dropdown-toggle"
                type="button"
            >
                Bulk actions
            </button>
            <div slot="body">
                <a
                    v-for="action in bulkActions"
                    :key="action.name"
                    class="dropdown-item"
                    href="#"
                    @click.prevent="$emit('run-action', action.action)"
                >
                    {{ action.name }}
                </a>
            </div>
        </dropdown>

        <div
            v-if="showCreateResource"
            class="col-auto"
        >
            <router-link
                :to="createUrl"
                class="add-record-btn btn btn-primary"
            >
                <i class="d-none d-sm-inline fa fa-plus-circle" />
                Add {{ singularize(currentResource.title) }}
            </router-link>
        </div>
    </div>
</template>

<script>
import _clone from "lodash/clone";
import pluralize from "pluralize";

export default {
    props: {
        bulkActions: {
            type: Array,
            default() {
                return [];
            }
        },
        createResourceUrl: {
            type: [Object, String],
            default: null
        },
        currentResource: {
            type: Object,
            required: true
        },
        customFilterFields: {
            type: Array,
            default() {
                return [];
            }
        },
        filterableFields: {
            type: Array,
            required: true
        },
        searchOptions: {
            type: Object,
            required: true
        },
        searchPlaceholder: {
            type: String,
            default: "Search"
        },
        showBulkActions: {
            type: Boolean,
            default: true
        },
        showCreateResource: {
            type: Boolean,
            default: true
        },
        showSearchFilters: {
            type: Boolean,
            default: true
        },
        quickFilters: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            search: _clone(this.searchOptions),
            searchFilters: [],
            showClearSearch: false,
            searchQuickFilters: _clone(this.quickFilters)
        }
    },
    computed: {
        createUrl() {
            if (this.createResourceUrl) {
                return this.createResourceUrl;
            }
            return this.currentResource ? { name: "create-resource", params: { resource: this.currentResource.slug } } : { }
        }
    },
    watch: {
        currentResource: {
            handler() {
                this.search = _clone(this.searchOptions)
            }
        }
    },
    methods: {
        clearSearch() {
            this.search = {
                text: "",
                filters: []
            }

            this.getData();
        },
        getData() {
            (this.search.text || "").trim().length && (this.showClearSearch = true) || (this.showClearSearch = false);
            this.search.filters = this.searchFilters.reduce((accumulator, item) => accumulator.concat(item.name), []);
            this.search.fixedFilters = this.searchOptions.fixedFilters;
            this.$emit("getData", this.search);
        },
        singularize(text) {
            return pluralize.singular(text);
        },
        toogleQuickFilter(filter) {
            this.$set(filter, "active", !filter.active);
            this.$set(this.search, "quickFilters", this.quickFilters);
            this.$emit("getData", this.search);            
        }
    }
}
</script>


<style lang="scss">
.browse-actions {
    --filters-input-height: 40px;

    display: flex;
    align-items: center;
    margin-bottom: 35px;

    .search-bar {
        @media(max-width: 991px) {
            margin-bottom: 10px;
        }
    }

    .browse-list-filters {
        width: 30%;
        @media(max-width: 991px) {
            margin-bottom: 10px;
        }

        .custom-filters-form-btn {
            background-color: var(--base-color);
            color: white;
            padding: 5px;
            cursor: pointer;
        }

        .multiselect {            
            .multiselect__select {
                height: var(--filters-input-height);
            }
            .multiselect__tags {
                min-height: var(--filters-input-height);
            }
            
                    
            .multiselect__placeholder {
                min-height: 16px;
                padding-top: 2px;
            }

            
            .multiselect__input {
                padding-left: 0;
                padding-top: 4px;
            }
        }
        
    }
}
</style>

