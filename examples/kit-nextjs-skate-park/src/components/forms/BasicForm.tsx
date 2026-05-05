'use client';

import React, { useEffect, useMemo, useState } from 'react';

type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'checkbox'
  | 'select'
  | 'textarea'
  | 'link';

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

  // --- Helper để lấy giá trị field linh hoạt ---
  const getFieldValue = (item: any, fieldName: string): any => {
    if (!item) return null;

    // Sitecore có thể trả về fields trực tiếp hoặc bọc trong .fields
    const fields = item.fields || item;

    // Các biến thể của tên field
    const candidates = [
      fieldName,                                    // VD: SubmitText
      fieldName.toLowerCase(),                      // submittext
      fieldName.replace(/([A-Z])/g, ' $1').trim(),  // Submit Text
      fieldName.charAt(0).toLowerCase() + fieldName.slice(1) // submitText
    ];

    for (const name of candidates) {
      const f = fields[name];
      if (f !== undefined) {
        // Trả về .value nếu có, nếu không trả về chính nó
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

    const mappedFields: FormField[] = fieldItems.map((f: any) => {
      // Parse Options cho Select
      const optionsStr = String(getFieldValue(f, 'Options') || '');
      const options = optionsStr
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          const idx = l.indexOf('|');
          return idx > -1
            ? { label: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() }
            : { label: l, value: l };
        });

      return {
        key: String(getFieldValue(f, 'Key') || f.name || f.displayName || ''),
        label: String(getFieldValue(f, 'Label') || ''),
        type: (String(getFieldValue(f, 'Type') || 'text').toLowerCase()) as FieldType,
        placeholder: String(getFieldValue(f, 'Placeholder') || ''),
        required: !!getFieldValue(f, 'Required'),
        minLength: parseInt(getFieldValue(f, 'MinLength'), 10) || undefined,
        maxLength: parseInt(getFieldValue(f, 'MaxLength'), 10) || undefined,
        autoComplete: String(getFieldValue(f, 'AutoComplete') || ''),
        options,
        helpText: String(getFieldValue(f, 'HelpText') || ''),
        validationMessage: String(getFieldValue(f, 'ValidationMessage') || ''),
        defaultValue: String(getFieldValue(f, 'DefaultValue') || ''),
      };
    });

    return {
      id: rootItem.id || '',
      name: rootItem?.fields?.Name?.value || rootItem.name || '',
      title: String(getFieldValue(rootItem, 'Title') || ''),
      endpoint: String(getFieldValue(rootItem, 'Endpoint') || ''),
      submitText: String(getFieldValue(rootItem, 'SubmitText') || 'Submit'),
      secondaryButtonText: String(getFieldValue(rootItem, 'SecondaryButtonText') || ''),
      secondaryButtonUrl: String(getFieldValue(rootItem, 'SecondaryButtonUrl') || ''),
      successRedirect: getFieldValue(rootItem, 'SuccessRedirect')?.href || null,
      fields: mappedFields,
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
    
    // Check if external script (bridge) handled the submission
    if (e.defaultPrevented) return;

    // Extract data from the form using native FormData API
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // If no endpoint, do nothing (dumb form mode)
    if (!formDef?.endpoint) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(formDef.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Submission failed.');

      if (formDef.successRedirect) {
        window.location.href = formDef.successRedirect;
      } else {
        alert("Success!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Đang tải form...</div>;

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

  return (
    <form ref={formRef} name={formDef.name} onSubmit={onSubmit} className="sc-BasicForm space-y-6 max-w-lg mx-auto p-8 bg-white shadow-xl rounded-3xl border border-gray-100">
      {formDef.title && <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{formDef.title}</h2>}

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="space-y-4">
        {formDef.fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            {f.type !== 'link' && (
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
            )}

            {f.type === 'textarea' ? (
              <textarea
                name={f.key}
                defaultValue={f.defaultValue}
                placeholder={f.placeholder}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
              />
            ) : f.type === 'select' ? (
              <select
                name={f.key}
                defaultValue={f.defaultValue}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="">{f.placeholder || 'Chọn...'}</option>
                {f.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name={f.key}
                  defaultChecked={f.defaultValue === 'true' || f.defaultValue === '1'}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{f.helpText || f.label}</span>
              </label>
            ) : f.type === 'link' ? (
              <a href={f.defaultValue} className="text-blue-600 hover:underline font-bold text-sm">
                {f.label || f.key}
              </a>
            ) : (
              <input
                type={f.type}
                name={f.key}
                defaultValue={f.defaultValue}
                placeholder={f.placeholder}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
        >
          {submitting ? 'Đang gửi...' : formDef.submitText}
        </button>

        {formDef.secondaryButtonText && (
          <a
            href={formDef.secondaryButtonUrl || '#'}
            className="w-full py-4 bg-white text-gray-900 border border-gray-200 font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-50 text-center transition-all"
          >
            {formDef.secondaryButtonText}
          </a>
        )}
      </div>
    </form>
  );
}
