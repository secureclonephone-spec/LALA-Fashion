import Link from "next/link";
import MobileMenu from "./MobileMenu";

const menuData = [
  { id: "all", name: "All", slug: "" },
  { id: "watches", name: "Watches", slug: "watches" },
  { id: "glasses", name: "Glasses", slug: "glasses" },
  { id: "jewellery", name: "Jewellery", slug: "jewellery" },
  { id: "electronics", name: "Electronics", slug: "electronics" },
];

export async function CategoriesMenu() {
  return (
    <>
      <MobileMenu menu={menuData} />
      <ul className="hidden gap-4 text-sm md:items-center lg:flex xl:gap-6">
        {menuData.map((item) => (
          <li key={item.id}>
            <Link
              className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
              href={item.slug ? `/search/${item.slug}` : "/search"}
              prefetch={true}
              aria-label={`Browse ${item.name} products`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}