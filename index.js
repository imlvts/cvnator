"use strict";
#include "util.js"

const
header = ({ name, label }) =>
    ["header", 0,
        ["h1", 0, name],
        ["h2", 0, label],
    ],
icon = (name) =>
    ["span", {class: `icon icon-${name}`}],
about = ({location, email, phone, url, profiles}) =>
    ["div", {class: "about"},
        ["h3", 0, "About"],
        ["dl", 0,
            location?.city && ["div", 0,
                icon("location"), location.city],
            email && ["div", 0,
                icon("mail"), ["a", {href: "mailto:" + email}, email]],
            phone && ["div", 0,
                icon("phone"), ["a", {href: "tel:" + phone}, phone]],
            url && ["div", 0,
                icon("globe"), ["a", {href: url}, cleanUrl(url)]],
            profiles && ["!fragment", 0,
                ...profiles.map((prof) =>
                    ["div", 0,
                        icon(prof.network),
                        ["a", {href: prof.url}, prof.username],
                    ])
            ],
        ]
    ],
skills = (skills) => null,
languages = (languages) =>
    ["div", {class: "languages"},
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
    ["aside", {class: "leftColumn"},
        about(data.basics),
        skills(data.skills),
        languages(data.languages),
    ],
dateRange = (start, end) =>
    ["div", {class: "date-range"},
        monthFmt(start), "—", monthFmt(end)
    ],
jobs = (jobs) => jobs.map((job) =>
    ["section", {class: "job"},
        ["h4", 0,
            ["span", 0, job.position],
            " at ",
            ["span", 0, job.name]],
        dateRange(job.startDate, job.endDate),
        job.url && ["a", {href: job.url}, cleanUrl(job.url)],
        ["p", 0, job.summary],
        ["ul", {class: "highlights"},
            ...job.highlights.map((hl) => ["li", 0, hl])],
    ]),
projects = (projects) => projects.map((proj) =>
    ["section", {class: "project"},
        ["h4", {id: proj.id}, proj.name],
        dateRange(proj.startDate, proj.endDate),
        proj.url && ["a", {href: proj.url}, cleanUrl(proj.url)],
        ["p", 0, proj.description],
        ["ul", {class: "highlights"},
            ...proj.highlights.map((hl) => ["li", 0, hl])],
        ["h5", 0, "Technologies"],
        ["span", {class: "technologies"},
            ...proj.technologies.map((tech, ii) =>
                ["!fragment", 0, ii > 0 && ", ", ["span", 0, tech]])],
    ]),
rightColumn = (data) =>
    ["div", {class: "rightColumn"},
        ["h3", 0, "Summary"],
        ["p", 0, data.basics.summary],
        ["h3", 0, "Experience"],
        ...jobs(data.work),
        ["h3", 0, "Past projects"],
        ...projects(data.projects),
    ],
render = (data) => {
    const prev = $('#resume')?.remove();
    const vdom = ["main", {"id": "resume"},
        header(data.basics),
        leftColumn(data),
        rightColumn(data),
    ];

    document.title = data.basics.name + " CV";
    renderDOM(vdom, document.body);
},
tailor = (data, params) => {
    data.projects.sort((a, b) => -dateCmp(a.startDate, b.startDate));
    data.work.sort((a, b) => -dateCmp(a.startDate, b.startDate));

    const tailor = params.get("tailor");

    if (!tailor || !Object.hasOwn(data.tailor, tailor)) {
        return;
    }

    const { summary, projects } = data.tailor[tailor];
    checkSubset(projects, data.projects.map((proj) => proj.id));
    data.basics.summary = summary;
    data.projects = data.projects.filter((proj) => projects.includes(proj.id));
},
main = () => {
    const data = JSON.parse($("#data").textContent);
    const params = new URLSearchParams(location.search);
    tailor(data, params);
    render(data);
};

main();
