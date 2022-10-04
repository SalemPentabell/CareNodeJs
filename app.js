var request = require('request');
const express = require("express");
var fs = require('fs');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

var multer = require('multer');
const path = require('path');


var cookies = "";
var _csrf_token = "";
var Url = 'https://care.pentabell.com';
/** upload file **/
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        console.log("file");
        console.log(file);
        console.log("file");
        cb(null, file.originalname)
    }
});
const fileFilterImage = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
var upload = multer({
    storage: storage,
    fileFilter: fileFilterImage
});


/** AUTHENTIFICATION **/
app.get('/logout', function (req, res) {
    var UrlCare = Url + '/logout';

    request(UrlCare, function (error, response, body) {
        cookies = response.rawHeaders[15].split(";")[0];
        _csrf_token = response.body.toString().split('<input type="hidden" name="_csrf_token" value="')[1].split('">')[0];
        if (error) {
            res.send(response.statusCode);
        } else {
            res.send(body);
        }
    });
});

app.post('/login', function (req, res) {
    var options = {
        'method': 'POST',
        'url': Url + '/moblog',
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': cookies
        },
        body: JSON.stringify({
            "_username": req.body.username,
            "_password": req.body.password,
            "_csrf_token": _csrf_token
        })

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        result = response.body
        res.send(result);
    });

});

app.post('/resetPwd', function (req, res) {
    var options = {
        'method': 'POST',
        'url': Url + '/MobileForgot',
        'headers': {
            'Cookie': cookies
        },
        formData: {
            'email': req.body.resetEmail
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.statusCode);
        res.send(response.statusCode);
    });
});

/** Consultant **/
// 1 : Dashboard consultant
app.get('/Consultant/dashboardConsultant/:id', function (req, res) {
    var idCons = req.params.id;
    var options = {
        'method': 'GET',
        'url': Url + '/dashboard/mobile/' + idCons,
        'headers': {
            Cookie: cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });

})
// 1 : family
// GETALL
app.get('/Consultant/GetFamily/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/family/mobile/famMobileById/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });

});
// ADD
app.post("/Consultant/AddFamily/:id", upload.single('uploadedFile'), async (req, res, next) => {
    var idCons = req.params.id
    var addFamObj = {
        'firstName': req.body.firstName,
        'lastName': req.body.lastName,
        'birthDate': req.body.birthDate,
        'nationality': req.body.nationality,
        'passportNumber': req.body.passportNumber,
        'issuedIn': req.body.issuedIn,
        'issueDate': req.body.issueDate,
        'expireDate': req.body.expireDate,
        'gender': req.body.gender,
        'type': req.body.type,
    }
    /**Saving file to node js server**/
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var name = req.body.fileName;
    var img = req.body.uploadedFile;
    var realFile = Buffer.from(img, "base64");
    fs.writeFileSync(dir + name, realFile, function (err) {
        if (err)
            console.log(err);
    });
    Filepath = dir + name
    Filename = name;
    FileObj = {
        "value": fs.createReadStream(Filepath),
        'options': {
            'filename': Filename,
            'contentType': null
        }
    }
    Object.assign(addFamObj, { "uploadedFile": FileObj })
    var options = {
        'method': 'POST',
        'url': Url + '/family/mobile/addfamMobile/' + idCons,
        formData: {
            'firstName': addFamObj["firstName"],
            'lastName': addFamObj["lastName"],
            'birthDate': addFamObj["birthDate"],
            'nationality': addFamObj["nationality"],
            'passportNumber': addFamObj["passportNumber"],
            'issuedIn': addFamObj["issuedIn"],
            'issueDate': addFamObj["issueDate"],
            'expireDate': addFamObj["expireDate"],
            'gender': addFamObj["gender"],
            'type': addFamObj["type"],
            'uploadedFile': {
                'value': addFamObj["uploadedFile"]["value"],
                'options': {
                    'filename': addFamObj["uploadedFile"]["options"]["filename"],
                    'contentType': null
                }
            }
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(res);
        res.send("201");
    });
});
// Edit
app.post("/Consultant/EditFamily/:id/:idFam", upload.single('uploadedFile'), async (req, res, next) => {
    var idCons = req.params.id
    var idFam = req.params.idFam
    var editFamObj = {
        'firstName': req.body.firstName,
        'lastName': req.body.lastName,
        'birthDate': req.body.birthDate,
        'nationality': req.body.nationality,
        'passportNumber': req.body.passportNumber,
        'issuedIn': req.body.issuedIn,
        'issueDate': req.body.issueDate,
        'expireDate': req.body.expireDate,
        'gender': req.body.gender,
        'type': req.body.type,
    }
    /**Saving file to node js server**/
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var formDataEdit;
    if (req.body.uploadedFile != null) {
        var name = req.body.fileName;
        var img = req.body.uploadedFile;
        var realFile = Buffer.from(img, "base64");
        fs.writeFileSync(dir + name, realFile, function (err) {
            if (err)
                console.log(err);
        });
        Filepath = dir + name
        Filename = name;
        FileObj = {
            "value": fs.createReadStream(Filepath),
            'options': {
                'filename': Filename,
                'contentType': null
            }
        }
        Object.assign(editFamObj, { "uploadedFile": FileObj })
        formDataEdit = {
            'firstName': editFamObj["firstName"],
            'lastName': editFamObj["lastName"],
            'birthDate': editFamObj["birthDate"],
            'nationality': editFamObj["nationality"],
            'passportNumber': editFamObj["passportNumber"],
            'issuedIn': editFamObj["issuedIn"],
            'issueDate': editFamObj["issueDate"],
            'expireDate': editFamObj["expireDate"],
            'gender': editFamObj["gender"],
            'type': editFamObj["type"],
            'uploadedFile': {
                'value': editFamObj["uploadedFile"]["value"],
                'options': {
                    'filename': editFamObj["uploadedFile"]["options"]["filename"],
                    'contentType': null
                }
            }
        }
    } else {
        formDataEdit = {
            'firstName': editFamObj["firstName"],
            'lastName': editFamObj["lastName"],
            'birthDate': editFamObj["birthDate"],
            'nationality': editFamObj["nationality"],
            'passportNumber': editFamObj["passportNumber"],
            'issuedIn': editFamObj["issuedIn"],
            'issueDate': editFamObj["issueDate"],
            'expireDate': editFamObj["expireDate"],
            'gender': editFamObj["gender"],
            'type': editFamObj["type"],
        }
    }
    console.log("formDataEdit");
    console.log(formDataEdit);
    console.log("req.body");
    console.log(req.body);
    var options = {
        'method': 'POST',
        'url': Url + '/family/mobile/editFamMobile/' + idCons + '/' + idFam,
        formData: formDataEdit
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        console.log(response.statusCode);
        res.send(response.statusCode);
    });
});
// DEL
app.delete('/Consultant/deleteFam/:idFam', function (req, res) {
    var idFamily = req.params.idFam;
    var options = {
        'method': 'DELETE',
        'url': Url + '/family/mobile/delete/' + idFamily,
        'headers': {
            'Cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("response.statusCode delete");
        console.log(response.statusCode);
        res.sendStatus(response.statusCode);
    });

});

// 2 : Timesheets
//Get All TS
app.get('/Consultant/GetTs/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/timesheet/mobile/showTimesheetMobile/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        res.send(response.body);
    });

});
//Get user contracts
app.get('/Consultant/GetUserContracts/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/timesheet/mobile/getUserContracts/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        // console.log(response.body);
        res.send(response.body);
    });

});
// ADD
app.post("/Consultant/AddTs/:id/:idCont", upload.single('uploadedFile'), async (req, res, next) => {
    var idCons = req.params.id
    var idContract = req.params.idCont
    console.log(idCons);
    console.log(idContract);
    var addTsObj = {
        'month': req.body.month,
        'type': req.body.type,
        'comment': req.body.comment
    }
    /**Saving file to node js server**/
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var name = req.body.fileName;
    var img = req.body.uploadedFile;
    var realFile = Buffer.from(img, "base64");
    fs.writeFileSync(dir + name, realFile, function (err) {
        if (err)
            console.log(err);
    });
    Filepath = dir + name
    Filename = name;
    FileObj = {
        "value": fs.createReadStream(Filepath),
        'options': {
            'filename': Filename,
            'contentType': null
        }
    }
    Object.assign(addTsObj, { "uploadedFile": FileObj })
    var options = {
        'method': 'POST',
        'url': Url + '/timesheet/mobile/addTimesheetMobile/' + idCons + '/' + idContract,
        formData: {
            'month': addTsObj["month"],
            'type': addTsObj["type"],
            'comment': addTsObj["comment"],
            'uploadedFile': {
                'value': addTsObj["uploadedFile"]["value"],
                'options': {
                    'filename': addTsObj["uploadedFile"]["options"]["filename"],
                    'contentType': null
                }
            }
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        res.send(response.statusCode);
    });
});
// Edit feha mochkol 
app.post("/Consultant/EditTs/:id", upload.single('uploadedFile'), async (req, res, next) => {
    var idTs = req.params.id
    var editTsObj = {
        'month': req.body.month,
        'type': req.body.type,
        'contract': req.body.contract,
        'comment': req.body.comment
    }

    /**Saving file to node js server**/
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var formDataEdit;
    if (req.body.uploadedFile != null) {
        var name = req.body.name;
        var img = req.body.uploadedFile;
        var realFile = Buffer.from(img, "base64");
        fs.writeFileSync(dir + name, realFile, function (err) {
            if (err)
                console.log(err);
        });
        Filepath = dir + name
        Filename = name;
        FileObj = {
            "value": fs.createReadStream(Filepath),
            'options': {
                'filename': Filename,
                'contentType': null
            }
        }
        Object.assign(editTsObj, { "uploadedFile": FileObj })
        formDataEdit = {
            'month': editTsObj["month"],
            'type': editTsObj["type"],
            'contract': editTsObj["contract"],
            'comment': editTsObj["comment"],
            'uploadedFile': {
                'value': editTsObj["uploadedFile"]["value"],
                'options': {
                    'filename': editTsObj["uploadedFile"]["options"]["filename"],
                    'contentType': null
                }
            }
        }
    } else {
        formDataEdit = {
            'month': editTsObj["month"],
            'type': editTsObj["type"],
            'contract': editTsObj["contract"],
            'comment': editTsObj["comment"]
        }
    }
    var options = {
        'method': 'POST',
        'url': Url + '/timesheet/mobile/edit/' + idTs,
        formData: formDataEdit
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});

// 3 : Payment history
app.get('/Consultant/PaymentsHistory/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/mobile/history/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.statusCode);
    });

});


// 4 : notifs
//Get All
app.get('/Consultant/Notifications/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/notification/mobile/showNotifsMobile/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });

});
// Count
app.get('/Consultant/countUnreadNotifs/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/notification/mobile/unreadMobileCount/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });

});
// mark read

app.get('/Consultant/acknowledgeAllNotifs/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/notification/mobile/MobileAcknowledgeAll/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });

});

/********* 5 : shared documents *********/
// upload
app.post("/Consultant/uploadDocs/:id", upload.single('uploadedFile'), async (req, res, next) => {
    var idCons = req.params.id
    console.log(idCons);
    var uploadDocObj = {
        'title': req.body.title
    }
    /**Saving file to node js server**/
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var name = req.body.fileName;
    var img = req.body.uploadedFile;
    console.log(name);
    console.log(img);
    var realFile = Buffer.from(img, "base64");
    fs.writeFileSync(dir + name, realFile, function (err) {
        if (err)
            console.log(err);
    });
    Filepath = dir + name
    Filename = name;
    FileObj = {
        "value": fs.createReadStream(Filepath),
        'options': {
            'filename': Filename,
            'contentType': null
        }
    }
    Object.assign(uploadDocObj, { "uploadedFile": FileObj })
    var options = {
        'method': 'POST',
        'url': Url + '/sharedDocs/mobile/upload/' + idCons,
        formData: {
            'title': uploadDocObj["title"],
            'urlLocalFile': {
                'value': uploadDocObj["uploadedFile"]["value"],
                'options': {
                    'filename': uploadDocObj["uploadedFile"]["options"]["filename"],
                    'contentType': null
                }
            }
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});

// Request
app.post("/Consultant/requestDoc/:id", function (req, res) {
    var idCons = req.params.id
    var bodyReq = JSON.stringify(req.body);
    var options = {
        'method': 'POST',
        'url': Url + '/sharedDocs/mobile/request/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': cookies
        },
        body: bodyReq

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("res");
        // console.log(response.body);
        console.log(response.statusCode);
        console.log("res");
        res.send(response.statusCode);
    });
});

/********* 6 : Profile *********/

// Edit
app.post("/Consultant/UpdateProfile/:id", upload.array('uploadedFiles'), async (req, res, next) => {
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var idCons = req.params.id
    var updateProfileObj = {
        'title': req.body.title,
        'firstName': req.body.firstName,
        'lastName': req.body.lastName,
        'birthDate': req.body.birthDate,
        'maritalStatus': req.body.maritalStatus,
        'nationality': req.body.nationality,
        'passportNumber': req.body.passportNumber,
        'issuedIn': req.body.issuedIn,
        'issuedDate': req.body.issuedDate,
        'expireDate': req.body.expireDate,
        'address': req.body.address,
        'country': req.body.country,
        'secondEmail': req.body.secondEmail,
        'mobilePhone': req.body.mobilePhone,
        'secondMobilePhone': req.body.secondMobilePhone,
        'urgentTitle': req.body.urgentTitle,
        'urgentFirstName': req.body.urgentFirstName,
        'urgentLastName': req.body.urgentLastName,
        'urgentMobilePhone': req.body.urgentMobilePhone,
        'city': req.body.city,
        'skype': req.body.skype,
        'whatsapp': req.body.whatsapp,
        'cin': req.body.cin,
        'issuedCin': req.body.issuedCin
    }
    uploadedfilesArray = JSON.parse(req.body.uploadedFiles)
    for (let index = 0; index < uploadedfilesArray.length; index++) {

        if (uploadedfilesArray[index]["profilePhoto"] != null) {
            var profilePhotoName = uploadedfilesArray[index]["profilePhoto"]["name"];
            var profilePhotoImg = uploadedfilesArray[index]["profilePhoto"]["base"];
            var realFile = Buffer.from(profilePhotoImg, "base64");
            fs.writeFileSync(dir + profilePhotoName, realFile, function (err) {
                if (err)
                    console.log(err);
            });
            Filepath = dir + profilePhotoName
            Filename = profilePhotoName;
            profilePhotoObj = {
                "value": fs.createReadStream(Filepath),
                'options': {
                    'filename': Filename,
                    'contentType': null
                }
            }
            Object.assign(updateProfileObj, { "ProfilePhoto": profilePhotoObj })

        }
        if (uploadedfilesArray[index]["Cv"] != null) {
            var CvName = uploadedfilesArray[index]["Cv"]["name"];
            var CvImg = uploadedfilesArray[index]["Cv"]["base"];
            var realFile = Buffer.from(CvImg, "base64");
            fs.writeFileSync(dir + CvName, realFile, function (err) {
                if (err)
                    console.log(err);
            });
            Filepath = dir + CvName
            Filename = CvName;
            CvObj = {
                "value": fs.createReadStream(Filepath),
                'options': {
                    'filename': Filename,
                    'contentType': null
                }
            }
            Object.assign(updateProfileObj, { "Cv": CvObj })
        }
        if (uploadedfilesArray[index]["Passport"] != null) {
            var passportName = uploadedfilesArray[index]["Passport"]["name"];
            var passportImg = uploadedfilesArray[index]["Passport"]["base"];
            var realFile = Buffer.from(passportImg, "base64");
            fs.writeFileSync(dir + passportName, realFile, function (err) {
                if (err)
                    console.log(err);
            });
            Filepath = dir + passportName
            Filename = passportName;
            passportObj = {
                "value": fs.createReadStream(Filepath),
                'options': {
                    'filename': Filename,
                    'contentType': null
                }
            }
            updateProfileObj = { ...updateProfileObj, "Passport": passportObj }
        }
        if (uploadedfilesArray[index]["CinFront"] != null) {
            var CinFrontName = uploadedfilesArray[index]["CinFront"]["name"];
            var CinFrontImg = uploadedfilesArray[index]["CinFront"]["base"];
            var realFile = Buffer.from(CinFrontImg, "base64");
            fs.writeFileSync(dir + CinFrontName, realFile, function (err) {
                if (err)
                    console.log(err);
            });
            Filepath = dir + CinFrontName
            Filename = CinFrontName;
            CinFrontObj = {
                "value": fs.createReadStream(Filepath),
                'options': {
                    'filename': Filename,
                    'contentType': null
                }
            }
            Object.assign(updateProfileObj, { "CinFront": CinFrontObj })
        }
        if (uploadedfilesArray[index]["CinBack"] != null) {
            var CinBackName = uploadedfilesArray[index]["CinBack"]["name"];
            var CinBackImg = uploadedfilesArray[index]["CinBack"]["base"];
            var realFile = Buffer.from(CinBackImg, "base64");
            fs.writeFileSync(dir + CinBackName, realFile, function (err) {
                if (err)
                    console.log(err);
            });
            Filepath = dir + CinBackName
            Filename = CinBackName;
            CinBackObj = {
                "value": fs.createReadStream(Filepath),
                'options': {
                    'filename': Filename,
                    'contentType': null
                }
            }
            Object.assign(updateProfileObj, { "CinBack": CinBackObj })
        }

    }
    console.log("updateProfileObj")
    console.log(updateProfileObj)
    var options = {
        'method': 'POST',
        'url': Url + '/profile/mobile/update/' + idCons,
        formData: updateProfileObj
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        console.log(response.statusCode);
        res.send(response.statusCode);
    });
});

/********* 7 : Bankings *********/
app.get('/Consultant/banking/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/banking/mobile/' + idCons,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("response.body");
        console.log(response.body);
        res.send(response.body);
    });

});
/********* 8 : settings *********/
//change password
app.post("/Consultant/changePwd/:id", function (req, res) {
    var idCons = req.params.id
    var bodyResetPwd = JSON.stringify(req.body);
    var options = {
        'method': 'POST',
        'url': Url + '/consultant/controller/mobile/changePass/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': cookies
        },
        body: bodyResetPwd

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("res");
        // console.log(response.body);
        console.log(response.statusCode);
        console.log("res");
        res.send(response.statusCode);
    });
});
// change profile photo
app.post("/Consultant/changePic/:id", upload.single('ProfilePhoto'), async (req, res, next) => {
    var idCons = req.params.id
    /**Saving file to node js server**/
    var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
    var name = req.body.fileName;
    var img = req.body.ProfilePhoto;

    var realFile = Buffer.from(img, "base64");
    fs.writeFileSync(dir + name, realFile, function (err) {
        if (err)
            console.log(err);
    });
    Filepath = dir + name
    Filename = name;
    FileObj = {
        "value": fs.createReadStream(Filepath),
        'options': {
            'filename': Filename,
            'contentType': null
        }
    }
    var options = {
        'method': 'POST',
        'url': Url + '/sharedDocs/mobile/upload/' + idCons,
        formData: {
            'ProfilePhoto': {
                'value': FileObj["value"],
                'options': {
                    'filename': FileObj["options"]["filename"],
                    'contentType': null
                }
            }
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        console.log(response.statusCode);
        res.send(response.body);
    });
});


/** Manager **/
app.get('/Manager/userList/:id', function (req, res) {
    var idMan = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/mangement/mobile/users/' + idMan,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });


});
app.get('/Manager/dashboard', function (req, res) {
    var options = {
        'method': 'GET',
        'url': Url + '/mangement/mobile/dashboard',
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/Manager/payReports', function (req, res) {
    var options = {
        'method': 'GET',
        'url': Url + '/mangement/mobile/payReports',
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/Manager/totalReports', function (req, res) {
    var options = {
        'method': 'GET',
        'url': Url + '/mangement/mobile/totalReports',
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
/** Branch Manager **/
app.get('/BranchManager/conslist', function (req, res) {
    var options = {
        'method': 'GET',
        'url': Url + '/branchManager/mobile/consultants',
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/BranchManager/meetingconsultant/:id', function (req, res) {
    var idCons = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/branchManager/mobile/consultant/meeting/' + idCons,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.post("/BranchManager/meeting/:id", function (req, res) {
    var idCons = req.params.id
    var bodyReq = JSON.stringify(req.body);
    var options = {
        'method': 'POST',
        'url': Url + '/branchManager/mobile/consultantqualificationw/' + idCons,
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': cookies
        },
        body: bodyReq

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.statusCode);
    });
});

/** Operation Manager **/
app.get('/OperationManager/status/:id', function (req, res) {
    var idUser = req.params.id
    console.log("disable or enable");
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/status/' + idUser,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/OperationManager/consultantsbyaccountmanager/:id', function (req, res) {
    var idUser = req.params.id
    console.log("disable or enable");
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/consultantsbyaccountmanager/' + idUser,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.post("/OperationManager/addAccountManager/:id", function (req, res) {
    var idOpm = req.params.id
    console.log("body");
    console.log(req.body);
    console.log("body");
    var bodyReq = JSON.stringify({
        "email": req.body.email,
        "firstName": req.body.firstName,
        "lastName": req.body.lastName
    })
    var options = {
        'method': 'POST',
        'url': Url + '/bossAccountManagerMobile/account-managers/' + idOpm,
        'headers': {
            'Content-Type': 'application/json',
            'Cookie': cookies
        },
        body: bodyReq

    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.statusCode);
    });
});
app.get('/OperationManager/AmList/:id', function (req, res) {
    var idUser = req.params.id
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/AmList/' + idUser,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/OperationManager/getAllAmList', function (req, res) {
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/getAllAmList',
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/OperationManager/getAllConList', function (req, res) {
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/getAllConList',
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/OperationManager/MoveAmConstoAm/:idO/:idN', function (req, res) {
    var idOld = req.params.idO
    var idNew = req.params.idN
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/MoveAmConstoAm/' + idOld + '/' + idNew,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});
app.get('/OperationManager/ChangeAmForCons/:id/:idN', function (req, res) {
    var idUser = req.params.id
    var idNew = req.params.idN
    var options = {
        'method': 'GET',
        'url': Url + '/bossAccountManagerMobile/ChangeAmForCons/' + idUser + '/' + idNew,
        'headers': {
            'cookie': cookies
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
});

//             /*** OTHER ***/
// app.post('/uploads', async (req, res, next) => {
//     var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
//     console.log('Limit file size: ' + limit);
//     console.log(req.body.name);
//     console.log("okkk");
//     console.log(req.body.uploadedFile);
//     var realfile = Buffer.from(req.body.uploadedFile, "base64")
//     fs.writeFileSync(dir, realfile, 'utf8')
//     // fs.rename('/', './public/uploads')
//     await res.send({ message: "upload image in flutter" })
// });

// app.post("/image", function (req, res) {
//     var dir = "C:/Users/salem/Desktop/inter/public/uploads/"
//     var name = req.body.name;
//     var img = req.body.uploadedFile;
//     var realFile = Buffer.from(img, "base64");
//     fs.writeFile(dir + name, realFile, function (err) {
//         if (err)
//             console.log(err);
//     });
//     ss = dir + name
//     console.log("name");
//     console.log(name);
//     console.log("dir");
//     console.log(ss.split("/").slice(-1)[0]);
//     res.send("OK");
// });
// app.get('/', function (req, res) {

//     res.send('fffffff')

// });
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
