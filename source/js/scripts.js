document.addEventListener('DOMContentLoaded', () => {
    const fileInput   = document.getElementById('csvFile');
    const extraInput  = document.getElementById('extraParams');
    const filterInput = document.getElementById('filterPlan');
    const resultsBody = document.getElementById('resultsBody');
  
    const HEADERS = [
      'Service',       // E or G
      'Utility ID',
      'Utility',
      'Account Type',
      'State',
      'Plan Code'
    ];
  
    // Main render function
    async function generate() {
      const file = fileInput.files[0];
      if (!file) return;
  
      const filterVal   = filterInput.value.trim();
      const text        = await file.text();
      const rows        = text.trim().split('\n').map(r => r.split(','));
      const headerRow   = rows.shift();
      const extraParams = new URLSearchParams(extraInput.value.trim());
  
      // Map header names to indexes
      const idx = HEADERS.reduce((map, h) => {
        map[h] = headerRow.indexOf(h);
        return map;
      }, {});
  
      // Clear previous
      resultsBody.innerHTML = '';
  
      for (const cells of rows) {
        const svc      = cells[idx['Service']]      || '';
        const uid      = cells[idx['Utility ID']]   || '';
        const uname    = cells[idx['Utility']]      || '';
        const ctype    = cells[idx['Account Type']] || '';
        const state    = (cells[idx['State']] || '').toLowerCase();
        const planCode = cells[idx['Plan Code']]    || '';
  
        // Filter by plan code
        if (filterVal && planCode !== filterVal) continue;
  
        // Build URL params
        const params = new URLSearchParams();
        if (svc === 'E') {
          params.set('utilityid',   uid);
          params.set('utilityname', uname);
          params.set('utilityidG',  '');
          params.set('utilitynameG','');
        } else if (svc === 'G') {
          params.set('utilityid',   '');
          params.set('utilityname','');
          params.set('utilityidG',  uid);
          params.set('utilitynameG',uname);
        }
        params.set('ctype',         ctype);
        params.set('utility-state', state);
        params.set('productNum',    planCode);
        for (const [k, v] of extraParams) params.set(k, v);
  
        const url = `https://www.clearviewenergy.com/enrollment/?${params}`;
  
        // Create row
        const tr = document.createElement('tr');
  
        // Plan code cell
        const tdPlan = document.createElement('td');
        tdPlan.className = 'px-6 py-4 whitespace-nowrap text-xs text-gray-900';
        tdPlan.textContent = planCode;
        tr.appendChild(tdPlan);
  
        // URL cell
        const tdUrl = document.createElement('td');
        tdUrl.className = 'px-6 py-4 whitespace-nowrap text-xs text-gray-900';
        tdUrl.textContent = url;
        tr.appendChild(tdUrl);
  
        // Actions cell
        const tdActions = document.createElement('td');
        tdActions.className = 'px-6 py-4 whitespace-nowrap text-xs font-medium flex items-center';
  
        const viewLink = document.createElement('a');
        viewLink.href = url;
        viewLink.target = '_blank';
        viewLink.rel = 'noopener';
        viewLink.className = 'text-indigo-600 hover:text-indigo-900';
        viewLink.textContent = 'View';
        tdActions.appendChild(viewLink);
  
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'ml-4 px-3 py-1 bg-indigo-500 text-white rounded shadow-sm hover:bg-indigo-600';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
              copyBtn.textContent = 'Copied';
              setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
            });
          } else {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = url; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            copyBtn.textContent = 'Copied';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
          }
        });
  
        tdActions.appendChild(copyBtn);
        tr.appendChild(tdActions);
        resultsBody.appendChild(tr);
      }
    }
  
    fileInput.addEventListener('change', generate);
    filterInput.addEventListener('input', generate);
  });
  