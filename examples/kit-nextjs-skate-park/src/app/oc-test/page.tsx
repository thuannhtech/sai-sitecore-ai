import { TailstoreConnectivityTest } from '@/components/shared/TailstoreConnectivityTest';

export default function OrderCloudTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Tailstore Phase 1: SDK Connectivity
        </h1>
        <p className="text-gray-600 mb-8">
          Trang này dùng để kiểm tra cấu hình OrderCloud SDK và kết nối Sandbox. 
          Nếu bạn thấy thông báo "Connected successfully", nghĩa là Phase 1 đã hoàn tất!
        </p>
        
        <TailstoreConnectivityTest />
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Ghi chú cho Developer:</h2>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>Đảm bảo đã cập nhật <code>NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID</code> trong <code>.env</code>.</li>
            <li>Kiểm tra Console log nếu gặp lỗi Authentication.</li>
            <li>Đây là bước nền tảng để triển khai Shop & Payment ở các Phase sau.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
