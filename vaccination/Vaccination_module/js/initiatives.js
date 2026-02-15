document.addEventListener('DOMContentLoaded', async () => {

    const container = document.getElementById('initContainer');
    if (!container) return;

    const rawData = await getExcelData('Initiatives.csv');

    const data = rawData.map(row => {
        const cleanRow = {};
        Object.keys(row).forEach(key => {
            cleanRow[key.trim()] = row[key];
        });
        return cleanRow;
    });

    container.innerHTML = '';

    data.forEach(item => {

        const initiative = item['Initiative'] || '';
        const status = item['Status'] || '';
        const target = item['Target Group'] || '';
        const details = item['Details'] || '';

        const badgeColor =
            status === 'Live' ? 'success' :
            status === 'Pilot Phase' ? 'warning' :
            status === 'Research' ? 'info' :
            'secondary';

        const div = document.createElement('div');
        div.className = 'col-12 mb-4';

        div.innerHTML = `
            <div class="initiative-card position-relative">

                <!-- Status Top Right -->
                <span class="badge bg-${badgeColor} status-badge">
                    ${status}
                </span>

                <h4 class="initiative-title mb-3">${initiative}</h4>

                <div class="target-section">
                    <strong>Who is this for?</strong> 
                    <span class="ms-2">${target}</span>
                </div>

                <div class="important-section mt-3">
                    <strong>Important</strong><br>
                    <p class="mb-0 mt-1">${details}</p>
                </div>

            </div>
        `;

        container.appendChild(div);
    });

});
