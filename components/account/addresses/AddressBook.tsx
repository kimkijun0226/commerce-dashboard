"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, Checkbox, Input, PostcodeSearchDialog, cn } from "@/components/ui";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { typographyToStyle } from "@/components/ui";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  type AddressInput,
} from "@/app/(commerce)/account/addresses/actions";
import { useRouter } from "next/navigation";

export type AddressBookRow = {
  id: string;
  label: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  memo: string | null;
  is_default: boolean;
};

export function AddressBook({
  initialAddresses,
  nextHref,
  showHeader = true,
  className,
  mode = "manage",
}: {
  initialAddresses: AddressBookRow[];
  nextHref?: string;
  showHeader?: boolean;
  className?: string;
  mode?: "manage" | "pick" | "defaultOnly";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const addresses = useMemo(() => initialAddresses, [initialAddresses]);

  const editing = useMemo(
    () => addresses.find((a) => a.id === editingId) ?? null,
    [addresses, editingId],
  );

  return (
    <div
      className={cn("min-w-0 w-full", className)}
      style={{ fontFamily: "var(--commerce-font-body)" }}
    >
      {showHeader ? (
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2
              style={{
                ...typographyToStyle(commerceTypography.headline7),
                color: commerceColors.text.primary,
              }}
            >
              Addresses
            </h2>
            <p
              className="mt-2"
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.secondary,
              }}
            >
              배송지를 최대 10개까지 저장할 수 있습니다. 기본 배송지는 1개만 설정됩니다.
            </p>
          </div>

          <Button
            size="md"
            disabled={pending}
            className={mode !== "manage" ? "hidden" : undefined}
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            새 주소 추가
          </Button>
        </header>
      ) : (
        <div className="flex justify-end">
          <Button
            size="md"
            disabled={pending}
            className={mode !== "manage" ? "hidden" : undefined}
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            새 주소 추가
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-(--commerce-border-subtle) p-5">
            <p
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.secondary,
              }}
            >
              저장된 배송지가 없습니다.
            </p>
          </div>
        ) : (
          addresses.map((a) => (
            <div
              key={a.id}
              className={cn(
                "w-full rounded-xl border px-5 py-4",
                a.is_default
                  ? "border-(--commerce-primary-main) bg-(--commerce-background-light)"
                  : "border-(--commerce-border-subtle)",
              )}
            >
              <div
                className={cn(
                  "flex items-start justify-between gap-3",
                  nextHref &&
                    "cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[0.995]",
                )}
                role={nextHref ? "button" : undefined}
                tabIndex={nextHref ? 0 : undefined}
                aria-label={nextHref ? "주소 선택" : undefined}
                onClick={() => {
                  if (!nextHref || pending) return;
                  const url = new URL(nextHref, window.location.origin);
                  url.searchParams.set("addressId", a.id);
                  router.push(url.pathname + url.search);
                }}
                onKeyDown={(e) => {
                  if (!nextHref || pending) return;
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  const url = new URL(nextHref, window.location.origin);
                  url.searchParams.set("addressId", a.id);
                  router.push(url.pathname + url.search);
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="truncate"
                      style={{
                        ...typographyToStyle(commerceTypography.body2Semi),
                        color: commerceColors.text.primary,
                      }}
                    >
                      {a.label?.trim() || "배송지"}
                    </p>
                    {a.is_default ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: "var(--commerce-primary-main)",
                          color: "var(--commerce-text-inverse)",
                        }}
                      >
                        Default
                      </span>
                    ) : null}
                  </div>
                  {/* 받는 분/연락처는 주소록에서 노출하지 않음 */}
                  <p
                    className="mt-1"
                    style={{
                      ...typographyToStyle(commerceTypography.body2),
                      color: commerceColors.text.secondary,
                    }}
                  >
                    {a.address_line1}
                    {a.address_line2 ? `, ${a.address_line2}` : ""}
                  </p>
                  {/* memo는 카드에서 숨기고, 수정 화면에서만 관리 */}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* 선택 버튼 제거: 카드 클릭으로 선택 */}
                  {!a.is_default && mode !== "pick" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          try {
                            await setDefaultAddress(a.id);
                            toast.success("기본 배송지로 설정했습니다.");
                            router.refresh();
                          } catch (e) {
                            toast.error(readErr(e));
                          }
                        })
                      }
                    >
                      기본 설정
                    </Button>
                  ) : null}

                  {mode === "manage" ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          setEditingId(a.id);
                          setAdding(false);
                        }}
                      >
                        수정
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            try {
                              await deleteAddress(a.id);
                              toast.success("주소를 삭제했습니다.");
                              router.refresh();
                            } catch (e) {
                              toast.error(readErr(e));
                            }
                          })
                        }
                      >
                        삭제
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {mode === "manage" && adding ? (
        <div className="mt-6 rounded-xl border border-(--commerce-border-subtle) p-6">
          <AddressForm
            title="새 주소 추가"
            disabled={pending}
            onCancel={() => setAdding(false)}
            onSave={(input) =>
              start(async () => {
                try {
                  const created = await createAddress(input);
                  toast.success("주소를 저장했습니다.");
                  setAdding(false);
                  router.refresh();
                } catch (e) {
                  toast.error(readErr(e));
                }
              })
            }
          />
        </div>
      ) : null}

      {mode === "manage" && editing ? (
        <div className="mt-6 rounded-xl border border-(--commerce-border-subtle) p-6">
          <AddressForm
            title="주소 수정"
            disabled={pending}
            initial={{
              label: editing.label ?? "",
              addressLine1: editing.address_line1,
              addressLine2: editing.address_line2 ?? "",
              isDefault: editing.is_default,
            }}
            onCancel={() => setEditingId(null)}
            onSave={(input) =>
              start(async () => {
                try {
                  await updateAddress(editing.id, input);
                  toast.success("주소를 저장했습니다.");
                  setEditingId(null);
                  router.refresh();
                } catch (e) {
                  toast.error(readErr(e));
                }
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function readErr(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const [, readable] = msg.includes(":") ? msg.split(/:(.+)/) : ["", msg];
  return readable || msg;
}

function AddressForm({
  title,
  initial,
  onSave,
  onCancel,
  disabled,
}: {
  title: string;
  initial?: Partial<AddressInput>;
  onSave: (input: AddressInput) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [addressLine1, setAddressLine1] = useState(initial?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initial?.addressLine2 ?? "");
  const [isDefault, setIsDefault] = useState(Boolean(initial?.isDefault));
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h3
        style={{
          ...typographyToStyle(commerceTypography.headline7),
          color: commerceColors.text.primary,
        }}
      >
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          label="라벨 (선택)"
          disabled={disabled}
        />
        <div className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <div className="flex items-end gap-2">
            <Input
              name="addressLine1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              label="주소"
              required
              disabled={disabled}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={disabled}
              onClick={() => setPostcodeOpen(true)}
              className="shrink-0"
            >
              주소 검색
            </Button>
          </div>
        </div>
        <Input
          name="addressLine2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          label="상세주소 (선택)"
          disabled={disabled}
          className="sm:col-span-2"
        />
      </div>

      <Checkbox
        name="isDefault"
        checked={isDefault}
        onChange={(e) => setIsDefault(e.currentTarget.checked)}
        disabled={disabled}
        label={
          <span
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.text.primary,
            }}
          >
            기본 배송지로 설정
          </span>
        }
        id="address-default"
      />

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="secondary" disabled={disabled} onClick={onCancel}>
          취소
        </Button>
        <Button
          disabled={disabled}
          onClick={() => {
            onSave({
              label,
              addressLine1,
              addressLine2: addressLine2 || undefined,
              isDefault,
            });
          }}
        >
          저장
        </Button>
      </div>

      <PostcodeSearchDialog
        open={postcodeOpen}
        onClose={() => setPostcodeOpen(false)}
        onSelect={({ address }) => setAddressLine1(address)}
      />
    </div>
  );
}

