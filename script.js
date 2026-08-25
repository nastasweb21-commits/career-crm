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
      '<p style="color: red;">Error loading data. Make sure data.json is in the same folder.</p>';
  }
}

// SAVE STATUS TO LOCALSTORAGE
function saveStatus(companyId, status) {
  const saved = JSON.parse(localStorage.getItem('companyStatus') || '{}');
  saved[companyId] = status;
  localStorage.setItem('companyStatus', JSON.stringify(saved));
  
  // Update the company object
  const company = allCompanies.find(c => c.id === companyId);
  if (company) {
    company.outreach_status = status;
  }
}

// LOAD SAVED STATUS FROM LOCALSTORAGE
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
    container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No companies found matching your filters.</p>';
    return;
  }

  container.innerHTML = filteredCompanies.map(company => {
    const scores = company.scores;
    return `
      <div class="company-card priority-${company.priority.toLowerCase()}">
        <div class="company-header">
          <div class="company-title-block">
            <div class="company-priority ${company.priority.toLowerCase()}">${company.priority}</div>
            <div>
              <h2 class="company-name">
                ${company.url ? `<a href="${company.url}" target="_blank">${company.name}</a>` : company.name}
              </h2>
              <p class="company-type">${company.type}</p>
            </div>
          </div>
          <div class="company-score">
            <div class="score-badge">
              <div class="score-number">${company.total_score}</div>
              <div class="score-label">Score</div>
            </div>
          </div>
        </div>

        <div class="company-meta">
          <span class="meta-badge size">📊 ${company.size}</span>
          <span class="meta-badge format">📍 ${company.format}</span>
          ${company.vacancy_status === 'Open' ? '<span class="meta-badge vacancy-open">✓ Open Vacancy</span>' : '<span class="meta-badge vacancy-closed">✗ No Vacancy</span>'}
          ${company.english_requirement ? `<span class="meta-badge">🌐 English: ${company.english_requirement}</span>` : ''}
        </div>

        <div class="scores-breakdown">
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
            <div class="score-item-label">Culture Fit</div>
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
            <div class="score-item-label">Growth Potential</div>
            <div class="score-item-value">${scores.growth_potential}/10</div>
            <div class="score-item-bar">
              <div class="score-item-bar-fill" style="width: ${scores.growth_potential * 10}%;"></div>
            </div>
          </div>
        </div>

        <div class="company-details">
          <div class="detail-block">
            <div class="detail-label">🎯 Company Hook</div>
            <div class="detail-content">${company.company_hook}</div>
          </div>
          
          ${company.target_contact ? `
            <div class="detail-block">
              <div class="detail-label">👤 Target Contact</div>
              <div class="detail-content">${company.target_contact}</div>
            </div>
          ` : ''}
          
          ${company.notes ? `
            <div class="detail-block">
              <div class="detail-label">📝 Notes</div>
              <div class="detail-content">${company.notes}</div>
            </div>
          ` : ''}
        </div>

        <div class="company-actions">
          <select class="select-status" onchange="handleStatusChange(${company.id}, this.value)" data-company-id="${company.id}">
            <option value="Not contacted" ${company.outreach_status === 'Not contacted' ? 'selected' : ''}>Not contacted</option>
            <option value="Sent" ${company.outreach_status === 'Sent' ? 'selected' : ''}>Message Sent</option>
            <option value="Replied" ${company.outreach_status === 'Replied' ? 'selected' : ''}>Replied ✓</option>
            <option value="Interview" ${company.outreach_status === 'Interview' ? 'selected' : ''}>Interview 📞</option>
            <option value="Trial" ${company.outreach_status === 'Trial' ? 'selected' : ''}>Trial 🧪</option>
            <option value="Offer" ${company.outreach_status === 'Offer' ? 'selected' : ''}>Offer 🎉</option>
            <option value="Rejected" ${company.outreach_status === 'Rejected' ? 'selected' : ''}>Rejected ✗</option>
            <option value="Future" ${company.outreach_status === 'Future' ? 'selected' : ''}>Future Target</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
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
      company.company_hook.toLowerCase().includes(search);

    return matchPriority && matchFormat && matchSize && matchSearch;
  });

  // Apply current sort
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
  // Load data
  loadData();

  // Filter events
  document.getElementById('priority-filter').addEventListener('change', filterCompanies);
  document.getElementById('format-filter').addEventListener('change', filterCompanies);
  document.getElementById('size-filter').addEventListener('change', filterCompanies);
  document.getElementById('search-input').addEventListener('input', filterCompanies);

  // Reset button
  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all buttons
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      e.target.classList.add('active');
      
      // Update sort
      currentSort = e.target.dataset.sort;
      applySort();
      renderCompanies();
    });
  });

  // Update last updated date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('last-updated').textContent = today;
});
