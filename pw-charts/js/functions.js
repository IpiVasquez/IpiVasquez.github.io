// Creates element
function e() {
    var n = arguments.length;
    var element;

    if (n > 0) {
        element = document.createElement(arguments[0]);
        for (var i = 1; i < n; i++) {
            var arg = arguments[i];
            if (arg == null)
                arg = '';
            if (typeof(arg) == 'string' || typeof(arg) == 'number')
                arg = document.createTextNode(arg);
            element.appendChild(arg);
        }
    }
    return element;
}

// Gets the id element
function $(id) {
    var r = null;

    if (Array.isArray(id))
        r = id.map($);
    else
        r = document.getElementById(id);

    return r;
}

// Gets from href. Set whatToDo as a callback that receives responseText from href
function get(href, whatToDo) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.status == 200 && this.readyState == 4)
            whatToDo(this.responseText);
    }

    xhr.open('GET', href, true);
    xhr.send()
}

function filtering (data, key, expectedValue) {
    return data[key] == expectedValue;
}
