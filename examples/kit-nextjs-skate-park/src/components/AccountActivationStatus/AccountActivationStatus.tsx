import { JSX } from 'react';
import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type AccountActivationStatusProps = ComponentProps & {
  fields?: {
    status?: Field<string> | { value?: string } | string;
  };
};

const getStatusValue = (value: AccountActivationStatusProps['fields']) => {
  const statusField = value?.status;

  if (typeof statusField === 'string') {
    return statusField;
  }

  if (statusField && typeof statusField === 'object' && 'value' in statusField) {
    return statusField.value;
  }

  return undefined;
};

export const Default = ({ params, fields }: AccountActivationStatusProps): JSX.Element | null => {
  const status = getStatusValue(fields);

  if (status !== 'failed' && status !== 'success') {
    return null;
  }

  const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();
  const isSuccess = status === 'success';

  return (
    <section
      className={`component account-activation-status py-12 md:py-20 ${styles}`.trim()}
    >
      <div className="container mx-auto px-4">
        <div className="flex min-h-[calc(100vh-18rem)] items-center justify-center">
          <div
            className={`w-full max-w-3xl overflow-hidden rounded-[2rem] border bg-white ${
              isSuccess ? 'border-emerald-100' : 'border-red-100'
            }`}
          >
            <div
              className={`h-2 w-full ${
                isSuccess ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <div className="p-8 md:p-12">
              <p
                className={`mb-3 text-[12px] font-black uppercase tracking-[0.22em] ${
                  isSuccess ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {isSuccess ? 'Activation Complete' : 'Activation Failed'}
              </p>
              <h1 className="mb-4 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                {isSuccess ? 'Account activated successfully' : 'Account activation failed'}
              </h1>
              <p className="text-base font-medium leading-relaxed text-gray-600 md:text-lg">
                {isSuccess
                  ? 'Your account is now active. You can continue to the homepage and start using your account.'
                  : 'We could not activate your account. The activation link may be invalid or expired.'}
              </p>
              <p className="mt-6 text-sm font-medium text-gray-500">
                {isSuccess
                  ? 'You can sign in now or continue shopping right away.'
                  : 'Please request a new activation email or contact support if the issue persists.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Default;
