console.log("Node admin device information");
var connected = false;
var table;
if(location.protocol=="https:"){
    var wsUri="wss://"+window.location.hostname+":3000/ws/devices";
} else {
    var wsUri="ws://"+window.location.hostname+":3000/ws/devices";
}
var ws=null;

//Jason ad on 2018.12.26 for chart -- start 
var timeFormat = 'YYYY-MM-DD HH:mm';

function newDate(days) {
    return moment().add(days, 'hours').toDate();
}

function newDateString(days) {
    return moment().add(days, 'hours').format(timeFormat);
}

var color = Chart.helpers.color;
var config = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        title: {
            text: 'Chart.js Time Scale'
},
tooltips: {
    mode: 'index'
},
hover: {
    mode: 'index'
},
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    parser: timeFormat,
                    // round: 'day'
                    tooltipFormat: 'll HH:mm'
                },
                scaleLabel: {
                    display: false,
                    labelString: 'Date'
                }
            }],
            yAxes: [{
    ticks: {
        beginAtZero: true
    },
                scaleLabel: {
                    display: false,
                    labelString: 'value'
                }
            }]
        },
    }
};
//Jason ad on 2018.12.26 for chart -- end 

function wsConn() {
ws = new WebSocket(wsUri);
    ws.onmessage = function(m) {
        //console.log('< from-node-red:',m.data);
        if (typeof(m.data) === "string" && m. data !== null){
        var msg =JSON.parse(m.data);
        console.log("from-node-red : id:"+msg.id);
        if(msg.id === 'change_table'){
            //Remove init button active
            var mac = document.getElementById("mac").value;
            console.log("current mac : "+ mac);
            console.log("feedback mac : "+ msg.mac);
            if(mac !== msg.mac) {
                return;
            }
            
            console.log("v : "+ JSON.stringify(msg.v));

            //Reload table data
            console.log("v type:"+typeof(msg.v));
            table = $('#table1').dataTable();
            table.fnClearTable();
            var data = msg.v;
            if (typeof(msg.v) !== 'object') {
                data = JSON.parse(msg.v);
            }

            if(data && data.length > 0){
                table.fnAddData(data);
                table.$('tr').click(function() {
                var row=table.fnGetData(this);
                    toSecondTable(row[1]);
                });
            }
            waitingDialog.hide();
        }else if(msg.id === 'init_btn'){
            //Set init button active
            console.log("type:"+typeof(msg.v)+" = "+ msg.v);
            type = msg.v;
            }
        }
    }
    ws.onopen = function() {

        var mac = document.getElementById("mac").value;
        var date  = document.getElementById("date").value;
        var option  = document.getElementById("option").value;;
        console.log('date :'+ date);
        connected = true;
        var obj = {"id":"init", "v": {mac: mac, date: date, option: option}};
        var getRequest = JSON.stringify(obj);
        console.log("getRequest type : "+ typeof(getRequest)+" : "+getRequest);
        console.log("ws.onopen : "+ getRequest);
        ws.send(getRequest);      // Request ui status from NR
        console.log(getRequest);

    }
    ws.onclose   = function()  {
        console.log('Node-RED connection closed: '+new Date().toUTCString());
        connected = false;
        ws = null;
    }
    ws.onerror  = function(){
        console.log("connection error");
    }
}
wsConn();           // connect to Node-RED server

function setButton(_id,_v){ // update slider
myselect = $("#"+_id);
    myselect.val(_v);
    myselect.slider('refresh');
}

function myFunction(id){  // update device
    console.log(id);
    if(ws){
        console.log("ws.onopen OK ");
    }
    //console.log("id type : "+ typeof(id)+" : "+id);
    var obj = {"id":"change_type","v":id};
    var objString = JSON.stringify(obj);
    //console.log("getRequest type : "+ typeof(objString)+" : "+objString);
    //console.log("ws.onopen : "+ objString);
    ws.send(objString);     // Request ui status from NR
    console.log("sent change_type requeset");

}

function back(){
    //alert('back');
    location.href=document.referrer;
}

function showDialog(){
    //waitingDialog.show('Custom message', {dialogSize: 'sm', progressType: 'warning'});
    waitingDialog.show();
    setTimeout(function () {
    waitingDialog.hide();
    }, 10000);
}


$(document).ready(function(){
    showDialog();
    
    var opt={"oLanguage":{"sProcessing":"處理中...",
            "sLengthMenu":"顯示 _MENU_ 項結果",
            "sZeroRecords":"沒有匹配結果",
            "sInfo":"顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
            "sInfoEmpty":"顯示第 0 至 0 項結果，共 0 項",
            "sInfoFiltered":"(從 _MAX_ 項結果過濾)",
            "sSearch":"搜索:",
            "oPaginate":{"sFirst":"首頁",
                        "sPrevious":"上頁",
                        "sNext":"下頁",
                        "sLast":"尾頁"}
            },dom: 'Blrtip',
            buttons: [
                'copyHtml5',
                //'excelHtml5',
                //'pdfHtml5',
                //'csvHtml5'
                {
                    extend: 'csvHtml5',
                    text: 'CSV',
                    bom : true
                }
            ]
    };
    var opt2 = {
            dom: 'Blrtip',
            buttons: [
                'copyHtml5',
                //'excelHtml5',
                //'pdfHtml5',
                //'csvHtml5'
                {
                    extend: 'csvHtml5',
                    text: 'CSV',
                    bom : true
                }
            ]
    };
    $("#table1").dataTable(opt);

    var ctx = document.getElementById('canvas').getContext('2d');
	window.myLine = new Chart(ctx, config);
});