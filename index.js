"use strict";
#include "util.js"
#include "filters.js"

const
header = ({ name, label, image }) =>
    ["header", 0,
        ["h1", 0, name],
        // ["img", {src: image}],
        ["h2", 0, label],
    ],
icon = (name) =>
    ["span", {class: `icon icon-${name}`}],
about = ({location, email, phone, url, profiles}) =>
    ["div", {class: "about"},
        ["h3", 0, "About"],
        ["dl", 0,
            location?.city && ["div", 0,
                icon("location"), location.city, ", ", location.region],
            email && ["div", 0,
                icon("mail"), ["a", {href: "mailto:" + email}, email]],
            phone && ["div", 0,
                icon("phone"), ["a", {href: "tel:" + encodeURIComponent(phone)}, phone]],
            url && ["div", 0,
                icon("url"), ["a", {href: url}, cleanUrl(url)]],
            profiles && ["!fragment", 0,
                ...profiles.map((prof) =>
                    ["div", 0,
                        icon(prof.network),
                        ["a", {href: prof.url}, prof.username],
                    ])
            ],
        ]
    ],
skills = (skills) =>
    ["div", {class: "skills"},
        ["h3", 0, "Skills"],
        ... skills.map(({name, level, keywords}) =>
            ["div", {class: "skill"},
                ["strong", 0, name, " (", level, "): "],
                ...keywords.map((keyword, ii) =>
                    ["!fragment", 0, ii > 0 && ", ", ["span", 0, keyword]])
            ]),
    ],
languages = (languages) =>
    ["div", {class: "languages"},
        ["h3", 0, "Languages"],
        ["div", {class: "languages"},
            ...languages.map(({ language, fluency }) =>
                ["span", 0, language, ": ", fluency, "; "])
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
jobs = (jobs) => jobs.map((job, idx) =>
    ["section", {class: "job", id: `job-idx-${idx}`, "data-end": job.endDate ?? ""},
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
projects = (projects) => projects.map((proj, idx) =>
    ["section", {class: "project", id: `project-idx-${idx}`,
            "data-end": proj.endDate ?? "", "data-tech": techKeys(proj.technologies)},
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
education = (edus) => edus.map((edu) =>
    ["div", 0,
        ["a", {href: edu.url}, edu.institution],
        dateRange(edu.startDate, edu.endDate),
        edu.studyType, " in ", edu.area,
    ]),
rightColumn = (data) =>
    ["div", {class: "rightColumn"},
        ["h3", 0, "Summary"],
        ["p", 0, data.basics.summary],
        ["h3", 0, "Experience", filterJobs()],
        ...jobs(data.work),
        ["h3", 0, "Project highlights", filterProjects()],
        projectFilterNote(),
        ...projects(data.projects),
        ["h3", 0, "Education"],
        ...education(data.education),
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

    data.basics.profiles = data.basics.profiles
        .filter((net) => net.network !== 'Discord');

    const tailor = params.get("tailor");

    if (!tailor || !Object.hasOwn(data.tailor, tailor)) {
        return;
    }

    const { summary, projects, skills, tech } = data.tailor[tailor];
    checkSubset(projects, data.projects.map((proj) => proj.id));
    if (skills) {
        data.skills = data.skills.filter((skill) => skills.includes(skill.id));
    }
    if (tech) {
        // optional default for the project technology filter
        checkSubset([tech], TECH_OPTIONS);
        DEFAULTS.tech = tech;
    }
    data.basics.summary = summary;
    data.projects = data.projects.filter((proj) => projects.includes(proj.id));
},
main = () => {
    const data = JSON.parse($("#data").textContent);
    const params = getParams();
    tailor(data, params);
    render(data);
    initFilters();
};

main();
