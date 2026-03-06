import { Portal } from "@ark-ui/react/portal";
import {
  Select as ArkSelect,
  createListCollection,
} from "@ark-ui/react/select";
import { css } from "@styled/css";
import React, { ReactNode, useMemo } from "react";
import { LuChevronsUpDown } from "react-icons/lu";
import { cva } from "../../../styled-system/css";

// reuse previous styles for the visible trigger
const selectStyle = cva({
  base: {
    w: "full",
    appearance: "none",
    bg: "bg.surface",
    borderWidth: "1px",
    borderColor: "border.light",
    borderRadius: "lg",
    color: "text.main",
    fontFamily: "body",
    transition: "all 0.2s ease",
    px: "4",
    py: "2",
    fontSize: "md",
    _focus: {
      outline: "none",
      borderColor: "brand.orange",
      boxShadow: "0 0 0 1px {colors.brand.orange}",
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      outline: {},
      glass: {
        bg: "bg.glass",
        backdropFilter: "blur(12px)",
        border: "1px solid",
        borderColor: "white/30",
        shadow: "sm",
        _focus: {
          bg: "brand.white",
          borderColor: "brand.orange",
        },
      },
    },
  },
  defaultVariants: {
    variant: "outline",
  },
});

// helper to convert <option> children into Ark collection items
function parseOptions(children: ReactNode) {
  const items: { label: string; value: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === "option") {
      const { value, children: label } = child.props as any;
      items.push({ value, label: typeof label === "string" ? label : "" });
    }
  });
  return items;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  children,
  className,
  value,
  onChange,
  ...rest
}) => {
  const items = useMemo(() => parseOptions(children), [children]);
  const collection = useMemo(() => createListCollection({ items }), [items]);

  return (
    <ArkSelect.Root
      value={[value]}
      onValueChange={(v) =>
        onChange &&
        onChange({
          ...({} as any),
          target: { value: v },
        } as any)
      }
      collection={collection}
      {...rest}
    >
      <ArkSelect.Control className={css(selectStyle())}>
        <ArkSelect.Trigger className={css({ flex: 1, textAlign: "left" })}>
          <ArkSelect.ValueText placeholder="Select" />
        </ArkSelect.Trigger>
        <ArkSelect.Indicator className={css({ pointerEvents: "none" })}>
          <LuChevronsUpDown />
        </ArkSelect.Indicator>
      </ArkSelect.Control>

      <Portal>
        <ArkSelect.Positioner>
          <ArkSelect.Content
            className={css({
              backgroundColor: "bg.surface",
              borderRadius: "lg",
              shadow: "md",
              mt: "1",
            })}
          >
            <ArkSelect.ItemGroup>
              {items.map((item) => (
                <ArkSelect.Item key={item.value} item={item}>
                  <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator>✓</ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              ))}
            </ArkSelect.ItemGroup>
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>

      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
};
