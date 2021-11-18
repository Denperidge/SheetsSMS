/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
Changes: everything but the addEventListener/deviceready
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    var previousUrl = localStorage.getItem("url");
    if (previousUrl != null) {
        document.getElementById("url").value = previousUrl;
        DownloadFromURL(previousUrl);
    }
}

var contacts;
// \s matches all spaces
var numberRegex = /^[+0-9\s.-]{7,}$/;  // Thanks to https://stackoverflow.com/a/19715367/5522348

var debug = document.getElementById("debug");

var xlsx;
function DownloadFromURL(url) {
    contacts = [];
    debug.innerHTML = "";
    console.log(url)
    
    if (url.indexOf("google.com") > -1) {
        var googleDownloadUrlAddition = "/export?format=xlsx";

        if (url.indexOf("/edit") > -1) {
            url = url.substring(0, url.lastIndexOf("/")) + googleDownloadUrlAddition;
        } else {
            url += googleDownloadUrlAddition;
        }
    }
    console.log(url);
    


    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //console.log(this.responseText)
            //console.log(XLSX.utils.sheet_to_json(new Uint8Array(this.response)));
            var workbook = XLSX.read(req.response);
            console.log(workbook);
            var sheets = workbook.Sheets;
            for (var sheetName in sheets) {
                var sheet = sheets[sheetName];
                var rows = XLSX.utils.sheet_to_json(sheet);
                rows.forEach((row) => {
                    var contact = {
                        phonenumber: "",
                        otherInfo: ""
                    };

                    for (var cellName in row) {
                        var cellValue = row[cellName];
                        console.log(cellValue);
                        
                        if (cellName == "__rowNum__") {
                            console.log("Skip rownum!");
                        }
                        else if (numberRegex.test(cellValue)) {
                            console.log("Regex match!");
                            contact.phonenumber = cellValue;
                        }
                        else {
                            console.log("No regex match, other info!")
                            contact.otherInfo += cellValue + " ";
                        }
                    }

                    if (contact.phonenumber == "") {
                        return;
                    }
     
                    debug.innerHTML += "Added: " + contact.phonenumber + " " + contact.otherInfo + "<br>"
          
                    contacts.push(contact);
                    console.log(contact)
                });
            }
        }
    };
    req.open("GET", url, true);
    req.responseType = "arraybuffer";
    req.send();
}

var doneTyping;
// Store URL and 
document.getElementById("url").addEventListener("input", (e) => {
    clearTimeout(doneTyping);
    doneTyping = setTimeout(() => {
        var url = e.target.value;
        localStorage.setItem("url", url);
        DownloadFromURL(url);
    }, 1250);
}, false);


var sendingSms = null;
(() => {
    
}, 1000);
document.getElementById("send").addEventListener("click", () => {
    if (sms == undefined) {
        console.log("SMS not defined, cancelling send!");
        return;
    } 

    debug.innerHTML = "";

    if (sendingSms == null) {
        HandleSMSPermissions(() => {

            var options = {
                android: {
                    intent: ''
                }
            }
            var index = 0;
            var text = document.getElementById("text").value;

            sendingSms = setInterval(() => {
                var phonenumber = contacts[index].phonenumber;
                sms.send(phonenumber, text, options, 
                    (success) => {
                        debug.innerHTML += "SMS succesfuly sent to " + phonenumber;
                    },(error)=> {
                        console.log("SMS failed: " + error);
                        alert("SMS failed: " + error);
                    })
                index++;
                if (index >= contacts.length) {
                    clearInterval(sendingSms);
                    alert("Done")
                    sendingSms = null;
                }
            }, 1000);
            
        }); 
    } else {
        // Cancel if its pressed again
        clearInterval(sendingSms);
        sendingSms = null;
    }

    
});

function HandleSMSPermissions(cb) {
    // Adapted from https://www.npmjs.com/package/cordova-sms-plugin
    sms.hasPermission((hasPermission) => {
        if (!hasPermission) {
            sms.requestPermission(() => {
                // SMS permission has been granted
                cb();
            }, (err) => {
                alert("SMS permission not granted");
            })
        } else {
            cb();
        }
        // From here, assume 
    }, (err) => {
        alert("SMS permission is needed!");
    });
}