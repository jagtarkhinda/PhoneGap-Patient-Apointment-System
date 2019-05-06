// window.openDatabase("database-name","version","database description","database size in bytes")
var login = 0;
var loggedUser = "";
var doclen = 0;
var current_doc_name = "";
var man_current_doc_name = "";
var pat_remove = false;
var current_doc_time = "";
var current_doc_date = "";
var occupied_timings = [];
var doc_name_del = "";
var doc_time_del = "";
var doc_date_del = "";
var db = window.openDatabase("hellodoc", "1.0", "database for patients", 3000000); //will create database Dummy_DB or open it

//User Login
document.addEventListener("deviceready", onDeviceReady, false);
document.getElementById('loginButton').addEventListener('click', function () {
    // alert("login clicked");
    var logmail = document.getElementById('logmail').value;
    var logpass = document.getElementById('logpassword').value;
    if ((logmail == "manager@gmail.com") && (logpass == "m123")) {
        window.sessionStorage.setItem("managermail", logmail);
        window.sessionStorage.setItem("managerpass", logpass);
        window.location = "manager.html";
         window.plugins.toast.showShortCenter("Welcome to Admin Panel");
    } else {
        db.transaction(function (tx) {
            tx.executeSql("select * from patientsnew where email=? AND password=?", [logmail, logpass], function (tx1, result) {
                var len = result.rows.length;

                if (len > 0) {
//                    alert("Login successfull");
                    window.plugins.toast.showShortTop("Login Successfull");
                    loggedUser = result.rows.item(0).firstname;
                    email = result.rows.item(0).email;
                    id = result.rows.item(0).id;
                    window.sessionStorage.setItem("currentuser", loggedUser);
                    window.sessionStorage.setItem("currentemail", email);
                    window.sessionStorage.setItem("currentid", id);
                    $("#buttons").show();
                    window.location = "main.html";
                } else {
//                   alert("No data found");
                    window.plugins.toast.showShortTop('No data found');
                }

            }, errorCB);
        }, successLogin);
    }


});


function errorCB(err) {
    alert("Error processing SQL: " + err.code);
}

function successCB() {
    alert("success!");
}

function successLogin() {
    window.location = "main.html";
}

//////////////////DEVICE READY FUNCTION START///////////////////////
function onDeviceReady() {


    /////////////// Hiding Sections//////////
    $("#bookAppointment").hide();
    $("#viewappointmentss").hide();
    $("#changeapp").hide();
    $("#man_viewappointmentss").hide();
    $("#man_viewPatients").hide();
    $("#man_changeapp").hide();
    $("#man_remove_pat").hide();
    $("#after_date").hide();
    $("#man_createapt").hide();
    $("#man_delete_apt").hide();

    
    
    //showing toast test
//    window.plugins.toast.showShortTop('Hello there!');
  
    //  Create Table
    // db.transaction(populateDB, errorCB, successCB);

    db.transaction(function (transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS patientsnew (id INTEGER PRIMARY KEY AUTOINCREMENT,firstname TEXT NOT NULL,lastname TEXT,email TEXT,password TEXT,sin INTEGER,age INTEGER,gender TEXT,diseases TEXT,address TEXT)', [],
            function (tx, result) {
                // alert("Table1 created successfully");
            },
            function (error) {
                alert("Error occurred while creating the table.");
            });
    });

    db.transaction(function (transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS doc_date (id INTEGER PRIMARY KEY AUTOINCREMENT,pat_id INTEGER,docname TEXT,docdate DATE,doctime TEXT)', [],
            function (tx, result) {
              //  alert("doc_date created successfully");
            },
            function (error) {
                alert("Error occurred while creating the table.");
            });
    });

    db.transaction(function (transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS doctors (docid INTEGER,name TEXT,available TEXT)', [],
            function (tx, result) {
                // alert("Table2 created successfully");
            },
            function (error) {
                alert("Error occurred while creating the table.");
            });
    });

    db.transaction(function (transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS appointments_date (aptid INTEGER PRIMARY KEY AUTOINCREMENT,patientid INTEGER,patientname TEXT,patientemail TEXT,docname TEXT,timeselected TEXT,dateselected DATE)', [],
            function (tx, result) {
               // alert("Appointment table created successfully");
            },
            function (error) {
                alert("Error occurred while creating the table.");
            });
    });

    //insertng into doc table
    db.transaction(function (transaction) {
        transaction.executeSql('SELECT * FROM doctors', [], function (tx, results) {
            var doclen = results.rows.length;
            // alert(doclen);
            if (doclen > 3) {
                //  alert("data found");
            } else {
                var docid = 1;
                var docname = "Dr John";
                var doctiming = "11pm,12pm,1pm,2pm";
                db.transaction(function (transaction) {
                    var executeQuery1 = "INSERT INTO doctors (docid,name,available) VALUES (?,?,?)";
                    transaction.executeSql(executeQuery1, [docid, docname, doctiming], function (tx, result) {
                            // alert('Inserted1');
                        },
                        function (error) {
                            alert('Error occurred');
                        });
                });

                var docid_2 = 2;
                var docname_2 = "Dr Lalita";
                var doctiming_2 = "10am,11am,4pm,5pm";
                db.transaction(function (transaction) {
                    var executeQuery2 = "INSERT INTO doctors (docid,name,available) VALUES (?,?,?)";
                    transaction.executeSql(executeQuery2, [docid_2, docname_2, doctiming_2], function (tx, result) {
                            // alert('Inserted2');
                        },
                        function (error) {
                            alert('Error occurred');
                        });
                });

                var docid_3 = 3;
                var docname_3 = "Dr MD";
                var doctiming_3 = "8am,9am,4pm,5pm,6pm";
                db.transaction(function (transaction) {
                    var executeQuery3 = "INSERT INTO doctors (docid,name,available) VALUES (?,?,?)";
                    transaction.executeSql(executeQuery3, [docid_3, docname_3, doctiming_3], function (tx, result) {
                            // alert('Inserted3');
                        },
                        function (error) {
                            alert('Error occurred');
                        });
                });
            }

        });
    });

    //Registring user
    $('#signupButton').click(function () {
        //alert("signup clicked");
        // Insert record
        db.transaction(insertNote, errorinsert, successinsert);

    });

    //Appointment Booking Process
    $("#btnapp").click(function () {
        $("#bookAppointment").toggle(200);
    });

    $("#doctiming").click(function () {
        var docname = document.getElementById('alldocs').value;
        var doc_date = document.getElementById('sel_date').value;
        //fetching already occupied timing from doc_date table
        db.transaction(function (transaction) {
            var executeQueryy = "SELECT * FROM doc_date WHERE docname = ? and docdate = ?";
            transaction.executeSql(executeQueryy, [docname, doc_date], function (tx, result) {
                    // alert('Doc date have timings');
                    var lengt = result.rows.length;
                    var j = 0;
                    // alert("hi" + lengt);
                    if (lengt > 0) {
                        // alert(lengt);
                        for (j = 0; j < (lengt); j++) {
                            //  alert("loop working");
                            occupied_timings[j] = result.rows.item(j).doctime;
                        }
                    }


                },
                function (error) {
//                    alert('this date/time is available');
                });
        });

        //fetching time from doctors table
        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM doctors where name=?', [docname], function (tx, results) {
                var len = results.rows.length;
                if (len > 0) {
                    $("#show_timings").html("");
                    var doc_time = results.rows.item(0).available,
                        k, y, z = 0;
                    var tt = false;
                    var time_array = doc_time.split(",");
                    var timings_left = [];
                    // alert("hello" + occupied_timings[0]);
                    // alert("hello" + occupied_timings[0]);
                    var ttt;
                    for (c = 0; c < (time_array.length); c++) {
                        ttt = time_array[c].toString();
                        if (occupied_timings.includes(ttt)) {
                            //alert("includes" + ttt);
                        } else {
                            //  alert("not includes" + ttt);
                            timings_left.push(ttt);
                        }
                    }
                    if (timings_left.length > 0) {
//                        alert("timings found");
                         window.plugins.toast.showShortBottom('Timings Found');
                    } else {
//                        alert("No timings left for selected date");
                         window.plugins.toast.showShortTop('No timings for selected date');
                    }
                    occupied_timings = [];
                    for (var i = 0; i < (timings_left.length); i++) {
                        $("#show_timings").append("<option value= " + timings_left[i] + ">" + timings_left[i] + "</option>");
                    }
                } else {
                    alert("noting found");
                }
            }, null);
        });
    });
    //Storing appointment to table
    $("#bookButton").click(function () {

        var doc_name = document.getElementById("alldocs").value;
        var doc_time = document.getElementById("show_timings").value;
        var doc_date = document.getElementById("sel_date").value;
        var patient_name = window.sessionStorage.getItem("currentuser");
        var patient_email = window.sessionStorage.getItem("currentemail");
        var patient_id = window.sessionStorage.getItem("currentid");
        var doc_date = document.getElementById("sel_date").value;
        patient_id = parseInt(patient_id);
        if (doc_time == "") {
            alert("Select timing");
        }
            else if(doc_date == "")
                {
                     alert("Select Date");
                } else {
            //inserting in doc_date to keep track which dates are already occupied
            db.transaction(function (transaction) {
                var executeQueryy = "INSERT INTO doc_date (pat_id,docname,docdate,doctime) VALUES (?,?,?,?)";
                transaction.executeSql(executeQueryy, [patient_id, doc_name, doc_date, doc_time], function (tx, result) {
                        // alert('Date occupied');
                    },
                    function (error) {
//                        alert('Error in doc_date');
                    });
            });

            //inserting in appointments
            db.transaction(function (transaction) {
                var executeQuery5 = "INSERT INTO appointments_date (patientid,patientname,patientemail,docname,timeselected,dateselected) VALUES (?,?,?,?,?,?)";
                transaction.executeSql(executeQuery5, [patient_id, patient_name, patient_email, doc_name, doc_time, doc_date], function (tx, result) {
//                        alert('Appointment Booked');
                     window.plugins.toast.showShortBottom('Appointment Booked');
                        var noti_doc_name = doc_name.toString();
                        var noti_date = doc_date.toString();
                        var noti_time = doc_time.toString();
                        add_notification(noti_date, noti_time,noti_doc_name); /*function to get notification 24 hours before*/
                    },
                    function (error) {
                        alert('Error occurred with appointment');
                    });
            });
        }
        //Removing Field Content
        
        ("#show_timings").html("");
        ("#sel_date").html("");
        
    });

    //Fetching appointmentss
    $("#btnview").click(function () {
        $("#viewappointmentss").toggle(200);
    });

    $("#btnview").click(function () {
        var pat_mail = window.sessionStorage.getItem("currentemail");
        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM appointments_date WHERE patientemail = ?', [pat_mail], function (tx, results) {
                $("#apptable").html("");
                var len = results.rows.length,
                    i;
                $("#apptable").html(' <tr> <th>Id</th> <th>Doctor</th> <th>Time</th><th>Date</th></tr>');
                for (i = 0; i < len; i++) {
                    $("#apptable").append("<tr><td>" + results.rows.item(i).aptid + "</td><td>" + results.rows.item(i).docname + "</td><td>" + results.rows.item(i).timeselected + "</td><td>" + results.rows.item(i).dateselected + "</td></tr>");
                }
            }, null);
        });

    });
    // selecting appointmentss timing from tables

    $("#btnappchange").click(function () {
        $("#changeapp").toggle(200);
    });
    $("#submit_apt").click(function () {
       
        var aptid = document.getElementById('appid').value;
        var new_date = document.getElementById('sel_date_again').value;
        aptid = parseInt(aptid);
        var pat_mail2 = window.sessionStorage.getItem("currentemail");
        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM appointments_date WHERE aptid=? AND patientemail = ? ', [aptid, pat_mail2], function (tx, results) {
                var len = results.rows.length;
                if (len > 0) {
                    current_doc_name = results.rows.item(0).docname;
                    current_doc_time = results.rows.item(0).timeselected;
                    current_doc_date = results.rows.item(0).dateselected;
//                    alert(current_doc_name);

                }
            }, null);
        });

        //fetching already occupied timing from doc_date table
        db.transaction(function (transaction) {

            var executeQueryyy = "SELECT * FROM doc_date WHERE docname = ? and docdate = ?";
            transaction.executeSql(executeQueryyy, [current_doc_name, new_date], function (tx, result) {
//                    alert('Doc date have timings');
                    var lengt = result.rows.length;
                    var j = 0;
//                    alert("hi" + lengt);
                    if (lengt > 0) {
//                        alert(lengt);
                        for (j = 0; j < (lengt); j++) {
//                            alert("loop working");
                            occupied_timings[j] = result.rows.item(j).doctime;
                        }
                    }
                },
                function (error) {
//                    alert('this date/time is available');
                });
        });
        /////////////////////////////////////////

        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM doctors where name=?', [current_doc_name], function (tx, results) {
                var len = results.rows.length;
                if (len > 0) {
                     $("#after_date").show();
//                    alert("timings found 1");
                    var doc_time = results.rows.item(0).available;
                    var time_arrayy = doc_time.split(",");
                    $("#show_timings_again").html("");

                    ///////////////////////////////////// code here ///////////////////////////////////////////////
                    var timings_leftt = [];
//                    alert("hello" + occupied_timings[0]);
                    var ttt2;
                    for (c = 0; c < (time_arrayy.length); c++) {
                        ttt2 = time_arrayy[c].toString();
                        if (occupied_timings.includes(ttt2)) {
//                            alert("includes" + ttt2);
                        } else {
//                            alert("not includes" + ttt2);
                            timings_leftt.push(ttt2);
                        }
                    }
                    if (timings_leftt.length > 0) {
//                        alert("timings found");
                         window.plugins.toast.showShortBottom('Timings Found');
                    } else {
//                        alert("No timings left for selected date");
                         window.plugins.toast.showShortTop('No timings for selected date');
                    }
                    occupied_timings = [];


                    ///////////////////////////////////////////////////////////
                    for (var i = 0; i < (timings_leftt.length); i++) {
                        $("#show_timings_again").append("<option value= " + timings_leftt[i] + ">" + timings_leftt[i] + "</option>");
                    }
                } else {
                    alert("noting found");
                }
            }, null);
        });
    });

    //changing apppointment time
    $("#changetime").click(function () {
        var new_dd = document.getElementById("sel_date_again").value;
        var aptid = document.getElementById("appid").value;
        aptid = parseInt(aptid);
        var patid = window.sessionStorage.getItem("currentid");
        var time_slct = document.getElementById("show_timings_again").value;
        ////////////////////////////////////////
        //inserting in doc_date to know which date are already occupied
        db.transaction(function (transaction) {
            var executeQueryy = "INSERT INTO doc_date (pat_id,docname,docdate,doctime) VALUES (?,?,?,?)";
            transaction.executeSql(executeQueryy, [patid, current_doc_name, new_dd, time_slct], function (tx, result) {
//                    alert('Date occupied');
                 window.plugins.toast.showShortTop('Date Selected');
                },
                function (error) {
//                    alert('Error in doc_date');
                });
        });
        /////////////////////////////// Removing previous selected date and time
        db.transaction(function (transaction) {
            var executeQueryyn = "DELETE FROM doc_date WHERE docname = ? AND docdate = ? AND doctime = ?";
            transaction.executeSql(executeQueryyn, [current_doc_name, current_doc_date, current_doc_time], function (tx, result) {
//                    alert('Previous date deleted');
//                    alert(current_doc_time);
//                    alert(current_doc_date);
                },
                function (error) {
//                    alert('Error in doc_date');
                });
        });



        //////////////////////////////////////////
        var new_ddd = document.getElementById("sel_date_again").value;
        var aptidd = document.getElementById("appid").value;
        var time_slctt = document.getElementById("show_timings_again").value;
        db.transaction(function (transaction) {
//            alert(aptidd);
//            alert(time_slctt);
//            alert(new_ddd);
            var executeQueryn = "UPDATE appointments_date SET timeselected=?,dateselected=? WHERE aptid=?";
            transaction.executeSql(executeQueryn, [time_slctt, new_ddd, aptidd],
                //On Success
                function (tx, result) {
//                    alert('Updated successfully');
                 window.plugins.toast.showShortCenter('Updated Successfully');
                },
                //On Error
                function (error) {
//                    alert('Something went Wrong');
                 window.plugins.toast.showShortCenter('Something went wrong');
                });
        });
        $("#after_date").hide();
    });

    //    var location = window.location.href;
    //    if ((sessionStorage.getItem("currentuser")) == null && (location.indexOf("main.html") !== -1)) {
    //        $("#buttons").hide();
    //        alert("You are not logged in");
    //        window.location = "index.html";
    //    }


    ///////////// MANAGER PAGE CODE //////////////

    // View appointmentss
    $("#view_apt").click(function () {
        $("#man_viewappointmentss").toggle(200);
    });

    $("#view_apt").click(function () {
        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM appointments_date', [], function (tx, results) {
                var l = results.rows.length,
                    i;
                $("#man_apptable").html('<h5>Appointments</h5> <tr> <th>Id</th> <th>Patients Id</th> <th>Doctor</th> <th>Time</th> <th>Date</th></tr>');
                for (i = 0; i < l; i++) {
                    $("#man_apptable").append("<tr><td>" + results.rows.item(i).aptid + "</td><td>" + results.rows.item(i).patientid + "</td><td>" + results.rows.item(i).docname + "</td><td>" + results.rows.item(i).timeselected + "</td><td>" + results.rows.item(i).dateselected + "</td></tr>");
                }
            }, null);
        });
    });

    //View Patients

    $("#view_pat").click(function () {
        $("#man_viewPatients").toggle(200);
    });
    //    id,firstname,lastname,email,password,sin,age,gender,diseases,address)
    $("#view_pat").click(function () {
        db.transaction(function (transaction) {
            var fullname = "";
            transaction.executeSql('SELECT * FROM patientsnew', [], function (tx, results) {
                var l = results.rows.length,
                    i;
                $("#man_pattable").html('<h5 text-align:left;">Patients</h5> <tr> <th>Id</th> <th>Patient</th> <th>Email</th></tr>');
                for (i = 0; i < l; i++) {
                    fullname = results.rows.item(i).firstname + " " + results.rows.item(i).lastname;
                    $("#man_pattable").append("<tr><td>" + results.rows.item(i).id + "</td><td>" + fullname + "</td><td>" + results.rows.item(i).email + "</td></tr>");
                }
            }, null);
        });
    });
    
    // CREATING APPOINTMENT BY MANAGER
    
    //Appointment Booking Process
    $("#create_apt").click(function () {
        $("#man_createapt").toggle(200);
    });

    $("#man_doctiming").click(function () {
        var docname = document.getElementById('man_alldocs').value;
        var doc_date = document.getElementById('man_select_date').value;
        //fetching already occupied timing from doc_date table
        db.transaction(function (transaction) {
            var executeQueryy = "SELECT * FROM doc_date WHERE docname = ? and docdate = ?";
            transaction.executeSql(executeQueryy, [docname, doc_date], function (tx, result) {
                    // alert('Doc date have timings');
                    var lengt = result.rows.length;
                    var j = 0;
                    // alert("hi" + lengt);
                    if (lengt > 0) {
                        // alert(lengt);
                        for (j = 0; j < (lengt); j++) {
                            //  alert("loop working");
                            occupied_timings[j] = result.rows.item(j).doctime;
                        }
                    }


                },
                function (error) {
                    alert('Error in query');
                });
        });

        //fetching time from doctors table
        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM doctors where name=?', [docname], function (tx, results) {
                var len = results.rows.length;
                if (len > 0) {
                    $("#man_show_timings").html("");
                    var doc_time = results.rows.item(0).available,
                        k, y, z = 0;
                    var tt = false;
                    var time_array = doc_time.split(",");
                    var timings_left = [];
                    // alert("hello" + occupied_timings[0]);
                    // alert("hello" + occupied_timings[0]);
                    var ttt;
                    for (c = 0; c < (time_array.length); c++) {
                        ttt = time_array[c].toString();
                        if (occupied_timings.includes(ttt)) {
                            //alert("includes" + ttt);
                        } else {
                            //  alert("not includes" + ttt);
                            timings_left.push(ttt);
                        }
                    }
                    if (timings_left.length > 0) {
//                        alert("timings found");
                         window.plugins.toast.showShortBottom('Timings found');
                    } else {
//                        alert("No timings left for selected date");
                         window.plugins.toast.showShortTop('No timings for selected date');
                    }
                    occupied_timings = [];
                    for (var i = 0; i < (timings_left.length); i++) {
                        $("#man_show_timings").append("<option value= " + timings_left[i] + ">" + timings_left[i] + "</option>");
                    }
                } else {
                    alert("noting found");
                }
            }, null);
        });
    });
    //Storing appointment to table
    $("#createButton").click(function () {

        var doc_name = document.getElementById("man_alldocs").value;
        var doc_time = document.getElementById("man_show_timings").value;
        var doc_date = document.getElementById("man_select_date").value;
        var patient_id = document.getElementById("man_patient_id").value;
        var patient_name = "";
        var patient_email = ""; 
        // fetching patients data
        db.transaction(function (tx) {

            tx.executeSql("select * from patientsnew WHERE id = ?", [patient_id], function (tx1, result) {
                var len = result.rows.length;
                if(len > 0)
                    {
//                        alert("patient data found");
                        patient_name = (result.rows.item(0).firstname + " " + result.rows.item(0).lastname)
//                        alert(patient_name);
                        patient_email = result.rows.item(0).email;
//                        alert(patient_email);
                    }
            }, errorCB);
        }, successCB);
        
        
        
        patient_id = parseInt(patient_id);
        if (doc_time == "") {
            alert("Select timing");
        } else {
            //inserting in doc_date to keep track which dates are already occupied
            db.transaction(function (transaction) {
                var executeQueryy = "INSERT INTO doc_date (pat_id,docname,docdate,doctime) VALUES (?,?,?,?)";
                transaction.executeSql(executeQueryy, [patient_id, doc_name, doc_date, doc_time], function (tx, result) {
//                         alert('Date occupied');
                     window.plugins.toast.showShortTop('Date Selected');
                    },
                    function (error) {
//                        alert('Error in doc_date');
                    });
            });

            //inserting in appointments
            db.transaction(function (transaction) {
                var executeQuery5 = "INSERT INTO appointments_date (patientid,patientname,patientemail,docname,timeselected,dateselected) VALUES (?,?,?,?,?,?)";
                transaction.executeSql(executeQuery5, [patient_id, patient_name, patient_email, doc_name, doc_time, doc_date], function (tx, result) {
//                        alert('Appointment Booked');
                     window.plugins.toast.showShortTop('Appointment Booked');
                        var noti_date = doc_date.toString();
                        var noti_time = doc_time.toString();
                        add_notification(noti_date, noti_time);
                    },
                    function (error) {
                        alert('Error occurred with appointment');
                    });
            });
        }
    });
    //END CODE CREATING APPOINTMENT BY MANAGER
    
    
    
    
    

    // CHANGING APPOINTMENT TIME by MANAGER

    // selecting appointmentss timing from tables

    $("#change_apt").click(function () {
        $("#man_changeapp").toggle(200);
    });
    $("#man_submit_apt").click(function () {
        $("#man_after_date").show();
        var aptid = document.getElementById('man_appid').value;
        var new_date = document.getElementById('man_sel_date_again').value;
        aptid = parseInt(aptid);
        var pat_mail2 = window.sessionStorage.getItem("currentemail");
        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM appointments_date WHERE aptid=? AND patientemail = ? ', [aptid, pat_mail2], function (tx, results) {
                var len = results.rows.length;
                if (len > 0) {
                    current_doc_name = results.rows.item(0).docname;
                    current_doc_time = results.rows.item(0).timeselected;
                    current_doc_date = results.rows.item(0).dateselected;
//                    alert(current_doc_name);

                }
            }, null);
        });

        //fetching already occupied timing from doc_date table
        db.transaction(function (transaction) {

            var executeQueryyy = "SELECT * FROM doc_date WHERE docname = ? and docdate = ?";
            transaction.executeSql(executeQueryyy, [current_doc_name, new_date], function (tx, result) {
//                    alert('Doc date have timings');
                    var lengt = result.rows.length;
                    var j = 0;
//                    alert("hi" + lengt);
                    if (lengt > 0) {
//                        alert(lengt);
                        for (j = 0; j < (lengt); j++) {
//                            alert("loop working");
                            occupied_timings[j] = result.rows.item(j).doctime;
                        }
                    }
                },
                function (error) {
//                    alert('this date/time is available');
                });
        });
        /////////////////////////////////////////

        db.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM doctors where name=?', [current_doc_name], function (tx, results) {
                var len = results.rows.length;
                if (len > 0) {
//                    alert("timings found 1");
                    var doc_time = results.rows.item(0).available;
                    var time_arrayy = doc_time.split(",");
                    $("#man_show_timings_again").html("");

                    ///////////////////////////////////// code here ///////////////////////////////////////////////
                    var timings_leftt = [];
//                    alert("hello" + occupied_timings[0]);
                    var ttt2;
                    for (c = 0; c < (time_arrayy.length); c++) {
                        ttt2 = time_arrayy[c].toString();
                        if (occupied_timings.includes(ttt2)) {
//                            alert("includes" + ttt2);
                        } else {
//                            alert("not includes" + ttt2);
                            timings_leftt.push(ttt2);
                        }
                    }
                    if (timings_leftt.length > 0) {
//                        alert("timings found");
                         window.plugins.toast.showShortBottom('Timings found');
                    } else {
//                        alert("No timings left for selected date");
                         window.plugins.toast.showShortTop('No timings for selected date');
                    }
                    occupied_timings = [];


                    ///////////////////////////////////////////////////////////
                    for (var i = 0; i < (timings_leftt.length); i++) {
                        $("#man_show_timings_again").append("<option value= " + timings_leftt[i] + ">" + timings_leftt[i] + "</option>");
                    }
                } else {
                    alert("noting found");
                }
            }, null);
        });
    });

    //changing apppointment time
    $("#man_changetime").click(function () {
        var new_dd = document.getElementById("man_sel_date_again").value;
        var aptid = document.getElementById("man_appid").value;
        aptid = parseInt(aptid);
        var patid = window.sessionStorage.getItem("currentid");
        var time_slct = document.getElementById("man_show_timings_again").value;
        ////////////////////////////////////////
        //inserting in doc_date to know which date are already occupied
        db.transaction(function (transaction) {
            var executeQueryy = "INSERT INTO doc_date (pat_id,docname,docdate,doctime) VALUES (?,?,?,?)";
            transaction.executeSql(executeQueryy, [patid, current_doc_name, new_dd, time_slct], function (tx, result) {
//                    alert('Date occupied');
                },
                function (error) {
//                    alert('Error in doc_date');
                });
        });
        /////////////////////////////// Removing previous selected date and time
        db.transaction(function (transaction) {
            var executeQueryyn = "DELETE FROM doc_date WHERE docname = ? AND docdate = ? AND doctime = ?";
            transaction.executeSql(executeQueryyn, [current_doc_name, current_doc_date, current_doc_time], function (tx, result) {
//                    alert('Previous date deleted');
//                    alert(current_doc_time);
//                    alert(current_doc_date);
                },
                function (error) {
//                    alert('Error in doc_date');
                });
        });



        //////////////////////////////////////////
        var new_ddd = document.getElementById("man_sel_date_again").value;
        var aptidd = document.getElementById("man_appid").value;
        var time_slctt = document.getElementById("man_show_timings_again").value;
        db.transaction(function (transaction) {
//            alert(aptidd);
//            alert(time_slctt);
//            alert(new_ddd);
            var executeQueryn = "UPDATE appointments_date SET timeselected=?,dateselected=? WHERE aptid=?";
            transaction.executeSql(executeQueryn, [time_slctt, new_ddd, aptidd],
                //On Success
                function (tx, result) {
                    alert('Updated successfully');
                 window.plugins.toast.showShortCenter("Updated Successfully");
                },
                //On Error
                function (error) {
                    alert('Something went Wrong');
                });
        });
    });

    //DELETE APPOINTMENT BY MANAGER

    $("#delete_apt").click(function () {
        $("#man_delete_apt").toggle(200);
    });

    $("#del_apt_sub").click(function () {
        //get appointment id from user

        var del_apt_id = document.getElementById("del_apt_id").value;
//        alert("delete apt id is " + del_apt_id);
        if ((del_apt_id == null) || (del_apt_id == "")) {
            alert("Please enter Appointment id");
        } else {
            //select time date and doc name from appointments table
            db.transaction(function (transaction) {
                transaction.executeSql('SELECT * FROM appointments_date WHERE aptid=?', [del_apt_id], function (tx, results) {
                    var len = results.rows.length;
                    if (len > 0) {
                        doc_name_del = results.rows.item(0).docname;
                        doc_time_del = results.rows.item(0).timeselected;
                        doc_date_del = results.rows.item(0).dateselected;
//                        alert("doc name time nad date gathered before deleting")
                    }
                }, null);
            });
            //delete the appointment from table
            db.transaction(function (transaction) {
                var executeQuery = "DELETE FROM appointments_date WHERE aptid=?";
                transaction.executeSql(executeQuery, [del_apt_id],
                    //On Success
                    function (tx, results) {
                        alert('Appoitnemt Removed');
                    },
                    //On Error
                    function (error) {
//                        alert('apt not removed');
                    });
            });

            //DELETING time date from doc_date
            db.transaction(function (transaction) {
                var executeQueryyn = "DELETE FROM doc_date WHERE docname = ? AND docdate = ? AND doctime = ?";
                transaction.executeSql(executeQueryyn, [doc_name_del, doc_date_del, doc_time_del], function (tx, result) {
//                        alert('Previous date deleted');
//                        alert(doc_name_del + " " + doc_date_del + " " + doc_time_del);
                    },
                    function (error) {
//                        alert('Error in doc_date');
                    });
            });

        }
    });

    //DELETE APPOINTMENT BY MANAGER CODE END////////////////////

    // REMOVING PATIENT BY MANAGER

    $("#remove_pat").click(function () {
        $("#man_remove_pat").toggle(200);
    });

    $("#man_remove").click(function () {
        var patid = document.getElementById("man_patid").value;
        patid = parseInt(patid);
        db.transaction(function (transaction) {
            var executeQuery = "DELETE FROM patientsnew WHERE id=?";
            transaction.executeSql(executeQuery, [patid],
                //On Success
                function (tx, result) {
                    alert('Success');
                },
                //On Error
                function (error) {
                    alert('Something went Wrong');
                });
        });
    });

    $("#man_remove").click(function () {
        var patid = document.getElementById("man_patid").value;
        patid = parseInt(patid);
        db.transaction(function (transaction) {
            var executeQuery = "DELETE FROM appointments_date WHERE patientid = ?";
            transaction.executeSql(executeQuery, [patid],
                //On Success
                function (tx, results) {
//                    alert('Appoitnemts Removed');
                },
                //On Error
                function (error) {
//                    alert('apt not removed');
                });
        });
        db.transaction(function (transaction) {
            var executeQueryt = "DELETE FROM doc_date WHERE pat_id = ?";
            transaction.executeSql(executeQueryt, [patid],
                //On Success
                function (tx, results) {
//                    alert('Dates Removed');
                },
                //On Error
                function (error) {
//                    alert('apt not removed');
                });
        });


    });



    document.getElementById('main_welcome').innerHTML = "Welcome " + sessionStorage.getItem("currentuser");


    // Select records
    //fetchData();

    // Fetch all records
    function fetchData() {
        db.transaction(function (tx) {

            tx.executeSql("select * from patientsnew", [], function (tx1, result) {
                var len = result.rows.length;

                for (var i = 0; i < len; i++) {
                    var note = result.rows.item(i).email;

                    // Add list item
                    var ul = document.getElementById("list");
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(note));
                    ul.appendChild(li);
                }

            }, errorCB);
        }, successCB);
    }



    function insertNote(tx) {
        var first = document.getElementById('upfirst').value;
        var last = document.getElementById('uplast').value
        var email = document.getElementById('upEmail').value
        var pass = document.getElementById('upPassword').value
        var sin = document.getElementById('upsin').value
        var age = document.getElementById('upage').value
        var gender = document.getElementById('upgender').value
        var disease = document.getElementById('updisease').value
        var address = document.getElementById('upaddress').value

        //searching for existing patients
        db.transaction(function (transaction) {
            var executeQuery = "SELECT * FROM patientsnew WHERE email=?";
            transaction.executeSql(executeQuery, [email],
                //On Success
                function (tx, result) {
                    var len = result.rows.length;

                    if (len > 0) {
                        alert("User already exists");
                    } else {
                        // Insert query
                        tx.executeSql("INSERT INTO patientsnew(firstname,lastname,email,password,sin,age,gender,diseases,address) VALUES (?,?,?,?,?,?,?,?,?)", [first, last, email, pass, sin, age, gender, disease, address]);
                    }
                },
                //On Error
                function (error) {
                    alert('Something went Wrong');
                });
        });


    }

    //////////////////////////// Function to get notification//////////////////////////////
    function add_notification(n_date, n_time,n_docname) {
        //var d = "2018-11-19";
        //        "yyyy-mm-dd"
        
        var d = n_date; //date from user
        var docn = "Appointment with " + n_docname; // name of doctor from user
        //    var time = "10pm";
        var time = n_time; //time from user
       
        var _24_hour_format = 0;
        var d_month = new Date(d).getMonth(); //fetching month
        var d_year = new Date(d).getFullYear(); //fetching year
        var d_date = new Date(d).getDate() + 1; //fetching date but adding one as date in js starts from zero

        var current_hh = new Date().getHours(); //the current hour going on
        var current_dd = new Date().getDate();

        //converting AM/PM format to 24 hour
        if (time.includes("pm")) {
            _24_hour_format = parseInt(time.replace('pm', ''));
            _24_hour_format = _24_hour_format + 12;
        } else if (time.includes("am")) {
            _24_hour_format = parseInt(time.replace('am', ''));
        }


        //checking if the gap is equal or greater than 24 hours for the notification

        if (((parseInt(d_date) - parseInt(current_dd)) >= 1) && ((parseInt(_24_hour_format) - parseInt(current_hh)) >= 0)) {
            var alarm_date = (parseInt(d_date) - 1);
            var rrr = new Date(d_year, d_month, alarm_date, _24_hour_format, 0);
//              var rrr = new Date(d_year, d_month, alarm_date, 15, 50);
            
            cordova.plugins.notification.local.schedule({
                title: docn,
                text: 'Tomorrow at '+ n_time,
                trigger: {
                    at: new Date(rrr)
                }
            });
        }
       // alert("Alarm at " + rrr);
        return;
    }




    function errorCB(err) {
        alert("Error processing SQL: " + err.code);
    }

    function errorinsert(err) {
        alert("Error processing SQL: " + err.code);
    }

    function successCB() {
        alert("success!");
    }

    function successinsert() {
        alert("Registration Done");
    }
}
