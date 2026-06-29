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

    const tablePJ = document.getElementById("pj");

    // mapping row tunggal
    const rowMap = {
      "Ketua": { el: document.getElementById("ketua"), tag: "th" },
      "Wakil Ketua": { el: document.getElementById("wakilKetua"), tag: "td" },
      "Sekretaris": { el: document.getElementById("sekretaris"), tag: "th" },
      "Wakil Sekretaris I": { el: document.getElementById("wasek1"), tag: "td" },
      "Wakil Sekretaris II": { el: document.getElementById("wasek2"), tag: "td" },
      "Wakil Sekretaris III": { el: document.getElementById("wasek3"), tag: "td" },
      "Kepala": { el: document.getElementById("kepSek"), tag: "td" },
      "Wakil Kepala": { el: document.getElementById("waKepSek"), tag: "td" },
    };

    // mapping anggota per kelompok → tbody + ul
    const anggotaMap = {
      "Sekretariat": { ul: document.getElementById("listSekretariat") },
      "Kelompok Pengelola Program Bantuan Sosial dan Jaminan Sosial Terpadu Berbasis Rumah Tangga, Keluarga dan Individu":
        { ul: document.getElementById("listBansos"), koor: document.getElementById("koorBansos") },
      "Kelompok Pengelola Program Pemberdayaan Masyarakat Dan Penguatan Pelaku Usaha Mikro dan Kecil":
        { ul: document.getElementById("listPermas"), koor: document.getElementById("koorPermas") },
    };

    // helper isi row tunggal
    function fillRow(tr, tag, label, jabatan) {
      tr.innerHTML = `
        <${tag}>${label}</${tag}>
        <${tag}>:</${tag}>
        <${tag}>${jabatan}</${tag}>
      `;
    }

    // helper tambah anggota ke ul
    function addAnggota(listEl, jabatan) {
      const li = document.createElement("li");
      li.textContent = jabatan;
      listEl.appendChild(li);
    }

    data.forEach(el => {
      if (el.dalam_tim === "Penanggung Jawab") {
        tablePJ.innerHTML = `
          <thead><tr><th>${el.dalam_tim}</th></tr></thead>
          <tbody><tr><td>${el.jabatan}</td></tr></tbody>
        `;
      } else if (rowMap[el.dalam_tim]) {
        const { el: tr, tag } = rowMap[el.dalam_tim];
        fillRow(tr, tag, el.dalam_tim, el.jabatan);
      } else if (el.dalam_tim === "Anggota" && el.keterangan === "Sekretariat") {
        addAnggota(anggotaMap["Sekretariat"].ul, el.jabatan);
      } else if (anggotaMap[el.keterangan]) {
        const group = anggotaMap[el.keterangan];
        if (el.dalam_tim === "Koordinator") {
          fillRow(group.koor, "td", el.dalam_tim, el.jabatan);
        } else {
          addAnggota(group.ul, el.jabatan);
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
