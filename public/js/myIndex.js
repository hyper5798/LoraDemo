console.log("My Index");
var table = null;
var maps = JSON.parse(document.getElementById("maps").value);
var devices = JSON.parse(document.getElementById("devices").value);

var opt={   "iDisplayLength": 25,
            "oLanguage":{"sProcessing":"處理中...",
            "sLengthMenu":"顯示 _MENU_ 項結果",
            "sZeroRecords":"沒有匹配結果",
            "sInfo":"顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
            "sInfoEmpty":"顯示第 0 至 0 項結果，共 0 項",
            "sInfoFiltered":"(從 _MAX_ 項結果過濾)",
            "sSearch":"搜索:",
            "iDisplayLength": 25,
            "oPaginate":{"sFirst":"首頁",
                        "sPrevious":"上頁",
                        "sNext":"下頁",
                        "sLast":"尾頁"}
            },dom: 'rtip'
    };
var opt2={
     "order": [[ 2, "desc" ]],
     "iDisplayLength": 25
 };

 function changeMap(value) {
    table.fnClearTable();
    let list = [];
    let data = getTabledata(devices[value]);
    if(data && data.length > 0){
        table.fnAddData(data);
        table.$('tr').click(function() {
        var row=table.fnGetData(this);
            toSecondTable(row[1]);
        });
    }
 }

 function getTabledata (lists) {
    var mItem = 1;
    var array = [];
    // alert(lists.length);

    for (var i=0;i<lists.length;i++)
    {
        array.push(getArray(lists[i],mItem));
        mItem++;
    }
    return array;
}

function getArray (obj,item){
    var arr = [];
    if(item<10){
        arr.push('0'+item);
    }else{
        arr.push(item.toString());
    }

    let last = new Date(obj.date).getTime();
    let now = new Date().getTime();
    let check = ( now - last)/(3600*1000); 
    arr.push(obj.macAddr);
    arr.push(obj.date);
    arr.push(obj.typeName);
    if(check > 2) {
        arr.push('<img src="/icons/connection_fail.png" width="ˇ30" height="30" name="status">');
    } else {
        arr.push('<img src="/icons/connection_ok.png" width="30" height="30" name="status">');
    }
    
    return arr ;
}

function toSecondTable(mac){
    console.log("mac :"+mac);
    var myDate = getNowDate();
    var myTime = getNowTime();
    var date = document.getElementById("date").value;
    if ( date === '') {
        date = myDate + ' ' + myTime;
    } else if (date === myDate) {
        date = myDate + ' ' + myTime;
    } else {
        date = date + ' 23:59:59';
    }
    var option = document.getElementById("option").value;
    
    document.location.href="/devices?mac=" + mac + '&date=' + date + '&option=' + option;
}

function getNowDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }
    return year + '/' + month + '/' + day;
}

function getNowTime() {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second  < 10) {
        second  = '0' + second ;
    }
    return hour + ':' + minute + ':' + second; 
}

$(document).ready(function(){
    new Calendar({
        inputField: "date",
        dateFormat: "%Y/%m/%d",
        trigger: "BTN",
        bottomBar: true,
        weekNumbers: true,
        showTime: false,
        onSelect: function() {this.hide();}
    });
    table = $("#table1").dataTable(opt);
    table.$('tr').click(function() {
        var row=table.fnGetData(this);
        toSecondTable(row[1]);
    });
    var now = new Date();
    var nowDate = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
    document.getElementById("date").value = nowDate;
});

