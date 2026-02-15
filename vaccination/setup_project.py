import os

def create_full_project():
    base_dir = "Vaccination_module"
    folders = ["css", "js", "data", "pages"]

    os.makedirs(base_dir, exist_ok=True)

    for folder in folders:
        os.makedirs(os.path.join(base_dir, folder), exist_ok=True)

    # ===============================
    # CSS
    # ===============================
    css_content = """@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lexend:wght@600;700&display=swap');

:root {
    --primary: #0EA5E9;
    --primary-dark: #0284c7;
    --medical-gradient: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
    --page-bg: linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%);
    --text-main: #0f172a;
    --card-shadow: 0 10px 30px -10px rgba(14, 165, 233, 0.15);
}

body {
    font-family: 'DM Sans', sans-serif;
    background: var(--page-bg);
    background-attachment: fixed;
    color: var(--text-main);
    min-height: 100vh;
}

h1, h2, h3, h4, h5, .brand-font {
    font-family: 'Lexend', sans-serif;
}

.card, .camp-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: var(--card-shadow);
    transition: transform 0.2s ease;
    cursor: pointer;
}

.card:hover, .camp-card:hover {
    transform: translateY(-5px);
}

.medical-header {
    background: var(--medical-gradient);
    color: white;
}

.sidebar {
    width: 85px;
    background: #FFFFFF;
    height: 100vh;
    border-right: 1px solid #E2E8F0;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 30px;
}
"""

    # ===============================
    # JS – EXCEL READER (FIXED)
    # ===============================
    js_reader = """async function getExcelData(fileName) {
    try {
        const path = window.location.pathname.includes('/pages/')
            ? '../data/' + fileName
            : 'data/' + fileName;

        const resp = await fetch(path);
        if (!resp.ok) throw new Error("File not found");

        const buf = await resp.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buf), { type: 'array' });

        return XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]]
        );

    } catch (e) {
        console.error(e);
        return [];
    }
}
"""

    # ===============================
    # JS – CAMP HANDLER (IMPROVED)
    # ===============================
    js_camps = """document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('campsContainer');
    if (!container) return;

    const csvData = await getExcelData('Camps.csv');
    const localData = JSON.parse(localStorage.getItem('myCamps') || '[]');

    const allCamps = [...localData, ...csvData];

    container.innerHTML = '';

    allCamps.forEach((camp, index) => {
        const isLocal = index < localData.length;

        const div = document.createElement('div');
        div.className = 'col-md-6 col-lg-4';

        div.innerHTML = `
            <div class="camp-card p-4 h-100"
                 onclick="location.href='camp-details.html?id=${index}&local=${isLocal}'">
                <span class="badge bg-light text-primary border border-primary mb-3">${camp.Date}</span>
                <h4 class="fw-bold mb-2 brand-font">${camp.Title}</h4>
                <p class="text-muted small">📍 ${camp.Location}</p>
                <div class="mt-3 pt-3 border-top">
                    <small class="fw-bold text-info">By: ${camp['Who is conducting']}</small>
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

    const newCamp = {
        Title: title,
        Date: date,
        Location: location,
        'Who is conducting': by,
        Purpose: 'Community Request',
        Timing: '9 AM - 5 PM',
        Age: 'All Ages',
        'Contact Number': 'N/A'
    };

    const current = JSON.parse(localStorage.getItem('myCamps') || '[]');
    current.unshift(newCamp);
    localStorage.setItem('myCamps', JSON.stringify(current));

    alert('Camp Added Successfully!');
    location.reload();
}
"""

    # ===============================
    # FILE GENERATION
    # ===============================
    files = {
        "css/main.css": css_content,
        "js/excel-reader.js": js_reader,
        "js/camp-handler.js": js_camps
    }

    for path, content in files.items():
        full_path = os.path.join(base_dir, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Generated: {full_path}")

    print("\n✅ PROJECT READY!")

if __name__ == "__main__":
    create_full_project()
