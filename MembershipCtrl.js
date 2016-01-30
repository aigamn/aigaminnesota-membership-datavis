app.controller('MembershipCtrl', ['$scope', 'MembershipDataService', function($scope, MembershipDataService) {
    
    // declare private variables and functions
    var data = MembershipDataService;

    function init(){
        // the master plan, what to do, and in what order
        data.getYearlyData().then(function(yearlyData) {
            // promise fulfilled
            $scope.years = yearlyData;
        }, function(error) {
            console.log('error', error);
        });

        data.getMembershipData().then(function(membershipData) {
            // promise fulfilled
            $scope.membershipAverages = membershipData;
        }, function(error) {
            console.log('error', error);
        });


    }

    // declare public variable and functions available within $scope
    $scope.years = [];
    $scope.colors = {
        "Trustee":'#990990',
        "Leader":'#109618',
        "Sustaining": '#ff9900',
        "Supporting": "#dc3912",
        "Contributor":'#2266cc',
        "NonMember": "#c2b59c",
        "StudentMember": "#12dcb7",
        "StudentNonMember": "#370999",
        "Educator": "#bddc12",
        "EducatorMember": "#bddc12"
    }
    $scope.membershipLevels = [
        "Trustee",
        "Leader",
        "Sustaining",
        "Supporting",
        "Contributor"
    ]
    $scope.filteredEvents = {};
    
    $scope.breakdown = "ticket";
    
    $scope.toggleVis = function(element){
        // element can be year or month
        element.expanded = !element.expanded;
    }

    $scope.caclulatePercent = function(partialCount, totalCount){
        var ratio = partialCount / totalCount * 100;
        //return { 'width': ratio + '%'};
        return String(ratio + '%');
    }

    $scope.getFilteredLevelTotals = function(filteredEvents){
        //console.log(filteredEvents);
        var levelCounts = {};
        var totalCount = 0;
        if(typeof filteredEvents !== 'undefined'){
            for(var i = 0; i < filteredEvents.length; i++){
                angular.forEach(filteredEvents[i].membershipCounts, function(count, levelName){
                    var theCount = parseInt(count);
                    if(typeof levelCounts[levelName] === 'undefined'){
                        levelCounts[levelName] = 0;
                    }
                    levelCounts[levelName] += theCount;
                    totalCount += theCount;
                });
            }
        }
        levelCounts['Total'] = totalCount;
        return levelCounts;
    }

    init(); // self initialize
    
}]);