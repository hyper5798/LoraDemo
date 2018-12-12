console.log("My Index");

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
            },dom: 'rtip'
    };
var opt2={
     "order": [[ 2, "desc" ]],
     "iDisplayLength": 25
 };

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
        date = date + '23:59:59';
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
    var table = $("#table1").dataTable(opt);
    table.$('tr').click(function() {
        var row=table.fnGetData(this);
        toSecondTable(row[1]);
    });
    var now = new Date();
    var nowDate = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
    document.getElementById("date").value = nowDate;
});

