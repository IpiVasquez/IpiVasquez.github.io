var entriesBaseURL = 'entries/';
var converter = new showdown.Converter();

function prepareShell() {
    $.ajax({
        url: entriesBaseURL + "about.md",
        success: function(result) {
            $("#content").html(converter.makeHtml(result));
        }
    })
}

window.onload = prepareShell;
