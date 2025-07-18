import { fuelData } from './fuelData.js';

document.addEventListener('DOMContentLoaded', () => {
  const groupedChart = echarts.init(document.getElementById('groupedChart'));
  const individualChart = echarts.init(document.getElementById('individualChart'));

  function generateAggregatedData(dailyData, granularity = 'monthly') {
    const groupFormat = {
      weekly: 'GGGG-[W]WW',  // e.g. 2025-W29
      monthly: 'YYYY-MM',    // e.g. 2025-07
      yearly: 'YYYY'         // e.g. 2025
    }[granularity];

    const aggregated = {};

    for (const [vehicle, logs] of Object.entries(dailyData)) {
      const vehicleGroup = {};

      for (const [dateStr, liters] of Object.entries(logs)) {
        const groupKey = moment(dateStr).format(groupFormat);
        if (!vehicleGroup[groupKey]) vehicleGroup[groupKey] = 0;
        vehicleGroup[groupKey] += liters;
      }

      aggregated[vehicle] = vehicleGroup;
    }

    return aggregated;
  }

  // Generate grouped chart data
  function generateGroupedData(granularity = 'monthly', startDate = null, endDate = null) {
  const groupedMap =
    granularity === 'daily'
      ? fuelData.daily
      : generateAggregatedData(fuelData.daily, granularity);

  const dateTotals = {};

  for (const vehicle in groupedMap) {
    for (const [date, liters] of Object.entries(groupedMap[vehicle])) {
      if (!dateTotals[date]) dateTotals[date] = 0;
      dateTotals[date] += liters;
    }
  }

  let allDates = Object.keys(dateTotals);

  if (startDate && endDate) {
    allDates = allDates.filter(date => date >= startDate && date <= endDate);
  }

  allDates.sort();

  const labels = allDates;
  const totalValues = labels.map(date => dateTotals[date]);

  return {
    labels,
    vehicleData: { total: totalValues }
  };
}

  document.getElementById('groupGranularity').value = 'daily';

  // Update Grouped Chart
  function updateGroupedChart(granularity = 'monthly') {
  const { labels, vehicleData } = generateGroupedData(granularity);

  groupedChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: {
      type: 'value',
      name: 'Fuel (Liters)',
      nameTextStyle: { color: '#fff' },
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: '#ccc' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      name: 'Total Fuel Consumption',
      type: 'line',
      data: vehicleData.total,
      lineStyle: { width: 3, color: '#3b84c0ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 221, 255, 0.7)' },
          { offset: 1, color: 'rgba(77, 119, 255, 0.2)' }
        ])
      },
      itemStyle: { color: '#3b84c0' }
    }],
    backgroundColor: 'transparent'
  });
}
  
  // Update Individual Chart
  function updateIndividualChart(vehicleId, fromDate, toDate) {
    const granularity = 'daily';
    const vehicleDataMap =
      granularity === 'daily'
        ? fuelData.daily
        : generateAggregatedData(fuelData.daily, granularity);

    if (!vehicleId || !vehicleDataMap[vehicleId]) {
      individualChart.clear();
      return;
    }

    const rawData = vehicleDataMap[vehicleId];
    const from = moment(fromDate, 'YYYY-MM-DD');
    const to = moment(toDate, 'YYYY-MM-DD').endOf('day');


    const labels = Object.keys(rawData).sort().filter(label => {

      const format = {
        daily: 'YYYY-MM-DD',
        weekly: 'GGGG-[W]WW',
        monthly: 'YYYY-MM',
        yearly: 'YYYY'
      }[granularity];

      const labelDate = moment(label, format);
      return labelDate.isSameOrAfter(from) && labelDate.isSameOrBefore(to);
    });

    const values = labels.map(label => rawData[label]);

    individualChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#ccc' } }
      },
      yAxis: {
        type: 'value',
        name: 'Fuel (Liters)',
        nameTextStyle: { color: '#fff' },
        axisLabel: { color: '#fff' },
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
      },
      series: [{
        name: 'Fuel Usage',
        type: 'line',
        data: values,
        lineStyle: { width: 3, color: '#ff6e76' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 110, 118, 0.5)' },
            { offset: 1, color: 'rgba(255, 110, 118, 0.1)' }
          ])
        },
        itemStyle: { color: '#ff6e76' }
      }],
      backgroundColor: 'transparent'
    });
  }

  // Date range picker setup
  $('#dateRange').daterangepicker({
    opens: 'left',
    startDate: moment().startOf('month'),
    endDate: moment().endOf('month'),
    locale: { format: 'YYYY-MM-DD' }
  }, function (start, end) {
    const vehicleId = document.getElementById('vehicleSelect').value;
    if (vehicleId) {
      updateIndividualChart(vehicleId, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    }
  });

  // Event: Granularity change
  document.getElementById('groupGranularity').addEventListener('change', function () {
    updateGroupedChart(this.value);
    const vehicleId = document.getElementById('vehicleSelect').value;
    const range = $('#dateRange').data('daterangepicker');
    if (vehicleId && range) {
      updateIndividualChart(vehicleId, range.startDate.format('YYYY-MM-DD'), range.endDate.format('YYYY-MM-DD'));
    }
  });

  // Event: Vehicle change
  document.getElementById('vehicleSelect').addEventListener('change', function () {
    const range = $('#dateRange').data('daterangepicker');
    if (range) {
      updateIndividualChart(this.value, range.startDate.format('YYYY-MM-DD'), range.endDate.format('YYYY-MM-DD'));
    }
  });

  // Window Resize
  window.addEventListener('resize', () => {
    groupedChart.resize();
    individualChart.resize();
  });

  // Initial Load for Grouped Chart using Daily data
  const today = moment().format('YYYY-MM-DD');
  const { labels, vehicleData } = generateGroupedData('daily');
  updateGroupedChart('daily');

  groupedChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: {
      type: 'value',
      name: 'Fuel (Liters)',
      nameTextStyle: { color: '#fff' },
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: '#ccc' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: Object.keys(vehicleData).map(vehicle => ({
      name: vehicle,
      type: 'line',
      data: vehicleData[vehicle],
      lineStyle: { width: 3 },
      itemStyle: { color: '#3b84c0' }
    })),
    backgroundColor: 'transparent'
  });

  const defaultVehicle = Object.keys(fuelData.daily)[0];
  document.getElementById('vehicleSelect').value = defaultVehicle;

  // Ensure date range picker is initialized before calling chart
  setTimeout(() => {
    const today = moment().format('YYYY-MM-DD');
    const dateRangePicker = $('#dateRange').data('daterangepicker');
    if (dateRangePicker) {
      dateRangePicker.setStartDate(today);
      dateRangePicker.setEndDate(today);
      updateIndividualChart(defaultVehicle, today, today);
    }
  }, 100);

});
