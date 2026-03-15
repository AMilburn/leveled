// UI composition for Leveled SPA
export function renderApp(root) {
  root.innerHTML = `
    <div class="app">
      <div class="tabs">
        <button class="tab active" onclick="showTab('schedule',this)">Schedule</button>
        <button class="tab" onclick="showTab('kanban',this)">Kanban</button>
        <button class="tab" onclick="showTab('progress',this)">Progress</button>
        <button class="tab" onclick="showTab('wins',this)">Wins</button>
      </div>
      <div id="schedule" class="panel active"></div>
      <div id="kanban" class="panel"></div>
      <div id="progress" class="panel"></div>
      <div id="wins" class="panel"></div>
    </div>
  `;
  // Widget rendering will be handled by widgets.js
}
