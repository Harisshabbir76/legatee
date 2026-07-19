const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.BUSINESS_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendContactEmail = async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  res.json({ success: true });

  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f0f5f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f5f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;">

        <!-- Header -->
        <tr>
          <td align="center" style="background:#173946;padding:36px 40px 30px;">
            <p style="margin:0;color:#f0f5f6;font-family:Georgia,serif;font-size:24px;font-weight:500;letter-spacing:0.26em;">LEGATEE</p>
            <p style="margin:8px 0 0;color:rgba(248,242,237,0.55);font-family:Georgia,serif;font-size:10px;letter-spacing:0.4em;">Ù„ÙŠØ¬Ø§ØªÙŠ</p>
          </td>
        </tr>

        <!-- Gold accent line -->
        <tr><td style="height:3px;background:#2a7a8c;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 8px;">
            <p style="margin:0 0 6px;color:#173946;font-family:Georgia,serif;font-size:18px;font-weight:500;letter-spacing:0.04em;">New Customer Enquiry</p>
            <p style="margin:0;color:#4a6570;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
              A visitor has submitted a message through the LEGATEE contact form.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px 32px;">

            <!-- Section label -->
            <p style="margin:0 0 14px;color:#173946;font-family:Georgia,serif;font-size:13px;font-weight:500;letter-spacing:0.06em;border-bottom:1px solid #d0e4e8;padding-bottom:8px;">Contact Details</p>

            <!-- Name -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="width:110px;padding:10px 14px;background:#f0f5f6;color:#4a6570;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Name</td>
                <td style="padding:10px 14px;background:#f7fbfc;color:#0d1f26;font-family:Arial,sans-serif;font-size:13px;font-weight:400;line-height:1.5;vertical-align:top;">${name}</td>
              </tr>
            </table>

            <!-- Email -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="width:110px;padding:10px 14px;background:#f0f5f6;color:#4a6570;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Email</td>
                <td style="padding:10px 14px;background:#f7fbfc;color:#0d1f26;font-family:Arial,sans-serif;font-size:13px;font-weight:400;line-height:1.5;vertical-align:top;"><a href="mailto:${email}" style="color:#173946;text-decoration:none;">${email}</a></td>
              </tr>
            </table>

            <!-- Phone -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="width:110px;padding:10px 14px;background:#f0f5f6;color:#4a6570;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Phone</td>
                <td style="padding:10px 14px;background:#f7fbfc;color:#0d1f26;font-family:Arial,sans-serif;font-size:13px;font-weight:400;line-height:1.5;vertical-align:top;">${phone || "â€”"}</td>
              </tr>
            </table>

            <!-- Section label -->
            <p style="margin:22px 0 14px;color:#173946;font-family:Georgia,serif;font-size:13px;font-weight:500;letter-spacing:0.06em;border-bottom:1px solid #d0e4e8;padding-bottom:8px;">Message</p>

            <!-- Message -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding:14px 16px;background:#f7fbfc;border-left:3px solid #2a7a8c;color:#0d1f26;font-family:Arial,sans-serif;font-size:13px;font-weight:400;line-height:1.7;">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>

            <!-- Reply hint -->
            <p style="margin:0;color:#4a6570;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;">
              Reply directly to this email to respond to <strong style="color:#173946;">${name}</strong> at <a href="mailto:${email}" style="color:#173946;text-decoration:none;">${email}</a>.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#173946;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;color:rgba(248,242,237,0.8);font-family:Georgia,serif;font-size:11px;letter-spacing:0.15em;">LEGATEE</p>
            <p style="margin:0;color:rgba(248,242,237,0.45);font-family:Arial,sans-serif;font-size:10px;font-weight:300;letter-spacing:0.04em;">
              Â© ${year} LEGATEE â€” Luxury Arabian Fragrances. This message was submitted via the contact form.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  transporter.sendMail({
    from: `"LEGATEE" <${process.env.BUSINESS_EMAIL}>`,
    to: process.env.BUSINESS_EMAIL,
    replyTo: email,
    subject: `New Enquiry from ${name} â€” LEGATEE`,
    html,
  }).catch((err) => console.error("Contact email error:", err));
};

