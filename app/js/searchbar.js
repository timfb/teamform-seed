"use strict";

// inject firebase service
var app = angular.module("search", ["firebase", "clock"]);

app.controller("searchCtrl",
    function ($scope, $firebaseArray, $sce) {
        $scope.trustAsHtml = $sce.trustAsHtml;

        $scope.user = null;

        //get members' data
        var ref = firebase.database().ref("members");
        $scope.memberData = $firebaseArray(ref);

        //get teams' data
        ref = firebase.database().ref("teams");
        $scope.teamData = $firebaseArray(ref);

        //get search frequency
        ref = firebase.database().ref("searchFreq/frequency");
        $scope.searchFrequency = $firebaseArray(ref);
        ref = firebase.database().ref("searchFreq/keyword_groups");
        $scope.keywordGroups = $firebaseArray(ref);
        ref = firebase.database().ref("pending_join_requests");
        $scope.requests = $firebaseArray(ref);

        //for debugging
        $scope.debugMsg = "";
        $scope.debugMsg2 = "";

        //Data
        $scope.searchInput = "";
        $scope.result = [];
        $scope.suggestions = [];
        $scope.constraint = {
            tm: "0",
            t: ["-1", "-1", "-1", false, false],
            m: ["-1", "-1", "-1", "-1", false],
            tDis: false,
            mDis: false,
            defaultTm: "0",
            defaultT: ["-1", "-1", "-1", false, false],
            defaultM: ["-1", "-1", "-1", "-1", false],
            clearT: function () {
                for (var i = 0; i < this.defaultT.length; i++)
                    this.t[i] = this.defaultT[i];
            },
            clearM: function () {
                for (var i = 0; i < this.defaultM.length; i++)
                    this.m[i] = this.defaultM[i];
            },
            clear: function () {
                this.tm = this.defaultTm;
                this.clearT();
                this.clearM();
                this.tDis = false;
                this.mDis = false;
            },
            hasConstraints: function () {
                if (this.tm != this.defaultTm)
                    return true;
                if (this.hasTeamConstraints())
                    return true;
                if (this.hasMemberConstraints())
                    return true;
                return false;
            },
            hasTeamConstraints: function () {
                for (var i = 0; i < this.t.length; i++)
                    if (this.t[i] != this.defaultT[i])
                        return true;
                return false;
            },
            hasMemberConstraints: function () {
                for (var i = 0; i < this.m.length; i++)
                    if (this.m[i] != this.defaultM[i])
                        return true;
                return false;
            }
        };

        function parseTeamToresultElement(_team, _eid) {
            // teamsAndMembers.push(new resultElement("Team ID: " + e2, e1, e3, ("searchResultElement-" + i), e4, e5, e6, "", e7, e8, e9, ""));
            console.log(_team);
            this.name = _team.name;
            this.id = "Team ID: " + _team.id;
            this.description = _team.descriptions;
            this.eid = "searchResultElement-" + _eid;
            this.language = _team.language_for_communication;
            this.country = _team.destination;
            this.tags = _team.tags;
            this.email = "";
            this.gender = _team.preference;
            this.full = _team.full;
            this.depart = _team.departure_date;
            this.desireToGo = "";
            var temp = _team.id;
            temp = temp.replace(/\s|Team|id|\:/gi, "");
            this.href = "team.html?teamId=" + temp;
        }

        function resultElement(_id, _name, _description, _eid, _language, _country, _tags, _email, _gender, _full, _depart, _desireToGo) {
            this.name = _name;
            this.id = _id;
            this.description = _description;
            this.eid = _eid;
            this.language = _language;
            this.country = _country;
            this.tags = _tags;
            this.email = _email;
            this.gender = _gender;
            this.full = _full;
            this.depart = _depart;
            this.desireToGo = _desireToGo;
            var temp = _id;
            temp = temp.replace(/\s|Team|member|id|\:/gi, "");
            this.href = (_email == "" ? "team.html?teamId=" : "member.html?memberId=") + temp;
        }

        $scope.$watch("constraint.tm", function (newVal, oldVal) {
            if (newVal == "0") {
                $scope.constraint.mDis = false;
                $scope.constraint.tDis = false;
            }
            else if (newVal == "1") {
                $scope.constraint.mDis = true;
                $scope.constraint.tDis = false;
                $scope.constraint.clearM();
            }
            else if (newVal == "2") {
                $scope.constraint.mDis = false;
                $scope.constraint.tDis = true;
                $scope.constraint.clearT();
            }
        });

        //helper functions
        function addSearchHistory(keywords) {
            for (var i = 0; i < $scope.keywordGroups.length; i++) {
                var sc = getSimilarityScore($scope.keywordGroups[i], keywords.join(" "), "score",
                    { "score-e": 100, "score-s": function (p) { return 0; } });
                if (sc == 100) {
                    var x = parseInt($scope.searchFrequency[i].$value) + 1;
                    $scope.searchFrequency.$ref().child(i).set(x + "");
                    break;
                } else if (i == $scope.keywordGroups.length - 1) {
                    $scope.keywordGroups.$ref().child(i + 1).set(keywords);
                    $scope.searchFrequency.$ref().child(i + 1).set("1");
                }
            }
        }

        $scope.passed = function (depart) {
            return Utils.compareDate(depart, new Date()) > 0;
        }

        var suggestionElement = function (suggestions, i) {
            this.class = "suggestionElement";
            this.text = suggestions[i];
            this.action = function () {
                $scope.searchInput = this.text;
                disableCentralize();
                $scope.search();
            };
        }
        //listen to the search text field changes, and give suggestions
        $scope.$watch("searchInput", function (newVal, oldVal) {
            //clear the previos suggestions
            $scope.suggestions = [];

            if (typeof newVal != "string") {
                $("#searchSuggestion").hide();
                return;
            }

            //give suggestions if the input is meaningful
            if (normailizeText(newVal).length > 1 || normailizeText(newVal)[0] != "") {

                var freq = $scope.searchFrequency;
                var keywordGroups = $scope.keywordGroups;
                var suggestions = [];
                var scores = [];
                var keywords = normailizeText(newVal);

                //calculate the similary score
                for (var i = 0; i < keywordGroups.length; i++) {
                    var kg = keywordGroups[i].join(" ");
                    var score = getSimilarityScore(keywords, kg, "score", { "score-e": 100, "score-s": function (p) { return p * 100; } });
                    suggestions.push(kg);
                    scores.push(score * parseInt(freq[i].$value));
                }

                //sort by the similarity score
                sortTwoArrays(scores, suggestions);

                //screen suggestions
                for (var i = 0; i < scores.length; i++)
                    if (scores[i] > 0)
                        $scope.suggestions.push(new suggestionElement(suggestions, i));
                    else
                        break;

                $("#searchSuggestion").show();
            }
            else    //do nothing if the input is not meaningful
                $("#searchSuggestion").hide();

        });

        //Search function
        $scope.search = function () {
            //create a local array to store result
            var teamsAndMembers = [];

            //clear the previos search results
            $scope.result = [];

            //split keywords, transform to lowercase and remove symbols
            var keywords = normailizeText($scope.searchInput);

            //when keywords contain only symbols or spaces, do nothing
            if (keywords.join("") == "" && !$scope.constraint.hasConstraints())
                return;

            //some layout changes
            disableCentralize();

            //Add Search History to Firebase
            addSearchHistory(keywords);

            //define local score array
            var scores = [];

            //calculate the similarity of each team data

            if ($scope.constraint.tm != 2) {
                var teams = $scope.teamData;
                // -e means equal, -s means similar
                $scope.teamScoreList = {
                    "id-e": 100,
                    "id-s": function (dummy) { return 0; },
                    "name-e": 90,
                    "name-s": function (percentage) { return 90 * percentage; },
                    "destination-e": 60,
                    "destination-s": function (percentage) { return 60 * percentage; },
                    "language-e": 30,
                    "language-s": function (dummy) { return 0; },
                    "tag-e": 70,
                    "tag-s": function (percentage) { return 70 * percentage; },
                    "description-e": 70,
                    "description-s": function (percentage) { return 70 * percentage; },
                    "preference-e": 70,
                    "preference-s": function (dummy) { return 0; },
                };

                //loop through the team list
                for (var i = 0; i < teams.length; i++) {
                    //constraints
                    if (keywords.join("") == "" && $scope.constraint.tm == 1 && !$scope.constraint.hasTeamConstraints()) {
                        teamsAndMembers.push(new resultElement("Team ID: " + teams[i].id, teams[i].name, teams[i].descriptions, "searchResultElement-" + i,
                            teams[i].language_for_communication, teams[i].destination, teams[i].tags, "", teams[i].preference,
                            teams[i].members.length + "/" + teams[i].max + ((teams[i].members.length == teams[i].max) ? "<span style='color:red;'>&nbsp;(FULL)</span>" : ""),
                            new Date(teams[i].departure_date).getUTCFullYear() + "-" + (new Date(teams[i].departure_date).getUTCMonth() + 1) + "-" + new Date(teams[i].departure_date).getUTCDate(), ""));
                        continue;
                    }

                    if (!$scope.constraint.hasTeamConstraints() && keywords.join("") == "")
                        continue;

                    if ($scope.constraint.hasTeamConstraints()) {
                        var dest = teams[i].destination;
                        var lang = teams[i].language_for_communication;
                        var pref = teams[i].preference;
                        var full = teams[i].members.length + "/" + teams[i].max + ((teams[i].members.length == teams[i].max) ? "<span style='color:red;'>&nbsp;(FULL)</span>" : "");
                        var depart = new Date(teams[i].departure_date).getUTCFullYear() + "-" + (new Date(teams[i].departure_date).getUTCMonth() + 1) + "-" + new Date(teams[i].departure_date).getUTCDate();

                        //constraint on destination
                        var num = parseInt($scope.constraint.t[0]);
                        if (num != -1)
                            if (dest.toLowerCase() == getCountryListItem(num).toLowerCase())
                                dest = simpleHighlight(dest);
                            else {
                                if (teams.length - 1 == i)
                                    $scope.constraint.clearT();
                                continue;
                            }

                        //constraint on language
                        num = parseInt($scope.constraint.t[1]);
                        if (num != -1)
                            if (lang.toLowerCase() == getLanguageListItem(num).toLowerCase())
                                lang = simpleHighlight(lang);
                            else {
                                if (teams.length - 1 == i)
                                    $scope.constraint.clearT();
                                continue;
                            }

                        // constraint on preference
                        num = parseInt($scope.constraint.t[2]);
                        if (num != -1)
                            if (pref.toLowerCase() == (num == 0 ? "both" : (num = 1) ? "male" : "female"))
                                pref = simpleHighlight(pref);
                            else {
                                if (teams.length - 1 == i)
                                    $scope.constraint.clearT();
                                continue;
                            }

                        // constraint on full
                        num = $scope.constraint.t[3];
                        if (num && teams[i].members.length >= teams[i].max) {
                            if (teams.length - 1 == i)
                                $scope.constraint.clearT();
                            continue;
                        }
                        // constraint on depart
                        num = $scope.constraint.t[4];
                        var tempDateData = teams[i].departure_date.split("-");
                        tempDateData = tempDateData[0] + "-" + (parseInt(tempDateData[1]) - 1) + "-" + tempDateData[2];
                        if (num && Utils.compareDate(new Date().toUTCString(), tempDateData) > 0) {
                            if (teams.length - 1 == i)
                                $scope.constraint.clearT();
                            continue;
                        }

                        teamsAndMembers.push(new resultElement("Team ID: " + teams[i].id, teams[i].name, teams[i].descriptions, "searchResultElement-" + i,
                            lang, dest, teams[i].tags, "", pref, full, depart, ""));
                        if (teams.length - 1 == i)
                            $scope.constraint.clearT();
                        continue;
                    }

                    var id = teams[i].id;
                    var name = teams[i].name.toLowerCase();
                    var destination = teams[i].destination.toLowerCase();
                    var language = teams[i].language_for_communication.toLowerCase();
                    var tag = teams[i].tags;
                    for (var j = 0; j < tag.length; j++)
                        tag[j] = tag[j].toLowerCase();
                    var description = teams[i].descriptions.toLowerCase();
                    var preference = teams[i].preference.toLowerCase();

                    var score = 0;
                    //match id
                    score += getSimilarityScore(keywords, id, "id", $scope.teamScoreList);

                    //match name
                    score += getSimilarityScore(keywords, name, "name", $scope.teamScoreList);

                    //match destination
                    score += getSimilarityScore(keywords, destination, "destination", $scope.teamScoreList);

                    //match language
                    score += getSimilarityScore(keywords, language, "language", $scope.teamScoreList);

                    //match tag
                    score += getSimilarityScore(keywords, tag.join(" "), "tag", $scope.teamScoreList);

                    //match description
                    score += getSimilarityScore(keywords, description, "description", $scope.teamScoreList);

                    //match preference
                    score += getSimilarityScore(keywords, preference, "preference", $scope.teamScoreList);

                    //update the result if score > 0
                    if (score > 0) {
                        scores.push(score);
                        var e1 = hightlight(teams[i].name, keywords);
                        var e2 = hightlight(id, keywords);
                        var e3 = hightlight(teams[i].descriptions, keywords);
                        var e4 = hightlight(teams[i].language_for_communication, keywords);
                        var e5 = hightlight(teams[i].destination, keywords);
                        var e6 = hightlight(teams[i].tags.join(" * "), keywords).split(" * ");
                        var e7 = hightlight(teams[i].preference, keywords);
                        var e8 = teams[i].members.length + "/" + teams[i].max + ((teams[i].members.length == teams[i].max) ? "<span style='color:red;'>&nbsp;(FULL)</span>" : "");
                        var e9 = new Date(teams[i].departure_date).getUTCFullYear() + "-" + (new Date(teams[i].departure_date).getUTCMonth() + 1) + "-" + new Date(teams[i].departure_date).getUTCDate();
                        teamsAndMembers.push(new resultElement("Team ID: " + e2, e1, e3, ("searchResultElement-" + i), e4, e5, e6, "", e7, e8, e9, ""));
                    }
                }
            }

            if ($scope.constraint.tm != 1) {
                //do the same thing on member data
                //calculate the similarity of each member data
                var members = $scope.memberData;
                //clear the scores used in searching teams

                //create similarity score list for members
                $scope.memberScoreList = {
                    "id-e": 100,
                    "id-s": function (dummy) { return 0; },
                    "name-e": 90,
                    "name-s": function (percentage) { return percentage * 90; },
                    "description-e": 60,
                    "description-s": function (percentage) { return percentage * 60; },
                    "email-e": 80,
                    "email-s": function (percentage) { return percentage * 60; },
                    "from-e": 60,
                    "from-s": function (percentage) { return percentage * 60; },
                    "language-e": 30,
                    "language-s": function (percentage) { return percentage * 30; },
                    "gender-e": 70,
                    "gender-s": function (dummy) { return 0; },
                    "desire-e": 70,
                    "desire-s": function (percentage) { return percentage * 70; }
                }

                //save the count value in order to make the element id number correct
                var resultCount = teamsAndMembers.length;

                //loop through the whole member list
                for (var i = 0; i < members.length; i++) {
                    //constraint
                    if (keywords.join("") == "" && $scope.constraint.tm == 2 && !$scope.constraint.hasMemberConstraints()) {
                        teamsAndMembers.push(new resultElement(("Member ID: " + members[i].id), members[i].first_name + " " + members[i].last_name, members[i].descriptions,
                            "searchResultElement-" + (i + resultCount), members[i].language.join(", "), members[i].from, "", members[i].email, members[i].gender, "", "", members[i].want_to_travel ? members[i].want_to_travel.join(", ") : "Not specified"));
                        continue;
                    }

                    if (!$scope.constraint.hasMemberConstraints() && keywords.join("") == "")
                        continue;

                    if ($scope.constraint.hasMemberConstraints()) {
                        var gender = members[i].gender;
                        var country = members[i].from;
                        var desireToGo = members[i].want_to_travel.join(", ");
                        var desireToGo2 = [];
                        for (var g = 0; g < members[i].want_to_travel.length; g++)
                            desireToGo2.push(members[i].want_to_travel[g]);
                        var lang = members[i].language.join(", ");
                        var lang2 = [];
                        for (var g = 0; g < members[i].language.length; g++)
                            lang2.push(members[i].language[g]);
                        var avail = (members[i].available_for_traveling == "true" ? true : false);

                        //constraint on gender
                        var num = parseInt($scope.constraint.m[0]);
                        if (num != -1)
                            if (gender.toLowerCase() == ((num == 0) ? "male" : "female"))
                                gender = simpleHighlight(gender);
                            else {
                                if (members.length - 1 == i)
                                    $scope.constraint.clearM();
                                continue;
                            }

                        //constraint on home country
                        num = parseInt($scope.constraint.m[1]);
                        if (num != -1)
                            if (country.toLowerCase() == getCountryListItem(num).toLowerCase())
                                country = simpleHighlight(country);
                            else {
                                if (members.length - 1 == i)
                                    $scope.constraint.clearM();
                                continue;
                            }

                        // constraint on desirable country
                        num = parseInt($scope.constraint.m[2]);
                        if (num != -1) {
                            var atLeastOneChange = false;
                            for (var t = 0; t < desireToGo2.length; t++)
                                if (desireToGo2[t].toLowerCase() == getCountryListItem(num).toLowerCase()) {
                                    desireToGo2[t] = simpleHighlight(desireToGo2[t]);
                                    atLeastOneChange = true;
                                }
                            if (atLeastOneChange)
                                desireToGo = desireToGo2.join(", ");
                            else {
                                if (members.length - 1 == i)
                                    $scope.constraint.clearM();
                                continue;
                            }
                        }

                        // constraint on language
                        num = parseInt($scope.constraint.m[3]);
                        if (num != -1) {
                            var atLeastOneChange = false;
                            for (var t = 0; t < lang2.length; t++)
                                if (lang2[t].toLowerCase() == getLanguageListItem(num).toLowerCase()) {
                                    lang2[t] = simpleHighlight(lang2[t]);
                                    atLeastOneChange = true;
                                }
                            if (atLeastOneChange)
                                lang = lang2.join(", ");
                            else {
                                if (members.length - 1 == i)
                                    $scope.constraint.clearM();
                                continue;
                            }
                        }

                        // constraint on availability of traveling
                        num = $scope.constraint.m[4];
                        if (num && !avail) {
                            if (members.length - 1 == i)
                                $scope.constraint.clearM();
                            continue;
                        }

                        teamsAndMembers.push(new resultElement(("Member ID: " + members[i].id), members[i].first_name + " " + members[i].last_name, members[i].descriptions,
                            "searchResultElement-" + (i + resultCount), lang, country, "", members[i].email, gender, "", "", desireToGo));
                        if (members.length - 1 == i)
                            $scope.constraint.clearM();
                        continue;
                    }


                    id = members[i].id;
                    name = (members[i].first_name + " " + members[i].last_name).toLowerCase();
                    description = members[i].descriptions.toLowerCase();
                    var email = members[i].email.toLowerCase();
                    var from = members[i].from.toLowerCase();
                    language = members[i].language.join(" ").toLowerCase();
                    var gender = members[i].gender.toLowerCase();
                    var desire = members[i].want_to_travel ? members[i].want_to_travel.join(" ").toLowerCase() : null;

                    score = 0;
                    //match id
                    score += getSimilarityScore(keywords, id, "id", $scope.memberScoreList);

                    //match name
                    score += getSimilarityScore(keywords, name, "name", $scope.memberScoreList);

                    //match description
                    score += getSimilarityScore(keywords, description, "description", $scope.memberScoreList);

                    //match email
                    score += getSimilarityScore(keywords, email, "email", $scope.memberScoreList);

                    //match the host country
                    score += getSimilarityScore(keywords, from, "from", $scope.memberScoreList);

                    //match language
                    score += getSimilarityScore(keywords, language, "language", $scope.memberScoreList);

                    //match gender
                    score += getSimilarityScore(keywords, gender, "gender", $scope.memberScoreList);

                    //match desirable countries
                    if (desire)
                        score += getSimilarityScore(keywords, desire, "desire", $scope.memberScoreList);

                    //update the result if score > 0
                    if (score > 0) {
                        scores.push(score);
                        var e1 = hightlight(members[i].first_name + " " + members[i].last_name, keywords);
                        var e2 = hightlight(id, keywords);
                        var e3 = hightlight(members[i].descriptions, keywords);
                        var e4 = hightlight(members[i].language.join(" * "), keywords).split(" * ").join(", ");
                        var e5 = hightlight(members[i].from, keywords);
                        var e6 = hightlight(members[i].email, keywords);
                        var e7 = hightlight(members[i].gender, keywords);
                        var e8 = members[i].want_to_travel ? hightlight(members[i].want_to_travel.join(" * "), keywords).split(" * ").join(", ") : "";
                        teamsAndMembers.push(new resultElement(("Member ID: " + e2), e1, e3, "searchResultElement-" + (i + resultCount), e4, e5, "", e6, e7, "", "", e8));
                    }
                }
            }

            //sort the result by scores in descending order
            sortTwoArrays(scores, teamsAndMembers);

            //make the result accessable to the html
            $scope.result = teamsAndMembers;

            //if no results, show the no result message
            if ($scope.result.length == 0)
                $scope.result.push(false);

            //clear all the constraint and hide the constraint panel
            $scope.constraint.clear();
            $("#advancedSearchPanel").hide();
        }
        //Search function end

        //search Tags start
        $scope.searchTags = function (tagName) {
            console.log("Receive tag name: " + tagName);
            tagName = tagName.replace(/<\w{1,}>/gi, "");
            tagName = tagName.toLowerCase();
            var teams = $scope.teamData;
            $scope.result = [];
            for (var i = 0; i < teams.length; i++)
                for (var j = 0; j < teams[i].tags.length; j++)
                    if (teams[i].tags[j].toLowerCase() == tagName) {
                        $scope.result.push(new parseTeamToresultElement(teams[i], $scope.result.length));
                        break;
                    }
            if ($scope.result.length == 0)
                $scope.result.push(false);
        };
        //search Tags End

        //join team
        $scope.joinTeam = function (teamID) {
            $scope.user = firebase.auth().currentUser;
            teamID = teamID.split("Team ID: ").join("");
            teamID = teamID.replace(/\s/g, "");

            if (!$scope.user)
                showLoginDialog();
            else {
                var memberID = "";
                angular.forEach($scope.memberData, function (element) {
                    if (memberID == "" && $scope.user.uid == element.uid) {
                        memberID = element.id;
                    }
                });
                var exist = false;
                angular.forEach($scope.requests, function (e) {
                    if (e.group == teamID && e.requester == memberID)
                        exist = true;
                });
                if (!exist)
                    $scope.requests.$add({
                        date: new Date().toUTCString(),
                        requester: memberID,
                        group: teamID
                    });
                showRequestDialog();
            }
        };
        //join team end
    }
);

//global variables
var countrylist;
var languagelist;

$(document).ready(function () {
    //initialization
    $("#searchSuggestion").hide();
    $("#advancedSearchPanel").hide();

    //show and hide

    $("#advancedSearchBtn").click(function () {
        $("#advancedSearchPanel").toggle();
    });

    $("#advancedSearchCancelBtn").click(function () {
        $("#advancedSearchPanel").hide();
    });

    $("body").click(function () {
        $("#searchSuggestion").hide();
    });

    //load the Json file to the html
    $.getJSON("https://gist.githubusercontent.com/timfb/c47c84627b05b67f224a87cad5e68e75/raw/6d92aa3e9ff83935477789db482fdadc36e57568/country_and_language.json",
        function (data) {
            countrylist = data.country;
            languagelist = data.language;
            for (var i = 0; i < countrylist.length; i++)
                $("select[ng-model='constraint.m[1]'], select[ng-model='constraint.m[2]'], select[ng-model='constraint.t[0]']").append("<option value='" + i + "'>" + countrylist[i] + "</option>");
            for (var i = 0; i < languagelist.length; i++)
                $("select[ng-model='constraint.m[3]'], select[ng-model='constraint.t[1]']").append("<option value='" + i + "'>" + languagelist[i] + "</option>");
        });

    //keydown handling
    $("#searchTextField").keydown(function (event) {
        //keycode 13 is "enter"
        //keycode 27 is "esc"
        switch (event.which) {
            case 13:
                $("#searchBtnContainer").find("input[type='button']").click();
                break;

            case 27:
                $("#searchSuggestion").hide();
                break;

            default:
                //Do Nothing
                break;
        }
    });
});

//===some helper functions===

//redirect
function goToLoginPage() {
    window.location.href = "index.html";
}

//layout changesfunction
function disableCentralize() {
    $("#searchModule").parent().removeClass("centralize").addClass("topPadding");
    $("#searchBtnContainer").hide();
    $("#smSearchBtnContainer").removeClass("hide");
    $("#searchTextField").parent().removeClass("col-xs-12 col-sm-12 col-md-12 col-lg-12").addClass("col-xs-11 col-sm-11 col-md-11  col-lg-11");
    var searchTextFieldPPHeight = $("#searchTextField").parent().parent().height();
    $("#searchTextField").parent().css("margin-top", Math.round((searchTextFieldPPHeight - $("#searchTextField").parent().height()) / 2) + "px");
}

function showLoginDialog() {
    $("#loginDialog").removeClass("hide");
}

function hideLoginDialog() {
    $("#loginDialog").addClass("hide");
}

function showRequestDialog() {
    $("#joinRequest").removeClass("hide").delay(800).animate({
        opacity: 0
    }, 1000, function () {
        $(this).addClass("hide");
        $(this).css("opacity", 1);
    });
}

//remove symbols in text
function removeSymbols(text) {
    if (typeof text != "string")
        return text;

    var symbols = "";
    for (var i = 33; i <= 47; i++)
        symbols += String.fromCharCode(i);
    for (var i = 58; i <= 64; i++)
        symbols += String.fromCharCode(i);
    for (var i = 123; i <= 126; i++)
        symbols += String.fromCharCode(i);

    //scan through the texts and remove symbols
    for (var i = 0; i < symbols.length; i++)
        text = text.split(symbols.charAt(i)).join("");

    return text;
}

//Normalize the text (remove all symbols and transform the text to lowercase), return an array
function normailizeText(text) {
    if (typeof text != "string")
        return null;

    //remove symbols
    text = removeSymbols(text);

    //to lowercase
    text = text.toLowerCase();

    return text.split(" ");
}

//calculate the score of similarity according to the given score list
function getSimilarityScore(keywords, target, title, scoreList) {
    var score = 0;
    if (keywords.join(" ") == target)
        score += scoreList[title + "-e"];
    else {
        var count = 0;
        for (var j = 0; j < keywords.length; j++)
            if (target.includes(keywords[j]))
                count++;
        score += scoreList[title + "-s"](count / Math.max(keywords.length, target.split(" ").length));
    }
    return score;
}

//sort single array in ascending order
function sortArray(indepent, elementName = null) {
    if (elementName == null) {
        for (var k = 0; k < indepent.length - 1; k++) {
            var swapped = false;
            for (var l = indepent.length - 1; l >= 1; l--)
                if (indepent[l - 1] > indepent[l]) {
                    var temp = indepent[l - 1];
                    indepent[l - 1] = indepent[l];
                    indepent[l] = temp;
                    swapped = true;
                }
            if (!swapped)
                break;
        }
        return indepent;
    } else {
        var temp = [];
        for (var i = 0; i < indepent.length; i++)
            temp.push(indepent[i][elementName]);
        return sortArray(temp);
    }
}

//sort the both arrays in descending order according to the indepent array
function sortTwoArrays(indepent, dependent) {
    for (var k = 0; k < indepent.length - 1; k++) {
        var swapped = false;
        for (var l = indepent.length - 1; l >= 1; l--)
            if (indepent[l - 1] < indepent[l]) {
                var temp = indepent[l - 1];
                var temp2 = dependent[l - 1];
                indepent[l - 1] = indepent[l];
                dependent[l - 1] = dependent[l];
                indepent[l] = temp;
                dependent[l] = temp2;
                swapped = true;
            }
        if (!swapped)
            break;
    }
}

//simply highlight the text
function simpleHighlight(text) {
    return "<span class = \"highlightText\">" + text + "</span>";
}

//highlight keywords in search result
function hightlight(text, keywords) {
    if (typeof text != "string")
        return text;

    var text1 = text.split(" ");
    var result = [];
    for (var j = 0; j < text1.length; j++) {
        var highlighted = false;
        var highlighted2 = false;
        var pushed = false;
        for (var i = 0; i < keywords.length; i++) {
            if (normailizeText(text1[j]).join(" ") == keywords[i] && !highlighted) {
                if (pushed)
                    result.pop();
                result.push("<span class = \"highlightText\">" + text1[j] + "</span>");
                highlighted = true;
                pushed = true;
            }
            else if (normailizeText(text1[j]).join(" ").includes(keywords[i]) && !highlighted && !highlighted2) {
                if (pushed)
                    result.pop();
                result.push("<span class = \"highlightTextSub\">" + text1[j] + "</span>");
                highlighted2 = true;
                pushed = true;
            }
            else if (!pushed) {
                result.push(text1[j].trim());
                pushed = true;
            }
            if (highlighted)
                break;
        }
    }
    return result.join(" ");
}

//get country list item
function getCountryListItem(index) {
    return countrylist[index];
}

//get language list item
function getLanguageListItem(index) {
    return languagelist[index];
}