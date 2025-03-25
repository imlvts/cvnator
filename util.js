const
$ = (query) => document.querySelector(query),
has = Function.prototype.call.bind(Object.prototype.hasOwnProperty),
checkSubset = (a, b) => {
    const diff = new Set(a).difference(new Set(b));
    if (diff.size > 0) {
        console.error("not a subset", a, b);
    }
},
months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
],
monthFmt = (str) => {
    if (!str) {
        return "Present";
    }
    const date = new Date(str);
    const year = date.getYear() + 1900;
    return months[date.getMonth()] + " " + year;
},
CLEAN_URL_RE = new RegExp("^https?://(www\\.)?|/+$", "g"),
cleanUrl = (url) => url.replace(CLEAN_URL_RE, ""),
dateCmp = (a, b) => {
    a = new Date(a).valueOf();
    b = new Date(b).valueOf();
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
},
renderDOM = (obj, target) => {
    let dom;
    if (obj == null || dom === false) {
        dom = null;
    } else if (typeof obj === "string") {
        dom = new Text(obj);
    } else if (Array.isArray(obj)) {
        if (obj[0] === "!comment") {
            dom = new Comment(obj[1]);
        } else if (obj[0] === "!fragment") {
            obj.slice(2).forEach((child) => renderDOM(child, target));
        } else {
            dom = document.createElement(obj[0]);
            const attrs = obj[1];
            Object.keys(attrs).forEach(
                (key) => dom.setAttribute(key, attrs[key]));
            obj.slice(2).forEach((child) => renderDOM(child, dom));
        }
    } else {
        throw new Error("Cannot make dom of: " + obj);
    }
    if (dom) {
        target.appendChild(dom)        
    }
};
