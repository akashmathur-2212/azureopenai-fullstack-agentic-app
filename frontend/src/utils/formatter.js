export function intelligentFormatToHTML(text) {

    // Safely coerce text to a string or return empty if null/undefined
    if (typeof text !== 'string') {
        console.warn("intelligentFormatToHTML received non-string input:", text);
        return '';
    }

    const lines = text.trim().split('\n');
    let html = '';
    let inList = false;

    for (let line of lines) {
        const trimmed = line.trim();

        const sectionMatch = trimmed.match(/^([A-Z][A-Za-z ]+):$/);
        if (sectionMatch) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += `<h2>${sectionMatch[1]}</h2>`;
            continue;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            if (!inList) {
                html += '<ol>';
                inList = true;
            }
            html += `<li>${trimmed.replace(/^\d+\.\s+/, '')}</li>`;
            continue;
        }

        if (/^- /.test(trimmed)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${trimmed.replace(/^- /, '')}</li>`;
            continue;
        }

        if (trimmed === '') {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<br />';
            continue;
        }

        if (inList) {
            html += '</ul>';
            inList = false;
        }
        if (trimmed.startsWith("### ")) {
            html += `<h1 style="font-weight:700;">${trimmed.replace('### ', '')}</h1>`;
        } else if (trimmed.startsWith("#### ")) {
            html += `<h2 style="font-weight:600;">${trimmed.replace('#### ', '')}</h2>`;
        } else if (trimmed.startsWith("##### ")) {
            html += `<h2 style="font-weight:600;">${trimmed.replace('##### ', '')}</h2>`;
        } else if (trimmed.startsWith("**")) {
            html += `<h2 style="font-weight:600;">${trimmed.replace('**', '')}</h2>`;
        } else {
            html += `<p>${trimmed}</p>`;
        }
    }

    if (inList) html += '</ul>';
    return html;
}
