import { SESClient } from "@aws-sdk/client-ses";
import { SendEmailCommand } from "@aws-sdk/client-ses";


const REGION = "eu-north-1";
const sesClient = new SESClient({
  region: REGION, credentials: {
      accessKeyId: `${process.env.AWS_SES_ACCESS_KEY}`,
      secretAccessKey: `${process.env.AWS_SES_SECRET_ACCESS_KEY}`,
  }
});


const createSendEmailCommand = (toAddress: string, fromAddress: string, emailBody: string, emailSubject: string) => {
    return new SendEmailCommand({
        Destination: {
  
            ToAddresses: [
                toAddress,
            ],
        },
        Message: {
  
            Body: {
  
  
                Text: {
                    Charset: "UTF-8",
                    Data: emailBody,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: emailSubject,
            },
        },
        Source: fromAddress,
  
    });
  };
  
  export const sendEmail = async (dist: string, emailBody: string, emailSubject: string) => {
    const sendEmailCommand = createSendEmailCommand(
        dist,
        "realtimechatapp7@gmail.com",
        emailBody,
        emailSubject
    );
  
    try {
        return await sesClient.send(sendEmailCommand);
    } catch (err) {
        console.error("Failed to send email." + err);
        return err;
    }
  };