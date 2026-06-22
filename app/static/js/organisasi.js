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

connectBoxesWithPath();


// document.addEventListener("DOMContentLoaded", () => {
//   loadStrukturTkpk();
// });

// async function loadStrukturTkpk() {
//   try {
//     const res = await fetch('/api/struktur_tkpk');
//     const data = await res.json();

//     renderMainTkpk(data);
//     renderPokjaBansos(data);
//     renderPokjaPemberdayaan(data);
//     renderSekretariat(data);
//     renderLawTable();
//   } catch (err) {
//     console.error("Gagal load struktur TKPK:", err);
//   }
// }

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
