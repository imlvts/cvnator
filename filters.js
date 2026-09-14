// Filters for jobs and projects. State lives in the query string
// (?jobYears=5&projectYears=3&tech=Rust) and is applied by toggling
// the `hidden` attribute on `.job` / `.project` sections.
const
YEAR_OPTIONS = [0, 1, 2, 3, 5, 10], // 0 = all time
// Filter values used when the query string does not mention the key.
// A value equal to the default is dropped from the query string.
DEFAULTS = {jobYears: 5, projectYears: 0, tech: "", tailor: ""}, // tailor may override tech
// Technologies offered in the project filter; matched against each
// the `technologies` list of each project after normalisation (see techKey).
TECH_OPTIONS = [
    "Rust", "C", "C++", "C#", "Python", "JavaScript", "TypeScript",
    "React", "Node.js", "WebGL", "WebAssembly", "SQL", "Embedded",
    "Assembly", "Math",
],
// "React.js" -> "react", "Python3" -> "python", "Node.js" -> "node"
techKey = (name) => name.toLowerCase().replace(/\.js$|\d+$/, ""),
techKeys = (technologies) => technologies.map(techKey).join("|"),
yearsLabel = (n) => n > 0 ? `past ${n} year${n === 1 ? "" : "s"}` : "all time",
yearsSelect = (param) =>
    ["select", {"data-filter": param},
        ...YEAR_OPTIONS.map((n) =>
            ["option", {value: n}, yearsLabel(n)])],
techSelect = (param) =>
    ["select", {"data-filter": param},
        ["option", {value: ""}, "any technology"],
        ...TECH_OPTIONS.map((name) => ["option", {value: name}, name])],
filterJobs = () => ["!fragment", 0,
    ["button", {popovertarget: "job-filter", id: "job-filter-label"}],
    ["div", {popover: "", id: "job-filter"},
        ["label", 0, "Show ", yearsSelect("jobYears")]]
],
filterProjects = () => ["!fragment", 0,
    ["button", {popovertarget: "project-filter", id: "project-filter-label"}],
    ["div", {popover: "", id: "project-filter"},
        ["label", 0, "Show ", yearsSelect("projectYears")],
        ["label", 0, " using ", techSelect("tech")]]
],
getParams = () => new URLSearchParams(location.search),
readFilters = (params) =>
    Object.fromEntries(Object.entries(DEFAULTS).map(([key, def]) => {
        if (!params.has(key)) {
            return [key, def];
        }
        const raw = params.get(key);
        return [key, typeof def === "number" ? (+raw || 0) : raw];
    })),
setParam = (key, value) => {
    const params = getParams();
    if (String(value) === String(DEFAULTS[key])) {
        params.delete(key);
    } else {
        params.set(key, value);
    }
    const query = params.toString();
    history.replaceState(null, "",
        location.pathname + (query ? "?" + query : "") + location.hash);
    applyFilters(params);
},
// true if the entry is ongoing (no end) or ended within the past `years`
endedWithin = (end, years) => {
    if (!years || !end) {
        return true;
    }
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - years);
    return new Date(end) >= cutoff;
},
// hidden popover toggled with Alt+T; changing it re-renders the page
filterTailor = (tailors) => ["div", {popover: "", id: "tailor-filter"},
    ["label", 0, "Tailor for ",
        ["select", {"data-filter": "tailor"},
            ["option", {value: ""}, "nobody"],
            ...tailors.map((name) => ["option", {value: name}, name])]]
],
projectFilterNote = () => ["p", {id: "project-filter-note", class: "filter-note"}],
techMatches = (keys, tech) =>
    tech === "" || keys.split("|").includes(techKey(tech)),
plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`,
// text shown in place of the project list when the filters hide everything
emptyProjectsNote = (allTime, tech) => {
    const using = tech ? ` with ${tech} technology` : "";
    if (allTime === 0) {
        return `There are no projects${using}.`;
    }
    return `There ${allTime === 1 ? "is" : "are"} ${plural(allTime, "project")}`
        + `${using} if you broaden the time filter.`;
},
applyFilters = (params) => {
    const {jobYears, projectYears, tech} = readFilters(params);
    const projects = [...document.querySelectorAll(".project")];
    const projectShown = (el, years) =>
        endedWithin(el.dataset.end, years) && techMatches(el.dataset.tech, tech);

    document.querySelectorAll(".job").forEach((el) => {
        el.hidden = !endedWithin(el.dataset.end, jobYears);
    });
    projects.forEach((el) => el.hidden = !projectShown(el, projectYears));

    const note = $("#project-filter-note");
    note.hidden = projects.some((el) => !el.hidden);
    if (!note.hidden) {
        const allTime = projects.filter((el) => projectShown(el, 0)).length;
        note.textContent = emptyProjectsNote(allTime, tech);
    }

    // keep controls and button labels in sync with the query
    const filters = readFilters(params);
    document.querySelectorAll("select[data-filter]").forEach((el) => {
        el.value = String(filters[el.dataset.filter]);
    });
    $("#job-filter-label").textContent = yearsLabel(jobYears);
    $("#project-filter-label").textContent = yearsLabel(projectYears)
        + (tech ? ", " + tech : "");
},
// per-render: bind the selects and apply the query to the fresh DOM
bindFilters = () => {
    document.querySelectorAll("select[data-filter]").forEach((el) =>
        el.addEventListener("change", () => {
            setParam(el.dataset.filter, el.value);
            if (el.dataset.filter === "tailor") {
                main();
                $("#tailor-filter").showPopover();
            }
        }));
    applyFilters(getParams());
},
// once: react to history navigation and the secret tailor shortcut
initFilters = () => {
    addEventListener("popstate", main);
    addEventListener("keydown", (ev) => {
        if (ev.altKey && ev.code === "KeyT") {
            ev.preventDefault();
            $("#tailor-filter").togglePopover();
        }
    });
};
