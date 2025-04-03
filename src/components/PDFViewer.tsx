import React from "react";

type Props = { pdfUrl: string };

const PDFViewer = ({ pdfUrl }: Props) => {
  console.log("PDF URL: ", pdfUrl);
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
