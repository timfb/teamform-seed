$(document).ready(function() {

    window.fbAsyncInit = function() {
        FB.init({
            appId: '1695218640719140',
            xfbml: true,
            version: 'v2.0'
        });
    };

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
    $("#loginByMailAndPwDialog").dialog();
    $("#regDialog").dialog();
    $("#dialog").dialog('close');
    $("#loginByMailAndPwDialog").dialog('close');
    $("#regDialog").dialog('close');

    var asked = false;
    var isLoggedIn = false;
    var user;
    var token;

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBQs7H6uLgwYFjxp5CMFOapbKqYM2QaZpc",
        authDomain: "testfblogin-27fb7.firebaseapp.com",
        databaseURL: "https://testfblogin-27fb7.firebaseio.com",
        storageBucket: "testfblogin-27fb7.appspot.com",
        messagingSenderId: "644077378898"
    };
    firebase.initializeApp(config);

    var storageRef = firebase.storage().ref();

    function checkCurUser() {
        var user = firebase.auth().currentUser;
        if (user) {
            console.log(user);
        }
        return user;
    }


    function popupLogin() {
        var provider = new firebase.auth.FacebookAuthProvider();
        // popup
        firebase.auth().signInWithPopup(provider).then(function(result) {
            token = result.credential.accessToken;
            user = result.user;

            // debug messages
            console.log(result);

            $("#log").text("Logout");
            $("#log").css('color', '#990000');

            isLoggedIn = true;

            FB.login(function(response) {
                // handle the response
                console.log(response);
            }, {
                scope: 'public_profile,user_birthday',
                return_scopes: true
            });

            FB.api(
                '/' + user.providerData[0].uid, {
                    fields: "id,about,age_range,picture,bio,birthday,context,email,first_name,gender,hometown,link,location,middle_name,name,timezone,website,work"
                },
                function(response) {
                    console.log(response);
                } // , 
                // {access_token: token}
            );

        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;

            // debug messages
            console.log(errorCode);
            console.log(errorMessage);

            isLoggedIn = false;

            $("#log").text("Login");
            $("#log").css('color', '#009900');

            // if the user close the login popup and igore the login process, give it a login button
            if (errorCode == "auth/popup-closed-by-user") {}

        });
    }


    $("#log").text("Login");
    $("#log").css('color', '#009900');


    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // logged in, I should permit it to proceed and holding its info.
            console.log("logged in :)");

            asked = true;
            isLoggedIn = true;

            $("#log").text("Logout");
            $("#log").css('color', '#990000');
        } else {
            // not yet login, I should just pop up a Facebook login page
            console.log("not yet login :(");

            $("#log").text("Login");
            $("#log").css('color', '#009900');

            isLoggedIn = false;
        }
    });

    $("#loginByMailAndPwForm").submit(function(event) {
        if ($.trim($("#email").val()).length < 0 || $.trim($("#password").val()).length <= 0) {
            alert("Something missing!");
            return;
        }

        var email = $("#email").val();
        var password = $("#password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
            $("#dialog").dialog('close');
            $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');

            $("#email").val("");
            $("#password").val("");
            alert("Nice to see you again");

            $("#log").text("Logout");
            $("#log").css('color', '#990000');

            isLoggedIn = true;


            console.log('logged in:', user);
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            // dubug msgs
            console.log(errorCode);
            console.log(errorMessage);

            if (errorCode == "auth/invalid-email") {
                alert("Email format not correct!");
            } else {
                alert("Email or password is wrong!");
            }
        });
    });

    $("#regDialog").submit(function(event) {
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

        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
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

            if ($("#pImg").val().length > 0) {
                var file = $('#pImg')[0].files[0];
                // console.log(file);

                var imagesRef = storageRef.child(email);

                imagesRef.put(file).then(function(snapshot) {
                    console.log(snapshot);
                    var URL = snapshot.downloadURL;

                    user.updateProfile({
                        displayName: name,
                        photoURL: URL,
                        birthday: bDate
                    }).then(function() {
                        // Update successful.
                    }, function(error) {
                        // An error happened.
                    });
                });
            }

            user.updateProfile({
                displayName: name,
                birthday: bDate
            }).then(function() {
                // Update successful.
            }, function(error) {
                // An error happened.
            });

        }).catch(function(error) {
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

    function previewMethod(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                $('#preview').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        } else {
            $('#preview').attr('src', "#");
        }
    }

    $("#pImg").change(function() {
        previewMethod(this);
    });


    $("#log").click(function() {

        if ($("#log").text() == "Login") {
            $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');
            $("#dialog").dialog();
            console.log("want to login");
        } else {
            // logout
            firebase.auth().signOut().then(function() {
                console.log("Logged out!");
                $("#log").text("Logout");
                $("#log").css('color', '#990000');
                isLoggedIn = false;
                alert("Logout! See you again :)");
            }, function(error) {});
        }
    });

    $("#loginByFb").click(function() {
        if (isLoggedIn == false) {
            popupLogin();
            $("#dialog").dialog('close');
            $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog('close');
        } else {
            alert("You have logged in!");
        }
    });

    $("#loginByMailAndPw").click(function() {
        if (isLoggedIn == false) {
            $("#dialog").dialog('close');
            $("#regDialog").dialog('close');
            $("#loginByMailAndPwDialog").dialog();
        } else {
            alert("You have logged in!");
        }
    });

    $("#reg").click(function() {
        if (isLoggedIn == false) {
            $("#dialog").dialog('close');
            $("#loginByMailAndPwDialog").dialog('close');
            $("#regDialog").dialog();
        } else {
            alert("You have logged in!");
        }
    });

    $("#btn_admin").click(function() {
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

    $("#btn_leader").click(function() {
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

    $("#btn_member").click(function() {
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
});

/*
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="keywords" content="teamform, team">
    <!-- The meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>teamform - A real-time online team forming app</title>

    <!-- libraries and CSS      
      JQuery: Necessary for some bootstrap interactions (v1.12.4 is used)     
      Bootstrap: Library and CSS for bootstrap framework (v3.3.7 is used)
      Font-awesome: More icons for the web development (v4.6.3 is used)    
      site.css: A customized css for our web application. Not from any web framework. 
   -->

    <script src="lib/jquery.min.js"></script>
    <script src="lib/bootstrap.min.js"></script>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">

    <!-- Customized libraries shared by pages -->
    <script src="js/site.js"></script>



</head>

<body>

    <style>
        #forkongithub a {
            background: #000;
            color: #fff;
            text-decoration: none;
            font-family: arial, sans-serif;
            text-align: center;
            font-weight: bold;
            padding: 5px 40px;
            font-size: 1rem;
            line-height: 2rem;
            position: relative;
            transition: 0.5s;
        }
        
        #forkongithub a:hover {
            background: #c11;
            color: #fff;
        }
        
        #forkongithub a::before,
        #forkongithub a::after {
            content: "";
            width: 100%;
            display: block;
            position: absolute;
            top: 1px;
            left: 0;
            height: 1px;
            background: #fff;
        }
        
        #forkongithub a::after {
            bottom: 1px;
            top: auto;
        }
        
        @media screen and (min-width:800px) {
            #forkongithub {
                position: fixed;
                display: block;
                top: 0;
                right: 0;
                width: 200px;
                overflow: hidden;
                height: 200px;
                z-index: 9999;
            }
            #forkongithub a {
                width: 200px;
                position: absolute;
                top: 60px;
                right: -60px;
                transform: rotate(45deg);
                -webkit-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
                -moz-transform: rotate(45deg);
                -o-transform: rotate(45deg);
                box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.8);
            }
        }
    </style><span id="forkongithub"><a href="https://github.com/hkpeterpeter/teamform-seed" target="_blank">Fork me on GitHub</a></span>




    <div class="navbar-wrapper">

        <div class="container">
            <nav class="navbar navbar-static-top navbar-default">
                <div class="container">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                     <span class="sr-only">Toggle navigation</span>
                     <span class="icon-bar"></span>
                     <span class="icon-bar"></span>
                     <span class="icon-bar"></span>
                  </button>
                        <a class="navbar-brand" href="#">teamform</a>
                    </div>
                    <div id="navbar" class="navbar-collapse collapse">
                        <ul class="nav navbar-nav">

                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Menu <span class="caret"></span></a>
                                <ul class="dropdown-menu">
                                    <li><a href="#page_about">About teamform</a></li>
                                    <li>
                                        <a href="#page_team">Development team</a>
                                    </li>
                                    <li role="separator" class="divider"></li>
                                    <li><a href="#" id="log">Log In</a></li>
                                </ul>
                            </li>

                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Coverage <span class="caret"></span></a>

                                <ul class="dropdown-menu">
                                    <li>
                                        <a href="coverage/index.html" target="_blank">Report</a>
                                    </li>
                                    <li role="separator" class="divider"></li>

                                    <li>
                                        <a href="unit_tests/test_site.js" target="_blank">test_site.js (sample)</a>
                                    </li>

                                    <li><a href="#">TODO: Add more test cases here... </a></li>
                                </ul>
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </div>
    <!-- A sample login page -->
    <div class="container" id="page_home">
        <div class="row">
            <div class="col-md-12">
                <div class="row">
                    <div class="col-md-12">

                        <div class="text-center">
                            <h1>teamform</h1>
                            <p>A real-time online team forming app for any event</p>
                        </div>

                        <br>

                        <div class="text-center">

                            <input id="input_text" type="text" class="input-lg">
                            <br>
                            <em>Enter a name (e.g. COMP3111-L1, COMP3111-L2 or COMP3111H) to create/join an event</em>
                            <br>
                            <br>

                            <div>

                                <button id="btn_admin" type="button" class="btn btn-primary">Administrator</button>



                                <button id="btn_leader" type="button" class="btn btn-primary">Team Leader</button>

                                <button id="btn_member" type="button" class="btn btn-primary">Member</button>



                            </div>
                        </div>
                        <br>




                        <br>
                    </div>
                </div>
                <hr>
            </div>
        </div>
    </div>
    <!-- Marketing messaging and featurettes
      ================================================== -->
    <!-- Wrap the rest of the page in another container to center all the content. -->
    <div class="container marketing">


        <!-- START THE FEATURETTES -->
        <div class="row featurette" id="page_about">
            <div class="col-md-12">
                <h2 class="featurette-heading">What is teamform?
                    <br>
                    <span class="text-muted">A real-time online team forming app</span>
                </h2>
                <p class="lead"> The following roles are supported in teamform:
                </p>

                <div class="row">
                    <div class="col-md-4">
                        <h3 class="text-center">Administrator</h3>
                        <ul>
                            <li>Be responsible for creating an event for team forming (e.g. COMP3111, COMP3111H, hackUST)</li>
                            <li>Be able to set the minimum and maximum team size for the event (e.g. 5..7 team members in COMP3111 and 5..8 team members in COMP3111H)</li>
                        </ul>
                    </div>

                    <div class="col-md-4">
                        <h3 class="text-center">Team</h3>
                        <ul>
                            <li>Be able to add and remove requests made by members</li>
                            <li>Once a member joins the team, all his/her requests will be deleted</li>
                        </ul>
                    </div>

                    <div class="col-md-4">
                        <h3 class="text-center">Member</h3>
                        <ul>
                            <li>Be able to request to join multiple teams</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
        <hr class="featurette-divider">

        <!-- START THE FEATURETTES -->
        <div class="row featurette" id="page_team">
            <div class="col-md-12">
                <h2 class="featurette-heading">Development Team
                    <br>
                    <span class="text-muted">[Your Team Name]</span>
                </h2>


                <div class="row">


                    <div class="col-xs-6 col-md-3">
                        <div class="thumbnail text-center">
                            <img src="https://placeholdit.imgix.net/~text?txtsize=33&txt=member1&w=150&h=150" class="img-circle img-responsive">
                            <div class="caption">
                                <h4>[Your name]</h4>
                                <p>[ITSC email]</p>

                            </div>
                        </div>
                    </div>

                    <div class="col-xs-6 col-md-3">
                        <div class="thumbnail text-center">
                            <img src="https://placeholdit.imgix.net/~text?txtsize=33&txt=member2&w=150&h=150" class="img-circle img-responsive">
                            <div class="caption">
                                <h4>[Your name]</h4>
                                <p>[ITSC email]</p>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>

        <!-- /END THE FEATURETTES -->
        <!-- FOOTER -->
        <hr>
        <footer>
            <p class="pull-right"><a href="#">Back to top</a></p>
            <p>&copy; 2017 COMP3111/H teaching team </p>
            <p>Powered by <a href="http://getbootstrap.com/" target="_blank">Bootstrap</a></p>
        </footer>
    </div>
    <!-- /.container -->

    <div id="dialog" title="Please choose your login method">
        <button id="loginByFb">Facebook Login</button>
        <button id="loginByMailAndPw">Email Login</button>
        <button id="reg">Register</button>
    </div>

    <div id="loginByMailAndPwDialog" title="Please Login">
        <form id="loginByMailAndPwForm">
            Email: <input type="text" id="email"><br> Password: <input type="password" id="password"><br>
            <input type="submit" value="Login">
        </form>
    </div>

    <div id="regDialog" title="Please Login">
        <form id="loginByMailAndPwForm">
            Email: <input type="text" id="emailReg"><br> Name: <input type="text" id="name"><br> Password: <input type="password" id="passwordReg"><br> Password again: <input type="password" id="passwordAgainReg"><br> Birthday: <input type="date" id="date"><br> Profile picture: <input type="file" id="pImg"><br> Preview: <img id="preview" src="#" alt="preview" width="60" height="60" />

            <input type="submit" value="Register">
        </form>
    </div>

    <script src="https://www.gstatic.com/firebasejs/3.5.3/firebase.js"></script>
    <!-- JavaScript of this page -->
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

    <script src="js/index.js"></script>


</body>

</html>
*/