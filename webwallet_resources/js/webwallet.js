//version 1
//version 1.01 - added restore address book and rescan wallet when clicking on refresh balance
var server_address = "127.0.0.1:8888";
var wallet_url = "http://" + server_address + "/json_rpc";
var node_server_address = "127.0.0.1:33031";
var node_close_url = "http://" + node_server_address + "/stop_daemon";
var close_wallet_ok = false;
var close_node_ok = false;
var block_height = null;
var temp_address_book = null;


/* OPEN WALLET */
function notification_show_open_wallet_succes() {
    $(".open-wallet-status").removeClass('alert-danger');
    $(".open-wallet-status").removeClass('alert-warning');
    $(".open-wallet-status").removeClass('alert-success');
    $(".open-wallet-status").show().addClass("alert-success");
    $(".open-wallet-status strong").text("You can now use the wallet!");
    $(".wallet-info-holder").show();
    top_wallet_address();
    generate_qr();
	$(".open-wallet-status").delay(5000).fadeOut(1500);
}

function notification_show_open_wallet_fail() {
    $(".open-wallet-status").removeClass('alert-danger');
    $(".open-wallet-status").removeClass('alert-warning');
    $(".open-wallet-status").removeClass('alert-success');
    $(".open-wallet-status").show().addClass("alert-danger");
    $(".open-wallet-status strong").text("Could not connect to daemon!");
    $(".wallet-info-holder").hide();
}


function notification_show_open_wallet_wrong_password() {
    $(".open-wallet-status").removeClass('alert-danger');
    $(".open-wallet-status").removeClass('alert-warning');
    $(".open-wallet-status").removeClass('alert-success');
    $(".open-wallet-status").show().addClass("alert-warning");
    $(".open-wallet-status strong").text("Wrong password!");
    $(".wallet-info-holder").hide();
}

function top_wallet_address() {
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: '{"jsonrpc":"2.0","id":"0","method":"getaddress"}',
        success: function(data) {
            $("#top-wallet-address").text(data.result.address);
        },
        error: function() {
            console.log("error show wallet address");
        }
    });
}



function save_wallet() {
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: '{"jsonrpc":"2.0","id":"0","method":"store"}',
        success: function(data) {
            //$("#top-wallet-address").text(data.result.address);
            console.log(data);
        },
        error: function(data) {
            console.log(data);
            //console.log("error show wallet address");
        }
    });
}

function spinner_available_balance(action) {
    if (action) {
        $("#refresh_balance i").addClass("fa-spin");
    } else {
        $("#refresh_balance i").removeClass("fa-spin");
    }
}

function open_wallet() {
    var wallet_file = $("#open-wallet-name").val();
    var wallet_pass = $("#open-wallet-password").val();
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"open_wallet","params":{"filename":"${wallet_file}","password":"${wallet_pass}"}}`,
        beforeSend: function() {
            spinner_available_balance("spin");
        },
        success: function(data) {
            spinner_available_balance();
            temp_data = data;
            if (!temp_data.error) { //nu are eroare 
                notification_show_open_wallet_succes();
                show_top_balance();
                //rescan_blockchain();
            } else {
                notification_show_open_wallet_wrong_password();
            }
            console.log("succes open");
        },
        error: function() {
            notification_show_open_wallet_fail();
        }
    });
}

function view_wallet_seed() {
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"mnemonic"}}`,
        success: function(data) {
            $(".open-wallet-status-info").show();
            $(".open-wallet-status-info").text(data.result.key);
        },
        error: function() {
            $(".open-wallet-status-info").show();
            $(".open-wallet-status-info").text("Some error code");
        }
    });
}

function view_wallet_view_key() {
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"query_key","params":{"key_type":"view_key"}}`,
        success: function(data) {
            $(".open-wallet-status-info").show();
            $(".open-wallet-status-info").text(data.result.key);
        },
        error: function() {
            $(".open-wallet-status-info").show();
            $(".open-wallet-status-info").text("Some error code");
        }
    });
}


$("#open-wallet-button").click(function() {
    open_wallet();
    $(".open-wallet-status-info").hide();
});
$("#info-seed-wallet-button").click(function() {
    view_wallet_seed();
});
$("#info-view-wallet-button").click(function() {
    view_wallet_view_key();
});
/* OPEN WALLET */



/* CREATE WALLET */
function notification_show_create_wallet_succes() {
    $(".create-wallet-status").removeClass('alert-danger');
    $(".create-wallet-status").removeClass('alert-warning');
    $(".create-wallet-status").removeClass('alert-success');
    $(".create-wallet-status").show().addClass("alert-success").delay(5000).fadeOut(1500);;
    $(".create-wallet-status strong").text("Wallet Created, use Open Wallet tab!");

}

function notification_show_create_wallet_fail() {
    $(".create-wallet-status").removeClass('alert-danger');
    $(".create-wallet-status").removeClass('alert-warning');
    $(".create-wallet-status").removeClass('alert-success');
    $(".create-wallet-status").show().addClass("alert-danger");
    $(".create-wallet-status strong").text("Could not connect to daemon!");
}

function notification_show_create_wallet_error(error_text) {
    $(".create-wallet-status").removeClass('alert-danger');
    $(".create-wallet-status").removeClass('alert-warning');
    $(".create-wallet-status").removeClass('alert-success');
    $(".create-wallet-status").show().addClass("alert-danger");
    $(".create-wallet-status strong").text(error_text);
}



function notification_show_add_entry_error(error_text) {
    $(".add-entry-wallet-status-info").removeClass('alert-danger');
    $(".add-entry-wallet-status-info").removeClass('alert-warning');
    $(".add-entry-wallet-status-info").removeClass('alert-success');
    $(".add-entry-wallet-status-info").show().addClass("alert-danger");
    $(".add-entry-wallet-status-info strong").text(error_text);
}



function notification_show_create_wallet_already_exist() {
    $(".create-wallet-status").removeClass('alert-danger');
    $(".create-wallet-status").removeClass('alert-warning');
    $(".create-wallet-status").removeClass('alert-success');
    $(".create-wallet-status").show().addClass("alert-warning").delay(5000).fadeOut(1500);;
    $(".create-wallet-status strong").text("Wallet already exists! Use Open Wallet Tab");
}

function notification_show_create_wallet_insert_values() {
    $(".create-wallet-status").removeClass('alert-danger');
    $(".create-wallet-status").removeClass('alert-warning');
    $(".create-wallet-status").removeClass('alert-success');
    $(".create-wallet-status").show().addClass("alert-warning").delay(5000).fadeOut(1500);;
    $(".create-wallet-status strong").text("Write wallet name and password!?!");
}


function create_wallet() {
    var wallet_file = $("#create-wallet-name").val();
    var wallet_pass = $("#create-wallet-password").val();
    if ((wallet_file.length > 0) && (wallet_pass.length > 0)) {
        $.ajax({
            url: wallet_url,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            crossDomain: true,
            data: `{"jsonrpc":"2.0","id":"0","method":"create_wallet","params":{"filename":"${wallet_file}","password":"${wallet_pass}","language":"English"}}`,
            success: function(data) {
                temp_data = data;

                if (!temp_data.error) { //nu are eroare 
                    notification_show_create_wallet_succes();
                } else {
                    //notification_show_open_wallet_wrong_password();
                    notification_show_create_wallet_error(temp_data.error.message);
                }
            },
            error: function() {
                notification_show_create_wallet_fail();
            }
        }); //ajax end
    } else {
        notification_show_create_wallet_insert_values();
    }
}

$("#create-wallet-button").click(function() {
    create_wallet();
});
/* CREATE WALLET */


/* TRANSFERS */
function show_transfers(transfer_type) {
    var transfers = transfer_type;
    var table;
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"incoming_transfers","params":{"transfer_type":"${transfers}"}}`,
        success: function(data) {

            if (data.result.transfers) {
                $("#no-payments-alert").hide();
                $.fn.dataTable.render.edlvalue = function(cutoff) {
                    return function(data, type, row) {
                        if (type === 'display') {
                            var str = data.toString(); // cast numbers
                            return str.length < cutoff ?
                                str :
                                str = str / 1000000000;
                        }
                        return data;
                    };
                };
                table = $('#transfers-container').DataTable({
                    data: data.result.transfers,
                    columns: [{
                            "data": "amount",
                            "title": "Amount",
                            render: $.fn.dataTable.render.edlvalue(1)
                        },
                        {
                            "data": "global_index",
                            "title": "Index"
                        },
                        {
                            "data": "spent",
                            "title": "Spent"
                        },
                        {
                            "data": "subaddr_index",
                            "title": "SubAddress index"
                        },
                        {
                            "data": "tx_hash",
                            "title": "tx hash"
                        },
                        {
                            "data": "tx_size",
                            "title": "tx size"
                        }
                    ],
                    "bDestroy": true,
                    "order": [
                        [1, "desc"]
                    ]
                });

            } else {
                $("#transfers-container_wrapper").hide();
                console.log("nu are");
                $("#no-payments-alert").show();
            }
        },
        error: function() {
            console.log("error show wallet address");
        }
    });
}
$("#refresh-transfers-button-all").click(function() {
    show_transfers("all");
});
$("#refresh-transfers-button-unavailable").click(function() {
    show_transfers("unavailable");
});
$("#refresh-transfers-button-available").click(function() {
    show_transfers("available");
});
/* TRANSFERS */



/* ADDRESS BOOK */
function show_address_book() {
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: '{"jsonrpc":"2.0","id":"0","method":"get_address_book","params":{"entries":[]}}',
        success: function(data) {
            $("#no-address-book-alert").hide();
            //console.log(data);
            if (data.result.entries) {
                $.fn.dataTable.render.edlvalue = function(cutoff) {
                    return function(data, type, row) {
                        if (type === 'display') {
                            var str = data.toString(); // cast numbers
                            return str.length < cutoff ?
                                str :
                                str = str / 1000000000;
                        }
                        return data;
                    };
                };
                $("#address-book-container").text("");
                var table = $('#address-book-container').DataTable({
                    data: data.result.entries,
                    columns: [{
                            "data": "address",
                            "title": "Address"
                        },
                        {
                            "data": "description",
                            "title": "Name"
                        }

                    ],
                    "bDestroy": true,
                    "order": [
                        [1, "desc"]
                    ]
                });

            } else {
                $("#address-book-container_wrapper").hide();
                $("#no-address-book-alert").show();
            }
        },
        error: function() {
            console.log("error show wallet address");
        }
    });
}



function get_address_book() {
	var dummy = 1;
     return $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: '{"jsonrpc":"2.0","id":"0","method":"get_address_book","params":{"entries":[]}}',
        success: function(data) {
            if (data.result.entries) {
			if (data.result.entries.length > 0 ){
				temp_address_book = data.result.entries;
				}
				return temp_address_book;
			}
        },
        error: function() {
            console.log("error show wallet address");
			return dummy;
        }
    });
}


function add_to_address_book(someaddress) {
	var entry_address;
	var entry_description;
	if (someaddress){
		entry_address = someaddress.address;
		entry_description = someaddress.description;
	}
	else {
    entry_address = $("#entry_address").val();
    entry_description = $("#entry_description").val();
	}
    if ((entry_address.length > 0) && (entry_description.length > 0)) {
        $.ajax({
            url: wallet_url,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            crossDomain: true,
            data: `{"jsonrpc":"2.0","id":"0","method":"add_address_book","params":{"address":"${entry_address}","description":"${entry_description}"}}`,
            success: function(data) {
                temp_data = data;
                if (!temp_data.error) {
                    show_address_book();
                } else {
                    notification_show_add_entry_error(temp_data.error.message);
                }
            },
            error: function() {}
        }); //ajax end
    } //if end

}


$("#refresh-book-button").click(function() {
    show_address_book();
});
$("#add-entry-button").click(function() {
    add_to_address_book();
});
$("#save-wallet-button").click(function() {
    save_wallet();
});
/* ADDRESS BOOK */

/* BALANCE */
function show_top_balance() {
    var balance;
    var unlocked_balance;
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"getbalance"}`,
        beforeSend: function() {
            spinner_available_balance("spin");
        },
        success: function(data) {
            temp_data = data;
            spinner_available_balance();
            if (!temp_data.error) { //nu are eroare 
                $("#top-wallet-total-balance").text(temp_data.result.balance / 1000000000 + " EDL");
                $("#top-wallet-available-balance").text(temp_data.result.unlocked_balance / 1000000000 + " EDL");
				get_height();
            } else {

            }
        },
        error: function() {
            console.log(JSON.stringify(data));
        }
    });
}

function rescan_blockchain() {
   get_address_book().then(
   function(result){ 
   $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"rescan_blockchain"}`,
        beforeSend: function() {
            spinner_available_balance("spin");
        },
        success: function(data) {
            show_top_balance();
            spinner_available_balance();
        },
        error: function() {
			console.log("error rescanning");
        },
		complete: function(){
			//restore the address book to the wallet
			if (result.result.entries){
				result.result.entries.forEach(function(element){
				add_to_address_book(element);
				});
			}
		}});}
   );//then
}



function get_height() {
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"getheight"}`,
        success: function(data) {
            // temp_data = data;
			block_height = data.result.height;
            //show_top_balance();
            show_top_height();
            //spinner_available_balance();
        },
        error: function() {
        }
    });
}


function show_top_height(){
	$("#top-wallet-height").text(block_height);
}





function close_broswer() {
    //console.log("closing");
    if (close_wallet_ok && close_node_ok) {
        window.close();
    }
}


function close_wallet() {
    //console.log("close wallet");
    $.ajax({
        url: wallet_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"stop_wallet"}`,
        success: function(data) {
            close_wallet_ok = true;
        },
        error: function() {}
    });

    //console.log("close node");
    $.ajax({
        url: node_close_url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        crossDomain: true,
        data: `{"jsonrpc":"2.0","id":"0","method":"stop_wallet"}`,
        success: function(data) {
            close_node_ok = true;
        },
        error: function(data) {}
    });
    setInterval(close_broswer, 1000);
}

$("#modal-close-wallet").click(function() {
    close_wallet();
});
/* BALANCE */


/* SEND  */
function send_cash() {
    var sendtoamount = $("#send-to-amount").val();
    var sendtoaddress = $("#send-to-address").val();
    var sendtopaymentid = $("#send-to-payment-id").val();
    if ((sendtoamount.length > 0) && (sendtoaddress.length > 0)) {
        var sendEDL = sendtoamount * 1000000000;
        $.ajax({
            url: wallet_url,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            crossDomain: true,
            data: `{
	"jsonrpc":"2.0",
	"id":"0",
	"method":"transfer",
	"params":
		{
			"destinations":[{"amount":${sendEDL},"address":"${sendtoaddress}"}],
			"mixin":5,
			"get_tx_key": true,
			"priority":0
		}
	}`,
            success: function(data) {
                //console.log(data);
                if (!data.error) { //nu are eroare 
                    $("#send-wallet-status strong").html("FEE : " + data.result.fee / 1000000000 + "<br/>TX HASH : " + data.result.tx_hash + "<br/>TX KEY : " + data.result.tx_key + "<br/>TX BLOB : " + data.result.tx_blob).show();
                    notification_send_wallet_status_ok();
                } else {
                    notification_send_wallet_status_fail(data.error.message);
                }
            },
            error: function() {
                console.log("error show wallet address");
            }
        });
    }
}
$("#send-cash-button").click(function() {
    send_cash();
});
$("#refresh_balance").click(function() {
    rescan_blockchain();
	//show_top_balance();
});


function notification_send_wallet_status_fail(error_text) {
    $(".send-wallet-status").removeClass('alert-danger');
    $(".send-wallet-status strong").html("");
    $(".send-wallet-status").removeClass('alert-warning');
    $(".send-wallet-status").removeClass('alert-success');
    $(".send-wallet-status").show().addClass("alert-danger");
    //$(".send-wallet-status").append('<strong></strong><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    $(".send-wallet-status strong").text(error_text);
}

function notification_send_wallet_status_ok() {
    $(".send-wallet-status").removeClass('alert-danger');
    $(".send-wallet-status").removeClass('alert-warning');
    $(".send-wallet-status").removeClass('alert-success');
    $(".send-wallet-status").show().addClass("alert-success");
    //$(".send-wallet-status strong").text();
}


/* SEND  */



/* RECEIVE */
function generate_qr() {
    var wallet_address = $("#top-wallet-address").text();
    $('#qrcode').html("");
    $('#qrcode').qrcode({
        text: wallet_address
    });
}

$('a[href$="receive"]').on("click", function() {
    generate_qr()
});

/* RECEIVE */

//html
$(function() {
    $("[data-hide]").on("click", function() {
        $(this).parent().hide();
    });
});
