// whatsapp_integration.js

const fetch = require('isomorphic-fetch');

// Function to send WhatsApp messages to unpaid invoices
async function sendInspectionForm(name, phone, form) {
  console.log('Sending to:', name, phone);

  // Loop through the numbers and send WhatsApp messages
    try {
      await sendWhatsAppMessage(name, phone, form);

    } catch (error) {
      console.error('Failed to send WhatsApp message to', name, phone, ':', error);
    }
  return phone;
}

async function sendWhatsAppMessage(name, phone, form) {
  console.log('Calling sendWhatsAppMessage for', phone);
  console.log('Form link: ', form)

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
          { key: '{{1}}', value: name },
          { key: '{{2}}', value: form }
        ],
        recipient_phone_number: phone,
        hsm_id: '141341' // Replace with your WhatsApp template HSM ID
      })
    };

    const sendResponse = await fetch('https://app.trengo.com/api/v2/wa_sessions', sendMessageOptions);
    const sendData = await sendResponse.json();
    console.log('API Response:', sendData);
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// sendWhatsAppToUnpaidInvoicesTest(month, parsedPhoneNumbers)
// console.log('phone number to message:', phone);
// console.log('inspection statement to send:', form);
// const successfulInspection = sendInspectionForm(phone, form);

// Export the sendInspectionForm function
module.exports = { sendInspectionForm };