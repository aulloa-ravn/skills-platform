import React, { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={`backdrop-blur-xl bg-gray-800/40 rounded-2xl shadow-2xl border border-gray-700/50 ${
        noPadding ? "" : "p-6"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
