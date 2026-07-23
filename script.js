// Format angka ke Rupiah
function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}

// Inisialisasi perhitungan form atas saat diketik
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

    calculateGrandTotal();
});

// Tambah data dari form atas ke tabel
document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const tanggal = document.getElementById('tanggal').value;
    const supir = document.getElementById('supir').value;
    const mobil = document.getElementById('mobil').value;
    const drum = parseFloat(document.getElementById('drum').value) || 0;
    const harga = parseFloat(document.getElementById('harga').value) || 0;

    const tableBody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input type="text" class="cell-input" value="${tanggal}" onchange="calculateGrandTotal()"></td>
        <td><input type="text" class="cell-input" value="${supir}" onchange="calculateGrandTotal()"></td>
        <td><input type="text" class="cell-input" value="${mobil}" onchange="calculateGrandTotal()"></td>
        <td><input type="number" class="cell-input cell-number cell-drum" value="${drum}" oninput="updateRowTotal(this)"></td>
        <td><input type="number" class="cell-input cell-number cell-harga" value="${harga}" oninput="updateRowTotal(this)"></td>
        <td class="cell-total">${formatRupiah(drum * harga)}</td>
        <td class="cell-action"><button class="btn-delete" onclick="deleteRow(this)">✕</button></td>
    `;

    tableBody.appendChild(newRow);

    this.reset();
    document.getElementById('totalPreview').value = 'Rp 0';

    calculateGrandTotal();
});

// Update total baris ketika input Drum atau Harga di dalam tabel diubah langsung
function updateRowTotal(element) {
    const row = element.closest('tr');
    const drumVal = parseFloat(row.querySelector('.cell-drum').value) || 0;
    const hargaVal = parseFloat(row.querySelector('.cell-harga').value) || 0;
    const totalCell = row.querySelector('.cell-total');

    totalCell.textContent = formatRupiah(drumVal * hargaVal);

    calculateGrandTotal();
}

// Tambah baris kosong langsung di tabel
function addNewRow() {
    const tableBody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input type="text" class="cell-input" value="" placeholder="Tanggal" onchange="calculateGrandTotal()"></td>
        <td><input type="text" class="cell-input" value="" placeholder="Supir" onchange="calculateGrandTotal()"></td>
        <td><input type="text" class="cell-input" value="" placeholder="Mobil" onchange="calculateGrandTotal()"></td>
        <td><input type="number" class="cell-input cell-number cell-drum" value="" placeholder="0" oninput="updateRowTotal(this)"></td>
        <td><input type="number" class="cell-input cell-number cell-harga" value="" placeholder="0" oninput="updateRowTotal(this)"></td>
        <td class="cell-total">Rp 0</td>
        <td class="cell-action"><button class="btn-delete" onclick="deleteRow(this)">✕</button></td>
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

// Hitung ulang Total Keseluruhan (Total Drum & Total Harga)
function calculateGrandTotal() {
    const rows = document.querySelectorAll('#tableBody tr');
    let totalDrum = 0;
    let totalHarga = 0;

    rows.forEach(row => {
        const drumVal = parseFloat(row.querySelector('.cell-drum').value) || 0;
        const hargaVal = parseFloat(row.querySelector('.cell-harga').value) || 0;

        totalDrum += drumVal;
        totalHarga += (drumVal * hargaVal);
    });

    document.getElementById('grandTotalDrum').textContent = totalDrum.toLocaleString('id-ID');
    document.getElementById('grandTotalHarga').textContent = formatRupiah(totalHarga);
    document.getElementById('rowCount').textContent = `${rows.length} Data`;
}