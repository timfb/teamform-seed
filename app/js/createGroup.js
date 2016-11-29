var app = angular.module("createGroupApp", ["firebase"]);

app.controller("createGroupCtrl",
    function ($scope, $firebaseArray) {

        var ref = firebase.database().ref('teams');
        $scope.teamArr = $firebaseArray(ref);
        var ref = firebase.database().ref('members');
        $scope.members = $firebaseArray(ref);
        $scope.chatrooms = $firebaseArray(firebase.database().ref('chats'));

        $scope.user = null;
        $scope.userID = "";

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in.
                $scope.user = user;
                $scope.members.$loaded().then(function () {
                    angular.forEach($scope.members, function (e) {
                        if (e.uid == $scope.user.uid)
                            $scope.userID = e.id;
                    });
                });
            } else {
                // No user is signed in.
                showLoginDialog();
            }
        });

        $scope.team = {
            id: "",
            name: "",
            max: 2,
            destination: "",
            departure_date: "",
            return_date: "",
            preference: "",
            estimated_budget_per_person: "",
            descriptions: "",
            language_for_communication: "",
            members: [],
            tags: []
        };

        $scope.tempTeam = {
            id: "",
            name: "",
            max: 2,
            destination: "",
            departureDate: "",
            returnDate: "",
            preference: "N",
            estimatedBudgetPerPerson: 100,
            descriptions: "",
            languageForCommunication: "",
            members: [],
            tags: []
        };

        var createTeamObj = function (_id, _name, _max, _destination, _departureDate, _returnDate, _preference, _budget, _description, _language, _members, _tags) {
            this.id = _id;
            this.name = _name;
            this.max = _max;
            this.destination = _destination;
            _departureDate = _departureDate.split("/");
            _departureDate = _departureDate[2] + "-" + _departureDate[0] + "-" + _departureDate[1];
            this.departure_date = _departureDate;
            _returnDate = _returnDate.split("/");
            _returnDate = _returnDate[2] + "-" + _returnDate[0] + "-" + _returnDate[1];
            this.returnDate = _returnDate;
            this.preference = _preference;
            this.estimated_budget_per_person = _budget;
            this.descriptions = _description;
            this.language_for_communication = _language;
            this.members = _members;
            this.tags = _tags;
        };

        // $scope.tempMember = {
        // 	id: "0001"
        // };

        $scope.setId = function () {
            var numOfTeam = $scope.teamArr.length + 1;
            if (numOfTeam < 10) {
                $scope.tempTeam.id = "g000" + numOfTeam;
            } else if (numOfTeam < 100) {
                $scope.tempTeam.id = "g00" + numOfTeam;
            } else if (numOfTeam < 1000) {
                $scope.tempTeam.id = "g0" + numOfTeam;
            } else if (numOfTeam.id < 10000) {
                $scope.tempTeam.id = "g" + numOfTeam;
            }
        };

		/***********************************************************************
			set team name:
			1. can't be empty
			-->2. can't use the same name again
				- compare with all team.name in firebase
			3. not less than 3 words and not longer than 50 words
		************************************************************************/
        $scope.setTeamName = function () {
            if ($scope.tempTeam.name == "") {
                alert("Team name: cannot be empty!");
                return false;
            } else if ($scope.tempTeam.name.length < 3) {
                alert("Team name: should be shorter than 3 words!");
                return false;
            } else if ($scope.tempTeam.name.length > 50) {
                alert("Team name: should not be longer than 50 words!");
                return false;
            }

            return true;
        };

        // set maximun number of team member
        $scope.setMaxTeamMember = function () {
          
            if ($scope.tempTeam.max > 20 ) {
                alert("Our website can only form a group with not more than 20 members.");
                return false;
            } else if ($scope.tempTeam.max < 2 ) {
                alert("Our website can only form a group with more than 2 members");
                return false;
            }

            return true;
        };

        // set sex perference: M = Male, F = Female, N = No perference
        $scope.setSexPreference = function (sexPreference) {
            $scope.tempTeam.preference = sexPreference;
        };

        // set budget per person
		/**************************************************************************
			1. In US dollars
			2. $100 <= budget <= $100000
		***************************************************************************/
        $scope.setEstimateBudgetPerPerson = function () {
            if ($scope.tempTeam.estimatedBudgetPerPerson < 100) {
                $scope.tempTeam.estimatedBudgetPerPerson = 100;
                alert("Budget per groupmate: should not be less than $100.");
                return false;
            } else if ($scope.tempTeam.estimatedBudgetPerPerson > 100000) {
                $scope.tempTeam.estimatedBudgetPerPerson = 100;
                alert("Budget per groupmate: should not be larger than 100000.");
                return false;
            }

            return true;
        };

        // set destination
        $scope.setDestination = function () {
            if ($scope.tempTeam.destination == "") {
                alert("Destination: Please choose one country as your destination.");
                return false;
            };

            return true;
        };

        // set main language for communication
        $scope.setLanguageForCommunication = function () {
            if ($scope.tempTeam.languageForCommunication == "") {
                alert("Language: Please choose one language as your main communication language.");
                return false;
            };

            return true;
        };

        // set departure date 
        $(document).ready(function () {
            $("#departureDate").datepicker();
        });

  	/****************************************************************************
		1. make sure the choosen date will not before the today
			- compare year
				-if year < today year retunr
				-if year > today year store
				-if year == today year check month
					-compare month
						-if month < today month return
						-if month > today month store
						-if month == today month check day
							-compare date
								-if day <= today day return
								-if day > today day store
  	*****************************************************************************/
        // var testInVaildDate = function (selectedDate, todayDate) {
        // 	if (selectedDate >= todayDate) {
        // 		return false;
        // 	} else if (selectedDate < todayDate) {
        // 		return true;
        // 	}
        // };
        var testInVaildDate = function (selectedDate) {
            if (Utils.compareDate(new Date().toUTCString(), selectedDate) >= 0)
                return true;
            return false;
        };

        $scope.setDepartureDate = function () {
            var partitionDate = $scope.tempTeam.departureDate.split("/");
            var intPartitionDate = [];
            for (var i = 0; i < 3; i++) {
                intPartitionDate.push(parseInt(partitionDate[i]));
            }

            if ($scope.tempTeam.departureDate == "") {
                alert("Departure date: Cannot be empty.");
                return false;
            } else if (testInVaildDate(new Date(Date.UTC(intPartitionDate[2], intPartitionDate[0] - 1, intPartitionDate[1], 0, 0, 0, 0)))) {
                alert("Cannot choose a date in the past!");
                return false;
            }

            return true;
        };

        //set return date
        $(document).ready(function () {
            $("#returnDate").datepicker();
        });

        //Change date from string to int array
        var changeDateFromStringToIntArray = function (dateString) {
            var partitionDate = dateString.split("/");
            var intPartitionDate = [];
            for (var i = 0; i < 3; i++) {
                intPartitionDate.push(parseInt(partitionDate[i]));
            }
            return intPartitionDate;
        };

        $scope.setReturnDate = function () {
            var departureDateArray = changeDateFromStringToIntArray($scope.tempTeam.departureDate);
            var returnDateArray = changeDateFromStringToIntArray($scope.tempTeam.returnDate);


            if ($scope.tempTeam.returnDate == "") {
                alert("Return date: Cannot be empty.");
                return false;
            } else {

            }
            // } else if (testInVaildDate(returnDateArray[2], departureDateArray[2])) {
            // 	alert("Return date: Cannot choose a year in the past.");
            // 	return false;
            // } else if (testInVaildDate(returnDateArray[0], departureDateArray[0])) {
            // 	alert("Return date: Cannot choose a month in the past.");
            // 	return false;
            // } else if (testInVaildDate((returnDateArray[1] - 1), departureDateArray[1])) {
            // 	alert("Return date: Cannot choose a day in the past.");
            // 	return false;
            // }

            return true;
        };

        $scope.setMember = function () {
            var memberId = document.getElementById('memberId').value;

            if (memberId == "") {
                alert("memberId cannot be empty.");
                return;
            }

            if (memberId.length != 4) {
                alert("invaild member Id.");
                return;
            }

            var inGroup = false;

            $scope.tempTeam.members.forEach(function (element) {
                if (element == memberId) {
                    inGroup = true;
                    return;
                }
            })

            if (inGroup == true) {
                alert("Member " + memberId + " already in your group.");
                return;
            }

            var haveMember = false;

            angular.forEach($scope.members, function (value) {

                if (value.id == memberId) {
                    haveMember = true;
                }
            });

            if (haveMember == false) {
                alert("Member cannot be found");
                return;
            }

            $scope.tempTeam.members.push(memberId);
        };

        $scope.setTag = function () {
            var tag = document.getElementById('tags').value;

            if (tag == "") {
                alert("Tag cannot be empty.");
                return;
            }

            var inTags = false;

            $scope.tempTeam.tags.forEach(function (element) {
                if (element == tag) {
                    inTags = true;
                    return;
                }
            })

            if (inTags == true) {
                alert(tag + " have already been added");
                return;
            }

            $scope.tempTeam.tags.push(tag);
        };

        // add group into firebase
        $scope.createGroup = function () {
            $scope.user = firebase.auth().currentUser;
            if (!$scope.user) {
                showLoginDialog();
                return;
            }

            if ($scope.setTeamName() && $scope.setMaxTeamMember() && $scope.setEstimateBudgetPerPerson() && $scope.setDestination() && 
                $scope.setLanguageForCommunication() && $scope.setDepartureDate() && $scope.setReturnDate()) {
                $scope.setId();
                $scope.tempTeam.members.push($scope.userID);
                var obj = new createTeamObj($scope.tempTeam.id, $scope.tempTeam.name, $scope.tempTeam.max, $scope.tempTeam.destination, $scope.tempTeam.departureDate,
                    $scope.tempTeam.returnDate, ($scope.tempTeam.preference == 'N' ? 'Both' : $scope.tempTeam.preference == 'M' ? 'Male' : 'Female'),
                    $scope.tempTeam.estimatedBudgetPerPerson, $scope.tempTeam.descriptions, $scope.tempTeam.languageForCommunication, $scope.tempTeam.members, $scope.tempTeam.tags);
                $scope.teamArr.$ref().child($scope.teamArr.length).set(obj);

                $scope.chatrooms.$loaded().then(function () {
                    var obj = {
                        name: "[Team] " + $scope.tempTeam.name,
                        list: $scope.tempTeam.members,
                        messages: [{
                            sender: "System",
                            message: "Welcome to this new chat group!",
                            time: new Date().toUTCString()
                        }]
                    };
                    $scope.chatrooms.$ref().child($scope.chatrooms.length).set(obj);
                });
            } else {
                alert("Please enter the information again.");
            }

        };



    });


function showLoginDialog() {
    $("#loginDialog").removeClass("hide");
}

function hideLoginDialog() {
    $("#loginDialog").addClass("hide");
}

//redirect
function goToLoginPage() {
    window.location.href = "index.html";
}