"use strict";

var baseURL = 'http://edutm.utm.mx:9000/?/db/';
var instituteObj;
var professorsObj;
var majorObj;

function fillInstituteDropdown(responseText) {
    var select = $('institutes');

    instituteObj = JSON.parse(responseText);
    for (var i = 0; i < instituteObj.length; i++) {
        select.appendChild(e('option', instituteObj[i]['nombre']));
        select.lastChild.value = instituteObj[i]['id'];
    }
}

function showProfessor(evt) {
    var container = $('infoContainer');
    var specs = e('ul');
    var aux;

    var professor = professorsObj.filter(function (data) {
        return data['id'] == parseInt(evt.srcElement.parentNode.getAttribute('data-value'));
    })[0];

    container.innerHTML = '<br><br><br><br>';
    container.appendChild(specs);

    aux = majorObj.filter(function (data) {
        return data['id'] == professor['carrera_id'];
    });
    professor['carrera'] = aux.length == 0 ? professor['carrera_id'] : aux[0]['nombre'];
    professor['instituto'] = instituteObj.filter(function (data) {
        return data['id'] == professor['instituto_id'];
    })[0]['nombre'];
    switch (professor['grado']) {
        case 1:
            professor['grado'] = 'Licenciatura';
            break;
        case 2:
            professor['grado'] = 'Maestría';
            break;
        case 3:
            professor['grado'] = 'Doctorado';
            break;
        default:
            professor['grado'] = 'Desconocido';
            break;
    }

    delete professor['carrera_id'];
    delete professor['imagen_id'];
    delete professor['instituto_id'];

    for (var key in professor)
        specs.appendChild(
            e('tr',
                e('td', key),
                e('td', professor[key])
            )
        );
}

function showProfessors(responseText) {
    var container = $('tableContainer');
    var professors = e('table');
    var institute = $('institutes').value;

    professorsObj = JSON.parse(responseText).filter(function (data) {
        return data['instituto_id'] == institute;
    });

    professors.appendChild(
        e('tr',
            e('th', 'id'),
            e('th', 'Nombres'),
            e('th', 'Apellidos')
        )
    );
    for (var i = 0; i < professorsObj.length; i++) {
        professors.appendChild(
            e('tr',
                e('td', professorsObj[i]['id']),
                e('td', professorsObj[i]['nombres']),
                e('td', professorsObj[i]['apellidos'])
            )
        );
        professors.lastChild.setAttribute('data-value', professorsObj[i]['id']);
        professors.lastChild.addEventListener('click', showProfessor);
    }

    if (container.hasChildNodes()) {
        container.replaceChild(professors, container.lastChild);
    } else {
        container.appendChild(professors);
    }
}

function instituteListener() {
    get(baseURL + 'profesor', showProfessors);
}

function prepareInterface() {
    get(baseURL + 'carrera', function (responseText) {
        majorObj = JSON.parse(responseText);
    });
    get(baseURL + 'instituto', fillInstituteDropdown);
    $('institutes').addEventListener('change', instituteListener);
}

document.addEventListener('DOMContentLoaded', function (evt) {
    prepareInterface();
});
