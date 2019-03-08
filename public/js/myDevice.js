console.log("Node admin device information");
var field  = JSON.parse(document.getElementById("field").value);
console.log("$$$$ field :", JSON.stringify(field));
var connected = false;
var table;
if(location.protocol=="https:"){
    var wsUri="wss://"+window.location.hostname+":3000/ws/devices";
} else {
    var wsUri="ws://"+window.location.hostname+":3000/ws/devices";
}

var myChart = echarts.init(document.getElementById('main'));

// 指定图表的配置项和数据
let lineOption = {
    title: {
        text: '折线图堆叠'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:[/*'邮件营销','联盟广告','视频广告','直接访问','搜索引擎'*/]
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [/*  '周一','周二','周三','周四','周五','周六','周日'*/]
    },
    yAxis: {
        type: 'value'
    },
    series: [
        /* {
            name:'邮件营销',
            type:'line',
            stack: '总量',
            data:[120, 132, 101, 134, 90, 230, 210]
        },
        {
            name:'联盟广告',
            type:'line',
            stack: '总量',
            data:[220, 182, 191, 234, 290, 330, 310]
        },
        {
            name:'视频广告',
            type:'line',
            stack: '总量',
            data:[150, 232, 201, 154, 190, 330, 410]
        },
        {
            name:'直接访问',
            type:'line',
            stack: '总量',
            data:[320, 332, 301, 334, 390, 330, 320]
        },
        {
            name:'搜索引擎',
            type:'line',
            stack: '总量',
            data:[820, 932, 901, 934, 1290, 1330, 1320]
        } */
    ] 
};

// 使用刚指定的配置项和数据显示图表。
// myChart.setOption(lineOption);

var ws=null;
wsConn(); 

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
                console.log("$$$$ data :", JSON.stringify(data));
                toSetChart(data);

                if(data && data.length > 0){
                    table.fnAddData(data);
                    table.$('tr').click(function() {
                    var row=table.fnGetData(this);
                        toSecondTable(row[1]);
                    });
                }
                waitingDialog.hide();
            }
        }
    }
    ws.onopen = function() {

        var mac = document.getElementById("mac").value;
        var date  = document.getElementById("date").value;
        var option  = document.getElementById("option").valu
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

function toSetChart(list) {
    console.log("$$$$ toSetChart");
    let myOption = JSON.parse(JSON.stringify(lineOption)); //複製lineOption
    let timeArr = [];
    let seriesArr = [];
    let seriesData = [];

    //將所有資料列表取得時間跟感測器所有參數集合
    list.forEach(function(item) {
        console.log("item :", JSON.stringify(item));
        //從時間欄逐一加入時間陣列中
        timeArr.push(item[1]);
        //從參數欄位開始逐一加入感測器所有參數集合中
        for(let j=0; j < field.length; j++) {
            if(seriesData[j] == undefined) {
                seriesData[j] = []; 
            }
            console.log("item :",j);
            console.log(item[j+3]);
            (seriesData[j]).push(item[j+3]);
        }
    });

    for(let i=0; i < field.length; i++) {
        // console.log(item);

        
        let tmp = {
            name: field[i],
            type:'line',
            data: seriesData[i] //將資料從感測器所有參數集合中取出
        };
        if(field[i] != "電壓") {
            seriesArr.push(tmp);
        }
    }

    // console.log("seriesArr : ", JSON.stringify(seriesArr));
    myOption.legend.data = JSON.parse(JSON.stringify(field));//複製field 到 
    myOption.xAxis.data = timeArr;
    myOption.series = seriesArr;
    myChart.setOption(myOption);
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
});

