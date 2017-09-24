!function(){"use strict";const renderFourWeekBreakout=function(symbol){fetch("/detectFourWeekBreakout?sym="+symbol).then(function(response){return response.json()}).then(function(json){console.log(json)})};window.addEventListener("DOMContentLoaded",function(){console.log("Hello World"),renderFourWeekBreakout("RAD")})}();
//# sourceMappingURL=maps/app.js.map
