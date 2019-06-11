<template>
    <div class="resource-delete">
        <div class="row modal-header">
            <div class="col d-flex align-items-center">
                <h5>Are you sure you want to delete this?</h5>
            </div>
        </div>
        <div class="row modal-footer">
            <div v-for="(button, index) in buttons" :key="'button-' + index" class="col">
                <button :class="button.class" class="btn btn-block" @click="button.handler">{{ button.title }}</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ResourceDeleteModal",
    props: {
        buttons: {
            type: Array,
            default() {
                return [];
            }
        }
    }
}
</script>
