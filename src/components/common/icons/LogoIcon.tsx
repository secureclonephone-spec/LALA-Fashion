import Image from "next/image";

export default function LogoIcon() {
  return (
    <>
      {/* Light mode: original logo */}
      <Image
        src="/Logo.png"
        alt="LalaFashion Logo"
        width={110}
        height={40}
        className="block dark:hidden object-contain"
        priority
      />
      {/* Dark mode: CSS-inverted to white */}
      <Image
        src="/Logo.png"
        alt="LalaFashion Logo"
        width={110}
        height={40}
        className="hidden dark:block object-contain invert"
        priority
      />
    </>
  );
}
