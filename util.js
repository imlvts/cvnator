const
$ = (query) => document.querySelector(query),
checkSubset = (a, b) => {
    const diff = new Set(a).difference(new Set(b));
    if (diff.size > 0) {
        console.error("not a subset", a, b);
    }
},
monthFmt = (str) => {
    if (!str) {
        return "Present";
    }
    return new Intl.DateTimeFormat('en-us', {month: 'long', year: 'numeric'}).format(new Date(str)) ;
},
CLEAN_URL_RE = new RegExp("^https?://(www\\.)?|/+$", "g"),
cleanUrl = (url) => url.replace(CLEAN_URL_RE, ""),
dateCmp = (a, b) => {
    a = new Date(a).valueOf();
    b = new Date(b).valueOf();
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
},
renderDOM = (obj, target) => {
    if (obj == null || obj === false) {
        return;
    }
    let dom;
    if (typeof obj === "string") {
        dom = new Text(obj);
    } else if (Array.isArray(obj)) {
        const [type, attrs, ...rest] = obj;
        if (type === "!comment") {
            dom = new Comment(attrs);
        } else if (type === "!fragment") {
            rest.forEach((child) => renderDOM(child, target));
        } else {
            dom = Object.assign(document.createElement(type), attrs);
            rest.forEach((child) => renderDOM(child, dom));
        }
    } else {
        throw new Error("Cannot make dom of: " + obj);
    }
    if (dom) {
        target.append(dom)        
    }
};
