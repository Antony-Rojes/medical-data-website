async function getExcelData(fileName) {
    try {
        const path = window.location.pathname.includes('/pages/')
            ? '../data/' + fileName
            : 'data/' + fileName;

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error("File not found");
        }

        const text = await response.text();

        // Simple CSV parser (NO XLSX dependency)
        const rows = text.split('\n').filter(r => r.trim() !== '');
        const headers = rows[0].split(',').map(h => h.replace(/"/g, ''));

        const data = rows.slice(1).map(row => {
            const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] ? values[i].replace(/"/g, '') : "";
            });
            return obj;
        });

        return data;

    } catch (error) {
        console.error("Error loading CSV:", error);
        return [];
    }
}
