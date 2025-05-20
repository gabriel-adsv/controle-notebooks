// (todo seu script permanece igual)
const groupNames = ["Manutenção", "Sala 1", "Sala 3"];
const columns = ["Nº de série", "Nº na Sala", "Teclas faltando", "Defeito", "Status", "Chamado", "Diagnóstico"];
let data = JSON.parse(localStorage.getItem("tabelaData")) || {
  "Manutenção": [],
  "Sala 1": [],
  "Sala 3": []
};

function saveData() {
  localStorage.setItem("tabelaData", JSON.stringify(data));
}

function renderTables() {
  const container = document.getElementById("groups-container");
  container.innerHTML = "";
  groupNames.forEach(group => {
    const div = document.createElement("div");
    div.classList.add("group");
    div.innerHTML = `
      <h2>${group}</h2>
      <div class="input-row">
        ${columns.map((col, index) => `<input placeholder="${col}" id="${group}-input-${index}">`).join("")}
        <button onclick="addRow('${group}')">OK</button>
      </div>
      <div class="search-row">
        <input placeholder="Pesquisar Nº de série" id="${group}-search" oninput="renderTableBody('${group}')">
      </div>
      <table>
        <thead>
          <tr>${columns.map(col => `<th>${col}</th>`).join("")}<th>Ação</th></tr>
        </thead>
        <tbody id="${group}-tbody"></tbody>
      </table>
    `;
    container.appendChild(div);
    renderTableBody(group);
  });
}

function renderTableBody(group) {
  const tbody = document.getElementById(`${group}-tbody`);
  const searchValue = document.getElementById(`${group}-search`)?.value.trim().toLowerCase();
  tbody.innerHTML = "";

  data[group].forEach((row, index) => {
    if (searchValue && !row[0].toLowerCase().includes(searchValue)) return;

    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Excluir";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => {
      if (confirm(`Deseja excluir o Nº de série ${row[0]} de ${group}?`)) {
        data[group].splice(index, 1);
        saveData();
        renderTables();
      }
    };
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

function addRow(group) {
  const inputs = columns.map((_, index) => document.getElementById(`${group}-input-${index}`).value.trim());
  const serialNumber = inputs[0];

  if (!serialNumber) {
    alert("Por favor, preencha o Nº de série.");
    return;
  }

  let foundIn = null;
  let foundGroup = null;
  for (const otherGroup of groupNames) {
    if (otherGroup !== group) {
      const index = data[otherGroup].findIndex(row => row[0] === serialNumber);
      if (index !== -1) {
        foundIn = data[otherGroup][index];
        foundGroup = otherGroup;
        break;
      }
    }
  }

  if (foundIn) {
    if (confirm(`Nº de série ${serialNumber} já existe em ${foundGroup}. Deseja mover para ${group}?`)) {
      data[foundGroup] = data[foundGroup].filter(row => row[0] !== serialNumber);
      data[group].push(inputs);
      alert(`Movido para ${group}.`);
    } else {
      alert("Operação cancelada.");
      return;
    }
  } else {
    data[group].push(inputs);
  }

  saveData();
  renderTables();
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

(function initTheme() {
  const saved = localStorage.getItem("theme") || (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", saved);
})();

renderTables();
