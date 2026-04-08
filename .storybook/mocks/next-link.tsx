import React from "react";

type NextLinkLikeProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function NextLinkMock(props: NextLinkLikeProps) {
  const { href, children, ...rest } = props;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

