const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const multer = require('multer'); // Require the multer package
const basicAuth = require('express-basic-auth');
const { sendInspectionForm } = require('./whatsapp_integration.js');
const { send } = require('process');

const app = express();
const port = 8080;

// Define a username and password for basic authentication
const users = { 
  'dylan.walls@bitprop.com': 'bitprop2023',
  'brittany.newton@bitprop.com': 'bitprop2023',
  'buhle.gqola@bitprop.com': 'bitprop2023',
  'vunene.somo@bitprop.com': 'bitprop2023',
};

// Middleware for basic authentication
const basicAuthMiddleware = basicAuth({
  users,
  challenge: true, // Show the authentication dialog when unauthorized
  unauthorizedResponse: 'Authentication required.', // Custom message for unauthorized access
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static('uploads')); // Serve uploaded files statically

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Upload files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension); // Generate a unique filename
  }
});

const upload = multer({ storage: storage });

// Route for handling file uploads
app.post('/upload/:section', upload.single('images'), (req, res) => {
  const section = req.params.section; // Get the section from the URL parameter
  const uploadedImage = req.file.filename; // Get the uploaded filename
  // Store the filename in your database or wherever you want
  res.send('File uploaded successfully');
});


// Serve the landing page
app.get('/', basicAuthMiddleware, (req, res) => {
  res.send(`
    <h1>Welcome to Brittany's Document Generator</h1>
    <ul>
      <li><a href="/form">Partnership Agreement Form</a></li>
      <li><a href="/cession">Cession Agreement Form</a></li>
      <li><a href="/poa">Power of Attorney Form</a></li>
      <li><a href="/loan_agreement">Loan Agreement Form</a></li>
      <li><a href="/notice">Notice Form</a></li>
      <li><a href="/inspection">Inspection Form</a></li>
      <li><a href="/cession_mpdf_bitprop">Cession Agreement MPDF and Bitprop</a></li>
      <li><a href="/loan_mpdf_bitprop">Loan Agreement MPDF and Bitprop</a></li>
      <li><a href="/tenant_information">Tenant Information Form</a></li>
    </ul>
  `);
});

// Route for Partnership Agreement Form
app.get('/form', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/form.html');
});

app.post('/submit', (req, res) => {
  const formData = req.body;

  // Create an array to store the full names
  const fullNames = [];

  // Iterate over the submitted names and surnames
  for (let i = 0; i < formData.numNames; i++) {
      const name = formData[`name_${i}`];
      const surname = formData[`surname_${i}`];
      const fullName = `${name} ${surname}`;
      fullNames.push(fullName);
  }
  // Capitalize each full name element in the array
  const capitalizedFullNames = fullNames.map((name) => name.toUpperCase());

  // Print out fullNames for testing
  console.log("Full Names:", fullNames);

  // Create an array to store the ID numbers
  const idNumbers = [];

  // Iterate over the submitted ID numbers
  for (let i = 0; i < formData.numNames; i++) {
      const idNumber = formData[`idNumber_${i}`];
      idNumbers.push(idNumber);
  }

  // Print out idNumbers for testing
  console.log("ID Numbers:", idNumbers);

  // Create an array to store the contact numbers
  const contactNumbers = [];

  // Iterate over the submitted contact numbers
  for (let i = 0; i < formData.numNames; i++) {
      const contactNumber = formData[`contactNumber_${i}`];
      contactNumbers.push(contactNumber);
  }

  // Print out contactNumbers for testing
  console.log("Contact Numbers:", contactNumbers);

  // Create an array to store the emails
  const emails = [];

  // Iterate over the submitted emails
  for (let i = 0; i < formData.numNames; i++) {
      const email = formData[`email_${i}`];
      emails.push(email);
  }

  // Print out emails for testing
  console.log("Emails:", emails);

  const primaryContactNumber = formData['contactNumber_0'];

  const jsonData = {
    fullNames: capitalizedFullNames.join(' and '), // Join the array into a single string
    idNumber: idNumbers.join(' and '),
    contactNumbers: contactNumbers.join(' and '), // Use the new key for the array
    emails: emails.join(' and '), // Add the email to the new array
    address: formData.address,
    noUnits: formData.noUnits,
    propertyDescription: `Erf ${formData.erf}, ${formData.address}, Title deed number ${formData.titleNumber}`,
    noYears: formData.noYears,
    noMonths: formData.noMonths,
    bank: formData.bank,
    accountHolder: formData.accountHolder,
    accountNumber: formData.accountNumber,
    accountType: formData.accountType,
    primaryContactNumber: primaryContactNumber, // Use a new key for the single value
    erf: formData.erf,
};

  generatePDF('notarial_lease_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});

// Route for Cession Agreement Form
app.get('/cession', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/cession.html');
});

app.post('/submit_cession', (req, res) => {
  const formData = req.body;

  const jsonData = {
    dateSigned: formData.dateSigned,
    agreementDate: formData.agreementDate,
    dayAgreement: formData.dayAgreement,
    agreementMonthYear: formData.agreementMonthYear,
  };

  generatePDF('cession_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});

// Route for Cession Agreement Form MPDF and Bitprop
app.get('/cession_mpdf_bitprop', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/cession_MPDF_Bitprop.html');
});

app.post('/submit_cession_mpdf_bitprop', (req, res) => {
  const formData = req.body;

  const jsonData = {
    dateAgreementSigned: formData.dateAgreementSigned,
    dateOfAgreement: formData.dateOfAgreement,
    propertyAddress: formData.propertyAddress,
    agreementDate: formData.agreementDate,
    dayOfAgreementDate: formData.dayOfAgreementDate,
    agreementMonthAndYear: formData.agreementMonthAndYear,
  };

  generatePDF('cession_agreement_Bitprop_MPDF_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});



// Route for Loan Agreement
app.get('/loan_agreement', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/loan_agreement.html');
});

app.post('/submit_loan_agreement', (req, res) => {
  const formData = req.body;

  const jsonData = {
    totalInvestment: formData.totalInvestment,
    totalInvestmentWords: formData.totalInvestmentWords,
    dayAgreement: formData.dayAgreement,
    monthAgreement: formData.monthAgreement,
    yearAgreement: formData.yearAgreement,
  };

  generatePDF('loan_mpdf_bitprop_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});


// Route for Loan Agreement Form MPDF and Bitprop
app.get('/loan_mpdf_bitprop', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/loan_agreement_mpdf_bitprop.html');
});

app.post('/submit_loan_mpdf_bitprop', (req, res) => {
  const formData = req.body;

  const jsonData = {
    propertyAddress: formData.propertyAddress,
    erfNr: formData.erfNr,
    titleDeedNr: formData.titleDeedNr,
    totalInvestment: formData.totalInvestment,
    totalInWords: formData.totalInWords,
    dayOfAgreement: formData.dayOfAgreement,
    monthOfAgreement: formData.monthOfAgreement,
    yearOfAgreement: formData.yearOfAgreement,
  };

  generatePDF('loan_agreement_MPDF_Bitprop_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});


// Route for Power of Attorney Form
app.get('/poa', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/poa.html');
});

app.post('/submit_poa', (req, res) => {
  const formData = req.body;

  const jsonData = {
    fullNames: formData.fullNames,
    idNo: formData.idNo,
    date: formData.date,
    address: formData.address,
  };

  generatePDF('poa_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});

// Route for Loan Agreement Form
app.get('/loan_agreement', basicAuthMiddleware, (req, res) => {
  res.sendFile(__dirname + '/templates/loan_agreement.html');
});

app.post('/submit_loan_agreement', (req, res) => {
  const formData = req.body;

  console.log('FORM DATA:', formData);

  const jsonData = {
    totalInvestment: formData.totalInvestment,
    totalInvestmentWords: formData.totalInvestmentWords,
    dayAgreement: formData.dayAgreement,
    monthAgreement: formData.monthAgreement,
    yearAgreement: formData.yearAgreement,
  };

  generatePDF('loan_mpdf_bitprop_template.docx', basicAuthMiddleware, jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});

// Route for Notice Period
app.get('/notice', (req, res) => {
  res.sendFile(__dirname + '/templates/notice.html');
});

app.post('/submit_notice', (req, res) => {
  const formData = req.body;

  // Server-side validation for phone number
  const phoneNumber = formData.phone;
  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(400).send('Invalid phone number');
  }

  console.log('FORM DATA:', formData);
  // Get the current date and time as a string
  const currentDateTime = new Date().toLocaleString();

  const noticeData = {
    name: formData.name,
    surname: formData.surname,
    phone: formData.phone,
    address: formData.address,
    flatLetter: formData.flatLetter,
    bank: formData.bank,
    account_no: formData.account_no,
    account_type: formData.account_type,
    notice_date: formData.notice_date,
    current_date: currentDateTime,
  };  

  const noticeDate = new Date(noticeData.notice_date);
  const currentDate = new Date(noticeData.current_date);
  const differenceInMilliseconds = noticeDate - currentDate;
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

  if (differenceInDays < 30) {
    const notice_period_warning = 'Please note that you have provided fewer than 30 days notice. Your deposit refund may be affected by this.';
    noticeData.append(notice_period_warning);
  }
  else {
    const notice_period_warning = '';
    noticeData.append(notice_period_warning);
  }

  sendWhatsAppMessage(noticeData)
    .then(() => {
      res.redirect(`/success_notice`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});

async function sendWhatsAppMessage(data) {
  console.log('Calling sendWhatsAppMessage');

  try {
    const sendMessageOptions = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        params: [
          { key: '{{1}}', value: data.name } ,
          { key: '{{2}}', value: data.current_date },
          { key: '{{3}}', value: data.notice_period_warning }
       ],
        recipient_phone_number: '+27' + data.phone.slice(1),
        hsm_id: '141430' // Replace with your WhatsApp template HSM ID
      })
    };
    const sendResponse = await fetch('https://app.trengo.com/api/v2/wa_sessions', sendMessageOptions);
    const sendData = await sendResponse.json();
    console.log('API Response:', sendData);


    const fullAddress = data.flatLetter + ', ' + data.address;
    const recipients = ['+27785411797', '+27721703241']; // Zandi, Nolitha
    for (const recipient of recipients) {
      const sendRentalTeamMessage = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          params: [
            { key: '{{1}}', value: data.name } ,
            { key: '{{2}}', value: fullAddress } ,
            { key: '{{3}}', value: data.current_date },
            { key: '{{4}}', value: data.notice_date }
        ],
          recipient_phone_number: recipient,
          hsm_id: '143434' // Replace with your WhatsApp template HSM ID
        })
      };
      const sendRentalTeamResponse = await fetch('https://app.trengo.com/api/v2/wa_sessions', sendRentalTeamMessage);
      const sendRentalTeamData = await sendRentalTeamResponse.json();
      console.log('API Response:', sendRentalTeamData);
    }

  } catch (error) {
    console.error(error);
    throw error;
  }


  const now = new Date();
  const incidentDate = now.toISOString();
  const { DateTime } = require('luxon');
  const now3 = DateTime.local().setZone('Africa/Johannesburg');
  const formattedIncidentDate2 = now3.toFormat('dd/MM/yyyy HH:mm');

  const timeOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }; 
  
  tenant_name = data.name + ' ' + data.surname;
  const url = 'https://za-living-api-pub-01.indlu.co/public/api/external/workspace/endpoint/Submit';
  const postMessageOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'workspaceCode': 'DEP',
      'recaptchaSiteKey': 'f9fd2260-1c0b-4ab1-9679-266e31234e5b',
      'payload': JSON.stringify({
        // 'building': {
        //   'id': 'ac9dd556-8a83-49e3-2393-08da6b352223',
        //   'buildingNo': 'IB-0000000144',
        // },
        // 'rentalUnit': {
        //   'id': '10b645ee-940d-45e3-f851-08da6b35226b',
        //   'refNo': 'ZAWC4935031311',
        // },
        'tenant': tenant_name,
        'address': data.address,
        'phone': data.phone,
        'bankName': data.bank,
        'accountNumber': data.account_no,
        'accountType': data.account_type,
        'noticeDate': data.notice_date,
        'currentDate': data.current_date,
      }),
    }),
  };

  const postResponse = await fetch(url, postMessageOptions);
  // const postData = await postResponse.json();
  // console.log('API Response:', postData);
}










// Route for Inpsection Form
app.get('/inspection', (req, res) => {
  res.sendFile(__dirname + '/templates/inspection.html');
});

app.post('/submit_inspection', (req, res) => {
  const formData = req.body;

  // Server-side validation for phone number
  const phoneNumber = formData.phone;
  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(400).send('Invalid phone number');
  }

  console.log('FORM DATA:', formData);
  // Get the current date and time as a string
const currentDateTime = new Date().toLocaleString();

  const jsonData = {
    name: formData.name,
    surname: formData.surname,
    phone: formData.phone,
    address: formData.address,
    flatLetter: formData.flatLetter,
    flat_status: formData.flat_status,
    flat_notes: formData.flat_notes,
    bathroom_status: formData.bathroom_status,
    bathroom_notes: formData.bathroom_notes,
    kitchen_status: formData.kitchen_status,
    kitchen_notes: formData.kitchen_notes,
    lounge_status: formData.lounge_status,
    lounge_notes: formData.lounge_notes,
    floor_status: formData.floor_status,
    floor_notes: formData.floor_notes,
    door_status: formData.door_status,
    door_notes: formData.door_notes,
    lights_status: formData.lights_status,
    lights_notes: formData.lights_notes,
    windows_status: formData.windows_status,
    windows_notes: formData.windows_notes,
    ceiling_status: formData.ceiling_status,
    ceiling_notes: formData.ceiling_notes,
    walls_status: formData.walls_status,
    walls_notes: formData.walls_notes,
    cupboards_status: formData.cupboards_status,
    cupboards_notes: formData.cupboards_notes,
    electricity_status: formData.electricity_status,
    electricity_notes: formData.electricity_notes,
    keys_status: formData.keys_status,
    keys_notes: formData.keys_notes,
    countertop_status: formData.countertop_status,
    countertop_notes: formData.countertop_notes,
    basin_taps_status: formData.basin_taps_status,
    basin_taps_notes: formData.basin_taps_notes,
    toilet_status: formData.toilet_status,
    toilet_notes: formData.toilet_notes,
    shower_status: formData.shower_status,
    shower_notes: formData.shower_notes,
    sink_taps_status: formData.sink_taps_status,
    sink_taps_notes: formData.sink_taps_notes,
    date: currentDateTime,
  };  

  generatePDF('inspection_form_template.docx', jsonData)
    .then((fileName) => {
      const name = formData.name;
      const phone = '+27' + formData.phone.slice(1);
      const file_url = 'https://documents.bitprop.com/download?file=' + fileName;

      // Call the sendInspectionForm function
      sendInspectionForm(name, phone, file_url)
        .then((name, phone) => {
          // Message sent successfully
          console.log('Message sent successfully to:', name, phone);
          // Here you can return a success message to the client or perform other actions.
      })
      .catch((error) => {
        // Error occurred while sending the message
        console.error('Error sending WhatsApp message:', error);
        // Here you can return an error message to the client or handle the error as needed.
      });
    res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
  })
  .catch((err) => {
    console.error('Error generating PDF:', err);
    return res.status(500).send('Error generating PDF');
  });
});


// Route for Tenant Information Form
app.get('/tenant_information', (req, res) => {
  res.sendFile(__dirname + '/templates/tenant_information.html');
});

// Success page
app.get('/success', (req, res) => {
  const { file } = req.query;
  const filePath = __dirname + '/' + file;

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return res.status(404).send('File not found');
    }

    res.send(`
      <h1>PDF generated successfully!</h1>
      <p><a href="/download?file=${encodeURIComponent(file)}">Download the PDF</a></p>
      <p><a href="/">Return to the landing page</a></p>
    `);
  });
});

// Route for displaying success message for the notice form
app.get('/success_notice', (req, res) => {
  res.send('Notice submitted successfully.');
});



// File download
app.get('/download', (req, res) => {
  const { file } = req.query;
  const filePath = __dirname + '/' + file;

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return res.status(404).send('File not found');
    }

    res.download(filePath, file, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).send('Error sending file');
      }
    });
  });
});

// Function to generate PDF using Adobe API
function generatePDF(templateFileName, jsonData) {
  return new Promise((resolve, reject) => {
    try {
      const credentials = PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
        .withClientId("c8e4cd5828dd4a73bad876a83e3714a4")
        .withClientSecret("p8e-4FwcEry59N3aTEvx52Io2z6C4krJCKEK")
        .build();

      const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
      const documentMerge = PDFServicesSdk.DocumentMerge;
      const documentMergeOptions = documentMerge.options;
      const options = new documentMergeOptions.DocumentMergeOptions(jsonData, documentMergeOptions.OutputFormat.PDF);

      const documentMergeOperation = documentMerge.Operation.createNew(options);
      const input = PDFServicesSdk.FileRef.createFromLocalFile(__dirname + `/templates/${templateFileName}`);
      documentMergeOperation.setInput(input);

      const fileName = `${templateFileName.split('.')[0]}_${Date.now()}.pdf`;
      const outputPath = __dirname + '/' + fileName;

      if (fs.existsSync(outputPath)) {
        console.log('Duplicate file - removing original version');
        fs.unlinkSync(outputPath); // Remove the existing file before saving the new one
      }

      documentMergeOperation.execute(executionContext)
        .then(result => result.saveAsFile(outputPath))
        .then(() => {
          const pdfURL = `http://localhost:${port}/${encodeURIComponent(fileName)}`;
          resolve(fileName);
        })
        .catch(err => {
          console.error('Error generating PDF:', err);
          reject(err);
        });
    } catch (err) {
      console.log('Exception encountered while executing operation', err);
      reject(err);
    }
  });
}

// Route to submit tenant-information form

app.post('/submit_tenant_information', (req, res) => {
  // Process form data here
  // For example, insert the data into a database

  // Sending a response back to the client
  res.json({ status: 'success', message: 'Data received!' });
});

app.get('/success_tenant_information', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'tenant_confirmation.html'));
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

function isValidPhoneNumber(phoneNumber) {
  // Check if the phone number starts with "0" and has 10 digits
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

