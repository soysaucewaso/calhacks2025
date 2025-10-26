const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'your_access_key_here',
    secretAccessKey: 'your_secret_key_here',
  },
});

async function sendEmail() {
  const command = new SendEmailCommand({
    Source: 'noreply@justswipe.org',
    Destination: {
      ToAddresses: ['recipient@example.com'],
    },
    Message: {
      Subject: {
        Data: 'Test Email from JustSwipe',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: '<h1>Hello from JustSwipe!</h1><p>This is a test email.</p>',
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    const result = await sesClient.send(command);
    console.log('Email sent successfully:', result.MessageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

sendEmail();