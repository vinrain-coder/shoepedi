import Breadcrumb from "@/components/shared/breadcrumb";
import CartAddItem from "./cart-add-item";

export default async function CartAddItemPage(props: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await props.params;

  return (
    <>
      <Breadcrumb />
      <CartAddItem itemId={itemId} />
    </>
  );
}
