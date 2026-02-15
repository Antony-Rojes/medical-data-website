document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#scheduleTable tbody');
    if (!tableBody) return;

    const data = await getExcelData('MasterSchedule.csv');

    data.forEach(row => {
        const tr = document.createElement('tr');
        let ageGroup = row['Age Group'] || '';
        ageGroup = ageGroup.replace(/\((.*?)\)/, '<br><small class="text-muted">($1)</small>');

        const createCell = (vac) => {
            if (!vac || vac === '-') return '-';
            
            let alert = '';
            if (vac.includes('Hepatitis B') && ageGroup.includes('Birth')) {
                alert = '<br><span class="badge badge-alert" style="font-size:0.7em">Within 24h</span>';
            }
            
            return `
                <a href="vaccine-details.html?name=${encodeURIComponent(vac)}" 
                   style="color:var(--primary);font-weight:600;text-decoration:none">
                    ${vac}
                </a>${alert}
            `;
        };

        tr.innerHTML = `
            <td class="fw-bold">${ageGroup}</td>
            <td>${createCell(row['Vaccine 1'])}</td>
            <td>${createCell(row['Vaccine 2'])}</td>
            <td>${createCell(row['Vaccine 3'])}</td>
            <td>${createCell(row['Vaccine 4'])}</td>
            <td>${createCell(row['Vaccine 5'])}</td>
            <td>${row['Dose']}</td>
            <td>${row['Route']}</td>
            <td><span class="badge badge-mandatory">${row['Condition']}</span></td>
            <td class="small">${row['Remarks']}</td>
        `;
        
        tableBody.appendChild(tr);
    });
});