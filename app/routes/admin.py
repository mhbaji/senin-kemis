from flask import Blueprint, render_template

admin = Blueprint('admin', __name__)

@admin.route('/admin/upload-dokumen-pendukung')
def updokduk():
    return render_template('updok.html')
