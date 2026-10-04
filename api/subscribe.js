import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Fadlan geli email sax ah.' });
    }

    // 1. Ku dar email-ka Resend adigoo adeegsanaya "default" audience ama adigoo ka tagaya ID-ga
    await resend.contacts.create({
      email: email,
      unsubscribed: false,
    });

    // 2. U dir email-ka soo dhoweynta ah (Welcome Email)
    const data = await resend.emails.send({
      from: 'Kulmishub <onboarding@kulmishub.com>',
      to: [email],
      subject: 'Ku soo dhawoow Kulmishub Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Mahadsanid!</h2>
          <p>Waad ku mahadsan tahay inaad ka mid noqotay dadka helaya wararka, koorsooyinka, iyo qoraallada Kulmishub.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
