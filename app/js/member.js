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

        $scope.checkAuth = function(index) {
            var user = firebase.auth().currentUser;
            var modiUser = $scope.user;
            var userNew = null;

            for(var i = 0; i < $scope.mems.length; i++) {
                console.log($scope.mems[i].uid + " vs " + user.uid);
                if($scope.mems[i].uid == user.uid) {
                    userNew = $scope.mems[i];
                    $scope.modiUser = userNew;
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
                $("#modifyDialog").dialog();

                // fill in data from userNew
                
            }
        };
        
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