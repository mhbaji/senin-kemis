import os
import time
import datetime

from flask import Blueprint, abort, request, render_template, jsonify, send_file
from .models import *
from .tools import *
from sqlalchemy import func
from sqlalchemy.orm import aliased

main = Blueprint('main', __name__)
UPLOAD_FOLDER = os.path.join(main.root_path, "static", "dokumen-pendukung")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/upaya')
def upaya():
    return render_template('upaya.html')

@main.route('/organisasi')
def organisasi():
    return render_template('organisasi.html')

@main.route('/kabar')
def kabar():
    return render_template('kabar.html')

@main.route('/dokumen-pendukung')
def dokduk():
    return render_template('dokduk.html')

@main.route('/upload-dokumen-pendukung')
def updokduk():
    return render_template('updok.html')

@main.route("/years")
def get_years():
    years = db.session.query(TaggingSubKegiatan.tahun).distinct().order_by(TaggingSubKegiatan.tahun).all()
    years = [y[0] for y in years]  # ambil nilai integer dari tuple
    return jsonify(years)

@main.route("/api/target_vs_capaian")
def target_vs_capaian():
    tahun_list = tahun_range()
    kota_tegal = KodeWilayah.query.filter_by(nama="Kota Tegal").first()
    data = DataKemiskinan.query.filter(
        DataKemiskinan.wilayah_id == kota_tegal.id,
        DataKemiskinan.tahun.in_(tahun_list)
    ).order_by(DataKemiskinan.tahun.asc()).all()
    result = [
        {
            "tahun": d.tahun,
            "target_min": d.target_min,
            "target_max": d.target_maks,
            "capaian": d.persentase_penduduk_miskin
        } for d in data
    ]
    return jsonify(result)

@main.route("/api/tegal_jateng_indonesia")
def tegal_jateng_indonesia():
    tahun_list = tahun_range()
    wilayah = ["Kota Tegal", "Jawa Tengah", "Indonesia"]
    result = {}
    for w in wilayah:
        w_id = KodeWilayah.query.filter_by(nama=w).first().id
        data = DataKemiskinan.query.filter(
            DataKemiskinan.wilayah_id == w_id,
            DataKemiskinan.tahun.in_(tahun_list)
        ).order_by(DataKemiskinan.tahun.asc()).all()
        result[w] = [{"tahun": d.tahun, "persentase": d.persentase_penduduk_miskin} for d in data]
    return jsonify(result)

@main.route("/api/tegal_kabupaten")
def tegal_kabupaten():
    tahun_list = tahun_range()
    wilayah = ["Kota Tegal","Kabupaten Tegal","Kabupaten Brebes","Kabupaten Pemalang"]
    result = {}
    for w in wilayah:
        w_id = KodeWilayah.query.filter_by(nama=w).first().id
        data = DataKemiskinan.query.filter(
            DataKemiskinan.wilayah_id == w_id,
            DataKemiskinan.tahun.in_(tahun_list)
        ).order_by(DataKemiskinan.tahun.asc()).all()
        result[w] = [{"tahun": d.tahun, "persentase": d.persentase_penduduk_miskin} for d in data]
    return jsonify(result)

@main.route("/api/tegal_kota_lain")
def tegal_kota_lain():
    tahun_list = tahun_range()
    wilayah = ["Kota Tegal","Kota Magelang","Kota Surakarta","Kota Salatiga","Kota Semarang","Kota Pekalongan"]
    result = {}
    for w in wilayah:
        w_id = KodeWilayah.query.filter_by(nama=w).first().id
        data = DataKemiskinan.query.filter(
            DataKemiskinan.wilayah_id == w_id,
            DataKemiskinan.tahun.in_(tahun_list)
        ).order_by(DataKemiskinan.tahun.asc()).all()
        result[w] = [{"tahun": d.tahun, "persentase": d.persentase_penduduk_miskin} for d in data]
    return jsonify(result)

@main.route("/api/kedalaman_keparahan_gini")
def kedalaman_keparahan_gini():
    tahun_list = tahun_range()
    kota_tegal = KodeWilayah.query.filter_by(nama="Kota Tegal").first()
    data = DataKemiskinan.query.filter(
        DataKemiskinan.wilayah_id == kota_tegal.id,
        DataKemiskinan.tahun.in_(tahun_list)
    ).order_by(DataKemiskinan.tahun.asc()).all()
    result = [
        {
            "tahun": d.tahun,
            "kedalaman": d.kedalaman,
            "keparahan": d.keparahan,
            "indeks_gini": d.indeks_gini
        } for d in data
    ]
    return jsonify(result)

@main.route("/api/garis_kemiskinan")
def garis_kemiskinan():
    tahun_list = tahun_range()
    kota_tegal = KodeWilayah.query.filter_by(nama="Kota Tegal").first()
    data = DataKemiskinan.query.filter(
        DataKemiskinan.wilayah_id == kota_tegal.id,
        DataKemiskinan.tahun.in_(tahun_list)
    ).order_by(DataKemiskinan.tahun.asc()).all()
    result = [
        {
            "tahun": d.tahun,
            "garis_kemiskinan": d.garis_kemiskinan
        } for d in data
    ]
    return jsonify(result)

@main.route("/api/tegal_table")
def tegal_table():
    tahun_list = tahun_range()
    kota_tegal = KodeWilayah.query.filter_by(nama="Kota Tegal").first()
    data = DataKemiskinan.query.filter(
        DataKemiskinan.wilayah_id == kota_tegal.id,
        DataKemiskinan.tahun.in_(tahun_list)
    ).order_by(DataKemiskinan.tahun.asc()).all()

    result = [
        {
            "tahun": d.tahun,
            "target_min": d.target_min,
            "target_max": d.target_maks,
            "capaian": d.persentase_penduduk_miskin,
            "jumlah_kemiskinan": d.jumlah_penduduk_miskin, 
            "garis_kemiskinan": d.garis_kemiskinan,
            "kedalaman": d.kedalaman,
            "keparahan": d.keparahan,
            "indeks_gini": d.indeks_gini
        } for d in data
    ]
    return jsonify(result)

@main.route("/api/capaian_kemiskinan")
def capaian_kemiskinan():
    tahun_list = tahun_range()
    wilayah_list = [
        "Indonesia", "Jawa Tengah",
        "Kabupaten Tegal", "Kabupaten Brebes", "Kabupaten Pemalang",
        "Kota Tegal", "Kota Magelang", "Kota Surakarta",
        "Kota Salatiga", "Kota Semarang", "Kota Pekalongan"
    ]

    results = []
    for nama in wilayah_list:
        wilayah = KodeWilayah.query.filter_by(nama=nama).first()
        if wilayah:
            data = DataKemiskinan.query.filter(
                DataKemiskinan.wilayah_id == wilayah.id,
                DataKemiskinan.tahun.in_(tahun_list)
            ).order_by(
                DataKemiskinan.tahun.asc(), 
                # DataKemiskinan.wilayah_id.asc()
            ).all()

            row = {"wilayah": nama}
            for d in data:
                row[str(d.tahun)] = d.persentase_penduduk_miskin
            results.append(row)

    return jsonify({
        "tahun": tahun_list,   # kirim daftar tahun
        "data": results        # kirim data pivot
    })


@main.route('/api/summary_strategi')
def summary_strategi():
    tahun = request.args.get("tahun")
    print("TAHUN: ", tahun)
    # latest_year = db.session.query(func.max(RealisasiTagging.tahun)).scalar()

    results = (
        db.session.query(
            KodeStrategi.strategi,
            func.count(TaggingSubKegiatan.id).label("jumlah_subkegiatan"),
            func.sum(TaggingSubKegiatan.anggaran).label("total_anggaran"),
            func.sum(RealisasiTagging.realisasi_anggaran).label("total_realisasi"),
            func.max(RealisasiTagging.periode).label("periode_terakhir"),
            RealisasiTagging.tahun.label("tahun")
        )
        .select_from(TaggingSubKegiatan)
        .join(KodeStrategi, TaggingSubKegiatan.strategi_id == KodeStrategi.id)
        .join(RealisasiTagging, RealisasiTagging.tagging_id == TaggingSubKegiatan.id)
        .filter(RealisasiTagging.tahun == tahun)
        .group_by(KodeStrategi.id, KodeStrategi.strategi, RealisasiTagging.tahun)
        .order_by(KodeStrategi.id.asc())
        .all()
    )
    output = []
    for r in results:
        output.append(
            {
                "strategi": r[0],
                "jumlah_subkegiatan": r[1],
                "total_anggaran": r[2],
                "total_realisasi": r[3],
                "periode_terakhir": r[4],
                "tahun": r[5]
            }
        )
    return jsonify(output)

@main.route('/api/rangkuman_strategi')
def rangkuman_strategi():
    tahun = request.args.get("tahun")
    # latest_year = db.session.query(func.max(RealisasiTagging.tahun)).scalar()

    results = (
        db.session.query(
            KodeStrategi.strategi,
            RealisasiTagging.periode,
            func.sum(RealisasiTagging.realisasi_anggaran).label("total_realisasi"),
            func.count(TaggingSubKegiatan.id).label("jumlah_subkegiatan"),
            func.sum(TaggingSubKegiatan.anggaran).label("total_anggaran")
        )
        .select_from(TaggingSubKegiatan)
        .join(KodeStrategi, TaggingSubKegiatan.strategi_id == KodeStrategi.id)
        .join(RealisasiTagging, RealisasiTagging.tagging_id == TaggingSubKegiatan.id)
        .filter(RealisasiTagging.tahun == tahun)
        .group_by(KodeStrategi.id, KodeStrategi.strategi, RealisasiTagging.periode)
        .order_by(KodeStrategi.id.asc(), RealisasiTagging.periode.asc())
        .all()
    )

    # regroup hasil per strategi
    data = {}
    for strategi, periode, total_realisasi, jumlah_sub, total_anggaran in results:
        if strategi not in data:
            data[strategi] = {
                "strategi": strategi,
                "jumlah_subkegiatan": jumlah_sub,
                "total_anggaran": total_anggaran,
                "realisasi": {1:0,2:0,3:0,4:0}
            }
        data[strategi]["realisasi"][periode] = total_realisasi

    # hitung persentase
    output = []
    for s in data.values():
        total_realisasi = sum(s["realisasi"].values())
        s["persentase_realisasi"] = round((total_realisasi / s["total_anggaran"])*100,2) if s["total_anggaran"] else 0
        output.append(s)

    return jsonify(output)

@main.route('/api/detail_subkegiatan')
def detail_subkegiatan():
    tahun = request.args.get("tahun")
    # latest_year = db.session.query(func.max(RealisasiTagging.tahun)).scalar()

    results = (
        db.session.query(
            KodeStrategi.strategi,
            KodeOPD.opd,
            KodeProgram.program,
            KodeKegiatan.kegiatan,
            KodeSubKegiatan.subkegiatan,
            TaggingSubKegiatan.anggaran,
            RealisasiTagging.periode,
            RealisasiTagging.realisasi_anggaran
        )
        .select_from(TaggingSubKegiatan)
        .join(KodeStrategi, TaggingSubKegiatan.strategi_id == KodeStrategi.id)
        .join(KodeOPD, TaggingSubKegiatan.opd_id == KodeOPD.id)
        .join(KodeProgram, TaggingSubKegiatan.program_id == KodeProgram.id)
        .join(KodeKegiatan, TaggingSubKegiatan.kegiatan_id == KodeKegiatan.id)
        .join(KodeSubKegiatan, TaggingSubKegiatan.subkegiatan_id == KodeSubKegiatan.id)
        .join(RealisasiTagging, RealisasiTagging.tagging_id == TaggingSubKegiatan.id)
        .filter(RealisasiTagging.tahun == tahun)
        .order_by(KodeStrategi.id.asc(), RealisasiTagging.periode.asc())
        .all()
    )

    # regroup per subkegiatan
    data = {}
    summary = {}
    for strategi, opd, program, kegiatan, subkegiatan, anggaran, periode, realisasi in results:
        key = (strategi, subkegiatan)
        if key not in data:
            data[key] = {
                "strategi": strategi,
                "opd": opd,
                "program": program,
                "kegiatan": kegiatan,
                "subkegiatan": subkegiatan,
                "anggaran": anggaran,
                "realisasi": {1:0,2:0,3:0,4:0},
                "total_realisasi": 0
            }
        data[key]["realisasi"][periode] += realisasi
        data[key]["total_realisasi"] += realisasi

        # summary per strategi
        if strategi not in summary:
            summary[strategi] = {
                "strategi": strategi,
                "jumlah_subkegiatan": 0,
                "total_anggaran": 0,
                "realisasi": {1:0,2:0,3:0,4:0}
            }
        summary[strategi]["jumlah_subkegiatan"] += 1
        summary[strategi]["total_anggaran"] += anggaran
        summary[strategi]["realisasi"][periode] += realisasi

    # hitung persentase
    for s in summary.values():
        total_realisasi = sum(s["realisasi"].values())
        s["persentase_realisasi"] = round((total_realisasi / s["total_anggaran"])*100,2) if s["total_anggaran"] else 0

    return jsonify({
        "detail": list(data.values()),
        "summary": list(summary.values())
    })

@main.route('/api/struktur_tkpk')
def get_struktur_tkpk():
    data = StrukturTkpk.query.all()
    result = []
    for row in data:
        result.append({
            "id": row.id,
            "jabatan": row.jabatan,
            "dalam_tim": row.dalam_tim,
            "keterangan": row.keterangan
        })
    return jsonify(result)

@main.route("/api/data_pendukung")
def list_data_pendukung():
    rows = DataPendukung.query.order_by(DataPendukung.rilis.desc()).all()
    result = [
        {
            "id": r.id,
            "nama": r.nama,
            "keterangan": r.keterangan,
            "rilis": datetime.fromtimestamp(r.rilis).strftime("%Y-%m-%d"),
            "tautan": r.tautan
        }
        for r in rows
    ]
    return jsonify(result)

@main.route("/api/data_pendukung", methods=["POST"])
def add_data_pendukung():
    nama = request.form.get("nama")
    keterangan = request.form.get("keterangan")
    rilis = request.form.get("rilis")
    tautan = None

    if "file" in request.files and request.files["file"].filename != "":
        file = request.files["file"]
        filename = file.filename
        _, ext = os.path.splitext(filename)

        now_str = datetime.now().strftime("%Y%m%d")
        kode = f"{now_str}{rilis.replace('-', '')}"

        save_name = f"{kode}{ext}"
        file.save(os.path.join(UPLOAD_FOLDER, save_name))
        tautan = f"/api/download/{save_name}"
    else:
        tautan = request.form.get("tautan")

    # simpan ke DB
    dok = DataPendukung(
        nama=nama,
        keterangan=keterangan,
        rilis=int(time.mktime(time.strptime(rilis, "%Y-%m-%d"))),  # simpan sebagai unix timestamp
        tautan=tautan
    )
    db.session.add(dok)
    db.session.commit()

    return jsonify({"message": "Data berhasil ditambahkan", "id": dok.id})

@main.route("/api/download/<path:filename>")
def download_file(filename):
    dok = DataPendukung.query.filter(DataPendukung.tautan.contains(filename)).first()
    if not dok:
        abort(404)

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        abort(404)

    # gunakan kolom nama sebagai nama file download
    return send_file(
        file_path,
        as_attachment=True,
        download_name=f"{dok.nama}{os.path.splitext(filename)[1]}"
    )