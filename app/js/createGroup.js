var app = angular.module("createGroupApp", ["firebase"]);

app.controller("createGroupCtrl",
 function($scope, $firebaseArray){

    var ref = firebase.database().ref('createGroup');
    $scope.admin = $firebaseArray(ref);
    var ref = firebase.database().ref('test_members');
    $scope.members = $firebaseArray(ref);

    $scope.param = {};
			
	
	var refPath, ref, eventName;

	//eventName = getURLParameter("q");
	//refPath = eventName + "/admin/param";	
	ref = firebase.database().ref('admin');
	$scope.admin = $firebaseArray(ref);
		
	// Link and sync a firebase object
	
	//$scope.param = $firebaseObject(ref);
	$scope.admin.$loaded()
		.then( function(data) {
			
			// Fill in some initial values when the DB entry doesn't exist			
			if(typeof $scope.param.maxTeamSize == "undefined"){				
				$scope.param.maxTeamSize = 10;
			}			
			if(typeof $scope.param.minTeamSize == "undefined"){				
				$scope.param.minTeamSize = 1;
			}
			if(typeof $scope.param.sex == "undefined"){
				$scope.param.sex = "N";
			}
			if(typeof $scope.param.members == "undefined"){
				$scope.param.member = [];
			}
			if(typeof $scope.param.tags == "undefined"){
				$scope.param.tags = [];
			}
			
		}) 

	$scope.tempMember = {
		id: "0001"
	};


	/***********************************************************************
		set team name:
		1. can't be empty
		-->2. can't use the same name again
			- compare with all team.name in firebase
		3. not less than 3 words and not longer than 50 words
	************************************************************************/
	$scope.setName = function(){
		var teamName = document.getElementById('teamName').value;

		if(teamName == ""){
			alert("Team name: cannot be empty!");
			return false;
		}else if(teamName.length < 3){
			alert("Team name: should be shorter than 3 words!");
			return false;
		}else if(teamName.length > 50){
			alert("Team name: should not be longer than 50 words!");
			return false;
		}

		$scope.param.name = teamName;
    	return true;		
	};

	$scope.setId = function(){
		var numOfTeam = $scope.admin.length;
		if(numOfTeam < 10){
			$scope.param.id = "g000" + numOfTeam;
		}else if(numOfTeam < 100){
			$scope.param.id = "g00" + numOfTeam;
		}else if(numOfTeam < 1000){
			$scope.param.id = "g0" + numOfTeam;
		}else if(numOfTeam.id < 10000){
			$scope.param.id = "g" + numOfTeam;
		}
		return true; 
	};


	$scope.changeMinTeamSize = function(delta) {
		var newVal = $scope.param.minTeamSize + delta;
		if (newVal >=1 && newVal <= $scope.param.maxTeamSize ) {
			$scope.param.minTeamSize = newVal;
		} 
	
	}

	$scope.changeMaxTeamSize = function(delta) {
		var newVal = $scope.param.maxTeamSize + delta;
		if (newVal >=1 && newVal >= $scope.param.minTeamSize ) {
			$scope.param.maxTeamSize = newVal;
		} 
	}

	//Sex
	$scope.setSexPreference = function(sexPreference){
		$scope.param.sex = sexPreference;
		//$scope.param.$save();
	}

	//Budget
	$scope.setEstimateBudgetPerPerson = function(){
		var budget = parseInt(document.getElementById('budget').value);

		if(budget < 100){
			alert("Budget per groupmate: should not be less than $100.");
			return false;
		} else if(budget > 100000){		
			alert("Budget per groupmate: should not be larger than 100000.");
			return false;
		}

		$scope.param.budget = budget;
    	return true;		
	}		

	//Destination
	$scope.setDestination = function(){
		var destination = document.getElementById('country').value;

		if(destination == ""){
			alert("Destination: Please choose one country as your destination.");
			return false;
		};

		$scope.param.destination = destination;
    	return true;		
	};

	//Language
	$scope.setLanguageForCommunication = function(){
		var language = document.getElementById('language').value;

		if(language == ""){
			alert("Language: Please choose one language as your main communication language.");
			return false;
		};

		$scope.param.language = language;
    	return true;		
	};		

	//DepartureDate
	$(document).ready( function() {
    	$( "#departureDate" ).datepicker();
  	});

    var changeDateFromStringToIntArray = function(dateString){
    	var partitionDate = dateString.split("/");
    	var intPartitionDate = [];
    	for(var i = 0; i < 3; i++){
    		intPartitionDate.push(parseInt(partitionDate[i]));
    	}
    	return intPartitionDate;
    };

    $scope.setDepartureDate = function(){
    	var today = new Date();
    	var dd = today.getDate();
    	var mm = today.getMonth() + 1;
    	var yyyy = today.getFullYear();
    	var departureDate = document.getElementById('departureDate').value;

    	var intPartitionDate = changeDateFromStringToIntArray(departureDate);


		if(departureDate == ""){
			alert("Departure date: Cannot be empty.");
			return false;
		}

		if(intPartitionDate[2] < yyyy){
			alert("Departure date: Cannot choose a year in the past.");
    		return false;
		}else if(intPartitionDate[2] > yyyy){
			$scope.param.departureDate = departureDate;
			return true;
		}

		if(intPartitionDate[0] < mm){
			alert("Departure date: Cannot choose a month in the past.");
    		return false;
		}else if(intPartitionDate[0] > mm){
			$scope.param.departureDate = departureDate;			
			return true;
		}

		if(intPartitionDate[1] <= dd){
			alert("Departure date: Cannot choose a day in the past.");
    		return false;
		}else{
			$scope.param.departureDate = departureDate;			
			return true;
		}

    };      	

    //set return date
	$(document).ready( function() {
	  $( "#returnDate" ).datepicker();
	} );


    $scope.setReturnDate = function(){
    	var departureDate = document.getElementById('departureDate').value;
    	var returnDate = document.getElementById('returnDate').value;

    	var departureDateArray = changeDateFromStringToIntArray(departureDate);
    	var returnDateArray = changeDateFromStringToIntArray(returnDate);

    	if(departureDate == ""){
			alert("Return date: Cannot be empty.");
			return false;
		}

		if(returnDateArray[2] < departureDateArray[2]){
			alert("Return date: Cannot choose a year in the past.");
    		return false;
		}else if(returnDateArray[2] > departureDateArray[2]){
			$scope.param.returnDate = returnDate;
			return true;
		}

		if(returnDateArray[0] < departureDateArray[0]){
			alert("Return date: Cannot choose a month in the past.");
    		return false;
		}else if(returnDateArray[0] > departureDateArray[0]){
			$scope.param.returnDate = returnDate;
			return true;
		}

		if(returnDateArray[1] <= departureDateArray[1]){
			alert("Return date: Cannot choose a day in the past.");
    		return false;
		}else{
			$scope.param.returnDate = returnDate;
			return true;
		}

    }    

    $scope.setDescription = function(){
    	$scope.param.descriptions = document.getElementById('descriptions').value;
    	return true;
    }

    $scope.setTag = function(){
    	var tag = document.getElementById('tag').value;

    	if(tag == ""){
    		alert("Tag cannot be empty.");
    		return;
    	}

    	var inTags = false;

    	$scope.param.tags.forEach(function(element){
    		if(element == tag){
    			inTags = true;
    			return;
    		}
    	})

    	if(inTags == true){
    		alert(tag + " have already been added");
    		return;
    	}

    	$scope.param.tags.push(tag);
    };

	$scope.saveFunc = function() {

		if($scope.setId() && $scope.setName() && $scope.setEstimateBudgetPerPerson() && $scope.setDestination() && $scope.setLanguageForCommunication()
			&& $scope.setDepartureDate() && $scope.setReturnDate() && $scope.setDescription()){
			$scope.admin.$add($scope.param);
		
			// Finally, go back to the front-end
			//window.location.href= "index.html";
		}
	} 
/*
    $scope.setMember = function(){
    	var memberId = document.getElementById('memberId').value;

    	if(memberId == ""){
    		alert("memberId cannot be empty.");
    		return;
    	}

    	if(memberId.length != 4){
    		alert("invaild member Id.");
    		return;
    	}

    	var inGroup = false;

    	$scope.param.members.forEach(function(element){
    		if(element == memberId){
    			inGroup = true;
    			return;
    		}
    	})

    	if(inGroup == true){
    		alert("Member " + memberId + " already in your group.");
    		return;    		
    	}

    	var haveMember = false;

    		angular.forEach($scope.members, function(value){

    			if(value.id == memberId){   				    		
    				haveMember = true;
    			}
    		});

    	if(haveMember == false){
    		alert("Member cannot be found");
    		return;
    	}

    	$scope.param.members.push(memberId);
    }; 
*/




});