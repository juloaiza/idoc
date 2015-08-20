var neighborcell;
function addShowNeighborsButton(passIn){
    var neighborControlDiv = document.createElement('div');
    new NeighborButton(neighborControlDiv, map, passIn);
    neighborControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(neighborControlDiv);
}
function NeighborButton(controlDiv, map, passIn) {
    deleteNeighbors();
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderBottomLeftRadius = '3px';
    controlUI.style.borderBottomRightRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Show Neighbors';
    controlUI.appendChild(controlText);
    controlUI.addEventListener('click', showNeighbors(passIn,controlText,controlUI));
}
function showNeighbors(passIn,controlText,controlUI){
    return function(){
        if (neighborLines.length ==0){
            var cellName = passIn[1]['sector'][passIn[0]]['lncel_name'];
            var neighborList = getNeighborData(cellName);
            for (var i = 0; i<neighborList.length;i++){
                for (var j=0; j< passIn[1]['sector'].length; j++){
                    if (passIn[1]['sector'][j]['lncel_name']==neighborList[i]){
                        var coords = [
                            {lat: cellMidpoint(passIn[1]['sector'][passIn[0]].Lat,passIn[1]['sector'][passIn[0]].Log,passIn[1]['sector'][passIn[0]].azimuth,'lat'),
                            lng: cellMidpoint(passIn[1]['sector'][passIn[0]].Lat,passIn[1]['sector'][passIn[0]].Log,passIn[1]['sector'][passIn[0]].azimuth,'lon')},
                            {lat: cellMidpoint(passIn[1]['sector'][j].Lat,passIn[1]['sector'][j].Log,passIn[1]['sector'][j].azimuth,'lat'),
                            lng: cellMidpoint(passIn[1]['sector'][j].Lat,passIn[1]['sector'][j].Log,passIn[1]['sector'][j].azimuth,'lon')}
                        ];
                        var path = new google.maps.Polyline({
                            path: coords,
                            geodesic: true,
                            strokeColor: '#EA088E',
                            strokeOpacity: 1.0,
                            strokeWeight: 1
                        });
                        path.setMap(map);
                        neighborLines.push(path);
                    }
                }
            }
            if(neighborLines.length!=0){
                controlText.innerHTML='Hide Neighbors';
            }
        }
        else{
            deleteNeighbors();
            controlText.innerHTML='Show Neighbors';
        }
    };
}
function deleteNeighbors(){
    for (var k=0;k<neighborLines.length;k++) {
        neighborLines[k].setMap(null);
    }
    neighborLines=[];
}