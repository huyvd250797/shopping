import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminPlaceholder title="Sửa sản phẩm" version="V0.3.0">Route edit đã sẵn sàng cho product id: {id}.</AdminPlaceholder>; }
