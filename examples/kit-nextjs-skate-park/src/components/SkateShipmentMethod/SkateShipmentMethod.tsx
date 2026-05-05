'use client';

import React, { useState } from 'react';
import { Truck, Zap, CalendarDays, Check } from 'lucide-react';

const SHIPMENT_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    price: 0,
    time: '3-5 business days',
    icon: <Truck size={24} />,
    description: 'Reliable and cost-effective delivery.'
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 15,
    time: '1-2 business days',
    icon: <Zap size={24} />,
    description: 'Faster delivery for urgent skate gear.'
  },
  {
    id: 'nextday',
    name: 'Next Day Air',
    price: 35,
    time: 'Next business day',
    icon: <CalendarDays size={24} />,
    description: 'The ultimate speed for elite skaters.'
  }
];

export const SkateShipmentMethod: React.FC = () => {
  const [selectedId, setSelectedId] = useState('standard');

  return (
    <div className="skate-shipment-method py-4" id="SkateShipmentMethodContainer">
      {/* Hidden input để checkout.js có thể lấy giá trị dễ dàng */}
      <input type="hidden" name="ShippingMethodId" value={selectedId} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SHIPMENT_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              data-method-id={option.id}
              data-method-name={option.name}
              data-method-price={option.price}
              data-method-time={option.time}
              className={`shipment-option-btn relative flex flex-col p-6 rounded-2xl border-2 transition-all text-left group ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/30 is-active' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'
              }`}
            >
              <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
              }`}>
                {option.icon}
              </div>
              
              <div className="mb-1 flex justify-between items-start">
                <h4 className="font-black text-gray-900 uppercase tracking-tight leading-none">
                  {option.name}
                </h4>
                <span className={`font-black ${option.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {option.price === 0 ? 'FREE' : `$${option.price}`}
                </span>
              </div>
              
              <p className="text-sm font-bold text-blue-600 mb-2">{option.time}</p>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">{option.description}</p>

              {isSelected && (
                <div className="absolute top-4 right-4 text-blue-600">
                  <div className="bg-blue-600 rounded-full p-0.5 text-white shadow-lg shadow-blue-100">
                    <Check size={14} strokeWidth={4} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SkateShipmentMethod;
