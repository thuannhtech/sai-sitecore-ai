'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { checkIsCaptchaEnabled } from './CustomSitecoreForm';

type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'checkbox'
  | 'select'
  | 'textarea'
  | 'link'
  | 'button'
  | 'number'
  | 'hidden'
  | 'rich text'
  | 'radio'
  | 'row'
  | 'rating'
  | 'phone'
  | 'label';

type FormOption = { label: string; value: string };

type FormField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  options?: FormOption[];
  helpText?: string;
  validationMessage?: string;
  defaultValue?: string;
  children?: FormField[];
};

type FormDefinition = {
  id: string;
  name: string;
  title: string;
  endpoint: string;
  submitText: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  successRedirect: string | null;
  fields: FormField[];
  script?: string;
  style?: string;
};

interface BasicFormProps {
  dataSourceId?: string;
  language?: string;
  rendering?: {
    dataSource?: string;
  };
  params?: { [key: string]: string };
  fields?: {
    items?: any[];
    data?: {
      item?: any;
    };
  };
}

export default function BasicForm(props: BasicFormProps) {
  const { dataSourceId: manualId, rendering, fields: initialFields } = props;
  const dataSourceId = rendering?.dataSource || manualId;

  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Check if reCAPTCHA is enabled via Sitecore Pages Parameters (e.g. enableCaptcha=true) or URL (?captcha=1)
  const isCaptchaEnabled = useMemo(() => {
    return checkIsCaptchaEnabled(props.params, (props.rendering as any)?.params);
  }, [props.params, props.rendering]);

  // Load Google reCAPTCHA script only if site key is configured AND captcha is enabled
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && isCaptchaEnabled && typeof window !== 'undefined') {
      if (!document.getElementById('google-recaptcha-v2-script')) {
        const script = document.createElement('script');
        script.id = 'google-recaptcha-v2-script';
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [isCaptchaEnabled]);

  // --- Helper để lấy giá trị field linh hoạt ---
  const getFieldValue = (item: any, fieldName: string): any => {
    if (!item) return null;

    const fields = item.fields || item;

    const candidates = [
      fieldName,
      fieldName.toLowerCase(),
      fieldName.replace(/([A-Z])/g, ' $1').trim(),
      fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
    ];

    for (const name of candidates) {
      const f = fields[name];
      if (f !== undefined) {
        return f?.value !== undefined ? f.value : f;
      }
    }
    return null;
  };

  const transformForm = (data: any): FormDefinition | null => {
    if (!data) return null;

    let rootItem: any = null;
    let fieldItems: any[] = [];
    const isResolver = !!data.items;

    if (isResolver) {
      rootItem = data.items?.[0];
      fieldItems = data.items?.slice(1) || [];
    } else {
      rootItem = data.data?.item || data.item;
      fieldItems = rootItem?.children?.results || rootItem?.children || [];
    }

    if (!rootItem) return null;

    const mapSingleField = (f: any): FormField => {
      const optionsStr = String(getFieldValue(f, 'Options') || '');
      const options = optionsStr
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
        .map((l: string) => {
          const idx = l.indexOf('|');
          return idx > -1
            ? { label: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() }
            : { label: l, value: l };
        });

      let type = String(getFieldValue(f, 'Type') || 'text').toLowerCase();
      if (type === 'hiddenfield') type = 'hidden';
      if (type === 'richtext' || type === 'rich-text') type = 'rich text';
      if (type === 'radiobutton' || type === 'radio-button' || type === 'radiobutton') type = 'radio';
      if (type === 'label') type = 'label';
      if (type === 'radio' || type === 'stars' || type === 'starrating') type = 'radio';
      if (type === 'phone' || type === 'tel' || type === 'telephone') type = 'phone';

      const isRow =
        f.templateName === 'FormRow' ||
        f.template?.name === 'FormRow' ||
        String(f.name || '').startsWith('FormRow');
      if (isRow) type = 'row';

      const childItems = f.children?.results || f.children || [];

      return {
        key: String(getFieldValue(f, 'Key') || f.name || f.displayName || ''),
        label: String(getFieldValue(f, 'Label') || ''),
        type: type as FieldType,
        placeholder: String(getFieldValue(f, 'Placeholder') || ''),
        required: !!getFieldValue(f, 'Required'),
        minLength: parseInt(getFieldValue(f, 'MinLength'), 10) || undefined,
        maxLength: parseInt(getFieldValue(f, 'MaxLength'), 10) || undefined,
        autoComplete: String(getFieldValue(f, 'AutoComplete') || ''),
        options,
        helpText: String(getFieldValue(f, 'HelpText') || ''),
        validationMessage: String(getFieldValue(f, 'ValidationMessage') || ''),
        defaultValue: String(getFieldValue(f, 'DefaultValue') || ''),
        children: isRow && childItems.length > 0 ? childItems.map(mapSingleField) : undefined,
        url: f.url,
      } as FormField & { url?: string };
    };

    const allMapped = fieldItems.map(mapSingleField);
    const rootPath = rootItem.url || '';
    const finalFields: FormField[] = [];

    allMapped.forEach((f) => {
      const url = (f as any).url || '';
      const parentPath = url.substring(0, url.lastIndexOf('/'));

      if (parentPath === rootPath || !parentPath || !rootPath) {
        finalFields.push(f);
      } else {
        const parentRow = allMapped.find((p) => (p as any).url === parentPath && p.type === 'row');
        if (parentRow) {
          parentRow.children = parentRow.children || [];
          const existingField = parentRow.children.find((c) => c.key === f.key);

          if (existingField && existingField.type === 'radio' && f.type === 'radio') {
            existingField.options = [...(existingField.options || []), ...(f.options || [])];
          } else {
            if (!parentRow.children.find((c) => (c as any).url === (f as any).url)) {
              parentRow.children.push(f);
            }
          }
        } else {
          finalFields.push(f);
        }
      }
    });

    const script = rootItem?.fields?.Script?.value || '';

    return {
      id: rootItem.id || '',
      name: rootItem?.fields?.Name?.value || rootItem.name || '',
      title: String(getFieldValue(rootItem, 'Title') || ''),
      endpoint: String(getFieldValue(rootItem, 'Endpoint') || ''),
      submitText: String(getFieldValue(rootItem, 'SubmitText') || 'Submit'),
      secondaryButtonText: String(getFieldValue(rootItem, 'SecondaryButtonText') || ''),
      secondaryButtonUrl: String(getFieldValue(rootItem, 'SecondaryButtonUrl') || ''),
      successRedirect: getFieldValue(rootItem, 'SuccessRedirect')?.href || null,
      fields: finalFields,
      script: script,
      style: rootItem?.fields?.Style?.value || '',
    };
  };

  useEffect(() => {
    if (initialFields) {
      const def = transformForm(initialFields);
      if (def) {
        setFormDef(def);
        setError(null);
      } else {
        setError("Không thể đọc cấu trúc Form. Hãy kiểm tra lại Fields trong Sitecore.");
      }
      setLoading(false);
    } else if (!dataSourceId) {
      setLoading(false);
      setError("Thiếu DataSource cho BasicForm.");
    }
  }, [initialFields, dataSourceId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (e.defaultPrevented) return;

    // 1. Google reCAPTCHA Validation (Client & Server) - only if enabled
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && isCaptchaEnabled) {
      const captchaToken = (window as any).grecaptcha?.getResponse();
      if (!captchaToken) {
        setError('Vui lòng xác nhận bạn không phải người máy (reCAPTCHA) trước khi gửi.');
        return;
      }

      setSubmitting(true);
      setError(null);

      // Verify token with Next.js Backend API
      try {
        const verifyRes = await fetch('/api/forms/validate-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: captchaToken }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          setError('Xác thực reCAPTCHA không thành công. Vui lòng thử lại.');
          (window as any).grecaptcha?.reset();
          setSubmitting(false);
          return;
        }
      } catch (captchaErr: any) {
        setError('Lỗi khi kiểm tra reCAPTCHA: ' + captchaErr.message);
        setSubmitting(false);
        return;
      }
    }

    // 2. Extract data from the form using native FormData API
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Target endpoint: use configured endpoint or fallback to built-in webhook receiver
    const targetEndpoint = formDef?.endpoint || '/api/forms/webhook';

    // Auto-attach helpful metadata
    data['_formId'] = formDef?.id || 'contact-us';
    data['_formName'] = formDef?.name || formDef?.title || 'Contact Us Form';
    data['_pageUrl'] = typeof window !== 'undefined' ? window.location.href : '';
    data['recaptcha_verified'] = 'true';

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Submission failed.');

      if (formDef?.successRedirect) {
        window.location.href = formDef.successRedirect;
      } else {
        alert("Cảm ơn bạn! Thông tin đã được gửi thành công.");
        if ((window as any).grecaptcha) {
          (window as any).grecaptcha.reset();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;

  if (error && !formDef) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <p className="font-bold mb-2">🛠 Form Debug Error:</p>
        <p className="text-sm">{error}</p>
        <p className="mt-4 text-[10px] uppercase font-bold opacity-50">Dành cho Developer: Kiểm tra console để xem chi tiết Props.</p>
      </div>
    );
  }

  if (!formDef) return null;

  const savedData = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem(`checkout_form_${formDef.name}`) || '{}') : {};
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      <form ref={formRef} name={formDef.name} onSubmit={onSubmit} className="sc-BasicForm space-y-6">
        {formDef.title && <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{formDef.title}</h2>}

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          {formDef.fields.map((f) => {
            const renderFieldContent = (field: FormField) => {
              const val = savedData[field.key] || field.defaultValue;

              if (field.type === 'row') {
                return (
                  <div key={field.key} className="flex flex-col md:flex-row md:flex-wrap items-start">
                    {field.children?.map((child) => (
                      <div key={child.key} className={child.type === 'label' ? 'w-full' : 'flex-1 w-full'}>
                        {renderFieldContent(child)}
                      </div>
                    ))}
                  </div>
                );
              }

              if (field.type === 'label') {
                return (
                  <div key={field.key} className="pt-2 pb-1">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      {field.label}
                    </label>
                  </div>
                );
              }

              return (
                <div key={field.key} className="flex flex-col gap-1.5">
                  {field.type !== 'checkbox' && field.type !== 'link' && field.type !== 'hidden' && field.type !== 'button' && (
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  )}

                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.key}
                      defaultValue={val}
                      placeholder={field.placeholder}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.key}
                      defaultValue={val}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                      <option value="">{field.placeholder || 'Chọn...'}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name={field.key}
                        defaultChecked={val === 'true' || val === '1' || val === true}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[15px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {field.helpText || field.label}
                      </span>
                    </label>
                  ) : field.type === 'link' ? (
                    <a href={field.defaultValue} className="text-blue-600 hover:underline font-bold text-[15px]">
                      {field.label || field.key}
                    </a>
                  ) : field.type === 'button' ? (
                    <button
                      type="button"
                      name={field.key}
                      className="w-full py-4 bg-gray-100 text-gray-900 font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all text-[15px]"
                    >
                      {field.label || field.placeholder || 'Action'}
                    </button>
                  ) : field.type === 'hidden' ? (
                    <input type="hidden" name={field.key} defaultValue={val} />
                  ) : field.type === 'rich text' ? (
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: val }} />
                  ) : field.type === 'radio' ? (
                    <div className="flex flex-wrap radio-group gap-10">
                      {field.options?.map((opt) => (
                        <label key={opt.value}>
                          <div className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="radio"
                              name={field.key}
                              value={opt.value}
                              defaultChecked={val === opt.value}
                              className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                            />
                            <span className="text-[15px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                              {opt.label}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'rating' ? (
                    <div className="flex items-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className="cursor-pointer text-2xl hover:scale-110 transition-transform">
                          <input
                            type="radio"
                            name={field.key}
                            value={star}
                            defaultChecked={String(val || '5') === String(star)}
                            className="sr-only peer"
                          />
                          <span className="text-gray-300 peer-checked:text-amber-400 hover:text-amber-300">★</span>
                        </label>
                      ))}
                      <span className="text-xs text-gray-500 ml-2 font-medium">({field.placeholder || 'Chọn từ 1 đến 5 sao'})</span>
                    </div>
                  ) : field.type === 'phone' ? (
                    <input
                      type="tel"
                      name={field.key}
                      defaultValue={val}
                      pattern="^0[0-9]{9}$"
                      maxLength={10}
                      minLength={10}
                      title="Số điện thoại phải gồm đúng 10 chữ số (bắt đầu bằng số 0)"
                      placeholder={field.placeholder || '0901234567'}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type}
                      name={field.key}
                      defaultValue={val}
                      placeholder={field.placeholder}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  )}
                </div>
              );
            };

            return renderFieldContent(f);
          })}
        </div>

        {/* Google reCAPTCHA v2 Widget Container - only rendered when enabled */}
        {siteKey && isCaptchaEnabled && (
          <div className="pt-2 pb-1">
            <div className="g-recaptcha" data-sitekey={siteKey}></div>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer w-full py-4 bg-[#002795] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-100"
          >
            {submitting ? 'Sending...' : formDef.submitText}
          </button>

          {formDef.secondaryButtonText && (
            <a
              href={formDef.secondaryButtonUrl || '#'}
              className="w-full py-4 bg-white text-gray-900 border border-gray-200 font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-50 text-center transition-all text-[15px]"
            >
              {formDef.secondaryButtonText}
            </a>
          )}
        </div>
      </form>
      <div className='hidden-assets'>
        <DynamicAssetsInjector scripts={formDef.script} style={formDef.style} />
      </div>

    </>
  );
}

function DynamicAssetsInjector({ scripts, style }: { scripts?: string; style?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const cleanSitecoreText = (text: string) => {
    if (!text) return '';
    let result = text;
    if (result.startsWith('"') && result.endsWith('"')) {
      try { result = JSON.parse(result); } catch (e) { }
    }
    result = result
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    return result.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  };

  React.useEffect(() => {
    const rawScripts = cleanSitecoreText(scripts || '');
    if (!rawScripts) return;

    const scriptUrls = rawScripts
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('//') && !s.startsWith('#'));

    scriptUrls.forEach((url) => {
      if (document.querySelector(`script[src="${url}"]`)) return;
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
    });
  }, [scripts]);

  const cleanStyle = cleanSitecoreText(style || '');

  return (
    <div ref={containerRef} style={{ display: 'none' }}>
      {cleanStyle && <style dangerouslySetInnerHTML={{ __html: cleanStyle }} />}
    </div>
  );
}
