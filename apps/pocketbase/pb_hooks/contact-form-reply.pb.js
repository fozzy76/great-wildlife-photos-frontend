/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const name = e.record.get("name");
  const email = e.record.get("email");
  const subject = e.record.get("subject");
  const message = e.record.get("message");

  // Customer confirmation email
  const customerMessage = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: email }],
    subject: "We received your message",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you as soon as possible.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Your Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Thank you for reaching out. We appreciate your inquiry and will respond shortly.
        </p>
      </div>
    `
  });
  $app.newMailClient().send(customerMessage);

  // Admin notification email
  const adminMessage = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "Contact Form"
    },
    to: [{ address: "l.starnes@charter.net" }],
    subject: "New Contact Form Submission: " + subject,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        <p><a href="${$app.settings().meta.appUrl || "https://app.example.com"}/admin/contact/${e.record.id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Message</a></p>
      </div>
    `
  });
  $app.newMailClient().send(adminMessage);

  e.next();
}, "contact_messages");