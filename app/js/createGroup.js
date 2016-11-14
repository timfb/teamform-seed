var app = angular.module("createGroupApp", ["firebase"]);

app.controller("createGroupCtrl",
 function($scope, $firebaseArray){
	//init Firebase
	//initalizeFirebase();

	//var ref = firebase.database().ref('created_group');
	//var teamList = $firebaseArray(ref);

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
		//id: "",
		name: "",
		max: 2,
		destination: "",
		departureDate: "",
		//return_date: "",
		preference: "N",
		estimatedBudgetPerPerson: 100,
		//descriptions: "",
		//languageForCommunication: "",
		//members: [],
		//tags: []
	};	
	/***********************************************************************
		set team name:
		1. can't be empty
		-->2. can't use the same name again
			- compare with all team.name in firebase
		3. not less than 3 words and not longer than 50 words
	************************************************************************/
	$scope.setTeamName = function(){
		if($scope.tempTeam.name == ""){
			alert("Team name cannot be empty!");
			return;
		}else if($scope.tempTeam.name.length < 3){
			alert("Team name should be shorter than 3 words!");
			return;
		}else if($scope.tempTeam.name.length > 50){
			alert("Team name should not be longer than 50 words!");
			return;
		}

		
	};

	// set maximun number of team member
	$scope.setMaxTeamMember = function(change){
		if($scope.tempTeam.max == 20 && change == 1){
			alert("Our website can only form a group with not more than 20 members.");
			return;
		} else if($scope.tempTeam.max == 2 && change == -1){
			alert("Our website can only form a group with more than 2 members");
			return;
		}

		$scope.tempTeam.max += change;
	};

	// set sex perference: M = Male, F = Female, N = No perference
	$scope.setSexPreference = function(sexPreference){
		$scope.tempTeam.preference = sexPreference;
	};

	// set budget per person
	/**************************************************************************
		1. In US dollars
		2. $100 <= budget <= $100000
	***************************************************************************/
	$scope.setEstimateBudgetPerPerson = function(){
		if($scope.tempTeam.estimatedBudgetPerPerson < 100){
			$scope.tempTeam.estimatedBudgetPerPerson = 100;
			alert("Budget should not be less than $100.");
			return;
		} else if($scope.tempTeam.estimatedBudgetPerPerson > 100000){
			$scope.tempTeam.estimatedBudgetPerPerson = 100;			
			alert("Budget should not be larger than 100000.");
			return;
		}

	};

	// set destination
	$scope.setDestination = function(){
		if($scope.tempTeam.destination == ""){
			alert("Please choose one country as your destination.");
			return;
		};
	};

	// set departure date
  
  $(document).ready( function() {
    $( "#date" ).datepicker();
  } );
  
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
    var testInVaildDate = function(selectedDate, todayDate){
    	if(selectedDate >= todayDate){
    		return false;
    	}else if(selectedDate < todayDate){
    		return true;
    	}
    };

    $scope.setDepartureDate = function(){
    	var today = new Date();
    	var dd = today.getDay();
    	var mm = today.getMonth() + 1;
    	var yyyy = today.getFullYear();

    	var partitionDate = $scope.tempTeam.departureDate.split("/");
    	var intPartitionDate = [];
    	for(var i = 0; i < 3; i++){
    		intPartitionDate.push(parseInt(partitionDate[i]));
    	}

    	if(testInVaildDate(intPartitionDate[2], yyyy)){
    		alert("Cannot choose a year in the past.");
    		return;
    	} else if(testInVaildDate(intPartitionDate[1], mm)){
    		alert("Cannot choose a month in the past.");
    		return;
  	 	} else if((testInVaildDate(intPartitionDate[0] - 1), dd)){
    		alert("Cannot choose a day in the past.");
    		return;
    	}


    };

	// add group into firebase
	$scope.createGroup = function(teamName){
		//$scope.setTeamName
	};

});