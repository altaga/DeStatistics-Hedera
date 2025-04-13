"use client";
import ContextModule from "@/utils/contextModule";
import { useContext, useEffect } from "react";
import ReactDiffViewer from "react-diff-viewer";
export default function ReactDiff({ code }) {
  const myContext = useContext(ContextModule);
  useEffect(() => {
    return () => {
      myContext.setValue({ version1: 0, version2: 0 });
    };
  }, []);
  
  
  return (
    <ReactDiffViewer
      styles={{
        content: {
          wordBreak: "break-word",
          width: "100%",
        },
      }}
      oldValue={code[myContext.value.version1]}
      newValue={code[myContext.value.version2]}
      splitView={false}
      showDiffOnly={true}
    />
  );
}
