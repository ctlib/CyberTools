const fileInput = document.getElementById('fileInput');
const viewerContainer = document.getElementById('viewerContainer');
const hexView = document.getElementById('hexView');
const spacer = document.getElementById('spacer');
const downloadBtn = document.getElementById('downloadBtn');

const BYTES_PER_LINE = 16;
let fileBytes = null;
let totalLines = 0;

let isSelecting = false;
let selectionStart = null;
let selectionEnd = null;

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    fileBytes = new Uint8Array(arrayBuffer);
    totalLines = Math.ceil(fileBytes.length / BYTES_PER_LINE);

    spacer.style.height = `${totalLines * 22}px`;
    render();
    viewerContainer.addEventListener('scroll', render);
    downloadBtn.disabled = false;
});

// Render Hex & ASCII
function render() {
    if (!fileBytes) return;

    const scrollTop = viewerContainer.scrollTop;
    const containerHeight = viewerContainer.clientHeight;

    const firstLine = Math.floor(scrollTop / 22);
    const visibleLines = Math.ceil(containerHeight / 22);

    const startLine = Math.max(0, firstLine - 20);
    const endLine = Math.min(totalLines, firstLine + visibleLines + 20);

    let output = '';
    for (let line = startLine; line < endLine; line++) {
        const offset = line * BYTES_PER_LINE;
        const bytes = fileBytes.slice(offset, offset + BYTES_PER_LINE);

        let hexCells = '';
        let asciiCells = '';

        bytes.forEach((b, i) => {
            const idx = offset + i;
            const hex = b.toString(16).padStart(2, '0');
            const ascii = b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';

            hexCells += `<span contenteditable="true" class="byte hex px-1 cursor-pointer" data-idx="${idx}">${hex}</span> `;
            asciiCells += `<span contenteditable="true" class="byte ascii px-1 cursor-pointer" data-idx="${idx}">${ascii}</span>`;
        });

        output += `
            <tr style="transform: translateY(${line * 22}px)">
                <td class="px-2 py-1 text-gray-500">${offset.toString(16).padStart(8, '0')}</td>
                <td class="px-2 py-1 whitespace-nowrap">${hexCells}</td>
                <td class="px-2 py-1">${asciiCells}</td>
            </tr>`;
    }

    hexView.innerHTML = output;
    attachEvents();
}

// Handle selection & editing
function attachEvents() {
    hexView.querySelectorAll('.byte').forEach((el) => {
        el.addEventListener('mousedown', (e) => {
            isSelecting = true;
            selectionStart = parseInt(el.dataset.idx);
            selectionEnd = selectionStart;
            updateSelection();
            e.preventDefault();
        });

        el.addEventListener('mouseenter', (e) => {
            if (isSelecting) {
                selectionEnd = parseInt(el.dataset.idx);
                updateSelection();
            }
        });

        el.addEventListener('input', (e) => {
            const idx = parseInt(el.dataset.idx);
            const val = el.innerText;

            if (el.classList.contains('hex')) {
                // Only allow 2 hex digits
                const clean = val.replace(/[^0-9a-fA-F]/g, '').slice(0, 2);
                el.innerText = clean;
                if (clean.length === 2) {
                    fileBytes[idx] = parseInt(clean, 16);
                    // Update ASCII
                    const asciiEl = document.querySelector(`.ascii[data-idx="${idx}"]`);
                    asciiEl.innerText = fileBytes[idx] >= 32 && fileBytes[idx] <= 126 ? String.fromCharCode(fileBytes[idx]) : '.';
                }
            } else if (el.classList.contains('ascii')) {
                const char = val.charAt(0) || '.';
                el.innerText = char;
                fileBytes[idx] = char === '.' ? fileBytes[idx] : char.charCodeAt(0);
                // Update Hex
                const hexEl = document.querySelector(`.hex[data-idx="${idx}"]`);
                hexEl.innerText = fileBytes[idx].toString(16).padStart(2, '0');
            }
        });
    });

    document.addEventListener('mouseup', () => (isSelecting = false));
}

function updateSelection() {
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    document.querySelectorAll('.byte').forEach((el) => el.classList.remove('bg-yellow-200', 'rounded'));

    for (let i = start; i <= end; i++) {
        document.querySelectorAll(`[data-idx="${i}"]`).forEach((el) => el.classList.add('bg-yellow-200', 'rounded'));
    }
}

// Download edited file
downloadBtn.addEventListener('click', () => {
    if (!fileBytes) return;
    const blob = new Blob([fileBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileInput.files[0].name;
    a.click();
    URL.revokeObjectURL(url);
});
