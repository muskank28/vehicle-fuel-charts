import { fuelData } from './fuelData.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize charts
  const groupedChart = echarts.init(document.getElementById('groupedChart'));
  const individualChart = echarts.init(document.getElementById('individualChart'));

  // Generate grouped data for the chart
  function generateGroupedData(granularity = 'monthly') {
    const groupedMap = fuelData[granularity];
    const labels = Object.keys(groupedMap[Object.keys(groupedMap)[0]]).sort();

    const summedData = labels.map(label =>
      Object.values(groupedMap).reduce((sum, vehicle) => sum + (vehicle[label] || 0), 0)
    );

    return { labels, data: summedData };
  }

  // Update grouped chart
  function updateGroupedChart(granularity = 'monthly') {
    const { labels, data } = generateGroupedData(granularity);

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { color: '#fff' }
      },
      yAxis: {
        type: 'value',
        name: 'Fuel (Liters)',
        nameTextStyle: { color: '#fff' },
        axisLine: { show: true, lineStyle: { color: '#ccc' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        axisLabel: { color: '#fff' }
      },
      series: [{
        name: 'Total Fuel',
        type: 'line',
        stack: 'Total',
        lineStyle: { width: 3, color: '#3b84c0ff' },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 221, 255, 0.7)' },
            { offset: 1, color: 'rgba(77, 119, 255, 0.7)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(77, 175, 255, 0.61)' },
            { offset: 1, color: 'rgba(0, 221, 255, 0.1)' },
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 221, 255, 1)' },
              { offset: 1, color: 'rgba(77, 119, 255, 1)' }
            ])
          }
        },
        data,
      }],
      backgroundColor: 'transparent'
    };

    groupedChart.setOption(option);
  }

  // Update individual vehicle chart
  function updateIndividualChart(vehicleId, fromDate, toDate) {
    const granularity = document.getElementById('groupGranularity').value || 'monthly';
    const vehicleDataMap = fuelData[granularity];

    

    if (!vehicleId || !vehicleDataMap[vehicleId]) {
      individualChart.clear();
      return;
    }

    const rawData = vehicleDataMap[vehicleId];

    // Parse selected dates
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Get and filter labels within the date range
    let labels = Object.keys(rawData).sort();

    labels = labels.filter(label => {
      const labelDate = new Date(label);
      return (!fromDate || labelDate >= from) && (!toDate || labelDate <= to);
    });

    const values = labels.map(label => rawData[label]);


    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { color: '#fff' }
      },
      yAxis: {
        type: 'value',
        name: 'Fuel (Liters)',
        nameTextStyle: { color: '#fff' },
        axisLine: { show: true, lineStyle: { color: '#ccc' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        axisLabel: { color: '#fff' }
      },
      series: [{
        name: 'Fuel Usage',
        type: 'line',
        stack: 'Total',
        smooth: false,
        lineStyle: { width: 3, color: '#ff6e76' },
        showSymbol: true,
        symbolSize: 8,
        itemStyle: {
          color: '#ff6e76',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 110, 118, 0.5)' },
            { offset: 1, color: 'rgba(255, 110, 118, 0.1)' }
          ])
        },
        emphasis: { focus: 'series' },
        data: values
      }],
      backgroundColor: 'transparent'
    };

    individualChart.setOption(option);
  }

  // Event Listeners

    document.getElementById('groupGranularity').addEventListener('change', function () {
  updateGroupedChart(this.value);
  const selectedVehicle = document.getElementById('vehicleSelect').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  updateIndividualChart(selectedVehicle, fromDate, toDate);
});

document.getElementById('vehicleSelect').addEventListener('change', function () {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  updateIndividualChart(this.value, fromDate, toDate);
});

document.getElementById('fromDate').addEventListener('change', function () {
  const vehicleId = document.getElementById('vehicleSelect').value;
  const fromDate = this.value;
  const toDate = document.getElementById('toDate').value;
  updateIndividualChart(vehicleId, fromDate, toDate);
});

document.getElementById('toDate').addEventListener('change', function () {
  const vehicleId = document.getElementById('vehicleSelect').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = this.value;
  updateIndividualChart(vehicleId, fromDate, toDate);
});

window.addEventListener('resize', () => {
    groupedChart.resize();
    individualChart.resize();
  });

  updateGroupedChart();
document.getElementById('vehicleSelect').value = 'vehicle1';
const fromDate = document.getElementById('fromDate').value;
const toDate = document.getElementById('toDate').value;
updateIndividualChart('vehicle1', fromDate, toDate);

});