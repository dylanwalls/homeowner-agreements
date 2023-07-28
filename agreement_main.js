const express = require('express');
const fs = require('fs');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the landing page
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Brittany's Document Generator</h1>
    <ul>
      <li><a href="/form">Partnership Agreement Form</a></li>
      <li><a href="/cession">Cession Agreement Form</a></li>
      <li><a href="/poa">Power of Attorney Form</a></li>
      <li><a href="/loan_agreement">Loan Agreement Form</a></li>
    </ul>
  `);
});

// Route for Partnership Agreement Form
app.get('/form', (req, res) => {
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
app.get('/cession', (req, res) => {
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

  print(jsonData)
  generatePDF('cession_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
});

// Route for Power of Attorney Form
app.get('/poa', (req, res) => {
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
app.get('/loan_agreement', (req, res) => {
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

  generatePDF('loan_mpdf_bitprop_template.docx', jsonData)
    .then((fileName) => {
      res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
    })
    .catch((err) => {
      console.error('Error generating PDF:', err);
      return res.status(500).send('Error generating PDF');
    });
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});














// // Serve the form page
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/templates/form.html');
// });

// // Handle form submission
// app.post('/submit', (req, res) => {
//   const formData = req.body;

//   // Create an array to store the full names
//   const fullNames = [];

//   // Iterate over the submitted names and surnames
//   for (let i = 0; i < formData.numNames; i++) {
//       const name = formData[`name_${i}`];
//       const surname = formData[`surname_${i}`];
//       const fullName = `${name} ${surname}`;
//       fullNames.push(fullName);
//   }
//   // Capitalize each full name element in the array
//   const capitalizedFullNames = fullNames.map((name) => name.toUpperCase());

//   // Print out fullNames for testing
//   console.log("Full Names:", fullNames);

//   // Create an array to store the ID numbers
//   const idNumbers = [];

//   // Iterate over the submitted ID numbers
//   for (let i = 0; i < formData.numNames; i++) {
//       const idNumber = formData[`idNumber_${i}`];
//       idNumbers.push(idNumber);
//   }

//   // Print out idNumbers for testing
//   console.log("ID Numbers:", idNumbers);

//   // Create an array to store the contact numbers
//   const contactNumbers = [];

//   // Iterate over the submitted contact numbers
//   for (let i = 0; i < formData.numNames; i++) {
//       const contactNumber = formData[`contactNumber_${i}`];
//       contactNumbers.push(contactNumber);
//   }

//   // Print out contactNumbers for testing
//   console.log("Contact Numbers:", contactNumbers);

//   // Create an array to store the emails
//   const emails = [];

//   // Iterate over the submitted emails
//   for (let i = 0; i < formData.numNames; i++) {
//       const email = formData[`email_${i}`];
//       emails.push(email);
//   }

//   // Print out emails for testing
//   console.log("Emails:", emails);

//   const primaryContactNumber = formData['contactNumber_0'];

//   // Now, let's create the jsonData object with the form data
//   const jsonData = {
//       fullNames: capitalizedFullNames.join(' and '), // Join the array into a single string
//       idNumber: idNumbers.join(' and '),
//       contactNumbers: contactNumbers.join(' and '), // Use the new key for the array
//       emails: emails.join(' and '), // Add the email to the new array
//       address: formData.address,
//       noUnits: formData.noUnits,
//       propertyDescription: `Erf ${formData.erf}, ${formData.address}, Title deed number ${formData.titleNumber}`,
//       noYears: formData.noYears,
//       noMonths: formData.noMonths,
//       bank: formData.bank,
//       accountHolder: formData.accountHolder,
//       accountNumber: formData.accountNumber,
//       accountType: formData.accountType,
//       primaryContactNumber: primaryContactNumber, // Use a new key for the single value
//       erf: formData.erf,
//   };

//   // Print out the complete jsonData for testing
//   console.log("JSON Data:", jsonData);
  
//     // Adobe Document Merge
//   try {
//     const credentials = PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
//       .withClientId("c8e4cd5828dd4a73bad876a83e3714a4")
//       .withClientSecret("p8e-4FwcEry59N3aTEvx52Io2z6C4krJCKEK")
//       .build();

//     const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
//     const documentMerge = PDFServicesSdk.DocumentMerge;
//     const documentMergeOptions = documentMerge.options;
//     const options = new documentMergeOptions.DocumentMergeOptions(jsonData, documentMergeOptions.OutputFormat.PDF);

//     const documentMergeOperation = documentMerge.Operation.createNew(options);
//     const input = PDFServicesSdk.FileRef.createFromLocalFile(__dirname + '/templates/notarial_lease_template.docx');
//     documentMergeOperation.setInput(input);

//     const fileName = fullNames.join(' and ') + ' Partnership Agreement with Bitprop.pdf';
//     const outputPath = __dirname + '/' + fileName;

//     if (fs.existsSync(outputPath)) {
//       console.log('Duplicate file - removing original version');
//       fs.unlinkSync(outputPath); // Remove the existing file before saving the new one
//     }

//     documentMergeOperation.execute(executionContext)
//       .then(result => result.saveAsFile(outputPath))
//       .then(() => {
//         res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
//       })
//       .catch(err => {
//         console.error('Error generating PDF:', err);
//         return res.status(500).send('Error generating PDF');
//       });
//   } catch (err) {
//     console.log('Exception encountered while executing operation', err);
//     return res.status(500).send('Error executing document merge operation');
//   }
// });

// // Success page
// app.get('/success', (req, res) => {
//   const { file } = req.query;
//   const filePath = __dirname + '/' + file;

//   fs.access(filePath, fs.constants.F_OK, (err) => {
//     if (err) {
//       console.error('File not found:', err);
//       return res.status(404).send('File not found');
//     }

//     res.send(`
//       <h1>PDF generated successfully!</h1>
//       <p><a href="/download?file=${encodeURIComponent(file)}">Download the PDF</a></p>
//       <p><a href="/">Generate another partnership agreement</a></p>
//     `);
//   });
// });

// // File download
// app.get('/download', (req, res) => {
//   const { file } = req.query;
//   const filePath = __dirname + '/' + file;

//   fs.access(filePath, fs.constants.F_OK, (err) => {
//     if (err) {
//       console.error('File not found:', err);
//       return res.status(404).send('File not found');
//     }

//     res.download(filePath, file, (err) => {
//       if (err) {
//         console.error('Error sending file:', err);
//         return res.status(500).send('Error sending file');
//       }
//     });
//   });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
