'use strict'
//spyOn function: http://www.htmlgoodies.com/html5/javascript/spy-on-javascript-methods-using-the-jasmine-testing-framework.html#fbid=ds1Vg7qMWpD

describe('createGroupCtrl', function(){
	beforeEach(module('createGroupApp'));

	var $scope, ctrl;

	beforeEach(inject(function($controller){
		$scope = {};
		ctrl = $controller('createGroupCtrl', {$scope: $scope});
	}));

	it('setTeamName with unique name', function(){
		spyOn(window, 'alert');

		$scope.tempTeam.name = "";
		$scope.setTeamName();
		expect(window.alert).toHaveBeenCalledWith("Team name cannot be empty!");
		
		$scope.tempTeam.name = "w";		
		$scope.setTeamName();
		expect(window.alert).toHaveBeenCalledWith("Team name should be shorter than 3 words!");
		
		$scope.tempTeam.name = "0123456789012345678901234567890123456789012345678901";
		$scope.setTeamName();
		expect(window.alert).toHaveBeenCalledWith("Team name should not be longer than 50 words!");				
	});

	it('setMaxTeamMember can only allow each group has 2 to 20 members', function(){
		spyOn(window, 'alert');

		$scope.tempTeam.max = 2;
		$scope.setMaxTeamMember(-1);
		expect(window.alert).toHaveBeenCalledWith("Our website can only form a group with more than 2 members");
		expect($scope.tempTeam.max).toEqual(2);

		$scope.tempTeam.max = 20;
		$scope.setMaxTeamMember(1);
		expect(window.alert).toHaveBeenCalledWith("Our website can only form a group with not more than 20 members.");
		expect($scope.tempTeam.max).toEqual(20);

		$scope.tempTeam.max = 2;
		$scope.setMaxTeamMember(1);
		expect($scope.tempTeam.max).toEqual(3);
	});

	it('setSexPreference change the preference of tempTeam', function(){
		$scope.tempTeam.preference = "N";

		$scope.setSexPreference('M');
		expect($scope.tempTeam.preference).toEqual("M");

		$scope.setSexPreference('F');
		expect($scope.tempTeam.preference).toEqual("F");

		$scope.setSexPreference('N');
		expect($scope.tempTeam.preference).toEqual("N");				
	});

	it('setEstimateBudgetPerPerson allow user type in their budget between 100 and 100000', function(){
		spyOn(window, 'alert');

		$scope.tempTeam.estimatedBudgetPerPerson = 50;
		$scope.setEstimateBudgetPerPerson();
		expect(window.alert).toHaveBeenCalledWith("Budget should not be less than $100.");
		expect($scope.tempTeam.estimatedBudgetPerPerson).toEqual(100);


		$scope.tempTeam.estimatedBudgetPerPerson = 10000000;
		$scope.setEstimateBudgetPerPerson();
		expect(window.alert).toHaveBeenCalledWith("Budget should not be larger than 100000.");
		expect($scope.tempTeam.estimatedBudgetPerPerson).toEqual(100);		
	});

	it('setDestination requires user to select one destination', function(){
		spyOn(window, 'alert');

		$scope.tempTeam.destination = "";
		$scope.setDestination();
		expect(window.alert).toHaveBeenCalledWith("Please choose one country as your destination.");
	});
/*
	it('check datepicker has been called', function(){
		var jqueryFun = jQuery('#date');
		spyOn(jqueryFun, 'datepicker');
		$('#date').datepicker;
		expect(jqueryFun.datepicker).toHaveBeenCalled();
	});
*/
	it('setDepartureDate do not allow user set a date before the current date', function(){
		spyOn(window, 'alert');

		$scope.tempTeam.departureDate = "14/02/1995";
		$scope.setDepartureDate();
		expect(window.alert).toHaveBeenCalledWith("Cannot choose a year in the past.");

		$scope.tempTeam.departureDate = "12/07/2016";
		$scope.setDepartureDate();
		expect(window.alert).toHaveBeenCalledWith("Cannot choose a month in the past.");

		$scope.tempTeam.departureDate = "14/11/2016";
		$scope.setDepartureDate();
		expect(window.alert).toHaveBeenCalledWith("Cannot choose a day in the past.");
	});

	it('createGroup() create a right team object', function(){
		expect($scope.team.id).toEqual("");
	});
});