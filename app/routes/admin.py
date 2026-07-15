from datetime import datetime
import os
import time
from flask import Blueprint, abort, jsonify, render_template, request, send_file
from ..models import *

admin = Blueprint('admin', __name__)
UPLOAD_FOLDER = ""
def setting(SETTING:dict):
    global UPLOAD_FOLDER 
    UPLOAD_FOLDER = SETTING['UPLOAD_FOLDER']

@admin.route('/admin/upload-dokumen-pendukung')
def updokduk():
    return render_template('updok.html')

@admin.route("/admin/data_pendukung", methods=["POST"])
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
