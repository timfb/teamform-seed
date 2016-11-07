angular.module('createGroupApp', ['firebase'])
.controller('createGroupCtrl', ['$scope', '$firebaseArray',
            function($scope, $firebaseArray){
                //init firebase
                initalizeFirebase();
                
                var ref = firebase.database().ref('team');
                $scope.allTeam = $firebaseArray(ref);
                //define group object
                $scope.team = {
                    "teamName" : '',
                    "currentTeamSize" : 0,
                    "teamMembers" : [],
                    "sexLimitation" : "No Limitation",
                    "ageUpperLimitation" : 0,
                    "ageLowerLimitation" : 0,
                    "nationalityLimitation" : [],
                    "laguageLimitation" : [],
                    "country" : [],
                    "city" : [],
                    "departing_date" : "",
                    "travelDays" : 0,
                    "transportation" : [],
                    "accomdation" : [],
                    "budget" : 0
                };
                //define createGroup function
                
                //TeamSize
                $scope.changeCurrentTeamSize = function(delta) {
                    $scope.team.currentTeamSize += delta;
                }                
                
                //sexLimitation
                //Male only, Female only, No limitation
                $scope.selectSexLimitation = function(sex) {
                    $scope.team.sexLimitation = sex;
                }
                
                //nationality Limitation
                //bug not fix
                $scope.tempNationality = "";
                
                $scope.addNationalityLimitation = function(){
                    nationalityLimitation.push($scope.tempNationality);
                }
                
                $scope.createTeam = function(){
                    
                    $scope.allTeam.$add($scope.team);
                }
}]);