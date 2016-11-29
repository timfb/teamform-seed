
$("#obj").width($(window).width());
$("#obj").height($(window).height());

function fixSize() {
$("#obj").width($(window).width());
$("#obj").height($(window).height());
}

$( document ).ready(function() {
    fixSize();

    $("#search").click(function() {
    $("#obj").attr("data", "search.html");
   fixSize(); 
});

$("#chat").click(function() {
    $("#obj").attr("data", "Chatroom.html");
    fixSize();
});

$("#profile").click(function() {
        $("#obj").attr("data", "member.html");
        fixSize();
});

$("#team").click(function() {
        $("#obj").attr("data", "team.html");
        fixSize();
});

$("#create").click(function() {
    $("#obj").attr("data", "createGroup.html");
    fixSize();
});

$("#ads").click(function() {
    $("#obj").attr("data", "addpost.html");
    fixSize();
});

$("#logout").click(function() {
    firebase.auth().signOut().then(function() {
        var url = "index.html";
        window.location.href = url;
    }, function() {

    });
});
});

