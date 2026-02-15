/**
 * CAMP HANDLER - Manages the listing and creation of vaccination camps
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('campsContainer');
    if (!container) return;

    let csvData = [];
    try {
        const rawCsvData = await getExcelData('Camps.csv');
        // NORMALIZATION: Clean headers to remove hidden spaces or case issues
        csvData = rawCsvData.map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
                cleanRow[key.trim()] = row[key];
            });
            return cleanRow;
        });
    } catch (error) {
        console.error("Could not load CSV data:", error);
    }
    
    const localData = JSON.parse(localStorage.getItem('myCamps') || '[]');
    const allCamps = [...localData, ...csvData];

    container.innerHTML = '';

    if (allCamps.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 text-muted">No camps found.</div>';
        return;
    }

    allCamps.forEach((camp, index) => {
        const isLocal = index < localData.length;
        const div = document.createElement('div');
        div.className = 'col-md-6 col-lg-4 mb-4';

        // Safe property access
        const timing = camp.Timing || camp['Timing'] || 'Timing Not Specified';
        const location = camp.Location || camp['Location'] || 'Location Not Specified';
        const conducting = camp['Who is conducting'] || 'Organization N/A';

        div.innerHTML = `
            <div class="camp-card h-100 shadow-sm border-0 p-4" 
                 style="cursor: pointer;"
                 onclick="location.href='camp-details.html?id=${index}&local=${isLocal}'">
                
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                        <i class="bi bi-calendar3 me-1"></i> ${camp.Date || 'No Date'}
                    </span>
                    ${isLocal ? '<span class="badge bg-warning text-dark">User Added</span>' : '<span class="badge bg-light text-muted border">Official</span>'}
                </div>
                
                <h4 class="fw-bold mb-2 text-dark">${camp.Title || 'Untitled Camp'}</h4>
                
                <div class="d-flex align-items-center text-muted mb-2">
                    <i class="bi bi-geo-alt me-2 text-danger"></i>
                    <span class="small">${location}</span>
                </div>

                <div class="d-flex align-items-center text-muted mb-3">
                    <i class="bi bi-clock me-2 text-info"></i>
                    <span class="small">${timing}</span>
                </div>

                <div class="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <div>
                        <p class="text-uppercase mb-0 text-muted fw-bold" style="font-size: 0.65rem;">Organized By</p>
                        <p class="mb-0 small fw-semibold text-primary">${conducting}</p>
                    </div>
                    <i class="bi bi-arrow-right-circle fs-4 text-primary opacity-50"></i>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
});

function saveCamp() {
    const title = document.getElementById('cTitle').value.trim();
    const date = document.getElementById('cDate').value;
    const location = document.getElementById('cLoc').value.trim();
    const by = document.getElementById('cBy').value.trim();

    if (!title || !date || !location || !by) {
        alert('Please fill all required fields.');
        return;
    }

    // Mapping exactly to CSV headers for consistency
    const newCamp = {
        "Title": title,
        "Date": date,
        "Location": location,
        "Who is conducting": by,
        "Who are coming": "Staff Assigned",
        "Purpose": "General Vaccination",
        "Timing": "9 AM - 5 PM",
        "Age": "All Ages",
        "Contact Number": "N/A"
    };

    const current = JSON.parse(localStorage.getItem('myCamps') || '[]');
    current.unshift(newCamp);
    localStorage.setItem('myCamps', JSON.stringify(current));
    location.reload();
}