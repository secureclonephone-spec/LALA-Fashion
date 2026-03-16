import OrderDetail from "@components/cart/OrderDetail";

export const metadata = {
  title: "Order Confirmed | NaveedShop",
  description: "Your order has been placed successfully.",
};

const SuccessPage = () => {
  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-12 pb-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <OrderDetail />
      </div>
    </div>
  );
};

export default SuccessPage;
