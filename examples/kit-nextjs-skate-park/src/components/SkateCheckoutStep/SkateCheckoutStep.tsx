'use client';

import React, { JSX, useEffect, useRef } from 'react';
import { Text, AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import { ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { useSkateCheckoutStore } from 'src/lib/payment/store';

interface SkateCheckoutStepProps extends ComponentProps {
  fields: any;
  params: any;
  rendering: any;
  page: any;
  componentMap: any;
}

export const Default = (props: SkateCheckoutStepProps): JSX.Element => {
  const { fields, params, rendering, page, componentMap } = props;
  const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();
  const isEditing = page?.mode?.isEditing;
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const { currentStep } = useSkateCheckoutStore();

  const stepNumber = parseInt(params.StepNumber || '1', 10);
  const isActive = currentStep === stepNumber;
  const isCompleted = currentStep > stepNumber;
  const isLocked = currentStep < stepNumber && !isEditing;

  // Tự động mở khi tới lượt, đóng khi qua lượt
  useEffect(() => {
    if (isEditing) return;
    if (detailsRef.current) {
      detailsRef.current.open = isActive;
    }
  }, [isActive, isEditing]);

  return (
    <div className={`component skate-checkout-step mb-6 transition-all duration-500 
      ${isLocked ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'} 
      ${styles}`}>

      <details
        ref={detailsRef}
        className={`${fields?.ClassName?.value || ''} bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 overflow-hidden`}
        open={isEditing || isActive}
      >
        <summary className="list-none outline-none cursor-pointer">
          <div className={`w-full px-8 py-6 flex items-center justify-between transition-colors 
            ${isActive ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>

            <div className="flex items-center gap-4">
              {/* Chỉ hiển thị Icon Check nếu đã hoàn thành, không hiển thị số */}
              {isCompleted && (
                <div className="text-green-500 animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} strokeWidth={3} />
                </div>
              )}

              <h3 className={`text-xl font-black uppercase tracking-tight transition-colors 
                ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                <Text field={fields?.Title} defaultValue={`Step ${stepNumber}`} />
              </h3>
            </div>

            {!isLocked && (
              <div className={`transition-transform duration-500 ${isActive ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} className="text-gray-400" />
              </div>
            )}
          </div>
        </summary>

        <div className="px-8 pb-10 pt-2 border-t border-gray-50 animate-in fade-in duration-500">
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
