<template>
    <div class="custom-filters-form-modal">
        <div class="row modal-header">
            <div class="col d-flex align-items-center">
                <h5>Add custom filter</h5>
                <a class="ml-auto" href="#" @click.prevent="$modal.hide('custom-filters-form')">x</a>
            </div>
        </div>
        <div class="row modal-body">
            <div class="col">
                <div class="row align-items-center m-b-20">
                    <div class="col-auto">
                        <div class="step-number">1</div>
                    </div>
                    <div class="col">
                        <div class="form-group required">
                            <input
                                v-validate="'required'"
                                v-model="filterData.name"
                                class="form-control"
                                type="text"
                                data-vv-as="filter name"
                                name="filter-name"
                                placeholder="Filter name"
                            >
                            <span>
                                {{ errors.first("filter-name") }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="row m-b-20">
                    <div class="col-auto">
                        <div class="step-number">2</div>
                    </div>
                    <div class="col">
                        <label>Add a condition</label>
                        <div
                            v-for="(filter, index) in filters"
                            :key="filter.key"
                            class="row filters-conditions-row align-items-center"
                        >
                            <div class="col-12 col-sm">
                                <div class="row filter-row">
                                    <div class="form-group filters-conditions col-12">
                                        <multiselect
                                            v-validate="'required'"
                                            :allow-empty="false"
                                            v-model="filter.field"
                                            :data-vv-name="`filter-field-${filter.key}`"
                                            :show-labels="false"
                                            :options="fields"
                                            data-vv-as="name"
                                        />
                                        <span class="text-danger">
                                            {{ errors.first(`filter-field-${filter.key}`) }}
                                        </span>
                                    </div>
                                    <div class="form-group filters-conditions col-12 col-sm-auto">
                                        <multiselect
                                            v-validate="'required'"
                                            :allow-empty="false"
                                            v-model="filter.operator"
                                            :data-vv-name="`filter-operator-${filter.key}`"
                                            :show-labels="false"
                                            :options="operators"
                                            data-vv-as="operator"
                                        />
                                        <span class="text-danger">
                                            {{ errors.first(`filter-operator-${filter.key}`) }}
                                        </span>
                                    </div>
                                    <div class="form-group required col-12 col-sm">
                                        <input
                                            v-validate="'required'"
                                            v-model="filter.value"
                                            :name="`filter-value-${filter.key}`"
                                            type="text"
                                            data-vv-as="filter value"
                                            class="form-control"
                                            placeholder="value"
                                        >
                                        <span class="text-danger">
                                            {{ errors.first(`filter-value-${filter.key}`) }}
                                        </span>
                                    </div>
                                    <div class="form-group filters-conditions col-12 col-sm-auto">
                                        <multiselect
                                            v-validate="'required'"
                                            :allow-empty="false"
                                            v-model="filter.conector"
                                            :data-vv-name="`filter-conector-${filter.key}`"
                                            :show-labels="false"
                                            :options="['and', 'or']"
                                            data-vv-as="conector"
                                        />
                                        <span class="text-danger">
                                            {{ errors.first(`filter-conector-${filter.key}`) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-auto">
                                <a class="d-flex flex-column" href="#" @click.prevent="removeFilter(index)">
                                    <i class="fa fa-minus-circle d-flex justify-content-center"/>
                                    remove
                                </a>
                            </div>
                        </div>
                        <a class="d-flex align-items-center justify-content-center" href="#" @click.prevent="addFilter()">
                            <i class="fa fa-plus-circle"/>
                            Add a condition
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="row modal-footer">
            <div class="col">
                <button class="btn btn-block" @click="$modal.hide('custom-filters-form')">Cancel</button>
            </div>
            <div class="col">
                <button class="btn btn-block btn-primary" @click="create()">Create</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        fields: {
            type: Array,
            required: true
        },
        resourceName: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            filterData: {
                name: ""
            },
            filters: [],
            operators: ["=", "like", "<>", ">", "<"]
        }
    },
    mounted() {
        this.addFilter();
    },
    methods: {
        addFilter() {
            this.filters.push({
                key: Math.random().toString(16).replace(".", ""),
                field: "",
                operator: "like",
                conector: "or",
                value: ""
            });
        },
        create() {
            let url = "/custom-filters/";
            let method = "POST";

            if (this.filterData.id) {
                url = `/custom-filters/${this.filterData.id}`;
                method = "PUT";
            }

            const formData = {
                data: {
                    resource_name: this.resourceName,
                    ...this.filterData
                },
                filters: this.getFilters()
            }

            this.$validator.validate().then(results => {
                if (results) {
                    this.sendRequest(url, method, formData);
                }
            });
        },
        getFilters() {
            return this.filters.map(filter => {
                const filterClone = _.clone(filter);
                delete filterClone.key
                return filterClone;
            });
        },
        removeFilter(index) {
            if (this.filters.length > 1) {
                this.filters.splice(index, 1);
            }
        },
        sendRequest(url, method, formData) {
            if (!this.isLoading) {
                this.isLoading = true;

                axios({
                    url,
                    method,
                    data: formData
                }).then(() => {
                    const message = method == "POST" ? "created" : "updated";

                    this.$notify({
                        group: null,
                        title: "Confirmation",
                        text: `The filter has been ${message}!`,
                        type: "success"
                    });

                    this.$emit("saved");
                }).catch((error) => {
                    this.$notify({
                        group: null,
                        title: "Error",
                        text: error.response.data.errors.message,
                        type: "error"
                    });
                }).finally(() => {
                    this.isLoading = false;
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.custom-filters-form-modal {
    .step-number {
        background-color: #eaeaea;
        width: 25px;
        height: 25px;
        border-radius: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .form-group {
        margin-bottom: 0;

        input {
            height: 40px;
        }
    }

    .filters-conditions-row {
        padding: 15px 15px 0;
        margin-bottom: 10px;
        background-color: #f1f1f1;

        .filters-conditions {
            margin-bottom: 10px;

            select {
                height: 34px;
                color: #999;

                option {
                    color: black;
                }
            }
        }
    }


    .radio label {
        margin-bottom: 0;
    }
}

.filter-row {
    margin-bottom: 5px;

}
</style>
