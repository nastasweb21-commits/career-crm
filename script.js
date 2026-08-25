// DATA MANAGEMENT
let allCompanies = [];
let filteredCompanies = [];
let currentSort = 'priority';

// LOAD DATA
async function loadData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    allCompanies = data.companies;
    
    // Load saved status from localStorage
    loadSavedStatus();
    
    // Initial render
    filteredCompanies = [...allCompanies];
    renderCompanies();
    updateStats();
    updateCounters();
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('companies-container').innerHTML = 
      '<p style="color: red; padding: 2rem;">Error loading data. Check if data.json is present.</p>';
  }
}

// SAVE STATUS TO LOCALSTORAGE
function saveStatus(companyId, status) {
  const saved = JSON.parse(localStorage.getItem('companyStatus') || '{}');
  saved[companyId] = status;
  localStorage.setItem('companyStatus', JSON.stringify(saved));
  
  const company = allCompanies.find(c => c.id === companyId);
  if (company) {
    company.outreach_status = status;
  }
}

// LOAD SAVED STATUS
function loadSavedStatus() {
  const saved = JSON.parse(localStorage.getItem('companyStatus') || '{}');
  Object.keys(saved).forEach(id => {
    const company = allCompanies.find(c => c.id === parseInt(id));
    if (company) {
      company.outreach_status = saved[id];
    }
  });
}

// RENDER COMPANIES
function renderCompanies() {
  const container = document.getElementById('companies-container');
  
  if (filteredCompanies.length === 0) {
    container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 2rem;">No companies found.</p>';
    return;
  }

  container.innerHTML = filteredCompanies.map(company => {
    const scores = company.scores;
    return `
      <div class="company-card priority-${company.priority.toLowerCase()}" onclick="toggleCard(this)">
        <!-- HEADER (ALWAYS VISIBLE) -->
        <div class="card-header">
          <div class="company-header-left">
            <div class="priority-badge ${company.priority.toLowerCase()}">${company.priority}</div>
            <div class="company-title-info">
              <h3>${company.website ? `<a href="${company.website}" target="_blank">${company.name}</a>` : company.name}</h3>
              <p class="company-type">${company.type}</p>
            </div>
          </div>
          <div class="score-pill">
            <div class="score-pill-value">${company.total_score}</div>
            <div class="score-pill-label">Score</div>
          </div>
          <div class="toggle-icon">▼</div>
        </div>

        <!-- CONTENT (ACCORDION) -->
        <div class="card-content">
          <div class="card-body">
            <!-- META BADGES -->
            <div class="company-meta">
              <span class="meta-badge size">📊 ${company.size}</span>
              <span class="meta-badge format">📍 ${company.format}</span>
              ${company.vacancy_status === 'Open' ? '<span class="meta-badge vacancy-open">✓ Open</span>' : '<span class="meta-badge vacancy-closed">✗ Closed</span>'}
              ${company.english_requirement ? `<span class="meta-badge">🌐 ${company.english_requirement}</span>` : ''}
            </div>

            <!-- LINKS -->
            ${(() => {
              let links = [];
              if (company.website) links.push(`<a href="${company.website}" target="_blank" class="link-btn">🌐 Website</a>`);
              if (company.linkedin) links.push(`<a href="${company.linkedin}" target="_blank" class="link-btn">💼 LinkedIn</a>`);
              if (company.instagram) links.push(`<a href="${company.instagram}" target="_blank" class="link-btn">📸 Instagram</a>`);
              return links.length ? `<div class="links-section">${links.join('')}</div>` : '';
            })()}

            <!-- PRODUCTS -->
            ${company.products ? `
              <div class="detail-block">
                <div class="detail-label">📦 Products</div>
                <div class="detail-content">${company.products}</div>
              </div>
            ` : ''}

            <!-- DIFFERENTIATION -->
            ${company.differentiation ? `
              <div class="detail-block">
                <div class="detail-label">⭐ What's Different</div>
                <div class="detail-content">${company.differentiation}</div>
              </div>
            ` : ''}

            <!-- PRIORITIES -->
            ${company.company_priorities ? `
              <div class="detail-block">
                <div class="detail-label">🎯 Company Priorities</div>
                <div class="detail-content">${company.company_priorities}</div>
              </div>
            ` : ''}

            <!-- TOOLS -->
            ${company.tools_used ? `
              <div class="detail-block">
                <div class="detail-label">🛠️ Tools & Tech</div>
                <div class="detail-content">${company.tools_used}</div>
              </div>
            ` : ''}

            <!-- SCORES -->
            <div class="scores-grid">
              <div class="score-item">
                <div class="score-item-label">Product Fit</div>
                <div class="score-item-value">${scores.product_fit}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.product_fit * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">UX Maturity</div>
                <div class="score-item-value">${scores.ux_maturity}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.ux_maturity * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">Learning</div>
                <div class="score-item-value">${scores.learning_potential}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.learning_potential * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">Mentorship</div>
                <div class="score-item-value">${scores.mentorship_potential}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.mentorship_potential * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">Culture</div>
                <div class="score-item-value">${scores.culture_fit}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.culture_fit * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">Entry Difficulty</div>
                <div class="score-item-value">${scores.entry_difficulty}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.entry_difficulty * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">Portfolio Value</div>
                <div class="score-item-value">${scores.portfolio_value}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.portfolio_value * 10}%;"></div>
                </div>
              </div>
              
              <div class="score-item">
                <div class="score-item-label">Growth</div>
                <div class="score-item-value">${scores.growth_potential}/10</div>
                <div class="score-item-bar">
                  <div class="score-item-bar-fill" style="width: ${scores.growth_potential * 10}%;"></div>
                </div>
              </div>
            </div>

            <!-- CONTACT INFO -->
            ${company.target_contact ? `
              <div class="detail-block">
                <div class="detail-label">👤 Target Contact</div>
                <div class="detail-content">${company.target_contact}</div>
              </div>
            ` : ''}

            <!-- NOTES -->
            ${company.notes ? `
              <div class="detail-block">
                <div class="detail-label">📝 Notes</div>
                <div class="detail-content">${company.notes}</div>
              </div>
            ` : ''}

            <!-- STATUS SELECT -->
            <div class="status-section">
              <select class="select-status" onchange="handleStatusChange(${company.id}, this.value)" data-company-id="${company.id}">
                <option value="Not contacted" ${company.outreach_status === 'Not contacted' ? 'selected' : ''}>Not contacted</option>
                <option value="Sent" ${company.outreach_status === 'Sent' ? 'selected' : ''}>Message Sent</option>
                <option value="Replied" ${company.outreach_status === 'Replied' ? 'selected' : ''}>Replied ✓</option>
                <option value="Interview" ${company.outreach_status === 'Interview' ? 'selected' : ''}>Interview 📞</option>
                <option value="Trial" ${company.outreach_status === 'Trial' ? 'selected' : ''}>Trial 🧪</option>
                <option value="Offer" ${company.outreach_status === 'Offer' ? 'selected' : ''}>Offer 🎉</option>
                <option value="Rejected" ${company.outreach_status === 'Rejected' ? 'selected' : ''}>Rejected ✗</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// TOGGLE ACCORDION
function toggleCard(element) {
  element.classList.toggle('open');
}

// HANDLE STATUS CHANGE
function handleStatusChange(companyId, status) {
  saveStatus(companyId, status);
  updateStats();
}

// UPDATE STATISTICS
function updateStats() {
  const stats = {
    contacted: allCompanies.filter(c => c.outreach_status !== 'Not contacted').length,
    replied: allCompanies.filter(c => c.outreach_status === 'Replied').length,
    interviews: allCompanies.filter(c => c.outreach_status === 'Interview').length,
    trials: allCompanies.filter(c => c.outreach_status === 'Trial').length,
  };

  document.getElementById('stat-contacted').textContent = stats.contacted;
  document.getElementById('stat-replied').textContent = stats.replied;
  document.getElementById('stat-interviews').textContent = stats.interviews;
  document.getElementById('stat-trials').textContent = stats.trials;
}

// UPDATE COUNTERS
function updateCounters() {
  const aCount = allCompanies.filter(c => c.priority === 'A').length;
  const bCount = allCompanies.filter(c => c.priority === 'B').length;
  const cCount = allCompanies.filter(c => c.priority === 'C').length;

  document.getElementById('a-companies').textContent = aCount;
  document.getElementById('b-companies').textContent = bCount;
  document.getElementById('c-companies').textContent = cCount;
}

// FILTER COMPANIES
function filterCompanies() {
  const priority = document.getElementById('priority-filter').value;
  const format = document.getElementById('format-filter').value;
  const size = document.getElementById('size-filter').value;
  const search = document.getElementById('search-input').value.toLowerCase();

  filteredCompanies = allCompanies.filter(company => {
    const matchPriority = !priority || company.priority === priority;
    const matchFormat = !format || company.format === format;
    const matchSize = !size || company.size.includes(size);
    const matchSearch = !search || 
      company.name.toLowerCase().includes(search) || 
      company.type.toLowerCase().includes(search) ||
      (company.products && company.products.toLowerCase().includes(search));

    return matchPriority && matchFormat && matchSize && matchSearch;
  });

  applySort();
  renderCompanies();
}

// APPLY SORT
function applySort() {
  switch (currentSort) {
    case 'priority':
      filteredCompanies.sort((a, b) => {
        const priorityOrder = { 'A': 0, 'B': 1, 'C': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      break;
    case 'score':
      filteredCompanies.sort((a, b) => b.total_score - a.total_score);
      break;
    case 'name':
      filteredCompanies.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
}

// RESET FILTERS
function resetFilters() {
  document.getElementById('priority-filter').value = '';
  document.getElementById('format-filter').value = '';
  document.getElementById('size-filter').value = '';
  document.getElementById('search-input').value = '';
  
  filteredCompanies = [...allCompanies];
  applySort();
  renderCompanies();
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  document.getElementById('priority-filter').addEventListener('change', filterCompanies);
  document.getElementById('format-filter').addEventListener('change', filterCompanies);
  document.getElementById('size-filter').addEventListener('change', filterCompanies);
  document.getElementById('search-input').addEventListener('input', filterCompanies);

  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      currentSort = e.target.dataset.sort;
      applySort();
      renderCompanies();
    });
  });

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('last-updated').textContent = today;
});
