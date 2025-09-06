import { usePathname } from "next/navigation";
import useDeviceType from "./use-device-type";
import useCartStore from "./use-cart-store";

const isNotInPaths = (s: string) => {
  const pathsPattern =
    /^(?:\/$|\/cart$|\/checkout$|\/sign-in$|\/sign-up$|\/order(?:\/.*)?$|\/account(?:\/.*)?$|\/admin(?:\/.*)?$)?$/;
  return !pathsPattern.test(s);
};

function useCartSidebar() {
  const {
    cart: { items },
  } = useCartStore();
  const deviceType = useDeviceType();
  const currentPath = usePathname();

  return (
    items.length > 0 && deviceType === "desktop" && isNotInPaths(currentPath)
  );
}

export default useCartSidebar;
