function generateGroupedDataFromIndividuals() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  const numMonths = months.length;
  const summedData = Array(numMonths).fill(0);

  // Add up all values from each vehicle for each month
  Object.values(individualDataMap).forEach(vehicleData => {
    vehicleData.forEach((value, index) => {
      summedData[index] += value;
    });
  });

  return {
    labels: months,
    datasets: [{
      label: 'Total Fuel Used (Liters)',
      data: summedData,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: true
    }]
  };
}

const individualDataMap = {
  vehicle1: [300, 350, 280, 310],
  vehicle2: [400, 420, 390, 410],
  vehicle3: [500, 730, 430, 580],
  vehicle4: [800, 750, 400, 80],
  vehicle5: [100, 630, 630, 380]
};

// ===== Chart Contexts =====
const groupedCtx = document.getElementById('groupedChart').getContext('2d');
const individualCtx = document.getElementById('individualChart').getContext('2d');

// ===== Chart Instances =====
let groupedChart, individualChart;

// ===== Chart Creation Functions =====
const createGroupedChart = (type = 'bar') => {
  if (groupedChart) groupedChart.destroy();

  groupedChart = new Chart(groupedCtx, {
    type: type,
    data: generateGroupedDataFromIndividuals(),
    options: {
      responsive: true,
      maintainAspectRatio: false, 
      // devicePixelRatio: window.devicePixelRatio, 
      plugins: {
        legend: { display: true },
        tooltip: {
          backgroundColor: '#1e1e2f',
          titleColor: '#ffffff',
          bodyColor: '#cccccc',
          borderColor: '#999',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.1)' },
          title: {
            display: false,
            text: 'Fuel Used (Liters)',
            color: '#fff'
          }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: {
            display: false,
            text: 'Month',
            color: '#ccc'
          }
        }
      }
    }
  });
};
let currentIndividualType = 'line';

const createIndividualChart = (type = 'line', vehicle = null) => {
  if (individualChart) individualChart.destroy();

  individualChart = new Chart(individualCtx, {
    type: type,
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: vehicle ? `Fuel Usage (${vehicle})` : 'Fuel Usage',
        data: vehicle ? individualDataMap[vehicle] : [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: !!vehicle },
        tooltip: {
          backgroundColor: '#1e1e2f',
          titleColor: '#ffffff',
          bodyColor: '#cccccc',
          borderColor: '#999',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.1)' },
          title: {
            display: false,
            text: 'Fuel Used (Liters)',
            color: '#ccc'
          }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: {
            display: false,
            text: 'Month',
            color: '#ccc'
          }
        }
      }
    }
  });
};

// ===== Initialization =====
createGroupedChart();           // Default: Bar
createIndividualChart();        // No data yet
document.getElementById('individualChart').style.display = 'none'; // Hide individual chart initially

// ===== Chart Toggle Buttons =====

// Grouped chart type buttons
document.getElementById('groupedBarBtn').addEventListener('click', () => {
  setActiveChartType('grouped', 'bar');
  createGroupedChart('bar');
});

document.getElementById('groupedLineBtn').addEventListener('click', () => {
  setActiveChartType('grouped', 'line');
  createGroupedChart('line');
});

// Individual chart type buttons
document.getElementById('individualLineBtn').addEventListener('click', () => {
  const selectedVehicle = document.getElementById('vehicleSelect').value;
  if (!selectedVehicle) return;

  currentIndividualType = 'line';
  setActiveChartType('individual', 'line');
  createIndividualChart('line', selectedVehicle);
  document.getElementById('individualChart').style.display = 'block';
});

document.getElementById('individualBarBtn').addEventListener('click', () => {
  const selectedVehicle = document.getElementById('vehicleSelect').value;
  if (!selectedVehicle) return;

  currentIndividualType = 'bar';
  setActiveChartType('individual', 'bar');
  createIndividualChart('bar', selectedVehicle);
  document.getElementById('individualChart').style.display = 'block';
});

// active button 
function setActiveChartType(section, type) {
  const barBtn = document.getElementById(`${section}BarBtn`);
  const lineBtn = document.getElementById(`${section}LineBtn`);

  if (type === 'bar') {
    barBtn.classList.add('active');
    lineBtn.classList.remove('active');
  } else {
    lineBtn.classList.add('active');
    barBtn.classList.remove('active');
  }
}

// Vehicle selector
document.getElementById('vehicleSelect').addEventListener('change', (e) => {
  const selectedVehicle = e.target.value;
  const selectedType = currentIndividualType;


  if (individualDataMap[selectedVehicle]) {
    createIndividualChart(selectedType, selectedVehicle);
    document.getElementById('individualChart').style.display = 'block';
  }
});
