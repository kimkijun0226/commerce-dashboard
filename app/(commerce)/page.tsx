"use client";

import { adminColors } from "@/commons/constants/color";
import {
  Badge,
  Button,
  DataTable,
  Dropdown,
  Pagination,
  QuantityStepper,
  RadioRow,
  SearchBar,
  SidebarNavItem,
  TextInput,
  Toggle,
} from "@/components/ui";
import { useState } from "react";

const sectionTitleClass =
  "text-sm font-semibold uppercase tracking-wide text-[var(--commerce-text-secondary)]";

const panelClass =
  "rounded-2xl border border-[var(--commerce-border-subtle)] bg-[var(--commerce-background-default)] p-6 shadow-sm";

export default function CommercePage() {
  const [page, setPage] = useState(1);
  const [toggleOn, setToggleOn] = useState(true);
  const [shipping, setShipping] = useState("free");
  const [qtySm, setQtySm] = useState(2);
  const [qtyMd, setQtyMd] = useState(1);

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: "#cac5cd" }}
    >
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1
            className="text-2xl font-medium"
            style={{
              fontFamily: "var(--commerce-font-heading)",
              color: "var(--commerce-text-primary)",
            }}
          >
            UI 컴포넌트 미리보기
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--commerce-text-secondary)" }}
          >
            Figma「E Commerce 컴포넌트」·「Admin 컴포넌트」와 순서대로 대조해
            보세요. (위에서부터 11종)
          </p>
        </header>

        {/* 1. Button */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>1. Button</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              Save changes
            </Button>
            <Button variant="primary" size="md" shape="pill">
              Sign Up
            </Button>
            <Button variant="outline" size="md" leftIcon={<HeartIcon />}>
              Wishlist
            </Button>
            <Button variant="primary" size="sm" shape="pill" loading>
              Loading
            </Button>
            <Button variant="primary" size="sm" disabled>
              Disabled
            </Button>
          </div>
        </section>

        {/* 2. TextInput */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>2. TextInput</h2>
          <div className="mt-4 grid max-w-xl gap-4">
            <TextInput
              label="Phone Number"
              placeholder="Phone number"
              tone="commerce"
              autoComplete="tel"
            />
            <TextInput
              label="에러 예시"
              placeholder="입력하세요"
              error="형식이 올바르지 않습니다."
              defaultValue="invalid"
            />
          </div>
        </section>

        {/* 3. SearchBar */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>3. SearchBar</h2>
          <div className="mt-4 max-w-3xl">
            <SearchBar
              placeholder="Search for products..."
              submitLabel="Search"
              onSearch={() => {}}
            />
          </div>
        </section>

        {/* 4. Pagination */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>4. Pagination</h2>
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={12}
              onPageChange={setPage}
              tone="commerce"
            />
            <p
              className="mt-2 text-xs"
              style={{ color: "var(--commerce-text-muted)" }}
            >
              현재 페이지: {page}
            </p>
          </div>
        </section>

        {/* 5. Dropdown */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>5. Dropdown</h2>
          <div className="mt-4 grid max-w-xs gap-4">
            <Dropdown
              aria-label="페이지당 행 수"
              defaultValue="10"
              options={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
              ]}
            />
            <Dropdown
              bordered={false}
              aria-label="날짜 필터"
              defaultValue="all"
              options={[
                { value: "all", label: "Filter by date range" },
                { value: "7d", label: "최근 7일" },
                { value: "30d", label: "최근 30일" },
              ]}
            />
          </div>
        </section>

        {/* 6. Badge */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>6. Badge</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="brand" aria-label="알림 3건">
              3
            </Badge>
            <Badge variant="success">New</Badge>
            <Badge variant="neutral">0</Badge>
          </div>
        </section>

        {/* 7. Toggle */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>7. Toggle</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Toggle
              checked={toggleOn}
              onCheckedChange={setToggleOn}
              label="Slack 연동"
              labelId="toggle-slack-label"
            />
            <Toggle
              checked={!toggleOn}
              onCheckedChange={(v) => setToggleOn(!v)}
              label="Notion 연동"
              labelId="toggle-notion-label"
            />
          </div>
        </section>

        {/* 8. RadioRow */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>8. RadioRow</h2>
          <fieldset className="mt-4 space-y-2 border-0 p-0">
            <legend className="sr-only">배송 옵션</legend>
            <RadioRow
              name="shipping-demo"
              value="free"
              checked={shipping === "free"}
              onChange={() => setShipping("free")}
              label="Free shipping"
              meta="$0.00"
            />
            <RadioRow
              name="shipping-demo"
              value="paid"
              checked={shipping === "paid"}
              onChange={() => setShipping("paid")}
              label="Express"
              meta="$12.00"
            />
          </fieldset>
        </section>

        {/* 9. DataTable */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>9. DataTable</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-[var(--admin-border-brand-subtle)] bg-[var(--admin-background-default)]">
            <DataTable
              columns={[
                { key: "id", header: "Product id" },
                { key: "name", header: "name" },
                { key: "price", header: "PRice" },
                { key: "stock", header: "Stock" },
                { key: "status", header: "Status" },
              ]}
              rows={[
                {
                  id: "12",
                  name: "Table",
                  price: "$100",
                  stock: "23",
                  status: (
                    <span style={{ color: adminColors.semantic.success }}>
                      Active
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* 10. SidebarNavItem */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>10. SidebarNavItem</h2>
          <div
            className="mt-4 w-[260px] rounded-lg border border-[var(--commerce-border-subtle)] bg-white py-2"
            style={{ fontFamily: "var(--admin-font-ui)" }}
          >
            <div className="px-3 py-2 text-xs text-[var(--admin-text-secondary)]">
              MAIN MENU
            </div>
            <div className="px-2">
              <SidebarNavItem active href="#" onClick={(e) => e.preventDefault()}>
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem href="#" onClick={(e) => e.preventDefault()}>
                Order Management
              </SidebarNavItem>
              <SidebarNavItem
                href="#"
                onClick={(e) => e.preventDefault()}
                trailing={<Badge variant="brand">2</Badge>}
              >
                Manage Admins
              </SidebarNavItem>
            </div>
          </div>
        </section>

        {/* 11. QuantityStepper */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>11. QuantityStepper</h2>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="mb-2 text-xs text-[var(--commerce-text-muted)]">
                Small (카트 라인)
              </p>
              <QuantityStepper
                size="sm"
                value={qtySm}
                min={1}
                max={10}
                onChange={setQtySm}
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-[var(--commerce-text-muted)]">
                Product (PDP)
              </p>
              <QuantityStepper
                size="md"
                value={qtyMd}
                min={1}
                max={99}
                onChange={setQtyMd}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M12 21s-7-4.35-7-10a5 5 0 0110 0 5 5 0 0110 0c0 5.65-7 10-7 10z" />
    </svg>
  );
}
