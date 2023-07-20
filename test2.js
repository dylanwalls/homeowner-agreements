const express = require('express');
const fs = require('fs');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the form page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/form.html');
});

// Handle form submission
app.post('/submit', (req, res) => {
    const formData = req.body;
  
    // Create a JSON object with the form data
    const jsonData = {
      fullNames: [],
      idNumber: [],
      contactNumbers: [], // Change the key to plural
      emails: [], // Add a new key for emails
      address: formData.address,
      noUnits: formData.noUnits,
      propertyDescription: `${formData.erf}, ${formData.address}, Title deed number ${formData.titleNumber}`,
      noYears: formData.noYears,
      noMonths: formData.noMonths,
      bank: formData.bank,
      accountHolder: formData.accountHolder,
      accountNumber: formData.accountNumber,
      accountType: formData.accountType,
      primaryContactNumber: formData.contactNumber, // Use a new key for the single value
      erf: formData.erf,
    };
  
    // Iterate over the submitted form data and extract values into the JSON object
    for (let i = 0; i < formData.numNames; i++) {
      jsonData.fullNames.push(`${formData[`name_${i}`]} ${formData[`surname_${i}`]}`);
      jsonData.idNumber.push(formData[`idNumber_${i}`]);
      jsonData.contactNumbers.push(formData[`contactNumber_${i}`]); // Use the new key for the array
      jsonData.emails.push(formData[`email_${i}`]); // Add the email to the new array
    }

  // Adobe Document Merge
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
    const input = PDFServicesSdk.FileRef.createFromLocalFile(__dirname + '/templates/test.docx');
    documentMergeOperation.setInput(input);

    const fileName = jsonData.fullNames.join(' and ') + ' Partnership Agreement with Bitprop.pdf';
    const outputPath = __dirname + '/' + fileName;

    documentMergeOperation.execute(executionContext)
      .then(result => result.saveAsFile(outputPath))
      .then(() => {
        res.redirect(`/success?file=${encodeURIComponent(fileName)}`);
      })
      .catch(err => {
        console.error('Error generating PDF:', err);
        return res.status(500).send('Error generating PDF');
      });
  } catch (err) {
    console.log('Exception encountered while executing operation', err);
    return res.status(500).send('Error executing document merge operation');
  }
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
      <p><a href="/">Generate another partnership agreement</a></p>
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
