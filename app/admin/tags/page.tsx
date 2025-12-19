import { Metadata } from "next";
import TagList from "./tag-list";

export const metadata: Metadata = {
  title: "Admin Tags",
};

export default async function AdminTag() {
  return <TagList />;
}
