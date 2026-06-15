<script setup>
import { computed } from "vue";
import Chart from "primevue/chart";

const props = defineProps({
  isPageBusy: Boolean,
  title: { type: String, default: "" },
  chartType: { type: String, default: "bar" },
  showTypeSelect: { type: Boolean, default: true },
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, required: true },
  chartKey: { type: String, default: "region" },
  emptyMessage: {
    type: String,
    default: "Tidak ada data untuk ditampilkan.",
  },
});

const emit = defineEmits(["update:chart-type"]);

const onChartTypeChange = (event) => {
  emit("update:chart-type", event.target.value);
};

const canRender = computed(
  () =>
    Array.isArray(props.chartData?.labels) &&
    props.chartData.labels.length > 0 &&
    Array.isArray(props.chartData?.datasets) &&
    props.chartData.datasets.length > 0
);
</script>

<template>
  <div class="region-card">
    <div class="region-card-head">
      <span v-if="title" class="region-card-title">{{ title }}</span>
      <div v-if="showTypeSelect" class="region-type-box">
        <label class="theme-text-muted text-[11px]">Tipe Chart</label>
        <select
          class="theme-select rounded-md px-2 py-1 text-[12px]"
          :value="chartType"
          @change="onChartTypeChange"
          :disabled="isPageBusy"
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>
    </div>

    <div v-if="canRender" class="region-chart-wrap">
      <Chart
        :key="chartKey"
        :type="chartType"
        :data="chartData"
        :options="chartOptions"
        class="region-chart-canvas"
      />
    </div>
    <div v-else class="region-empty">
      <p class="theme-text-muted text-[13px]">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.theme-text-muted {
  color: var(--p-text-muted-color);
}

.theme-select {
  color: var(--p-text-color);
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  outline: none;
}

.theme-select:focus {
  border-color: var(--p-primary-500);
  box-shadow: 0 0 0 1px var(--p-primary-500);
}

.region-card {
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
  border-radius: 12px;
  padding: 12px;
  width: 100%;
}

.region-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  min-height: 28px;
}

.region-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--p-text-color);
}

.region-type-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.region-chart-canvas {
  height: 460px;
}

.region-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  border: 1px dashed var(--p-content-border-color);
  border-radius: 12px;
  text-align: center;
  padding: 20px;
}
</style>
