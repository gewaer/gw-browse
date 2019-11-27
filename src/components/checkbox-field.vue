<template>
    <th v-if="isHeader" class="vuetable-th-component-checkbox">
        <div class="checkbox check-success">
            <input
                :id="`vuetable-checkbox-${id}`"
                :checked="isAllItemsInCurrentPageSelected()"
                type="checkbox"
                @change="toggleAllCheckbox($event)"
            >
            <label :for="`vuetable-checkbox-${id}`" />
        </div>
    </th>
    <td v-else class="vuetable-td-component-checkbox">
        <div class="checkbox check-success">
            <input
                :id="`vuetable-checkbox-${id}`"
                :checked="isSelected(rowData)"
                type="checkbox"
                @change="toggleCheckbox(rowData, $event)"
            >
            <label :for="`vuetable-checkbox-${id}`" />
        </div>
    </td>
</template>

<script>
import VuetableFieldCheckboxMixin from "vuetable-2/src/components/VuetableFieldCheckboxMixin";

export default {
    name: "CheckboxField",
    mixins: [VuetableFieldCheckboxMixin],
    data() {
        return {
            id: Math.random().toString(16).replace(".", "")
        }
    },
    methods: {
        isAllItemsInCurrentPageSelected() {
            if (!this.vuetable.tableData) {
                return;
            }

            const idColumn = this.vuetable.trackBy;
            const checkbox = this.$el.querySelector("input[type=checkbox]");
            const selected = this.vuetable.tableData.filter((item) => this.vuetable.isSelectedRow(item[idColumn]));

            // count == 0, clear the checkbox
            if (selected.length <= 0) {
                checkbox.indeterminate = false;
                return false;
            // count > 0 and count < total available, set checkbox state to 'indeterminate'
            } else if (selected.length < this.vuetable.tableData.length) {
                checkbox.indeterminate = true;
                return false;
            // count == total available, set checkbox state to 'checked'
            } else {
                checkbox.indeterminate = false;
                return true;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.checkbox input[type=checkbox]:indeterminate+label:before {
	border-width: 8.5px
}

.checkbox input[type=checkbox]:checked+label::after {
    left: 1px;
}

.checkbox input[type=checkbox]:indeterminate+label::after {
	font-family: FontAwesome;
	content: "\F068";
	color: #fff;
    left: 1px;
    top: 1px;
}

.checkbox.check-success input[type=checkbox]:indeterminate+label:before {
	border-color: #10cfbd
}

.checkbox.check-primary input[type=checkbox]:indeterminate+label:before {
	border-color: #6d5cae
}

.checkbox.check-complete input[type=checkbox]:indeterminate+label:before {
	border-color: #48b0f7
}

.checkbox.check-warning input[type=checkbox]:indeterminate+label:before {
	border-color: #f8d053
}

.checkbox.check-danger input[type=checkbox]:indeterminate+label:before {
	border-color: #f55753
}

.checkbox.check-info input[type=checkbox]:indeterminate+label:before {
	border-color: #3b4752
}

.checkbox.check-complete input[type=checkbox]:indeterminate+label::after,
.checkbox.check-danger input[type=checkbox]:indeterminate+label::after,
.checkbox.check-info input[type=checkbox]:indeterminate+label::after,
.checkbox.check-primary input[type=checkbox]:indeterminate+label::after,
.checkbox.check-success input[type=checkbox]:indeterminate+label::after,
.checkbox.check-warning input[type=checkbox]:indeterminate+label::after {
	color: #fff
}
</style>
