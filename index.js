"use strict";
#include "util.js"

const
header = ({ name, label }) =>
    ["header", 0,
        ["h1", 0, name],
        ["h2", 0, label],
    ],
icon = (name) =>
    ["span", {className: `icon icon-${name}`}],
about = (bas) =>
    ["div", {className: "about"},
        ["h3", 0, "About"],
        ["dl", 0,
            bas.location?.city && ["div", 0,
                icon("location"),
                bas.location.city],
            bas.email && ["div", 0,
                icon("mail"),
                ["a", {href: "mailto:" + bas.email}, bas.email]],
            bas.phone && ["div", 0,
                icon("phone"),
                ["a", {href: "tel:" + bas.phone}, bas.phone]],
            bas.url && ["div", 0,
                icon("globe"),
                ["a", {href: bas.url}, cleanUrl(bas.url)]],
            bas.profiles && ["!fragment", 0,
                ...bas.profiles.map((prof) =>
                    ["div", 0,
                        icon(prof.network),
                        ["a", {href: prof.url}, prof.username],
                    ])
            ],
        ]
    ],
skills = (skills) => null,
languages = (languages) =>
    ["div", {className: "languages"},
        ["h3", 0, "Languages"],
        ["dl", 0,
            ...languages.map(({ language, fluency }) =>
                ["!fragment", 0,
                    ["dt", 0, language],
                    ["dd", 0, fluency],
                ]),
        ]
    ],
leftColumn = (data) =>
    ["aside", {className: "leftColumn"},
        about(data.basics),
        skills(data.skills),
        languages(data.languages),
    ],
dateRange = (start, end) =>
    ["div", {className: "date-range"},
        monthFmt(start), "—", monthFmt(end)
    ],
jobs = (jobs) => jobs.map((job) =>
    ["section", {className: "job"},
        ["h4", 0,
            ["span", 0, job.position],
            " at ",
            ["span", 0, job.name]],
        job.url && ["a", {href: job.url}, cleanUrl(job.url)],
        dateRange(job.startDate, job.endDate),
        ["p", 0, job.summary],
        ["ul", 0, ...job.highlights.map((hl) => ["li", 0, hl])],
    ]),
projects = (projects) => projects.map((proj) =>
    ["section", {className: "project"},
        ["h4", {id: proj.id}, proj.name],
        proj.url && ["a", {href: proj.url}, cleanUrl(proj.url)],
        dateRange(proj.startDate, proj.endDate),
        ["p", 0, proj.description],
        ["ul", 0, ...proj.highlights.map((hl) => ["li", 0, hl])],
    ]),
rightColumn = (data) =>
    ["div", {className: "rightColumn"},
        ["h3", 0, "Summary"],
        ["p", 0, data.basics.summary],
        ["h3", 0, "Experience"],
        ...jobs(data.work),
        ["h3", 0, "Past projects"],
        ...projects(data.projects),
    ],
render = (data) => {
    const prev = $('#resume');
    if (prev && prev.parentNode) {
        prev.parentNode.removeChild(prev);
    }
    const vdom = ["main", {"id": "resume"},
        header(data.basics),
        leftColumn(data),
        rightColumn(data),
    ];

    document.title = data.basics.name + " CV";
    const root = $("#root");
    root.innerHTML = "";
    renderDOM(vdom, root);
},
tailor = (data, params) => {
    const tailor = params.get("tailor");
    if (!tailor || !has(data.tailor, tailor)) {
        return;
    }
    const { summary, projects } = data.tailor[tailor];
    checkSubset(projects, data.projects.map((proj) => proj.id));
    data.basics.summary = summary;
    data.projects = data.projects.filter((proj) => projects.includes(proj.id));
},
main = () => {
    const data = JSON.parse($("#data").textContent);
    data.projects.sort((a, b) => -dateCmp(a.startDate, b.startDate));
    data.work.sort((a, b) => -dateCmp(a.startDate, b.startDate));
    const params = new URLSearchParams(location.search);
    tailor(data, params);
    render(data);
};

main();