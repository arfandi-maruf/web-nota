// URL Web App dari Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw83KxTJy0lcg8Pw-PcoKyqw5-B2m_9U49UDFFZbVwJDc7t6uRmP446xWb362LRn6y5qA/exec";

// Format angka ke Rupiah
function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}

// Inisialisasi awal saat halaman web dibuka
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

    // Ambil data dari Google Sheets
    loadDataFromGoogleSheets();
});

// Kirim data baru ke Google Sheets
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
        loadDataFromGoogleSheets();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Gagal menyimpan data.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tambah ke Tabel';
    });
});

// Fungsi untuk mengambil data dari Google Sheets
function loadDataFromGoogleSheets() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Memuat data dari Google Sheets...</td></tr>';

    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            
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
                    <td><input type="number" class="cell-input cell-number cell-drum" value="${row[3] || 0}" oninput="updateRowTotal(this)"></td>
                    <td><input type="number" class="cell-input cell-number cell-harga" value="${row[4] || 0}" oninput="updateRowTotal(this)"></td>
                    <td class="cell-total">${formatRupiah(row[5] || 0)}</td>
                    <td class="cell-action no-print"><button class="btn-delete" onclick="deleteRow(this)">✕</button></td>
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

// Update total baris ketika input di dalam tabel diubah langsung
function updateRowTotal(element) {
    const row = element.closest('tr');
    const drumVal = parseFloat(row.querySelector('.cell-drum').value) || 0;
    const hargaVal = parseFloat(row.querySelector('.cell-harga').value) || 0;
    const totalCell = row.querySelector('.cell-total');

    totalCell.textContent = formatRupiah(drumVal * hargaVal);
    calculateGrandTotal();
}

// Tambah baris kosong baru di tabel
function addNewRow() {
    const tableBody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input type="text" class="cell-input" value="" placeholder="Tanggal"></td>
        <td><input type="text" class="cell-input" value="" placeholder="Supir"></td>
        <td><input type="text" class="cell-input" value="" placeholder="Mobil"></td>
        <td><input type="number" class="cell-input cell-number cell-drum" value="" placeholder="0" oninput="updateRowTotal(this)"></td>
        <td><input type="number" class="cell-input cell-number cell-harga" value="" placeholder="0" oninput="updateRowTotal(this)"></td>
        <td class="cell-total">Rp 0</td>
        <td class="cell-action no-print"><button class="btn-delete" onclick="deleteRow(this)">✕</button></td>
    `;

    tableBody.appendChild(newRow);
    calculateGrandTotal();
}

// Hapus baris dari tabel
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    calculateGrandTotal();
}

// Hitung Ulang Total Rekapitulasi (Drum & Total Harga)
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

// FUNGSI UTAMA: MENGUNDUH REKAP MENJADI FILE PDF
function downloadPDF() {
    const element = document.getElementById('pdfArea');
    const noPrintElements = element.querySelectorAll('.no-print');
    const titlePrint = element.querySelector('.pdf-title-print');

    // Sembunyikan kolom aksi sementara agar PDF rapi
    noPrintElements.forEach(el => el.style.display = 'none');
    if (titlePrint) titlePrint.style.display = 'block';

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Nota_Pengiriman_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Kembalikan tampilan semula setelah PDF selesai diunduh
        noPrintElements.forEach(el => el.style.display = '');
        if (titlePrint) titlePrint.style.display = 'none';
    });
}
