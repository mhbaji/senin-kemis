from flask import Blueprint, jsonify
from ..tools import tahun_range
from ..models import *

poverty = Blueprint('poverty', __name__)

@poverty.route("/api/target_vs_capaian")
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

@poverty.route("/api/tegal_jateng_indonesia")
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

@poverty.route("/api/tegal_kabupaten")
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

@poverty.route("/api/tegal_kota_lain")
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

@poverty.route("/api/kedalaman_keparahan_gini")
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

@poverty.route("/api/garis_kemiskinan")
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

@poverty.route("/api/tegal_table")
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

@poverty.route("/api/capaian_kemiskinan")
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