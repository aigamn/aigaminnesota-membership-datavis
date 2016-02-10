"use strict";
app.factory('MembershipDataService', function($http, $q) {

    var levels = {},
        studentLevels = {};

    function groupBy(array, property) {
        var hash = {};
        for (var i = 0; i < array.length; i++) {
            if (!hash[array[i][property]]) hash[array[i][property]] = [];
            hash[array[i][property]].push(array[i]);
        }
        return hash;
    }

    function round(num){
        return (num < 5) ? Math.floor(num) : Math.ceil(num);
    }

    function Event(date, eventName, eventType, timeOfDay, membershipCounts, studentCounts){
        var totalAttendance = 0,
            memberAttendance = 0,
            studentAttendance = 0,
            highValueCount = 0,
            studentTotal = 0,
            year = date.substring(0, 4),
            month = date.substring(4, 6),
            day = date.substring(6, 8),
            properDate = new Date(year, month-1, day),
            prettyDateArr = properDate.toDateString().split(" "),
            prettyDate = prettyDateArr[0] + ', ' + prettyDateArr[1] + ' ' + parseInt(prettyDateArr[2]);

        angular.forEach(membershipCounts, function(count, levelName) {
            count = parseInt(count);
            totalAttendance += count;
            switch(levelName){
                case "Trustee":
                    highValueCount += count;
                    memberAttendance += count;
                    break;
                case "Leader":
                    highValueCount += count;
                    memberAttendance += count;
                    break;
                case "Sustaining":
                    memberAttendance += count;
                    break;
                case "Supporting":
                    memberAttendance += count;
                    break;
                case "Contributor":
                    memberAttendance += count;
                    break;
                case "Other":
                    memberAttendance += count;
                    break;
                case "StudentMember":
                    studentAttendance += count;
                    break;
                case "StudentNonMember":
                    studentAttendance += count;
                    break;
                case "Educator":
                    studentAttendance += count;
                    break;
            }
        });

        studentCounts['NonStudent'] = totalAttendance - studentAttendance;

        return {
            "date": date,
            "prettyDate": prettyDate,
            "year": year,
            "eventName": eventName,
            "eventType": eventType,
            "expanded": true,
            "timeOfDay": timeOfDay,
            "membershipTotal": memberAttendance,
            "attendanceTotal": totalAttendance,
            "highValueCount": highValueCount,
            "membershipCounts": membershipCounts,
            "studentCounts": studentCounts,
            "expanded": false
        }
    }


    function YearlyMembership(yearName, monthlyMembershipCounts){
        var aggregatedCounts = {},
            averageCounts = {},
            averageTotal = 0;
            
            for(var i = 0; i < monthlyMembershipCounts.length; i++){
                angular.forEach(monthlyMembershipCounts[i].monthlyMembershipCounts, function(count, levelName) {
                    var haveData = !isNaN(parseInt(count));

                    count = (haveData) ? parseInt(count) : 0;

                    if(typeof aggregatedCounts[levelName] === 'undefined'){
                        aggregatedCounts[levelName] = 0;
                    }
                    aggregatedCounts[levelName] += count;
                });
            }

        // Visit non-inherited enumerable keys
        Object.keys(aggregatedCounts).forEach(function(level) {
            var roundedCount = round(aggregatedCounts[level] / monthlyMembershipCounts.length)
            averageCounts[level] = roundedCount;
            averageTotal += roundedCount;
        });

        averageCounts['Total'] = averageTotal;

        return averageCounts;
    }

    return {

        getYearlyData: function(){

            var url = 'http://ec2-52-21-189-85.compute-1.amazonaws.com/membershipvis/attendance.csv';
            
            return $http.get(url)
                .then(function(response) {
                    //console.log(response);
                    var rows = response.data.split("\n"),
                        columns = [],
                        headings = rows[0].split(","),
                        rowI,
                        colI,
                        year,
                        date,
                        eventName,
                        eventDate,
                        eventType,
                        timeOfDay,
                        attendanceTotalByMember,
                        attendanceTotalByStudent,
                        membershipCounts,
                        studentCounts,
                        yearsObj = {},
                        events = [],
                        years = [];

                    for(rowI = 0; rowI < rows.length; rowI++){
                        // get columns
                        if(rowI !== 0){
                            // each row is an event
                            columns = rows[rowI].split(",");
                            membershipCounts = {};
                            studentCounts = {};
                            // date, eventName, eventDate, eventType, attendanceTotalByMember, attendanceTotalByStudent, timeOfDay, membershipCounts, studentCounts
                            for(colI = 0; colI < columns.length; colI++){
                                //console.log(headings[colI] + ' = ' + columns[colI]);
                                
                                switch(headings[colI].trim()){
                                    case "Date":
                                        date = columns[colI];
                                        break;
                                    case "Title":
                                        eventName = columns[colI];
                                        break;
                                    case "Type":
                                        eventType = columns[colI];
                                        break;
                                    case "TimeOfDay":
                                        timeOfDay = columns[colI];
                                        break;
                                    case "Trustee":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Leader":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Sustaining":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Supporting":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Contributor":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "NonMember":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Other":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "StudentMember":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        studentCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "StudentNonMember":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        studentCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Educator":
                                        membershipCounts[headings[colI]] = columns[colI];
                                        studentCounts[headings[colI]] = columns[colI];
                                        break;
                                    default:
                                        console.log("Import of event failed: Heading is " + headings[colI] + " and value is " + columns[colI])    
                                }  
                            }
                            
                            
                            var event = new Event(
                                date, 
                                eventName, 
                                eventType, 
                                timeOfDay, 
                                membershipCounts, 
                                studentCounts
                            )

                            events.push(event);
                        }
                    }

                    // group events by year
                    yearsObj = groupBy(events,'year');

                    years = Object.keys(yearsObj).map(function(yearName) {
                        return {
                            yearName: yearName, 
                            events: yearsObj[yearName],
                            expanded: true,
                            membershipExpanded: true,
                            filteredEventExpanded: true,
                            eventsExpanded: true
                        };
                    });

                    return years;

                }, 
                function(response){
                    $q.reject(response.data);
                }
            );
        },

        getMembershipData: function(){

            var url = 'http://ec2-52-21-189-85.compute-1.amazonaws.com/membershipvis/attendance.csv';
            
            return $http.get(url)
                .then(function(response) {
                    //console.log(response);
                    var rows = response.data.split("\n"),
                        columns = [],
                        headings = rows[0].split(","),
                        rowI,
                        colI,
                        year,
                        date,
                        monthlyMembershipCounts = {},
                        monthlyMembershipArr = [],
                        yearsObj = {},
                        finalYearsObj = {},
                        years = [];

                    for(rowI = 0; rowI < rows.length; rowI++){
                        // get columns
                        if(rowI !== 0){
                            // each row is an event
                            columns = rows[rowI].split(",");
                            monthlyMembershipCounts = {};
                            // date, eventName, eventDate, eventType, attendanceTotalByMember, attendanceTotalByStudent, timeOfDay, membershipCounts, studentCounts
                            for(colI = 0; colI < columns.length; colI++){
                                //console.log(headings[colI] + ' = ' + columns[colI]);
                                
                                switch(headings[colI].trim()){
                                    case "Date":
                                        date = columns[colI];
                                        break;
                                    case "Trustee":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Leader":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Sustaining":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Supporting":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Contributor":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "Other":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    /*case "StudentMember":
                                        monthlyMembershipCounts[headings[colI]] = columns[colI];
                                        break;
                                    case "EducatorMember":
                                        monthlyMembershipCounts["EducatorMember"] = columns[colI];
                                        break;*/
                                    default:
                                        console.log("Import of MonthlyMembership failed: Heading is " + headings[colI] + " and value is " + columns[colI])    
                                }  
                            }
                            
       
                            var monthlyMembership = {
                                date: date,
                                year: date.substring(0, 4),
                                monthlyMembershipCounts, monthlyMembershipCounts
                            }

                            monthlyMembershipArr.push(monthlyMembership);
                        }
                    }

                    // group events by year
                    yearsObj = groupBy(monthlyMembershipArr,'year');
                    /*
                    years = Object.keys(yearsObj).map(function(yearName) {
                        return {
                            yearName: yearName,
                            monthlyMembershipCounts: monthlyMembershipCounts,
                            expanded: true
                        };
                    });
                    */
                    Object.keys(yearsObj).forEach(function(year) {
                        finalYearsObj[year] = new YearlyMembership(year, yearsObj[year]);
                    });

                    return finalYearsObj;

                }, 
                function(response){
                    $q.reject(response.data);
                }
            );
        }
        


    };
});