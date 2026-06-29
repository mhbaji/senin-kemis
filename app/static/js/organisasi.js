function drawPolyline(points) {
  const svg = document.getElementById("connector");
  const polyline = document.createElementNS("http://www.w3.org/2000/svg","polyline");
  polyline.setAttribute("points", points.map(p => p.join(",")).join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "black");
  polyline.setAttribute("stroke-width", "2");
  svg.appendChild(polyline);
}

function connectBoxesWithPath() {
  const grid = document.getElementById("grid").getBoundingClientRect();

  // helper ambil koordinat
  const getBox = id => document.getElementById(id).getBoundingClientRect();
  const midBottom = b => [b.left + b.width/2 - grid.left, b.bottom - grid.top];
  const midTop    = b => [b.left + b.width/2 - grid.left, b.top - grid.top];
  const midCenterY = (b) => b.top + b.height/2 - grid.top;

  const box1 = getBox("box1");
  const box2 = getBox("box2");
  const box3 = getBox("box3");
  const box4 = getBox("box4");
  const box5 = getBox("box5");
  const box6 = getBox("box6");
  const space2 = getBox("space2");
  const space4 = getBox("space4");

  // PJ → Ketua
  drawPolyline([ midBottom(box1), midTop(box2) ]);

  // Ketua → Sekretaris
  drawPolyline([
    [box2.left + box2.width/2 - grid.left, box2.bottom - grid.top],
    [box2.left + box2.width/2 - grid.left, midCenterY(space2)],
    [box3.left + box3.width/2 - grid.left, midCenterY(space2)],
    midTop(box3)
  ]);

  // Sekretaris → Sekretariat
  drawPolyline([ midBottom(box3), midTop(box4) ]);

  // Ketua → Bansos
  drawPolyline([
    [box2.left + box2.width/2 - grid.left, box2.bottom - grid.top],
    [box2.left + box2.width/2 - grid.left, midCenterY(space4)],
    [box5.left + box5.width/2 - grid.left, midCenterY(space4)],
    midTop(box5)
  ]);

  // Ketua → Pemberdayaan
  drawPolyline([
    [box2.left + box2.width/2 - grid.left, box2.bottom - grid.top],
    [box2.left + box2.width/2 - grid.left, midCenterY(space4)],
    [box6.left + box6.width/2 - grid.left, midCenterY(space4)],
    midTop(box6)
  ]);
}

async function loadStrukturTkpk() {
  try {
    const res = await fetch('/api/struktur_tkpk');
    const data = await res.json();
    console.log(data);

    const tablePJ = document.getElementById("pj");
    const tbanggotaSek = document.getElementById("anggotaSek");
    const trkoorBansos = document.getElementById("koorBansos");
    const tbanggotaBansos = document.getElementById("anggotaBansos");
    const trkoorPermas = document.getElementById("koorPermas");
    const tbanggotaPermas = document.getElementById("anggotaPermas");

    // Peta dalam_tim ke elemen tr
    const rowMap = {
      "Ketua": document.getElementById("ketua"),
      "Wakil Ketua": document.getElementById("wakilKetua"),
      "Sekretaris": document.getElementById("sekretaris"),
      "Wakil Sekretaris I": document.getElementById("wasek1"),
      "Wakil Sekretaris II": document.getElementById("wasek2"),
      "Wakil Sekretaris III": document.getElementById("wasek3"),
      "Kepala": document.getElementById("kepSek"),
      "Wakil Kepala": document.getElementById("waKepSek"),
    };

    // Fungsi helper untuk isi row
    function fillRow(tr, tag, label, jabatan) {
      const cellLabel = document.createElement(tag);
      cellLabel.textContent = label;
      tr.appendChild(cellLabel);

      const cellColon = document.createElement(tag);
      cellColon.textContent = ":";
      tr.appendChild(cellColon);

      const cellJabatan = document.createElement(tag);
      cellJabatan.textContent = jabatan;
      tr.appendChild(cellJabatan);
    }

    // helper untuk tambah anggota
    function addAnggota(idTbody, jabatan, withLabel=false) {
      const tr = document.createElement("tr");
      if (withLabel) {
        tr.innerHTML = `
          <td>Anggota</td>
          <td>:</td>
          <td>${jabatan}</td>
        `;
      } else {
        tr.innerHTML = `
          <td></td>
          <td></td>
          <td>${jabatan}</td>
        `;
      }
      idTbody.appendChild(tr);
    }

    let idxAnggotaSek = 1
    let idxAnggotaBansos = 1
    let idxAnggotaPermas = 1
    data.forEach(element => {
      if (element.dalam_tim === "Penanggung Jawab") {
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th>${element.dalam_tim}</th>
          </tr>
        `;

        const tbody = document.createElement("tbody");
        tbody.innerHTML = `
          <tr>
            <td>${element.jabatan}</td>
          </tr>
        `;

        tablePJ.appendChild(thead);
        tablePJ.appendChild(tbody);
      } else {
        // console.log(element.dalam_tim)
        const tr = rowMap[element.dalam_tim];
        // console.log(tr)
        if (tr) {
          // Tentukan pakai th atau td
          let tag = "th"
          console.log("includes", ["Ketua", "Sekretaris"].includes(element.dalam_tim))
          if (["Ketua", "Sekretaris"].includes(element.dalam_tim) ){tag = "th"}
          else {tag = "td"} 
          fillRow(tr, tag, element.dalam_tim, element.jabatan);
        }
        else{
          if(element.dalam_tim === "Anggota" && element.keterangan === "Sekretariat"){
            if(idxAnggotaSek === 1){
              addAnggota(tbanggotaSek, element.jabatan, true);
              idxAnggotaSek +=1;
            }
            else{
              addAnggota(tbanggotaSek, element.jabatan, false);
              idxAnggotaSek +=1;
            }
          }
          else if (element.keterangan === "Kelompok Pengelola Program Bantuan Sosial dan Jaminan Sosial Terpadu Berbasis Rumah Tangga, Keluarga dan Individu"){
            if(element.dalam_tim === "Koordinator"){
              fillRow(trkoorBansos, "td", element.dalam_tim, element.jabatan);
            }
            else if(idxAnggotaBansos === 1){
              addAnggota(tbanggotaBansos, element.jabatan, true);
              idxAnggotaBansos +=1;
            }
            else {
              addAnggota(tbanggotaBansos, element.jabatan, false);
              idxAnggotaBansos +=1;
            }
          }
          else if (element.keterangan === "Kelompok Pengelola Program Pemberdayaan Masyarakat Dan Penguatan Pelaku Usaha Mikro dan Kecil"){
            if(element.dalam_tim === "Koordinator"){
              fillRow(trkoorPermas, "td", element.dalam_tim, element.jabatan);
            }
            else if(idxAnggotaPermas === 1){
              addAnggota(tbanggotaPermas, element.jabatan, true);
              idxAnggotaPermas +=1;
            }
            else {
              addAnggota(tbanggotaPermas, element.jabatan, false);
              idxAnggotaPermas +=1;
            }
          }
        }
      }
    });

  } catch (err) {
    console.error("Gagal load struktur TKPK:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadStrukturTkpk();   // tunggu selesai
  connectBoxesWithPath();     // baru gambar garis
});



// // --- Fungsi render tabel utama (jabatan inti) ---
// function renderMainTkpk(data) {
//   const mainRoles = [
//     "Penanggung Jawab",
//     "Ketua",
//     "Wakil Ketua",
//     "Sekretaris",
//     "Wakil Sekretaris I",
//     "Wakil Sekretaris II",
//     "Wakil Sekretaris III"
//   ];

//   const tbody = document.querySelector("#main-tkpk tbody");
//   tbody.innerHTML = "";

//   data.filter(d => mainRoles.includes(d.dalam_tim))
//       .forEach(d => {
//         const tr = document.createElement("tr");
//         tr.innerHTML = `
//           <td>${d.jabatan}</td>
//           <td>${d.dalam_tim}</td>
//         `;
//         tbody.appendChild(tr);
//       });
// }

// // --- Fungsi render Pokja Bansos ---
// function renderPokjaBansos(data) {
//   const tbody = document.querySelector("#pokja-bansos tbody");
//   tbody.innerHTML = "";

//   data.filter(d => d.keterangan === "Kelompok Pengelola Program Bantuan Sosial dan Jaminan Sosial Terpadu Berbasis Rumah Tangga, Keluarga dan Individu")
//       .forEach(d => {
//         const tr = document.createElement("tr");
//         tr.innerHTML = `
//           <td>${d.jabatan}</td>
//           <td>${d.dalam_tim}</td>
//         `;
//         tbody.appendChild(tr);
//       });
// }

// // --- Fungsi render Pokja Pemberdayaan ---
// function renderPokjaPemberdayaan(data) {
//   const tbody = document.querySelector("#pokja-pemberdayaan tbody");
//   tbody.innerHTML = "";

//   data.filter(d => d.keterangan === "Kelompok Pengelola Program Pemberdayaan Masyarakat Dan Penguatan Pelaku Usaha Mikro dan Kecil")
//       .forEach(d => {
//         const tr = document.createElement("tr");
//         tr.innerHTML = `
//           <td>${d.jabatan}</td>
//           <td>${d.dalam_tim}</td>
//         `;
//         tbody.appendChild(tr);
//       });
// }

// // --- Fungsi render Sekretariat ---
// function renderSekretariat(data) {
//   const tbody = document.querySelector("#Sekretariat tbody");
//   tbody.innerHTML = "";

//   data.filter(d => d.keterangan === "Sekretariat")
//       .forEach(d => {
//         const tr = document.createElement("tr");
//         tr.innerHTML = `
//           <td>${d.jabatan}</td>
//           <td>${d.dalam_tim}</td>
//         `;
//         tbody.appendChild(tr);
//       });
// }

// // --- Fungsi render Law Table (kosong dulu) ---
// function renderLawTable() {
//   document.getElementById("tbody-law").innerHTML = "";
// }
