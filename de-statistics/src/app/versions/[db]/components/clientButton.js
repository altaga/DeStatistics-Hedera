"use client";
import React, { useState } from "react";

export default function ClientButton(props) {
  const [loading, setLoading] = useState(false);

const processFunction = async (func) => {
  setLoading(true);
  await func();
  setLoading(false);
}

  return (
    <button
      disabled={loading}
      onClick={() => processFunction(props.onClick)}
      className={props.className}
    >
      {props.children}
    </button>
  );
}
