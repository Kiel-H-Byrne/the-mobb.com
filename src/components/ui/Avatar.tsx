import * as ArkAvatar from "@ark-ui/react/avatar";
import { cva } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";

const avatarStyle = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "full",
    bg: "brand.orangeLight",
    color: "brand.orangeDark",
    fontWeight: "bold",
    fontFamily: "heading",
    overflow: "hidden",
  },
  variants: {
    size: {
      sm: { w: "8", h: "8", fontSize: "xs" },
      md: { w: "10", h: "10", fontSize: "sm" },
      lg: { w: "12", h: "12", fontSize: "md" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const Avatar = styled(ArkAvatar.AvatarRoot, avatarStyle);
export const AvatarImage = styled(ArkAvatar.AvatarImage, {
  base: {
    w: "full",
    h: "full",
    objectFit: "cover",
  },
});
export const AvatarFallback = styled(ArkAvatar.AvatarFallback, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    w: "full",
    h: "full",
  },
});
