"use strict";

var baseURL = 'resources/';

var instituteObj;
var instituteDic;
var professorsObj;
var majorObj;
var groupObj;

var instituteChart;
var instituteCanvas;
var instituteData;
var majorChart;
var majorCanvas;
var majorData;

var colors;
var color;

// Initializes institute chart with 0 values
function instituteCharter(responseText) {
    var i, j;
    var labels = [];
    var datasets = [];

    // Auxiliar variable to help label creation on datasets
    var aux = ['Licenciatura', 'Maestría', 'Doctorado'];
    // Go through aux array
    for (i = 0; i < aux.length; i++) {
        datasets[i] = {
            // Each dataset receives its label & color
            label: aux[i],
            backgroundColor: color(colors[i]).alpha(0.5).rgbString(),
            borderColor: colors[i],
            borderWidth: 1,
            data: []
        };
        // Initialize each dataset with 0
        for (j = 0; j < instituteObj.length; j++) {
            datasets[i]['data'][j] = 0;
            // Labeling with major names
            labels[j] = instituteObj[j]['nombre'];
        }
    }

    // Parsing JSON response
    professorsObj = JSON.parse(responseText);
    // Assigning values to institute's chartData
    instituteData = {
        labels: labels,
        datasets: datasets
    };
    // Creating the canvas for the chart
    instituteCanvas = document.createElement('canvas');
    instituteCanvas.onclick = instituteClick;
    instituteCanvas.style.background = 'white';
    $('professor').appendChild(instituteCanvas);
    // Setting canvas
    var ctx = instituteCanvas.getContext('2d');
    ctx.canvas.height = instituteObj.length * 6 + 100;
    var config = {
        type: 'horizontalBar',
        data: instituteData,
        options: {
            title: {
                display: true,
                text: 'Profesores por instituto'
            },
            responsiveAnimationDuration: 5,
            responsive: true,
            legend: {
                position: 'bottom',
                onClick: leyendClick
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
    // Creating chart
    instituteChart = new Chart(ctx, config);
    fillInstituteData();
}
// Fill institute data and updates the chart
function fillInstituteData() {
    // Updating chart's datasets
    for (var i = 0; i < instituteObj.length; i++) {
        // Getting professors matching the institute
        var professors = professorsObj.filter(function (data) {
            return data['instituto_id'] == instituteObj[i]['id'];
        });
        // Increment the number of professors per degree per institute if matches
        for (var j = 0; j < professors.length; j++)
            instituteData.datasets[professors[j]['grado'] - 1]['data'][i]++;
    }

    instituteChart.update();
}
// Show information about professor requested
function showProfessor(evt) {
    var container = $('infoContainer');
    var specs = e('ul');
    var aux;
    // Gets info about professor requested
    var professor = professorsObj.filter(function (data) {
        return data['id'] == parseInt(evt.srcElement.parentNode.getAttribute('data-value'));
    })[0];

    // Erase info in container
    container.innerHTML = '<br>';
    // Appends the element created
    container.appendChild(specs);
    // An auxiliar variable to get major name instead of id
    aux = majorObj.filter(function (data) {
        return data['id'] == professor['carrera_id'];
    });
    // Assigns the name of the major to 'carrera' key
    professor['carrera'] = aux.length == 0 ? professor['carrera_id'] : aux[0]['nombre'];
    // Assigns the name of the institute to 'instituto' key
    professor['instituto'] = instituteObj.filter(function (data) {
        return data['id'] == professor['instituto_id'];
    })[0]['nombre'];
    // Assigns a degree to 'grado' key
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

    // Deletes unnecessary keys to show
    delete professor['carrera_id'];
    delete professor['imagen_id'];
    delete professor['instituto_id'];
    // Displays in table format
    for (var key in professor)
        if (professor.hasOwnProperty(key))
            specs.appendChild(
                e('tr',
                    e('td', key),
                    e('td', professor[key])
                )
            );
}
// Listener for when the chart is clicked
function instituteClick(evt) {
    // Gets where the chart was clicked
    var activePoints = instituteChart.getElementAtEvent(evt);
    if (activePoints.length == 0)
        return;

    var container = $('tableContainer');
    // Creates a table for professors to display
    var professorsTable = e('table');
    // Gets professor matching the institute clicked
    var professors = professorsObj.filter(function (data) {
        return data['instituto_id'] == instituteObj[activePoints[0]._index]['id'];
    });
    // Appends the header to recently created table
    professorsTable.appendChild(
        e('tr',
            e('th', 'id'),
            e('th', 'Profesor en ' + activePoints[0]._model['label']),
            e('th', 'Grado')
        )
    );
    // Appends every professor in professor with basic info
    for (var i = 0; i < professors.length; i++) {
        professorsTable.appendChild(
            e('tr',
                e('td', professors[i]['id']),
                e('td', professors[i]['nombres'] + ' ' + professors[i]['apellidos']),
                e('td', professors[i]['grado'])
            )
        );
        // An attribute to get id when the professor is clicked
        professorsTable.lastChild.setAttribute('data-value', professors[i]['id']);
        professorsTable.lastChild.addEventListener('click', showProfessor);
    }
    // Replace old table with the new if it exists
    if (container.hasChildNodes()) {
        container.replaceChild(professorsTable, container.lastChild);
    } else {
        container.appendChild(professorsTable);
    }
}
// Listener for when the legend gets clicked
function leyendClick(evt, legendItem) {
    console.log(evt.srcElement);
    var container = $('tableContainer');
    var professorsTable = e('table');
    // Gets the professors matching grade specified
    var professors = professorsObj.filter(function (data) {
        return data['grado'] == legendItem.datasetIndex + 1;
    });
    // Appends a header to the table
    professorsTable.appendChild(
        e('tr',
            e('th', 'id'),
            e('th', 'Profesor con ' + legendItem.text),
            e('th', 'Instituto')
        )
    );
    // Fills the table with the professors in professors
    for (var i = 0; i < professors.length; i++) {
        professorsTable.appendChild(
            e('tr',
                e('td', professors[i]['id']),
                e('td', professors[i]['nombres'] + ' ' + professors[i]['apellidos']),
                e('td', instituteDic[professors[i]['instituto_id']])
            )
        );
        // Adds a data-value and a listener to show info about the professor
        professorsTable.lastChild.setAttribute('data-value', professors[i]['id']);
        professorsTable.lastChild.addEventListener('click', showProfessor);
    }
    // If a table exists it gets replaces by the new one, other way it just appends the new one
    if (container.hasChildNodes()) {
        container.replaceChild(professorsTable, container.lastChild);
    } else {
        container.appendChild(professorsTable);
    }
}
// Creates chart for major
function majorCharter(responseText) {
    var i, aux = {}, element;
    var yearElement = $('year');
    // Parse to object the response
    groupObj = JSON.parse(responseText);
    // Auxiliar to get all different years in aux so we add element select
    for (i = 0; i < groupObj.length; i++)
        aux[groupObj[i]['anio']] = true;
    // Create select element and customize it
    element = e('select');
    element.id = 'yearSelector';
    // Appends year options in select element
    for (var key in aux) {
        element.appendChild(e('option', key));
        element.lastChild.value = key;
    }
    element.addEventListener('change', fillMajorData);
    element.style.margin = '10px';
    // Append it inside a form inside #year
    yearElement.appendChild(e('form', element));
    // Create variable for datasets and for label datasets
    var datasets = [];
    aux = ['Primer año', 'Segundo año', 'Tercer año', 'Cuarto año', 'Quinto año'];
    // Fill datasets config and initializes with 0 every dataset
    for (i = 0; i < aux.length; i++) {
        datasets[i] = {
            label: aux[i],
            backgroundColor: color(colors[i]).alpha(0.5).rgbString(),
            borderColor: colors[i],
            borderWidth: 1,
            data: []
        };
        // Initialize each dataset with 0
        for (var j = 0; j < majorObj.length; j++)
            datasets[i]['data'][j] = 0;
    }
    // Create labels for chart
    var labels = [];
    for (i = 0; i < majorObj.length; i++)
        labels[i] = majorObj[i]['nombre'];
    // Define majorData
    majorData = {
        labels: labels,
        datasets: datasets
    };
    // Create canvas for chart and append it to the respective element
    majorCanvas = document.createElement('canvas');
    majorCanvas.style.background = 'white';
    yearElement.appendChild(majorCanvas);
    // Some chart config
    var ctx = majorCanvas.getContext('2d');
    ctx.canvas.height = majorObj.length * 6 + 100;
    var config = {
        type: 'horizontalBar',
        data: majorData,
        options: {
            title: {
                display: true,
                text: 'Matricula por carrera'
            },
            responsiveAnimationDuration: 5,
            responsive: true,
            legend: {
                position: 'bottom',
                onClick: leyendClick
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
    // Create the chart
    majorChart = new Chart(ctx, config);
    // Fill with the real data and update it
    fillMajorData();
}
// Fills majorData then updates majorChart
function fillMajorData() {
    var i;

    // Set all major data at 0
    majorData.datasets.forEach(function (dataset) {
        dataset.data = dataset.data.map(function () {
            return 0;
        });
    });
    // Go through majorObj array
    for (i = 0; i < majorObj.length; i++) {
        // Get groups matching year selected
        var groups = groupObj.filter(function (data) {
            return data['anio'] == $('yearSelector').value && data['carrera_id'] == majorObj[i]['id'];
        });
        // Increment number of students per year if a group matches
        for (var j = 0; j < groups.length; j++) {
            var k = Math.ceil(groups[j]['semestre'] / 2);
            if (k)
                majorData.datasets[k - 1]['data'][i] += groups[j]['alumnos'];
        }
    }

    majorChart.update();
}
// Prepares some elements of the interface
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
