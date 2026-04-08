"use client";

import { adminColors } from "@/commons/constants/color";
import { AdminSidebarNavItem, AdminTable } from "@/components/admin";
import {
  SearchBar,
} from "@/components/commerce";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Radio,
  Select,
  Switch,
} from "@/components/ui";
import { useState } from "react";

const sectionTitleClass =
  "text-sm font-semibold uppercase tracking-wide text-[var(--commerce-text-secondary)]";

const panelClass =
  "rounded-2xl border border-[var(--commerce-border-subtle)] bg-[var(--commerce-background-default)] p-6 shadow-sm";

export default function CommercePage() {
  const [toggleOn, setToggleOn] = useState(true);
  const [plan, setPlan] = useState("standard");
  const [terms, setTerms] = useState(false);

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
            컴포넌트 미리보기
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--commerce-text-secondary)" }}
          >
            공통 UI → 커머스 전용 → 어드민 전용 순으로 배치했습니다.
          </p>
        </header>

        {/* —— 공통 components/ui —— */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Button</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              Primary
            </Button>
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
            <Button variant="danger" size="md">
              Danger
            </Button>
            <Button variant="primary" size="sm" loading>
              Loading
            </Button>
            <Button variant="primary" size="sm" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Input</h2>
          <div className="mt-4 grid max-w-xl gap-6">
            <Input
              label="이메일"
              description="로그인에 사용됩니다."
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
            <Input
              label="필수 필드"
              required
              placeholder="입력하세요"
            />
            <Input
              variant="underline"
              label="Underline"
              placeholder="하단 보더만"
            />
            <Input
              label="에러"
              placeholder="값"
              error="형식이 올바르지 않습니다."
              defaultValue="invalid"
            />
          </div>
        </section>

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Badge</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="success" size="sm">
              Success
            </Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="default" size="md">
              MD
            </Badge>
          </div>
        </section>

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Checkbox</h2>
          <div className="mt-4 max-w-md space-y-4">
            <Checkbox
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              label="이용약관에 동의합니다."
              description="필수 항목입니다."
            />
            <Checkbox label="에러 예시" error="반드시 선택해야 합니다." />
          </div>
        </section>

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Radio</h2>
          <fieldset className="mt-4 space-y-3 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-[var(--commerce-text-primary)]">
              요금제
            </legend>
            <Radio
              name="plan-demo"
              value="standard"
              checked={plan === "standard"}
              onChange={() => setPlan("standard")}
              label="Standard"
              description="기본 기능"
            />
            <Radio
              name="plan-demo"
              value="pro"
              checked={plan === "pro"}
              onChange={() => setPlan("pro")}
              label="Pro"
              description="전체 기능"
            />
          </fieldset>
        </section>

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Select</h2>
          <div className="mt-4 max-w-xs">
            <Select
              label="정렬"
              description="목록 정렬 기준"
              options={[
                { value: "new", label: "최신순" },
                { value: "price", label: "가격순" },
                { value: "name", label: "이름순" },
              ]}
              defaultValue="new"
            />
          </div>
        </section>

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>공통 · Switch</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Switch
              checked={toggleOn}
              onCheckedChange={setToggleOn}
              label="알림 받기"
              labelId="switch-notify"
            />
            <Switch
              checked={!toggleOn}
              onCheckedChange={(v) => setToggleOn(!v)}
              label="마케팅 수신"
              labelId="switch-marketing"
            />
          </div>
        </section>

        {/* —— 커머스 components/commerce —— */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>커머스 · SearchBar</h2>
          <div className="mt-4 max-w-3xl">
            <SearchBar
              placeholder="Search for products..."
              submitLabel="Search"
              onSearch={() => {}}
            />
          </div>
        </section>

        {/* Figma 목록에 없는 컴포넌트(Pagination/RadioRow/QuantityStepper) 데모는 제거 */}

        {/* —— 어드민 components/admin —— */}
        <section className={panelClass}>
          <h2 className={sectionTitleClass}>어드민 · AdminTable</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-[var(--admin-border-brand-subtle)] bg-[var(--admin-background-default)]">
            <AdminTable
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

        <section className={panelClass}>
          <h2 className={sectionTitleClass}>어드민 · AdminSidebarNavItem</h2>
          <div
            className="mt-4 w-[260px] rounded-lg border border-[var(--commerce-border-subtle)] bg-white py-2"
            style={{ fontFamily: "var(--admin-font-ui)" }}
          >
            <div className="px-3 py-2 text-xs text-[var(--admin-text-secondary)]">
              MAIN MENU
            </div>
            <div className="px-2">
              <AdminSidebarNavItem
                active
                href="#"
                onClick={(e) => e.preventDefault()}
                label="Dashboard"
              />
              <AdminSidebarNavItem
                href="#"
                onClick={(e) => e.preventDefault()}
                label="Order Management"
              />
              <AdminSidebarNavItem
                href="#"
                onClick={(e) => e.preventDefault()}
                label="Manage Admins"
                badge={
                  <Badge variant="outline" size="sm" aria-label="알림 2건">
                    2
                  </Badge>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
