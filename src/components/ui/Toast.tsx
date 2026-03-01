"use client";

import { Toaster as ArkToaster, Toast, createToaster } from "@ark-ui/react/toast";
import { css } from "@styled/css";
import { MdClose } from "react-icons/md";

// Singleton toaster instance
export const toaster = createToaster({
    placement: "bottom",
    overlap: true,
    gap: 24,
});

export const Toaster = () => {
    return (
        <ArkToaster toaster={toaster}>
            {(toast) => (
                <Toast.Root
                    key={toast.id}
                    className={css({
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "lg",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        padding: "4",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "4",
                        minWidth: "300px",
                        maxWidth: "90vw",
                        color: "brand.grey",
                        animation: "fadeIn 0.3s ease-out",
                    })}
                >
                    <div className={css({ flex: "1", display: "flex", flexDirection: "column", gap: "1" })}>
                        <Toast.Title className={css({ fontWeight: "bold", fontSize: "md", color: "brand.black" })}>
                            {toast.title}
                        </Toast.Title>
                        {toast.description && (
                            <Toast.Description className={css({ fontSize: "sm", color: "gray.600" })}>
                                {toast.description}
                            </Toast.Description>
                        )}
                    </div>
                    <Toast.CloseTrigger
                        className={css({
                            background: "transparent",
                            border: "none",
                            color: "gray.400",
                            cursor: "pointer",
                            padding: "1",
                            borderRadius: "sm",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            _hover: { color: "brand.orange", backgroundColor: "rgba(0,0,0,0.05)" },
                        })}
                    >
                        <MdClose size={20} />
                    </Toast.CloseTrigger>
                </Toast.Root>
            )}
        </ArkToaster>
    );
};
