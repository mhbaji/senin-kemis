async function loadDokumenPendukung() {
  const res = await fetch("/api/data_pendukung");
  const data = await res.json();
  const tbody = document.getElementById("tbDokduk");
  tbody.innerHTML = "";

  data.forEach((d, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>
        <a href="${d.tautan}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn-download">${d.nama}</a>
      </td>
      <td>${d.keterangan}</td>
      <td>${d.instansi}</td>
      <td>${d.rilis}</td>
    `;
    tbody.appendChild(tr);
  });
}

loadDokumenPendukung();