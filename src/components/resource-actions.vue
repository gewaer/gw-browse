<template>
    <div class="browse-actions row">
        <div class="input-group search-bar col-12 col-md-6 col-lg">
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

        <div class="browse-list-filters d-flex align-items-center col-12 col-md-6 col-lg">
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

        <dropdown v-if="showBulkActions" :is-icon="false" class="bulk-actions col-auto">
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
        <div class="col-auto">
            <router-link
                v-if="showCreateResource"
                :to="{ name: 'create-resource', params: { resource: currentResource.slug }}"
                class="add-record-btn btn btn-primary"
            >
                <i class="d-none d-sm-inline fa fa-plus-circle"/>
                Add {{ currentResource.name }}
            </router-link>
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
<style lang="scss">
.browse-actions {
    display: flex;
    align-items: center;
    margin-bottom: 35px;

    .search-bar {
        @media(max-width: $lg) {
            margin-bottom: 10px;
        }
    }

    .browse-list-filters {
        .custom-filters-form-btn {
            background-color: var(--base-color);
            color: white;
            padding: 5px;
            cursor: pointer;
        }

        @media(max-width: $lg) {
            margin-bottom: 10px;
        }
    }
}
</style>
