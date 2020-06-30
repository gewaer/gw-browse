# Gewaer Browse Component

Gewaer Browse Component is a reusable component to present lists of resources in a table format, with ease of configuration and many configurable options.

# The guts

This component relies on several other VueJS components. I will take ths time to give them a shout out:

* [Vuetable-2](https://github.com/ratiw/vuetable-2)
* [Vue.js modal](https://github.com/euvl/vue-js-modal)
* [vue-multiselect](https://github.com/shentao/vue-multiselect)
* [bp-vuejs-dropdown](https://github.com/borisbutenko/bp-vuejs-dropdown)
* [vee-validate](https://github.com/baianat/vee-validate)

## Note

Even though all these packages are used to create our component, the main configuration options deal with Vuetable-2, in regards as the what information is presented. You can see more of this in the documentation.

# Usage

## NPM

```shell
npm install @gewaer/gw-browse --save
```

# Documentation

Here is an implementation example of the component:
```html
<template>
    <gw-browse
        ref="gwBrowse"
        :bulk-actions="bulkActions"
        :bulk-methods="bulkMethods"
        :http-options="{ baseURL, headers: { Authorization: token }}"
        :pagination-data="paginationData"
        :pagination-path="''"
        :resources="resources"
    />
</template>
```

```javascript
import { mapState } from "vuex";
import GwBrowse from "@/npm-components/gw-browse/src/browse"
import "@gewaer/gw-browse/dist/gw-browse.css";

export default {
    name: "Browse",
    components: {
        GwBrowse
    },
    data() {
        return {
            baseURL: process.env.VUE_APP_BASE_API_URL,
            bulkActions: [
                {
                    name: "Mark Completed",
                    action: "markCompleted"
                },
                // Default bulk methods can still be used just be defining them. If needed, you can overwrite them.
                {
                    name: "Delete",
                    action: "bulkDelete"
                }
            ],
            bulkMethods: {
                markCompleted: this.markCompleted
            },
            token: this.$store.state.User.token || Cookies.get("token")
        }
    },
    computed: {
        ...mapState({
            resources: state => state.Company.data.resources
        })
    },
    methods: {
        markCompleted(selected) {
            axios({
                url: "/some/endpoint",
                method: "POST",
                data: {
                    ids: selected
                }
            }).then((response) => {
                // do something
            });
        },
        paginationData(data) {
            const paginationData = {
                total: parseInt(data.total_rows),
                per_page: parseInt(data.limit),
                current_page: parseInt(data.page),
                last_page: parseInt(data.total_pages)
            }

            const nextParams = this.$refs.gwBrowse.getAllQueryParams();
            nextParams.page = nextParams.page == paginationData.last_page ? null : nextParams.page + 1;
            const prevParams = this.$refs.gwBrowse.getAllQueryParams();
            prevParams.page = prevParams.page == 1 ? null : prevParams.page - 1;

            const nextQuery = Object.keys(nextParams).map(key => `${key}=${nextParams[key]}`);
            const prevQuery = Object.keys(prevParams).map(key => `${key}=${prevParams[key]}`);

            paginationData.next_page_url = nextParams.page === null ? null : `${this.baseURL}?${nextQuery.join("&")}&format=true`;
            paginationData.prev_page_url = prevParams.page === null ? null : `${this.baseURL}?${prevQuery.join("&")}&format=true`;
            paginationData.from = (paginationData.current_page - 1) * paginationData.per_page + 1;
            paginationData.to = paginationData.from + paginationData.per_page - 1;

            return paginationData;
        }
    }
}
```

## Props

### Vuetable-2 Props

* append-params → see [Vuetable-2#`append-params`](https://www.vuetable.com/api/vuetable/properties.html#append-params)
* data-path → see [Vuetable-2#`data-path`](https://www.vuetable.com/api/vuetable/properties.html#data-path)
* http-fetch → see [Vuetable-2#`http-fetch`](https://www.vuetable.com/api/vuetable/properties.html#http-fetch)
* http-options → see [Vuetable-2#`http-options`](https://www.vuetable.com/api/vuetable/properties.html#http-options)
* query-params → see [Vuetable-2#`query-params`](https://www.vuetable.com/api/vuetable/properties.html#query-params)
* pagination-path → see [Vuetable-2#`pagination-path`](https://www.vuetable.com/api/vuetable/properties.html#pagination-path)

### bulk-actions

* _requires_ `bulk-methods` when specifying custom methods.
* **type:** `Array`
* **default:**

    ```javascript
    [
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
    ]
    ```
* **usage:**

    Specify custom bulk actions to execute to selected records.

### bulk-methods

* **type:** `Object`
* **default:** `{}` _(empty object)_
* **usage:**

    Specify custom bulk methods to execute to selected records. You can see an example in the provided code sample.

### create-resource-url

* **type:** `Object, String`
* **default:** `null`
* **usage:**

    The component will automatically link resource creation links to `/browse/<slug>/create`.
    You can use this property to overwrite this behaviour, using a string or object as defined in the
    Vue Router [documentation](https://router.vuejs.org/guide/essentials/navigation.html#router-push-location-oncomplete-onabort).

### pagination-data

* **type:** `Function`
* **default:** `null`
* **usage:**

    Function to format and return a pagination object as per [VuetablePagination requirements](https://www.vuetable.com/guide/pagination.html#how-the-pagination-component-works).

### resources

* **type:** `Object`
* **default:** _none_
* required: _true_
* **usage:**

    Resource object from which the browse component will use to fetch data for the current resource being viewed.

    Example:
    ```javascript
    {
        icon: "https://flaticons.net/gd/makefg.php?i=icons/Shopping/Product.png&r=255&g=255&b=255"
        name: "products"
        title: "Products"
    }
    ```

### results-per-page

* **type:** `Number`
* **default:** `25`
* **usage:**

    The amount of records per page the user can choose from.

### results-per-page-options

* **type:** `Array`
* **default:** `[25, 50, 100]`
* **usage:**

    List of results per page to customized the amount of records per page.

### search-options

* **type:** `Object`
* **default:**

    ```javascript
    {
        text: "",
        filters: []
    }
    ```

* **usage:**

    Search options by which to filter the results in the server when initializing the component.

### show-actions-delete

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the `Delete` actions button.

### show-actions-edit

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the `Edit` actions button.

### show-bulk-actions

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the `Bulk Actions` list.

### show-create-resource

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the `Create ${resource}` actions button.

### show-paginaion

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show results pagination.

### show-paginaion-bottom

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show bottom results pagination.

### show-paginaion-top

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show top results pagination.

### show-resource-actions

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show actions bar (`Bulk Actions`, `Create ${resource}`, `Search`, `Filters`).

### show-results-per-page

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the results per page options dropdown.

### show-search-filters

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the search filters dropdown.

### show-title

* **type:** `Boolean`
* **default:** `true`
* **usage:**

    Tells the browse component whether or not to show the title for the resource.

## Slots

### actions

Each row comes paired with two actions: edit and delete. This slot allows you to completely customize the options
available for the user.

### actions-before

Allows you to add new actions while leaving the default ones, you can use this slot to place them before the default
actions.

### actions-after

Allows you to add new actions while leaving the default ones, you can use this slot to place them after the default
actions.

### actions-edit

Allows you to overwrite just the edit action.

### actions-delete

Allows you to overwrite just the delete action.

### loading

Lets you customize the loading animation.

# License

Gewaer Browse Component is open-sourced software licensed under the MIT license.
