<template>
    <div>
        <el-popover
            v-model="show"
            placement="bottom"
            width="250"
        >
            <div v-if="!customDate" class="dropdown">
                <ul class="list-group list-group-flush dropdown__body">
                    <button
                        v-for="(shortcut, i) in shortcuts[mode]"
                        :key="`single-shortcut-${i}`"
                        class="list-group-item dropdown-item"
                        @click="getDateValue(shortcut.start, shortcut.end, true)"
                    >
                        {{ shortcut.text }}
                    </button>
                    <button class="list-group-item dropdown-item" @click="customDate=true">
                        Custom Date
                    </button>
                </ul>
            </div>

            <div v-else class="p-1">
                <div>
                    <button class="btn btn-block btn-primary" @click="customDate=false">
                        back
                    </button>
                </div>
                <div class="pt-2 form-group">
                    <label for="">Start Date </label>
                    <el-date-picker
                        v-model="dates.start"
                        type="date"
                        placeholder="Pick a day"
                    />
                </div>
            
                <div class="pt-2 form-group">
                    <label for=""> Last Date </label>
                    <el-date-picker
                        v-if="rangeMode"
                        v-model="dates.end"
                        type="date"
                        placeholder="Pick a day"
                    />
                </div>
            </div>
            <button slot="reference" class="btn btn-primary">
                Date Range
                <i class="fa fa-caret-down"></i>
            </button>
        </el-popover>
    </div>
</template>

<script>
const DAY = 3600 * 1000 * 24
export default {
    props: {
        rangeMode: {
            type: Boolean,
            default: false
        },
        value: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            show: false,
            dates: {
                start: "",
                end: ""
            },
            customDate: false
        }
    },
    computed: {
        mode() {
            return this.rangeMode ? "range" : "single";
        },
        shortcuts() {
            return {
                single: [{
                    text: "Today",
                    start: 0
                }, 
                {
                    text: "Yesterday",
                    start: - 3600 * 1000 * 24
                }, 
                {
                    text: "A week ago",
                    start: - 3600 * 1000 * 24 * 7
                }],
                range: [
                    {
                        text: "Last week",
                        start: - DAY * 7,
                        end: 0
                    }, 
                    {
                        text: "Last Month",
                        start: - DAY * 30,
                        end: 0
                    }, 
                    {
                        text: "Last 3 months",
                        start: - DAY * 90,
                        end: 0
                    }
                ]
            }
        }
    },
    watch: {
        value(date) {
            dates.start = date.start
            dates.end = date.end
        }
    },
    methods:{ 
        getDateValue(startValue, endValue, close) {
            const startDate = new Date();
            const endDate = endValue >= 0 ? new Date() : endValue;

            startDate.setTime(startDate.getTime() + startValue);
            this.setDate(startDate)
            
            if (endDate) {
                endDate.setTime(endDate.getTime() + endValue);
            }
            this.setDate(endDate, "end", close)
            
        },

        setDate(date, prop = "start", close) {
            this.dates[prop] = date;
            this.$emit("input", this.dates);
            if (close) {
                this.show = false;
            }
        }

    }
}
</script>

<style lang="scss">
    .dropdown-item:hover {
        background: var(--base-color);
        color: white;
    }
</style>
