import type { H3Event } from 'h3';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type JSONTransport from 'nodemailer/lib/json-transport';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import Handlebars from 'handlebars';

export const siteName = 'Kino im Kasten';

interface MailTemplateContexts {
    'invite': { name: string; actionUrl: string };
    'password-reset': { name: string; actionUrl: string };
}

export type MailTemplate = keyof MailTemplateContexts;

export function resolveBaseUrl(event: H3Event) {
    const configured = useRuntimeConfig(event).public.siteUrl;
    if (configured) return configured.replace(/\/+$/, '');
    return getRequestURL(event).origin;
}

async function readAsset(path: string) {
    const raw = await useStorage('assets:server').getItemRaw<Buffer | string>(path);
    if (!raw) throw new Error(`E-Mail-Vorlage fehlt: ${path}`);
    return typeof raw === 'string' ? raw : raw.toString('utf8');
}

let partialsReady: Promise<void> | null = null;

function ensurePartials() {
    partialsReady ??= (async () => {
        const storage = useStorage('assets:server');
        const keys = await storage.getKeys('emails/partials');
        for (const key of keys) {
            const name = key.split(/[:/]/).pop()?.replace(/\.hbs$/, '');
            if (!name) continue;
            Handlebars.registerPartial(name, await readAsset(key));
        }
    })();
    return partialsReady;
}

let layoutTemplate: Handlebars.TemplateDelegate<object> | null = null;
const bodyTemplates = new Map<MailTemplate, Handlebars.TemplateDelegate<object>>();

async function renderMail<T extends MailTemplate>(template: T, subject: string, context: MailTemplateContexts[T]) {
    await ensurePartials();

    layoutTemplate ??= Handlebars.compile(await readAsset('emails/layout.hbs'));

    let bodyTemplate = bodyTemplates.get(template);
    if (!bodyTemplate) {
        bodyTemplate = Handlebars.compile(await readAsset(`emails/templates/${template}.hbs`));
        bodyTemplates.set(template, bodyTemplate);
    }

    const content = bodyTemplate({ ...context, siteName });
    return layoutTemplate({ content, subject, siteName });
}

type MailTransporter = Transporter<SMTPTransport.SentMessageInfo> | Transporter<JSONTransport.SentMessageInfo>;

let transporter: MailTransporter | null = null;
let usingDevFallback = false;

function getTransporter(): MailTransporter {
    if (transporter) return transporter;

    const smtp = useRuntimeConfig().smtp;
    if (smtp.host) {
        transporter = createTransport({
            host: smtp.host,
            port: Number(smtp.port) || 587,
            secure: smtp.secure === 'true',
            auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
        });
    }
    else {
        // Ohne SMTP-Konfiguration werden E-Mails nur ins Log geschrieben (Entwicklung)
        usingDevFallback = true;
        transporter = createTransport({ jsonTransport: true });
    }
    return transporter;
}

export async function sendTemplateMail<T extends MailTemplate>(options: {
    to: string;
    subject: string;
    template: T;
    context: MailTemplateContexts[T];
    text: string;
}) {
    const html = await renderMail(options.template, options.subject, options.context);

    try {
        await getTransporter().sendMail({
            from: useRuntimeConfig().smtp.from,
            to: options.to,
            subject: options.subject,
            html,
            text: options.text,
        });
        if (usingDevFallback) {
            console.warn(`[mail] SMTP nicht konfiguriert – E-Mail an ${options.to} („${options.subject}“) wurde nicht versendet. Inhalt:\n${options.text}`);
        }
    }
    catch (error) {
        console.error('[mail] Versand fehlgeschlagen:', error);
        throw createError({ statusCode: 502, statusMessage: 'Die E-Mail konnte nicht versendet werden.' });
    }
}
