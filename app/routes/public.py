from datetime import datetime
import os
from flask import Blueprint, abort, jsonify, render_template, send_file
from ..models import *

public = Blueprint('public', __name__)
UPLOAD_FOLDER = ""
def setting(SETTING:dict):
    global UPLOAD_FOLDER 
    UPLOAD_FOLDER = SETTING['UPLOAD_FOLDER']

@public.route('/')
def indeks():
    return render_template('indeks.html')

@public.route('/statistik')
def statistik():
    return render_template('statistik.html')

@public.route('/upaya')
def upaya():
    return render_template('upaya.html')

@public.route('/organisasi')
def organisasi():
    return render_template('organisasi.html')

@public.route('/kabar')
def kabar():
    return render_template('kabar.html')

@public.route('/dokumen-pendukung')
def dokduk():
    return render_template('dokduk.html')

@public.route("/api/data_pendukung")
def list_data_pendukung():
    rows = DataPendukung.query.order_by(DataPendukung.rilis.desc()).all()
    result = [
        {
            "id": r.id,
            "nama": r.nama,
            "keterangan": r.keterangan,
            "rilis": datetime.fromtimestamp(r.rilis).strftime("%Y-%m-%d"),
            "tautan": r.tautan,
            "instansi": r.instansi.nama if r.instansi else None
        }
        for r in rows
    ]
    return jsonify(result)

@public.route("/api/download/<path:filename>")
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

@public.route("/years")
def get_years():
    years = db.session.query(TaggingSubKegiatan.tahun).distinct().order_by(TaggingSubKegiatan.tahun).all()
    years = [y[0] for y in years]  # ambil nilai integer dari tuple
    return jsonify(years)