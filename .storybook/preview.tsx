import type { Preview } from "@storybook/react";

import "../app/globals.css";
import React from "react";
import * as NextImage from "next/image";
import Link from "next/link";

// Storybook 환경에서 Next 전용 컴포넌트 최소 호환
// - Next 16에서는 `@storybook/nextjs`가 `next/config`를 요구하므로, React 프레임워크를 사용하고 필요한 부분만 모킹합니다.
Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props: React.ComponentProps<"img"> & { src: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
});

Object.defineProperty(Link, "default", {
  configurable: true,
  value: (props: React.ComponentProps<"a"> & { href: string }) => {
    const { href, children, ...rest } = props;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

