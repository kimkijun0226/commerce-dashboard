import React from "react";

type NextImageLikeProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

// Storybook에서는 next/image를 plain img로 렌더
// eslint-disable-next-line @next/next/no-img-element
export default function NextImageMock(props: NextImageLikeProps) {
  const { alt, ...rest } = props;
  return <img alt={alt ?? ""} {...rest} />;
}

