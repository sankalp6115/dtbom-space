        let pdfDocs = [];
        let logoImg = null;
        let watermarkedDocs = [];
        let currentPDFIndex = 0;
        let currentPage = 1;
        let totalPages = 0;

        function toggleDarkMode() {
            const isDark = document.getElementById("darkMode").checked;
            document.body.classList.toggle('dark', isDark);
            localStorage.setItem('darkModeEnabled', isDark);
        }

        // Apply saved preference on page load
        window.addEventListener('DOMContentLoaded', () => {
            const isDark = localStorage.getItem('darkModeEnabled') === 'true';
            document.getElementById("darkMode").checked = isDark;
            document.body.classList.toggle('dark', isDark);
        });

        const toggle = document.getElementById("darkMode");
        

        document.getElementById('logoFile').addEventListener('change', function() {
            document.getElementById('customLogo').classList.toggle('hidden', this.value !== 'upload');
        });

        document.getElementById('pdfFiles').addEventListener('change', function() {
            updatePDFTiles();
        });

        async function loadPDFs(files) {
            pdfDocs = [];
            watermarkedDocs = [];
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                pdfDocs.push({ file, doc: pdfDoc });
            }
            totalPages = pdfDocs.length > 0 ? pdfDocs[0].doc.getPageCount() : 0;
            updatePDFTiles();
            updateNavigation();
        }

        function updatePDFTiles() {
            const pdfTiles = document.getElementById('pdfTiles');
            pdfTiles.innerHTML = '';
            pdfDocs.forEach((pdf, index) => {
                const tile = document.createElement('div');
                tile.className = `pdf-tile ${index === currentPDFIndex ? 'active' : ''}`;
                tile.textContent = pdf.file.name;
                tile.onclick = () => switchPDF(index);
                pdfTiles.appendChild(tile);
            });
        }

        async function switchPDF(index) {
            currentPDFIndex = index;
            currentPage = 1;
            if (watermarkedDocs[currentPDFIndex]) {
                totalPages = watermarkedDocs[currentPDFIndex].doc.getPageCount();
                await renderPage(currentPage);
            }
            updatePDFTiles();
            updateNavigation();
        }

        async function loadLogo(pdfDoc) {
            const logoSelect = document.getElementById('logoFile').value;
            let arrayBuffer;
            if (logoSelect === 'upload') {
                const file = document.getElementById('customLogo').files[0];
                if (!file) throw new Error('No custom logo uploaded');
                arrayBuffer = await file.arrayBuffer();
                logoImg = file.type === 'image/png' ? await pdfDoc.embedPng(arrayBuffer) : await pdfDoc.embedJpg(arrayBuffer);
            } else {
                const response = await fetch(logoSelect, { mode: 'cors' });
                arrayBuffer = await response.arrayBuffer();
                logoImg = await pdfDoc.embedPng(arrayBuffer);
            }
        }

        function calculatePosition(page, logoDims, position) {
            const { width, height } = page.getSize();
            let x, y;
            if (position === 'center') {
                x = (width - logoDims.width) / 2;
                y = (height - logoDims.height) / 2;
            } else if (position === 'top-right') {
                x = width - logoDims.width - 20;
                y = height - logoDims.height - 20;
            } else if (position === 'bottom-left') {
                x = 20;
                y = 20;
            }
            return { x, y };
        }

        async function renderPage(pageNum) {
            if (!watermarkedDocs[currentPDFIndex]) return;
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            const pdfBytes = await watermarkedDocs[currentPDFIndex].doc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const pdf = await pdfjsLib.getDocument(url).promise;
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.0 });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            URL.revokeObjectURL(url);
            document.getElementById('pageInfo').textContent = `Page ${pageNum} of ${totalPages}`;
        }

        function updateNavigation() {
            document.getElementById('prevPage').disabled = currentPage === 1;
            document.getElementById('nextPage').disabled = currentPage === totalPages;
            document.getElementById('downloadBtn').disabled = watermarkedDocs.length === 0;
        }

        async function applyWatermark() {
            const pdfFiles = document.getElementById('pdfFiles').files;
            const logoSelect = document.getElementById('logoFile').value;
            const position = document.getElementById('position').value;
            const scale = parseFloat(document.getElementById('scale').value);
            const opacity = parseFloat(document.getElementById('opacity').value);

            if (!pdfFiles.length || (logoSelect === 'upload' && !document.getElementById('customLogo').files[0])) {
                alert('Please upload at least one PDF and select or upload a logo.');
                return;
            }

            await loadPDFs(pdfFiles);
            watermarkedDocs = [];

            for (const pdf of pdfDocs) {
                await loadLogo(pdf.doc); // Load logo for each PDF
                const watermarkedDoc = await PDFLib.PDFDocument.load(await pdf.doc.save());
                for (const page of watermarkedDoc.getPages()) {
                    const logoDims = logoImg.scale(scale);
                    const { x, y } = calculatePosition(page, logoDims, position);
                    const rotation = page.getRotation().angle;
                    page.setRotation({ angle: 0, type: 'degrees' }); // Temporarily reset page rotation
                    page.drawImage(logoImg, { 
                        x, 
                        y, 
                        width: logoDims.width, 
                        height: logoDims.height, 
                        opacity,
                        rotate: { angle: -rotation, type: 'degrees' } // Counteract page rotation
                    });
                    page.setRotation({ angle: rotation, type: 'degrees' }); // Restore original rotation
                }
                watermarkedDocs.push({ file: pdf.file, doc: watermarkedDoc });
            }

            currentPDFIndex = 0;
            currentPage = 1;
            totalPages = watermarkedDocs[0]?.doc.getPageCount() || 0;
            await renderPage(currentPage);
            updatePDFTiles();
            updateNavigation();
        }

        async function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                await renderPage(currentPage);
                updateNavigation();
            }
        }

        async function nextPage() {
            if (currentPage < totalPages) {
                currentPage++;
                await renderPage(currentPage);
                updateNavigation();
            }
        }

        async function downloadPDF() {
            if (!watermarkedDocs.length) return;
            for (const watermarked of watermarkedDocs) {
                const pdfBytes = await watermarked.doc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `watermarked_${watermarked.file.name}`;
                link.click();
                URL.revokeObjectURL(link.href);
            }
        }
        document.addEventListener("contextmenu", (e) => {e.preventDefault()});
        document.addEventListener("keydown", (e) => {
            if(
                (e.key === "F12") ||
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || 
                (e.ctrlKey && ['s','u','p'].includes(e.key.toLowerCase()))
            )
            {
                e.preventDefault();
            }
        });