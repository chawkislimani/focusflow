import ShareView from "./ShareView";

export const metadata = {
  title: "Coup de pouce — FocusFlow",
  description: "Quelqu'un t'a envoyé un coup de pouce via FocusFlow.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { d } = await searchParams;
  const encoded = typeof d === "string" ? d : null;
  return <ShareView encodedData={encoded} />;
}
