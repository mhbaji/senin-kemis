async function loadSummaryStrategi() {
  const res = await fetch('/api/summary_strategi');
  const data = await res.json();

  const totalAnggaran = data.reduce((sum, d) => sum + d.total_anggaran, 0);
  const totalSubkegiatan = data.reduce((sum, d) => sum + d.jumlah_subkegiatan, 0);
  const colors = ['#2ecc71', '#3498db', '#e74c3c'];

  // Donut Anggaran
  new Chart(document.getElementById('dist-anggaran-chart'), {
    type: 'doughnut',
    data: {
      // labels: data.map(d => d.strategi),
      datasets: [{
        data: data.map(d => d.total_anggaran),
        backgroundColor: colors
      }]
    },
    options: { 
      plugins: { 
        datalabels: { color: '#000', align: 'center', 
          formatter: (value) => {
              return "Rp "+value.toLocaleString('id-ID');
          },
        },
        title: { display: true, text: "Distribusi Anggaran" },
      },
    },
    plugins: [ChartDataLabels]
  });

  // Donut Subkegiatan
  new Chart(document.getElementById('dist-subkegiatan-chart'), {
    type: 'doughnut',
    data: {
      // labels: data.map(d => d.strategi),
      datasets: [{
        label: data.map(d => d.strategi),
        data: data.map(d => d.jumlah_subkegiatan),
        backgroundColor: colors
      }]
    },
    options: { 
      plugins: { 
        datalabels: { color: '#000', align: 'center', 
          formatter: (value) => {
              return value.toLocaleString('id-ID') + " Subkegiatan";
          },
        },
        title: { display: true, text: "Distribusi Subkegiatan" } 
      } 
    },
    plugins: [ChartDataLabels]
  });

  // Bar Chart Anggaran vs Realisasi
  const periode = data[0]?.periode_terakhir;
  const tahun = data[0]?.tahun;
  const chartTitle = "Anggaran vs Realisasi Triwulan " + periode + " Tahun " + tahun;

  new Chart(document.getElementById('chart-realisasi-strategi'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.strategi),
      datasets: [
        { label: 'Anggaran', data: data.map(d => d.total_anggaran), backgroundColor: '#3498db' },
        { label: 'Realisasi', data: data.map(d => d.total_realisasi), backgroundColor: '#2ecc71' }
      ]
    },
    options: { plugins: { 
      datalabels: { color: '#000', align: 'center', 
        formatter: (value) => {
            return "Rp "+value.toLocaleString('id-ID');
        },
      },
      title: { display: true, text: chartTitle } 
    } 
  },
    plugins: [ChartDataLabels]
  });

  const llegend = document.getElementById('legend-list');
  const legend_list_data = data.map((d, i) => {
    return `<div style="margin:4px 0">
              <span style="display:inline-block;width:12px;height:12px;background:${colors[i]};margin-right:8px"></span>
              ${d.strategi}
            </div>`;
  }).join('');
  llegend.innerHTML = legend_list_data;
}

async function loadRangkumanStrategi() {
  const res = await fetch('/api/rangkuman_strategi');
  const data = await res.json();

  const tbody = document.getElementById('summary-body');
  tbody.innerHTML = '';

  const totalAnggaran = data.reduce((sum, d) => sum + d.total_anggaran, 0);
  const totalSub = data.reduce((sum, d) => sum + d.jumlah_subkegiatan, 0);
  const totalRealisasi = data.reduce((sum, d) => sum + Object.values(d.realisasi).reduce((s,v)=>s+v,0), 0);

  data.forEach(d => {
    const persentaseSub = ((d.jumlah_subkegiatan / totalSub) * 100).toFixed(2);
    const persentaseAnggaran = ((d.total_anggaran / totalAnggaran) * 100).toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.strategi}</td>
      <td style="text-align:center">${d.jumlah_subkegiatan}</td>
      <td style="text-align:center">${persentaseSub}%</td>
      <td style="text-align:center">${d.total_anggaran.toLocaleString('id-ID')}</td>
      <td style="text-align:center">${persentaseAnggaran}%</td>
      <td style="text-align:center">${(d.realisasi[1]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:center">${(d.realisasi[2]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:center">${(d.realisasi[3]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:center">${(d.realisasi[4]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:center">${d.persentase_realisasi}%</td>
    `;
    tbody.appendChild(tr);
  });

  // Tambah baris total
  const persentaseTotalRealisasi = ((totalRealisasi / totalAnggaran) * 100).toFixed(2);

  const trTotal = document.createElement('tr');
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td style="text-align:center"><strong>${totalSub}</strong></td>
    <td></td>
    <td style="text-align:center"><strong>${totalAnggaran.toLocaleString('id-ID')}</strong></td>
    <td></td>
    <td colspan="4" style="text-align:center"><strong>${totalRealisasi.toLocaleString('id-ID')}</strong></td>
    <td style="text-align:center"><strong>${persentaseTotalRealisasi}%</strong></td>
  `;
  tbody.appendChild(trTotal);
}

async function loadDetailSubkegiatan() {
  const res = await fetch('/api/detail_subkegiatan');
  const result = await res.json();
  const data = result.detail;
  const summary = result.summary;

  const tbody = document.getElementById('upaya-detail-body');
  tbody.innerHTML = '';

  summary.forEach(s => {
    const trMain = document.createElement('tr');
    trMain.classList.add('strategi-row');
    trMain.innerHTML = `
      <td colspan="10"><strong>${s.strategi}</strong> 
        (Subkegiatan: ${s.jumlah_subkegiatan}, 
        Anggaran: Rp ${s.total_anggaran.toLocaleString('id-ID')},
        Realisasi: Rp ${s.realisasi ? Object.values(s.realisasi).reduce((a,b)=>a+b,0).toLocaleString('id-ID') : 0},
        Persentase: ${s.persentase_realisasi}%)
        <span class="toggle-icon">▶</span>
      </td>
    `;
    tbody.appendChild(trMain);

    // detail rows
    data.filter(d => d.strategi === s.strategi).forEach(r => {
      const tr = document.createElement('tr');
      tr.classList.add('detail-row', 'hidden');
      tr.innerHTML = `
        <td>${r.opd}</td>
        <td>${r.program}</td>
        <td>${r.kegiatan}</td>
        <td>${r.subkegiatan}</td>
        <td style="text-align:right">${r.anggaran.toLocaleString('id-ID')}</td>
        <td style="text-align:right">${(r.realisasi[1]||0).toLocaleString('id-ID')}</td>
        <td style="text-align:right">${(r.realisasi[2]||0).toLocaleString('id-ID')}</td>
        <td style="text-align:right">${(r.realisasi[3]||0).toLocaleString('id-ID')}</td>
        <td style="text-align:right">${(r.realisasi[4]||0).toLocaleString('id-ID')}</td>
        <td style="text-align:right"><strong>${r.total_realisasi.toLocaleString('id-ID')}</strong></td>
      `;
      tbody.appendChild(tr);
    });

    // toggle expand/collapse
    trMain.addEventListener('click', () => {
      const isOpen = trMain.classList.toggle('open');
      const icon = trMain.querySelector('.toggle-icon');
      icon.textContent = isOpen ? '▼' : '▶';

      let next = trMain.nextElementSibling;
      while (next && next.classList.contains('detail-row')) {
        next.classList.toggle('hidden', !isOpen);
        next = next.nextElementSibling;
      }
    });
  });
}

loadSummaryStrategi();
loadRangkumanStrategi();
loadDetailSubkegiatan();

const scrollTopBtn = document.getElementById("scrollTopBtn");
window.onscroll = function() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
};

// fungsi scroll ke atas
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/*
async function loadStrategi() {
  const res = await fetch('/api/strategi');
  const data = await res.json();

  const totalAnggaran = data.reduce((sum, d) => sum + d.anggaran, 0);
  const totalSubkegiatan = data.reduce((sum, d) => sum + d.jumlah_subkegiatan, 0);
  const colors = ['#2ecc71', '#3498db', '#e74c3c'];

  const strategiData = data.map((d, i) => {
      const persentaseAnggaran = (d.anggaran / totalAnggaran * 100).toFixed(2);
      const persentaseSubkegiatan = (d.jumlah_subkegiatan / totalSubkegiatan * 100).toFixed(2);
      return {
          strategi: d.strategi,
          jumlahAnggaran: d.anggaran,
          jumlahSubkegiatan: d.jumlah_subkegiatan,
          persentaseAnggaran: persentaseAnggaran,
          persentaseSubkegiatan: persentaseSubkegiatan,
          color: colors[i % colors.length]
      };
  });

  const ctxAnggaran = document.getElementById('dist-anggaran-chart');
  new Chart(ctxAnggaran, {
      type: 'doughnut',
      data: { 
          datasets: [{
            // label: strategiData.map(d => d.strategi),
            data: strategiData.map(d => d.jumlahAnggaran),
            backgroundColor: strategiData.map(d => d.color)
          }]
      },
      options: {
          plugins: {
            datalabels: {
                color: '#000',
                formatter: (value) => {
                    return "Rp "+value.toLocaleString('id-ID');
                },
                align: 'start'
            },
            title: {
              display: true,
              text: "Distribusi Anggaran"
            }
          },
      },
      plugins: [ChartDataLabels]
  });

  const ctxSubkegiatan = document.getElementById('dist-subkegiatan-chart');
  const chartSubkegiatan = new Chart(ctxSubkegiatan, {
    type: 'doughnut',
      data: { 
        datasets: [{
          // label: strategiData.map(d => d.strategi),
          data: strategiData.map(d => d.jumlahSubkegiatan),
          backgroundColor: strategiData.map(d => d.color)
        }]
      },
      options: {
        plugins: {
          legend: { display: true },
          datalabels: {
            color: '#000',
            align: 'start',
          },
          title: {
            display: true,
            text: "Distribusi Subkegiatan"
          }
        },
      },
      plugins: [ChartDataLabels]
  });
  
  function generateLegend(chart) {
    const labels = chart.data.labels;
    const colors = chart.data.datasets[0].backgroundColor;
    return labels.map((label, i) =>
      `<li><span style="display:inline-block;width:12px;height:12px;background:${colors[i]};margin-right:8px"></span>${label}</li>`
    ).join('');
  }

  const llegend = document.getElementById('legend-list');
  const legend_list_data = data.map((d, i) => {
    return `<div style="margin:4px 0">
              <span style="display:inline-block;width:12px;height:12px;background:${colors[i]};margin-right:8px"></span>
              ${d.strategi}
            </div>`;
  }).join(''); // gabungkan array jadi satu string

  llegend.innerHTML = legend_list_data;

  // Tabel ringkas
  const tbody = document.getElementById('summary-body');
  // tbody.innerHTML = '';
  strategiData.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.strategi}</td>  
      <td style="text-align:right">${d.jumlahSubkegiatan}</td>
      <td style="text-align:right">${d.persentaseSubkegiatan}</td>
      <td style="text-align:right">${d.jumlahAnggaran.toLocaleString('id-ID')}</td>
      <td style="text-align:right">${d.persentaseSubkegiatan}</td>

      `;
    tbody.appendChild(tr);
  });

  // Tambah baris total
  const trTotal = document.createElement('tr');
  trTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td style="text-align:right"><strong>${totalSubkegiatan}</strong></td>
    <td></td>
    <td style="text-align:right"><strong>${totalAnggaran.toLocaleString('id-ID')}</strong></td>
    <td></td>
  `;
  tbody.appendChild(trTotal);

}

async function loadDetailAnggaran() {
  const res = await fetch('/api/detail_anggaran');
  const data = await res.json();

  // kelompokkan per strategi
  const grouped = {};
  data.forEach(d => {
    if (!grouped[d.strategi]) grouped[d.strategi] = [];
    grouped[d.strategi].push(d);
  });

  const tbody = document.getElementById('upaya-detail-body');
  tbody.innerHTML = '';

  Object.keys(grouped).forEach(strategi => {
    const rows = grouped[strategi];
    const totalSub = rows.length;
    const totalAnggaran = rows.reduce((sum, r) => sum + r.anggaran, 0);

    // baris utama strategi
    const trMain = document.createElement('tr');
    trMain.classList.add('strategi-row');
    trMain.innerHTML = `
      <td colspan="6"><strong>${strategi}</strong> 
        (Subkegiatan: ${totalSub}, Anggaran: Rp ${totalAnggaran.toLocaleString('id-ID')})
        <span class="toggle-icon">▶</span>
      </td>
    `;
    tbody.appendChild(trMain);

    // baris detail subkegiatan
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.classList.add('detail-row', 'hidden');
      tr.innerHTML = `
        <td></td>
        <td>${r.opd}</td>
        <td>${r.program}</td>
        <td>${r.kegiatan}</td>
        <td>${r.subkegiatan}</td>
        <td style="text-align:right">${r.anggaran.toLocaleString('id-ID')}</td>
      `;
      tbody.appendChild(tr);
    });

    // toggle expand/collapse
    trMain.addEventListener('click', () => {
      const isOpen = trMain.classList.toggle('open');
      const icon = trMain.querySelector('.toggle-icon');
      icon.textContent = isOpen ? '▼' : '▶';

      let next = trMain.nextElementSibling;
      while (next && next.classList.contains('detail-row')) {
        next.classList.toggle('hidden', !isOpen);
        next = next.nextElementSibling;
      }
    });
  });
}


async function loadRealisasiStrategi() {
  const res = await fetch('/api/realisasi_strategi');
  const data = await res.json();

  const periode = data[0]?.periode_terakhir;
  const tahun = data[0]?.tahun_terakhir;
  const chartTitle = "Anggaran vs Realisasi Triwulan " + periode + " Tahun " + tahun;

  const ctx = document.getElementById('chart-realisasi-strategi');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.strategi),
      datasets: [
        {
          label: 'Anggaran',
          data: data.map(d => d.total_anggaran),
          backgroundColor: '#3498db'
        },
        {
          label: 'Realisasi',
          data: data.map(d => d.total_realisasi),
          backgroundColor: '#2ecc71'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': Rp ' + context.raw.toLocaleString('id-ID');
            }
          }
        },
        datalabels: {
          formatter: (value) => {
              return "Rp "+value.toLocaleString('id-ID');
          },
          legend: {display: false},
          color: '#000',
          align: 'end',
        },
        title: {
          display: true,
          text: chartTitle
        }
      },
    },
    plugins: [ChartDataLabels] 
  });
}

async function loadRealisasiTriwulan() {
  const res = await fetch('/api/realisasi_triwulan');
  const data = await res.json();
  console.log(data)

  const grouped = {};
  data.forEach(d => {
    if (!grouped[d.strategi]) {
      grouped[d.strategi] = { strategi: d.strategi, tahun: d.tahun, triwulan: {} };
    }
    grouped[d.strategi].triwulan[d.periode] = d.total_realisasi;
  });

  const tbody = document.getElementById('summary-body');
  tbody.innerHTML = '';

  Object.values(grouped).forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.strategi}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td style="text-align:right">${(item.triwulan[1]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">${(item.triwulan[2]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">${(item.triwulan[3]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">${(item.triwulan[4]||0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">
        ${(
          ( (item.triwulan[1]||0) + (item.triwulan[2]||0) + (item.triwulan[3]||0) + (item.triwulan[4]||0) )
        ).toLocaleString('id-ID')}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

loadStrategi();
loadDetailAnggaran();
loadRealisasiStrategi()
loadRealisasiTriwulan()
*/