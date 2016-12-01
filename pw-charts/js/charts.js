"use strict";

var baseURL = 'http://edutm.utm.mx:9000/?/db/';

var instituteObj;
var instituteDic;
var professorsObj;
var majorObj;

var instituteChart;
var instituteCanvas;
var majorChart;
var majorCanvas;

var colors;
var color;

function instituteCharter(responseText) {
    var chartData, i;
    var labels = [];
    var datasets = [];
    var aux = ['Licenciatura', 'Maestría', 'Doctorado'];

    for (i = 0; i < aux.length; i++)
        datasets[i] = {
            label: aux[i],
            backgroundColor: color(colors[i]).alpha(0.5).rgbString(),
            borderColor: colors[i],
            borderWidth: 1,
            data: []
        }

    professorsObj = JSON.parse(responseText);
    for (i = 0; i < instituteObj.length; i++) {
        var professors = professorsObj.filter(function (data) {
            return data['instituto_id'] == instituteObj[i]['id'];
        });

        datasets[0]['data'][i] = professors.length;
        for (var j = 0; j < professors.length; j++)
            if (i in datasets[professors[j]['grado'] - 1]['data'])
                datasets[professors[j]['grado'] - 1]['data'][i]++;
            else
                datasets[professors[j]['grado'] - 1]['data'][i] = 1;

        labels[i] = instituteObj[i]['nombre'];
    }

    chartData = {
        labels: labels,
        datasets: datasets
    };

    instituteCanvas = document.createElement('canvas');
    instituteCanvas.onclick = instituteClick;
    instituteCanvas.style.background = 'white';
    $('professor').appendChild(instituteCanvas);

    var ctx = instituteCanvas.getContext('2d');
    var config = {
        type: 'horizontalBar',
        data: chartData,
        options: {
            responsive: true,
            legend: {
                position: 'bottom',
                onClick: leyendClick
            },
            title: {
                display: true,
                text: 'Profesores por instituto'
            },
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    };
    instituteChart = new Chart(ctx, config);
}

function showProfessor(evt) {
    var container = $('infoContainer');
    var specs = e('ul');
    var aux;

    var professor = professorsObj.filter(function (data) {
        return data['id'] == parseInt(evt.srcElement.parentNode.getAttribute('data-value'));
    })[0];

    container.innerHTML = '<br>';
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

function instituteClick(evt) {
    var activePoints = instituteChart.getElementAtEvent(evt);
    if (activePoints.length == 0)
        return;

    // console.log(activePoints);
    var container = $('tableContainer');
    var professorsTable = e('table');
    var professors = professorsObj.filter(function (data) {
        return data['instituto_id'] == instituteObj[activePoints[0]._index]['id'];
    });

    professorsTable.appendChild(
        e('tr',
            e('th', 'id'),
            e('th', 'Profesor en ' + activePoints[0]._model['label']),
            e('th', 'Grado')
        )
    );

    for (var i = 0; i < professors.length; i++) {
        professorsTable.appendChild(
            e('tr',
                e('td', professors[i]['id']),
                e('td', professors[i]['nombres'] + ' ' + professors[i]['apellidos']),
                e('td', professors[i]['grado'])
            )
        );
        professorsTable.lastChild.setAttribute('data-value', professors[i]['id']);
        professorsTable.lastChild.addEventListener('click', showProfessor);
    }

    if (container.hasChildNodes()) {
        container.replaceChild(professorsTable, container.lastChild);
    } else {
        container.appendChild(professorsTable);
    }
}

function leyendClick(evt, legendItem) {
    var container = $('tableContainer');
    var professorsTable = e('table');
    var professors = professorsObj.filter(function (data) {
        return data['grado'] == legendItem.datasetIndex + 1;
    });

    professorsTable.appendChild(
        e('tr',
            e('th', 'id'),
            e('th', 'Profesor con ' + legendItem.text),
            e('th', 'Instituto')
        )
    );

    for (var i = 0; i < professors.length; i++) {
        professorsTable.appendChild(
            e('tr',
                e('td', professors[i]['id']),
                e('td', professors[i]['nombres'] + ' ' + professors[i]['apellidos']),
                e('td', instituteDic[professors[i]['instituto_id']])
            )
        );
        professorsTable.lastChild.setAttribute('data-value', professors[i]['id']);
        professorsTable.lastChild.addEventListener('click', showProfessor);
    }

    if (container.hasChildNodes()) {
        container.replaceChild(professorsTable, container.lastChild);
    } else {
        container.appendChild(professorsTable);
    }
}

function majorCharter(responseText) {

}

function prepareInterface() {
    color = Chart.helpers.color;
    colors = [
        'rgb(75, 192, 192)', // green
        'rgb(255, 159, 64)', // orange
        'rgb(54, 162, 235)', // blue
        'rgb(255, 99, 132)', // red
        'rgb(153, 102, 255)', // purple
        'rgb(255, 205, 86)', // yellow
        'rgb(231,233,237)' // grey
    ];

    get(baseURL + 'instituto', function (responseText) {
        instituteObj = JSON.parse(responseText);
        instituteDic = {};
        for (var i = 0; i < instituteObj.length; i++)
            instituteDic[instituteObj[i]['id']] = instituteObj[i]['nombre'];
    });
    get(baseURL + 'carrera', function (responseText) {
        majorObj = JSON.parse(responseText);
    });
    get(baseURL + 'grupo', majorCharter);
    get(baseURL + 'profesor', instituteCharter);
}

document.addEventListener('DOMContentLoaded', function () {
    prepareInterface();
});
