import { config } from 'src/lib/config';

export interface WorkatoEmailRecipient {
  Email: string;
}

export interface WorkatoEmailInformation {
  From?: string;
  BodyEmailTemplated?: string;
  Subject?: string;
  To?: WorkatoEmailRecipient[];
  Cc?: WorkatoEmailRecipient[];
  Bcc?: WorkatoEmailRecipient[];
  [key: string]: unknown;
}

interface BuildActivationEmailArgs {
  to: WorkatoEmailRecipient[];
  activationUrl: string;
  customerName?: string;
  customerEmail?: string;
  from?: string;
}

export interface WorkatoActivationEmailPayload {
  EmailInformation?: WorkatoEmailInformation;
  [key: string]: unknown;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatText = (value?: string) => escapeHtml(value?.trim() || 'N/A');

export const buildAccountActivationEmailInformation = (
  input: BuildActivationEmailArgs
): WorkatoEmailInformation => {
  const storefrontName = 'Sitecore AI';
  const customerName = input.customerName?.trim() || 'Customer';
  const safeActivationUrl = escapeHtml(input.activationUrl);

  return {
    From: input.from,
    To: input.to,
    Subject: 'Activate your account',
    BodyEmailTemplated: `
      <table role="presentation" style="width:100%;min-width:100%;background-color:#f2f4f8;padding:24px 0;margin:0;font-family:Arial,sans-serif;">
        <tbody>
          <tr>
            <td align="center">
              <table role="presentation" style="width:100%;max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);margin:0 auto;">
                <tbody>
                  <tr>
                    <td style="background:#0c2d48;padding:28px 32px;text-align:left;color:#ffffff;">
                      <p style="margin:0;font-size:28px;line-height:34px;font-weight:700;">Activate your account</p>
                      <p style="margin:8px 0 0;font-size:16px;line-height:24px;color:#cbd6e0;">Complete your ${escapeHtml(storefrontName)} registration by confirming your email address.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 20px;font-size:20px;line-height:28px;font-weight:700;color:#212121;">Hi ${escapeHtml(customerName)},</p>
                      <p style="margin:0 0 24px;font-size:16px;line-height:24px;color:#4f5b6b;">Your account has been created but is not active yet. Click the button below to activate it.</p>
                      <p style="margin:0 0 24px;">
                        <a href="${safeActivationUrl}" style="display:inline-block;background:#1965e1;color:#ffffff;text-decoration:none;font-size:16px;line-height:24px;font-weight:700;padding:14px 24px;border-radius:999px;">Activate Account</a>
                      </p>
                      <p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#65748b;">If the button does not work, copy and paste this link into your browser:</p>
                      <p style="margin:0 0 24px;font-size:14px;line-height:22px;word-break:break-all;color:#1965e1;">${safeActivationUrl}</p>
                      <div style="padding:24px;background:#f6f8fb;border-radius:16px;">
                        <p style="margin:0 0 8px;font-size:14px;line-height:20px;font-weight:700;color:#65748b;">Account Email</p>
                        <p style="margin:0;font-size:16px;line-height:24px;color:#212121;">${formatText(input.customerEmail)}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `.trim(),
  };
};

export const workatoAuthService = {
  submitActivationEmail: async (payload: WorkatoActivationEmailPayload) => {
    const url = config.workato.processActivationEmailUrl;
    const apiToken = config.workato.apiToken;

    if (!url || !apiToken) {
      throw new Error('Missing activation email configuration');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-token': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        EmailInformation: payload.EmailInformation,
      }),
      cache: 'no-store',
    });

    const responseText = await response.text();
    let responseBody: unknown = responseText;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }

    if (!response.ok) {
      throw new Error(
        `Activation email request failed with status ${response.status}${responseText ? `: ${responseText}` : ''}`
      );
    }

    return responseBody;
  },
};
