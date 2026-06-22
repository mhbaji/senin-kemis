from . import db

class KodeWilayah(db.Model):
    __tablename__ = 'kode_wilayah'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kode = db.Column(db.Integer, unique=True, nullable=False)  # kode resmi BPS
    nama = db.Column(db.String, nullable=False)
    jenis = db.Column(db.Integer, nullable=False)  # 0 = kabupaten, 1 = kota

    # relasi ke data_kemiskinan
    data_kemiskinan = db.relationship('DataKemiskinan', backref='kode_wilayah', lazy=True)


class DataKemiskinan(db.Model):
    __tablename__ = 'data_kemiskinan'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    wilayah_id = db.Column(db.Integer, db.ForeignKey('kode_wilayah.id'), nullable=False)  # foreign key ke id
    tahun = db.Column(db.Integer, nullable=False)
    garis_kemiskinan = db.Column(db.Float)
    jumlah_penduduk_miskin = db.Column(db.Float)  # ribu jiwa
    persentase_penduduk_miskin = db.Column(db.Float)
    peringkat = db.Column(db.Integer)
    target_min = db.Column(db.Float)
    target_maks = db.Column(db.Float)
    target_gini = db.Column(db.Float)
    indeks_gini = db.Column(db.Float)
    kedalaman = db.Column(db.Float)
    keparahan = db.Column(db.Float)
    persentase_kemiskinan_ekstrem = db.Column(db.Float)
    penduduk_kemiskinan_ekstrem = db.Column(db.Float)

# class KodeEksternal(db.Model):
#     __tablename__ = 'kode_eksternal'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     nama_eksternal = db.Column(db.String, nullable=False)

#     # relasi ke data_nasional_provinsi
#     data_nasional_provinsi = db.relationship(
#         'DataNasionalProvinsi',
#         backref='kode_eksternal',
#         lazy=True
#     )

# class DataNasionalProvinsi(db.Model):
#     __tablename__ = 'data_nasional_provinsi'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     eksternal_id = db.Column(db.Integer, db.ForeignKey('kode_eksternal.id'), nullable=False)
#     tahun = db.Column(db.Integer, nullable=False)
#     garis_kemiskinan = db.Column(db.Float)
#     jumlah_penduduk_miskin = db.Column(db.Float)  # ribu jiwa
#     persentase_penduduk_miskin = db.Column(db.Float)

class KodeStrategi(db.Model):
    __tablename__ = 'kode_strategi'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    strategi = db.Column(db.String, nullable=False)

    tagging = db.relationship('TaggingSubKegiatan', backref='kode_strategi', lazy=True)

class KodeOPD(db.Model):
    __tablename__ = 'kode_opd'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kode = db.Column(db.String, nullable=False)
    opd = db.Column(db.String, nullable=False)

class KodeBidang(db.Model):
    __tablename__ = 'kode_bidang'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kode = db.Column(db.String, nullable=False)
    bidang = db.Column(db.String, nullable=False)
    tahun = db.Column(db.Integer, nullable=False)

class KodeProgram(db.Model):
    __tablename__ = 'kode_program'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kode = db.Column(db.String, nullable=False)
    program = db.Column(db.String, nullable=False)
    bidang_id = db.Column(db.Integer, db.ForeignKey('kode_bidang.id'), nullable=False)
    tahun = db.Column(db.Integer, nullable=False)

class KodeKegiatan(db.Model):
    __tablename__ = 'kode_kegiatan'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kode = db.Column(db.String, nullable=False)
    kegiatan = db.Column(db.String, nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('kode_program.id'), nullable=False)
    tahun = db.Column(db.Integer, nullable=False)

class KodeSubKegiatan(db.Model):
    __tablename__ = 'kode_subkegiatan'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kode = db.Column(db.String, nullable=False)
    subkegiatan = db.Column(db.String, nullable=False)
    kegiatan_id = db.Column(db.Integer, db.ForeignKey('kode_kegiatan.id'), nullable=False)
    tahun = db.Column(db.Integer, nullable=False)

class TaggingSubKegiatan(db.Model):
    __tablename__ = 'tagging_subkegiatan'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    opd_id = db.Column(db.Integer, db.ForeignKey('kode_opd.id'), nullable=False)
    bidang_id = db.Column(db.Integer, db.ForeignKey('kode_bidang.id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('kode_program.id'), nullable=False)
    kegiatan_id = db.Column(db.Integer, db.ForeignKey('kode_kegiatan.id'), nullable=False)
    subkegiatan_id = db.Column(db.Integer, db.ForeignKey('kode_subkegiatan.id'), nullable=False)
    anggaran = db.Column(db.Integer, nullable=False)
    strategi_id = db.Column(db.Integer, db.ForeignKey('kode_strategi.id'), nullable=False)
    tahun = db.Column(db.Integer, nullable=False)

class RealisasiTagging(db.Model):
    __tablename__ = 'realisasi_tagging'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tagging_id = db.Column(db.Integer, db.ForeignKey('tagging_subkegiatan.id'), nullable=False)
    realisasi_anggaran = db.Column(db.Integer, nullable=False)
    periode = db.Column(db.Integer, nullable=False)  # triwulan (1–4)
    tahun = db.Column(db.Integer, nullable=False)

    tagging = db.relationship('TaggingSubKegiatan', backref='realisasi', lazy=True)

class StrukturTkpk(db.Model):
    __tablename__ = 'struktur_tkpk'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    atasan_id = db.Column(db.Integer, nullable=False)
    jabatan = db.Column(db.Integer, nullable=False)  # triwulan (1–4)
    dalam_tim = db.Column(db.Integer, nullable=False)
    keterangan = db.Column(db.String, nullable=True)
