import { Category, Listing } from "@/db/Types";
import { Menu } from "@ark-ui/react/menu";
import { Switch } from "@ark-ui/react/switch";
import { css } from "@styled/css";
import { memo, useMemo } from "react";

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

  const clearAll = () => {
    setSelectedCategories(new Set());
  };

  const catCount = useMemo(
    () => (name: Category) => {
      if (name === "Uncategorized") {
        return (listings || []).filter((el) => {
          const noCategories = !el.categories || el.categories.length === 0;
          const hasUnrecognized = el.categories?.some(cat => !categories.includes(cat) && cat !== "Uncategorized");
          return noCategories || hasUnrecognized;
        }).length;
      }
      return (listings || []).filter((el) => el.categories?.includes(name)).length;
    },
    [listings, categories]
  );

  return (
    <Menu.Root>
      <Menu.Trigger
        title="Filter Categories"
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2",
          h: "10",
          px: "4",
          borderRadius: "xl",
          bg: "white/5",
          border: "1px solid",
          borderColor: "white/10",
          color: "white",
          fontSize: "sm",
          fontWeight: "bold",
          cursor: "pointer",
          _hover: {
            bg: "brand.orangeMuted",
            borderColor: "brand.orange/50",
          },
          transition: "colors",
        })}
      >
        <i className="ph-bold ph-faders text-lg"></i>
        <span className={css({ display: { base: "none", md: "inline" } })}>Filters</span>
        {selectedCategories.size > 0 && (
          <span
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              w: "5",
              h: "5",
              borderRadius: "full",
              bg: "brand.orange",
              color: "black",
              fontSize: "10px",
              fontFamily: "tech",
            })}
          >
            {selectedCategories.size}
          </span>
        )}
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content
          className={css({
            bg: "rgba(21, 21, 26, 0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid",
            borderColor: "white/10",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            borderRadius: "xl",
            padding: "4",
            maxHeight: "350px",
            overflowY: "auto",
            zIndex: "1200",
            minWidth: "260px",
            display: "flex",
            flexDirection: "column",
            gap: "2",
            outline: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          })}
        >
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "2",
              borderBottom: "1px solid",
              borderColor: "white/10",
              pb: "2",
            })}
          >
            <span
              className={css({
                color: "white",
                fontSize: "sm",
                fontWeight: "bold",
              })}
            >
              Filter by Category
            </span>
            {selectedCategories.size > 0 && (
              <button
                onClick={clearAll}
                className={css({
                  fontSize: "xs",
                  color: "brand.orange",
                  cursor: "pointer",
                  bg: "transparent",
                  border: "none",
                  fontWeight: "bold",
                  _hover: { filter: "brightness(1.2)" },
                })}
              >
                Clear All
              </button>
            )}
          </div>

          {!categories.length ? (
            <div
              className={css({
                padding: "4",
                textAlign: "center",
                color: "gray.400",
                fontSize: "sm",
              })}
            >
              Loading categories...
            </div>
          ) : (
            categories.map((name) => {
              const isChecked = selectedCategories.has(name);
              const count = catCount(name);
              return (
                <div
                  key={name}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2",
                    borderRadius: "lg",
                    transition: "background 0.2s",
                    _hover: { bg: "white/5" },
                  })}
                >
                  <Switch.Root
                    checked={isChecked}
                    onCheckedChange={() => handleChange(name)}
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "3",
                      width: "100%",
                      justifyContent: "space-between",
                    })}
                  >
                    <Switch.Label
                      className={css({
                        fontSize: "sm",
                        color: isChecked ? "white" : "gray.300",
                        cursor: "pointer",
                        flex: 1,
                        textTransform: "capitalize",
                      })}
                    >
                      {name.replace(/_/g, " ")}
                    </Switch.Label>

                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "3",
                      })}
                    >
                      <span
                        className={css({
                          fontSize: "xs",
                          color: "gray.400",
                          fontFamily: "tech",
                          minWidth: "1.5rem",
                          textAlign: "right",
                        })}
                      >
                        {count}
                      </span>
                      <Switch.Control
                        className={css({
                          width: "9",
                          height: "5",
                          backgroundColor: isChecked
                            ? "brand.orange"
                            : "white/10",
                          borderRadius: "full",
                          position: "relative",
                          transition: "background-color 0.2s",
                          cursor: "pointer",
                          border: isChecked ? "none" : "1px solid",
                          borderColor: "white/20",
                        })}
                      >
                        <Switch.Thumb
                          className={css({
                            width: "3.5",
                            height: "3.5",
                            backgroundColor: "white",
                            borderRadius: "full",
                            position: "absolute",
                            top: "0.5",
                            left: isChecked ? "5" : "0.5",
                            transition: "left 0.2s",
                            boxShadow: "sm",
                          })}
                        />
                      </Switch.Control>
                      <Switch.HiddenInput />
                    </div>
                  </Switch.Root>
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
