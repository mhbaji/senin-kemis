from datetime import datetime

def tahun_range():
    tahun_sekarang = datetime.now().year
    list_tahun = list(range(tahun_sekarang-5, tahun_sekarang))
    list_tahun.sort(reverse=False)
    return list_tahun
