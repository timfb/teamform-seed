// Initialize Firebase
var config = {
    apiKey: "AIzaSyAlt_yl9mLcadDyhjtT2h4Ct9DDCxjGL4M",
    authDomain: "comp3111-5fbe5.firebaseapp.com",
    databaseURL: "https://comp3111-5fbe5.firebaseio.com",
    storageBucket: "comp3111-5fbe5.appspot.com",
    messagingSenderId: "946291658553"
};
firebase.initializeApp(config);

var storageRef = firebase.storage().ref();
var dbRef = firebase.database().ref("members");
var num = 0;
var snap = function(snapshot) {
    num = snapshot.numChildren();
};
firebase.database().ref("members").on("value", snap);
var app = angular.module("login", ["firebase"]);
app.controller("LoginController",
    function($scope) {
        $scope.emailText = "";
        $scope.pwText = "";
        $scope.loggedIn = false;

        $scope.checkPwTyped = function() {
            if ($.trim(($scope.password)) <= 0) {
                $scope.pwText = "Invalid Input";
                $("#pwText").css("color", "red");
            } else {
                $scope.pwText = "Okay";
                $("#pwText").css("color", "green");
            }
        };

        $scope.checkEmailTyped = function() {
            if ($.trim(($scope.email)) <= 0 || $scope.email.indexOf("@") < 0 || $scope.email.indexOf(".") < 0) {
                $scope.emailText = "Invalid Input";
                $("#emailText").css("color", "red");
            } else {
                $scope.emailText = "Okay";
                $("#emailText").css("color", "green");
            }
        };

        $scope.loggedIn = isLoggedIn;

        $scope.loginUser = function() {
            // $("#dialog").dialog('close');
            // $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');

            $("#email").val("");
            $("#password").val("");
            alert("Nice to see you again");

            $("#log").text("Logout");
            $("#log").css('color', '#990000');

            isLoggedIn = true;
            $scope.loggedIn = isLoggedIn;

            // console.log('logged in:', user);
        };

        $scope.loginError = function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            // dubug msgs
            // console.log(errorCode);
            // console.log(errorMessage);


            alert("Email or password is wrong!");
        };

        $scope.test = function(email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password).then($scope.loginUser).catch($scope.loginError);
        }

        $scope.submit = function() {
            if ($.trim($scope.email).length <= 0 || $.trim($scope.password).length <= 0) {
                alert("Something missing!");
                return;
            }

            var email = $scope.email;
            var password = $scope.password;

            $scope.test(email, password);

        }
    });

// var appp = angular.module("reg", []);
app.controller("RegController",
    function($scope, $firebaseArray) {
        $scope.emailTextReg = "";
        $scope.gender = 'male';
        $scope.avali = true;
        $scope.nation = 'chinese';
        $scope.members = $firebaseArray(dbRef);
        $scope.langs = [{
            name: 'Chinese',
            selected: true
        }, {
            name: 'English',
            selected: false
        }, {
            name: 'Cantonese',
            selected: false
        }];

        $scope.checkEmailTypedd = function() {
            if ($.trim(($scope.emailReg)) <= 0 || $scope.emailReg.indexOf("@") < 0 || $scope.emailReg.indexOf(".") < 0) {
                $scope.emailTextReg = "Invalid Input";
                $("#emailTextReg").css("color", "red");
            } else {
                $scope.emailTextReg = "Okay";
                $("#emailTextReg").css("color", "green");
            }
        };

        $scope.createUser = function(user) {

            var email = $scope.emailReg;
            var password = $scope.passwordReg;
            var bDate = $("#date").val();
            var name = $scope.namee;
            var nameLast = $scope.nameee;

            // $("#dialog").dialog('close');
            // $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');

            $scope.emailReg = "";
            $scope.passwordReg = "";
            $scope.date = "";
            $scope.namee = "";
            $("#email").val("");
            $("#password").val("");
            $("#date").val("");
            $("#name").val("");
            $("#nameLast").val("");

            alert("Welcome!");

            $("#log").text("Logout");
            $("#log").css('color', '#990000');

            isLoggedIn = true;

            if (true) {

                var file = "";
                if ($("#pImg").val() != null)
                    file = $('#pImg')[0].files[0];
                else {
                    file = new File([""], "filename.txt", {
                        type: "image/jpeg",
                        lastModified: "1463230326000",
                        lastModifiedDate: "Sat May 14 2016 20:52:06 GMT+0800 (HKT)",
                        size: "55609",
                        webkitRelativePath: "",
                        name: "fake"
                    });
                }
                console.log(file);

                var imagesRef = storageRef.child(email);

                if ($scope.nofile == false) {
                    imagesRef.put(file).then(function(snapshot) {
                        // console.log(snapshot);
                        var URL = snapshot.downloadURL;

                        user.updateProfile({
                            displayName: name + "" + nameLast,
                            photoURL: URL,
                            birthday: bDate
                        }).then(function() {
                            // Update successful.
                            console.log(bDate);
                            // construct JSON for Database
                            $scope.input = {
                                available_for_traveling: true,
                                birthday: bDate,
                                descriptions: "",
                                email: email,
                                first_name: name,
                                from: $scope.nation,
                                gender: $scope.gender,
                                has_been: [],
                                uid: user.uid,
                                id: $scope.members.length,
                                language: [],
                                last_name: nameLast,
                                profile_pic: URL,
                                want_to_travel: []
                            }

                            for ($k = 0; $k < $scope.langs.length; $k++) {
                                if ($scope.langs[$k].selected) {
                                    $scope.input.language.push($scope.langs[$k].name);
                                }
                            }

                            console.log($scope.input);

                            // $scope.members.$add($scope.input);
                            // console.log($scope.members.length);
                            $scope.members.$ref().child($scope.members.length).set($scope.input);

                        }, function(error) {
                            // An error happened.
                        });
                    });
                }
            }
        };

        $scope.createUserError = function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            // console.log(errorMessage);

            if (errorCode == "auth/email-already-in-use") {
                alert("Email is already registered");
            } else if (errorCode == "auth/invalid-email") {
                alert("Email format not correct!");
            } else {
                alert("Password is too weak, don't be afraid of hackers?");
            }
        };

        $scope.nofile = false;
        $scope.testingFile = true;
        $scope.submit = function() {
            if (($("#pImg").val() == undefined) && $scope.testingFile == true) {
                $scope.nofile = true;
            }
            if ($scope.nofile == true) {
                if ($.trim($scope.emailReg).length < 0 || $.trim($scope.namee).length <= 0 || $.trim($scope.nameee).length <= 0 ||
                    $.trim($scope.passwordReg).length <= 0 || $.trim($scope.passwordAgainReg).length <= 0 ||
                    $.trim($scope.date).length <= 0) {
                    alert("Something missing!");
                    return;
                } else if ($.trim($scope.passwordReg) != $.trim($scope.passwordAgainReg)) {
                    alert("Password is not consistant!");
                    return;
                } else if ($.trim($scope.passwordReg).length < ($scope.passwordReg).length || $.trim($scope.passwordAgainReg).length < ($scope.passwordAgainReg).length) {
                    alert("Password should not contain any space!");
                    return;
                }
            } else {
                if ($.trim($scope.passwordReg).length < ($scope.passwordReg).length || $.trim($scope.passwordAgainReg).length < ($scope.passwordAgainReg).length) {
                    alert("Password should not contain any space!");
                    return;
                } else if ($.trim($scope.passwordReg) != $.trim($scope.passwordAgainReg)) {
                    alert("Password is not consistant!");
                    return;
                } else if ($.trim($scope.emailReg).length < 0 || $.trim($scope.namee).length <= 0 || $.trim($scope.nameee).length <= 0 ||
                    $.trim($scope.passwordReg).length <= 0 || $.trim($scope.passwordAgainReg).length <= 0 ||
                    $.trim($scope.date).length <= 0) {
                    alert("Something missing!");
                    return;
                }
            }

            var email = $scope.emailReg;
            var password = $scope.passwordReg;
            var bDate = $scope.date;
            var name = $scope.namee;
            var nameLast = $scope.nameee;

            firebase.auth().createUserWithEmailAndPassword(email, password).then($scope.createUser).catch($scope.createUserError);
        }
    });

var fber = function() {
    FB.init({
        appId: '1695218640719140',
        xfbml: true,
        version: 'v2.0'
    });
};

window.fbAsyncInit = fber;

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// init dialogs
$("#dialog").dialog();
// $("#loginByMailAndPwDialog").dialog();
$("#regDialog").dialog();
// $("#dialog").dialog('close');
// $("#loginByMailAndPwDialog").dialog('close');
$("#regDialog").dialog('close');

var asked = false;
var isLoggedIn = false;
var user;
var token;

function checkCurUser() {
    var user = firebase.auth().currentUser;
    // if (user) {
    // console.log(user);
    // }
    return user;
}

var fbAPIError = function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;

    // debug messages
    // console.log(errorCode);
    // console.log(errorMessage);

    isLoggedIn = false;

    $("#log").text("Login");
    $("#log").css('color', '#FFFFFF');

    // if the user close the login popup and igore the login process, give it a login button
    if (errorCode == "auth/popup-closed-by-user") {}

};

function popupLogin() {
    var provider = new firebase.auth.FacebookAuthProvider();
    // popup
    firebase.auth().signInWithPopup(provider).then(function(result) {
        token = result.credential.accessToken;
        user = result.user;

        // debug messages
        // console.log(result);

        $("#log").text("Logout");
        $("#log").css('color', '#990000');

        isLoggedIn = true;

        FB.login(function(response) {
            // handle the response
            // console.log(response);

            FB.api(
                '/' + response.authResponse.userID, {
                    fields: "id,about,age_range,picture,bio,birthday,context,email,first_name,last_name,gender,hometown,link,location,middle_name,name,timezone,website,work,locale"
                },
                function(response) {
                    // console.log(response);

                    // construct JSON for Database
                    $input = {
                        available_for_traveling: true,
                        birthday: response.birthday,
                        descriptions: "Hey! I'm using TravelBuddy!",
                        email: response.email,
                        first_name: response.first_name,
                        from: "",
                        gender: response.gender,
                        uid: user.uid,
                        id: num,
                        last_name: response.last_name,
                        profile_pic: response.picture.data.url,
                        has_been: [],
                        language: [],
                        want_to_travel: []
                    }

                    // console.log($input);
                    // console.log(num);

                    firebase.database().ref('members').child(num).set($input);
                    // firebase.database().ref('members/' + user.uid).set($input);

                } // , 
                // {access_token: response.authResponse.accessToken}
            );


        }, {
            scope: 'public_profile,user_birthday,user_about_me,user_location,user_hometown',
            return_scopes: true
        });

    }).catch(fbAPIError);
}


$("#log").text("Login");
$("#log").css('color', '#FFFFFF');

var stateChange = function(user) {
    if (user) {
        // logged in, I should permit it to proceed and holding its info.
        // console.log("logged in :)");

        asked = true;
        isLoggedIn = true;

        $("#log").text("Logout");
        $("#log").css('color', '#990000');
    } else {
        // not yet login, I should just pop up a Facebook login page
        // console.log("not yet login :(");

        $("#log").text("Login");
        $("#log").css('color', '#FFFFFF');

        isLoggedIn = false;
    }
};

firebase.auth().onAuthStateChanged(stateChange);
/*
    $("#loginByMailAndPwFormOld").submit(function (event) {
        if ($.trim($("#email").val()).length < 0 || $.trim($("#password").val()).length <= 0) {
            alert("Something missing!");
            return;
        }

        var email = $("#email").val();
        var password = $("#password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
            $("#dialog").dialog('close');
            $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');

            $("#email").val("");
            $("#password").val("");
            alert("Nice to see you again");

            $("#log").text("Logout");
            $("#log").css('color', '#990000');

            isLoggedIn = true;


            // console.log('logged in:', user);
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            // dubug msgs
            // console.log(errorCode);
            // console.log(errorMessage);

            if (errorCode == "auth/invalid-email") {
                alert("Email format not correct!");
            } else {
                alert("Email or password is wrong!");
            }
        });
    });

    $("#RegByMailAndPwFormOld").submit(function (event) {
        if ($.trim($("#emailReg").val()).length < 0 || $.trim($("#name").val()).length <= 0 ||
            $.trim($("#passwordReg").val()).length <= 0 || $.trim($("#passwordAgainReg").val()).length <= 0 ||
            $.trim($("#date").val()).length <= 0) {
            alert("Something missing!");
            return;
        } else if ($.trim($("#passwordReg").val()) != $.trim($("#passwordAgainReg").val())) {
            alert("Password is not consistant!");
            return;
        } else if ($.trim($("#passwordReg").val()).length < ($("#passwordReg").val()).length) {
            alert("Password should not contain any space!");
            return;
        }

        var email = $("#emailReg").val();
        var password = $("#passwordReg").val();
        var bDate = $("#date").val();
        var name = $("#name").val();

        firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
            $("#dialog").dialog('close');
            $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');

            $("#email").val("");
            $("#password").val("");
            $("#date").val("");
            $("#name").val("");

            alert("Welcome!");

            $("#log").text("Logout");
            $("#log").css('color', '#990000');

            isLoggedIn = true;

            if ($("#pImg").val().length > 0 && $scope.nofile == false) {
                var file = $('#pImg')[0].files[0];
                // console.log(file);

                var imagesRef = storageRef.child(email);

                if ($scope.nofile == false && 1 == 2) {
                    imagesRef.put(file).then(function (snapshot) {
                        // console.log(snapshot);
                        var URL = snapshot.downloadURL;

                        user.updateProfile({
                            displayName: name,
                            photoURL: URL,
                            birthday: bDate
                        }).then(function () {
                            // Update successful.
                        }, function (error) {
                            // An error happened.
                        });
                    });
                } else {
                    user.updateProfile({
                        displayName: name,
                        birthday: bDate
                    }).then(function () {
                        // Update successful.
                    }, function (error) {
                        // An error happened.
                    });
                }
            } else {
                user.updateProfile({
                    displayName: name,
                    photoURL: URL,
                    birthday: bDate
                }).then(function () {
                    // Update successful.
                }, function (error) {
                    // An error happened.
                });
            }

            user.updateProfile({
                displayName: name,
                birthday: bDate
            }).then(function () {
                // Update successful.
            }, function (error) {
                // An error happened.
            });

        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            if (errorCode == "auth/email-already-in-use") {
                alert("Email is already registered");
            } else if (errorCode == "auth/invalid-email") {
                alert("Email format not correct!");
            } else {
                alert("Password is too weak! Will you afraid of hackers?");
            }
        });
    });
*/

function previewMethod(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#preview').attr('src', e.target.result);
        }

        if (input.files[0] != "image")
            reader.readAsDataURL(input.files[0]);
    } else {
        $('#preview').attr('src', "#");
    }
}

var changeImg = function() {
    previewMethod(this);
};

var tester = "";
var tester2 = "logout";
$("#pImg").change(changeImg);

var logoter = function() {
    // console.log("Logged out!");
    $("#log").text("Logout");
    $("#log").css('color', '#990000');
    isLoggedIn = false;
    alert("Logout! See you again :)");
};

var logoterError = function(error) {};

var logoutFunc = function() {
    if (($("#log").text() == "Login" || tester == "login") && tester2 == "logout") {
        // $("#loginByMailAndPwDialog").dialog('close');
        $("#regDialog").dialog('close');
        // $("#dialog").dialog();
        console.log("want to login");
    } else {
        // logout
        firebase.auth().signOut().then(logoter, logoterError);
    }
};

$("#log").click(logoutFunc);

var loginByFbCall = function() {
    if (isLoggedIn == false) {
        popupLogin();
        // $("#dialog").dialog('close');
        // $("#loginByMailAndPwDialog").dialog('close');
        $("#regDialog").dialog('close');
    } else {
        alert("You have logged in!");
    }
};

$("#loginByFb").click(loginByFbCall);

var loginByEmailAndPw = function() {
    if (isLoggedIn == false) {
        // $("#dialog").dialog('close');
        $("#regDialog").dialog('close');
        // $("#loginByMailAndPwDialog").dialog();
    } else {
        alert("You have logged in!");
    }
};

// $("#loginByMailAndPw").click(loginByEmailAndPw);

var reger = function() {
    if (isLoggedIn == false) {
        // $("#dialog").dialog('close');
        // $("#loginByMailAndPwDialog").dialog('close');
        $("#regDialog").dialog();
    } else {
        alert("You have logged in!");
    }
};

$("#reg").click(reger);

/*
$("#btn_admin").click(function () {
    if (isLoggedIn == false) {
        alert("Please Login First :)");
    } else {
        var val = $('#input_text').val();
        if (val !== '') {
            var url = "admin.html?q=" + val;
            window.location.href = url;
            return false;
        }
    }
});

$("#btn_leader").click(function () {
    if (isLoggedIn == false) {
        alert("Please Login First :)");
    } else {
        var val = $('#input_text').val();
        if (val !== '') {
            var url = "team.html?q=" + val;
            window.location.href = url;
            return false;
        }
    }
});

$("#btn_member").click(function () {
    if (isLoggedIn == false) {
        alert("Please Login First :)");
    } else {
        var val = $('#input_text').val();
        if (val !== '') {
            var url = "member.html?q=" + val;
            window.location.href = url;
            return false;
        }

    }
});
*/