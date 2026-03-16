import { CURRENCY_SYMBOL } from "@utils/constants";

export const Price = ({
  amount,
  className,
  currencyCode: _currencyCode = "PKR",
  ...rest
}: {
  amount: string;
  className?: string;
  currencyCode: string;
} & React.ComponentProps<"p">) => (
  <p className={className} suppressHydrationWarning={true} {...rest}>
    {`${CURRENCY_SYMBOL} ${new Intl.NumberFormat("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount))}`}
  </p>
);
