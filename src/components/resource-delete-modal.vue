<template>
    <div class="resource-delete">
        <div class="modal-header">
            <h3><strong>Are you sure you want to delete this?</strong></h3>
        </div>
        <div class="modal-footer">
            <div class="row w-100">
                <div v-for="(button, index) in buttons" :key="'button-' + index" class="col">
                    <button :class="button.class" class="btn btn-block" @click="button.handler">
                        {{ button.title }}
                    </button>
                </div>
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

<style lang="scss">
.resource-delete {
    // padding: 50px;

    .modal-header {
        padding: 30px;

        h3 {
            font-size: 26px;
            text-align: center;
        }
    }

    .modal-footer {
        border-top: 0;
        padding: 30px;
        justify-content: center;

        .col:first-child {
            padding-right: 7px;
            padding-left: 0;
        }

        .col:last-child {
            padding-left: 7px;
            padding-right: 0;
        }
    }
}
</style>
