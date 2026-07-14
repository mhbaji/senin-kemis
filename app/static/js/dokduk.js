async function loadDokumenPendukung() {
  const res = await fetch("/api/data_pendukung");
  const data = await res.json();
  const tbody = document.getElementById("tbDokduk");
  tbody.innerHTML = "";

  data.forEach((d, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${d.nama}</td>
      <td>${d.keterangan}</td>
      <td>${d.rilis}</td>
      <td>
        <a href="${d.tautan}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn-download">DOWNLOAD</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

loadDokumenPendukung();