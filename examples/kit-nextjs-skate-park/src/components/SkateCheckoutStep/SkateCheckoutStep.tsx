import React, { JSX } from 'react';
import { Text, AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';

interface SkateCheckoutStepProps extends ComponentProps {
  fields: any;
  componentMap?: any;
}

export const Default = (props: SkateCheckoutStepProps): JSX.Element => {
  const { fields, params, rendering, page, componentMap } = props;
  const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();
  const isEditing = page?.mode?.isEditing;

  // Logic mở mặc định: Luôn mở nếu đang edit hoặc có param IsOpen
  const defaultOpen = isEditing || params.IsOpen === '1' || params.StepNumber === '1';
  const isCompleted = false; // Logic này sẽ được xử lý qua Store/Context sau
  const stepNumber = params.StepNumber || '1';

  return (
    <div className={`component skate-checkout-step mb-6 ${styles}`}>
      <details
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
        open={defaultOpen}
      >
        {/* Header - Sử dụng <summary> để browser tự xử lý click toggle */}
        <summary className="list-none outline-none cursor-pointer">
          <div className={`w-full px-8 py-6 flex items-center justify-between transition-colors group-open:bg-gray-50/50 hover:bg-gray-50/30`}>
            <div className="flex items-center gap-4">

              <h3 className={`text-xl font-black uppercase tracking-tight transition-colors 
                ${isCompleted ? 'text-gray-900' : 'text-gray-400 group-open:text-gray-900'}`}>
                <Text field={fields?.Title} defaultValue={`Step ${stepNumber}`} />
              </h3>
            </div>

            <div className="transition-transform duration-300 group-open:rotate-180">
              <ChevronDown size={24} className="text-gray-400" />
            </div>
          </div>
        </summary>

        {/* Content - Placeholder Area */}
        <div className="px-8 pb-10 pt-2 border-t border-gray-50">
          <div className={`relative ${isEditing ? 'min-h-[200px] border-2 border-dotted border-blue-100 rounded-xl p-4 bg-blue-50/10' : ''}`}>
            <AppPlaceholder
              name="dynamic-checkout-step-content-{*}"
              rendering={rendering}
              page={page}
              componentMap={componentMap}
            />
          </div>
        </div>
      </details>
    </div>
  );
};

export default Default;
