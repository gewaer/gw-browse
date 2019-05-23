<template>
    <div class="card">
        <div class="card-block">
            <div class="browse-list-row">
                <dropdown v-if="showBulkActions" class="bulk-actions">
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
                            @click.prevent="bulkMethods[action.action]()"
                        >
                            {{ action.name }}
                        </a>
                    </div>
                </dropdown>
                <router-link
                    v-if="showCreateResource"
                    :to="{ name: 'create-resource', params: { resource: currentResource.name }}"
                    class="add-record-btn btn btn-primary"
                >
                    <i class="fa fa-plus-circle"/>
                    Add {{ currentResource.title }}
                </router-link>
                <div class="input-group search-bar">
                    <input
                        v-model="search.text"
                        type="text"
                        class="form-control"
                        @keydown.enter="getData()"
                    >
                    <div v-if="showClearSearch" class="input-group-append">
                        <button class="btn btn-danger btn-sm" @click="clearSearch()">
                            <i class="fa fa-times"/>
                        </button>
                    </div>
                    <div class="input-group-append">
                        <button class="btn btn-primary" @click="getData()">
                            <i class="fa fa-search"/>
                            Search
                        </button>
                    </div>
                </div>
                <div class="browse-list-filters d-flex align-items-center">
                    <span class="mr-3">Filters</span>
                    <multiselect
                        v-model="search.filters"
                        :multiple="true"
                        :show-labels="false"
                        :options="filterableFields"
                        @input="getData()"
                    >
                        <template v-if="customFilterFields.length" slot="afterList">
                            <div class="custom-filters-form-btn option__desc">
                                <a class="option__title" @click="$emit('show-custom-filters-form')">
                                    <i class="fa fa-plus"/>
                                    Add custom Filter
                                </a>
                            </div>
                        </template>
                    </multiselect>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import _clone from "lodash/clone";

export default {
    props: {
        bulkActions: {
            type: Array,
            default() {
                return [];
            }
        },
        bulkMethods: {
            type: Object,
            default() {
                return {};
            }
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
        showBulkActions: {
            type: Boolean,
            default: true
        },
        showCreateResource: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            search: _clone(this.searchOptions),
            showClearSearch: false
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
            this.search.text.trim().length && (this.showClearSearch = true) || (this.showClearSearch = false);
            this.$emit("getData", this.search);
        }
    }
}
</script>
