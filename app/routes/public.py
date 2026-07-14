from datetime import datetime
import os
from flask import Blueprint, jsonify, render_template
from ..models import *

public = Blueprint('public', __name__)
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
            "tautan": r.tautan
        }
        for r in rows
    ]
    return jsonify(result)

@public.route("/years")
def get_years():
    years = db.session.query(TaggingSubKegiatan.tahun).distinct().order_by(TaggingSubKegiatan.tahun).all()
    years = [y[0] for y in years]  # ambil nilai integer dari tuple
    return jsonify(years)