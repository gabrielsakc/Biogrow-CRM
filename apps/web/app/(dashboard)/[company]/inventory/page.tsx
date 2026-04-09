import { redirect } from "next/navigation";

export default function InventoryPage({ params }: { params: { company: string } }) {
  redirect(`/${params.company}/inventory/products`);
}
