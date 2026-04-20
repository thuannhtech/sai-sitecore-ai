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
  debug: any;
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
  const { dataSourceId: manualId, language, rendering, fields } = props;
  const dataSourceId = rendering?.dataSource || manualId;
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<Record<string, any>>({});


  console.log('props', props);

  // Helper to transform Sitecore data into FormDefinition
  // Supports both Content Resolver (items array) and Integrated GraphQL (item tree)
  const transformForm = (data: any): FormDefinition | null => {
    let rootItem: any;
    let fieldItems: any[] = [];
    const isResolver = !!data?.items;

    if (isResolver) {
      // Structure from Datasource Item And Children Resolver
      rootItem = data?.items?.[0];
      fieldItems = data?.items?.slice(1) || [];
    } else {
      // Structure from Integrated GQL or API
      rootItem = data?.data?.item || data?.item;
      fieldItems = rootItem?.children?.results || [];
    }

    if (!rootItem) return null;

    const getVal = (item: any, fieldName: string) => {
      // Try exact match then lowercase match to handle both Resolver and GQL aliases
      const fields = isResolver ? item?.fields : item;
      const lowerName = fieldName.toLowerCase();
      const f = fields?.[fieldName] || fields?.[lowerName];
      return f?.value ?? '';
    };

    const extractSuccessUrl = () => {
      const field = isResolver ? rootItem?.fields?.SuccessRedirect : rootItem?.successRedirect;
      const jv = field?.jsonValue;
      if (jv?.value?.href) return jv.value.href;
      const xml = field?.value as string | undefined;
      if (!xml) return null;
      const m = xml.match(/url="([^"]+)"/);
      return m ? m[1] : null;
    };

    const mappedFields: FormField[] = fieldItems.map((f: any) => {
      const requiredVal = getVal(f, 'Required');
      const required = requiredVal === '1' || requiredVal === true || /^true$/i.test(String(requiredVal));

      const options = String(getVal(f, 'Options') || '')
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
        .map((l: string) => {
          const idx = l.indexOf('|');
          return idx > -1
            ? { label: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() }
            : { label: l, value: l };
        });

      return {
        key: String(getVal(f, 'Key') || f.name || f.displayName || ''),
        label: String(getVal(f, 'Label') || ''),
        type: (String(getVal(f, 'Type')).toLowerCase() || 'text') as FieldType,
        placeholder: String(getVal(f, 'Placeholder') || ''),
        required,
        minLength: getVal(f, 'MinLength') ? parseInt(String(getVal(f, 'MinLength')), 10) : undefined,
        maxLength: getVal(f, 'MaxLength') ? parseInt(String(getVal(f, 'MaxLength')), 10) : undefined,
        autoComplete: String(getVal(f, 'AutoComplete') || ''),
        options,
        helpText: String(getVal(f, 'HelpText') || ''),
        validationMessage: String(getVal(f, 'ValidationMessage') || ''),
        defaultValue: String(getVal(f, 'DefaultValue') || ''),
      };
    });

    return {
      id: rootItem.id,
      name: rootItem.name || rootItem.displayName || '',
      title: String(getVal(rootItem, 'Title') || rootItem.displayName || rootItem.name || ''),
      endpoint: String(getVal(rootItem, 'Endpoint') || ''),
      submitText: String(getVal(rootItem, 'SubmitText') || 'Submit'),
      secondaryButtonText: String(getVal(rootItem, 'SecondaryButtonText') || ''),
      secondaryButtonUrl: String(getVal(rootItem, 'SecondaryButtonUrl') || ''),
      successRedirect: extractSuccessUrl(),
      fields: mappedFields,
      debug: rootItem?.fields?.Title?.value
    };
  };

  useEffect(() => {
    if (fields) {
      try {
        const def = transformForm(fields);
        if (def) {
          setFormDef(def);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (e: any) {
        console.error('Error parsing Sitecore form data:', e);
      }
    }

    if (!dataSourceId) {
      setLoading(false);
      return;
    }

  }, [dataSourceId, language]);

  const initialValues = useMemo(() => {
    const iv: Record<string, any> = {};
    formDef?.fields?.forEach((f) => {
      if (f.type === 'checkbox') {
        iv[f.key] = !!f.defaultValue;
      } else if (f.type === 'password') {
        iv[f.key] = '';
      } else {
        iv[f.key] = f.defaultValue || '';
      }
    });
    return iv;
  }, [formDef]);

  useEffect(() => {
    setFormState(initialValues);
  }, [initialValues]);

  function onChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState((s) => ({
      ...s,
      [name]: type === 'checkbox' ? !!checked : value,
    }));
  }

  function validate(): string | null {
    if (!formDef) return 'Form not loaded';
    for (const f of formDef.fields) {
      const v = formState[f.key];
      if (f.required && (v === undefined || v === '' || v === false)) {
        return f.validationMessage || `${f.label} is required`;
      }
      if (typeof v === 'string') {
        if (f.minLength && v.length < f.minLength) {
          return f.validationMessage || `${f.label} is too short`;
        }
        if (f.maxLength && v.length > f.maxLength) {
          return f.validationMessage || `${f.label} is too long`;
        }
        if (f.type === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) {
          return f.validationMessage || `Invalid email`;
        }
      }
    }

    // Confirm password check if fields present
    const pwd = formState['password'];
    const cpw = formState['confirmPassword'];
    if (pwd !== undefined && cpw !== undefined && pwd !== cpw) {
      return 'Passwords do not match';
    }

    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formDef) return;

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(formDef.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || 'Submission failed');
      }

      if (formDef.successRedirect) {
        window.location.href = formDef.successRedirect;
      }
    } catch (e: any) {
      setError(e?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (<div></div>);
  }
  if (!formDef && error)
    return (
      <div role="alert" className="error">
        {error}
      </div>
    );
  if (!dataSourceId) return <div role="alert" className="error">Missing DataSource ID</div>;
  if (!formDef) return null;

  return (
    <form
      name={formDef.name}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="sc-BasicForm m-auto"
    >
      {formDef.title && <h2 className="sc-BasicForm-title">{formDef.title}</h2>}
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}

      {formDef.fields.map((f) => {
        const value = formState[f.key];
        const common = {
          name: f.key,
          id: f.key,
          required: !!f.required,
          'aria-required': f.required ? true : undefined,
          placeholder: f.placeholder || undefined,
          onChange,
        };

        return (
          <div className="sc-FormGroup" key={f.key}>
            {f.label && f.type !== 'link' && (
              <label htmlFor={f.key}>
                {f.label}
                {f.required ? ' *' : ''}
              </label>
            )}
            {f.type === 'textarea' ? (
              <textarea {...common} value={value || ''} rows={4} />
            ) : f.type === 'select' ? (
              <select {...common} value={value || ''}>
                <option value="" disabled hidden>
                  {f.placeholder || 'Select…'}
                </option>
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'checkbox' ? (
              <div className="sc-Checkbox">
                <input
                  type="checkbox"
                  {...common}
                  checked={!!value}
                  onChange={onChange}
                />
                <span>{f.helpText}</span>
              </div>
            ) : f.type === 'link' ? (
              <a href={f.defaultValue} className="sc-Link">
                {f.label || f.key}
              </a>
            ) : (
              <input
                type={f.type}
                {...common}
                value={value || ''}
                minLength={f.minLength}
                maxLength={f.maxLength}
                autoComplete={f.autoComplete || undefined}
              />
            )}
            {f.helpText && f.type !== 'checkbox' && (
              <small className="help">{f.helpText}</small>
            )}
          </div>
        );
      })}

      <button type="submit" disabled={submitting} className="btn-submit">
        {submitting ? 'Please wait…' : formDef.submitText || 'Submit'}
      </button>

      {formDef.secondaryButtonText && (
        <a href={formDef.secondaryButtonUrl || '#'} className="btn-secondary">
          {formDef.secondaryButtonText}
        </a>
      )}

      <style jsx>{`
        .sc-BasicForm {
          display: grid;
          gap: 16px;
          max-width: 560px;
          background: #fff;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .sc-BasicForm-title {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .sc-FormGroup {
          display: grid;
          gap: 6px;
        }
        label {
          font-weight: 500;
          font-size: 0.9rem;
        }
        input,
        select,
        textarea {
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          width: 100%;
        }
        input:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid #0057b8;
          outline-offset: -1px;
        }
        .sc-Checkbox {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          font-size: 0.9rem;
        }
        .sc-Checkbox input {
          width: auto;
        }
        .help {
          color: #6b7280;
          font-size: 0.8rem;
        }
        .btn-submit {
          padding: 12px 16px;
          background: #111827;
          color: #fff;
          border: 0;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-submit:hover {
          background: #374151;
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          padding: 12px 16px;
          background: transparent;
          color: #111827;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: block;
          width: 100%;
        }
        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #111827;
        }
        .error {
          background: #fee2e2;
          color: #991b1b;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          border: 1px solid #fecaca;
        }
        .loading {
          color: #6b7280;
          font-style: italic;
        }
        .sc-Link {
          color: #0057b8;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
          display: inline-block;
          margin-top: 4px;
        }
        .sc-Link:hover {
          color: #003a7a;
          text-decoration: underline;
        }

        /* Skeleton Styles */
        .skeleton-container {
          pointer-events: none;
          user-select: none;
        }
        .skeleton {
          background: #f3f4f6;
          background: linear-gradient(
            90deg,
            #f3f4f6 25%,
            #e5e7eb 50%,
            #f3f4f6 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite linear;
          border-radius: 6px;
        }
        .skeleton-title {
          height: 32px;
          width: 60%;
          margin-bottom: 24px;
        }
        .skeleton-label {
          height: 14px;
          width: 30%;
          margin-bottom: 8px;
        }
        .skeleton-input {
          height: 42px;
          width: 100%;
          margin-bottom: 4px;
        }
        .skeleton-button {
          height: 48px;
          width: 100%;
          margin-top: 8px;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </form>
  );
}
