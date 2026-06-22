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
        legend: { position: 'bottom'}
      },
      responsive: true,
      // maintainAspectRatio: false
      scales: extraOptions['scales']
    }
  });
}

/* 1. Target vs Capaian Kota Tegal */
function loadTargetVsCapaian() {
  renderChart(
    'chartTargetCapaian',
    '/api/target_vs_capaian',
    (data) => [
      { label: 'Target Min', data: data.map(d => d.target_min), fill: false },
      { label: 'Target Max', data: data.map(d => d.target_max), fill: false },
      { label: 'Capaian', data: data.map(d => d.capaian), fill: false }
    ],
    // 'Target vs Capaian Kota Tegal'
  );
}

/* 2. Kota Tegal vs Jawa Tengah vs Indonesia */
function loadTegalJatengIndonesia() {
  renderChart(
    'chartTegalJatengIndonesia',
    '/api/tegal_jateng_indonesia',
    (data) => Object.keys(data).map((k, i) => ({
      label: k,
      data: data[k].map(d => d.persentase),
      // borderColor: ['red','blue','green'][i],
      fill: false
    })),
    'Persentase Penduduk Miskin: Tegal vs Jateng vs Indonesia'
  );
}

/* 3. Kota Tegal vs Kabupaten sekitar */
function loadTegalKabupaten() {
  renderChart(
    'chartTegalKabupaten',
    '/api/tegal_kabupaten',
    (data) => Object.keys(data).map((k, i) => ({
      label: k,
      data: data[k].map(d => d.persentase),
      // borderColor: ['red','blue','green','orange'][i],
      fill: false
    })),
    'Persentase Penduduk Miskin: Tegal & Kabupaten Sekitar'
  );
}

/* 4. Kota Tegal vs Kota lain */
function loadTegalKotaLain() {
  renderChart(
    'chartTegalKotaLain',
    '/api/tegal_kota_lain',
    (data) => Object.keys(data).map((k, i) => ({
      label: k,
      data: data[k].map(d => d.persentase),
      // borderColor: ['red','blue','green','orange','purple','brown'][i],
      fill: false
    })),
    'Persentase Penduduk Miskin: Tegal & Kota Lain'
  );
}

function loadKedalamanKeparahanGini() {
  renderChart(
    'chartKedalamanKeparahanGini',
    '/api/kedalaman_keparahan_gini',
    (data) => [
      { label: 'Kedalaman', data: data.map(d => d.kedalaman), fill: false },
      { label: 'Keparahan', data: data.map(d => d.keparahan), fill: false },
      { label: 'Indeks Gini', data: data.map(d => d.indeks_gini), fill: false }
    ]
  );
}

/* 6. Garis Kemiskinan */
function loadGarisKemiskinan() {
  renderChart(
    'chartGarisKemiskinan',
    '/api/garis_kemiskinan',
    (data) => [
      { label: 'Garis Kemiskinan', data: data.map(d => d.garis_kemiskinan/1000), fill: false }
    ],
    {
      scales: {
         y: {
          // tidak pakai callback lagi
          title: {
            display: true,
            text: '(Ribu)', // hanya sekali di atas sumbu Y
            font: {
              weight: 'bold'
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Tahun'
          }
        }
      
      }
    }
  );
}

async function loadTegalTable() {
  const res = await fetch('/api/tegal_table');
  let data = await res.json();

  // urutkan tahun
  data.sort((a, b) => a.tahun - b.tahun);

  const tbody = document.querySelector('#tegalTable tbody');
  tbody.innerHTML = '';

  data.forEach(d => {
    const row = `
      <tr>
        <td>${d.tahun}</td>
        <td>${d.target_min ?? '-'}</td>
        <td>${d.target_max ?? '-'}</td>
        <td>${d.jumlah_kemiskinan ?? '-'}</td>
        <td>${d.capaian ?? '-'}</td>
        <td>${d.garis_kemiskinan.toLocaleString('id-ID') ?? '-'}</td>
        <td>${d.kedalaman ?? '-'}</td>
        <td>${d.keparahan ?? '-'}</td>
        <td>${d.indeks_gini ?? '-'}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}

async function loadKemiskinanTable() {
  const res = await fetch('/api/capaian_kemiskinan');
  let result = await res.json();

  const tahunList = result.tahun;
  const data = result.data;

  const thead = document.querySelector('#kemiskinanTable thead');
  const tbody = document.querySelector('#kemiskinanTable tbody');

  // Buat header otomatis
  let headRow = '<tr><th>Wilayah</th>';
  tahunList.forEach(t => {
    headRow += `<th>${t}</th>`;
  });
  headRow += '</tr>';
  thead.innerHTML = headRow;

  // Cari min dan max per tahun
  const minMax = {};
  tahunList.forEach(t => {
    const values = data.map(d => d[t]).filter(v => v !== undefined && v !== null);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    minMax[t] = { min: minVal, max: maxVal };
  });

  // Buat body dengan highlight
  tbody.innerHTML = '';
  data.forEach(d => {
    let row = `<tr><td>${d.wilayah}</td>`;
    tahunList.forEach(t => {
      let val = d[t] ?? '-';
      let style = '';
      if (val !== '-') {
        if (val === minMax[t].min) {
          style = 'background-color: #a8e6a1;'; // hijau
        } else if (val === minMax[t].max) {
          style = 'background-color: #f5a3a3;'; // merah
        }
      }
      row += `<td style="${style}">${val}</td>`;
    });
    row += '</tr>';
    tbody.insertAdjacentHTML('beforeend', row);
  });
}

// panggil semua grafik setelah halaman siap
document.addEventListener("DOMContentLoaded", () => {
  loadTargetVsCapaian();
  loadTegalJatengIndonesia();
  loadTegalKabupaten();
  loadTegalKotaLain();
  loadKedalamanKeparahanGini();
  loadGarisKemiskinan();
  loadTegalTable();
  loadKemiskinanTable();
});