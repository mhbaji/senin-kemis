document.querySelectorAll('input[name="inputType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === "tautan") {
        document.getElementById("tautanField").style.display = "block";
        document.getElementById("fileField").style.display = "none";
      } else {
        document.getElementById("tautanField").style.display = "none";
        document.getElementById("fileField").style.display = "block";
      }
    });
  });

document.getElementById("formDokduk").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("/api/data_pendukung", {
    method: "POST",
    body: formData
  });

  const result = await res.json();
  alert(result.message);
});
