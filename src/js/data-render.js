import { appendList, clearElement, createElement, fetchJson } from "./utils.js";

export async function initDataRendering() {
  const [modulesData, statsData, teamData] = await Promise.all([
    fetchJson("src/data/modules.json"),
    fetchJson("src/data/stats.json"),
    fetchJson("src/data/team.json"),
  ]);

  renderCurrentMatch(modulesData.current_match);
  renderModules(modulesData.modules);
  renderStats(statsData);
  renderTeam(teamData.members);
}

function renderCurrentMatch(match) {
  const panel = document.getElementById("current-match-card");

  if (!panel || !match) {
    return;
  }

  clearElement(panel);

  const content = createElement("div", "match-panel__content");
  const teams = createElement("div", "match-panel__teams");
  teams.appendChild(createElement("strong", "", match.home_team));
  teams.appendChild(createElement("span", "", "vs"));
  teams.appendChild(createElement("strong", "", match.away_team));

  const summary = createElement(
    "p",
    "",
    `${match.status}. Jugador destacado: ${match.highlight_player}. Datos simulados para demostración académica.`,
  );

  const stats = createElement("div", "match-stat-list");
  match.stats.forEach((stat) => {
    stats.appendChild(createElement("span", "stat-pill", `${stat.label}: ${stat.value}`));
  });

  content.append(teams, summary, stats);
  panel.append(content, createElement("div", "match-score", match.score));
}

function renderModules(modules) {
  const container = document.getElementById("modules-list");

  if (!container) {
    return;
  }

  clearElement(container);

  modules.forEach((module) => {
    const card = createElement("article", "module-card");
    card.appendChild(createElement("h3", "", module.title));
    card.appendChild(createElement("p", "", module.description));

    const meta = createElement("div", "module-card__meta");
    meta.appendChild(createMetaBlock("Contenido", module.content));
    meta.appendChild(createMetaBlock("Objetivo", module.objective));
    meta.appendChild(createMetaBlock("Uso posible", module.use_case));
    card.appendChild(meta);

    if (module.tags?.length) {
      const tags = createElement("div", "module-card__tags");
      module.tags.forEach((tag) => tags.appendChild(createElement("span", "tag-pill", tag)));
      card.appendChild(tags);
    }

    container.appendChild(card);
  });
}

function createMetaBlock(label, text) {
  const block = createElement("div");
  block.appendChild(createElement("strong", "", label));
  block.appendChild(createElement("p", "", text));
  return block;
}

function renderStats(statsData) {
  renderMetricCards(statsData.metrics);
  renderWeeklyTable(statsData.weekly_predictions);
}

function renderMetricCards(metrics) {
  const container = document.getElementById("stats-grid");

  if (!container) {
    return;
  }

  clearElement(container);

  metrics.forEach((metric) => {
    const card = createElement("article", "metric-card");
    const top = createElement("div", "metric-card__top");
    top.appendChild(createElement("h3", "", metric.title));
    top.appendChild(createElement("span", "metric-card__icon", metric.icon));

    card.appendChild(top);
    card.appendChild(createElement("p", "metric-card__value", metric.value));
    card.appendChild(createElement("p", "", metric.description));
    container.appendChild(card);
  });
}

function renderWeeklyTable(predictions) {
  const body = document.getElementById("weekly-table-body");

  if (!body) {
    return;
  }

  clearElement(body);

  predictions.forEach((prediction) => {
    const row = document.createElement("tr");
    [
      prediction.date,
      prediction.match,
      prediction.team_a_probability,
      prediction.draw_probability,
      prediction.team_b_probability,
      prediction.estimated_result,
    ].forEach((value) => {
      row.appendChild(createElement("td", "", value));
    });
    body.appendChild(row);
  });
}

function renderTeam(members) {
  const container = document.getElementById("team-grid");

  if (!container) {
    return;
  }

  clearElement(container);

  members.forEach((member) => {
    const card = createElement("article", "team-card");
    card.appendChild(createElement("h3", "", member.name));
    card.appendChild(createElement("p", "team-card__role", member.role));
    card.appendChild(createElement("p", "", member.profile));

    if (member.contact) {
      const contactList = createElement("ul", "team-card__contact");
      Object.entries(member.contact).forEach(([label, value]) => {
        if (!value) {
          return;
        }

        const item = createElement("li");
        item.appendChild(createElement("span", "", label));
        item.appendChild(createElement("span", "", value));
        contactList.appendChild(item);
      });
      card.appendChild(contactList);
    }

    if (member.tags?.length) {
      const tags = createElement("div", "team-card__tags");
      member.tags.forEach((tag) => tags.appendChild(createElement("span", "tag-pill", tag)));
      card.appendChild(tags);
    }

    const details = createElement("details");
    details.appendChild(createElement("summary", "", "Ver responsabilidades y formación"));
    appendList(details, member.details, "");
    card.appendChild(details);

    container.appendChild(card);
  });
}
