// const express = require('express');
// const fs = require('fs');
// const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
// // const fetch = require('isomorphic-fetch');
// // const AdmZip = require('adm-zip');

// const app = express();
// const port = 8080;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Serve the form page
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/templates/form.html');
// });

// // Handle form submission
// app.post('/submit', async (req, res) => {
//   const formData = req.body;

//   // Read the template files
//   console.log('Reading form.html:')
//   const formTemplate = fs.readFileSync(__dirname + '/templates/form.html', 'utf8');
//   console.log('Reading template.html:')
//   const baseTemplate = fs.readFileSync(__dirname + '/test.docx', 'utf8');
//   console.log('Finsihed reading those')

//   // Replace placeholders in the template with form data
//   console.log('Adding name and surname')
//   const filledTemplate = baseTemplate
//     .replace(/{{name}}/g, formData.name)
//     .replace(/{{surname}}/g, formData.surname);

//     console.log('Name and surname added')

// //   // Create the zip file
// //   console.log('Creating zip file')
// //   const zip = new AdmZip();
// //   zip.addFile('test.html', Buffer.from(filledTemplate));
// //   zip.addFile('form.html', Buffer.from(formTemplate));
// //   console.log('Zip done')

// //   const zipBuffer = zip.toBuffer();
// //   console.log('Zip to buffer done')




// try {
//     // Initial setup, create credentials instance.
//     const credentials =  PDFServicesSdk.Credentials
//         .servicePrincipalCredentialsBuilder()
//         .withClientId("c8e4cd5828dd4a73bad876a83e3714a4")
//         .withClientSecret("p8e-4FwcEry59N3aTEvx52Io2z6C4krJCKEK")
//         .build();

//     // Create an ExecutionContext using credentials and create a new operation instance.
//     const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
//         // createPdfOperation = PDFServicesSdk.CreatePDF.Operation.createNew();

//     const documentMerge = PDFServicesSdk.DocumentMerge,
//             documentMergeOptions = documentMerge.options,
//             options = new documentMergeOptions.DocumentMergeOptions(filledTemplate, documentMergeOptions.OutputFormat.PDF);
 
//     // Create a new operation instance using the options instance.
//     const documentMergeOperation = documentMerge.Operation.createNew(options);
    
//     // Set operation input document template from a source file.
//     const input = PDFServicesSdk.FileRef.createFromLocalFile(baseTemplate);
//     documentMergeOperation.setInput(input);
 
//     // Execute the operation and Save the result to the specified location.
//     documentMergeOperation.execute(executionContext)
//     .then(result => result.saveAsFile(OUTPUT))
//     .catch(err => {
//         if(err instanceof PDFServicesSdk.Error.ServiceApiError
//             || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
//             console.log('Exception encountered while executing operation', err);
//         } else {
//             console.log('Exception encountered while executing operation', err);
//         }
//     });


    
//     // // Set operation input from a source file.
    
//     // createPdfOperation.setInput(input);

//     // //Generating a file name
//     // let outputFilePath = createOutputFilePath();

//     // // Execute the operation and Save the result to the specified location.
//     // createPdfOperation.execute(executionContext)
//     //     .then(result => result.saveAsFile(outputFilePath))
//     //     .catch(err => {
//     //         if(err instanceof PDFServicesSdk.Error.ServiceApiError
//     //             || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
//     //             console.log('Exception encountered while executing operation', err);
//     //         } else {
//     //             console.log('Exception encountered while executing operation', err);
//     //         }
//     //     });

//     // //Generates a string containing a directory structure and file name for the output file.
//     // function createOutputFilePath() {
//     //     let date = new Date();
//     //     let dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
//     //         ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
//     //         ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
//     //     // return ("output/CreatePDFFromDOCX/create" + dateString + ".pdf");
//     //     return ("testsave.pdf");
//     // }

//     const { location } = response.headers;

//     res.redirect(`/success?location=${encodeURIComponent(location)}`);

// } catch (err) {
//     console.log('Exception encountered while executing operation', err);
// }});




// //   try {
// //     console.log('Apiendpoint')
// //     const apiEndpoint = 'https://pdf-services.adobe.io/api/v1/createPDF';
// //     console.log('Access token')
// //     const accessToken = 'eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE2ODk2MTI4MjY4OTBfMTdjMWY4NDgtNjczNi00NWU4LWIwMjYtYjcwZTNhZmMzNDYzX3VlMSIsIm9yZyI6IjI2MjUzNTNBNjIyNjE2RkIwQTQ5NUNBRUBBZG9iZU9yZyIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJjOGU0Y2Q1ODI4ZGQ0YTczYmFkODc2YTgzZTM3MTRhNCIsInVzZXJfaWQiOiI2QTgwMURGNDY0QjUxQUI2MEE0OTVFQUFAdGVjaGFjY3QuYWRvYmUuY29tIiwiYXMiOiJpbXMtbmExIiwiYWFfaWQiOiI2QTgwMURGNDY0QjUxQUI2MEE0OTVFQUFAdGVjaGFjY3QuYWRvYmUuY29tIiwiY3RwIjozLCJtb2kiOiJmYjZkYmQ1YiIsImV4cGlyZXNfaW4iOiI4NjQwMDAwMCIsInNjb3BlIjoiRENBUEksb3BlbmlkLEFkb2JlSUQiLCJjcmVhdGVkX2F0IjoiMTY4OTYxMjgyNjg5MCJ9.D_02g1mA8TcScoHVTnt69b5OTaigFJ-lmWcHmkUqAHzylEHY0XNos4IInv5E9wJpW2W1vANk5OYRRUn_UU9N8ZMPlP8vy0ge2bnNthjef0xzsJOflN2ilk3tq1rXf32sNWkoSM_feI4ls8bFmV1OblviB9I26nGMCPEbp32X2XzrusV6HwOgb-ywUY16dzx9HqRSrvIRRFRq4LcduzIBjgd15kRqciX5GcsnxWd4ECxUVlcGlUkd-nxgMfNbyHTJl0HpydXHXiVR02T7cpX6mlWo9doG-2suGwK9x7pa2yrt4iqja8PkNcxbMFpV1HDYnZg7VnREtMxwXNPZT3X9mA';
// //     console.log('Apikey')
// //     const apiKey = 'c8e4cd5828dd4a73bad876a83e3714a4';
// //     console.log('Starting fetch response')
// //     const response = await fetch(apiEndpoint, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/zip',
// //         Authorization: `Bearer ${accessToken}`,
// //         'x-api-key': apiKey,
// //       },
// //       body: zipBuffer,
// //     });
// //     console.log('response fetch done')
// //     console.log(filledTemplate)
// //     if (!response.ok) {
// //       console.error('Error creating PDF:', response.status, response.statusText);
// //       return res.status(500).send('Error creating PDF');
// //     }

// //     const { location } = response.headers;

// //     res.redirect(`/success?location=${encodeURIComponent(location)}`);
// //   } catch (err) {
// //     console.error('Error generating PDF:', err);
// //     return res.status(500).send('Error generating PDF');
// //   }
// // });

// // Success page
// app.get('/success', (req, res) => {
//   const { location } = req.query;
//   res.send(`
//     <h1>PDF generated successfully!</h1>
//     <p><a href="${location}">Download the PDF</a></p>
//     <p><a href="/">Generate another PDF</a></p>
//   `);
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });





