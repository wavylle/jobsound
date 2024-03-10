import ElasticEmail from '@elasticemail/elasticemail-client';

const sendEmail = (subject, recipientEmail, content) => {
  let defaultClient = ElasticEmail.ApiClient.instance;
  let apikey = defaultClient.authentications['apikey'];
  apikey.apiKey = "9BDED3BA57F886092187BF17CE3323A5F0079B162005B5303F31151E51D3BEC32495B23CF4F40A3EA194D33ED5FCD240";

  let api = new ElasticEmail.EmailsApi();

  let email = ElasticEmail.EmailMessageData.constructFromObject({
    Recipients: [
      new ElasticEmail.EmailRecipient(recipientEmail)
    ],
    Content: {
      Body: [
        ElasticEmail.BodyPart.constructFromObject({
          ContentType: "HTML",
          Content: content
        })
      ],
      Subject: subject,
      From: "notifications@jobsound.ai"
    }
  });

  api.emailsPost(email, (error, data, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent successfully.');
    }
  });
};

console.log("Here")

export default sendEmail;
