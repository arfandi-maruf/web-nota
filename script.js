// Ganti URL di bawah ini dengan URL Web App dari Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8JKxTJyOlcg8Pw-PcoKyqw5-B2m_9U49UDfFZbVwJDc7t6uRmP446xWb362LRn6y5qA/exec";

// Format angka ke Rupiah
function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}

// Ambil data otomatis dari Google Sheets saat halaman web dibuka
document.addEventListener('DOMContentLoaded', () => {
    const drumInput = document.getElementById('drum');
    const hargaInput = document.getElementById('harga');
    const totalPreview = document.getElementById('totalPreview');

    function calculatePreview() {
        const drum = parseFloat(drumInput.value) || 0;
        const harga = parseFloat(hargaInput.value) || 0;
        totalPreview.value = formatRupiah(drum * harga);
    }

    drumInput.addEventListener('input', calculatePreview);
    hargaInput.addEventListener('input', calculatePreview);

    // Load data lama dari Google Sheets
    loadDataFromGoogleSheets();
});

// Fungsi untuk mengirim data baru ke Google Sheets
document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const tanggal = document.getElementById('tanggal').value;
    const supir = document.getElementById('supir').value;
    const mobil = document.getElementById('mobil').value;
    const drum = parseFloat(document.getElementById('drum').value) || 0;
    const harga = parseFloat(document.getElementById('harga').value) || 0;
    const total = drum * harga;

    const payload = {
        tanggal: tanggal,
        supir: supir,
        mobil: mobil,
        drum: drum,
        harga: harga,
        total: total
    };

    // Kirim data ke Google Sheets
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert('Data berhasil tersimpan ke Google Sheets!');
        this.reset();
        document.getElementById('totalPreview').value = 'Rp 0';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tambah ke Tabel';
        // Reload tabel
        loadDataFromGoogleSheets();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Gagal menyimpan data.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tambah ke Tabel';
    });
});

// Fungsi untuk mengambil dan menampilkan data dari Google Sheets
function loadDataFromGoogleSheets() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Memuat data dari Google Sheets...</td></tr>';

    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            
            // Lewati baris 0 (karena baris 0 adalah Header: Tanggal, Supir, dll)
            if (data.length <= 1) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada data tersimpan.</td></tr>';
                calculateGrandTotal();
                return;
            }

            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><input type="text" class="cell-input" value="${row[0] || ''}"></td>
                    <td><input type="text" class="cell-input" value="${row[1] || ''}"></td>
                    <td><input type="text" class="cell-input" value="${row[2] || ''}"></td>
                    <td><input type="number" class="cell-input cell-number cell-drum" value="${row[3] || 0}"></td>
                    <td><input type="number" class="cell-input cell-number cell-harga" value="${row[4] || 0}"></td>
                    <td class="cell-total">${formatRupiah(row[5] || 0)}</td>
                    <td class="cell-action">-</td>
                `;
                tableBody.appendChild(newRow);
            }
            calculateGrandTotal();
        })
        .catch(err => {
            console.error(err);
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Gagal memuat data dari server.</td></tr>';
        });
}

// Hitung Ulang Total Rekapitulasi
function calculateGrandTotal() {
    const rows = document.querySelectorAll('#tableBody tr');
    let totalDrum = 0;
    let totalHarga = 0;

    rows.forEach(row => {
        const drumInput = row.querySelector('.cell-drum');
        const hargaInput = row.querySelector('.cell-harga');

        if (drumInput && hargaInput) {
            const drumVal = parseFloat(drumInput.value) || 0;
            const hargaVal = parseFloat(hargaInput.value) || 0;
            totalDrum += drumVal;
            totalHarga += (drumVal * hargaVal);
        }
    });

    document.getElementById('grandTotalDrum').textContent = totalDrum.toLocaleString('id-ID');
    document.getElementById('grandTotalHarga').textContent = formatRupiah(totalHarga);
    document.getElementById('rowCount').textContent = `${rows.length} Data`;
}
