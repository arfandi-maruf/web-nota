// URL Web App dari Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby326K5EOFsm48lHj0VGfI-f1DdDGYifu9W-_Bfvl8MpoINQnmxRCVK0Bo3-vHVu3mA/exec";

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

    if (drumInput && hargaInput) {
        drumInput.addEventListener('input', calculatePreview);
        hargaInput.addEventListener('input', calculatePreview);
    }

    // Bersihkan isi tabel saat awal dibuka
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada data. Silakan isi form di atas.</td></tr>';
    }
});

// Kirim data baru ke Google Sheets & Tambahkan Langsung ke Tabel
const entryForm = document.getElementById('entryForm');
if (entryForm) {
    entryForm.addEventListener('submit', function(e) {
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

        // 1. TAMBAHKAN BARIS SECARA LANGSUNG KE TABEL DI LAYAR
        const tableBody = document.getElementById('tableBody');
        if (tableBody.innerHTML.includes('Belum ada data') || tableBody.innerHTML.includes('Gagal memuat')) {
            tableBody.innerHTML = '';
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="cell-input" value="${tanggal}"></td>
            <td><input type="text" class="cell-input" value="${supir}"></td>
            <td><input type="text" class="cell-input" value="${mobil}"></td>
            <td><input type="number" class="cell-input cell-number cell-drum" value="${drum}" oninput="updateRowTotal(this)"></td>
            <td><input type="number" class="cell-input cell-number cell-harga" value="${harga}" oninput="updateRowTotal(this)"></td>
            <td class="cell-total">${formatRupiah(total)}</td>
            <td class="cell-action no-print"><button class="btn-delete" onclick="deleteRow(this)">✕</button></td>
        `;
        tableBody.appendChild(newRow);
        calculateGrandTotal();

        // 2. KIRIM DATA KE GOOGLE SHEETS
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
            alert('Data berhasil ditambahkan dan tersimpan ke Google Sheets!');
            this.reset();
            document.getElementById('totalPreview').value = 'Rp 0';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Tambah ke Tabel';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Data tampil di tabel, namun gagal terhubung ke Google Sheets.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Tambah ke Tabel';
        });
    });
}

// Update total baris ketika input di dalam tabel diubah
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
    if (!tableBody) return;

    if (tableBody.innerHTML.includes('Belum ada data') || tableBody.innerHTML.includes('Gagal memuat')) {
        tableBody.innerHTML = '';
    }

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
    let validRowsCount = 0;

    rows.forEach(row => {
        const drumInput = row.querySelector('.cell-drum');
        const hargaInput = row.querySelector('.cell-harga');

        if (drumInput && hargaInput) {
            const drumVal = parseFloat(drumInput.value) || 0;
            const hargaVal = parseFloat(hargaInput.value) || 0;
            totalDrum += drumVal;
            totalHarga += (drumVal * hargaVal);
            validRowsCount++;
        }
    });

    const drumElem = document.getElementById('grandTotalDrum');
    const hargaElem = document.getElementById('grandTotalHarga');
    const countElem = document.getElementById('rowCount');

    if (drumElem) drumElem.textContent = totalDrum.toLocaleString('id-ID');
    if (hargaElem) hargaElem.textContent = formatRupiah(totalHarga);
    if (countElem) countElem.textContent = `${validRowsCount} Data`;
}

// FUNGSI UNDUH PDF
function downloadPDF() {
    if (typeof html2pdf === 'undefined') {
        alert('Sistem PDF belum siap. Silakan refresh halaman.');
        return;
    }

    const element = document.getElementById('pdfArea');
    if (!element) return;

    const btn = document.querySelector('.btn-pdf');
    if (btn) btn.textContent = 'Memproses PDF...';

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Nota_Pengiriman_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (btn) btn.textContent = '📄 Unduh PDF Nota';
    }).catch(err => {
        console.error('Error PDF:', err);
        alert('Gagal mengunduh PDF.');
        if (btn) btn.textContent = '📄 Unduh PDF Nota';
    });
}
