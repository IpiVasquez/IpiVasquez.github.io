function tabHandler() {
    // Get target
    var target = $(this).attr('href');
    $(target).fadeIn(300);
    $(target).siblings().css({display: 'none'});
    // Changes active tab
    $(this).addClass('is-active');
    $(this).siblings().removeClass('is-active');

    return false;
}

function prepareShell() {
    // Prepare tabs and menu drawer
    $('#nav-large').clone().appendTo('#nav-small');
    $('nav.mdl-navigation a.mdl-navigation__link').click(tabHandler);
}

$(document).ready(prepareShell);
