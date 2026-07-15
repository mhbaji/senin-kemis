async function renderChart(canvasId, url, datasetsConfig, extraOptions= {}) {
  const res = await fetch(url);
  const data = await res.json();

  // ambil label tahun
  let labels;
  if (Array.isArray(data)) {
    labels = data.map(d => d.tahun);
  } else {
    // ambil tahun dari salah satu dataset
    const firstKey = Object.keys(data)[0];
    labels = data[firstKey].map(d => d.tahun);
  }

  // siapkan datasets
  const datasets = datasetsConfig(data);
  new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: false},
        legend: { position: 'bottom', display: false}
      },
      responsive: true,
      // maintainAspectRatio: false
      scales: extraOptions['scales']
    }
  });
}

/* 1. Target vs Capaian Kota Tegal */
function loadCapaianKemiskinan() {
  renderChart(
    'chartCapaianKemiskinan',
    '/api/kemiskinan_tegal',
    (data) => [
      { label: 'Tingkat Kemiskinan', data: data.map(d => d.capaian), fill: false }
    ],
  );
}

function loadCapaianKE() {
  renderChart(
    'chartCapaianKE',
    '/api/kemiskinan_ekstrem_tegal',
    (data) => [
      { label: 'Capaian', data: data.map(d => d.capaian), fill: false }
    ],
  );
}

async function loadSummaryStrategi() {
  const res = await fetch('/api/last_summary_strategi');
  const data = await res.json();

  // Bar Chart Anggaran vs Realisasi
  const periode = data[0]?.periode_terakhir;
  const tahun = data[0]?.tahun;
  const chartTitle = "Anggaran vs Realisasi Triwulan " + periode + " Tahun " + tahun;

  new Chart(document.getElementById('chart-realisasi-strategi'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.strategi),
      datasets: [
        {
          label: 'Anggaran',
          data: data.map(d => d.total_anggaran),
          backgroundColor: '#9fa4ff',   // warna abu-abu sebagai target
        },
        {
          label: 'Realisasi',
          data: data.map(d => d.total_realisasi),
          backgroundColor: '#2ecc71', // warna hijau sebagai capaian
        }
      ]
    },
    options: {
      indexAxis: 'y', // bikin horizontal bar
      responsive: true,
      plugins: {
        datalabels: {
          color: '#000',
          align: 'end',
          formatter: (value) => "Rp " + value.toLocaleString('id-ID'),
        },
        title: {
          display: true,
          text: chartTitle
        }
      },
      scales: {
        x: {
          ticks: {
            callback: function(value) {
              return 'Rp ' + value.toLocaleString('id-ID');
            }
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
  
  const lstrategi = document.getElementById('strategi-list');
  const strategi_list_data = data.map((d, i) => {
    return `<li>
              ${d.strategi}
            </li>`;
  }).join('');
  lstrategi.innerHTML = strategi_list_data;
}

// panggil semua grafik setelah halaman siap
document.addEventListener("DOMContentLoaded", () => {
  loadSummaryStrategi();
  loadCapaianKemiskinan();
  loadCapaianKE()
});