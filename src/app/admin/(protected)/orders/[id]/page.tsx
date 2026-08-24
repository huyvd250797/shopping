import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminPlaceholder title="Chi tiết đơn hàng" version="V0.6.0">Route chi tiết đã sẵn sàng cho order id: {id}.</AdminPlaceholder>; }
