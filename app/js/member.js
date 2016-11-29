                $("#modifyDialog").dialog();
                $("#modifyDialog").dialog('close');

angular.module("member", ["firebase"])
    .controller("memCtrl", function($scope, $firebaseArray) {
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyAlt_yl9mLcadDyhjtT2h4Ct9DDCxjGL4M",
            authDomain: "comp3111-5fbe5.firebaseapp.com",
            databaseURL: "https://comp3111-5fbe5.firebaseio.com",
            storageBucket: "comp3111-5fbe5.appspot.com",
            messagingSenderId: "946291658553"
        };
        firebase.initializeApp(config);
        var memberId = getURLParameter("memberId");
        var ref = firebase.database().ref("members");
        var refT = firebase.database().ref("teams");
        $scope.mems = $firebaseArray(ref);
        $scope.teams = $firebaseArray(refT);
        $scope.user = null;
        $scope.teamsJoined = [];
        $scope.membersAll = [];
        $scope.modiUser = null;
        $scope.modiIndex = 0;

        $scope.checkAuth = function(index) {
            var user = firebase.auth().currentUser;
            var modiUser = $scope.user;
            var userNew = null;

            for(var i = 0; i < $scope.mems.length; i++) {
                if($scope.mems[i].uid == user.uid && $scope.mems[i] != undefined) {
                    userNew = $scope.mems[i];
                    $scope.modiUser = userNew;
                    $scope.modiIndex = i;
                }
            }

            var can = false;
            if(modiUser.id == userNew.id) {
                can = true;
            } else {
                alert("You are not authorized to modify other accounts!");
                return;
            }

            if(can == true) {
                // fill in data from userNew
                // avali, gender, Eng, Can, Chi, nation, date, pImg
                $("#avali").prop( "checked", userNew.available_for_traveling);

                for(var i = 0; i < userNew.language.length; i++) {
                    if(userNew.language[i] == $("#Eng").attr("value")) {
                $("#Eng").prop( "checked", true);
                    } else if(userNew.language[i] == $("#Can").attr("value")) {
                $("#Can").prop( "checked", true);
                    } else if(userNew.language[i] == $("#Chi").attr("value")) {
                $("#Chi").prop( "checked", true);
                    }
                }
                console.log(userNew.from);
                $("#nation").val(userNew.from);

                $("#modifyDialog").dialog({position: ['center',20]});              
            }
        };
        
        $("#modiForm").submit(function(event) {
            var aval = $("#avali").prop("checked");
            var lan1 = $("#Eng").prop("checked");
            var lan2 = $("#Can").prop("checked");
            var lan3 = $("#Chi").prop("checked");
            var na =    $("#nation").val();

            var arr = [];
            if(lan1 == true) {
                arr.push("English");
            }

            if(lan2 == true) {
                arr.push("Cantonese");
            }

            if(lan3 == true) {
                arr.push("Chinese");
            }
           // $scope.modiUser
                        $input = {
                                available_for_traveling: aval,
                                birthday: $scope.modiUser.birthday,
                                descriptions: $scope.modiUser.descriptions,
                                email: $scope.modiUser.email,
                                first_name: $scope.modiUser.first_name,
                                from: na,
                                gender: $scope.modiUser.gender,
                                uid: $scope.modiUser.uid,
                                id: $scope.modiIndex,
                                language: arr,
                                last_name: $scope.modiUser.last_name,
                                profile_pic: $scope.modiUser.profile_pic
                            }

                            $scope.mems.$ref().child($scope.modiIndex).set($input).then(function() {
                                alert("Success!");
                                $("#modifyDialog").dialog("close");
                            });
        });

        firebase.auth().onAuthStateChanged(function(user) {
            $scope.mems.$loaded()
                .then(function(x) {
                    $scope.membersAll = $scope.mems;
                    var loggedInId = "";
                    if (user) {
                        var email = user.email;
                        var canStop = false;
                        if (memberId != null && memberId.trim().length != 0 && user != null && memberId != undefined) {
                            $scope.user = $scope.mems[memberId];
                            canStop = true;
                        }

                        if(canStop == false)
                        for (var i = 0; i < $scope.mems.length; i++) {
                            // console.log($scope.mems[i].email + " vs " + email);
                            if ($scope.mems[i].email == email) {
                                $scope.user = $scope.mems[i];
                                loggedInId = i;
                                break;
                            }
                        }
                        // console.log(user);
                    } else {
                        // No user is signed in.
                    }

                    $scope.teams.$loaded()
                        .then(function(x) {
                            if (user) {
                                var memberId_searched = "";
                                    if (memberId != null && memberId.trim().length != 0 && user != null && memberId != undefined) {
                                        memberId_searched = memberId;
                                    } else {
                                        memberId_searched = loggedInId;
                                    }
                                // console.log(memberId_searched);

                                for (var i = 0; i < $scope.teams.length; i++) {
                                    // console.log($scope.mems[i].email + " vs " + email);
                                    var members = $scope.teams[i].members;
                                    var len = $scope.teams[i].members.length;
                                    for (var j = 0; j < len; j++) {
                                        if(members[j] == memberId_searched) {
                                            $scope.teamsJoined.push($scope.teams[i]);
                                            break;
                                        }
                                    }
                                }

                                // console.log($scope.teamsJoined);
                                // console.log(user);
                            } else {
                                // No user is signed in.
                            }
                        })
                        .catch(function(error) {
                            console.log("Error:", error);
                        });
                })
                .catch(function(error) {
                    console.log("Error:", error);
                });
        });
    });