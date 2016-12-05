var entriesBaseURL = 'entries/';

function showEntry(evt) {
    var entry = evt.srcElement.getAttribute('data-value');

    get(entry, function (responseText) {
        var converter = new showdown.Converter();

        $('entry').innerHTML = converter.makeHtml(responseText);
    });
}

function showEntries(responseText) {
    var entries = JSON.parse(responseText);
    var entriesContainer = $('entries');

    for (var i = 0; i < entries.length; i++) {
        var entry = e('a', entries[i]['name']);
        entry.setAttribute('data-value', entriesBaseURL + entries[i]['href']);
        entry.href = '#entry';
        entry.addEventListener('click', showEntry);
        entriesContainer.appendChild(e('li', entry));
    }
}

function prepareShell() {
    get(entriesBaseURL + 'entries.json', showEntries);
}

window.onload = prepareShell;
