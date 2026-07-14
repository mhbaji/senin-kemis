from flask import Blueprint, jsonify, request
from sqlalchemy import func
from ..models import *

strategy = Blueprint('strategy', __name__)

@strategy.route('/api/summary_strategi')
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

@strategy.route('/api/rangkuman_strategi')
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

@strategy.route('/api/detail_subkegiatan')
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

@strategy.route('/api/struktur_tkpk')
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