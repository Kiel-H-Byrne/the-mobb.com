import { Category, Listing } from "@/db/Types";
import { Menu } from "@ark-ui/react/menu";
import { Switch } from "@ark-ui/react/switch";
import { css } from "@styled/css";
import { memo, useMemo } from "react";
import { MdLocationOff } from "react-icons/md";

type CategoryFilterType = {
  listings: Listing[];
  categories: Category[];
  selectedCategories: Set<Category>;
  setSelectedCategories: any;
};

const CategoryFilter = ({
  listings,
  categories,
  selectedCategories,
  setSelectedCategories,
}: CategoryFilterType) => {
  const handleChange = (name: Category) => {
    const newCategorySet = new Set(selectedCategories);
    if (selectedCategories.has(name)) {
      newCategorySet.delete(name);
    } else {
      newCategorySet.add(name);
    }
    setSelectedCategories(newCategorySet);
  };

  const catCount = useMemo(
    () => (name: Category) => {
      return (listings || []).filter((el) =>
        el.categories?.includes(name)
      ).length;
    },
    [listings]
  );

  return (
    <Menu.Root>
      <Menu.Trigger
        className={css({
          background: "transparent",
          border: "none",
          padding: "2",
          cursor: "pointer",
          borderRadius: "full",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          _hover: { backgroundColor: "rgba(0,0,0,0.05)" },
        })}
      >
        <span className={css({ color: "brand.orange", display: "inline-flex" })}>
          <MdLocationOff size={24} />
        </span>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content
          className={css({
            backgroundColor: "white",
            boxShadow: "lg",
            borderRadius: "md",
            padding: "2",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: "1200",
            minWidth: "200px",
          })}
        >
          {!categories.length ? (
            <div className={css({ padding: "4", textAlign: "center" })}>
              Loading...
            </div>
          ) : (
            categories.map((name) => {
              const isChecked = selectedCategories.has(name);
              return (
                <div
                  key={name}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2",
                    gap: "4",
                  })}
                >
                  <Switch.Root
                    checked={isChecked}
                    onCheckedChange={() => handleChange(name)}
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "2",
                    })}
                  >
                    <Switch.Control
                      className={css({
                        width: "10",
                        height: "6",
                        backgroundColor: isChecked ? "brand.orange" : "gray.200",
                        borderRadius: "full",
                        position: "relative",
                        transition: "background-color 0.2s",
                        cursor: "pointer",
                      })}
                    >
                      <Switch.Thumb
                        className={css({
                          width: "4",
                          height: "4",
                          backgroundColor: "white",
                          borderRadius: "full",
                          position: "absolute",
                          top: "1",
                          left: isChecked ? "5" : "1",
                          transition: "left 0.2s",
                        })}
                      />
                    </Switch.Control>
                    <Switch.Label className={css({ fontSize: "sm", cursor: "pointer" })}>
                      {name}
                    </Switch.Label>
                    <Switch.HiddenInput />
                  </Switch.Root>
                  <span
                    className={css({
                      fontSize: "xs",
                      backgroundColor: "brand.orange",
                      color: "white",
                      padding: "1",
                      borderRadius: "md",
                      minWidth: "1.5rem",
                      textAlign: "center",
                    })}
                  >
                    {catCount(name)}
                  </span>
                </div>
              );
            })
          )}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};

export default memo(CategoryFilter);
