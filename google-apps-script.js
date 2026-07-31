function doPost(e) {
    var data = JSON.parse(e.postData.contents);
    var email = data.email;
    var date = data.date;
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if email already exists
    var emails = sheet.getRange("A:A").getValues();
    for (var i = 0; i < emails.length; i++) {
        if (emails[i][0].toLowerCase() === email.toLowerCase()) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: "Email already exists"
            })).setMimeType(ContentService.MimeType.JSON);
        }
    }
    
    // Add new row
    sheet.appendRow([email, date]);
    
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Email added successfully"
    })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var signups = [];
    
    for (var i = 1; i < data.length; i++) {
        signups.push({ email: data[i][0], date: data[i][1] });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
        count: signups.length,
        signups: signups
    })).setMimeType(ContentService.MimeType.JSON);
}