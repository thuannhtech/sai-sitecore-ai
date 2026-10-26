'use client';

import React, { useEffect, useRef, useState } from 'react';
import { form as sitecoreForm } from '@sitecore-content-sdk/core';
import { useSitecore, useComponentProps } from '@sitecore-content-sdk/nextjs';

const { executeScriptElements, loadForm, subscribeToFormSubmitEvent } = sitecoreForm;

export type CustomSitecoreFormProps = {
  rendering: {
    uid?: string;
    componentName?: string;
    dataSource?: string;
    params?: Record<string, string>;
    [key: string]: any;
  };
  params: {
    FormId: string;
    styles?: string;
    RenderingIdentifier?: string;
    [key: string]: any;
  };
};

/**
 * Checks whether reCAPTCHA should be enabled for this form instance.
 * Priority:
 * 1. Sitecore Pages Rendering / Component Parameters (params or rendering?.params)
 *    Keys checked: enableCaptcha, enableRecaptcha, captcha, useCaptcha
 * 2. Client-side URL query param (?captcha=1 or ?captcha=true or ?enableCaptcha=true) for easy local testing
 * 3. Environment variable fallback (NEXT_PUBLIC_ENABLE_CAPTCHA_ALL=true)
 */
export function checkIsCaptchaEnabled(
  params?: Record<string, any>,
  renderingParams?: Record<string, any>
): boolean {
  const isTruthy = (val: any) => {
    if (val === true || val === 1) return true;
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      return s === 'true' || s === '1' || s === 'yes' || s === 'on';
    }
    return false;
  };

  // 1. Check Sitecore Pages Component Parameters (params)
  if (params) {
    if (
      isTruthy(params.enableCaptcha) ||
      isTruthy(params.enableRecaptcha) ||
      isTruthy(params.captcha) ||
      isTruthy(params.useCaptcha)
    ) {
      return true;
    }
  }

  // Check rendering params
  if (renderingParams) {
    if (
      isTruthy(renderingParams.enableCaptcha) ||
      isTruthy(renderingParams.enableRecaptcha) ||
      isTruthy(renderingParams.captcha) ||
      isTruthy(renderingParams.useCaptcha)
    ) {
      return true;
    }
  }

  // 2. Client-side URL query string (for quick testing on localhost without Sitecore Pages)
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        isTruthy(urlParams.get('captcha')) ||
        isTruthy(urlParams.get('enableCaptcha')) ||
        isTruthy(urlParams.get('recaptcha'))
      ) {
        return true;
      }
    } catch (e) {}
  }

  // 3. Fallback env var if configured
  if (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA_ALL === 'true') {
    return true;
  }

  return false;
}

export const CustomSitecoreForm: React.FC<CustomSitecoreFormProps> = ({ params, rendering }) => {
  const id = params?.RenderingIdentifier;
  const [error, setError] = useState(false);
  const context = useSitecore();
  const formRef = useRef<HTMLDivElement>(null);
  const isEditing = context.page.mode.isEditing;

  // Site name from Sitecore Context
  const siteName =
    context?.page?.siteName ||
    (context as any)?.page?.layout?.sitecore?.context?.site?.name ||
    params?.siteName ||
    rendering?.params?.siteName ||
    process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
    'sai-sitecore';

  // Detect Country / Site for Global Postal Code Lookup (SG: OneMap, AU: Australia Post)
  const country = resolveCountryFromSitecore(context, params, rendering?.params);

  // Check if reCAPTCHA is enabled via Sitecore Pages Rendering/Component Parameters (e.g. enableCaptcha=true)
  const [isCaptchaEnabled, setIsCaptchaEnabled] = useState(() => checkIsCaptchaEnabled(params, rendering?.params));

  // Sync client-side URL param on mount / update
  useEffect(() => {
    const enabled = checkIsCaptchaEnabled(params, rendering?.params);
    if (enabled !== isCaptchaEnabled) {
      setIsCaptchaEnabled(enabled);
    }
  }, [params, rendering?.params]);

  // 1. Pre-fetched server data from Sitecore ComponentPropsContext
  const serverData = useComponentProps<{ formHtml?: string }>(rendering?.uid);

  // 2. Initialize state: Server HTML > Client sessionStorage cache > Empty string
  const [content, setContent] = useState<string>(() => {
    if (serverData?.formHtml) return serverData.formHtml;
    if (typeof window !== 'undefined' && params?.FormId) {
      try {
        const cached = sessionStorage.getItem(`sai_form_${params.FormId}`);
        if (cached) return cached;
      } catch (e) {
        // Ignore sessionStorage restrictions if any
      }
    }
    return '';
  });

  // Keep state synced if serverData resolves after mount
  useEffect(() => {
    if (serverData?.formHtml && serverData.formHtml !== content) {
      setContent(serverData.formHtml);
      try {
        sessionStorage.setItem(`sai_form_${params.FormId}`, serverData.formHtml);
      } catch (e) {}
    }
  }, [serverData?.formHtml, params?.FormId]);

  // Main lifecycle effect for script execution, DOM styling and fallback fetch
  useEffect(() => {
    if (!content) {
      const edgeId = context.api?.edge?.clientContextId;
      if (!edgeId) {
        console.warn('Warning: clientContextId is missing – form cannot be loaded properly on the client');
        return;
      }

      loadForm(edgeId, params.FormId, context.api?.edge?.edgeUrl)
        .then((html) => {
          setContent(html);
          try {
            sessionStorage.setItem(`sai_form_${params.FormId}`, html);
          } catch (e) {}
        })
        .catch((err) => {
          if (isEditing) {
            console.error(`Failed to load form ${params.FormId}:`, err);
          }
          setError(true);
        });
    } else {
      if (!formRef.current) return;

      // Register CloudSDK form event subscription
      if (!isEditing && rendering?.uid) {
        subscribeToFormSubmitEvent(formRef.current, rendering.uid);
      }

      // Enhance DOM immediately (neutralizes Sitecore's hardcoded broken recaptcha script & elements)
      const root = formRef.current;
      enhanceFormDom(root, isCaptchaEnabled, country, siteName);

      // Execute embedded scripts from Sitecore form publisher
      executeScriptElements(formRef.current);
    }
  }, [content, params.FormId, isCaptchaEnabled, country, siteName]);

  return (
    <section className="w-full bg-white py-8 sm:py-12 px-4 sm:px-8">
      <div className="w-full mx-auto" style={{ maxWidth: '1140px' }}>
        {/* Loading Spinner */}
        {!content && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
            <div className="w-8 h-8 border-3 border-[#1965E1] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading form...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            There was a problem loading this form section. Please refresh or try again.
          </div>
        )}

        {/* Form Container (Title, Subtitle & Fields are dynamically rendered from Sitecore Form) */}
        <div
          ref={formRef}
          id={id || undefined}
          className={`brother-sitecore-form mw-13 ${params.styles?.trimEnd() || ''}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};

/**
 * DOM Enhancer function to:
 * 1. Transform rating radio buttons into interactive 5-star rating
 * 2. Conditionally inject Google reCAPTCHA v2 widget above submit button when enabled
 * 3. Enforce 10-digit phone validation
 * 4. Verify reCAPTCHA token with Next.js server route before Sitecore submit
 * 5. Global Postal Code Lookup based on Sitecore site / country context (SG: OneMap, AU: Australia Post)
 */
function enhanceFormDom(
  root: HTMLElement,
  isCaptchaEnabled: boolean = false,
  country: 'AU' | 'SG' = 'SG',
  siteName: string = 'sai-sitecore'
) {
  // Always neutralize any embedded Sitecore scripts hardcoded with Sitecore's invalid public key (6LeQQf8s)
  const scripts = root.querySelectorAll('script');
  scripts.forEach((s) => {
    if (s.textContent?.includes('6LeQQf8s') || s.textContent?.includes('recaptcha')) {
      s.textContent = '';
      s.remove();
    }
  });

  const formEl = root.querySelector('form');
  if (!formEl) return;

  // 1. Rating Field Transformation
  enhanceRatingField(formEl);

  // 2. Explicit Read-only Fields (configured via placeholder, field name, or CSS class in Sitecore)
  enhanceExplicitReadOnlyFields(formEl);

  // 3. Global Postal Code Lookup & Coupled Address Field (SG: OneMap, AU: Australia Post)
  enhancePostalCodeAndAddress(formEl, country);

  // 4. reCAPTCHA & Phone Validation & Button Enhancement (Dynamic Sitecore Edge Keys)
  enhanceRecaptchaAndValidation(formEl, isCaptchaEnabled, siteName);
}

/**
 * Resolves whether the current Sitecore context corresponds to Australia (AU) or Singapore (SG).
 * Inspects:
 * 1. URL search param: ?country=AU / ?site=au (for testing)
 * 2. Component / Rendering Parameters in Sitecore Pages
 * 3. Sitecore Context: siteName (via useSitecore().page.siteName or useSitecoreContext())
 * 4. Sitecore Context: locale / itemLanguage (e.g. en-AU vs en-SG)
 */
export function resolveCountryFromSitecore(
  sitecoreContext: any,
  params?: Record<string, any>,
  renderingParams?: Record<string, any>
): 'AU' | 'SG' {
  // 1. URL Query parameter override (for easy testing on local: ?country=AU or ?country=SG or ?site=au)
  if (typeof window !== 'undefined') {
    debugger;
    const q = new URLSearchParams(window.location.search);
    const countryParam = q.get('country') || q.get('site');
    if (countryParam) {
      const c = countryParam.toUpperCase();
      if (c === 'AU' || c.includes('AU')) return 'AU';
      if (c === 'SG' || c.includes('SG')) return 'SG';
    }
  }

  // 2. Component / Rendering Parameters set by author in Sitecore Pages
  const paramCountry = params?.country || renderingParams?.country;
  if (paramCountry) {
    const c = String(paramCountry).toUpperCase();
    if (c === 'AU' || c.includes('AU')) return 'AU';
    if (c === 'SG' || c.includes('SG')) return 'SG';
  }

  // 3. Sitecore Context: siteName
  const siteName = (
    sitecoreContext?.page?.siteName ||
    sitecoreContext?.page?.layout?.sitecore?.context?.site?.name ||
    sitecoreContext?.sitecoreContext?.site?.name ||
    sitecoreContext?.site?.name ||
    ''
  ).toLowerCase();

  if (siteName.includes('au') || siteName.includes('australia')) {
    return 'AU';
  }
  if (siteName.includes('sg') || siteName.includes('singapore')) {
    return 'SG';
  }

  // 4. Sitecore Context: Locale / Language
  const locale = (
    sitecoreContext?.page?.locale ||
    sitecoreContext?.page?.layout?.sitecore?.route?.itemLanguage ||
    sitecoreContext?.sitecoreContext?.language ||
    ''
  ).toLowerCase();

  if (locale.includes('au') || locale === 'en-au') {
    return 'AU';
  }

  // Default: Singapore
  return 'SG';
}

/**
 * Supports marking ANY form field as read-only directly from Sitecore Form Builder:
 * 1. Placeholder containing `[readonly]` (e.g. "Address [readonly]") -> strips tag and sets readOnly = true
 * 2. Field name or id ending with `_readonly` (e.g. "address_readonly") -> sets readOnly = true
 * 3. CSS class `readonly` or `is-readonly` set on input -> sets readOnly = true
 */
function enhanceExplicitReadOnlyFields(formEl: HTMLFormElement) {
  const fields = formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  fields.forEach((field) => {
    if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;

    let shouldBeReadOnly = false;

    // Check placeholder flag: e.g. "[readonly]" or "Address [readonly]"
    if (field.placeholder && field.placeholder.includes('[readonly]')) {
      field.placeholder = field.placeholder.replace(/\[readonly\]/gi, '').trim();
      shouldBeReadOnly = true;
    }

    // Check field name, id, or data-label with _readonly suffix
    const name = field.getAttribute('name') || '';
    const id = field.getAttribute('id') || '';
    const label = field.getAttribute('data-label') || '';
    if (
      name.toLowerCase().endsWith('_readonly') ||
      id.toLowerCase().endsWith('_readonly') ||
      label.toLowerCase().endsWith('_readonly')
    ) {
      shouldBeReadOnly = true;
    }

    // Check class names configured in Sitecore form designer
    if (field.classList.contains('readonly') || field.classList.contains('is-readonly')) {
      shouldBeReadOnly = true;
    }

    if (shouldBeReadOnly && !field.getAttribute('data-readonly-enhanced')) {
      field.setAttribute('data-readonly-enhanced', 'true');
      field.readOnly = true;
      field.setAttribute('readonly', 'true');
      field.classList.add('bg-slate-100', 'text-slate-700', 'cursor-not-allowed', 'border-slate-300');
    }
  });
}

/**
 * Enhances Postal Code field with Global Country lookup (SG: OneMap, AU: Australia Post)
 * and couples with Address field.
 *
 * NOTE: If the form DOES NOT have a Postal Code field, the Address field is left completely untouched (editable).
 * Only when BOTH Postal Code and Address exist in the same form are they coupled.
 */
function enhancePostalCodeAndAddress(formEl: HTMLFormElement, country: 'AU' | 'SG' = 'SG') {
  // 1. Check if this form actually has a Postal Code field
  const postalInput = formEl.querySelector<HTMLInputElement>(
    'input[name="postalcode" i], input[data-label*="postal" i], input[placeholder*="postal" i], input[name="postcode" i], input[data-label*="postcode" i], input[placeholder*="postcode" i]'
  );

  // If there is NO Postal Code field in this form, DO NOT touch address field!
  // This ensures general forms with only address remain 100% editable.
  if (!postalInput) return;

  const isAU = country === 'AU';
  const requiredLength = isAU ? 4 : 6;
  const providerLabel = isAU ? 'Australia Post (digitalapi.auspost.com.au)' : 'OneMap Singapore';

  // 2. Find Address input/textarea in the SAME form
  const addressInput = formEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    'input[name="address" i], textarea[name="address" i], input[data-label*="address" i], textarea[data-label*="address" i]'
  );

  // If both exist, couple them
  if (addressInput && !addressInput.getAttribute('data-coupled-postal')) {
    addressInput.setAttribute('data-coupled-postal', 'true');
    addressInput.readOnly = true;
    addressInput.setAttribute('readonly', 'true');
    addressInput.classList.add('bg-slate-50', 'text-slate-700', 'border-slate-300', 'transition-colors');
    if (!addressInput.placeholder) {
      addressInput.placeholder = isAU
        ? 'Suburb/Address will be auto-filled from Australia Post...'
        : 'Address will be auto-filled from OneMap Postal Code...';
    }

    // Add helper hint + "Edit manually" toggle button
    const addressParent = addressInput.closest('.component, .form-input-wrapper') || addressInput.parentElement;
    if (addressParent && !addressParent.querySelector('.address-readonly-hint')) {
      const hint = document.createElement('div');
      hint.className = 'address-readonly-hint text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium';

      const leftNote = document.createElement('span');
      leftNote.className = 'flex items-center gap-1';
      leftNote.innerHTML = `<span class="text-indigo-600">ℹ</span> Auto-filled from ${providerLabel}`;

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'text-indigo-600 hover:text-indigo-800 underline text-[11px] font-medium cursor-pointer ml-2 select-none';
      toggleBtn.textContent = '✏️ Edit manually';
      toggleBtn.title = 'Click to edit or add unit/floor number (#01-02)';

      let isManual = false;
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isManual = !isManual;
        if (isManual) {
          addressInput.readOnly = false;
          addressInput.removeAttribute('readonly');
          addressInput.classList.remove('bg-slate-50', 'cursor-not-allowed');
          addressInput.classList.add('bg-white');
          addressInput.focus();
          toggleBtn.textContent = '🔒 Lock';
          leftNote.innerHTML = '<span class="text-emerald-600">✓</span> Manual input enabled';
        } else {
          addressInput.readOnly = true;
          addressInput.setAttribute('readonly', 'true');
          addressInput.classList.add('bg-slate-50');
          addressInput.classList.remove('bg-white');
          toggleBtn.textContent = '✏️ Edit manually';
          leftNote.innerHTML = `<span class="text-indigo-600">ℹ</span> Auto-filled from ${providerLabel}`;
        }
      });

      hint.appendChild(leftNote);
      hint.appendChild(toggleBtn);
      addressParent.appendChild(hint);
    }
  }

  // Check if already enhanced for this country
  if (postalInput.getAttribute('data-postal-country') === country) return;
  postalInput.setAttribute('data-postal-country', country);

  // Enforce numeric only and country specific length
  postalInput.setAttribute('maxlength', String(requiredLength));
  postalInput.setAttribute('inputmode', 'numeric');
  if (isAU) {
    postalInput.placeholder = 'Enter 4-digit postcode (e.g. 2000, 3000)';
  } else {
    postalInput.placeholder = 'Enter 6-digit postal code (e.g. 049318)';
  }

  // Create status feedback element below Postal Code
  const postalParent = postalInput.closest('.component, .form-input-wrapper') || postalInput.parentElement;
  let statusEl: HTMLElement | null = null;
  if (postalParent) {
    statusEl = postalParent.querySelector('.postal-lookup-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'postal-lookup-status text-xs mt-1.5 font-medium transition-all';
      statusEl.style.display = 'none';
      postalParent.appendChild(statusEl);
    }
  }

  let lastQueriedPostal = '';
  let queryTimeout: any = null;

  const performLookup = async (postal: string) => {
    if (postal.length !== requiredLength || postal === lastQueriedPostal) return;
    lastQueriedPostal = postal;

    if (statusEl) {
      statusEl.className = 'postal-lookup-status text-xs mt-1.5 font-medium text-indigo-600 flex items-center gap-1.5';
      statusEl.innerHTML = `<span class="animate-spin inline-block">⏳</span> Looking up on ${providerLabel}...`;
      statusEl.style.display = 'flex';
    }

    try {
      const res = await fetch(`/api/address/lookup?postalCode=${encodeURIComponent(postal)}&country=${country}`);
      const data = await res.json();

      if (data.success && data.found && data.address) {
        if (addressInput) {
          addressInput.value = data.address;
          // Trigger Sitecore change listeners so form state captures the value
          addressInput.dispatchEvent(new Event('input', { bubbles: true }));
          addressInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (statusEl) {
          statusEl.className = 'postal-lookup-status text-xs mt-1.5 font-medium text-emerald-600 flex items-center gap-1.5';
          const detailsSummary = isAU
            ? `${data.details?.suburb || ''}, ${data.details?.state || ''}`
            : `${data.details?.road || ''}${data.details?.building ? ` (${data.details.building})` : ''}`;
          statusEl.innerHTML = `<span>✓</span> Address verified: ${detailsSummary}`;
          statusEl.style.display = 'flex';
        }
      } else {
        if (addressInput) {
          addressInput.value = '';
          addressInput.dispatchEvent(new Event('input', { bubbles: true }));
          addressInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (statusEl) {
          statusEl.className = 'postal-lookup-status text-xs mt-1.5 font-medium text-amber-600 flex items-center gap-1.5';
          statusEl.innerHTML = `<span>⚠</span> No address found for ${isAU ? 'postcode' : 'postal code'} ${postal} on ${providerLabel}. Please verify.`;
          statusEl.style.display = 'flex';
        }
      }
    } catch (err: any) {
      if (statusEl) {
        statusEl.className = 'postal-lookup-status text-xs mt-1.5 font-medium text-rose-600 flex items-center gap-1.5';
        statusEl.innerHTML = `<span>✗</span> Connection error with ${providerLabel}: ${err.message || 'Network error'}`;
        statusEl.style.display = 'flex';
      }
    }
  };

  postalInput.addEventListener('input', () => {
    // Only allow digits, max requiredLength
    const cleaned = postalInput.value.replace(/[^0-9]/g, '').slice(0, requiredLength);
    if (postalInput.value !== cleaned) {
      postalInput.value = cleaned;
    }

    if (cleaned.length < requiredLength) {
      lastQueriedPostal = '';
      if (statusEl) statusEl.style.display = 'none';
      if (addressInput) {
        addressInput.value = '';
        addressInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    if (cleaned.length === requiredLength) {
      clearTimeout(queryTimeout);
      queryTimeout = setTimeout(() => {
        void performLookup(cleaned);
      }, 300);
    }
  });

  postalInput.addEventListener('blur', () => {
    const cleaned = postalInput.value.replace(/[^0-9]/g, '').slice(0, requiredLength);
    if (cleaned.length === requiredLength && cleaned !== lastQueriedPostal) {
      clearTimeout(queryTimeout);
      void performLookup(cleaned);
    }
  });

  // If pre-filled with valid length, trigger lookup immediately
  const initialValue = postalInput.value.replace(/[^0-9]/g, '').slice(0, requiredLength);
  if (initialValue.length === requiredLength) {
    void performLookup(initialValue);
  }
}

/**
 * Replaces raw 1-5 radio buttons with an interactive 5-star rating widget
 */
function enhanceRatingField(formEl: HTMLFormElement) {
  if (formEl.querySelector('.star-rating-custom-wrapper')) return;

  const ratingRadios = Array.from(formEl.querySelectorAll<HTMLInputElement>('input[type="radio"][name="rating"]'));
  if (ratingRadios.length === 0) return;

  const radioGroupContainer = ratingRadios[0].closest('.radio-group-container') || ratingRadios[0].parentElement;
  if (!radioGroupContainer) return;

  const radioGroupInput = formEl.querySelector<HTMLInputElement>('.radio-group-input[name="rating"]');

  // Hide the raw radio buttons
  (radioGroupContainer as HTMLElement).style.display = 'none';

  // Create custom Star Rating Widget
  const starWrapper = document.createElement('div');
  starWrapper.className = 'star-rating-custom-wrapper';

  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';

  const badge = document.createElement('span');
  badge.className = 'star-rating-badge';
  badge.style.display = 'none';

  const ratingDescriptions: Record<number, string> = {
    1: '★ 1/5 - Poor',
    2: '★ 2/5 - Fair',
    3: '★ 3/5 - Average',
    4: '★ 4/5 - Good',
    5: '★ 5/5 - Excellent! ⭐',
  };

  let currentRating = 0;

  ratingRadios.forEach((r) => {
    if (r.checked) {
      currentRating = parseInt(r.value, 10) || 0;
    }
  });

  const updateStarVisuals = (rating: number) => {
    const starElements = starsContainer.querySelectorAll<HTMLElement>('.star-item');
    starElements.forEach((starEl, index) => {
      const starVal = index + 1;
      if (starVal <= rating) {
        starEl.classList.add('active');
      } else {
        starEl.classList.remove('active');
      }
    });

    if (rating > 0 && ratingDescriptions[rating]) {
      badge.textContent = ratingDescriptions[rating];
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  };

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star-item';
    star.textContent = '★';
    star.setAttribute('data-value', String(i));
    star.title = `${i} stars`;

    // Hover effect
    star.addEventListener('mouseenter', () => updateStarVisuals(i));
    star.addEventListener('mouseleave', () => updateStarVisuals(currentRating));

    // Click effect: select radio and update Sitecore state
    star.addEventListener('click', () => {
      currentRating = i;
      updateStarVisuals(i);

      // Check the corresponding radio input
      const targetRadio = ratingRadios.find((r) => r.value === String(i));
      if (targetRadio) {
        targetRadio.checked = true;
        targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
        targetRadio.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Update Sitecore hidden input if present
      if (radioGroupInput) {
        radioGroupInput.value = String(i);
        radioGroupInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    starsContainer.appendChild(star);
  }

  starsContainer.addEventListener('mouseleave', () => updateStarVisuals(currentRating));

  starWrapper.appendChild(starsContainer);
  starWrapper.appendChild(badge);

  radioGroupContainer.parentNode?.insertBefore(starWrapper, radioGroupContainer);

  if (currentRating > 0) {
    updateStarVisuals(currentRating);
  }
}

/**
 * Injects Google reCAPTCHA v2 widget into the form when enabled.
 *
 * STRATEGY (Option 1):
 * 1. Control reCAPTCHA via Sitecore Pages Component Parameters (e.g. enableCaptcha=true)
 *    or query parameter ?captcha=1.
 * 2. In Sitecore AI Form Builder: Remove the native "reCAPTCHA Placeholder" to avoid Sitecore backend 400.
 * 3. When enabled: Inject clean Google reCAPTCHA v2 directly above the submit button and verify token
 *    via Next.js server route /api/forms/validate-captcha.
 * 4. When disabled: Form submits directly without captcha.
 */
function enhanceRecaptchaAndValidation(
  formEl: HTMLFormElement,
  isCaptchaEnabled: boolean = false,
  siteName: string = 'sai-sitecore'
) {
  const submitButton =
    formEl.querySelector<HTMLButtonElement>('.submit-button') ||
    formEl.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!submitButton) return;

  // Always neutralize any broken native Sitecore reCAPTCHA elements in the form DOM
  const brokenElements = formEl.querySelectorAll<HTMLElement>(
    '[id^="recaptcha"], .global-recaptcha-element, [data-is-recaptcha="true"], [data-component-type*="captcha" i], [data-component-type*="recaptcha" i], .global-recaptcha-wrapper'
  );
  brokenElements.forEach((el) => {
    el.removeAttribute('id');
    el.style.display = 'none';
    el.remove();
  });

  const shouldRenderRecaptcha = isCaptchaEnabled;
  let dynamicSiteKey = '';

  // 1. Load Google reCAPTCHA v2 script & fetch dynamic Site Key from Sitecore Edge
  if (shouldRenderRecaptcha && typeof window !== 'undefined') {
    if (!document.getElementById('google-recaptcha-v2-script')) {
      const script = document.createElement('script');
      script.id = 'google-recaptcha-v2-script';
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onCustomRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Dynamically retrieve Site Key configured exclusively in Sitecore:
    // /sitecore/content/{siteName}/{siteName}/Settings/Google reCAPTCHA
    fetch(`/api/sitecore/recaptcha-settings?siteName=${encodeURIComponent(siteName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.siteKey) {
          dynamicSiteKey = data.siteKey;
          tryRenderWidget();
        } else {
          console.error(
            `[reCAPTCHA] No siteKey found in Sitecore path: /sitecore/content/${siteName}/${siteName}/Settings/Google reCAPTCHA`
          );
        }
      })
      .catch((err) => {
        console.error('Failed to load Sitecore reCAPTCHA settings from Edge:', err);
      });
  }

  // 2. Handle Custom reCAPTCHA Widget DOM
  let recaptchaWrapper = formEl.querySelector<HTMLElement>('#custom-recaptcha-wrapper');

  const tryRenderWidget = () => {
    if (!dynamicSiteKey) return;
    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha && typeof grecaptcha.render === 'function') {
      try {
        const widgetElem = document.getElementById('custom-recaptcha-widget-element');
        if (widgetElem && !widgetElem.hasChildNodes()) {
          (window as any)._customRecaptchaWidgetId = grecaptcha.render('custom-recaptcha-widget-element', {
            sitekey: dynamicSiteKey,
            callback: () => {
              const err = document.getElementById('custom-recaptcha-error');
              if (err) err.style.display = 'none';
            },
            'expired-callback': () => {
              const err = document.getElementById('custom-recaptcha-error');
              if (err) {
                err.textContent = 'reCAPTCHA expired. Please verify again.';
                err.style.display = 'block';
              }
            },
          });
        }
      } catch (e) {
        // Widget already rendered or element not ready
      }
    } else {
      setTimeout(tryRenderWidget, 300);
    }
  };

  if (shouldRenderRecaptcha) {
    if (!recaptchaWrapper) {
      recaptchaWrapper = document.createElement('div');
      recaptchaWrapper.id = 'custom-recaptcha-wrapper';
      recaptchaWrapper.className = 'custom-recaptcha-wrapper my-4 flex flex-col items-start';

      const widgetBox = document.createElement('div');
      widgetBox.id = 'custom-recaptcha-widget-element';

      const errBox = document.createElement('div');
      errBox.id = 'custom-recaptcha-error';
      errBox.className = 'recaptcha-error-text text-sm text-red-600 font-medium mt-1.5';
      errBox.style.display = 'none';

      recaptchaWrapper.appendChild(widgetBox);
      recaptchaWrapper.appendChild(errBox);

      // Place above the submit button container or button
      const submitContainer = submitButton.closest('.component, .form-component') || submitButton;
      if (submitContainer && submitContainer.parentNode) {
        submitContainer.parentNode.insertBefore(recaptchaWrapper, submitContainer);
      } else {
        submitButton.insertAdjacentElement('beforebegin', recaptchaWrapper);
      }
    }

    (window as any).onCustomRecaptchaLoad = tryRenderWidget;
    tryRenderWidget();
  } else {
    // If not enabled, make sure any leftover wrapper is removed
    if (recaptchaWrapper) {
      recaptchaWrapper.remove();
    }
  }

  // 3. Ensure Submit Button retains author-defined text and clean container
  submitButton.classList.remove('brother-btn-confirm');

  // Remove any previously inserted brother-btn-row (cleanup)
  const existingBtnRow = formEl.querySelector<HTMLElement>('.brother-btn-row');
  if (existingBtnRow && existingBtnRow.parentElement) {
    existingBtnRow.parentElement.insertBefore(submitButton, existingBtnRow);
    existingBtnRow.remove();
  }

  // 4. Phone input: only permit numeric digits
  const phoneInput = formEl.querySelector<HTMLInputElement>('input[type="tel"], input[name="phone"]');
  if (phoneInput && !phoneInput.getAttribute('data-phone-cleanup')) {
    phoneInput.setAttribute('data-phone-cleanup', 'true');

    phoneInput.addEventListener('input', () => {
      const cleaned = phoneInput.value.replace(/[^0-9]/g, '');
      if (phoneInput.value !== cleaned) {
        phoneInput.value = cleaned;
      }
      // If user is editing phone and reaches 10 digits, hide any custom error
      if (cleaned.length === 10) {
        const phoneParent = phoneInput.closest('.component');
        const phoneErrMsg = phoneParent?.querySelector<HTMLElement>('.form-input-error-message');
        if (phoneErrMsg && phoneErrMsg.textContent?.includes('10 digits')) {
          phoneErrMsg.style.display = 'none';
        }
      }
    });
  }

  // 5. Submit validation coordination with Sitecore Form
  if (!submitButton.getAttribute('data-sitecore-validated')) {
    submitButton.setAttribute('data-sitecore-validated', 'true');

    const originalSitecoreOnClick = submitButton.onclick;
    let isSubmitting = false;

    submitButton.onclick = async function (e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();

      if (isSubmitting) return;

      // Check Sitecore required inputs (FullName, Phone, Email, etc.)
      const requiredInputs = Array.from(
        formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'input[data-required="true"], textarea[data-required="true"]'
        )
      );

      const hasEmptyRequired = requiredInputs.some((input) => {
        if (input.type === 'radio' || input.type === 'checkbox') return false;
        return !input.value || !input.value.trim();
      });

      // Check phone 10-digit validation if phone has text
      let phoneHasError = false;
      if (phoneInput && phoneInput.value.trim()) {
        const rawDigits = phoneInput.value.replace(/[^0-9]/g, '');
        if (rawDigits.length !== 10) {
          phoneHasError = true;
          const phoneParent = phoneInput.closest('.component');
          if (phoneParent) {
            let phoneErrMsg = phoneParent.querySelector<HTMLElement>('.form-input-error-message');
            if (!phoneErrMsg) {
              phoneErrMsg = document.createElement('div');
              phoneErrMsg.className = 'global-input-error-message form-input-error-message';
              phoneErrMsg.title = 'Phone number must be exactly 10 digits';
              const icon = document.createElement('span');
              icon.className = 'mdi mdi-alert-circle';
              icon.setAttribute('aria-hidden', 'true');
              phoneErrMsg.appendChild(icon);
              phoneErrMsg.appendChild(document.createTextNode(' Phone number must be exactly 10 digits (e.g. 0901234567)'));
              phoneParent.appendChild(phoneErrMsg);
            } else {
              phoneErrMsg.innerHTML = '<span class="mdi mdi-alert-circle" aria-hidden="true"></span> Phone number must be exactly 10 digits (e.g. 0901234567)';
              phoneErrMsg.style.display = 'block';
            }
          }
        }
      }

      // If any required field is empty: let Sitecore's native onclick run!
      // This immediately shows the red "This field is required" error messages!
      if (hasEmptyRequired) {
        if (originalSitecoreOnClick) {
          originalSitecoreOnClick.call(submitButton, e);
        }
        // Also show reCAPTCHA reminder if enabled and not checked
        if (shouldRenderRecaptcha) {
          const grecaptcha = (window as any).grecaptcha;
          const widgetId = (window as any)._customRecaptchaWidgetId;
          const recapErr = document.getElementById('custom-recaptcha-error');
          if (grecaptcha && widgetId !== undefined && !grecaptcha.getResponse(widgetId)) {
            if (recapErr) {
              recapErr.textContent = 'Please verify you are not a robot (reCAPTCHA) before submitting.';
              recapErr.style.display = 'block';
            }
          }
        }
        return;
      }

      // If phone has invalid digit count, stop submission
      if (phoneHasError) {
        phoneInput?.focus();
        return;
      }

      // Check reCAPTCHA — only if enabled for this form
      if (shouldRenderRecaptcha) {
        const grecaptcha = (window as any).grecaptcha;
        const widgetId = (window as any)._customRecaptchaWidgetId;
        const recapErr = document.getElementById('custom-recaptcha-error');

        if (!grecaptcha || widgetId === undefined) {
          if (recapErr) {
            recapErr.textContent = 'reCAPTCHA is still initializing. Please wait a moment...';
            recapErr.style.display = 'block';
          }
          return;
        }

        const token = grecaptcha.getResponse(widgetId);
        if (!token) {
          if (recapErr) {
            recapErr.textContent = 'Please verify you are not a robot (reCAPTCHA) before submitting.';
            recapErr.style.display = 'block';
          }
          return;
        }

        // Verify token with Next.js backend API
        try {
          isSubmitting = true;
          submitButton.disabled = true;

          const verifyRes = await fetch('/api/forms/validate-captcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, siteName }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            isSubmitting = false;
            submitButton.disabled = false;
            if (recapErr) {
              recapErr.textContent = 'reCAPTCHA verification failed. Please try again.';
              recapErr.style.display = 'block';
            }
            grecaptcha.reset(widgetId);
            return;
          }

          // Verification succeeded! Now submit through Sitecore's native onclick
          if (originalSitecoreOnClick) {
            originalSitecoreOnClick.call(submitButton, e);
          }
        } catch (err) {
          isSubmitting = false;
          submitButton.disabled = false;
          console.error('Error verifying captcha:', err);
        } finally {
          setTimeout(() => {
            isSubmitting = false;
            submitButton.disabled = false;
          }, 3500);
        }
      } else {
        // reCAPTCHA is disabled for this form: submit directly!
        isSubmitting = true;
        submitButton.disabled = true;
        if (originalSitecoreOnClick) {
          originalSitecoreOnClick.call(submitButton, e);
        }
        setTimeout(() => {
          isSubmitting = false;
          submitButton.disabled = false;
        }, 3500);
      }
    };
  }
}

export const Default = CustomSitecoreForm;
export const Form = CustomSitecoreForm;
export default CustomSitecoreForm;
